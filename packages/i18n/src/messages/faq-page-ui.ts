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

export type FaqPageUi = {
  title: string;
  intro: string;
  seeAlsoHeading: string;
  items: FaqItem[];
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
    id: "two-oracles",
    question: "What is the difference between I Ching (coins) and Oracle bones?",
    answer:
      "I Ching follows the classical six-line casting flow you see in the ritual. Oracle bones use a separate charge-based flow inspired by ancient pyromancy. Method notes describe sources and intent for both.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "What is automatic vs manual I Ching, and can I mix Oracle Bones in the same thread?",
    answer:
      "Automatic vs manual applies only to I Ching (three coins). In Options the cast-mode radios appear when I Ching is selected: automatic runs the animated coin ritual on the server; manual lets you enter the six line totals (6/7/8/9) from your own coins before the reading. Oracle Bones mode is always automatic; there is no manual bones flow; ritual and verdict come from the algorithm only. Within your plan’s per-thread depth cap (for example, eight follow-up readings on a Master thread), you may freely alternate I Ching and Oracle Bones and switch I Ching between automatic and manual from one consultation to the next; your cast-mode preference is remembered for the next time you use I Ching.",
    related: ["userGuide", "methodNotes"],
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
      "The mathematical algorithm, not the AI. In I Ching mode, the system casts three virtual coins six times, builds the hexagram line by line, and applies Zhu Xi's mutation rules to determine the governing line and the resulting hexagram. In Oracle Bones mode, the algorithm generates the crack pattern and determines the verdict. Artificial intelligence intervenes afterwards: it takes that already-calculated result and articulates it in natural language in your language, with the context of your question. The AI is the interpreter. The oracle is the method.",
  },
  {
    id: "authentic-texts",
    question: "Are the I Ching texts that appear in the reading authentic or AI-generated?",
    answer:
      "They are authentic. The Judgment (卦辞), the lines in motion (爻辞), and the resulting hexagrams come entirely from the Wilhelm/Baynes translation, the most complete and respected version of the I Ching in the Western world, in the public domain since 2020. The AI cites and contextualises them with your question, but does not modify or replace them. You can compare any text with the original book.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "What does Silence mean in Oracle Bones mode?",
    answer:
      "Silence (沉默) is the fifth possible verdict state in Oracle Bones mode, and it is faithful to the ancestral Shang method. In the original tradition, when the bone produced no legible cracks, it was not an error; it was an answer in itself: the ancestors do not speak because the moment is not ripe for that question, or because the answer transcends what can be said. This app respects that state and returns it when the pattern indicates. The five possible states are: clearly favourable (吉), moderately favourable, moderately unfavourable, clearly unfavourable (凶), and silence (沉默).",
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
    id: "two-oracles",
    question: "¿En qué se diferencian el I Ching (tres monedas) y los huesos de oráculo?",
    answer:
      "El I Ching sigue el ritual clásico de seis líneas. Los huesos usan un flujo aparte basado en cargas positiva/negativa inspirado en la piromancia antigua. Las notas de métodos describen fuentes y enfoque de ambos.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "¿Qué es el I Ching automático frente al manual, y puedo mezclar Huesos en el mismo hilo?",
    answer:
      "Lo automático frente a manual solo aplica al I Ching (tres monedas). En Opciones el modo de tirada aparece cuando I Ching está seleccionado: automático ejecuta el ritual animado de monedas en el servidor; manual te permite introducir los seis totales de línea (6/7/8/9) de tus monedas antes de la lectura. El modo Huesos es siempre automático; no hay flujo manual de huesos; el ritual y el veredicto salen solo del algoritmo. Dentro del tope de profundidad por hilo de tu plan (por ejemplo, ocho profundizaciones en un hilo Master), puedes alternar libremente I Ching y Huesos y cambiar el I Ching entre automático y manual de una consulta a otra; la app guarda tu preferencia de modo para la próxima lectura en I Ching.",
    related: ["userGuide", "methodNotes"],
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
      "El algoritmo matemático, no la IA. En el modo I Ching, el sistema lanza tres monedas virtuales seis veces, construye el hexagrama línea por línea y aplica las reglas de mutación de Zhu Xi para determinar la línea regente y el hexagrama resultante. En el modo Huesos, el algoritmo genera el patrón de grietas y determina el veredicto. La inteligencia artificial interviene después: toma ese resultado ya calculado y lo articula en lenguaje natural en tu idioma, con el contexto de tu pregunta. La IA es el intérprete. El oráculo es el método.",
  },
  {
    id: "authentic-texts",
    question: "¿Los textos del I Ching que aparecen en la lectura son auténticos o generados por IA?",
    answer:
      "Son auténticos. Los textos del Juicio (卦辞), las sentencias de las líneas en movimiento (爻辞) y los hexagramas resultantes provienen íntegramente de la traducción Wilhelm/Baynes, la versión más completa y respetada del I Ching en lengua occidental, en dominio público desde 2020. La IA los cita y los contextualiza con tu pregunta, pero no los modifica ni los reemplaza. Puedes contrastar cualquier texto con el libro original.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "¿Qué significa el Silencio en el modo Huesos?",
    answer:
      "El Silencio (沉默) es el quinto estado posible del veredicto en el modo Huesos, y es fiel al método ancestral Shang. En la tradición original, cuando el hueso no producía grietas legibles, no era un error; era una respuesta en sí misma: los ancestros no hablan porque el momento no está maduro para esa pregunta, o porque la respuesta trasciende lo que puede ser dicho. Esta app respeta ese estado y lo devuelve cuando el patrón lo indica. Los cinco estados posibles son: favorable claro (吉), favorable moderado, desfavorable moderado, desfavorable claro (凶), y silencio (沉默).",
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
    id: "two-oracles",
    question: "ما الفرق بين I Ching (العملات) وعظام الكهانة؟",
    answer:
      "يتبع I Ching طقس الخطوط الستة الكلاسيكي. أما عظام الكهانة فتستخدم مسارًا منفصلًا قائمًا على الشحنة الإيجابية/السلبية مستوحى من العرافة القديمة بالشروخ.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "ما الفرق بين I Ching التلقائي واليدوي، وهل يمكن خلط العظام في نفس الخيط؟",
    answer:
      "التلقائي مقابل اليدوي ينطبق فقط على I Ching (ثلاث عملات). في الخيارات تظهر أزرار وضع القَسْم عند اختيار I Ching: التلقائي يشغّل طقس العملات المتحرك على الخادم؛ اليدوي يتيح لك إدخال مجموعات الأسطر الستة (6/7/8/9) من عملاتك قبل القراءة. وضع العظام دائمًا تلقائي; لا يوجد مسار يدوي للعظام؛ الطقس والحكم يأتيان من الخوارزمية فقط. ضمن حد عمق الخيط في خطتك (مثلاً ثماني قراءات متابعة في خيط Master)، يمكنك بالتناوب بحرية بين I Ching والعظام، وتبديل I Ching بين التلقائي واليدوي من استشارة إلى أخرى؛ يحفظ التطبيق تفضيل وضع القَسْم للمرة القادمة التي تستخدم فيها I Ching.",
    related: ["userGuide", "methodNotes"],
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
      "الخوارزمية الرياضية، لا الذكاء الاصطناعي. في وضع I Ching، يقوم النظام برمي ثلاثة عملات افتراضية ست مرات، ويبني الهكساجرام سطرًا تلو الآخر، ويطبق قواعد طفرة Zhu Xi لتحديد السطر الحاكم والهكساجرام الناتج. في وضع العظام، تولّد الخوارزمية نمط الشقوق وتحدد الحكم. يتدخل الذكاء الاصطناعي بعد ذلك: يأخذ هذه النتيجة المحسوبة مسبقًا ويصوغها بلغة طبيعية بلغتك مع سياق سؤالك. الذكاء الاصطناعي هو المفسِّر، والتنبؤ هو المنهج.",
  },
  {
    id: "authentic-texts",
    question: "هل نصوص I Ching التي تظهر في القراءة أصيلة أم يولّدها الذكاء الاصطناعي؟",
    answer:
      "إنها أصيلة. نصوص الحكم (卦辞)، وعبارات الخطوط المتحركة (爻辞)، والهكساجرامات الناتجة مستقاة كلها من ترجمة Wilhelm/Baynes، النسخة الأكثر اكتمالاً واحترامًا من I Ching في العالم الغربي، في الملك العام منذ عام 2020. يستشهد بها الذكاء الاصطناعي ويضعها في سياق سؤالك، لكنه لا يعدلها ولا يستبدلها. يمكنك مقارنة أي نص مع الكتاب الأصلي.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "ماذا يعني الصمت في وضع عظام الكهانة؟",
    answer:
      "الصمت (沉默) هو خامس حالة حكم ممكنة في وضع العظام، وهو وفي للمنهج الأسلافي الشانغي. في التقليد الأصلي، حين لا يُنتج العظم شقوقًا قابلة للقراءة، لم يكن ذلك خطأً؛ بل كان إجابةً في حد ذاتها: لا يتكلم الأسلاف لأن اللحظة لم تنضج بعد لهذا السؤال، أو لأن الإجابة تتجاوز ما يمكن قوله. يحترم هذا التطبيق تلك الحالة ويُعيدها حين يدل عليها النمط. الحالات الخمس الممكنة هي: مواتٍ بوضوح (吉)، مواتٍ معتدل، غير مواتٍ معتدل، غير مواتٍ بوضوح (凶)، وصمت (沉默).",
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
    id: "two-oracles",
    question: "I Ching (सिक्के) और Oracle Bones में क्या अंतर है?",
    answer:
      "I Ching क्लासिक छह-रेखा अनुष्ठान पर आधारित है। Oracle Bones एक अलग हाँ/नहीं प्रवाह उपयोग करता है जो प्राचीन दरार-आधारित दिव्यज्ञान से प्रेरित है।",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "I Ching में स्वचालित बनाम मैन्युअल क्या है, और क्या मैं एक ही थ्रेड में Oracle Bones मिला सकता/सकती हूँ?",
    answer:
      "स्वचालित बनाम मैन्युअल केवल I Ching (तीन सिक्के) पर लागू होता है। विकल्पों में कास्ट-मोड रेडियो तभी दिखते हैं जब I Ching चुना हो: स्वचालित सर्वर पर एनिमेटेड सिक्का अनुष्ठान चलाता है; मैन्युअल आपको पढ़ने से पहले अपने सिक्कों से छह पंक्ति योग (6/7/8/9) दर्ज करने देता है। Oracle Bones मोड हमेशा स्वचालित है; कोई मैन्युअल हड्डी प्रवाह नहीं; अनुष्ठान और निर्णय केवल एल्गोरिदम से आते हैं। आपकी योजना की प्रति-थ्रेड गहराई सीमा (उदाहरण के लिए Master थ्रेड पर आठ अनुवर्ती पठन) के भीतर, आप I Ching और Oracle Bones को स्वतंत्र रूप से बदल सकते हैं और एक परामर्श से दूसरे में I Ching को स्वचालित और मैन्युअल के बीच स्विच कर सकते हैं; अगली I Ching पठन के लिए आपकी कास्ट-मोड पसंद याद रखी जाती है।",
    related: ["userGuide", "methodNotes"],
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
      "गणितीय एल्गोरिदम, AI नहीं। I Ching मोड में, सिस्टम तीन आभासी सिक्के छह बार फेंकता है, रेखा दर रेखा हेक्साग्राम बनाता है, और शासक रेखा और परिणामी हेक्साग्राम निर्धारित करने के लिए Zhu Xi के उत्परिवर्तन नियमों को लागू करता है। हड्डियों के मोड में, एल्गोरिदम दरार पैटर्न उत्पन्न करता है और निर्णय देता है। कृत्रिम बुद्धिमत्ता बाद में हस्तक्षेप करती है: वह पहले से गणना किए गए उस परिणाम को लेती है और आपके प्रश्न के संदर्भ के साथ आपकी भाषा में स्वाभाविक भाषा में व्यक्त करती है। AI व्याख्याता है। ओरेकल विधि है।",
  },
  {
    id: "authentic-texts",
    question: "पठन में दिखाई देने वाले I Ching के पाठ प्रामाणिक हैं या AI द्वारा उत्पन्न?",
    answer:
      "वे प्रामाणिक हैं। निर्णय (卦辞), चलती रेखाओं की उक्तियाँ (爻辞), और परिणामी हेक्साग्राम पूरी तरह Wilhelm/Baynes अनुवाद से आते हैं, पश्चिमी जगत में I Ching का सबसे संपूर्ण और सम्मानित संस्करण, जो 2020 से सार्वजनिक डोमेन में है। AI उन्हें आपके प्रश्न के साथ उद्धृत और संदर्भित करता है, लेकिन संशोधित या प्रतिस्थापित नहीं करता। आप किसी भी पाठ की मूल पुस्तक से तुलना कर सकते हैं।",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Oracle Bones मोड में मौन (Silence) का क्या अर्थ है?",
    answer:
      "मौन (沉默) Oracle Bones मोड में पाँचवाँ संभावित निर्णय स्थिति है, और यह पूर्वज शांग पद्धति के प्रति सच्चा है। मूल परंपरा में, जब हड्डी पढ़ने योग्य दरारें नहीं देती थी, तो यह कोई त्रुटि नहीं थी; यह अपने आप में एक उत्तर था: पूर्वज नहीं बोलते क्योंकि उस प्रश्न के लिए समय अभी परिपक्व नहीं है, या क्योंकि उत्तर जो कहा जा सकता है उससे परे है। यह app उस स्थिति का सम्मान करती है और जब पैटर्न इंगित करता है तब इसे लौटाती है। पाँच संभावित स्थितियाँ हैं: स्पष्ट रूप से अनुकूल (吉), मध्यम रूप से अनुकूल, मध्यम रूप से प्रतिकूल, स्पष्ट रूप से प्रतिकूल (凶), और मौन (沉默)।",
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
    id: "two-oracles",
    question: "I Ching（硬貨）と卜骨の違いは何ですか？",
    answer:
      "I Chinは古典的な六爻の儀式に従います。卜骨は古代の亀裂占いに着想を得た正電荷・負電荷に基づく別のフローを使用します。両方の出典と意図はメソッドノートに記載されています。",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "易経の自動と手動の違いは？ 同じスレッドで卜骨と混ぜられますか？",
    answer:
      "自動と手動は易経（三枚の銭）にのみ適用されます。オプションでは易経を選んだときだけ起卦方式のラジオが表示されます。自動はサーバー上でアニメーションの銭の儀式を実行し、手動は読みの前にご自身の銭の合計6・7・8・9を六爻分入力します。卜骨モードは常に自動で、手動の卜骨フローはありません。儀式と判定はアルゴリズムのみから行われます。プランのスレッド深度上限（例：Masterでスレッドあたり8回の深掘り）の範囲内で、易経と卜骨を自由に行き来でき、相談ごとに易経の自動／手動を切り替えられます。起卦方式の選択は次回の易経相談まで記憶されます。",
    related: ["userGuide", "methodNotes"],
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
      "数学的アルゴリズムであり、AIではありません。I Chinモードでは、システムが仮想の硬貨を6回投げ、一爻ずつ卦を構築し、朱熹の変爻ルールを適用して主爻と変卦を決定します。卜骨モードでは、アルゴリズムが亀裂パターンを生成して判定を下します。人工知能はその後に介入します。すでに計算されたその結果を受け取り、あなたの質問の文脈を踏まえて、あなたの言語で自然な言葉として表現します。AIは解釈者であり、オラクルはその方法です。",
  },
  {
    id: "authentic-texts",
    question: "解釈に表示されるI Chingのテキストは本物ですか、それともAIが生成したものですか？",
    answer:
      "本物です。卦辞、動爻（爻辞）、変卦のテキストはすべて、ヴィルヘルム/バインズ訳から引用されています。これは西洋で最も包括的で権威ある易経の翻訳であり、2020年よりパブリックドメインとなっています。AIはあなたの質問に合わせてそれらを引用し文脈化しますが、変更や置き換えは一切しません。すべてのテキストを原著と照合することができます。",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "卜骨モードにおける「沉默」とはどういう意味ですか？",
    answer:
      "沉默（沈黙）は卜骨モードの5番目の可能な判定状態であり、殷の祖先に忠実な方法です。古来の伝統では、骨に読み取れる亀裂が生じなかった場合、それは誤りではありませんでした。それ自体が一つの答えでした。つまり、その問いに対してまだ時が熟していないか、あるいは答えが言葉を超えているため、祖先は語らないのです。このアプリはその状態を尊重し、パターンがそれを示すときに返します。5つの可能な状態は、明確に吉（吉）、中程度に吉、中程度に凶、明確に凶（凶）、そして沉默（沈黙）です。",
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
    id: "two-oracles",
    question: "I Ching（铜钱）与甲骨文有什么区别？",
    answer:
      "I Ching遵循经典的六爻仪式。甲骨文采用基于正负电荷的独立流程，灵感来自古代火焰占卜。两种方法的来源和意图均在方法说明中有所描述。",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "易经的自动与手动有什么区别？同一对话里能混用甲骨文吗？",
    answer:
      "自动与手动仅适用于易经（三枚铜钱）。在选项中，只有选中易经时才会显示起卦方式：自动由服务器运行动画铜钱仪式；手动则在解读前由您自行输入六爻各爻的6/7/8/9合计。甲骨文模式始终为自动，没有手动甲骨流程；仪式与兆判完全由算法产生。在您套餐的单线程深度上限内（例如 Master 每线程八次后续解读），您可以自由交替易经与甲骨文，并在每次咨询之间切换易经的自动与手动；应用会记住您下次使用易经时的起卦偏好。",
    related: ["userGuide", "methodNotes"],
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
      "是数学算法，而不是AI。在易经模式下，系统将三枚虚拟硬币投掷六次，逐爻构建卦象，并应用朱熹的变爻规则来确定主爻和变卦。在甲骨文模式下，算法生成裂纹图案并确定判断。人工智能随后介入：它获取已计算好的结果，结合您的问题语境，以您的语言用自然语言表达出来。AI是解释者，神谕是方法。",
  },
  {
    id: "authentic-texts",
    question: "解读中出现的易经文本是真实的还是AI生成的？",
    answer:
      "是真实的。卦辞、动爻（爻辞）和变卦的文本完全来自威廉/贝恩斯译本，这是西方世界最完整、最受尊重的易经版本，自2020年起已属公共领域。AI引用这些文本并结合您的问题加以诠释，但不对其进行修改或替换。您可以将任何文本与原著进行对照。",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "甲骨文模式中的「沉默」是什么意思？",
    answer:
      "沉默是甲骨文模式中第五种可能的判断状态，忠实于商代祖先传统方法。在古代传统中，当骨头没有产生可读裂纹时，这不是错误，这本身就是一种答案：祖先不语，因为此问的时机尚未成熟，或因为答案超越了可以言说的范畴。本应用尊重这一状态，当图案显示时将其返回。五种可能的状态为：明显有利（吉）、中等有利、中等不利、明显不利（凶）和沉默（沉默）。",
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
    id: "two-oracles",
    question: "I Ching(동전)과 오라클 뼈의 차이는 무엇인가요?",
    answer:
      "I Ching은 고전적인 6효 의식을 따릅니다. 오라클 뼈는 고대 화염 점술에서 영감을 받은 양/음 기반의 별도 흐름을 사용합니다. 방법 메모에서 두 방법의 출처와 의도를 설명합니다.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "역경 자동과 수동의 차이는 무엇이며, 같은 스레드에서 갑골과 섞을 수 있나요?",
    answer:
      "자동과 수동은 역경(동전 세 개)에만 적용됩니다. 옵션에서 역경을 선택했을 때만 점 방식 라디오가 보입니다. 자동은 서버에서 애니메이션 동전 의식을 실행하고, 수동은 해석 전에 본인의 동전으로 나온 각 효의 합계 6/7/8/9를 여섯 번 입력합니다. 갑골 모드는 항상 자동이며 수동 갑골 흐름은 없습니다. 의식과 판정은 알고리즘에서만 나옵니다. 요금제의 스레드 깊이 한도(예: Master 스레드당 후속 해석 8회) 안에서는 역경과 갑골을 자유롭게 번갈아 할 수 있고, 상담마다 역경의 자동/수동을 바꿀 수 있습니다. 다음 역경 상담을 위해 점 방식 선택은 기억됩니다.",
    related: ["userGuide", "methodNotes"],
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
      "수학적 알고리즘이며, AI가 아닙니다. 주역 모드에서 시스템은 가상 동전을 여섯 번 던져 효 하나씩 괘를 구성하고, 주희의 변효 규칙을 적용하여 주효와 변괘를 결정합니다. 갑골 모드에서는 알고리즘이 균열 패턴을 생성하고 판정을 내립니다. 인공지능은 그 이후에 개입합니다. 이미 계산된 결과를 받아 귀하의 질문 맥락과 함께 귀하의 언어로 자연스럽게 표현합니다. AI는 해석자입니다. 오라클은 방법입니다.",
  },
  {
    id: "authentic-texts",
    question: "해석에 나타나는 주역 텍스트는 진본인가요, AI가 생성한 것인가요?",
    answer:
      "진본입니다. 괘사(卦辞), 동효의 효사(爻辞), 변괘 텍스트는 모두 빌헬름/베인스 번역본에서 인용되었습니다. 이는 서양에서 가장 완전하고 권위 있는 주역 번역본으로, 2020년부터 공공 도메인에 해당합니다. AI는 귀하의 질문에 맞게 이를 인용하고 맥락화하지만, 수정하거나 대체하지 않습니다. 원저와 텍스트를 비교해 볼 수 있습니다.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "갑골 모드에서 '침묵'은 무엇을 의미하나요?",
    answer:
      "침묵(沉默)은 갑골 모드의 다섯 번째 가능한 판정 상태이며, 상나라 조상 전통 방법에 충실합니다. 고대 전통에서 뼈에 읽을 수 있는 균열이 생기지 않았을 때, 이는 오류가 아니었습니다, 그 자체가 하나의 답이었습니다. 조상들이 말하지 않는 것은 그 질문에 대한 때가 무르익지 않았거나, 답이 말로 할 수 있는 것을 초월하기 때문입니다. 이 앱은 그 상태를 존중하며 패턴이 그것을 나타낼 때 반환합니다. 다섯 가지 가능한 상태는 명확히 유리(吉), 중등도 유리, 중등도 불리, 명확히 불리(凶), 그리고 침묵(沉默)입니다.",
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
    id: "two-oracles",
    question: "Qual é a diferença entre o I Ching (moedas) e os Ossos do Oráculo?",
    answer:
      "O I Ching segue o ritual clássico de seis linhas. Os Ossos usam um fluxo separado baseado em cargas positiva/negativa, inspirado na piromancia antiga. As notas de métodos descrevem fontes e intenção de ambos.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "O que é I Ching automático vs manual, e posso misturar Ossos no mesmo fio?",
    answer:
      "Automático vs manual aplica-se apenas ao I Ching (três moedas). Em Opções os rádios do modo de tiragem aparecem com o I Ching selecionado: automático corre o ritual animado das moedas no servidor; manual permite introduzir os seis totais de linha (6/7/8/9) das suas moedas antes da leitura. O modo Ossos é sempre automático; não existe fluxo manual de ossos; ritual e veredicto vêm só do algoritmo. Dentro do limite de profundidade por fio do seu plano (por exemplo, oito aprofundamentos num fio Master), pode alternar livremente I Ching e Ossos e mudar o I Ching entre automático e manual de uma consulta para a seguinte; a app memoriza a preferência de modo para a próxima leitura em I Ching.",
    related: ["userGuide", "methodNotes"],
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
      "O algoritmo matemático, não a IA. No modo I Ching, o sistema lança três moedas virtuais seis vezes, constrói o hexagrama linha por linha e aplica as regras de mutação de Zhu Xi para determinar a linha regente e o hexagrama resultante. No modo Ossos, o algoritmo gera o padrão de fissuras e determina o veredicto. A inteligência artificial intervém depois: pega nesse resultado já calculado e articula-o em linguagem natural no seu idioma, com o contexto da sua pergunta. A IA é o intérprete. O oráculo é o método.",
  },
  {
    id: "authentic-texts",
    question: "Os textos do I Ching que aparecem na leitura são autênticos ou gerados por IA?",
    answer:
      "São autênticos. Os textos do Julgamento (卦辞), as sentenças das linhas em movimento (爻辞) e os hexagramas resultantes provêm inteiramente da tradução Wilhelm/Baynes, a versão mais completa e respeitada do I Ching no mundo ocidental, em domínio público desde 2020. A IA cita-os e contextualiza-os com a sua pergunta, mas não os modifica nem substitui. Pode comparar qualquer texto com o livro original.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "O que significa o Silêncio no modo Ossos?",
    answer:
      "O Silêncio (沉默) é o quinto estado possível do veredicto no modo Ossos, e é fiel ao método ancestral Shang. Na tradição original, quando o osso não produzia fissuras legíveis, não era um erro; era uma resposta em si mesma: os ancestrais não falam porque o momento não está maduro para essa pergunta, ou porque a resposta transcende o que pode ser dito. Esta app respeita esse estado e devolve-o quando o padrão o indica. Os cinco estados possíveis são: claramente favorável (吉), moderadamente favorável, moderadamente desfavorável, claramente desfavorável (凶) e silêncio (沉默).",
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
    id: "two-oracles",
    question: "Was ist der Unterschied zwischen I Ching (Münzen) und Orakelknochen?",
    answer:
      "I Ching folgt dem klassischen Sechs-Linien-Ritual. Orakelknochen verwenden einen separaten Fluss, der auf positiver/negativer Ladung basiert und von antiker Pyromantie inspiriert ist. Die Methodennotizen beschreiben Quellen und Absicht beider.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "Was bedeutet automatisch vs. manuell beim I Ching, und kann ich Orakelknochen im selben Thread mischen?",
    answer:
      "Automatisch vs. manuell gilt nur für das I Ching (drei Münzen). In den Optionen erscheinen die Wurfmodus-Radios nur bei ausgewähltem I Ching: automatisch führt das animierte Münzritual auf dem Server aus; manuell tragen Sie vor der Lesung die sechs Liniensummen (6/7/8/9) Ihrer eigenen Münzen ein. Der Orakelknochen-Modus ist immer automatisch; es gibt keinen manuellen Knochenablauf; Ritual und Urteil kommen ausschließlich vom Algorithmus. Innerhalb des Thread-Tiefenlimits Ihres Tarifs (z. B. acht Vertiefungen pro Master-Thread) können Sie frei zwischen I Ching und Orakelknochen wechseln und das I Ching von einer Beratung zur nächsten zwischen automatisch und manuell umschalten; Ihre Wurfmodus-Präferenz wird für die nächste I-Ching-Beratung gespeichert.",
    related: ["userGuide", "methodNotes"],
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
      "Der mathematische Algorithmus, nicht die KI. Im I-Ching-Modus wirft das System dreimal sechs virtuelle Münzen, baut das Hexagramm Linie für Linie auf und wendet Zhu Xis Mutationsregeln an, um die leitende Linie und das resultierende Hexagramm zu bestimmen. Im Knochenmodus generiert der Algorithmus das Rissmuster und bestimmt das Urteil. Die künstliche Intelligenz greift danach ein: Sie nimmt dieses bereits berechnete Ergebnis und formuliert es in natürlicher Sprache in Ihrer Sprache, mit dem Kontext Ihrer Frage. Die KI ist der Interpret. Das Orakel ist die Methode.",
  },
  {
    id: "authentic-texts",
    question: "Sind die I-Ching-Texte in der Lesung authentisch oder KI-generiert?",
    answer:
      "Sie sind authentisch. Die Texte des Urteils (卦辞), die Aussagen der sich bewegenden Linien (爻辞) und die resultierenden Hexagramme stammen vollständig aus der Wilhelm/Baynes-Übersetzung, der vollständigsten und angesehensten Version des I Ching in der westlichen Welt, seit 2020 gemeinfrei. Die KI zitiert und kontextualisiert sie mit Ihrer Frage, ändert oder ersetzt sie aber nicht. Sie können jeden Text mit dem Originalbuch vergleichen.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Was bedeutet das Schweigen im Orakelknochen-Modus?",
    answer:
      "Das Schweigen (沉默) ist der fünfte mögliche Urteilszustand im Orakelknochen-Modus und ist der Shang-Ahnenüberlieferung treu. In der ursprünglichen Tradition war es kein Fehler, wenn der Knochen keine lesbaren Risse produzierte; es war eine Antwort für sich: Die Ahnen sprechen nicht, weil der Moment für diese Frage noch nicht reif ist oder weil die Antwort das Sagbare übersteigt. Diese App respektiert diesen Zustand und gibt ihn zurück, wenn das Muster es anzeigt. Die fünf möglichen Zustände sind: klar günstig (吉), mäßig günstig, mäßig ungünstig, klar ungünstig (凶) und Schweigen (沉默).",
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
    id: "two-oracles",
    question: "Qual è la differenza tra I Ching (monete) e le Ossa dell'Oracolo?",
    answer:
      "L'I Ching segue il classico rituale delle sei linee. Le Ossa utilizzano un flusso separato basato su cariche positive/negative ispirato all'antica piromanza. Le note sui metodi descrivono fonti e finalità di entrambi.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "Che cos'è I Ching automatico vs manuale, e posso mescolare le Ossa nello stesso filo?",
    answer:
      "Automatico vs manuale vale solo per l'I Ching (tre monete). In Opzioni i radio del modo di lancio compaiono con l'I Ching selezionato: automatico esegue il rituale animato delle monete sul server; manuale consente di inserire i sei totali di linea (6/7/8/9) delle proprie monete prima della lettura. La modalità Ossa è sempre automatica; non esiste un flusso manuale per le ossa; rituale e verdetto provengono solo dall'algoritmo. Entro il limite di profondità per filo del tuo piano (ad esempio otto approfondimenti in un filo Master), puoi alternare liberamente I Ching e Ossa e passare l'I Ching da automatico a manuale da una consultazione all'altra; l'app memorizza la preferenza di modo per la prossima lettura in I Ching.",
    related: ["userGuide", "methodNotes"],
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
      "L'algoritmo matematico, non l'IA. In modalità I Ching, il sistema lancia tre monete virtuali sei volte, costruisce l'esagramma linea per linea e applica le regole di mutazione di Zhu Xi per determinare la linea dominante e l'esagramma risultante. In modalità Ossa, l'algoritmo genera il motivo delle fessure e determina il verdetto. L'intelligenza artificiale interviene dopo: prende quel risultato già calcolato e lo articola in linguaggio naturale nella tua lingua, con il contesto della tua domanda. L'IA è l'interprete. L'oracolo è il metodo.",
  },
  {
    id: "authentic-texts",
    question: "I testi dell'I Ching che appaiono nella lettura sono autentici o generati dall'IA?",
    answer:
      "Sono autentici. I testi del Giudizio (卦辞), le sentenze delle linee in movimento (爻辞) e gli esagrammi risultanti provengono interamente dalla traduzione Wilhelm/Baynes, la versione più completa e rispettata dell'I Ching in Occidente, di pubblico dominio dal 2020. L'IA li cita e li contestualizza con la tua domanda, ma non li modifica né li sostituisce. Puoi confrontare qualsiasi testo con il libro originale.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Cosa significa il Silenzio nella modalità Ossa dell'Oracolo?",
    answer:
      "Il Silenzio (沉默) è il quinto stato di verdetto possibile nella modalità Ossa, ed è fedele all'antico metodo Shang. Nella tradizione originale, quando l'osso non produceva crepe leggibili, non era un errore; era una risposta in sé: gli antenati non parlano perché il momento non è maturo per quella domanda, o perché la risposta trascende ciò che può essere detto. Questa app rispetta quello stato e lo restituisce quando il modello lo indica. I cinque stati possibili sono: chiaramente favorevole (吉), moderatamente favorevole, moderatamente sfavorevole, chiaramente sfavorevole (凶) e silenzio (沉默).",
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
    id: "two-oracles",
    question: "Quelle est la différence entre le I Ching (pièces) et les Os de l'Oracle ?",
    answer:
      "Le I Ching suit le rituel classique des six lignes. Les Os utilisent un flux séparé basé sur des charges positive/négative inspiré de la pyromantie ancienne. Les notes de méthodes décrivent les sources et l'intention des deux.",
    related: ["methodNotes", "userGuideGettingStarted"],
  },
  {
    id: "iching-manual-auto-bones",
    question: "Qu'est-ce que le I Ching automatique vs manuel, et puis-je mélanger les Os dans le même fil ?",
    answer:
      "Automatique vs manuel ne concerne que le I Ching (trois pièces). Dans Options, les boutons radio du mode de tirage apparaissent lorsque le I Ching est sélectionné : automatique lance le rituel animé des pièces sur le serveur ; manuel vous permet de saisir les six totaux de ligne (6/7/8/9) de vos vraies pièces avant la lecture. Le mode Os est toujours automatique; il n'existe pas de flux manuel pour les os ; le rituel et le verdict viennent uniquement de l'algorithme. Dans la limite de profondeur par fil de votre forfait (par exemple huit approfondissements sur un fil Master), vous pouvez librement alterner I Ching et Os et passer le I Ching de automatique à manuel d'une consultation à l'autre ; l'application mémorise votre préférence de mode pour la prochaine lecture en I Ching.",
    related: ["userGuide", "methodNotes"],
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
      "L'algorithme mathématique, pas l'IA. En mode I Ching, le système lance trois pièces virtuelles six fois, construit l'hexagramme ligne par ligne et applique les règles de mutation de Zhu Xi pour déterminer la ligne directrice et l'hexagramme résultant. En mode Os, l'algorithme génère le motif de fissures et détermine le verdict. L'intelligence artificielle intervient ensuite : elle prend ce résultat déjà calculé et l'articule en langage naturel dans votre langue, avec le contexte de votre question. L'IA est l'interprète. L'oracle est la méthode.",
  },
  {
    id: "authentic-texts",
    question: "Les textes du I Ching dans la lecture sont-ils authentiques ou générés par IA ?",
    answer:
      "Ils sont authentiques. Les textes du Jugement (卦辞), les sentences des lignes en mouvement (爻辞) et les hexagrammes résultants proviennent intégralement de la traduction Wilhelm/Baynes, la version la plus complète et respectée du I Ching en Occident, dans le domaine public depuis 2020. L'IA les cite et les contextualise avec votre question, mais ne les modifie ni ne les remplace. Vous pouvez comparer n'importe quel texte avec le livre original.",
    related: ["methodNotes"],
  },
  {
    id: "silence-state",
    question: "Que signifie le Silence en mode Os de l'Oracle ?",
    answer:
      "Le Silence (沉默) est le cinquième état de verdict possible en mode Os, et il est fidèle à la méthode ancestrale Shang. Dans la tradition originale, lorsque l'os ne produisait pas de fissures lisibles, ce n'était pas une erreur; c'était une réponse en soi : les ancêtres ne parlent pas car le moment n'est pas mûr pour cette question, ou parce que la réponse transcende ce qui peut être dit. Cette app respecte cet état et le renvoie lorsque le motif l'indique. Les cinq états possibles sont : clairement favorable (吉), modérément favorable, modérément défavorable, clairement défavorable (凶) et silence (沉默).",
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
  const items = itemsMap[locale] ?? FAQ_ITEMS_EN;
  return { ...meta, items };
}
