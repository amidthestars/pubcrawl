export type FeaturedPaper = {
  pmid: string;
  title: string;
  journal: string;
  pub_date: string;
  did: string;
  found: string;
  matters: string;
  source: "full_text" | "publisher" | "abstract_only";
  pmc_id: string | null;
  keywords: string[];
  pub_types: string[];
};

export type FillerPaper = {
  pmid: string;
  title: string;
  journal: string;
  pub_date: string;
  source: "full_text" | "publisher" | "abstract_only";
  pmc_id: string | null;
  keywords: string[];
  pub_types: string[];
};
