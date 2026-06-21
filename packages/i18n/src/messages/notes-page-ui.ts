import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type NotesPageUiMessages = {
  title: string;
  lead: string;
  authNotice: string;
  ichingHeading: string;
  ichingOriginHeading: string;
  ichingOriginBody: string;
  ichingHexHeading: string;
  ichingHexBody: string;
  /** Caption shown above the grid that lists every King Wen hexagram. */
  ichingHexListHeading: string;
  ichingHexListIntro: string;
  ichingHexListAriaLabel: string;
  ichingMethodHeading: string;
  ichingMethodBody: string;
  ichingWilhelmHeading: string;
  ichingWilhelmBody: string;
  ichingLeggeHeading: string;
  ichingLeggeBody: string;
  ichingZhouyiHeading: string;
  ichingZhouyiBody: string;
  ichingDataAuditHeading: string;
  ichingDataAuditBody: string;
  bonesHeading: string;
  bonesOriginHeading: string;
  bonesOriginBody: string;
  bonesVerdictsHeading: string;
  bonesVerdictAuspClear: string;
  bonesVerdictAuspMod: string;
  bonesVerdictInauspMod: string;
  bonesVerdictInauspClear: string;
  yarrowHeading: string;
  yarrowOriginHeading: string;
  yarrowOriginBody: string;
  yarrowProbHeading: string;
  yarrowProbBody: string;
  translationsHeading: string;
  lineReadingHeading: string;
  lineReadingIntroBody: string;
  lineReadingHuangHeading: string;
  lineReadingHuangBody: string;
  lineReadingZhuxiHeading: string;
  lineReadingZhuxiBody: string;
  interpretHeading: string;
  interpretBody: string;
  sourcesHeading: string;
  sourcesList: string[];
};

