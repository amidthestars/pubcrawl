import { notFound } from "next/navigation";
import Link from "next/link";
import { sql } from "@/lib/db";
import { fetchFullText } from "@/lib/pmc";
import TagList from "@/components/TagList";
import MarkRead from "@/components/MarkRead";

export const revalidate = 86400;

async function getPaper(pmid: string) {
  const rows = await sql`
    SELECT p.*, pi.did, pi.found, pi.matters, pi.score
    FROM papers p
    LEFT JOIN paper_insights pi ON p.pmid = pi.pmid
    WHERE p.pmid = ${pmid}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

async function getRelated(pmid: string, keywords: string[]) {
  if (!keywords?.length) return [];
  return sql`
    SELECT p.pmid, p.title, p.journal, p.pub_date
    FROM papers p
    WHERE p.pmid != ${pmid}
      AND p.keywords && ${keywords}
    ORDER BY array_length(array(
      SELECT unnest(p.keywords) INTERSECT SELECT unnest(${keywords}::text[])
    ), 1) DESC
    LIMIT 5
  `;
}

export default async function PaperPage({ params }: { params: Promise<{ pmid: string }> }) {
  const { pmid } = await params;
  const paper = await getPaper(pmid);
  if (!paper) notFound();

  const sections = paper.pmc_id ? await fetchFullText(paper.pmc_id) : [];

  const related = await getRelated(pmid, paper.keywords ?? []);

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <MarkRead pmid={pmid} />
      <Link href="/" className="text-sm text-neutral-500 hover:text-white mb-6 block">← Back</Link>

      <p className="text-xs text-neutral-500 mb-2">{paper.journal} · {paper.pub_date}</p>
      <h1 className="text-2xl font-bold text-white leading-snug mb-2">{paper.title}</h1>
      <a
        href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-sky-400 hover:underline mb-4 block"
      >
        View on PubMed →
      </a>

      {paper.keywords && (
        <TagList keywords={paper.keywords} pubTypes={paper.pub_types} source={paper.source} />
      )}

      {paper.matters && (
        <div className="mt-6 p-4 rounded-xl border border-neutral-800 bg-neutral-900 text-sm text-neutral-300">
          <span className="text-neutral-500">Why it matters </span>{paper.matters}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {sections.length > 0 ? (
          sections.map((s, i) => (
            <div key={i}>
              {s.title && <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-2">{s.title}</h2>}
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">{s.body}</p>
            </div>
          ))
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-2">Abstract</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">{paper.abstract}</p>
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${pmid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 text-sm text-sky-400 hover:underline"
            >
              View on PubMed →
            </a>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Papers like this</p>
          <div className="space-y-3">
            {related.map((r: any) => (
              <Link key={r.pmid} href={`/paper/${r.pmid}`} className="block py-3 border-b border-neutral-800 hover:text-white transition-colors">
                <p className="text-sm text-neutral-200 leading-snug">{r.title}</p>
                <p className="text-xs text-neutral-500 mt-1">{r.journal} · {r.pub_date}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
