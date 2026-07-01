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
  readingRefLabel: string;
  manualTitle: string;
  inputModeCode: string;
  inputModeHexPair: string;
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
  readingRulesSectionTitle: string;
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
  title: "Reading verification",
  metaDescription:
    "Review your full cast: line-reading rule, hexagram trace, and verbatim Wilhelm, Legge, or Zhou Yi oracle texts.",
  subtitle:
    "See the complete reading the engine selected — rule, hexagrams, and classical texts — not only the changing lines.",
  backToOracle: "Back to oracle",
  backToThread: "Back to thread",
  fromConsultationBanner: "Your reading",
  consultationRef: "Ref",
  readingRefLabel: "Reference:",
  manualTitle: "Explore a cast manually",
  inputModeCode: "Verification code",
  inputModeHexPair: "Hexagram pair",
  castIndexLabel: "Verification code",
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
  readingRulesSectionTitle: "Reading rules applied",
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
  noResultsYet: "Choose input and press Verify to see the oracle texts.",
};

function L(partial: Partial<MutationExplorerUiMessages>): MutationExplorerUiMessages {
  return { ...EN, ...partial };
}

const MUTATION_EXPLORER_UI: Record<AppLocale, MutationExplorerUiMessages> = {
  es: L({
    title: "Verificación de lectura",
    metaDescription:
      "Revisa la tirada completa: regla de lectura, traza de hexagramas y textos oráculo literales de Wilhelm, Legge o Zhou Yi.",
    subtitle:
      "Consulta la lectura íntegra que aplicó el motor — regla, hexagramas y textos clásicos —, no solo las líneas mutantes.",
    backToOracle: "Volver al oráculo",
    backToThread: "Volver al hilo",
    fromConsultationBanner: "Tu tirada",
    consultationRef: "Ref",
    readingRefLabel: "Referencia:",
    manualTitle: "Explorar una tirada manualmente",
    inputModeCode: "Código de verificación",
    inputModeHexPair: "Par de hexagramas",
    castIndexLabel: "Código de verificación",
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
    readingRulesSectionTitle: "Reglas de lectura aplicadas",
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
      "Elige la entrada y pulsa Verificar para ver los textos oráculo.",
  }),
  en: EN,
  pt: L({
    title: "Verificação de leitura",
    readingRefLabel: "Referência:",
    metaDescription:
      "Revise a tiragem completa: regra de leitura, hexagramas e textos oráculo literais de Wilhelm, Legge ou Zhou Yi.",
    subtitle:
      "Veja a leitura integral aplicada pelo motor — regra, hexagramas e textos clássicos.",
    backToOracle: "Voltar ao oráculo",
    backToThread: "Voltar ao fio",
    manualTitle: "Explorar uma tiragem manualmente",
    verifyButton: "Verificar",
    changingLines: "Linhas mutantes",
    stableLines: "Linhas estáveis",
    oracleTexts: "Textos oráculo",
  }),
  fr: L({
    title: "Vérification de lecture",
    readingRefLabel: "Référence :",
    metaDescription:
      "Consultez le tirage complet : règle de lecture, hexagrammes et textes oraculaires littéraux Wilhelm, Legge ou Zhou Yi.",
    subtitle:
      "La lecture intégrale appliquée par le moteur — règle, hexagrammes et textes classiques.",
    backToOracle: "Retour à l'oracle",
    backToThread: "Retour au fil",
    verifyButton: "Vérifier",
    changingLines: "Lignes mutantes",
    stableLines: "Lignes stables",
  }),
  de: L({
    title: "Leseverifikation",
    readingRefLabel: "Referenz:",
    metaDescription:
      "Vollständigen Wurf prüfen: Leseregel, Hexagrammverlauf und wörtliche Orakeltexte (Wilhelm, Legge, Zhou Yi).",
    subtitle:
      "Die vom Motor gewählte Gesamtlesung — Regel, Hexagramme und klassische Texte.",
    backToOracle: "Zurück zum Orakel",
    backToThread: "Zurück zum Thread",
    verifyButton: "Prüfen",
    changingLines: "Mutierende Linien",
    stableLines: "Stabile Linien",
  }),
  it: L({
    title: "Verifica della lettura",
    readingRefLabel: "Riferimento:",
    metaDescription:
      "Rivedi la tirata completa: regola di lettura, hexagrammi e testi oracolari letterali Wilhelm, Legge o Zhou Yi.",
    subtitle:
      "La lettura integrale selezionata dal motore — regola, hexagrammi e testi classici.",
    backToOracle: "Torna all'oracolo",
    backToThread: "Torna al thread",
    verifyButton: "Verifica",
    changingLines: "Linee mutanti",
    stableLines: "Linee stabili",
  }),
  ja: L({
    title: "読み取り検証",
    readingRefLabel: "参照:",
    metaDescription:
      "占い全体を確認：読爻ルール、卦の推移、Wilhelm・Legge・周易の原文テキスト。",
    subtitle: "エンジンが選んだ読み取り全体（ルール・卦・古典テキスト）を表示します。",
    backToOracle: "オラクルに戻る",
    backToThread: "スレッドに戻る",
    verifyButton: "検証",
    changingLines: "変爻",
    stableLines: "静爻",
  }),
  zh: L({
    title: "读解验证",
    readingRefLabel: "参考编号：",
    metaDescription:
      "查看完整占断：读爻规则、卦象变化及 Wilhelm、Legge、周易原文。",
    subtitle: "展示引擎选定的完整读解——规则、卦辞与经典原文。",
    backToOracle: "返回占卜",
    backToThread: "返回线程",
    verifyButton: "验证",
    changingLines: "变爻",
    stableLines: "静爻",
  }),
  ko: L({
    title: "점괘 검증",
    readingRefLabel: "참조:",
    metaDescription:
      "전체 점괘 확인: 효 읽기 규칙, 괘 변화, Wilhelm·Legge·주역 원문.",
    subtitle: "엔진이 선택한 전체 해석(규칙, 괘, 고전 원문)을 표시합니다.",
    backToOracle: "오라클로 돌아가기",
    backToThread: "스레드로 돌아가기",
    verifyButton: "검증",
    changingLines: "변효",
    stableLines: "정효",
  }),
  ar: L({
    title: "التحقق من القراءة",
    readingRefLabel: "المرجع:",
    metaDescription:
      "راجع القراءة كاملة: قاعدة القراءة والنصوص الأوراكلية الحرفية.",
    subtitle: "القراءة الكاملة التي اختارها المحرك — القاعدة والنصوص الكلاسيكية.",
    backToOracle: "العودة إلى الأوراكل",
    backToThread: "العودة إلى الخيط",
    verifyButton: "تحقق",
    changingLines: "الخطوط المتغيرة",
    stableLines: "الخطوط الثابتة",
  }),
  hi: L({
    title: "रीडिंग सत्यापन",
    readingRefLabel: "संदर्भ:",
    metaDescription:
      "पूर्ण कास्ट देखें: पढ़ने का नियम और Wilhelm, Legge, Zhou Yi के शाब्दिक पाठ।",
    subtitle: "इंजन द्वारा चुनी गई पूर्ण रीडिंग — नियम, हेक्साग्राम और शास्त्रीय पाठ।",
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
