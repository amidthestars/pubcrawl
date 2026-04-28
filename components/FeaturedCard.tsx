import type { FeaturedPaper } from "@/types";

export default function FeaturedCard({ paper }: { paper: FeaturedPaper }) {
  return (
    <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-neutral-600 transition-colors select-text">
      <p className="text-xs text-neutral-500 mb-2">{paper.journal} · {paper.pub_date}</p>
      <a
        href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-2xl font-semibold text-white hover:underline leading-snug block mb-3"
      >
        {paper.title}
      </a>
      <div className="text-sm text-neutral-300">
        <p><span className="text-neutral-500">Why it matters </span>{paper.matters}</p>
      </div>
    </div>
  );
}
