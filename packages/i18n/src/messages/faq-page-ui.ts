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
      "Yes — after a consultation you can export the thread as a PDF from the reading card actions where available. Details are in the user guide.",
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
    question: "Where are refunds, billing, and service terms?",
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
    question: "¿Dónde están reembolsos, facturación y las condiciones del servicio?",
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
    question: "أين أجد الاسترداد والفوترة وشروط الخدمة؟",
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
  const items =
    locale === "es"
      ? FAQ_ITEMS_ES
      : locale === "ar"
        ? FAQ_ITEMS_AR
        : locale === "hi"
          ? FAQ_ITEMS_HI
          : FAQ_ITEMS_EN;
  return { ...meta, items };
}
