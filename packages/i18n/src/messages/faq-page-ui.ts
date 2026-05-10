import type { DocNavUiMessages } from "./doc-nav-ui.js";
import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type FaqRelatedSlug =
  | "oracleHome"
  | "userGuide"
  | "userGuideGettingStarted"
  | "tokenPacks"
  | "methodNotes"
  | "privacyPolicy"
  | "termsOfService"
  | "pricing";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  related?: FaqRelatedSlug[];
};

export type FaqCategoryId =
  | "app-usage"
  | "oracle-methods"
  | "ai-texts"
  | "tokens-payments"
  | "privacy-account";

export type FaqCategory = {
  id: FaqCategoryId;
  title: string;
  items: FaqItem[];
};

export type FaqPageUi = {
  title: string;
  intro: string;
  seeAlsoHeading: string;
  categories: FaqCategory[];
  /** Flat list kept for backward compatibility; derived from categories. */
  items: FaqItem[];
};

const FAQ_CATEGORY_ORDER: FaqCategoryId[] = [
  "app-usage",
  "oracle-methods",
  "ai-texts",
  "tokens-payments",
  "privacy-account",
];

const FAQ_ITEMS_BY_CATEGORY: Record<FaqCategoryId, string[]> = {
  "app-usage": ["language-support", "chats-drawer", "thread-depth", "export-pdf", "prompt-length"],
  "oracle-methods": [
    "iching-how-answers",
    "yarrow-vs-coins",
    "iching-manual-auto-bones",
    "oracle-bones-method",
    "silence-state",
  ],
  "ai-texts": ["ai-vs-algorithm", "authentic-texts", "data-reliability", "not-advice"],
  "tokens-payments": ["tokens-packs", "purchases-legal", "library-unlock"],
  "privacy-account": ["privacy-consultations", "privacy-data", "security-2fa"],
};

const FAQ_CATEGORY_TITLES: Record<AppLocale, Record<FaqCategoryId, string>> = {
  es: {
    "app-usage": "Uso de la app",
    "oracle-methods": "Métodos del oráculo",
    "ai-texts": "Textos, IA y autenticidad",
    "tokens-payments": "Tokens, packs y pagos",
    "privacy-account": "Privacidad y cuenta",
  },
  en: {
    "app-usage": "Using the app",
    "oracle-methods": "Oracle methods",
    "ai-texts": "Texts, AI and authenticity",
    "tokens-payments": "Tokens, packs and payments",
    "privacy-account": "Privacy and account",
  },
  pt: {
    "app-usage": "Uso da app",
    "oracle-methods": "Métodos do oráculo",
    "ai-texts": "Textos, IA e autenticidade",
    "tokens-payments": "Tokens, packs e pagamentos",
    "privacy-account": "Privacidade e conta",
  },
  fr: {
    "app-usage": "Utilisation de l’app",
    "oracle-methods": "Méthodes de l’oracle",
    "ai-texts": "Textes, IA et authenticité",
    "tokens-payments": "Jetons, packs et paiements",
    "privacy-account": "Confidentialité et compte",
  },
  de: {
    "app-usage": "App-Nutzung",
    "oracle-methods": "Orakel-Methoden",
    "ai-texts": "Texte, KI und Echtheit",
    "tokens-payments": "Tokens, Packs und Zahlungen",
    "privacy-account": "Datenschutz und Konto",
  },
  it: {
    "app-usage": "Uso dell’app",
    "oracle-methods": "Metodi dell’oracolo",
    "ai-texts": "Testi, IA e autenticità",
    "tokens-payments": "Token, pack e pagamenti",
    "privacy-account": "Privacy e account",
  },
  ja: {
    "app-usage": "アプリの使い方",
    "oracle-methods": "占いの方式",
    "ai-texts": "テキスト・AI・原典性",
    "tokens-payments": "トークン・パック・支払い",
    "privacy-account": "プライバシーとアカウント",
  },
  zh: {
    "app-usage": "应用使用",
    "oracle-methods": "占卜方法",
    "ai-texts": "文本、AI 与真实性",
    "tokens-payments": "代币、套餐与付款",
    "privacy-account": "隐私与账户",
  },
  ko: {
    "app-usage": "앱 사용",
    "oracle-methods": "점법",
    "ai-texts": "원문·AI·진본성",
    "tokens-payments": "토큰·팩·결제",
    "privacy-account": "개인정보와 계정",
  },
  ar: {
    "app-usage": "استخدام التطبيق",
    "oracle-methods": "طرق العرافة",
    "ai-texts": "النصوص والذكاء الاصطناعي والأصالة",
    "tokens-payments": "الرموز والحزم والدفع",
    "privacy-account": "الخصوصية والحساب",
  },
  hi: {
    "app-usage": "ऐप का उपयोग",
    "oracle-methods": "ओरेकल विधियाँ",
    "ai-texts": "मूल पाठ, एआई और प्रामाणिकता",
    "tokens-payments": "टोकन, पैक और भुगतान",
    "privacy-account": "गोपनीयता और खाता",
  },
};

export function resolveFaqRelatedHref(slug: FaqRelatedSlug): string {
  switch (slug) {
    case "oracleHome":
      return "/";
    case "userGuide":
      return "/guia";
    case "userGuideGettingStarted":
      return "/guia#primeros-pasos";
    case "tokenPacks":
      return "/guia#planes";
    case "methodNotes":
      return "/notes";
    case "privacyPolicy":
      return "/privacy";
    case "termsOfService":
      return "/terms";
    case "pricing":
      return "/pricing";
    default:
      return "/";
  }
}

export function resolveFaqRelatedLabel(
  slug: FaqRelatedSlug,
  nav: DocNavUiMessages,
  pricingPageTitle: string,
): string {
  switch (slug) {
    case "oracleHome":
      return nav.oracleHome;
    case "userGuide":
      return nav.userGuide;
    case "userGuideGettingStarted":
      return nav.guideFirstSteps;
    case "tokenPacks":
      return nav.guidePlansSection;
    case "methodNotes":
      return nav.methodNotesLong;
    case "privacyPolicy":
      return nav.privacyPolicy;
    case "termsOfService":
      return nav.termsOfService;
    case "pricing":
      return pricingPageTitle;
    default:
      return nav.oracleHome;
  }
}

