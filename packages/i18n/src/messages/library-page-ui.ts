import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/**
 * UI chrome for the I Ching library — index page (search/filter/list) and the
 * per-hexagram detail page (translator tabs, mutation panel, breadcrumb). The
 * hexagram contents themselves come from `@iching-oracle/iching-data` and are
 * locale-independent (Wilhelm = English, Legge = English archaic, Zhou Yi =
 * Classical Chinese).
 */
export type LibraryPageUiMessages = {
  /** <h1> on /library and link label everywhere we point to it. */
  title: string;
  /** Subtitle / one-line description on /library. */
  subtitle: string;
  /** Doc-shell back-link that returns to the chat. */
  backToOracle: string;
  /** Search input placeholder on /library (matches by number, English, Chinese, pinyin). */
  searchPlaceholder: string;
  searchAriaLabel: string;
  /** Filter panel heading on /library. */
  filterHeading: string;
  filterAllLabel: string;
  filterUpperLabel: string;
  filterLowerLabel: string;
  filterClear: string;
  /** Aria/visible label for the 64-card grid on /library. */
  hexagramListAriaLabel: string;
  /** Counter shown above the grid: "Showing {count} hexagrams". */
  resultsCount: (count: number) => string;
  resultsEmpty: string;
  /** Detail page breadcrumb fragment ("Library / 11. Tài"). */
  detailCrumb: string;
  /** Section heading on the detail page above the translator tabs. */
  translationsHeading: string;
  /** Tab labels — translator names. */
  tabWilhelm: string;
  tabLegge: string;
  tabZhouyi: string;
  /** Subheadings inside each translator tab. */
  judgmentHeading: string;
  imageHeading: string;
  linesHeading: string;
  /** Label prefix for one of the six lines, e.g. "Line {n}" / "Línea {n}". */
  lineLabel: (position: number) => string;
  /** Yong-line labels for hex 1 and 2 (only shown when present). */
  yongJiuLabel: string;
  yongLiuLabel: string;
  /** Mutation panel: outgoing changes from this hexagram into another. */
  mutationsHeading: string;
  mutationsIntro: string;
  mutationLine: (from: number, to: number, position: number) => string;
  /** Bundle source footer (per tab). */
  sourceLabel: string;
  /** Disclaimer about Zhou Yi being Classical Chinese (no translation in PR1). */
  zhouyiClassicalNotice: string;
  /** Empty state if a binary lookup fails (defensive — shouldn't happen). */
  notFound: string;
  /** Description meta tag for the index page. */
  metaDescription: string;
  /** Title for the metadata tag of the detail page (interpolated with hexagram label). */
  detailMetaTitle: (label: string) => string;
};

/**
 * JSON-serializable variant of LibraryPageUiMessages suitable for passing
 * from Server Components to Client Components. Function fields are replaced
 * by pre-computed string values — callers must resolve them before rendering.
 */
export type LibraryPageUiSerialized = {
  readonly [K in keyof LibraryPageUiMessages]: LibraryPageUiMessages[K] extends (...args: never[]) => string ? string : LibraryPageUiMessages[K];
};

