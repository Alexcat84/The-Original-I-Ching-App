import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type GuiaPageUiMessages = {
  title: string;
  leadPart1: string;
  leadPart2: string;
  leadPart3: string;
  bonesLabel: string;
  /** Section: Privacidad y documentos relacionados */
  privacyDocsHeading: string;
  privacyDocsIntro: string;
  privacyHeading: string;
  privacyLi1: string;
  privacyLi2: string;
  privacyLi3: string;
  /** Section: Uso de la app y opciones disponibles */
  appUseHeading: string;
  appUseIntro: string;
  chatsHeading: string;
  chatsLabel: string;
  chatsOpensHistory: string;
  newSessionLabel: string;
  newSessionDesc: string;
  chatsUnlimited: string;
  packChangesLine: string;
  optionsHeading: string;
  optionsIntro: string;
  libraryFeatureHeading: string;
  libraryFeatureBody: string;
  ichingBullet: string;
  bonesBulletSuffix: string;
  threadDepthBullet: string;
  /** Section: Cómo usar los métodos */
  methodsHeading: string;
  methodsIntro: string;
  ichingPracticalHeading: string;
  ichingPracticalBody: string;
  coinsPracticalHeading: string;
  coinsPracticalBody: string;
  yarrowPracticalHeading: string;
  yarrowPracticalBody: string;
  bonesPracticalHeading: string;
  bonesPracticalBody: string;
  /** I Ching cast-mode block (kept inside methods section) */
  ichingCastModeHeading: string;
  ichingCastModeP1: string;
  ichingCastAutoLi: string;
  ichingCastManualLi: string;
  /** Tokens block above #planes */
  tokensHeading: string;
  tokensIntro: string;
  /** Export section */
  exportHeading: string;
  exportBody: string;
  /** Legal meta links */
  legalMetaBeforePrivacy: string;
  legalMetaBetween: string;
  legalMetaAfterTerms: string;
  /** Getting started anchor */
  gettingStartedHeading: string;
  promptLengthHint: string;
  translatorOptionsBullet: string;
  translatorsHeading: string;
  translatorsWilhelm: string;
  translatorsLegge: string;
  translatorsZhouyi: string;
  translatorsMaster: string;

  s1Heading: string;
  s1Iching: string;
  s1Bones: string;
  s2Heading: string;
  s2TranslatorsTitle: string;
  s2Translators: string;
  s2TokensTitle: string;
  s2Tokens: string;
  s2SecurityTitle: string;
  s2Security: string;
  s3Heading: string;
  s3NewSessionTitle: string;
  s3NewSession: string;
  s3HistoryTitle: string;
  s3History: string;
  s5Heading: string;
  s5AutoTitle: string;
  s5Auto: string;
  s5ManualTitle: string;
  s5Manual: string;
  s6Heading: string;
  s6LibraryTitle: string;
  s6Library: string;
  s6DocsTitle: string;
  s6Docs: string;
};