const FAQ_ITEMS_EN: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "How do tokens, packs, and the free tier work?",
    answer:
      "Consultations consume tokens according to your active pack. The guide explains free trial allowances, pack sizes, and how balances work with your account. Purchases and renewals are governed by the Terms.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "How reliable are the I Ching texts provided in the app?",
    answer:
      "The texts are extremely reliable. We conducted a 1:1 data integrity audit, verifying each hexagram against academic sources such as the University of Parma (Wilhelm translation), Sacred-Texts.com (Legge), and the Chinese Text Project (Zhou Yi). Any transcription errors found in the original source datasets have been manually corrected to ensure mathematical and literary accuracy.",
  },
  {
    id: "yarrow-vs-coins",
    question: "What are the two I Ching casting methods: Three Coins and Yarrow Stalks?",
    answer:
      "Both methods produce the same 64 hexagrams and use the same I Ching texts and Zhu Xi rules. Three Coins is quick and accessible: you cast three coins six times to build the six lines. Yarrow Stalks is the older ritual method: you work with counted stalks or similar objects through a slower, more contemplative procedure. The choice changes the ritual experience, not the authority of the reading. Use Three Coins for speed; use Yarrow Stalks when you want the traditional rhythm.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "What is automatic vs manual I Ching, and can I mix Oracle Bones in the same thread?",
    answer:
      "Automatic vs manual applies only to I Ching (Three Coins or Yarrow Stalks). In Options the cast-mode controls appear when I Ching is selected: choose Three Coins or Yarrow Stalks, then choose automatic (the cast runs on the server) or manual (you enter the six line totals 6/7/8/9 from your own coins or stalks). Oracle Bones is always automatic; there is no manual bones flow; ritual and verdict come from the algorithm only. Within your plan’s per-thread depth cap, you may freely alternate I Ching and Oracle Bones and switch methods and modes between consultations; your preferences are remembered for the next I Ching reading.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "What is the Oracle Bones method?",
    answer:
      "Oracle Bones is a Shang-era divination method inspired by crack reading on turtle plastrons and ox scapulae. In the app it is separate from I Ching: it does not create hexagrams or changing lines. The system forms a crack pattern and verdict first, then the AI interprets that already formed result in your language. The verdict always falls into one of five possible states, faithful to the original Shang tradition: 1) 吉: clearly favorable, the pattern confirms the positive charge without ambiguity; 2) 吉 moderate: moderately favorable, confirmation with nuances or conditions; 3) 凶 moderate: moderately unfavorable, the pattern leans toward negation with reservations; 4) 凶: clearly unfavorable, the pattern negates the positive charge without ambiguity; 5) 沉默: Silence, the pattern produces no readable cracks and silence itself is the answer. It is useful for concise, ancestral-style answers; I Ching is better for layered change over time.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "How does the I Ching actually work and produce its answers?",
    answer:
      "The I Ching works through 64 hexagrams that form an ancient catalog of patterns of change in nature and human life. Each hexagram is a structured figure with classical meaning preserved in the Wilhelm/Baynes texts. Each consultation begins from your specific question. The mathematical algorithm casts the lines under the rules of Zhu Xi to determine the present hexagram, any moving lines, and the resulting future hexagram. The AI then articulates that already-formed result in your language, applying the classical meaning of those hexagrams to your particular context. That is why every reading is unique and personal: the same hexagrams can appear for different people, but the answer is never the same, because it depends on the specific question, the moment in life, and the personal context of the seeker. There is no universal interpretation that applies to more than one person at the same time.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "Why can I sometimes not “deepen” further in the same chat?",
    answer:
      "Each chat thread allows a limited chain of readings depending on your plan. When the cap is reached, start a new session for a fresh thread. The guide covers Chats, new session, and plan limits.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "Where are my past conversations?",
    answer:
      "Open Chats from the header to browse saved threads, switch between them, or start a new session. Authenticated history is tied to your account as described in the guide and privacy policy.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "Can I export a reading?",
    answer:
      "Yes, after a consultation you can export the thread as a PDF from the reading card actions where available. Details are in the user guide.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "What data do you store about me and my readings?",
    answer:
      "The privacy policy explains categories of data, retention, and how readings and images stay private to your account. It complements (and does not replace) the in-app guide.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "Where can I find billing information and service terms?",
    answer:
      "Commercial terms and acceptable use are in the Terms of Service. Token packs and checkout flows are summarized in the guide and pricing pages.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "What is the Library and how do I unlock it?",
    answer:
      "The Library is a premium section containing the complete collection of 64 hexagrams across three literary works: the classic Wilhelm/Baynes translation, the James Legge version, and the original Zhou Yi. It is designed for personal study and to compare your manual casts with authentic sources. It is permanently unlocked by purchasing any paid token pack.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "Is two-factor authentication available?",
    answer:
      "Optional 2FA (authenticator and/or email codes) can be enabled from account security in the oracle. The guide summarizes how it interacts with consultations.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "Is this professional advice?",
    answer:
      "No. Interpretations are cultural and reflective tools, not medical, financial, or other professional advice. See the method notes for context and the terms for disclaimers.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "Who generates the hexagram or verdict: the AI or the algorithm?",
    answer:
      "The mathematical algorithm, not the AI. In I Ching mode, the algorithm builds the hexagram and determines the governing line. In Oracle Bones mode, it generates the crack pattern and verdict. Artificial intelligence intervenes afterwards: it takes that already-calculated result and articulates it in natural language in your language, with the context of your question. The AI is the interpreter. The oracle is the method.",
  },
  {
    id: "authentic-texts",
    question: "Are the I Ching texts that appear in the reading authentic or AI-generated?",
    answer:
      "They are authentic. The Judgment (卦辞), the lines in motion (爻辞), and the resulting hexagrams come entirely from the Wilhelm/Baynes translation (public domain since 2020). The AI cites and contextualises them with your question, but does not modify or replace them. You can compare any text with the original book.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "What does Silence mean in Oracle Bones mode?",
    answer:
      "Silence (沉默) is the fifth possible verdict state in Oracle Bones mode, and it is faithful to the ancestral Shang method. In the original tradition, when the bone produced no legible cracks, it was not an error; it was an answer in itself: the ancestors do not speak because the moment is not ripe for that question, or because the answer transcends what can be said. This app respects that state and returns it when the pattern indicates.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "Does the app work in my language?",
    answer:
      "Yes. The app is available in 11 languages: Spanish, English, Portuguese, French, German, Italian, Japanese, Chinese, Korean, Arabic, and Hindi. The AI responds in the language in which you write your question, with no configuration required. If you ask in French, the oracle responds in French. If you ask in Arabic, it responds in Arabic.",
  },
  {
    id: "privacy-consultations",
    question: "Are my consultations private?",
    answer:
      "Yes. Your questions and readings are yours. They are not shared with third parties, not used to train AI models, and are not visible to other users. Only you can see your chat history. You can delete any conversation at any time from the Chats section. If you enable two-factor authentication (2FA) available in Options, you add an extra layer of protection to your account.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "How long can my question to the oracle be?",
    answer:
      "Each consultation allows up to 1500 characters (about 250-300 words). We recommend taking advantage of this space to describe your situation in detail; the more context you provide about your current moment and feelings, the deeper and more accurate the interpretation the system generates from the resulting hexagram will be.",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_ES: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "¿Cómo funcionan los tokens, los packs y el plan gratuito?",
    answer:
      "Cada consulta consume tokens según tu pack activo. La guía explica el saldo de prueba, los tamaños de pack y cómo se acumula el saldo con tu cuenta. Las compras y renovaciones se rigen por los Términos del servicio.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "¿Qué tan fiables son los textos del I Ching en la aplicación?",
    answer:
      "Los textos son de máxima fiabilidad. Hemos realizado una auditoría de integridad de datos 1:1, contrastando cada hexagrama con fuentes académicas como la Universidad de Parma (versión Wilhelm), Sacred-Texts.com (Legge) y el Chinese Text Project (Zhou Yi). Cualquier error de transcripción detectado en los datasets fuente originales ha sido corregido manualmente para garantizar la exactitud matemática y literaria.",
  },
  {
    id: "yarrow-vs-coins",
    question: "¿En qué se diferencian los dos métodos del I Ching: Tres Monedas y Varillas?",
    answer:
      "Ambos métodos producen los mismos 64 hexagramas y usan los mismos textos del I Ching y las reglas de Zhu Xi. Tres Monedas es rápido y accesible: lanzas tres monedas seis veces para formar las seis líneas. Varillas de Milenrama es el método ritual más antiguo: trabajas con varillas u objetos similares mediante un procedimiento más lento y contemplativo. La elección cambia la experiencia ritual, no la autoridad de la lectura. Usa Tres Monedas para rapidez; usa Varillas cuando quieras el ritmo tradicional.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "¿Qué es el I Ching automático frente al manual, y puedo mezclar Huesos en el mismo hilo?",
    answer:
      "Lo automático frente a manual solo aplica al I Ching (Tres Monedas o Varillas de Milenrama). En Opciones los controles de modo de tirada aparecen cuando I Ching está seleccionado: elige Tres Monedas o Varillas de Milenrama, luego automático (la tirada se ejecuta en el servidor) o manual (introduces los seis totales de línea 6/7/8/9 con tus propias monedas o varillas). El modo Huesos es siempre automático; no hay flujo manual de huesos; el ritual y el veredicto salen solo del algoritmo. Dentro del tope de profundidad por hilo de tu plan, puedes alternar libremente I Ching y Huesos y cambiar métodos y modos entre consultas; la app guarda tus preferencias para la próxima lectura en I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "¿Qué es el método de Huesos de Oráculo?",
    answer:
      "Huesos de Oráculo es un método de adivinación de la era Shang inspirado en la lectura de grietas sobre plastrones de tortuga y escápulas de buey. En la app está separado del I Ching: no crea hexagramas ni líneas cambiantes. El sistema forma primero un patrón de grietas y un veredicto; después la IA interpreta ese resultado ya formado en tu idioma. El veredicto cae siempre en uno de cinco estados posibles, fieles al método ancestral Shang: 1) 吉, favorable claro: el patrón confirma la carga positiva sin ambigüedad; 2) 吉 moderado, favorable moderado: hay confirmación pero con matices o condiciones; 3) 凶 moderado, desfavorable moderado: el patrón se inclina a la negación con reservas; 4) 凶, desfavorable claro: el patrón niega la carga positiva sin ambigüedad; 5) 沉默, el Silencio: el patrón no produce grietas legibles y el propio silencio es la respuesta. Es útil para respuestas concisas, de tono ancestral; el I Ching es mejor para cambios por capas a lo largo del tiempo.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "¿Cómo opera el I Ching y de dónde salen sus respuestas?",
    answer:
      "El I Ching opera a través de 64 hexagramas que forman un catálogo milenario de patrones de cambio en la naturaleza y en la vida humana. Cada hexagrama es una figura estructurada con un significado clásico preservado en los textos Wilhelm/Baynes. Cada consulta parte de tu pregunta concreta. El algoritmo matemático lanza las líneas bajo las reglas de Zhu Xi para determinar el hexagrama presente, las líneas en movimiento si las hay y el hexagrama futuro resultante. Después la IA articula ese resultado ya formado en tu idioma, aplicando el significado clásico de esos hexagramas a tu contexto particular. Por eso cada lectura es única y personal: los mismos hexagramas pueden aparecer para distintas personas, pero la respuesta no es la misma, porque depende de la pregunta concreta, del momento vital y del contexto personal del consultante. No existe una interpretación universal aplicable a más de una persona a la vez.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "¿Por qué a veces no puedo “profundizar” más en el mismo chat?",
    answer:
      "Cada hilo admite un número limitado de lecturas encadenadas según tu plan. Al llegar al tope, abre una nueva sesión. La guía explica Chats, nueva sesión y límites por plan.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "¿Dónde están mis conversaciones anteriores?",
    answer:
      "Abre «Chats» en la cabecera para listar hilos guardados, cambiar de conversación o iniciar una sesión nueva. El historial autenticado va ligado a tu cuenta, como se indica en la guía y en la política de privacidad.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "¿Puedo exportar una lectura?",
    answer:
      "Sí: tras una consulta puedes exportar el hilo a PDF desde las acciones de la lectura cuando esté disponible. Más detalle en la guía de uso.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "¿Qué datos guardáis sobre mí y mis lecturas?",
    answer:
      "La política de privacidad describe categorías de datos, conservación y cómo lecturas e imágenes permanecen privadas por usuario. Complementa la guía dentro de la app.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "¿Dónde encuentro información sobre facturación y condiciones del servicio?",
    answer:
      "Las condiciones comerciales y el uso aceptable están en los Términos del servicio. Los packs de tokens y el flujo de compra se resumen en la guía y en la página de precios.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "¿Qué es la Biblioteca y cómo se desbloquea?",
    answer:
      "La Biblioteca es una sección premium que contiene la colección completa de los 64 hexagramas en tres obras literarias: la traducción clásica de Wilhelm/Baynes, la versión de James Legge y el Zhou Yi original. Está diseñada para el estudio personal y para contrastar tus tiradas manuales con fuentes auténticas. Se desbloquea de forma permanente al adquirir cualquier pack de tokens de pago.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "¿Hay autenticación en dos pasos (2FA)?",
    answer:
      "Sí, opcional: puedes activar 2FA (authenticator y/o email) desde la seguridad de la cuenta en el oráculo. La guía resume cómo encaja con las consultas.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "¿Esto es asesoramiento profesional?",
    answer:
      "No. Las interpretaciones son ayuda cultural y reflexiva, no consejo médico, financiero ni otro asesoramiento profesional. Las notas de métodos dan contexto; los términos incluyen descargos de responsabilidad.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "¿Quién genera el hexagrama o el veredicto: la IA o el algoritmo?",
    answer:
      "El algoritmo matemático, no la IA. En el modo I Ching, el algoritmo construye el hexagrama línea por línea y determina la línea regente. En el modo Huesos, genera el patrón de grietas y el veredicto. La inteligencia artificial interviene después: toma ese resultado ya calculado y lo articula en lenguaje natural en tu idioma, con el contexto de tu pregunta. La IA es el intérprete. El oráculo es el método.",
  },
  {
    id: "authentic-texts",
    question: "¿Los textos del I Ching que aparecen en la lectura son auténticos o generados por IA?",
    answer:
      "Son auténticos. Los textos del Juicio (卦辞), las sentencias de las líneas en movimiento (爻辞) y los hexagramas resultantes provienen íntegramente de la traducción Wilhelm/Baynes (dominio público desde 2020). La IA los cita y los contextualiza con tu pregunta, pero no los modifica ni los reemplaza. Puedes contrastar cualquier texto con el libro original.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "¿Qué significa el Silencio en el modo Huesos?",
    answer:
      "El Silencio (沉默) es el quinto estado posible del veredicto en el modo Huesos, y es fiel al método ancestral Shang. En la tradición original, cuando el hueso no producía grietas legibles, no era un error; era una respuesta en sí misma: los ancestros no hablan porque el momento no está maduro para esa pregunta, o porque la respuesta trasciende lo que puede ser dicho. Esta app respeta ese estado y lo devuelve cuando el patrón lo indica.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "¿La app funciona en mi idioma?",
    answer:
      "Sí. La app está disponible en 11 idiomas: español, inglés, portugués, francés, alemán, italiano, japonés, chino, coreano, árabe e hindi. La IA responde en el idioma en que escribes tu pregunta, sin necesidad de configurar nada. Si preguntas en francés, el oráculo responde en francés. Si preguntas en árabe, responde en árabe.",
  },
  {
    id: "privacy-consultations",
    question: "¿Mis consultas son privadas?",
    answer:
      "Sí. Tus preguntas y lecturas son tuyas. No se comparten con terceros, no se usan para entrenar modelos de IA, y no son visibles para otros usuarios. Solo tú puedes ver tu historial de chats. Puedes eliminar cualquier conversación en cualquier momento desde la sección Chats. Si activas la autenticación en dos pasos (2FA) disponible en Opciones, añades una capa adicional de protección a tu cuenta.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "¿Qué tan larga puede ser mi pregunta al oráculo?",
    answer:
      "Cada consulta permite hasta 1500 caracteres (unas 250-300 palabras). Te recomendamos aprovechar este espacio para describir tu situación con detalle; cuanto más contexto proporciones sobre tu momento actual y tus sentimientos, más profunda y precisa será la interpretación que el sistema genere a partir del hexagrama obtenido.",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_AR: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "كيف تعمل الرموز والباقات والطبقة المجانية؟",
    answer:
      "تستهلك كل استشارة رموزًا وفق باقتك النشطة. يوضح الدليل رصيد التجربة المجانية، أحجام الباقات، وكيف يتراكم الرصيد مع حسابك. تخضع المشتريات والتجديدات لشروط الخدمة.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "ما مدى موثوقية نصوص الآي تشينغ في التطبيق؟",
    answer: "النصوص موثوقة للغاية. لقد أجرينا تدقيقاً لسلامة البيانات بنسبة 1:1، مع التحقق من كل سداسي مقابل المصادر الأكاديمية مثل جامعة بارما (ترجمة فيلهلم)، وSacred-Texts.com (ليج)، ومشروع النصوص الصينية (تشو يي). تم تصحيح أي أخطاء في النسخ وجدت في مجموعات البيانات الأصلية يدوياً لضمان الدقة الرياضية والأدبية。",
  },
  {
    id: "yarrow-vs-coins",
    question: "ما الفرق بين طريقتي الآي تشينغ: العملات الثلاث وسيقان اليارو؟",
    answer:
      "كلتا الطريقتين تنتجان السداسيات الأربع والستين نفسها وتستخدمان نصوص الآي تشينغ نفسها وقواعد تشو شي. العملات الثلاث طريقة سريعة ومباشرة: ترمي ثلاث عملات ست مرات لبناء الخطوط الستة. سيقان اليارو هي الطقس الأقدم: تعمل بسيقان أو أشياء مشابهة عبر إجراء أبطأ وأكثر تأملا. الاختيار يغير التجربة الطقسية، لا سلطة القراءة. استخدم العملات الثلاث للسرعة، واستخدم سيقان اليارو عندما تريد الإيقاع التقليدي.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "ما الفرق بين I Ching التلقائي واليدوي، وهل يمكن خلط العظام في نفس الخيط؟",
    answer:
      "التلقائي مقابل اليدوي ينطبق فقط على I Ching (الأسكة الثلاث أو عيدان الزنبق). في الخيارات تظهر أدوات وضع القَسْم عند اختيار I Ching: اختر الأسكة الثلاث أو عيدان الزنبق، ثم تلقائي (تُنفَّذ القرعة على الخادم) أو يدوي (تُدخل مجموع الخطوط الستة 6/7/8/9 من عملاتك أو عيدانك). وضع العظام دائمًا تلقائي؛ لا يوجد مسار يدوي للعظام؛ الطقس والحكم يأتيان من الخوارزمية فقط. ضمن حد عمق الخيط في خطتك، يمكنك التناوب بحرية بين I Ching والعظام وتبديل الطرق والأوضاع بين الاستشارات؛ يحفظ التطبيق تفضيلاتك للقراءة التالية في I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "ما هي طريقة عظام العرافة؟",
    answer:
      "عظام العرافة طريقة من عصر شانغ مستوحاة من قراءة الشقوق على دروع السلاحف وكتف الثور. في التطبيق هي منفصلة عن الآي تشينغ: لا تنشئ سداسيات ولا خطوطا متغيرة. يكوّن النظام أولا نمط الشقوق والحكم، ثم تفسر الذكاء الاصطناعي النتيجة الموجودة بالفعل بلغتك. يندرج الحكم دائما في إحدى خمس حالات ممكنة، وفية للمنهج الشانغي الأصيل: 1) 吉، مؤاتٍ واضح: يؤكد النمط الشحنة الإيجابية دون لبس؛ 2) 吉 معتدل، مؤاتٍ نسبي: ثمة تأكيد ولكن مع تحفظات أو شروط؛ 3) 凶 معتدل، غير مؤاتٍ نسبي: يميل النمط إلى النفي مع تحفظات؛ 4) 凶، غير مؤاتٍ واضح: ينفي النمط الشحنة الإيجابية دون لبس؛ 5) 沉默، الصمت: لا يُنتج النمط شقوقا قابلة للقراءة، والصمت ذاته هو الإجابة. إنها مناسبة للإجابات المختصرة ذات الطابع الأسلافي؛ أما الآي تشينغ فهو أفضل لفهم التحول المتدرج عبر الزمن.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "كيف يعمل الآي تشينغ ومن أين تأتي إجاباته؟",
    answer:
      "يعمل الآي تشينغ عبر 64 سداسيا تشكّل فهرسا قديما لأنماط التغيّر في الطبيعة وفي حياة الإنسان. كل سداسي شكل منظم له معنى كلاسيكي محفوظ في نصوص Wilhelm/Baynes. تنطلق كل استشارة من سؤالك الملموس. تطبّق الخوارزمية الرياضية قواعد Zhu Xi على رميات الخطوط لتحديد السداسي الحالي، والخطوط المتحركة إن وُجدت، والسداسي المقبل الناتج. ثم يقوم الذكاء الاصطناعي بصياغة هذه النتيجة الموجودة بالفعل في لغتك، تاركًا للمعنى الكلاسيكي لتلك السداسيات أن يُسقط على سياقك الشخصي. لهذا تكون كل قراءة فريدة وشخصية: قد تظهر السداسيات نفسها لأشخاص مختلفين، ومع ذلك لن تكون الإجابة نفسها، لأنها تتعلق بالسؤال المحدد، وبلحظة الحياة، وبالسياق الشخصي للمستشير. لا توجد قراءة واحدة قابلة للتطبيق على أكثر من شخص في الوقت نفسه.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "لماذا لا أستطيع أحيانًا «التعمّق» أكثر في نفس المحادثة؟",
    answer:
      "يسمح كل خيط بعدد محدود من القراءات المتسلسلة حسب خطتك. عند بلوغ الحد، ابدأ جلسة جديدة. يشرح الدليل المحادثات والجلسة الجديدة وحدود كل خطة.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "أين أجد محادثاتي السابقة؟",
    answer:
      "افتح «المحادثات» من الترويسة لاستعراض الخيوط المحفوظة، والتنقل بينها، أو بدء جلسة جديدة. يرتبط السجل الموثّق بحسابك كما هو موضح في الدليل وسياسة الخصوصية.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "هل يمكنني تصدير قراءة؟",
    answer:
      "نعم. بعد الاستشارة يمكنك تصدير الخيط إلى PDF من إجراءات بطاقة القراءة عندما تكون متاحة. التفاصيل في دليل المستخدم.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "ما البيانات التي تخزّنونها عني وعن قراءاتي؟",
    answer:
      "تشرح سياسة الخصوصية فئات البيانات وفترات الاحتفاظ وكيف تبقى القراءات والصور خاصة بحسابك. وهي مكمّلة لما يوضحه الدليل داخل التطبيق.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "أين أجد معلومات الفوترة وشروط الخدمة؟",
    answer:
      "الشروط التجارية والاستخدام المقبول موجودة في شروط الخدمة. كما تُلخّص صفحة الباقات والأسعار آلية الشراء والدفع.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "ما هي المكتبة وكيف يمكنني فتحها؟",
    answer:
      "المكتبة هي قسم متميز يحتوي على المجموعة الكاملة المكونة من 64 هكساغراماً عبر ثلاثة أعمال أدبية: ترجمة فيلهلم/باينズ الكلاسيكية، ونسخة جيمس ليغ، وجو يي الأصلي. تم تصميمها للدراسة الشخصية ولمقارنة قراءاتك اليدوية مع المصادر الموثوقة. يتم فتحها بشكل دائم عند شراء أي حزمة رموز مدفوعة.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "هل تتوفر المصادقة الثنائية (2FA)؟",
    answer:
      "نعم، بشكل اختياري. يمكنك تفعيل 2FA (تطبيق المصادقة و/أو رمز البريد الإلكتروني) من أمان الحساب داخل الأوراكل.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "هل هذه نصيحة مهنية؟",
    answer:
      "لا. التفسيرات أدوات ثقافية وتأملية وليست نصيحة طبية أو مالية أو مهنية. راجع ملاحظات المنهج للسياق، وشروط الخدمة لإخلاءات المسؤولية.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "من يولّد الهكساجرام أو الحكم, الذكاء الاصطناعي أم الخوارزمية؟",
    answer:
      "الخوارزمية الرياضية، لا الذكاء الاصطناعي. في وضع I Ching، تبني الخوارزمية الهكساجرام وتحدد السطر الحاكم. في وضع العظام، تولّد نمط الشقوق وتحدد الحكم. يتدخل الذكاء الاصطناعي بعد ذلك: يأخذ هذه النتيجة المحسوبة مسبقًا ويصوغها بلغة طبيعية بلغتك مع سياق سؤالك. الذكاء الاصطناعي هو المفسِّر، والتنبؤ هو المنهج.",
  },
  {
    id: "authentic-texts",
    question: "هل نصوص I Ching التي تظهر في القراءة أصيلة أم يولّدها الذكاء الاصطناعي؟",
    answer:
      "إنها أصيلة. نصوص الحكم (卦辞)، وعبارات الخطوط المتحركة (爻辞)، والهكساجرامات الناتجة مستقاة كلها من ترجمة Wilhelm/Baynes (في الملك العام منذ عام 2020). يستشهد بها الذكاء الاصطناعي ويضعها في سياق سؤالك، لكنه لا يعدلها ولا يستبدلها. يمكنك مقارنة أي نص مع الكتاب الأصلي.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "ماذا يعني الصمت في وضع عظام الكهانة؟",
    answer:
      "الصمت (沉默) هو خامس حالة حكم ممكنة في وضع العظام، وهو وفي للمنهج الأسلافي الشانغي. في التقليد الأصلي، حين لا يُنتج العظم شقوقًا قابلة للقراءة، لم يكن ذلك خطأً؛ بل كان إجابةً في حد ذاتها: لا يتكلم الأسلاف لأن اللحظة لم تنضج بعد لهذا السؤال، أو لأن الإجابة تتجاوز ما يمكن قوله. يحترم هذا التطبيق تلك الحالة ويُعيدها حين يدل عليها النمط.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "هل يعمل التطبيق بلغتي؟",
    answer:
      "نعم. يتوفر التطبيق بـ 11 لغة: الإسبانية، والإنجليزية، والبرتغالية، والفرنسية، والألمانية، والإيطالية، واليابانية، والصينية، والكورية، والعربية، والهندية. يردّ الذكاء الاصطناعي باللغة التي تكتب بها سؤالك دون أي إعداد. إن سألت بالفرنسية، أجاب الأوراكل بالفرنسية. وإن سألت بالعربية، أجاب بالعربية.",
  },
  {
    id: "privacy-consultations",
    question: "هل استشاراتي خاصة؟",
    answer:
      "نعم. أسئلتك وقراءاتك ملكك. لا تُشارَك مع أطراف ثالثة، ولا تُستخدم لتدريب نماذج الذكاء الاصطناعي، ولا يمكن للمستخدمين الآخرين رؤيتها. أنت وحدك من يستطيع الاطلاع على سجل محادثاتك. يمكنك حذف أي محادثة في أي وقت من قسم المحادثات. إذا فعّلت المصادقة الثنائية (2FA) المتوفرة في الخيارات، أضفت طبقة حماية إضافية لحسابك.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "ما مدى طول سؤالي للأوراكل؟",
    answer:
      "تسمح كل استشارة بما يصل إلى 1500 حرف (حوالي 250-300 كلمة). نوصي بالاستفادة من هذه المساحة لوصف موقفك بالتفصيل؛ فكلما زاد السياق الذي تقدمه حول لحظتك الحالية ومشاعرك، كان التفسير الذي يولده النظام من السداسية الناتجة أعمق وأكثر دقة.",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_HI: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "टोकन, पैक और फ्री टियर कैसे काम करते हैं?",
    answer:
      "हर परामर्श आपके सक्रिय पैक के अनुसार टोकन खर्च करता है। गाइड में फ्री ट्रायल बैलेंस, पैक साइज़ और बैलेंस कैसे जुड़ता है, यह समझाया गया है। खरीद और नवीनीकरण सेवा शर्तों के अधीन हैं।",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "ऐप में दिए गए आई चिंग ग्रंथों की विश्वसनीयता क्या है?",
    answer: "ग्रंथ अत्यंत विश्वसनीय हैं। हमने परमा विश्वविद्यालय (विल्हेम अनुवाद), Sacred-Texts.com (लेग), और चीनी पाठ परियोजना (झोउ यी) जैसे शैक्षणिक स्रोतों के साथ प्रत्येक हेक्साग्राम का मिलान करते हुए 1:1 डेटा अखंडता ऑडिट किया है। मूल स्रोत डेटासेट में मिली किसी भी प्रतिलेखन त्रुटि को गणितीय और साहित्यिक सटीकता सुनिश्चित करने के लिए मैन्युअल रूप से ठीक किया गया है।",
  },
  {
    id: "yarrow-vs-coins",
    question: "I Ching की दो विधियों, तीन सिक्के और यारो डंठल, में क्या अंतर है?",
    answer:
      "दोनों विधियाँ वही 64 हेक्साग्राम बनाती हैं और I Ching के वही पाठ तथा Zhu Xi के नियम उपयोग करती हैं। तीन सिक्के तेज और सरल है: छह रेखाएँ बनाने के लिए तीन सिक्के छह बार फेंके जाते हैं। यारो डंठल पुरानी अनुष्ठानिक विधि है: गिने हुए डंठलों या समान वस्तुओं के साथ धीमी और अधिक ध्यानपूर्ण प्रक्रिया की जाती है। चुनाव पढ़ाई की प्रामाणिकता नहीं, बल्कि अनुष्ठान का अनुभव बदलता है। गति चाहिए तो तीन सिक्के; पारंपरिक लय चाहिए तो यारो डंठल।",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "I Ching में स्वचालित बनाम मैन्युअल क्या है, और क्या मैं एक ही थ्रेड में Oracle Bones मिला सकता/सकती हूँ?",
    answer:
      "स्वचालित बनाम मैन्युअल केवल I Ching (तीन सिक्के या यारो की छड़ें) पर लागू होता है। विकल्पों में कास्ट-मोड नियंत्रण तभी दिखते हैं जब I Ching चुना हो: तीन सिक्के या यारो की छड़ें चुनें, फिर स्वचालित (सर्वर पर कास्ट होता है) या मैन्युअल (अपने सिक्कों या छड़ों से छह पंक्ति योग 6/7/8/9 दर्ज करें)। Oracle Bones मोड हमेशा स्वचालित है; कोई मैन्युअल हड्डी प्रवाह नहीं; अनुष्ठान और निर्णय केवल एल्गोरिदम से आते हैं। आपकी योजना की प्रति-थ्रेड गहराई सीमा के भीतर, आप I Ching और Oracle Bones को स्वतंत्र रूप से बदल सकते हैं और परामर्शों के बीच विधियाँ और मोड स्विच कर सकते हैं; आपकी पसंद अगली I Ching पठन के लिए याद रखी जाती है।",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Oracle Bones विधि क्या है?",
    answer:
      "Oracle Bones शांग युग की दिव्य विधि है, जो कछुए के कवच और बैल की कंधे की हड्डी पर दरारें पढ़ने से प्रेरित है। ऐप में यह I Ching से अलग है: यह हेक्साग्राम या बदलती रेखाएँ नहीं बनाती। प्रणाली पहले दरारों का पैटर्न और निर्णय बनाती है; फिर AI उस पहले से बने परिणाम की आपकी भाषा में व्याख्या करता है। निर्णय हमेशा शांग पूर्वज परंपरा के अनुरूप पाँच संभावित अवस्थाओं में से एक में आता है: 1) 吉: स्पष्ट रूप से शुभ: पैटर्न बिना संदेह सकारात्मक प्रस्ताव की पुष्टि करता है; 2) 吉 मध्यम: मध्यम रूप से शुभ: पुष्टि होती है पर बारीकियों या शर्तों के साथ; 3) 凶 मध्यम: मध्यम रूप से अशुभ: पैटर्न आरक्षणों के साथ नकार की ओर झुकता है; 4) 凶: स्पष्ट रूप से अशुभ: पैटर्न बिना संदेह सकारात्मक प्रस्ताव को नकारता है; 5) 沉默: मौन: पैटर्न पठनीय दरारें नहीं देता और मौन स्वयं उत्तर है। यह संक्षिप्त, पूर्वजों जैसी शैली के उत्तरों के लिए उपयोगी है; समय के साथ परतदार बदलाव समझने के लिए I Ching बेहतर है।",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "I Ching वास्तव में कैसे काम करता है और उत्तर कैसे देता है?",
    answer:
      "I Ching 64 हेक्साग्रामों के माध्यम से कार्य करता है, जो प्रकृति और मानव जीवन में परिवर्तन के पैटर्नों का प्राचीन सूचीपत्र हैं। हर हेक्साग्राम एक संरचित आकृति है, जिसका शास्त्रीय अर्थ Wilhelm/Baynes ग्रंथों में सुरक्षित है। हर परामर्श आपके विशिष्ट प्रश्न से शुरू होता है। गणितीय एल्गोरिदम Zhu Xi के नियमों के तहत रेखाएँ डालकर वर्तमान हेक्साग्राम, यदि कोई हो तो गतिशील रेखाएँ और परिणामी भविष्य हेक्साग्राम तय करता है। इसके बाद AI उस पहले से बने परिणाम को आपकी भाषा में अभिव्यक्त करता है, उन हेक्साग्रामों के शास्त्रीय अर्थ को आपके विशिष्ट संदर्भ पर लागू करते हुए। इसीलिए हर पठन अद्वितीय और व्यक्तिगत होता है: वही हेक्साग्राम अलग-अलग लोगों के लिए आ सकते हैं, फिर भी उत्तर एक जैसा कभी नहीं होता, क्योंकि यह विशिष्ट प्रश्न, जीवन के क्षण और परामर्शक के व्यक्तिगत संदर्भ पर निर्भर करता है। एक से अधिक व्यक्ति पर एक साथ लागू होने वाली कोई सार्वभौमिक व्याख्या नहीं होती।",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "कभी-कभी मैं उसी चैट में आगे “deepen” क्यों नहीं कर पाता/पाती?",
    answer:
      "आपकी योजना के अनुसार हर थ्रेड में सीमित संख्या में रीडिंग की श्रृंखला मिलती है। सीमा पूरी होने पर नई सेशन शुरू करें।",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "मेरी पिछली बातचीत कहाँ मिलती है?",
    answer:
      "हेडर में “Chats” खोलकर आप सेव किए गए थ्रेड देख सकते हैं, उनमें स्विच कर सकते हैं या नई सेशन शुरू कर सकते हैं। प्रमाणित इतिहास आपके खाते से जुड़ा रहता है।",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "क्या मैं रीडिंग एक्सपोर्ट कर सकता/सकती हूँ?",
    answer:
      "हाँ। परामर्श के बाद जहाँ उपलब्ध हो, रीडिंग कार्ड की क्रियाओं से थ्रेड को PDF में एक्सपोर्ट किया जा सकता है।",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "मेरे और मेरी रीडिंग्स के बारे में आप कौन-सा डेटा रखते हैं?",
    answer:
      "गोपनीयता नीति डेटा श्रेणियाँ, संग्रह अवधि और यह बताती है कि रीडिंग्स व इमेजेस आपके खाते तक निजी रहती हैं।",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "रिफंड, बिलिंग और सेवा शर्तें कहाँ हैं?",
    answer:
      "वाणिज्यिक शर्तें और स्वीकार्य उपयोग सेवा शर्तों में हैं। टोकन पैक और चेकआउट प्रवाह गाइड व प्राइसिंग पेज में सारांशित हैं।",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "पुस्तकालय क्या है और मैं इसे कैसे अनलॉक करूं?",
    answer:
      "पुस्तकालय एक प्रीमियम अनुभाग है जिसमें तीन साहित्यिक कृतियों: विल्हेल्म/बेंस का शास्त्रीय अनुवाद, जेम्स लेग संस्करण, और मूल झोउ यी में 64 हेक्साग्राम का पूरा संग्रह है। यह व्यक्तिगत अध्ययन और आपके मैन्युअल कास्ट की प्रामाणिक स्रोतों के साथ तुलना करने के लिए डिज़ाइन किया गया है। यह किसी भी सशुल्क टोकन पैक को खरीदने पर स्थायी रूप से अनलॉक हो जाता है।",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "क्या दो-कारक प्रमाणीकरण (2FA) उपलब्ध है?",
    answer:
      "हाँ, वैकल्पिक रूप से। आप खाता सुरक्षा से 2FA (Authenticator और/या ईमेल कोड) सक्षम कर सकते हैं।",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "क्या यह पेशेवर सलाह है?",
    answer:
      "नहीं। ये व्याख्याएँ सांस्कृतिक और चिंतनात्मक सहायता हैं, न कि चिकित्सा, वित्तीय या अन्य पेशेवर सलाह।",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "हेक्साग्राम या निर्णय कौन उत्पन्न करता है: AI या एल्गोरिदम?",
    answer:
      "गणितीय एल्गोरिदम, AI नहीं। I Ching मोड में, एल्गोरिदम हेक्साग्राम बनाता है और शासक रेखा निर्धारित करता है। Oracle Bones मोड में, दरार पैटर्न उत्पन्न करता है और निर्णय देता है। कृत्रिम बुद्धिमत्ता बाद में हस्तक्षेप करती है: वह पहले से गणना किए गए उस परिणाम को लेती है और आपके प्रश्न के संदर्भ के साथ आपकी भाषा में स्वाभाविक भाषा में व्यक्त करती है। AI व्याख्याता है। ओरेकल विधि है।",
  },
  {
    id: "authentic-texts",
    question: "पठन में दिखाई देने वाले I Ching के पाठ प्रामाणिक हैं या AI द्वारा उत्पन्न?",
    answer:
      "वे प्रामाणिक हैं। निर्णय (卦辞), चलती रेखाओं की उक्तियाँ (爻辞), और परिणामी हेक्साग्राम पूरी तरह Wilhelm/Baynes अनुवाद (2020 से सार्वजनिक डोमेन) से आते हैं। AI उन्हें आपके प्रश्न के साथ उद्धृत और संदर्भित करता है, लेकिन संशोधित या प्रतिस्थापित नहीं करता। आप किसी भी पाठ की मूल पुस्तक से तुलना कर सकते हैं।",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Oracle Bones मोड में मौन (Silence) का क्या अर्थ है?",
    answer:
      "मौन (沉默) Oracle Bones मोड में पाँचवाँ संभावित निर्णय स्थिति है, और यह पूर्वज शांग पद्धति के प्रति सच्चा है। मूल परंपरा में, जब हड्डी पढ़ने योग्य दरारें नहीं देती थी, तो यह कोई त्रुटि नहीं थी; यह अपने आप में एक उत्तर था: पूर्वज नहीं बोलते क्योंकि उस प्रश्न के लिए समय अभी परिपक्व नहीं है, या क्योंकि उत्तर जो कहा जा सकता है उससे परे है। यह app उस स्थिति का सम्मान करती है और जब पैटर्न इंगित करता है तब इसे लौटाती है।",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "क्या यह app मेरी भाषा में काम करती है?",
    answer:
      "हाँ। यह app 11 भाषाओं में उपलब्ध है: स्पेनिश, अंग्रेज़ी, पुर्तगाली, फ्रेंच, जर्मन, इतालवी, जापानी, चीनी, कोरियाई, अरबी और हिंदी। AI आपकी प्रश्न की भाषा में उत्तर देता है, बिना किसी कॉन्फ़िगरेशन की आवश्यकता के। यदि आप फ्रेंच में पूछते हैं, तो ओरेकल फ्रेंच में उत्तर देता है। यदि आप अरबी में पूछते हैं, तो अरबी में उत्तर देता है।",
  },
  {
    id: "privacy-consultations",
    question: "क्या मेरी परामर्श निजी हैं?",
    answer:
      "हाँ। आपके प्रश्न और पठन आपके हैं। इन्हें तृतीय पक्षों के साथ साझा नहीं किया जाता, AI मॉडल प्रशिक्षण के लिए उपयोग नहीं किया जाता, और अन्य उपयोगकर्ताओं को दिखाई नहीं देते। केवल आप अपना चैट इतिहास देख सकते हैं। आप Chats अनुभाग से किसी भी समय कोई भी वार्तालाप हटा सकते हैं। यदि आप विकल्पों में उपलब्ध दो-कारक प्रमाणीकरण (2FA) सक्षम करते हैं, तो आप अपने खाते में सुरक्षा की एक अतिरिक्त परत जोड़ते हैं।",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "ओरेकल से मेरा प्रश्न कितना लंबा हो सकता है?",
    answer:
      "प्रत्येक परामर्श 1500 वर्णों (लगभग 250-300 शब्दों) तक की अनुमति देता है। हम आपकी स्थिति का विस्तार से वर्णन करने के लिए इस स्थान का लाभ उठाने की सलाह देते हैं; आप अपने वर्तमान क्षण और भावनाओं के बारे में जितना अधिक संदर्भ प्रदान करेंगे, प्राप्त हेक्사ग्राम से सिस्टम जो व्याख्या उत्पन्न करेगा वह उतनी ही गहरी और सटीक होगी।",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_JA: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "トークン、パック、無料プランはどのように機能しますか？",
    answer:
      "各相談はアクティブなパックに応じてトークンを消費します。ガイドでは無料トライアル残高、パックのサイズ、残高の積み重ね方を説明しています。購入と更新は利用規約に基づきます。",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "アプリで提供される易経のテキストの信頼性はどの程度ですか？",
    answer: "テキストの信頼性は極めて高いです。パルマ大学（ヴィルヘルム訳）、Sacred-Texts.com（レッグ訳）、Chinese Text Project（周易）などの学術的ソースと1対1のデータ整合性監査を実施しました。元のソースデータセットに見つかった転記ミスはすべて手動で修正され、数学的および文学的な正確さが保証されています。",
  },
  {
    id: "yarrow-vs-coins",
    question: "易経の二つの方法、三枚硬貨と筮竹はどう違いますか？",
    answer:
      "どちらの方法も同じ64卦を生み、同じ易経本文と朱熹の規則を用います。三枚硬貨は速く扱いやすい方法で、三枚の硬貨を六回投げて六爻を作ります。筮竹はより古い儀礼的な方法で、筮竹または同様の物を数えながら、よりゆっくりと思索的に進めます。違いは占いの権威ではなく、儀礼体験にあります。速さを求めるなら三枚硬貨、伝統的なリズムを求めるなら筮竹です。",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "易経の自動と手動の違いは？ 同じスレッドで卜骨と混ぜられますか？",
    answer:
      "自動と手動は易経（三硬貨または蓍草）にのみ適用されます。オプションでは易経を選んだときだけ起卦方式のコントロールが表示されます。三硬貨または蓍草を選んでから、自動（サーバーで起卦を実行）か手動（自分の銭または蓍草から六爻分の合計6/7/8/9を入力）を選びます。卜骨モードは常に自動で、手動の卜骨フローはありません。儀式と判定はアルゴリズムのみから行われます。プランのスレッド深度上限の範囲内で、易経と卜骨を自由に行き来でき、相談ごとに方法とモードを切り替えられます。次回の易経相談のために設定は記憶されます。",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "甲骨の方法とは何ですか？",
    answer:
      "甲骨は、亀甲や牛の肩甲骨に現れる亀裂を読む殷代の占いに着想を得た方法です。アプリでは易経とは別の方法であり、卦や変爻を作りません。まずシステムが亀裂のパターンと判定を形成し、その後AIがその結果をあなたの言語で解釈します。判定は常に、殷代の祖先的方法に忠実な五つの可能な状態のいずれかに収まります：1) 吉: はっきりと吉：パターンが肯定命題を曖昧さなく確認します；2) 吉 中程度: やや吉：確認はあるが、含みや条件を伴います；3) 凶 中程度: やや凶：パターンは留保付きで否定に傾きます；4) 凶: はっきりと凶：パターンが肯定命題を曖昧さなく否定します；5) 沉默: 沈黙：パターンが読み取れる亀裂を生じさせず、沈黙そのものが答えとなります。祖先的で簡潔な答えに向いており、時間の中で重層的に変化を読む場合は易経が適しています。",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "易経はどのように働き、答えはどこから出てくるのですか？",
    answer:
      "易経は、自然と人間の生活における変化の型を集めた64卦からなる古代の総覧として働きます。各卦は構造化された図形であり、その古典的意味はWilhelm/Baynesの本文に保存されています。各相談はあなたの具体的な問いから始まります。数学的アルゴリズムが朱熹の規則に従って爻を立て、現在の卦、変爻があればその位置、そして結果として生じる未来の卦を確定します。続いてAIが、すでに形成されたその結果をあなたの言語で表現し、卦の古典的意味をあなた個人の文脈に適用します。だからこそ、ひとつひとつの読みは固有で個人的なものになります。同じ卦が別々の人に現れることはあっても、答えが同じになることは決してありません。問いの内容、人生のその時、相談者の個人的文脈に依存するからです。同時に複数の人に当てはまる普遍的な解釈は存在しません。",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "なぜ同じチャットで「深める」ことができないことがありますか？",
    answer:
      "各スレッドはプランに応じた連鎖した読みの回数に制限があります。上限に達したら、新しいセッションを開始してください。ガイドではチャット、新しいセッション、プランの制限について説明しています。",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "過去の会話はどこにありますか？",
    answer:
      "ヘッダーから「チャット」を開くと、保存済みスレッドを閲覧したり、切り替えたり、新しいセッションを開始したりできます。認証済み履歴はガイドおよびプライバシーポリシーに記載の通り、アカウントに紐づいています。",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "読みをエクスポートできますか？",
    answer:
      "はい。相談後、利用可能な場合はリーディングカードのアクションからスレッドをPDFとしてエクスポートできます。詳細はユーザーガイドをご覧ください。",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "私と私の読みに関してどのようなデータが保存されますか？",
    answer:
      "プライバシーポリシーでは、データのカテゴリ、保持期間、読みや画像がアカウントに非公開のままであることを説明しています。アプリ内ガイドを補足するものです。",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "払い戻し、請求、サービス規約はどこにありますか？",
    answer:
      "商業条件と許容使用は利用規約に記載されています。トークンパックとチェックアウトの流れはガイドと料金ページにまとめられています。",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "ライブラリとは何ですか？どうすればアンロックできますか？",
    answer:
      "ライブラリは、ヴィルヘルム/バインズ訳、ジェームズ・レッグ版、そして原典の周易という3つの文学作品にわたる64卦の完全なコレクションを含むプレミアムセクションです。個人の学習や、手動での占い結果を本物の情報源と比較するために設計されています。有料のトークンパックを購入することで永久にアンロックされます。",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "二要素認証（2FA）は利用できますか？",
    answer:
      "はい、任意でご利用いただけます。オラクルのアカウントセキュリティから2FA（認証アプリおよび/またはメールコード）を有効にできます。ガイドでは相談との連携についてまとめています。",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "これは専門的なアドバイスですか？",
    answer:
      "いいえ。解釈は文化的・内省的なツールであり、医療・金融・その他の専門的なアドバイスではありません。コンテキストはメソッドノート、免責事項は利用規約をご覧ください。",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "六十四卦や判定を生成するのは、AIですか、それともアルゴリズムですか？",
    answer:
      "数学的アルゴリズムであり、AIではありません。I Chingモードでは、アルゴリズムが卦を構築して主爻と変卦を決定します。卜骨モードでは、亀裂パターンを生成して判定を下します。人工知能はその後に介入します。すでに計算されたその結果を受け取り、あなたの質問の文脈を踏まえて、あなたの言語で自然な言葉として表現します。AIは解釈者であり、オラクルはその方法です。",
  },
  {
    id: "authentic-texts",
    question: "解釈に表示されるI Chingのテキストは本物ですか、それともAIが生成したものですか？",
    answer:
      "本物です。卦辞、動爻（爻辞）、変卦のテキストはすべて、ヴィルヘルム/バインズ訳（2020年よりパブリックドメイン）から引用されています。AIはあなたの質問に合わせてそれらを引用し文脈化しますが、変更や置き換えは一切しません。すべてのテキストを原著と照合することができます。",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "卜骨モードにおける「沉默」とはどういう意味ですか？",
    answer:
      "沉默（沈黙）は卜骨モードの5番目の可能な判定状態であり、殷の祖先に忠実な方法です。古来の伝統では、骨に読み取れる亀裂が生じなかった場合、それは誤りではありませんでした。それ自体が一つの答えでした。つまり、その問いに対してまだ時が熟していないか、あるいは答えが言葉を超えているため、祖先は語らないのです。このアプリはその状態を尊重し、パターンがそれを示すときに返します。",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "このアプリは私の言語に対応していますか？",
    answer:
      "はい。このアプリは11の言語に対応しています：スペイン語、英語、ポルトガル語、フランス語、ドイツ語、イタリア語、日本語、中国語、韓国語、アラビア語、ヒンディー語。AIはあなたが質問を書いた言語で回答します。設定は不要です。フランス語で質問すれば、オラクルはフランス語で答えます。アラビア語で質問すれば、アラビア語で答えます。",
  },
  {
    id: "privacy-consultations",
    question: "私の相談は非公開ですか？",
    answer:
      "はい。あなたの質問と解釈はあなただけのものです。第三者と共有されることはなく、AIモデルの学習に使用されることもなく、他のユーザーには見えません。チャット履歴を見ることができるのはあなただけです。Chatsセクションからいつでも任意の会話を削除できます。オプションで利用可能な二要素認証（2FA）を有効にすると、アカウントにさらなる保護の層を追加できます。",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "神託への質問はどのくらいの長さにできますか？",
    answer:
      "各相談には最大 1500文字 (約250-300単語) まで入力できます。このスペースを活用して状況を詳しく説明することをお勧めします。現在の状況や感情についてより多くの文脈を提供すればするほど、得られた卦からシステムが生成する解釈はより深く正確になります。",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_ZH: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "代币、套餐和免费层级是如何运作的？",
    answer:
      "每次咨询根据您激活的套餐消耗代币。指南说明了试用余额、套餐大小以及余额如何累积。购买和续订受服务条款约束。",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "应用中提供的易经文本可靠性如何？",
    answer: "这些文本非常可靠。我们进行了 1:1 的数据完整性审核，根据帕尔马大学（卫礼贤译本）、Sacred-Texts.com（理雅各译本）和中国哲学书电子化计划（周易）等学术资源验证了每个卦象。原始源数据集中发现의 任何转录错误均已手动更正，以确保数学和文学的准确性。",
  },
  {
    id: "yarrow-vs-coins",
    question: "《易经》的两种方法，三枚铜钱和蓍草，有什么区别？",
    answer:
      "两种方法都会得到同样的六十四卦，并使用同样的《易经》文本与朱熹规则。三枚铜钱更快捷易用：把三枚钱币掷六次，形成六爻。蓍草是更古老的礼仪方法：用蓍草或类似物件逐步计数，过程更慢，也更具沉思感。选择改变的是仪式体验，而不是解读的权威性。想要快速可用，选三枚铜钱；想要传统节奏，选蓍草。",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "易经的自动与手动有什么区别？同一对话里能混用甲骨文吗？",
    answer:
      "自动与手动仅适用于易经（三枚铜钱或蓍草）。在选项中，只有选中易经时才会显示起卦方式控制：选择三枚铜钱或蓍草，再选自动（服务器执行起卦）或手动（在解读前自行输入六爻的6/7/8/9合计）。甲骨文模式始终为自动，没有手动甲骨流程；仪式与兆判完全由算法产生。在您套餐的单线程深度上限内，您可以自由交替易经与甲骨文，并在咨询之间切换方法与模式；应用会记住您的偏好，供下次易经解读使用。",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "什么是甲骨方法？",
    answer:
      "甲骨方法源自商代占卜，灵感来自龟甲和牛肩胛骨裂纹的解读。在应用中，它与《易经》分开：不会生成卦象，也不会生成变爻。系统先形成裂纹图案和判定，然后由 AI 用你的语言解释这个已经形成的结果。判定始终落入五种可能状态之一，忠实于商代祖先方法：1）吉，明显为吉：图案明确确认正面命题，无歧义；2）偏吉，偏吉：有所确认，但带条件或细微差别；3）偏凶，偏凶：图案带保留地倾向于否定；4）凶，明显为凶：图案明确否定正面命题，无歧义；5）沉默：图案不产生可读裂纹，沉默本身即为答复。它适合简洁、祖先式的回答；若要观察随时间展开的层次变化，《易经》更合适。",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "《易经》到底如何运作？答案从何而来？",
    answer:
      "《易经》通过六十四卦运作，这是一部关于自然与人世变化模式的古老总览。每一卦都是结构化的图形，其经典含义保存于卫礼贤／贝恩斯译本中。每一次咨询都从你具体的问题出发。数学算法按照朱熹规则逐爻立卦，确定本卦、若有则定动爻、并由动爻得到之卦。随后 AI 用你的语言表述这个已经形成的结果，将那些卦象的经典含义投射到你独特的处境之中。因此，每一次解读都是独一无二、属于个人的：相同的卦象可能为不同的人出现，但答案永不相同，因为它取决于具体的问题、所处的时机以及问卜者的个人处境。世上不存在可以同时适用于多人的普遍解读。",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "为什么有时我无法在同一个聊天中继续「深入」？",
    answer:
      "每个对话线程根据您的套餐允许有限次数的连锁解读。达到上限后，请开启新会话。指南介绍了聊天、新会话和套餐限制。",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "我过去的对话在哪里？",
    answer:
      "从页眉打开「聊天」即可浏览已保存的线程、切换对话或开始新会话。已认证的历史记录与您的账户绑定，详见指南和隐私政策。",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "我可以导出解读内容吗？",
    answer:
      "可以。咨询后，您可以在解读卡片的操作区（如有）将线程导出为PDF。详情请参阅用户指南。",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "您存储了我的哪些数据和解读信息？",
    answer:
      "隐私政策说明了数据类别、保留期限以及解读和图片如何对您的账户保持私密。这是对应用内指南的补充。",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "账单信息和服务条款在哪里？",
    answer:
      "商业条款和可接受使用规定请见服务条款。代币套餐和结账流程在指南和定价页面中有所概述。",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "资料库是什么？如何解锁？",
    answer:
      "资料库是一个高级板块，包含三个文学版本中的 64 卦完整合集：经典的卫礼贤/贝恩斯译本、理雅各（James Legge）版本以及《周易》古经。它专为个人学习以及将您的手动起卦与原典进行对比而设计。购买任何付费代币包即可永久解锁。",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "是否提供双因素身份验证（2FA）？",
    answer:
      "是的，可选启用：您可以通过神谕中的账户安全设置启用2FA（身份验证器和/或电子邮件验证码）。指南概述了其与咨询的配合方式。",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "这是专业建议吗？",
    answer:
      "不是。解读是文化和反思性工具，而非医疗、财务或其他专业建议。请参阅方法说明了解背景，服务条款中包含免责声明。",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "生成卦象或判断的是AI还是算法？",
    answer:
      "是数学算法，而不是AI。在易经模式下，算法逐爻构建卦象，确定主爻和变卦。在甲骨文模式下，生成裂纹图案并确定判断。人工智能随后介入：它获取已计算好的结果，结合您的问题语境，以您的语言用自然语言表达出来。AI是解释者，神谕是方法。",
  },
  {
    id: "authentic-texts",
    question: "解读中出现的易经文本是真实的还是AI生成的？",
    answer:
      "是真实的。卦辞、动爻（爻辞）和变卦的文本完全来自威廉/贝恩斯译本（2020年起属公共领域）。AI引用这些文本并结合您的问题加以诠释，但不对其进行修改或替换。您可以将任何文本与原著进行对照。",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "甲骨文模式中的「沉默」是什么意思？",
    answer:
      "沉默是甲骨文模式中第五种可能的判断状态，忠实于商代祖先传统方法。在古代传统中，当骨头没有产生可读裂纹时，这不是错误，这本身就是一种答案：祖先不语，因为此问的时机尚未成熟，或因为答案超越了可以言说的范畴。本应用尊重这一状态，当图案显示时将其返回。",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "这款应用支持我的语言吗？",
    answer:
      "支持。本应用提供11种语言：西班牙语、英语、葡萄牙语、法语、德语、意大利语、日语、中文、韩语、阿拉伯语和印地语。AI用您提问的语言回答，无需任何配置。如果您用法语提问，神谕就用法语回答。如果您用阿拉伯语提问，就用阿拉伯语回答。",
  },
  {
    id: "privacy-consultations",
    question: "我的咨询是私密的吗？",
    answer:
      "是的。您的问题和解读属于您自己。它们不会与第三方共享，不用于训练AI模型，其他用户也无法看到。只有您才能查看自己的聊天记录。您可以随时在聊天区删除任何对话。如果您在选项中启用双因素身份验证（2FA），将为您的账户增加一层额外保护。",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "我可以向神谕提出多长的问题？",
    answer:
      "每次咨询最多允许输入 1500 个字符 (约 250-300 个词)。我们建议您利用这个空间详细描述您的情况；您提供的关于当前时刻和感受的背景信息越多，系统根据所得卦象生成的解读就越深刻和准确。",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_KO: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "토큰, 팩, 무료 티어는 어떻게 작동하나요?",
    answer:
      "각 상담은 활성 팩에 따라 토큰을 소비합니다. 가이드에서는 무료 체험 잔액, 팩 크기, 잔액 적립 방식을 설명합니다. 구매 및 갱신은 서비스 약관의 적용을 받습니다.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "앱에서 제공되는 주역 텍스트는 얼마나 신뢰할 수 있습니까?",
    answer: "텍스트는 매우 신뢰할 수 있습니다. 파르마 대학교(빌헬름 번역), Sacred-Texts.com(레그 번역), Chinese Text Project(주역)와 같은 학술적 자료를 바탕으로 1:1 데이터 무결성 감사를 실시했습니다. 원본 소스 데이터셋에서 발견된 모든 오타는 수학적 및 문학적 정확성을 보장하기 위해 수동으로 수정되었습니다.",
  },
  {
    id: "yarrow-vs-coins",
    question: "주역의 두 방법, 세 동전과 시초는 무엇이 다른가요?",
    answer:
      "두 방법 모두 같은 64괘를 만들고 같은 주역 원문과 주희의 규칙을 사용합니다. 세 동전은 빠르고 접근하기 쉽습니다. 동전 세 개를 여섯 번 던져 여섯 효를 만듭니다. 시초는 더 오래된 의례적 방법입니다. 시초나 비슷한 물건을 세며 더 느리고 사색적인 절차로 진행합니다. 선택은 해석의 권위가 아니라 의례 경험을 바꿉니다. 빠르게 보고 싶다면 세 동전, 전통적 리듬을 원한다면 시초를 사용하세요.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "역경 자동과 수동의 차이는 무엇이며, 같은 스레드에서 갑골과 섞을 수 있나요?",
    answer:
      "자동과 수동은 역경(동전 세 개 또는 시초)에만 적용됩니다. 옵션에서 역경을 선택했을 때만 점 방식 컨트롤이 보입니다. 동전 세 개 또는 시초를 선택한 후 자동(서버에서 점괘 실행) 또는 수동(본인의 동전이나 시초로 나온 여섯 효의 합계 6/7/8/9를 입력)을 선택합니다. 갑골 모드는 항상 자동이며 수동 갑골 흐름은 없습니다. 의식과 판정은 알고리즘에서만 나옵니다. 요금제의 스레드 깊이 한도 안에서는 역경과 갑골을 자유롭게 번갈아 할 수 있고, 상담 간 방법과 모드를 바꿀 수 있습니다. 다음 역경 상담을 위해 설정은 기억됩니다.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "갑골 방법이란 무엇인가요?",
    answer:
      "갑골은 거북 배딱지와 소 견갑골의 균열을 읽던 상나라 시대 점복에서 영감을 받은 방법입니다. 앱에서는 주역과 별개의 방식입니다. 괘나 변효를 만들지 않습니다. 시스템이 먼저 균열 패턴과 판정을 형성하고, 그다음 AI가 이미 형성된 결과를 사용자의 언어로 해석합니다. 판정은 언제나 상나라 조상 전통에 충실한 다섯 가지 가능한 상태 중 하나로 떨어집니다: 1) 吉: 명확히 길함: 패턴이 모호함 없이 긍정 명제를 확인합니다; 2) 吉 중간: 다소 길함: 확인은 있지만 뉘앙스나 조건이 따릅니다; 3) 凶 중간: 다소 흉함: 패턴이 유보적으로 부정 쪽으로 기웁니다; 4) 凶: 명확히 흉함: 패턴이 모호함 없이 긍정 명제를 부정합니다; 5) 沉默: 침묵: 패턴이 읽을 수 있는 균열을 만들지 못하며, 침묵 자체가 답입니다. 간결하고 조상적 어조의 답에 적합하며, 시간 속에서 층층이 변하는 흐름은 주역이 더 적합합니다.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "주역은 실제로 어떻게 작동하며, 그 답은 어디에서 오나요?",
    answer:
      "주역은 자연과 인간 삶의 변화 양상을 모은 고대 도록인 64괘를 통해 작동합니다. 각 괘는 구조화된 도형으로, 그 고전적 의미는 빌헬름/베인스 텍스트에 보존되어 있습니다. 각 상담은 당신의 구체적인 질문에서 시작됩니다. 수학 알고리즘은 주희의 규칙에 따라 효를 던져 현재 괘, 변효(있다면)와 그로 인한 미래 괘를 확정합니다. 이어서 AI는 이미 형성된 그 결과를 당신의 언어로 표현하며, 해당 괘들의 고전적 의미를 당신만의 맥락에 적용합니다. 그래서 각 해석은 고유하고 개인적입니다. 같은 괘들이 서로 다른 사람에게 나올 수 있지만, 답이 같을 수는 없습니다. 답은 구체적인 질문, 삶의 시점, 그리고 상담자의 개인적 맥락에 달려 있기 때문입니다. 동시에 둘 이상에게 적용되는 보편 해석은 존재하지 않습니다.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "왜 때때로 같은 채팅에서 더 이상 '심화'할 수 없나요?",
    answer:
      "각 스레드는 플랜에 따라 제한된 수의 연쇄 해석을 허용합니다. 한도에 도달하면 새 세션을 시작하세요. 가이드에서 채팅, 새 세션, 플랜 한도를 설명합니다.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "이전 대화는 어디에 있나요?",
    answer:
      "헤더에서 '채팅'을 열면 저장된 스레드를 탐색하고, 전환하거나, 새 세션을 시작할 수 있습니다. 인증된 기록은 가이드 및 개인정보 처리방침에 설명된 대로 계정에 연결됩니다.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "해석을 내보낼 수 있나요?",
    answer:
      "네. 상담 후 해석 카드 작업에서 스레드를 PDF로 내보낼 수 있습니다(가능한 경우). 자세한 내용은 사용자 가이드를 참조하세요.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "제 정보와 해석에 관해 어떤 데이터를 저장하나요?",
    answer:
      "개인정보 처리방침에서 데이터 카테고리, 보존 기간, 해석 및 이미지가 계정에서 비공개로 유지되는 방식을 설명합니다. 앱 내 가이드를 보완합니다.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "청구 정보와 서비스 약관은 어디에 있나요?",
    answer:
      "상업적 조건 및 허용 가능한 사용은 서비스 약관에 있습니다. 토큰 팩과 결제 흐름은 가이드와 가격 페이지에 요약되어 있습니다.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "라이브러리란 무엇이며 어떻게 잠금 해제하나요?",
    answer:
      "라이브러리는 빌헬름/베인즈 번역, 제임스 레그 버전, 그리고 원전 주역 등 세 가지 문헌에 걸친 64괘 전체 컬렉션을 포함하는 프리미엄 섹션입니다. 개인적인 학습과 수동 점괘를 정통 출처와 대조하기 위해 설계되었습니다. 유료 토큰 팩을 구매하면 영구적으로 잠금 해제됩니다.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "이중 인증(2FA)을 사용할 수 있나요?",
    answer:
      "네, 선택 사항입니다. 오라클의 계정 보안에서 2FA(인증 앱 및/또는 이메일 코드)를 활성화할 수 있습니다. 가이드에서 상담과의 연동 방식을 요약합니다.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "이것은 전문적인 조언인가요?",
    answer:
      "아니요. 해석은 문화적·성찰적 도구이며, 의료, 금융 또는 기타 전문 조언이 아닙니다. 배경은 방법 메모를, 면책 조항은 약관을 참조하세요.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "괘나 판정을 생성하는 것은 AI인가요, 알고리즘인가요?",
    answer:
      "수학적 알고리즘이며, AI가 아닙니다. 주역 모드에서 알고리즘은 괘를 구성하고 주효와 변괘를 결정합니다. 갑골 모드에서는 균열 패턴을 생성하고 판정을 내립니다. 인공지능은 그 이후에 개입합니다. 이미 계산된 결과를 받아 귀하의 질문 맥락과 함께 귀하의 언어로 자연스럽게 표현합니다. AI는 해석자입니다. 오라클은 방법입니다.",
  },
  {
    id: "authentic-texts",
    question: "해석에 나타나는 주역 텍스트는 진본인가요, AI가 생성한 것인가요?",
    answer:
      "진본입니다. 괘사(卦辞), 동효의 효사(爻辞), 변괘 텍스트는 모두 빌헬름/베인스 번역본(2020년부터 공공 도메인)에서 인용되었습니다. AI는 귀하의 질문에 맞게 이를 인용하고 맥락화하지만, 수정하거나 대체하지 않습니다. 원저와 텍스트를 비교해 볼 수 있습니다.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "갑골 모드에서 '침묵'은 무엇을 의미하나요?",
    answer:
      "침묵(沉默)은 갑골 모드의 다섯 번째 가능한 판정 상태이며, 상나라 조상 전통 방법에 충실합니다. 고대 전통에서 뼈에 읽을 수 있는 균열이 생기지 않았을 때, 이는 오류가 아니었습니다, 그 자체가 하나의 답이었습니다. 조상들이 말하지 않는 것은 그 질문에 대한 때가 무르익지 않았거나, 답이 말로 할 수 있는 것을 초월하기 때문입니다. 이 앱은 그 상태를 존중하며 패턴이 그것을 나타낼 때 반환합니다.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "이 앱은 내 언어로 작동하나요?",
    answer:
      "네. 이 앱은 11개 언어로 제공됩니다: 스페인어, 영어, 포르투갈어, 프랑스어, 독일어, 이탈리아어, 일본어, 중국어, 한국어, 아랍어, 힌디어. AI는 질문을 작성한 언어로 답변합니다. 별도 설정이 필요 없습니다. 프랑스어로 질문하면 오라클이 프랑스어로 답합니다. 아랍어로 질문하면 아랍어로 답합니다.",
  },
  {
    id: "privacy-consultations",
    question: "내 상담은 비공개인가요?",
    answer:
      "네. 귀하의 질문과 해석은 귀하의 것입니다. 제3자와 공유되지 않으며, AI 모델 훈련에 사용되지 않고, 다른 사용자에게 보이지 않습니다. 채팅 기록은 귀하만 볼 수 있습니다. 채팅 섹션에서 언제든지 대화를 삭제할 수 있습니다. 옵션에서 이중 인증(2FA)을 활성화하면 계정에 추가적인 보호 층을 더할 수 있습니다.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "오라클에 대한 질문은 얼마나 길게 할 수 있나요?",
    answer:
      "각 상담은 최대 1500자 (약 250-300 단어)까지 허용됩니다. 이 공간을 활용하여 상황을 자세히 설명하는 것이 좋습니다. 현재 상황과 감정에 대해 더 많은 맥락을 제공할수록 결과 괘에서 시스템이 생성하는 해석이 더 깊고 정확해집니다.",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_PT: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "Como funcionam os tokens, os pacotes e o nível gratuito?",
    answer:
      "Cada consulta consome tokens conforme o seu pacote ativo. O guia explica os créditos de teste, os tamanhos dos pacotes e como o saldo se acumula. Compras e renovações são regidas pelos Termos.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "Quão confiáveis são os textos do I Ching no aplicativo?",
    answer: "Os textos são altamente confiáveis. Realizamos uma auditoria de integridade de dados 1:1, verificando cada hexagrama com fontes acadêmicas como a Universidade de Parma (versão Wilhelm), Sacred-Texts.com (Legge) e o Chinese Text Project (Zhou Yi). Quaisquer erros de transcrição encontrados nos conjuntos de dados originais foram corrigidos manualmente para garantir precisão matemática e literária.",
  },
  {
    id: "yarrow-vs-coins",
    question: "Em que diferem os dois métodos do I Ching: Três Moedas e Varetas?",
    answer:
      "Ambos os métodos produzem os mesmos 64 hexagramas e usam os mesmos textos do I Ching e as regras de Zhu Xi. Três Moedas é rápido e acessível: lanças três moedas seis vezes para formar as seis linhas. Varetas de Milefólio é o método ritual mais antigo: trabalhas com varetas ou objetos semelhantes através de um procedimento mais lento e contemplativo. A escolha muda a experiência ritual, não a autoridade da leitura. Usa Três Moedas para rapidez; usa Varetas quando quiseres o ritmo tradicional.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "O que é I Ching automático vs manual, e posso misturar Ossos no mesmo fio?",
    answer:
      "Automático vs manual aplica-se apenas ao I Ching (Três Moedas ou Varetas de Milefólio). Em Opções os controlos do modo de tiragem aparecem com o I Ching selecionado: escolha Três Moedas ou Varetas, depois automático (a tiragem corre no servidor) ou manual (introduza os seis totais de linha 6/7/8/9 das suas moedas ou varetas). O modo Ossos é sempre automático; não existe fluxo manual de ossos; ritual e veredicto vêm só do algoritmo. Dentro do limite de profundidade por fio do seu plano, pode alternar livremente I Ching e Ossos e mudar métodos e modos entre consultas; a app memoriza as suas preferências para a próxima leitura em I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "O que é o método dos Ossos Oraculares?",
    answer:
      "Ossos Oraculares é um método de adivinhação da era Shang inspirado na leitura de fissuras em plastrões de tartaruga e escápulas de boi. Na app, é separado do I Ching: não cria hexagramas nem linhas mutantes. O sistema forma primeiro um padrão de fissuras e um veredicto; depois a IA interpreta esse resultado já formado no teu idioma. O veredicto cai sempre num de cinco estados possíveis, fiéis ao método ancestral Shang: 1) 吉: favorável claro: o padrão confirma a carga positiva sem ambiguidade; 2) 吉 moderado: favorável moderado: há confirmação, mas com nuances ou condições; 3) 凶 moderado: desfavorável moderado: o padrão inclina-se para a negação com reservas; 4) 凶: desfavorável claro: o padrão nega a carga positiva sem ambiguidade; 5) 沉默: Silêncio: o padrão não produz fissuras legíveis e o próprio silêncio é a resposta. É útil para respostas concisas, de tom ancestral; o I Ching é melhor para mudanças em camadas ao longo do tempo.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "Como é que o I Ching funciona e de onde vêm as suas respostas?",
    answer:
      "O I Ching opera através de 64 hexagramas, um catálogo milenar dos padrões de mudança na natureza e na vida humana. Cada hexagrama é uma figura estruturada, com um significado clássico preservado nos textos Wilhelm/Baynes. Cada consulta parte da tua pergunta concreta. O algoritmo matemático lança as linhas segundo as regras de Zhu Xi para determinar o hexagrama presente, as linhas em movimento (caso existam) e o hexagrama futuro resultante. Em seguida a IA articula esse resultado já formado no teu idioma, aplicando o significado clássico desses hexagramas ao teu contexto particular. Por isso cada leitura é única e pessoal: os mesmos hexagramas podem aparecer para pessoas diferentes, mas a resposta nunca é a mesma, porque depende da pergunta concreta, do momento de vida e do contexto pessoal do consultante. Não existe uma interpretação universal aplicável a mais de uma pessoa em simultâneo.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "Por que às vezes não consigo «aprofundar» mais no mesmo chat?",
    answer:
      "Cada fio admite um número limitado de leituras encadeadas conforme o seu plano. Ao atingir o limite, abra uma nova sessão. O guia explica Chats, nova sessão e limites por plano.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "Onde estão as minhas conversas anteriores?",
    answer:
      "Abra «Chats» no cabeçalho para listar os fios guardados, alternar entre eles ou iniciar uma nova sessão. O histórico autenticado está vinculado à sua conta, conforme descrito no guia e na política de privacidade.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "Posso exportar uma leitura?",
    answer:
      "Sim, após uma consulta pode exportar o fio em PDF nas ações do cartão de leitura, quando disponível. Detalhes no guia.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "Que dados guardam sobre mim e as minhas leituras?",
    answer:
      "A política de privacidade descreve categorias de dados, retenção e como leituras e imagens ficam privadas na sua conta. Complementa (sem substituir) o guia da app.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "Onde encontro informações de faturação e termos de serviço?",
    answer:
      "As condições comerciais e o uso aceitável estão nos Termos de Serviço. Os pacotes de tokens e o fluxo de compra estão resumidos no guia e na página de preços.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "O que é a Biblioteca e como a desbloqueio?",
    answer:
      "A Biblioteca é uma secção premium que contém a coleção completa dos 64 hexagramas em três obras literarias: a tradução clássica de Wilhelm/Baynes, a versão de James Legge e o Zhou Yi original. Foi concebida para o estudo pessoal e para contrastar as suas tiragens manuais com fontes autênticas. É desbloqueada permanentemente ao adquirir qualquer pacote de tokens pago.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "A autenticação em dois fatores (2FA) está disponível?",
    answer:
      "Sim, de forma opcional: pode ativar 2FA (authenticator e/ou código por e-mail) nas definições de segurança da conta no oráculo. O guia resume como se integra com as consultas.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "Isto é aconselhamento profissional?",
    answer:
      "Não. As interpretações são ferramentas culturais e reflexivas, não aconselhamento médico, financeiro ou profissional. Veja as notas de métodos para contexto e os termos para isenções de responsabilidade.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "Quem gera o hexagrama ou o veredicto: a IA ou o algoritmo?",
    answer:
      "O algoritmo matemático, não a IA. No modo I Ching, o algoritmo constrói o hexagrama linha por linha e determina a linha regente. No modo Ossos, gera o padrão de fissuras e o veredicto. A inteligência artificial intervém depois: pega nesse resultado já calculado e articula-o em linguagem natural no seu idioma, com o contexto da sua pergunta. A IA é o intérprete. O oráculo é o método.",
  },
  {
    id: "authentic-texts",
    question: "Os textos do I Ching que aparecem na leitura são autênticos ou gerados por IA?",
    answer:
      "São autênticos. Os textos do Julgamento (卦辞), as sentenças das linhas em movimento (爻辞) e os hexagramas resultantes provêm inteiramente da tradução Wilhelm/Baynes (domínio público desde 2020). A IA cita-os e contextualiza-os com a sua pergunta, mas não os modifica nem substitui. Pode comparar qualquer texto com o livro original.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "O que significa o Silêncio no modo Ossos?",
    answer:
      "O Silêncio (沉默) é o quinto estado possível do veredicto no modo Ossos, e é fiel ao método ancestral Shang. Na tradição original, quando o osso não produzia fissuras legíveis, não era um erro; era uma resposta em si mesma: os ancestrais não falam porque o momento não está maduro para essa pergunta, ou porque a resposta transcende o que pode ser dito. Esta app respeita esse estado e devolve-o quando o padrão o indica.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "A app funciona no meu idioma?",
    answer:
      "Sim. A app está disponível em 11 idiomas: espanhol, inglês, português, francês, alemão, italiano, japonês, chinês, coreano, árabe e hindi. A IA responde no idioma em que escreve a sua pergunta, sem necessidade de configurar nada. Se perguntar em francês, o oráculo responde em francês. Se perguntar em árabe, responde em árabe.",
  },
  {
    id: "privacy-consultations",
    question: "As minhas consultas são privadas?",
    answer:
      "Sim. As suas perguntas e leituras são suas. Não são partilhadas com terceiros, não são usadas para treinar modelos de IA e não são visíveis para outros utilizadores. Só você pode ver o seu histórico de chats. Pode eliminar qualquer conversa a qualquer momento na secção Chats. Se ativar a autenticação em dois fatores (2FA) disponível em Opções, adiciona uma camada extra de proteção à sua conta.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "Quão longa pode ser a minha pergunta ao oráculo?",
    answer:
      "Cada consulta permite até 1500 caracteres (cerca de 250-300 palavras). Recomendamos aproveitar este espaço para descrever a sua situação com detalhes; quanto mais contexto fornecer sobre o seu momento actual e os seus sentimentos, mais profunda e precisa será a interpretação que o sistema gera a partir do hexagrama obtido.",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_DE: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "Wie funktionieren Tokens, Packs und das Gratis-Tier?",
    answer:
      "Jede Beratung verbraucht Tokens gemäß Ihrem aktiven Pack. Der Leitfaden erklärt die Testguthaben, Pack-Größen und wie sich das Guthaben anhäuft. Käufe und Verlängerungen unterliegen den Nutzungsbedingungen.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "Wie zuverlässig sind die I-Ging-Texte in der App?",
    answer: "Die Texte sind äußerst zuverlässig. Wir haben ein 1:1-Datenintegritätsaudit durchgeführt und jedes Hexagramm mit akademischen Quellen wie der Universität Parma (Wilhelm-Übersetzung), Sacred-Texts.com (Legge) und dem Chinese Text Project (Zhou Yi) abgeglichen. Etwaige Transkriptionsfehler in den ursprünglichen Quelldatensätzen wurden manuell korrigiert, um mathematische und literarische Genauigkeit zu gewährleisten.",
  },
  {
    id: "yarrow-vs-coins",
    question: "Worin unterscheiden sich die zwei I Ging Methoden: Drei Münzen und Schafgarbenstäbe?",
    answer:
      "Beide Methoden erzeugen dieselben 64 Hexagramme und verwenden dieselben I Ging Texte sowie die Regeln Zhu Xis. Drei Münzen ist schnell und leicht zugänglich: drei Münzen werden sechsmal geworfen, um die sechs Linien zu bilden. Schafgarbenstäbe ist die ältere rituelle Methode: Man arbeitet mit gezählten Stäben oder ähnlichen Gegenständen in einem langsameren, kontemplativeren Ablauf. Die Wahl verändert das rituelle Erleben, nicht die Gültigkeit der Lesung. Nutze Drei Münzen für Schnelligkeit; nutze Schafgarbenstäbe für den traditionellen Rhythmus.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "Was bedeutet automatisch vs. manuell beim I Ching, und kann ich Orakelknochen im selben Thread mischen?",
    answer:
      "Automatisch vs. manuell gilt nur für das I Ching (Drei Münzen oder Schafgarbenstäbe). In den Optionen erscheinen die Wurfmodus-Steuerelemente nur bei ausgewähltem I Ching: Wählen Sie Drei Münzen oder Schafgarbenstäbe, dann automatisch (der Wurf erfolgt auf dem Server) oder manuell (Sie tragen die sechs Liniensummen 6/7/8/9 Ihrer eigenen Münzen oder Stäbe ein). Der Orakelknochen-Modus ist immer automatisch; es gibt keinen manuellen Knochenablauf; Ritual und Urteil kommen ausschließlich vom Algorithmus. Innerhalb des Thread-Tiefenlimits Ihres Tarifs können Sie frei zwischen I Ching und Orakelknochen wechseln und Methoden und Modi zwischen Beratungen umschalten; Ihre Einstellungen werden für die nächste I-Ching-Beratung gespeichert.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Was ist die Methode der Orakelknochen?",
    answer:
      "Orakelknochen ist eine Wahrsagemethode aus der Shang Zeit, inspiriert vom Lesen von Rissen auf Schildkrötenpanzern und Ochsenschulterblättern. In der App ist sie vom I Ging getrennt: Sie erzeugt keine Hexagramme und keine wandelnden Linien. Das System bildet zuerst ein Rissmuster und ein Urteil; danach interpretiert die KI dieses bereits gebildete Ergebnis in deiner Sprache. Das Urteil fällt stets in einen von fünf möglichen Zuständen, die der ursprünglichen Shang-Tradition treu sind: 1) 吉: eindeutig günstig: das Muster bestätigt die positive Ladung ohne Mehrdeutigkeit; 2) 吉 mäßig: mäßig günstig: Bestätigung mit Nuancen oder Bedingungen; 3) 凶 mäßig: mäßig ungünstig: das Muster neigt mit Vorbehalten zur Verneinung; 4) 凶: eindeutig ungünstig: das Muster verneint die positive Ladung ohne Mehrdeutigkeit; 5) 沉默: Schweigen: das Muster erzeugt keine lesbaren Risse, und das Schweigen selbst ist die Antwort. Sie eignet sich für knappe Antworten im Ahnenstil; das I Ging eignet sich besser für vielschichtigen Wandel über die Zeit.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "Wie funktioniert das I Ging tatsächlich, und woher kommen seine Antworten?",
    answer:
      "Das I Ging arbeitet über 64 Hexagramme, einen jahrtausendealten Katalog von Wandlungsmustern in Natur und menschlichem Leben. Jedes Hexagramm ist eine strukturierte Figur, deren klassische Bedeutung in den Wilhelm/Baynes-Texten bewahrt ist. Jede Beratung beginnt mit Ihrer konkreten Frage. Der mathematische Algorithmus wirft die Linien nach den Regeln Zhu Xis und bestimmt das gegenwärtige Hexagramm, die wandelnden Linien (falls vorhanden) und das daraus resultierende zukünftige Hexagramm. Anschließend formuliert die KI dieses bereits gebildete Ergebnis in Ihrer Sprache und überträgt die klassische Bedeutung dieser Hexagramme auf Ihren persönlichen Kontext. Genau deshalb ist jede Lesung einzigartig und persönlich: Dieselben Hexagramme können bei verschiedenen Menschen auftreten, doch die Antwort ist nie dieselbe, sie hängt von der konkreten Frage, dem Lebensmoment und dem persönlichen Kontext des Ratsuchenden ab. Es gibt keine allgemeingültige Deutung, die zugleich für mehrere Personen gilt.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "Warum kann ich manchmal im selben Chat nicht weiter «vertiefen»?",
    answer:
      "Jeder Thread erlaubt eine begrenzte Anzahl verketteter Lesungen je nach Plan. Wenn das Limit erreicht ist, starten Sie eine neue Sitzung. Der Leitfaden erklärt Chats, neue Sitzung und Planlimits.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "Wo sind meine vergangenen Gespräche?",
    answer:
      "Öffnen Sie «Chats» in der Kopfzeile, um gespeicherte Threads aufzulisten, zwischen ihnen zu wechseln oder eine neue Sitzung zu starten. Der authentifizierte Verlauf ist Ihrem Konto zugeordnet, wie im Leitfaden und in der Datenschutzrichtlinie beschrieben.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "Kann ich eine Lesung exportieren?",
    answer:
      "Ja, nach einer Beratung können Sie den Thread als PDF aus den Aktionen der Lesekarte exportieren, sofern verfügbar. Details im Leitfaden.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "Welche Daten speichern Sie über mich und meine Lesungen?",
    answer:
      "Die Datenschutzrichtlinie erläutert Datenkategorien, Aufbewahrung und wie Lesungen und Bilder privat für Ihr Konto bleiben. Sie ergänzt (und ersetzt nicht) den In-App-Leitfaden.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "Wo finde ich Abrechnungsinformationen und Nutzungsbedingungen?",
    answer:
      "Kommerzielle Bedingungen und zulässige Nutzung finden sich in den Nutzungsbedingungen. Token-Packs und Kaufabläufe sind im Leitfaden und auf der Preisseite zusammengefasst.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "Was ist die Bibliothek und wie entsperre ich sie?",
    answer:
      "Die Bibliothek ist ein Premium-Bereich, der die vollständige Sammlung der 64 Hexagramme aus drei literarischen Werken enthält: der klassischen Wilhelm/Baynes-Übersetzung, der James-Legge-Version und dem originalen Zhou Yi. Sie ist für das persönliche Studium und den Abgleich Ihrer manuellen Würfe mit authentischen Quellen gedacht. Sie wird durch den Kauf eines beliebigen kostenpflichtigen Token-Pakets dauerhaft freigeschaltet.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "Ist Zwei-Faktor-Authentifizierung (2FA) verfügbar?",
    answer:
      "Ja, optional: Sie können 2FA (Authenticator und/oder E-Mail-Codes) aus den Kontosicherheitseinstellungen im Orakel aktivieren. Der Leitfaden fasst zusammen, wie es mit Beratungen interagiert.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "Ist dies professionelle Beratung?",
    answer:
      "Nein. Interpretationen sind kulturelle und reflexive Werkzeuge, keine medizinischen, finanziellen oder anderen Fachberatungen. Siehe Methodennotizen für Kontext und Bedingungen für Haftungsausschlüsse.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "Wer generiert das Hexagramm oder das Urteil: die KI oder der Algorithmus?",
    answer:
      "Der mathematische Algorithmus, nicht die KI. Im I-Ching-Modus baut der Algorithmus das Hexagramm Linie für Linie auf und bestimmt die leitende Linie und das resultierende Hexagramm. Im Knochenmodus generiert er das Rissmuster und das Urteil. Die künstliche Intelligenz greift danach ein: Sie nimmt dieses bereits berechnete Ergebnis und formuliert es in natürlicher Sprache in Ihrer Sprache, mit dem Kontext Ihrer Frage. Die KI ist der Interpret. Das Orakel ist die Methode.",
  },
  {
    id: "authentic-texts",
    question: "Sind die I-Ching-Texte in der Lesung authentisch oder KI-generiert?",
    answer:
      "Sie sind authentisch. Die Texte des Urteils (卦辞), die Aussagen der sich bewegenden Linien (爻辞) und die resultierenden Hexagramme stammen vollständig aus der Wilhelm/Baynes-Übersetzung (seit 2020 gemeinfrei). Die KI zitiert und kontextualisiert sie mit Ihrer Frage, ändert oder ersetzt sie aber nicht. Sie können jeden Text mit dem Originalbuch vergleichen.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Was bedeutet das Schweigen im Orakelknochen-Modus?",
    answer:
      "Das Schweigen (沉默) ist der fünfte mögliche Urteilszustand im Orakelknochen-Modus und ist der Shang-Ahnenüberlieferung treu. In der ursprünglichen Tradition war es kein Fehler, wenn der Knochen keine lesbaren Risse produzierte; es war eine Antwort für sich: Die Ahnen sprechen nicht, weil der Moment für diese Frage noch nicht reif ist oder weil die Antwort das Sagbare übersteigt. Diese App respektiert diesen Zustand und gibt ihn zurück, wenn das Muster es anzeigt.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "Funktioniert die App in meiner Sprache?",
    answer:
      "Ja. Die App ist in 11 Sprachen verfügbar: Spanisch, Englisch, Portugiesisch, Französisch, Deutsch, Italienisch, Japanisch, Chinesisch, Koreanisch, Arabisch und Hindi. Die KI antwortet in der Sprache, in der Sie Ihre Frage stellen, ohne jede Konfiguration. Wenn Sie auf Französisch fragen, antwortet das Orakel auf Französisch. Wenn Sie auf Arabisch fragen, antwortet es auf Arabisch.",
  },
  {
    id: "privacy-consultations",
    question: "Sind meine Beratungen privat?",
    answer:
      "Ja. Ihre Fragen und Lesungen gehören Ihnen. Sie werden nicht mit Dritten geteilt, nicht zur Schulung von KI-Modellen verwendet und sind für andere Benutzer nicht sichtbar. Nur Sie können Ihren Chat-Verlauf einsehen. Sie können jedes Gespräch jederzeit im Bereich Chats löschen. Wenn Sie die in den Optionen verfügbare Zwei-Faktor-Authentifizierung (2FA) aktivieren, fügen Sie Ihrem Konto eine zusätzliche Schutzebene hinzu.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "Wie lang darf meine Frage an das Orakel sein?",
    answer:
      "Jede Konsultation erlaubt bis zu 1500 Zeichen (etwa 250-300 Wörter). Wir empfehlen, diesen Platz zu nutzen, um Ihre Situation detailliert zu beschreiben; je mehr Kontext Sie über Ihren aktuellen Moment und Ihre Gefühle angeben, desto tiefer und genauer wird die Interpretation sein, die das System aus dem erhaltenen Hexagramm generiert.",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_IT: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "Come funzionano i token, i pacchetti e il piano gratuito?",
    answer:
      "Ogni consultazione consuma token in base al tuo pacchetto attivo. La guida spiega il credito di prova, le dimensioni dei pacchetti e come il saldo si accumula. Acquisti e rinnovi sono regolati dai Termini.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "Quanto sono affidabili i testi dell'I Ching nell'app?",
    answer: "I testi sono estremamente affidabili. Abbiamo condotto un audit di integrità dei dati 1:1, verificando ogni esagramma rispetto a fonti accademiche come l'Università di Parma (traduzione Wilhelm), Sacred-Texts.com (Legge) e il Chinese Text Project (Zhou Yi). Eventuali errori di trascrizione trovati nei dataset originali sono stati corretti manualmente per garantire la precisione matematica e letteraria.",
  },
  {
    id: "yarrow-vs-coins",
    question: "In cosa differiscono i due metodi dell'I Ching: Tre Monete e Steli di Achillea?",
    answer:
      "Entrambi i metodi producono gli stessi 64 esagrammi e usano gli stessi testi dell'I Ching e le regole di Zhu Xi. Tre Monete è rapido e accessibile: si lanciano tre monete sei volte per formare le sei linee. Steli di Achillea è il metodo rituale più antico: si lavora con steli o oggetti simili attraverso una procedura più lenta e contemplativa. La scelta cambia l'esperienza rituale, non l'autorità della lettura. Usa Tre Monete per la rapidità; usa Steli di Achillea quando desideri il ritmo tradizionale.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "Che cos'è I Ching automatico vs manuale, e posso mescolare le Ossa nello stesso filo?",
    answer:
      "Automatico vs manuale vale solo per l'I Ching (Tre Monete o Steli di Achillea). In Opzioni i controlli del modo di lancio compaiono con l'I Ching selezionato: scegli Tre Monete o Steli di Achillea, poi automatico (il lancio avviene sul server) o manuale (inserisci i sei totali di linea 6/7/8/9 delle tue monete o steli). La modalità Ossa è sempre automatica; non esiste un flusso manuale per le ossa; rituale e verdetto provengono solo dall'algoritmo. Entro il limite di profondità per filo del tuo piano, puoi alternare liberamente I Ching e Ossa e cambiare metodi e modalità tra consultazioni; l'app memorizza le tue preferenze per la prossima lettura in I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Che cos'è il metodo degli Ossi Oracolari?",
    answer:
      "Gli Ossi Oracolari sono un metodo divinatorio dell'epoca Shang ispirato alla lettura delle crepe su piastroni di tartaruga e scapole di bue. Nell'app è separato dall'I Ching: non crea esagrammi né linee mutanti. Il sistema forma prima un pattern di crepe e un verdetto; poi l'IA interpreta quel risultato già formato nella tua lingua. Il verdetto rientra sempre in uno dei cinque stati possibili, fedeli al metodo ancestrale Shang: 1) 吉: chiaramente favorevole: il motivo conferma la carica positiva senza ambiguità; 2) 吉 moderato: moderatamente favorevole: c'è conferma ma con sfumature o condizioni; 3) 凶 moderato: moderatamente sfavorevole: il motivo pende verso la negazione con riserve; 4) 凶: chiaramente sfavorevole: il motivo nega la carica positiva senza ambiguità; 5) 沉默: Silenzio: il motivo non produce crepe leggibili e il silenzio stesso è la risposta. È utile per risposte concise, dal tono ancestrale; l'I Ching è più adatto ai cambiamenti stratificati nel tempo.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "Come funziona davvero l'I Ching e da dove arrivano le sue risposte?",
    answer:
      "L'I Ching opera attraverso 64 esagrammi, un catalogo millenario dei pattern di cambiamento nella natura e nella vita umana. Ogni esagramma è una figura strutturata con un significato classico preservato nei testi Wilhelm/Baynes. Ogni consultazione parte dalla tua domanda concreta. L'algoritmo matematico lancia le linee secondo le regole di Zhu Xi per determinare l'esagramma presente, le eventuali linee in movimento e l'esagramma futuro risultante. L'IA articola poi quel risultato già formato nella tua lingua, applicando il significato classico di quegli esagrammi al tuo contesto particolare. Per questo ogni lettura è unica e personale: gli stessi esagrammi possono comparire per persone diverse, ma la risposta non è mai la stessa, perché dipende dalla domanda specifica, dal momento di vita e dal contesto personale di chi consulta. Non esiste un'interpretazione universale applicabile a più di una persona contemporaneamente.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "Perché a volte non riesco ad «approfondire» ulteriormente nella stessa chat?",
    answer:
      "Ogni filo ammette un numero limitato di letture concatenate in base al tuo piano. Quando si raggiunge il limite, avvia una nuova sessione. La guida spiega Chat, nuova sessione e limiti per piano.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "Dove sono le mie conversazioni passate?",
    answer:
      "Apri «Chat» dall'intestazione per sfogliare i fili salvati, passare da uno all'altro o avviare una nuova sessione. La cronologia autenticata è legata al tuo account come descritto nella guida e nell'informativa sulla privacy.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "Posso esportare una lettura?",
    answer:
      "Sì, dopo una consultazione puoi esportare il filo come PDF dalle azioni della scheda di lettura dove disponibile. I dettagli sono nella guida.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "Quali dati conservate su di me e sulle mie letture?",
    answer:
      "L'informativa sulla privacy descrive le categorie di dati, la conservazione e come letture e immagini rimangono private per il tuo account. Integra (senza sostituire) la guida in-app.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "Dove trovo informazioni sulla fatturazione e sulle condizioni del servizio?",
    answer:
      "Le condizioni commerciali e l'uso accettabile si trovano nei Termini di Servizio. I pacchetti di token e i flussi di acquisto sono riassunti nella guida e nella pagina dei prezzi.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "Cos'è la Biblioteca e come la sblocco?",
    answer:
      "La Biblioteca è una sezione premium che contiene la collezione completa dei 64 esagrammi in tre opere letterarie: la traduzione classica di Wilhelm/Baynes, la versione di James Legge e il Zhou Yi originale. È pensata per lo studio personale e per confrontare i tuoi lanci manuali con fonti autentiche. Si sblocca in modo permanente acquistando qualsiasi pacchetto di token a pagamento.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "È disponibile l'autenticazione a due fattori (2FA)?",
    answer:
      "Sì, opzionale: puoi attivare 2FA (authenticator e/o codici email) dalla sicurezza dell'account nell'oracolo. La guida riassume come si integra con le consultazioni.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "Si tratta di una consulenza professionale?",
    answer:
      "No. Le interpretazioni sono strumenti culturali e riflessivi, non consigli medici, finanziari o professionali. Consulta le note sui metodi per il contesto e i termini per le esclusioni di responsabilità.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "Chi genera l'esagramma o il verdetto: l'IA o l'algoritmo?",
    answer:
      "L'algoritmo matematico, non l'IA. In modalità I Ching, l'algoritmo costruisce l'esagramma linea per linea e determina la linea dominante. In modalità Ossa, genera il motivo delle fessure e il verdetto. L'intelligenza artificiale interviene dopo: prende quel risultato già calcolato e lo articola in linguaggio naturale nella tua lingua, con il contesto della tua domanda. L'IA è l'interprete. L'oracolo è il metodo.",
  },
  {
    id: "authentic-texts",
    question: "I testi dell'I Ching che appaiono nella lettura sono autentici o generati dall'IA?",
    answer:
      "Sono autentici. I testi del Giudizio (卦辞), le sentenze delle linee in movimento (爻辞) e gli esagrammi risultanti provengono interamente dalla traduzione Wilhelm/Baynes (di pubblico dominio dal 2020). L'IA li cita e li contestualizza con la tua domanda, ma non li modifica né li sostituisce. Puoi confrontare qualsiasi testo con il libro originale.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Cosa significa il Silenzio nella modalità Ossa dell'Oracolo?",
    answer:
      "Il Silenzio (沉默) è il quinto stato di verdetto possibile nella modalità Ossa, ed è fedele all'antico metodo Shang. Nella tradizione originale, quando l'osso non produceva crepe leggibili, non era un errore; era una risposta in sé: gli antenati non parlano perché il momento non è maturo per quella domanda, o perché la risposta trascende ciò che può essere detto. Questa app rispetta quello stato e lo restituisce quando il modello lo indica.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "L'app funziona nella mia lingua?",
    answer:
      "Sì. L'app è disponibile in 11 lingue: spagnolo, inglese, portoghese, francese, tedesco, italiano, giapponese, cinese, coreano, arabo e hindi. L'IA risponde nella lingua in cui scrivi la tua domanda, senza alcuna configurazione. Se chiedi in francese, l'oracolo risponde in francese. Se chiedi in arabo, risponde in arabo.",
  },
  {
    id: "privacy-consultations",
    question: "Le mie consultazioni sono private?",
    answer:
      "Sì. Le tue domande e le tue letture sono tue. Non vengono condivise con terzi, non vengono utilizzate per addestrare modelli di IA e non sono visibili ad altri utenti. Solo tu puoi vedere la cronologia delle chat. Puoi eliminare qualsiasi conversazione in qualsiasi momento dalla sezione Chat. Se attivi l'autenticazione a due fattori (2FA) disponibile in Opzioni, aggiungi un ulteriore livello di protezione al tuo account.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "Quanto può essere lunga la mia domanda all'oracolo?",
    answer:
      "Ogni consultazione permette fino a 1500 caratteri (circa 250-300 parole). Ti consigliamo di approfittare di questo spazio per descrivere la tua situazione in dettaglio; più contesto fornirai sul tuo momento attuale e sui tuoi sentimenti, più profonda e accurata sarà l'interpretazione che il sistema genererà dall'esagramma ottenuto.",
    related: ["userGuide"],
  },
];

