import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type MutationExplorerUiMessages = {
  title: string;
  metaDescription: string;
  subtitle: string;
  backToOracle: string;
  backToThread: string;
  fromConsultationBanner: string;
  consultationRef: string;
  manualTitle: string;
  inputModeCode: string;
  inputModeHexPair: string;
  inputModeInteractive: string;
  castIndexLabel: string;
  castIndexPlaceholder: string;
  primaryHexLabel: string;
  transformedHexLabel: string;
  lineReadingSystemLabel: string;
  lineReadingHuang: string;
  lineReadingZhuxi: string;
  verifyButton: string;
  swapHexes: string;
  clearSelection: string;
  pickHexButton: string;
  lineToggleLabel: (position: number) => string;
  lineMutating: string;
  lineStable: string;
  interactiveHint: string;
  ruleApplied: string;
  ruleExplanationHeading: string;
  verificationCodeLabel: string;
  changingLines: string;
  stableLines: string;
  changingLineVerbatimHeading: (position: number) => string;
  oracleTexts: string;
  translatorAppliedLabel: string;
  compareOtherSystem: string;
  tabWilhelm: string;
  tabLegge: string;
  tabZhouyi: string;
  primaryEmphasis: string;
  secondaryEmphasis: string;
  judgmentPrimary: string;
  judgmentTransformed: string;
  imagePrimary: string;
  imageTransformed: string;
  yongJiu: string;
  yongLiu: string;
  lineTextHeading: (hex: number, position: number) => string;
  invalidHexPair: string;
  castIndexOutOfRange: string;
  upgradeRequiredManual: string;
  masterCombinedNote: string;
  loading: string;
  accessDenied: string;
  consultationNotFound: string;
  noResultsYet: string;
};

const EN: MutationExplorerUiMessages = {
  title: "Mutation rules verifier",
  metaDescription:
    "Verify Huang or Zhu Xi changing-line rules and read verbatim Wilhelm, Legge, and Zhou Yi oracle texts for any cast.",
  subtitle:
    "Confirm which rule governs a reading and inspect the exact classical texts selected by the engine.",
  backToOracle: "Back to oracle",
  backToThread: "Back to thread",
  fromConsultationBanner: "Your reading",
  consultationRef: "Ref",
  manualTitle: "Explore a cast manually",
  inputModeCode: "Verification code",
  inputModeHexPair: "Hexagram pair",
  inputModeInteractive: "Interactive hexagram",
  castIndexLabel: "Verification code (1–4096)",
  castIndexPlaceholder: "e.g. 573",
  primaryHexLabel: "Primary hexagram",
  transformedHexLabel: "Transformed hexagram",
  lineReadingSystemLabel: "Line reading system",
  lineReadingHuang: "Alfred Huang",
  lineReadingZhuxi: "Zhu Xi (classical)",
  verifyButton: "Verify",
  swapHexes: "Swap hexagrams",
  clearSelection: "Clear",
  pickHexButton: "Choose…",
  lineToggleLabel: (position) => `Line ${position}`,
  lineMutating: "Changing",
  lineStable: "Stable",
  interactiveHint: "Tap a line to toggle changing / stable. The transformed hexagram updates automatically.",
  ruleApplied: "Rule applied",
  ruleExplanationHeading: "How the reading rule selects texts",
  verificationCodeLabel: "Verification code",
  changingLines: "Changing lines",
  stableLines: "Stable lines",
  changingLineVerbatimHeading: (position) => `Changing line ${position} (literal text)`,
  oracleTexts: "Oracle texts",
  translatorAppliedLabel: "Translator",
  compareOtherSystem: "View rule under the other system",
  tabWilhelm: "Wilhelm / Baynes",
  tabLegge: "James Legge",
  tabZhouyi: "Zhou Yi",
  primaryEmphasis: "Primary",
  secondaryEmphasis: "Secondary",
  judgmentPrimary: "Judgment (primary)",
  judgmentTransformed: "Judgment (transformed)",
  imagePrimary: "Image (primary)",
  imageTransformed: "Image (transformed)",
  yongJiu: "用九 (Use of nines)",
  yongLiu: "用六 (Use of sixes)",
  lineTextHeading: (hex, position) => `Line ${position} · Hexagram ${hex}`,
  invalidHexPair: "This hexagram pair does not correspond to a single cast with changing lines.",
  castIndexOutOfRange: "Enter a verification code between 1 and 4096.",
  upgradeRequiredManual:
    "Manual exploration requires a Seeker pack or higher. You can still verify readings from your consultation summary.",
  masterCombinedNote:
    "This consultation used the combined translator mode. Here Wilhelm, Legge, and Zhou Yi are shown separately for verification.",
  loading: "Loading…",
  accessDenied: "Access denied",
  consultationNotFound: "Consultation not found",
  noResultsYet: "Choose input and press Verify to see the rule and oracle texts.",
};

function L(partial: Partial<MutationExplorerUiMessages>): MutationExplorerUiMessages {
  return { ...EN, ...partial };
}

