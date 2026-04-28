"use client";

import { useEffect, useRef, useState } from "react";
import FillerCard from "./FillerCard";
import type { FillerPaper } from "@/types";

export default function FillerFeed() {
  const [papers, setPapers] = useState<FillerPaper[]>([]);
  const [page, setPage] = useState(0);
  const [done, setDone] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

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
        else setPapers((prev) => [...prev, ...rows]);
      });
  }, [page]);

  return (
    <div>
      {papers.map((p) => <FillerCard key={p.pmid} paper={p} />)}
      {!done && <div ref={loaderRef} className="h-10" />}
    </div>
  );
}
