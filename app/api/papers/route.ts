import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "0");

  const rows = await sql`
    SELECT p.pmid, p.title, p.journal, p.pub_date, p.source, p.pmc_id, p.keywords, p.pub_types
    FROM papers p
    LEFT JOIN paper_insights pi ON p.pmid = pi.pmid
    WHERE pi.pmid IS NULL OR pi.feed_date != CURRENT_DATE
    ORDER BY p.created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${page * PAGE_SIZE}
  `;

  return NextResponse.json(rows);
}
