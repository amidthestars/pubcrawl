"use client";

import { useEffect, useState } from "react";

const KEY = "pubcrawl:read";

export function useReadPapers() {
  const [read, setRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      setRead(new Set(stored));
    } catch {}
  }, []);

  function markRead(pmid: string) {
    setRead((prev) => {
      const next = new Set(prev).add(pmid);
      localStorage.setItem(KEY, JSON.stringify([...next]));
      return next;
    });
  }

  return { read, markRead };
}
