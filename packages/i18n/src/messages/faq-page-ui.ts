import type { DocNavUiMessages } from "./doc-nav-ui.js";
import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type FaqRelatedSlug =
  | "oracleHome"
  | "userGuide"
  | "userGuideGettingStarted"
  | "tokenPacks"
  | "methodNotes"
  | "fidelityAudits"
  | "privacyPolicy"
  | "termsOfService"
  | "pricing";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  related?: FaqRelatedSlug[];
  moreInfoLink?: { href: string; label: string };
};

export type FaqCategoryId =
  | "app-usage"
  | "oracle-methods"
  | "ai-texts"
  | "tokens-payments"
  | "privacy-account"
  | "premium-features";

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
  "premium-features",
  "privacy-account",
];

const FAQ_ITEMS_BY_CATEGORY: Record<FaqCategoryId, string[]> = {
  "app-usage": [
    "language-support",
    "chats-drawer",
    "thread-depth",
    "export-pdf",
    "prompt-length",
  ],
  "oracle-methods": [
    "iching-how-answers",
    "iching-mutation-rules",
    "yarrow-vs-coins",
    "iching-manual-auto-bones",
    "oracle-bones-method",
  ],
  "ai-texts": [
    "ai-vs-algorithm",
    "authentic-texts",
    "library-source-language",
    "zhouyi-no-commentary",
    "data-reliability",
    "not-advice",
  ],
  "tokens-payments": ["tokens-packs", "purchases-legal"],
  "premium-features": ["translators-three", "tier-features", "master-tokens-cost", "library-unlock"],
  "privacy-account": ["privacy-consultations", "privacy-data", "security-2fa", "delete-chats", "delete-account"],
};