const MUTATION_EXPLORER_UI: Record<AppLocale, MutationExplorerUiMessages> = {
  es: L({
    title: "Verificador de reglas de mutación",
    metaDescription:
      "Verifica las reglas Huang o Zhu Xi y consulta textos oráculo verbatim de Wilhelm, Legge y Zhou Yi para cualquier tirada.",
    subtitle:
      "Confirma qué regla gobierna una lectura e inspecciona los textos clásicos exactos seleccionados por el motor.",
    backToOracle: "Volver al oráculo",
    backToThread: "Volver al hilo",
    fromConsultationBanner: "Tu tirada",
    consultationRef: "Ref",
    manualTitle: "Explorar una tirada manualmente",
    inputModeCode: "Código de verificación",
    inputModeHexPair: "Par de hexagramas",
    inputModeInteractive: "Hexagrama interactivo",
    castIndexLabel: "Código de verificación (1–4096)",
    castIndexPlaceholder: "ej. 573",
    primaryHexLabel: "Hexagrama primario",
    transformedHexLabel: "Hexagrama transformado",
    lineReadingSystemLabel: "Lectura de líneas",
    lineReadingHuang: "Alfred Huang",
    lineReadingZhuxi: "Zhu Xi (clásico)",
    verifyButton: "Verificar",
    swapHexes: "Intercambiar hexagramas",
    clearSelection: "Limpiar",
    pickHexButton: "Elegir…",
    lineToggleLabel: (position) => `Línea ${position}`,
    lineMutating: "Mutante",
    lineStable: "Estable",
    interactiveHint:
      "Toca cada línea para alternar mutante / estable. El hexagrama transformado se actualiza automáticamente.",
    ruleApplied: "Regla aplicada",
    ruleExplanationHeading: "Criterio de la regla de lectura",
    verificationCodeLabel: "Código de verificación",
    changingLines: "Líneas mutantes",
    stableLines: "Líneas estables",
    changingLineVerbatimHeading: (position) => `Línea ${position} (mutante, texto literal)`,
    oracleTexts: "Textos oráculo",
    translatorAppliedLabel: "Traductor:",
    compareOtherSystem: "Ver regla bajo el otro sistema",
    tabWilhelm: "Wilhelm / Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi",
    primaryEmphasis: "Primaria",
    secondaryEmphasis: "Secundaria",
    judgmentPrimary: "Juicio (primario)",
    judgmentTransformed: "Juicio (transformado)",
    imagePrimary: "Imagen (primario)",
    imageTransformed: "Imagen (transformado)",
    yongJiu: "用九 (Uso de los nueves)",
    yongLiu: "用六 (Uso de los seises)",
    lineTextHeading: (hex, position) => `Línea ${position} · Hexagrama ${hex}`,
    invalidHexPair:
      "Este par de hexagramas no corresponde a una sola tirada con líneas mutantes.",
    castIndexOutOfRange: "Introduce un código de verificación entre 1 y 4096.",
    upgradeRequiredManual:
      "La exploración manual requiere pack Seeker o superior. Aún puedes verificar tiradas desde el resumen de tu consulta.",
    masterCombinedNote:
      "Esta consulta usó el modo combinado. Aquí se muestran Wilhelm, Legge y Zhou Yi por separado para verificación.",
    loading: "Cargando…",
    accessDenied: "Acceso denegado",
    consultationNotFound: "Consulta no encontrada",
    noResultsYet:
      "Elige la entrada y pulsa Verificar para ver la regla y los textos oráculo.",
  }),
  en: EN,
  pt: L({
    title: "Verificador de regras de mutação",
    backToOracle: "Voltar ao oráculo",
    backToThread: "Voltar ao fio",
    manualTitle: "Explorar uma tiragem manualmente",
    verifyButton: "Verificar",
    changingLines: "Linhas mutantes",
    stableLines: "Linhas estáveis",
    oracleTexts: "Textos oráculo",
  }),
  fr: L({
    title: "Vérificateur de règles de mutation",
    backToOracle: "Retour à l'oracle",
    backToThread: "Retour au fil",
    verifyButton: "Vérifier",
    changingLines: "Lignes mutantes",
    stableLines: "Lignes stables",
  }),
  de: L({
    title: "Mutationsregeln-Prüfer",
    backToOracle: "Zurück zum Orakel",
    backToThread: "Zurück zum Thread",
    verifyButton: "Prüfen",
    changingLines: "Mutierende Linien",
    stableLines: "Stabile Linien",
  }),
  it: L({
    title: "Verificatore regole di mutazione",
    backToOracle: "Torna all'oracolo",
    backToThread: "Torna al thread",
    verifyButton: "Verifica",
    changingLines: "Linee mutanti",
    stableLines: "Linee stabili",
  }),
  ja: L({
    title: "変爻ルール検証",
    backToOracle: "オラクルに戻る",
    backToThread: "スレッドに戻る",
    verifyButton: "検証",
    changingLines: "変爻",
    stableLines: "静爻",
  }),
  zh: L({
    title: "变爻规则验证器",
    backToOracle: "返回占卜",
    backToThread: "返回线程",
    verifyButton: "验证",
    changingLines: "变爻",
    stableLines: "静爻",
  }),
  ko: L({
    title: "변효 규칙 검증기",
    backToOracle: "오라클로 돌아가기",
    backToThread: "스레드로 돌아가기",
    verifyButton: "검증",
    changingLines: "변효",
    stableLines: "정효",
  }),
  ar: L({
    title: "مدقق قواعد التغيير",
    backToOracle: "العودة إلى الأوراكل",
    backToThread: "العودة إلى الخيط",
    verifyButton: "تحقق",
    changingLines: "الخطوط المتغيرة",
    stableLines: "الخطوط الثابتة",
  }),
  hi: L({
    title: "म्यूटेशन नियम सत्यापक",
    backToOracle: "ओरेकल पर वापस",
    backToThread: "थ्रेड पर वापस",
    verifyButton: "सत्यापित करें",
    changingLines: "परिवर्तित रेखाएँ",
    stableLines: "स्थिर रेखाएँ",
  }),
};

export function getMutationExplorerUiMessages(
  locale: AppLocale,
): MutationExplorerUiMessages {
  return MUTATION_EXPLORER_UI[locale] ?? MUTATION_EXPLORER_UI[DEFAULT_LOCALE];
}
