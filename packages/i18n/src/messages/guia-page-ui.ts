import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type GuiaPageUiMessages = {
  title: string;
  leadPart1: string;
  leadPart2: string;
  leadPart3: string;
  bonesLabel: string;
  privacyHeading: string;
  privacyLi1: string;
  privacyLi2: string;
  privacyLi3: string;
  optionsHeading: string;
  optionsIntro: string;
  libraryFeatureBody: string;
  /** Section: Cómo usar los métodos */
  methodsHeading: string;
  methodsIntro: string;
  /** Brief note on the tradition behind the casting rules (best of both worlds). */
  ichingTraditionNote: string;
  /** Heading for the changing-line reading selector subsection (matches the UI label). */
  lineReadingHeading: string;
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
  translatorsHeading: string;
  translatorsWilhelm: string;
  translatorsLegge: string;
  translatorsZhouyi: string;
  translatorsMaster: string;

  s1Heading: string;
  s1Iching: string;
  s1Bones: string;
  s3Heading: string;
  s3NewSessionTitle: string;
  s3NewSession: string;
  s3HistoryTitle: string;
  s3History: string;
  s6Heading: string;
  s6LibraryTitle: string;
  s6Library: string;
  s6DocsTitle: string;
  s6Docs: string;
  /** Library detail page: the three translator tabs (Wilhelm/Legge/Zhou Yi). */
  libraryTabsBullet: string;
  /** Library detail page: the "+" classical-commentary disclosure on Wilhelm/Legge. */
  libraryCommentaryBullet: string;
  /** Library detail page: Wen Yen closing note, present only on hexagrams 1 and 2. */
  libraryWenYenBullet: string;
  /** Library index page: search box + upper/lower trigram filter. */
  librarySearchBullet: string;
  /** Library detail page: the six outgoing mutations list. */
  libraryMutationsBullet: string;
  /** Clarifies the commentary is library-only, never sent to the AI during a consultation. */
  libraryCommentaryScopeBullet: string;
};

