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
  /** Trilingual lab: 45 reproducible experiments + a 63-section verification suite. */
  experiments: "https://experiments.theoriginaliching.com",
  /** 15-page preprint + replication package (202 checks), archived on Zenodo. */
  paper: "https://paper.theoriginaliching.com",
} as const;

/**
 * Zenodo issues two identifiers and they are not interchangeable. The CONCEPT DOI names
 * no particular version: it always resolves to the latest one, and that is what a
 * citation should point at. The RECORD is the deposit currently behind it. They are kept
 * apart on purpose: the PDF itself prints the version DOI it was archived with, which is
 * correct for a frozen artefact and must not be "corrected" to match these.
 */
export const RESEARCH_PAPER_DOI = "https://doi.org/10.5281/zenodo.21609653";
export const RESEARCH_PAPER_ZENODO = "https://zenodo.org/records/21628654";

/** Canonical (unlocalized) title of the preprint, used verbatim in JSON-LD. */
export const RESEARCH_PAPER_TITLE =
  "Statistical Structure of the Historical Orderings of the I Ching Hexagrams: Pair Rule, Family Gradient, and the Limits of Demonstrability";

/** Author of the preprint, used in JSON-LD. */
export const RESEARCH_PAPER_AUTHOR = "Alexis García Hurtado";