const LIBRARY_PAGE_UI: Record<AppLocale, LibraryPageUiMessages> = {
  es: {
    title: "Biblioteca de hexagramas",
    subtitle:
      "Los 64 hexagramas en orden King Wen, con las traducciones de Wilhelm/Baynes y James Legge y el texto original Zhou Yi. Esta sección no consume tokens: es una enciclopedia para consultar, comparar y estudiar.",
    backToOracle: "← Volver al oráculo",
    searchPlaceholder: "Buscar por número, nombre o pinyin",
    searchAriaLabel: "Buscar hexagramas",
    filterHeading: "Filtrar por trigrama",
    filterAllLabel: "Todos",
    filterUpperLabel: "Trigrama superior",
    filterLowerLabel: "Trigrama inferior",
    filterClear: "Quitar filtros",
    hexagramListAriaLabel: "Listado completo de los 64 hexagramas",
    resultsCount: (count) => `${count} hexagramas`,
    resultsEmpty: "Ningún hexagrama coincide con los filtros actuales.",
    detailCrumb: "Biblioteca",
    translationsHeading: "Traducciones",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (chino)",
    judgmentHeading: "Juicio",
    imageHeading: "Imagen",
    linesHeading: "Líneas",
    lineLabel: (position) => `Línea ${position}`,
    yongJiuLabel: "Sept. línea (用九)",
    yongLiuLabel: "Sept. línea (用六)",
    mutationsHeading: "Mutaciones",
    mutationsIntro:
      "Cuando una línea cambia de yin a yang o viceversa, el hexagrama se transforma en otro. Aquí puedes navegar a cualquiera de las seis mutaciones posibles desde este hexagrama.",
    mutationLine: (from, to, position) =>
      `Línea ${position} cambia → del hexagrama ${from} al ${to}`,
    sourceLabel: "Fuente",
  zhouyiClassicalNotice: "",
    notFound:
      "No se encontró ese hexagrama. Vuelve a la biblioteca y prueba con un número entre 1 y 64.",
    metaDescription:
      "Biblioteca completa de los 64 hexagramas del I Ching con Wilhelm/Baynes, Legge y Zhou Yi original. Búsqueda y comparación lado a lado.",
    detailMetaTitle: (label) => `${label} | Biblioteca | The Original I Ching App`,
  },
  en: {
    title: "Hexagram library",
    subtitle:
      "All 64 hexagrams in King Wen order with Wilhelm/Baynes, James Legge, and the original Zhou Yi text. This section never consumes tokens; it is an encyclopedia for browsing, comparing, and study.",
    backToOracle: "← Back to oracle",
    searchPlaceholder: "Search by number, name, or pinyin",
    searchAriaLabel: "Search hexagrams",
    filterHeading: "Filter by trigram",
    filterAllLabel: "All",
    filterUpperLabel: "Upper trigram",
    filterLowerLabel: "Lower trigram",
    filterClear: "Clear filters",
    hexagramListAriaLabel: "Full list of the 64 hexagrams",
    resultsCount: (count) => `${count} hexagrams`,
    resultsEmpty: "No hexagram matches the current filters.",
    detailCrumb: "Library",
    translationsHeading: "Translations",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (Chinese)",
    judgmentHeading: "Judgment",
    imageHeading: "Image",
    linesHeading: "Lines",
    lineLabel: (position) => `Line ${position}`,
    yongJiuLabel: "Seventh line (用九)",
    yongLiuLabel: "Seventh line (用六)",
    mutationsHeading: "Mutations",
    mutationsIntro:
      "When a single line changes from yin to yang or vice versa, the hexagram becomes another one. Use this panel to jump to any of the six possible mutations from this hexagram.",
    mutationLine: (from, to, position) =>
      `Line ${position} changes → from hexagram ${from} to ${to}`,
    sourceLabel: "Source",
  zhouyiClassicalNotice: "",
    notFound:
      "That hexagram could not be found. Go back to the library and pick a number between 1 and 64.",
    metaDescription:
      "Complete library of the 64 I Ching hexagrams with Wilhelm/Baynes, Legge, and original Zhou Yi. Side-by-side search and comparison.",
    detailMetaTitle: (label) => `${label} | Library | The Original I Ching App`,
  },
  pt: {
    title: "Biblioteca de hexagramas",
    subtitle:
      "Os 64 hexagramas na ordem King Wen, com as traduções de Wilhelm/Baynes e James Legge e o texto original Zhou Yi. Esta secção não consome tokens: é uma enciclopédia para consulta, comparação e estudo.",
    backToOracle: "← Voltar ao oráculo",
    searchPlaceholder: "Procurar por número, nome ou pinyin",
    searchAriaLabel: "Procurar hexagramas",
    filterHeading: "Filtrar por trigrama",
    filterAllLabel: "Todos",
    filterUpperLabel: "Trigrama superior",
    filterLowerLabel: "Trigrama inferior",
    filterClear: "Remover filtros",
    hexagramListAriaLabel: "Listagem completa dos 64 hexagramas",
    resultsCount: (count) => `${count} hexagramas`,
    resultsEmpty: "Nenhum hexagrama corresponde aos filtros actuais.",
    detailCrumb: "Biblioteca",
    translationsHeading: "Traduções",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (chinês)",
    judgmentHeading: "Juízo",
    imageHeading: "Imagem",
    linesHeading: "Linhas",
    lineLabel: (position) => `Linha ${position}`,
    yongJiuLabel: "Sét. linha (用九)",
    yongLiuLabel: "Sét. linha (用六)",
    mutationsHeading: "Mutações",
    mutationsIntro:
      "Quando uma linha muda de yin para yang ou vice-versa, o hexagrama transforma-se noutro. Use este painel para navegar até qualquer uma das seis mutações possíveis a partir deste hexagrama.",
    mutationLine: (from, to, position) =>
      `Linha ${position} muda → do hexagrama ${from} para ${to}`,
    sourceLabel: "Fonte",
  zhouyiClassicalNotice: "",
    notFound:
      "Hexagrama não encontrado. Volte à biblioteca e tente um número entre 1 e 64.",
    metaDescription:
      "Biblioteca completa dos 64 hexagramas do I Ching com Wilhelm/Baynes, Legge e Zhou Yi original. Pesquisa e comparação lado a lado.",
    detailMetaTitle: (label) => `${label} | Biblioteca | The Original I Ching App`,
  },
  fr: {
    title: "Bibliothèque des hexagrammes",
    subtitle:
      "Les 64 hexagrammes dans l'ordre du Roi Wen, avec les traductions de Wilhelm/Baynes, James Legge et le texte original Zhou Yi. Cette section ne consomme aucun jeton; c'est une encyclopédie de consultation et de comparaison.",
    backToOracle: "← Retour à l’oracle",
    searchPlaceholder: "Rechercher par numéro, nom ou pinyin",
    searchAriaLabel: "Rechercher des hexagrammes",
    filterHeading: "Filtrer par trigramme",
    filterAllLabel: "Tous",
    filterUpperLabel: "Trigramme supérieur",
    filterLowerLabel: "Trigramme inférieur",
    filterClear: "Effacer les filtres",
    hexagramListAriaLabel: "Liste complète des 64 hexagrammes",
    resultsCount: (count) => `${count} hexagrammes`,
    resultsEmpty: "Aucun hexagramme ne correspond aux filtres actuels.",
    detailCrumb: "Bibliothèque",
    translationsHeading: "Traductions",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (chinois)",
    judgmentHeading: "Jugement",
    imageHeading: "Image",
    linesHeading: "Traits",
    lineLabel: (position) => `Trait ${position}`,
    yongJiuLabel: "Septième trait (用九)",
    yongLiuLabel: "Septième trait (用六)",
    mutationsHeading: "Mutations",
    mutationsIntro:
      "Lorsqu'un trait change de yin à yang ou inversement, l'hexagramme se transforme en un autre. Utilisez ce panneau pour explorer les six mutations possibles à partir de cet hexagramme.",
    mutationLine: (from, to, position) =>
      `Trait ${position} change → de l’hexagramme ${from} vers ${to}`,
    sourceLabel: "Source",
    zhouyiClassicalNotice: "",
    notFound:
      "Cet hexagramme est introuvable. Revenez à la bibliothèque et choisissez un numéro entre 1 et 64.",
    metaDescription:
      "Bibliothèque complète des 64 hexagrammes du I Ching avec Wilhelm/Baynes, Legge et Zhou Yi original. Recherche et comparaison côte à côte.",
    detailMetaTitle: (label) => `${label} | Bibliothèque | The Original I Ching App`,
  },
  de: {
    title: "Hexagramm-Bibliothek",
    subtitle:
      "Alle 64 Hexagramme in der Reihenfolge nach König Wen mit Wilhelm/Baynes, James Legge und dem originalen Zhou-Yi-Text. Dieser Bereich verbraucht keine Token; er ist eine Enzyklopädie zum Vergleichen und Studieren.",
    backToOracle: "← Zurück zum Orakel",
    searchPlaceholder: "Nach Nummer, Name oder Pinyin suchen",
    searchAriaLabel: "Hexagramme durchsuchen",
    filterHeading: "Nach Trigramm filtern",
    filterAllLabel: "Alle",
    filterUpperLabel: "Oberes Trigramm",
    filterLowerLabel: "Unteres Trigramm",
    filterClear: "Filter zurücksetzen",
    hexagramListAriaLabel: "Vollständige Liste der 64 Hexagramme",
    resultsCount: (count) => `${count} Hexagramme`,
    resultsEmpty: "Kein Hexagramm entspricht den aktuellen Filtern.",
    detailCrumb: "Bibliothek",
    translationsHeading: "Übersetzungen",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (Chinesisch)",
    judgmentHeading: "Urteil",
    imageHeading: "Bild",
    linesHeading: "Linien",
    lineLabel: (position) => `Linie ${position}`,
    yongJiuLabel: "Siebte Linie (用九)",
    yongLiuLabel: "Siebte Linie (用六)",
    mutationsHeading: "Mutationen",
    mutationsIntro:
      "Wenn sich eine Linie von Yin in Yang oder umgekehrt ändert, verwandelt sich das Hexagramm in ein anderes. Über dieses Panel kannst du zu jeder der sechs möglichen Mutationen springen.",
    mutationLine: (from, to, position) =>
      `Linie ${position} wechselt → von Hexagramm ${from} zu ${to}`,
    sourceLabel: "Quelle",
    zhouyiClassicalNotice: "",
    notFound:
      "Dieses Hexagramm wurde nicht gefunden. Kehre zur Bibliothek zurück und wähle eine Zahl zwischen 1 und 64.",
    metaDescription:
      "Vollständige Bibliothek der 64 I-Ging-Hexagramme mit Wilhelm/Baynes, Legge und Original-Zhou Yi. Suche und Seite-an-Seite-Vergleich.",
    detailMetaTitle: (label) => `${label} | Bibliothek | The Original I Ching App`,
  },
  it: {
    title: "Biblioteca degli esagrammi",
    subtitle:
      "Tutti i 64 esagrammi nell'ordine di Re Wen con Wilhelm/Baynes, James Legge e il testo originale Zhou Yi. Questa sezione non consuma token: è un'enciclopedia per consultare, confrontare e studiare.",
    backToOracle: "← Torna all’oracolo",
    searchPlaceholder: "Cerca per numero, nome o pinyin",
    searchAriaLabel: "Cerca esagrammi",
    filterHeading: "Filtra per trigramma",
    filterAllLabel: "Tutti",
    filterUpperLabel: "Trigramma superiore",
    filterLowerLabel: "Trigramma inferiore",
    filterClear: "Rimuovi filtri",
    hexagramListAriaLabel: "Elenco completo dei 64 esagrammi",
    resultsCount: (count) => `${count} esagrammi`,
    resultsEmpty: "Nessun esagramma corrisponde ai filtri attuali.",
    detailCrumb: "Biblioteca",
    translationsHeading: "Traduzioni",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (cinese)",
    judgmentHeading: "Giudizio",
    imageHeading: "Immagine",
    linesHeading: "Linee",
    lineLabel: (position) => `Linea ${position}`,
    yongJiuLabel: "Settima linea (用九)",
    yongLiuLabel: "Settima linea (用六)",
    mutationsHeading: "Mutazioni",
    mutationsIntro:
      "Quando una linea cambia da yin a yang o viceversa, l'esagramma si trasforma in un altro. Usa questo pannello per saltare a una delle sei mutazioni possibili da questo esagramma.",
    mutationLine: (from, to, position) =>
      `Linea ${position} cambia → dall’esagramma ${from} a ${to}`,
    sourceLabel: "Fonte",
    zhouyiClassicalNotice: "",
    notFound:
      "Esagramma non trovato. Torna alla biblioteca e prova un numero tra 1 e 64.",
    metaDescription:
      "Biblioteca completa dei 64 esagrammi dell'I Ching con Wilhelm/Baynes, Legge e Zhou Yi originale. Ricerca e confronto fianco a fianco.",
    detailMetaTitle: (label) => `${label} | Biblioteca | The Original I Ching App`,
  },
  ja: {
    title: "卦のライブラリ",
    subtitle:
      "King Wen 順の64卦すべてを Wilhelm/Baynes、James Legge、原文 Zhou Yi の三つの典拠で収録しています。このセクションはトークンを消費しません, 比較・参照・学習のための事典です。",
    backToOracle: "← オラクルに戻る",
    searchPlaceholder: "番号・名前・拼音で検索",
    searchAriaLabel: "卦を検索",
    filterHeading: "三爻でフィルタ",
    filterAllLabel: "すべて",
    filterUpperLabel: "上三爻",
    filterLowerLabel: "下三爻",
    filterClear: "フィルタを解除",
    hexagramListAriaLabel: "64卦の全リスト",
    resultsCount: (count) => `${count} 卦`,
    resultsEmpty: "現在のフィルタに一致する卦はありません。",
    detailCrumb: "ライブラリ",
    translationsHeading: "翻訳",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (漢文)",
    judgmentHeading: "卦辞",
    imageHeading: "象辞",
    linesHeading: "爻",
    lineLabel: (position) => `第${position}爻`,
    yongJiuLabel: "用九（第七爻）",
    yongLiuLabel: "用六（第七爻）",
    mutationsHeading: "変卦",
    mutationsIntro:
      "ひとつの爻が陰から陽へ、あるいは陽から陰へ動くと、卦は別の卦へと変化します。このパネルから六つの変卦すべてに移動できます。",
    mutationLine: (from, to, position) =>
      `第${position}爻が変化 → 第${from}卦から第${to}卦へ`,
    sourceLabel: "出典",
    zhouyiClassicalNotice: "",
    notFound:
      "その卦は見つかりませんでした。ライブラリに戻り、1〜64 の番号を選んでください。",
    metaDescription:
      "易経 64 卦の完全ライブラリ。Wilhelm/Baynes、Legge、原文 Zhou Yi を並べて検索・比較できます。",
    detailMetaTitle: (label) => `${label} | ライブラリ | The Original I Ching App`,
  },
  zh: {
    title: "卦象图书馆",
    subtitle:
      "依周文王序列收录全部 64 卦，配以卫礼贤／贝恩斯、理雅各（James Legge）以及原始周易文本。本区不消耗代币，是一个用于浏览、比较与研习的百科。",
    backToOracle: "← 返回占卜",
    searchPlaceholder: "按编号、名称或拼音搜索",
    searchAriaLabel: "搜索卦象",
    filterHeading: "按三爻筛选",
    filterAllLabel: "全部",
    filterUpperLabel: "上三爻",
    filterLowerLabel: "下三爻",
    filterClear: "清除筛选",
    hexagramListAriaLabel: "全部 64 卦列表",
    resultsCount: (count) => `共 ${count} 卦`,
    resultsEmpty: "没有符合当前筛选条件的卦象。",
    detailCrumb: "图书馆",
    translationsHeading: "译本",
    tabWilhelm: "卫礼贤／贝恩斯",
    tabLegge: "理雅各（James Legge）",
    tabZhouyi: "周易（中文）",
    judgmentHeading: "卦辞",
    imageHeading: "象辞",
    linesHeading: "爻辞",
    lineLabel: (position) => `第${position}爻`,
    yongJiuLabel: "用九（第七爻）",
    yongLiuLabel: "用六（第七爻）",
    mutationsHeading: "变卦",
    mutationsIntro:
      "当一爻由阴变阳或由阳变阴时，卦象便会转化为另一卦。在此面板中可跳转到由此卦出发的六种可能变卦。",
    mutationLine: (from, to, position) =>
      `第${position}爻变化 → 由第 ${from} 卦至第 ${to} 卦`,
    sourceLabel: "出处",
    zhouyiClassicalNotice: "",
    notFound:
      "未找到该卦。请返回图书馆，并选择 1 至 64 之间的编号。",
    metaDescription:
      "易经 64 卦的完整图书馆，并列收录卫礼贤／贝恩斯、理雅各与原始周易，可搜索与对照。",
    detailMetaTitle: (label) => `${label} | 图书馆 | The Original I Ching App`,
  },
  ko: {
    title: "괘 라이브러리",
    subtitle:
      "주문왕 순서의 64괘 전체를 빌헬름/베인스, 제임스 레게, 원문 주역과 함께 제공합니다. 이 섹션은 토큰을 사용하지 않습니다, 열람·비교·학습을 위한 백과사전입니다.",
    backToOracle: "← 오라클로 돌아가기",
    searchPlaceholder: "번호·이름·병음으로 검색",
    searchAriaLabel: "괘 검색",
    filterHeading: "삼효로 필터",
    filterAllLabel: "전체",
    filterUpperLabel: "상삼효",
    filterLowerLabel: "하삼효",
    filterClear: "필터 해제",
    hexagramListAriaLabel: "64괘 전체 목록",
    resultsCount: (count) => `${count} 괘`,
    resultsEmpty: "현재 필터와 일치하는 괘가 없습니다.",
    detailCrumb: "라이브러리",
    translationsHeading: "번역",
    tabWilhelm: "빌헬름/베인스",
    tabLegge: "제임스 레게",
    tabZhouyi: "주역 (한문)",
    judgmentHeading: "괘사",
    imageHeading: "상사",
    linesHeading: "효",
    lineLabel: (position) => `${position}번째 효`,
    yongJiuLabel: "용구 (제7효)",
    yongLiuLabel: "용육 (제7효)",
    mutationsHeading: "변괘",
    mutationsIntro:
      "효가 음에서 양으로 또는 양에서 음으로 바뀌면 괘는 다른 괘로 변합니다. 이 패널에서 이 괘가 만들어내는 여섯 가지 변괘 중 어느 것으로도 이동할 수 있습니다.",
    mutationLine: (from, to, position) =>
      `${position}번째 효 변화 → 제 ${from}괘에서 제 ${to}괘로`,
    sourceLabel: "출처",
    zhouyiClassicalNotice: "",
    notFound:
      "해당 괘를 찾을 수 없습니다. 라이브러리로 돌아가 1부터 64 사이의 번호를 선택하세요.",
    metaDescription:
      "역경 64괘 전체 라이브러리. 빌헬름/베인스, 레게, 원문 주역을 나란히 검색·비교합니다.",
    detailMetaTitle: (label) => `${label} | 라이브러리 | The Original I Ching App`,
  },
  ar: {
    title: "مكتبة الأغراض",
    subtitle:
      "جميع الأغراض الأربعة والستين بترتيب الملك Wen، مع ترجمة Wilhelm/Baynes وترجمة James Legge والنص الأصلي Zhou Yi. لا يستهلك هذا القسم أي رموز، إنه موسوعة للمقارنة والاطلاع والدراسة.",
    backToOracle: "← العودة إلى الأوراكل",
    searchPlaceholder: "ابحث بالرقم أو الاسم أو البينين",
    searchAriaLabel: "بحث في الأغراض",
    filterHeading: "تصفية حسب الترايغرام",
    filterAllLabel: "الكل",
    filterUpperLabel: "الترايغرام العلوي",
    filterLowerLabel: "الترايغرام السفلي",
    filterClear: "إزالة الفلاتر",
    hexagramListAriaLabel: "قائمة كاملة بالأغراض الأربعة والستين",
    resultsCount: (count) => `${count} غرضًا`,
    resultsEmpty: "لا يوجد غرض يطابق الفلاتر الحالية.",
    detailCrumb: "المكتبة",
    translationsHeading: "الترجمات",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (الصينية)",
    judgmentHeading: "الحكم",
    imageHeading: "الصورة",
    linesHeading: "الأسطر",
    lineLabel: (position) => `السطر ${position}`,
    yongJiuLabel: "السطر السابع (用九)",
    yongLiuLabel: "السطر السابع (用六)",
    mutationsHeading: "التحولات",
    mutationsIntro:
      "عندما يتغير سطر من يين إلى يانغ أو العكس، يتحول الغرض إلى غرض آخر. استخدم هذه اللوحة للانتقال إلى أي من التحولات الستة الممكنة من هذا الغرض.",
    mutationLine: (from, to, position) =>
      `السطر ${position} يتغير → من الغرض ${from} إلى ${to}`,
    sourceLabel: "المصدر",
    zhouyiClassicalNotice: "",
    notFound:
      "تعذر العثور على هذا الغرض. عُد إلى المكتبة واختر رقمًا بين 1 و 64.",
    metaDescription:
      "مكتبة كاملة للأغراض الـ 64 في الـ I Ching مع Wilhelm/Baynes و Legge و Zhou Yi الأصلي. بحث ومقارنة جنبًا إلى جنب.",
    detailMetaTitle: (label) => `${label} | المكتبة | The Original I Ching App`,
  },
  hi: {
    title: "हेक्साग्राम पुस्तकालय",
    subtitle:
      "सभी 64 हेक्साग्राम राजा वेन क्रम में, Wilhelm/Baynes, James Legge और मूल Zhou Yi पाठ के साथ। यह अनुभाग टोकन का उपयोग नहीं करता, यह तुलना, अध्ययन और संदर्भ के लिए एक विश्वकोश है।",
    backToOracle: "← ओरेकल पर वापस",
    searchPlaceholder: "क्रमांक, नाम या पिनयिन से खोजें",
    searchAriaLabel: "हेक्साग्राम खोजें",
    filterHeading: "त्रिग्राम से फ़िल्टर करें",
    filterAllLabel: "सभी",
    filterUpperLabel: "ऊपरी त्रिग्राम",
    filterLowerLabel: "निचला त्रिग्राम",
    filterClear: "फ़िल्टर हटाएँ",
    hexagramListAriaLabel: "सभी 64 हेक्साग्रामों की पूरी सूची",
    resultsCount: (count) => `${count} हेक्साग्राम`,
    resultsEmpty: "मौजूदा फ़िल्टर से कोई हेक्साग्राम मेल नहीं खाता।",
    detailCrumb: "पुस्तकालय",
    translationsHeading: "अनुवाद",
    tabWilhelm: "Wilhelm/Baynes",
    tabLegge: "James Legge",
    tabZhouyi: "Zhou Yi (चीनी)",
    judgmentHeading: "निर्णय",
    imageHeading: "छवि",
    linesHeading: "रेखाएँ",
    lineLabel: (position) => `रेखा ${position}`,
    yongJiuLabel: "सातवीं रेखा (用九)",
    yongLiuLabel: "सातवीं रेखा (用六)",
    mutationsHeading: "रूपांतरण",
    mutationsIntro:
      "जब कोई रेखा यिन से यांग या यांग से यिन में बदलती है, तो हेक्साग्राम दूसरे हेक्साग्राम में रूपांतरित हो जाता है। इस पैनल का उपयोग कर इस हेक्साग्राम से छह संभावित रूपांतरणों में से किसी पर भी जाएँ।",
    mutationLine: (from, to, position) =>
      `रेखा ${position} बदलती है → हेक्साग्राम ${from} से ${to} तक`,
    sourceLabel: "स्रोत",
    zhouyiClassicalNotice: "",
    notFound:
      "वह हेक्साग्राम नहीं मिला। पुस्तकालय पर वापस जाएँ और 1 से 64 के बीच कोई संख्या चुनें।",
    metaDescription:
      "64 I Ching हेक्साग्रामों का पूरा पुस्तकालय Wilhelm/Baynes, Legge और मूल Zhou Yi के साथ। साथ-साथ खोज और तुलना।",
    detailMetaTitle: (label) => `${label} | पुस्तकालय | The Original I Ching App`,
  },
};

export function getLibraryPageUiMessages(locale: AppLocale): LibraryPageUiMessages {
  return LIBRARY_PAGE_UI[locale] ?? LIBRARY_PAGE_UI[DEFAULT_LOCALE];
}
