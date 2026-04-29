"use client";

import { useEffect, useRef, useState } from "react";
import FeaturedCard from "./FeaturedCard";
import FillerCard from "./FillerCard";
import FilterBar from "./FilterBar";
import { useReadPapers } from "@/lib/hooks/useReadPapers";
import type { FeaturedPaper, FillerPaper } from "@/types";

type Filters = { unreadOnly: boolean; tags: Set<string> };

function matchesFilters(
  paper: { pub_types: string[] | null; keywords: string[] | null },
  filters: Filters,
  isRead: boolean
) {
  if (filters.unreadOnly && isRead) return false;
  if (filters.tags.size === 0) return true;
  const paperTags = [
    ...((paper.pub_types ?? []).map((t) => t.toLowerCase())),
    ...((paper.keywords ?? []).map((k) => k.toLowerCase())),
  ];
  return [...filters.tags].some((t) => paperTags.includes(t));
}

export default function Feed() {
  const [featured, setFeatured] = useState<FeaturedPaper[]>([]);
  const [filler, setFiller] = useState<FillerPaper[]>([]);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const [filters, setFilters] = useState<Filters>({ unreadOnly: false, tags: new Set() });
  const { read, markRead } = useReadPapers();
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/featured").then((r) => r.json()).then(setFeatured);
  }, []);

  useEffect(() => {
    if (done) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setPage((p) => p + 1);
    });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [done]);

  useEffect(() => {
    fetch(`/api/papers?page=${page}`)
      .then((r) => r.json())
      .then((rows: FillerPaper[]) => {
        if (rows.length === 0) setDone(true);
        else setFiller((prev) => {
          const seen = new Set(prev.map((p) => p.pmid));
          return [...prev, ...rows.filter((r) => !seen.has(r.pmid))];
        });
      });
  }, [page]);

  const visibleFeatured = featured.filter((p) => matchesFilters(p, filters, read.has(p.pmid)));
  const visibleFiller = filler.filter((p) => matchesFilters(p, filters, read.has(p.pmid)));

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />

      {/* mobile: single column, desktop: two columns */}
      <div className="md:grid md:grid-cols-[1fr_360px] md:gap-10 md:items-start">

        {/* left: featured */}
        <div className="md:sticky md:top-10 md:max-h-[calc(100vh-13rem)] md:overflow-y-auto md:pr-1">
          {visibleFeatured.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Today's Picks</p>
              <div className="space-y-4">
                {visibleFeatured.map((p) => (
                  <div key={p.pmid} onClick={() => markRead(p.pmid)}>
                    <FeaturedCard paper={p} read={read.has(p.pmid)} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* mobile filler (shown below featured on small screens) */}
          <div className="md:hidden mt-10">
            {visibleFiller.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">More Papers</p>
                {visibleFiller.map((p) => (
                  <div key={p.pmid} onClick={() => markRead(p.pmid)}>
                    <FillerCard paper={p} read={read.has(p.pmid)} />
                  </div>
                ))}
              </>
            )}
            {!done && <div ref={loaderRef} className="h-10" />}
          </div>
        </div>

        {/* right: filler (desktop only, sticky scroll) */}
        <div className="hidden md:block">
          <div className="sticky top-10 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
            {visibleFiller.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">More Papers</p>
                {visibleFiller.map((p) => (
                  <div key={p.pmid} onClick={() => markRead(p.pmid)}>
                    <FillerCard paper={p} read={read.has(p.pmid)} />
                  </div>
                ))}
              </>
            )}
            {!done && <div ref={loaderRef} className="h-10" />}
          </div>
        </div>

      </div>
    </div>
  );
}
