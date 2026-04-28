# PubCrawl

A daily feed of interesting biomedical research for curious non-experts. No accounts, no search, no personalization, just a small set of readable, high-signal science stories every day.

## How it works

1. **Ingest** — a daily cron job fetches up to 200 recent papers from PubMed (clinical trials, systematic reviews, case reports)
2. **Rank** — papers are scored by generality (would a non-expert care?) and readability (is the abstract approachable?), and filtered down to ~80
3. **Enrich** — the top 50 are sent to an LLM which generates a plain-English "why it matters" summary for each
4. **Serve** — the feed shows today's top 10 as featured cards, with the rest available to scroll through

## Running locally

```bash
npm install
npm run dev
```

Trigger the ingest job manually:
```bash
curl -X POST http://localhost:3000/api/ingest
```

## Environment variables

```
PUBMED_API_KEY=      # from NCBI (free, increases rate limits)
DATABASE_URL=        # Neon postgres connection string
CRON_SECRET=         # secret to protect the ingest endpoint in production
GROQ_API_KEY=        # from console.groq.com (free)
```

## Stack

- **Next.js** on Vercel
- **Neon** (Postgres) for storage
- **PubMed E-utilities** for paper data
- **Groq** (Llama 3) for summarization
