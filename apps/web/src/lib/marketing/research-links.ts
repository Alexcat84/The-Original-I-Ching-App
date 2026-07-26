/**
 * Brand research properties. These are our OWN public subdomains, so links to
 * them are normal dofollow links (no rel="nofollow"): they form a single brand
 * chain for users and for search engines. Referenced by the marketing nav,
 * footer, the Home "Research" section and the Organization JSON-LD.
 *
 * `rel="noopener"` (not `noreferrer`): we deliberately keep the Referer header
 * so the subdomains can attribute inbound traffic from the main site.
 */
export const RESEARCH_LINKS = {
  /** Bilingual lab: 45 reproducible experiments + a 61-section verification suite. */
  experiments: "https://experiments.theoriginaliching.com",
  /** 14-page preprint + replication package (176 checks). DOI pending on Zenodo. */
  paper: "https://paper.theoriginaliching.com",
} as const;

/** Canonical (unlocalized) title of the preprint, used verbatim in JSON-LD. */
export const RESEARCH_PAPER_TITLE =
  "Statistical Structure of the Historical Orderings of the I Ching Hexagrams: Pair Rule, Family Gradient, and the Limits of Demonstrability";

/** Author of the preprint, used in JSON-LD. */
export const RESEARCH_PAPER_AUTHOR = "Alexis García Hurtado";
