/**
 * Legacy export — rows are now built from Baynes EN field map (see wilhelm-baynes-de-field-map.mjs).
 */
export {
  buildWilhelmBaynesDeRows as buildWilhelmDeBaynesRows,
  summarizeWilhelmBaynesDeRows as summarizeWilhelmDeBaynesRows,
  classifyEnDePair as classifyPair,
  WILHELM_BAYNES_FIELD_BLOCKS,
  WILHELM_BAYNES_FIELD_ORDER,
} from "./wilhelm-baynes-de-field-map.mjs";
