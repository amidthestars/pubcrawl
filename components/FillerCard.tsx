import Link from "next/link";
import type { FillerPaper } from "@/types";
import TagList from "./TagList";

export default function FillerCard({ paper, read }: { paper: FillerPaper; read?: boolean }) {
  return (
    <Link
      href={`/paper/${paper.pmid}`}
      className={`block py-3 border-b border-neutral-800 hover:text-white transition-colors ${read ? "opacity-50" : ""}`}
    >
      <p className="text-sm text-neutral-200 leading-snug mb-1">{paper.title}</p>
      <p className="text-xs text-neutral-500">{paper.journal} · {paper.pub_date}</p>
      <TagList keywords={paper.keywords} pubTypes={paper.pub_types} source={paper.source} />
    </Link>
  );
}
