const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const API_KEY = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : "";

export async function searchPMIDs(query: string, maxResults = 50): Promise<string[]> {
  const url = `${BASE}/esearch.fcgi?db=pubmed&retmode=json&retmax=${maxResults}&sort=relevance&datetype=pdat&reldate=30&term=${encodeURIComponent(query)}${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`esearch failed: ${res.status}`);
  const data = await res.json();
  return data.esearchresult.idlist as string[];
}