const FAQ_ITEMS_FR: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "Comment fonctionnent les tokens, les packs et le niveau gratuit ?",
    answer:
      "Chaque consultation consomme des tokens selon votre pack actif. Le guide explique le solde d'essai, les tailles de pack et comment le solde s'accumule. Les achats et renouvellements sont régis par les Conditions.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },
  {
    id: "data-reliability",
    question: "À quel point les textes du Yi King sont-ils fiables dans l'application ?",
    answer: "Les textes sont extrêmement fiables. Nous avons effectué un audit d'intégrité des données 1:1, en vérifiant chaque hexagramme par rapport à des sources académiques telles que l'Université de Parme (traduction Wilhelm), Sacred-Texts.com (Legge) et le Chinese Text Project (Zhou Yi). Toutes les erreurs de transcription détectées dans les ensembles de données sources originaux ont été corrigées manuellement pour garantir une exactitude mathématique et littéraire.",
  },
  {
    id: "yarrow-vs-coins",
    question: "Quelle est la différence entre les deux méthodes du I Ching: Trois Pièces et Tiges d'Achillée ?",
    answer:
      "Les deux méthodes produisent les mêmes 64 hexagrammes et utilisent les mêmes textes du I Ching ainsi que les règles de Zhu Xi. Trois Pièces est rapide et accessible: on lance trois pièces six fois pour former les six traits. Tiges d'Achillée est la méthode rituelle plus ancienne: on travaille avec des tiges ou des objets semblables selon un procédé plus lent et plus contemplatif. Le choix modifie l'expérience rituelle, non l'autorité de la lecture. Utilise Trois Pièces pour la rapidité; utilise les Tiges d'Achillée pour le rythme traditionnel.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "Qu'est-ce que le I Ching automatique vs manuel, et puis-je mélanger les Os dans le même fil ?",
    answer:
      "Automatique vs manuel ne concerne que le I Ching (Trois Pièces ou Tiges d'Achillée). Dans Options, les contrôles du mode de tirage apparaissent lorsque le I Ching est sélectionné : choisissez Trois Pièces ou Tiges d'Achillée, puis automatique (le tirage s'effectue sur le serveur) ou manuel (vous saisissez les six totaux de ligne 6/7/8/9 de vos pièces ou tiges). Le mode Os est toujours automatique ; il n'existe pas de flux manuel pour les os ; le rituel et le verdict viennent uniquement de l'algorithme. Dans la limite de profondeur par fil de votre forfait, vous pouvez librement alterner I Ching et Os et changer de méthode et de mode entre consultations ; l'application mémorise vos préférences pour la prochaine lecture en I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Qu'est-ce que la méthode des Os de l'Oracle ?",
    answer:
      "Les Os de l'Oracle sont une méthode divinatoire de l'époque Shang inspirée de la lecture des fissures sur des plastrons de tortue et des omoplates de bœuf. Dans l'app, elle est distincte du I Ching: elle ne crée pas d'hexagrammes ni de traits changeants. Le système forme d'abord un motif de fissures et un verdict; puis l'IA interprète ce résultat déjà formé dans ta langue. Le verdict tombe toujours dans l'un des cinq états possibles, fidèles à la méthode ancestrale Shang : 1) 吉: clairement favorable : le motif confirme la charge positive sans ambiguïté ; 2) 吉 modéré: modérément favorable : la confirmation est présente, mais nuancée ou conditionnée ; 3) 凶 modéré: modérément défavorable : le motif penche vers la négation avec des réserves ; 4) 凶: clairement défavorable : le motif nie la charge positive sans ambiguïté ; 5) 沉默: Silence : le motif ne produit pas de fissures lisibles et le silence lui-même est la réponse. Elle convient aux réponses concises, au ton ancestral ; le I Ching convient mieux aux changements stratifiés dans le temps.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "Comment le I Ching fonctionne-t-il réellement, et d'où viennent ses réponses ?",
    answer:
      "Le I Ching fonctionne grâce à 64 hexagrammes, un catalogue millénaire des motifs de changement dans la nature et la vie humaine. Chaque hexagramme est une figure structurée dont le sens classique est conservé dans les textes Wilhelm/Baynes. Chaque consultation part de votre question concrète. L'algorithme mathématique lance les traits selon les règles de Zhu Xi pour déterminer l'hexagramme présent, les éventuels traits en mouvement et l'hexagramme futur qui en résulte. L'IA articule ensuite ce résultat déjà formé dans votre langue, en appliquant le sens classique de ces hexagrammes à votre contexte particulier. C'est pourquoi chaque lecture est unique et personnelle : les mêmes hexagrammes peuvent apparaître pour des personnes différentes, mais la réponse n'est jamais la même, car elle dépend de la question concrète, du moment de vie et du contexte personnel du consultant. Il n'existe pas d'interprétation universelle applicable à plusieurs personnes en même temps.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "thread-depth",
    question: "Pourquoi parfois je ne peux pas «approfondir» davantage dans le même chat ?",
    answer:
      "Chaque fil admet un nombre limité de lectures enchaînées selon votre plan. Lorsque la limite est atteinte, démarrez une nouvelle session. Le guide explique les Chats, nouvelle session et les limites par plan.",
    related: ["userGuide", "tokenPacks"],
  },
  {
    id: "chats-drawer",
    question: "Où sont mes conversations passées ?",
    answer:
      "Ouvrez «Chats» dans l'en-tête pour consulter les fils enregistrés, passer de l'un à l'autre ou démarrer une nouvelle session. L'historique authentifié est lié à votre compte, comme indiqué dans le guide et la politique de confidentialité.",
    related: ["userGuide", "privacyPolicy"],
  },
  {
    id: "export-pdf",
    question: "Puis-je exporter une lecture ?",
    answer:
      "Oui, après une consultation, vous pouvez exporter le fil en PDF depuis les actions de la carte de lecture lorsqu'elles sont disponibles. Détails dans le guide.",
    related: ["userGuide"],
  },
  {
    id: "privacy-data",
    question: "Quelles données conservez-vous sur moi et mes lectures ?",
    answer:
      "La politique de confidentialité décrit les catégories de données, la rétention et comment lectures et images restent privées à votre compte. Elle complète (sans remplacer) le guide intégré.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question: "Où trouver les informations de facturation et les conditions de service ?",
    answer:
      "Les conditions commerciales et l'utilisation acceptable sont dans les Conditions de Service. Les packs de tokens et les flux de paiement sont résumés dans le guide et la page des tarifs.",
    related: ["termsOfService", "tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "Qu'est-ce que la Bibliothèque et comment la débloquer ?",
    answer:
      "La Bibliothèque est une section premium contenant la collection complète des 64 hexagrammes à travers trois œuvres littéraires : la traduction classique Wilhelm/Baynes, la version de James Legge et le Zhou Yi original. Elle est conçue pour l'étude personnelle et pour comparer vos tirages manuels avec des sources authentiques. Elle est débloquée de façon permanente à l'achat de tout pack de jetons payant.",
    related: ["tokenPacks"],
  },
  {
    id: "security-2fa",
    question: "L'authentification à deux facteurs (2FA) est-elle disponible ?",
    answer:
      "Oui, en option : vous pouvez activer 2FA (authenticator et/ou codes e-mail) depuis la sécurité du compte dans l'oracle. Le guide résume son interaction avec les consultations.",
    related: ["userGuide"],
  },
  {
    id: "not-advice",
    question: "S'agit-il d'un conseil professionnel ?",
    answer:
      "Non. Les interprétations sont des outils culturels et réflexifs, pas des conseils médicaux, financiers ou professionnels. Consultez les notes de méthodes pour le contexte et les conditions pour les clauses de non-responsabilité.",
    related: ["methodNotes", "termsOfService"],
  },
  {
    id: "ai-vs-algorithm",
    question: "Qui génère l'hexagramme ou le verdict: l'IA ou l'algorithme ?",
    answer:
      "L'algorithme mathématique, pas l'IA. En mode I Ching, l'algorithme construit l'hexagramme ligne par ligne et détermine la ligne directrice. En mode Os, il génère le motif de fissures et le verdict. L'intelligence artificielle intervient ensuite : elle prend ce résultat déjà calculé et l'articule en langage naturel dans votre langue, avec le contexte de votre question. L'IA est l'interprète. L'oracle est la méthode.",
  },
  {
    id: "authentic-texts",
    question: "Les textes du I Ching dans la lecture sont-ils authentiques ou générés par IA ?",
    answer:
      "Ils sont authentiques. Les textes du Jugement (卦辞), les sentences des lignes en mouvement (爻辞) et les hexagrammes résultants proviennent intégralement de la traduction Wilhelm/Baynes (dans le domaine public depuis 2020). L'IA les cite et les contextualise avec votre question, mais ne les modifie ni ne les remplace. Vous pouvez comparer n'importe quel texte avec le livre original.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Que signifie le Silence en mode Os de l'Oracle ?",
    answer:
      "Le Silence (沉默) est le cinquième état de verdict possible en mode Os, et il est fidèle à la méthode ancestrale Shang. Dans la tradition originale, lorsque l'os ne produisait pas de fissures lisibles, ce n'était pas une erreur; c'était une réponse en soi : les ancêtres ne parlent pas car le moment n'est pas mûr pour cette question, ou parce que la réponse transcende ce qui peut être dit. Cette app respecte cet état et le renvoie lorsque le motif l'indique.",
    related: ["methodNotes"],
  },
  {
    id: "language-support",
    question: "L'app fonctionne-t-elle dans ma langue ?",
    answer:
      "Oui. L'app est disponible en 11 langues : espagnol, anglais, portugais, français, allemand, italien, japonais, chinois, coréen, arabe et hindi. L'IA répond dans la langue dans laquelle vous posez votre question, sans aucune configuration. Si vous posez une question en français, l'oracle répond en français. Si vous posez une question en arabe, il répond en arabe.",
  },
  {
    id: "privacy-consultations",
    question: "Mes consultations sont-elles privées ?",
    answer:
      "Oui. Vos questions et lectures vous appartiennent. Elles ne sont pas partagées avec des tiers, ne sont pas utilisées pour entraîner des modèles d'IA et ne sont pas visibles par d'autres utilisateurs. Vous seul pouvez voir votre historique de chat. Vous pouvez supprimer n'importe quelle conversation à tout moment depuis la section Chats. Si vous activez l'authentification à deux facteurs (2FA) disponible dans Options, vous ajoutez une couche supplémentaire de protection à votre compte.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "prompt-length",
    question: "Quelle peut être la longueur de ma question à l'oracle ?",
    answer:
      "Chaque consultation permet jusqu'à 1500 caractères (environ 250-300 mots). Nous vous recommandons de profiter de cet espace pour décrire votre situation en détail ; plus vous fournirez de contexte sur votre moment actuel et vos sentiments, plus l'interprétation générée par le système à partir du hexagramme obtenu sera profonde et précise.",
    related: ["userGuide"],
  },
];

