import type { Paper } from "./pubmed";

const GENERAL_JOURNALS = new Set([
  "nature", "science", "cell", "the lancet", "nejm",
  "new england journal of medicine", "plos one", "plos biology",
  "proceedings of the national academy of sciences",
]);

const GENERAL_KEYWORDS = [
  "cancer", "aging", "brain", "heart", "diet", "sleep", "exercise",
  "memory", "immune", "gut", "longevity", "mental health", "diabetes",
  "obesity", "vaccine", "antibiotic", "pain", "stress", "vision", "hearing",
];

const JARGON = [
  "polymorphism", "transcription factor", "phosphorylation", "immunohistochemistry",
  "multivariate", "heterozygous", "allele", "cytokine", "apoptosis", "genotype",
];

// case reports are concrete and story-like — boost them
function caseReportBonus(paper: Paper): number {
  const t = paper.title.toLowerCase();
  const j = paper.journal.toLowerCase();
  return t.includes("case report") || t.includes("case study") || j.includes("case report") ? 0.2 : 0;
}

function generalityScore(paper: Paper): number {
  const journal = String(paper.journal ?? "").toLowerCase();
  const title = String(paper.title ?? "").toLowerCase();

  const journalScore = GENERAL_JOURNALS.has(journal) ? 1 : 0.3;
  const keywordHits = GENERAL_KEYWORDS.filter((k) => title.includes(k)).length;
  const keywordScore = Math.min(keywordHits / 2, 1);

  return journalScore * 0.5 + keywordScore * 0.5;
}

function readabilityScore(paper: Paper): number {
  if (!paper.abstract) return 0;

  const sentences = paper.abstract.split(/[.!?]+/).filter(Boolean);
  const avgWords = sentences.reduce((sum, s) => sum + s.split(" ").length, 0) / (sentences.length || 1);
  const lengthScore = Math.max(0, 1 - (avgWords - 15) / 25); // ideal ~15 words/sentence

  const jargonHits = JARGON.filter((j) => paper.abstract.toLowerCase().includes(j)).length;
  const jargonScore = Math.max(0, 1 - jargonHits / 5);

  return lengthScore * 0.5 + jargonScore * 0.5;
}

export function rankPapers(papers: Paper[]): (Paper & { score: number })[] {
  return papers
    .map((p) => ({
      ...p,
      score: Math.min(1, generalityScore(p) * 0.6 + readabilityScore(p) * 0.4 + caseReportBonus(p)),
    }))
    .sort((a, b) => b.score - a.score);
}
