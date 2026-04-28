import type { FillerPaper } from "@/types";

export default function FillerCard({ paper }: { paper: FillerPaper }) {
  return (
    <a
      href={`https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-3 border-b border-neutral-800 hover:text-white transition-colors"
    >
      <p className="text-sm text-neutral-200 leading-snug">{paper.title}</p>
      <p className="text-xs text-neutral-500 mt-1">{paper.journal} · {paper.pub_date}</p>
    </a>
  );
}