const FAQ_CATEGORY_TITLES: Record<AppLocale, Record<FaqCategoryId, string>> = {
  es: {
    "app-usage": "Uso de la app",
    "oracle-methods": "Métodos del oráculo",
    "ai-texts": "Textos, IA y autenticidad",
    "tokens-payments": "Tokens, packs y pagos",
      "premium-features": "Funcionalidades Premium",
    "privacy-account": "Privacidad y cuenta",
  },
  en: {
    "app-usage": "Using the app",
    "oracle-methods": "Oracle methods",
    "ai-texts": "Texts, AI and authenticity",
    
      "premium-features": "Premium features",
      "tokens-payments": "Tokens, packs and payments",
      "privacy-account": "Privacy and account",
  },
  pt: {
    "app-usage": "Uso da app",
    "oracle-methods": "Métodos do oráculo",
    "ai-texts": "Textos, IA e autenticidade",
    
      "premium-features": "Funcionalidades Premium",
      "tokens-payments": "Tokens, packs e pagamentos",
      "privacy-account": "Privacidade e conta",
  },
  fr: {
    "app-usage": "Utilisation de l’app",
    "oracle-methods": "Méthodes de l’oracle",
    "ai-texts": "Textes, IA et authenticité",
    
      "premium-features": "Fonctionnalités Premium",
      "tokens-payments": "Tokens, packs et paiements",
      "privacy-account": "Confidentialité et compte",
  },
  de: {
    "app-usage": "App-Nutzung",
    "oracle-methods": "Orakel-Methoden",
    "ai-texts": "Texte, KI und Echtheit",
    
      "premium-features": "Premium-Funktionen",
      "tokens-payments": "Token, Packs und Zahlungen",
      "privacy-account": "Datenschutz und Konto",
  },
  it: {
    "app-usage": "Uso dell’app",
    "oracle-methods": "Metodi dell’oracolo",
    "ai-texts": "Testi, IA e autenticità",
    
      "premium-features": "Funzionalità Premium",
      "tokens-payments": "Token, pack e pagamenti",
      "privacy-account": "Privacy e account",
  },
  ja: {
    "app-usage": "アプリの使い方",
    "oracle-methods": "占いの方式",
    "ai-texts": "テキスト・AI・原典性",
    
      "premium-features": "プレミアム機能",
      "tokens-payments": "トークン・パック・支払い",
      "privacy-account": "プライバシーとアカウント",
  },
  zh: {
    "app-usage": "应用使用",
    "oracle-methods": "占卜方法",
    "ai-texts": "文本、AI 与真实性",
    
      "premium-features": "高级功能",
      "tokens-payments": "代币、套餐与支付",
      "privacy-account": "隐私与账户",
  },
  ko: {
    "app-usage": "앱 사용",
    "oracle-methods": "점법",
    "ai-texts": "원문·AI·진본성",
    
      "premium-features": "프리미엄 기능",
      "tokens-payments": "토큰, 팩 및 결제",
      "privacy-account": "개인정보와 계정",
  },
  ar: {
    "app-usage": "استخدام التطبيق",
    "oracle-methods": "طرق العرافة",
    "ai-texts": "النصوص والذكاء الاصطناعي والأصالة",
    
      "premium-features": "الميزات المتميزة",
      "tokens-payments": "الرموز والحزم والمدفوعات",
      "privacy-account": "الخصوصية والحساب",
  },
  hi: {
    "app-usage": "ऐप का उपयोग",
    "oracle-methods": "ओरेकल विधियाँ",
    "ai-texts": "मूल पाठ, एआई और प्रामाणिकता",
    
      "premium-features": "प्रीमियम सुविधाएँ",
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
      return "/guia#modos-consulta";
    case "tokenPacks":
      return "/";
    case "methodNotes":
      return "/notes";
    case "fidelityAudits":
      return "/audits";
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
    case "fidelityAudits":
      return nav.fidelityAudits;
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
      "For up-to-date information on packs, token prices, and your current balance, open the Token Center from the app header. It shows your available tokens, the thread limit per plan, and a direct link to purchase. Access requires a valid account.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "How reliable are the I Ching texts provided in the app?",
    answer:
      "Reliability means the oracle text you read, the Judgment, the Image, and each line, is never written or altered by AI. It is a direct citation checked word for word against a named published source. The English text comes from Richard Wilhelm and Cary F. Baynes (The I Ching or Book of Changes, Princeton University Press, 1950) and from James Legge (The Sacred Books of the East, vol. XVI, Oxford, 1882); the classical Chinese Zhou Yi comes from the Chinese Text Project. The changing-line rules come from Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) and, for the classical alternative, from Zhu Xi's Yixue Qimeng in Joseph Adler's translation (Introduction to the Study of the Classic of Change, 2002). The AI interprets these already-cited texts for your question; it never generates or rewrites them. See the Fidelity Audits page for the full verification log.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question:
      "What are the two I Ching casting methods: Three Coins and Yarrow Stalks?",
    answer:
      "Both methods produce the same 64 hexagrams and use the same I Ching texts and the same classical line-selection rules. Three Coins is quick and accessible: you cast three coins six times to build the six lines. Yarrow Stalks is the older ritual method: you work with counted stalks or similar objects through a slower, more contemplative procedure. The choice changes the ritual experience, not the authority of the reading. Use Three Coins for speed; use Yarrow Stalks when you want the traditional rhythm.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "What is automatic vs manual I Ching, and can I mix Oracle Bones in the same thread?",
    answer:
      "Automatic vs manual applies only to I Ching (Three Coins or Yarrow Stalks). In Options the cast-mode controls appear when I Ching is selected: choose Three Coins or Yarrow Stalks, then choose automatic (the cast runs on the server) or manual (you enter the six line totals 6/7/8/9 from your own coins or stalks). Oracle Bones is always automatic; there is no manual bones flow; the oracle synthesizes crack patterns to generate a personal response tuned to your unique situation. Within your plan’s per-thread depth cap, you may freely alternate I Ching and Oracle Bones and switch methods and modes between consultations; your preferences are remembered for the next I Ching reading.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "What is the Oracle Bones method?",
    answer:
      "Oracle Bones is a Shang-era divination method inspired by crack reading on turtle plastrons and ox scapulae. In the app it is separate from I Ching: it does not create hexagrams or changing lines. The system forms a crack pattern and verdict first, then the AI interprets that already formed result in your language. The verdict always falls into one of four possible states, inspired by the Shang tradition: 1) 吉: clearly favorable, the pattern confirms the positive charge without ambiguity; 2) 吉 moderate: moderately favorable, confirmation with nuances or conditions; 3) 凶 moderate: moderately unfavorable, the pattern leans toward negation with reservations; 4) 凶: clearly unfavorable, the pattern negates the positive charge without ambiguity. It is useful for concise, ancestral-style answers; I Ching is better for layered change over time. This method draws on a tradition far older than the I Ching, often described as standing at the root of the yin-yang principle. Its full original procedure isn't known with certainty; this is a respectful modern simplification meant to keep that legacy present, not a literal reconstruction.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "How does the I Ching actually work and produce its answers?",
    answer:
      "The I Ching works through 64 hexagrams that form an ancient catalog of patterns of change in nature and human life. Each hexagram is a structured figure with classical meaning preserved in the classical works of Wilhelm (1924), James Legge, or the original Zhou Yi text. Each consultation begins from your specific question. The mathematical algorithm casts the lines under the classical line-selection rules (Alfred Huang's reduction system) to determine the present hexagram, any moving lines, and the resulting future hexagram. The AI then articulates that already-formed result in your language, applying the classical meaning of those hexagrams to your particular context. That is why every reading is unique and personal: the same hexagrams can appear for different people, but the answer is never the same, because it depends on the specific question, the moment in life, and the personal context of the seeker. There is no universal interpretation that applies to more than one person at the same time.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "What rule system determines which line text governs an I Ching reading?",
    answer:
      "The app supports two systems for resolving changing lines to the line text, or texts, that governs a reading. Alfred Huang's reduction system (The Complete I Ching, 10th Anniversary Edition, 2010) is the default: a clear, modern rule set that always resolves any combination of changing lines to one precise governing passage. Zhu Xi's classical reading (朱熹, 1130-1200 CE; Yixue Qimeng, in Joseph Adler's translation) is the traditional alternative: an older method that, in several cases, reads both lines or both Judgments instead of reducing to one. Switch between them with the Changing-line reading selector in Options; your choice is remembered for that reading.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "Why can I sometimes not “deepen” further in the same chat?",
    answer:
      "Each chat thread allows a limited chain of readings depending on your plan. When the cap is reached, start a new session. Check your current thread limit in the Token Center (app header).",
    related: ["tokenPacks"],
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
      "For billing and token purchases, open the Token Center from the app header. Access requires a valid account. Commercial terms and acceptable use are in the Terms of Service.",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "Is two-factor authentication available?",
    answer:
      "Optional 2FA (authenticator and/or email codes) can be enabled from account security in the oracle. The guide summarizes how it interacts with consultations.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "How do I delete a chat or conversation?",
    answer:
      "Open the Chats section from the app header. Tap the delete option shown on each thread. Deletion is immediate and permanent.",
  },
  {
    id: "delete-account",
    question: "How do I delete my account and all my data?",
    answer:
      "Open Options in the app (button at the bottom of the screen), scroll to Delete account, and tap Delete my account. In the confirmation dialog, type DELETE and confirm. Your account is deleted immediately and you are signed out automatically. What gets deleted: your user profile and login credentials, all consultation sessions and chat history, token balance and usage records, two-factor authentication configuration, and all personal preferences. Our payment gateway providers retain purchase records for tax and billing purposes as required by applicable regulations. If you cannot sign in, email support@theoriginaliching.com with your registered address. We will process your request within 30 days.",
    moreInfoLink: { href: "/delete-account", label: "For more information, see the account deletion page →" },
    related: ["privacyPolicy"],
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
    question:
      "Are the I Ching texts that appear in the reading authentic or AI-generated?",
    answer:
      "They are authentic. The textual material (Judgments (卦辞), lines in motion (爻辞), and resulting hexagrams) is drawn from three scholarly sources available in the app: Wilhelm (1924) (Eugen Diederichs Verlag), James Legge (public domain), and the original Zhou Yi. Cary Baynes's 1950 English rendering of Wilhelm (Princeton University Press) is also available as a comparative reference. The AI cites and contextualises the relevant texts with your question, but does not modify or replace them. You can compare any text with the original source.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "Why doesn't the Library's hexagram text change language when I switch the app's language?",
    answer:
      "It is shown exactly as published. Wilhelm (1924) and Legge appear in scholarly English, and the Zhou Yi in classical Chinese, the same words across all 11 interface languages. Re-translating a translation would replace the translator's own wording with a paraphrase and could distort decades of established scholarship. The goal is to give you direct access to the most reliable published source, not a derivative version of it. This is different from your AI consultation, which always answers in the language of your question: there the AI interprets an already-formed result for you, it does not present a primary text.",
    moreInfoLink: { href: "/library", label: "Open the Library →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "Why doesn't the Zhou Yi tab in the Library show any \"+\" commentary like Wilhelm or Legge?",
    answer:
      "Because there is none to show. The Zhou Yi is the oldest core text, without any later layer of commentary attached: only the Judgment, the Image, and the line oracles, exactly as it circulated before later scholars added their own readings. Wilhelm's tab adds his own commentary plus the Confucian Ten Wings; Legge's tab adds his footnotes plus the Great and Lesser Symbolism from his Appendix II. Zhou Yi has neither, on purpose: it is the root text those later commentaries were written about, not a version that received one of its own.",
    moreInfoLink: { href: "/library", label: "Open the Library →" },
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
  {
    id: "translators-three",
    question: "What are the three translators available in the app?",
    answer:
      "The app draws on three classical translations of the I Ching, shown as separate tabs. Richard Wilhelm and Cary F. Baynes (Princeton University Press, 1950) is the most widely read Western edition, with extensive commentary. James Legge (The Sacred Books of the East, vol. XVI, 1882) is the pioneering English scholarly translation, with his own footnotes and symbolism. The Zhou Yi is the original classical Chinese text itself, the root all later commentaries were written about, shown with no added commentary layer. All three describe the same 64 hexagrams; they differ in scholarly voice, language, and how much explanatory material surrounds the core text.",
  },
  {
    id: "tier-features",
    question: "What does each pack include, beyond tokens?",
    answer:
      "Free includes I Ching (Three Coins or Yarrow Stalks, automatic or manual) and Oracle Bones, with the Wilhelm (1924) translator. Seeker adds the full Library and the Legge translator. Practitioner adds the original Zhou Yi text. Master adds the Master (3) synthesis, which triangulates all three translators at once. For current token amounts, thread limits, and how to purchase, open the Token Center from the app header.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "How does the Master (3) synthesis work and why is it so powerful?",
    answer:
      "The Master (3) function performs a Personalised Synthesis: it simultaneously triangulates the three root sources (Wilhelm, Legge, and the original Zhou Yi) to distil a coherent verdict. The result is a unified interpretation that offers a powerful and immediate 'Concrete Answer', followed by an in-depth comparative analysis crafted uniquely for your situation and adapted with complete fidelity to the personal context of your consultation. Each Master (3) consultation consumes 2 tokens.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "What is the Library and how do I access it?",
    answer:
      "The Library is the complete compendium of the 64 hexagrams and the three full literary works. Access is permanently unlocked upon purchasing any paid pack (Seeker or above).",
  },
];

const FAQ_ITEMS_ES: FaqItem[] = [
  {
    id: "translators-three",
    question: "¿Cuáles son los tres traductores disponibles en la app?",
    answer: "La app se apoya en tres traducciones clásicas del I Ching, mostradas como pestañas separadas. Richard Wilhelm y Cary F. Baynes (Princeton University Press, 1950) es la edición occidental más leída, con un comentario extenso. James Legge (The Sacred Books of the East, vol. XVI, 1882) es la traducción académica pionera en inglés, con sus propias notas y simbolismo. El Zhou Yi es el texto original en chino clásico, la raíz sobre la que se escribieron los comentarios posteriores, mostrado sin ninguna capa de comentario añadida. Los tres describen los mismos 64 hexagramas; difieren en la voz del traductor, el idioma y cuánto material explicativo rodea al texto central.",
  },
  {
    id: "tier-features",
    question: "¿Qué incluye cada pack, además de los tokens?",
    answer: "Free incluye el I Ching (Tres Monedas o Varillas de Milenrama, automático o manual) y los Huesos de Oráculo, con el traductor Wilhelm (1924). Seeker añade la Biblioteca completa y el traductor Legge. Practitioner añade el texto original del Zhou Yi. Master añade la síntesis Master (3), que triangula los tres traductores a la vez. Para ver cantidades de tokens vigentes, límites por hilo y cómo comprar, abre el Centro de tokens desde el encabezado de la app.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "¿Cómo funciona la síntesis Master (3) y por qué es tan potente?",
    answer: "La función Master (3) realiza una Síntesis Personalizada: triangula simultáneamente las tres fuentes raíz (Wilhelm, Legge y el Zhou Yi original) para destilar un veredicto coherente. El resultado es una interpretación unificada que ofrece una 'Respuesta Concreta' potente e inmediata, seguida de un análisis comparativo profundo elaborado de forma única para tu situación y adaptado con total fidelidad al contexto personal de tu consulta.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "¿Qué es la Biblioteca y cómo se accede?",
    answer: "Es el compendio completo de los 64 hexagramas y las tres obras literarias íntegras. El acceso se desbloquea de forma permanente al adquirir cualquier pack de pago (Seeker en adelante).",
  },

  
  {
    id: "tokens-packs",
    question: "¿Cómo funcionan los tokens, los packs y el plan gratuito?",
    answer:
      "Para información actualizada sobre packs, precios y tu saldo de tokens, abre el Centro de tokens desde la cabecera de la app. Ahí encontrarás tus tokens disponibles, el límite por hilo según tu plan y el enlace directo para comprar. El acceso al Centro de tokens requiere una cuenta válida.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "¿Qué tan fiables son los textos del I Ching en la aplicación?",
    answer:
      "Fiabilidad significa que el texto del oráculo que lees, el Juicio, la Imagen y cada línea, nunca es escrito ni alterado por la IA. Es una cita directa, verificada palabra por palabra contra una fuente publicada con nombre propio. El texto en inglés proviene de Richard Wilhelm y Cary F. Baynes (The I Ching or Book of Changes, Princeton University Press, 1950) y de James Legge (The Sacred Books of the East, vol. XVI, Oxford, 1882); el Zhou Yi en chino clásico proviene del Chinese Text Project. Las reglas de líneas cambiantes provienen de Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) y, para la alternativa clásica, del Yixue Qimeng de Zhu Xi en la traducción de Joseph Adler (Introduction to the Study of the Classic of Change, 2002). La IA interpreta estos textos ya citados para tu pregunta; nunca los genera ni los reescribe. Consulta la página Auditorías de fidelidad para el registro completo de verificación.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question:
      "¿En qué se diferencian los dos métodos del I Ching: Tres Monedas y Varillas?",
    answer:
      "Ambos métodos producen los mismos 64 hexagramas y usan los mismos textos del I Ching y las mismas reglas clásicas de selección de línea. Tres Monedas es rápido y accesible: lanzas tres monedas seis veces para formar las seis líneas. Varillas de Milenrama es el método ritual más antiguo: trabajas con varillas u objetos similares mediante un procedimiento más lento y contemplativo. La elección cambia la experiencia ritual, no la autoridad de la lectura. Usa Tres Monedas para rapidez; usa Varillas cuando quieras el ritmo tradicional.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "¿Qué es el I Ching automático frente al manual, y puedo mezclar Huesos en el mismo hilo?",
    answer:
      "Lo automático frente a manual solo aplica al I Ching (Tres Monedas o Varillas de Milenrama). En Opciones los controles de modo de tirada aparecen cuando I Ching está seleccionado: elige Tres Monedas o Varillas de Milenrama, luego automático (la tirada se ejecuta en el servidor) o manual (introduces los seis totales de línea 6/7/8/9 con tus propias monedas o varillas). El modo Huesos es siempre automático; no hay flujo manual de huesos; el oráculo sintetiza los patrones de grietas para generar una respuesta personal y adecuada a tu situación única. Dentro del tope de profundidad por hilo de tu plan, puedes alternar libremente I Ching y Huesos y cambiar métodos y modos entre consultas; la app guarda tus preferencias para la próxima lectura en I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "¿Qué es el método de Huesos de Oráculo?",
    answer:
      "Huesos de Oráculo es un método de adivinación de la era Shang inspirado en la lectura de grietas sobre plastrones de tortuga y escápulas de buey. En la app está separado del I Ching: no crea hexagramas ni líneas cambiantes. El sistema forma primero un patrón de grietas y un veredicto; después la IA interpreta ese resultado ya formado en tu idioma. El veredicto cae siempre en uno de cuatro estados posibles, inspirados en el método ancestral Shang: 1) 吉, favorable claro: el patrón confirma la carga positiva sin ambigüedad; 2) 吉 moderado, favorable moderado: hay confirmación pero con matices o condiciones; 3) 凶 moderado, desfavorable moderado: el patrón se inclina a la negación con reservas; 4) 凶, desfavorable claro: el patrón niega la carga positiva sin ambigüedad. Es útil para respuestas concisas, de tono ancestral; el I Ching es mejor para cambios por capas a lo largo del tiempo. Este método se basa en una tradición mucho más antigua que el I Ching, que muchos sitúan en la raíz misma del principio yin-yang. No se conoce con certeza su procedimiento original completo; lo que ofrecemos aquí es una simplificación moderna y respetuosa pensada para mantener presente ese legado, no una reconstrucción literal.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "¿Cómo opera el I Ching y de dónde salen sus respuestas?",
    answer:
      "El I Ching opera a través de 64 hexagramas que forman un catálogo milenario de patrones de cambio en la naturaleza y en la vida humana. Cada hexagrama es una figura estructurada con un significado clásico preservado en las obras clásicas de Wilhelm (1924), James Legge o el texto original Zhou Yi. Cada consulta parte de tu pregunta concreta. El algoritmo matemático lanza las líneas bajo las reglas clásicas de selección de línea (el sistema de reducción de Alfred Huang) para determinar el hexagrama presente, las líneas en movimiento si las hay y el hexagrama futuro resultante. Después la IA articula ese resultado ya formado en tu idioma, aplicando el significado clásico de esos hexagramas a tu contexto particular. Por eso cada lectura es única y personal: los mismos hexagramas pueden aparecer para distintas personas, pero la respuesta no es la misma, porque depende de la pregunta concreta, del momento vital y del contexto personal del consultante. No existe una interpretación universal aplicable a más de una persona a la vez.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "¿Qué sistema de reglas determina qué texto de línea gobierna una lectura del I Ching?",
    answer:
      "La app admite dos sistemas para resolver qué texto de línea, o textos, gobierna una lectura cuando hay líneas cambiantes. El sistema de reducción de Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) es el predeterminado: un conjunto de reglas claro y moderno que siempre reduce cualquier combinación de líneas cambiantes a un único pasaje gobernante preciso. La lectura clásica de Zhu Xi (朱熹, 1130-1200 d.C.; Yixue Qimeng, en la traducción de Joseph Adler) es la alternativa tradicional: un método más antiguo que, en varios casos, lee ambas líneas o ambos Juicios en vez de reducir a uno solo. Cambia entre ambos con el selector «Lectura de líneas cambiantes» en Opciones; tu elección se recuerda para esa lectura.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "¿Por qué a veces no puedo “profundizar” más en el mismo chat?",
    answer:
      "Cada hilo admite un número limitado de lecturas encadenadas según tu plan. Al llegar al tope, abre una nueva sesión. Consulta tu límite actual por hilo en el Centro de tokens (cabecera de la app).",
    related: ["tokenPacks"],
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
    question: "¿Qué datos guardan sobre mí y mis lecturas?",
    answer:
      "La política de privacidad describe categorías de datos, conservación y cómo lecturas e imágenes permanecen privadas por usuario. Complementa la guía dentro de la app.",
    related: ["privacyPolicy", "userGuide"],
  },
  {
    id: "purchases-legal",
    question:
      "¿Dónde encuentro información sobre facturación y condiciones del servicio?",
    answer:
      "Para información sobre facturación y compra de tokens, abre el Centro de tokens desde la cabecera de la app. El acceso requiere una cuenta válida. Las condiciones comerciales y el uso aceptable están en los Términos del servicio.",
    related: ["tokenPacks", "termsOfService"],
  },

  {
    id: "security-2fa",
    question: "¿Hay autenticación en dos pasos (2FA)?",
    answer:
      "Sí, opcional: puedes activar 2FA (authenticator y/o email) desde la seguridad de la cuenta en el oráculo. La guía resume cómo encaja con las consultas.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "¿Cómo elimino un chat o conversación?",
    answer:
      "Abre la sección «Chats» desde la cabecera de la app. Usa la opción de eliminar que aparece en cada hilo. La eliminación es inmediata y permanente.",
  },
  {
    id: "delete-account",
    question: "¿Cómo elimino mi cuenta y todos mis datos?",
    answer:
      "Abre Opciones en la app (botón en el pie del compositor), desplázate hasta Eliminar cuenta y toca Eliminar mi cuenta. En el diálogo de confirmación, escribe ELIMINAR y confirma. Tu cuenta se elimina de inmediato y la sesión se cierra automáticamente. Se eliminan: tu perfil de usuario y credenciales de acceso, todas las sesiones de consulta e historial de chat, el saldo de tokens y registros de uso, la configuración de 2FA y todas las preferencias personales. Los proveedores de pasarela de pago conservan los registros de compras para efectos fiscales conforme a las regulaciones aplicables. Si no puedes iniciar sesión, escríbenos a support@theoriginaliching.com con tu email registrado. Procesaremos tu solicitud en 30 días.",
    moreInfoLink: { href: "/delete-account", label: "Para más información, visita la página de eliminación de cuenta →" },
    related: ["privacyPolicy"],
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
    question:
      "¿Quién genera el hexagrama o el veredicto: la IA o el algoritmo?",
    answer:
      "El algoritmo matemático, no la IA. En el modo I Ching, el algoritmo construye el hexagrama línea por línea y determina la línea regente. En el modo Huesos, genera el patrón de grietas y el veredicto. La inteligencia artificial interviene después: toma ese resultado ya calculado y lo articula en lenguaje natural en tu idioma, con el contexto de tu pregunta. La IA es el intérprete. El oráculo es el método.",
  },
  {
    id: "authentic-texts",
    question:
      "¿Los textos del I Ching que aparecen en la lectura son auténticos o generados por IA?",
    answer:
      "Son auténticos. El material textual (Juicios (卦辞), líneas en movimiento (爻辞) y hexagramas resultantes) proviene de tres fuentes académicas disponibles en la app: Wilhelm (1924) (Eugen Diederichs Verlag), James Legge (dominio público) y el Zhou Yi original. La versión inglesa de Cary Baynes (Princeton University Press, 1950) también está disponible como referencia comparativa. La IA los cita y contextualiza con tu pregunta, pero no los modifica ni los reemplaza. Puedes contrastar cualquier texto con la fuente original.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "¿Por qué el texto de los hexagramas en la Biblioteca no cambia de idioma al cambiar el idioma de la app?",
    answer:
      "Se muestra tal como fue publicado. Wilhelm (1924) y Legge aparecen en su inglés académico, y el Zhou Yi en chino clásico, las mismas palabras en los 11 idiomas de la interfaz. Volver a traducir una traducción reemplazaría las palabras propias del traductor por una paráfrasis y podría distorsionar décadas de trabajo académico ya establecido. El objetivo es darte acceso directo a la fuente publicada más fiable, no a una versión derivada de ella. Esto es distinto de tu consulta con la IA, que siempre responde en el idioma de tu pregunta: ahí la IA interpreta para ti un resultado ya formado, no presenta un texto primario.",
    moreInfoLink: { href: "/library", label: "Abre la Biblioteca →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "¿Por qué la pestaña Zhou Yi en la Biblioteca no muestra ningún comentario con \"+\" como Wilhelm o Legge?",
    answer:
      "Porque no hay ninguno que mostrar. El Zhou Yi es el texto núcleo más antiguo, sin ninguna capa posterior de comentario añadida: solo el Juicio, la Imagen y los oráculos de cada línea, tal como circulaba antes de que eruditos posteriores agregaran sus propias lecturas. La pestaña de Wilhelm añade su propio comentario más las Diez Alas confucianas; la de Legge añade sus notas más el Gran y el Menor Simbolismo de su Apéndice II. El Zhou Yi no tiene ninguno de los dos, a propósito: es el texto raíz sobre el que se escribieron esos comentarios posteriores, no una versión que recibió uno propio.",
    moreInfoLink: { href: "/library", label: "Abre la Biblioteca →" },
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
      "للاطلاع على معلومات محدّثة حول الباقات والأسعار ورصيد التوكنات، افتح مركز التوكنات من ترويسة التطبيق. يعرض رصيدك الحالي وحد الخيط لكل خطة ورابطاً مباشراً للشراء.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "ما مدى موثوقية نصوص الآي تشينغ في التطبيق؟",
    answer:
      "الموثوقية تعني أن نص الأوراكل الذي تقرأه، الحكم والصورة وكل خط، لا تكتبه ولا تعدّله الذكاء الاصطناعي أبداً. إنه اقتباس مباشر، مُحقَّق كلمة بكلمة مقابل مصدر منشور باسمه الصريح. يأتي النص الإنجليزي من Richard Wilhelm وCary F. Baynes (The I Ching or Book of Changes، Princeton University Press، 1950) ومن James Legge (The Sacred Books of the East، المجلد XVI، أكسفورد، 1882)؛ ويأتي التشو يي بالصينية الكلاسيكية من Chinese Text Project. تأتي قواعد الخطوط المتغيرة من Alfred Huang (The Complete I Ching، الطبعة العاشرة التذكارية، 2010)، ومن أجل البديل الكلاسيكي، من كتاب Yixue Qimeng لـZhu Xi بترجمة Joseph Adler (Introduction to the Study of the Classic of Change، 2002). يفسّر الذكاء الاصطناعي هذه النصوص المقتبسة سلفاً من أجل سؤالك؛ ولا يولّدها أو يعيد كتابتها أبداً. راجع صفحة تدقيقات المطابقة للسجل الكامل للتحقق.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question: "ما الفرق بين طريقتي الآي تشينغ: العملات الثلاث وسيقان اليارو؟",
    answer:
      "كلتا الطريقتين تنتجان السداسيات الأربع والستين نفسها وتستخدمان نصوص الآي تشينغ نفسها وقواعد اختيار الخط الكلاسيكية نفسها. العملات الثلاث طريقة سريعة ومباشرة: ترمي ثلاث عملات ست مرات لبناء الخطوط الستة. سيقان اليارو هي الطقس الأقدم: تعمل بسيقان أو أشياء مشابهة عبر إجراء أبطأ وأكثر تأملا. الاختيار يغير التجربة الطقسية، لا سلطة القراءة. استخدم العملات الثلاث للسرعة، واستخدم سيقان اليارو عندما تريد الإيقاع التقليدي.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "ما الفرق بين I Ching التلقائي واليدوي، وهل يمكن خلط العظام في نفس الخيط؟",
    answer:
      "التلقائي مقابل اليدوي ينطبق فقط على I Ching (الأسكة الثلاث أو عيدان الزنبق). في الخيارات تظهر أدوات وضع القَسْم عند اختيار I Ching: اختر الأسكة الثلاث أو عيدان الزنبق، ثم تلقائي (تُنفَّذ القرعة على الخادم) أو يدوي (تُدخل مجموع الخطوط الستة 6/7/8/9 من عملاتك أو عيدانك). وضع العظام دائمًا تلقائي؛ لا يوجد مسار يدوي للعظام؛ يُوليد الأوراكل أنماط الشقوق ليُقدم استجابةً شخصية تُلائم وضعك الفريد. ضمن حد عمق الخيط في خطتك، يمكنك التناوب بحرية بين I Ching والعظام وتبديل الطرق والأوضاع بين الاستشارات؛ يحفظ التطبيق تفضيلاتك للقراءة التالية في I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "ما هي طريقة عظام العرافة؟",
    answer:
      "عظام العرافة طريقة من عصر شانغ مستوحاة من قراءة الشقوق على دروع السلاحف وكتف الثور. في التطبيق هي منفصلة عن الآي تشينغ: لا تنشئ سداسيات ولا خطوطا متغيرة. يكوّن النظام أولا نمط الشقوق والحكم، ثم تفسر الذكاء الاصطناعي النتيجة الموجودة بالفعل بلغتك. يندرج الحكم دائما في إحدى أربع حالات ممكنة، مستوحاة من المنهج الشانغي الأصيل: 1) 吉، مؤاتٍ واضح: يؤكد النمط الشحنة الإيجابية دون لبس؛ 2) 吉 معتدل، مؤاتٍ نسبي: ثمة تأكيد ولكن مع تحفظات أو شروط؛ 3) 凶 معتدل، غير مؤاتٍ نسبي: يميل النمط إلى النفي مع تحفظات؛ 4) 凶، غير مؤاتٍ واضح: ينفي النمط الشحنة الإيجابية دون لبس. إنها مناسبة للإجابات المختصرة ذات الطابع الأسلافي؛ أما الآي تشينغ فهو أفضل لفهم التحول المتدرج عبر الزمن. تستند هذه الطريقة إلى تقليد أقدم بكثير من الـ I Ching، يصفه كثيرون بأنه يقف عند أصل مبدأ اليين واليانغ نفسه. لا يُعرف بشكل مؤكد إجراؤها الأصلي الكامل؛ وما نقدمه هنا هو تبسيط حديث ومحترم يهدف إلى الحفاظ على حضور هذا التراث، لا إعادة بناء حرفية له.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "كيف يعمل الآي تشينغ ومن أين تأتي إجاباته؟",
    answer:
      "يعمل الآي تشينغ عبر 64 سداسيا تشكّل فهرسا قديما لأنماط التغيّر في الطبيعة وفي حياة الإنسان. كل سداسي شكل منظم له معنى كلاسيكي محفوظ في نصوص Wilhelm (1924). تنطلق كل استشارة من سؤالك الملموس. تطبّق الخوارزمية الرياضية قواعد اختيار الخط الكلاسيكية (نظام الاختزال الذي وضعه Alfred Huang) على رميات الخطوط لتحديد السداسي الحالي، والخطوط المتحركة إن وُجدت، والسداسي المقبل الناتج. ثم يقوم الذكاء الاصطناعي بصياغة هذه النتيجة الموجودة بالفعل في لغتك، تاركًا للمعنى الكلاسيكي لتلك السداسيات أن يُسقط على سياقك الشخصي. لهذا تكون كل قراءة فريدة وشخصية: قد تظهر السداسيات نفسها لأشخاص مختلفين، ومع ذلك لن تكون الإجابة نفسها، لأنها تتعلق بالسؤال المحدد، وبلحظة الحياة، وبالسياق الشخصي للمستشير. لا توجد قراءة واحدة قابلة للتطبيق على أكثر من شخص في الوقت نفسه.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "ما نظام القواعد الذي يحدد أيّ نص خط يحكم قراءة الآي تشينغ؟",
    answer:
      "يتيح التطبيق نظامين لتحديد نص الخط، أو النصوص، التي تحكم القراءة عند وجود خطوط متغيرة. نظام الاختزال الذي وضعه Alfred Huang (The Complete I Ching، الطبعة العاشرة التذكارية، 2010) هو الافتراضي: مجموعة قواعد واضحة وحديثة تختزل دائماً أي تركيبة من الخطوط المتغيرة إلى فقرة حاكمة واحدة دقيقة. أما قراءة Zhu Xi الكلاسيكية (朱熹، 1130-1200 م؛ Yixue Qimeng، بترجمة Joseph Adler) فهي البديل التقليدي: طريقة أقدم تقرأ في حالات عدة كلا الخطين أو كلا الحكمين بدلاً من الاختزال إلى واحد. بدّل بينهما باستخدام مُحدِّد «قراءة الخطوط المتغيرة» في الخيارات؛ يُحفظ اختيارك لتلك القراءة.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "لماذا لا أستطيع أحيانًا «التعمّق» أكثر في نفس المحادثة؟",
    answer:
      "يسمح كل خيط بعدد محدود من القراءات المتسلسلة حسب خطتك. عند بلوغ الحد، ابدأ جلسة جديدة. تحقق من حدك الحالي للخيط في مركز التوكنات (ترويسة التطبيق).",
    related: ["tokenPacks"],
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
      "لمعلومات الفوترة وشراء التوكنات، افتح مركز التوكنات من ترويسة التطبيق. الشروط التجارية والاستخدام المقبول موجودة في شروط الخدمة.",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "هل تتوفر المصادقة الثنائية (2FA)؟",
    answer:
      "نعم، بشكل اختياري. يمكنك تفعيل 2FA (تطبيق المصادقة و/أو رمز البريد الإلكتروني) من أمان الحساب داخل الأوراكل.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "كيف أحذف محادثة أو دردشة؟",
    answer:
      "افتح قسم «المحادثات» من ترويسة التطبيق. استخدم خيار الحذف الظاهر على كل خيط. الحذف فوري ونهائي.",
  },
  {
    id: "delete-account",
    question: "كيف أحذف حسابي وجميع بياناتي؟",
    answer:
      "افتح الخيارات في التطبيق، انتقل إلى حذف الحساب واضغط على حذف حسابي. في مربع التأكيد اكتب DELETE وأكّد. يُحذف حسابك فوراً وتُسجَّل خروجاً تلقائياً. ما يُحذف: ملفك الشخصي وبيانات الدخول، جميع جلسات الاستشارة وسجل المحادثات، رصيد الرموز وسجلات الاستخدام، إعداد المصادقة الثنائية، وجميع التفضيلات الشخصية. يحتفظ مزودو بوابات الدفع بسجلات المشتريات لأغراض ضريبية وفقاً للوائح المعمول بها. إذا تعذّر عليك تسجيل الدخول، أرسل لنا بريداً إلى support@theoriginaliching.com مع عنوان بريدك المسجّل. سنعالج طلبك خلال 30 يوماً.",
    moreInfoLink: { href: "/delete-account", label: "لمزيد من المعلومات، راجع صفحة حذف الحساب →" },
    related: ["privacyPolicy"],
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
    question:
      "هل نصوص I Ching التي تظهر في القراءة أصيلة أم يولّدها الذكاء الاصطناعي؟",
    answer:
      "إنها أصيلة. المادة النصية، أحكام (卦辞)، وخطوط متحركة (爻辞)، وهكساجرامات ناتجة، مستقاة من ثلاثة مصادر أكاديمية متاحة في التطبيق: Wilhelm (1924) (Eugen Diederichs Verlag)، وJames Legge (في الملك العام)، والتشو يي الأصلي. النسخة الإنجليزية لكاري باينز (Princeton University Press، 1950) متاحة أيضًا كمرجع مقارن. يستشهد الذكاء الاصطناعي بالنصوص ذات الصلة ويضعها في سياق سؤالك، لكنه لا يعدلها ولا يستبدلها. يمكنك مقارنة أي نص مع المصدر الأصلي.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "لماذا لا يتغيّر نص الهكساجرامات في المكتبة عند تغيير لغة التطبيق؟",
    answer:
      "يُعرض كما نُشر بالضبط. تظهر ترجمتا Wilhelm (1924) وJames Legge بلغتهما الإنجليزية الأكاديمية، ويظهر التشو يي بالصينية الكلاسيكية، بنفس الكلمات في جميع لغات الواجهة الإحدى عشرة. إعادة ترجمة ترجمة سابقة تستبدل كلمات المترجم نفسه بصياغة مُعاد التعبير عنها، وقد تشوّه عقودًا من العمل الأكاديمي المُستقر. الهدف هو إعطاؤك وصولاً مباشرًا إلى المصدر المنشور الأكثر موثوقية، لا إلى نسخة مُستمدة منه. هذا يختلف عن استشارتك مع الذكاء الاصطناعي، التي تجيب دائمًا بلغة سؤالك: فهناك يفسّر الذكاء الاصطناعي من أجلك نتيجة متشكّلة مسبقًا، ولا يقدّم نصًا أصليًا.",
    moreInfoLink: { href: "/library", label: "افتح المكتبة →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "لماذا لا تُظهر علامة تبويب تشو يي في المكتبة أي تعليق بعلامة \"+\" كما يظهر عند ويلهلم أو ليج؟",
    answer:
      "لأنه لا يوجد تعليق لعرضه. التشو يي هو النص الجذري الأقدم، دون أي طبقة تعليق لاحقة أُضيفت إليه: فقط الحكم والصورة وأقوال كل خط، تمامًا كما تم تداوله قبل أن يضيف علماء لاحقون قراءاتهم الخاصة. تبويب ويلهلم يضيف تعليقه الخاص بالإضافة إلى الأجنحة العشرة الكونفوشيوسية، وتبويب ليج يضيف ملاحظاته بالإضافة إلى الرمزية العظيمة والرمزية الصغرى من ملحقه الثاني. التشو يي لا يحتوي على أي منهما، عن قصد: فهو النص الجذري الذي كُتبت تلك التعليقات اللاحقة عنه، لا نسخة حصلت على تعليق خاص بها.",
    moreInfoLink: { href: "/library", label: "افتح المكتبة →" },
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
  {
    id: "translators-three",
    question: "ما هي الترجمات الثلاث المتوفرة في التطبيق؟",
    answer:
      "يستند التطبيق إلى ثلاث ترجمات كلاسيكية للآي تشينغ، تُعرض كعلامات تبويب منفصلة. ترجمة Richard Wilhelm وCary F. Baynes (Princeton University Press، 1950) هي النسخة الغربية الأكثر قراءة، وتتضمن تعليقاً موسعاً. ترجمة James Legge (The Sacred Books of the East، المجلد XVI، 1882) هي الترجمة الأكاديمية الإنجليزية الرائدة، وتتضمن ملاحظاته الخاصة ورمزيته. والتشو يي هو النص الأصلي بالصينية الكلاسيكية نفسه، الجذر الذي كُتبت عنه التعليقات اللاحقة كلها، ويُعرض دون أي طبقة تعليق مُضافة. تصف الثلاث جميعها السداسيات الأربع والستين نفسها؛ وتختلف في صوت المترجم واللغة وكمّ المادة التوضيحية المحيطة بالنص الأساسي.",
  },
  {
    id: "tier-features",
    question: "ما الذي يتضمنه كل pack، إلى جانب التوكنات؟",
    answer:
      "تشمل الخطة المجانية I Ching (ثلاث عملات أو عيدان اليارو، تلقائي أو يدوي) وعظام العرافة، مع مترجم Wilhelm (1924). يضيف Seeker المكتبة الكاملة ومترجم Legge. يضيف Practitioner نص التشو يي الأصلي. يضيف Master توليفة Master (3)، التي تُثلّث المترجمين الثلاثة في آنٍ واحد. لرؤية كميات التوكنات الحالية وحدود الخيط وكيفية الشراء، افتح مركز التوكنات من ترويسة التطبيق.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "كيف تعمل تركيبة Master (3) ولماذا هي قوية جداً؟",
    answer:
      "تُجري وظيفة Master (3) توليفاً شخصياً: تُثلّث في آنٍ واحد المصادر الثلاثة الجذرية (Wilhelm وLegge والZhou Yi الأصلي) لاستخلاص حكم متسق. الناتج تفسير موحّد يقدم 'إجابة ملموسة' قوية وفورية، تليها تحليل مقارن معمّق مصاغ بشكل فريد لوضعك ومتكيّف بأمانة تامة مع السياق الشخصي لاستشارتك. تستهلك كل استشارة Master (3) رمزين.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "ما هي المكتبة وكيف يمكن الوصول إليها؟",
    answer:
      "المكتبة هي الموسوعة الكاملة لـ 64 سداسياً والأعمال الأدبية الثلاثة كاملةً. يُفتح الوصول إليها بشكل دائم عند شراء أي pack مدفوع (Seeker فصاعداً).",
  },
];

const FAQ_ITEMS_HI: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "टोकन, पैक और फ्री टियर कैसे काम करते हैं?",
    answer:
      "पैक, टोकन कीमतों और अपने मौजूदा बैलेंस की अप-टू-डेट जानकारी के लिए, ऐप हेडर से टोकन सेंटर खोलें। वहाँ आपके उपलब्ध टोकन, प्रति-थ्रेड सीमा और खरीद का सीधा लिंक दिखाई देगा।",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "ऐप में दिए गए आई चिंग ग्रंथों की विश्वसनीयता क्या है?",
    answer:
      "विश्वसनीयता का अर्थ है कि आप जो ओरेकल पाठ पढ़ते हैं, निर्णय, छवि और हर रेखा, वह कभी AI द्वारा न लिखा जाता है न बदला जाता है। यह एक प्रत्यक्ष उद्धरण है, जिसे एक नामित प्रकाशित स्रोत के विरुद्ध शब्द-दर-शब्द सत्यापित किया गया है। अंग्रेज़ी पाठ Richard Wilhelm और Cary F. Baynes (The I Ching or Book of Changes, Princeton University Press, 1950) तथा James Legge (The Sacred Books of the East, खंड XVI, ऑक्सफ़ोर्ड, 1882) से आता है; शास्त्रीय चीनी Zhou Yi Chinese Text Project से आता है। बदलती-रेखा नियम Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) से आते हैं, और शास्त्रीय विकल्प के लिए, Zhu Xi के Yixue Qimeng से, Joseph Adler के अनुवाद में (Introduction to the Study of the Classic of Change, 2002)। AI आपके प्रश्न के लिए इन पहले से उद्धृत पाठों की व्याख्या करता है; यह इन्हें कभी उत्पन्न या फिर से नहीं लिखता। पूर्ण सत्यापन लॉग के लिए निष्ठा ऑडिट पृष्ठ देखें।",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question:
      "I Ching की दो विधियों, तीन सिक्के और यारो डंठल, में क्या अंतर है?",
    answer:
      "दोनों विधियाँ वही 64 हेक्साग्राम बनाती हैं और I Ching के वही पाठ तथा वही शास्त्रीय रेखा-चयन नियम उपयोग करती हैं। तीन सिक्के तेज और सरल है: छह रेखाएँ बनाने के लिए तीन सिक्के छह बार फेंके जाते हैं। यारो डंठल पुरानी अनुष्ठानिक विधि है: गिने हुए डंठलों या समान वस्तुओं के साथ धीमी और अधिक ध्यानपूर्ण प्रक्रिया की जाती है। चुनाव पढ़ाई की प्रामाणिकता नहीं, बल्कि अनुष्ठान का अनुभव बदलता है। गति चाहिए तो तीन सिक्के; पारंपरिक लय चाहिए तो यारो डंठल।",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "I Ching में स्वचालित बनाम मैन्युअल क्या है, और क्या मैं एक ही थ्रेड में Oracle Bones मिला सकता/सकती हूँ?",
    answer:
      "स्वचालित बनाम मैन्युअल केवल I Ching (तीन सिक्के या यारो की छड़ें) पर लागू होता है। विकल्पों में कास्ट-मोड नियंत्रण तभी दिखते हैं जब I Ching चुना हो: तीन सिक्के या यारो की छड़ें चुनें, फिर स्वचालित (सर्वर पर कास्ट होता है) या मैन्युअल (अपने सिक्कों या छड़ों से छह पंक्ति योग 6/7/8/9 दर्ज करें)। Oracle Bones मोड हमेशा स्वचालित है; कोई मैन्युअल हड्डी प्रवाह नहीं; यह ओरेकल दरार पैटर्न को संश्लेषित करके आपकी विशिष्ट स्थिति के अनुसार एक व्यक्तिगत प्रतिक्रिया उत्पन्न करता है। आपकी योजना की प्रति-थ्रेड गहराई सीमा के भीतर, आप I Ching और Oracle Bones को स्वतंत्र रूप से बदल सकते हैं और परामर्शों के बीच विधियाँ और मोड स्विच कर सकते हैं; आपकी पसंद अगली I Ching पठन के लिए याद रखी जाती है।",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Oracle Bones विधि क्या है?",
    answer:
      "Oracle Bones शांग युग की दिव्य विधि है, जो कछुए के कवच और बैल की कंधे की हड्डी पर दरारें पढ़ने से प्रेरित है। ऐप में यह I Ching से अलग है: यह हेक्साग्राम या बदलती रेखाएँ नहीं बनाती। प्रणाली पहले दरारों का पैटर्न और निर्णय बनाती है; फिर AI उस पहले से बने परिणाम की आपकी भाषा में व्याख्या करता है। निर्णय हमेशा शांग पूर्वज परंपरा से प्रेरित चार संभावित अवस्थाओं में से एक में आता है: 1) 吉: स्पष्ट रूप से शुभ: पैटर्न बिना संदेह सकारात्मक प्रस्ताव की पुष्टि करता है; 2) 吉 मध्यम: मध्यम रूप से शुभ: पुष्टि होती है पर बारीकियों या शर्तों के साथ; 3) 凶 मध्यम: मध्यम रूप से अशुभ: पैटर्न आरक्षणों के साथ नकार की ओर झुकता है; 4) 凶: स्पष्ट रूप से अशुभ: पैटर्न बिना संदेह सकारात्मक प्रस्ताव को नकारता है। यह संक्षिप्त, पूर्वजों जैसी शैली के उत्तरों के लिए उपयोगी है; समय के साथ परतदार बदलाव समझने के लिए I Ching बेहतर है। यह विधि I Ching से भी कहीं अधिक प्राचीन परंपरा पर आधारित है, जिसे कई लोग यिन-यांग सिद्धांत की मूल जड़ पर खड़ी बताते हैं। इसकी पूरी मूल प्रक्रिया निश्चितता के साथ ज्ञात नहीं है; यहां जो प्रस्तुत किया गया है वह एक सम्मानजनक आधुनिक सरलीकरण है, जिसका उद्देश्य उस विरासत को वर्तमान में बनाए रखना है, न कि उसका शब्दशः पुनर्निर्माण।",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "I Ching वास्तव में कैसे काम करता है और उत्तर कैसे देता है?",
    answer:
      "I Ching 64 हेक्साग्रामों के माध्यम से कार्य करता है, जो प्रकृति और मानव जीवन में परिवर्तन के पैटर्नों का प्राचीन सूचीपत्र हैं। हर हेक्साग्राम एक संरचित आकृति है, जिसका शास्त्रीय अर्थ Wilhelm (1924) ग्रंथों में सुरक्षित है। हर परामर्श आपके विशिष्ट प्रश्न से शुरू होता है। गणितीय एल्गोरिदम शास्त्रीय रेखा-चयन नियमों (Alfred Huang की संक्षेपण प्रणाली) के तहत रेखाएँ डालकर वर्तमान हेक्साग्राम, यदि कोई हो तो गतिशील रेखाएँ और परिणामी भविष्य हेक्साग्राम तय करता है। इसके बाद AI उस पहले से बने परिणाम को आपकी भाषा में अभिव्यक्त करता है, उन हेक्साग्रामों के शास्त्रीय अर्थ को आपके विशिष्ट संदर्भ पर लागू करते हुए। इसीलिए हर पठन अद्वितीय और व्यक्तिगत होता है: वही हेक्साग्राम अलग-अलग लोगों के लिए आ सकते हैं, फिर भी उत्तर एक जैसा कभी नहीं होता, क्योंकि यह विशिष्ट प्रश्न, जीवन के क्षण और परामर्शक के व्यक्तिगत संदर्भ पर निर्भर करता है। एक से अधिक व्यक्ति पर एक साथ लागू होने वाली कोई सार्वभौमिक व्याख्या नहीं होती।",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "कौन सी नियम-प्रणाली यह निर्धारित करती है कि I Ching पठन में कौन सा रेखा-पाठ शासन करता है?",
    answer:
      "यह ऐप बदलती रेखाओं को उस रेखा-पाठ, या पाठों, तक हल करने के लिए दो प्रणालियों का समर्थन करती है जो पठन पर शासन करते हैं। Alfred Huang की संक्षेपण प्रणाली (The Complete I Ching, 10th Anniversary Edition, 2010) डिफ़ॉल्ट है: नियमों का एक स्पष्ट, आधुनिक सेट जो परिवर्तनशील रेखाओं के किसी भी संयोजन को हमेशा एक सटीक शासक अंश तक संक्षिप्त करता है। Zhu Xi की शास्त्रीय पठन शैली (朱熹, 1130-1200 ई.; Yixue Qimeng, Joseph Adler के अनुवाद में) पारंपरिक विकल्प है: एक पुरानी पद्धति जो कई स्थितियों में एक तक संक्षिप्त करने के बजाय दोनों रेखाएँ या दोनों निर्णय पढ़ती है। विकल्पों में 'परिवर्तनशील रेखाओं का पठन' चयनकर्ता से दोनों के बीच स्विच करें; आपकी पसंद उस पठन के लिए याद रखी जाती है।",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "कभी-कभी मैं उसी चैट में आगे “deepen” क्यों नहीं कर पाता/पाती?",
    answer:
      "आपकी योजना के अनुसार हर थ्रेड में सीमित संख्या में रीडिंग की श्रृंखला मिलती है। सीमा पूरी होने पर नई सेशन शुरू करें। अपनी मौजूदा थ्रेड सीमा टोकन सेंटर (ऐप हेडर) में देखें।",
    related: ["tokenPacks"],
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
      "बिलिंग और टोकन खरीद की जानकारी के लिए, ऐप हेडर से टोकन सेंटर खोलें। वाणिज्यिक शर्तें और स्वीकार्य उपयोग सेवा शर्तों में हैं।",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "क्या दो-कारक प्रमाणीकरण (2FA) उपलब्ध है?",
    answer:
      "हाँ, वैकल्पिक रूप से। आप खाता सुरक्षा से 2FA (Authenticator और/या ईमेल कोड) सक्षम कर सकते हैं।",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "चैट या बातचीत कैसे हटाएं?",
    answer:
      "ऐप हेडर से «चैट» सेक्शन खोलें। प्रत्येक थ्रेड पर दिखाए गए डिलीट विकल्प का उपयोग करें। हटाना तुरंत और स्थायी है।",
  },
  {
    id: "delete-account",
    question: "अपना खाता और सभी डेटा कैसे हटाएं?",
    answer:
      "ऐप में विकल्प खोलें, खाता हटाएं तक स्क्रॉल करें और मेरा खाता हटाएं पर टैप करें। पुष्टि संवाद में DELETE टाइप करें और पुष्टि करें। आपका खाता तुरंत हटा दिया जाता है। क्या हटाया जाता है: आपका उपयोगकर्ता प्रोफ़ाइल और लॉगिन क्रेडेंशियल, सभी परामर्श सत्र और चैट इतिहास, टोकन शेष और उपयोग रिकॉर्ड, 2FA कॉन्फ़िगरेशन, और सभी व्यक्तिगत प्राथमिकताएं। भुगतान गेटवे प्रदाता लागू नियमों के अनुसार कर और बिलिंग उद्देश्यों के लिए खरीद रिकॉर्ड रखते हैं। यदि साइन इन नहीं कर सकते, तो support@theoriginaliching.com पर अपने पंजीकृत ईमेल के साथ लिखें। हम 30 दिनों के भीतर अनुरोध संसाधित करेंगे।",
    moreInfoLink: { href: "/delete-account", label: "अधिक जानकारी के लिए खाता हटाने का पेज देखें →" },
    related: ["privacyPolicy"],
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
    question:
      "पठन में दिखाई देने वाले I Ching के पाठ प्रामाणिक हैं या AI द्वारा उत्पन्न?",
    answer:
      "वे प्रामाणिक हैं। पाठ्य सामग्री (निर्णय (卦辞), चलती रेखाएँ (爻辞), और परिणामी हेक्साग्राम) ऐप में उपलब्ध तीन विद्वत्तापूर्ण स्रोतों से ली गई है: Wilhelm (1924) (Eugen Diederichs Verlag), James Legge (सार्वजनिक डोमेन), और मूल Zhou Yi। Cary Baynes का 1950 का अंग्रेज़ी अनुवाद (Princeton University Press) तुलनात्मक संदर्भ के रूप में भी उपलब्ध है। AI संबंधित पाठों को आपके प्रश्न के साथ उद्धृत और संदर्भित करता है, लेकिन उन्हें संशोधित या प्रतिस्थापित नहीं करता। आप किसी भी पाठ की मूल स्रोत से तुलना कर सकते हैं।",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "ऐप की भाषा बदलने पर Library के हेक्साग्राम पाठ की भाषा क्यों नहीं बदलती?",
    answer:
      "इसे ठीक उसी तरह दिखाया जाता है जैसे यह प्रकाशित हुआ था। Wilhelm (1924) और James Legge शैक्षणिक अंग्रेज़ी में दिखाई देते हैं, और मूल Zhou Yi शास्त्रीय चीनी भाषा में, सभी 11 इंटरफ़ेस भाषाओं में एक जैसे शब्दों के साथ। किसी अनुवाद का फिर से अनुवाद करने से अनुवादक के अपने शब्दों की जगह एक व्याख्या आ जाती और दशकों के स्थापित विद्वत्तापूर्ण कार्य को विकृत कर सकती। उद्देश्य है आपको सबसे भरोसेमंद प्रकाशित स्रोत तक सीधी पहुँच देना, उसका कोई व्युत्पन्न संस्करण नहीं। यह आपकी AI सलाह से अलग है, जो हमेशा आपके प्रश्न की भाषा में उत्तर देती है: वहाँ AI आपके लिए एक पहले से बने परिणाम की व्याख्या करता है, यह कोई मूल पाठ प्रस्तुत नहीं करता।",
    moreInfoLink: { href: "/library", label: "Library खोलें →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "लाइब्रेरी के झोउ यी टैब में विल्हेम या लेग की तरह \"+\" टिप्पणी क्यों नहीं दिखाई जाती?",
    answer:
      "क्योंकि दिखाने के लिए कोई टिप्पणी मौजूद ही नहीं है। झोउ यी सबसे पुराना मूल पाठ है, जिसमें बाद में जोड़ी गई टिप्पणी की कोई परत नहीं है: केवल निर्णय, छवि और प्रत्येक रेखा के कथन, ठीक वैसे जैसे बाद के विद्वानों द्वारा अपनी व्याख्याएँ जोड़े जाने से पहले प्रचलित थे। विल्हेम के टैब में उनकी अपनी टिप्पणी के साथ कन्फ्यूशियाई दस पंख जोड़े गए हैं; लेग के टैब में उनके नोट्स के साथ उनके परिशिष्ट II से महान प्रतीकवाद और लघु प्रतीकवाद जोड़े गए हैं। झोउ यी में जानबूझकर दोनों में से कोई भी नहीं है: यह वह मूल पाठ है जिसके बारे में वे बाद की टिप्पणियाँ लिखी गईं, न कि कोई ऐसा संस्करण जिसे स्वयं अपनी टिप्पणी मिली हो।",
    moreInfoLink: { href: "/library", label: "Library खोलें →" },
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
    id: "translators-three",
    question: "ऐप में उपलब्ध तीन अनुवादक कौन-कौन से हैं?",
    answer:
      "यह ऐप I Ching के तीन शास्त्रीय अनुवादों पर आधारित है, जो अलग-अलग टैब के रूप में दिखाए जाते हैं। Richard Wilhelm और Cary F. Baynes (Princeton University Press, 1950) सबसे अधिक पढ़ा जाने वाला पश्चिमी संस्करण है, जिसमें विस्तृत टिप्पणी है। James Legge (The Sacred Books of the East, खंड XVI, 1882) अग्रणी अंग्रेज़ी विद्वत्तापूर्ण अनुवाद है, जिसमें उनके अपने फुटनोट और प्रतीकवाद हैं। Zhou Yi मूल शास्त्रीय चीनी पाठ स्वयं है, वह जड़ जिसके बारे में बाद की सभी टिप्पणियाँ लिखी गईं, जिसे टिप्पणी की किसी अतिरिक्त परत के बिना दिखाया जाता है। तीनों एक जैसे 64 हेक्साग्रामों का वर्णन करते हैं; वे अनुवादक की आवाज़, भाषा और मूल पाठ के आसपास कितनी व्याख्यात्मक सामग्री है, इसमें भिन्न हैं।",
  },
  {
    id: "tier-features",
    question: "टोकनों के अलावा, हर pack में क्या शामिल है?",
    answer:
      "Free में I Ching (तीन सिक्के या यारो डंठल, स्वचालित या मैन्युअल) और Oracle Bones शामिल हैं, Wilhelm (1924) अनुवादक के साथ। Seeker पूरी Library और Legge अनुवादक जोड़ता है। Practitioner मूल Zhou Yi पाठ जोड़ता है। Master, Master (3) संश्लेषण जोड़ता है, जो तीनों अनुवादकों को एक साथ त्रिकोणित करता है। वर्तमान टोकन मात्रा, थ्रेड सीमाएँ और खरीदने का तरीका देखने के लिए, ऐप हेडर से टोकन सेंटर खोलें।",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Master (3) संश्लेषण कैसे काम करता है और यह इतना शक्तिशाली क्यों है?",
    answer:
      "Master (3) फ़ंक्शन एक व्यक्तिगत संश्लेषण करता है: तीन मूल स्रोतों (Wilhelm, Legge और मूल Zhou Yi) को एक साथ त्रिकोणित करके एक सुसंगत निर्णय निकालता है। परिणाम एक एकीकृत व्याख्या है जो एक शक्तिशाली और तत्काल 'ठोस उत्तर' प्रदान करता है, इसके बाद आपकी स्थिति के लिए विशेष रूप से तैयार एक गहरा तुलनात्मक विश्लेषण। प्रत्येक Master (3) परामर्श 2 टोकन उपयोग करता है।",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "Library क्या है और इसे कैसे एक्सेस करें?",
    answer:
      "Library 64 hexagrams का पूर्ण संकलन और तीन पूरी साहित्यिक कृतियाँ हैं। किसी भी paid pack (Seeker या उससे ऊपर) खरीदने पर यह स्थायी रूप से अनलॉक हो जाती है।",
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
      "パック、トークン価格、現在の残高の最新情報は、アプリのヘッダーからトークンセンターを開いてご確認ください。利用可能なトークン数、プランごとのスレッド制限、購入への直接リンクが表示されます。",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "アプリで提供される易経のテキストの信頼性はどの程度ですか？",
    answer:
      "信頼性とは、あなたが読む神託のテキスト、彖辞、象、そして各爻が、AIによって書かれたり改変されたりすることが決してないことを意味します。これは、名前の明示された出版済みの典拠と一語一句照合された直接の引用です。英語テキストはRichard WilhelmとCary F. Baynes（The I Ching or Book of Changes、Princeton University Press、1950年）およびJames Legge（The Sacred Books of the East、第XVI巻、オックスフォード、1882年）に由来し、古典中国語の周易はChinese Text Projectに由来します。変爻のルールはAlfred Huang（The Complete I Ching、10th Anniversary Edition、2010年）に由来し、古典的な選択肢としては、朱熹の『易学啓蒙』のJoseph Adlerによる英訳（Introduction to the Study of the Classic of Change、2002年）に由来します。AIはあなたの質問のためにこれらすでに引用されたテキストを解釈するのみで、生成したり書き換えたりすることは決してありません。完全な検証ログは忠実度監査ページをご覧ください。",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question: "易経の二つの方法、三枚硬貨と筮竹はどう違いますか？",
    answer:
      "どちらの方法も同じ64卦を生み、同じ易経本文と同じ古典的な爻選択規則を用います。三枚硬貨は速く扱いやすい方法で、三枚の硬貨を六回投げて六爻を作ります。筮竹はより古い儀礼的な方法で、筮竹または同様の物を数えながら、よりゆっくりと思索的に進めます。違いは占いの権威ではなく、儀礼体験にあります。速さを求めるなら三枚硬貨、伝統的なリズムを求めるなら筮竹です。",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "易経の自動と手動の違いは？ 同じスレッドで卜骨と混ぜられますか？",
    answer:
      "自動と手動は易経（三硬貨または蓍草）にのみ適用されます。オプションでは易経を選んだときだけ起卦方式のコントロールが表示されます。三硬貨または蓍草を選んでから、自動（サーバーで起卦を実行）か手動（自分の銭または蓍草から六爻分の合計6/7/8/9を入力）を選びます。卜骨モードは常に自動で、手動の卜骨フローはありません。オラクルが亀裂パターンを合成し、あなたの固有の状況に合わせた個人的な応答を生成します。プランのスレッド深度上限の範囲内で、易経と卜骨を自由に行き来でき、相談ごとに方法とモードを切り替えられます。次回の易経相談のために設定は記憶されます。",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "甲骨の方法とは何ですか？",
    answer:
      "甲骨は、亀甲や牛の肩甲骨に現れる亀裂を読む殷代の占いに着想を得た方法です。アプリでは易経とは別の方法であり、卦や変爻を作りません。まずシステムが亀裂のパターンと判定を形成し、その後AIがその結果をあなたの言語で解釈します。判定は常に、殷代の祖先的方法に着想を得た四つの可能な状態のいずれかに収まります：1) 吉: はっきりと吉：パターンが肯定命題を曖昧さなく確認します；2) 吉 中程度: やや吉：確認はあるが、含みや条件を伴います；3) 凶 中程度: やや凶：パターンは留保付きで否定に傾きます；4) 凶: はっきりと凶：パターンが肯定命題を曖昧さなく否定します。祖先的で簡潔な答えに向いており、時間の中で重層的に変化を読む場合は易経が適しています。この方法は易経よりもはるかに古い伝統に基づくもので、しばしば陰陽思想の根源に立つものとして語られます。その完全な原型の手順は確実には分かっておらず、ここで提供しているのは、その遺産を今に残すことを目的とした、敬意ある現代的な簡略化であり、文字どおりの再現ではありません。",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "易経はどのように働き、答えはどこから出てくるのですか？",
    answer:
      "易経は、自然と人間の生活における変化の型を集めた64卦からなる古代の総覧として働きます。各卦は構造化された図形であり、その古典的意味はヴィルヘルム（1924年）の本文に保存されています。各相談はあなたの具体的な問いから始まります。数学的アルゴリズムが古典的な爻選択規則（Alfred Huangの還元法）に従って爻を立て、現在の卦、変爻があればその位置、そして結果として生じる未来の卦を確定します。続いてAIが、すでに形成されたその結果をあなたの言語で表現し、卦の古典的意味をあなた個人の文脈に適用します。だからこそ、ひとつひとつの読みは固有で個人的なものになります。同じ卦が別々の人に現れることはあっても、答えが同じになることは決してありません。問いの内容、人生のその時、相談者の個人的文脈に依存するからです。同時に複数の人に当てはまる普遍的な解釈は存在しません。",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "易経の占いでどの爻辞が支配するかを決めるルール体系とは何ですか？",
    answer:
      "このアプリは、変爻を支配する爻辞（または爻辞群）を決定するための二つの体系をサポートしています。Alfred Huangの還元法（The Complete I Ching、10th Anniversary Edition、2010年）が既定であり、変爻のどのような組み合わせも常に一つの精確な支配箇所へと還元する、明快で現代的な規則の体系です。朱熹の古典的な読み方（朱熹、1130-1200年；『易学啓蒙』、Joseph Adlerによる英訳）は伝統的な選択肢であり、一つに還元する代わりに複数の場合で両方の爻、または両方の彖辞を読む、より古い方法です。オプションの「変爻の読み方」セレクターで切り替えられ、選択した設定はその占いについて記憶されます。",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "なぜ同じチャットで「深める」ことができないことがありますか？",
    answer:
      "各スレッドはプランに応じた連鎖した読みの回数に制限があります。上限に達したら、新しいセッションを開始してください。現在のスレッド制限はトークンセンター（アプリのヘッダー）で確認できます。",
    related: ["tokenPacks"],
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
      "請求やトークン購入の情報は、アプリのヘッダーからトークンセンターを開いてご確認ください。商業条件と許容使用は利用規約に記載されています。",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "二要素認証（2FA）は利用できますか？",
    answer:
      "はい、任意でご利用いただけます。オラクルのアカウントセキュリティから2FA（認証アプリおよび/またはメールコード）を有効にできます。ガイドでは相談との連携についてまとめています。",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "チャットや会話を削除するには？",
    answer:
      "アプリのヘッダーから「チャット」セクションを開きます。各スレッドに表示される削除オプションを使用してください。削除は即時かつ永続的です。",
  },
  {
    id: "delete-account",
    question: "アカウントとすべてのデータを削除するには？",
    answer:
      "アプリのオプション（コンポーザー下部のボタン）を開き、アカウントを削除までスクロールして「アカウントを削除する」をタップします。確認ダイアログにDELETEと入力して確定します。アカウントは即時削除され、自動的にサインアウトされます。削除されるもの：ユーザープロファイルとログイン認証情報、すべての相談セッションとチャット履歴、トークン残高と利用履歴、二段階認証の設定、すべての個人設定。決済ゲートウェイプロバイダーは適用される財務規制に従い、税務・請求目的で購入記録を保持します。サインインできない場合は、登録済みのメールアドレスを添えてsupport@theoriginaliching.comまでご連絡ください。30日以内に対応いたします。",
    moreInfoLink: { href: "/delete-account", label: "詳細はアカウント削除ページをご覧ください →" },
    related: ["privacyPolicy"],
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
    question:
      "六十四卦や判定を生成するのは、AIですか、それともアルゴリズムですか？",
    answer:
      "数学的アルゴリズムであり、AIではありません。I Chingモードでは、アルゴリズムが卦を構築して主爻と変卦を決定します。卜骨モードでは、亀裂パターンを生成して判定を下します。人工知能はその後に介入します。すでに計算されたその結果を受け取り、あなたの質問の文脈を踏まえて、あなたの言語で自然な言葉として表現します。AIは解釈者であり、オラクルはその方法です。",
  },
  {
    id: "authentic-texts",
    question:
      "解釈に表示されるI Chingのテキストは本物ですか、それともAIが生成したものですか？",
    answer:
      "本物です。テキスト素材（卦辞、動爻（爻辞）、変卦）はアプリで利用できる3つの学術的典拠から引用されています：ヴィルヘルム（1924年）（Eugen Diederichs Verlag）、ジェームズ・レッグ（パブリックドメイン）、そして原典の周易。ケーリー・ベインズによる1950年英訳（Princeton University Press）は比較参照として保管されています。AIは関連するテキストをあなたの質問に合わせて引用し文脈化しますが、変更や置き換えは一切しません。すべてのテキストを原典と照合することができます。",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "アプリの言語を切り替えても、ライブラリの卦辞のテキストが言語を変えないのはなぜですか？",
    answer:
      "出版された通りの形で表示されているからです。ヴィルヘルム（1924年）訳とレッグ訳は学術的英語のまま、周易は原典の古典中国語のまま、11のインターフェース言語すべてで同じ言葉が表示されます。翻訳をさらに翻訳し直すと、翻訳者自身の言葉が意訳に置き換わり、数十年にわたる学術的な蓄積をゆがめる可能性があります。目的は、最も信頼できる出版源に直接アクセスしてもらうことであり、その派生版を提供することではありません。これはAIによる解釈とは異なります。AIは常にあなたの質問の言語で答えますが、それはすでに形成された結果をあなたのために解釈しているのであり、原典そのものを示しているわけではありません。",
    moreInfoLink: { href: "/library", label: "図書館を開く →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "ライブラリの周易タブに、ヴィルヘルムやレッグのような「+」の注釈が表示されないのはなぜですか？",
    answer:
      "表示すべき注釈が存在しないからです。周易は最も古い核となる原典であり、後から付け加えられた注釈の層を一切持ちません。卦辞、象、そして各爻の文言だけが、後世の学者たちが独自の解釈を加える以前の姿のまま伝わっています。ヴィルヘルムのタブには彼自身の注釈と儒教の十翼が、レッグのタブには彼の注記と附録IIの大象解・小象解が加えられています。周易にはそのどちらもありません。それは意図的なものです。周易はそれらの後代の注釈が書かれた対象となった原典であり、自らが注釈を受けた版ではないのです。",
    moreInfoLink: { href: "/library", label: "図書館を開く →" },
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
  {
    id: "translators-three",
    question: "アプリで利用できる3つの翻訳者とは何ですか？",
    answer:
      "このアプリは易経の3つの古典的な翻訳に基づいており、それぞれ別のタブとして表示されます。Richard WilhelmとCary F. Baynes訳（Princeton University Press、1950年）は最も広く読まれている西洋版で、充実した注釈が付いています。James Legge訳（The Sacred Books of the East、第XVI巻、1882年）は先駆的な英語学術翻訳で、彼自身の脚注と象徴解釈が付いています。周易は原典の古典中国語のテキスト自体であり、後のすべての注釈が書かれた対象となる根本であって、注釈の層が一切加えられていない形で示されます。3つとも同じ64卦を説明しますが、訳者の文体、言語、そして核となるテキストを取り囲む説明資料の量が異なります。",
  },
  {
    id: "tier-features",
    question: "トークン以外に、各パックには何が含まれますか？",
    answer:
      "無料プランには易経（三硬貨または蓍草、自動または手動）と卜骨が含まれ、Wilhelm (1924)訳が使えます。Seekerは図書館全体とLegge訳を追加します。Practitionerは原典の周易テキストを追加します。MasterはMaster (3)統合を追加し、3つの翻訳者を同時に三角測量します。現在のトークン量、スレッド制限、購入方法については、アプリのヘッダーからトークンセンターを開いてください。",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Master (3)の統合はどのように機能し、なぜそれほど強力なのですか？",
    answer:
      "Master (3)機能は個人化された統合を行います：3つの根本的な典拠（Wilhelm、Legge、原典Zhou Yi）を同時に三角測量し、一貫した判断を導き出します。結果は強力で即座の「具体的な回答」を提供する統合的解釈であり、その後にあなたの状況のために独自に作成された深い比較分析が続きます。Master (3)の相談は1回につき2トークンを消費します。",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "図書館とは何で、どのようにアクセスしますか？",
    answer:
      "図書館は64卦すべてと3つの完全な文学作品の完全な概要です。いずれかの有料パック（Seeker以上）を購入すると、永続的にアクセスがアンロックされます。",
  },
];

const FAQ_ITEMS_ZH: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "代币、套餐和免费层级是如何运作的？",
    answer:
      "如需了解套餐、代币价格及您当前余额的最新信息，请从应用顶栏打开代币中心。您可以在那里查看可用代币数、每个计划的线程限制以及直接购买链接。",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "应用中提供的易经文本可靠性如何？",
    answer:
      "可靠性意味着您读到的神谕文本，卦辞、象辞和每条爻辞，绝不由 AI 撰写或更改。它是与具名出版来源逐字核对的直接引用。英文文本来自 Richard Wilhelm 与 Cary F. Baynes（《The I Ching or Book of Changes》，Princeton University Press，1950年）以及 James Legge（《The Sacred Books of the East》第 XVI 卷，牛津，1882年）；古典中文的周易来自 Chinese Text Project。变爻规则来自 Alfred Huang（《The Complete I Ching》，10th Anniversary Edition，2010年），经典替代方案则来自朱熹《易学启蒙》的 Joseph Adler 英译本（《Introduction to the Study of the Classic of Change》，2002年）。AI 只为您的问题诠释这些已经引用好的文本，绝不生成或重写它们。完整核验记录请见保真审计页面。",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question: "《易经》的两种方法，三枚铜钱和蓍草，有什么区别？",
    answer:
      "两种方法都会得到同样的六十四卦，并使用同样的《易经》文本与同样的经典爻辞选取规则。三枚铜钱更快捷易用：把三枚钱币掷六次，形成六爻。蓍草是更古老的礼仪方法：用蓍草或类似物件逐步计数，过程更慢，也更具沉思感。选择改变的是仪式体验，而不是解读的权威性。想要快速可用，选三枚铜钱；想要传统节奏，选蓍草。",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "易经的自动与手动有什么区别？同一对话里能混用甲骨文吗？",
    answer:
      "自动与手动仅适用于易经（三枚铜钱或蓍草）。在选项中，只有选中易经时才会显示起卦方式控制：选择三枚铜钱或蓍草，再选自动（服务器执行起卦）或手动（在解读前自行输入六爻的6/7/8/9合计）。甲骨文模式始终为自动，没有手动甲骨流程；神谕综合裂纹图案，生成一份针对您独特情况的个性化回应。在您套餐的单线程深度上限内，您可以自由交替易经与甲骨文，并在咨询之间切换方法与模式；应用会记住您的偏好，供下次易经解读使用。",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "什么是甲骨方法？",
    answer:
      "甲骨方法源自商代占卜，灵感来自龟甲和牛肩胛骨裂纹的解读。在应用中，它与《易经》分开：不会生成卦象，也不会生成变爻。系统先形成裂纹图案和判定，然后由 AI 用你的语言解释这个已经形成的结果。判定始终落入四种可能状态之一，灵感源自商代祖先方法：1）吉，明显为吉：图案明确确认正面命题，无歧义；2）偏吉，偏吉：有所确认，但带条件或细微差别；3）偏凶，偏凶：图案带保留地倾向于否定；4）凶，明显为凶：图案明确否定正面命题，无歧义。它适合简洁、祖先式的回答；若要观察随时间展开的层次变化，《易经》更合适。这一方法源自比《易经》本身更为古老的传统，许多人认为它正立于阴阳原理的根基之处。其完整的原始流程如今已无法确知；这里呈现的是一种现代而郑重的简化，旨在让这份传承得以留存，而非字面上的重建。",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "《易经》到底如何运作？答案从何而来？",
    answer:
      "《易经》通过六十四卦运作，这是一部关于自然与人世变化模式的古老总览。每一卦都是结构化的图形，其经典含义保存于卫礼贤／贝恩斯译本中。每一次咨询都从你具体的问题出发。数学算法按照经典爻辞选取规则（Alfred Huang的简化系统）逐爻立卦，确定本卦、若有则定动爻、并由动爻得到之卦。随后 AI 用你的语言表述这个已经形成的结果，将那些卦象的经典含义投射到你独特的处境之中。因此，每一次解读都是独一无二、属于个人的：相同的卦象可能为不同的人出现，但答案永不相同，因为它取决于具体的问题、所处的时机以及问卜者的个人处境。世上不存在可以同时适用于多人的普遍解读。",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "易经占卜中，决定哪条爻辞主导解读的规则体系是什么？",
    answer:
      "本应用支持两套体系，用于在出现变爻时确定主导解读的爻辞（或多条爻辞）。Alfred Huang 的简化系统（《The Complete I Ching》，10th Anniversary Edition，2010年）是默认选项：一套清晰、现代的规则，始终将任意变爻组合简化为一段精确的主导文字。朱熹的经典解法（朱熹，1130-1200年；《易学启蒙》，Joseph Adler 英译本）是传统的替代方案：一种较古老的方法，在多种情况下会同时读取两条爻辞或两卦的卦辞，而不是简化为一条。可在选项中的「变爻解读法」选择器之间切换；您的选择会被记住，应用于该次解读。",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "为什么有时我无法在同一个聊天中继续「深入」？",
    answer:
      "每个对话线程根据您的套餐允许有限次数的连锁解读。达到上限后，请开启新会话。您可在代币中心（应用顶栏）查看当前的线程限制。",
    related: ["tokenPacks"],
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
      "如需账单和代币购买信息，请从应用顶栏打开代币中心。商业条款和可接受使用规定请见服务条款。",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "是否提供双因素身份验证（2FA）？",
    answer:
      "是的，可选启用：您可以通过神谕中的账户安全设置启用2FA（身份验证器和/或电子邮件验证码）。指南概述了其与咨询的配合方式。",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "如何删除聊天或对话？",
    answer:
      "从应用标题栏打开「聊天」部分。使用每个会话上显示的删除选项。删除即时且永久。",
  },
  {
    id: "delete-account",
    question: "如何删除我的账户和所有数据？",
    answer:
      "打开应用中的「选项」（编辑器底部按钮），滚动至「删除账户」，点击「删除我的账户」。在确认对话框中输入 DELETE 并确认。账户将立即删除，并自动退出登录。将被删除的内容：用户资料和登录凭证、所有咨询会话和聊天记录、代币余额和使用记录、两步验证配置，以及所有个人偏好设置。支付网关提供商根据适用法规出于税务和账单目的保留购买记录。如果无法登录，请发送邮件至 support@theoriginaliching.com 并附上注册邮箱地址。我们将在 30 天内处理您的请求。",
    moreInfoLink: { href: "/delete-account", label: "更多信息请访问账号删除页面 →" },
    related: ["privacyPolicy"],
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
      "是真实的。文本素材（卦辞、动爻（爻辞）和变卦）来自应用中提供的三种学术译本：卫礼贤（1924年）（Eugen Diederichs Verlag）、詹姆斯·理雅各（公有领域）和原典周易。贝恩斯1950年英译本（普林斯顿大学出版社）亦作为比较参考保存。AI引用相关文本并结合您的问题加以诠释，但不对其进行修改或替换。您可以将任何文本与原始资料进行对照。",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question: "为什么切换应用语言时，图书馆里的卦辞文本不会跟着改变语言？",
    answer:
      "因为它完全按照原始出版的样子呈现。卫礼贤（1924年）译本和理雅各译本保留学术英文，周易保留古典中文，在全部11种界面语言中显示的都是同一段文字。对一份译本再次翻译，会用意译替换译者本人的措辞，可能扭曲数十年已确立的学术成果。我们的目标是让你直接接触最可靠的出版来源，而不是它的衍生版本。这与AI解读不同：AI始终用你提问的语言回答，但那是在为你诠释一个已经形成的结果，并不是在呈现原始文本。",
    moreInfoLink: { href: "/library", label: "打开图书馆 →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question: "为什么图书馆里的周易标签不像威廉或理雅各那样显示任何带「+」的注释？",
    answer:
      "因为根本没有注释可以显示。周易是最古老的核心原典，没有附加任何后来的注释层：只有卦辞、象和每条爻辞，正是后世学者加入自己的解读之前流传的样子。威廉的标签加入了他自己的注释以及儒家的十翼；理雅各的标签加入了他的注记以及附录二中的大象解与小象解。周易两者都没有，这是有意为之：它是那些后代注释所依据的根本原典，而不是一个自身也被加注的版本。",
    moreInfoLink: { href: "/library", label: "打开图书馆 →" },
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
  {
    id: "translators-three",
    question: "应用中提供的三种译本是什么？",
    answer:
      "本应用基于《易经》的三种经典译本，以独立标签呈现。Richard Wilhelm 与 Cary F. Baynes 译本（Princeton University Press，1950年）是西方读者最广泛阅读的版本，附有详尽的注释。James Legge 译本（《The Sacred Books of the East》第 XVI 卷，1882年）是开创性的英文学术译本，附有他自己的注脚和象征解读。周易则是古典中文原典本身，是后世所有注释据以撰写的根本，呈现时不附加任何注释层。三者描述的都是同样的六十四卦；区别在于译者的笔调、语言，以及围绕核心文字的注解材料多少。",
  },
  {
    id: "tier-features",
    question: "除了代币之外，每个套餐还包含什么？",
    answer:
      "Free 包含易经（三枚铜钱或蓍草，自动或手动）和甲骨，使用卫礼贤（1924）译本。Seeker 增加完整图书馆和理雅各译本。Practitioner 增加原始周易文本。Master 增加 Master (3) 综合，同时三角化三种译本。当前代币数量、线程上限及购买方式，请从应用顶栏打开代币中心查看。",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Master (3)综合如何运作，为何如此强大？",
    answer:
      "Master (3)功能进行个性化综合：同时三角化三个根本来源（威廉、理雅各和原始周易），提炼出一致的判断。结果是一个统一解读，提供强大而即时的「具体答案」，随后是专门为您的情况精心打造的深度比较分析。每次Master (3)咨询消耗2个代币。",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "图书馆是什么，如何访问？",
    answer:
      "图书馆是64卦和三部完整文学作品的完整概要。购买任何付费包（Seeker及以上）后永久解锁访问权限。",
  },
];

const FAQ_ITEMS_KO: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "토큰, 팩, 무료 티어는 어떻게 작동하나요?",
    answer:
      "팩, 토큰 가격 및 현재 잔액에 대한 최신 정보는 앱 헤더에서 토큰 센터를 여세요. 사용 가능한 토큰, 플랜별 스레드 한도, 구매 직접 링크를 확인할 수 있습니다.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "앱에서 제공되는 주역 텍스트는 얼마나 신뢰할 수 있습니까?",
    answer:
      "신뢰성이란 당신이 읽는 신탁문, 즉 괘사, 상사, 그리고 각 효사가 AI에 의해 쓰이거나 변경되는 일이 결코 없다는 의미입니다. 이는 명시된 출판 원전과 한 글자씩 대조하여 검증된 직접 인용입니다. 영문 텍스트는 Richard Wilhelm과 Cary F. Baynes(『The I Ching or Book of Changes』, Princeton University Press, 1950년)와 James Legge(『The Sacred Books of the East』 제16권, 옥스퍼드, 1882년)에서 가져왔으며, 고전 중국어 주역은 Chinese Text Project에서 가져왔습니다. 변효 규칙은 Alfred Huang(『The Complete I Ching』, 10th Anniversary Edition, 2010년)에서, 고전적 대안은 주희의 『易學啓蒙』을 Joseph Adler가 번역한 『Introduction to the Study of the Classic of Change』(2002년)에서 가져왔습니다. AI는 귀하의 질문을 위해 이미 인용된 이 텍스트들을 해석할 뿐, 결코 생성하거나 다시 쓰지 않습니다. 전체 검증 기록은 충실도 감사 페이지를 참조하세요.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question: "주역의 두 방법, 세 동전과 시초는 무엇이 다른가요?",
    answer:
      "두 방법 모두 같은 64괘를 만들고 같은 주역 원문과 같은 고전적 효사 선택 규칙을 사용합니다. 세 동전은 빠르고 접근하기 쉽습니다. 동전 세 개를 여섯 번 던져 여섯 효를 만듭니다. 시초는 더 오래된 의례적 방법입니다. 시초나 비슷한 물건을 세며 더 느리고 사색적인 절차로 진행합니다. 선택은 해석의 권위가 아니라 의례 경험을 바꿉니다. 빠르게 보고 싶다면 세 동전, 전통적 리듬을 원한다면 시초를 사용하세요.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "역경 자동과 수동의 차이는 무엇이며, 같은 스레드에서 갑골과 섞을 수 있나요?",
    answer:
      "자동과 수동은 역경(동전 세 개 또는 시초)에만 적용됩니다. 옵션에서 역경을 선택했을 때만 점 방식 컨트롤이 보입니다. 동전 세 개 또는 시초를 선택한 후 자동(서버에서 점괘 실행) 또는 수동(본인의 동전이나 시초로 나온 여섯 효의 합계 6/7/8/9를 입력)을 선택합니다. 갑골 모드는 항상 자동이며 수동 갑골 흐름은 없습니다. 오라클이 균열 패턴을 종합하여 귀하의 고유한 상황에 맞는 개인화된 응답을 생성합니다. 요금제의 스레드 깊이 한도 안에서는 역경과 갑골을 자유롭게 번갈아 할 수 있고, 상담 간 방법과 모드를 바꿀 수 있습니다. 다음 역경 상담을 위해 설정은 기억됩니다.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "갑골 방법이란 무엇인가요?",
    answer:
      "갑골은 거북 배딱지와 소 견갑골의 균열을 읽던 상나라 시대 점복에서 영감을 받은 방법입니다. 앱에서는 주역과 별개의 방식입니다. 괘나 변효를 만들지 않습니다. 시스템이 먼저 균열 패턴과 판정을 형성하고, 그다음 AI가 이미 형성된 결과를 사용자의 언어로 해석합니다. 판정은 언제나 상나라 조상 전통에서 영감을 받은 네 가지 가능한 상태 중 하나로 떨어집니다: 1) 吉: 명확히 길함: 패턴이 모호함 없이 긍정 명제를 확인합니다; 2) 吉 중간: 다소 길함: 확인은 있지만 뉘앙스나 조건이 따릅니다; 3) 凶 중간: 다소 흉함: 패턴이 유보적으로 부정 쪽으로 기웁니다; 4) 凶: 명확히 흉함: 패턴이 모호함 없이 긍정 명제를 부정합니다. 간결하고 조상적 어조의 답에 적합하며, 시간 속에서 층층이 변하는 흐름은 주역이 더 적합합니다. 이 방법은 주역보다 훨씬 오래된 전통에 뿌리를 두고 있으며, 많은 이들이 이를 음양 원리의 뿌리 자체에 서 있는 것으로 설명합니다. 그 완전한 원형 절차는 확실히 알려져 있지 않습니다. 여기서 제공하는 것은 그 유산을 현재에 남기기 위한 정중한 현대적 단순화이며, 문자 그대로의 재현이 아닙니다.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "주역은 실제로 어떻게 작동하며, 그 답은 어디에서 오나요?",
    answer:
      "주역은 자연과 인간 삶의 변화 양상을 모은 고대 도록인 64괘를 통해 작동합니다. 각 괘는 구조화된 도형으로, 그 고전적 의미는 빌헬름 (1924) 텍스트에 보존되어 있습니다. 각 상담은 당신의 구체적인 질문에서 시작됩니다. 수학 알고리즘은 고전적 효사 선택 규칙(Alfred Huang의 축약 체계)에 따라 효를 던져 현재 괘, 변효(있다면)와 그로 인한 미래 괘를 확정합니다. 이어서 AI는 이미 형성된 그 결과를 당신의 언어로 표현하며, 해당 괘들의 고전적 의미를 당신만의 맥락에 적용합니다. 그래서 각 해석은 고유하고 개인적입니다. 같은 괘들이 서로 다른 사람에게 나올 수 있지만, 답이 같을 수는 없습니다. 답은 구체적인 질문, 삶의 시점, 그리고 상담자의 개인적 맥락에 달려 있기 때문입니다. 동시에 둘 이상에게 적용되는 보편 해석은 존재하지 않습니다.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "주역 점괘에서 어떤 효사가 해석을 지배하는지 결정하는 규칙 체계는 무엇인가요?",
    answer:
      "이 앱은 변효가 있을 때 해석을 지배하는 효사(또는 효사들)를 결정하는 두 가지 체계를 지원합니다. Alfred Huang의 축약 체계(『The Complete I Ching』, 10th Anniversary Edition, 2010년)가 기본값으로, 변효의 어떤 조합이든 항상 하나의 정확한 지배 구절로 축약하는 명확하고 현대적인 규칙 체계입니다. 주희의 고전적 해석(주희, 1130-1200년; 『易學啓蒙』, Joseph Adler 번역본)은 전통적 대안으로, 하나로 축약하는 대신 여러 경우에 두 효 또는 두 괘의 괘사를 모두 읽는 더 오래된 방법입니다. 옵션의 '변효 해석 방식' 선택기로 둘 사이를 전환할 수 있으며, 선택한 설정은 해당 해석에 대해 저장됩니다.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "왜 때때로 같은 채팅에서 더 이상 '심화'할 수 없나요?",
    answer:
      "각 스레드는 플랜에 따라 제한된 수의 연쇄 해석을 허용합니다. 한도에 도달하면 새 세션을 시작하세요. 현재 스레드 한도는 토큰 센터(앱 헤더)에서 확인하세요.",
    related: ["tokenPacks"],
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
      "청구 및 토큰 구매 정보는 앱 헤더에서 토큰 센터를 여세요. 상업적 조건 및 허용 가능한 사용은 서비스 약관에 있습니다.",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "이중 인증(2FA)을 사용할 수 있나요?",
    answer:
      "네, 선택 사항입니다. 오라클의 계정 보안에서 2FA(인증 앱 및/또는 이메일 코드)를 활성화할 수 있습니다. 가이드에서 상담과의 연동 방식을 요약합니다.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "채팅이나 대화를 삭제하려면 어떻게 하나요?",
    answer:
      "앱 헤더에서 「채팅」 섹션을 엽니다. 각 스레드에 표시되는 삭제 옵션을 사용하세요. 삭제는 즉시 이루어지며 영구적입니다.",
  },
  {
    id: "delete-account",
    question: "계정과 모든 데이터를 삭제하려면 어떻게 하나요?",
    answer:
      "앱에서 옵션(화면 하단의 버튼)을 열고 계정 삭제로 스크롤한 후 내 계정 삭제를 탭합니다. 확인 대화 상자에 DELETE를 입력하고 확인합니다. 계정은 즉시 삭제되며 자동으로 로그아웃됩니다. 삭제되는 항목: 사용자 프로필 및 로그인 자격 증명, 모든 상담 세션 및 채팅 기록, 토큰 잔액 및 사용 기록, 이중 인증 설정, 모든 개인 환경 설정. 결제 게이트웨이 제공업체는 적용 가능한 규정에 따라 세금 및 청구 목적으로 구매 기록을 보관합니다. 로그인이 불가능한 경우, 등록된 이메일 주소를 포함하여 support@theoriginaliching.com으로 이메일을 보내주세요. 30일 이내에 처리해 드립니다.",
    moreInfoLink: { href: "/delete-account", label: "자세한 내용은 계정 삭제 페이지를 참조하세요 →" },
    related: ["privacyPolicy"],
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
      "진본입니다. 텍스트 자료(괘사(卦辞), 동효의 효사(爻辞), 변괘)는 앱에서 제공하는 세 가지 학술 출처에서 인용되었습니다: 빌헬름 (1924) (Eugen Diederichs Verlag), 제임스 레그 (공공 도메인), 그리고 원전 주역. 케어리 베인스의 1950년 영어 번역본 (Princeton University Press)도 비교 참조로 보관됩니다. AI는 관련 텍스트를 귀하의 질문에 맞게 인용하고 맥락화하지만, 수정하거나 대체하지 않습니다. 원본과 텍스트를 비교해 볼 수 있습니다.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question: "앱 언어를 바꿔도 도서관의 괘사 텍스트는 왜 언어가 바뀌지 않나요?",
    answer:
      "출판된 그대로 보여주기 때문입니다. 빌헬름 (1924) 번역본과 레그 번역본은 학술 영어 그대로, 주역은 고전 중국어 그대로, 11개 인터페이스 언어 모두에서 동일한 문구로 표시됩니다. 번역본을 다시 번역하면 번역자 본인의 표현이 의역으로 바뀌어 수십 년간 확립된 학술적 성과를 왜곡할 수 있습니다. 목표는 가장 신뢰할 수 있는 출판 원전에 직접 접근하게 하는 것이며, 그것의 파생본을 제공하는 것이 아닙니다. 이는 AI 상담과는 다릅니다. AI는 항상 귀하의 질문 언어로 답하지만, 그것은 이미 형성된 결과를 귀하를 위해 해석하는 것이지 원전 텍스트를 제시하는 것이 아닙니다.",
    moreInfoLink: { href: "/library", label: "도서관 열기 →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question: "도서관의 주역 탭에는 빌헬름이나 레그처럼 \"+\" 주석이 왜 전혀 표시되지 않나요?",
    answer:
      "보여줄 주석이 전혀 없기 때문입니다. 주역은 가장 오래된 핵심 원전으로, 후대에 덧붙여진 어떤 주석 층도 없이 괘사, 상, 그리고 각 효사만을 담고 있습니다. 이는 후대 학자들이 자신만의 해석을 더하기 이전에 전해지던 그대로의 모습입니다. 빌헬름 탭에는 그 자신의 주석과 유교의 십익이 더해져 있고, 레그 탭에는 그의 주석과 부록 II의 대상해 및 소상해가 더해져 있습니다. 주역에는 의도적으로 둘 다 없습니다. 주역은 그러한 후대 주석들이 다루는 대상이 된 근본 원전이며, 그 자체로 주석을 받은 판본이 아니기 때문입니다.",
    moreInfoLink: { href: "/library", label: "도서관 열기 →" },
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
  {
    id: "translators-three",
    question: "앱에서 제공되는 세 가지 번역본은 무엇인가요?",
    answer:
      "이 앱은 주역의 세 가지 고전 번역본을 기반으로 하며, 각각 별도의 탭으로 표시됩니다. Richard Wilhelm과 Cary F. Baynes 번역본(Princeton University Press, 1950년)은 가장 널리 읽힌 서양판으로, 방대한 주석이 달려 있습니다. James Legge 번역본(『The Sacred Books of the East』 제16권, 1882년)은 선구적인 영문 학술 번역본으로, 그 자신의 주석과 상징 해석이 달려 있습니다. 주역은 원전 고전 중국어 텍스트 그 자체로, 후대의 모든 주석이 그것을 두고 쓰인 근본이며, 어떤 주석 층도 더해지지 않은 채로 표시됩니다. 세 가지 모두 같은 64괘를 설명하지만, 번역자의 어조, 언어, 그리고 핵심 텍스트를 둘러싼 설명 자료의 양에서 차이가 있습니다.",
  },
  {
    id: "tier-features",
    question: "토큰 외에 각 팩에는 무엇이 포함되나요?",
    answer:
      "Free에는 주역(세 동전 또는 서죽, 자동 또는 수동)과 갑골이 포함되며, Wilhelm (1924) 번역본을 사용할 수 있습니다. Seeker는 전체 도서관과 Legge 번역본을 추가합니다. Practitioner는 원전 주역 텍스트를 추가합니다. Master는 세 번역본을 동시에 삼각 측정하는 Master (3) 합성을 추가합니다. 현재 토큰 수량, 스레드 한도, 구매 방법은 앱 헤더에서 토큰 센터를 열어 확인하세요.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Master (3) 합성은 어떻게 작동하며 왜 그렇게 강력한가요?",
    answer:
      "Master (3) 기능은 개인화된 합성을 수행합니다: 세 가지 근본 출처(Wilhelm, Legge, 원전 주역)를 동시에 삼각 측정하여 일관된 판결을 도출합니다. 결과는 즉각적이고 강력한 '구체적인 답변'을 제공하는 통합 해석이며, 이후 귀하의 상황에 맞게 고유하게 작성된 심층 비교 분석이 이어집니다. Master (3) 상담 1회당 2토큰이 소모됩니다.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "도서관이란 무엇이며 어떻게 접근하나요?",
    answer:
      "도서관은 64괘와 세 가지 완전한 문학 작품의 완전한 개요입니다. 유료 팩(Seeker 이상)을 구매하면 영구적으로 접근이 잠금 해제됩니다.",
  },
];

const FAQ_ITEMS_PT: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "Como funcionam os tokens, os pacotes e o nível gratuito?",
    answer:
      "Para informações atualizadas sobre pacotes, preços e o seu saldo de tokens, abra o Centro de tokens no cabeçalho da app. Verá os tokens disponíveis, o limite por fio de cada plano e um link direto para comprar.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "Quão confiáveis são os textos do I Ching no aplicativo?",
    answer:
      "Confiabilidade significa que o texto do oráculo que lês, o Julgamento, a Imagem e cada linha, nunca é escrito nem alterado pela IA. É uma citação direta, verificada palavra por palavra contra uma fonte publicada com nome próprio. O texto em inglês vem de Richard Wilhelm e Cary F. Baynes (The I Ching or Book of Changes, Princeton University Press, 1950) e de James Legge (The Sacred Books of the East, vol. XVI, Oxford, 1882); o Zhou Yi em chinês clássico vem do Chinese Text Project. As regras de linhas mutantes vêm de Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) e, para a alternativa clássica, do Yixue Qimeng de Zhu Xi na tradução de Joseph Adler (Introduction to the Study of the Classic of Change, 2002). A IA interpreta estes textos já citados para a tua pergunta; nunca os gera nem os reescreve. Consulta a página Auditorias de fidelidade para o registo completo de verificação.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question:
      "Em que diferem os dois métodos do I Ching: Três Moedas e Varetas?",
    answer:
      "Ambos os métodos produzem os mesmos 64 hexagramas e usam os mesmos textos do I Ching e as mesmas regras clássicas de seleção de linha. Três Moedas é rápido e acessível: lanças três moedas seis vezes para formar as seis linhas. Varetas de Milefólio é o método ritual mais antigo: trabalhas com varetas ou objetos semelhantes através de um procedimento mais lento e contemplativo. A escolha muda a experiência ritual, não a autoridade da leitura. Usa Três Moedas para rapidez; usa Varetas quando quiseres o ritmo tradicional.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "O que é I Ching automático vs manual, e posso misturar Ossos no mesmo fio?",
    answer:
      "Automático vs manual aplica-se apenas ao I Ching (Três Moedas ou Varetas de Milefólio). Em Opções os controlos do modo de tiragem aparecem com o I Ching selecionado: escolha Três Moedas ou Varetas, depois automático (a tiragem corre no servidor) ou manual (introduza os seis totais de linha 6/7/8/9 das suas moedas ou varetas). O modo Ossos é sempre automático; não existe fluxo manual de ossos; o oráculo sintetiza padrões de fissuras para gerar uma resposta pessoal e adequada à sua situação única. Dentro do limite de profundidade por fio do seu plano, pode alternar livremente I Ching e Ossos e mudar métodos e modos entre consultas; a app memoriza as suas preferências para a próxima leitura em I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "O que é o método dos Ossos Oraculares?",
    answer:
      "Ossos Oraculares é um método de adivinhação da era Shang inspirado na leitura de fissuras em plastrões de tartaruga e escápulas de boi. Na app, é separado do I Ching: não cria hexagramas nem linhas mutantes. O sistema forma primeiro um padrão de fissuras e um veredicto; depois a IA interpreta esse resultado já formado no teu idioma. O veredicto cai sempre num de quatro estados possíveis, inspirados no método ancestral Shang: 1) 吉: favorável claro: o padrão confirma a carga positiva sem ambiguidade; 2) 吉 moderado: favorável moderado: há confirmação, mas com nuances ou condições; 3) 凶 moderado: desfavorável moderado: o padrão inclina-se para a negação com reservas; 4) 凶: desfavorável claro: o padrão nega a carga positiva sem ambiguidade. É útil para respostas concisas, de tom ancestral; o I Ching é melhor para mudanças em camadas ao longo do tempo. Este método baseia-se numa tradição muito mais antiga do que o I Ching, situada por muitos na própria raiz do princípio yin-yang. Não se conhece com certeza o seu procedimento original completo; o que aqui se oferece é uma simplificação moderna e respeitosa, pensada para manter presente esse legado, não uma reconstrução literal.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question: "Como é que o I Ching funciona e de onde vêm as suas respostas?",
    answer:
      "O I Ching opera através de 64 hexagramas, um catálogo milenar dos padrões de mudança na natureza e na vida humana. Cada hexagrama é uma figura estruturada, com um significado clássico preservado nas obras clássicas de Wilhelm (1924), James Legge ou no texto original Zhou Yi. Cada consulta parte da tua pergunta concreta. O algoritmo matemático lança as linhas segundo as regras clássicas de seleção de linha (o sistema de redução de Alfred Huang) para determinar o hexagrama presente, as linhas em movimento (caso existam) e o hexagrama futuro resultante. Em seguida a IA articula esse resultado já formado no teu idioma, aplicando o significado clássico desses hexagramas ao teu contexto particular. Por isso cada leitura é única e pessoal: os mesmos hexagramas podem aparecer para pessoas diferentes, mas a resposta nunca é a mesma, porque depende da pergunta concreta, do momento de vida e do contexto pessoal do consultante. Não existe uma interpretação universal aplicável a mais de uma pessoa em simultâneo.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question: "Qual é o sistema de regras que determina qual texto de linha governa uma leitura do I Ching?",
    answer:
      "A app admite dois sistemas para resolver qual texto de linha, ou textos, governa uma leitura quando há linhas mutantes. O sistema de redução de Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) é o predefinido: um conjunto de regras claro e moderno que reduz sempre qualquer combinação de linhas mutantes a uma única passagem governante precisa. A leitura clássica de Zhu Xi (朱熹, 1130-1200; Yixue Qimeng, na tradução de Joseph Adler) é a alternativa tradicional: um método mais antigo que, em vários casos, lê ambas as linhas ou ambos os Julgamentos em vez de reduzir a um só. Alterna entre os dois com o seletor «Leitura de linhas mutantes» em Opções; a tua escolha é lembrada para essa leitura.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question: "Por que às vezes não consigo «aprofundar» mais no mesmo chat?",
    answer:
      "Cada fio admite um número limitado de leituras encadeadas conforme o seu plano. Ao atingir o limite, abra uma nova sessão. Consulte o seu limite por fio atual no Centro de tokens (cabeçalho da app).",
    related: ["tokenPacks"],
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
      "Para informações de faturação e compra de tokens, abra o Centro de tokens no cabeçalho da app. As condições comerciais e o uso aceitável estão nos Termos de Serviço.",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "A autenticação em dois fatores (2FA) está disponível?",
    answer:
      "Sim, de forma opcional: pode ativar 2FA (authenticator e/ou código por e-mail) nas definições de segurança da conta no oráculo. O guia resume como se integra com as consultas.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "Como elimino um chat ou conversa?",
    answer:
      "Abre a secção «Conversas» no cabeçalho da app. Utiliza a opção de eliminar que aparece em cada fio. A eliminação é imediata e permanente.",
  },
  {
    id: "delete-account",
    question: "Como elimino a minha conta e todos os meus dados?",
    answer:
      "Abre as Opções na app (botão na base do compositor), desloca-te até Eliminar conta e toca em Eliminar a minha conta. No diálogo de confirmação, escreve ELIMINAR e confirma. A tua conta é eliminada imediatamente e a sessão é encerrada automaticamente. O que é eliminado: o teu perfil de utilizador e credenciais de acesso, todas as sessões de consulta e histórico de chat, o saldo de tokens e registos de utilização, a configuração de 2FA e todas as preferências pessoais. Os fornecedores de passerelles de pagamento conservam os registos de compras para efeitos fiscais conforme exigido pelas regulamentações aplicáveis. Se não conseguires iniciar sessão, envia-nos um email para support@theoriginaliching.com com o teu endereço de email registado. Processaremos o teu pedido em 30 dias.",
    moreInfoLink: { href: "/delete-account", label: "Para mais informações, consulta a página de eliminação de conta →" },
    related: ["privacyPolicy"],
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
    question:
      "Os textos do I Ching que aparecem na leitura são autênticos ou gerados por IA?",
    answer:
      "São autênticos. O material textual (Julgamentos (卦辞), linhas em movimento (爻辞) e hexagramas resultantes) provém de três fontes académicas disponíveis na app: Wilhelm (1924) (Eugen Diederichs Verlag), James Legge (domínio público) e o Zhou Yi original. A versão inglesa de Cary Baynes (Princeton University Press, 1950) também está disponível como referência comparativa. A IA cita e contextualiza os textos relevantes com a sua pergunta, mas não os modifica nem substitui. Pode comparar qualquer texto com a fonte original.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "Por que o texto dos hexagramas na Biblioteca não muda de idioma quando mudo o idioma do app?",
    answer:
      "É mostrado exatamente como foi publicado. Wilhelm (1924) e Legge aparecem no seu inglês acadêmico, e o Zhou Yi em chinês clássico, as mesmas palavras nos 11 idiomas da interface. Voltar a traduzir uma tradução substituiria as palavras do próprio tradutor por uma paráfrase e poderia distorcer décadas de trabalho académico já estabelecido. O objetivo é dar acesso direto à fonte publicada mais confiável, não a uma versão derivada dela. Isso é diferente da sua consulta com a IA, que responde sempre no idioma da sua pergunta: ali a IA interpreta para si um resultado já formado, não apresenta um texto primário.",
    moreInfoLink: { href: "/library", label: "Abre a Biblioteca →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "Por que a aba Zhou Yi na Biblioteca não mostra nenhum comentário com \"+\" como Wilhelm ou Legge?",
    answer:
      "Porque não há nenhum para mostrar. O Zhou Yi é o texto núcleo mais antigo, sem nenhuma camada posterior de comentário associada: apenas o Julgamento, a Imagem e os oráculos de cada linha, exatamente como circulava antes de estudiosos posteriores acrescentarem as suas próprias leituras. A aba de Wilhelm acrescenta o seu próprio comentário mais as Dez Alas confucianas; a de Legge acrescenta as suas notas mais o Grande e o Menor Simbolismo do seu Apêndice II. O Zhou Yi não tem nenhum dos dois, de propósito: é o texto raiz sobre o qual esses comentários posteriores foram escritos, não uma versão que recebeu um próprio.",
    moreInfoLink: { href: "/library", label: "Abre a Biblioteca →" },
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
  {
    id: "translators-three",
    question: "Quais são os três tradutores disponíveis na app?",
    answer:
      "A app apoia-se em três traduções clássicas do I Ching, mostradas como separadores distintos. Richard Wilhelm e Cary F. Baynes (Princeton University Press, 1950) é a edição ocidental mais lida, com um comentário extenso. James Legge (The Sacred Books of the East, vol. XVI, 1882) é a tradução académica pioneira em inglês, com as suas próprias notas e simbolismo. O Zhou Yi é o texto original em chinês clássico, a raiz sobre a qual foram escritos os comentários posteriores, mostrado sem nenhuma camada de comentário adicionada. Os três descrevem os mesmos 64 hexagramas; diferem na voz do tradutor, no idioma e em quanto material explicativo rodeia o texto central.",
  },
  {
    id: "tier-features",
    question: "O que inclui cada pack, além dos tokens?",
    answer:
      "O Free inclui o I Ching (Três Moedas ou Varetas de Milefólio, automático ou manual) e os Ossos Oraculares, com o tradutor Wilhelm (1924). O Seeker adiciona a Biblioteca completa e o tradutor Legge. O Practitioner adiciona o texto original do Zhou Yi. O Master adiciona a síntese Master (3), que triangula os três tradutores em simultâneo. Para ver quantidades de tokens em vigor, limites por fio e como comprar, abre o Centro de tokens no cabeçalho da app.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Como funciona a síntese Master (3) e por que é tão poderosa?",
    answer:
      "A função Master (3) realiza uma Síntese Personalizada: triangula simultaneamente as três fontes raíz (Wilhelm, Legge e o Zhou Yi original) para destilar um veredicto coerente. O resultado é uma interpretação unificada que oferece uma 'Resposta Concreta' poderosa e imediata, seguida de uma análise comparativa profunda elaborada de forma única para a tua situação. Cada consulta Master (3) consome 2 tokens.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "O que é a Biblioteca e como se acede a ela?",
    answer:
      "É o compêndio completo dos 64 hexagramas e das três obras literárias íntegras. O acesso é desbloqueado de forma permanente ao adquirir qualquer pack pago (Seeker em diante).",
  },
];

const FAQ_ITEMS_DE: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "Wie funktionieren Tokens, Packs und das Gratis-Tier?",
    answer:
      "Aktuelle Informationen zu Packs, Token-Preisen und Ihrem Guthaben finden Sie im Token-Center, das Sie über den App-Header öffnen können. Dort sehen Sie Ihre verfügbaren Tokens, das Thread-Limit je Plan und einen Direktlink zum Kauf.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "Wie zuverlässig sind die I-Ging-Texte in der App?",
    answer:
      "Zuverlässigkeit bedeutet, dass der Orakeltext, den Sie lesen, das Urteil, das Bild und jede Linie, niemals von der KI geschrieben oder verändert wird. Es ist ein direktes Zitat, Wort für Wort gegen eine namentlich genannte veröffentlichte Quelle geprüft. Der englische Text stammt von Richard Wilhelm und Cary F. Baynes (The I Ching or Book of Changes, Princeton University Press, 1950) und von James Legge (The Sacred Books of the East, Bd. XVI, Oxford, 1882); das klassische chinesische Zhou Yi stammt vom Chinese Text Project. Die Regeln für wandelnde Linien stammen von Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) und, für die klassische Alternative, aus Zhu Xis Yixue Qimeng in der Übersetzung von Joseph Adler (Introduction to the Study of the Classic of Change, 2002). Die KI interpretiert diese bereits zitierten Texte für Ihre Frage; sie erzeugt oder schreibt sie niemals neu. Das vollständige Verifizierungsprotokoll finden Sie auf der Fidelitätsprüfungen-Seite.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question:
      "Worin unterscheiden sich die zwei I Ging Methoden: Drei Münzen und Schafgarbenstäbe?",
    answer:
      "Beide Methoden erzeugen dieselben 64 Hexagramme und verwenden dieselben I Ging Texte sowie dieselben klassischen Linienauswahlregeln. Drei Münzen ist schnell und leicht zugänglich: drei Münzen werden sechsmal geworfen, um die sechs Linien zu bilden. Schafgarbenstäbe ist die ältere rituelle Methode: Man arbeitet mit gezählten Stäben oder ähnlichen Gegenständen in einem langsameren, kontemplativeren Ablauf. Die Wahl verändert das rituelle Erleben, nicht die Gültigkeit der Lesung. Nutze Drei Münzen für Schnelligkeit; nutze Schafgarbenstäbe für den traditionellen Rhythmus.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "Was bedeutet automatisch vs. manuell beim I Ching, und kann ich Orakelknochen im selben Thread mischen?",
    answer:
      "Automatisch vs. manuell gilt nur für das I Ching (Drei Münzen oder Schafgarbenstäbe). In den Optionen erscheinen die Wurfmodus-Steuerelemente nur bei ausgewähltem I Ching: Wählen Sie Drei Münzen oder Schafgarbenstäbe, dann automatisch (der Wurf erfolgt auf dem Server) oder manuell (Sie tragen die sechs Liniensummen 6/7/8/9 Ihrer eigenen Münzen oder Stäbe ein). Der Orakelknochen-Modus ist immer automatisch; es gibt keinen manuellen Knochenablauf; Das Orakel synthetisiert Rissmuster, um eine persönliche Antwort zu erzeugen, die auf Ihre einzigartige Situation abgestimmt ist. Innerhalb des Thread-Tiefenlimits Ihres Tarifs können Sie frei zwischen I Ching und Orakelknochen wechseln und Methoden und Modi zwischen Beratungen umschalten; Ihre Einstellungen werden für die nächste I-Ching-Beratung gespeichert.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Was ist die Methode der Orakelknochen?",
    answer:
      "Orakelknochen ist eine Wahrsagemethode aus der Shang Zeit, inspiriert vom Lesen von Rissen auf Schildkrötenpanzern und Ochsenschulterblättern. In der App ist sie vom I Ging getrennt: Sie erzeugt keine Hexagramme und keine wandelnden Linien. Das System bildet zuerst ein Rissmuster und ein Urteil; danach interpretiert die KI dieses bereits gebildete Ergebnis in deiner Sprache. Das Urteil fällt stets in einen von vier möglichen Zuständen, die von der ursprünglichen Shang-Tradition inspiriert sind: 1) 吉: eindeutig günstig: das Muster bestätigt die positive Ladung ohne Mehrdeutigkeit; 2) 吉 mäßig: mäßig günstig: Bestätigung mit Nuancen oder Bedingungen; 3) 凶 mäßig: mäßig ungünstig: das Muster neigt mit Vorbehalten zur Verneinung; 4) 凶: eindeutig ungünstig: das Muster verneint die positive Ladung ohne Mehrdeutigkeit. Sie eignet sich für knappe Antworten im Ahnenstil; das I Ging eignet sich besser für vielschichtigen Wandel über die Zeit. Diese Methode stützt sich auf eine Tradition, die weit älter ist als das I Ging, und die viele am eigentlichen Ursprung des Yin-Yang-Prinzips verorten. Ihr vollständiger ursprünglicher Ablauf ist nicht mit Sicherheit bekannt; was hier angeboten wird, ist eine moderne, respektvolle Vereinfachung, die dieses Erbe gegenwärtig halten soll, keine wörtliche Rekonstruktion.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question:
      "Wie funktioniert das I Ging tatsächlich, und woher kommen seine Antworten?",
    answer:
      "Das I Ging arbeitet über 64 Hexagramme, einen jahrtausendealten Katalog von Wandlungsmustern in Natur und menschlichem Leben. Jedes Hexagramm ist eine strukturierte Figur, deren klassische Bedeutung in den Wilhelm (1924)-Texten bewahrt ist. Jede Beratung beginnt mit Ihrer konkreten Frage. Der mathematische Algorithmus wirft die Linien nach den klassischen Linienauswahlregeln (Alfred Huangs Reduktionssystem) und bestimmt das gegenwärtige Hexagramm, die wandelnden Linien (falls vorhanden) und das daraus resultierende zukünftige Hexagramm. Anschließend formuliert die KI dieses bereits gebildete Ergebnis in Ihrer Sprache und überträgt die klassische Bedeutung dieser Hexagramme auf Ihren persönlichen Kontext. Genau deshalb ist jede Lesung einzigartig und persönlich: Dieselben Hexagramme können bei verschiedenen Menschen auftreten, doch die Antwort ist nie dieselbe, sie hängt von der konkreten Frage, dem Lebensmoment und dem persönlichen Kontext des Ratsuchenden ab. Es gibt keine allgemeingültige Deutung, die zugleich für mehrere Personen gilt.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question:
      "Welches Regelsystem bestimmt, welcher Linientext eine I-Ging-Lesung beherrscht?",
    answer:
      "Die App unterstützt zwei Systeme, um zu bestimmen, welcher Linientext, oder welche Linientexte, eine Lesung beherrschen, wenn Linien wandeln. Alfred Huangs Reduktionssystem (The Complete I Ching, 10th Anniversary Edition, 2010) ist die Standardeinstellung: ein klares, modernes Regelwerk, das jede Kombination wandelnder Linien stets auf eine präzise beherrschende Textstelle reduziert. Zhu Xis klassische Lesung (朱熹, 1130-1200; Yixue Qimeng, in der Übersetzung von Joseph Adler) ist die traditionelle Alternative: eine ältere Methode, die in mehreren Fällen beide Linien oder beide Urteile liest, statt auf eine zu reduzieren. Wechseln Sie zwischen beiden mit dem Auswahlschalter „Lesung wandelnder Linien“ in den Optionen; Ihre Wahl wird für diese Lesung gespeichert.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question:
      "Warum kann ich manchmal im selben Chat nicht weiter «vertiefen»?",
    answer:
      "Jeder Thread erlaubt eine begrenzte Anzahl verketteter Lesungen je nach Plan. Wenn das Limit erreicht ist, starten Sie eine neue Sitzung. Ihr aktuelles Thread-Limit finden Sie im Token-Center (App-Header).",
    related: ["tokenPacks"],
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
      "Für Abrechnungs- und Token-Kaufinformationen öffnen Sie das Token-Center über den App-Header. Kommerzielle Bedingungen und zulässige Nutzung finden sich in den Nutzungsbedingungen.",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "Ist Zwei-Faktor-Authentifizierung (2FA) verfügbar?",
    answer:
      "Ja, optional: Sie können 2FA (Authenticator und/oder E-Mail-Codes) aus den Kontosicherheitseinstellungen im Orakel aktivieren. Der Leitfaden fasst zusammen, wie es mit Beratungen interagiert.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "Wie lösche ich einen Chat oder eine Unterhaltung?",
    answer:
      "Öffne den Bereich «Chats» in der App-Kopfzeile. Nutze die Löschoption, die bei jedem Thread angezeigt wird. Die Löschung ist sofort und dauerhaft.",
  },
  {
    id: "delete-account",
    question: "Wie lösche ich mein Konto und alle meine Daten?",
    answer:
      "Öffne Optionen in der App (Schaltfläche am unteren Rand des Composers), scrolle zu Konto löschen und tippe auf Mein Konto löschen. Gib im Bestätigungsdialog LÖSCHEN ein und bestätige. Dein Konto wird sofort gelöscht und du wirst automatisch abgemeldet. Was wird gelöscht: dein Benutzerprofil und Anmeldedaten, alle Beratungssitzungen und der Chat-Verlauf, Token-Guthaben und Nutzungsaufzeichnungen, die 2FA-Konfiguration und alle persönlichen Einstellungen. Zahlungsgateway-Anbieter speichern Kaufbelege zu steuerlichen und Abrechnungszwecken gemäß den geltenden Vorschriften. Falls du dich nicht anmelden kannst, schreibe uns an support@theoriginaliching.com mit deiner registrierten E-Mail-Adresse. Wir bearbeiten deinen Antrag innerhalb von 30 Tagen.",
    moreInfoLink: { href: "/delete-account", label: "Weitere Informationen auf der Seite zur Kontolöschung →" },
    related: ["privacyPolicy"],
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
    question:
      "Wer generiert das Hexagramm oder das Urteil: die KI oder der Algorithmus?",
    answer:
      "Der mathematische Algorithmus, nicht die KI. Im I-Ching-Modus baut der Algorithmus das Hexagramm Linie für Linie auf und bestimmt die leitende Linie und das resultierende Hexagramm. Im Knochenmodus generiert er das Rissmuster und das Urteil. Die künstliche Intelligenz greift danach ein: Sie nimmt dieses bereits berechnete Ergebnis und formuliert es in natürlicher Sprache in Ihrer Sprache, mit dem Kontext Ihrer Frage. Die KI ist der Interpret. Das Orakel ist die Methode.",
  },
  {
    id: "authentic-texts",
    question:
      "Sind die I-Ching-Texte in der Lesung authentisch oder KI-generiert?",
    answer:
      "Sie sind authentisch. Das Textmaterial (Urteile (卦辞), sich bewegende Linien (爻辞) und resultierende Hexagramme) stammt aus drei wissenschaftlichen Quellen, die in der App verfügbar sind: Wilhelm (1924) (Eugen Diederichs Verlag), James Legge (gemeinfrei) und das originale Zhou Yi. Cary Baynes' englische Fassung von 1950 (Princeton University Press) ist ebenfalls als Vergleichsreferenz verfügbar. Die KI zitiert und kontextualisiert die relevanten Texte mit Ihrer Frage, ändert oder ersetzt sie aber nicht. Sie können jeden Text mit der Originalquelle vergleichen.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "Warum ändert sich der Hexagramm-Text in der Bibliothek nicht, wenn ich die Sprache der App wechsle?",
    answer:
      "Er wird genau so angezeigt, wie er veröffentlicht wurde. Wilhelm (1924) und Legge erscheinen in ihrem akademischen Englisch, und das Zhou Yi in klassischem Chinesisch, mit denselben Worten in allen 11 Oberflächensprachen. Eine Übersetzung erneut zu übersetzen würde die eigenen Worte des Übersetzers durch eine Paraphrase ersetzen und könnte Jahrzehnte etablierter Forschung verzerren. Ziel ist direkter Zugang zur zuverlässigsten veröffentlichten Quelle, nicht zu einer abgeleiteten Version davon. Das unterscheidet sich von Ihrer KI-Beratung, die immer in der Sprache Ihrer Frage antwortet: dort interpretiert die KI ein bereits geformtes Ergebnis für Sie, sie stellt keinen Primärtext dar.",
    moreInfoLink: { href: "/library", label: "Bibliothek öffnen →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "Warum zeigt der Zhou-Yi-Tab in der Bibliothek keinen Kommentar mit einem \"+\" wie Wilhelm oder Legge?",
    answer:
      "Weil es keinen zu zeigen gibt. Das Zhou Yi ist der älteste Kerntext, ohne jede später hinzugefügte Kommentarschicht: nur das Urteil, das Bild und die Linienorakel, genau wie er kursierte, bevor spätere Gelehrte ihre eigenen Deutungen hinzufügten. Der Wilhelm-Tab fügt seinen eigenen Kommentar plus die konfuzianischen Zehn Flügel hinzu; der Legge-Tab fügt seine Anmerkungen plus die Große und die Kleinere Symbolik aus seinem Anhang II hinzu. Das Zhou Yi hat keines von beiden, absichtlich: es ist der Wurzeltext, über den diese späteren Kommentare geschrieben wurden, nicht eine Fassung, die selbst einen erhalten hat.",
    moreInfoLink: { href: "/library", label: "Bibliothek öffnen →" },
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
  {
    id: "translators-three",
    question: "Welche drei Übersetzer stehen in der App zur Verfügung?",
    answer:
      "Die App stützt sich auf drei klassische Übersetzungen des I Ging, die als separate Tabs angezeigt werden. Richard Wilhelm und Cary F. Baynes (Princeton University Press, 1950) ist die meistgelesene westliche Ausgabe, mit einem ausführlichen Kommentar. James Legge (The Sacred Books of the East, Bd. XVI, 1882) ist die bahnbrechende englische wissenschaftliche Übersetzung, mit seinen eigenen Fußnoten und seiner Symbolik. Das Zhou Yi ist der originale klassische chinesische Text selbst, die Wurzel, über die alle späteren Kommentare geschrieben wurden, dargestellt ohne jede hinzugefügte Kommentarschicht. Alle drei beschreiben dieselben 64 Hexagramme; sie unterscheiden sich in der Stimme des Übersetzers, der Sprache und dem Umfang des erklärenden Materials rund um den Kerntext.",
  },
  {
    id: "tier-features",
    question: "Was enthält jedes Paket, abgesehen von den Tokens?",
    answer:
      "Free umfasst das I Ging (Drei Münzen oder Schafgarbenstäbe, automatisch oder manuell) und Orakelknochen, mit dem Übersetzer Wilhelm (1924). Seeker fügt die vollständige Bibliothek und den Übersetzer Legge hinzu. Practitioner fügt den originalen Zhou-Yi-Text hinzu. Master fügt die Master (3)-Synthese hinzu, die alle drei Übersetzer gleichzeitig trianguliert. Aktuelle Token-Mengen, Thread-Limits und wie Sie kaufen können, finden Sie im Token-Center, das Sie über den App-Header öffnen.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Wie funktioniert die Master (3)-Synthese und warum ist sie so leistungsstark?",
    answer:
      "Die Master (3)-Funktion führt eine Persönliche Synthese durch: Sie trianguliert gleichzeitig die drei Wurzelquellen (Wilhelm, Legge und das originale Zhou Yi), um ein kohärentes Urteil zu destillieren. Das Ergebnis ist eine einheitliche Interpretation, die eine kraftvolle und unmittelbare 'Konkrete Antwort' bietet, gefolgt von einer eingehenden vergleichenden Analyse, die einzigartig für Ihre Situation erstellt wurde. Jede Master (3)-Konsultation verbraucht 2 Tokens.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "Was ist die Bibliothek und wie greife ich darauf zu?",
    answer:
      "Die Bibliothek ist das vollständige Kompendium der 64 Hexagramme und der drei vollständigen literarischen Werke. Der Zugang wird dauerhaft freigeschaltet, wenn ein beliebiges kostenpflichtiges Paket (Seeker aufwärts) erworben wird.",
  },
];

const FAQ_ITEMS_IT: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "Come funzionano i token, i pacchetti e il piano gratuito?",
    answer:
      "Per informazioni aggiornate su pacchetti, prezzi dei token e il tuo saldo attuale, apri il Centro token dall'intestazione dell'app. Troverai i token disponibili, il limite per filo per piano e un link diretto all'acquisto.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question: "Quanto sono affidabili i testi dell'I Ching nell'app?",
    answer:
      "Affidabilità significa che il testo dell'oracolo che leggi, il Giudizio, l'Immagine e ogni linea, non viene mai scritto né alterato dall'IA. È una citazione diretta, verificata parola per parola rispetto a una fonte pubblicata con nome proprio. Il testo in inglese proviene da Richard Wilhelm e Cary F. Baynes (The I Ching or Book of Changes, Princeton University Press, 1950) e da James Legge (The Sacred Books of the East, vol. XVI, Oxford, 1882); lo Zhou Yi in cinese classico proviene dal Chinese Text Project. Le regole delle linee mutanti provengono da Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) e, per l'alternativa classica, dallo Yixue Qimeng di Zhu Xi nella traduzione di Joseph Adler (Introduction to the Study of the Classic of Change, 2002). L'IA interpreta questi testi già citati per la tua domanda; non li genera né li riscrive mai. Consulta la pagina Audit di fedeltà per il registro completo di verifica.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question:
      "In cosa differiscono i due metodi dell'I Ching: Tre Monete e Steli di Achillea?",
    answer:
      "Entrambi i metodi producono gli stessi 64 esagrammi e usano gli stessi testi dell'I Ching e le stesse regole classiche di selezione della linea. Tre Monete è rapido e accessibile: si lanciano tre monete sei volte per formare le sei linee. Steli di Achillea è il metodo rituale più antico: si lavora con steli o oggetti simili attraverso una procedura più lenta e contemplativa. La scelta cambia l'esperienza rituale, non l'autorità della lettura. Usa Tre Monete per la rapidità; usa Steli di Achillea quando desideri il ritmo tradizionale.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "Che cos'è I Ching automatico vs manuale, e posso mescolare le Ossa nello stesso filo?",
    answer:
      "Automatico vs manuale vale solo per l'I Ching (Tre Monete o Steli di Achillea). In Opzioni i controlli del modo di lancio compaiono con l'I Ching selezionato: scegli Tre Monete o Steli di Achillea, poi automatico (il lancio avviene sul server) o manuale (inserisci i sei totali di linea 6/7/8/9 delle tue monete o steli). La modalità Ossa è sempre automatica; non esiste un flusso manuale per le ossa; l'oracolo sintetizza i pattern di crepe per generare una risposta personale e adeguata alla tua situazione unica. Entro il limite di profondità per filo del tuo piano, puoi alternare liberamente I Ching e Ossa e cambiare metodi e modalità tra consultazioni; l'app memorizza le tue preferenze per la prossima lettura in I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Che cos'è il metodo degli Ossi Oracolari?",
    answer:
      "Gli Ossi Oracolari sono un metodo divinatorio dell'epoca Shang ispirato alla lettura delle crepe su piastroni di tartaruga e scapole di bue. Nell'app è separato dall'I Ching: non crea esagrammi né linee mutanti. Il sistema forma prima un pattern di crepe e un verdetto; poi l'IA interpreta quel risultato già formato nella tua lingua. Il verdetto rientra sempre in uno dei quattro stati possibili, ispirati al metodo ancestrale Shang: 1) 吉: chiaramente favorevole: il motivo conferma la carica positiva senza ambiguità; 2) 吉 moderato: moderatamente favorevole: c'è conferma ma con sfumature o condizioni; 3) 凶 moderato: moderatamente sfavorevole: il motivo pende verso la negazione con riserve; 4) 凶: chiaramente sfavorevole: il motivo nega la carica positiva senza ambiguità. È utile per risposte concise, dal tono ancestrale; l'I Ching è più adatto ai cambiamenti stratificati nel tempo. Questo metodo si basa su una tradizione molto più antica dell'I Ching, che molti collocano all'origine stessa del principio yin-yang. Non si conosce con certezza la sua procedura originale completa; quella offerta qui è una semplificazione moderna e rispettosa, pensata per mantenere presente questa eredità, non una ricostruzione letterale.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question:
      "Come funziona davvero l'I Ching e da dove arrivano le sue risposte?",
    answer:
      "L'I Ching opera attraverso 64 esagrammi, un catalogo millenario dei pattern di cambiamento nella natura e nella vita umana. Ogni esagramma è una figura strutturata con un significato classico preservato nei testi Wilhelm (1924). Ogni consultazione parte dalla tua domanda concreta. L'algoritmo matematico lancia le linee secondo le regole classiche di selezione della linea (il sistema di riduzione di Alfred Huang) per determinare l'esagramma presente, le eventuali linee in movimento e l'esagramma futuro risultante. L'IA articola poi quel risultato già formato nella tua lingua, applicando il significato classico di quegli esagrammi al tuo contesto particolare. Per questo ogni lettura è unica e personale: gli stessi esagrammi possono comparire per persone diverse, ma la risposta non è mai la stessa, perché dipende dalla domanda specifica, dal momento di vita e dal contesto personale di chi consulta. Non esiste un'interpretazione universale applicabile a più di una persona contemporaneamente.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question:
      "Qual è il sistema di regole che determina quale testo di linea governa una lettura dell'I Ching?",
    answer:
      "L'app supporta due sistemi per stabilire quale testo di linea, o testi, governa una lettura quando ci sono linee mutanti. Il sistema di riduzione di Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) è quello predefinito: un insieme di regole chiaro e moderno che riduce sempre qualsiasi combinazione di linee mutanti a un unico passaggio governante preciso. La lettura classica di Zhu Xi (朱熹, 1130-1200; Yixue Qimeng, nella traduzione di Joseph Adler) è l'alternativa tradizionale: un metodo più antico che, in diversi casi, legge entrambe le linee o entrambi i Giudizi invece di ridurre a uno solo. Passa dall'uno all'altro con il selettore «Lettura delle linee mutanti» in Opzioni; la tua scelta viene memorizzata per quella lettura.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question:
      "Perché a volte non riesco ad «approfondire» ulteriormente nella stessa chat?",
    answer:
      "Ogni filo ammette un numero limitato di letture concatenate in base al tuo piano. Quando si raggiunge il limite, avvia una nuova sessione. Controlla il tuo limite per filo attuale nel Centro token (intestazione dell'app).",
    related: ["tokenPacks"],
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
    question:
      "Dove trovo informazioni sulla fatturazione e sulle condizioni del servizio?",
    answer:
      "Per la fatturazione e l'acquisto di token, apri il Centro token dall'intestazione dell'app. Le condizioni commerciali e l'uso accettabile si trovano nei Termini di Servizio.",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "È disponibile l'autenticazione a due fattori (2FA)?",
    answer:
      "Sì, opzionale: puoi attivare 2FA (authenticator e/o codici email) dalla sicurezza dell'account nell'oracolo. La guida riassume come si integra con le consultazioni.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "Come elimino una chat o una conversazione?",
    answer:
      "Apri la sezione «Chat» dall'intestazione dell'app. Usa l'opzione di eliminazione mostrata su ogni thread. L'eliminazione è immediata e permanente.",
  },
  {
    id: "delete-account",
    question: "Come elimino il mio account e tutti i miei dati?",
    answer:
      "Apri Opzioni nell'app (pulsante in fondo al compositore), scorri fino a Elimina account e tocca Elimina il mio account. Nella finestra di conferma scrivi ELIMINA e conferma. Il tuo account viene eliminato immediatamente e verrai disconnesso automaticamente. Cosa viene eliminato: il tuo profilo utente e le credenziali di accesso, tutte le sessioni di consultazione e la cronologia delle chat, il saldo token e i registri di utilizzo, la configurazione 2FA e tutte le preferenze personali. I fornitori di gateway di pagamento conservano i registri degli acquisti per finalità fiscali e di fatturazione come richiesto dalle normative applicabili. Se non riesci ad accedere, scrivici a support@theoriginaliching.com con il tuo indirizzo email registrato. Elaboreremo la tua richiesta entro 30 giorni.",
    moreInfoLink: { href: "/delete-account", label: "Per ulteriori informazioni, visita la pagina di eliminazione dell'account →" },
    related: ["privacyPolicy"],
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
    question:
      "I testi dell'I Ching che appaiono nella lettura sono autentici o generati dall'IA?",
    answer:
      "Sono autentici. Il materiale testuale (Giudizi (卦辞), linee in movimento (爻辞) ed esagrammi risultanti) proviene da tre fonti accademiche disponibili nell'app: Wilhelm (1924) (Eugen Diederichs Verlag), James Legge (di pubblico dominio) e lo Zhou Yi originale. La versione inglese di Cary Baynes (Princeton University Press, 1950) è disponibile anche come riferimento comparativo. L'IA cita e contestualizza i testi rilevanti con la tua domanda, ma non li modifica né li sostituisce. Puoi confrontare qualsiasi testo con la fonte originale.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "Perché il testo degli esagrammi nella Biblioteca non cambia lingua quando cambio la lingua dell'app?",
    answer:
      "Viene mostrato esattamente come è stato pubblicato. Wilhelm (1924) e Legge appaiono nel loro inglese accademico, e lo Zhou Yi in cinese classico, le stesse parole in tutte le 11 lingue dell'interfaccia. Ritradurre una traduzione sostituirebbe le parole proprie del traduttore con una parafrasi e potrebbe distorcere decenni di lavoro accademico già consolidato. L'obiettivo è darti accesso diretto alla fonte pubblicata più affidabile, non a una versione derivata di essa. Questo è diverso dalla tua consultazione con l'IA, che risponde sempre nella lingua della tua domanda: lì l'IA interpreta per te un risultato già formato, non presenta un testo primario.",
    moreInfoLink: { href: "/library", label: "Apri la Biblioteca →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "Perché la scheda Zhou Yi nella Biblioteca non mostra nessun commento con \"+\" come Wilhelm o Legge?",
    answer:
      "Perché non ce n'è nessuno da mostrare. Lo Zhou Yi è il testo nucleo più antico, senza alcuno strato di commento successivo aggiunto: solo il Giudizio, l'Immagine e gli oracoli di ciascuna linea, esattamente come circolava prima che studiosi successivi aggiungessero le proprie letture. La scheda di Wilhelm aggiunge il proprio commento più le Dieci Ali confuciane; quella di Legge aggiunge le sue note più il Grande e il Piccolo Simbolismo del suo Appendice II. Lo Zhou Yi non ha né l'uno né l'altro, di proposito: è il testo radice su cui sono stati scritti quei commenti successivi, non una versione che ne ha ricevuto uno proprio.",
    moreInfoLink: { href: "/library", label: "Apri la Biblioteca →" },
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
  {
    id: "translators-three",
    question: "Quali sono i tre traduttori disponibili nell'app?",
    answer:
      "L'app si basa su tre traduzioni classiche dell'I Ching, mostrate come schede separate. Richard Wilhelm e Cary F. Baynes (Princeton University Press, 1950) è l'edizione occidentale più letta, con un commento esteso. James Legge (The Sacred Books of the East, vol. XVI, 1882) è la traduzione accademica inglese pionieristica, con le sue note e il suo simbolismo. Lo Zhou Yi è il testo originale in cinese classico stesso, la radice su cui sono stati scritti tutti i commenti successivi, mostrato senza alcuno strato di commento aggiunto. Tutti e tre descrivono gli stessi 64 esagrammi; differiscono per la voce del traduttore, la lingua e quanto materiale esplicativo circonda il testo centrale.",
  },
  {
    id: "tier-features",
    question: "Cosa include ciascun pack, oltre ai token?",
    answer:
      "Free include l'I Ching (Tre Monete o Steli di Achillea, automatico o manuale) e gli Ossi Oracolari, con il traduttore Wilhelm (1924). Seeker aggiunge la Biblioteca completa e il traduttore Legge. Practitioner aggiunge il testo originale dello Zhou Yi. Master aggiunge la sintesi Master (3), che triangola i tre traduttori contemporaneamente. Per vedere le quantità di token in vigore, i limiti per filo e come acquistare, apri il Centro token dall'intestazione dell'app.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Come funziona la sintesi Master (3) e perché è così potente?",
    answer:
      "La funzione Master (3) esegue una Sintesi Personalizzata: triangola simultaneamente le tre fonti radice (Wilhelm, Legge e il Zhou Yi originale) per distillare un verdetto coerente. Il risultato è un'interpretazione unificata che offre una 'Risposta Concreta' potente e immediata, seguita da un'analisi comparativa approfondita elaborata in modo unico per la tua situazione. Ogni consultazione Master (3) consuma 2 token.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "Cos'è la Biblioteca e come vi si accede?",
    answer:
      "È il compendio completo dei 64 esagrammi e delle tre opere letterarie integrali. L'accesso viene sbloccato in modo permanente acquistando qualsiasi pack a pagamento (Seeker in poi).",
  },
];

const FAQ_ITEMS_FR: FaqItem[] = [
  {
    id: "tokens-packs",
    question:
      "Comment fonctionnent les tokens, les packs et le niveau gratuit ?",
    answer:
      "Pour des informations à jour sur les packs, les prix des tokens et votre solde actuel, ouvrez le Centre de tokens depuis l'en-tête de l'app. Vous y trouverez vos tokens disponibles, la limite de fil par plan et un lien direct pour acheter.",
    related: ["tokenPacks"],
  },
  {
    id: "data-reliability",
    question:
      "À quel point les textes du Yi King sont-ils fiables dans l'application ?",
    answer:
      "La fiabilité signifie que le texte de l'oracle que vous lisez, le Jugement, l'Image et chaque trait, n'est jamais écrit ni modifié par l'IA. C'est une citation directe, vérifiée mot pour mot par rapport à une source publiée nommément. Le texte anglais provient de Richard Wilhelm et Cary F. Baynes (The I Ching or Book of Changes, Princeton University Press, 1950) et de James Legge (The Sacred Books of the East, vol. XVI, Oxford, 1882) ; le Zhou Yi en chinois classique provient du Chinese Text Project. Les règles des traits mutants proviennent d'Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) et, pour l'alternative classique, du Yixue Qimeng de Zhu Xi dans la traduction de Joseph Adler (Introduction to the Study of the Classic of Change, 2002). L'IA interprète ces textes déjà cités pour votre question ; elle ne les génère ni ne les réécrit jamais. Consultez la page Audits de fidélité pour le journal complet de vérification.",
    related: ["fidelityAudits"],
  },
  {
    id: "yarrow-vs-coins",
    question:
      "Quelle est la différence entre les deux méthodes du I Ching: Trois Pièces et Tiges d'Achillée ?",
    answer:
      "Les deux méthodes produisent les mêmes 64 hexagrammes et utilisent les mêmes textes du I Ching ainsi que les mêmes règles classiques de sélection de trait. Trois Pièces est rapide et accessible: on lance trois pièces six fois pour former les six traits. Tiges d'Achillée est la méthode rituelle plus ancienne: on travaille avec des tiges ou des objets semblables selon un procédé plus lent et plus contemplatif. Le choix modifie l'expérience rituelle, non l'autorité de la lecture. Utilise Trois Pièces pour la rapidité; utilise les Tiges d'Achillée pour le rythme traditionnel.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question:
      "Qu'est-ce que le I Ching automatique vs manuel, et puis-je mélanger les Os dans le même fil ?",
    answer:
      "Automatique vs manuel ne concerne que le I Ching (Trois Pièces ou Tiges d'Achillée). Dans Options, les contrôles du mode de tirage apparaissent lorsque le I Ching est sélectionné : choisissez Trois Pièces ou Tiges d'Achillée, puis automatique (le tirage s'effectue sur le serveur) ou manuel (vous saisissez les six totaux de ligne 6/7/8/9 de vos pièces ou tiges). Le mode Os est toujours automatique ; il n'existe pas de flux manuel pour les os ; l'oracle synthétise les motifs de fissures pour générer une réponse personnelle et adaptée à votre situation unique. Dans la limite de profondeur par fil de votre forfait, vous pouvez librement alterner I Ching et Os et changer de méthode et de mode entre consultations ; l'application mémorise vos préférences pour la prochaine lecture en I Ching.",
    related: ["userGuide", "methodNotes"],
  },
  {
    id: "oracle-bones-method",
    question: "Qu'est-ce que la méthode des Os de l'Oracle ?",
    answer:
      "Les Os de l'Oracle sont une méthode divinatoire de l'époque Shang inspirée de la lecture des fissures sur des plastrons de tortue et des omoplates de bœuf. Dans l'app, elle est distincte du I Ching: elle ne crée pas d'hexagrammes ni de traits changeants. Le système forme d'abord un motif de fissures et un verdict; puis l'IA interprète ce résultat déjà formé dans ta langue. Le verdict tombe toujours dans l'un des quatre états possibles, inspirés de la méthode ancestrale Shang : 1) 吉: clairement favorable : le motif confirme la charge positive sans ambiguïté ; 2) 吉 modéré: modérément favorable : la confirmation est présente, mais nuancée ou conditionnée ; 3) 凶 modéré: modérément défavorable : le motif penche vers la négation avec des réserves ; 4) 凶: clairement défavorable : le motif nie la charge positive sans ambiguïté. Elle convient aux réponses concises, au ton ancestral ; le I Ching convient mieux aux changements stratifiés dans le temps. Cette méthode s'appuie sur une tradition bien plus ancienne que le I Ching, que beaucoup situent à la racine même du principe du yin-yang. Sa procédure originale complète n'est pas connue avec certitude ; ce qui est proposé ici est une simplification moderne et respectueuse, pensée pour garder cet héritage présent, et non une reconstitution littérale.",
    related: ["methodNotes"],
  },
  {
    id: "iching-how-answers",
    question:
      "Comment le I Ching fonctionne-t-il réellement, et d'où viennent ses réponses ?",
    answer:
      "Le I Ching fonctionne grâce à 64 hexagrammes, un catalogue millénaire des motifs de changement dans la nature et la vie humaine. Chaque hexagramme est une figure structurée dont le sens classique est conservé dans les textes Wilhelm (1924). Chaque consultation part de votre question concrète. L'algorithme mathématique lance les traits selon les règles classiques de sélection de trait (le système de réduction d'Alfred Huang) pour déterminer l'hexagramme présent, les éventuels traits en mouvement et l'hexagramme futur qui en résulte. L'IA articule ensuite ce résultat déjà formé dans votre langue, en appliquant le sens classique de ces hexagrammes à votre contexte particulier. C'est pourquoi chaque lecture est unique et personnelle : les mêmes hexagrammes peuvent apparaître pour des personnes différentes, mais la réponse n'est jamais la même, car elle dépend de la question concrète, du moment de vie et du contexte personnel du consultant. Il n'existe pas d'interprétation universelle applicable à plusieurs personnes en même temps.",
    related: ["methodNotes", "userGuide"],
  },
  {
    id: "iching-mutation-rules",
    question:
      "Quel est le système de règles qui détermine quel texte de trait gouverne une lecture du I Ching ?",
    answer:
      "L'application prend en charge deux systèmes pour déterminer quel texte de trait, ou quels textes, gouverne une lecture lorsqu'il y a des traits mutants. Le système de réduction d'Alfred Huang (The Complete I Ching, 10th Anniversary Edition, 2010) est celui par défaut : un ensemble de règles clair et moderne qui réduit toujours toute combinaison de traits mutants à un seul passage gouvernant précis. La lecture classique de Zhu Xi (朱熹, 1130-1200 ; Yixue Qimeng, dans la traduction de Joseph Adler) est l'alternative traditionnelle : une méthode plus ancienne qui, dans plusieurs cas, lit les deux traits ou les deux Jugements au lieu de réduire à un seul. Basculez entre les deux avec le sélecteur « Lecture des lignes mobiles » dans Options ; votre choix est mémorisé pour cette lecture.",
    related: ["methodNotes"],
  },
  {
    id: "thread-depth",
    question:
      "Pourquoi parfois je ne peux pas «approfondir» davantage dans le même chat ?",
    answer:
      "Chaque fil admet un nombre limité de lectures enchaînées selon votre plan. Lorsque la limite est atteinte, démarrez une nouvelle session. Vérifiez votre limite de fil actuelle dans le Centre de tokens (en-tête de l'app).",
    related: ["tokenPacks"],
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
    question:
      "Où trouver les informations de facturation et les conditions de service ?",
    answer:
      "Pour les informations de facturation et d'achat de tokens, ouvrez le Centre de tokens depuis l'en-tête de l'app. Les conditions commerciales et l'utilisation acceptable sont dans les Conditions de Service.",
    related: ["tokenPacks", "termsOfService"],
  },
  
  {
    id: "security-2fa",
    question: "L'authentification à deux facteurs (2FA) est-elle disponible ?",
    answer:
      "Oui, en option : vous pouvez activer 2FA (authenticator et/ou codes e-mail) depuis la sécurité du compte dans l'oracle. Le guide résume son interaction avec les consultations.",
    related: ["userGuide"],
  },
  {
    id: "delete-chats",
    question: "Comment supprimer un chat ou une conversation ?",
    answer:
      "Ouvre la section «Discussions» depuis l'en-tête de l'application. Utilise l'option de suppression affichée sur chaque fil. La suppression est immédiate et définitive.",
  },
  {
    id: "delete-account",
    question: "Comment supprimer mon compte et toutes mes données ?",
    answer:
      "Ouvre Options dans l'app (bouton en bas du compositeur), fais défiler jusqu'à Supprimer le compte et appuie sur Supprimer mon compte. Dans la boîte de confirmation, écris SUPPRIMER et confirme. Ton compte est supprimé immédiatement et tu es déconnecté automatiquement. Ce qui est supprimé : ton profil utilisateur et tes identifiants, toutes les sessions de consultation et l'historique des chats, le solde de jetons et les enregistrements d'utilisation, la configuration 2FA et toutes les préférences personnelles. Les prestataires de passerelles de paiement conservent les enregistrements d'achats à des fins fiscales et de facturation conformément aux réglementations applicables. Si tu ne peux pas te connecter, écris-nous à support@theoriginaliching.com avec ton adresse e-mail enregistrée. Nous traiterons ta demande dans les 30 jours.",
    moreInfoLink: { href: "/delete-account", label: "Pour plus d'informations, consulte la page de suppression de compte →" },
    related: ["privacyPolicy"],
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
    question:
      "Les textes du I Ching dans la lecture sont-ils authentiques ou générés par IA ?",
    answer:
      "Ils sont authentiques. Le matériel textuel (Jugements (卦辞), lignes en mouvement (爻辞) et hexagrammes résultants) provient de trois sources académiques disponibles dans l'app : Wilhelm (1924) (Eugen Diederichs Verlag), James Legge (domaine public) et le Zhou Yi original. La version anglaise de Cary Baynes (Princeton University Press, 1950) est également disponible comme référence comparative. L'IA cite et contextualise les textes pertinents avec votre question, mais ne les modifie ni ne les remplace. Vous pouvez comparer n'importe quel texte avec la source originale.",
    related: ["methodNotes"],
  },
  {
    id: "library-source-language",
    question:
      "Pourquoi le texte des hexagrammes dans la Bibliothèque ne change pas de langue quand je change la langue de l'application ?",
    answer:
      "Il est montré exactement comme il a été publié. Wilhelm (1924) et Legge apparaissent dans leur anglais académique, et le Zhou Yi en chinois classique, les mêmes mots dans les 11 langues de l'interface. Retraduire une traduction remplacerait les mots propres du traducteur par une paraphrase et pourrait déformer des décennies de travail académique déjà établi. L'objectif est de vous donner un accès direct à la source publiée la plus fiable, pas à une version dérivée de celle-ci. C'est différent de votre consultation avec l'IA, qui répond toujours dans la langue de votre question : là, l'IA interprète pour vous un résultat déjà formé, elle ne présente pas un texte primaire.",
    moreInfoLink: { href: "/library", label: "Ouvre la Bibliothèque →" },
    related: ["methodNotes"],
  },
  {
    id: "zhouyi-no-commentary",
    question:
      "Pourquoi l'onglet Zhou Yi dans la Bibliothèque ne montre-t-il aucun commentaire avec un \"+\" comme Wilhelm ou Legge ?",
    answer:
      "Parce qu'il n'y en a aucun à montrer. Le Zhou Yi est le texte source le plus ancien, sans aucune couche de commentaire ultérieure ajoutée : seulement le Jugement, l'Image et les oracles de chaque ligne, exactement comme il circulait avant que des érudits plus tardifs n'ajoutent leurs propres lectures. L'onglet de Wilhelm ajoute son propre commentaire plus les Dix Ailes confucéennes ; celui de Legge ajoute ses notes plus le Grand et le Petit Symbolisme de son Appendice II. Le Zhou Yi n'a ni l'un ni l'autre, volontairement : c'est le texte racine au sujet duquel ces commentaires postérieurs ont été écrits, pas une version qui en a reçu un à elle.",
    moreInfoLink: { href: "/library", label: "Ouvre la Bibliothèque →" },
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
  {
    id: "translators-three",
    question: "Quels sont les trois traducteurs disponibles dans l'app ?",
    answer:
      "L'application s'appuie sur trois traductions classiques du I Ching, présentées comme des onglets distincts. Richard Wilhelm et Cary F. Baynes (Princeton University Press, 1950) est l'édition occidentale la plus lue, accompagnée d'un commentaire étendu. James Legge (The Sacred Books of the East, vol. XVI, 1882) est la traduction académique anglaise pionnière, avec ses propres notes et son symbolisme. Le Zhou Yi est le texte original en chinois classique lui-même, la racine sur laquelle tous les commentaires postérieurs ont été écrits, présenté sans aucune couche de commentaire ajoutée. Les trois décrivent les mêmes 64 hexagrammes ; ils diffèrent par la voix du traducteur, la langue et la quantité de matériel explicatif entourant le texte central.",
  },
  {
    id: "tier-features",
    question: "Qu'inclut chaque pack, en plus des jetons ?",
    answer:
      "Free comprend le I Ching (Trois Pièces ou Tiges d'Achillée, automatique ou manuel) et les Os de l'Oracle, avec le traducteur Wilhelm (1924). Seeker ajoute la Bibliothèque complète et le traducteur Legge. Practitioner ajoute le texte original du Zhou Yi. Master ajoute la synthèse Master (3), qui triangule les trois traducteurs simultanément. Pour voir les quantités de jetons en vigueur, les limites par fil et comment acheter, ouvrez le Centre de tokens depuis l'en-tête de l'app.",
    related: ["tokenPacks"],
  },
  {
    id: "master-tokens-cost",
    question: "Comment fonctionne la synthèse Master (3) et pourquoi est-elle si puissante ?",
    answer:
      "La fonction Master (3) réalise une Synthèse Personnalisée : elle triangule simultanément les trois sources racines (Wilhelm, Legge et le Zhou Yi original) pour en distiller un verdict cohérent. Le résultat est une interprétation unifiée qui offre une 'Réponse Concrète' puissante et immédiate, suivie d'une analyse comparative approfondie élaborée de manière unique pour votre situation. Chaque consultation Master (3) consomme 2 jetons.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "Qu'est-ce que la Bibliothèque et comment y accéder ?",
    answer:
      "C'est le compendium complet des 64 hexagrammes et des trois œuvres littéraires intégrales. L'accès est débloqué de façon permanente lors de l'acquisition de n'importe quel pack payant (Seeker et au-delà).",
  },
];

const FAQ_PAGE_META: Record<
  AppLocale,
  Pick<FaqPageUi, "title" | "intro" | "seeAlsoHeading">
> = {
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
  const titles =
    FAQ_CATEGORY_TITLES[locale] ?? FAQ_CATEGORY_TITLES[DEFAULT_LOCALE];

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
      categories.unshift({
        id: "app-usage",
        title: fallbackTitle,
        items: orphans,
      });
    }
  }

  const items = categories.flatMap((category) => category.items);
  return { ...meta, categories, items };
}
