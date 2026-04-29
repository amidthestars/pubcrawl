const API_KEY = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : "";

export type Section = { title: string; body: string };

export async function fetchFullText(pmcId: string): Promise<Section[]> {
  const id = pmcId.replace(/^PMC/i, "");
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&retmode=xml&id=${id}${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const xml = await res.text();
  return parseSections(xml);
}

function parseSections(xml: string): Section[] {
  const sectionRegex = /<sec[^>]*>([\s\S]*?)<\/sec>/g;
  const titleRegex = /<title>([\s\S]*?)<\/title>/;
  const paraRegex = /<p>([\s\S]*?)<\/p>/g;
  const tagRegex = /<[^>]+>/g;

  const sections: Section[] = [];
  let match;

  while ((match = sectionRegex.exec(xml)) !== null) {
    const block = match[1];
    const titleMatch = titleRegex.exec(block);
    const title = titleMatch ? titleMatch[1].replace(tagRegex, "").trim() : "";

    const paragraphs: string[] = [];
    let paraMatch;
    while ((paraMatch = paraRegex.exec(block)) !== null) {
      const text = paraMatch[1].replace(tagRegex, "").trim();
      if (text) paragraphs.push(text);
    }

    if (paragraphs.length > 0) {
      sections.push({ title, body: paragraphs.join("\n\n") });
    }
  }

  return sections;
}
