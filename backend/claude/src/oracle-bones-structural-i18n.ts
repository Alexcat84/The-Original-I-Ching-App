import type { OracleBonesCastResult } from "@iching-oracle/oracle-bones-engine";

/** Must match `SUPPORTED_LOCALES` in apps/web; unknown → English. */
const ORACLE_BONES_UI_LANGS = ["es", "en", "pt", "fr", "de", "it", "ja", "zh", "ko", "ar", "hi"] as const;
export type OracleBonesUiLang = (typeof ORACLE_BONES_UI_LANGS)[number];

export function normalizeOracleBonesUiLang(language: string): OracleBonesUiLang {
  const base = language.trim().toLowerCase().split("-")[0];
  return (ORACLE_BONES_UI_LANGS as readonly string[]).includes(base) ? (base as OracleBonesUiLang) : "en";
}

type Verdict = OracleBonesCastResult["verdict"];

const VERDICT_LABELS: Record<OracleBonesUiLang, Record<Verdict, string>> = {
  es: {
    auspicious_clear: "favorable claro",
    auspicious_moderate: "favorable moderado",
    inauspicious_moderate: "desfavorable moderado",
    inauspicious_clear: "desfavorable claro",
  },
  en: {
    auspicious_clear: "clearly favorable",
    auspicious_moderate: "moderately favorable",
    inauspicious_moderate: "moderately unfavorable",
    inauspicious_clear: "clearly unfavorable",
  },
  pt: {
    auspicious_clear: "favorável claro",
    auspicious_moderate: "favorável moderado",
    inauspicious_moderate: "desfavorável moderado",
    inauspicious_clear: "desfavorável claro",
  },
  fr: {
    auspicious_clear: "clairement favorable",
    auspicious_moderate: "modérément favorable",
    inauspicious_moderate: "modérément défavorable",
    inauspicious_clear: "clairement défavorable",
  },
  de: {
    auspicious_clear: "deutlich günstig",
    auspicious_moderate: "mäßig günstig",
    inauspicious_moderate: "mäßig ungünstig",
    inauspicious_clear: "deutlich ungünstig",
  },
  it: {
    auspicious_clear: "chiaramente favorevole",
    auspicious_moderate: "moderatamente favorevole",
    inauspicious_moderate: "moderatamente sfavorevole",
    inauspicious_clear: "chiaramente sfavorevole",
  },
  ja: {
    auspicious_clear: "明らかに吉",
    auspicious_moderate: "やや吉",
    inauspicious_moderate: "やや凶",
    inauspicious_clear: "明らかに凶",
  },
  zh: {
    auspicious_clear: "明显为吉",
    auspicious_moderate: "偏吉",
    inauspicious_moderate: "偏凶",
    inauspicious_clear: "明显为凶",
  },
  ko: {
    auspicious_clear: "명확히 길함",
    auspicious_moderate: "다소 길함",
    inauspicious_moderate: "다소 흉함",
    inauspicious_clear: "명확히 흉함",
  },
  ar: {
    auspicious_clear: "مبشّر بوضوح",
    auspicious_moderate: "مبشّر بدرجة معتدلة",
    inauspicious_moderate: "غير مبشّر بدرجة معتدلة",
    inauspicious_clear: "غير مبشّر بوضوح",
  },
  hi: {
    auspicious_clear: "स्पष्ट रूप से शुभ",
    auspicious_moderate: "मध्यम रूप से शुभ",
    inauspicious_moderate: "मध्यम रूप से अशुभ",
    inauspicious_clear: "स्पष्ट रूप से अशुभ",
  },
};

export function verdictNaturalLabelLocalized(verdict: Verdict, language: string): string {
  const lang = normalizeOracleBonesUiLang(language);
  return VERDICT_LABELS[lang][verdict];
}

