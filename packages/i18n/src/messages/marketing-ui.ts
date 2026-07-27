import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/**
 * Marketing site (theoriginaliching.com) — nav, footer and Home page copy.
 *
 * Full Record<AppLocale, T> for every locale — NO partial/fallback merge
 * pattern (see the mutation-explorer-ui incident: partial locales silently
 * fell back to English). Spanish is the authored base (design export
 * 2026-07-11); the other locales are translations of it.
 *
 * Pricing card lines (tokens · per-thread cap · pack detail) intentionally
 * live in pricing-ui.ts / token-pack-marketing-ui.ts and are reused by the
 * pricing section component — only section-level copy is defined here.
 */
export type MarketingUiMessages = {
  nav: {
    oracle: string;
    guide: string;
    library: string;
    sources: string;
    pricing: string;
    faqs: string;
    consult: string;
    openMenu: string;
    closeMenu: string;
  };
  footer: {
    productHeading: string;
    oracle: string;
    guide: string;
    pricing: string;
    feedback: string;
    googlePlay: string;
    libraryHeading: string;
    hexagrams: string;
    sources: string;
    audits: string;
    supportHeading: string;
    faqs: string;
    privacy: string;
    terms: string;
    deleteAccount: string;
    copyright: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    cta: string;
    playHint: string;
  };
  modes: {
    eyebrow: string;
    title: string;
    ichingTitle: string;
    ichingDesc: string;
    coinsLabel: string;
    coinsHint: string;
    yarrowLabel: string;
    yarrowHint: string;
    ichingCta: string;
    bonesTitle: string;
    bonesDesc: string;
    bonesCta: string;
  };
  ritual: {
    eyebrow: string;
    title: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    step4Title: string;
    step4Desc: string;
    step5Title: string;
    step5Desc: string;
    guideCta: string;
  };
  library: {
    eyebrow: string;
    title: string;
    subtitle: string;
    sampleBadge: string;
    sampleHexName: string;
    sampleTrigrams: string;
    sampleJudgment: string;
    sampleJudgmentDesc: string;
    sampleLinesTeaser: string;
    unlockCta: string;
    indexHeading: string;
    indexHex1: string;
    indexHex2: string;
    indexHex11: string;
    indexHex63: string;
    indexHex64: string;
    indexLegend: string;
    viewLibraryCta: string;
  };
  sources: {
    eyebrow: string;
    title: string;
    subtitle: string;
    wilhelmDetail: string;
    leggeDetail: string;
    zhouyiDetail: string;
    auditsHeading: string;
    auditsCta: string;
    auditRow1Title: string;
    auditRow1Detail: string;
    auditRow2Title: string;
    auditRow2Detail: string;
    auditRow3Title: string;
    auditRow3Detail: string;
    auditRow4Title: string;
    auditRow4Detail: string;
    statusCurrent: string;
  };
  pricing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    popularBadge: string;
    seekerDetail: string;
    practitionerDetail: string;
    masterDetail: string;
    buyCta: string;
    /** Registration hook shown by the packs — links to sign-up. */
    registerFreeCta: string;
  };
  faq: {
    eyebrow: string;
    title: string;
    viewAllCta: string;
    q1: string;
    a1: string;
    q2: string;
    q3: string;
    q4: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    registerCta: string;
    freeLine: string;
  };
  /**
   * "Research" section + nav/footer entries. Links the two brand research
   * subdomains (experiments. / paper.) from the main site. `navLabel`,
   * `footerHeading`, `experimentsName` and `paperName` are brand proper nouns
   * kept in English across locales; the rest is translated.
   */
  research: {
    navLabel: string;
    footerHeading: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    experimentsName: string;
    /**
     * CROSS-REPO DEPENDENCY, and nothing detects it automatically.
     *
     * These three strings state the number of experiments in the lab ("45"). That
     * number is not ours: it is the length of EXPERIMENTOS_ACTIVOS in the registry
     * `web/lib/experimentos.ts` of the iching-experiments repository, which has its own
     * suite asserting it there. Nothing on this side can see that registry, so when an
     * experiment is born the copy has to be updated HERE, by hand, in all 11 locales.
     *
     * If you are reading this because the number looks stale: count the slugs in that
     * registry, do not guess. And prefer removing a figure to maintaining it — the
     * section count that used to sit in experimentsDesc aged twice before it went.
     */
    experimentsTitle: string;
    experimentsDesc: string;
    paperName: string;
    paperTitle: string;
    paperDesc: string;
    /**
     * <meta name="description"> for the Home page (mentions the open research).
     * Carries the experiment count too: see the note on experimentsTitle.
     */
    metaDescription: string;
  };
};

const ES: MarketingUiMessages = {
  nav: {
    oracle: "Oráculo",
    guide: "Guía",
    library: "Biblioteca",
    sources: "Fuentes",
    pricing: "Precios",
    faqs: "FAQs",
    consult: "Consultar",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
  },
  footer: {
    productHeading: "PRODUCTO",
    oracle: "Oráculo",
    guide: "Guía",
    pricing: "Precios",
    feedback: "Ayúdanos a mejorar",
    googlePlay: "App en Google Play",
    libraryHeading: "BIBLIOTECA",
    hexagrams: "Hexagramas",
    sources: "Fuentes",
    audits: "Auditorías",
    supportHeading: "SOPORTE",
    faqs: "FAQs",
    privacy: "Privacidad",
    terms: "Términos",
    deleteAccount: "Eliminar cuenta",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "El oráculo original · desde 800 a.C.",
    title: "Donde la tinta antigua encuentra su lienzo",
    subtitle:
      "El momento de recibir las respuestas a tus preguntas ha llegado. ¿Qué te inquieta este día?",
    cta: "Iniciar consulta",
    playHint: "Lleva el oráculo contigo, también en Android",
  },
  modes: {
    eyebrow: "El oráculo",
    title: "Dos tradiciones, un oráculo",
    ichingTitle: "I Ching clásico",
    ichingDesc:
      "Dos formas de tirada, mismos 64 hexagramas, líneas mutantes y los comentarios completos de Wilhelm y Legge.",
    coinsLabel: "Tres Monedas",
    coinsHint: "el método más común y rápido",
    yarrowLabel: "Varillas de Milenrama",
    yarrowHint: "el ritual más antiguo, distribución Zhou auténtica",
    ichingCta: "Comenzar ritual →",
    bonesTitle: "Huesos oraculares",
    bonesDesc:
      "La forma más antigua de adivinación china: el fuego agrieta el hueso y las fisuras responden. Dinastía Shang, hace 3 300 años.",
    bonesCta: "Encender el fuego →",
  },
  ritual: {
    eyebrow: "Guía · Cómo funciona",
    title: "El ritual",
    step1Title: "La pregunta",
    step1Desc: "Formúlala como se la harías a un maestro: abierta, honesta, tuya.",
    step2Title: "Las opciones",
    step2Desc:
      "Elige oráculo (I Ching o Huesos), traductor (Wilhelm, Legge, Zhou Yi o Master) y la lectura de líneas cambiantes (Huang o Zhu Xi).",
    step3Title: "La tirada",
    step3Desc:
      "Tres Monedas o Varillas de Milenrama; automática (el ritual se anima en pantalla) o manual (registras tus seis líneas de abajo arriba).",
    step4Title: "La lectura",
    step4Desc: "La IA interpreta los textos del traductor elegido para tu situación, en tu idioma.",
    step5Title: "El hilo",
    step5Desc:
      "Sigue conversando sobre tu lectura; cada sesión queda en tu historial y puedes exportarla a PDF.",
    guideCta: "Leer la guía completa →",
  },
  library: {
    eyebrow: "Biblioteca",
    title: "Los 64 hexagramas, edición completa",
    subtitle:
      "Wilhelm, Legge y el Zhouyi lado a lado, con comentarios eruditos y explorador de mutaciones.",
    sampleBadge: "VISTA DE EJEMPLO",
    sampleHexName: "1 · Lo Creativo",
    sampleTrigrams: "QIÁN · CIELO\nSOBRE CIELO",
    sampleJudgment: "«Lo Creativo obra elevado logro, propiciando por la perseverancia.»",
    sampleJudgmentDesc:
      "El dictamen describe el curso del cielo: un movimiento que no se agota, fuerza que se renueva. El sabio aprende de él la duración en el obrar…",
    sampleLinesTeaser:
      "Cada una de las seis líneas se comenta por separado: el dragón sumergido que aún no debe actuar, el dragón que aparece sobre el campo…",
    unlockCta: "Desbloquear biblioteca completa",
    indexHeading: "ÍNDICE · 64 ENTRADAS",
    indexHex1: "1 · Lo Creativo",
    indexHex2: "2 · Lo Receptivo",
    indexHex11: "11 · La Paz",
    indexHex63: "63 · Después de la consumación",
    indexHex64: "64 · Antes de la consumación",
    indexLegend:
      "contenido completo con créditos · el explorador de mutaciones (4 096 transiciones) está incluido",
    viewLibraryCta: "Ver la biblioteca →",
  },
  sources: {
    eyebrow: "Fuentes",
    title: "Método abierto, fuentes verificables",
    subtitle:
      "Publicamos cómo se construye el oráculo: qué ediciones usamos, cómo se auditan y qué hace la IA con ellas.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "El texto canónico original · chino clásico, ~800 a.C.",
    auditsHeading: "REGISTRO DE AUDITORÍAS · 16 VERIFICACIONES",
    auditsCta: "Ver auditorías completas →",
    auditRow1Title: "Wilhelm (1924): texto oracular",
    auditRow1Detail: "Cotejado con la primera edición impresa Diederichs, 1924",
    auditRow2Title: "Varillas de milenrama",
    auditRow2Detail:
      "6/6 comprobaciones aprobadas (100%) · distribución 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "Tres monedas",
    auditRow3Detail: "3/3 comprobaciones aprobadas (100%) · probabilidades 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "Legge (1882) y Zhouyi 周易",
    auditRow4Detail: "Verificados contra el facsímil de Oxford y el texto estándar de ctext.org",
    statusCurrent: "VIGENTE",
  },
  pricing: {
    eyebrow: "Precios",
    title: "Adquiere tu pack de tokens. Sin suscripciones.",
    subtitle:
      "Cada consulta consume un token (la síntesis Master (3) consume 2) y el saldo es acumulable: los packs son consumibles, se suman a lo que ya tienes y no se renuevan solos. Empiezas con 2 tokens de cortesía.",
    popularBadge: "POPULAR",
    seekerDetail: "Biblioteca completa + traductor Legge",
    practitionerDetail: "Añade el texto original Zhou Yi",
    masterDetail: "Añade la síntesis Master (3), 2 tokens por consulta",
    buyCta: "Comprar",
    registerFreeCta: "¡Regístrate y obtén 2 sesiones gratis!",
  },
  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Antes de consultar",
    viewAllCta: "Ver todas las FAQs →",
    q1: "¿La IA inventa las interpretaciones?",
    a1: "No. El texto canónico (dictamen, imagen y líneas) procede siempre de las ediciones auditadas de Wilhelm y Legge. La IA lo aplica a tu pregunta y conversa contigo, pero nunca sustituye ni reescribe el original.",
    q2: "¿Qué incluye el acceso con créditos?",
    q3: "¿Necesito una suscripción?",
    q4: "¿Mis consultas son privadas?",
  },
  finalCta: {
    title: "El oráculo espera tu pregunta",
    subtitle: "Tres mil años de sabiduría, leídos para tu situación. Empieza sin compromiso.",
    registerCta: "Regístrate",
    freeLine: "Recibe dos consultas gratis",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "Investigación abierta",
    title: "Con el respaldo de investigación abierta y verificable",
    subtitle: "El oráculo se apoya en investigación abierta: cada cifra publicada es reproducible y verificada por máquina.",
    experimentsName: "Experiments",
    experimentsTitle: "Explora 45 experimentos reproducibles sobre los 64 hexagramas",
    experimentsDesc: "Un laboratorio trilingüe de 45 experimentos reproducibles sobre la estructura binaria de los 64 hexagramas, con una suite de verificación que congela cada cifra publicada.",
    paperName: "Paper",
    paperTitle: "Lee el estudio estadístico de los ordenamientos históricos",
    paperDesc: "Un estudio estadístico de los ordenamientos históricos (regla de pares, gradiente de familias), con un paquete de replicación que reproduce cada figura con un comando.",
    metaDescription: "Oráculo del I Ching guiado por IA y respaldado por investigación abierta: 45 experimentos reproducibles sobre los 64 hexagramas y un estudio estadístico de sus ordenamientos históricos.",
  },
};