const GUIA_PAGE_UI: Record<AppLocale, GuiaPageUiMessages> = {
  es: {
    title: "Guía de uso",
    leadPart1: "Esta app te permite consultar en dos estilos: ",
    leadPart2: " y ",
    leadPart3:
      ". Es una herramienta de reflexión y orientación simbólica. No sustituye consejo médico ni financiero ni otro asesoramiento profesional.",
    bonesLabel: "Huesos",
    privacyDocsHeading: "Privacidad y documentos relacionados",
    privacyDocsIntro:
      "Esto es un resumen práctico. Para los detalles vinculantes consulta la política de privacidad y los términos del servicio. Si te interesa el origen histórico de los métodos, mira las notas de método.",
    privacyHeading: "Privacidad",
    privacyLi1:
      "Tus chats e imágenes quedan asociados a tu cuenta y solo son accesibles con tu sesión iniciada.",
    privacyLi2:
      "El servicio no expone tu historial ni tus temas de consulta fuera de tu propio acceso autenticado.",
    privacyLi3:
      "Si quieres conservar un registro en tu dispositivo, bajo tu propia discreción puedes descargar la imagen de una lectura y exportar el hilo actual a PDF desde Opciones; esos archivos se generan localmente y su custodia es tuya.",
    appUseHeading: "Uso de la app y opciones disponibles",
    appUseIntro:
      "Estas son las funciones que tienes a mano: panel de Opciones, Chats, sesión nueva, profundidad del hilo, gestión de tokens, autenticación 2FA opcional y exportación a PDF e imagen.",
    chatsHeading: "Chats y sesiones",
    chatsLabel: "Chats",
    chatsOpensHistory: "abre tu historial.",
    newSessionLabel: "Nueva sesión",
    newSessionDesc:
      "inicia un chat nuevo para cambiar de tema o empezar desde cero.",
    chatsUnlimited:
      "No hay un número fijo de chats: puedes crear nuevos chats cuando quieras.",
    packChangesLine:
      "Lo que cambia según tu pack es el saldo de tokens disponible y cuántas consultas encadenadas caben en un mismo hilo (límite por hilo).",
    optionsHeading: "Opciones (barra inferior)",
    optionsIntro:
      "En Opciones eliges el tipo de consulta (I Ching o Huesos); con I Ching también el modo de tirada (automática o manual), ves la profundidad permitida en el hilo activo, gestionas tokens y 2FA, y al final tienes enlaces a documentación, privacidad y términos.",
    libraryFeatureHeading: "Biblioteca de Hexagramas y Obras (Opción Premium)",
    libraryFeatureBody:
      "Contamos con una biblioteca que incluye la colección completa de los 64 hexagramas utilizando las tres fuentes principales de la obra: la traducción clásica de Wilhelm/Baynes, la versión de James Legge y el texto original Zhou Yi (chino). Esta sección permite contrastar tus respuestas o tiradas manuales con los escritos auténticos, diseñados para el estudio serio del I Ching. Los textos se presentan en su formato original para preservar la fidelidad absoluta de las fuentes.",
    ichingBullet: "lectura por hexagrama y líneas.",
    bonesBulletSuffix: "formato sí/no con lectura simbólica de grietas.",
    threadDepthBullet:
      "Profundidad del hilo: cuántas lecturas encadenadas caben en el mismo chat según tu pack (el plan gratuito no permite seguir preguntando en el mismo hilo tras la primera lectura).",
    translatorOptionsBullet:
      "Elección de traductor: Puedes elegir entre Wilhelm/Baynes, Zhou Yi, James Legge o el modo Master (3) que combina todos en una única respuesta.",
    methodsHeading: "Cómo usar los métodos",
    methodsIntro:
      "El I Ching y los Huesos son métodos distintos. El I Ching trabaja por hexagrama y líneas, e incluye dos formas de tirada: Tres Monedas y Varillas de milenrama. Los Huesos siguen un esquema separado, sin hexagramas.",
    ichingPracticalHeading: "I Ching",
    ichingPracticalBody:
      "Útil para preguntas abiertas, dilemas y procesos en el tiempo. Devuelve un hexagrama, las líneas en movimiento que apliquen y el segundo hexagrama si lo hay. La lectura sigue las reglas clásicas de Zhu Xi y los textos auténticos del libro.",
    coinsPracticalHeading: "Tres Monedas",
    coinsPracticalBody:
      "Es la forma rápida de tirar el I Ching. Funciona en modo automático (la app ejecuta la tirada por ti) o en modo manual (registras tú las seis líneas a partir de tus propias monedas). El resultado y la interpretación son los mismos en ambos modos.",
    yarrowPracticalHeading: "Varillas de milenrama",
    yarrowPracticalBody:
      "Es el método ritual y pausado del I Ching, el más antiguo. La app lo ofrece en modo manual: tras realizar la tirada con tus propias varillas o un soporte equivalente, registras línea a línea para construir el hexagrama. Está pensado para quien quiere conservar el ritmo contemplativo de la práctica clásica.",
    bonesPracticalHeading: "Huesos de oráculo",
    bonesPracticalBody:
      "Pregunta breve, respuesta breve. Funciona siempre en modo automático: el sistema genera el patrón de grietas y el veredicto, y la IA lo expresa en tu idioma. Útil para confirmaciones puntuales o cuando buscas claridad directa, no un análisis largo.",
    ichingCastModeHeading: "I Ching: tirada automática o manual",
    ichingCastModeP1:
      "Con I Ching activo en Opciones puedes elegir el modo de tirada. En ambos casos el servidor aplica las mismas reglas de Zhu Xi y el mismo corpus; solo cambia quién fija las seis líneas antes de la interpretación.",
    ichingCastAutoLi:
      "Automática: al enviar la consulta, el ritual anima el trazado y las seis líneas se obtienen en el servidor.",
    ichingCastManualLi:
      "Manual: se abre un asistente para registrar las seis líneas de abajo arriba. Con Tres Monedas introduces cara/cruz por línea; con Varillas registras tu tirada física paso a paso. Al terminar verás una vista previa del hexagrama; la responsabilidad de reflejar bien tu tirada es tuya.",
    tokensHeading: "Tokens, límites y packs",
    tokensIntro:
      "Cada consulta consume un token. El saldo es acumulable: los packs se suman a lo que ya tienes. Lo que cambia con tu pack es el tamaño del saldo y cuántas lecturas encadenadas caben en un mismo hilo.",
    exportHeading: "Exportar y guardar",
    exportBody:
      "Desde el panel Opciones puedes, cuando lo decidas, descargar la imagen de la lectura y generar un PDF del chat activo. Es opcional: sirve para guardar una copia en tu propio equipo o dispositivo. El archivo PDF se crea en el navegador; no sustituye el historial en la app ni obliga a conservar copias fuera del servicio.",
    legalMetaBeforePrivacy: "Para los detalles completos, consulta la ",
    legalMetaBetween: " y los ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Primeros pasos",
    promptLengthHint:
      "Cada pregunta puede contener hasta un máximo de 1500 caracteres, permitiéndote proporcionar todo el contexto necesario para una respuesta profunda y personalizada.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  en: {
    title: "User guide",
    leadPart1: "This app offers two consultation styles: ",
    leadPart2: " and ",
    leadPart3:
      ". It is a symbolic reflection tool and should not replace medical, financial, or other professional advice.",
    bonesLabel: "Bones",
    privacyDocsHeading: "Privacy and related documents",
    privacyDocsIntro:
      "This is a practical summary. For the binding details please read the privacy policy and the terms of service. If you want the historical background of the methods, see the method notes.",
    privacyHeading: "Privacy",
    privacyLi1:
      "Your chats and images are tied to your account and are only accessible while you are signed in.",
    privacyLi2:
      "The service does not expose your history or consultation topics outside your own authenticated access.",
    privacyLi3:
      "If you want a record on your device, you may, at your sole discretion, download a reading image and export the current thread to PDF from Options; those files are generated locally on your device and you are responsible for keeping them.",
    appUseHeading: "Using the app and available options",
    appUseIntro:
      "These are the features you have at hand: the Options panel, Chats, new session, thread depth, token management, optional 2FA, and PDF/image export.",
    chatsHeading: "Chats and sessions",
    chatsLabel: "Chats",
    chatsOpensHistory: "opens your history.",
    newSessionLabel: "New session",
    newSessionDesc: "starts a fresh thread for a new topic.",
    chatsUnlimited:
      "There is no fixed chat count: create as many threads as you need.",
    packChangesLine:
      "What changes with your pack is your available token balance and how many follow-up consultations fit in one thread (per-thread limit).",
    optionsHeading: "Options (bottom panel)",
    optionsIntro:
      "In Options you pick the consultation type (I Ching or Bones); with I Ching you also pick the cast mode (automatic or manual), see allowed depth for the active thread, manage tokens and 2FA, and find links to documentation, privacy, and terms at the bottom.",
    libraryFeatureHeading: "Hexagram Library and Works (Premium Option)",
    libraryFeatureBody:
      "We offer a library that includes the complete collection of the 64 hexagrams using the three main sources of the work: the classical translation by Wilhelm/Baynes, the version by James Legge, and the original Zhou Yi (Chinese) text. This section allows you to compare your answers or manual casts with the authentic writings, designed for the serious study of the I Ching. The texts are presented in their original format to preserve the absolute fidelity of the sources.",
    ichingBullet: "hexagram and line-based reading.",
    bonesBulletSuffix: "yes/no format with symbolic crack reading.",
    threadDepthBullet:
      "Thread depth: how many chained readings fit in one chat for your pack (the free plan does not allow follow-up readings in the same thread after the first one).",
    translatorOptionsBullet:
      "Translator choice: You can choose between Wilhelm/Baynes, Zhou Yi, James Legge, or the Master (3) mode which combines all into a single answer.",
    methodsHeading: "How to use the methods",
    methodsIntro:
      "I Ching and Bones are different methods. I Ching reads by hexagram and lines and offers two casting modes: Three Coins and Yarrow Stalks. Bones follow a separate scheme, without hexagrams.",
    ichingPracticalHeading: "I Ching",
    ichingPracticalBody:
      "Useful for open questions, dilemmas, and processes that unfold over time. It returns a hexagram, the changing lines that apply, and the resulting hexagram if any. Readings follow the classical Zhu Xi rules and the authentic source texts.",
    coinsPracticalHeading: "Three Coins",
    coinsPracticalBody:
      "The quick way to cast the I Ching. It works either automatically (the app casts for you) or manually (you record the six lines from your own physical coins). The result and the interpretation are the same in both modes.",
    yarrowPracticalHeading: "Yarrow Stalks",
    yarrowPracticalBody:
      "The slower, ritual I Ching method and the oldest one. The app offers it in manual mode: after casting with your own stalks or any equivalent support, you record line by line to build the hexagram. It is meant for those who want to keep the contemplative rhythm of the classical practice.",
    bonesPracticalHeading: "Oracle Bones",
    bonesPracticalBody:
      "Short question, short answer. Always automatic: the system generates the crack pattern and verdict, and the AI articulates it in your language. Useful for direct confirmations or when you want clarity rather than a long reflection.",
    ichingCastModeHeading: "I Ching: automatic or manual cast",
    ichingCastModeP1:
      "With I Ching selected in Options you can pick the cast mode. In both cases the server applies the same Zhu Xi rules and the same text base; only who supplies the six lines before interpretation changes.",
    ichingCastAutoLi:
      "Automatic: when you send the consultation, the ritual animates the pattern and the six lines are generated on the server.",
    ichingCastManualLi:
      "Manual: an assistant opens for you to record the six lines bottom to top. With Three Coins, enter heads/tails per line; with Yarrow Stalks, record your physical cast step by step. After all six lines you will see a hexagram preview; you are responsible for accurately reflecting your physical throw.",
    tokensHeading: "Tokens, limits, and packs",
    tokensIntro:
      "Each consultation consumes one token. Balance is cumulative: every pack adds to whatever you already have. What changes with your pack is the balance size and how many chained readings fit in the same thread.",
    exportHeading: "Export and save",
    exportBody:
      "From the Options panel you may, whenever you choose, download the reading image and generate a PDF of the active chat. This is optional: it is for keeping a copy on your own computer or device. The PDF is built in your browser; it does not replace in-app history and you are not required to keep copies outside the service.",
    legalMetaBeforePrivacy: "For full details, see the ",
    legalMetaBetween: " and ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Getting started",
    promptLengthHint:
      "Each question can contain up to a maximum of 1500 characters, allowing you to provide all the necessary context for a deep and personalized response.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  pt: {
    title: "Guia de utilização",
    leadPart1: "Esta app permite consultar em dois estilos: ",
    leadPart2: " e ",
    leadPart3:
      ". É uma ferramenta de reflexão e orientação simbólica. Não substitui aconselhamento médico ou financeiro nem outro aconselhamento profissional.",
    bonesLabel: "Ossos",
    privacyDocsHeading: "Privacidade e documentos relacionados",
    privacyDocsIntro:
      "Este é um resumo prático. Para os detalhes vinculativos consulta a política de privacidade e os termos do serviço. Se te interessa a origem histórica dos métodos, vê as notas de método.",
    privacyHeading: "Privacidade",
    privacyLi1:
      "Os teus chats e imagens ficam associados à tua conta e só são acessíveis com sessão iniciada.",
    privacyLi2:
      "O serviço não expõe o teu histórico nem os teus temas de consulta fora do teu acesso autenticado.",
    privacyLi3:
      "Se quiseres um registo no teu dispositivo, à tua discrição podes descarregar a imagem de uma leitura e exportar o fio atual para PDF em Opções; esses ficheiros são gerados localmente e a sua custódia é tua.",
    appUseHeading: "Uso da app e opções disponíveis",
    appUseIntro:
      "Estas são as funções que tens à mão: painel Opções, Chats, nova sessão, profundidade do fio, gestão de tokens, 2FA opcional e exportar para PDF e imagem.",
    chatsHeading: "Chats e sessões",
    chatsLabel: "Chats",
    chatsOpensHistory: "abre o teu histórico.",
    newSessionLabel: "Nova sessão",
    newSessionDesc:
      "inicia um chat novo para mudar de tema ou começar de novo.",
    chatsUnlimited:
      "Não há um número fixo de chats: podes criar novos quando quiseres.",
    packChangesLine:
      "O que muda com o teu pack é o saldo de tokens disponível e quantas consultas encadeadas cabem no mesmo fio (limite por fio).",
    optionsHeading: "Opções (barra inferior)",
    optionsIntro:
      "Em Opções escolhes o tipo de consulta (I Ching ou Ossos); com o I Ching também o modo de tiragem (automática ou manual), vês a profundidade permitida no fio ativo, geres tokens e 2FA, e no final tens ligações a documentação, privacidade e termos.",
    libraryFeatureHeading: "Biblioteca de Hexagramas e Obras (Opção Premium)",
    libraryFeatureBody:
      "Dispomos de uma biblioteca onde podes realizar consultas profundas utilizando as três fontes principais da obra: a tradução clássica de Wilhelm/Baynes, a versão de James Legge e o texto original Zhou Yi. Esta secção permite contrastar as tuas respostas ou tiragens manuais com os escritos autênticos, desenhados para o estudo sério do I Ching. Os textos são apresentados no seu formato original para preservar a fidelidade absoluta das fontes.",
    ichingBullet: "leitura por hexagrama e linhas.",
    bonesBulletSuffix: "formato sim/não com leitura simbólica de fendas.",
    threadDepthBullet:
      "Profundidade do fio: quantas leituras encadeadas cabem no mesmo chat conforme o teu pack (o plano gratuito não permite novas perguntas no mesmo fio após a primeira leitura).",
    translatorOptionsBullet:
      "Escolha de tradutor: Podes escolher entre Wilhelm/Baynes, Zhou Yi, James Legge ou o modo Master (3) que combina todos numa única resposta.",
    methodsHeading: "Como usar os métodos",
    methodsIntro:
      "O I Ching e os Ossos são métodos diferentes. O I Ching lê por hexagrama e linhas e oferece duas formas de tiragem: Três Moedas e Varetas de aquilégia. Os Ossos seguem um esquema próprio, sem hexagramas.",
    ichingPracticalHeading: "I Ching",
    ichingPracticalBody:
      "Útil para perguntas abertas, dilemas e processos no tempo. Devolve um hexagrama, as linhas em movimento que se apliquem e o hexagrama resultante se houver. A leitura segue as regras clássicas de Zhu Xi e os textos autênticos do livro.",
    coinsPracticalHeading: "Três Moedas",
    coinsPracticalBody:
      "É a forma rápida de tirar o I Ching. Funciona em modo automático (a app faz a tiragem) ou manual (registas tu as seis linhas a partir das tuas próprias moedas). O resultado e a interpretação são iguais nos dois modos.",
    yarrowPracticalHeading: "Varetas de aquilégia",
    yarrowPracticalBody:
      "É o método ritual e pausado do I Ching, o mais antigo. A app oferece-o em modo manual: depois de tirares com as tuas próprias varetas ou um suporte equivalente, registas linha a linha para construir o hexagrama. É pensado para quem quer manter o ritmo contemplativo da prática clássica.",
    bonesPracticalHeading: "Ossos de oráculo",
    bonesPracticalBody:
      "Pergunta breve, resposta breve. Funciona sempre em automático: o sistema gera o padrão de fendas e o veredicto, e a IA expressa-o no teu idioma. Útil para confirmações pontuais ou quando procuras clareza direta, não uma análise longa.",
    ichingCastModeHeading: "I Ching: tiragem automática ou manual",
    ichingCastModeP1:
      "Com o I Ching ativo em Opções podes escolher o modo de tiragem. Em ambos os casos o servidor aplica as mesmas regras de Zhu Xi e o mesmo corpus; só muda quem define as seis linhas antes da interpretação.",
    ichingCastAutoLi:
      "Automática: ao enviar a consulta, o ritual anima o traçado e as seis linhas são obtidas no servidor.",
    ichingCastManualLi:
      "Manual: abre-se um assistente para registares as seis linhas de baixo para cima. Com Três Moedas introduzes cara/coroa por linha; com Varetas registas a tua tiragem física passo a passo. No fim vês uma pré-visualização do hexagrama; a responsabilidade de refletir corretamente a tua tiragem é tua.",
    tokensHeading: "Tokens, limites e packs",
    tokensIntro:
      "Cada consulta consome um token. O saldo é acumulável: os packs somam-se ao que já tens. O que muda com o teu pack é o tamanho do saldo e quantas leituras encadeadas cabem no mesmo fio.",
    exportHeading: "Exportar e guardar",
    exportBody:
      "No painel Opções podes, quando quiseres, descarregar a imagem da leitura e gerar um PDF do chat ativo. É opcional: serve para guardar uma cópia no teu dispositivo. O PDF é criado no navegador; não substitui o histórico na app nem obriga a cópias fora do serviço.",
    legalMetaBeforePrivacy: "Para todos os detalhes, consulta a ",
    legalMetaBetween: " e os ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Primeiros passos",
    promptLengthHint:
      "Cada pergunta pode conter até um máximo de 1500 caracteres, permitindo-lhe fornecer todo o contexto necessário para uma resposta profunda e personalizada.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  fr: {
    title: "Guide d’utilisation",
    leadPart1: "Cette app permet de consulter selon deux styles : ",
    leadPart2: " et ",
    leadPart3:
      ". C’est un outil de réflexion et d’orientation symbolique. Il ne remplace pas un avis médical, financier ou autre conseil professionnel.",
    bonesLabel: "Os",
    privacyDocsHeading: "Confidentialité et documents liés",
    privacyDocsIntro:
      "Ceci est un résumé pratique. Pour les détails contractuels, consultez la politique de confidentialité et les conditions d’utilisation. Si vous voulez l’origine historique des méthodes, voyez les notes de méthode.",
    privacyHeading: "Confidentialité",
    privacyLi1:
      "Vos chats et images sont liés à votre compte et ne sont accessibles que lorsque vous êtes connecté.",
    privacyLi2:
      "Le service n’expose pas votre historique ni vos sujets de consultation en dehors de votre accès authentifié.",
    privacyLi3:
      "Si vous souhaitez conserver une trace sur votre appareil, à votre discrétion vous pouvez télécharger l’image d’une lecture et exporter le fil actuel en PDF depuis Options ; ces fichiers sont générés localement et vous en assurez la conservation.",
    appUseHeading: "Utilisation de l’app et options disponibles",
    appUseIntro:
      "Voici les fonctions à portée de main : panneau Options, Chats, nouvelle session, profondeur du fil, gestion des jetons, 2FA optionnelle et export PDF et image.",
    chatsHeading: "Chats et sessions",
    chatsLabel: "Chats",
    chatsOpensHistory: "ouvre votre historique.",
    newSessionLabel: "Nouvelle session",
    newSessionDesc:
      "démarre un nouveau chat pour changer de sujet ou repartir de zéro.",
    chatsUnlimited:
      "Il n’y a pas de nombre fixe de chats : créez-en autant que nécessaire.",
    packChangesLine:
      "Ce qui change selon votre pack, c’est le solde de jetons disponible et le nombre de consultations enchaînées possibles dans un même fil (limite par fil).",
    optionsHeading: "Options (barre du bas)",
    optionsIntro:
      "Dans Options vous choisissez le type de consultation (I Ching ou Os) ; avec I Ching aussi le mode de tirage (automatique ou manuel), voyez la profondeur autorisée du fil actif, gérez les jetons et la 2FA, et trouvez en bas les liens vers la documentation, la confidentialité et les conditions.",
    libraryFeatureHeading:
      "Bibliothèque des Hexagrammes et Œuvres (Option Premium)",
    libraryFeatureBody:
      "Nous proposons une bibliothèque où vous pouvez effectuer des consultations approfondies en utilisant les trois sources principales de l'œuvre : la traduction classique de Wilhelm/Baynes, la version de James Legge et le texte original Zhou Yi. Cette section permet de confronter vos réponses ou tirages manuels aux écrits authentiques, conçus pour l'étude sérieuse du I Ching. Les textes sont présentés dans leur format d'origine afin de préserver la fidélité absolue des sources.",
    ichingBullet: "lecture par hexagramme et traits.",
    bonesBulletSuffix: "format oui/non avec lecture symbolique des fissures.",
    threadDepthBullet:
      "Profondeur du fil : combien de lectures enchaînées sont possibles dans le même chat selon votre pack (le plan gratuit ne permet pas de poursuivre dans le même fil après la première lecture).",
    translatorOptionsBullet:
      "Choix du traducteur : Vous pouvez choisir entre Wilhelm/Baynes, Zhou Yi, James Legge, ou le mode Master (3) qui combine le tout en une seule réponse.",
    methodsHeading: "Comment utiliser les méthodes",
    methodsIntro:
      "Le I Ching et les Os sont deux méthodes différentes. Le I Ching lit par hexagramme et traits et propose deux modes de tirage : Trois Pièces et Tiges d’achillée. Les Os suivent un schéma propre, sans hexagramme.",
    ichingPracticalHeading: "I Ching",
    ichingPracticalBody:
      "Utile pour les questions ouvertes, les dilemmes et les processus qui se déploient dans le temps. Il renvoie un hexagramme, les traits en mouvement qui s’appliquent et l’hexagramme dérivé s’il y a lieu. La lecture suit les règles classiques de Zhu Xi et les textes authentiques du livre.",
    coinsPracticalHeading: "Trois Pièces",
    coinsPracticalBody:
      "C’est la façon rapide de tirer le I Ching. Fonctionne en mode automatique (l’app fait le tirage) ou manuel (vous saisissez vous-même les six traits à partir de vos pièces). Le résultat et l’interprétation sont identiques dans les deux modes.",
    yarrowPracticalHeading: "Tiges d’achillée",
    yarrowPracticalBody:
      "C’est la méthode rituelle et lente du I Ching, la plus ancienne. L’app la propose en mode manuel : après votre tirage avec vos propres tiges ou un support équivalent, vous enregistrez trait par trait pour construire l’hexagramme. Pensée pour celles et ceux qui veulent garder le rythme contemplatif de la pratique classique.",
    bonesPracticalHeading: "Os de l’oracle",
    bonesPracticalBody:
      "Question brève, réponse brève. Toujours en automatique : le système génère le motif de fissures et le verdict, l’IA l’articule dans votre langue. Utile pour des confirmations ponctuelles ou pour aller droit à la clarté plutôt qu’à une longue analyse.",
    ichingCastModeHeading: "I Ching : tirage automatique ou manuel",
    ichingCastModeP1:
      "Avec I Ching sélectionné dans Options, vous choisissez le mode de tirage. Dans les deux cas le serveur applique les mêmes règles de Zhu Xi et le même corpus ; seul change l’origine des six traits avant l’interprétation.",
    ichingCastAutoLi:
      "Automatique : à l’envoi, le rituel anime le tracé et les six traits sont générés côté serveur.",
    ichingCastManualLi:
      "Manuel : un assistant permet d’enregistrer les six traits du bas vers le haut. Avec Trois Pièces, entrez pile/face par trait ; avec les Tiges, enregistrez votre tirage physique étape par étape. À la fin, un aperçu d’hexagramme s’affiche ; vous êtes responsable de refléter fidèlement votre jet physique.",
    tokensHeading: "Jetons, limites et packs",
    tokensIntro:
      "Chaque consultation consomme un jeton. Le solde est cumulatif : les packs s’ajoutent à ce que vous avez déjà. Ce qui change selon votre pack, c’est la taille du solde et le nombre de lectures enchaînées possibles dans un même fil.",
    exportHeading: "Exporter et enregistrer",
    exportBody:
      "Depuis le panneau Options, vous pouvez quand vous le souhaitez télécharger l’image de la lecture et générer un PDF du chat actif. C’est facultatif : cela sert à garder une copie sur votre appareil. Le PDF est créé dans le navigateur ; il ne remplace pas l’historique dans l’app et n’oblige pas à conserver des copies hors service.",
    legalMetaBeforePrivacy: "Pour le détail complet, consultez la ",
    legalMetaBetween: " et les ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Premiers pas",
    promptLengthHint:
      "Chaque question peut contenir jusqu'à un maximum de 1500 caractères, vous permettant de fournir tout le contexte nécessaire pour une réponse profonde et personnalisée.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  de: {
    title: "Nutzungsanleitung",
    leadPart1: "Mit dieser App kannst du in zwei Stilen konsultieren: ",
    leadPart2: " und ",
    leadPart3:
      ". Sie ist ein Werkzeug für symbolische Reflexion und Orientierung. Sie ersetzt keine medizinische oder finanzielle Beratung und auch keine sonstige professionelle Beratung.",
    bonesLabel: "Knochen",
    privacyDocsHeading: "Datenschutz und zugehörige Dokumente",
    privacyDocsIntro:
      "Das ist eine praktische Zusammenfassung. Verbindliche Angaben findest du in der Datenschutzerklärung und den Nutzungsbedingungen. Den historischen Hintergrund der Methoden findest du in den Methodennotizen.",
    privacyHeading: "Datenschutz",
    privacyLi1:
      "Deine Chats und Bilder sind mit deinem Konto verknüpft und nur mit angemeldeter Sitzung zugänglich.",
    privacyLi2:
      "Der Dienst gibt deinen Verlauf und deine Beratungsthemen nicht außerhalb deines authentifizierten Zugriffs preis.",
    privacyLi3:
      "Wenn du auf deinem Gerät eine Aufzeichnung möchtest, kannst du nach eigenem Ermessen ein Lesebild herunterladen und den aktuellen Thread als PDF aus Optionen exportieren; diese Dateien werden lokal erzeugt und liegen in deiner Verantwortung.",
    appUseHeading: "App-Nutzung und verfügbare Optionen",
    appUseIntro:
      "Das hast du zur Hand: Optionen-Panel, Chats, neue Sitzung, Thread-Tiefe, Token-Verwaltung, optionale 2FA sowie PDF- und Bildexport.",
    chatsHeading: "Chats und Sitzungen",
    chatsLabel: "Chats",
    chatsOpensHistory: "öffnet deinen Verlauf.",
    newSessionLabel: "Neue Sitzung",
    newSessionDesc:
      "startet einen neuen Chat für ein neues Thema oder von vorn.",
    chatsUnlimited:
      "Es gibt keine feste Chat-Anzahl: du kannst jederzeit neue Chats anlegen.",
    packChangesLine:
      "Je nach Pack ändern sich dein verfügbares Token-Guthaben und wie viele verkettete Beratungen in einem Thread möglich sind (Limit pro Thread).",
    optionsHeading: "Optionen (untere Leiste)",
    optionsIntro:
      "In Optionen wählst du den Beratungstyp (I Ching oder Knochen); bei I Ging auch den Wurfmodus (automatisch oder manuell), siehst die erlaubte Tiefe im aktiven Thread, verwaltest Token und 2FA und findest unten Links zu Dokumentation, Datenschutz und Nutzungsbedingungen.",
    libraryFeatureHeading:
      "Bibliothek der Hexagramme und Werke (Premium-Option)",
    libraryFeatureBody:
      "Wir bieten eine Bibliothek, in der Sie tiefgehende Konsultationen unter Verwendung der drei Hauptquellen des Werks durchführen können: die klassische Wilhelm/Baynes-Übersetzung, die James-Legge-Version und den originalen Zhou-Yi-Text. Dieser Bereich ermöglicht es Ihnen, Ihre Antworten oder manuellen Würfe mit den authentischen Schriften abzugleichen, die für ein ernsthaftes Studium des I Ging konzipiert wurden. Die Texte werden in ihrem Originalformat präsentiert, um die absolute Treue der Quellen zu bewahren.",
    ichingBullet: "Lesung nach Hexagramm und Strichen.",
    bonesBulletSuffix: "Ja/Nein-Format mit symbolischer Riss-Lesung.",
    threadDepthBullet:
      "Thread-Tiefe: wie viele verkettete Lesungen in einem Chat je nach Pack möglich sind (der kostenlose Plan erlaubt nach der ersten Lesung keine Folgefragen im selben Thread).",
    translatorOptionsBullet:
      "Wahl des Übersetzers: Sie können zwischen Wilhelm/Baynes, Zhou Yi, James Legge oder dem Master (3)-Modus wählen, der alle in einer einzigen Antwort kombiniert.",
    methodsHeading: "So nutzt du die Methoden",
    methodsIntro:
      "I Ging und Knochen sind unterschiedliche Methoden. I Ging liest nach Hexagramm und Strichen und bietet zwei Wurfarten: Drei Münzen und Schafgarbenstäbe. Die Knochen folgen einem eigenen Schema, ohne Hexagramm.",
    ichingPracticalHeading: "I Ging",
    ichingPracticalBody:
      "Geeignet für offene Fragen, Dilemmata und Prozesse, die sich über Zeit entfalten. Du erhältst ein Hexagramm, die zutreffenden bewegten Striche und gegebenenfalls das daraus folgende Hexagramm. Die Lesung folgt den klassischen Zhu-Xi-Regeln und den authentischen Quellentexten.",
    coinsPracticalHeading: "Drei Münzen",
    coinsPracticalBody:
      "Der schnelle Weg, das I Ging zu werfen. Geht automatisch (die App wirft für dich) oder manuell (du trägst die sechs Striche aus deinem eigenen Wurf ein). Ergebnis und Auslegung sind in beiden Modi identisch.",
    yarrowPracticalHeading: "Schafgarbenstäbe",
    yarrowPracticalBody:
      "Die ruhige, rituelle Methode des I Ging und die älteste. Die App bietet sie im manuellen Modus an: Nach dem Werfen mit deinen eigenen Stäben oder einem entsprechenden Hilfsmittel trägst du Strich für Strich ein, um das Hexagramm zu bauen. Gedacht für alle, die den kontemplativen Rhythmus der klassischen Praxis bewahren möchten.",
    bonesPracticalHeading: "Orakelknochen",
    bonesPracticalBody:
      "Kurze Frage, kurze Antwort. Immer automatisch: Das System erzeugt das Riss-Muster und das Verdikt, die KI formuliert es in deiner Sprache. Geeignet für punktuelle Bestätigungen oder direkte Klarheit statt langer Analyse.",
    ichingCastModeHeading: "I Ging: automatischer oder manueller Wurf",
    ichingCastModeP1:
      "Mit ausgewähltem I Ging unter Optionen wählst du den Wurfmodus. In beiden Fällen wendet der Server dieselben Zhu-Xi-Regeln und denselben Textbestand an; nur die Herkunft der sechs Striche vor der Auslegung ändert sich.",
    ichingCastAutoLi:
      "Automatisch: Beim Senden animiert das Ritual das Muster, die sechs Striche entstehen auf dem Server.",
    ichingCastManualLi:
      "Manuell: Ein Assistent öffnet, damit du die sechs Striche von unten nach oben eingibst. Mit Drei Münzen trägst du Kopf/Zahl pro Strich ein; mit Stäben hältst du deinen physischen Wurf Schritt für Schritt fest. Am Ende erscheint eine Hexagramm-Vorschau; die korrekte Eingabe deines physischen Wurfs liegt in deiner Verantwortung.",
    tokensHeading: "Tokens, Grenzen und Packs",
    tokensIntro:
      "Jede Beratung verbraucht ein Token. Das Guthaben ist kumulativ: Packs werden zum vorhandenen Guthaben hinzugerechnet. Was sich mit deinem Pack ändert, ist die Größe des Guthabens und wie viele verkettete Lesungen in denselben Thread passen.",
    exportHeading: "Exportieren und speichern",
    exportBody:
      "Im Optionen-Bereich kannst du bei Bedarf das Lesebild herunterladen und den aktiven Chat als PDF erzeugen. Das ist optional und dient dazu, eine Kopie auf deinem Gerät zu behalten. Das PDF entsteht im Browser; es ersetzt nicht den App-Verlauf und verpflichtet nicht zu Kopien außerhalb des Dienstes.",
    legalMetaBeforePrivacy: "Alle Details findest du in der ",
    legalMetaBetween: " und die ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Erste Schritte",
    promptLengthHint:
      "Jede Frage kann bis zu maximal 1500 Zeichen enthalten, sodass Sie den gesamten notwendigen Kontext für eine tiefe und personalisierte Antwort bereitstellen können.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  it: {
    title: "Guida all’uso",
    leadPart1: "Questa app consente di consultare in due stili: ",
    leadPart2: " e ",
    leadPart3:
      ". È uno strumento di riflessione e orientamento simbolico. Non sostituisce pareri medici o finanziari né altri pareri professionali.",
    bonesLabel: "Ossa",
    privacyDocsHeading: "Privacy e documenti correlati",
    privacyDocsIntro:
      "Questa è una sintesi pratica. Per i dettagli vincolanti consulta l’informativa sulla privacy e i termini del servizio. Per l’origine storica dei metodi, vedi le note di metodo.",
    privacyHeading: "Privacy",
    privacyLi1:
      "Le tue chat e immagini sono associate al tuo account e accessibili solo con sessione avviata.",
    privacyLi2:
      "Il servizio non espone la tua cronologia né gli argomenti di consultazione al di fuori del tuo accesso autenticato.",
    privacyLi3:
      "Se vuoi conservare una copia sul dispositivo, a tua discrezione puoi scaricare l’immagine di una lettura ed esportare il thread attivo in PDF da Opzioni; quei file sono generati in locale e ne sei custode.",
    appUseHeading: "Uso dell’app e opzioni disponibili",
    appUseIntro:
      "Ecco le funzioni a portata di mano: pannello Opzioni, Chat, nuova sessione, profondità del thread, gestione token, 2FA opzionale ed esportazione in PDF e immagine.",
    chatsHeading: "Chat e sessioni",
    chatsLabel: "Chat",
    chatsOpensHistory: "apre la cronologia.",
    newSessionLabel: "Nuova sessione",
    newSessionDesc:
      "avvia una nuova chat per cambiare argomento o ricominciare.",
    chatsUnlimited:
      "Non c’è un numero fisso di chat: puoi crearne quante ne servono.",
    packChangesLine:
      "Ciò che cambia in base al pack è il saldo token disponibile e quante consultazioni concatenate stanno in un thread (limite per thread).",
    optionsHeading: "Opzioni (barra inferiore)",
    optionsIntro:
      "In Opzioni scegli il tipo di consulta (I Ching o Ossa); con I Ching anche la modalità di lancio (automatica o manuale), vedi la profondità consentita nel thread attivo, gestisci token e 2FA e in fondo trovi link a documentazione, privacy e termini.",
    libraryFeatureHeading:
      "Biblioteca degli Esagrammi e delle Opere (Opzione Premium)",
    libraryFeatureBody:
      "Disponiamo di una biblioteca in cui puoi effettuare consultazioni approfondite utilizzando le tre fonti principali dell'opera: la traduzione classica di Wilhelm/Baynes, la versione di James Legge e il testo originale Zhou Yi. Questa sezione ti permette di confrontare le tue risposte o i tuoi lanci manuali con gli scritti autentici, pensati per lo studio serio dell'I Ching. I testi sono presentati nel loro formato originale per preservare l'assoluta fedeltà delle fonti.",
    ichingBullet: "lettura per esagramma e linee.",
    bonesBulletSuffix: "formato sì/no con lettura simbolica delle crepe.",
    threadDepthBullet:
      "Profondità del thread: quante letture concatenate sono possibili nella stessa chat in base al pack (il piano gratuito non consente ulteriori domande nello stesso thread dopo la prima lettura).",
    translatorOptionsBullet:
      "Scelta del traduttore: Puoi scegliere tra Wilhelm/Baynes, Zhou Yi, James Legge o la modalità Master (3) che li combina in un'unica risposta.",
    methodsHeading: "Come usare i metodi",
    methodsIntro:
      "I Ching e Ossa sono metodi differenti. L’I Ching legge per esagramma e linee e offre due modi di lancio: Tre Monete e Stecche di achillea. Le Ossa seguono uno schema proprio, senza esagramma.",
    ichingPracticalHeading: "I Ching",
    ichingPracticalBody:
      "Utile per domande aperte, dilemmi e processi che si dispiegano nel tempo. Restituisce un esagramma, le linee in movimento applicabili e l’esagramma risultante se presente. La lettura segue le regole classiche di Zhu Xi e i testi autentici del libro.",
    coinsPracticalHeading: "Tre Monete",
    coinsPracticalBody:
      "È il modo rapido di lanciare l’I Ching. Funziona in automatico (lancia l’app) o in manuale (registri tu le sei linee partendo dalle tue monete). Il risultato e l’interpretazione sono uguali nei due modi.",
    yarrowPracticalHeading: "Stecche di achillea",
    yarrowPracticalBody:
      "È il metodo rituale e pausato dell’I Ching, il più antico. L’app lo offre in modalità manuale: dopo il lancio con le tue stecche o un supporto equivalente, registri linea per linea per costruire l’esagramma. Pensato per chi vuole mantenere il ritmo contemplativo della pratica classica.",
    bonesPracticalHeading: "Ossa dell’oracolo",
    bonesPracticalBody:
      "Domanda breve, risposta breve. Sempre in automatico: il sistema genera il pattern di crepe e il verdetto, e l’IA lo articola nella tua lingua. Utile per conferme puntuali o quando cerchi chiarezza diretta più che un’analisi lunga.",
    ichingCastModeHeading: "I Ching: lancio automatico o manuale",
    ichingCastModeP1:
      "Con I Ching attivo in Opzioni puoi scegliere la modalità di lancio. In entrambi i casi il server applica le stesse regole di Zhu Xi e lo stesso corpus; cambia solo chi fornisce le sei linee prima dell’interpretazione.",
    ichingCastAutoLi:
      "Automatico: all’invio il rituale anima il tracciato e le sei linee sono generate sul server.",
    ichingCastManualLi:
      "Manuale: si apre un assistente per registrare le sei linee dal basso. Con Tre Monete inserisci testa/croce per linea; con Stecche registri il tuo lancio fisico passo dopo passo. Al termine compare un’anteprima dell’esagramma; sei responsabile di riflettere fedelmente il tuo lancio fisico.",
    tokensHeading: "Token, limiti e pack",
    tokensIntro:
      "Ogni consultazione consuma un token. Il saldo è cumulativo: i pack si sommano a ciò che hai già. Ciò che cambia con il pack è la dimensione del saldo e quante letture concatenate stanno nello stesso thread.",
    exportHeading: "Esportare e salvare",
    exportBody:
      "Dal pannello Opzioni puoi, quando vuoi, scaricare l’immagine della lettura e generare un PDF della chat attiva. È facoltativo: serve a tenere una copia sul tuo dispositivo. Il PDF viene creato nel browser; non sostituisce la cronologia nell’app e non obbliga a copie fuori dal servizio.",
    legalMetaBeforePrivacy: "Per i dettagli completi, consulta ",
    legalMetaBetween: " e i ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Primi passi",
    promptLengthHint:
      "Ogni domanda può contenere fino a un massimo di 1500 caratteri, consentendoti di fornire tutto il contesto necessario per una risposta profonda e personalizzata.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  ja: {
    title: "利用ガイド",
    leadPart1: "このアプリでは次の2つのスタイルで占えます：",
    leadPart2: " と ",
    leadPart3:
      "。象徴的な内省と方向づけのためのツールであり、医療・金融などの専門的アドバイスに代わるものではありません。",
    bonesLabel: "甲骨",
    privacyDocsHeading: "プライバシーと関連ドキュメント",
    privacyDocsIntro:
      "これは実用的な要約です。拘束力のある詳細はプライバシーポリシーと利用規約をご参照ください。方式の歴史的背景は方式の注記をご覧ください。",
    privacyHeading: "プライバシー",
    privacyLi1:
      "チャットと画像はアカウントに紐づき、サインイン中にのみアクセスできます。",
    privacyLi2:
      "サービスは、認証されたご本人以外に履歴や相談内容を公開しません。",
    privacyLi3:
      "端末に記録を残す場合は、ご自身の判断で読み取り画像のダウンロードや、オプションから現行スレッドのPDF出力が可能です。これらは端末上で生成され、保管はご自身の責任です。",
    appUseHeading: "アプリの使い方と利用できる機能",
    appUseIntro:
      "手元にある機能：オプションパネル、チャット、新しいセッション、スレッドの深さ、トークン管理、任意の2FA、PDFと画像のエクスポート。",
    chatsHeading: "チャットとセッション",
    chatsLabel: "チャット",
    chatsOpensHistory: "履歴を開きます。",
    newSessionLabel: "新しいセッション",
    newSessionDesc: "新しいトピック用の新しいチャットを始めます。",
    chatsUnlimited: "チャット数に上限はありません。必要なだけ作成できます。",
    packChangesLine:
      "パックによって変わるのは、利用可能なトークン残高と、1スレッドあたり連続して行える相談回数（スレッド上限）です。",
    optionsHeading: "オプション（下部パネル）",
    optionsIntro:
      "オプションでは相談タイプ（I Ching または甲骨）を選び、I Ching では占い方（自動または手動）も選べます。アクティブスレッドの深さ、トークンと2FAの管理、下部のドキュメント・プライバシー・利用規約リンクもここです。",
    libraryFeatureHeading: "六十四卦と原典ライブラリ（プレミアム機能）",
    libraryFeatureBody:
      "当アプリは、Wilhelm/Baynes 訳、James Legge 版、および原典の周易という3つの主要な典拠を用いて、深い内省を可能にするライブラリを備えています。このセクションでは、ご自身の回答や手作りの占い結果を、易経の本格的な研究のために設計された本物の記述と照らし合わせることができます。テキストは、出典の忠実性を完全に保つために元の形式で提供されます。",
    ichingBullet: "卦と爻による読み。",
    bonesBulletSuffix: "亀裂パターンによるイエス／ノー形式の象徴的読み。",
    threadDepthBullet:
      "スレッドの深さ：パックに応じて同一チャットで連続できる読み取り回数（無料プランは最初の読み取り後、同じスレッドでの追問は不可）。",
    translatorOptionsBullet:
      "翻訳者の選択: Wilhelm/Baynes、Zhou Yi、James Legge、またはすべてを組み合わせたマスター(3)モードから選択できます。",
    methodsHeading: "占いの方式の使い分け",
    methodsIntro:
      "易経と甲骨は別の方式です。易経は卦と爻で読み、占い方は二通り（三銭と蓍草）です。甲骨は卦を作らず、独自の流れで進みます。",
    ichingPracticalHeading: "易経",
    ichingPracticalBody:
      "開かれた問いやジレンマ、時間とともに動いていくテーマに向きます。卦と該当する変爻、そして導かれる卦を返します。占いは朱熹の古典規則と原典テキストに従います。",
    coinsPracticalHeading: "三銭",
    coinsPracticalBody:
      "易経をすばやく立てる方法です。自動（アプリが立てる）または手動（自分の銭から六爻を入力）で使えます。結果と解釈はどちらの方式でも同じです。",
    yarrowPracticalHeading: "蓍草",
    yarrowPracticalBody:
      "易経の最も古く、儀式的で落ち着いた方法です。アプリでは手動モードで提供します。自分の蓍草や同等の道具で立てたあと、爻ごとに記録して卦を組み立てます。古典の瞑想的なテンポを保ちたい人に向きます。",
    bonesPracticalHeading: "甲骨",
    bonesPracticalBody:
      "短い問いに短い答え。常に自動で動作します。システムが亀裂のパターンと判定を生成し、AIがあなたの言語で表現します。長い分析より、その場の確認や直接的な明瞭さがほしいときに役立ちます。",
    ichingCastModeHeading: "易経：自動か手動の占い",
    ichingCastModeP1:
      "オプションで易経を選ぶと占い方を選べます。どちらもサーバー側で朱熹の同じルールと同じ本文系を適用します。解釈の前に六爻を誰が確定するかだけが異なります。",
    ichingCastAutoLi:
      "自動：送信すると儀式が卦の展開をアニメーションし、六爻はサーバーで得られます。",
    ichingCastManualLi:
      "手動：補助が開き、下から各爻を入力します。三銭では表裏で各爻を入力し、蓍草では実際の手順に沿って一爻ずつ記録します。完了すると卦のプレビューが表示されます。実際の結果を正確に反映する責任はご自身にあります。",
    tokensHeading: "トークン、上限、パック",
    tokensIntro:
      "1回の相談で1トークンを使います。残高は累積式です。パックを買うと既存の残高に加算されます。パックで変わるのは残高の大きさと、同じスレッド内に収まる連続相談の回数です。",
    exportHeading: "エクスポートと保存",
    exportBody:
      "オプションパネルから、必要に応じて読み取り画像のダウンロードやアクティブチャットのPDF生成ができます。任意です。ブラウザ内でPDFが作成され、アプリ内の履歴を置き換えたり、サービス外への保存を義務付けたりはしません。",
    legalMetaBeforePrivacy: "詳細は次をご確認ください：",
    legalMetaBetween: "および",
    legalMetaAfterTerms: "をご確認ください。",
    gettingStartedHeading: "はじめに",
    promptLengthHint:
      "各質問は最大1500文字まで入力でき、深くパーソナライズされた回答に必要なすべてのコンテキストを提供できます。",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  zh: {
    title: "使用指南",
    leadPart1: "本应用支持两种咨询方式：",
    leadPart2: " 与 ",
    leadPart3:
      "。它是象征性反思与取向的工具，不能替代医疗、财务或其他专业建议。",
    bonesLabel: "甲骨",
    privacyDocsHeading: "隐私与相关文档",
    privacyDocsIntro:
      "这是一份实用摘要。具有约束力的细节请参阅隐私政策与服务条款。如想了解各方法的历史背景，请查看方法说明。",
    privacyHeading: "隐私",
    privacyLi1: "您的聊天记录与图片与账户关联，仅在登录后可访问。",
    privacyLi2: "服务不会在您本人认证访问之外暴露历史或咨询主题。",
    privacyLi3:
      "若要在设备上留存记录，您可自行决定从选项下载解读图、将当前会话导出为 PDF；这些文件在本地生成，由您自行保管。",
    appUseHeading: "应用使用与可用选项",
    appUseIntro:
      "你可以使用：选项面板、聊天、新会话、会话深度、代币管理、可选的双因素认证（2FA）以及 PDF 与图片导出。",
    chatsHeading: "聊天与会话",
    chatsLabel: "聊天",
    chatsOpensHistory: "打开历史记录。",
    newSessionLabel: "新会话",
    newSessionDesc: "开始新聊天以更换主题或从头开始。",
    chatsUnlimited: "聊天数量不设固定上限，可按需创建。",
    packChangesLine:
      "随套餐变化的是可用代币余额以及同一会话中可连续进行的咨询次数（每会话上限）。",
    optionsHeading: "选项（底部栏）",
    optionsIntro:
      "在选项中选择咨询类型（I Ching 或甲骨）；选易经时还可选择起卦方式（自动或手动），查看当前会话允许的深度、管理代币与双因素认证，底部有文档、隐私政策与服务条款链接。",
    libraryFeatureHeading: "卦象与著作资料库（高级功能）",
    libraryFeatureBody:
      "我们提供一个资料库，您可以使用该作品的三大主要来源进行深度查询：经典的卫礼贤/贝恩斯译本、理雅各（James Legge）版本以及《周易》古经。该板块允许您将自己的解答或手动起卦与旨在进行严肃易经研究的正宗著作进行对比。文本以其原始格式呈现，以保持来源的绝对忠实度。",
    ichingBullet: "基于卦象与爻辞的解读。",
    bonesBulletSuffix: "以裂纹图案进行的是／否象征性解读。",
    threadDepthBullet:
      "会话深度：根据套餐，同一聊天中可连续解读的次数（免费计划在首次解读后不允许在同一会话中继续追问）。",
    translatorOptionsBullet:
      "译本选择：您可以选择卫礼贤/贝恩斯、原始周易、理雅各，或将三者结合为单一回答的大师 (3) 模式。",
    methodsHeading: "如何使用各方法",
    methodsIntro:
      "易经和甲骨是两种不同的方法。易经按卦象与爻辞解读，并有两种起卦方式：三钱与蓍草。甲骨自成体系，不形成卦象。",
    ichingPracticalHeading: "易经",
    ichingPracticalBody:
      "适合开放性问题、两难抉择以及随时间展开的过程。返回一个本卦、相应的变爻以及之卦（若有）。解读遵循朱熹的古典规则与原典文本。",
    coinsPracticalHeading: "三钱",
    coinsPracticalBody:
      "起易经最快捷的方式。可在自动模式下使用（由应用代为投掷），也可在手动模式下使用（你根据自己的实物投掷输入六爻）。两种模式的结果与解读相同。",
    yarrowPracticalHeading: "蓍草",
    yarrowPracticalBody:
      "易经最古老、最具仪式感的从容方法。应用以手动模式提供：你用自己的蓍草或对应器具完成投掷之后，逐爻输入构成卦象。适合希望保留古典实践沉静节奏的人。",
    bonesPracticalHeading: "甲骨",
    bonesPracticalBody:
      "问题简短，回答简短。始终为自动模式：系统生成裂纹形态与判词，AI 用你的语言加以表达。适合就事论事的确认，或希望直接获得清晰指向而非长篇分析的场合。",
    ichingCastModeHeading: "易经：自动起卦或手动起卦",
    ichingCastModeP1:
      "在选项中选择易经后，可选择起卦方式。两种方式服务器都应用相同的朱熹规则与同一套文本；差别仅在于六爻由谁确定。",
    ichingCastAutoLi: "自动：发送咨询后会有仪式动画，六爻由服务器生成。",
    ichingCastManualLi:
      "手动：打开助手自下而上逐爻输入。三钱法时输入字/背；蓍草时按你的实际操作逐爻记录。六爻完成后显示卦象预览，直到解读返回。请确保输入与您实际操作一致。",
    tokensHeading: "代币、上限与套餐",
    tokensIntro:
      "每次咨询消耗 1 枚代币。余额是累积的：购买套餐会在原有余额上累加。随套餐变化的是余额规模以及在同一会话中可连续进行的解读次数。",
    exportHeading: "导出与保存",
    exportBody:
      "在选项面板中，您可随时下载解读图并生成当前聊天的 PDF。此为可选操作，用于在自有设备上保存副本。PDF 在浏览器中生成，不替代应用内历史，也不要求在服务外保留副本。",
    legalMetaBeforePrivacy: "完整说明请参阅",
    legalMetaBetween: "以及",
    legalMetaAfterTerms: "。",
    gettingStartedHeading: "快速入门",
    promptLengthHint:
      "每个问题最多可包含 1500 个字符，让您可以提供深入且个性化回答所需的所有背景信息。",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  ko: {
    title: "사용 안내",
    leadPart1: "이 앱에서는 두 가지 방식으로 점칠 수 있습니다: ",
    leadPart2: " 및 ",
    leadPart3:
      ". 상징적 성찰과 방향 제시를 위한 도구이며 의료·재무 등 전문 조언을 대체하지 않습니다.",
    bonesLabel: "갑골",
    privacyDocsHeading: "개인정보와 관련 문서",
    privacyDocsIntro:
      "실용적 요약입니다. 구속력 있는 자세한 내용은 개인정보 처리방침과 서비스 약관을 참조하세요. 각 방법의 역사적 배경이 궁금하다면 방법 노트를 확인하세요.",
    privacyHeading: "개인정보",
    privacyLi1:
      "채팅과 이미지는 계정에 연결되며 로그인한 상태에서만 접근할 수 있습니다.",
    privacyLi2:
      "서비스는 본인의 인증된 접근 밖에서 기록이나 상담 주제를 노출하지 않습니다.",
    privacyLi3:
      "기기에 기록을 남기려면, 본인 판단으로 해석 이미지를 내려받거나 옵션에서 현재 스레드를 PDF로보낼 수 있습니다. 해당 파일은 기기에서 생성되며 보관 책임은 사용자에게 있습니다.",
    appUseHeading: "앱 사용과 사용 가능한 옵션",
    appUseIntro:
      "손쉽게 쓸 수 있는 기능들입니다: 옵션 패널, 채팅, 새 세션, 스레드 깊이, 토큰 관리, 선택적 2FA, PDF와 이미지 내보내기.",
    chatsHeading: "채팅과 세션",
    chatsLabel: "채팅",
    chatsOpensHistory: "기록을 엽니다.",
    newSessionLabel: "새 세션",
    newSessionDesc: "새 주제를 위해 새 채팅을 시작합니다.",
    chatsUnlimited:
      "채팅 개수에 고정 상한이 없으며 필요한 만큼 만들 수 있습니다.",
    packChangesLine:
      "팩에 따라 달라지는 것은 사용 가능한 토큰 잔액과 한 스레드에서 연속 상담 가능 횟수(스레드당 한도)입니다.",
    optionsHeading: "옵션(하단 패널)",
    optionsIntro:
      "옵션에서 상담 유형(I Ching 또는 갑골)을 고르고, I Ching일 때는 점 방식(자동 또는 수동)도 고릅니다. 활성 스레드 허용 깊이, 토큰 및 2FA 관리, 하단의 문서·개인정보·약관 링크도 여기 있습니다.",
    libraryFeatureHeading: "헥사그램 및 문헌 라이브러리 (프리미엄 기능)",
    libraryFeatureBody:
      "저희는 이 저작의 세 가지 주요 출처인 빌헬름/베인즈 번역, 제임스 레그 버전, 그리고 원전 주역을 사용하여 심층적인 조회를 수행할 수 있는 라이브러리를 제공합니다. 이 섹션에서는 진지한 주역 공부를 위해 고안된 정통 문헌과 본인의 답변 또는 수동 점괘를 대조할 수 있습니다. 텍스트는 출처의 절대적인 충실도를 유지하기 위해 원문 형식으로 제공됩니다.",
    ichingBullet: "괘와 효(爻)에 따른 해석.",
    bonesBulletSuffix: "균열 패턴을 사용한 예/아니오 형식의 상징적 해석.",
    threadDepthBullet:
      "스레드 깊이: 팩에 따라 같은 채팅에서 연속 해석 가능 횟수(무료 플랜은 첫 해석 후 같은 스레드에서 추가 질문 불가).",
    translatorOptionsBullet:
      "번역본 선택: 빌헬름/베인스, 원전 주역, 제임스 레게 중 하나를 선택하거나 모든 버전을 하나의 답변으로 결합하는 마스터(3) 모드를 선택할 수 있습니다.",
    methodsHeading: "방법별 사용법",
    methodsIntro:
      "역경과 갑골은 서로 다른 방법입니다. 역경은 괘와 효로 풀이하며 점치는 방식이 두 가지(삼전과 시초)입니다. 갑골은 괘를 만들지 않고 독자적인 흐름을 따릅니다.",
    ichingPracticalHeading: "역경",
    ichingPracticalBody:
      "열린 질문, 딜레마, 시간 속에서 펼쳐지는 흐름에 적합합니다. 본괘와 해당하는 동효, 그리고 지괘가 있다면 함께 돌려줍니다. 풀이는 주희의 고전 규칙과 원전 텍스트를 따릅니다.",
    coinsPracticalHeading: "삼전(三錢)",
    coinsPracticalBody:
      "역경을 빠르게 세우는 방법입니다. 자동(앱이 대신 던짐)과 수동(직접 동전을 던지고 여섯 효를 입력) 양쪽으로 쓸 수 있습니다. 결과와 풀이는 두 방식 모두 동일합니다.",
    yarrowPracticalHeading: "시초(蓍草)",
    yarrowPracticalBody:
      "역경에서 가장 오래되고 의례적이며 차분한 방법입니다. 앱에서는 수동 모드로 제공합니다. 직접 시초나 그에 상응하는 도구로 점친 뒤 한 효씩 입력해 괘를 세웁니다. 고전 수련의 명상적 호흡을 지키고 싶은 분께 적합합니다.",
    bonesPracticalHeading: "갑골",
    bonesPracticalBody:
      "짧은 질문에 짧은 답. 항상 자동으로 작동합니다. 시스템이 균열 패턴과 판정을 만들고 AI가 당신의 언어로 표현합니다. 긴 분석보다 즉시 확인이나 분명한 방향이 필요할 때 유용합니다.",
    ichingCastModeHeading: "역경: 자동 또는 수동 점",
    ichingCastModeP1:
      "옵션에서 역경을 선택하면 점 방식을 고를 수 있습니다. 두 경우 모두 서버는 동일한 주희 규칙과 동일한 텍스트 체계를 적용합니다. 해석 전 여섯 효를 누가 확정하느냐만 다릅니다.",
    ichingCastAutoLi:
      "자동: 전송하면 의식 애니메이션이 재생되고 여섯 효는 서버에서 생성됩니다.",
    ichingCastManualLi:
      "수동: 도우미에서 아래에서 위로 효를 입력합니다. 동전을 쓸 때는 앞/뒤를 입력하고, 시초를 쓸 때는 직접 점친 절차를 한 효씩 따라 기록합니다. 여섯 효가 끝나면 해석이 올 때까지 괘 미리보기가 표시됩니다. 실제 결과를 정확히 반영할 책임은 사용자에게 있습니다.",
    tokensHeading: "토큰, 한도, 팩",
    tokensIntro:
      "상담 1회마다 토큰 1개를 사용합니다. 잔액은 누적식입니다. 팩을 구매하면 기존 잔액에 더해집니다. 팩에 따라 달라지는 것은 잔액의 크기와 한 스레드에 들어가는 연속 풀이의 수입니다.",
    exportHeading: "보내기 및 저장",
    exportBody:
      "옵션 패널에서 해석 이미지를 내려받고 활성 채팅을 PDF로 만들 수 있습니다. 선택 사항이며 기기에 사본을 보관하기 위함입니다. PDF는 브라우저에서 생성되며 앱 내 기록을 대체하지 않고 서비스 밖 보관을 강제하지 않습니다.",
    legalMetaBeforePrivacy: "자세한 내용은 다음을 확인하세요: ",
    legalMetaBetween: " 및 ",
    legalMetaAfterTerms: "을(를) 확인하세요.",
    gettingStartedHeading: "시작하기",
    promptLengthHint:
      "각 질문은 최대 1500자까지 포함될 수 있으므로 깊고 개인화된 답변에 필요한 모든 맥락을 제공할 수 있습니다.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  ar: {
    title: "دليل المستخدم",
    leadPart1: "يتيح هذا التطبيق الاستشارة بأسلوبين: ",
    leadPart2: " و ",
    leadPart3:
      ". إنه أداة للتأمل والتوجيه الرمزي، ولا يحل محل المشورة الطبية أو المالية أو أي مشورة مهنية أخرى.",
    bonesLabel: "العظام",
    privacyDocsHeading: "الخصوصية والوثائق ذات الصلة",
    privacyDocsIntro:
      "هذا ملخص عملي. للتفاصيل الملزمة، راجع سياسة الخصوصية وشروط الخدمة. وللاطلاع على الخلفية التاريخية للطرق، انظر ملاحظات المنهج.",
    privacyHeading: "الخصوصية",
    privacyLi1:
      "محادثاتك وصورك مرتبطة بحسابك ولا يمكن الوصول إليها إلا عند تسجيل الدخول.",
    privacyLi2:
      "لا تكشف الخدمة عن سجلاتك أو موضوعات استشاراتك خارج نطاق وصولك المصادق عليه.",
    privacyLi3:
      "إذا أردت الاحتفاظ بسجل على جهازك، يمكنك بمحض إرادتك تنزيل صورة القراءة وتصدير الخيط الحالي إلى PDF من خيارات الاستشارة؛ هذه الملفات تُنشأ محليًا وأنت مسؤول عن حفظها.",
    appUseHeading: "استخدام التطبيق والخيارات المتاحة",
    appUseIntro:
      "هذه هي الوظائف التي بين يديك: لوحة الخيارات، المحادثات، جلسة جديدة، عمق الخيط، إدارة الرموز، 2FA الاختياري، وتصدير PDF والصور.",
    chatsHeading: "المحادثات والجلسات",
    chatsLabel: "المحادثات",
    chatsOpensHistory: "يفتح سجلك.",
    newSessionLabel: "جلسة جديدة",
    newSessionDesc: "يبدأ محادثة جديدة لموضوع مختلف.",
    chatsUnlimited: "لا يوجد عدد ثابت للمحادثات: أنشئ ما تحتاجه.",
    packChangesLine:
      "ما يتغير بحسب حزمتك هو رصيد الرموز المتاح وعدد الاستشارات المتسلسلة المسموح بها في خيط واحد (الحد لكل خيط).",
    optionsHeading: "الخيارات (اللوحة السفلية)",
    optionsIntro:
      "في الخيارات تختار نوع الاستشارة (I Ching أو العظام)، ومع I Ching تختار أيضًا وضع القَسْم (تلقائي أو يدوي)، وترى العمق المسموح به في الخيط النشط، وتدير الرموز و2FA، وفي الأسفل روابط للوثائق والخصوصية والشروط.",
    libraryFeatureHeading: "مكتبة الرسوم السداسية والمؤلفات (ميزة متميزة)",
    libraryFeatureBody:
      "نقدم لك مكتبة يمكنك من خلالها إجراء استشارات عميقة باستخدام المصادر الثلاثة الرئيسية للعمل: ترجمة فيلهلم/باينز الكلاسيكية، ونسخة جيمس ليغ، وجو يي الأصلي. يتيح لك هذا القسم مقارنة إجاباتك أو قراءاتك اليدوية مع الكتابات الأصلية المصممة للدراسة الجادة لـ I Ching. تُعرض النصوص بتنسيقها الأصلي للحفاظ على الدقة المطلقة للمصادر.",
    ichingBullet: "قراءة بالهكساغرام والخطوط.",
    bonesBulletSuffix: "تنسيق نعم/لا مع قراءة رمزية للشقوق.",
    threadDepthBullet:
      "عمق الخيط: عدد القراءات المتسلسلة الممكنة في نفس المحادثة حسب حزمتك (الخطة المجانية لا تتيح أسئلة متابعة في نفس الخيط بعد القراءة الأولى).",
    translatorOptionsBullet:
      "اختيار المترجم: يمكنك الاختيار بين Wilhelm/Baynes، أو Zhou Yi، أو James Legge، أو وضع Master (3) الذي يجمع الكل في إجابة واحدة.",
    methodsHeading: "كيف تستخدم كل طريقة",
    methodsIntro:
      "I Ching والعظام طريقتان مختلفتان. يقرأ I Ching وفق الهكساغرام والخطوط ويتيح أسلوبين للقَسْم: ثلاث عملات وعيدان الزنبق. تتبع العظام مخططها الخاص بدون هكساغرام.",
    ichingPracticalHeading: "I Ching",
    ichingPracticalBody:
      "مناسب للأسئلة المفتوحة، والمآزق، والمسارات التي تنكشف عبر الزمن. يعيد هكساغرامًا، والخطوط المتحركة المنطبقة، والهكساغرام الناتج إن وُجد. يتبع التفسير قواعد زو شي الكلاسيكية والنصوص الأصلية للكتاب.",
    coinsPracticalHeading: "الثلاث عملات",
    coinsPracticalBody:
      "الطريقة السريعة لقَسْم I Ching. تعمل تلقائيًا (يقوم التطبيق بالقَسْم) أو يدويًا (تُدخل الخطوط الستة من رميتك الحقيقية). النتيجة والتفسير متطابقتان في الحالتين.",
    yarrowPracticalHeading: "عيدان الزنبق",
    yarrowPracticalBody:
      "أقدم وأطقس وأبطأ طرق I Ching. يقدمها التطبيق في الوضع اليدوي: بعد إجراء القَسْم بعيدانك الخاصة أو أداة معادلة، تُدخل خطًا تلو الآخر لبناء الهكساغرام. تناسب من يريد الحفاظ على إيقاع التأمل في الممارسة الكلاسيكية.",
    bonesPracticalHeading: "عظام العَرَافة",
    bonesPracticalBody:
      "سؤال موجز، إجابة موجزة. تعمل دائمًا تلقائيًا: يولّد النظام نمط الشقوق والحكم، ويعبر عنه الذكاء الاصطناعي بلغتك. مفيدة للتأكيدات السريعة أو حين تطلب وضوحًا مباشرًا بدلاً من تحليل مطوّل.",
    ichingCastModeHeading: "I Ching: قَسْم تلقائي أو يدوي",
    ichingCastModeP1:
      "عند اختيار I Ching في الخيارات يمكنك اختيار أسلوب القَسْم. في الحالتين يطبق الخادم نفس قواعد زو شي ونفس المرجع النصي؛ يتغيّر فقط من يثبت الخطوط الستة قبل التفسير.",
    ichingCastAutoLi:
      "تلقائي: عند الإرسال يعرض الطقس الحركة وتُولَّد الخطوط الستة على الخادم.",
    ichingCastManualLi:
      "يدوي: يفتح مساعد لتسجيل الخطوط الستة من الأسفل إلى الأعلى. مع ثلاث عملات أدخل الوجه/الكتابة لكل خط؛ مع العيدان سجِّل قَسْمك الفعلي خطوة بخطوة لكل خط. بعد اكتمال الخطوط الستة تظهر معاينة للهكساغرام؛ أنت مسؤول عن عكس قَسْمك الفعلي بدقة.",
    tokensHeading: "الرموز والحدود والحزم",
    tokensIntro:
      "تستهلك كل استشارة رمزًا واحدًا. الرصيد تراكمي: تُضاف الحزم إلى رصيدك الحالي. ما يتغير حسب حزمتك هو حجم الرصيد وعدد القراءات المتسلسلة الممكنة في الخيط نفسه.",
    exportHeading: "التصدير والحفظ",
    exportBody:
      "من لوحة الخيارات يمكنك متى شئت تنزيل صورة القراءة وإنشاء PDF للمحادثة النشطة. هذا اختياري ويُستخدم للاحتفاظ بنسخة على جهازك. يُنشأ PDF في المتصفح ولا يحل محل السجل داخل التطبيق.",
    legalMetaBeforePrivacy: "للتفاصيل الكاملة، راجع ",
    legalMetaBetween: " و ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "البدء",
    promptLengthHint:
      "يمكن أن يحتوي كل سؤال على ما يصل إلى 1500 حرف كحد أقصى، مما يتيح لك تقديم كل السياق اللازم لاستجابة عميقة وشخصية.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
  hi: {
    title: "उपयोगकर्ता मार्गदर्शिका",
    leadPart1: "यह ऐप दो परामर्श शैलियों में उपलब्ध है: ",
    leadPart2: " और ",
    leadPart3:
      "। यह प्रतीकात्मक चिंतन और मार्गदर्शन का उपकरण है। यह चिकित्सा, वित्तीय या किसी अन्य पेशेवर सलाह का विकल्प नहीं है।",
    bonesLabel: "हड्डियाँ",
    privacyDocsHeading: "गोपनीयता और संबंधित दस्तावेज़",
    privacyDocsIntro:
      "यह एक व्यावहारिक सारांश है। बाध्यकारी विवरण के लिए गोपनीयता नीति और सेवा शर्तें देखें। विधियों की ऐतिहासिक पृष्ठभूमि के लिए विधि नोट्स देखें।",
    privacyHeading: "गोपनीयता",
    privacyLi1:
      "आपकी चैट और छवियाँ आपके खाते से जुड़ी हैं और केवल लॉग इन रहने पर ही पहुँच योग्य हैं।",
    privacyLi2:
      "सेवा आपके इतिहास या परामर्श विषयों को आपके प्रमाणित पहुँच के बाहर उजागर नहीं करती।",
    privacyLi3:
      "यदि आप अपने डिवाइस पर रिकॉर्ड रखना चाहते हैं, तो आप अपने विवेक से पठन छवि डाउनलोड कर सकते हैं और विकल्प से वर्तमान थ्रेड को PDF में निर्यात कर सकते हैं; वे फ़ाइलें स्थानीय रूप से बनती हैं और उनकी देखभाल आपकी जिम्मेदारी है।",
    appUseHeading: "ऐप का उपयोग और उपलब्ध विकल्प",
    appUseIntro:
      "आपके पास ये सुविधाएँ हैं: विकल्प पैनल, चैट, नया सत्र, थ्रेड गहराई, टोकन प्रबंधन, वैकल्पिक 2FA, और PDF व छवि निर्यात।",
    chatsHeading: "चैट और सत्र",
    chatsLabel: "चैट",
    chatsOpensHistory: "आपका इतिहास खोलता है।",
    newSessionLabel: "नया सत्र",
    newSessionDesc: "नए विषय के लिए नई चैट शुरू करता है।",
    chatsUnlimited:
      "चैट की कोई निश्चित संख्या नहीं है: जितनी जरूरत हो उतनी बनाएं।",
    packChangesLine:
      "आपके पैक के साथ जो बदलता है वह है उपलब्ध टोकन शेष और एक थ्रेड में कितने अनुवर्ती परामर्श हो सकते हैं (प्रति थ्रेड सीमा)।",
    optionsHeading: "विकल्प (नीचे का पैनल)",
    optionsIntro:
      "विकल्प में आप परामर्श प्रकार (I Ching या हड्डियाँ) चुनते हैं; I Ching के साथ कास्ट मोड (स्वचालित या मैन्युअल) भी, सक्रिय थ्रेड की अनुमत गहराई, टोकन और 2FA प्रबंधित करते हैं, और नीचे दस्तावेज़ीकरण, गोपनीयता और शर्तों के लिंक होते हैं।",
    libraryFeatureHeading: "हेक्साग्राम और ग्रंथ पुस्तकालय (प्रीमियम विकल्प)",
    libraryFeatureBody:
      "हमारे पास एक पुस्तकालय है जहाँ आप कार्य के तीन मुख्य स्रोतों का उपयोग करके गहन परामर्श कर सकते हैं: विल्हेल्म/बेंस का शास्त्रीय अनुवाद, जेम्स लेग संस्करण, और मूल झोउ यी। यह अनुभाग आपको अपने उत्तरों या मैन्युअल कास्ट की तुलना गंभीर I Ching अध्ययन के लिए डिज़ाइन किए गए प्रामाणिक लेखों से करने की अनुमति देता है। स्रोतों की पूर्ण प्रामाणिकता बनाए रखने के लिए लेखों को उनके मूल प्रारूप में प्रस्तुत किया गया है।",
    ichingBullet: "हेक्साग्राम और रेखा-आधारित पठन।",
    bonesBulletSuffix: "प्रतीकात्मक दरार पठन के साथ हाँ/नहीं प्रारूप।",
    threadDepthBullet:
      "थ्रेड गहराई: आपके पैक के अनुसार एक चैट में कितने श्रृंखलाबद्ध पठन हो सकते हैं (निःशुल्क योजना पहले पठन के बाद उसी थ्रेड में अनुवर्ती प्रश्नों की अनुमति नहीं देती)।",
    translatorOptionsBullet:
      "अनुवादक का विकल्प: आप विल्हेम/बेन्स, झोउ यी, जेम्स लेग या मास्टर (3) मोड के बीच चयन कर सकते हैं जो सभी को एक उत्तर में जोड़ता है.",
    methodsHeading: "विधियों का उपयोग कैसे करें",
    methodsIntro:
      "I Ching और हड्डियाँ अलग विधियाँ हैं। I Ching हेक्साग्राम और रेखाओं के माध्यम से पढ़ता है और दो कास्टिंग मोड प्रदान करता है: तीन सिक्के और यारो छड़ें। हड्डियाँ अपनी अलग प्रणाली से चलती हैं, हेक्साग्राम के बिना।",
    ichingPracticalHeading: "I Ching",
    ichingPracticalBody:
      "खुले प्रश्नों, द्वंद्वों और समय में खुलने वाली प्रक्रियाओं के लिए उपयोगी। यह एक हेक्साग्राम, लागू होने वाली परिवर्तित रेखाएँ और परिणामी हेक्साग्राम (यदि कोई हो) लौटाता है। पठन झू शी के शास्त्रीय नियमों और पुस्तक के प्रामाणिक पाठों का अनुसरण करता है।",
    coinsPracticalHeading: "तीन सिक्के",
    coinsPracticalBody:
      "I Ching डालने का त्वरित तरीका। यह स्वचालित मोड में (ऐप कास्ट करता है) या मैन्युअल मोड में (आप अपने वास्तविक सिक्कों से छह रेखाएँ दर्ज करते हैं) चलता है। दोनों मोड में परिणाम और व्याख्या समान होते हैं।",
    yarrowPracticalHeading: "यारो की छड़ें",
    yarrowPracticalBody:
      "I Ching की सबसे पुरानी, अनुष्ठानिक और धीमी विधि। ऐप इसे मैन्युअल मोड में देता है: अपनी यारो छड़ों या समकक्ष माध्यम से कास्ट करने के बाद, आप एक-एक रेखा दर्ज करके हेक्साग्राम बनाते हैं। यह उन लोगों के लिए है जो शास्त्रीय अभ्यास की चिंतनशील गति बनाए रखना चाहते हैं।",
    bonesPracticalHeading: "ओरेकल हड्डियाँ",
    bonesPracticalBody:
      "छोटा प्रश्न, छोटा उत्तर। हमेशा स्वचालित रूप से चलती है: सिस्टम दरार पैटर्न और निर्णय बनाता है, और AI इसे आपकी भाषा में व्यक्त करती है। त्वरित पुष्टि या सीधे स्पष्टता के लिए उपयोगी, लंबे विश्लेषण के बजाय।",
    ichingCastModeHeading: "I Ching: स्वचालित या मैन्युअल कास्ट",
    ichingCastModeP1:
      "विकल्पों में I Ching चुनने पर आप कास्ट मोड चुन सकते हैं। दोनों स्थितियों में सर्वर समान झू शी नियम और समान पाठ आधार लागू करता है; केवल यह बदलता है कि व्याख्या से पहले छह रेखाएँ कौन तय करता है।",
    ichingCastAutoLi:
      "स्वचालित: भेजने पर अनुष्ठान चित्रण चलाता है और छह रेखाएँ सर्वर पर बनती हैं।",
    ichingCastManualLi:
      "मैन्युअल: सहायक खुलता है ताकि नीचे से ऊपर रेखाएँ दर्ज कर सकें। तीन सिक्कों के साथ प्रति रेखा चित/पट दर्ज करें; यारो छड़ों के साथ अपनी वास्तविक कास्ट को चरण-दर-चरण रिकॉर्ड करें। छह रेखाओं के बाद हेक्साग्राम पूर्वावलोकन दिखता है; अपने भौतिक फेंक को सटीक दर्शाना आपकी जिम्मेदारी है।",
    tokensHeading: "टोकन, सीमाएँ और पैक",
    tokensIntro:
      "हर परामर्श पर एक टोकन खर्च होता है। शेष राशि संचयी है: पैक आपकी मौजूदा शेष राशि में जुड़ते हैं। पैक के अनुसार जो बदलता है वह है शेष राशि का आकार और एक ही थ्रेड में कितने श्रृंखलाबद्ध पठन समाते हैं।",
    exportHeading: "निर्यात और सहेजना",
    exportBody:
      "विकल्प पैनल से आप जब चाहें पठन छवि डाउनलोड कर सकते हैं और सक्रिय चैट का PDF बना सकते हैं। यह वैकल्पिक है और अपने डिवाइस पर प्रति रखने के लिए है। PDF ब्राउज़र में बनता है; यह ऐप इतिहास को प्रतिस्थापित नहीं करता।",
    legalMetaBeforePrivacy: "पूर्ण विवरण के लिए देखें ",
    legalMetaBetween: " और ",
    legalMetaAfterTerms: "।",
    gettingStartedHeading: "शुरुआत करना",
    promptLengthHint:
      "प्रत्येक प्रश्न में अधिकतम 1500 वर्ण हो सकते हैं, जिससे आप एक गहरी और व्यक्तिगत प्रतिक्रिया के लिए सभी आवश्यक संदर्भ प्रदान कर सकते हैं।",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
    s2Heading: "El Panel de Opciones (Centro de Control)",
    s2TranslatorsTitle: "Selector de Traductores",
    s2Translators: "Tu herramienta para elegir el linaje de sabiduría de tu consulta. Los niveles se activan según tu pack actual.",
    s2TokensTitle: "Centro de Tokens",
    s2Tokens: "Gestión de tu saldo acumulable y acceso a la adquisición de nuevos niveles de maestría.",
    s2SecurityTitle: "Seguridad (2FA)",
    s2Security: "Configuración de autenticación de dos factores para proteger la privacidad de tu cuenta.",
    s3Heading: "Sesiones y Mensajes (Gestión de Chats)",
    s3NewSessionTitle: "Nueva Sesión",
    s3NewSession: "Inicia un chat limpio con su propia continuidad temática.",
    s3HistoryTitle: "Historial de Chats",
    s3History: "Acceso a tus consultas previas, interpretaciones e imágenes. Permite revisar o eliminar hilos específicos.",
    translatorsHeading: "Los Pilares de la Sabiduría (Traductores)",
    translatorsWilhelm: "Interpretación psicológica y poética (Nivel Free/Seeker).",
    translatorsLegge: "Enfoque estructural e histórico (Nivel Seeker).",
    translatorsZhouyi: "El texto canónico puro en chino tradicional (Nivel Practitioner).",
    translatorsMaster: "Síntesis magistral personalizada de los tres linajes para un veredicto definitivo (Nivel Master).",
    s5Heading: "Métodos de Lanzamiento",
    s5AutoTitle: "Automático",
    s5Auto: "El sistema genera las líneas mediante el algoritmo ritual en el servidor.",
    s5ManualTitle: "Manual",
    s5Manual: "Asistente interactivo para ingresar tus propias tiradas físicas (Monedas o Varillas).",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",

  },
};

export function getGuiaPageUiMessages(locale: AppLocale): GuiaPageUiMessages {
  return GUIA_PAGE_UI[locale] ?? GUIA_PAGE_UI[DEFAULT_LOCALE];
}
