const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : "";

export async function fetchRecords(pmids: string[]): Promise<string> {
  if (pmids.length === 0) return "";
  const url = `${BASE}/efetch.fcgi?db=pubmed&retmode=xml&id=${pmids.join(",")}${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`efetch failed: ${res.status}`);
  return res.text();
}
