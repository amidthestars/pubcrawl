const PUB_TYPE_LABELS: Record<string, string> = {
  "Clinical Trial": "clinical trial",
  "Case Reports": "case report",
  "Randomized Controlled Trial": "randomized controlled trial",
  "Observational Study": "observational",
  "Multicenter Study": "multicenter",
};

const SOURCE_LABELS = {
  full_text: "full text",
  publisher: "full text on publisher site",
  abstract_only: "abstract only",
};

const SOURCE_STYLES = {
  full_text: "text-emerald-400 border-emerald-800",
  publisher: "text-sky-400 border-sky-800",
  abstract_only: "text-neutral-500 border-neutral-700",
};

type Source = "full_text" | "publisher" | "abstract_only";

export default function TagList({
  keywords,
  pubTypes,
  source,
}: {
  keywords: string[] | null;
  pubTypes: string[] | null;
  source: Source;
}) {
  const typeLabels = (pubTypes ?? [])
    .filter((t) => t in PUB_TYPE_LABELS)
    .map((t) => ({ label: PUB_TYPE_LABELS[t as keyof typeof PUB_TYPE_LABELS], style: "text-violet-400 border-violet-800" }));

  const keywordTags = (keywords ?? []).slice(0, 4).map((k) => ({ label: k.toLowerCase(), style: "text-neutral-400 border-neutral-700" }));

  const sourcetag = { label: SOURCE_LABELS[source], style: SOURCE_STYLES[source] };

  const tags = [sourcetag, ...typeLabels, ...keywordTags];

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {tags.map((tag) => (
        <span key={tag.label} className={`text-xs px-2 py-0.5 rounded-full border ${tag.style}`}>
          {tag.label}
        </span>
      ))}
    </div>
  );
}
