import type { AppLocale } from "@iching-oracle/i18n";
import { DEFAULT_LOCALE } from "@iching-oracle/i18n";

export type YarrowWizardMessages = {
  title: string;
  closeAria: string;
  lineStep: string;
  registerLine: string;
  back: string;
  confirmConsult: string;
  resultLabel: string;
  awaitingResult: string;
  phase1Label: string;
  phase1Hint: string;
  phase1Aria: string;
  phase2Label: string;
  phase2Hint: string;
  phase2Aria: string;
  phase3Label: string;
  phase3Hint: string;
  phase3Aria: string;
  caption6: string;
  caption7: string;
  caption8: string;
  caption9: string;
  rollProgress: string;
  progressNavHint: string;
  previewLoading: string;
};

const EN: YarrowWizardMessages = {
  title: "Manual cast: Yarrow Stalks",
  closeAria: "Close yarrow stalks assistant",
  lineStep: "Line {{n}} of 6 (bottom to top)",
  registerLine: "Record line",
  back: "Back",
  confirmConsult: "Send reading",
  resultLabel: "Resulting line",
  awaitingResult: "Select all three phase residues",
  phase1Label: "Phase 1 — First division",
  phase1Hint: "Divide 49 stalks into two piles; set one aside from the right. Count left pile by 4s — remainder is this value.",
  phase1Aria: "Phase 1 residue: {{v}}",
  phase2Label: "Phase 2 — Second division",
  phase2Hint: "Reassemble remaining stalks and repeat the division. Take the new remainder.",
  phase2Aria: "Phase 2 residue: {{v}}",
  phase3Label: "Phase 3 — Third division",
  phase3Hint: "One final division. The last remainder determines this line.",
  phase3Aria: "Phase 3 residue: {{v}}",
  caption6: "Old Yin (6) — moving yin",
  caption7: "Young Yang (7) — stable",
  caption8: "Young Yin (8) — stable",
  caption9: "Old Yang (9) — moving yang",
  rollProgress: "Cast {{current}}/{{total}}",
  progressNavHint: "Completed lines: tap to re-edit from that line.",
  previewLoading: "Preparing your reading…",
};

const ES: YarrowWizardMessages = {
  title: "Tirada manual: Varillas de Milenrama",
  closeAria: "Cerrar asistente de varillas",
  lineStep: "Línea {{n}} de 6 (de abajo arriba)",
  registerLine: "Registrar línea",
  back: "Atrás",
  confirmConsult: "Enviar consulta",
  resultLabel: "Línea resultante",
  awaitingResult: "Selecciona los residuos de las tres fases",
  phase1Label: "Fase 1 — Primera división",
  phase1Hint: "Divide 49 varillas en dos grupos; separa una del lado derecho. Cuenta el lado izquierdo de 4 en 4 — el resto es este valor.",
  phase1Aria: "Residuo de fase 1: {{v}}",
  phase2Label: "Fase 2 — Segunda división",
  phase2Hint: "Reagrupa las varillas restantes y repite la división. Toma el nuevo residuo.",
  phase2Aria: "Residuo de fase 2: {{v}}",
  phase3Label: "Fase 3 — Tercera división",
  phase3Hint: "Una última división. El residuo final determina esta línea.",
  phase3Aria: "Residuo de fase 3: {{v}}",
  caption6: "Yin móvil (6)",
  caption7: "Yang estable (7)",
  caption8: "Yin estable (8)",
  caption9: "Yang móvil (9)",
  rollProgress: "Tirada {{current}}/{{total}}",
  progressNavHint: "Líneas completadas: toca para volver a editar desde esa línea.",
  previewLoading: "Preparando la lectura…",
};

const M: Partial<Record<AppLocale, YarrowWizardMessages>> = {
  es: ES,
  en: EN,
  // Other locales fall back to EN — to be completed in a later i18n pass.
};

export function getYarrowWizardMessages(locale: AppLocale): YarrowWizardMessages {
  return M[locale] ?? M[DEFAULT_LOCALE] ?? EN;
}
