import Link from "next/link";
import type { FeaturedPaper } from "@/types";
import TagList from "./TagList";

export default function FeaturedCard({ paper, read }: { paper: FeaturedPaper; read?: boolean }) {
  return (
    <div className={`p-5 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-neutral-600 transition-colors select-text ${read ? "opacity-50" : ""}`}>
      <p className="text-xs text-neutral-500 mb-2">{paper.journal} · {paper.pub_date}</p>
      <Link
        href={`/paper/${paper.pmid}`}
        className="text-2xl font-semibold text-white hover:underline leading-snug block mb-3"
      >
        {paper.title}
      </Link>
      <div className="text-sm text-neutral-300 mb-3">
        <p><span className="text-neutral-500">Why it matters: </span>{paper.matters}</p>
      </div>
      <TagList keywords={paper.keywords} pubTypes={paper.pub_types} source={paper.source} />
    </div>
  );
}