const EN: MarketingUiMessages = {
  nav: {
    oracle: "Oracle",
    guide: "Guide",
    library: "Library",
    sources: "Sources",
    pricing: "Pricing",
    faqs: "FAQs",
    consult: "Consult",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  footer: {
    productHeading: "PRODUCT",
    oracle: "Oracle",
    guide: "Guide",
    pricing: "Pricing",
    feedback: "Help us improve",
    googlePlay: "App on Google Play",
    libraryHeading: "LIBRARY",
    hexagrams: "Hexagrams",
    sources: "Sources",
    audits: "Audits",
    supportHeading: "SUPPORT",
    faqs: "FAQs",
    privacy: "Privacy",
    terms: "Terms",
    deleteAccount: "Delete account",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "The original oracle · since 800 BC",
    title: "Where ancient ink meets its canvas",
    subtitle:
      "The moment to receive the answers to your questions has come. What weighs on you today?",
    cta: "Start a consultation",
    playHint: "Take the oracle with you, also on Android",
  },
  modes: {
    eyebrow: "The oracle",
    title: "Two traditions, one oracle",
    ichingTitle: "Classical I Ching",
    ichingDesc:
      "Two casting methods, the same 64 hexagrams, changing lines, and the complete commentaries of Wilhelm and Legge.",
    coinsLabel: "Three Coins",
    coinsHint: "the most common and fastest method",
    yarrowLabel: "Yarrow Stalks",
    yarrowHint: "the oldest ritual, authentic Zhou distribution",
    ichingCta: "Begin the ritual →",
    bonesTitle: "Oracle bones",
    bonesDesc:
      "The oldest form of Chinese divination: fire cracks the bone and the fissures answer. Shang dynasty, 3,300 years ago.",
    bonesCta: "Light the fire →",
  },
  ritual: {
    eyebrow: "Guide · How it works",
    title: "The ritual",
    step1Title: "The question",
    step1Desc: "Ask it as you would ask a master: open, honest, your own.",
    step2Title: "The options",
    step2Desc:
      "Choose the oracle (I Ching or Bones), the translator (Wilhelm, Legge, Zhou Yi or Master) and the changing-line reading (Huang or Zhu Xi).",
    step3Title: "The cast",
    step3Desc:
      "Three Coins or Yarrow Stalks; automatic (the ritual animates on screen) or manual (you record your six lines from bottom to top).",
    step4Title: "The reading",
    step4Desc:
      "The AI interprets the chosen translator's texts for your situation, in your language.",
    step5Title: "The thread",
    step5Desc:
      "Keep talking about your reading; every session stays in your history and can be exported to PDF.",
    guideCta: "Read the full guide →",
  },
  library: {
    eyebrow: "Library",
    title: "The 64 hexagrams, complete edition",
    subtitle:
      "Wilhelm, Legge and the Zhouyi side by side, with scholarly commentaries and a mutation explorer.",
    sampleBadge: "SAMPLE VIEW",
    sampleHexName: "1 · The Creative",
    sampleTrigrams: "QIÁN · HEAVEN\nOVER HEAVEN",
    sampleJudgment: "“The Creative works sublime success, furthering through perseverance.”",
    sampleJudgmentDesc:
      "The judgment describes the course of heaven: a movement that never exhausts itself, strength that renews. The sage learns from it endurance in action…",
    sampleLinesTeaser:
      "Each of the six lines is commented separately: the submerged dragon that must not yet act, the dragon appearing over the field…",
    unlockCta: "Unlock the full library",
    indexHeading: "INDEX · 64 ENTRIES",
    indexHex1: "1 · The Creative",
    indexHex2: "2 · The Receptive",
    indexHex11: "11 · Peace",
    indexHex63: "63 · After Completion",
    indexHex64: "64 · Before Completion",
    indexLegend:
      "full content with credits · the mutation explorer (4,096 transitions) is included",
    viewLibraryCta: "View the library →",
  },
  sources: {
    eyebrow: "Sources",
    title: "Open method, verifiable sources",
    subtitle:
      "We publish how the oracle is built: which editions we use, how they are audited and what the AI does with them.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "The original canonical text · classical Chinese, ~800 BC",
    auditsHeading: "AUDIT LOG · 16 VERIFICATIONS",
    auditsCta: "View all audits →",
    auditRow1Title: "Wilhelm (1924): oracle text",
    auditRow1Detail: "Checked against the first printed edition, Diederichs 1924",
    auditRow2Title: "Yarrow stalks",
    auditRow2Detail: "6/6 checks passed (100%) · distribution 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "Three coins",
    auditRow3Detail: "3/3 checks passed (100%) · probabilities 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "Legge (1882) and Zhouyi 周易",
    auditRow4Detail: "Verified against the Oxford facsimile and the ctext.org standard text",
    statusCurrent: "CURRENT",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Get your token pack. No subscriptions.",
    subtitle:
      "Each consultation uses one token (the Master (3) synthesis uses 2) and your balance accumulates: packs are consumable, they add to what you already have and never renew on their own. You start with 2 courtesy tokens.",
    popularBadge: "POPULAR",
    seekerDetail: "Full library + Legge translator",
    practitionerDetail: "Adds the original Zhou Yi text",
    masterDetail: "Adds the Master (3) synthesis, 2 tokens per consultation",
    buyCta: "Buy",
    registerFreeCta: "Sign up and get 2 free sessions!",
  },
  faq: {
    eyebrow: "Frequently asked questions",
    title: "Before you consult",
    viewAllCta: "View all FAQs →",
    q1: "Does the AI invent the interpretations?",
    a1: "No. The canonical text (judgment, image and lines) always comes from the audited editions of Wilhelm and Legge. The AI applies it to your question and converses with you, but never replaces or rewrites the original.",
    q2: "What does credit access include?",
    q3: "Do I need a subscription?",
    q4: "Are my consultations private?",
  },
  finalCta: {
    title: "The oracle awaits your question",
    subtitle: "Three thousand years of wisdom, read for your situation. Start with no commitment.",
    registerCta: "Sign up",
    freeLine: "Get two free consultations",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "Open research",
    title: "Backed by open, verifiable research",
    subtitle: "The oracle rests on open research: every published figure is reproducible and machine-verified.",
    experimentsName: "Experiments",
    experimentsTitle: "Explore 45 reproducible experiments on the 64 hexagrams",
    experimentsDesc: "A trilingual lab of 45 reproducible experiments on the binary structure of the 64 hexagrams, with a verification suite that freezes every published figure.",
    paperName: "Paper",
    paperTitle: "Read the statistical study of the historical orderings",
    paperDesc: "A statistical study of the historical orderings (pair rule, family gradient), with a replication package that reproduces every figure with one command.",
    metaDescription: "An AI-guided I Ching oracle backed by open, reproducible research: 45 verifiable experiments on the 64 hexagrams and a statistical study of their historical orderings.",
  },
};

const PT: MarketingUiMessages = {
  nav: {
    oracle: "Oráculo",
    guide: "Guia",
    library: "Biblioteca",
    sources: "Fontes",
    pricing: "Preços",
    faqs: "FAQs",
    consult: "Consultar",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
  },
  footer: {
    productHeading: "PRODUTO",
    oracle: "Oráculo",
    guide: "Guia",
    pricing: "Preços",
    feedback: "Ajude-nos a melhorar",
    googlePlay: "App no Google Play",
    libraryHeading: "BIBLIOTECA",
    hexagrams: "Hexagramas",
    sources: "Fontes",
    audits: "Auditorias",
    supportHeading: "SUPORTE",
    faqs: "FAQs",
    privacy: "Privacidade",
    terms: "Termos",
    deleteAccount: "Excluir conta",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "O oráculo original · desde 800 a.C.",
    title: "Onde a tinta antiga encontra sua tela",
    subtitle:
      "Chegou o momento de receber as respostas às suas perguntas. O que te inquieta hoje?",
    cta: "Iniciar consulta",
    playHint: "Leve o oráculo com você, também no Android",
  },
  modes: {
    eyebrow: "O oráculo",
    title: "Duas tradições, um oráculo",
    ichingTitle: "I Ching clássico",
    ichingDesc:
      "Duas formas de tiragem, os mesmos 64 hexagramas, linhas mutantes e os comentários completos de Wilhelm e Legge.",
    coinsLabel: "Três Moedas",
    coinsHint: "o método mais comum e rápido",
    yarrowLabel: "Varetas de Milefólio",
    yarrowHint: "o ritual mais antigo, distribuição Zhou autêntica",
    ichingCta: "Começar o ritual →",
    bonesTitle: "Ossos oraculares",
    bonesDesc:
      "A forma mais antiga de adivinhação chinesa: o fogo racha o osso e as fissuras respondem. Dinastia Shang, há 3.300 anos.",
    bonesCta: "Acender o fogo →",
  },
  ritual: {
    eyebrow: "Guia · Como funciona",
    title: "O ritual",
    step1Title: "A pergunta",
    step1Desc: "Formule-a como faria a um mestre: aberta, honesta, sua.",
    step2Title: "As opções",
    step2Desc:
      "Escolha o oráculo (I Ching ou Ossos), o tradutor (Wilhelm, Legge, Zhou Yi ou Master) e a leitura das linhas mutantes (Huang ou Zhu Xi).",
    step3Title: "A tiragem",
    step3Desc:
      "Três Moedas ou Varetas de Milefólio; automática (o ritual se anima na tela) ou manual (você registra suas seis linhas de baixo para cima).",
    step4Title: "A leitura",
    step4Desc: "A IA interpreta os textos do tradutor escolhido para a sua situação, no seu idioma.",
    step5Title: "O fio",
    step5Desc:
      "Continue conversando sobre sua leitura; cada sessão fica no seu histórico e pode ser exportada em PDF.",
    guideCta: "Ler o guia completo →",
  },
  library: {
    eyebrow: "Biblioteca",
    title: "Os 64 hexagramas, edição completa",
    subtitle:
      "Wilhelm, Legge e o Zhouyi lado a lado, com comentários eruditos e explorador de mutações.",
    sampleBadge: "VISTA DE EXEMPLO",
    sampleHexName: "1 · O Criativo",
    sampleTrigrams: "QIÁN · CÉU\nSOBRE CÉU",
    sampleJudgment: "«O Criativo opera elevado sucesso, propiciando pela perseverança.»",
    sampleJudgmentDesc:
      "O julgamento descreve o curso do céu: um movimento que não se esgota, força que se renova. O sábio aprende dele a duração no agir…",
    sampleLinesTeaser:
      "Cada uma das seis linhas é comentada separadamente: o dragão submerso que ainda não deve agir, o dragão que aparece sobre o campo…",
    unlockCta: "Desbloquear a biblioteca completa",
    indexHeading: "ÍNDICE · 64 ENTRADAS",
    indexHex1: "1 · O Criativo",
    indexHex2: "2 · O Receptivo",
    indexHex11: "11 · A Paz",
    indexHex63: "63 · Após a Consumação",
    indexHex64: "64 · Antes da Consumação",
    indexLegend:
      "conteúdo completo com créditos · o explorador de mutações (4.096 transições) está incluído",
    viewLibraryCta: "Ver a biblioteca →",
  },
  sources: {
    eyebrow: "Fontes",
    title: "Método aberto, fontes verificáveis",
    subtitle:
      "Publicamos como o oráculo é construído: quais edições usamos, como são auditadas e o que a IA faz com elas.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "O texto canônico original · chinês clássico, ~800 a.C.",
    auditsHeading: "REGISTRO DE AUDITORIAS · 16 VERIFICAÇÕES",
    auditsCta: "Ver auditorias completas →",
    auditRow1Title: "Wilhelm (1924): texto oracular",
    auditRow1Detail: "Confrontado com a primeira edição impressa Diederichs, 1924",
    auditRow2Title: "Varetas de milefólio",
    auditRow2Detail: "6/6 verificações aprovadas (100%) · distribuição 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "Três moedas",
    auditRow3Detail: "3/3 verificações aprovadas (100%) · probabilidades 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "Legge (1882) e Zhouyi 周易",
    auditRow4Detail: "Verificados contra o fac-símile de Oxford e o texto padrão do ctext.org",
    statusCurrent: "VIGENTE",
  },
  pricing: {
    eyebrow: "Preços",
    title: "Adquira seu pack de tokens. Sem assinaturas.",
    subtitle:
      "Cada consulta consome um token (a síntese Master (3) consome 2) e o saldo é acumulável: os packs são consumíveis, somam-se ao que você já tem e não se renovam sozinhos. Você começa com 2 tokens de cortesia.",
    popularBadge: "POPULAR",
    seekerDetail: "Biblioteca completa + tradutor Legge",
    practitionerDetail: "Adiciona o texto original Zhou Yi",
    masterDetail: "Adiciona a síntese Master (3), 2 tokens por consulta",
    buyCta: "Comprar",
    registerFreeCta: "Cadastre-se e ganhe 2 sessões grátis!",
  },
  faq: {
    eyebrow: "Perguntas frequentes",
    title: "Antes de consultar",
    viewAllCta: "Ver todas as FAQs →",
    q1: "A IA inventa as interpretações?",
    a1: "Não. O texto canônico (julgamento, imagem e linhas) procede sempre das edições auditadas de Wilhelm e Legge. A IA o aplica à sua pergunta e conversa com você, mas nunca substitui nem reescreve o original.",
    q2: "O que inclui o acesso com créditos?",
    q3: "Preciso de uma assinatura?",
    q4: "Minhas consultas são privadas?",
  },
  finalCta: {
    title: "O oráculo espera sua pergunta",
    subtitle: "Três mil anos de sabedoria, lidos para a sua situação. Comece sem compromisso.",
    registerCta: "Cadastre-se",
    freeLine: "Receba duas consultas grátis",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "Pesquisa aberta",
    title: "Com o respaldo de pesquisa aberta e verificável",
    subtitle: "O oráculo apoia-se em pesquisa aberta: cada número publicado é reproduzível e verificado por máquina.",
    experimentsName: "Experiments",
    experimentsTitle: "Explore 45 experimentos reproduzíveis sobre os 64 hexagramas",
    experimentsDesc: "Um laboratório trilíngue de 45 experimentos reproduzíveis sobre a estrutura binária dos 64 hexagramas, com uma suíte de verificação que congela cada número publicado.",
    paperName: "Paper",
    paperTitle: "Leia o estudo estatístico dos ordenamentos históricos",
    paperDesc: "Um estudo estatístico dos ordenamentos históricos (regra de pares, gradiente de famílias), com um pacote de replicação que reproduz cada figura com um comando.",
    metaDescription: "Oráculo de I Ching guiado por IA e respaldado por pesquisa aberta: 45 experimentos reproduzíveis sobre os 64 hexagramas e um estudo estatístico dos seus ordenamentos históricos.",
  },
};

const FR: MarketingUiMessages = {
  nav: {
    oracle: "Oracle",
    guide: "Guide",
    library: "Bibliothèque",
    sources: "Sources",
    pricing: "Tarifs",
    faqs: "FAQ",
    consult: "Consulter",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  footer: {
    productHeading: "PRODUIT",
    oracle: "Oracle",
    guide: "Guide",
    pricing: "Tarifs",
    feedback: "Aidez-nous à nous améliorer",
    googlePlay: "App sur Google Play",
    libraryHeading: "BIBLIOTHÈQUE",
    hexagrams: "Hexagrammes",
    sources: "Sources",
    audits: "Audits",
    supportHeading: "ASSISTANCE",
    faqs: "FAQ",
    privacy: "Confidentialité",
    terms: "Conditions",
    deleteAccount: "Supprimer le compte",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "L'oracle originel · depuis 800 av. J.-C.",
    title: "Là où l'encre ancienne rencontre sa toile",
    subtitle:
      "Le moment de recevoir les réponses à tes questions est venu. Qu'est-ce qui te préoccupe aujourd'hui ?",
    cta: "Commencer une consultation",
    playHint: "Emportez l'oracle avec vous, aussi sur Android",
  },
  modes: {
    eyebrow: "L'oracle",
    title: "Deux traditions, un oracle",
    ichingTitle: "Yi King classique",
    ichingDesc:
      "Deux méthodes de tirage, les mêmes 64 hexagrammes, les traits mutants et les commentaires complets de Wilhelm et Legge.",
    coinsLabel: "Trois Pièces",
    coinsHint: "la méthode la plus courante et la plus rapide",
    yarrowLabel: "Tiges de Millefeuille",
    yarrowHint: "le rituel le plus ancien, distribution Zhou authentique",
    ichingCta: "Commencer le rituel →",
    bonesTitle: "Os oraculaires",
    bonesDesc:
      "La plus ancienne forme de divination chinoise : le feu fissure l'os et les fissures répondent. Dynastie Shang, il y a 3 300 ans.",
    bonesCta: "Allumer le feu →",
  },
  ritual: {
    eyebrow: "Guide · Comment ça marche",
    title: "Le rituel",
    step1Title: "La question",
    step1Desc: "Posez-la comme à un maître : ouverte, honnête, la vôtre.",
    step2Title: "Les options",
    step2Desc:
      "Choisissez l'oracle (Yi King ou Os), le traducteur (Wilhelm, Legge, Zhou Yi ou Master) et la lecture des traits mutants (Huang ou Zhu Xi).",
    step3Title: "Le tirage",
    step3Desc:
      "Trois Pièces ou Tiges de Millefeuille ; automatique (le rituel s'anime à l'écran) ou manuel (vous notez vos six traits de bas en haut).",
    step4Title: "La lecture",
    step4Desc:
      "L'IA interprète les textes du traducteur choisi pour votre situation, dans votre langue.",
    step5Title: "Le fil",
    step5Desc:
      "Continuez à converser sur votre lecture ; chaque session reste dans votre historique et peut être exportée en PDF.",
    guideCta: "Lire le guide complet →",
  },
  library: {
    eyebrow: "Bibliothèque",
    title: "Les 64 hexagrammes, édition complète",
    subtitle:
      "Wilhelm, Legge et le Zhouyi côte à côte, avec commentaires érudits et explorateur de mutations.",
    sampleBadge: "VUE D'EXEMPLE",
    sampleHexName: "1 · Le Créateur",
    sampleTrigrams: "QIÁN · CIEL\nSUR CIEL",
    sampleJudgment: "« Le Créateur opère une sublime réussite, favorisant par la persévérance. »",
    sampleJudgmentDesc:
      "Le jugement décrit le cours du ciel : un mouvement qui ne s'épuise pas, une force qui se renouvelle. Le sage en apprend la durée dans l'action…",
    sampleLinesTeaser:
      "Chacun des six traits est commenté séparément : le dragon immergé qui ne doit pas encore agir, le dragon qui apparaît sur le champ…",
    unlockCta: "Débloquer la bibliothèque complète",
    indexHeading: "INDEX · 64 ENTRÉES",
    indexHex1: "1 · Le Créateur",
    indexHex2: "2 · Le Réceptif",
    indexHex11: "11 · La Paix",
    indexHex63: "63 · Après l'Accomplissement",
    indexHex64: "64 · Avant l'Accomplissement",
    indexLegend:
      "contenu complet avec crédits · l'explorateur de mutations (4 096 transitions) est inclus",
    viewLibraryCta: "Voir la bibliothèque →",
  },
  sources: {
    eyebrow: "Sources",
    title: "Méthode ouverte, sources vérifiables",
    subtitle:
      "Nous publions comment l'oracle est construit : quelles éditions nous utilisons, comment elles sont auditées et ce que l'IA en fait.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "Le texte canonique original · chinois classique, ~800 av. J.-C.",
    auditsHeading: "REGISTRE D'AUDITS · 16 VÉRIFICATIONS",
    auditsCta: "Voir tous les audits →",
    auditRow1Title: "Wilhelm (1924) : texte oraculaire",
    auditRow1Detail: "Confronté à la première édition imprimée Diederichs, 1924",
    auditRow2Title: "Tiges de millefeuille",
    auditRow2Detail:
      "6/6 vérifications réussies (100 %) · distribution 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "Trois pièces",
    auditRow3Detail: "3/3 vérifications réussies (100 %) · probabilités 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "Legge (1882) et Zhouyi 周易",
    auditRow4Detail: "Vérifiés contre le fac-similé d'Oxford et le texte standard de ctext.org",
    statusCurrent: "EN VIGUEUR",
  },
  pricing: {
    eyebrow: "Tarifs",
    title: "Achetez votre pack de jetons. Sans abonnement.",
    subtitle:
      "Chaque consultation consomme un jeton (la synthèse Master (3) en consomme 2) et le solde est cumulable : les packs sont consommables, s'ajoutent à ce que vous avez déjà et ne se renouvellent jamais seuls. Vous commencez avec 2 jetons de courtoisie.",
    popularBadge: "POPULAIRE",
    seekerDetail: "Bibliothèque complète + traducteur Legge",
    practitionerDetail: "Ajoute le texte original Zhou Yi",
    masterDetail: "Ajoute la synthèse Master (3), 2 jetons par consultation",
    buyCta: "Acheter",
    registerFreeCta: "Inscris-toi et obtiens 2 séances gratuites !",
  },
  faq: {
    eyebrow: "Questions fréquentes",
    title: "Avant de consulter",
    viewAllCta: "Voir toutes les FAQ →",
    q1: "L'IA invente-t-elle les interprétations ?",
    a1: "Non. Le texte canonique (jugement, image et traits) provient toujours des éditions auditées de Wilhelm et Legge. L'IA l'applique à votre question et converse avec vous, mais ne remplace ni ne réécrit jamais l'original.",
    q2: "Que comprend l'accès avec crédits ?",
    q3: "Ai-je besoin d'un abonnement ?",
    q4: "Mes consultations sont-elles privées ?",
  },
  finalCta: {
    title: "L'oracle attend votre question",
    subtitle:
      "Trois mille ans de sagesse, lus pour votre situation. Commencez sans engagement.",
    registerCta: "Inscrivez-vous",
    freeLine: "Recevez deux consultations gratuites",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "Recherche ouverte",
    title: "Adossé à une recherche ouverte et vérifiable",
    subtitle: "L'oracle repose sur une recherche ouverte : chaque chiffre publié est reproductible et vérifié par la machine.",
    experimentsName: "Experiments",
    experimentsTitle: "Explorez 45 expériences reproductibles sur les 64 hexagrammes",
    experimentsDesc: "Un laboratoire trilingue de 45 expériences reproductibles sur la structure binaire des 64 hexagrammes, avec une suite de vérification qui fige chaque chiffre publié.",
    paperName: "Paper",
    paperTitle: "Lisez l'étude statistique des ordonnancements historiques",
    paperDesc: "Une étude statistique des ordonnancements historiques (règle des paires, gradient des familles), avec un paquet de réplication qui reproduit chaque figure en une commande.",
    metaDescription: "Oracle du I Ching guidé par IA, adossé à une recherche ouverte et reproductible : 45 expériences vérifiables sur les 64 hexagrammes et une étude statistique de leurs ordonnancements historiques.",
  },
};

const DE: MarketingUiMessages = {
  nav: {
    oracle: "Orakel",
    guide: "Leitfaden",
    library: "Bibliothek",
    sources: "Quellen",
    pricing: "Preise",
    faqs: "FAQ",
    consult: "Befragen",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
  },
  footer: {
    productHeading: "PRODUKT",
    oracle: "Orakel",
    guide: "Leitfaden",
    pricing: "Preise",
    feedback: "Hilf uns, besser zu werden",
    googlePlay: "App bei Google Play",
    libraryHeading: "BIBLIOTHEK",
    hexagrams: "Hexagramme",
    sources: "Quellen",
    audits: "Prüfungen",
    supportHeading: "SUPPORT",
    faqs: "FAQ",
    privacy: "Datenschutz",
    terms: "Bedingungen",
    deleteAccount: "Konto löschen",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "Das ursprüngliche Orakel · seit 800 v. Chr.",
    title: "Wo alte Tinte auf ihre Leinwand trifft",
    subtitle:
      "Der Moment, die Antworten auf deine Fragen zu empfangen, ist gekommen. Was beschäftigt dich heute?",
    cta: "Befragung beginnen",
    playHint: "Nimm das Orakel mit, auch auf Android",
  },
  modes: {
    eyebrow: "Das Orakel",
    title: "Zwei Traditionen, ein Orakel",
    ichingTitle: "Klassisches I Ging",
    ichingDesc:
      "Zwei Wurfmethoden, dieselben 64 Hexagramme, wandelnde Linien und die vollständigen Kommentare von Wilhelm und Legge.",
    coinsLabel: "Drei Münzen",
    coinsHint: "die gängigste und schnellste Methode",
    yarrowLabel: "Schafgarbenstängel",
    yarrowHint: "das älteste Ritual, authentische Zhou-Verteilung",
    ichingCta: "Ritual beginnen →",
    bonesTitle: "Orakelknochen",
    bonesDesc:
      "Die älteste Form chinesischer Weissagung: Das Feuer lässt den Knochen bersten, und die Risse antworten. Shang-Dynastie, vor 3.300 Jahren.",
    bonesCta: "Das Feuer entzünden →",
  },
  ritual: {
    eyebrow: "Leitfaden · So funktioniert es",
    title: "Das Ritual",
    step1Title: "Die Frage",
    step1Desc: "Stelle sie, wie du sie einem Meister stellen würdest: offen, ehrlich, deine eigene.",
    step2Title: "Die Optionen",
    step2Desc:
      "Wähle das Orakel (I Ging oder Knochen), den Übersetzer (Wilhelm, Legge, Zhou Yi oder Master) und die Lesart der wandelnden Linien (Huang oder Zhu Xi).",
    step3Title: "Der Wurf",
    step3Desc:
      "Drei Münzen oder Schafgarbenstängel; automatisch (das Ritual wird auf dem Bildschirm animiert) oder manuell (du trägst deine sechs Linien von unten nach oben ein).",
    step4Title: "Die Lesung",
    step4Desc:
      "Die KI deutet die Texte des gewählten Übersetzers für deine Situation, in deiner Sprache.",
    step5Title: "Der Faden",
    step5Desc:
      "Sprich weiter über deine Lesung; jede Sitzung bleibt in deinem Verlauf und kann als PDF exportiert werden.",
    guideCta: "Den vollständigen Leitfaden lesen →",
  },
  library: {
    eyebrow: "Bibliothek",
    title: "Die 64 Hexagramme, vollständige Ausgabe",
    subtitle:
      "Wilhelm, Legge und das Zhouyi Seite an Seite, mit gelehrten Kommentaren und Mutations-Explorer.",
    sampleBadge: "BEISPIELANSICHT",
    sampleHexName: "1 · Das Schöpferische",
    sampleTrigrams: "QIÁN · HIMMEL\nÜBER HIMMEL",
    sampleJudgment: "„Das Schöpferische wirkt erhabenes Gelingen, fördernd durch Beharrlichkeit.“",
    sampleJudgmentDesc:
      "Das Urteil beschreibt den Lauf des Himmels: eine Bewegung, die sich nicht erschöpft, Kraft, die sich erneuert. Der Weise lernt daraus die Dauer im Wirken…",
    sampleLinesTeaser:
      "Jede der sechs Linien wird einzeln kommentiert: der verborgene Drache, der noch nicht handeln soll, der Drache, der über dem Feld erscheint…",
    unlockCta: "Vollständige Bibliothek freischalten",
    indexHeading: "INDEX · 64 EINTRÄGE",
    indexHex1: "1 · Das Schöpferische",
    indexHex2: "2 · Das Empfangende",
    indexHex11: "11 · Der Friede",
    indexHex63: "63 · Nach der Vollendung",
    indexHex64: "64 · Vor der Vollendung",
    indexLegend:
      "vollständiger Inhalt mit Guthaben · der Mutations-Explorer (4.096 Übergänge) ist enthalten",
    viewLibraryCta: "Zur Bibliothek →",
  },
  sources: {
    eyebrow: "Quellen",
    title: "Offene Methode, überprüfbare Quellen",
    subtitle:
      "Wir veröffentlichen, wie das Orakel gebaut ist: welche Ausgaben wir verwenden, wie sie geprüft werden und was die KI mit ihnen macht.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "Der ursprüngliche kanonische Text · klassisches Chinesisch, ~800 v. Chr.",
    auditsHeading: "PRÜFREGISTER · 16 VERIFIKATIONEN",
    auditsCta: "Alle Prüfungen ansehen →",
    auditRow1Title: "Wilhelm (1924): Orakeltext",
    auditRow1Detail: "Abgeglichen mit der ersten Druckausgabe Diederichs, 1924",
    auditRow2Title: "Schafgarbenstängel",
    auditRow2Detail: "6/6 Prüfungen bestanden (100 %) · Verteilung 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "Drei Münzen",
    auditRow3Detail:
      "3/3 Prüfungen bestanden (100 %) · Wahrscheinlichkeiten 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "Legge (1882) und Zhouyi 周易",
    auditRow4Detail: "Geprüft gegen das Oxford-Faksimile und den Standardtext von ctext.org",
    statusCurrent: "GÜLTIG",
  },
  pricing: {
    eyebrow: "Preise",
    title: "Hol dir dein Token-Paket. Keine Abos.",
    subtitle:
      "Jede Befragung verbraucht einen Token (die Master-(3)-Synthese verbraucht 2), und das Guthaben ist kumulativ: Pakete sind verbrauchbar, addieren sich zu deinem Bestand und verlängern sich nie von selbst. Du startest mit 2 Gratis-Tokens.",
    popularBadge: "BELIEBT",
    seekerDetail: "Vollständige Bibliothek + Legge-Übersetzer",
    practitionerDetail: "Fügt den Originaltext Zhou Yi hinzu",
    masterDetail: "Fügt die Master-(3)-Synthese hinzu, 2 Tokens pro Befragung",
    buyCta: "Kaufen",
    registerFreeCta: "Registriere dich und erhalte 2 kostenlose Sitzungen!",
  },
  faq: {
    eyebrow: "Häufige Fragen",
    title: "Bevor du befragst",
    viewAllCta: "Alle FAQ ansehen →",
    q1: "Erfindet die KI die Deutungen?",
    a1: "Nein. Der kanonische Text (Urteil, Bild und Linien) stammt immer aus den geprüften Ausgaben von Wilhelm und Legge. Die KI wendet ihn auf deine Frage an und spricht mit dir, ersetzt oder überschreibt das Original aber nie.",
    q2: "Was umfasst der Zugang mit Guthaben?",
    q3: "Brauche ich ein Abo?",
    q4: "Sind meine Befragungen privat?",
  },
  finalCta: {
    title: "Das Orakel erwartet deine Frage",
    subtitle:
      "Dreitausend Jahre Weisheit, gelesen für deine Situation. Beginne unverbindlich.",
    registerCta: "Registrieren",
    freeLine: "Erhalte zwei kostenlose Befragungen",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "Offene Forschung",
    title: "Gestützt auf offene, überprüfbare Forschung",
    subtitle: "Das Orakel stützt sich auf offene Forschung: Jede veröffentlichte Zahl ist reproduzierbar und maschinell verifiziert.",
    experimentsName: "Experiments",
    experimentsTitle: "Entdecke 45 reproduzierbare Experimente zu den 64 Hexagrammen",
    experimentsDesc: "Ein dreisprachiges Labor mit 45 reproduzierbaren Experimenten zur binären Struktur der 64 Hexagramme, mit einer Prüfsuite, die jede veröffentlichte Zahl festschreibt.",
    paperName: "Paper",
    paperTitle: "Lies die statistische Studie der historischen Anordnungen",
    paperDesc: "Eine statistische Studie der historischen Anordnungen (Paarregel, Familiengradient) mit einem Replikationspaket, das jede Abbildung mit einem Befehl reproduziert.",
    metaDescription: "KI-gestütztes I-Ching-Orakel, untermauert von offener, reproduzierbarer Forschung: 45 überprüfbare Experimente zu den 64 Hexagrammen und eine statistische Studie ihrer historischen Anordnungen.",
  },
};

const IT: MarketingUiMessages = {
  nav: {
    oracle: "Oracolo",
    guide: "Guida",
    library: "Biblioteca",
    sources: "Fonti",
    pricing: "Prezzi",
    faqs: "FAQ",
    consult: "Consultare",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
  },
  footer: {
    productHeading: "PRODOTTO",
    oracle: "Oracolo",
    guide: "Guida",
    pricing: "Prezzi",
    feedback: "Aiutaci a migliorare",
    googlePlay: "App su Google Play",
    libraryHeading: "BIBLIOTECA",
    hexagrams: "Esagrammi",
    sources: "Fonti",
    audits: "Audit",
    supportHeading: "SUPPORTO",
    faqs: "FAQ",
    privacy: "Privacy",
    terms: "Termini",
    deleteAccount: "Elimina account",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "L'oracolo originale · dall'800 a.C.",
    title: "Dove l'inchiostro antico incontra la sua tela",
    subtitle:
      "È giunto il momento di ricevere le risposte alle tue domande. Cosa ti inquieta oggi?",
    cta: "Inizia una consultazione",
    playHint: "Porta l'oracolo con te, anche su Android",
  },
  modes: {
    eyebrow: "L'oracolo",
    title: "Due tradizioni, un oracolo",
    ichingTitle: "I Ching classico",
    ichingDesc:
      "Due metodi di tiro, gli stessi 64 esagrammi, linee mutanti e i commenti completi di Wilhelm e Legge.",
    coinsLabel: "Tre Monete",
    coinsHint: "il metodo più comune e rapido",
    yarrowLabel: "Steli di Millefoglie",
    yarrowHint: "il rituale più antico, distribuzione Zhou autentica",
    ichingCta: "Inizia il rituale →",
    bonesTitle: "Ossa oracolari",
    bonesDesc:
      "La forma più antica di divinazione cinese: il fuoco incrina l'osso e le fessure rispondono. Dinastia Shang, 3.300 anni fa.",
    bonesCta: "Accendi il fuoco →",
  },
  ritual: {
    eyebrow: "Guida · Come funziona",
    title: "Il rituale",
    step1Title: "La domanda",
    step1Desc: "Formulala come la porresti a un maestro: aperta, onesta, tua.",
    step2Title: "Le opzioni",
    step2Desc:
      "Scegli l'oracolo (I Ching o Ossa), il traduttore (Wilhelm, Legge, Zhou Yi o Master) e la lettura delle linee mutanti (Huang o Zhu Xi).",
    step3Title: "Il tiro",
    step3Desc:
      "Tre Monete o Steli di Millefoglie; automatico (il rituale si anima sullo schermo) o manuale (registri le tue sei linee dal basso verso l'alto).",
    step4Title: "La lettura",
    step4Desc:
      "L'IA interpreta i testi del traduttore scelto per la tua situazione, nella tua lingua.",
    step5Title: "Il filo",
    step5Desc:
      "Continua a conversare sulla tua lettura; ogni sessione resta nella cronologia e può essere esportata in PDF.",
    guideCta: "Leggi la guida completa →",
  },
  library: {
    eyebrow: "Biblioteca",
    title: "I 64 esagrammi, edizione completa",
    subtitle:
      "Wilhelm, Legge e lo Zhouyi fianco a fianco, con commenti eruditi ed esploratore di mutazioni.",
    sampleBadge: "VISTA DI ESEMPIO",
    sampleHexName: "1 · Il Creativo",
    sampleTrigrams: "QIÁN · CIELO\nSU CIELO",
    sampleJudgment: "«Il Creativo opera sublime riuscita, propizia per perseveranza.»",
    sampleJudgmentDesc:
      "Il giudizio descrive il corso del cielo: un movimento che non si esaurisce, forza che si rinnova. Il saggio ne apprende la durata nell'agire…",
    sampleLinesTeaser:
      "Ognuna delle sei linee è commentata separatamente: il drago sommerso che non deve ancora agire, il drago che appare sul campo…",
    unlockCta: "Sblocca la biblioteca completa",
    indexHeading: "INDICE · 64 VOCI",
    indexHex1: "1 · Il Creativo",
    indexHex2: "2 · Il Ricettivo",
    indexHex11: "11 · La Pace",
    indexHex63: "63 · Dopo il Compimento",
    indexHex64: "64 · Prima del Compimento",
    indexLegend:
      "contenuto completo con crediti · l'esploratore di mutazioni (4.096 transizioni) è incluso",
    viewLibraryCta: "Vedi la biblioteca →",
  },
  sources: {
    eyebrow: "Fonti",
    title: "Metodo aperto, fonti verificabili",
    subtitle:
      "Pubblichiamo come è costruito l'oracolo: quali edizioni usiamo, come vengono verificate e cosa ne fa l'IA.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "Il testo canonico originale · cinese classico, ~800 a.C.",
    auditsHeading: "REGISTRO AUDIT · 16 VERIFICHE",
    auditsCta: "Vedi tutti gli audit →",
    auditRow1Title: "Wilhelm (1924): testo oracolare",
    auditRow1Detail: "Confrontato con la prima edizione a stampa Diederichs, 1924",
    auditRow2Title: "Steli di millefoglie",
    auditRow2Detail: "6/6 verifiche superate (100%) · distribuzione 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "Tre monete",
    auditRow3Detail: "3/3 verifiche superate (100%) · probabilità 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "Legge (1882) e Zhouyi 周易",
    auditRow4Detail: "Verificati contro il facsimile di Oxford e il testo standard di ctext.org",
    statusCurrent: "VIGENTE",
  },
  pricing: {
    eyebrow: "Prezzi",
    title: "Acquista il tuo pack di token. Nessun abbonamento.",
    subtitle:
      "Ogni consultazione consuma un token (la sintesi Master (3) ne consuma 2) e il saldo è cumulabile: i pack sono consumabili, si sommano a ciò che già possiedi e non si rinnovano da soli. Inizi con 2 token di cortesia.",
    popularBadge: "POPOLARE",
    seekerDetail: "Biblioteca completa + traduttore Legge",
    practitionerDetail: "Aggiunge il testo originale Zhou Yi",
    masterDetail: "Aggiunge la sintesi Master (3), 2 token per consultazione",
    buyCta: "Acquista",
    registerFreeCta: "Registrati e ottieni 2 sessioni gratuite!",
  },
  faq: {
    eyebrow: "Domande frequenti",
    title: "Prima di consultare",
    viewAllCta: "Vedi tutte le FAQ →",
    q1: "L'IA inventa le interpretazioni?",
    a1: "No. Il testo canonico (giudizio, immagine e linee) proviene sempre dalle edizioni verificate di Wilhelm e Legge. L'IA lo applica alla tua domanda e conversa con te, ma non sostituisce né riscrive mai l'originale.",
    q2: "Cosa include l'accesso con crediti?",
    q3: "Serve un abbonamento?",
    q4: "Le mie consultazioni sono private?",
  },
  finalCta: {
    title: "L'oracolo attende la tua domanda",
    subtitle: "Tremila anni di saggezza, letti per la tua situazione. Inizia senza impegno.",
    registerCta: "Registrati",
    freeLine: "Ricevi due consultazioni gratuite",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "Ricerca aperta",
    title: "Sostenuto da ricerca aperta e verificabile",
    subtitle: "L'oracolo si fonda su ricerca aperta: ogni dato pubblicato è riproducibile e verificato dalla macchina.",
    experimentsName: "Experiments",
    experimentsTitle: "Esplora 45 esperimenti riproducibili sui 64 esagrammi",
    experimentsDesc: "Un laboratorio trilingue di 45 esperimenti riproducibili sulla struttura binaria dei 64 esagrammi, con una suite di verifica che fissa ogni dato pubblicato.",
    paperName: "Paper",
    paperTitle: "Leggi lo studio statistico degli ordinamenti storici",
    paperDesc: "Uno studio statistico degli ordinamenti storici (regola delle coppie, gradiente delle famiglie), con un pacchetto di replica che riproduce ogni figura con un comando.",
    metaDescription: "Oracolo dell'I Ching guidato dall'IA e sostenuto da ricerca aperta e riproducibile: 45 esperimenti verificabili sui 64 esagrammi e uno studio statistico dei loro ordinamenti storici.",
  },
};

const JA: MarketingUiMessages = {
  nav: {
    oracle: "オラクル",
    guide: "ガイド",
    library: "ライブラリ",
    sources: "出典",
    pricing: "料金",
    faqs: "FAQ",
    consult: "占う",
    openMenu: "メニューを開く",
    closeMenu: "メニューを閉じる",
  },
  footer: {
    productHeading: "プロダクト",
    oracle: "オラクル",
    guide: "ガイド",
    pricing: "料金",
    feedback: "改善にご協力ください",
    googlePlay: "Google Play アプリ",
    libraryHeading: "ライブラリ",
    hexagrams: "六十四卦",
    sources: "出典",
    audits: "監査",
    supportHeading: "サポート",
    faqs: "FAQ",
    privacy: "プライバシー",
    terms: "利用規約",
    deleteAccount: "アカウント削除",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "本来の神託 · 紀元前800年より",
    title: "古の墨が、その画布に出会う場所",
    subtitle:
      "あなたの問いへの答えを受け取る時が来ました。今日、何が心にかかっていますか？",
    cta: "占いを始める",
    playHint: "Androidでもオラクルを持ち歩けます",
  },
  modes: {
    eyebrow: "神託",
    title: "二つの伝統、一つの神託",
    ichingTitle: "古典易経",
    ichingDesc:
      "二つの筮法、同じ六十四卦、変爻、そしてヴィルヘルムとレッグの完全な注釈。",
    coinsLabel: "三枚銭",
    coinsHint: "最も一般的で速い方法",
    yarrowLabel: "筮竹（蓍草）",
    yarrowHint: "最古の儀式、本来の周代の確率分布",
    ichingCta: "儀式を始める →",
    bonesTitle: "甲骨占い",
    bonesDesc:
      "最古の中国占術：火が骨を割り、その亀裂が答えます。殷（商）王朝、3,300年前。",
    bonesCta: "火を灯す →",
  },
  ritual: {
    eyebrow: "ガイド · 使い方",
    title: "儀式",
    step1Title: "問い",
    step1Desc: "師に尋ねるように問いかけてください：開かれた、正直な、あなた自身の問いを。",
    step2Title: "選択",
    step2Desc:
      "神託（易経または甲骨）、訳者（ヴィルヘルム、レッグ、周易、Master）、変爻の読み方（Huang または朱熹）を選びます。",
    step3Title: "筮",
    step3Desc:
      "三枚銭か筮竹か。自動（儀式が画面上でアニメーション）または手動（六本の爻を下から上へ記録）。",
    step4Title: "読み",
    step4Desc: "AIが選ばれた訳者のテキストをあなたの状況に合わせ、あなたの言語で解釈します。",
    step5Title: "対話",
    step5Desc:
      "読みについて会話を続けられます。各セッションは履歴に残り、PDFに書き出せます。",
    guideCta: "完全なガイドを読む →",
  },
  library: {
    eyebrow: "ライブラリ",
    title: "六十四卦、完全版",
    subtitle:
      "ヴィルヘルム、レッグ、周易を並べて閲覧。学術的注釈と変卦エクスプローラー付き。",
    sampleBadge: "サンプル表示",
    sampleHexName: "1 · 乾為天",
    sampleTrigrams: "QIÁN · 天の上に天",
    sampleJudgment: "「乾は元いに亨る。貞しきに利ろし。」",
    sampleJudgmentDesc:
      "彖辞は天の運行を描きます：尽きることのない動き、自ら新たになる力。賢者はそこから行いにおける持続を学びます…",
    sampleLinesTeaser:
      "六本の爻はそれぞれ個別に注釈されます：まだ動くべきでない潜龍、田に現れる見龍…",
    unlockCta: "完全なライブラリを解放",
    indexHeading: "索引 · 全64卦",
    indexHex1: "1 · 乾為天",
    indexHex2: "2 · 坤為地",
    indexHex11: "11 · 地天泰",
    indexHex63: "63 · 水火既済",
    indexHex64: "64 · 火水未済",
    indexLegend:
      "クレジットで全内容を閲覧可能 · 変卦エクスプローラー（4,096の変化）を含む",
    viewLibraryCta: "ライブラリを見る →",
  },
  sources: {
    eyebrow: "出典",
    title: "開かれた方法、検証可能な出典",
    subtitle:
      "オラクルの構築方法を公開しています：使用する版、その監査方法、AIがそれをどう扱うか。",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "原典の正典テキスト · 古典中国語、紀元前800年頃",
    auditsHeading: "監査記録 · 16件の検証",
    auditsCta: "すべての監査を見る →",
    auditRow1Title: "ヴィルヘルム（1924）：神託テキスト",
    auditRow1Detail: "Diederichs 1924年初版印刷と照合",
    auditRow2Title: "筮竹",
    auditRow2Detail: "6/6項目合格（100%）· 確率分布 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "三枚銭",
    auditRow3Detail: "3/3項目合格（100%）· 確率 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "レッグ（1882）と周易",
    auditRow4Detail: "Oxfordのファクシミリとctext.org標準テキストで検証",
    statusCurrent: "有効",
  },
  pricing: {
    eyebrow: "料金",
    title: "トークンパックを購入。サブスクリプションなし。",
    subtitle:
      "1回の占いで1トークンを消費（Master (3) 統合は2トークン）。残高は累積されます：パックは消費型で、既存の残高に加算され、自動更新されません。まず2トークンを無料でお受け取りください。",
    popularBadge: "人気",
    seekerDetail: "完全なライブラリ + レッグ訳",
    practitionerDetail: "周易の原文を追加",
    masterDetail: "Master (3) 統合を追加、1回の占いで2トークン",
    buyCta: "購入",
    registerFreeCta: "登録して2回の無料セッションを手に入れよう！",
  },
  faq: {
    eyebrow: "よくある質問",
    title: "占う前に",
    viewAllCta: "すべてのFAQを見る →",
    q1: "AIは解釈を創作しますか？",
    a1: "いいえ。正典テキスト（彖辞・象辞・爻辞）は常にヴィルヘルムとレッグの監査済み版に由来します。AIはそれをあなたの問いに適用し対話しますが、原典を置き換えたり書き換えたりすることは決してありません。",
    q2: "クレジットでのアクセスには何が含まれますか？",
    q3: "サブスクリプションは必要ですか？",
    q4: "私の占いはプライベートですか？",
  },
  finalCta: {
    title: "神託があなたの問いを待っています",
    subtitle: "三千年の知恵を、あなたの状況のために。義務なしで始められます。",
    registerCta: "登録する",
    freeLine: "無料で2回の占いを受け取る",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "オープンな研究",
    title: "検証可能なオープンリサーチに基づく",
    subtitle: "この託宣はオープンな研究に基づいています。公開されたすべての数値は再現可能で、機械的に検証されています。",
    experimentsName: "Experiments",
    experimentsTitle: "64卦に関する45の再現可能な実験を見る",
    experimentsDesc: "64卦の二進構造に関する45の再現可能な実験を集めた三言語のラボ。公開された各数値を固定する検証スイートを備えています。",
    paperName: "Paper",
    paperTitle: "歴史的な卦の配列の統計的研究を読む",
    paperDesc: "歴史的な卦の配列（対の規則、家族勾配）に関する統計的研究。すべての図表を1つのコマンドで再現する複製パッケージ付き。",
    metaDescription: "AIが導くI Chingの託宣。オープンで再現可能な研究に裏打ちされ、64卦に関する45の検証可能な実験と、その歴史的な配列の統計的研究を備えています。",
  },
};

const ZH: MarketingUiMessages = {
  nav: {
    oracle: "占卜",
    guide: "指南",
    library: "典藏",
    sources: "文献",
    pricing: "价格",
    faqs: "常见问题",
    consult: "开始占卜",
    openMenu: "打开菜单",
    closeMenu: "关闭菜单",
  },
  footer: {
    productHeading: "产品",
    oracle: "占卜",
    guide: "指南",
    pricing: "价格",
    feedback: "帮助我们改进",
    googlePlay: "Google Play 应用",
    libraryHeading: "典藏",
    hexagrams: "六十四卦",
    sources: "文献",
    audits: "审计",
    supportHeading: "支持",
    faqs: "常见问题",
    privacy: "隐私",
    terms: "条款",
    deleteAccount: "删除账户",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "本源神谕 · 始于公元前800年",
    title: "古墨与画布相遇之处",
    subtitle:
      "接收你所有疑问答案的时刻已经到来。今天，什么让你困扰？",
    cta: "开始占卜",
    playHint: "随身携带神谕，Android 亦可",
  },
  modes: {
    eyebrow: "神谕",
    title: "两种传统，一个神谕",
    ichingTitle: "古典易经",
    ichingDesc: "两种起卦方式，同样的六十四卦、变爻，以及卫礼贤与理雅各的完整注释。",
    coinsLabel: "三枚铜钱",
    coinsHint: "最常见、最快捷的方法",
    yarrowLabel: "蓍草",
    yarrowHint: "最古老的仪式，正宗周代概率分布",
    ichingCta: "开始仪式 →",
    bonesTitle: "甲骨占卜",
    bonesDesc: "中国最古老的占卜形式：火灼裂骨，裂纹作答。商代，距今3300年。",
    bonesCta: "点燃圣火 →",
  },
  ritual: {
    eyebrow: "指南 · 如何运作",
    title: "仪式",
    step1Title: "提问",
    step1Desc: "如向大师请教般提问：开放、诚实、发自内心。",
    step2Title: "选项",
    step2Desc:
      "选择神谕（易经或甲骨）、译者（卫礼贤、理雅各、周易或 Master）以及变爻读取方式（黄忠天或朱熹）。",
    step3Title: "起卦",
    step3Desc:
      "三枚铜钱或蓍草；自动（仪式在屏幕上演示）或手动（自下而上记录六爻）。",
    step4Title: "读解",
    step4Desc: "AI 以您的语言，针对您的处境解读所选译者的文本。",
    step5Title: "对话",
    step5Desc: "继续就您的卦象对话；每次会话保存在历史记录中，并可导出为 PDF。",
    guideCta: "阅读完整指南 →",
  },
  library: {
    eyebrow: "典藏",
    title: "六十四卦，完整版本",
    subtitle: "卫礼贤、理雅各与周易并列呈现，附学术注释与变卦探索器。",
    sampleBadge: "示例视图",
    sampleHexName: "1 · 乾为天",
    sampleTrigrams: "QIÁN · 天上有天",
    sampleJudgment: "「乾：元亨利贞。」",
    sampleJudgmentDesc:
      "彖辞描述天道运行：生生不息的运动，自我更新的力量。圣人从中学得行事之恒久……",
    sampleLinesTeaser:
      "六爻逐一注解：潜龙勿用，见龙在田……",
    unlockCta: "解锁完整典藏",
    indexHeading: "索引 · 共64卦",
    indexHex1: "1 · 乾为天",
    indexHex2: "2 · 坤为地",
    indexHex11: "11 · 地天泰",
    indexHex63: "63 · 水火既济",
    indexHex64: "64 · 火水未济",
    indexLegend: "凭点数查看全部内容 · 含变卦探索器（4096种变化）",
    viewLibraryCta: "查看典藏 →",
  },
  sources: {
    eyebrow: "文献",
    title: "方法公开，文献可查",
    subtitle: "我们公开神谕的构建方式：使用哪些版本、如何审计、AI 如何处理它们。",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "原始正典文本 · 古典汉语，约公元前800年",
    auditsHeading: "审计记录 · 16项验证",
    auditsCta: "查看全部审计 →",
    auditRow1Title: "卫礼贤（1924）：卦辞文本",
    auditRow1Detail: "与 Diederichs 1924 年首印版核对",
    auditRow2Title: "蓍草",
    auditRow2Detail: "6/6 项检验通过（100%）· 分布 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "三枚铜钱",
    auditRow3Detail: "3/3 项检验通过（100%）· 概率 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "理雅各（1882）与周易",
    auditRow4Detail: "对照 Oxford 影印本与 ctext.org 标准文本验证",
    statusCurrent: "有效",
  },
  pricing: {
    eyebrow: "价格",
    title: "购买代币包。无订阅。",
    subtitle:
      "每次占卜消耗一枚代币（Master (3) 综合占卜消耗2枚），余额可累积：代币包为消耗型，与现有余额叠加，绝不自动续费。开始即赠2枚代币。",
    popularBadge: "热门",
    seekerDetail: "完整典藏 + 理雅各译本",
    practitionerDetail: "增加周易原文",
    masterDetail: "增加 Master (3) 综合占卜，每次消耗2枚代币",
    buyCta: "购买",
    registerFreeCta: "注册即可获得2次免费占卜！",
  },
  faq: {
    eyebrow: "常见问题",
    title: "占卜之前",
    viewAllCta: "查看全部常见问题 →",
    q1: "AI 会编造解读吗？",
    a1: "不会。正典文本（彖辞、象辞与爻辞）始终来自经审计的卫礼贤与理雅各版本。AI 将其应用于您的问题并与您对话，但绝不替代或改写原文。",
    q2: "点数访问包含什么？",
    q3: "我需要订阅吗？",
    q4: "我的占卜是私密的吗？",
  },
  finalCta: {
    title: "神谕在等待您的问题",
    subtitle: "三千年的智慧，为您的处境而读。无需承诺，即刻开始。",
    registerCta: "注册",
    freeLine: "获得两次免费占卜",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "开放研究",
    title: "以开放、可验证的研究为支撑",
    subtitle: "此神谕建立在开放研究之上：每一个公开的数据都可复现，并经机器验证。",
    experimentsName: "Experiments",
    experimentsTitle: "探索关于64卦的45项可复现实验",
    experimentsDesc: "一个三语实验室，包含45项关于64卦二进制结构的可复现实验，并配有冻结每一项公开数据的验证套件。",
    paperName: "Paper",
    paperTitle: "阅读历史卦序的统计研究",
    paperDesc: "一项关于历史卦序（成对规则、家族梯度）的统计研究，附带可用一条命令复现每张图表的复制包。",
    metaDescription: "由AI引导的易经神谕，以开放、可复现的研究为支撑：关于64卦的45项可验证实验，以及对其历史卦序的统计研究。",
  },
};

const KO: MarketingUiMessages = {
  nav: {
    oracle: "오라클",
    guide: "가이드",
    library: "라이브러리",
    sources: "출처",
    pricing: "가격",
    faqs: "FAQ",
    consult: "점치기",
    openMenu: "메뉴 열기",
    closeMenu: "메뉴 닫기",
  },
  footer: {
    productHeading: "제품",
    oracle: "오라클",
    guide: "가이드",
    pricing: "가격",
    feedback: "개선에 도움 주기",
    googlePlay: "Google Play 앱",
    libraryHeading: "라이브러리",
    hexagrams: "64괘",
    sources: "출처",
    audits: "감사",
    supportHeading: "지원",
    faqs: "FAQ",
    privacy: "개인정보",
    terms: "약관",
    deleteAccount: "계정 삭제",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "본래의 신탁 · 기원전 800년부터",
    title: "오래된 먹이 화폭을 만나는 곳",
    subtitle:
      "당신의 물음에 대한 답을 받을 순간이 왔습니다. 오늘 무엇이 마음에 걸리나요?",
    cta: "점치기 시작",
    playHint: "Android에서도 오라클을 휴대하세요",
  },
  modes: {
    eyebrow: "신탁",
    title: "두 전통, 하나의 신탁",
    ichingTitle: "고전 주역",
    ichingDesc: "두 가지 점법, 같은 64괘, 변효, 그리고 빌헬름과 레그의 완전한 주석.",
    coinsLabel: "세 개의 동전",
    coinsHint: "가장 흔하고 빠른 방법",
    yarrowLabel: "시초점",
    yarrowHint: "가장 오래된 의식, 정통 주나라 확률 분포",
    ichingCta: "의식 시작하기 →",
    bonesTitle: "갑골 점",
    bonesDesc:
      "중국에서 가장 오래된 점술: 불이 뼈를 가르고 균열이 답합니다. 상나라, 3,300년 전.",
    bonesCta: "불 붙이기 →",
  },
  ritual: {
    eyebrow: "가이드 · 작동 방식",
    title: "의식",
    step1Title: "질문",
    step1Desc: "스승에게 묻듯 질문하세요: 열려 있고, 정직하며, 당신 자신의 것으로.",
    step2Title: "선택",
    step2Desc:
      "신탁(주역 또는 갑골), 번역자(빌헬름, 레그, 주역 또는 Master), 변효 읽기 방식(Huang 또는 주희)을 선택합니다.",
    step3Title: "점법",
    step3Desc:
      "세 개의 동전 또는 시초점; 자동(의식이 화면에서 애니메이션) 또는 수동(여섯 효를 아래에서 위로 기록).",
    step4Title: "해석",
    step4Desc: "AI가 선택한 번역자의 텍스트를 당신의 상황에 맞게, 당신의 언어로 해석합니다.",
    step5Title: "대화",
    step5Desc:
      "점괘에 대해 계속 대화하세요; 모든 세션은 기록에 남고 PDF로 내보낼 수 있습니다.",
    guideCta: "전체 가이드 읽기 →",
  },
  library: {
    eyebrow: "라이브러리",
    title: "64괘, 완전판",
    subtitle: "빌헬름, 레그, 주역을 나란히. 학술 주석과 변괘 탐색기 포함.",
    sampleBadge: "샘플 보기",
    sampleHexName: "1 · 중천건",
    sampleTrigrams: "QIÁN · 하늘 위 하늘",
    sampleJudgment: "「건은 크게 형통하니 바르게 함이 이롭다.」",
    sampleJudgmentDesc:
      "단사는 하늘의 운행을 묘사합니다: 다하지 않는 움직임, 스스로 새로워지는 힘. 성인은 그로부터 행함의 지속을 배웁니다…",
    sampleLinesTeaser:
      "여섯 효 각각이 개별적으로 주석됩니다: 아직 행동하지 말아야 할 잠긴 용, 밭에 나타나는 용…",
    unlockCta: "전체 라이브러리 잠금 해제",
    indexHeading: "색인 · 전체 64괘",
    indexHex1: "1 · 중천건",
    indexHex2: "2 · 중지곤",
    indexHex11: "11 · 지천태",
    indexHex63: "63 · 수화기제",
    indexHex64: "64 · 화수미제",
    indexLegend: "크레딧으로 전체 내용 이용 가능 · 변괘 탐색기(4,096가지 변화) 포함",
    viewLibraryCta: "라이브러리 보기 →",
  },
  sources: {
    eyebrow: "출처",
    title: "열린 방법론, 검증 가능한 출처",
    subtitle:
      "오라클이 어떻게 만들어지는지 공개합니다: 어떤 판본을 사용하는지, 어떻게 감사하는지, AI가 그것으로 무엇을 하는지.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "원본 정경 텍스트 · 고전 중국어, 기원전 800년경",
    auditsHeading: "감사 기록 · 16건의 검증",
    auditsCta: "모든 감사 보기 →",
    auditRow1Title: "빌헬름(1924): 신탁 텍스트",
    auditRow1Detail: "Diederichs 1924년 초판 인쇄본과 대조",
    auditRow2Title: "시초점",
    auditRow2Detail: "6/6 검사 통과(100%) · 분포 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "세 개의 동전",
    auditRow3Detail: "3/3 검사 통과(100%) · 확률 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "레그(1882)와 주역 周易",
    auditRow4Detail: "Oxford 영인본과 ctext.org 표준 텍스트로 검증",
    statusCurrent: "유효",
  },
  pricing: {
    eyebrow: "가격",
    title: "토큰 팩을 구매하세요. 구독 없음.",
    subtitle:
      "점 한 번에 토큰 1개를 사용하며(Master (3) 종합은 2개), 잔액은 누적됩니다: 팩은 소모성으로 기존 잔액에 더해지며 자동 갱신되지 않습니다. 시작 시 2개의 무료 토큰이 제공됩니다.",
    popularBadge: "인기",
    seekerDetail: "전체 라이브러리 + 레그 번역",
    practitionerDetail: "주역 원문 추가",
    masterDetail: "Master (3) 종합 추가, 점 한 번에 토큰 2개",
    buyCta: "구매",
    registerFreeCta: "가입하고 무료 세션 2회를 받으세요!",
  },
  faq: {
    eyebrow: "자주 묻는 질문",
    title: "점치기 전에",
    viewAllCta: "모든 FAQ 보기 →",
    q1: "AI가 해석을 지어내나요?",
    a1: "아니요. 정경 텍스트(단사, 상사, 효사)는 항상 감사를 거친 빌헬름과 레그 판본에서 나옵니다. AI는 그것을 당신의 질문에 적용하고 대화하지만, 원문을 대체하거나 다시 쓰지 않습니다.",
    q2: "크레딧 이용에는 무엇이 포함되나요?",
    q3: "구독이 필요한가요?",
    q4: "제 점괘는 비공개인가요?",
  },
  finalCta: {
    title: "오라클이 당신의 질문을 기다립니다",
    subtitle: "삼천 년의 지혜를 당신의 상황에 맞게. 부담 없이 시작하세요.",
    registerCta: "가입하기",
    freeLine: "무료 점 2회 받기",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "공개 연구",
    title: "검증 가능한 공개 연구에 기반합니다",
    subtitle: "이 신탁은 공개 연구에 기반합니다. 공개된 모든 수치는 재현 가능하며 기계로 검증됩니다.",
    experimentsName: "Experiments",
    experimentsTitle: "64괘에 관한 45개의 재현 가능한 실험 살펴보기",
    experimentsDesc: "64괘의 이진 구조에 관한 45개의 재현 가능한 실험을 담은 삼중 언어 실험실로, 공개된 모든 수치를 고정하는 검증 스위트를 갖추고 있습니다.",
    paperName: "Paper",
    paperTitle: "역사적 괘 배열에 관한 통계 연구 읽기",
    paperDesc: "역사적 괘 배열(쌍 규칙, 가족 기울기)에 관한 통계 연구로, 모든 도표를 명령어 하나로 재현하는 복제 패키지가 포함됩니다.",
    metaDescription: "AI가 안내하는 주역 신탁. 공개적이고 재현 가능한 연구에 기반하여 64괘에 관한 45개의 검증 가능한 실험과 그 역사적 배열에 대한 통계 연구를 제공합니다.",
  },
};

const AR: MarketingUiMessages = {
  nav: {
    oracle: "الأوراكل",
    guide: "الدليل",
    library: "المكتبة",
    sources: "المصادر",
    pricing: "الأسعار",
    faqs: "الأسئلة الشائعة",
    consult: "استشر",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
  },
  footer: {
    productHeading: "المنتج",
    oracle: "الأوراكل",
    guide: "الدليل",
    pricing: "الأسعار",
    feedback: "ساعدنا على التحسّن",
    googlePlay: "التطبيق على Google Play",
    libraryHeading: "المكتبة",
    hexagrams: "الهكساغرامات",
    sources: "المصادر",
    audits: "التدقيقات",
    supportHeading: "الدعم",
    faqs: "الأسئلة الشائعة",
    privacy: "الخصوصية",
    terms: "الشروط",
    deleteAccount: "حذف الحساب",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "الأوراكل الأصلي · منذ 800 ق.م",
    title: "حيث يلتقي الحبر القديم بلوحته",
    subtitle:
      "لقد حان وقت تلقّي الإجابات على أسئلتك. ما الذي يشغل بالك اليوم؟",
    cta: "ابدأ استشارة",
    playHint: "احمل الأوراكل معك، على أندرويد أيضاً",
  },
  modes: {
    eyebrow: "الأوراكل",
    title: "تقليدان، أوراكل واحد",
    ichingTitle: "الإي تشينغ الكلاسيكي",
    ichingDesc:
      "طريقتان للرمي، نفس الهكساغرامات الأربعة والستين، الخطوط المتغيرة، والشروح الكاملة لويلهلم وليج.",
    coinsLabel: "ثلاث عملات",
    coinsHint: "الطريقة الأكثر شيوعاً وسرعة",
    yarrowLabel: "عيدان اليارو",
    yarrowHint: "أقدم الطقوس، بتوزيع تشو الأصيل",
    ichingCta: "ابدأ الطقس →",
    bonesTitle: "عظام العرافة",
    bonesDesc:
      "أقدم أشكال العرافة الصينية: النار تشقق العظم والشقوق تجيب. أسرة شانغ، قبل 3,300 عام.",
    bonesCta: "أشعل النار →",
  },
  ritual: {
    eyebrow: "الدليل · كيف يعمل",
    title: "الطقس",
    step1Title: "السؤال",
    step1Desc: "اطرحه كما تطرحه على معلّم: مفتوحاً، صادقاً، نابعاً منك.",
    step2Title: "الخيارات",
    step2Desc:
      "اختر الأوراكل (الإي تشينغ أو العظام)، والمترجم (ويلهلم، ليج، تشو يي أو Master)، وقراءة الخطوط المتغيرة (هوانغ أو تشو شي).",
    step3Title: "الرمية",
    step3Desc:
      "ثلاث عملات أو عيدان اليارو؛ تلقائية (يتحرك الطقس على الشاشة) أو يدوية (تسجّل خطوطك الستة من الأسفل إلى الأعلى).",
    step4Title: "القراءة",
    step4Desc: "يفسّر الذكاء الاصطناعي نصوص المترجم المختار لحالتك، بلغتك.",
    step5Title: "الخيط",
    step5Desc:
      "واصل الحديث عن قراءتك؛ كل جلسة تبقى في سجلّك ويمكن تصديرها إلى PDF.",
    guideCta: "اقرأ الدليل الكامل →",
  },
  library: {
    eyebrow: "المكتبة",
    title: "الهكساغرامات الأربعة والستون، الطبعة الكاملة",
    subtitle:
      "ويلهلم وليج وتشو يي جنباً إلى جنب، مع شروح علمية ومستكشف التحولات.",
    sampleBadge: "عرض تجريبي",
    sampleHexName: "1 · الخلّاق",
    sampleTrigrams: "تشيان · سماء فوق سماء",
    sampleJudgment: "«الخلّاق يعمل نجاحاً سامياً، مؤاتياً عبر المثابرة.»",
    sampleJudgmentDesc:
      "يصف الحكم مسار السماء: حركة لا تنضب، قوة تتجدد. يتعلم الحكيم منها الديمومة في العمل…",
    sampleLinesTeaser:
      "كل خط من الخطوط الستة يُشرح على حدة: التنين الغارق الذي لا ينبغي أن يتحرك بعد، التنين الذي يظهر فوق الحقل…",
    unlockCta: "افتح المكتبة الكاملة",
    indexHeading: "الفهرس · 64 مدخلاً",
    indexHex1: "1 · الخلّاق",
    indexHex2: "2 · المتقبِّل",
    indexHex11: "11 · السلام",
    indexHex63: "63 · بعد الاكتمال",
    indexHex64: "64 · قبل الاكتمال",
    indexLegend:
      "المحتوى الكامل بالرصيد · مستكشف التحولات (4,096 انتقالاً) مشمول",
    viewLibraryCta: "شاهد المكتبة →",
  },
  sources: {
    eyebrow: "المصادر",
    title: "منهج مفتوح، مصادر يمكن التحقق منها",
    subtitle:
      "ننشر كيف يُبنى الأوراكل: أي الطبعات نستخدم، كيف تُدقَّق، وماذا يفعل الذكاء الاصطناعي بها.",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "النص القانوني الأصلي · الصينية الكلاسيكية، ~800 ق.م",
    auditsHeading: "سجل التدقيقات · 16 تحققاً",
    auditsCta: "شاهد كل التدقيقات →",
    auditRow1Title: "ويلهلم (1924): النص الأوراكلي",
    auditRow1Detail: "قوبل بالطبعة المطبوعة الأولى Diederichs، 1924",
    auditRow2Title: "عيدان اليارو",
    auditRow2Detail: "6/6 فحوص ناجحة (100%) · التوزيع 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "ثلاث عملات",
    auditRow3Detail: "3/3 فحوص ناجحة (100%) · الاحتمالات 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "ليج (1882) وتشو يي 周易",
    auditRow4Detail: "تم التحقق منهما مقابل نسخة أكسفورد الطبق الأصل ونص ctext.org القياسي",
    statusCurrent: "ساري",
  },
  pricing: {
    eyebrow: "الأسعار",
    title: "احصل على حزمة التوكنات. بلا اشتراكات.",
    subtitle:
      "كل استشارة تستهلك توكناً واحداً (تركيب Master (3) يستهلك 2) والرصيد تراكمي: الحزم استهلاكية، تُضاف إلى ما لديك ولا تتجدد من تلقاء نفسها. تبدأ بتوكنين مجانيين.",
    popularBadge: "الأكثر شيوعاً",
    seekerDetail: "المكتبة الكاملة + مترجم ليج",
    practitionerDetail: "يضيف نص تشو يي الأصلي",
    masterDetail: "يضيف تركيب Master (3)، توكنان لكل استشارة",
    buyCta: "اشترِ",
    registerFreeCta: "سجّل واحصل على جلستين مجانيتين!",
  },
  faq: {
    eyebrow: "الأسئلة الشائعة",
    title: "قبل أن تستشير",
    viewAllCta: "شاهد كل الأسئلة الشائعة →",
    q1: "هل يخترع الذكاء الاصطناعي التفسيرات؟",
    a1: "لا. النص القانوني (الحكم والصورة والخطوط) يأتي دائماً من طبعات ويلهلم وليج المدققة. يطبّقه الذكاء الاصطناعي على سؤالك ويتحاور معك، لكنه لا يستبدل الأصل ولا يعيد كتابته أبداً.",
    q2: "ماذا يشمل الوصول بالرصيد؟",
    q3: "هل أحتاج إلى اشتراك؟",
    q4: "هل استشاراتي خاصة؟",
  },
  finalCta: {
    title: "الأوراكل ينتظر سؤالك",
    subtitle: "ثلاثة آلاف عام من الحكمة، تُقرأ لحالتك. ابدأ دون التزام.",
    registerCta: "سجّل",
    freeLine: "احصل على استشارتين مجانيتين",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "بحث مفتوح",
    title: "مدعوم ببحث مفتوح وقابل للتحقق",
    subtitle: "يستند هذا العرّاف إلى بحث مفتوح: كل رقم منشور قابل لإعادة الإنتاج وموثّق آليًا.",
    experimentsName: "Experiments",
    experimentsTitle: "استكشف 45 تجربة قابلة لإعادة الإنتاج حول الرموز السداسية الـ64",
    experimentsDesc: "مختبر ثلاثي اللغة يضم 45 تجربة قابلة لإعادة الإنتاج حول البنية الثنائية للرموز السداسية الـ64، مع مجموعة تحقق تثبّت كل رقم منشور.",
    paperName: "Paper",
    paperTitle: "اقرأ الدراسة الإحصائية للترتيبات التاريخية",
    paperDesc: "دراسة إحصائية للترتيبات التاريخية (قاعدة الأزواج، تدرّج العائلات)، مع حزمة تكرار تعيد إنتاج كل شكل بأمر واحد.",
    metaDescription: "عرّاف الإيتشينغ الموجَّه بالذكاء الاصطناعي، مدعوم ببحث مفتوح وقابل لإعادة الإنتاج: 45 تجربة قابلة للتحقق حول الرموز السداسية الـ64 ودراسة إحصائية لترتيباتها التاريخية.",
  },
};

const HI: MarketingUiMessages = {
  nav: {
    oracle: "ओरेकल",
    guide: "गाइड",
    library: "लाइब्रेरी",
    sources: "स्रोत",
    pricing: "मूल्य",
    faqs: "FAQ",
    consult: "परामर्श करें",
    openMenu: "मेनू खोलें",
    closeMenu: "मेनू बंद करें",
  },
  footer: {
    productHeading: "उत्पाद",
    oracle: "ओरेकल",
    guide: "गाइड",
    pricing: "मूल्य",
    feedback: "हमें बेहतर बनाने में मदद करें",
    googlePlay: "Google Play पर ऐप",
    libraryHeading: "लाइब्रेरी",
    hexagrams: "हेक्साग्राम",
    sources: "स्रोत",
    audits: "ऑडिट",
    supportHeading: "सहायता",
    faqs: "FAQ",
    privacy: "गोपनीयता",
    terms: "शर्तें",
    deleteAccount: "खाता हटाएँ",
    copyright: "© 2026 The Original I Ching · theoriginaliching.com",
  },
  hero: {
    eyebrow: "मूल ओरेकल · 800 ई.पू. से",
    title: "जहाँ प्राचीन स्याही अपने कैनवास से मिलती है",
    subtitle:
      "आपके प्रश्नों के उत्तर पाने का क्षण आ गया है। आज आपको क्या व्यथित कर रहा है?",
    cta: "परामर्श शुरू करें",
    playHint: "ओरेकल को साथ ले जाएँ, Android पर भी",
  },
  modes: {
    eyebrow: "ओरेकल",
    title: "दो परंपराएँ, एक ओरेकल",
    ichingTitle: "शास्त्रीय ई चिंग",
    ichingDesc:
      "दो प्रकार की टाली, वही 64 हेक्साग्राम, बदलती रेखाएँ और विल्हेम व लेग की संपूर्ण टिप्पणियाँ।",
    coinsLabel: "तीन सिक्के",
    coinsHint: "सबसे आम और तेज़ विधि",
    yarrowLabel: "यारो की डंडियाँ",
    yarrowHint: "सबसे प्राचीन अनुष्ठान, प्रामाणिक झोउ वितरण",
    ichingCta: "अनुष्ठान शुरू करें →",
    bonesTitle: "ओरेकल अस्थियाँ",
    bonesDesc:
      "चीनी भविष्यवाणी का सबसे प्राचीन रूप: आग हड्डी को चटकाती है और दरारें उत्तर देती हैं। शांग राजवंश, 3,300 वर्ष पहले।",
    bonesCta: "अग्नि प्रज्वलित करें →",
  },
  ritual: {
    eyebrow: "गाइड · यह कैसे काम करता है",
    title: "अनुष्ठान",
    step1Title: "प्रश्न",
    step1Desc: "इसे वैसे पूछें जैसे किसी गुरु से पूछते: खुला, ईमानदार, आपका अपना।",
    step2Title: "विकल्प",
    step2Desc:
      "ओरेकल चुनें (ई चिंग या अस्थियाँ), अनुवादक (विल्हेम, लेग, झोउ यी या Master) और बदलती रेखाओं की पद्धति (Huang या Zhu Xi)।",
    step3Title: "टाली",
    step3Desc:
      "तीन सिक्के या यारो की डंडियाँ; स्वचालित (अनुष्ठान स्क्रीन पर सजीव होता है) या मैनुअल (आप अपनी छह रेखाएँ नीचे से ऊपर दर्ज करते हैं)।",
    step4Title: "पठन",
    step4Desc:
      "AI चुने गए अनुवादक के पाठों की आपकी स्थिति के लिए, आपकी भाषा में व्याख्या करता है।",
    step5Title: "संवाद",
    step5Desc:
      "अपने पठन पर बातचीत जारी रखें; हर सत्र आपके इतिहास में रहता है और PDF में निर्यात किया जा सकता है।",
    guideCta: "पूरी गाइड पढ़ें →",
  },
  library: {
    eyebrow: "लाइब्रेरी",
    title: "64 हेक्साग्राम, संपूर्ण संस्करण",
    subtitle:
      "विल्हेम, लेग और झोउई साथ-साथ, विद्वत् टिप्पणियों और म्यूटेशन एक्सप्लोरर के साथ।",
    sampleBadge: "नमूना दृश्य",
    sampleHexName: "1 · सृजनात्मक",
    sampleTrigrams: "QIÁN · आकाश\nके ऊपर आकाश",
    sampleJudgment: "«सृजनात्मक उदात्त सफलता का कार्य करता है, दृढ़ता से फलदायी।»",
    sampleJudgmentDesc:
      "निर्णय आकाश की गति का वर्णन करता है: एक गति जो चुकती नहीं, बल जो नवीन होता रहता है। ज्ञानी उससे कर्म में स्थायित्व सीखता है…",
    sampleLinesTeaser:
      "छह रेखाओं में से प्रत्येक पर अलग टिप्पणी है: डूबा हुआ ड्रैगन जिसे अभी कार्य नहीं करना चाहिए, खेत के ऊपर प्रकट होता ड्रैगन…",
    unlockCta: "पूरी लाइब्रेरी अनलॉक करें",
    indexHeading: "सूची · 64 प्रविष्टियाँ",
    indexHex1: "1 · सृजनात्मक",
    indexHex2: "2 · ग्रहणशील",
    indexHex11: "11 · शांति",
    indexHex63: "63 · पूर्णता के बाद",
    indexHex64: "64 · पूर्णता से पहले",
    indexLegend:
      "क्रेडिट के साथ पूरी सामग्री · म्यूटेशन एक्सप्लोरर (4,096 संक्रमण) शामिल है",
    viewLibraryCta: "लाइब्रेरी देखें →",
  },
  sources: {
    eyebrow: "स्रोत",
    title: "खुली पद्धति, सत्यापन योग्य स्रोत",
    subtitle:
      "हम प्रकाशित करते हैं कि ओरेकल कैसे बनता है: कौन से संस्करण उपयोग होते हैं, उनका ऑडिट कैसे होता है और AI उनके साथ क्या करता है।",
    wilhelmDetail: "I Ging, Das Buch der Wandlungen · Diederichs",
    leggeDetail: "The Yî King, Sacred Books of the East · Oxford",
    zhouyiDetail: "मूल विहित पाठ · शास्त्रीय चीनी, ~800 ई.पू.",
    auditsHeading: "ऑडिट रजिस्टर · 16 सत्यापन",
    auditsCta: "सभी ऑडिट देखें →",
    auditRow1Title: "विल्हेम (1924): ओरेकल पाठ",
    auditRow1Detail: "Diederichs 1924 के प्रथम मुद्रित संस्करण से मिलान",
    auditRow2Title: "यारो की डंडियाँ",
    auditRow2Detail: "6/6 जाँचें उत्तीर्ण (100%) · वितरण 1/16 · 5/16 · 7/16 · 3/16",
    auditRow3Title: "तीन सिक्के",
    auditRow3Detail: "3/3 जाँचें उत्तीर्ण (100%) · प्रायिकताएँ 1/8 · 3/8 · 3/8 · 1/8",
    auditRow4Title: "लेग (1882) और झोउई 周易",
    auditRow4Detail: "Oxford प्रतिकृति और ctext.org मानक पाठ से सत्यापित",
    statusCurrent: "मान्य",
  },
  pricing: {
    eyebrow: "मूल्य",
    title: "अपना टोकन पैक लें। कोई सदस्यता नहीं।",
    subtitle:
      "हर परामर्श एक टोकन खर्च करता है (Master (3) संश्लेषण 2 खर्च करता है) और शेष संचयी है: पैक उपभोज्य हैं, आपके मौजूदा शेष में जुड़ते हैं और कभी अपने आप नवीनीकृत नहीं होते। आप 2 शिष्टाचार टोकन से शुरू करते हैं।",
    popularBadge: "लोकप्रिय",
    seekerDetail: "पूरी लाइब्रेरी + लेग अनुवादक",
    practitionerDetail: "मूल झोउ यी पाठ जोड़ता है",
    masterDetail: "Master (3) संश्लेषण जोड़ता है, प्रति परामर्श 2 टोकन",
    buyCta: "खरीदें",
    registerFreeCta: "पंजीकरण करें और 2 निःशुल्क सत्र पाएं!",
  },
  faq: {
    eyebrow: "अक्सर पूछे जाने वाले प्रश्न",
    title: "परामर्श से पहले",
    viewAllCta: "सभी FAQ देखें →",
    q1: "क्या AI व्याख्याएँ गढ़ता है?",
    a1: "नहीं। विहित पाठ (निर्णय, छवि और रेखाएँ) हमेशा विल्हेम और लेग के ऑडिट किए गए संस्करणों से आता है। AI उसे आपके प्रश्न पर लागू करता है और आपसे संवाद करता है, लेकिन मूल को कभी प्रतिस्थापित या पुनर्लेखित नहीं करता।",
    q2: "क्रेडिट के साथ पहुँच में क्या शामिल है?",
    q3: "क्या मुझे सदस्यता चाहिए?",
    q4: "क्या मेरे परामर्श निजी हैं?",
  },
  finalCta: {
    title: "ओरेकल आपके प्रश्न की प्रतीक्षा में है",
    subtitle:
      "तीन हज़ार वर्षों का ज्ञान, आपकी स्थिति के लिए पढ़ा गया। बिना किसी प्रतिबद्धता के शुरू करें।",
    registerCta: "पंजीकरण करें",
    freeLine: "दो निःशुल्क परामर्श पाएँ",
  },
  research: {
    navLabel: "Research",
    footerHeading: "RESEARCH",
    eyebrow: "मुक्त शोध",
    title: "मुक्त और सत्यापन-योग्य शोध पर आधारित",
    subtitle: "यह ओरैकल मुक्त शोध पर टिका है: प्रकाशित प्रत्येक आँकड़ा पुनरुत्पाद्य है और मशीन द्वारा सत्यापित है।",
    experimentsName: "Experiments",
    experimentsTitle: "64 हेक्साग्राम पर 45 पुनरुत्पाद्य प्रयोग देखें",
    experimentsDesc: "64 हेक्साग्राम की द्विआधारी संरचना पर 45 पुनरुत्पाद्य प्रयोगों की एक त्रिभाषी प्रयोगशाला, जिसमें प्रत्येक प्रकाशित आँकड़े को स्थिर करने वाली सत्यापन सूट शामिल है।",
    paperName: "Paper",
    paperTitle: "ऐतिहासिक क्रमों का सांख्यिकीय अध्ययन पढ़ें",
    paperDesc: "ऐतिहासिक क्रमों (युग्म नियम, कुल प्रवणता) का एक सांख्यिकीय अध्ययन, जिसके साथ एक प्रतिकृति पैकेज है जो हर आकृति को एक ही कमांड से पुनरुत्पन्न करता है।",
    metaDescription: "AI द्वारा निर्देशित I Ching ओरैकल, मुक्त और पुनरुत्पाद्य शोध पर आधारित: 64 हेक्साग्राम पर 45 सत्यापन-योग्य प्रयोग और उनके ऐतिहासिक क्रमों का सांख्यिकीय अध्ययन।",
  },
};

const MARKETING_UI: Record<AppLocale, MarketingUiMessages> = {
  es: ES,
  en: EN,
  pt: PT,
  fr: FR,
  de: DE,
  it: IT,
  ja: JA,
  zh: ZH,
  ko: KO,
  ar: AR,
  hi: HI,
};

export function getMarketingUiMessages(locale: AppLocale): MarketingUiMessages {
  return MARKETING_UI[locale] ?? MARKETING_UI[DEFAULT_LOCALE];
}
