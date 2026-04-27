import type { OracleBonesCastResult } from "@iching-oracle/oracle-bones-engine";

/** Must match `SUPPORTED_LOCALES` in apps/web; unknown → English. */
const ORACLE_BONES_UI_LANGS = ["es", "en", "pt", "fr", "de", "it", "ja", "zh", "ko"] as const;
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
    silent: "silencio/indeterminado",
  },
  en: {
    auspicious_clear: "clearly favorable",
    auspicious_moderate: "moderately favorable",
    inauspicious_moderate: "moderately unfavorable",
    inauspicious_clear: "clearly unfavorable",
    silent: "silent/indeterminate",
  },
  pt: {
    auspicious_clear: "favorável claro",
    auspicious_moderate: "favorável moderado",
    inauspicious_moderate: "desfavorável moderado",
    inauspicious_clear: "desfavorável claro",
    silent: "silêncio/indeterminado",
  },
  fr: {
    auspicious_clear: "clairement favorable",
    auspicious_moderate: "modérément favorable",
    inauspicious_moderate: "modérément défavorable",
    inauspicious_clear: "clairement défavorable",
    silent: "silence/indéterminé",
  },
  de: {
    auspicious_clear: "deutlich günstig",
    auspicious_moderate: "mäßig günstig",
    inauspicious_moderate: "mäßig ungünstig",
    inauspicious_clear: "deutlich ungünstig",
    silent: "Stille/unbestimmt",
  },
  it: {
    auspicious_clear: "chiaramente favorevole",
    auspicious_moderate: "moderatamente favorevole",
    inauspicious_moderate: "moderatamente sfavorevole",
    inauspicious_clear: "chiaramente sfavorevole",
    silent: "silenzio/indeterminato",
  },
  ja: {
    auspicious_clear: "明らかに吉",
    auspicious_moderate: "やや吉",
    inauspicious_moderate: "やや凶",
    inauspicious_clear: "明らかに凶",
    silent: "沈黙／不定",
  },
  zh: {
    auspicious_clear: "明显为吉",
    auspicious_moderate: "偏吉",
    inauspicious_moderate: "偏凶",
    inauspicious_clear: "明显为凶",
    silent: "静默／未定",
  },
  ko: {
    auspicious_clear: "명확히 길함",
    auspicious_moderate: "다소 길함",
    inauspicious_moderate: "다소 흉함",
    inauspicious_clear: "명확히 흉함",
    silent: "침묵／미정",
  },
};

export function verdictNaturalLabelLocalized(verdict: Verdict, language: string): string {
  const lang = normalizeOracleBonesUiLang(language);
  return VERDICT_LABELS[lang][verdict];
}

export function structuralVerdictLineLocalized(cast: OracleBonesCastResult, language: string): string {
  const lang = normalizeOracleBonesUiLang(language);
  const label = VERDICT_LABELS[lang][cast.verdict];

  if (cast.affirmsPositive === null) {
    switch (lang) {
      case "en":
        return `Structural verdict: ${label}. Ancestors are silent/indeterminate; no yes/no confirmation is available.`;
      case "es":
        return `Veredicto estructural: ${label}. Ancestros en silencio/indeterminación; no hay confirmación sí/no disponible.`;
      case "pt":
        return `Veredito estrutural: ${label}. Os ancestrais permanecem em silêncio/indeterminação; não há confirmação sim/não disponível.`;
      case "fr":
        return `Verdict structurel : ${label}. Les ancêtres demeurent dans le silence/l'indétermination ; aucune confirmation oui/non n'est disponible.`;
      case "de":
        return `Strukturelles Urteil: ${label}. Die Ahnen schweigen/sind unbestimmt; es gibt keine klare Ja/Nein-Bestätigung.`;
      case "it":
        return `Verdetto strutturale: ${label}. Gli antenati sono nel silenzio/nell'indeterminatezza; non è disponibile una conferma sì/no.`;
      case "ja":
        return `構造上の裁定：${label}。祖先の兆しは沈黙／不定であり、この占いで明確なイエス・ノーは示されません。`;
      case "zh":
        return `结构裁定：${label}。祖先之兆静默／未定；此占无法给出明确的是／否。`;
      case "ko":
        return `구조적 판정: ${label}. 조상의 계시는 침묵/미정이며, 이번 점에서 명확한 예/아니오 확인은 없습니다.`;
    }
  }

  if (cast.affirmsPositive) {
    switch (lang) {
      case "en":
        return `Structural verdict: ${label}, aligned with the positive charge. In this cast, the positive proposition is confirmed.`;
      case "es":
        return `Veredicto estructural: ${label}, alineado con el cargo positivo. En esta tirada, la afirmación positiva sí queda confirmada.`;
      case "pt":
        return `Veredito estrutural: ${label}, alinhado à carga positiva. Nesta tiragem, a afirmação positiva fica confirmada.`;
      case "fr":
        return `Verdict structurel : ${label}, aligné sur la charge positive. Dans ce jet, la proposition positive est confirmée.`;
      case "de":
        return `Strukturelles Urteil: ${label}, ausgerichtet auf die positive Ladung. In diesem Wurf wird die positive Behauptung bestätigt.`;
      case "it":
        return `Verdetto strutturale: ${label}, allineato al carico positivo. In questa lettura, l'affermazione positiva risulta confermata.`;
      case "ja":
        return `構造上の裁定：${label}、肯定の爻辞に沿います。この占いでは、肯定の命題が確認されます。`;
      case "zh":
        return `结构裁定：${label}，与肯定之辞一致。在此占中，肯定命题得到确认。`;
      case "ko":
        return `구조적 판정: ${label}, 긍정적 문구와 맞닿습니다. 이번 점에서 긍정적 명제가 확인됩니다.`;
    }
  }

  switch (lang) {
    case "en":
      return `Structural verdict: ${label}, aligned with the negative charge. In this cast, the positive proposition is NOT confirmed.`;
    case "es":
      return `Veredicto estructural: ${label}, alineado con el cargo negativo. En esta tirada, la afirmación positiva NO queda confirmada.`;
    case "pt":
      return `Veredito estrutural: ${label}, alinhado à carga negativa. Nesta tiragem, a afirmação positiva NÃO fica confirmada.`;
    case "fr":
      return `Verdict structurel : ${label}, aligné sur la charge négative. Dans ce jet, la proposition positive n'est PAS confirmée.`;
    case "de":
      return `Strukturelles Urteil: ${label}, ausgerichtet auf die negative Ladung. In diesem Wurf wird die positive Behauptung NICHT bestätigt.`;
    case "it":
      return `Verdetto strutturale: ${label}, allineato al carico negativo. In questa lettura, l'affermazione positiva NON risulta confermata.`;
    case "ja":
      return `構造上の裁定：${label}、否定の爻辞に沿います。この占いでは、肯定の命題は確認されません。`;
    case "zh":
      return `结构裁定：${label}，与否定之辞一致。在此占中，肯定命题未获确认。`;
    case "ko":
      return `구조적 판정: ${label}, 부정적 문구와 맞닿습니다. 이번 점에서 긍정적 명제는 확인되지 않습니다.`;
  }
}