const NOTES_PAGE_UI: Record<AppLocale, NotesPageUiMessages> = {
  es: {
    title: "Notas y Origen de los Métodos",
    lead: "Esta página es contexto técnico-cultural. No es una guía de uso.",
    authNotice:
      "Todos los métodos usados en esta app provienen de tradiciones milenarias de la cultura china, documentadas históricamente y respetadas académicamente en todo el mundo. Esta app no inventa interpretaciones ni genera significados propios; aplica métodos auténticos asistidos por tecnología de inteligencia artificial para hacerlos accesibles en el idioma del usuario. Cualquier lector puede contrastar los textos con las fuentes originales listadas al final de esta página.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origen histórico (~1000 a.C.)",
    ichingOriginBody:
      "El Zhouyi, «Los Cambios de Zhou», es uno de los textos más antiguos de la humanidad. Sus raíces se remontan a la dinastía Zhou (1046-256 a.C.). El texto se construyó en capas históricas: el Rey Wen organizó los 64 hexagramas y escribió los Juicios (guàcí) mientras estaba prisionero. Su hijo, el Duque de Zhou, añadió las sentencias de las seis líneas (yáocí). Siglos después, Confucio y sus discípulos agregaron los Comentarios conocidos como las Diez Alas (十翼), el estrato filosófico más profundo del texto.",
    ichingHexHeading: "El sistema de los 64 hexagramas",
    ichingHexBody:
      "Cada hexagrama es una figura de seis líneas, cada una yin (rota) o yang (entera). Las 64 combinaciones posibles describen los patrones fundamentales del cambio. Las líneas en movimiento indican transformación: el hexagrama presente muta hacia uno futuro, y esa transición es el corazón de la lectura.",
    ichingHexListHeading: "",
    ichingHexListIntro: "",
    ichingHexListAriaLabel: "",
    ichingMethodHeading: "El método de las tres monedas",
    ichingMethodBody:
      "El método clásico de monedas lanza tres monedas seis veces y construye el hexagrama línea a línea. Es más rápido que las varillas de milenrama y produce el mismo tipo de resultado: líneas enteras (yang) y partidas (yin), algunas en movimiento. Cómo se leen luego esas líneas en movimiento es una cuestión aparte, que se aborda en la siguiente sección.",
    ichingWilhelmHeading: "La traducción Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm produjo en 1924 la traducción más completa y respetada del I Ching en lengua occidental. Cary Baynes la tradujo al inglés en 1950 (Princeton University Press). Esta app usa los pasajes del oráculo (juicio, imagen y líneas) como texto base, sin parafrasear ni reescribir.",
    ichingLeggeHeading: "La traducción de James Legge",
    ichingLeggeBody:
      "James Legge, un misionero y sinólogo escocés, tradujo el I Ching en 1882 como parte de su obra monumental 'The Sacred Books of the East'. Su enfoque fue estrictamente filológico y académico, buscando descifrar el significado literal de los textos confucianos y pre-confucianos. Su versión aporta un rigor interpretativo invaluable.",
    ichingZhouyiHeading: "El texto original Zhou Yi",
    ichingZhouyiBody:
      "El Zhou Yi original (literalmente 'Cambios de Zhou') es el núcleo del I Ching, compuesto por los 64 hexagramas, los juicios del Rey Wen y las líneas del Duque de Zhou, sin los comentarios confucianos posteriores (las Diez Alas). Esta fuente permite conectar directamente con la capa chamánica y más antigua del oráculo.",
    ichingDataAuditHeading: "Auditorías de fidelidad 1:1",
    ichingDataAuditBody:
      "Última auditoría: 21 de junio de 2026. Legge y Zhou Yi (juicio, imagen y líneas) coinciden al 100% con sacred-texts.com y ctext.org. Wilhelm coincide al 100% con 6 suplementos documentados donde el mirror de Parma omite el pasaje por completo: el juicio del hexagrama 56 (El Viajero, contrastado con wengu e iching-online) y 5 líneas individuales (hex 20 línea 5; hex 21 líneas 2 y 3; hex 26 línea 3; hex 52 línea 2; restauradas del texto previamente publicado). Los nombres de campo del dataset y la estructura JSON no cambiaron.",
    bonesHeading: "Huesos de Oráculo (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Origen histórico (Dinastía Shang, ~1600-1046 a.C.)",
    bonesOriginBody:
      "La práctica oracular documentada más antigua de China. Los chamanes reales aplicaban calor a huesos o caparazones para leer las grietas resultantes. Esta app respeta la lógica estructural del sistema Shang: carga positiva, carga negativa y veredicto por patrón.",
    bonesVerdictsHeading: "Los cuatro estados del veredicto:",
    bonesVerdictAuspClear: "吉. Favorable claro.",
    bonesVerdictAuspMod: "吉 moderado. Favorable con matices.",
    bonesVerdictInauspMod: "凶 moderado. Desfavorable con reservas.",
    bonesVerdictInauspClear: "凶. Desfavorable claro.",
    yarrowHeading: "Varillas de Milenrama (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origen histórico (~1000 a.C.)",
    yarrowOriginBody:
      "Es el procedimiento descrito en el Gran Comentario (Dàzhuàn). El método precisa: «El número de la Gran Expansión es 50, de los que se usan 49». El método es anterior al de tres monedas en más de un milenio. Richard Wilhelm documentó el procedimiento completo en su obra de 1924, rescatando un ritmo ritual más lento, táctil y deliberado que el de las monedas.",
    yarrowProbHeading: "",
    yarrowProbBody: "",
    translationsHeading: "Las traducciones",
    lineReadingHeading: "La lectura de las líneas cambiantes",
    lineReadingIntroBody:
      "Cuando una tirada produce líneas en movimiento, el hexagrama presente se transforma en un segundo. Surge entonces una pregunta: ¿qué texto gobierna la lectura? A lo largo de los siglos cristalizaron dos grandes respuestas. Por defecto, esta app aplica el sistema de reducción de Alfred Huang, y desde el panel de opciones puedes cambiar a la lectura clásica de Zhu Xi. Ambos son métodos auténticos; ninguno se inventa aquí. Elijas el que elijas, cada combinación de líneas produce siempre un único texto guía preciso.",
    lineReadingHuangHeading: "El sistema de Alfred Huang (por defecto)",
    lineReadingHuangBody:
      "Alfred Huang (1921 a 2014) fue un erudito chino y maestro taoísta que, tras sobrevivir al encarcelamiento durante la Revolución Cultural, llevó la tradición a Occidente en 'The Complete I Ching' (1998). Su lectura reduce cualquier número de líneas en movimiento a un único texto rector mediante reglas posicionales claras: con una línea en movimiento gobierna su propio texto; con dos de polaridad opuesta gobierna la línea yin; con dos de la misma polaridad gobierna la inferior; con tres gobierna la del medio; con cuatro o cinco la lectura pasa al hexagrama transformado; con seis líneas en movimiento (y con ninguna) solo se lee el Juicio. El resultado es siempre un texto inequívoco, y por eso la app lo usa por defecto.",
    lineReadingZhuxiHeading: "La lectura clásica de Zhu Xi",
    lineReadingZhuxiBody:
      "Zhu Xi (1130 a 1200) fue el gran filósofo neoconfuciano que sistematizó la práctica de los Cambios en su 'Yijing benyi' (El significado original del Yijing). Sus reglas son más antiguas y de más capas, y a menudo leen más de un texto: con dos líneas en movimiento lee ambas, dando precedencia a la superior; con tres pondera los Juicios de ambos hexagramas con ayuda de un conjunto de diagramas; con cuatro o cinco lee las líneas estables del hexagrama transformado. Elegir este sistema en el panel de opciones aplica fielmente esas alternativas clásicas, caso por caso.",
    interpretHeading: "Por qué la IA no inventa",
    interpretBody:
      "La inteligencia artificial en esta app tiene una función específica y acotada: tomar el resultado del algoritmo (hexagramas, líneas en movimiento o veredicto de grietas) y articularlo en lenguaje natural con el contexto de la pregunta del usuario.\n\nLa IA no genera hexagramas, no decide veredictos, ni modifica los textos de Wilhelm, Legge ni del Zhou Yi. El algoritmo matemático realiza el proceso técnico-tradicional fielmente antes de que la IA intervenga. La IA es el intérprete; el oráculo es el método.",
    sourcesHeading: "Fuentes y Referencias Académicas",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  en: {
    title: "Method Notes and Origins",
    lead: "This page provides technical and cultural context. It is not a usage guide.",
    authNotice:
      "All methods used in this app stem from millennial traditions of Chinese culture, historically documented and academically respected worldwide. This app does not invent interpretations or generate its own meanings; it applies authentic methods assisted by artificial intelligence to make them accessible in the user's language. Readers may verify the texts against the original sources listed at the bottom of this page.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Historical Origins (~1000 BCE)",
    ichingOriginBody:
      "The Zhouyi, 'The Changes of Zhou', is one of the oldest texts in human history. Its roots trace back to the Zhou dynasty (1046-256 BCE). The text was built in historical layers: King Wen organized the 64 hexagrams and wrote the Judgments (guàcí) while imprisoned. His son, the Duke of Zhou, added the statements for the six lines (yáocí). Centuries later, Confucius and his disciples added the Commentaries known as the Ten Wings (十翼), the deepest philosophical stratum of the text.",
    ichingHexHeading: "The 64-Hexagram System",
    ichingHexBody:
      "Each hexagram is a figure composed of six lines, either yin (broken) or yang (solid). The 64 possible combinations describe the fundamental patterns of change. Moving lines indicate transformation: the present hexagram mutates into a future one, and this transition is the heart of the reading.",
    ichingHexListHeading: "The 64 hexagrams in King Wen order",
    ichingHexListIntro:
      "Complete list of the 64 hexagrams with their number, glyph, and classical name in Chinese and pinyin. Their meaning is not included here: each hexagram only takes shape inside a specific consultation, where the question and the seeker's context determine the reading.",
    ichingHexListAriaLabel: "List of the 64 hexagrams",
    ichingMethodHeading: "The Three-Coin Method",
    ichingMethodBody:
      "The classic coin method casts three coins six times, building the hexagram one line at a time. It is faster than the yarrow stalks and produces the same kind of result: solid (yang) and broken (yin) lines, some of them moving. How those moving lines are then read is a separate matter, addressed in the next section.",
    ichingWilhelmHeading: "The Wilhelm/Baynes Translation",
    ichingWilhelmBody:
      "Richard Wilhelm produced in 1924 the most complete and respected translation of the I Ching in Western languages. Cary Baynes translated it into English in 1950 (Princeton University Press). This app uses the oracle passages (judgment, image, and line texts) as the base text, without paraphrase or editorial rewriting.",
    ichingLeggeHeading: "The James Legge Translation",
    ichingLeggeBody:
      "James Legge, a Scottish missionary and sinologist, translated the I Ching in 1882 as part of his monumental work 'The Sacred Books of the East'. His approach was strictly philological and academic, seeking to decipher the literal meaning of Confucian and pre-Confucian texts. His version brings an invaluable interpretive rigor.",
    ichingZhouyiHeading: "The Original Zhou Yi Text",
    ichingZhouyiBody:
      "The original Zhou Yi (literally 'Changes of Zhou') is the core of the I Ching, composed of the 64 hexagrams, King Wen's judgments, and the Duke of Zhou's lines, without the later Confucian commentaries (the Ten Wings). This source allows a direct connection with the shamanic and oldest layer of the oracle.",
    ichingDataAuditHeading: "1:1 data fidelity audits",
    ichingDataAuditBody:
      "Last audit: 21 June 2026. Legge and Zhou Yi oracle texts (judgment, image, and lines) match sacred-texts.com and ctext.org at 100%. Wilhelm matches at 100% with 6 documented supplements where the Parma mirror omits the passage entirely: hex 56 (The Wanderer) judgment (cross-checked with wengu and iching-online) and 5 individual changing lines (hex 20 line 5; hex 21 lines 2 and 3; hex 26 line 3; hex 52 line 2; restored from the previously published text). Dataset field names and JSON structure are unchanged.",
    bonesHeading: "Oracle Bones (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Historical Origins (Shang Dynasty, ~1600-1046 BCE)",
    bonesOriginBody:
      "The oldest documented oracular practice in China. Royal shamans applied heat to bones or shells to read the resulting cracks. This app respects the structural logic of the Shang system: positive charge, negative charge, and verdict by pattern.",
    bonesVerdictsHeading: "The Four Verdict States:",
    bonesVerdictAuspClear: "吉. Clearly favorable.",
    bonesVerdictAuspMod: "吉 moderate. Favorable with nuance.",
    bonesVerdictInauspMod: "凶 moderate. Unfavorable with reservations.",
    bonesVerdictInauspClear: "凶. Clearly unfavorable.",
    yarrowHeading: "Yarrow Stalks (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Historical Origins (~1000 BCE)",
    yarrowOriginBody:
      "This is the procedure described in the Great Commentary (Dàzhuàn). The method specifies: 'The number of the Great Expansion is 50, of which 49 are used.' This method predates the three-coin method by over a millennium. Richard Wilhelm documented the full procedure in his 1924 work, preserving a slower, more tactile, and deliberate ritual rhythm compared to coins.",
    yarrowProbHeading: "Character of the method",
    yarrowProbBody:
      "The stalk method preserves a slower ritual tempo than the three-coin method. In this app, its value is not presented as a technical table, but as a different way of entering the same I Ching tradition: more tactile, more deliberate, and closer to the classical procedure documented by Wilhelm/Baynes. The three-coin method remains equally valid for a faster consultation.",
    translationsHeading: "The Translations",
    lineReadingHeading: "Reading the Changing Lines",
    lineReadingIntroBody:
      "When a cast produces moving lines, the present hexagram transforms into a second one. A question follows: which text governs the reading? Across the centuries two great answers took shape. By default this app applies Alfred Huang's reduction system, and from the options panel you can switch to Zhu Xi's classical reading. Both are authentic methods; neither is invented here. Whichever you choose, every combination of lines always yields a single, precise governing text.",
    lineReadingHuangHeading: "Alfred Huang's system (default)",
    lineReadingHuangBody:
      "Alfred Huang (1921 to 2014) was a Chinese scholar and Taoist master who, after surviving imprisonment during the Cultural Revolution, brought the tradition to the West in 'The Complete I Ching' (1998). His reading reduces any number of moving lines to a single governing text through clear positional rules: with one moving line, its own text governs; with two of opposite polarity, the yin line governs; with two of the same polarity, the lower line governs; with three, the middle one governs; with four or five, the reading shifts to the transformed hexagram; with six moving lines (and with none), only the Judgment is read. The outcome is always one unambiguous text, which is why the app uses it as the default.",
    lineReadingZhuxiHeading: "Zhu Xi's classical reading",
    lineReadingZhuxiBody:
      "Zhu Xi (1130 to 1200) was the great Neo-Confucian philosopher who systematized the practice of the Changes in his 'Yijing benyi' (The Original Meaning of the Yijing). His rules are older and more layered, and often read more than one text: with two moving lines he reads both, giving precedence to the upper; with three he weighs the Judgments of both hexagrams with the help of a set of charts; with four or five he reads the stable lines of the transformed hexagram. Selecting this system in the options panel applies these classical alternatives faithfully, case by case.",
    interpretHeading: "Why AI Does Not Invent",
    interpretBody:
      "The artificial intelligence in this app has a specific and bounded function: to take the result of the algorithm (hexagrams, moving lines, or crack verdicts) and articulate it in natural language with the context of the user's question. The AI does not generate hexagrams, does not decide verdicts, and does not modify the texts of Wilhelm, Legge, or the Zhou Yi. The mathematical algorithm performs the technical-traditional process faithfully before the AI intervenes. The AI is the interpreter; the oracle is the method.",
    sourcesHeading: "Academic Sources and References",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  pt: {
    title: "Notas e Origem dos Métodos",
    lead: "Esta página fornece contexto técnico e cultural. Não é um guia de uso.",
    authNotice:
      "Todos os métodos usados nesta app provêm de tradições milenares da cultura chinesa, documentadas historicamente e respeitadas academicamente em todo o mundo. Esta app não inventa interpretações nem gera significados próprios; aplica métodos auténticos assistidos por tecnologia de inteligência artificial para os tornar acessíveis no idioma do utilizador. Qualquer leitor pode verificar os textos com as fontes originais listadas no final desta página.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origem histórica (~1000 a.C.)",
    ichingOriginBody:
      "O Zhouyi, «As Mutações de Zhou», é um dos textos mais antigos da humanidade. As suas raízes remontam à dinastia Zhou (1046-256 a.C.). O texto foi construído em camadas históricas: o Rei Wen organizou os 64 hexagramas e escreveu os Juízos (guàcí) enquanto estava prisioneiro. O seu filho, o Duque de Zhou, acrescentou as sentenças das seis linhas (yáocí). Séculos depois, Confúcio e os seus discípulos acrescentaram os Comentários conhecidos como as Dez Asas (十翼), o estrato filosófico mais profundo do texto.",
    ichingHexHeading: "O sistema dos 64 hexagramas",
    ichingHexBody:
      "Cada hexagrama é uma figura composta por seis linhas, cada uma yin (quebrada) ou yang (inteira). As 64 combinações possíveis descrevem os padrões fundamentais da mudança. As linhas em movimento indicam transformação: o hexagrama presente muta para um futuro, e essa transição é o coração da leitura.",
    ichingHexListHeading: "Os 64 hexagramas em ordem King Wen",
    ichingHexListIntro:
      "Listagem completa dos 64 hexagramas com o seu número, glifo e nome clássico em chinês e pinyin. O significado não é apresentado aqui: cada hexagrama só ganha sentido numa consulta concreta, onde a pergunta e o contexto do consultante determinan a leitura.",
    ichingHexListAriaLabel: "Listagem dos 64 hexagramas",
    ichingMethodHeading: "O método das três moedas",
    ichingMethodBody:
      "O método clássico de moedas lança três moedas seis vezes e constrói o hexagrama linha a linha. É mais rápido do que as varetas de milenrama e produz o mesmo tipo de resultado: linhas inteiras (yang) e quebradas (yin), algumas em movimento. Como se leem depois essas linhas em movimento é uma questão à parte, abordada na secção seguinte.",
    ichingWilhelmHeading: "A tradução Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm produziu em 1924 a tradução mais completa e respeitada do I Ching em língua ocidental. Cary Baynes traduziu-a para inglês em 1950 (Princeton University Press). Esta obra é o texto base desta app, sem modificações nem simplificações.",
    ichingLeggeHeading: "A tradução de James Legge",
    ichingLeggeBody:
      "James Legge, um missionário e sinólogo escocês, traduziu o I Ching em 1882 como parte da sua obra monumental 'The Sacred Books of the East'. A sua abordagem foi estritamente filológica e académica, procurando decifrar o significado literal dos textos confucianos e pré-confucianos. A sua versão traz um rigor interpretativo inestimável.",
    ichingZhouyiHeading: "O texto original Zhou Yi",
    ichingZhouyiBody:
      "O Zhou Yi original (literalmente 'Mutações de Zhou') é o núcleo do I Ching, composto pelos 64 hexagramas, os juízos do Rei Wen e as linhas do Duque de Zhou, sem os comentários confucianos posteriores (as Dez Asas). Esta fonte permite uma ligação direta à camada xamânica e mais antiga do oráculo.",
    ichingDataAuditHeading: "Auditorias de fidelidade 1:1",
    ichingDataAuditBody:
      "Última auditoria: 21 de junho de 2026. Legge e Zhou Yi (julgamento, imagem e linhas) coincidem a 100% com sacred-texts.com e ctext.org. Wilhelm coincide a 100% com 6 suplementos documentados onde o espelho de Parma omite a passagem por completo: o julgamento do hexagrama 56 (O Viajante, verificado com wengu e iching-online) e 5 linhas individuais (hex 20 linha 5; hex 21 linhas 2 e 3; hex 26 linha 3; hex 52 linha 2; restauradas do texto previamente publicado). Os nomes de campo do dataset e a estrutura JSON não mudaram.",
    bonesHeading: "Ossos Oraculares (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Origem histórica (Dinastía Shang, ~1600-1046 a.C.)",
    bonesOriginBody:
      "A prática oracular documentada mais antiga da China. Os xamãs reais aplicavam calor a ossos ou carapaças para ler as fissuras resultantes. Esta app respeita a lógica estrutural do sistema Shang: carga positiva, carga negativa e veredicto por padrão.",
    bonesVerdictsHeading: "Os quatro estados do veredicto:",
    bonesVerdictAuspClear: "吉. Favorável claro.",
    bonesVerdictAuspMod: "吉 moderado. Favorável com nuances.",
    bonesVerdictInauspMod: "凶 moderado. Desfavorável com reservas.",
    bonesVerdictInauspClear: "凶. Desfavorável claro.",
    yarrowHeading: "Varetas de Milenrama (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origem histórica (~1000 a.C.)",
    yarrowOriginBody:
      "É o procedimento descrito no Grande Comentário (Dàzhuàn). O método especifica: «O número da Grande Expansão é 50, dos quais 49 são usados». O método é anterior ao das três moedas em mais de um milénio. Richard Wilhelm documentou o procedimento completo na sua obra de 1924, resgatando um ritmo ritual mais lento, tátil e deliberado do que o das moedas.",
    yarrowProbHeading: "Caráter do método",
    yarrowProbBody:
      "O método das varetas preserva um ritmo ritual mais lento do que o das três moedas. Nesta app, o seu valor não é apresentado como uma tabela técnica, mas como uma forma diferente de entrar na mesma tradição do I Ching: mais tátil, mais deliberada e mais próxima do procedimento clássico documentado por Wilhelm/Baynes. O método das três moedas continua igualmente válido para uma consulta mais rápida.",
    translationsHeading: "As traduções",
    lineReadingHeading: "A leitura das linhas em movimento",
    lineReadingIntroBody:
      "Quando uma tirada produz linhas em movimento, o hexagrama presente transforma-se num segundo. Surge então uma pergunta: que texto governa a leitura? Ao longo dos séculos cristalizaram-se duas grandes respostas. Por predefinição, esta app aplica o sistema de redução de Alfred Huang, e a partir do painel de opções pode mudar para a leitura clássica de Zhu Xi. Ambos são métodos autênticos; nenhum é inventado aqui. Escolha o que escolher, cada combinação de linhas produz sempre um único texto guia preciso.",
    lineReadingHuangHeading: "O sistema de Alfred Huang (predefinido)",
    lineReadingHuangBody:
      "Alfred Huang (1921 a 2014) foi um erudito chinês e mestre taoista que, depois de sobreviver ao encarceramento durante a Revolução Cultural, levou a tradição ao Ocidente em 'The Complete I Ching' (1998). A sua leitura reduz qualquer número de linhas em movimento a um único texto regente através de regras posicionais claras: com uma linha em movimento governa o seu próprio texto; com duas de polaridade oposta governa a linha yin; com duas da mesma polaridade governa a inferior; com três governa a do meio; com quatro ou cinco a leitura passa para o hexagrama transformado; com seis linhas em movimento (e com nenhuma) lê-se apenas o Juízo. O resultado é sempre um texto inequívoco, e por isso a app o usa por predefinição.",
    lineReadingZhuxiHeading: "A leitura clássica de Zhu Xi",
    lineReadingZhuxiBody:
      "Zhu Xi (1130 a 1200) foi o grande filósofo neoconfuciano que sistematizou a prática das Mutações no seu 'Yijing benyi' (O significado original do Yijing). As suas regras são mais antigas e de mais camadas, e muitas vezes leem mais de um texto: com duas linhas em movimento lê ambas, dando precedência à superior; com três pondera os Juízos de ambos os hexagramas com a ajuda de um conjunto de diagramas; com quatro ou cinco lê as linhas estáveis do hexagrama transformado. Escolher este sistema no painel de opções aplica fielmente essas alternativas clássicas, caso a caso.",
    interpretHeading: "Por que a IA não inventa",
    interpretBody:
      "A inteligência artificial nesta app tem uma função específica e delimitada: tomar o resultado do algoritmo (hexagramas, linhas em movimento ou veredicto de fissuras) e articulá-lo em linguagem natural com o contexto da pergunta do utilizador. A IA não gera hexagramas, não decide veredictos, nem modifica os textos de Wilhelm. O algoritmo matemático realiza o processo técnico-tradicional fielmente antes de a IA intervir. A IA é o intérprete; o oráculo é o método.",
    sourcesHeading: "Fontes e Referências Acadêmicas",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  fr: {
    title: "Notes et origine des méthodes",
    lead: "Cette page fournit un contexte technique et culturel. Ce n'est pas un guide d'utilisation.",
    authNotice:
      "Toutes les méthodes utilisées dans cette app proviennent de traditions millénaires de la culture chinoise, historiquement documentées et académiquement respectées dans le monde entier. Cette app n'invente pas d'interprétations ni ne génère ses propres significations ; elle applique des méthodes authentiques assistées par la technologie de l'intelligence artificielle pour les rendre accessibles dans la langue de l'utilisateur. Tout lecteur peut vérifier les textes avec les sources originales listées à la fin de cette page.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origine historique (~1000 av. J.-C.)",
    ichingOriginBody:
      "Le Zhouyi, « Les Changements de Zhou », est l'un des textes plus anciens de l'humanité. Ses racines remontent à la dynastie Zhou (1046-256 av. J.-C.). Le texte a été construit en couches historiques : le Roi Wen a organisé les 64 hexagrammes et a écrit les Jugements (guàcí) pendant son emprisonnement. Son fils, le Duc de Zhou, a ajouté les sentences pour les six traits (yáocí). Des siècles plus tard, Confucius et ses disciples ont ajouté les Commentaires connus sous le nom des Dix Ailes (十翼), la strate philosophique la plus profonde du texte.",
    ichingHexHeading: "Le système des 64 hexagrammes",
    ichingHexBody:
      "Chaque hexagramme est une figure composée de six traits, chacun yin (brisé) ou yang (plein). Les 64 combinaisons possibles décrivent les modèles fondamentaux du changement. Les traits en mouvement indiquent une transformation : l'hexagramme présent mute en un futur, et cette transition est au cœur de la lecture.",
    ichingHexListHeading: "Les 64 hexagrammes selon l'ordre du Roi Wen",
    ichingHexListIntro:
      "Liste complète des 64 hexagrammes avec leur numéro, leur glyphe et leur nom classique en chinois et pinyin. Leur signification n'est pas incluse ici : chaque hexagramme ne prend sens que lors d'une consultation précise, où la question et le contexte du consultant déterminent la lecture.",
    ichingHexListAriaLabel: "Liste des 64 hexagrammes",
    ichingMethodHeading: "La méthode des trois pièces",
    ichingMethodBody:
      "La méthode classique des pièces lance trois pièces six fois et construit l'hexagramme trait par trait. Elle est plus rapide que les tiges d'achillée et produit le même type de résultat : des traits pleins (yang) et brisés (yin), certains en mouvement. La façon dont ces traits en mouvement sont ensuite lus est une question distincte, abordée dans la section suivante.",
    ichingWilhelmHeading: "La traduction Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm a produit en 1924 la traduction la plus complète et la plus respectée du I Ching en langue occidentale. Cary Baynes l'a traduite en anglais en 1950 (Princeton University Press). Cette œuvre constitue le texte base de cette app, sans modifications ni simplifications.",
    ichingLeggeHeading: "La traduction de James Legge",
    ichingLeggeBody:
      "James Legge, un missionnaire et sinologue écossais, a traduit le I Ching en 1882 dans le cadre de son œuvre monumentale 'The Sacred Books of the East'. Son approche était strictement philologique et académique, cherchant à déchiffrer le sens littéral des textes confucéens et pré-confucéens. Sa version apporte une rigueur interprétative inestimable.",
    ichingZhouyiHeading: "Le texte original Zhou Yi",
    ichingZhouyiBody:
      "Le Zhou Yi original (littéralement 'Changements de Zhou') est le noyau du I Ching, composé des 64 hexagrammes, des jugements du Roi Wen et des lignes du Duc de Zhou, sans les commentaires confucéens ultérieurs (les Dix Ailes). Cette source permet une connexion directe avec la couche chamanique et la plus ancienne de l'oracle.",
    ichingDataAuditHeading: "Audits de fidélité 1:1",
    ichingDataAuditBody:
      "Dernier audit : 21 juin 2026. Legge et Zhou Yi (jugement, image et lignes) concordent à 100 % avec sacred-texts.com et ctext.org. Wilhelm concorde à 100 % avec 6 suppléments documentés là où le miroir de Parma omet entièrement le passage : le jugement de l'hexagramme 56 (Le Voyageur, vérifié avec wengu et iching-online) et 5 lignes individuelles (hex 20 ligne 5 ; hex 21 lignes 2 et 3 ; hex 26 ligne 3 ; hex 52 ligne 2 ; restaurées à partir du texte précédemment publié). Les noms de champs du jeu de données et la structure JSON n'ont pas changé.",
    bonesHeading: "Os oraculaires (甲骨 · Jiǎgǔ)",
    bonesOriginHeading:
      "Origine historique (Dynastie Shang, ~1600-1046 av. J.-C.)",
    bonesOriginBody:
      "La pratique oraculaire documentée la plus ancienne de Chine. Les chamanes royaux appliquaient de la chaleur sur des os ou des écailles pour lire les fissures résultantes. Cette app respecte la logique structurelle du système Shang : charge positive, charge négative et verdict par motif.",
    bonesVerdictsHeading: "Les quatre états du verdict :",
    bonesVerdictAuspClear: "吉. Clairement favorable.",
    bonesVerdictAuspMod: "吉 modéré. Favorable avec nuances.",
    bonesVerdictInauspMod: "凶 modéré. Défavorable avec réserves.",
    bonesVerdictInauspClear: "凶. Clairement défavorable.",
    yarrowHeading: "Tiges d'Achillée (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origine historique (~1000 av. J.-C.)",
    yarrowOriginBody:
      "C'est le procédé décrit dans le Grand Commentaire (Dàzhuàn). Le méthode précise : « Le nombre de la Grande Expansion est 50, dont 49 sont utilisés ». Cette méthode est antérieure à celle des trois pièces de plus d'un millénaire. Richard Wilhelm a documenté le procédé complet dans son œuvre de 1924, préservant un rythme rituel plus lent, tactile et délibéré que celui des pièces.",
    yarrowProbHeading: "Caractère de la méthode",
    yarrowProbBody:
      "La méthode des tiges conserve un rythme rituel plus lent que celle des trois pièces. Dans cette app, sa valeur n'est pas présentée comme un tableau technique, mais comme une autre façon d'entrer dans la même tradition du I Ching : plus tactile, plus délibérée et plus proche du procédé classique documenté par Wilhelm/Baynes. La méthode des trois pièces reste tout aussi valide pour une consultation plus rapide.",
    translationsHeading: "Les traductions",
    lineReadingHeading: "La lecture des traits en mouvement",
    lineReadingIntroBody:
      "Lorsqu'un tirage produit des traits en mouvement, l'hexagramme présent se transforme en un second. Une question surgit alors : quel texte gouverne la lecture ? Au fil des siècles, deux grandes réponses ont pris forme. Par défaut, cette app applique le système de réduction d'Alfred Huang, et depuis le panneau d'options vous pouvez passer à la lecture classique de Zhu Xi. Les deux sont des méthodes authentiques ; aucune n'est inventée ici. Quel que soit votre choix, chaque combinaison de traits produit toujours un texte directeur unique et précis.",
    lineReadingHuangHeading: "Le système d'Alfred Huang (par défaut)",
    lineReadingHuangBody:
      "Alfred Huang (1921 à 2014) fut un érudit chinois et maître taoïste qui, après avoir survécu à l'emprisonnement durant la Révolution culturelle, apporta la tradition en Occident dans 'The Complete I Ching' (1998). Sa lecture réduit n'importe quel nombre de traits en mouvement à un seul texte directeur grâce à des règles positionnelles claires : avec un trait en mouvement, son propre texte gouverne ; avec deux de polarité opposée, le trait yin gouverne ; avec deux de même polarité, le trait inférieur gouverne ; avec trois, celui du milieu gouverne ; avec quatre ou cinq, la lecture passe à l'hexagramme transformé ; avec six traits en mouvement (et avec aucun), seul le Jugement est lu. Le résultat est toujours un texte sans ambiguïté, et c'est pourquoi l'app l'utilise par défaut.",
    lineReadingZhuxiHeading: "La lecture classique de Zhu Xi",
    lineReadingZhuxiBody:
      "Zhu Xi (1130 à 1200) fut le grand philosophe néoconfucéen qui systématisa la pratique des Changements dans son 'Yijing benyi' (Le sens originel du Yijing). Ses règles sont plus anciennes et plus stratifiées, et lisent souvent plus d'un texte : avec deux traits en mouvement, il lit les deux, en donnant la précédence au supérieur ; avec trois, il pèse les Jugements des deux hexagrammes à l'aide d'un ensemble de diagrammes ; avec quatre ou cinq, il lit les traits stables de l'hexagramme transformé. Choisir ce système dans le panneau d'options applique fidèlement ces alternatives classiques, au cas par cas.",
    interpretHeading: "Pourquoi l'IA n'invente pas",
    interpretBody:
      "L'intelligence artificielle dans cette app a une fonction spécifique et délimitée : prendre le résultat de l'algorithme (hexagrammes, traits en mouvement ou verdict de fissures) et l'articuler en langage naturel avec le contexte de la question de l'utilisateur. L'IA ne génère pas d'hexagrammes, ne décide pas des verdicts, et ne modifie pas les textes de Wilhelm. L'algorithme mathématique réalise le processus technico-traditionnel fidèlement avant que l'IA n'intervienne. L'IA est l'interprète ; l'oracle est la méthode.",
    sourcesHeading: "Sources et références académiques",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  de: {
    title: "Methodennotizen und Ursprünge",
    lead: "Diese Seite bietet technisch-kulturellen Kontext. Es ist keine Bedienungsanleitung.",
    authNotice:
      "Alle in dieser App verwendeten Methoden stammen aus jahrtausendealten Traditionen der chinesischen Kultur, historisch dokumentiert und weltweit akademisch anerkannt. Diese App erfindet keine Interpretationen und generiert keine eigenen Bedeutungen; sie wendet authentische Methoden an, die durch künstliche Intelligenz unterstützt werden, um sie in der Sprache des Nutzers zugänglich zu machen. Jeder Leser kann die Texte mit den am Ende dieser Seite aufgeführten Originalquellen vergleichen.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Historischer Ursprung (~1000 v. Chr.)",
    ichingOriginBody:
      "Das Zhouyi, «Die Wandlungen von Zhou», ist einer der ältesten Texte der Menschheit. Seine Wurzeln reichen bis in die Zhou-Dynastie (1046-256 v. Chr.). Der Text wurde in historischen Schichten aufgebaut: König Wen ordnete die 64 Hexagramme und verfasste die Urteile (guàcí) während seiner Gefangenschaft. Sein Sohn, der Herzog von Zhou, fügte die Liniensätze (yáocí) hinzu. Jahrhunderte später fügten Konfuzius und seine Schüler die als Zehn Flügel (十翼) bekannten Kommentare hinzu, das tiefste philosophische Stratum des Textes.",
    ichingHexHeading: "Das System der 64 Hexagramme",
    ichingHexBody:
      "Jedes Hexagramm ist eine Figur aus sechs Linien, jede entweder yin (gebrochen) oder yang (ganz). Die 64 möglichen Kombinationen beschreiben die grundlegenden Muster des Wandels. Bewegende Linien zeigen Transformation an: das gegenwärtige Hexagramm wandelt sich in ein zukünftiges, und dieser Übergang ist das Herzstück der Lesung.",
    ichingHexListHeading: "Die 64 Hexagramme in der Reihenfolge nach König Wen",
    ichingHexListIntro:
      "Vollständige Liste der 64 Hexagramme mit Nummer, Schriftzeichen und klassischem Namen in Chinesisch und Pinyin. Die Bedeutung wird hier nicht aufgeführt: Jedes Hexagramm gewinnt erst innerhalb einer konkreten Beratung Gestalt, in der Frage und Kontext der ratsuchenden Person die Lesung bestimmen.",
    ichingHexListAriaLabel: "Liste der 64 Hexagramme",
    ichingMethodHeading: "Die Drei-Münzen-Methode",
    ichingMethodBody:
      "Die klassische Münzmethode wirft sechsmal drei Münzen und baut das Hexagramm Linie für Linie auf. Sie ist schneller als die Schafgarbenstäbe und liefert dieselbe Art von Ergebnis: ganze (yang) und gebrochene (yin) Linien, einige davon bewegend. Wie diese bewegenden Linien dann gelesen werden, ist eine eigene Frage, die im nächsten Abschnitt behandelt wird.",
    ichingWilhelmHeading: "Die Übersetzung Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm erstellte 1924 die vollständigste und angesehenste Übersetzung des I Ching in westlicher Sprache. Cary Baynes übersetzte sie 1950 ins Englische (Princeton University Press). Dieses Werk ist der Grundtext dieser App, ohne Modifikationen oder Vereinfachungen.",
    ichingLeggeHeading: "Die Übersetzung von James Legge",
    ichingLeggeBody:
      "James Legge, ein schottischer Missionar und Sinologe, übersetzte das I Ging 1882 als Teil seines monumentalen Werkes 'The Sacred Books of the East'. Sein Ansatz war streng philologisch und akademisch und versuchte, die wörtliche Bedeutung konfuzianischer und vorkonfuzianischer Texte zu entschlüsseln. Seine Version bringt eine unschätzbare interpretative Strenge mit sich.",
    ichingZhouyiHeading: "Der ursprüngliche Zhou-Yi-Text",
    ichingZhouyiBody:
      "Das ursprüngliche Zhou Yi (wörtlich 'Wandlungen von Zhou') ist der Kern des I Ging, bestehend aus den 64 Hexagrammen, den Urteilen von König Wen und den Linien des Herzogs von Zhou, ohne die späteren konfuzianischen Kommentare (die Zehn Flügel). Diese Quelle ermöglicht eine direkte Verbindung mit der schamanischen und ältesten Schicht des Orakels.",
    ichingDataAuditHeading: "1:1-Datenfidelitätsprüfungen",
    ichingDataAuditBody:
      "Letzte Prüfung: 21. Juni 2026. Legge und Zhou Yi (Urteil, Bild und Linien) stimmen zu 100 % mit sacred-texts.com und ctext.org überein. Wilhelm stimmt zu 100 % überein mit 6 dokumentierten Ergänzungen, wo der Parma-Spiegel die Passage vollständig auslässt: Urteil von Hexagramm 56 (Der Wanderer, gegen wengu und iching-online geprüft) sowie 5 einzelne Linien (Hexagramm 20 Linie 5; Hexagramm 21 Linien 2 und 3; Hexagramm 26 Linie 3; Hexagramm 52 Linie 2; aus dem zuvor veröffentlichten Text wiederherstellt). Feldnamen und JSON-Struktur des Datensatzes sind unverändert.",
    bonesHeading: "Orakelknochen (甲骨 · Jiǎgǔ)",
    bonesOriginHeading:
      "Historischer Ursprung (Shang-Dynastie, ~1600-1046 v. Chr.)",
    bonesOriginBody:
      "Die älteste dokumentierte Orakelpraktik Chinas. Die königlichen Schamanen wendeten Hitze auf Knochen oder Panzer an, um die resultierenden Risse zu lesen. Diese App respektiert die strukturelle Logik des Shang-Systems: positive Ladung, negative Ladung und Befund nach Muster.",
    bonesVerdictsHeading: "Die vier Befundzustände:",
    bonesVerdictAuspClear: "吉. Eindeutig günstig.",
    bonesVerdictAuspMod: "吉 mäßig. Günstig mit Nuancen.",
    bonesVerdictInauspMod: "凶 mäßig. Ungünstig mit Vorbehalten.",
    bonesVerdictInauspClear: "凶. Eindeutig ungünstig.",
    yarrowHeading: "Schafgarbenstäbe (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Historische Ursprünge (~1000 v. Chr.)",
    yarrowOriginBody:
      "Dies ist das Verfahren, das im Großen Kommentar (Dàzhuàn) beschrieben wird. Die Methode präzisiert : «Die Zahl der Großen Expansion ist 50, von denen 49 verwendet werden». Die Methode ist mehr als ein Jahrtausend älter als die Drei-Münzen-Methode. Richard Wilhelm dokumentierte das vollständige Verfahren in seinem Werk von 1924 und bewahrte damit einen langsameren, taktilen und bewussteren rituellen Rhythmus im Vergleich zu Münzen.",
    yarrowProbHeading: "Charakter der Methode",
    yarrowProbBody:
      "Die Stabmethode bewahrt einen langsameren rituellen Rhythmus als die Drei-Münzen-Methode. Ihr Wert wird in dieser App nicht als technische Tabelle dargestellt, sondern als ein anderer Weg, in dieselbe I Ching-Tradition einzutreten: taktiler, bewusster und näher am klassischen Verfahren, das von Wilhelm/Baynes dokumentiert wurde. Die Drei-Münzen-Methode bleibt für eine schnellere Beratung ebenso gültig.",
    translationsHeading: "Die Übersetzungen",
    lineReadingHeading: "Das Lesen der bewegenden Linien",
    lineReadingIntroBody:
      "Wenn ein Wurf bewegende Linien hervorbringt, wandelt sich das gegenwärtige Hexagramm in ein zweites. Daraus folgt eine Frage: welcher Text regiert die Lesung? Im Laufe der Jahrhunderte nahmen zwei große Antworten Gestalt an. Standardmäßig wendet diese App das Reduktionssystem von Alfred Huang an, und über das Optionsfeld können Sie zur klassischen Lesung von Zhu Xi wechseln. Beide sind authentische Methoden; keine wird hier erfunden. Welche Sie auch wählen, jede Kombination von Linien ergibt stets einen einzigen, präzisen maßgeblichen Text.",
    lineReadingHuangHeading: "Das System von Alfred Huang (Standard)",
    lineReadingHuangBody:
      "Alfred Huang (1921 bis 2014) war ein chinesischer Gelehrter und taoistischer Meister, der, nachdem er die Gefangenschaft während der Kulturrevolution überlebt hatte, die Tradition mit 'The Complete I Ching' (1998) in den Westen brachte. Seine Lesung reduziert jede beliebige Anzahl bewegender Linien durch klare positionsbezogene Regeln auf einen einzigen maßgeblichen Text: bei einer bewegenden Linie regiert ihr eigener Text; bei zwei entgegengesetzter Polarität regiert die Yin-Linie; bei zwei gleicher Polarität regiert die untere; bei drei regiert die mittlere; bei vier oder fünf wechselt die Lesung zum gewandelten Hexagramm; bei sechs bewegenden Linien (und bei keiner) wird nur das Urteil gelesen. Das Ergebnis ist stets ein eindeutiger Text, weshalb die App es als Standard verwendet.",
    lineReadingZhuxiHeading: "Die klassische Lesung von Zhu Xi",
    lineReadingZhuxiBody:
      "Zhu Xi (1130 bis 1200) war der große neukonfuzianische Philosoph, der die Praxis der Wandlungen in seinem 'Yijing benyi' (Die ursprüngliche Bedeutung des Yijing) systematisierte. Seine Regeln sind älter und vielschichtiger und lesen oft mehr als einen Text: bei zwei bewegenden Linien liest er beide und gibt der oberen den Vorrang; bei drei wägt er die Urteile beider Hexagramme mithilfe einer Reihe von Tafeln ab; bei vier oder fünf liest er die stabilen Linien des gewandelten Hexagramms. Die Wahl dieses Systems im Optionsfeld wendet diese klassischen Alternativen getreu an, Fall für Fall.",
    interpretHeading: "Warum die KI nicht erfindet",
    interpretBody:
      "Die künstliche Intelligenz in dieser App hat eine spezifische und begrenzte Funktion: das Ergebnis des Algorithmus (Hexagramm, bewegende Linien oder Riss-Befund) zu nehmen und es in natürlicher Sprache in den Kontext der Frage des Nutzers zu artikulieren. Die KI generiert keine Hexagramme, entscheidet nicht über Befunde und verändert Wilhelms Texte nicht. Der mathematische Algorithmus führt den technisch-traditionellen Prozess getreu aus, bevor die KI eingreift. Die KI ist der Interpret; das Orakel ist die Methode.",
    sourcesHeading: "Akademische Quellen und Referenzen",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  it: {
    title: "Note e Origine dei Metodi",
    lead: "Questa pagina fornisce un contesto tecnico-culturale. Non è una guida all'uso.",
    authNotice:
      "Tutti i metodi utilizzati in questa app provengono da tradizioni millenarie della cultura cinese, storicamente documentate e accademicamente rispettate in tutto il mondo. Questa app non inventa interpretazioni né genera significati propri; applica metodi autentici assistiti dalla tecnologia dell'intelligenza artificiale per renderli accessibili nella lingua dell'utente. Qualsiasi lettore può verificare i testi con le fonti originali elencate alla fine di questa pagina.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origine storica (~1000 a.C.)",
    ichingOriginBody:
      "Lo Zhouyi, «I Mutamenti di Zhou», è uno dei testi più antichi dell'umanità. Le sue radici risalgono alla dinastia Zhou (1046-256 a.C.). Il testo è stato costruito in strati storici : il Re Wen ha organizzato i 64 esagrammi e ha scritto i Giudizi (guàcí) mentre era prigioniero. Suo figlio, il Duca di Zhou, ha aggiunto le sentenze per le sei linee (yáocí). Secoli dopo, Confucio e i suoi discepoli hanno aggiunto i Commentari noti come le Dieci Ali (十翼), lo strato filosofico più profondo del testo.",
    ichingHexHeading: "Il sistema dei 64 esagrammi",
    ichingHexBody:
      "Ogni esagramma è una figura composta da sei linee, ciascuna yin (spezzata) o yang (intera). Le 64 combinazioni possibili descrivono i modelli fondamentali del cambiamento. Le linee in movimento indicano una trasformazione : l'esagramma presente muta in uno futuro, e quella transizione è il cuore della lettura.",
    ichingHexListHeading: "I 64 esagrammi nell'ordine di Re Wen",
    ichingHexListIntro:
      "Elenco completo dei 64 esagrammi con il loro numero, glifo e nome classico in cinese e pinyin. Il significato non è riportato qui : ogni esagramma prende forma solo all'interno di una consultazione precisa, dove la domanda e il contesto di chi consulta determinano la lettura.",
    ichingHexListAriaLabel: "Elenco dei 64 esagrammi",
    ichingMethodHeading: "Il metodo delle tre monete",
    ichingMethodBody:
      "Il metodo classico delle monete lancia tre monete sei volte e costruisce l'esagramma linea per linea. È più rapido degli steli di achillea e produce lo stesso tipo di risultato: linee intere (yang) e spezzate (yin), alcune in movimento. Come si leggono poi quelle linee in movimento è una questione a parte, affrontata nella sezione successiva.",
    ichingWilhelmHeading: "La traduzione Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm ha prodotto nel 1924 la traduzione più completa e rispettata dello I Ching in lingua occidentale. Cary Baynes l'ha tradotta in inglese nel 1950 (Princeton University Press). Quest'opera costituisce il testo base di questa app, senza modifiche né semplificazioni.",
    ichingLeggeHeading: "La traduzione di James Legge",
    ichingLeggeBody:
      "James Legge, missionario e sinologo scozzese, tradusse l'I Ching nel 1882 come parte della sua opera monumentale 'The Sacred Books of the East'. Il suo approccio fu strettamente filologico e accademico, cercando di decifrare il significato letterale dei testi confuciani e pre-confuciani. La sua versione porta un rigore interpretativo inestimabile.",
    ichingZhouyiHeading: "Il testo originale Zhou Yi",
    ichingZhouyiBody:
      "Lo Zhou Yi originale (letteralmente 'Mutamenti di Zhou') è il nucleo dell'I Ching, composto dai 64 esagrammi, i giudizi del Re Wen e le linee del Duca di Zhou, senza i successivi commenti confuciani (le Dieci Ali). Questa fonte consente una connessione diretta con lo strato sciamanico e più antico dell'oracolo.",
    ichingDataAuditHeading: "Audit di fedeltà 1:1",
    ichingDataAuditBody:
      "Ultimo audit: 21 giugno 2026. Legge e Zhou Yi (giudizio, immagine e linee) coincidono al 100% con sacred-texts.com e ctext.org. Wilhelm coincide al 100% con 6 supplementi documentati dove lo specchio di Parma omette il passaggio per intero: il giudizio dell'esagramma 56 (Il Viaggiatore, verificato con wengu e iching-online) e 5 linee individuali (esagramma 20 linea 5; esagramma 21 linee 2 e 3; esagramma 26 linea 3; esagramma 52 linea 2; ripristinate dal testo precedentemente pubblicato). I nomi dei campi del dataset e la struttura JSON non sono cambiati.",
    bonesHeading: "Ossa Oracolari (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Origine storica (Dinastia Shang, ~1600-1046 a.C.)",
    bonesOriginBody:
      "La pratica oracolare documentata più antica della Cina. Gli sciamani reali applicavano calore a ossa o gusci per leggere le crepe risultanti. Questa app rispetta la logica strutturale del sistema Shang : carica positiva, carica negativa e verdetto per motivo.",
    bonesVerdictsHeading: "I quattro stati del verdetto :",
    bonesVerdictAuspClear: "吉. Chiaramente favorevole.",
    bonesVerdictAuspMod: "吉 moderato. Favorevole con sfumature.",
    bonesVerdictInauspMod: "凶 moderato. Sfavorevole con riserve.",
    bonesVerdictInauspClear: "凶. Chiaramente sfavorevole.",
    yarrowHeading: "Steli di Achillea (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origine storica (~1000 a.C.)",
    yarrowOriginBody:
      "Questo è il procedimento descritto nel Grande Commento (Dàzhuàn). Il metodo precisa : «Il numero della Grande Espansione è 50, di cui 49 vengono usati». Questo metodo è anteriore a quello delle tre monete di oltre un millennio. Richard Wilhelm ha documentado il procedimento completo nella sua opera del 1924, preservando un ritmo rituale più lento, tattile e deliberato rispetto a quello delle monete.",
    yarrowProbHeading: "Carattere del metodo",
    yarrowProbBody:
      "La procedura degli steli conserva un ritmo rituale più lento rispetto a quello delle monete. In questa app il suo valore non viene presentato come una tabella tecnica, ma come un modo diverso di entrare nella stessa tradizione dell'I Ching: più tattile, più deliberato e più vicino al procedimento classico documentato da Wilhelm/Baynes. Il metodo delle tre monete rimane altrettanto valido per una consultazione più rapida.",
    translationsHeading: "Le traduzioni",
    lineReadingHeading: "La lettura delle linee in movimento",
    lineReadingIntroBody:
      "Quando una tirata produce linee in movimento, l'esagramma presente si trasforma in un secondo. Sorge allora una domanda: quale testo governa la lettura? Nel corso dei secoli presero forma due grandi risposte. Per impostazione predefinita, questa app applica il sistema di riduzione di Alfred Huang, e dal pannello delle opzioni puoi passare alla lettura classica di Zhu Xi. Entrambi sono metodi autentici; nessuno è inventato qui. Qualunque cosa tu scelga, ogni combinazione di linee produce sempre un unico testo guida preciso.",
    lineReadingHuangHeading: "Il sistema di Alfred Huang (predefinito)",
    lineReadingHuangBody:
      "Alfred Huang (1921 al 2014) fu un erudito cinese e maestro taoista che, dopo essere sopravvissuto alla prigionia durante la Rivoluzione Culturale, portò la tradizione in Occidente con 'The Complete I Ching' (1998). La sua lettura riduce qualsiasi numero di linee in movimento a un unico testo reggente mediante chiare regole posizionali: con una linea in movimento governa il proprio testo; con due di polarità opposta governa la linea yin; con due della stessa polarità governa quella inferiore; con tre governa quella centrale; con quattro o cinque la lettura passa all'esagramma trasformato; con sei linee in movimento (e con nessuna) si legge solo il Giudizio. Il risultato è sempre un testo inequivocabile, ed è per questo che l'app lo usa come impostazione predefinita.",
    lineReadingZhuxiHeading: "La lettura classica di Zhu Xi",
    lineReadingZhuxiBody:
      "Zhu Xi (1130 al 1200) fu il grande filosofo neoconfuciano che sistematizzò la pratica dei Mutamenti nel suo 'Yijing benyi' (Il significato originale dello Yijing). Le sue regole sono più antiche e più stratificate, e spesso leggono più di un testo: con due linee in movimento legge entrambe, dando precedenza a quella superiore; con tre soppesa i Giudizi di entrambi gli esagrammi con l'aiuto di una serie di diagrammi; con quattro o cinque legge le linee stabili dell'esagramma trasformato. Selezionare questo sistema nel pannello delle opzioni applica fedelmente queste alternative classiche, caso per caso.",
    interpretHeading: "Perché l'IA non inventa",
    interpretBody:
      "L'intelligenza artificiale in questa app ha una funzione specifica e delimitata: prendere il risultato dell'algoritmo (esagrammi, linee in movimento o verdetto di crepe) e articolarlo in linguaggio naturale con il contesto della domanda dell'utente. L'IA non genera esagrammi, non decide verdetti e non modifica i testi di Wilhelm. L'algoritmo matematico esegue fedelmente il processo tecnico-tradizionale prima che l'IA intervenga. L'IA è l'interprete ; l'oracolo è il metodo.",
    sourcesHeading: "Fonti e Riferimenti Accademici",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  ja: {
    title: "手法の注記と起源",
    lead: "このページは技術的・文化的な背景情報です。使用ガイドではありません。",
    authNotice:
      "このアプリで使用されるすべての手法は、歴史的に文書化され、世界中で学術的に尊重されている中国文化の数千年にわたる伝統に由来しています。このアプリは独自の解釈を作り出したり、独自の意味を生成したりするものではありません, 人工知能の支援を受けた本物の手法を、ユーザーの言語でアクセス可能にするために適用しています。読者はこのページの末尾に掲載されている原典と照合することができます。",
    ichingHeading: "易経（周易 · Zhouyi）",
    ichingOriginHeading: "歴史的起源（紀元前1000年頃）",
    ichingOriginBody:
      "周易（「周の変化」）は人類最古の文献の一つです。その起源は周王朝（紀元前1046〜256年）に遡りますが、その卜筮の核心はそれ以前のものです。このテキストは異なる歴史的層から構成されています：文王は幽閉中に64卦を整理し、卦辞（guàcí）を書き記しました。その息子の周公は六爻辞（爻辞、yáocí）を加えました。数世紀後、孔子とその弟子たちは十翼として知られる彖伝を加え、テキストの最も深い哲学的層を形成しました。",
    ichingHexHeading: "64卦のシステム",
    ichingHexBody:
      "各卦は6本の爻から成る図形で、それぞれが陰（切れた、受容的）または陽（連続した、能動的）です。64の可能な組み合わせは、自然と人間の生活における変化の根本的なパターンを描写しています。動爻は変容を示します：現在の卦は未来の卦へと変化し、その移行が占いの核心です。",
    ichingHexListHeading: "周文王の順序による64卦の一覧",
    ichingHexListIntro:
      "64卦の番号、卦象、漢字名と拼音をすべて掲載した一覧です。意味はここでは扱いません。各卦は具体的な相談のなかではじめて形を持ち、問いと相談者の文脈が読みを決めます。",
    ichingHexListAriaLabel: "64卦の一覧",
    ichingMethodHeading: "三枚銭法",
    ichingMethodBody:
      "古典的な銭法は、三枚の銭を六回投じ、卦を一爻ずつ構築します。蓍草より速く、同じ種類の結果をもたらします：陽（連続した）と陰（切れた）の爻があり、その一部は動爻です。それらの動爻をどう読むかは別の問題であり、次の節で扱います。",
    ichingWilhelmHeading: "ヴィルヘルム/バインズ訳",
    ichingWilhelmBody:
      "ドイツ人中国学者リヒャルト・ヴィルヘルムは数十年間中国に住み、1924年に西洋語として最も完全で尊重される易経の翻訳を出版しました。卦辞、爻辞、十翼の彖伝を含んでいます。キャリー・バインズが1950年に英語に翻訳しました。この著作は2020年にパブリックドメインに入り、このアプリのベーステキストです, 改変も簡略化もなく。",
    ichingLeggeHeading: "ジェームズ・レッグ訳",
    ichingLeggeBody:
      "スコットランドの宣教師であり中国学者であるジェームズ・レッグは、その記念碑的著作「東方聖書」の一部として1882年に易経を翻訳しました。彼のアプローチは厳密に文献学的かつ学術的であり、儒教および儒教以前のテキストの文字通りの意味を解読しようとしました。彼のバージョンは非常に貴重な解釈の厳密さをもたらします。",
    ichingZhouyiHeading: "原典 周易",
    ichingZhouyiBody:
      "原典である周易（文字通り「周の変化」）は易経の中核であり、64卦、文王の卦辞、周公の爻辞で構成され、後代の儒教の注釈（十翼）を含みません。この源泉は、神託のシャーマニズム的で最も古い層との直接的なつながりを可能にします。",
    ichingDataAuditHeading: "1:1データ忠実度監査",
    ichingDataAuditBody:
      "最新監査: 2026年6月21日。Leggeと周易（卦辞・象辞・爻辞）は sacred-texts.com および ctext.org と100%一致。Wilhelmも100%一致。Parmaミラーが該当箇所を完全に欠落させている6か所に文書化された補足を適用：第56卦（旅）の卦辞（wenguおよびiching-onlineで照合）、および5つの個別の爻（第20卦5爻、第21卦2爻と3爻、第26卦3爻、第52卦2爻、いずれも以前公開されていた本文から復元）。データセットのフィールド名とJSON構造は変更なし。",
    bonesHeading: "甲骨占い（甲骨 · Jiǎgǔ）",
    bonesOriginHeading: "歴史的起源（商王朝、紀元前1600〜1046年頃）",
    bonesOriginBody:
      "甲骨占いは中国で文書化された最古の卜筮法であり、成文化された易経より古い伝統です。商王朝の王室の巫祝は亀の甲羅や牛の肩甲骨を焼き、生じた亀裂を読み取ることで、軍事・農業・気候・王個人の決定について祖先に伺いを立てました。",
    bonesVerdictsHeading: "神託の四つの状態",
    bonesVerdictAuspClear:
      "吉, 明確に吉：パターンは曖昧さなく肯定命題を確認します。",
    bonesVerdictAuspMod:
      "吉 中程度, やや吉：確認はありますが、ニュアンスや条件が伴います。",
    bonesVerdictInauspMod:
      "凶 中程度, やや凶：パターンは留保付きで否定に傾きます。",
    bonesVerdictInauspClear:
      "凶, 明確に凶：パターンは曖昧さなく肯定命題を否定します。",
    yarrowHeading: "蓍草による占い (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "歴史的起源（紀元前約1000年）",
    yarrowOriginBody:
      "蓍草による占いの方法は、易経そのものに記録されている卜占手順です。十翼のひとつである大伝（大传, Dàzhuàn）には「大衍之数五十、其用四十有九（大いなる展開の数は50、そのうち49を使う）」と明記されています。論語では孔子が易を学ぶために五十年欲しいと述べており、古典学者たちはその「50」という数への言及を蓍草の手順への直接的な示唆と理解しています。この方法は三枚硬貨法よりも千年以上古いものです。リヒャルト・ヴィルヘルムとケーリー・ベインズは1950年の翻訳の付録（プリンストン大学出版）に完全な手順を記録しています。",
    yarrowProbHeading: "方法の性格",
    yarrowProbBody:
      "筮竹の方法は、三枚硬貨よりもゆっくりした儀礼的なリズムを保ちます。このアプリでは、その価値を技術的な表としてではなく、同じ易経伝統に入る別の方法として示しています。より触覚的で、より意識的で、Wilhelm/Baynes が記録した古典的手順に近いものです。より速い占いには三枚硬貨の方法も同じく有効です。",
    translationsHeading: "翻訳",
    lineReadingHeading: "動爻の読み方",
    lineReadingIntroBody:
      "卦が動爻を生じると、現在の卦は第二の卦へと変化します。そこで一つの問いが生じます：どの本文が読みを支配するのか。幾世紀にもわたって二つの大きな答えが形を成しました。本アプリは既定でアルフレッド・ホアン (Alfred Huang) の還元方式を適用し、オプションパネルから朱熹の古典的な読みに切り替えることができます。どちらも本物の方法であり、ここで創作されたものではありません。いずれを選んでも、爻のあらゆる組み合わせは常に唯一の精確な支配本文を導きます。",
    lineReadingHuangHeading: "アルフレッド・ホアンの方式（既定）",
    lineReadingHuangBody:
      "アルフレッド・ホアン (Alfred Huang、1921年から2014年) は中国の学者であり道教の師で、文化大革命中の投獄を生き延びたのち、'The Complete I Ching' (1998年) によって伝統を西洋に伝えました。彼の読みは、明快な位置の規則によって、いくつの動爻であっても唯一の支配本文へと還元します：動爻が一つならその爻辞が支配し、極性の異なる二つなら陰の爻が支配し、同じ極性の二つなら下の爻が支配し、三つなら中央の爻が支配し、四つか五つなら読みは変化後の卦へ移り、動爻が六つのとき（および一つもないとき）は卦辞のみを読みます。結果は常に一義的な本文であり、それゆえアプリはこれを既定として用います。",
    lineReadingZhuxiHeading: "朱熹の古典的な読み",
    lineReadingZhuxiBody:
      "朱熹 (1130年から1200年) は、その著『周易本義』（Yijing benyi、周易の本来の意味）において変化の実践を体系化した偉大な新儒学の哲学者です。彼の規則はより古く、より重層的で、しばしば複数の本文を読みます：動爻が二つなら両方を読み、上の爻を優先し、三つなら一組の図表の助けを借りて両卦の卦辞を比べ量り、四つか五つなら変化後の卦の不変の爻を読みます。オプションパネルでこの方式を選ぶと、これらの古典的な代替法が一つ一つ忠実に適用されます。",
    interpretHeading: "AIが発明しない理由",
    interpretBody:
      "このアプリの人工知能には特定かつ限定的な機能があります：アルゴリズムの結果（卦、動爻、亀裂の神託）を受け取り、ユーザーの質問のコンテキストと共に、ユーザーの言語で自然言語として表現することです。AIは卦を生成せず、神託を決定せず、ヴィルヘルムのテキストも商の手法のパターンも改変しません。数学的アルゴリズムがそれを忠実に行い、その後AIが介入します。AIは解釈者です。神託は手法です。",
    sourcesHeading: "出典と参考文献",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  zh: {
    title: "方法注记与起源",
    lead: "本页为技术文化背景说明，非使用指南。",
    authNotice:
      "本应用所使用的所有方法均源自中国文化数千年的传统，有历史文献记载，在全球学术界受到广泛尊重。本应用不自创解读，不生成独有含义，而是借助人工智能辅助，将真实可信的传统方法以用户语言呈现。任何读者均可与本页末尾所列原始文献相互印证。",
    ichingHeading: "易经（周易 · Zhouyi）",
    ichingOriginHeading: "历史渊源（约公元前1000年）",
    ichingOriginBody:
      '周易（"周之变化"）是人类最古老的文献之一。其根源可追溯至周朝（公元前1046至256年），但其卜筮核心更为久远。该文本由不同历史层次累积而成：文王在囚禁中整理了64卦，并写下了卦辞（guàcí）；其子周公补充了六爻辞（爻辞，yáocí）；数百年后，孔子及其弟子增添了被称为十翼的传注，构成文本最深刻的哲学层次。',
    ichingHexHeading: "六十四卦系统",
    ichingHexBody:
      "每一卦由六爻组成，每爻为阴（断裂，柔顺）或阳（连续，刚健）。六十四种可能的组合描述了自然与人类生活中变化的根本规律。动爻指示转变：当下之卦变化为未来之卦，这一转变正是占卜的核心所在。",
    ichingHexListHeading: "周文王序列下的六十四卦总览",
    ichingHexListIntro:
      "完整列出六十四卦的卦序、卦象、汉字名称与拼音。此处不附释义：每一卦的意涵都只有在具体咨询中才会成形，由问题与问卜者的处境共同决定解读。",
    ichingHexListAriaLabel: "六十四卦列表",
    ichingMethodHeading: "三枚铜钱法",
    ichingMethodBody:
      "经典的铜钱法以三枚铜钱掷六次，逐爻构建卦象。它比蓍草更快，产生同样类型的结果：阳爻（连续）与阴爻（断裂），其中部分为动爻。这些动爻随后如何解读，则是另一个问题，将在下一节中讨论。",
    ichingWilhelmHeading: "卫礼贤／贝恩斯译本",
    ichingWilhelmBody:
      "德国汉学家卫礼贤（Richard Wilhelm）在中国生活数十年，于1924年出版了西方语言中最完整、最受推崇的易经译本，包括卦辞、爻辞及十翼注解。贝恩斯（Cary Baynes）于1950年将其译为英文。该著作于2020年进入公有领域，是本应用的基础文本，未作任何修改或简化。",
    ichingLeggeHeading: "理雅各（James Legge）译本",
    ichingLeggeBody:
      "苏格兰传教士、汉学家理雅各于1882年翻译了《易经》，作为其丰碑巨著《东方圣书》的一部分。他的方法严格遵循语文学和学术标准，力图破译儒家及前儒家文本的字面意义。他的版本带来了无可估量的阐释严谨性。",
    ichingZhouyiHeading: "原典《周易》文本",
    ichingZhouyiBody:
      "原典《周易》（字面意思是“周的变化”）是《易经》的核心，由64卦、文王卦辞和周公爻辞组成，不包含后来的儒家注释（十翼）。这一源头使我们能够直接连接到神谕中最古老的萨满文化层。",
    ichingDataAuditHeading: "1:1数据保真审计",
    ichingDataAuditBody:
      "最近一次审计：2026年6月21日。理雅各译本与周易原文（卦辞、象辞、爻辞）与 sacred-texts.com 及 ctext.org 100%一致。卫礼贤译本整体100%一致；在帕尔马镜像完全缺失对应段落的6处采用了有据可查的补充：第56卦（旅）卦辞（已与 wengu 及 iching-online 对照），以及5条独立爻辞（第20卦五爻、第21卦二爻与三爻、第26卦三爻、第52卦二爻，均从此前已发布的文本中恢复）。数据集字段名与 JSON 结构未变。",
    bonesHeading: "甲骨占卜（甲骨 · Jiǎgǔ）",
    bonesOriginHeading: "历史渊源（商朝，约公元前1600至1046年）",
    bonesOriginBody:
      "甲骨占卜是中国有文献记载的最古老卜筮实践，早于成文形式的易经。商朝王室巫师灼烧龟腹甲或牛肩胛骨，通过解读所产生的裂纹，就军事、农业、气候及王的个人决策向祖先问卜。",
    bonesVerdictsHeading: "四种兆辞状态",
    bonesVerdictAuspClear: "吉, 明显为吉：纹样明确确认正面命题，无歧义。",
    bonesVerdictAuspMod: "偏吉, 偏向为吉：有所确认，但带有条件或细微差别。",
    bonesVerdictInauspMod: "偏凶, 偏向为凶：纹样有所保留地倾向否定。",
    bonesVerdictInauspClear: "凶, 明显为凶：纹样明确否定正面命题，无歧义。",
    yarrowHeading: "蓍草占法 (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "历史渊源（约公元前1000年）",
    yarrowOriginBody:
      "蓍草占法是易经本身所记载的占卜程序。十翼之一的大传（大传, Dàzhuàn）明确指出：「大衍之数五十，其用四十有九。」孔子在《论语》中表示希望花五十年研习《周易》；古典学者将这一「五十」的引用理解为对蓍草程序的直接暗示。该方法比三枚铜钱法早一千余年。卫礼贤与贝恩斯在其1950年译本的附录（普林斯顿大学出版社）中记录了完整的操作步骤。",
    yarrowProbHeading: "方法的气质",
    yarrowProbBody:
      "蓍草方法保留了比三枚铜钱更慢的仪式节奏。在本应用中，它的价值不以技术表格呈现，而是作为进入同一《易经》传统的另一种方式：更具触感，更审慎，也更接近 Wilhelm/Baynes 所记录的经典程序。若需要更快速的咨询，三枚铜钱方法同样有效。",
    translationsHeading: "各家译本",
    lineReadingHeading: "动爻的读法",
    lineReadingIntroBody:
      "当一次起卦产生动爻时，当下之卦会转变为第二卦。于是产生一个问题：哪一段文本主导解读？数百年来形成了两种伟大的答案。本应用默认采用 Alfred Huang 的归约系统，你也可以在选项面板中切换为朱熹的经典读法。两者都是真实可信的方法，皆非本应用所自创。无论你选择哪一种，任何爻的组合都始终导出唯一而精确的主导文本。",
    lineReadingHuangHeading: "Alfred Huang 的系统（默认）",
    lineReadingHuangBody:
      "Alfred Huang（1921 至 2014）是一位中国学者与道家宗师，在文化大革命中历经牢狱之灾后幸存，并以《The Complete I Ching》（1998）将这一传统带入西方。他的读法通过清晰的位置规则，将任意数量的动爻归约为唯一的主导文本：一个动爻时，由其本爻辞主导；两个极性相反时，由阴爻主导；两个极性相同时，由下爻主导；三个时，由中爻主导；四个或五个时，解读转向变卦；六个动爻时（以及没有动爻时），只读卦辞。结果始终是唯一无歧义的文本，因此本应用以其为默认。",
    lineReadingZhuxiHeading: "朱熹的经典读法",
    lineReadingZhuxiBody:
      "朱熹（1130 至 1200）是伟大的新儒家哲学家，他在《周易本义》（Yijing benyi）中系统化了《易》的占法。他的规则更为古老、更具层次，往往会读不止一段文本：两个动爻时，两者皆读，以上爻为先；三个时，借助一组图表权衡两卦的卦辞；四个或五个时，读变卦中不变之爻。在选项面板中选择此系统，便会逐一忠实地应用这些经典的替代规则。",
    interpretHeading: "为何人工智能不自创内容",
    interpretBody:
      "本应用中的人工智能具有特定且有限的功能：获取算法结果（卦象、动爻、裂纹兆辞）并结合用户问题的语境，以用户的语言将其表述为自然语言。人工智能不生成卦象，不裁定兆辞，不修改卫礼贤的文本，也不改变商代方法的纹样。数学算法在人工智能介入之前，已忠实地完成了这一切。人工智能是解读者，神谕是方法本身。",
    sourcesHeading: "来源与参考文献",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  ko: {
    title: "방법 주석과 기원",
    lead: "이 페이지는 기술적·문화적 배경 정보입니다. 사용 안내서가 아닙니다.",
    authNotice:
      "이 앱에서 사용되는 모든 방법은 역사적으로 문서화되고 전 세계 학계에서 존중받는 중국 문화의 수천 년 전통에서 비롯됩니다. 이 앱은 독자적인 해석을 창작하거나 고유한 의미를 생성하지 않습니다, 인공지능의 도움을 받아 정통 방법을 사용자의 언어로 접근 가능하게 적용할 뿐입니다. 독자는 이 페이지 하단에 나열된 원전과 대조하여 확인할 수 있습니다.",
    ichingHeading: "주역（周易 · Zhouyi）",
    ichingOriginHeading: "역사적 기원（기원전 1000년경）",
    ichingOriginBody:
      "주역（'주나라의 변화'）은 인류 역사상 가장 오래된 문헌 중 하나입니다. 그 뿌리는 주나라（기원전 1046~256년）로 거슬러 올라가지만, 그 점복적 핵심은 더 이전 시대의 것입니다. 이 문헌은 서로 다른 역사적 층위로 구성됩니다: 문왕은 감옥에 갇혀 있는 동안 64괘를 정리하고 괘사（卦辞, guàcí）를 저술했습니다. 그의 아들 주공은 여섯 효사（爻辞, yáocí）를 덧붙였습니다. 수 세기 후, 공자와 그의 제자들은 십익（十翼）으로 알려진 전통을 추가하여 문헌의 가장 깊은 철학적 층을 형성했습니다.",
    ichingHexHeading: "64괘 체계",
    ichingHexBody:
      "각 괘는 여섯 효로 이루어진 도형으로, 각 효는 음（끊긴 선, 수용적）또는 양（이어진 선, 능동적）입니다. 64가지 가능한 조합은 자연과 인간의 삶에서 변화의 근본적인 패턴을 묘사합니다. 변하는 효는 변환을 나타냅니다: 현재의 괘는 미래의 괘로 변하며, 그 전환이 독해의 핵심입니다.",
    ichingHexListHeading: "주문왕 순서로 본 64괘 일람",
    ichingHexListIntro:
      "64괘의 번호, 괘상, 한자 이름과 병음을 모두 정리한 목록입니다. 의미는 여기에 싣지 않습니다. 각 괘는 구체적인 상담 안에서만 형태를 갖추며, 질문과 상담자의 맥락이 풀이를 결정합니다.",
    ichingHexListAriaLabel: "64괘 목록",
    ichingMethodHeading: "삼전법",
    ichingMethodBody:
      "고전적인 동전법은 동전 세 개를 여섯 번 던져 괘를 한 효씩 구성합니다. 시초보다 빠르며 같은 종류의 결과를 냅니다: 양효(이어진 선)와 음효(끊긴 선), 그중 일부는 변효입니다. 그 변효를 그 다음 어떻게 읽는가는 별개의 문제로, 다음 절에서 다룹니다.",
    ichingWilhelmHeading: "빌헬름/베인스 번역",
    ichingWilhelmBody:
      "독일 중국학자 리하르트 빌헬름은 수십 년간 중국에 살며 1924년 서양 언어로 된 가장 완전하고 권위 있는 주역 번역서를 출간했습니다. 괘사, 효사, 십익 전통을 모두 포함합니다. 케리 베인스가 1950년 영어로 번역했습니다. 이 저작은 2020년에 공공 도메인에 진입하였으며, 이 앱의 기본 텍스트입니다, 수정이나 단순화 없이.",
    ichingLeggeHeading: "제임스 레그 번역",
    ichingLeggeBody:
      "스코틀랜드의 선교사이자 중국학자인 제임스 레그는 자신의 기념비적 저작인 '동방의 성서'의 일부로 1882년에 주역을 번역했습니다. 그의 접근 방식은 엄격하게 문헌학적이고 학술적이었으며, 유교 및 유교 이전 텍스트의 문자적 의미를 해독하고자 했습니다. 그의 버전은 매우 귀중한 해석적 엄밀함을 제공합니다.",
    ichingZhouyiHeading: "원전 주역 텍스트",
    ichingZhouyiBody:
      "원전인 주역(문자 그대로 '주나라의 변화')은 64괘, 문왕의 괘사, 주공의 효사로 구성되며, 후대의 유교 주석(십익)을 포함하지 않는 주역의 핵심입니다. 이 출처는 신탁의 샤머니즘적이고 가장 오래된 층과의 직접적인 연결을 가능하게 합니다.",
    ichingDataAuditHeading: "1:1 데이터 충실도 감사",
    ichingDataAuditBody:
      "최근 감사: 2026년 6월 21일. Legge와 주역(괘사·상사·효사)은 sacred-texts.com 및 ctext.org와 100% 일치합니다. Wilhelm도 100% 일치하며, Parma 미러가 해당 구절을 완전히 누락한 6곳에 문서화된 보완을 적용했습니다: 56괘(려) 괘사(wengu 및 iching-online과 대조) 및 개별 효 5곳(20괘 5효, 21괘 2효와 3효, 26괘 3효, 52괘 2효, 모두 이전에 공개된 본문에서 복원). 데이터셋 필드명과 JSON 구조는 변경되지 않았습니다.",
    bonesHeading: "갑골 점복（甲骨 · Jiǎgǔ）",
    bonesOriginHeading: "역사적 기원（상나라, 기원전 1600~1046년경）",
    bonesOriginBody:
      "갑골 점복은 중국에서 문서화된 가장 오래된 점복 실천으로, 기록된 형태의 주역보다도 앞선 전통입니다. 상나라의 왕실 무당들은 거북 배갑이나 소 견갑골을 태우고 생긴 균열을 읽어 군사, 농업, 기후, 왕의 개인적 결정에 대해 조상에게 물었습니다.",
    bonesVerdictsHeading: "신탁의 네 가지 상태",
    bonesVerdictAuspClear:
      "吉, 명확히 길함: 패턴이 긍정 명제를 모호함 없이 확인합니다.",
    bonesVerdictAuspMod:
      "吉 중간, 다소 길함: 확인이 있지만 뉘앙스나 조건이 따릅니다.",
    bonesVerdictInauspMod:
      "凶 중간, 다소 흉함: 패턴이 유보적으로 부정 쪽으로 기웁니다.",
    bonesVerdictInauspClear:
      "凶, 명확히 흉함: 패턴이 긍정 명제를 모호함 없이 부정합니다.",
    yarrowHeading: "시초점법 (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "역사적 기원 (기원전 약 1000년)",
    yarrowOriginBody:
      "시초 방법은 역경 자체에 기록된 점술 절차입니다. 십익 중 하나인 대전(大传, Dàzhuàn)은 구체적으로 기술합니다: '대연지수오십, 기용사십유구(대연의 수는 50이며 그 중 49를 사용한다).' 공자는 논어에서 역을 오십 년간 공부하고 싶다고 밝혔으며, 고전학자들은 이 50이라는 숫자를 시초 절차에 대한 직접적인 암시로 해석합니다. 이 방법은 삼전법보다 천 년 이상 앞섭니다. 리하르트 빌헬름과 캐리 베인스는 1950년 번역본 부록(프린스턴 대학 출판부)에 전체 절차를 기록했습니다.",
    yarrowProbHeading: "방법의 성격",
    yarrowProbBody:
      "시초 방법은 세 동전 방법보다 더 느린 의례적 리듬을 보존합니다. 이 앱에서 그 가치는 기술적인 표가 아니라 같은 주역 전통에 들어가는 다른 방식으로 제시됩니다. 더 촉각적이고, 더 신중하며, Wilhelm/Baynes가 기록한 고전적 절차에 더 가깝습니다. 빠른 상담에는 세 동전 방법도 똑같이 유효합니다.",
    translationsHeading: "번역본",
    lineReadingHeading: "변효 읽기",
    lineReadingIntroBody:
      "한 번의 점이 변효를 낳으면, 현재의 괘는 두 번째 괘로 변합니다. 그러면 한 가지 물음이 따릅니다: 어떤 본문이 독해를 지배하는가? 여러 세기에 걸쳐 두 가지 위대한 답이 형태를 갖추었습니다. 이 앱은 기본적으로 Alfred Huang의 축약 체계를 적용하며, 옵션 패널에서 주희의 고전적 독해로 전환할 수 있습니다. 둘 다 정통 방법이며, 어느 것도 여기서 창작된 것이 아닙니다. 어느 쪽을 택하든, 효의 모든 조합은 언제나 유일하고 정확한 지배 본문을 도출합니다.",
    lineReadingHuangHeading: "Alfred Huang의 체계 (기본값)",
    lineReadingHuangBody:
      "Alfred Huang(1921~2014)은 중국의 학자이자 도교 스승으로, 문화대혁명 동안의 투옥을 견뎌낸 뒤 'The Complete I Ching'(1998)을 통해 그 전통을 서양에 전했습니다. 그의 독해는 명료한 위치 규칙을 통해 변효가 몇 개이든 하나의 지배 본문으로 축약합니다: 변효가 하나면 그 자체의 효사가 지배하고, 극성이 반대인 둘이면 음효가 지배하며, 같은 극성의 둘이면 아래쪽 효가 지배하고, 셋이면 가운데 효가 지배하며, 넷이나 다섯이면 독해는 변한 괘로 옮겨가고, 변효가 여섯이면(그리고 하나도 없으면) 괘사만을 읽습니다. 결과는 언제나 모호함이 없는 하나의 본문이며, 그래서 앱은 이를 기본값으로 사용합니다.",
    lineReadingZhuxiHeading: "주희의 고전적 독해",
    lineReadingZhuxiBody:
      "주희(1130~1200)는 그의 저서 '주역본의'(Yijing benyi, 주역의 본래 의미)에서 변화의 실천을 체계화한 위대한 신유학 철학자입니다. 그의 규칙은 더 오래되고 더 여러 층위를 지니며, 종종 둘 이상의 본문을 읽습니다: 변효가 둘이면 둘 다 읽되 위쪽을 우선하고, 셋이면 한 벌의 도표의 도움을 받아 두 괘의 괘사를 견주며, 넷이나 다섯이면 변한 괘의 변하지 않는 효들을 읽습니다. 옵션 패널에서 이 체계를 선택하면 이러한 고전적 대안들이 경우마다 충실히 적용됩니다.",
    interpretHeading: "인공지능이 창작하지 않는 이유",
    interpretBody:
      "이 앱의 인공지능은 특정하고 한정된 기능을 수행합니다: 알고리즘의 결과, 괘, 변효, 균열 신탁, 를 받아 사용자의 질문 맥락과 함께 사용자의 언어로 자연어로 표현하는 것입니다. AI는 괘를 생성하지 않고, 신탁을 결정하지 않으며, 빌헬름의 텍스트나 상 방법의 패턴을 수정하지 않습니다. 수학적 알고리즘이 AI가 개입하기 전에 충실히 그 역할을 합니다. AI는 해석자입니다. 신탁은 방법 그 자체입니다.",
    sourcesHeading: "출처 및 참고문헌",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  ar: {
    title: "ملاحظات وأصول الطرق",
    lead: "هذه الصفحة سياق تقني وثقافي. إنها ليست دليل استخدام.",
    authNotice:
      "جميع الطرق المستخدمة في هذا التطبيق مستمدة من تقاليد عريقة في الثقافة الصينية، موثقة تاريخياً ومحترمة أكاديمياً في جميع أنحاء العالم. لا يخترع هذا التطبيق تفسيرات ولا يولد معاني خاصة به, بل يطبق طرقاً أصيلة بمساعدة الذكاء الاصطناعي لجعلها في متناول المستخدم بلغته. يمكن لأي قارئ مقارنة النصوص بالمصادر الأصلية المدرجة في نهاية هذه الصفحة.",
    ichingHeading: "الآي تشينغ (周易 · Zhouyi)",
    ichingOriginHeading: "الأصول التاريخية (نحو 1000 قبل الميلاد)",
    ichingOriginBody:
      "الـ Zhouyi, «تحولات الـ Zhou», هو أحد أقدم النصوص في تاريخ البشرية. تعود جذوره إلى أسرة Zhou (1046-256 قبل الميلاد)، وإن كان نواته الكهنوتية أقدم من ذلك. بُني النص في طبقات تاريخية متمايزة: نظّم الملك Wen الأغراض الـ 64 وكتب الأحكام (卦辞، guàcí) أثناء سجنه. أضاف ابنه الدوق Zhou عبارات الأسطر الست (爻辞، yáocí). وبعد قرون، أضاف كونفوشيوس وتلاميذه التعليقات المعروفة بـ «الأجنحة العشرة» (十翼)، أعمق الطبقات الفلسفية في النص.",
    ichingHexHeading: "نظام الأغراض الأربعة والستين",
    ichingHexBody:
      "كل غرض هو شكل من ستة خطوط، كل منها إما يين (مكسور، متقبّل) أو يانغ (مستمر، نشط). تصف الـ 64 تركيبة الممكنة الأنماط الأساسية للتغيير في الطبيعة والحياة البشرية. تشير الخطوط المتحركة إلى التحول: الغرض الحاضر يتحول إلى غرض مستقبلي، وهذا الانتقال هو جوهر القراءة.",
    ichingHexListHeading: "الأغراض الأربعة والستون وفق ترتيب الملك Wen",
    ichingHexListIntro:
      "قائمة كاملة بالأغراض الأربعة والستين مع رقم كل غرض ورمزه واسمه الكلاسيكي بالصينية والبينين. لا يُذكر هنا معناها: لا يكتمل أي غرض إلا داخل استشارة محددة، حيث يحدد سؤال المستشير وسياقه الشخصي القراءة.",
    ichingHexListAriaLabel: "قائمة الأغراض الأربعة والستين",
    ichingMethodHeading: "طريقة العملات الثلاث",
    ichingMethodBody:
      "طريقة العملات الكلاسيكية تقذف ثلاث عملات ست مرات وتبني الغرض خطاً بخط. وهي أسرع من عيدان الزنبق وتعطي النوع نفسه من النتيجة: خطوط كاملة (يانغ) ومكسورة (يين)، بعضها متحرك. أما كيف تُقرأ تلك الخطوط المتحركة بعد ذلك فمسألة منفصلة، يتناولها القسم التالي.",
    ichingWilhelmHeading: "ترجمة Wilhelm/Baynes",
    ichingWilhelmBody:
      "ريتشارد فيلهلم، المستشرق الألماني، عاش في الصين عقوداً وأنتج عام 1924 الترجمة الأكثر اكتمالاً واحتراماً للـ I Ching في اللغات الغربية، بما فيها الأحكام والخطوط وتعليقات «الأجنحة العشرة». ترجمتها كاري بينز إلى الإنجليزية عام 1950. دخل هذا العمل النطاق العام عام 2020 وهو النص الأساسي لهذا التطبيق, دون تعديلات أو تبسيطات.",
    ichingLeggeHeading: "ترجمة جيمس ليغ",
    ichingLeggeBody:
      "ترجم جيمس ليغ، وهو مبشر وعالم صينيات اسكتلندي، كتاب I Ching في عام 1882 كجزء من عمله الضخم 'الكتب المقدسة في الشرق'. كان نهجه فقهياً وأكاديمياً بصرامة، سعياً لفك المعنى الحرفي للنصوص الكونفوشيوسية وما قبل الكونفوشيوسية. وتوفر نسخته دقة تفسيرية لا تقدر بثمن.",
    ichingZhouyiHeading: "نص Zhou Yi الأصلي",
    ichingZhouyiBody:
      "نص Zhou Yi الأصلي (حرفياً 'تغييرات Zhou') هو جوهر I Ching، ويتكون من 64 شكلاً سداسياً، وأحكام الملك Wen، وخطوط الدوق Zhou، بدون التعليقات الكونفوشيوسية اللاحقة (الأجنحة العشرة). يتيح هذا المصدر اتصالاً مباشراً بالطبقة الشامانية والأقدم من العرافة.",
    ichingDataAuditHeading: "تدقيقات مطابقة البيانات 1:1",
    ichingDataAuditBody:
      "آخر تدقيق: 21 يونيو 2026. Legge وZhou Yi (الحكم والصورة والخطوط) تطابق sacred-texts.com وctext.org بنسبة 100%. Wilhelm يطابق بنسبة 100% مع 6 مكملات موثقة حيث تحذف مرآة Parma المقطع بالكامل: حكم السداسي 56 (المسافر، تم التحقق منه مع wengu وiching-online) و5 خطوط فردية (السداسي 20 الخط 5؛ السداسي 21 الخطان 2 و3؛ السداسي 26 الخط 3؛ السداسي 52 الخط 2؛ مستعادة من النص المنشور سابقاً). أسماء حقول مجموعة البيانات وبنية JSON لم تتغير.",
    bonesHeading: "عظام العرافة (甲骨 · Jiǎgǔ)",
    bonesOriginHeading:
      "الأصول التاريخية (أسرة Shang، نحو 1600-1046 قبل الميلاد)",
    bonesOriginBody:
      "التكهن بعظام العرافة هو أقدم ممارسة كهنوتية موثقة في الصين، تسبق الـ I Ching في شكله المكتوب. كان شامانو أسرة Shang الملكية يحرقون درع السلاحف أو لوح كتف الثور ويقرؤون الشقوق الناتجة للتشاور مع الأسلاف حول القرارات العسكرية والزراعية والمناخية والشخصية للملك.",
    bonesVerdictsHeading: "الحالات الأربع للحكم",
    bonesVerdictAuspClear:
      "吉, مبشّر بوضوح: يؤكد النمط الشحنة الإيجابية دون غموض.",
    bonesVerdictAuspMod:
      "吉 معتدل, مبشّر بدرجة معتدلة: التأكيد موجود لكن مع فروق دقيقة أو شروط.",
    bonesVerdictInauspMod:
      "凶 معتدل, غير مبشّر بدرجة معتدلة: يميل النمط نحو النفي مع تحفظات.",
    bonesVerdictInauspClear:
      "凶, غير مبشّر بوضوح: ينفي النمط الشحنة الإيجابية دون غموض.",
    yarrowHeading: "عيدان الزنبق (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "الأصول التاريخية (~1000 قبل الميلاد)",
    yarrowOriginBody:
      "طريقة عيدان الزنبق هي إجراء العرافة الموثق في I Ching نفسه. يُحدد التعليق الكبير (大传، Dàzhuàn)، أحد العشر أجنحة: «عدد التوسع الكبير هو خمسون، يُستخدم منها تسعة وأربعون». ويُروى في الأناليكت أن كونفوشيوس قال إنه يتمنى دراسة التحولات خمسين سنة؛ يفهم العلماء الكلاسيكيون هذه الإشارة إلى عدد 50 تلميحاً مباشراً إلى إجراء العيدان. الطريقة أقدم من طريقة الأسكة الثلاث بأكثر من ألف سنة. وثّق ريتشارد فيلهلم وكاري بيانز الإجراء كاملاً في ملحق ترجمتهما (مطبعة جامعة برينستون، 1950).",
    yarrowProbHeading: "طابع الطريقة",
    yarrowProbBody:
      "تحافظ طريقة السيقان على إيقاع طقسي أبطأ من طريقة العملات الثلاث. في هذا التطبيق لا تعرض قيمتها كجدول تقني، بل كطريقة مختلفة للدخول في تقليد الآي تشينغ نفسه: أكثر لمسا، وأكثر تعمدا، وأقرب إلى الإجراء الكلاسيكي الذي وثقه ويلهلم/باينز. وتظل طريقة العملات الثلاث صالحة بالقدر نفسه للاستشارة الأسرع.",
    translationsHeading: "الترجمات",
    lineReadingHeading: "قراءة الخطوط المتحركة",
    lineReadingIntroBody:
      "عندما يُنتج رمي الخطوط خطوطاً متحركة، يتحول الغرض الحاضر إلى غرض ثانٍ. فيطرح سؤال: أي نص يحكم القراءة؟ على مر القرون تبلورت إجابتان كبيرتان. يطبّق هذا التطبيق افتراضياً نظام الاختزال لـ Alfred Huang، ومن لوحة الخيارات يمكنك التبديل إلى القراءة الكلاسيكية لـ Zhu Xi. كلاهما طريقتان أصيلتان، ولم تُخترع أي منهما هنا. أياً كان اختيارك، فإن كل تركيبة من الخطوط تُنتج دائماً نصاً حاكماً واحداً ودقيقاً.",
    lineReadingHuangHeading: "نظام Alfred Huang (الافتراضي)",
    lineReadingHuangBody:
      "كان Alfred Huang (1921 إلى 2014) عالماً صينياً ومعلماً طاوياً، وبعد أن نجا من السجن خلال الثورة الثقافية، حمل التقليد إلى الغرب في 'The Complete I Ching' (1998). تختزل قراءته أي عدد من الخطوط المتحركة إلى نص حاكم واحد عبر قواعد موضعية واضحة: مع خط متحرك واحد، يحكم نصه الخاص، ومع اثنين متعاكسي القطبية، يحكم الخط يين، ومع اثنين من القطبية نفسها، يحكم الخط الأسفل، ومع ثلاثة، يحكم الأوسط، ومع أربعة أو خمسة، تنتقل القراءة إلى الغرض المتحول، ومع ستة خطوط متحركة (ومع عدم وجود أي منها)، يُقرأ الحكم وحده. النتيجة دائماً نص واحد لا لبس فيه، ولهذا يستخدمه التطبيق بشكل افتراضي.",
    lineReadingZhuxiHeading: "القراءة الكلاسيكية لـ Zhu Xi",
    lineReadingZhuxiBody:
      "كان Zhu Xi (1130 إلى 1200) الفيلسوف الكونفوشيوسي الجديد العظيم الذي نظّم ممارسة التغيّرات في كتابه 'Yijing benyi' (المعنى الأصلي للـ Yijing). قواعده أقدم وأكثر تعدداً في الطبقات، وكثيراً ما تقرأ أكثر من نص واحد: مع خطين متحركين يقرأ كليهما، مع تقديم الأعلى، ومع ثلاثة يوازن بين أحكام الغرضين بمساعدة مجموعة من الجداول، ومع أربعة أو خمسة يقرأ الخطوط الثابتة من الغرض المتحول. اختيار هذا النظام من لوحة الخيارات يطبّق هذه البدائل الكلاسيكية بأمانة، حالة بحالة.",
    interpretHeading: "لماذا الذكاء الاصطناعي لا يخترع",
    interpretBody:
      "للذكاء الاصطناعي في هذا التطبيق وظيفة محددة ومحدودة: أخذ نتيجة الخوارزمية, الغرض، الخطوط المتحركة، حكم الشقوق, وصياغتها بلغة طبيعية في لغة المستخدم، مع سياق سؤاله. لا يُولّد الذكاء الاصطناعي أغراضاً، ولا يقرر أحكاماً، ولا يعدّل نصوص Wilhelm أو أنماط طريقة Shang. الخوارزمية الرياضية تفعل ذلك بأمانة قبل أن يتدخل الذكاء الاصطناعي. الذكاء الاصطناعي هو المفسر. العرافة هي الطريقة.",
    sourcesHeading: "المصادر والمراجع",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  hi: {
    title: "विधि नोट्स और उत्पत्ति",
    lead: "यह पृष्ठ तकनीकी-सांस्कृतिक संदर्भ है। यह उपयोग मार्गदर्शिका नहीं है।",
    authNotice:
      "इस ऐप में उपयोग की जाने वाली सभी विधियां चीनी संस्कृति की हजारों साल पुरानी परंपराओं से आती हैं, जो ऐतिहासिक रूप से दस्तावेज़ीकृत और दुनिया भर में शैक्षणिक रूप से सम्मानित हैं। यह ऐप कोई व्याख्या नहीं बनाता और न ही अपने खुद के अर्थ उत्पन्न करता है, यह उपयोगकर्ता की भाषा में पहुंच योग्य बनाने के लिए कृत्रिम बुद्धिमत्ता की सहायता से प्रामाणिक विधियों को लागू करता है। कोई भी पाठक इस पृष्ठ के अंत में सूचीबद्ध मूल स्रोतों के साथ ग्रंथों की तुलना कर सकता है।",
    ichingHeading: "आई चिंग (周易 · Zhouyi)",
    ichingOriginHeading: "ऐतिहासिक उत्पत्ति (लगभग 1000 ईसा पूर्व)",
    ichingOriginBody:
      "झोऊयी, 'झोऊ के परिवर्तन', मानवता के सबसे प्राचीन ग्रंथों में से एक है। इसकी जड़ें झोऊ राजवंश (1046-256 ईसा पूर्व) तक जाती हैं, हालांकि इसका भविष्यवाणी केंद्र इससे भी पहले का है। यह पाठ विभिन्न ऐतिहासिक परतों में बनाया गया था: राजा वेन ने कैद में रहते हुए 64 हेक्साग्राम का आयोजन किया और निर्णय (卦辞, guàcí) लिखे। उनके पुत्र झोऊ के ड्यूक ने छह रेखाओं के वाक्य (爻辞, yáocí) जोड़े। सदियों बाद, कन्फ्यूशियस और उनके शिष्यों ने दस पंखों (十翼) के रूप में जाने जाने वाले टिप्पणियां जोड़ीं, जो पाठ की सबसे गहरी दार्शनिक परत है।",
    ichingHexHeading: "64 हेक्साग्राम प्रणाली",
    ichingHexBody:
      "प्रत्येक हेक्साग्राम छह रेखाओं की एक आकृति है, प्रत्येक यिन (टूटी हुई, ग्रहणशील) या यांग (अखंड, सक्रिय)। 64 संभावित संयोजन प्रकृति और मानव जीवन में परिवर्तन के मौलिक पैटर्न का वर्णन करते हैं। गतिशील रेखाएं परिवर्तन का संकेत देती हैं: वर्तमान हेक्साग्राम एक भविष्य के हेक्साग्राम में बदल जाता है, और वह संक्रमण पाठन का केंद्र है।",
    ichingHexListHeading: "राजा वेन के क्रम में 64 हेक्साग्राम",
    ichingHexListIntro:
      "सभी 64 हेक्साग्रामों की पूरी सूची, उनके क्रमांक, चिह्न और चीनी तथा पिनयिन में पारंपरिक नाम के साथ। उनका अर्थ यहां नहीं दिया गया है: प्रत्येक हेक्साग्राम केवल किसी ठोस परामर्श के भीतर ही रूप लेता है, जहां प्रश्न और परामर्शक का संदर्भ पठन तय करते हैं।",
    ichingHexListAriaLabel: "64 हेक्साग्रामों की सूची",
    ichingMethodHeading: "तीन सिक्कों की विधि",
    ichingMethodBody:
      "शास्त्रीय सिक्का विधि तीन सिक्कों को छह बार फेंककर हेक्साग्राम को एक-एक रेखा बनाती है। यह यारो की छड़ों से तेज़ है और उसी प्रकार का परिणाम देती है: अखंड (यांग) और टूटी हुई (यिन) रेखाएं, जिनमें कुछ गतिशील होती हैं। उन गतिशील रेखाओं को फिर कैसे पढ़ा जाता है, यह एक अलग विषय है, जिसे अगले खंड में देखा गया है।",
    ichingWilhelmHeading: "Wilhelm/Baynes अनुवाद",
    ichingWilhelmBody:
      "जर्मन चीनी विद्वान रिचर्ड विल्हेम दशकों तक चीन में रहे और 1924 में पश्चिमी भाषाओं में I Ching का सबसे पूर्ण और सम्मानित अनुवाद प्रस्तुत किया, जिसमें निर्णय, रेखाएं और दस पंखों की टिप्पणियां शामिल हैं। Cary Baynes ने इसे 1950 में अंग्रेजी में अनुवाद किया। यह कार्य 2020 में सार्वजनिक डोमेन में आ गया और इस ऐप का आधार पाठ है, बिना किसी संशोधन या सरलीकरण के।",
    ichingLeggeHeading: "जेम्स लेग अनुवाद",
    ichingLeggeBody:
      "एक स्कॉटिश मिशनरी और चीनविज्ञानी जेम्स लेग ने 1882 में अपने स्मारकीय कार्य 'द सेक्रेड बुक्स ऑफ द ईस्ट' के हिस्से के रूप में आई चिंग का अनुवाद किया। उनका दृष्टिकोण कड़ाई से भाषाशास्त्रीय और शैक्षणिक था, जो कन्फ्यूशियस और पूर्व-कन्फ्यूशियस ग्रंथों के शाब्दिक अर्थ को समझने की कोशिश कर रहा था। उनका संस्करण एक अमूल्य व्याख्यात्मक कठोरता लाता है।",
    ichingZhouyiHeading: "मूल झोउ यी पाठ",
    ichingZhouyiBody:
      "मूल झोउ यी (शाब्दिक रूप से 'झोउ के परिवर्तन') आई चिंग का मूल है, जो 64 हेक्साग्राम, राजा वेन के निर्णयों और ड्यूक ऑफ झोउ की पंक्तियों से बना है, बिना बाद की कन्फ्यूशियस टिप्पणियों (दस पंखों) के। यह स्रोत दैवज्ञ की ओझा और सबसे पुरानी परत के साथ सीधा संबंध बनाने की अनुमति देता है。",
    ichingDataAuditHeading: "1:1 डेटा निष्ठा ऑडिट",
    ichingDataAuditBody:
      "अंतिम ऑडिट: 21 जून 2026. Legge और Zhou Yi (निर्णय, प्रतीक और पंक्तियाँ) sacred-texts.com और ctext.org से 100% मेल खाते हैं. Wilhelm भी 100% मेल खाता है, उन 6 जगहों पर दस्तावेजीकृत पूरक के साथ जहाँ Parma मिरर पूरा अंश ही छोड़ देता है: hexagram 56 (यात्री) का निर्णय (wengu और iching-online से जाँचा गया) और 5 अलग-अलग पंक्तियाँ (hex 20 पंक्ति 5; hex 21 पंक्तियाँ 2 और 3; hex 26 पंक्ति 3; hex 52 पंक्ति 2; पहले प्रकाशित पाठ से पुनर्स्थापित). डेटासेट फ़ील्ड नाम और JSON संरचना अपरिवर्तित हैं.",
    bonesHeading: "दैवज्ञ हड्डियां (甲骨 · Jiǎgǔ)",
    bonesOriginHeading:
      "ऐतिहासिक उत्पत्ति (शांग राजवंश, लगभग 1600-1046 ईसा पूर्व)",
    bonesOriginBody:
      "दैवज्ञ हड्डी भविष्यवाणी चीन की सबसे पुरानी दस्तावेज़ीकृत भविष्यवाणी प्रथा है, जो I Ching से भी पहले की है। शांग राजवंश के शाही ओझाओं ने कछुए की छाती की हड्डी या बैल के कंधे की हड्डी को जलाया और परिणामी दरारों को पढ़कर राजा के सैन्य, कृषि, जलवायु और व्यक्तिगत निर्णयों के बारे में पूर्वजों से परामर्श किया।",
    bonesVerdictsHeading: "निर्णय की चार अवस्थाएं",
    bonesVerdictAuspClear:
      "吉, स्पष्ट रूप से शुभ: पैटर्न बिना किसी संदेह के सकारात्मक प्रस्ताव की पुष्टि करता है।",
    bonesVerdictAuspMod:
      "吉 मध्यम, मध्यम रूप से शुभ: पुष्टि मौजूद है लेकिन बारीकियों या शर्तों के साथ।",
    bonesVerdictInauspMod:
      "凶 मध्यम, मध्यम रूप से अशुभ: पैटर्न आरक्षणों के साथ नकारात्मकता की ओर झुकता है।",
    bonesVerdictInauspClear:
      "凶, स्पष्ट रूप से अशुभ: पैटर्न बिना किसी संदेह के सकारात्मक प्रस्ताव को नकारता है।",
    yarrowHeading: "यारो की छड़ें (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "ऐतिहासिक उत्पत्ति (~1000 ईसा पूर्व)",
    yarrowOriginBody:
      "यारो की छड़ों की विधि वह दिव्यज्ञान प्रक्रिया है जो स्वयं I Ching में प्रलेखित है। दस पंखों में से एक, महान टीका (大传, Dàzhuàn), स्पष्ट रूप से कहता है: 'महान विस्तार की संख्या 50 है, जिनमें से 49 उपयोग में लाई जाती हैं।' कन्फ्यूशियस ने एनालेक्ट्स में कहा कि वे पचास वर्षों तक परिवर्तनों का अध्ययन करना चाहते थे; शास्त्रीय विद्वान 50 की इस संदर्भ को छड़ों की प्रक्रिया की ओर प्रत्यक्ष संकेत के रूप में समझते हैं। यह विधि तीन सिक्कों की विधि से एक सहस्राब्दी से अधिक पुरानी है। रिचर्ड विल्हेम और कैरी बेनिस ने 1950 के अपने अनुवाद के परिशिष्ट (प्रिंसटन यूनिवर्सिटी प्रेस) में पूर्ण प्रक्रिया प्रलेखित की।",
    yarrowProbHeading: "विधि का स्वभाव",
    yarrowProbBody:
      "डंठल विधि तीन सिक्कों की विधि की तुलना में धीमी अनुष्ठानिक लय रखती है। इस ऐप में इसका मूल्य किसी तकनीकी तालिका के रूप में नहीं, बल्कि उसी I Ching परंपरा में प्रवेश करने के दूसरे तरीके के रूप में प्रस्तुत है: अधिक स्पर्शनीय, अधिक सजग और Wilhelm/Baynes द्वारा दर्ज शास्त्रीय प्रक्रिया के निकट। तेज परामर्श के लिए तीन सिक्कों की विधि उतनी ही वैध रहती है।",
    translationsHeading: "अनुवाद",
    lineReadingHeading: "गतिशील रेखाओं का पठन",
    lineReadingIntroBody:
      "जब कोई फेंक गतिशील रेखाएं उत्पन्न करती है, तो वर्तमान हेक्साग्राम एक दूसरे में बदल जाता है। तब एक प्रश्न उठता है: कौन-सा पाठ पठन को नियंत्रित करता है? सदियों के दौरान दो महान उत्तर आकार लेते गए। यह ऐप डिफ़ॉल्ट रूप से Alfred Huang की न्यूनीकरण प्रणाली लागू करता है, और विकल्प पैनल से आप Zhu Xi के शास्त्रीय पठन पर स्विच कर सकते हैं। दोनों प्रामाणिक विधियां हैं; इनमें से कोई भी यहां आविष्कृत नहीं है। आप जो भी चुनें, रेखाओं का हर संयोजन हमेशा एक ही, सटीक नियंत्रक पाठ देता है।",
    lineReadingHuangHeading: "Alfred Huang की प्रणाली (डिफ़ॉल्ट)",
    lineReadingHuangBody:
      "Alfred Huang (1921 से 2014) एक चीनी विद्वान और ताओ गुरु थे, जिन्होंने सांस्कृतिक क्रांति के दौरान कारावास से बचने के बाद 'The Complete I Ching' (1998) के माध्यम से इस परंपरा को पश्चिम में पहुंचाया। उनका पठन स्पष्ट स्थानिक नियमों के द्वारा किसी भी संख्या की गतिशील रेखाओं को एक ही नियंत्रक पाठ में न्यूनीकृत करता है: एक गतिशील रेखा होने पर उसका अपना पाठ नियंत्रित करता है; विपरीत ध्रुवता की दो होने पर यिन रेखा नियंत्रित करती है; समान ध्रुवता की दो होने पर निचली नियंत्रित करती है; तीन होने पर बीच वाली नियंत्रित करती है; चार या पांच होने पर पठन रूपांतरित हेक्साग्राम पर चला जाता है; छह गतिशील रेखाएं होने पर (और कोई न होने पर) केवल निर्णय पढ़ा जाता है। परिणाम हमेशा एक स्पष्ट पाठ होता है, और इसीलिए ऐप इसे डिफ़ॉल्ट रूप से उपयोग करता है।",
    lineReadingZhuxiHeading: "Zhu Xi का शास्त्रीय पठन",
    lineReadingZhuxiBody:
      "Zhu Xi (1130 से 1200) महान नव-कन्फ्यूशियस दार्शनिक थे जिन्होंने अपने 'Yijing benyi' (Yijing का मूल अर्थ) में परिवर्तनों के अभ्यास को व्यवस्थित किया। उनके नियम अधिक प्राचीन और अधिक परतदार हैं, और अक्सर एक से अधिक पाठ पढ़ते हैं: दो गतिशील रेखाओं पर वे दोनों को पढ़ते हैं, ऊपरी को प्राथमिकता देते हुए; तीन पर वे आरेखों के एक समूह की सहायता से दोनों हेक्साग्रामों के निर्णयों को तौलते हैं; चार या पांच पर वे रूपांतरित हेक्साग्राम की स्थिर रेखाओं को पढ़ते हैं। विकल्प पैनल में इस प्रणाली को चुनने पर ये शास्त्रीय विकल्प हर मामले में निष्ठापूर्वक लागू होते हैं।",
    interpretHeading: "AI क्यों नहीं बनाता",
    interpretBody:
      "इस ऐप में कृत्रिम बुद्धिमत्ता की एक विशिष्ट और सीमित कार्य है: एल्गोरिदम का परिणाम, हेक्साग्राम, गतिशील रेखाएं, दरार निर्णय, लेना और उसे उपयोगकर्ता के प्रश्न के संदर्भ के साथ उपयोगकर्ता की भाषा में प्राकृतिक भाषा में व्यक्त करना। AI हेक्साग्राम उत्पन्न नहीं करता, निर्णय तय नहीं करता, Wilhelm के ग्रंथों या शांग विधि के पैटर्न को संशोधित नहीं करता। गणितीय एल्गोरिदम AI के हस्तक्षेप से पहले यह सब विश्वासपूर्वक करता है। AI दुभाषिया है। दैवज्ञ विधि है।",
    sourcesHeading: "स्रोत और संदर्भ",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsüeh ch’i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
};

export function getNotesPageUiMessages(locale: AppLocale): NotesPageUiMessages {
  return NOTES_PAGE_UI[locale] ?? NOTES_PAGE_UI[DEFAULT_LOCALE];
}
