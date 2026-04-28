CREATE TABLE IF NOT EXISTS papers (
  id         SERIAL PRIMARY KEY,
  pmid       TEXT UNIQUE NOT NULL,
  title      TEXT,
  abstract   TEXT,
  authors    TEXT[],
  journal    TEXT,
  pub_date   TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paper_insights (
  id           SERIAL PRIMARY KEY,
  pmid         TEXT UNIQUE NOT NULL REFERENCES papers(pmid),
  score        FLOAT,
  did          TEXT,
  found        TEXT,
  matters      TEXT,
  generated_at TIMESTAMP DEFAULT NOW()
);