export function oracleBonesSilentVerdictMessage(language: string): string {
  const lang = normalizeOracleBonesUiLang(language);
  switch (lang) {
    case "es":
      return "Tras tres indeterminaciones seguidas en la lectura del patrón de grieta, la tradición shang sugería a veces dejar pasar el asunto y no forzar un sí o no en ese momento. Vuelve a formular la consulta cuando veas el curso más claro.";
    case "en":
      return "After three indeterminate crack readings in a row, Shang-era practice often meant pausing rather than forcing a yes/no. Reformulate when the situation feels clearer.";
    case "pt":
      return "Após três leituras indeterminadas seguidas do padrão de fissura, a prática da era Shang frequentemente aconselhava esperar em vez de forçar um sim/não. Reformule quando o quadro estiver mais claro.";
    case "fr":
      return "Après trois lectures indéterminées d'affilée du motif de fissure, la pratique de l'époque des Shang invitait souvent à attendre plutôt qu'à forcer un oui/non. Reformulez lorsque la situation paraît plus claire.";
    case "de":
      return "Nach drei nacheinander unbestimmten Riss-Lesungen bedeutete Shang-Zeit oft: pausieren statt Ja/Nein zu erzwingen. Formulieren Sie neu, wenn die Lage klarer erscheint.";
    case "it":
      return "Dopo tre letture indeterminate di fila del motivo di crepa, nella pratica dell'epoca Shang si consigliava spesso di attendere piuttosto che forzare un sì/no. Riformula quando la situazione ti sembra più chiara.";
    case "ja":
      return "亀甲の兆しが三度続けて不定だった場合、殷の占法では一時停止し、イエス・ノーを無理に求めないこともありました。状況が見えてきたら、問いを改めてください。";
    case "zh":
      return "若裂纹兆象连续三次不定，商代做法常是暂缓而非强求是或否。待情势更明朗时再重述所问。";
    case "ko":
      return "균열 패턴이 연속 세 번 불명확하면, 상(商) 시대 관례는 예/아니오를 억지로 내기보다 잠시 멈추는 경우가 많았습니다. 상황이 더 분명해지면 질문을 다시 정리해 보세요.";
  }
}

export function oracleBonesFallbackProse(cast: OracleBonesCastResult, language: string): string {
  const lang = normalizeOracleBonesUiLang(language);
  const label = VERDICT_LABELS[lang][cast.verdict];
  if (cast.affirmsPositive === null) {
    switch (lang) {
      case "es":
        return `El patrón de grieta (${label}) no ofrece un sí o no claro en este momento.`;
      case "en":
        return `The crack outcome (${label}) offers no clear yes/no at this time.`;
      case "pt":
        return `O padrão de fissura (${label}) não oferece um sim/não claro neste momento.`;
      case "fr":
        return `Le motif de fissure (${label}) n'offre pas d'oui/non clair pour l'instant.`;
      case "de":
        return `Das Rissmuster (${label}) liefert derzeit kein klares Ja/Nein.`;
      case "it":
        return `Il motivo di crepa (${label}) non offre un sì/no chiaro in questo momento.`;
      case "ja":
        return `この亀裂の兆し（${label}）は、現時点では明確なイエス・ノーを示しません。`;
      case "zh":
        return `此裂纹兆象（${label}）目前无法给出明确的是／否。`;
      case "ko":
        return `이 균열 패턴(${label})은 지금 명확한 예/아니오를 주지 않습니다.`;
    }
  }
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
  }
}
