"use client";

import { useEffect } from "react";
import { useReadPapers } from "@/lib/hooks/useReadPapers";

export default function MarkRead({ pmid }: { pmid: string }) {
  const { markRead } = useReadPapers();
  useEffect(() => { markRead(pmid); }, [pmid]);
  return null;
}