export function structuralVerdictLineLocalized(cast: OracleBonesCastResult, language: string): string {
  const lang = normalizeOracleBonesUiLang(language);
  const label = VERDICT_LABELS[lang][cast.verdict];

  if (cast.affirmsPositive) {
    switch (lang) {
      case "en":
        return `**Structural verdict:** ${label}, aligned with the positive charge. In this cast, the positive proposition is confirmed.`;
      case "es":
        return `**Veredicto estructural:** ${label}, alineado con el cargo positivo. En esta tirada, la afirmación positiva sí queda confirmada.`;
      case "pt":
        return `**Veredito estrutural:** ${label}, alinhado à carga positiva. Nesta tiragem, a afirmação positiva fica confirmada.`;
      case "fr":
        return `**Verdict structurel :** ${label}, aligné sur la charge positive. Dans ce jet, la proposition positive est confirmée.`;
      case "de":
        return `**Strukturelles Urteil:** ${label}, ausgerichtet auf die positive Ladung. In diesem Wurf wird die positive Behauptung bestätigt.`;
      case "it":
        return `**Verdetto strutturale:** ${label}, allineato al carico positivo. In questa lettura, l'affermazione positiva risulta confermata.`;
      case "ja":
        return `**構造上の裁定：**${label}、肯定の爻辞に沿います。この占いでは、肯定の命題が確認されます。`;
      case "zh":
        return `**结构裁定：**${label}，与肯定之辞一致。在此占中，肯定命题得到确认。`;
      case "ko":
        return `**구조적 판정:** ${label}, 긍정적 문구와 맞닿습니다. 이번 점에서 긍정적 명제가 확인됩니다.`;
      case "ar":
        return `**الحكم البنيوي:** ${label}، ومتوافق مع الشحنة الإيجابية. في هذه الرمية، يتأكد الادعاء الإيجابي.`;
      case "hi":
        return `**संरचनात्मक निर्णय:** ${label}, यह सकारात्मक प्रस्ताव के अनुरूप है। इस कास्ट में सकारात्मक कथन की पुष्टि होती है।`;
    }
  }

  switch (lang) {
    case "en":
      return `**Structural verdict:** ${label}, aligned with the negative charge. In this cast, the positive proposition is NOT confirmed.`;
    case "es":
      return `**Veredicto estructural:** ${label}, alineado con el cargo negativo. En esta tirada, la afirmación positiva NO queda confirmada.`;
    case "pt":
      return `**Veredito estrutural:** ${label}, alinhado à carga negativa. Nesta tiragem, a afirmação positiva NÃO fica confirmada.`;
    case "fr":
      return `**Verdict structurel :** ${label}, aligné sur la charge négative. Dans ce jet, la proposition positive n'est PAS confirmée.`;
    case "de":
      return `**Strukturelles Urteil:** ${label}, ausgerichtet auf die negative Ladung. In diesem Wurf wird die positive Behauptung NICHT bestätigt.`;
    case "it":
      return `**Verdetto strutturale:** ${label}, allineato al carico negativo. In questa lettura, l'affermazione positiva NON risulta confermata.`;
    case "ja":
      return `**構造上の裁定：**${label}、否定の爻辞に沿います。この占いでは、肯定の命題は確認されません。`;
    case "zh":
      return `**结构裁定：**${label}，与否定之辞一致。在此占中，肯定命题未获确认。`;
    case "ko":
      return `**구조적 판정:** ${label}, 부정적 문구와 맞닿습니다. 이번 점에서 긍정적 명제는 확인되지 않습니다.`;
    case "ar":
      return `**الحكم البنيوي:** ${label}، ومتوافق مع الشحنة السلبية. في هذه الرمية، لا يتم تأكيد الادعاء الإيجابي.`;
    case "hi":
      return `**संरचनात्मक निर्णय:** ${label}, यह नकारात्मक प्रस्ताव के अनुरूप है। इस कास्ट में सकारात्मक कथन की पुष्टि नहीं होती।`;
  }
}

export function oracleBonesFallbackProse(cast: OracleBonesCastResult, language: string): string {
  const lang = normalizeOracleBonesUiLang(language);
  const label = VERDICT_LABELS[lang][cast.verdict];
  if (cast.affirmsPositive) {
    switch (lang) {
      case "es":
        return `El patrón de grieta (${label}) inclina el peso hacia el cargo positivo.`;
      case "en":
        return `The crack outcome (${label}) leans toward the positive charge.`;
      case "pt":
        return `O padrão de fissura (${label}) pesa a favor da carga positiva.`;
      case "fr":
        return `Le motif de fissure (${label}) penche vers la charge positive.`;
      case "de":
        return `Das Rissmuster (${label}) neigt sich zur positiven Ladung.`;
      case "it":
        return `Il motivo di crepa (${label}) pende verso il carico positivo.`;
      case "ja":
        return `亀裂の兆し（${label}）は、肯定の爻辞の方へ傾きます。`;
      case "zh":
        return `此裂纹兆象（${label}）倾向肯定之辞。`;
      case "ko":
        return `균열 패턴(${label})은 긍정적 문구 쪽으로 기울어집니다.`;
      case "ar":
        return `نمط الشقوق (${label}) يميل نحو الشحنة الإيجابية.`;
      case "hi":
        return `यह दरार-पैटर्न (${label}) सकारात्मक प्रस्ताव की ओर झुकता है।`;
    }
  }
  switch (lang) {
    case "es":
      return `El patrón de grieta (${label}) inclina el peso hacia la negación del cargo.`;
    case "en":
      return `The crack outcome (${label}) leans toward the negative charge.`;
    case "pt":
      return `O padrão de fissura (${label}) pesa contra a carga positiva.`;
    case "fr":
      return `Le motif de fissure (${label}) penche vers la charge négative.`;
    case "de":
      return `Das Rissmuster (${label}) neigt sich zur negativen Ladung.`;
    case "it":
      return `Il motivo di crepa (${label}) pende verso il carico negativo.`;
    case "ja":
      return `亀裂の兆し（${label}）は、肯定の爻辞が確認されない方へ傾きます。`;
    case "zh":
      return `此裂纹兆象（${label}）倾向否定肯定命题。`;
    case "ko":
      return `균열 패턴(${label})은 긍정적 명제가 확인되지 않는 쪽으로 기울어집니다.`;
    case "ar":
      return `نمط الشقوق (${label}) يميل نحو عدم تأكيد الادعاء الإيجابي.`;
    case "hi":
      return `यह दरार-पैटर्न (${label}) इस ओर झुकता है कि सकारात्मक कथन की पुष्टि नहीं होती।`;
  }
}
