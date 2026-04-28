import OpenAI from "openai";
import type { Paper } from "./pubmed";

const client = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.1-8b-instant";

const PROMPT = (paper: Paper) => `
You are summarizing a biomedical research paper for a curious non-expert.
Be concise, plain, and specific. No jargon. Each field is 1-2 sentences max.
Do NOT start sentences with phrases like "This research", "This study", "This paper", or "The researchers".
Write as if explaining to a friend. Be direct.

Title: ${paper.title}
Abstract: ${paper.abstract}

Respond in JSON with exactly these fields:
{
  "did": "what the researchers did",
  "found": "what they found",
  "matters": "why it matters to a general audience"
}
`.trim();

export type Insight = { did: string; found: string; matters: string };

export async function interpretPaper(paper: Paper): Promise<Insight | null> {
  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: PROMPT(paper) }],
      temperature: 0.3,
    });
    return JSON.parse(res.choices[0].message.content ?? "null");
  } catch (e) {
    console.error(`interpret failed for ${paper.pmid}:`, e);
    return null;
  }
}
