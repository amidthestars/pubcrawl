import { XMLParser } from "fast-xml-parser";

export type Paper = {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  pmcId: string | null;
  source: "full_text" | "publisher" | "abstract_only";
  keywords: string[];
  pubTypes: string[];
};

const parser = new XMLParser({ ignoreAttributes: false, isArray: (name) => ["Author", "ArticleId", "Keyword", "PublicationType"].includes(name) });

export function parseRecords(xml: string): Paper[] {
  if (!xml) return [];
  const root = parser.parse(xml);
  const articles = root?.PubmedArticleSet?.PubmedArticle;
  if (!articles) return [];

  return (Array.isArray(articles) ? articles : [articles]).map((entry: any) => {
    const medline = entry.MedlineCitation;
    const article = medline.Article;

    const abstractText = article.Abstract?.AbstractText;
    const abstract = typeof abstractText === "string"
      ? abstractText
      : Array.isArray(abstractText)
      ? abstractText.map((s: any) => (typeof s === "string" ? s : s["#text"] ?? "")).join(" ")
      : "";

    const authorList = article.AuthorList?.Author ?? [];
    const authors = authorList.map((a: any) =>
      [a.ForeName, a.LastName].filter(Boolean).join(" ")
    );

    const pubDate = article.Journal?.JournalIssue?.PubDate;
    const pubDateStr = pubDate
      ? [pubDate.Year, pubDate.Month, pubDate.Day].filter(Boolean).join(" ")
      : "";

    const keywords = (medline.KeywordList?.Keyword ?? []).map((k: any) =>
      typeof k === "string" ? k : (k["#text"] ?? "")
    ).filter(Boolean);

    const pubTypes = (article.PublicationTypeList?.PublicationType ?? []).map((t: any) =>
      typeof t === "string" ? t : (t["#text"] ?? "")
    ).filter(Boolean);

    const articleIds: any[] = entry.PubmedData?.ArticleIdList?.ArticleId ?? [];
    const pmcId = articleIds.find((id: any) => id["@_IdType"] === "pmc")?.["#text"] ?? null;
    const hasDoi = articleIds.some((id: any) => id["@_IdType"] === "doi");
    const source = pmcId ? "full_text" : hasDoi ? "publisher" : "abstract_only";

    return {
      pmid: String(medline.PMID?.["#text"] ?? medline.PMID),
      title: typeof article.ArticleTitle === "string" ? article.ArticleTitle : (article.ArticleTitle?.["#text"] ?? ""),
      abstract,
      authors,
      journal: article.Journal?.Title ?? "",
      pubDate: pubDateStr,
      pmcId,
      source,
      keywords,
      pubTypes,
    };
  });
}