const FAQ_PAGE_META: Record<AppLocale, Pick<FaqPageUi, "title" | "intro" | "seeAlsoHeading">> = {
  es: {
    title: "Preguntas frecuentes",
    intro:
      "Respuestas breves enlazadas con la guía de uso, las notas de métodos, privacidad, términos y precios. Para el detalle paso a paso, abre los documentos indicados.",
    seeAlsoHeading: "Ver también",
  },
  en: {
    title: "Frequently asked questions",
    intro:
      "Short answers with pointers to the user guide, method notes, privacy policy, terms, and pricing. Open the linked docs for full step-by-step detail.",
    seeAlsoHeading: "See also",
  },
  pt: {
    title: "Perguntas frequentes",
    intro:
      "Respostas curtas com ligações ao guia, notas de métodos, privacidade, termos e preços. Abra os documentos indicados para o passo a passo completo.",
    seeAlsoHeading: "Ver também",
  },
  fr: {
    title: "Foire aux questions",
    intro:
      "Réponses courtes avec renvois vers le guide, les notes de méthodes, la confidentialité, les conditions et les tarifs. Ouvrez les pages liées pour le détail.",
    seeAlsoHeading: "Voir aussi",
  },
  de: {
    title: "FAQ",
    intro:
      "Kurzantworten mit Verweisen auf Leitfaden, Methodennotizen, Datenschutz, AGB und Preise. Für Details die verlinkten Seiten öffnen.",
    seeAlsoHeading: "Siehe auch",
  },
  it: {
    title: "Domande frequenti",
    intro:
      "Risposte brevi con rimandi alla guida, alle note sui metodi, privacy, termini e prezzi. Apri i documenti collegati per i passaggi completi.",
    seeAlsoHeading: "Vedi anche",
  },
  ja: {
    title: "よくある質問",
    intro:
      "利用ガイド、方法の注記、プライバシー、利用規約、料金ページへの短い案内です。詳しい手順はリンク先のドキュメントをご覧ください。",
    seeAlsoHeading: "関連リンク",
  },
  zh: {
    title: "常见问题",
    intro:
      "简明回答，并链接到使用指南、方法说明、隐私政策、服务条款与定价页。完整步骤请参阅对应文档。",
    seeAlsoHeading: "另见",
  },
  ko: {
    title: "자주 묻는 질문",
    intro:
      "사용 안내, 방법 노트, 개인정보 처리방침, 서비스 약관, 요금 페이지로 안내하는 짧은 답변입니다. 자세한 절차는 링크된 문서를 확인하세요.",
    seeAlsoHeading: "관련 문서",
  },
  ar: {
    title: "الأسئلة الشائعة",
    intro:
      "إجابات مختصرة مع إشارات إلى دليل المستخدم وملاحظات المنهج وسياسة الخصوصية والشروط والأسعار. افتح الوثائق المرتبطة للاطلاع على التفاصيل الكاملة خطوة بخطوة.",
    seeAlsoHeading: "انظر أيضاً",
  },
  hi: {
    title: "अक्सर पूछे जाने वाले प्रश्न",
    intro:
      "उपयोगकर्ता मार्गदर्शिका, पद्धति नोट्स, गोपनीयता नीति, शर्तों और मूल्य निर्धारण के संदर्भ के साथ संक्षिप्त उत्तर। चरण-दर-चरण विवरण के लिए लिंक किए गए दस्तावेज़ खोलें।",
    seeAlsoHeading: "यह भी देखें",
  },
};