const GUIA_PAGE_UI: Record<AppLocale, GuiaPageUiMessages> = {
  es: {
    title: "Guía de uso",
    leadPart1: "Esta app te permite consultar en dos estilos: ",
    leadPart2: " y ",
    leadPart3:
      ". Es una herramienta de reflexión y orientación simbólica. No sustituye consejo médico ni financiero ni otro asesoramiento profesional.",
    bonesLabel: "Huesos",
    privacyHeading: "Privacidad",
    privacyLi1:
      "Tus chats e imágenes quedan asociados a tu cuenta y solo son accesibles con tu sesión iniciada.",
    privacyLi2:
      "El servicio no expone tu historial ni tus temas de consulta fuera de tu propio acceso autenticado.",
    privacyLi3:
      "Si quieres conservar un registro en tu dispositivo, bajo tu propia discreción puedes descargar la imagen de una lectura y exportar el hilo actual a PDF desde Opciones; esos archivos se generan localmente y su custodia es tuya.",
    optionsHeading: "Opciones (barra inferior)",
    optionsIntro:
      "En Opciones eliges el tipo de consulta (I Ching o Huesos); con I Ching también el modo de tirada (automática o manual), ves la profundidad permitida en el hilo activo, gestionas tokens y 2FA, y al final tienes enlaces a documentación, privacidad y términos.",
    libraryFeatureBody:
      "Contamos con una biblioteca que incluye la colección completa de los 64 hexagramas utilizando las tres fuentes principales de la obra: la traducción clásica de Wilhelm (1924), la versión de James Legge y el texto original Zhou Yi (chino). Esta sección permite contrastar tus respuestas o tiradas manuales con los escritos auténticos, diseñados para el estudio serio del I Ching. Los textos se presentan en su formato original para preservar la fidelidad absoluta de las fuentes.",
    methodsHeading: "Cómo usar los métodos",
    methodsIntro:
      "El I Ching y los Huesos son métodos distintos. El I Ching trabaja por hexagrama y líneas, e incluye dos formas de tirada: Tres Monedas y Varillas de milenrama. Los Huesos siguen un esquema separado, sin hexagramas.",
    ichingTraditionNote:
      "Por defecto, la app implementa el sistema de reducción a una sola línea de Alfred Huang, con la estructura clásica de Zhu Xi como antecedente. Desde Opciones puedes activar el selector «Lectura de líneas cambiantes» para usar en su lugar la lectura clásica de Zhu Xi; en cualquiera de los dos casos, cada combinación de líneas produce siempre un único texto guía preciso.",
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
      "Con I Ching activo en Opciones puedes elegir el modo de tirada. En ambos casos el servidor aplica las mismas reglas de selección de línea y el mismo corpus; solo cambia quién fija las seis líneas antes de la interpretación.",
    ichingCastAutoLi:
      "Automática: al enviar la consulta, el ritual anima el trazado y las seis líneas se obtienen en el servidor.",
    ichingCastManualLi:
      "Manual: se abre un asistente para registrar las seis líneas de abajo arriba. Con Tres Monedas introduces cara/cruz por línea; con Varillas registras tu tirada física paso a paso. Al terminar verás una vista previa del hexagrama; la responsabilidad de reflejar bien tu tirada es tuya.",
    tokensHeading: "Tokens, límites y packs",
    tokensIntro:
      "Cada consulta consume un token. El saldo es acumulable: los packs se suman a lo que ya tienes. Lo que cambia con tu pack es el tamaño del saldo y cuántas lecturas encadenadas caben en un mismo hilo. La síntesis Master (3) consume 2 tokens por consulta.",
    exportHeading: "Exportar y guardar",
    exportBody:
      "Desde el panel Opciones puedes, cuando lo decidas, descargar la imagen de la lectura y generar un PDF del chat activo. Es opcional: sirve para guardar una copia en tu propio equipo o dispositivo. El archivo PDF se crea en el navegador; no sustituye el historial en la app ni obliga a conservar copias fuera del servicio. El PDF incluye el traductor y el sistema de lectura de líneas usados en esa consulta.",
    s1Heading: "Modos de Consulta (Selector Principal)",
    s1Iching: "Lectura por hexagramas y líneas mutantes para reflexión profunda y preguntas abiertas.",
    s1Bones: "Lectura de sí/no basada en patrones de grietas para validar decisiones y dirección inmediata.",
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
    lineReadingHeading: "Lectura de líneas cambiantes",
    s6Heading: "Biblioteca y Documentación",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta directa de los 64 hexagramas y obras.",
    s6DocsTitle: "Documentación",
    s6Docs: "Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.",
    libraryTabsBullet:
      "Cada página de hexagrama tiene tres pestañas: Wilhelm (1924), James Legge y el texto original Zhou Yi en chino clásico.",
    libraryCommentaryBullet:
      "Las pestañas de Wilhelm y Legge añaden un comentario clásico opcional, mostrado como un pequeño \"+\" junto al Juicio, la Imagen y cada línea. Despliega las notas propias del traductor (el comentario de Wilhelm más las Diez Alas confucianas; las notas de Legge más su Gran y Menor Simbolismo) sin alterar el texto del oráculo.",
    libraryWenYenBullet:
      "Los hexagramas 1 y 2 incluyen una nota de cierre adicional, Wen Yen (\"Palabras sobre el Texto\"), presente solo en estos dos hexagramas en la edición fuente de Wilhelm.",
    librarySearchBullet:
      "Usa el buscador para encontrar un hexagrama por número, nombre en inglés o pinyin, o filtra la lista por su trigrama superior o inferior.",
    libraryMutationsBullet:
      "Cada página de hexagrama lista sus seis mutaciones posibles: qué hexagrama resulta al cambiar una línea concreta, para que puedas explorar la red de hexagramas relacionados.",
    libraryCommentaryScopeBullet:
      "Este comentario clásico es solo para estudio dentro de la Biblioteca. Nunca se envía a la IA durante una consulta en vivo.",

  },
  en: {
    title: "User guide",
    leadPart1: "This app offers two consultation styles: ",
    leadPart2: " and ",
    leadPart3:
      ". It is a symbolic reflection tool and should not replace medical, financial, or other professional advice.",
    bonesLabel: "Bones",
    privacyHeading: "Privacy",
    privacyLi1:
      "Your chats and images are tied to your account and are only accessible while you are signed in.",
    privacyLi2:
      "The service does not expose your history or consultation topics outside your own authenticated access.",
    privacyLi3:
      "If you want a record on your device, you may, at your sole discretion, download a reading image and export the current thread to PDF from Options; those files are generated locally on your device and you are responsible for keeping them.",
    optionsHeading: "Options (bottom panel)",
    optionsIntro:
      "In Options you pick the consultation type (I Ching or Bones); with I Ching you also pick the cast mode (automatic or manual), see allowed depth for the active thread, manage tokens and 2FA, and find links to documentation, privacy, and terms at the bottom.",
    libraryFeatureBody:
      "We offer a library that includes the complete collection of the 64 hexagrams using the three main sources of the work: the classical translation by Wilhelm (1924), the version by James Legge, and the original Zhou Yi (Chinese) text. This section allows you to compare your answers or manual casts with the authentic writings, designed for the serious study of the I Ching. The texts are presented in their original format to preserve the absolute fidelity of the sources.",
    methodsHeading: "How to use the methods",
    methodsIntro:
      "I Ching and Bones are different methods. I Ching reads by hexagram and lines and offers two casting modes: Three Coins and Yarrow Stalks. Bones follow a separate scheme, without hexagrams.",
    ichingTraditionNote:
      "By default, the app implements Alfred Huang's single-line reduction system, with Zhu Xi's classical structure as its antecedent. From Options you can enable the Changing-line reading selector to use Zhu Xi's classical reading instead; either way, every combination of changing lines always yields a single, precise guiding text.",
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
      "With I Ching selected in Options you can pick the cast mode. In both cases the server applies the same classical line-selection rules and the same text base; only who supplies the six lines before interpretation changes.",
    ichingCastAutoLi:
      "Automatic: when you send the consultation, the ritual animates the pattern and the six lines are generated on the server.",
    ichingCastManualLi:
      "Manual: an assistant opens for you to record the six lines bottom to top. With Three Coins, enter heads/tails per line; with Yarrow Stalks, record your physical cast step by step. After all six lines you will see a hexagram preview; you are responsible for accurately reflecting your physical throw.",
    tokensHeading: "Tokens, limits, and packs",
    tokensIntro:
      "Each consultation consumes one token. Balance is cumulative: every pack adds to whatever you already have. What changes with your pack is the balance size and how many chained readings fit in the same thread. The Master (3) synthesis consumes 2 tokens per consultation.",
    exportHeading: "Export and save",
    exportBody:
      "From the Options panel you may, whenever you choose, download the reading image and generate a PDF of the active chat. This is optional: it is for keeping a copy on your own computer or device. The PDF is built in your browser; it does not replace in-app history and you are not required to keep copies outside the service. The PDF includes the translator and the line-reading system used in that consultation.",
    s1Heading: "Consultation Modes (Main Selector)",
    s1Iching: "Hexagram and changing-line reading for deep reflection and open questions.",
    s1Bones: "Yes/no reading based on crack patterns to validate decisions and immediate direction.",
    s3Heading: "Sessions and Messages (Chat Management)",
    s3NewSessionTitle: "New Session",
    s3NewSession: "Start a clean chat with its own thematic continuity.",
    s3HistoryTitle: "Chat History",
    s3History: "Access your previous consultations, interpretations, and images. Allows reviewing or deleting specific threads.",
    translatorsHeading: "The Pillars of Wisdom (Translators)",
    translatorsWilhelm: "Psychological and poetic interpretation (Free/Seeker level).",
    translatorsLegge: "Structural and historical approach (Seeker level).",
    translatorsZhouyi: "The pure canonical text in classical Chinese (Practitioner level).",
    translatorsMaster: "Customized masterful synthesis of all three lineages for a definitive verdict (Master level).",
    lineReadingHeading: "Changing-line reading",
    s6Heading: "Library and Documentation",
    s6LibraryTitle: "Hexagram Library",
    s6Library: "Direct consultation of all 64 hexagrams and works.",
    s6DocsTitle: "Documentation",
    s6Docs: "User guide · Method notes and origins (I Ching and Bones) · Privacy Policy · Terms of Service · FAQs · About the app.",
    libraryTabsBullet:
      "Each hexagram page has three tabs: Wilhelm (1924), James Legge, and the original Zhou Yi text in Classical Chinese.",
    libraryCommentaryBullet:
      "Wilhelm's and Legge's tabs add an optional classical commentary, shown as a small \"+\" next to the Judgment, the Image, and each line. It expands the scholar's own notes (Wilhelm's commentary plus the Confucian Ten Wings; Legge's footnotes plus his Great and Lesser Symbolism) without changing the oracle text itself.",
    libraryWenYenBullet:
      "Hexagrams 1 and 2 include one extra closing note, Wen Yen (\"Words on the Text\"), present only for these two hexagrams in Wilhelm's source edition.",
    librarySearchBullet:
      "Use the search box to find a hexagram by number, English name, or pinyin, or filter the list by its upper or lower trigram.",
    libraryMutationsBullet:
      "Each hexagram page lists its six possible mutations: which hexagram results when one specific line changes, so you can browse the network of related hexagrams.",
    libraryCommentaryScopeBullet:
      "This classical commentary is for study inside the Library only. It is never sent to the AI during a live consultation.",

  },
  pt: {
    title: "Guia de utilização",
    leadPart1: "Esta app permite consultar em dois estilos: ",
    leadPart2: " e ",
    leadPart3:
      ". É uma ferramenta de reflexão e orientação simbólica. Não substitui aconselhamento médico ou financeiro nem outro aconselhamento profissional.",
    bonesLabel: "Ossos",
    privacyHeading: "Privacidade",
    privacyLi1:
      "Os teus chats e imagens ficam associados à tua conta e só são acessíveis com sessão iniciada.",
    privacyLi2:
      "O serviço não expõe o teu histórico nem os teus temas de consulta fora do teu acesso autenticado.",
    privacyLi3:
      "Se quiseres um registo no teu dispositivo, à tua discrição podes descarregar a imagem de uma leitura e exportar o fio atual para PDF em Opções; esses ficheiros são gerados localmente e a sua custódia é tua.",
    optionsHeading: "Opções (barra inferior)",
    optionsIntro:
      "Em Opções escolhes o tipo de consulta (I Ching ou Ossos); com o I Ching também o modo de tiragem (automática ou manual), vês a profundidade permitida no fio ativo, geres tokens e 2FA, e no final tens ligações a documentação, privacidade e termos.",
    libraryFeatureBody:
      "Dispomos de uma biblioteca onde podes realizar consultas profundas utilizando as três fontes principais da obra: a tradução clássica de Wilhelm (1924), a versão de James Legge e o texto original Zhou Yi. Esta secção permite contrastar as tuas respostas ou tiragens manuais com os escritos autênticos, desenhados para o estudo sério do I Ching. Os textos são apresentados no seu formato original para preservar a fidelidade absoluta das fontes.",
    methodsHeading: "Como usar os métodos",
    methodsIntro:
      "O I Ching e os Ossos são métodos diferentes. O I Ching lê por hexagrama e linhas e oferece duas formas de tiragem: Três Moedas e Varetas de aquilégia. Os Ossos seguem um esquema próprio, sem hexagramas.",
    ichingTraditionNote:
      "Por padrão, o app implementa o sistema de redução a uma única linha de Alfred Huang, com a estrutura clássica de Zhu Xi como antecedente. Em Opções você pode ativar o seletor «Leitura de linhas mutantes» para usar a leitura clássica de Zhu Xi; em qualquer um dos dois casos, toda combinação de linhas produz sempre um único texto guia preciso.",
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
      "Com o I Ching ativo em Opções podes escolher o modo de tiragem. Em ambos os casos o servidor aplica as mesmas regras de seleção de linha e o mesmo corpus; só muda quem define as seis linhas antes da interpretação.",
    ichingCastAutoLi:
      "Automática: ao enviar a consulta, o ritual anima o traçado e as seis linhas são obtidas no servidor.",
    ichingCastManualLi:
      "Manual: abre-se um assistente para registares as seis linhas de baixo para cima. Com Três Moedas introduzes cara/coroa por linha; com Varetas registas a tua tiragem física passo a passo. No fim vês uma pré-visualização do hexagrama; a responsabilidade de refletir corretamente a tua tiragem é tua.",
    tokensHeading: "Tokens, limites e packs",
    tokensIntro:
      "Cada consulta consome um token. O saldo é acumulável: os packs somam-se ao que já tens. O que muda com o teu pack é o tamanho do saldo e quantas leituras encadeadas cabem no mesmo fio. A síntese Master (3) consome 2 tokens por consulta.",
    exportHeading: "Exportar e guardar",
    exportBody:
      "No painel Opções podes, quando quiseres, descarregar a imagem da leitura e gerar um PDF do chat ativo. É opcional: serve para guardar uma cópia no teu dispositivo. O PDF é criado no navegador; não substitui o histórico na app nem obriga a cópias fora do serviço. O PDF inclui o tradutor e o sistema de leitura de linhas usados nessa consulta.",
    s1Heading: "Modos de Consulta (Seletor Principal)",
    s1Iching: "Leitura por hexagramas e linhas mutantes para reflexão profunda e perguntas abertas.",
    s1Bones: "Leitura sim/não baseada em padrões de rachaduras para validar decisões e direção imediata.",
    s3Heading: "Sessões e Mensagens (Gestão de Chats)",
    s3NewSessionTitle: "Nova Sessão",
    s3NewSession: "Inicia um chat limpo com a sua própria continuidade temática.",
    s3HistoryTitle: "Histórico de Chats",
    s3History: "Acesso às tuas consultas anteriores, interpretações e imagens. Permite rever ou eliminar threads específicos.",
    translatorsHeading: "Os Pilares da Sabedoria (Tradutores)",
    translatorsWilhelm: "Interpretação psicológica e poética (Nível Free/Seeker).",
    translatorsLegge: "Abordagem estrutural e histórica (Nível Seeker).",
    translatorsZhouyi: "O texto canónico puro em chinês clássico (Nível Practitioner).",
    translatorsMaster: "Síntese magistral personalizada das três tradições para um veredicto definitivo (Nível Master).",
    lineReadingHeading: "Leitura de linhas mutantes",
    s6Heading: "Biblioteca e Documentação",
    s6LibraryTitle: "Biblioteca de Hexagramas",
    s6Library: "Consulta direta dos 64 hexagramas e obras.",
    s6DocsTitle: "Documentação",
    s6Docs: "Guia de uso · Notas e origem dos métodos (I Ching e Ossos) · Política de Privacidade · Termos de Serviço · Perguntas frequentes · Sobre a app.",
    libraryTabsBullet:
      "Cada página de hexagrama tem três abas: Wilhelm (1924), James Legge e o texto original Zhou Yi em chinês clássico.",
    libraryCommentaryBullet:
      "As abas de Wilhelm e Legge acrescentam um comentário clássico opcional, mostrado como um pequeno \"+\" junto ao Julgamento, à Imagem e a cada linha. Ele expande as notas do próprio tradutor (o comentário de Wilhelm mais as Dez Alas confucianas; as notas de Legge mais o seu Grande e Menor Simbolismo) sem alterar o texto do oráculo.",
    libraryWenYenBullet:
      "Os hexagramas 1 e 2 incluem uma nota de encerramento adicional, Wen Yen (\"Palavras sobre o Texto\"), presente apenas nestes dois hexagramas na edição-fonte de Wilhelm.",
    librarySearchBullet:
      "Usa a caixa de busca para encontrar um hexagrama por número, nome em inglês ou pinyin, ou filtra a lista pelo seu trigrama superior ou inferior.",
    libraryMutationsBullet:
      "Cada página de hexagrama lista as suas seis mutações possíveis: qual hexagrama resulta ao mudar uma linha específica, para que possas explorar a rede de hexagramas relacionados.",
    libraryCommentaryScopeBullet:
      "Este comentário clássico é apenas para estudo dentro da Biblioteca. Nunca é enviado à IA durante uma consulta em direto.",

  },
  fr: {
    title: "Guide d’utilisation",
    leadPart1: "Cette app permet de consulter selon deux styles : ",
    leadPart2: " et ",
    leadPart3:
      ". C’est un outil de réflexion et d’orientation symbolique. Il ne remplace pas un avis médical, financier ou autre conseil professionnel.",
    bonesLabel: "Os",
    privacyHeading: "Confidentialité",
    privacyLi1:
      "Vos chats et images sont liés à votre compte et ne sont accessibles que lorsque vous êtes connecté.",
    privacyLi2:
      "Le service n’expose pas votre historique ni vos sujets de consultation en dehors de votre accès authentifié.",
    privacyLi3:
      "Si vous souhaitez conserver une trace sur votre appareil, à votre discrétion vous pouvez télécharger l’image d’une lecture et exporter le fil actuel en PDF depuis Options ; ces fichiers sont générés localement et vous en assurez la conservation.",
    optionsHeading: "Options (barre du bas)",
    optionsIntro:
      "Dans Options vous choisissez le type de consultation (I Ching ou Os) ; avec I Ching aussi le mode de tirage (automatique ou manuel), voyez la profondeur autorisée du fil actif, gérez les jetons et la 2FA, et trouvez en bas les liens vers la documentation, la confidentialité et les conditions.",
    libraryFeatureBody:
      "Nous proposons une bibliothèque où vous pouvez effectuer des consultations approfondies en utilisant les trois sources principales de l'œuvre : la traduction classique de Wilhelm (1924), la version de James Legge et le texte original Zhou Yi. Cette section permet de confronter vos réponses ou tirages manuels aux écrits authentiques, conçus pour l'étude sérieuse du I Ching. Les textes sont présentés dans leur format d'origine afin de préserver la fidélité absolue des sources.",
    methodsHeading: "Comment utiliser les méthodes",
    methodsIntro:
      "Le I Ching et les Os sont deux méthodes différentes. Le I Ching lit par hexagramme et traits et propose deux modes de tirage : Trois Pièces et Tiges d’achillée. Les Os suivent un schéma propre, sans hexagramme.",
    ichingTraditionNote:
      "Par défaut, l’application met en œuvre le système de réduction à un seul trait d’Alfred Huang, avec la structure classique de Zhu Xi comme antécédent. Depuis les Options, vous pouvez activer le sélecteur « Lecture des lignes mobiles » pour utiliser à la place la lecture classique de Zhu Xi ; dans les deux cas, chaque combinaison de traits produit toujours un texte directeur unique et précis.",
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
      "Avec I Ching sélectionné dans Options, vous choisissez le mode de tirage. Dans les deux cas le serveur applique les mêmes règles classiques de sélection de trait et le même corpus ; seul change l’origine des six traits avant l’interprétation.",
    ichingCastAutoLi:
      "Automatique : à l’envoi, le rituel anime le tracé et les six traits sont générés côté serveur.",
    ichingCastManualLi:
      "Manuel : un assistant permet d’enregistrer les six traits du bas vers le haut. Avec Trois Pièces, entrez pile/face par trait ; avec les Tiges, enregistrez votre tirage physique étape par étape. À la fin, un aperçu d’hexagramme s’affiche ; vous êtes responsable de refléter fidèlement votre jet physique.",
    tokensHeading: "Jetons, limites et packs",
    tokensIntro:
      "Chaque consultation consomme un jeton. Le solde est cumulatif : les packs s’ajoutent à ce que vous avez déjà. Ce qui change selon votre pack, c’est la taille du solde et le nombre de lectures enchaînées possibles dans un même fil. La synthèse Master (3) consomme 2 jetons par consultation.",
    exportHeading: "Exporter et enregistrer",
    exportBody:
      "Depuis le panneau Options, vous pouvez quand vous le souhaitez télécharger l’image de la lecture et générer un PDF du chat actif. C’est facultatif : cela sert à garder une copie sur votre appareil. Le PDF est créé dans le navigateur ; il ne remplace pas l’historique dans l’app et n’oblige pas à conserver des copies hors service. Le PDF indique le traducteur et le système de lecture des traits utilisés dans cette consultation.",
    s1Heading: "Modes de consultation (sélecteur principal)",
    s1Iching: "Lecture par hexagramme et lignes en mouvement pour une réflexion profonde et des questions ouvertes.",
    s1Bones: "Lecture oui/non basée sur les patterns de fissures pour valider des décisions et la direction immédiate.",
    s3Heading: "Sessions et messages (gestion des chats)",
    s3NewSessionTitle: "Nouvelle session",
    s3NewSession: "Lance un chat propre avec sa propre continuité thématique.",
    s3HistoryTitle: "Historique des chats",
    s3History: "Accès à tes consultations précédentes, interprétations et images. Permet de consulter ou supprimer des fils spécifiques.",
    translatorsHeading: "Les piliers de la sagesse (traducteurs)",
    translatorsWilhelm: "Interprétation psychologique et poétique (niveau Free/Seeker).",
    translatorsLegge: "Approche structurelle et historique (niveau Seeker).",
    translatorsZhouyi: "Le texte canonique pur en chinois classique (niveau Practitioner).",
    translatorsMaster: "Synthèse magistrale personnalisée des trois traditions pour un verdict définitif (niveau Master).",
    lineReadingHeading: "Lecture des lignes mobiles",
    s6Heading: "Bibliothèque et documentation",
    s6LibraryTitle: "Bibliothèque des hexagrammes",
    s6Library: "Consultation directe des 64 hexagrammes et des œuvres.",
    s6DocsTitle: "Documentation",
    s6Docs: "Guide d'utilisation · Notes et origines des méthodes (I Ching et Bones) · Politique de confidentialité · Conditions d'utilisation · FAQ · À propos de l'app.",
    libraryTabsBullet:
      "Chaque page d'hexagramme a trois onglets : Wilhelm (1924), James Legge et le texte original Zhou Yi en chinois classique.",
    libraryCommentaryBullet:
      "Les onglets de Wilhelm et de Legge ajoutent un commentaire classique optionnel, affiché comme un petit \"+\" près du Jugement, de l'Image et de chaque trait. Il déploie les notes propres du traducteur (le commentaire de Wilhelm plus les Dix Ailes confucéennes ; les notes de Legge plus son Grand et Petit Symbolisme) sans modifier le texte de l'oracle.",
    libraryWenYenBullet:
      "Les hexagrammes 1 et 2 comportent une note de clôture supplémentaire, Wen Yen (\"Paroles sur le Texte\"), présente uniquement pour ces deux hexagrammes dans l'édition source de Wilhelm.",
    librarySearchBullet:
      "Utilisez la recherche pour trouver un hexagramme par numéro, nom anglais ou pinyin, ou filtrez la liste par son trigramme supérieur ou inférieur.",
    libraryMutationsBullet:
      "Chaque page d'hexagramme liste ses six mutations possibles : quel hexagramme résulte du changement d'un trait précis, pour explorer le réseau des hexagrammes liés.",
    libraryCommentaryScopeBullet:
      "Ce commentaire classique est réservé à l'étude dans la Bibliothèque. Il n'est jamais envoyé à l'IA pendant une consultation en direct.",

  },
  de: {
    title: "Nutzungsanleitung",
    leadPart1: "Mit dieser App kannst du in zwei Stilen konsultieren: ",
    leadPart2: " und ",
    leadPart3:
      ". Sie ist ein Werkzeug für symbolische Reflexion und Orientierung. Sie ersetzt keine medizinische oder finanzielle Beratung und auch keine sonstige professionelle Beratung.",
    bonesLabel: "Knochen",
    privacyHeading: "Datenschutz",
    privacyLi1:
      "Deine Chats und Bilder sind mit deinem Konto verknüpft und nur mit angemeldeter Sitzung zugänglich.",
    privacyLi2:
      "Der Dienst gibt deinen Verlauf und deine Beratungsthemen nicht außerhalb deines authentifizierten Zugriffs preis.",
    privacyLi3:
      "Wenn du auf deinem Gerät eine Aufzeichnung möchtest, kannst du nach eigenem Ermessen ein Lesebild herunterladen und den aktuellen Thread als PDF aus Optionen exportieren; diese Dateien werden lokal erzeugt und liegen in deiner Verantwortung.",
    optionsHeading: "Optionen (untere Leiste)",
    optionsIntro:
      "In Optionen wählst du den Beratungstyp (I Ching oder Knochen); bei I Ging auch den Wurfmodus (automatisch oder manuell), siehst die erlaubte Tiefe im aktiven Thread, verwaltest Token und 2FA und findest unten Links zu Dokumentation, Datenschutz und Nutzungsbedingungen.",
    libraryFeatureBody:
      "Wir bieten eine Bibliothek, in der Sie tiefgehende Konsultationen unter Verwendung der drei Hauptquellen des Werks durchführen können: die klassische Wilhelm (1924)-Übersetzung, die James-Legge-Version und den originalen Zhou-Yi-Text. Dieser Bereich ermöglicht es Ihnen, Ihre Antworten oder manuellen Würfe mit den authentischen Schriften abzugleichen, die für ein ernsthaftes Studium des I Ging konzipiert wurden. Die Texte werden in ihrem Originalformat präsentiert, um die absolute Treue der Quellen zu bewahren.",
    methodsHeading: "So nutzt du die Methoden",
    methodsIntro:
      "I Ging und Knochen sind unterschiedliche Methoden. I Ging liest nach Hexagramm und Strichen und bietet zwei Wurfarten: Drei Münzen und Schafgarbenstäbe. Die Knochen folgen einem eigenen Schema, ohne Hexagramm.",
    ichingTraditionNote:
      "Standardmäßig setzt die App Alfred Huangs Einzel-Linien-Reduktionssystem um, mit Zhu Xis klassischem Rahmen als Vorläufer. In den Optionen kannst du den Auswahlschalter „Lesung wandelnder Linien“ aktivieren, um stattdessen Zhu Xis klassische Lesung zu verwenden; in beiden Fällen ergibt jede Strichkombination stets einen einzigen, präzisen Leittext.",
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
      "Mit ausgewähltem I Ging unter Optionen wählst du den Wurfmodus. In beiden Fällen wendet der Server dieselben klassischen Linienauswahl-Regeln und denselben Textbestand an; nur die Herkunft der sechs Striche vor der Auslegung ändert sich.",
    ichingCastAutoLi:
      "Automatisch: Beim Senden animiert das Ritual das Muster, die sechs Striche entstehen auf dem Server.",
    ichingCastManualLi:
      "Manuell: Ein Assistent öffnet, damit du die sechs Striche von unten nach oben eingibst. Mit Drei Münzen trägst du Kopf/Zahl pro Strich ein; mit Stäben hältst du deinen physischen Wurf Schritt für Schritt fest. Am Ende erscheint eine Hexagramm-Vorschau; die korrekte Eingabe deines physischen Wurfs liegt in deiner Verantwortung.",
    tokensHeading: "Tokens, Grenzen und Packs",
    tokensIntro:
      "Jede Beratung verbraucht ein Token. Das Guthaben ist kumulativ: Packs werden zum vorhandenen Guthaben hinzugerechnet. Was sich mit deinem Pack ändert, ist die Größe des Guthabens und wie viele verkettete Lesungen in denselben Thread passen. Die Master-(3)-Synthese verbraucht 2 Tokens pro Beratung.",
    exportHeading: "Exportieren und speichern",
    exportBody:
      "Im Optionen-Bereich kannst du bei Bedarf das Lesebild herunterladen und den aktiven Chat als PDF erzeugen. Das ist optional und dient dazu, eine Kopie auf deinem Gerät zu behalten. Das PDF entsteht im Browser; es ersetzt nicht den App-Verlauf und verpflichtet nicht zu Kopien außerhalb des Dienstes. Das PDF enthält den verwendeten Übersetzer und das in dieser Beratung genutzte Liniensystem.",
    s1Heading: "Beratungsmodi (Hauptauswahl)",
    s1Iching: "Hexagramm- und wandelnde-Linie-Lesung für tiefe Reflexion und offene Fragen.",
    s1Bones: "Ja/Nein-Lesung basierend auf Rissmustern zur Entscheidungsvalidierung und unmittelbaren Ausrichtung.",
    s3Heading: "Sitzungen und Nachrichten (Chat-Verwaltung)",
    s3NewSessionTitle: "Neue Sitzung",
    s3NewSession: "Startet einen neuen Chat mit seiner eigenen thematischen Kontinuität.",
    s3HistoryTitle: "Chat-Verlauf",
    s3History: "Zugang zu deinen früheren Konsultationen, Interpretationen und Bildern. Ermöglicht das Prüfen oder Löschen bestimmter Threads.",
    translatorsHeading: "Die Säulen der Weisheit (Übersetzer)",
    translatorsWilhelm: "Psychologische und poetische Interpretation (Free/Seeker-Stufe).",
    translatorsLegge: "Struktureller und historischer Ansatz (Seeker-Stufe).",
    translatorsZhouyi: "Der reine kanonische Text auf klassischem Chinesisch (Practitioner-Stufe).",
    translatorsMaster: "Individuelle Meistersynthese aller drei Traditionen für ein endgültiges Urteil (Master-Stufe).",
    lineReadingHeading: "Lesung wandelnder Linien",
    s6Heading: "Bibliothek und Dokumentation",
    s6LibraryTitle: "Hexagramm-Bibliothek",
    s6Library: "Direktabfrage aller 64 Hexagramme und Werke.",
    s6DocsTitle: "Dokumentation",
    s6Docs: "Nutzungsanleitung · Methodennotizen und Herkunft (I Ching und Knochen) · Datenschutzerklärung · Nutzungsbedingungen · FAQ · Über die App.",
    libraryTabsBullet:
      "Jede Hexagramm-Seite hat drei Tabs: Wilhelm (1924), James Legge und den ursprünglichen Zhou-Yi-Text in klassischem Chinesisch.",
    libraryCommentaryBullet:
      "Die Tabs von Wilhelm und Legge enthalten einen optionalen klassischen Kommentar, gezeigt als kleines \"+\" neben dem Urteil, dem Bild und jeder Linie. Er öffnet die eigenen Anmerkungen des Gelehrten (Wilhelms Kommentar plus die konfuzianischen Zehn Flügel; Legges Fußnoten plus seine Große und Kleinere Symbolik), ohne den Orakeltext selbst zu verändern.",
    libraryWenYenBullet:
      "Die Hexagramme 1 und 2 enthalten eine zusätzliche Schlussanmerkung, Wen Yen (\"Worte zum Text\"), die nur bei diesen beiden Hexagrammen in Wilhelms Quellausgabe vorkommt.",
    librarySearchBullet:
      "Nutze die Suche, um ein Hexagramm nach Nummer, englischem Namen oder Pinyin zu finden, oder filtere die Liste nach oberem oder unterem Trigramm.",
    libraryMutationsBullet:
      "Jede Hexagramm-Seite listet ihre sechs möglichen Mutationen: welches Hexagramm entsteht, wenn sich eine bestimmte Linie ändert, sodass du das Netz verwandter Hexagramme erkunden kannst.",
    libraryCommentaryScopeBullet:
      "Dieser klassische Kommentar ist nur zum Studium innerhalb der Bibliothek gedacht. Er wird während einer laufenden Beratung niemals an die KI gesendet.",

  },
  it: {
    title: "Guida all’uso",
    leadPart1: "Questa app consente di consultare in due stili: ",
    leadPart2: " e ",
    leadPart3:
      ". È uno strumento di riflessione e orientamento simbolico. Non sostituisce pareri medici o finanziari né altri pareri professionali.",
    bonesLabel: "Ossa",
    privacyHeading: "Privacy",
    privacyLi1:
      "Le tue chat e immagini sono associate al tuo account e accessibili solo con sessione avviata.",
    privacyLi2:
      "Il servizio non espone la tua cronologia né gli argomenti di consultazione al di fuori del tuo accesso autenticato.",
    privacyLi3:
      "Se vuoi conservare una copia sul dispositivo, a tua discrezione puoi scaricare l’immagine di una lettura ed esportare il thread attivo in PDF da Opzioni; quei file sono generati in locale e ne sei custode.",
    optionsHeading: "Opzioni (barra inferiore)",
    optionsIntro:
      "In Opzioni scegli il tipo di consulta (I Ching o Ossa); con I Ching anche la modalità di lancio (automatica o manuale), vedi la profondità consentita nel thread attivo, gestisci token e 2FA e in fondo trovi link a documentazione, privacy e termini.",
    libraryFeatureBody:
      "Disponiamo di una biblioteca in cui puoi effettuare consultazioni approfondite utilizzando le tre fonti principali dell'opera: la traduzione classica di Wilhelm (1924), la versione di James Legge e il testo originale Zhou Yi. Questa sezione ti permette di confrontare le tue risposte o i tuoi lanci manuali con gli scritti autentici, pensati per lo studio serio dell'I Ching. I testi sono presentati nel loro formato originale per preservare l'assoluta fedeltà delle fonti.",
    methodsHeading: "Come usare i metodi",
    methodsIntro:
      "I Ching e Ossa sono metodi differenti. L’I Ching legge per esagramma e linee e offre due modi di lancio: Tre Monete e Stecche di achillea. Le Ossa seguono uno schema proprio, senza esagramma.",
    ichingTraditionNote:
      "Per impostazione predefinita, l’app implementa il sistema di riduzione a linea singola di Alfred Huang, con la struttura classica di Zhu Xi come precedente. Dalle Opzioni puoi attivare il selettore «Lettura delle linee mutanti» per usare invece la lettura classica di Zhu Xi; in entrambi i casi, ogni combinazione di linee produce sempre un unico testo guida preciso.",
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
      "Con I Ching attivo in Opzioni puoi scegliere la modalità di lancio. In entrambi i casi il server applica le stesse regole classiche di selezione della linea e lo stesso corpus; cambia solo chi fornisce le sei linee prima dell’interpretazione.",
    ichingCastAutoLi:
      "Automatico: all’invio il rituale anima il tracciato e le sei linee sono generate sul server.",
    ichingCastManualLi:
      "Manuale: si apre un assistente per registrare le sei linee dal basso. Con Tre Monete inserisci testa/croce per linea; con Stecche registri il tuo lancio fisico passo dopo passo. Al termine compare un’anteprima dell’esagramma; sei responsabile di riflettere fedelmente il tuo lancio fisico.",
    tokensHeading: "Token, limiti e pack",
    tokensIntro:
      "Ogni consultazione consuma un token. Il saldo è cumulativo: i pack si sommano a ciò che hai già. Ciò che cambia con il pack è la dimensione del saldo e quante letture concatenate stanno nello stesso thread. La sintesi Master (3) consuma 2 token per consultazione.",
    exportHeading: "Esportare e salvare",
    exportBody:
      "Dal pannello Opzioni puoi, quando vuoi, scaricare l’immagine della lettura e generare un PDF della chat attiva. È facoltativo: serve a tenere una copia sul tuo dispositivo. Il PDF viene creato nel browser; non sostituisce la cronologia nell’app e non obbliga a copie fuori dal servizio. Il PDF indica il traduttore e il sistema di lettura delle linee usati in quella consultazione.",
    s1Heading: "Modi di consultazione (selettore principale)",
    s1Iching: "Lettura per esagrammi e linee in movimento per riflessione profonda e domande aperte.",
    s1Bones: "Lettura sì/no basata su pattern di crepe per validare decisioni e direzione immediata.",
    s3Heading: "Sessioni e messaggi (gestione chat)",
    s3NewSessionTitle: "Nuova sessione",
    s3NewSession: "Avvia una chat pulita con la propria continuità tematica.",
    s3HistoryTitle: "Cronologia chat",
    s3History: "Accesso alle tue consultazioni precedenti, interpretazioni e immagini. Permette di rivedere o eliminare thread specifici.",
    translatorsHeading: "I pilastri della saggezza (traduttori)",
    translatorsWilhelm: "Interpretazione psicologica e poetica (livello Free/Seeker).",
    translatorsLegge: "Approccio strutturale e storico (livello Seeker).",
    translatorsZhouyi: "Il testo canonico puro in cinese classico (livello Practitioner).",
    translatorsMaster: "Sintesi magistrale personalizzata delle tre tradizioni per un verdetto definitivo (livello Master).",
    lineReadingHeading: "Lettura delle linee mutanti",
    s6Heading: "Biblioteca e documentazione",
    s6LibraryTitle: "Biblioteca degli esagrammi",
    s6Library: "Consultazione diretta dei 64 esagrammi e delle opere.",
    s6DocsTitle: "Documentazione",
    s6Docs: "Guida all'uso · Note e origini dei metodi (I Ching e Ossa) · Informativa sulla privacy · Termini di servizio · FAQ · Informazioni sull'app.",
    libraryTabsBullet:
      "Ogni pagina di esagramma ha tre schede: Wilhelm (1924), James Legge e il testo originale Zhou Yi in cinese classico.",
    libraryCommentaryBullet:
      "Le schede di Wilhelm e Legge aggiungono un commento classico opzionale, mostrato come un piccolo \"+\" accanto al Giudizio, all'Immagine e a ciascuna linea. Apre le note proprie dello studioso (il commento di Wilhelm più le Dieci Ali confuciane; le note di Legge più il suo Grande e Piccolo Simbolismo) senza modificare il testo dell'oracolo.",
    libraryWenYenBullet:
      "Gli esagrammi 1 e 2 includono una nota di chiusura aggiuntiva, Wen Yen (\"Parole sul Testo\"), presente solo per questi due esagrammi nell'edizione fonte di Wilhelm.",
    librarySearchBullet:
      "Usa la ricerca per trovare un esagramma per numero, nome inglese o pinyin, oppure filtra l'elenco per trigramma superiore o inferiore.",
    libraryMutationsBullet:
      "Ogni pagina di esagramma elenca le sue sei mutazioni possibili: quale esagramma risulta cambiando una linea specifica, per esplorare la rete di esagrammi collegati.",
    libraryCommentaryScopeBullet:
      "Questo commento classico serve solo per lo studio all'interno della Biblioteca. Non viene mai inviato all'IA durante una consultazione dal vivo.",

  },
  ja: {
    title: "利用ガイド",
    leadPart1: "このアプリでは次の2つのスタイルで占えます：",
    leadPart2: " と ",
    leadPart3:
      "。象徴的な内省と方向づけのためのツールであり、医療・金融などの専門的アドバイスに代わるものではありません。",
    bonesLabel: "甲骨",
    privacyHeading: "プライバシー",
    privacyLi1:
      "チャットと画像はアカウントに紐づき、サインイン中にのみアクセスできます。",
    privacyLi2:
      "サービスは、認証されたご本人以外に履歴や相談内容を公開しません。",
    privacyLi3:
      "端末に記録を残す場合は、ご自身の判断で読み取り画像のダウンロードや、オプションから現行スレッドのPDF出力が可能です。これらは端末上で生成され、保管はご自身の責任です。",
    optionsHeading: "オプション（下部パネル）",
    optionsIntro:
      "オプションでは相談タイプ（I Ching または甲骨）を選び、I Ching では占い方（自動または手動）も選べます。アクティブスレッドの深さ、トークンと2FAの管理、下部のドキュメント・プライバシー・利用規約リンクもここです。",
    libraryFeatureBody:
      "当アプリは、Wilhelm (1924) 訳、James Legge 版、および原典の周易という3つの主要な典拠を用いて、深い内省を可能にするライブラリを備えています。このセクションでは、ご自身の回答や手作りの占い結果を、易経の本格的な研究のために設計された本物の記述と照らし合わせることができます。テキストは、出典の忠実性を完全に保つために元の形式で提供されます。",
    methodsHeading: "占いの方式の使い分け",
    methodsIntro:
      "易経と甲骨は別の方式です。易経は卦と爻で読み、占い方は二通り（三銭と蓍草）です。甲骨は卦を作らず、独自の流れで進みます。",
    ichingTraditionNote:
      "既定では、このアプリはアルフレッド・ホアンの一爻還元システムを採用し、朱熹の古典的な枠組みをその前身としています。オプションの「変爻の読み方」セレクターを使うと、代わりに朱熹の古典的な読み方を選べます。どちらの場合も、どの変爻の組み合わせでも常に的確な主爻テキストが一つに定まります。",
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
      "オプションで易経を選ぶと占い方を選べます。どちらもサーバー側で同じ古典的な爻選択ルールと同じ本文系を適用します。解釈の前に六爻を誰が確定するかだけが異なります。",
    ichingCastAutoLi:
      "自動：送信すると儀式が卦の展開をアニメーションし、六爻はサーバーで得られます。",
    ichingCastManualLi:
      "手動：補助が開き、下から各爻を入力します。三銭では表裏で各爻を入力し、蓍草では実際の手順に沿って一爻ずつ記録します。完了すると卦のプレビューが表示されます。実際の結果を正確に反映する責任はご自身にあります。",
    tokensHeading: "トークン、上限、パック",
    tokensIntro:
      "1回の相談で1トークンを使います。残高は累積式です。パックを買うと既存の残高に加算されます。パックで変わるのは残高の大きさと、同じスレッド内に収まる連続相談の回数です。マスター(3)による統合は1回の相談で2トークンを使います。",
    exportHeading: "エクスポートと保存",
    exportBody:
      "オプションパネルから、必要に応じて読み取り画像のダウンロードやアクティブチャットのPDF生成ができます。任意です。ブラウザ内でPDFが作成され、アプリ内の履歴を置き換えたり、サービス外への保存を義務付けたりはしません。PDFには、そのご相談で使用された翻訳者と爻の読み方の方式が記載されます。",
    s1Heading: "相談モード（メインセレクター）",
    s1Iching: "深い内省と開かれた質問のための卦・変爻の読み。",
    s1Bones: "決断の検証と即時の方向性のための亀裂パターンに基づくはい/いいえの読み。",
    s3Heading: "セッションとメッセージ（チャット管理）",
    s3NewSessionTitle: "新しいセッション",
    s3NewSession: "独自の主題継続性を持つクリーンなチャットを開始します。",
    s3HistoryTitle: "チャット履歴",
    s3History: "以前の相談、解釈、画像へのアクセス。特定のスレッドを確認または削除できます。",
    translatorsHeading: "知恵の柱（翻訳者）",
    translatorsWilhelm: "心理的・詩的解釈（Free/Seekerレベル）。",
    translatorsLegge: "構造的・歴史的アプローチ（Seekerレベル）。",
    translatorsZhouyi: "古典中国語による純粋な正典テキスト（Practitionerレベル）。",
    translatorsMaster: "三系統すべての個別化されたマスター統合による最終的判定（Masterレベル）。",
    lineReadingHeading: "変爻の読み方",
    s6Heading: "ライブラリとドキュメント",
    s6LibraryTitle: "卦ライブラリ",
    s6Library: "64卦と文献の直接参照。",
    s6DocsTitle: "ドキュメント",
    s6Docs: "利用ガイド · 方法のノートと起源（易経と骨）· プライバシーポリシー · 利用規約 · よくある質問 · アプリについて。",
    libraryTabsBullet:
      "各卦のページには3つのタブがあります。ヴィルヘルム（1924）、レッグ、そして古典中国語による周易の原典です。",
    libraryCommentaryBullet:
      "ヴィルヘルムとレッグのタブには、判断・象・各爻の横に小さな「+」で表示される任意の古典注釈が追加されています。開くと学者自身の注（ヴィルヘルムの注釈と儒教の十翼、レッグの注記と大象解・小象解）が表示されますが、卦辞そのものは変わりません。",
    libraryWenYenBullet:
      "第1卦と第2卦には、ヴィルヘルムの原典にのみ存在する追加の結びの注、文言（「言葉についての注釈」）が含まれています。",
    librarySearchBullet:
      "検索欄で番号・英語名・拼音から卦を探すか、上卦・下卦で一覧を絞り込めます。",
    libraryMutationsBullet:
      "各卦のページには、特定の爻が変化したときにどの卦になるかという6通りの変卦が一覧表示され、関連する卦のつながりをたどれます。",
    libraryCommentaryScopeBullet:
      "この古典注釈はライブラリ内での学習のためだけのものです。実際の鑑定中にAIへ送られることはありません。",

  },
  zh: {
    title: "使用指南",
    leadPart1: "本应用支持两种咨询方式：",
    leadPart2: " 与 ",
    leadPart3:
      "。它是象征性反思与取向的工具，不能替代医疗、财务或其他专业建议。",
    bonesLabel: "甲骨",
    privacyHeading: "隐私",
    privacyLi1: "您的聊天记录与图片与账户关联，仅在登录后可访问。",
    privacyLi2: "服务不会在您本人认证访问之外暴露历史或咨询主题。",
    privacyLi3:
      "若要在设备上留存记录，您可自行决定从选项下载解读图、将当前会话导出为 PDF；这些文件在本地生成，由您自行保管。",
    optionsHeading: "选项（底部栏）",
    optionsIntro:
      "在选项中选择咨询类型（I Ching 或甲骨）；选易经时还可选择起卦方式（自动或手动），查看当前会话允许的深度、管理代币与双因素认证，底部有文档、隐私政策与服务条款链接。",
    libraryFeatureBody:
      "我们提供一个资料库，您可以使用该作品的三大主要来源进行深度查询：经典的卫礼贤（1924）译本、理雅各（James Legge）版本以及《周易》古经。该板块允许您将自己的解答或手动起卦与旨在进行严肃易经研究的正宗著作进行对比。文本以其原始格式呈现，以保持来源的绝对忠实度。",
    methodsHeading: "如何使用各方法",
    methodsIntro:
      "易经和甲骨是两种不同的方法。易经按卦象与爻辞解读，并有两种起卦方式：三钱与蓍草。甲骨自成体系，不形成卦象。",
    ichingTraditionNote:
      "默认情况下，本应用采用 Alfred Huang 的单爻归简系统，以朱熹的古典框架为其源头。在选项中可启用「变爻解读法」选择器，改用朱熹的经典解法；无论哪种情况，每种变爻组合都能呈现一个精准、明确的主导爻辞。",
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
      "在选项中选择易经后，可选择起卦方式。两种方式服务器都应用相同的古典爻位选择规则与同一套文本；差别仅在于六爻由谁确定。",
    ichingCastAutoLi: "自动：发送咨询后会有仪式动画，六爻由服务器生成。",
    ichingCastManualLi:
      "手动：打开助手自下而上逐爻输入。三钱法时输入字/背；蓍草时按你的实际操作逐爻记录。六爻完成后显示卦象预览，直到解读返回。请确保输入与您实际操作一致。",
    tokensHeading: "代币、上限与套餐",
    tokensIntro:
      "每次咨询消耗 1 枚代币。余额是累积的：购买套餐会在原有余额上累加。随套餐变化的是余额规模以及在同一会话中可连续进行的解读次数。Master (3) 综合解读每次咨询消耗 2 枚代币。",
    exportHeading: "导出与保存",
    exportBody:
      "在选项面板中，您可随时下载解读图并生成当前聊天的 PDF。此为可选操作，用于在自有设备上保存副本。PDF 在浏览器中生成，不替代应用内历史，也不要求在服务外保留副本。PDF 中会注明该次咨询所用的译本和爻的读取系统。",
    s1Heading: "咨询模式（主选择器）",
    s1Iching: "通过卦象和变爻进行深度反思与开放性提问的解读。",
    s1Bones: "基于裂纹图案的是/否解读，用于验证决策和即时方向。",
    s3Heading: "会话与消息（聊天管理）",
    s3NewSessionTitle: "新会话",
    s3NewSession: "开始一个具有独立主题连贯性的新聊天。",
    s3HistoryTitle: "聊天记录",
    s3History: "访问您之前的咨询、解读和图片。可查看或删除特定会话。",
    translatorsHeading: "智慧之柱（译者）",
    translatorsWilhelm: "心理与诗意解读（Free/Seeker级别）。",
    translatorsLegge: "结构与历史方法（Seeker级别）。",
    translatorsZhouyi: "文言文原典文本（Practitioner级别）。",
    translatorsMaster: "三大传承的个性化大师综合，获得最终判断（Master级别）。",
    lineReadingHeading: "变爻解读法",
    s6Heading: "资料库与文档",
    s6LibraryTitle: "卦象资料库",
    s6Library: "直接查阅全部64卦及著作。",
    s6DocsTitle: "文档",
    s6Docs: "使用指南 · 方法说明与起源（易经与甲骨）· 隐私政策 · 服务条款 · 常见问题 · 关于本应用。",
    libraryTabsBullet:
      "每个卦的页面都有三个标签：卫礼贤（1924）、理雅各，以及古典中文原典周易。",
    libraryCommentaryBullet:
      "威廉和理雅各的标签新增了可选的古典注释，显示为判断、象和每条爻旁边的一个小「+」。展开后是学者本人的注（威廉的注释加儒家十翼；理雅各的注记加他的大象解与小象解），但不会改变卦辞本身。",
    libraryWenYenBullet:
      "第1卦和第2卦多了一段额外的结语，文言（「关于文本的话语」），仅在威廉原始版本的这两卦中出现。",
    librarySearchBullet:
      "使用搜索框按编号、英文名称或拼音查找卦象，或按上卦、下卦过滤列表。",
    libraryMutationsBullet:
      "每个卦的页面都列出其六种可能的变卦：某一条爻变化后会得到哪个卦，方便你浏览相关卦象之间的联系。",
    libraryCommentaryScopeBullet:
      "这层古典注释仅用于图书馆内的研习。咨询进行时绝不会发送给AI。",

  },
  ko: {
    title: "사용 안내",
    leadPart1: "이 앱에서는 두 가지 방식으로 점칠 수 있습니다: ",
    leadPart2: " 및 ",
    leadPart3:
      ". 상징적 성찰과 방향 제시를 위한 도구이며 의료·재무 등 전문 조언을 대체하지 않습니다.",
    bonesLabel: "갑골",
    privacyHeading: "개인정보",
    privacyLi1:
      "채팅과 이미지는 계정에 연결되며 로그인한 상태에서만 접근할 수 있습니다.",
    privacyLi2:
      "서비스는 본인의 인증된 접근 밖에서 기록이나 상담 주제를 노출하지 않습니다.",
    privacyLi3:
      "기기에 기록을 남기려면, 본인 판단으로 해석 이미지를 내려받거나 옵션에서 현재 스레드를 PDF로보낼 수 있습니다. 해당 파일은 기기에서 생성되며 보관 책임은 사용자에게 있습니다.",
    optionsHeading: "옵션(하단 패널)",
    optionsIntro:
      "옵션에서 상담 유형(I Ching 또는 갑골)을 고르고, I Ching일 때는 점 방식(자동 또는 수동)도 고릅니다. 활성 스레드 허용 깊이, 토큰 및 2FA 관리, 하단의 문서·개인정보·약관 링크도 여기 있습니다.",
    libraryFeatureBody:
      "저희는 이 저작의 세 가지 주요 출처인 빌헬름 (1924) 번역, 제임스 레그 버전, 그리고 원전 주역을 사용하여 심층적인 조회를 수행할 수 있는 라이브러리를 제공합니다. 이 섹션에서는 진지한 주역 공부를 위해 고안된 정통 문헌과 본인의 답변 또는 수동 점괘를 대조할 수 있습니다. 텍스트는 출처의 절대적인 충실도를 유지하기 위해 원문 형식으로 제공됩니다.",
    methodsHeading: "방법별 사용법",
    methodsIntro:
      "역경과 갑골은 서로 다른 방법입니다. 역경은 괘와 효로 풀이하며 점치는 방식이 두 가지(삼전과 시초)입니다. 갑골은 괘를 만들지 않고 독자적인 흐름을 따릅니다.",
    ichingTraditionNote:
      "기본적으로 이 앱은 Alfred Huang의 단일 효 환원 체계를 구현하며, 주희의 고전적 틀을 그 선행 구조로 삼습니다. 옵션에서 '변효 해석 방식' 선택기를 활성화하면 대신 주희의 고전적 해석을 사용할 수 있습니다. 어느 쪽이든 동효의 모든 조합은 항상 정확한 지도 효사 하나를 산출합니다.",
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
      "옵션에서 역경을 선택하면 점 방식을 고를 수 있습니다. 두 경우 모두 서버는 동일한 고전적 효 선택 규칙과 동일한 텍스트 체계를 적용합니다. 해석 전 여섯 효를 누가 확정하느냐만 다릅니다.",
    ichingCastAutoLi:
      "자동: 전송하면 의식 애니메이션이 재생되고 여섯 효는 서버에서 생성됩니다.",
    ichingCastManualLi:
      "수동: 도우미에서 아래에서 위로 효를 입력합니다. 동전을 쓸 때는 앞/뒤를 입력하고, 시초를 쓸 때는 직접 점친 절차를 한 효씩 따라 기록합니다. 여섯 효가 끝나면 해석이 올 때까지 괘 미리보기가 표시됩니다. 실제 결과를 정확히 반영할 책임은 사용자에게 있습니다.",
    tokensHeading: "토큰, 한도, 팩",
    tokensIntro:
      "상담 1회마다 토큰 1개를 사용합니다. 잔액은 누적식입니다. 팩을 구매하면 기존 잔액에 더해집니다. 팩에 따라 달라지는 것은 잔액의 크기와 한 스레드에 들어가는 연속 풀이의 수입니다. 마스터(3) 통합 해석은 상담 1회마다 토큰 2개를 사용합니다.",
    exportHeading: "보내기 및 저장",
    exportBody:
      "옵션 패널에서 해석 이미지를 내려받고 활성 채팅을 PDF로 만들 수 있습니다. 선택 사항이며 기기에 사본을 보관하기 위함입니다. PDF는 브라우저에서 생성되며 앱 내 기록을 대체하지 않고 서비스 밖 보관을 강제하지 않습니다. PDF에는 해당 상담에서 사용한 번역가와 효 읽기 방식이 포함됩니다.",
    s1Heading: "상담 모드 (메인 셀렉터)",
    s1Iching: "깊은 성찰과 열린 질문을 위한 괘와 변효 해석.",
    s1Bones: "결정 검증과 즉각적 방향을 위한 균열 패턴 기반 예/아니오 해석.",
    s3Heading: "세션 및 메시지 (채팅 관리)",
    s3NewSessionTitle: "새 세션",
    s3NewSession: "독자적인 주제 연속성을 가진 새로운 채팅을 시작합니다.",
    s3HistoryTitle: "채팅 기록",
    s3History: "이전 상담, 해석 및 이미지에 접근. 특정 스레드를 검토하거나 삭제할 수 있습니다.",
    translatorsHeading: "지혜의 기둥 (번역자)",
    translatorsWilhelm: "심리적·시적 해석 (Free/Seeker 레벨).",
    translatorsLegge: "구조적·역사적 접근 (Seeker 레벨).",
    translatorsZhouyi: "고전 중국어 순수 정전 텍스트 (Practitioner 레벨).",
    translatorsMaster: "세 계통 모두의 개인화된 마스터 종합, 최종 판결 도출 (Master 레벨).",
    lineReadingHeading: "변효 해석 방식",
    s6Heading: "라이브러리 및 문서",
    s6LibraryTitle: "괘 라이브러리",
    s6Library: "64괘 및 문헌 직접 참조.",
    s6DocsTitle: "문서",
    s6Docs: "사용 안내 · 방법 메모 및 기원 (주역과 갑골) · 개인정보 처리방침 · 서비스 이용약관 · 자주 묻는 질문 · 앱 소개.",
    libraryTabsBullet:
      "각 괘 페이지에는 세 개의 탭이 있습니다: 빌헬름 (1924), 제임스 레그, 그리고 고전 중국어로 된 주역 원전입니다.",
    libraryCommentaryBullet:
      "빌헬름과 레그 탭에는 괘사, 상, 각 효 옆에 작은 \"+\"로 표시되는 선택적 고전 주석이 추가되어 있습니다. 이를 열면 학자 본인의 주석(빌헬름의 주석과 유교의 십익, 레그의 주석과 대상해 및 소상해)이 펼쳐지지만 괘사 자체는 바뀌지 않습니다.",
    libraryWenYenBullet:
      "1번과 2번 괘에는 빌헬름 원전에만 있는 추가 마무리 주석인 문언(\"글에 대한 말\")이 포함되어 있습니다.",
    librarySearchBullet:
      "검색창으로 번호, 영문 이름, 또는 병음으로 괘를 찾거나 상괘·하괘로 목록을 걸러낼 수 있습니다.",
    libraryMutationsBullet:
      "각 괘 페이지에는 특정 효가 변할 때 어떤 괘가 되는지를 보여주는 여섯 가지 변괘가 나열되어 있어, 관련된 괘들의 연결망을 둘러볼 수 있습니다.",
    libraryCommentaryScopeBullet:
      "이 고전 주석은 도서관 안에서의 학습용일 뿐입니다. 실제 상담 중에는 AI로 전송되지 않습니다.",

  },
  ar: {
    title: "دليل المستخدم",
    leadPart1: "يتيح هذا التطبيق الاستشارة بأسلوبين: ",
    leadPart2: " و ",
    leadPart3:
      ". إنه أداة للتأمل والتوجيه الرمزي، ولا يحل محل المشورة الطبية أو المالية أو أي مشورة مهنية أخرى.",
    bonesLabel: "العظام",
    privacyHeading: "الخصوصية",
    privacyLi1:
      "محادثاتك وصورك مرتبطة بحسابك ولا يمكن الوصول إليها إلا عند تسجيل الدخول.",
    privacyLi2:
      "لا تكشف الخدمة عن سجلاتك أو موضوعات استشاراتك خارج نطاق وصولك المصادق عليه.",
    privacyLi3:
      "إذا أردت الاحتفاظ بسجل على جهازك، يمكنك بمحض إرادتك تنزيل صورة القراءة وتصدير الخيط الحالي إلى PDF من خيارات الاستشارة؛ هذه الملفات تُنشأ محليًا وأنت مسؤول عن حفظها.",
    optionsHeading: "الخيارات (اللوحة السفلية)",
    optionsIntro:
      "في الخيارات تختار نوع الاستشارة (I Ching أو العظام)، ومع I Ching تختار أيضًا وضع القَسْم (تلقائي أو يدوي)، وترى العمق المسموح به في الخيط النشط، وتدير الرموز و2FA، وفي الأسفل روابط للوثائق والخصوصية والشروط.",
    libraryFeatureBody:
      "نقدم لك مكتبة يمكنك من خلالها إجراء استشارات عميقة باستخدام المصادر الثلاثة الرئيسية للعمل: ترجمة فيلهلم (1924) الكلاسيكية، ونسخة جيمس ليغ، وجو يي الأصلي. يتيح لك هذا القسم مقارنة إجاباتك أو قراءاتك اليدوية مع الكتابات الأصلية المصممة للدراسة الجادة لـ I Ching. تُعرض النصوص بتنسيقها الأصلي للحفاظ على الدقة المطلقة للمصادر.",
    methodsHeading: "كيف تستخدم كل طريقة",
    methodsIntro:
      "I Ching والعظام طريقتان مختلفتان. يقرأ I Ching وفق الهكساغرام والخطوط ويتيح أسلوبين للقَسْم: ثلاث عملات وعيدان الزنبق. تتبع العظام مخططها الخاص بدون هكساغرام.",
    ichingTraditionNote:
      "افتراضيًا، يطبّق التطبيق نظام ألفريد هوانغ لاختزال الخط الواحد، مع قواعد زو شي الكلاسيكية كأصل تاريخي لهذا البناء. من الخيارات يمكنك تفعيل مُحدِّد «قراءة الخطوط المتغيرة» لاستخدام قراءة زو شي الكلاسيكية بدلاً من ذلك؛ وفي كل الحالتين، تُنتج كل تركيبة من الخطوط المتغيرة دائمًا نصًا راهنًا واحدًا ودقيقًا.",
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
      "عند اختيار I Ching في الخيارات يمكنك اختيار أسلوب القَسْم. في الحالتين يطبق الخادم نفس قواعد اختيار الخط الكلاسيكية ونفس المرجع النصي؛ يتغيّر فقط من يثبت الخطوط الستة قبل التفسير.",
    ichingCastAutoLi:
      "تلقائي: عند الإرسال يعرض الطقس الحركة وتُولَّد الخطوط الستة على الخادم.",
    ichingCastManualLi:
      "يدوي: يفتح مساعد لتسجيل الخطوط الستة من الأسفل إلى الأعلى. مع ثلاث عملات أدخل الوجه/الكتابة لكل خط؛ مع العيدان سجِّل قَسْمك الفعلي خطوة بخطوة لكل خط. بعد اكتمال الخطوط الستة تظهر معاينة للهكساغرام؛ أنت مسؤول عن عكس قَسْمك الفعلي بدقة.",
    tokensHeading: "الرموز والحدود والحزم",
    tokensIntro:
      "تستهلك كل استشارة رمزًا واحدًا. الرصيد تراكمي: تُضاف الحزم إلى رصيدك الحالي. ما يتغير حسب حزمتك هو حجم الرصيد وعدد القراءات المتسلسلة الممكنة في الخيط نفسه. يستهلك تركيب ماستر (3) رمزين لكل استشارة.",
    exportHeading: "التصدير والحفظ",
    exportBody:
      "من لوحة الخيارات يمكنك متى شئت تنزيل صورة القراءة وإنشاء PDF للمحادثة النشطة. هذا اختياري ويُستخدم للاحتفاظ بنسخة على جهازك. يُنشأ PDF في المتصفح ولا يحل محل السجل داخل التطبيق. يتضمن ملف PDF المترجم ونظام قراءة الخطوط المستخدمين في تلك الاستشارة.",
    s1Heading: "أوضاع الاستشارة (المحدد الرئيسي)",
    s1Iching: "قراءة بالهيكساغرام والخطوط المتحولة للتأمل العميق والأسئلة المفتوحة.",
    s1Bones: "قراءة نعم/لا بناءً على أنماط الشقوق للتحقق من القرارات والتوجه الفوري.",
    s3Heading: "الجلسات والرسائل (إدارة المحادثات)",
    s3NewSessionTitle: "جلسة جديدة",
    s3NewSession: "ابدأ محادثة نظيفة باستمرارية موضوعية خاصة بها.",
    s3HistoryTitle: "سجل المحادثات",
    s3History: "الوصول إلى استشاراتك السابقة والتفسيرات والصور. يتيح مراجعة أو حذف المواضيع المحددة.",
    translatorsHeading: "ركائز الحكمة (المترجمون)",
    translatorsWilhelm: "تفسير نفسي وشعري (مستوى Free/Seeker).",
    translatorsLegge: "نهج بنيوي وتاريخي (مستوى Seeker).",
    translatorsZhouyi: "النص الأصلي الخالص بالصينية الكلاسيكية (مستوى Practitioner).",
    translatorsMaster: "توليف رئيسي مخصص للتقاليد الثلاث للحصول على حكم نهائي (مستوى Master).",
    lineReadingHeading: "قراءة الخطوط المتغيرة",
    s6Heading: "المكتبة والتوثيق",
    s6LibraryTitle: "مكتبة الهيكساغرامات",
    s6Library: "استشارة مباشرة للهيكساغرامات الـ64 والأعمال.",
    s6DocsTitle: "التوثيق",
    s6Docs: "دليل المستخدم · ملاحظات المنهج وأصوله (الي تشينج والعظام) · سياسة الخصوصية · شروط الخدمة · الأسئلة الشائعة · حول التطبيق.",
    libraryTabsBullet:
      "تحتوي كل صفحة هكساغرام على ثلاث علامات تبويب: ويلهلم (1924)، وجيمس ليج، والنص الأصلي تشو يي بالصينية الكلاسيكية.",
    libraryCommentaryBullet:
      "تضيف علامتا تبويب ويلهلم وليج تعليقًا كلاسيكيًا اختياريًا، يظهر كعلامة \"+\" صغيرة بجانب الحكم والصورة وكل خط. يعرض هذا التعليق ملاحظات العالم نفسه (تعليق ويلهلم بالإضافة إلى الأجنحة العشرة الكونفوشيوسية، وملاحظات ليج بالإضافة إلى رمزيته العظيمة والصغرى) دون تغيير نص الأوراكل نفسه.",
    libraryWenYenBullet:
      "يحتوي الهكساغرامان 1 و2 على ملاحظة ختامية إضافية، وين يان (\"كلمات عن النص\")، موجودة فقط في هذين الهكساغرامين في نسخة ويلهلم المصدرية.",
    librarySearchBullet:
      "استخدم مربع البحث للعثور على هكساغرام بالرقم أو الاسم الإنجليزي أو البينيين، أو صفِّ القائمة بحسب الرسم الثلاثي العلوي أو السفلي.",
    libraryMutationsBullet:
      "تسرد كل صفحة هكساغرام تحولاتها الستة المحتملة: أي هكساغرام ينتج عند تغيّر خط معيّن، لتستكشف شبكة الهكساغرامات المرتبطة.",
    libraryCommentaryScopeBullet:
      "هذا التعليق الكلاسيكي مخصص للدراسة داخل المكتبة فقط. لا يُرسل أبدًا إلى الذكاء الاصطناعي أثناء استشارة فعلية.",

  },
  hi: {
    title: "उपयोगकर्ता मार्गदर्शिका",
    leadPart1: "यह ऐप दो परामर्श शैलियों में उपलब्ध है: ",
    leadPart2: " और ",
    leadPart3:
      "। यह प्रतीकात्मक चिंतन और मार्गदर्शन का उपकरण है। यह चिकित्सा, वित्तीय या किसी अन्य पेशेवर सलाह का विकल्प नहीं है।",
    bonesLabel: "हड्डियाँ",
    privacyHeading: "गोपनीयता",
    privacyLi1:
      "आपकी चैट और छवियाँ आपके खाते से जुड़ी हैं और केवल लॉग इन रहने पर ही पहुँच योग्य हैं।",
    privacyLi2:
      "सेवा आपके इतिहास या परामर्श विषयों को आपके प्रमाणित पहुँच के बाहर उजागर नहीं करती।",
    privacyLi3:
      "यदि आप अपने डिवाइस पर रिकॉर्ड रखना चाहते हैं, तो आप अपने विवेक से पठन छवि डाउनलोड कर सकते हैं और विकल्प से वर्तमान थ्रेड को PDF में निर्यात कर सकते हैं; वे फ़ाइलें स्थानीय रूप से बनती हैं और उनकी देखभाल आपकी जिम्मेदारी है।",
    optionsHeading: "विकल्प (नीचे का पैनल)",
    optionsIntro:
      "विकल्प में आप परामर्श प्रकार (I Ching या हड्डियाँ) चुनते हैं; I Ching के साथ कास्ट मोड (स्वचालित या मैन्युअल) भी, सक्रिय थ्रेड की अनुमत गहराई, टोकन और 2FA प्रबंधित करते हैं, और नीचे दस्तावेज़ीकरण, गोपनीयता और शर्तों के लिंक होते हैं।",
    libraryFeatureBody:
      "हमारे पास एक पुस्तकालय है जहाँ आप कार्य के तीन मुख्य स्रोतों का उपयोग करके गहन परामर्श कर सकते हैं: विल्हेल्म (1924) का शास्त्रीय अनुवाद, जेम्स लेग संस्करण, और मूल झोउ यी। यह अनुभाग आपको अपने उत्तरों या मैन्युअल कास्ट की तुलना गंभीर I Ching अध्ययन के लिए डिज़ाइन किए गए प्रामाणिक लेखों से करने की अनुमति देता है। स्रोतों की पूर्ण प्रामाणिकता बनाए रखने के लिए लेखों को उनके मूल प्रारूप में प्रस्तुत किया गया है।",
    methodsHeading: "विधियों का उपयोग कैसे करें",
    methodsIntro:
      "I Ching और हड्डियाँ अलग विधियाँ हैं। I Ching हेक्साग्राम और रेखाओं के माध्यम से पढ़ता है और दो कास्टिंग मोड प्रदान करता है: तीन सिक्के और यारो छड़ें। हड्डियाँ अपनी अलग प्रणाली से चलती हैं, हेक्साग्राम के बिना।",
    ichingTraditionNote:
      "डिफ़ॉल्ट रूप से, यह ऐप अल्फ्रेड हुआंग की एक-रेखा न्यूनीकरण प्रणाली को लागू करता है, जिसमें झू शी की शास्त्रीय संरचना इसके ऐतिहासिक आधार के रूप में है। विकल्पों में 'परिवर्तनशील रेखाओं का पठन' चयनकर्ता सक्रिय करके आप इसके बदले झू शी की शास्त्रीय पठन शैली उपयोग कर सकते हैं; दोनों स्थितियों में, परिवर्तनशील रेखाओं का हर संयोजन हमेशा एक सटीक मार्गदर्शक पाठ उत्पन्न करता है।",
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
      "विकल्पों में I Ching चुनने पर आप कास्ट मोड चुन सकते हैं। दोनों स्थितियों में सर्वर समान शास्त्रीय रेखा-चयन नियम और समान पाठ आधार लागू करता है; केवल यह बदलता है कि व्याख्या से पहले छह रेखाएँ कौन तय करता है।",
    ichingCastAutoLi:
      "स्वचालित: भेजने पर अनुष्ठान चित्रण चलाता है और छह रेखाएँ सर्वर पर बनती हैं।",
    ichingCastManualLi:
      "मैन्युअल: सहायक खुलता है ताकि नीचे से ऊपर रेखाएँ दर्ज कर सकें। तीन सिक्कों के साथ प्रति रेखा चित/पट दर्ज करें; यारो छड़ों के साथ अपनी वास्तविक कास्ट को चरण-दर-चरण रिकॉर्ड करें। छह रेखाओं के बाद हेक्साग्राम पूर्वावलोकन दिखता है; अपने भौतिक फेंक को सटीक दर्शाना आपकी जिम्मेदारी है।",
    tokensHeading: "टोकन, सीमाएँ और पैक",
    tokensIntro:
      "हर परामर्श पर एक टोकन खर्च होता है। शेष राशि संचयी है: पैक आपकी मौजूदा शेष राशि में जुड़ते हैं। पैक के अनुसार जो बदलता है वह है शेष राशि का आकार और एक ही थ्रेड में कितने श्रृंखलाबद्ध पठन समाते हैं। मास्टर (3) संश्लेषण प्रति परामर्श 2 टोकन खर्च करता है।",
    exportHeading: "निर्यात और सहेजना",
    exportBody:
      "विकल्प पैनल से आप जब चाहें पठन छवि डाउनलोड कर सकते हैं और सक्रिय चैट का PDF बना सकते हैं। यह वैकल्पिक है और अपने डिवाइस पर प्रति रखने के लिए है। PDF ब्राउज़र में बनता है; यह ऐप इतिहास को प्रतिस्थापित नहीं करता। PDF में उस परामर्श में उपयोग किया गया अनुवादक और रेखा-पठन प्रणाली शामिल होती है।",
    s1Heading: "परामर्श मोड (मुख्य चयनकर्ता)",
    s1Iching: "गहन चिंतन और खुले प्रश्नों के लिए हेक्साग्राम और परिवर्तित रेखाओं पर आधारित पठन।",
    s1Bones: "निर्णयों की वैधता और तत्काल दिशा के लिए दरार पैटर्न पर आधारित हाँ/नहीं पठन।",
    s3Heading: "सत्र और संदेश (चैट प्रबंधन)",
    s3NewSessionTitle: "नया सत्र",
    s3NewSession: "अपनी विषयगत निरंतरता के साथ एक नई चैट शुरू करता है।",
    s3HistoryTitle: "चैट इतिहास",
    s3History: "आपकी पिछली परामर्शों, व्याख्याओं और छवियों तक पहुँच। विशिष्ट थ्रेड की समीक्षा या हटाने की सुविधा।",
    translatorsHeading: "ज्ञान के स्तंभ (अनुवादक)",
    translatorsWilhelm: "मनोवैज्ञानिक और काव्यात्मक व्याख्या (Free/Seeker स्तर)।",
    translatorsLegge: "संरचनात्मक और ऐतिहासिक दृष्टिकोण (Seeker स्तर)।",
    translatorsZhouyi: "शास्त्रीय चीनी में शुद्ध विहित पाठ (Practitioner स्तर)।",
    translatorsMaster: "अंतिम निर्णय के लिए तीनों परंपराओं का वैयक्तिकृत महारत संश्लेषण (Master स्तर)।",
    lineReadingHeading: "परिवर्तनशील रेखाओं का पठन",
    s6Heading: "पुस्तकालय और दस्तावेज़ीकरण",
    s6LibraryTitle: "हेक्साग्राम पुस्तकालय",
    s6Library: "सभी 64 हेक्साग्राम और कार्यों का सीधा परामर्श।",
    s6DocsTitle: "दस्तावेज़ीकरण",
    s6Docs: "उपयोगकर्ता मार्गदर्शिका · विधि नोट्स और उत्पत्ति (I Ching और हड्डियाँ) · गोपनीयता नीति · सेवा की शर्तें · अक्सर पूछे जाने वाले प्रश्न · ऐप के बारे में।",
    libraryTabsBullet:
      "हर हेक्साग्राम पेज में तीन टैब होते हैं: विल्हेम (1924), जेम्स लेग, और शास्त्रीय चीनी भाषा में मूल झोउ यी पाठ।",
    libraryCommentaryBullet:
      "विल्हेम और लेग के टैब में एक वैकल्पिक शास्त्रीय टिप्पणी जोड़ी गई है, जो निर्णय, छवि और हर रेखा के पास एक छोटे \"+\" के रूप में दिखती है। यह विद्वान की अपनी टिप्पणियाँ खोलती है (विल्हेम की टिप्पणी और कन्फ्यूशियाई दस पंख; लेग के नोट्स और उनका महान व लघु प्रतीकवाद), बिना मूल पाठ को बदले।",
    libraryWenYenBullet:
      "हेक्साग्राम 1 और 2 में एक अतिरिक्त समापन टिप्पणी, वेन यान (\"पाठ पर शब्द\"), शामिल है, जो विल्हेम के मूल संस्करण में केवल इन्हीं दो हेक्साग्रामों में मौजूद है।",
    librarySearchBullet:
      "खोज बॉक्स से किसी हेक्साग्राम को संख्या, अंग्रेज़ी नाम या पिनयिन से खोजें, या सूची को ऊपरी या निचले त्रिग्राम से फ़िल्टर करें।",
    libraryMutationsBullet:
      "हर हेक्साग्राम पेज अपने छह संभावित परिवर्तन सूचीबद्ध करता है: कोई विशेष रेखा बदलने पर कौन-सा हेक्साग्राम बनता है, ताकि आप संबंधित हेक्साग्रामों के जाल को देख सकें।",
    libraryCommentaryScopeBullet:
      "यह शास्त्रीय टिप्पणी केवल लाइब्रेरी के भीतर अध्ययन के लिए है। यह किसी वास्तविक सलाह के दौरान AI को कभी नहीं भेजी जाती।",

  },
};

export function getGuiaPageUiMessages(locale: AppLocale): GuiaPageUiMessages {
  return GUIA_PAGE_UI[locale] ?? GUIA_PAGE_UI[DEFAULT_LOCALE];
}
