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
  castIndexLabel: string;
  castIndexPlaceholder: string;
  castIndexHint: string;
  primaryHexLabel: string;
  transformedHexLabel: string;
  primaryHexPlaceholder: string;
  transformedHexPlaceholder: string;
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
  selectCastBeforeVerify: string;
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
    "Verify which oracle texts the canonical mutation rule reads (Huang or Zhu Xi). Changing lines not selected by the rule are omitted.",
  backToOracle: "Back to oracle",
  backToThread: "Back to thread",
  fromConsultationBanner: "Your reading",
  consultationRef: "Ref",
  readingRefLabel: "Reference:",
  manualTitle: "Explore a cast manually",
  castIndexLabel: "Verification code",
  castIndexPlaceholder: "e.g. 573",
  castIndexHint: "Enter the code shown on your reading summary (1–4096).",
  primaryHexLabel: "Primary hexagram",
  transformedHexLabel: "Transformed hexagram",
  primaryHexPlaceholder: "Select primary hexagram",
  transformedHexPlaceholder: "Select transformed hexagram",
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
  changingLineVerbatimHeading: (position) =>
    `Changing line ${position} (not read; reference only)`,
  oracleTexts: "Oracle texts",
  translatorAppliedLabel: "Translator",
  compareOtherSystem: "View rule under the other system",
  tabWilhelm: "Wilhelm (1924)",
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
  selectCastBeforeVerify: "Select primary and transformed hexagrams, or enter a valid verification code.",
  upgradeRequiredManual:
    "Manual exploration requires a Seeker pack or higher. You can still verify readings from your consultation summary.",
  masterCombinedNote:
    "This consultation used the combined translator mode. Here Wilhelm, Legge, and Zhou Yi are shown separately for verification.",
  loading: "Loading…",
  accessDenied: "Access denied",
  consultationNotFound: "Consultation not found",
  noResultsYet: "Choose hexagrams or enter a verification code to see the oracle texts.",
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
      "Verifica qué textos oráculo lee la regla canónica de mutación (Huang o Zhu Xi). Las líneas mutantes no seleccionadas por la regla no se muestran.",
    backToOracle: "Volver al oráculo",
    backToThread: "Volver al hilo",
    fromConsultationBanner: "Tu tirada",
    consultationRef: "Ref",
    readingRefLabel: "Referencia:",
    manualTitle: "Explorar una tirada manualmente",
    castIndexLabel: "Código de verificación",
    castIndexPlaceholder: "ej. 573",
    castIndexHint: "Escribe el código que aparece en el resumen de tu tirada (1–4096).",
    primaryHexLabel: "Hexagrama primario",
    transformedHexLabel: "Hexagrama transformado",
    primaryHexPlaceholder: "Selecciona el hexagrama primario",
    transformedHexPlaceholder: "Selecciona el hexagrama transformado",
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
    changingLineVerbatimHeading: (position) =>
      `Línea ${position} mutante (no se lee; referencia)`,
    oracleTexts: "Textos oráculo",
    translatorAppliedLabel: "Traductor:",
    compareOtherSystem: "Ver regla bajo el otro sistema",
    tabWilhelm: "Wilhelm (1924)",
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
    selectCastBeforeVerify:
      "Selecciona hexagrama primario y transformado, o introduce un código de verificación válido.",
    upgradeRequiredManual:
      "La exploración manual requiere pack Seeker o superior. Aún puedes verificar tiradas desde el resumen de tu consulta.",
    masterCombinedNote:
      "Esta consulta usó el modo combinado. Aquí se muestran Wilhelm, Legge y Zhou Yi por separado para verificación.",
    loading: "Cargando…",
    accessDenied: "Acceso denegado",
    consultationNotFound: "Consulta no encontrada",
    noResultsYet:
      "Elige hexagramas o introduce un código de verificación para ver los textos oráculo.",
  }),
  en: EN,
  pt: L({
    title: "Verificação de leitura",
    readingRefLabel: "Referência:",
    metaDescription:
      "Revise a tiragem completa: regra de leitura, hexagramas e textos oráculo literais de Wilhelm, Legge ou Zhou Yi.",
    subtitle:
      "Veja a leitura integral aplicada pelo motor: regra, hexagramas e textos clássicos.",
    backToOracle: "Voltar ao oráculo",
    backToThread: "Voltar ao fio",
    fromConsultationBanner: "Sua tiragem",
    consultationRef: "Ref",
    manualTitle: "Explorar uma tiragem manualmente",
    castIndexLabel: "Código de verificação",
    castIndexPlaceholder: "ex. 573",
    castIndexHint: "Digite o código mostrado no resumo da sua tiragem (1–4096).",
    primaryHexLabel: "Hexagrama primário",
    transformedHexLabel: "Hexagrama transformado",
    primaryHexPlaceholder: "Selecione o hexagrama primário",
    transformedHexPlaceholder: "Selecione o hexagrama transformado",
    lineReadingSystemLabel: "Sistema de leitura das linhas",
    lineReadingZhuxi: "Zhu Xi (clássico)",
    swapHexes: "Trocar hexagramas",
    clearSelection: "Limpar",
    pickHexButton: "Escolher…",
    lineToggleLabel: (position) => `Linha ${position}`,
    lineMutating: "Mutante",
    lineStable: "Estável",
    readingRulesSectionTitle: "Regras de leitura aplicadas",
    ruleApplied: "Regra aplicada",
    ruleExplanationHeading: "Como a regra seleciona os textos",
    verificationCodeLabel: "Código de verificação",
    changingLines: "Linhas mutantes",
    stableLines: "Linhas estáveis",
    changingLineVerbatimHeading: (position) =>
      `Linha ${position} mutante (não lida; referência)`,
    oracleTexts: "Textos oráculo",
    translatorAppliedLabel: "Tradutor",
    compareOtherSystem: "Ver regra no outro sistema",
    primaryEmphasis: "Primário",
    secondaryEmphasis: "Secundário",
    judgmentPrimary: "Julgamento (primário)",
    judgmentTransformed: "Julgamento (transformado)",
    imagePrimary: "Imagem (primário)",
    imageTransformed: "Imagem (transformado)",
    yongJiu: "用九 (Uso dos noves)",
    yongLiu: "用六 (Uso dos seises)",
    lineTextHeading: (hex, position) => `Linha ${position} · Hexagrama ${hex}`,
    invalidHexPair:
      "Este par de hexagramas não corresponde a uma única tiragem com linhas mutantes.",
    castIndexOutOfRange: "Digite um código de verificação entre 1 e 4096.",
    selectCastBeforeVerify:
      "Selecione hexagrama primário e transformado, ou insira um código de verificação válido.",
    upgradeRequiredManual:
      "A exploração manual requer o pacote Seeker ou superior. Você ainda pode verificar leituras do resumo da consulta.",
    masterCombinedNote:
      "Esta consulta usou o modo combinado. Aqui Wilhelm, Legge e Zhou Yi são mostrados separadamente para verificação.",
    loading: "Carregando…",
    accessDenied: "Acesso negado",
    consultationNotFound: "Consulta não encontrada",
    noResultsYet:
      "Escolha hexagramas ou insira um código de verificação para ver os textos oráculo.",
  }),
  fr: L({
    title: "Vérification de lecture",
    readingRefLabel: "Référence :",
    metaDescription:
      "Consultez le tirage complet : règle de lecture, hexagrammes et textes oraculaires littéraux Wilhelm, Legge ou Zhou Yi.",
    subtitle:
      "La lecture intégrale appliquée par le moteur: règle, hexagrammes et textes classiques.",
    backToOracle: "Retour à l'oracle",
    backToThread: "Retour au fil",
    fromConsultationBanner: "Votre tirage",
    consultationRef: "Réf",
    manualTitle: "Explorer un tirage manuellement",
    castIndexLabel: "Code de vérification",
    castIndexPlaceholder: "ex. 573",
    castIndexHint: "Entrez le code affiché dans le résumé de votre tirage (1–4096).",
    primaryHexLabel: "Hexagramme primaire",
    transformedHexLabel: "Hexagramme transformé",
    primaryHexPlaceholder: "Sélectionnez l'hexagramme primaire",
    transformedHexPlaceholder: "Sélectionnez l'hexagramme transformé",
    lineReadingSystemLabel: "Système de lecture des traits",
    lineReadingZhuxi: "Zhu Xi (classique)",
    swapHexes: "Intervertir les hexagrammes",
    clearSelection: "Effacer",
    pickHexButton: "Choisir…",
    lineToggleLabel: (position) => `Trait ${position}`,
    lineMutating: "Mutant",
    lineStable: "Stable",
    readingRulesSectionTitle: "Règles de lecture appliquées",
    ruleApplied: "Règle appliquée",
    ruleExplanationHeading: "Comment la règle sélectionne les textes",
    verificationCodeLabel: "Code de vérification",
    changingLines: "Lignes mutantes",
    stableLines: "Lignes stables",
    changingLineVerbatimHeading: (position) =>
      `Trait ${position} mutant (non lu ; référence)`,
    oracleTexts: "Textes oraculaires",
    translatorAppliedLabel: "Traducteur",
    compareOtherSystem: "Voir la règle dans l'autre système",
    primaryEmphasis: "Primaire",
    secondaryEmphasis: "Secondaire",
    judgmentPrimary: "Jugement (primaire)",
    judgmentTransformed: "Jugement (transformé)",
    imagePrimary: "Image (primaire)",
    imageTransformed: "Image (transformé)",
    yongJiu: "用九 (Usage des neufs)",
    yongLiu: "用六 (Usage des six)",
    lineTextHeading: (hex, position) => `Trait ${position} · Hexagramme ${hex}`,
    invalidHexPair:
      "Cette paire d'hexagrammes ne correspond pas à un seul tirage avec des traits mutants.",
    castIndexOutOfRange: "Entrez un code de vérification entre 1 et 4096.",
    selectCastBeforeVerify:
      "Sélectionnez l'hexagramme primaire et transformé, ou entrez un code de vérification valide.",
    upgradeRequiredManual:
      "L'exploration manuelle requiert le pack Chercheur ou supérieur. Vous pouvez toujours vérifier vos tirages depuis le résumé de consultation.",
    masterCombinedNote:
      "Cette consultation a utilisé le mode combiné. Ici Wilhelm, Legge et Zhou Yi sont affichés séparément pour la vérification.",
    loading: "Chargement…",
    accessDenied: "Accès refusé",
    consultationNotFound: "Consultation introuvable",
    noResultsYet:
      "Choisissez des hexagrammes ou entrez un code de vérification pour voir les textes oraculaires.",
  }),
  de: L({
    title: "Leseverifikation",
    readingRefLabel: "Referenz:",
    metaDescription:
      "Vollständigen Wurf prüfen: Leseregel, Hexagrammverlauf und wörtliche Orakeltexte (Wilhelm, Legge, Zhou Yi).",
    subtitle:
      "Die vom Motor gewählte Gesamtlesung: Regel, Hexagramme und klassische Texte.",
    backToOracle: "Zurück zum Orakel",
    backToThread: "Zurück zum Thread",
    fromConsultationBanner: "Ihr Wurf",
    consultationRef: "Ref",
    manualTitle: "Wurf manuell erkunden",
    castIndexLabel: "Verifikationscode",
    castIndexPlaceholder: "z.B. 573",
    castIndexHint: "Geben Sie den Code aus Ihrer Lesezusammenfassung ein (1–4096).",
    primaryHexLabel: "Primäres Hexagramm",
    transformedHexLabel: "Verwandeltes Hexagramm",
    primaryHexPlaceholder: "Primäres Hexagramm wählen",
    transformedHexPlaceholder: "Verwandeltes Hexagramm wählen",
    lineReadingSystemLabel: "Linienlese-System",
    lineReadingZhuxi: "Zhu Xi (klassisch)",
    swapHexes: "Hexagramme tauschen",
    clearSelection: "Löschen",
    pickHexButton: "Wählen…",
    lineToggleLabel: (position) => `Linie ${position}`,
    lineMutating: "Wandelnd",
    lineStable: "Stabil",
    readingRulesSectionTitle: "Angewandte Leseregeln",
    ruleApplied: "Angewandte Regel",
    ruleExplanationHeading: "Wie die Lese-Regel Texte auswählt",
    verificationCodeLabel: "Verifikationscode",
    changingLines: "Mutierende Linien",
    stableLines: "Stabile Linien",
    changingLineVerbatimHeading: (position) =>
      `Wandelnde Linie ${position} (wird nicht gelesen; Referenz)`,
    oracleTexts: "Orakeltexte",
    translatorAppliedLabel: "Übersetzer",
    compareOtherSystem: "Regel im anderen System ansehen",
    primaryEmphasis: "Primär",
    secondaryEmphasis: "Sekundär",
    judgmentPrimary: "Urteil (primär)",
    judgmentTransformed: "Urteil (verwandelt)",
    imagePrimary: "Bild (primär)",
    imageTransformed: "Bild (verwandelt)",
    yongJiu: "用九 (Gebrauch der Neunen)",
    yongLiu: "用六 (Gebrauch der Sechsen)",
    lineTextHeading: (hex, position) => `Linie ${position} · Hexagramm ${hex}`,
    invalidHexPair:
      "Dieses Hexagrammpaar entspricht keinem einzelnen Wurf mit wandelnden Linien.",
    castIndexOutOfRange: "Geben Sie einen Verifikationscode zwischen 1 und 4096 ein.",
    selectCastBeforeVerify:
      "Wählen Sie primäres und verwandeltes Hexagramm oder geben Sie einen gültigen Verifikationscode ein.",
    upgradeRequiredManual:
      "Die manuelle Erkundung erfordert ein Seeker-Paket oder höher. Sie können weiterhin Würfe aus Ihrer Konsultationszusammenfassung prüfen.",
    masterCombinedNote:
      "Diese Konsultation verwendete den kombinierten Übersetzer-Modus. Hier werden Wilhelm, Legge und Zhou Yi zur Verifizierung getrennt angezeigt.",
    loading: "Laden…",
    accessDenied: "Zugriff verweigert",
    consultationNotFound: "Konsultation nicht gefunden",
    noResultsYet:
      "Wählen Sie Hexagramme oder geben Sie einen Verifikationscode ein, um die Orakeltexte zu sehen.",
  }),
  it: L({
    title: "Verifica della lettura",
    readingRefLabel: "Riferimento:",
    metaDescription:
      "Rivedi la tirata completa: regola di lettura, hexagrammi e testi oracolari letterali Wilhelm, Legge o Zhou Yi.",
    subtitle:
      "La lettura integrale selezionata dal motore: regola, hexagrammi e testi classici.",
    backToOracle: "Torna all'oracolo",
    backToThread: "Torna al thread",
    fromConsultationBanner: "La tua tirata",
    consultationRef: "Rif",
    manualTitle: "Esplora una tirata manualmente",
    castIndexLabel: "Codice di verifica",
    castIndexPlaceholder: "es. 573",
    castIndexHint: "Inserisci il codice mostrato nel riepilogo della tua tirata (1–4096).",
    primaryHexLabel: "Esagramma primario",
    transformedHexLabel: "Esagramma trasformato",
    primaryHexPlaceholder: "Seleziona l'esagramma primario",
    transformedHexPlaceholder: "Seleziona l'esagramma trasformato",
    lineReadingSystemLabel: "Sistema di lettura delle linee",
    lineReadingZhuxi: "Zhu Xi (classico)",
    swapHexes: "Scambia esagrammi",
    clearSelection: "Cancella",
    pickHexButton: "Scegli…",
    lineToggleLabel: (position) => `Linea ${position}`,
    lineMutating: "Mutante",
    lineStable: "Stabile",
    readingRulesSectionTitle: "Regole di lettura applicate",
    ruleApplied: "Regola applicata",
    ruleExplanationHeading: "Come la regola seleziona i testi",
    verificationCodeLabel: "Codice di verifica",
    changingLines: "Linee mutanti",
    stableLines: "Linee stabili",
    changingLineVerbatimHeading: (position) =>
      `Linea ${position} mutante (non letta; riferimento)`,
    oracleTexts: "Testi oracolari",
    translatorAppliedLabel: "Traduttore",
    compareOtherSystem: "Visualizza la regola nell'altro sistema",
    primaryEmphasis: "Primario",
    secondaryEmphasis: "Secondario",
    judgmentPrimary: "Giudizio (primario)",
    judgmentTransformed: "Giudizio (trasformato)",
    imagePrimary: "Immagine (primario)",
    imageTransformed: "Immagine (trasformato)",
    yongJiu: "用九 (Uso dei noni)",
    yongLiu: "用六 (Uso dei sei)",
    lineTextHeading: (hex, position) => `Linea ${position} · Esagramma ${hex}`,
    invalidHexPair:
      "Questa coppia di esagrammi non corrisponde a una singola tirata con linee mutanti.",
    castIndexOutOfRange: "Inserisci un codice di verifica tra 1 e 4096.",
    selectCastBeforeVerify:
      "Seleziona l'esagramma primario e trasformato, o inserisci un codice di verifica valido.",
    upgradeRequiredManual:
      "L'esplorazione manuale richiede il pacchetto Seeker o superiore. Puoi ancora verificare le tirate dal riepilogo della consulta.",
    masterCombinedNote:
      "Questa consulta ha utilizzato il modo traduttore combinato. Qui Wilhelm, Legge e Zhou Yi sono mostrati separatamente per la verifica.",
    loading: "Caricamento…",
    accessDenied: "Accesso negato",
    consultationNotFound: "Consulta non trovata",
    noResultsYet:
      "Scegli esagrammi o inserisci un codice di verifica per vedere i testi oracolari.",
  }),
  ja: L({
    title: "読み取り検証",
    readingRefLabel: "参照:",
    metaDescription:
      "占い全体を確認：読爻ルール、卦の推移、Wilhelm・Legge・周易の原文テキスト。",
    subtitle: "エンジンが選んだ読み取り全体（ルール・卦・古典テキスト）を表示します。",
    backToOracle: "オラクルに戻る",
    backToThread: "スレッドに戻る",
    fromConsultationBanner: "あなたの占い",
    consultationRef: "参照",
    manualTitle: "占いを手動で確認",
    castIndexLabel: "確認コード",
    castIndexPlaceholder: "例: 573",
    castIndexHint: "占い結果に表示されたコードを入力してください（1〜4096）。",
    primaryHexLabel: "主要な卦",
    transformedHexLabel: "変化した卦",
    primaryHexPlaceholder: "主要な卦を選択",
    transformedHexPlaceholder: "変化した卦を選択",
    lineReadingSystemLabel: "変爻読み取りシステム",
    lineReadingZhuxi: "朱熹（古典）",
    swapHexes: "卦を入れ替え",
    clearSelection: "クリア",
    pickHexButton: "選択…",
    lineToggleLabel: (position) => `爻 ${position}`,
    lineMutating: "変爻",
    lineStable: "静爻",
    readingRulesSectionTitle: "適用された読み取りルール",
    ruleApplied: "適用ルール",
    ruleExplanationHeading: "ルールによるテキスト選択の仕組み",
    verificationCodeLabel: "確認コード",
    changingLines: "変爻",
    stableLines: "静爻",
    changingLineVerbatimHeading: (position) =>
      `変爻 ${position}（読まれない；参考）`,
    oracleTexts: "神託テキスト",
    translatorAppliedLabel: "翻訳者",
    compareOtherSystem: "他のシステムのルールを見る",
    tabWilhelm: "ヴィルヘルム（1924）",
    tabLegge: "ジェームズ・レッグ",
    primaryEmphasis: "主要",
    secondaryEmphasis: "副次",
    judgmentPrimary: "彖辞（主要）",
    judgmentTransformed: "彖辞（変化）",
    imagePrimary: "象辞（主要）",
    imageTransformed: "象辞（変化）",
    yongJiu: "用九（九の使い方）",
    yongLiu: "用六（六の使い方）",
    lineTextHeading: (hex, position) => `爻 ${position} · 卦 ${hex}`,
    invalidHexPair: "この卦の組み合わせは変爻を持つ単一の占いに対応していません。",
    castIndexOutOfRange: "1〜4096の確認コードを入力してください。",
    selectCastBeforeVerify:
      "主要な卦と変化した卦を選択するか、有効な確認コードを入力してください。",
    upgradeRequiredManual:
      "手動探索にはSeekerパック以上が必要です。コンサルテーションのサマリーから占いを確認することはできます。",
    masterCombinedNote:
      "このコンサルテーションは結合翻訳者モードを使用しました。ここでは検証のためにWilhelm、Legge、Zhou Yiが個別に表示されます。",
    loading: "読み込み中…",
    accessDenied: "アクセス拒否",
    consultationNotFound: "コンサルテーションが見つかりません",
    noResultsYet: "卦を選択するか確認コードを入力してオラクルテキストを表示してください。",
    verifyButton: "検証",
  }),
  zh: L({
    title: "读解验证",
    readingRefLabel: "参考编号：",
    metaDescription:
      "查看完整占断：读爻规则、卦象变化及 Wilhelm、Legge、周易原文。",
    subtitle: "展示引擎选定的完整读解：规则、卦辞与经典原文。",
    backToOracle: "返回占卜",
    backToThread: "返回线程",
    fromConsultationBanner: "您的卦象",
    consultationRef: "参考",
    manualTitle: "手动探索卦象",
    castIndexLabel: "验证码",
    castIndexPlaceholder: "如 573",
    castIndexHint: "输入您的卦象摘要中显示的验证码（1–4096）。",
    primaryHexLabel: "主卦",
    transformedHexLabel: "变卦",
    primaryHexPlaceholder: "选择主卦",
    transformedHexPlaceholder: "选择变卦",
    lineReadingSystemLabel: "变爻读取系统",
    lineReadingZhuxi: "朱熹（古典）",
    swapHexes: "互换卦象",
    clearSelection: "清除",
    pickHexButton: "选择…",
    lineToggleLabel: (position) => `第${position}爻`,
    lineMutating: "变爻",
    lineStable: "静爻",
    readingRulesSectionTitle: "已应用的读取规则",
    ruleApplied: "应用规则",
    ruleExplanationHeading: "读取规则如何选择文本",
    verificationCodeLabel: "验证码",
    changingLines: "变爻",
    stableLines: "静爻",
    changingLineVerbatimHeading: (position) =>
      `变爻${position}（不读取；仅供参考）`,
    oracleTexts: "卦辞原文",
    translatorAppliedLabel: "译者",
    compareOtherSystem: "查看另一系统的规则",
    tabWilhelm: "卫礼贤（1924）",
    tabLegge: "理雅各",
    primaryEmphasis: "主卦",
    secondaryEmphasis: "变卦",
    judgmentPrimary: "彖辞（主卦）",
    judgmentTransformed: "彖辞（变卦）",
    imagePrimary: "象辞（主卦）",
    imageTransformed: "象辞（变卦）",
    yongJiu: "用九",
    yongLiu: "用六",
    lineTextHeading: (hex, position) => `第${position}爻 · 第${hex}卦`,
    invalidHexPair: "此卦对不对应具有变爻的单次占卜。",
    castIndexOutOfRange: "请输入1至4096之间的验证码。",
    selectCastBeforeVerify: "请选择主卦和变卦，或输入有效的验证码。",
    upgradeRequiredManual:
      "手动探索需要Seeker套餐或更高级别。您仍可从占卜摘要验证卦象。",
    masterCombinedNote:
      "此占卜使用了组合译者模式。此处分别显示卫礼贤、理雅各和周易以供验证。",
    loading: "加载中…",
    accessDenied: "访问被拒绝",
    consultationNotFound: "未找到占卜记录",
    noResultsYet: "请选择卦象或输入验证码以查看卦辞。",
    verifyButton: "验证",
  }),
  ko: L({
    title: "점괘 검증",
    readingRefLabel: "참조:",
    metaDescription:
      "전체 점괘 확인: 효 읽기 규칙, 괘 변화, Wilhelm·Legge·주역 원문.",
    subtitle: "엔진이 선택한 전체 해석(규칙, 괘, 고전 원문)을 표시합니다.",
    backToOracle: "오라클로 돌아가기",
    backToThread: "스레드로 돌아가기",
    fromConsultationBanner: "나의 점괘",
    consultationRef: "참조",
    manualTitle: "점괘 수동 탐색",
    castIndexLabel: "인증 코드",
    castIndexPlaceholder: "예: 573",
    castIndexHint: "점괘 요약에 표시된 코드를 입력하세요 (1–4096).",
    primaryHexLabel: "주요 괘",
    transformedHexLabel: "변환된 괘",
    primaryHexPlaceholder: "주요 괘 선택",
    transformedHexPlaceholder: "변환된 괘 선택",
    lineReadingSystemLabel: "효 읽기 시스템",
    lineReadingZhuxi: "Zhu Xi (고전)",
    swapHexes: "괘 교환",
    clearSelection: "지우기",
    pickHexButton: "선택…",
    lineToggleLabel: (position) => `효 ${position}`,
    lineMutating: "변효",
    lineStable: "정효",
    readingRulesSectionTitle: "적용된 읽기 규칙",
    ruleApplied: "적용된 규칙",
    ruleExplanationHeading: "규칙이 텍스트를 선택하는 방법",
    verificationCodeLabel: "인증 코드",
    changingLines: "변효",
    stableLines: "정효",
    changingLineVerbatimHeading: (position) =>
      `변효 ${position} (읽지 않음; 참조용)`,
    oracleTexts: "신탁 텍스트",
    translatorAppliedLabel: "번역자",
    compareOtherSystem: "다른 시스템의 규칙 보기",
    tabZhouyi: "주역",
    primaryEmphasis: "주요",
    secondaryEmphasis: "부차",
    judgmentPrimary: "단사 (주요)",
    judgmentTransformed: "단사 (변환)",
    imagePrimary: "상사 (주요)",
    imageTransformed: "상사 (변환)",
    yongJiu: "용구 (用九)",
    yongLiu: "용육 (用六)",
    lineTextHeading: (hex, position) => `효 ${position} · 괘 ${hex}`,
    invalidHexPair: "이 괘 쌍은 변효를 가진 단일 점괘에 해당하지 않습니다.",
    castIndexOutOfRange: "1에서 4096 사이의 인증 코드를 입력하세요.",
    selectCastBeforeVerify:
      "주요 괘와 변환된 괘를 선택하거나 유효한 인증 코드를 입력하세요.",
    upgradeRequiredManual:
      "수동 탐색은 Seeker 패키지 이상이 필요합니다. 상담 요약에서 점괘를 계속 확인할 수 있습니다.",
    masterCombinedNote:
      "이 상담은 복합 번역자 모드를 사용했습니다. 여기에서 Wilhelm, Legge, 주역이 검증을 위해 개별적으로 표시됩니다.",
    loading: "로딩 중…",
    accessDenied: "접근 거부",
    consultationNotFound: "상담을 찾을 수 없습니다",
    noResultsYet: "괘를 선택하거나 인증 코드를 입력하여 신탁 텍스트를 보세요.",
    verifyButton: "검증",
  }),
  ar: L({
    title: "التحقق من القراءة",
    readingRefLabel: "المرجع:",
    metaDescription:
      "راجع القراءة كاملة: قاعدة القراءة والنصوص الأوراكلية الحرفية.",
    subtitle: "القراءة الكاملة التي اختارها المحرك: القاعدة والنصوص الكلاسيكية.",
    backToOracle: "العودة إلى الأوراكل",
    backToThread: "العودة إلى الخيط",
    fromConsultationBanner: "قراءتك",
    consultationRef: "مرجع",
    manualTitle: "استكشاف قراءة يدوياً",
    castIndexLabel: "رمز التحقق",
    castIndexPlaceholder: "مثال: 573",
    castIndexHint: "أدخل الرمز الظاهر في ملخص قراءتك (1–4096).",
    primaryHexLabel: "الهكساغرام الأساسي",
    transformedHexLabel: "الهكساغرام المحوَّل",
    primaryHexPlaceholder: "اختر الهكساغرام الأساسي",
    transformedHexPlaceholder: "اختر الهكساغرام المحوَّل",
    lineReadingSystemLabel: "نظام قراءة الخطوط",
    lineReadingZhuxi: "Zhu Xi (الكلاسيكي)",
    swapHexes: "تبديل الهكساغرامات",
    clearSelection: "مسح",
    pickHexButton: "اختر…",
    lineToggleLabel: (position) => `الخط ${position}`,
    lineMutating: "متغير",
    lineStable: "ثابت",
    readingRulesSectionTitle: "قواعد القراءة المطبقة",
    ruleApplied: "القاعدة المطبقة",
    ruleExplanationHeading: "كيف تختار القاعدة النصوص",
    verificationCodeLabel: "رمز التحقق",
    changingLines: "الخطوط المتغيرة",
    stableLines: "الخطوط الثابتة",
    changingLineVerbatimHeading: (position) =>
      `الخط ${position} المتغير (لا يُقرأ؛ للمرجع فقط)`,
    oracleTexts: "نصوص الأوراكل",
    translatorAppliedLabel: "المترجم",
    compareOtherSystem: "عرض القاعدة في النظام الآخر",
    primaryEmphasis: "أساسي",
    secondaryEmphasis: "ثانوي",
    judgmentPrimary: "الحكم (أساسي)",
    judgmentTransformed: "الحكم (محوَّل)",
    imagePrimary: "الصورة (أساسي)",
    imageTransformed: "الصورة (محوَّل)",
    yongJiu: "用九 (استخدام التساعات)",
    yongLiu: "用六 (استخدام السداسيات)",
    lineTextHeading: (hex, position) => `الخط ${position} · الهكساغرام ${hex}`,
    invalidHexPair: "هذا الزوج من الهكساغرامات لا يتوافق مع قراءة واحدة بخطوط متغيرة.",
    castIndexOutOfRange: "أدخل رمز تحقق بين 1 و4096.",
    selectCastBeforeVerify:
      "اختر الهكساغرام الأساسي والمحوَّل، أو أدخل رمز تحقق صالحاً.",
    upgradeRequiredManual:
      "الاستكشاف اليدوي يتطلب حزمة Seeker أو أعلى. لا يزال بإمكانك التحقق من قراءاتك من ملخص الاستشارة.",
    masterCombinedNote:
      "استخدمت هذه الاستشارة وضع المترجم المدمج. هنا تُعرض Wilhelm وLegge وZhou Yi منفصلة للتحقق.",
    loading: "جارٍ التحميل…",
    accessDenied: "الوصول مرفوض",
    consultationNotFound: "الاستشارة غير موجودة",
    noResultsYet: "اختر هكساغرامات أو أدخل رمز تحقق لعرض النصوص الأوراكلية.",
    verifyButton: "تحقق",
  }),
  hi: L({
    title: "रीडिंग सत्यापन",
    readingRefLabel: "संदर्भ:",
    metaDescription:
      "पूर्ण कास्ट देखें: पढ़ने का नियम और Wilhelm, Legge, Zhou Yi के शाब्दिक पाठ।",
    subtitle: "इंजन द्वारा चुनी गई पूर्ण रीडिंग: नियम, हेक्साग्राम और शास्त्रीय पाठ।",
    backToOracle: "ओरेकल पर वापस",
    backToThread: "थ्रेड पर वापस",
    fromConsultationBanner: "आपकी टाली",
    consultationRef: "संदर्भ",
    manualTitle: "टाली को मैन्युअल रूप से देखें",
    castIndexLabel: "सत्यापन कोड",
    castIndexPlaceholder: "उदा. 573",
    castIndexHint: "अपनी टाली के सारांश में दिखाया गया कोड दर्ज करें (1–4096)।",
    primaryHexLabel: "प्राथमिक हेक्साग्राम",
    transformedHexLabel: "रूपांतरित हेक्साग्राम",
    primaryHexPlaceholder: "प्राथमिक हेक्साग्राम चुनें",
    transformedHexPlaceholder: "रूपांतरित हेक्साग्राम चुनें",
    lineReadingSystemLabel: "रेखा पठन प्रणाली",
    lineReadingZhuxi: "Zhu Xi (शास्त्रीय)",
    swapHexes: "हेक्साग्राम बदलें",
    clearSelection: "साफ़ करें",
    pickHexButton: "चुनें…",
    lineToggleLabel: (position) => `रेखा ${position}`,
    lineMutating: "परिवर्तनशील",
    lineStable: "स्थिर",
    readingRulesSectionTitle: "लागू पठन नियम",
    ruleApplied: "लागू नियम",
    ruleExplanationHeading: "नियम पाठ कैसे चुनता है",
    verificationCodeLabel: "सत्यापन कोड",
    changingLines: "परिवर्तित रेखाएँ",
    stableLines: "स्थिर रेखाएँ",
    changingLineVerbatimHeading: (position) =>
      `बदलती रेखा ${position} (पढ़ी नहीं जाती; केवल संदर्भ)`,
    oracleTexts: "ओरेकल पाठ",
    translatorAppliedLabel: "अनुवादक",
    compareOtherSystem: "दूसरे सिस्टम का नियम देखें",
    primaryEmphasis: "प्राथमिक",
    secondaryEmphasis: "द्वितीयक",
    judgmentPrimary: "निर्णय (प्राथमिक)",
    judgmentTransformed: "निर्णय (रूपांतरित)",
    imagePrimary: "छवि (प्राथमिक)",
    imageTransformed: "छवि (रूपांतरित)",
    yongJiu: "用九 (नवों का उपयोग)",
    yongLiu: "用六 (छक्कों का उपयोग)",
    lineTextHeading: (hex, position) => `रेखा ${position} · हेक्साग्राम ${hex}`,
    invalidHexPair: "यह हेक्साग्राम जोड़ी बदलती रेखाओं के साथ एकल टाली के अनुरूप नहीं है।",
    castIndexOutOfRange: "1 से 4096 के बीच सत्यापन कोड दर्ज करें।",
    selectCastBeforeVerify:
      "प्राथमिक और रूपांतरित हेक्साग्राम चुनें, या एक वैध सत्यापन कोड दर्ज करें।",
    upgradeRequiredManual:
      "मैन्युअल अन्वेषण के लिए Seeker पैक या उससे ऊंचे की आवश्यकता है। आप अभी भी अपनी परामर्श सारांश से पढ़ाई सत्यापित कर सकते हैं।",
    masterCombinedNote:
      "इस परामर्श ने संयुक्त अनुवादक मोड का उपयोग किया। यहाँ सत्यापन के लिए Wilhelm, Legge और Zhou Yi अलग-अलग दिखाए गए हैं।",
    loading: "लोड हो रहा है…",
    accessDenied: "पहुँच अस्वीकृत",
    consultationNotFound: "परामर्श नहीं मिली",
    noResultsYet: "ओरेकल पाठ देखने के लिए हेक्साग्राम चुनें या सत्यापन कोड दर्ज करें।",
    verifyButton: "सत्यापित करें",
  }),
};

export function getMutationExplorerUiMessages(
  locale: AppLocale,
): MutationExplorerUiMessages {
  return MUTATION_EXPLORER_UI[locale] ?? MUTATION_EXPLORER_UI[DEFAULT_LOCALE];
}