export function getFaqPageUiMessages(locale: AppLocale): FaqPageUi {
  const meta = FAQ_PAGE_META[locale] ?? FAQ_PAGE_META[DEFAULT_LOCALE];
  const itemsMap: Record<AppLocale, FaqItem[]> = {
    en: FAQ_ITEMS_EN,
    es: FAQ_ITEMS_ES,
    pt: FAQ_ITEMS_PT,
    fr: FAQ_ITEMS_FR,
    de: FAQ_ITEMS_DE,
    it: FAQ_ITEMS_IT,
    ja: FAQ_ITEMS_JA,
    zh: FAQ_ITEMS_ZH,
    ko: FAQ_ITEMS_KO,
    ar: FAQ_ITEMS_AR,
    hi: FAQ_ITEMS_HI,
  };
  const localeItems = itemsMap[locale] ?? FAQ_ITEMS_EN;
  const titles = FAQ_CATEGORY_TITLES[locale] ?? FAQ_CATEGORY_TITLES[DEFAULT_LOCALE];

  const itemById = new Map<string, FaqItem>();
  for (const item of localeItems) {
    itemById.set(item.id, item);
  }

  const categories: FaqCategory[] = [];
  const usedIds = new Set<string>();
  for (const categoryId of FAQ_CATEGORY_ORDER) {
    const orderedIds = FAQ_ITEMS_BY_CATEGORY[categoryId];
    const categoryItems: FaqItem[] = [];
    for (const id of orderedIds) {
      const item = itemById.get(id);
      if (item) {
        categoryItems.push(item);
        usedIds.add(id);
      }
    }
    if (categoryItems.length > 0) {
      categories.push({
        id: categoryId,
        title: titles[categoryId],
        items: categoryItems,
      });
    }
  }

  // Any item not assigned to a category falls back into the last group so we
  // never silently drop translations during refactors.
  const orphans = localeItems.filter((item) => !usedIds.has(item.id));
  if (orphans.length > 0) {
    const fallbackTitle = titles["app-usage"];
    const existing = categories.find((cat) => cat.id === "app-usage");
    if (existing) {
      existing.items = [...existing.items, ...orphans];
    } else {
      categories.unshift({ id: "app-usage", title: fallbackTitle, items: orphans });
    }
  }

  const items = categories.flatMap((category) => category.items);
  return { ...meta, categories, items };
}
