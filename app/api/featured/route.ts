import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT p.pmid, p.title, p.journal, p.pub_date,
           pi.did, pi.found, pi.matters, p.source, p.pmc_id, p.keywords, p.pub_types
    FROM paper_insights pi
    JOIN papers p ON p.pmid = pi.pmid
    WHERE pi.feed_date = CURRENT_DATE
    ORDER BY pi.score DESC
    LIMIT 10
  `;
  return NextResponse.json(rows);
}
