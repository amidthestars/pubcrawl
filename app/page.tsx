import { sql } from "@/lib/db";
import FeaturedCard from "@/components/FeaturedCard";
import FillerFeed from "@/components/FillerFeed";
import type { FeaturedPaper } from "@/types";

export const revalidate = 3600;

async function getFeatured(): Promise<FeaturedPaper[]> {
  return sql`
    SELECT p.pmid, p.title, p.journal, p.pub_date,
           pi.did, pi.found, pi.matters
    FROM paper_insights pi
    JOIN papers p ON p.pmid = pi.pmid
    WHERE pi.feed_date = CURRENT_DATE
    ORDER BY pi.score DESC
    LIMIT 10
  ` as Promise<FeaturedPaper[]>;
}

export default async function Home() {
  const featured = await getFeatured();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-white">PubCrawl</h1>
        <span className="text-sm text-neutral-500">{today}</span>
      </div>

      {featured.length > 0 ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Today's Picks</p>
          <div className="space-y-4 mb-12">
            {featured.map((p) => <FeaturedCard key={p.pmid} paper={p} />)}
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">More Papers</p>
        </>
      ) : (
        <p className="text-neutral-500 text-sm mb-8">No papers ingested yet. Run the ingest job to populate the feed.</p>
      )}

      <FillerFeed />
    </main>
  );
}
