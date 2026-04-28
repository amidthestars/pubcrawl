import { NextResponse } from "next/server";
import { searchPMIDs, fetchRecords, parseRecords } from "@/lib/pubmed";
import { rankPapers } from "@/lib/rank";
import { interpretPaper } from "@/lib/interpret";
import { sql } from "@/lib/db";

const QUERY = "(clinical trial[pt] OR systematic review[pt] OR case reports[pt]) AND humans[mh] AND english[la]";
const FETCH_COUNT = 200;
const KEEP_COUNT = 80;
const ENRICH_COUNT = 50;
const SCORE_THRESHOLD = 0.3;

export async function POST(req: Request) {
  // guard with CRON_SECRET in production
  if (process.env.NODE_ENV !== "development") {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // 1. search + fetch + parse
  const pmids = await searchPMIDs(QUERY, FETCH_COUNT);
  console.log("PMIDs found:", pmids.length);
  const xml = await fetchRecords(pmids);
  console.log("XML length:", xml.length);
  const papers = parseRecords(xml);
  console.log("Papers parsed:", papers.length);

  // 2. rank + filter
  const ranked = rankPapers(papers)
    .filter((p) => p.score >= SCORE_THRESHOLD)
    .slice(0, KEEP_COUNT);
  console.log("Papers after ranking/filter:", ranked.length);

  // 3. store papers
  for (const p of ranked) {
    await sql`
      INSERT INTO papers (pmid, title, abstract, authors, journal, pub_date)
      VALUES (${p.pmid}, ${p.title}, ${p.abstract}, ${p.authors}, ${p.journal}, ${p.pubDate})
      ON CONFLICT (pmid) DO NOTHING
    `;
  }

  // 4. enrich top N with LLM
  const toEnrich = ranked.slice(0, ENRICH_COUNT);
  for (const p of toEnrich) {
    const insight = await interpretPaper(p);
    if (!insight) continue;
    await sql`
      INSERT INTO paper_insights (pmid, score, did, found, matters, feed_date)
      VALUES (${p.pmid}, ${p.score}, ${insight.did}, ${insight.found}, ${insight.matters}, CURRENT_DATE)
      ON CONFLICT (pmid) DO UPDATE SET
        score = EXCLUDED.score,
        did = EXCLUDED.did,
        found = EXCLUDED.found,
        matters = EXCLUDED.matters,
        feed_date = EXCLUDED.feed_date,
        generated_at = NOW()
    `;
  }

  return NextResponse.json({ kept: ranked.length, enriched: toEnrich.length });
}
