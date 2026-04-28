import { XMLParser } from "fast-xml-parser";

export type Paper = {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
};

const parser = new XMLParser({ ignoreAttributes: false, isArray: (name) => name === "Author" });

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

    return {
      pmid: String(medline.PMID?.["#text"] ?? medline.PMID),
      title: typeof article.ArticleTitle === "string" ? article.ArticleTitle : (article.ArticleTitle?.["#text"] ?? ""),
      abstract,
      authors,
      journal: article.Journal?.Title ?? "",
      pubDate: pubDateStr,
    };
  });
}
