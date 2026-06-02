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
  ichingMethodHeading: string;
  ichingMethodBody: string;
  ichingWilhelmHeading: string;
  ichingWilhelmBody: string;
  ichingLeggeHeading: string;
  ichingLeggeBody: string;
  ichingZhouyiHeading: string;
  ichingZhouyiBody: string;
  ichingChainHeading: string;
  ichingChain: string;
  bonesHeading: string;
  bonesOriginHeading: string;
  bonesOriginBody: string;
  bonesRitualHeading: string;
  bonesRitualBody: string;
  bonesVerdictsHeading: string;
  bonesVerdictAuspClear: string;
  bonesVerdictAuspMod: string;
  bonesVerdictInauspMod: string;
  bonesVerdictInauspClear: string;
  bonesAuthHeading: string;
  bonesAuthBody: string;
  yarrowHeading: string;
  yarrowOriginHeading: string;
  yarrowOriginBody: string;
  yarrowProcedureHeading: string;
  yarrowProcedureBody: string;
  yarrowProbHeading: string;
  yarrowProbBody: string;
  interpretHeading: string;
  interpretBody: string;
  sourcesHeading: string;
  sourcesList: string[];
};

const NOTES_PAGE_UI: Record<AppLocale, NotesPageUiMessages> = {
  es: {
    title: "Notas y Origen de los MÃ©todos",
    lead: "Esta pÃ¡gina es contexto tÃ©cnico-cultural. No es una guÃ­a de uso.",
    authNotice:
      "Todos los mÃ©todos usados en esta app provienen de tradiciones milenarias de la cultura china, documentadas histÃ³ricamente y respetadas acadÃ©micamente en todo el mundo. Esta app no inventa interpretaciones ni genera significados propios; aplica mÃ©todos autÃ©nticos asistidos por tecnologÃ­a de inteligencia artificial para hacerlos accesibles en el idioma del usuario. Cualquier lector puede contrastar los textos con las fuentes originales listadas al final de esta pÃ¡gina.",
    ichingHeading: "I Ching (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "Origen histÃ³rico (~1000 a.C.)",
    ichingOriginBody:
      "El Zhouyi, Â«Los Cambios de ZhouÂ», es uno de los textos mÃ¡s antiguos de la humanidad. Sus raÃ­ces se remontan a la dinastÃ­a Zhou (1046â€“256 a.C.). El texto se construyÃ³ en capas histÃ³ricas: el Rey Wen organizÃ³ los 64 hexagramas y escribiÃ³ los Juicios (guÃ cÃ­) mientras estaba prisionero. Su hijo, el Duque de Zhou, aÃ±adiÃ³ las sentencias de las seis lÃ­neas (yÃ¡ocÃ­). Siglos despuÃ©s, Confucio y sus discÃ­pulos agregaron los Comentarios conocidos como las Diez Alas (åç¿¼), el estrato filosÃ³fico mÃ¡s profundo del texto.",
    ichingHexHeading: "El sistema de los 64 hexagramas",
    ichingHexBody:
      "Cada hexagrama es una figura de seis lÃ­neas, cada una yin (rota) o yang (entera). Las 64 combinaciones posibles describen los patrones fundamentales del cambio. Las lÃ­neas en movimiento indican transformaciÃ³n: el hexagrama presente muta hacia uno futuro, y esa transiciÃ³n es el corazÃ³n de la lectura.",
    ichingMethodHeading: "El mÃ©todo de las tres monedas y las reglas de Zhu Xi",
    ichingMethodBody:
      "El mÃ©todo clÃ¡sico usa tres monedas lanzadas seis veces. Cuando mÃºltiples lÃ­neas cambian, la escuela de Zhu Xi (neoconfucianismo, siglo XII d.C.) establece reglas precisas para determinar quÃ© lÃ­nea gobierna la lectura, eliminando la ambigÃ¼edad interpretativa. Esta app implementa exactamente esas reglas sin modificaciÃ³n.",
    ichingWilhelmHeading: "La traducciÃ³n Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm produjo en 1924 la traducciÃ³n mÃ¡s completa y respetada del I Ching en lengua occidental. Cary Baynes la tradujo al inglÃ©s en 1950 (Princeton University Press). Esta obra es el texto base de esta app, sin modificaciones ni simplificaciones.",
    ichingLeggeHeading: "La traducciÃ³n de James Legge",
    ichingLeggeBody:
      "James Legge, un misionero y sinÃ³logo escocÃ©s, tradujo el I Ching en 1882 como parte de su obra monumental 'The Sacred Books of the East'. Su enfoque fue estrictamente filolÃ³gico y acadÃ©mico, buscando descifrar el significado literal de los textos confucianos y pre-confucianos. Su versiÃ³n aporta un rigor interpretativo invaluable.",
    ichingZhouyiHeading: "El texto original Zhou Yi",
    ichingZhouyiBody:
      "El Zhou Yi original (literalmente 'Cambios de Zhou') es el nÃºcleo del I Ching, compuesto por los 64 hexagramas, los juicios del Rey Wen y las lÃ­neas del Duque de Zhou, sin los comentarios confucianos posteriores (las Diez Alas). Esta fuente permite conectar directamente con la capa chamÃ¡nica y mÃ¡s antigua del orÃ¡culo.",
    ichingChainHeading: "",
    ichingChain: "",
    bonesHeading: "Huesos de OrÃ¡culo (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading: "Origen histÃ³rico (DinastÃ­a Shang, ~1600â€“1046 a.C.)",
    bonesOriginBody:
      "La prÃ¡ctica oracular documentada mÃ¡s antigua de China. Los chamanes reales aplicaban calor a huesos o caparazones para leer las grietas resultantes. Esta app respeta la lÃ³gica estructural del sistema Shang: carga positiva, carga negativa y veredicto por patrÃ³n.",
    bonesRitualHeading: "",
    bonesRitualBody: "",
    bonesVerdictsHeading: "Los cuatro estados del veredicto:",
    bonesVerdictAuspClear: "å‰. Favorable claro.",
    bonesVerdictAuspMod: "å‰ moderado. Favorable con matices.",
    bonesVerdictInauspMod: "å‡¶ moderado. Desfavorable con reservas.",
    bonesVerdictInauspClear: "å‡¶. Desfavorable claro.",
    bonesAuthHeading: "",
    bonesAuthBody: "",
    yarrowHeading: "Varillas de Milenrama (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "Origen histÃ³rico (~1000 a.C.)",
    yarrowOriginBody:
      "Es el procedimiento descrito en el Gran Comentario (DÃ zhuÃ n). El mÃ©todo precisa: Â«El nÃºmero de la Gran ExpansiÃ³n es 50, de los que se usan 49Â». El mÃ©todo es anterior al de tres monedas en mÃ¡s de un milenio. Richard Wilhelm documentÃ³ el procedimiento completo en su obra de 1924, rescatando un ritmo ritual mÃ¡s lento, tÃ¡ctil y deliberado que el de las monedas.",
    yarrowProcedureHeading: "",
    yarrowProcedureBody: "",
    yarrowProbHeading: "",
    yarrowProbBody: "",
    interpretHeading: "Por quÃ© la IA no inventa",
    interpretBody:
      "La inteligencia artificial en esta app tiene una funciÃ³n especÃ­fica y acotada: tomar el resultado del algoritmo (hexagramas, lÃ­neas en movimiento o veredicto de grietas) y articularlo en lenguaje natural con el contexto de la pregunta del usuario.\n\nLa IA no genera hexagramas, no decide veredictos, ni modifica los textos de Wilhelm, Legge ni del Zhou Yi. El algoritmo matemÃ¡tico realiza el proceso tÃ©cnico-tradicional fielmente antes de que la IA intervenga. La IA es el intÃ©rprete; el orÃ¡culo es el mÃ©todo.",
    sourcesHeading: "Fuentes y Referencias AcadÃ©micas",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
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
    ichingHeading: "I Ching (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "Historical Origins (~1000 BCE)",
    ichingOriginBody:
      "The Zhouyi, 'The Changes of Zhou', is one of the oldest texts in human history. Its roots trace back to the Zhou dynasty (1046â€“256 BCE). The text was built in historical layers: King Wen organized the 64 hexagrams and wrote the Judgments (guÃ cÃ­) while imprisoned. His son, the Duke of Zhou, added the statements for the six lines (yÃ¡ocÃ­). Centuries later, Confucius and his disciples added the Commentaries known as the Ten Wings (åç¿¼), the deepest philosophical stratum of the text.",
    ichingHexHeading: "The 64-Hexagram System",
    ichingHexBody:
      "Each hexagram is a figure composed of six lines, either yin (broken) or yang (solid). The 64 possible combinations describe the fundamental patterns of change. Moving lines indicate transformation: the present hexagram mutates into a future one, and this transition is the heart of the reading.",
    ichingMethodHeading: "The Three-Coin Method and Zhu Xi's Rules",
    ichingMethodBody:
      "The classic method uses three coins cast six times. When multiple lines change, the Zhu Xi school (Neo-Confucianism, 12th century CE) establishes precise rules to determine which line governs the reading, eliminating interpretive ambiguity. This app implements these rules exactly without modification.",
    ichingWilhelmHeading: "The Wilhelm/Baynes Translation",
    ichingWilhelmBody:
      "Richard Wilhelm produced in 1924 the most complete and respected translation of the I Ching in Western languages. Cary Baynes translated it into English in 1950 (Princeton University Press). This work is the base text of this app, without modifications or simplifications.",
    ichingLeggeHeading: "The James Legge Translation",
    ichingLeggeBody:
      "James Legge, a Scottish missionary and sinologist, translated the I Ching in 1882 as part of his monumental work 'The Sacred Books of the East'. His approach was strictly philological and academic, seeking to decipher the literal meaning of Confucian and pre-Confucian texts. His version brings an invaluable interpretive rigor.",
    ichingZhouyiHeading: "The Original Zhou Yi Text",
    ichingZhouyiBody:
      "The original Zhou Yi (literally 'Changes of Zhou') is the core of the I Ching, composed of the 64 hexagrams, King Wen's judgments, and the Duke of Zhou's lines, without the later Confucian commentaries (the Ten Wings). This source allows a direct connection with the shamanic and oldest layer of the oracle.",
    ichingChainHeading: "The Chain of Authenticity",
    ichingChain:
      "Original Zhou Yi (Zhou dynasty) â†’ Confucian Commentaries (5th c. BCE) â†’ Zhu Xi's Rules (12th c. CE) â†’ Wilhelm German translation (1924) â†’ Baynes English translation (1950) â†’ Public domain (2020) â†’ This app.",
    bonesHeading: "Oracle Bones (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading: "Historical Origins (Shang Dynasty, ~1600â€“1046 BCE)",
    bonesOriginBody:
      "The oldest documented oracular practice in China. Royal shamans applied heat to bones or shells to read the resulting cracks. This app respects the structural logic of the Shang system: positive charge, negative charge, and verdict by pattern.",
    bonesRitualHeading: "The Ritual Process",
    bonesRitualBody:
      "The process was precise and repeatable: a positive charge and its negation were formulated. Incandescent bronze was applied to the bone until cracks formed. The orientation, length, and pattern of the cracks determined the verdict. The result was inscribed on the bone itself, constituting China's earliest written records.",
    bonesVerdictsHeading: "The Four Verdict States:",
    bonesVerdictAuspClear: "å‰. Clearly favorable.",
    bonesVerdictAuspMod: "å‰ moderate. Favorable with nuance.",
    bonesVerdictInauspMod: "å‡¶ moderate. Unfavorable with reservations.",
    bonesVerdictInauspClear: "å‡¶. Clearly unfavorable.",
    bonesAuthHeading: "Authenticity of the Method",
    bonesAuthBody:
      "More than 150,000 oracle bone fragments have been excavated and studied since the 19th century. They are internationally recognized heritage and are preserved in museums in China, Taiwan, Japan, and Europe. The method implemented in this app respects the structural logic of the Shang system: positive charge, negative charge, and verdict by pattern â€” always resolving to å‰ or å‡¶ in keeping with the authentic Shang archaeological record.",
    yarrowHeading: "Yarrow Stalks (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "Historical Origins (~1000 BCE)",
    yarrowOriginBody:
      "This is the procedure described in the Great Commentary (DÃ zhuÃ n). The method specifies: 'The number of the Great Expansion is 50, of which 49 are used.' This method predates the three-coin method by over a millennium. Richard Wilhelm documented the full procedure in his 1924 work, preserving a slower, more tactile, and deliberate ritual rhythm compared to coins.",
    yarrowProcedureHeading: "Physical Procedure",
    yarrowProcedureBody:
      "The method uses a set of physical stalks or similar objects. One is set aside, and the rest are divided and counted through a repeated ritual sequence until each of the six lines is formed. The important point for users is the pace: it asks for attention, touch, and patience, making the consultation feel more ceremonial than the three-coin method.",
    yarrowProbHeading: "Character of the method",
    yarrowProbBody:
      "The stalk method preserves a slower ritual tempo than the three-coin method. In this app, its value is not presented as a technical table, but as a different way of entering the same I Ching tradition: more tactile, more deliberate, and closer to the classical procedure documented by Wilhelm/Baynes. The three-coin method remains equally valid for a faster consultation.",
    interpretHeading: "Why AI Does Not Invent",
    interpretBody:
      "The artificial intelligence in this app has a specific and bounded function: to take the result of the algorithm (hexagrams, moving lines, or crack verdicts) and articulate it in natural language with the context of the user's question. The AI does not generate hexagrams, does not decide verdicts, and does not modify the texts of Wilhelm, Legge, or the Zhou Yi. The mathematical algorithm performs the technical-traditional process faithfully before the AI intervenes. The AI is the interpreter; the oracle is the method.",
    sourcesHeading: "Academic Sources and References",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  pt: {
    title: "Notas e Origem dos MÃ©todos",
    lead: "Esta pÃ¡gina fornece contexto tÃ©cnico e cultural. NÃ£o Ã© um guia de uso.",
    authNotice:
      "Todos os mÃ©todos usados nesta app provÃªm de tradiÃ§Ãµes milenares da cultura chinesa, documentadas historicamente e respeitadas academicamente em todo o mundo. Esta app nÃ£o inventa interpretaÃ§Ãµes nem gera significados prÃ³prios; aplica mÃ©todos autÃ©nticos assistidos por tecnologia de inteligÃªncia artificial para os tornar acessÃ­veis no idioma do utilizador. Qualquer leitor pode verificar os textos com as fontes originais listadas no final desta pÃ¡gina.",
    ichingHeading: "I Ching (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "Origem histÃ³rica (~1000 a.C.)",
    ichingOriginBody:
      "O Zhouyi, Â«As MutaÃ§Ãµes de ZhouÂ», Ã© um dos textos mais antigos da humanidade. As suas raÃ­zes remontam Ã  dinastia Zhou (1046â€“256 a.C.). O texto foi construÃ­do em camadas histÃ³ricas: o Rei Wen organizou os 64 hexagramas e escreveu os JuÃ­zos (guÃ cÃ­) enquanto estava prisioneiro. O seu filho, o Duque de Zhou, acrescentou as sentenÃ§as das seis linhas (yÃ¡ocÃ­). SÃ©culos depois, ConfÃºcio e os seus discÃ­pulos acrescentaram os ComentÃ¡rios conhecidos como as Dez Asas (åç¿¼), o estrato filosÃ³fico mais profundo do texto.",
    ichingHexHeading: "O sistema dos 64 hexagramas",
    ichingHexBody:
      "Cada hexagrama Ã© uma figura composta por seis linhas, cada uma yin (quebrada) ou yang (inteira). As 64 combinaÃ§Ãµes possÃ­veis descrevem os padrÃµes fundamentais da mudanÃ§a. As linhas em movimento indicam transformaÃ§Ã£o: o hexagrama presente muta para um futuro, e essa transiÃ§Ã£o Ã© o coraÃ§Ã£o da leitura.",
    ichingMethodHeading: "O mÃ©todo das trÃªs moedas e as regras de Zhu Xi",
    ichingMethodBody:
      "O mÃ©todo clÃ¡ssico usa trÃªs moedas lanÃ§adas seis vezes. Quando mÃºltiplas linhas mudam, a escola de Zhu Xi (neo-confucionismo, sÃ©culo XII d.C.) estabelece regras precisas para determinar qual linha governa a leitura, eliminando a ambiguidade interpretativa. Esta app implementa exatamente essas regras sem modificaÃ§Ã£o.",
    ichingWilhelmHeading: "A traduÃ§Ã£o Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm produziu em 1924 a traduÃ§Ã£o mais completa e respeitada do I Ching em lÃ­ngua ocidental. Cary Baynes traduziu-a para inglÃªs em 1950 (Princeton University Press). Esta obra Ã© o texto base desta app, sem modificaÃ§Ãµes nem simplificaÃ§Ãµes.",
    ichingLeggeHeading: "A traduÃ§Ã£o de James Legge",
    ichingLeggeBody:
      "James Legge, um missionÃ¡rio e sinÃ³logo escocÃªs, traduziu o I Ching em 1882 como parte da sua obra monumental 'The Sacred Books of the East'. A sua abordagem foi estritamente filolÃ³gica e acadÃ©mica, procurando decifrar o significado literal dos textos confucianos e prÃ©-confucianos. A sua versÃ£o traz um rigor interpretativo inestimÃ¡vel.",
    ichingZhouyiHeading: "O texto original Zhou Yi",
    ichingZhouyiBody:
      "O Zhou Yi original (literalmente 'MutaÃ§Ãµes de Zhou') Ã© o nÃºcleo do I Ching, composto pelos 64 hexagramas, os juÃ­zos do Rei Wen e as linhas do Duque de Zhou, sem os comentÃ¡rios confucianos posteriores (as Dez Asas). Esta fonte permite uma ligaÃ§Ã£o direta Ã  camada xamÃ¢nica e mais antiga do orÃ¡culo.",
    ichingChainHeading: "A cadeia de autenticidade",
    ichingChain:
      "Zhou Yi original (dinastÃ­a Zhou) â†’ ComentÃ¡rios de ConfÃºcio (sÃ©c. V a.C.) â†’ Reglas de Zhu Xi (sÃ©c. XII d.C.) â†’ TraduÃ§Ã£o Wilhelm alemÃ£o (1924) â†’ TraduÃ§Ã£o Baynes inglÃªs (1950) â†’ DomÃ­nio pÃºblico (2020) â†’ Esta app.",
    bonesHeading: "Ossos Oraculares (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading: "Origem histÃ³rica (DinastÃ­a Shang, ~1600â€“1046 a.C.)",
    bonesOriginBody:
      "A prÃ¡tica oracular documentada mais antiga da China. Os xamÃ£s reais aplicavam calor a ossos ou carapaÃ§as para ler as fissuras resultantes. Esta app respeita a lÃ³gica estrutural do sistema Shang: carga positiva, carga negativa e veredicto por padrÃ£o.",
    bonesRitualHeading: "O processo ritual",
    bonesRitualBody:
      "O processo era preciso e repetÃ­vel: formulava-se uma carga positiva e a sua negaÃ§Ã£o. Aplicava-se bronze incandescente ao osso atÃ© produzir fissuras. A orientaÃ§Ã£o, comprimento e padrÃ£o das fissuras determinava o veredicto. O resultado era gravado no prÃ³prio osso, constituindo os primeiros registos escritos da China.",
    bonesVerdictsHeading: "Os quatro estados do veredicto:",
    bonesVerdictAuspClear: "å‰. FavorÃ¡vel claro.",
    bonesVerdictAuspMod: "å‰ moderado. FavorÃ¡vel com nuances.",
    bonesVerdictInauspMod: "å‡¶ moderado. DesfavorÃ¡vel com reservas.",
    bonesVerdictInauspClear: "å‡¶. DesfavorÃ¡vel claro.",
    bonesAuthHeading: "Autenticidade do mÃ©todo",
    bonesAuthBody:
      "Mais de 150.000 fragmentos de ossos oraculares foram escavados e estudados desde o sÃ©culo XIX. SÃ£o patrimÃ³nio reconhecido internacionalmente e conservam-se em museus da China, Taiwan, JapÃ£o e Europa. O mÃ©todo implementado nesta app respeita a lÃ³gica estrutural do sistema Shang: carga positiva, carga negativa, veredicto por padrÃ£o â€” sempre resolvendo para å‰ ou å‡¶.",
    yarrowHeading: "Varetas de Milenrama (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "Origem histÃ³rica (~1000 a.C.)",
    yarrowOriginBody:
      "Ã‰ o procedimento descrito no Grande ComentÃ¡rio (DÃ zhuÃ n). O mÃ©todo especifica: Â«O nÃºmero da Grande ExpansÃ£o Ã© 50, dos quais 49 sÃ£o usadosÂ». O mÃ©todo Ã© anterior ao das trÃªs moedas em mais de um milÃ©nio. Richard Wilhelm documentou o procedimento completo na sua obra de 1924, resgatando um ritmo ritual mais lento, tÃ¡til e deliberado do que o das moedas.",
    yarrowProcedureHeading: "Procedimento fÃ­sico",
    yarrowProcedureBody:
      "O mÃ©todo usa um conjunto de varetas fÃ­sicas ou objetos semelhantes. Uma Ã© posta de lado e as restantes sÃ£o divididas e contadas atravÃ©s de uma sequÃªncia ritual repetida atÃ© formar cada uma das seis linhas. O ponto importante para o utilizador Ã© o ritmo: pede atenÃ§Ã£o, toque e paciÃªncia, fazendo a consulta parecer mais cerimonial do que o mÃ©todo das trÃªs moedas.",
    yarrowProbHeading: "CarÃ¡ter do mÃ©todo",
    yarrowProbBody:
      "O mÃ©todo das varetas preserva um ritmo ritual mais lento do que o das trÃªs moedas. Nesta app, o seu valor nÃ£o Ã© apresentado como uma tabela tÃ©cnica, mas como uma forma diferente de entrar na mesma tradiÃ§Ã£o do I Ching: mais tÃ¡til, mais deliberada e mais prÃ³xima do procedimento clÃ¡ssico documentado por Wilhelm/Baynes. O mÃ©todo das trÃªs moedas continua igualmente vÃ¡lido para uma consulta mais rÃ¡pida.",
    interpretHeading: "Por que a IA nÃ£o inventa",
    interpretBody:
      "A inteligÃªncia artificial nesta app tem uma funÃ§Ã£o especÃ­fica e delimitada: tomar o resultado do algoritmo (hexagramas, linhas em movimento ou veredicto de fissuras) e articulÃ¡-lo em linguagem natural com o contexto da pergunta do utilizador. A IA nÃ£o gera hexagramas, nÃ£o decide veredictos, nem modifica os textos de Wilhelm. O algoritmo matemÃ¡tico realiza o processo tÃ©cnico-tradicional fielmente antes de a IA intervir. A IA Ã© o intÃ©rprete; o orÃ¡culo Ã© o mÃ©todo.",
    sourcesHeading: "Fontes e ReferÃªncias AcadÃªmicas",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  fr: {
    title: "Notes et origine des mÃ©thodes",
    lead: "Cette page fournit un contexte technique et culturel. Ce n'est pas un guide d'utilisation.",
    authNotice:
      "Toutes les mÃ©thodes utilisÃ©es dans cette app proviennent de traditions millÃ©naires de la culture chinoise, historiquement documentÃ©es et acadÃ©miquement respectÃ©es dans le monde entier. Cette app n'invente pas d'interprÃ©tations ni ne gÃ©nÃ¨re ses propres significations ; elle applique des mÃ©thodes authentiques assistÃ©es par la technologie de l'intelligence artificielle pour les rendre accessibles dans la langue de l'utilisateur. Tout lecteur peut vÃ©rifier les textes avec les sources originales listÃ©es Ã  la fin de cette page.",
    ichingHeading: "I Ching (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "Origine historique (~1000 av. J.-C.)",
    ichingOriginBody:
      "Le Zhouyi, Â« Les Changements de Zhou Â», est l'un des textes plus anciens de l'humanitÃ©. Ses racines remontent Ã  la dynastie Zhou (1046â€“256 av. J.-C.). Le texte a Ã©tÃ© construit en couches historiques : le Roi Wen a organisÃ© les 64 hexagrammes et a Ã©crit les Jugements (guÃ cÃ­) pendant son emprisonnement. Son fils, le Duc de Zhou, a ajoutÃ© les sentences pour les six traits (yÃ¡ocÃ­). Des siÃ¨cles plus tard, Confucius et ses disciples ont ajoutÃ© les Commentaires connus sous le nom des Dix Ailes (åç¿¼), la strate philosophique la plus profonde du texte.",
    ichingHexHeading: "Le systÃ¨me des 64 hexagrammes",
    ichingHexBody:
      "Chaque hexagramme est une figure composÃ©e de six traits, chacun yin (brisÃ©) ou yang (plein). Les 64 combinaisons possibles dÃ©crivent les modÃ¨les fondamentaux du changement. Les traits en mouvement indiquent une transformation : l'hexagramme prÃ©sent mute en un futur, et cette transition est au cÅ“ur de la lecture.",
    ichingMethodHeading: "La mÃ©thode des trois piÃ¨ces et les reglas de Zhu Xi",
    ichingMethodBody:
      "La mÃ©thode classique utilise trois piÃ¨ces lancÃ©es six fois. Lorsque plusieurs traits changent, l'Ã©cole de Zhu Xi (nÃ©oconfucianisme, XIIe siÃ¨cle ap. J.-C.) Ã©tablit des rÃ¨gles prÃ©cises pour dÃ©terminer quel trait gouverne la lecture, Ã©liminant toute ambiguÃ¯tÃ© interprÃ©tative. Cette app implÃ©mente exactement ces rÃ¨gles sans modification.",
    ichingWilhelmHeading: "La traduction Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm a produit en 1924 la traduction la plus complÃ¨te et la plus respectÃ©e du I Ching en langue occidentale. Cary Baynes l'a traduite en anglais en 1950 (Princeton University Press). Cette Å“uvre constitue le texte base de cette app, sans modifications ni simplifications.",
    ichingLeggeHeading: "La traduction de James Legge",
    ichingLeggeBody:
      "James Legge, un missionnaire et sinologue Ã©cossais, a traduit le I Ching en 1882 dans le cadre de son Å“uvre monumentale 'The Sacred Books of the East'. Son approche Ã©tait strictement philologique et acadÃ©mique, cherchant Ã  dÃ©chiffrer le sens littÃ©ral des textes confucÃ©ens et prÃ©-confucÃ©ens. Sa version apporte une rigueur interprÃ©tative inestimable.",
    ichingZhouyiHeading: "Le texte original Zhou Yi",
    ichingZhouyiBody:
      "Le Zhou Yi original (littÃ©ralement 'Changements de Zhou') est le noyau du I Ching, composÃ© des 64 hexagrammes, des jugements du Roi Wen et des lignes du Duc de Zhou, sans les commentaires confucÃ©ens ultÃ©rieurs (les Dix Ailes). Cette source permet une connexion directe avec la couche chamanique et la plus ancienne de l'oracle.",
    ichingChainHeading: "La chaÃ®ne d'authenticitÃ©",
    ichingChain:
      "Zhou Yi original (dynastie Zhou) â†’ Commentaires de Confucius (Ve s. av. J.-C.) â†’ RÃ¨gles de Zhu Xi (XIIe s. ap. J.-C.) â†’ Traduction Wilhelm en allemand (1924) â†’ Traduction Baynes en anglais (1950) â†’ Domaine public (2020) â†’ Cette app.",
    bonesHeading: "Os oraculaires (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading:
      "Origine historique (Dynastie Shang, ~1600â€“1046 av. J.-C.)",
    bonesOriginBody:
      "La pratique oraculaire documentÃ©e la plus ancienne de Chine. Les chamanes royaux appliquaient de la chaleur sur des os ou des Ã©cailles pour lire les fissures rÃ©sultantes. Cette app respecte la logique structurelle du systÃ¨me Shang : charge positive, charge nÃ©gative et verdict par motif.",
    bonesRitualHeading: "Le processus rituel",
    bonesRitualBody:
      "Le processus Ã©tait prÃ©cis et reproductible : on formulait une charge positive et sa nÃ©gation. On appliquait du bronze incandescent sur l'os jusqu'Ã  produire des fissures. L'orientation, la longueur et le motif des fissures dÃ©terminaient le verdict. Le rÃ©sultat Ã©tait gravÃ© sur l'os lui-mÃªme, constituant les premiers Ã©crits de Chine.",
    bonesVerdictsHeading: "Les quatre Ã©tats du verdict :",
    bonesVerdictAuspClear: "å‰. Clairement favorable.",
    bonesVerdictAuspMod: "å‰ modÃ©rÃ©. Favorable avec nuances.",
    bonesVerdictInauspMod: "å‡¶ modÃ©rÃ©. DÃ©favorable avec rÃ©serves.",
    bonesVerdictInauspClear: "å‡¶. Clairement dÃ©favorable.",
    bonesAuthHeading: "AuthenticitÃ© de la mÃ©thode",
    bonesAuthBody:
      "Plus de 150 000 fragments d'os oraculaires ont Ã©tÃ© excavÃ©s et Ã©tudiÃ©s depuis le XIXe siÃ¨cle. Ils constituent un patrimoine reconnu internationalement et sont conservÃ©s dans des musÃ©es en Chine, Ã  TaÃ¯wan, au Japon et en Europe. La mÃ©thode implÃ©mentÃ©e dans cette app respecte la logique structurelle du systÃ¨me Shang : charge positive, charge nÃ©gative, verdict par motif â€” toujours rÃ©solu en å‰ ou å‡¶ conformÃ©ment au dossier archÃ©ologique Shang authentique.",
    yarrowHeading: "Tiges d'AchillÃ©e (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "Origine historique (~1000 av. J.-C.)",
    yarrowOriginBody:
      "C'est le procÃ©dÃ© dÃ©crit dans le Grand Commentaire (DÃ zhuÃ n). Le mÃ©thode prÃ©cise : Â« Le nombre de la Grande Expansion est 50, dont 49 sont utilisÃ©s Â». Cette mÃ©thode est antÃ©rieure Ã  celle des trois piÃ¨ces de plus d'un millÃ©naire. Richard Wilhelm a documentÃ© le procÃ©dÃ© complet dans son Å“uvre de 1924, prÃ©servant un rythme rituel plus lent, tactile et dÃ©libÃ©rÃ© que celui des piÃ¨ces.",
    yarrowProcedureHeading: "ProcÃ©dure physique",
    yarrowProcedureBody:
      "La mÃ©thode utilise un ensemble de tiges physiques ou d'objets semblables. Une tige est mise de cÃ´tÃ©, puis les autres sont divisÃ©es et comptÃ©es selon une sÃ©quence rituelle rÃ©pÃ©tÃ©e jusqu'Ã  former chacun des six traits. Pour l'utilisateur, l'essentiel est le rythme : elle demande attention, contact et patience, ce qui rend la consultation plus cÃ©rÃ©monielle que la mÃ©thode des trois piÃ¨ces.",
    yarrowProbHeading: "CaractÃ¨re de la mÃ©thode",
    yarrowProbBody:
      "La mÃ©thode des tiges conserve un rythme rituel plus lent que celle des trois piÃ¨ces. Dans cette app, sa valeur n'est pas prÃ©sentÃ©e comme un tableau technique, mais comme une autre faÃ§on d'entrer dans la mÃªme tradition du I Ching : plus tactile, plus dÃ©libÃ©rÃ©e et plus proche du procÃ©dÃ© classique documentÃ© par Wilhelm/Baynes. La mÃ©thode des trois piÃ¨ces reste tout aussi valide pour une consultation plus rapide.",
    interpretHeading: "Pourquoi l'IA n'invente pas",
    interpretBody:
      "L'intelligence artificielle dans cette app a une fonction spÃ©cifique et dÃ©limitÃ©e : prendre le rÃ©sultat de l'algorithme (hexagrammes, traits en mouvement ou verdict de fissures) et l'articuler en langage naturel avec le contexte de la question de l'utilisateur. L'IA ne gÃ©nÃ¨re pas d'hexagrammes, ne dÃ©cide pas des verdicts, et ne modifie pas les textes de Wilhelm. L'algorithme mathÃ©matique rÃ©alise le processus technico-traditionnel fidÃ¨lement avant que l'IA n'intervienne. L'IA est l'interprÃ¨te ; l'oracle est la mÃ©thode.",
    sourcesHeading: "Sources et rÃ©fÃ©rences acadÃ©miques",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  de: {
    title: "Methodennotizen und UrsprÃ¼nge",
    lead: "Diese Seite bietet technisch-kulturellen Kontext. Es ist keine Bedienungsanleitung.",
    authNotice:
      "Alle in dieser App verwendeten Methoden stammen aus jahrtausendealten Traditionen der chinesischen Kultur, historisch dokumentiert und weltweit akademisch anerkannt. Diese App erfindet keine Interpretationen und generiert keine eigenen Bedeutungen; sie wendet authentische Methoden an, die durch kÃ¼nstliche Intelligenz unterstÃ¼tzt werden, um sie in der Sprache des Nutzers zugÃ¤nglich zu machen. Jeder Leser kann die Texte mit den am Ende dieser Seite aufgefÃ¼hrten Originalquellen vergleichen.",
    ichingHeading: "I Ching (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "Historischer Ursprung (~1000 v. Chr.)",
    ichingOriginBody:
      "Das Zhouyi, Â«Die Wandlungen von ZhouÂ», ist einer der Ã¤ltesten Texte der Menschheit. Seine Wurzeln reichen bis in die Zhou-Dynastie (1046â€“256 v. Chr.). Der Text wurde in historischen Schichten aufgebaut: KÃ¶nig Wen ordnete die 64 Hexagramme und verfasste die Urteile (guÃ cÃ­) wÃ¤hrend seiner Gefangenschaft. Sein Sohn, der Herzog von Zhou, fÃ¼gte die LiniensÃ¤tze (yÃ¡ocÃ­) hinzu. Jahrhunderte spÃ¤ter fÃ¼gten Konfuzius und seine SchÃ¼ler die als Zehn FlÃ¼gel (åç¿¼) bekannten Kommentare hinzu, das tiefste philosophische Stratum des Textes.",
    ichingHexHeading: "Das System der 64 Hexagramme",
    ichingHexBody:
      "Jedes Hexagramm ist eine Figur aus sechs Linien, jede entweder yin (gebrochen) oder yang (ganz). Die 64 mÃ¶glichen Kombinationen beschreiben die grundlegenden Muster des Wandels. Bewegende Linien zeigen Transformation an: das gegenwÃ¤rtige Hexagramm wandelt sich in ein zukÃ¼nftiges, und dieser Ãœbergang ist das HerzstÃ¼ck der Lesung.",
    ichingMethodHeading: "Die Drei-MÃ¼nzen-Methode und Zhu Xis Regeln",
    ichingMethodBody:
      "Die klassische Methode verwendet drei MÃ¼nzen, die sechsmal geworfen werden. Wenn mehrere Linien wechseln, legt die Schule von Zhu Xi (Neokonfuzianismus, 12. Jh. n. Chr.) genaue Regeln fest, um zu bestimmen, welche Linie die Lesung regiert, wodurch interpretative Mehrdeutigkeit beseitigt wird. Diese App implementiert genau diese Regeln ohne Ã„nderung.",
    ichingWilhelmHeading: "Die Ãœbersetzung Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm erstellte 1924 die vollstÃ¤ndigste und angesehenste Ãœbersetzung des I Ching in westlicher Sprache. Cary Baynes Ã¼bersetzte sie 1950 ins Englische (Princeton University Press). Dieses Werk ist der Grundtext dieser App, ohne Modifikationen oder Vereinfachungen.",
    ichingLeggeHeading: "Die Ãœbersetzung von James Legge",
    ichingLeggeBody:
      "James Legge, ein schottischer Missionar und Sinologe, Ã¼bersetzte das I Ging 1882 als Teil seines monumentalen Werkes 'The Sacred Books of the East'. Sein Ansatz war streng philologisch und akademisch und versuchte, die wÃ¶rtliche Bedeutung konfuzianischer und vorkonfuzianischer Texte zu entschlÃ¼sseln. Seine Version bringt eine unschÃ¤tzbare interpretative Strenge mit sich.",
    ichingZhouyiHeading: "Der ursprÃ¼ngliche Zhou-Yi-Text",
    ichingZhouyiBody:
      "Das ursprÃ¼ngliche Zhou Yi (wÃ¶rtlich 'Wandlungen von Zhou') ist der Kern des I Ging, bestehend aus den 64 Hexagrammen, den Urteilen von KÃ¶nig Wen und den Linien des Herzogs von Zhou, ohne die spÃ¤teren konfuzianischen Kommentare (die Zehn FlÃ¼gel). Diese Quelle ermÃ¶glicht eine direkte Verbindung mit der schamanischen und Ã¤ltesten Schicht des Orakels.",
    ichingChainHeading: "Die AuthentizitÃ¤tskette",
    ichingChain:
      "UrsprÃ¼ngliches Zhou Yi (Zhou-Dynastie) â†’ Konfuzius-Kommentare (5. Jh. v. Chr.) â†’ Zhu Xis Regeln (12. Jh. n. Chr.) â†’ Wilhelms deutsche Ãœbersetzung (1924) â†’ Baynes' englische Ãœbersetzung (1950) â†’ Gemeinfrei (2020) â†’ Diese App.",
    bonesHeading: "Orakelknochen (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading:
      "Historischer Ursprung (Shang-Dynastie, ~1600â€“1046 v. Chr.)",
    bonesOriginBody:
      "Die Ã¤lteste dokumentierte Orakelpraktik Chinas. Die kÃ¶niglichen Schamanen wendeten Hitze auf Knochen oder Panzer an, um die resultierenden Risse zu lesen. Diese App respektiert die strukturelle Logik des Shang-Systems: positive Ladung, negative Ladung und Befund nach Muster.",
    bonesRitualHeading: "Der rituelle Prozess",
    bonesRitualBody:
      "Der Prozess war prÃ¤zise und wiederholbar: Eine positive Ladung und ihre Verneinung wurden formuliert. GlÃ¼hende Bronze wurde auf den Knochen aufgetragen, bis Risse entstanden. Die Ausrichtung, LÃ¤nge und das Muster der Risse bestimmten den Befund. Das Ergebnis wurde in den Knochen selbst eingraviert, was Chinas frÃ¼heste Schriftaufzeichnungen bildet.",
    bonesVerdictsHeading: "Die vier BefundzustÃ¤nde:",
    bonesVerdictAuspClear: "å‰. Eindeutig gÃ¼nstig.",
    bonesVerdictAuspMod: "å‰ mÃ¤ÃŸig. GÃ¼nstig mit Nuancen.",
    bonesVerdictInauspMod: "å‡¶ mÃ¤ÃŸig. UngÃ¼nstig mit Vorbehalten.",
    bonesVerdictInauspClear: "å‡¶. Eindeutig ungÃ¼nstig.",
    bonesAuthHeading: "AuthentizitÃ¤t der Methode",
    bonesAuthBody:
      "Mehr als 150.000 Orakelknochenfragmente wurden seit dem 19. Jahrhundert ausgegraben und untersucht. Sie sind international anerkanntes Kulturerbe und werden in Museen in China, Taiwan, Japan und Europa aufbewahrt. Die in dieser App implementierte Methode respektiert die strukturelle Logik des Shang-Systems: positive Ladung, negative Ladung, Befund nach Muster.",
    yarrowHeading: "SchafgarbenstÃ¤be (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "Historische UrsprÃ¼nge (~1000 v. Chr.)",
    yarrowOriginBody:
      "Dies ist das Verfahren, das im GroÃŸen Kommentar (DÃ zhuÃ n) beschrieben wird. Die Methode prÃ¤zisiert : Â«Die Zahl der GroÃŸen Expansion ist 50, von denen 49 verwendet werdenÂ». Die Methode ist mehr als ein Jahrtausend Ã¤lter als die Drei-MÃ¼nzen-Methode. Richard Wilhelm dokumentierte das vollstÃ¤ndige Verfahren in seinem Werk von 1924 und bewahrte damit einen langsameren, taktilen und bewussteren rituellen Rhythmus im Vergleich zu MÃ¼nzen.",
    yarrowProcedureHeading: "Physisches Verfahren",
    yarrowProcedureBody:
      "Die Methode verwendet eine Gruppe physischer StÃ¤be oder Ã¤hnlicher GegenstÃ¤nde. Einer wird beiseitegelegt, die Ã¼brigen werden in einer wiederholten rituellen Abfolge geteilt und gezÃ¤hlt, bis jede der sechs Linien entsteht. FÃ¼r den Nutzer ist das Tempo wichtig: Es erfordert Aufmerksamkeit, BerÃ¼hrung und Geduld und macht die Beratung zeremonieller als die Drei-MÃ¼nzen-Methode.",
    yarrowProbHeading: "Charakter der Methode",
    yarrowProbBody:
      "Die Stabmethode bewahrt einen langsameren rituellen Rhythmus als die Drei-MÃ¼nzen-Methode. Ihr Wert wird in dieser App nicht als technische Tabelle dargestellt, sondern als ein anderer Weg, in dieselbe I Ching-Tradition einzutreten: taktiler, bewusster und nÃ¤her am klassischen Verfahren, das von Wilhelm/Baynes dokumentiert wurde. Die Drei-MÃ¼nzen-Methode bleibt fÃ¼r eine schnellere Beratung ebenso gÃ¼ltig.",
    interpretHeading: "Warum die KI nicht erfindet",
    interpretBody:
      "Die kÃ¼nstliche Intelligenz in dieser App hat eine spezifische und begrenzte Funktion: das Ergebnis des Algorithmus (Hexagramm, bewegende Linien oder Riss-Befund) zu nehmen und es in natÃ¼rlicher Sprache in den Kontext der Frage des Nutzers zu artikulieren. Die KI generiert keine Hexagramme, entscheidet nicht Ã¼ber Befunde und verÃ¤ndert Wilhelms Texte nicht. Der mathematische Algorithmus fÃ¼hrt den technisch-traditionellen Prozess getreu aus, bevor die KI eingreift. Die KI ist der Interpret; das Orakel ist die Methode.",
    sourcesHeading: "Akademische Quellen und Referenzen",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  it: {
    title: "Note e Origine dei Metodi",
    lead: "Questa pagina fornisce un contesto tecnico-culturale. Non Ã¨ una guida all'uso.",
    authNotice:
      "Tutti i metodi utilizzati in questa app provengono da tradizioni millenarie della cultura cinese, storicamente documentate e accademicamente rispettate in tutto il mondo. Questa app non inventa interpretazioni nÃ© genera significati propri; applica metodi autentici assistiti dalla tecnologia dell'intelligenza artificiale per renderli accessibili nella lingua dell'utente. Qualsiasi lettore puÃ² verificare i testi con le fonti originali elencate alla fine di questa pagina.",
    ichingHeading: "I Ching (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "Origine storica (~1000 a.C.)",
    ichingOriginBody:
      "Lo Zhouyi, Â«I Mutamenti di ZhouÂ», Ã¨ uno dei testi piÃ¹ antichi dell'umanitÃ . Le sue radici risalgono alla dinastia Zhou (1046â€“256 a.C.). Il testo Ã¨ stato costruito in strati storici : il Re Wen ha organizzato i 64 esagrammi e ha scritto i Giudizi (guÃ cÃ­) mentre era prigioniero. Suo figlio, il Duca di Zhou, ha aggiunto le sentenze per le sei linee (yÃ¡ocÃ­). Secoli dopo, Confucio e i suoi discepoli hanno aggiunto i Commentari noti come le Dieci Ali (åç¿¼), lo strato filosofico piÃ¹ profondo del testo.",
    ichingHexHeading: "Il sistema dei 64 esagrammi",
    ichingHexBody:
      "Ogni esagramma Ã¨ una figura composta da sei linee, ciascuna yin (spezzata) o yang (intera). Le 64 combinazioni possibili descrivono i modelli fondamentali del cambiamento. Le linee in movimento indicano una trasformazione : l'esagramma presente muta in uno futuro, e quella transizione Ã¨ il cuore della lettura.",
    ichingMethodHeading: "Il metodo delle tre monete e le regole di Zhu Xi",
    ichingMethodBody:
      "Il metodo classico usa tre monete lanciate sei volte. Quando piÃ¹ linee cambiano, la scuola di Zhu Xi (neo-confucianesimo, XII secolo d.C.) stabilisce regole precise per determinare quale linea governa la lettura, eliminando l'ambiguitÃ  interpretativa. Questa app implementa esattamente quelle regole senza modifiche.",
    ichingWilhelmHeading: "La traduzione Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm ha prodotto nel 1924 la traduzione piÃ¹ completa e rispettata dello I Ching in lingua occidentale. Cary Baynes l'ha tradotta in inglese nel 1950 (Princeton University Press). Quest'opera costituisce il testo base di questa app, senza modifiche nÃ© semplificazioni.",
    ichingLeggeHeading: "La traduzione di James Legge",
    ichingLeggeBody:
      "James Legge, missionario e sinologo scozzese, tradusse l'I Ching nel 1882 come parte della sua opera monumentale 'The Sacred Books of the East'. Il suo approccio fu strettamente filologico e accademico, cercando di decifrare il significato letterale dei testi confuciani e pre-confuciani. La sua versione porta un rigore interpretativo inestimabile.",
    ichingZhouyiHeading: "Il testo originale Zhou Yi",
    ichingZhouyiBody:
      "Lo Zhou Yi originale (letteralmente 'Mutamenti di Zhou') Ã¨ il nucleo dell'I Ching, composto dai 64 esagrammi, i giudizi del Re Wen e le linee del Duca di Zhou, senza i successivi commenti confuciani (le Dieci Ali). Questa fonte consente una connessione diretta con lo strato sciamanico e piÃ¹ antico dell'oracolo.",
    ichingChainHeading: "La catena di autenticitÃ ",
    ichingChain:
      "Zhou Yi original (dinastia Zhou) â†’ Commentari di Confucio (V sec. a.C.) â†’ Regole di Zhu Xi (XII sec. d.C.) â†’ Traduzione Wilhelm tedesco (1924) â†’ Traduzione Baynes inglese (1950) â†’ Dominio pubblico (2020) â†’ Questa app.",
    bonesHeading: "Ossa Oracolari (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading: "Origine storica (Dinastia Shang, ~1600â€“1046 a.C.)",
    bonesOriginBody:
      "La pratica oracolare documentata piÃ¹ antica della Cina. Gli sciamani reali applicavano calore a ossa o gusci per leggere le crepe risultanti. Questa app rispetta la logica strutturale del sistema Shang : carica positiva, carica negativa e verdetto per motivo.",
    bonesRitualHeading: "Il processo rituale",
    bonesRitualBody:
      "Il processo era preciso e ripetibile : si formulava una carica positiva e la sua negazione. Si applicava bronzo incandescente all'osso finchÃ© non si formavano crepe. L'orientamento, la lunghezza e il motivo delle crepe determinavano il verdetto. Il risultato veniva inciso nell'osso stesso, costituendo i primi documenti scritti della Cina.",
    bonesVerdictsHeading: "I quattro stati del verdetto :",
    bonesVerdictAuspClear: "å‰. Chiaramente favorevole.",
    bonesVerdictAuspMod: "å‰ moderato. Favorevole con sfumature.",
    bonesVerdictInauspMod: "å‡¶ moderato. Sfavorevole con riserve.",
    bonesVerdictInauspClear: "å‡¶. Chiaramente sfavorevole.",
    bonesAuthHeading: "AutenticitÃ  del metodo",
    bonesAuthBody:
      "PiÃ¹ di 150.000 frammenti di ossa oracolari sono stati scavati e studiati dal XIX secolo. Sono patrimonio riconosciuto internazionalmente e conservati in musei in Cina, Taiwan, Giappone ed Europa. Il metodo implementato in questa app rispetta la logica strutturale del sistema Shang : carica positiva, carica negativa, verdetto per motivo.",
    yarrowHeading: "Steli di Achillea (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "Origine storica (~1000 a.C.)",
    yarrowOriginBody:
      "Questo Ã¨ il procedimento descritto nel Grande Commento (DÃ zhuÃ n). Il metodo precisa : Â«Il numero della Grande Espansione Ã¨ 50, di cui 49 vengono usatiÂ». Questo metodo Ã¨ anteriore a quello delle tre monete di oltre un millennio. Richard Wilhelm ha documentado il procedimento completo nella sua opera del 1924, preservando un ritmo rituale piÃ¹ lento, tattile e deliberato rispetto a quello delle monete.",
    yarrowProcedureHeading: "Procedura fisica",
    yarrowProcedureBody:
      "Il metodo usa un insieme di steli fisici o oggetti simili. Uno viene messo da parte e gli altri vengono divisi e contati attraverso una sequenza rituale ripetuta fino a formare ciascuna delle sei linee. Per l'utente il punto centrale Ã¨ il ritmo : richiede attenzione, tatto e pazienza, rendendo la consultazione piÃ¹ cerimoniale rispetto alle tre monete.",
    yarrowProbHeading: "Carattere del metodo",
    yarrowProbBody:
      "La procedura degli steli conserva un ritmo rituale piÃ¹ lento rispetto a quello delle monete. In questa app il suo valore non viene presentato come una tabella tecnica, ma come un modo diverso di entrare nella stessa tradizione dell'I Ching: piÃ¹ tattile, piÃ¹ deliberato e piÃ¹ vicino al procedimento classico documentato da Wilhelm/Baynes. Il metodo delle tre monete rimane altrettanto valido per una consultazione piÃ¹ rapida.",
    interpretHeading: "PerchÃ© l'IA non inventa",
    interpretBody:
      "L'intelligenza artificiale in questa app ha una funzione specifica e delimitata: prendere il risultato dell'algoritmo (esagrammi, linee in movimento o verdetto di crepe) e articolarlo in linguaggio naturale con il contesto della domanda dell'utente. L'IA non genera esagrammi, non decide verdetti e non modifica i testi di Wilhelm. L'algoritmo matematico esegue fedelmente il processo tecnico-tradizionale prima che l'IA intervenga. L'IA Ã¨ l'interprete ; l'oracolo Ã¨ il metodo.",
    sourcesHeading: "Fonti e Riferimenti Accademici",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  ja: {
    title: "æ‰‹æ³•ã®æ³¨è¨˜ã¨èµ·æº",
    lead: "ã“ã®ãƒšãƒ¼ã‚¸ã¯æŠ€è¡“çš„ãƒ»æ–‡åŒ–çš„ãªèƒŒæ™¯æƒ…å ±ã§ã™ã€‚ä½¿ç”¨ã‚¬ã‚¤ãƒ‰ã§ã¯ã‚ã‚Šã¾ã›ã‚“ã€‚",
    authNotice:
      "ã“ã®ã‚¢ãƒ—ãƒªã§ä½¿ç”¨ã•ã‚Œã‚‹ã™ã¹ã¦ã®æ‰‹æ³•ã¯ã€æ­´å²çš„ã«æ–‡æ›¸åŒ–ã•ã‚Œã€ä¸–ç•Œä¸­ã§å­¦è¡“çš„ã«å°Šé‡ã•ã‚Œã¦ã„ã‚‹ä¸­å›½æ–‡åŒ–ã®æ•°åƒå¹´ã«ã‚ãŸã‚‹ä¼çµ±ã«ç”±æ¥ã—ã¦ã„ã¾ã™ã€‚ã“ã®ã‚¢ãƒ—ãƒªã¯ç‹¬è‡ªã®è§£é‡ˆã‚’ä½œã‚Šå‡ºã—ãŸã‚Šã€ç‹¬è‡ªã®æ„å‘³ã‚’ç”Ÿæˆã—ãŸã‚Šã™ã‚‹ã‚‚ã®ã§ã¯ã‚ã‚Šã¾ã›ã‚“, äººå·¥çŸ¥èƒ½ã®æ”¯æ´ã‚’å—ã‘ãŸæœ¬ç‰©ã®æ‰‹æ³•ã‚’ã€ãƒ¦ãƒ¼ã‚¶ãƒ¼ã®è¨€èªžã§ã‚¢ã‚¯ã‚»ã‚¹å¯èƒ½ã«ã™ã‚‹ãŸã‚ã«é©ç”¨ã—ã¦ã„ã¾ã™ã€‚èª­è€…ã¯ã“ã®ãƒšãƒ¼ã‚¸ã®æœ«å°¾ã«æŽ²è¼‰ã•ã‚Œã¦ã„ã‚‹åŽŸå…¸ã¨ç…§åˆã™ã‚‹ã“ã¨ãŒã§ãã¾ã™ã€‚",
    ichingHeading: "æ˜“çµŒï¼ˆå‘¨æ˜“ Â· Zhouyiï¼‰",
    ichingOriginHeading: "æ­´å²çš„èµ·æºï¼ˆç´€å…ƒå‰1000å¹´é ƒï¼‰",
    ichingOriginBody:
      "å‘¨æ˜“ï¼ˆã€Œå‘¨ã®å¤‰åŒ–ã€ï¼‰ã¯äººé¡žæœ€å¤ã®æ–‡çŒ®ã®ä¸€ã¤ã§ã™ã€‚ãã®èµ·æºã¯å‘¨çŽ‹æœï¼ˆç´€å…ƒå‰1046ã€œ256å¹´ï¼‰ã«é¡ã‚Šã¾ã™ãŒã€ãã®åœç­®ã®æ ¸å¿ƒã¯ãã‚Œä»¥å‰ã®ã‚‚ã®ã§ã™ã€‚ã“ã®ãƒ†ã‚­ã‚¹ãƒˆã¯ç•°ãªã‚‹æ­´å²çš„å±¤ã‹ã‚‰æ§‹æˆã•ã‚Œã¦ã„ã¾ã™ï¼šæ–‡çŽ‹ã¯å¹½é–‰ä¸­ã«64å¦ã‚’æ•´ç†ã—ã€å¦è¾žï¼ˆguÃ cÃ­ï¼‰ã‚’æ›¸ãè¨˜ã—ã¾ã—ãŸã€‚ãã®æ¯å­ã®å‘¨å…¬ã¯å…­çˆ»è¾žï¼ˆçˆ»è¾žã€yÃ¡ocÃ­ï¼‰ã‚’åŠ ãˆã¾ã—ãŸã€‚æ•°ä¸–ç´€å¾Œã€å­”å­ã¨ãã®å¼Ÿå­ãŸã¡ã¯åç¿¼ã¨ã—ã¦çŸ¥ã‚‰ã‚Œã‚‹å½–ä¼ã‚’åŠ ãˆã€ãƒ†ã‚­ã‚¹ãƒˆã®æœ€ã‚‚æ·±ã„å“²å­¦çš„å±¤ã‚’å½¢æˆã—ã¾ã—ãŸã€‚",
    ichingHexHeading: "64å¦ã®ã‚·ã‚¹ãƒ†ãƒ ",
    ichingHexBody:
      "å„å¦ã¯6æœ¬ã®çˆ»ã‹ã‚‰æˆã‚‹å›³å½¢ã§ã€ãã‚Œãžã‚ŒãŒé™°ï¼ˆåˆ‡ã‚ŒãŸã€å—å®¹çš„ï¼‰ã¾ãŸã¯é™½ï¼ˆé€£ç¶šã—ãŸã€èƒ½å‹•çš„ï¼‰ã§ã™ã€‚64ã®å¯èƒ½ãªçµ„ã¿åˆã‚ã›ã¯ã€è‡ªç„¶ã¨äººé–“ã®ç”Ÿæ´»ã«ãŠã‘ã‚‹å¤‰åŒ–ã®æ ¹æœ¬çš„ãªãƒ‘ã‚¿ãƒ¼ãƒ³ã‚’æå†™ã—ã¦ã„ã¾ã™ã€‚å‹•çˆ»ã¯å¤‰å®¹ã‚’ç¤ºã—ã¾ã™ï¼šç¾åœ¨ã®å¦ã¯æœªæ¥ã®å¦ã¸ã¨å¤‰åŒ–ã—ã€ãã®ç§»è¡ŒãŒå ã„ã®æ ¸å¿ƒã§ã™ã€‚",
    ichingMethodHeading: "ä¸‰æžšéŠ­æ³•ã¨æœ±ç†¹ã®è¦å‰‡",
    ichingMethodBody:
      "å¤å…¸çš„ãªæ–¹æ³•ã¯ã€ä¸‰æžšã®éŠ­ã‚’å…­å›žæŠ•ã˜ã¦å¦ã‚’ä¸€çˆ»ãšã¤æ§‹ç¯‰ã—ã¾ã™ã€‚è¤‡æ•°ã®çˆ»ãŒå¤‰åŒ–ã™ã‚‹å ´åˆã€æœ±ç†¹ã®å­¦æ´¾ï¼ˆæ–°å„’å­¦ã€12ä¸–ç´€ï¼‰ã¯ã€ã©ã®çˆ»ãŒå ã„ã‚’æ”¯é…ã™ã‚‹ã‹ã‚’æ±ºå®šã™ã‚‹ç²¾ç¢ºãªè¦å‰‡ã‚’è¨­ã‘ã¦ãŠã‚Šã€è§£é‡ˆä¸Šã®æ›–æ˜§ã•ã‚’æŽ’é™¤ã—ã¦ã„ã¾ã™ã€‚ã“ã®ã‚¢ãƒ—ãƒªã¯ãã®è¦å‰‡ã‚’æ”¹å¤‰ãªãæ­£ç¢ºã«å®Ÿè£…ã—ã¦ã„ã¾ã™ã€‚",
    ichingWilhelmHeading: "ãƒ´ã‚£ãƒ«ãƒ˜ãƒ«ãƒ /ãƒã‚¤ãƒ³ã‚ºè¨³",
    ichingWilhelmBody:
      "ãƒ‰ã‚¤ãƒ„äººä¸­å›½å­¦è€…ãƒªãƒ’ãƒ£ãƒ«ãƒˆãƒ»ãƒ´ã‚£ãƒ«ãƒ˜ãƒ«ãƒ ã¯æ•°åå¹´é–“ä¸­å›½ã«ä½ã¿ã€1924å¹´ã«è¥¿æ´‹èªžã¨ã—ã¦æœ€ã‚‚å®Œå…¨ã§å°Šé‡ã•ã‚Œã‚‹æ˜“çµŒã®ç¿»è¨³ã‚’å‡ºç‰ˆã—ã¾ã—ãŸã€‚å¦è¾žã€çˆ»è¾žã€åç¿¼ã®å½–ä¼ã‚’å«ã‚“ã§ã„ã¾ã™ã€‚ã‚­ãƒ£ãƒªãƒ¼ãƒ»ãƒã‚¤ãƒ³ã‚ºãŒ1950å¹´ã«è‹±èªžã«ç¿»è¨³ã—ã¾ã—ãŸã€‚ã“ã®è‘—ä½œã¯2020å¹´ã«ãƒ‘ãƒ–ãƒªãƒƒã‚¯ãƒ‰ãƒ¡ã‚¤ãƒ³ã«å…¥ã‚Šã€ã“ã®ã‚¢ãƒ—ãƒªã®ãƒ™ãƒ¼ã‚¹ãƒ†ã‚­ã‚¹ãƒˆã§ã™, æ”¹å¤‰ã‚‚ç°¡ç•¥åŒ–ã‚‚ãªãã€‚",
    ichingLeggeHeading: "ã‚¸ã‚§ãƒ¼ãƒ ã‚ºãƒ»ãƒ¬ãƒƒã‚°è¨³",
    ichingLeggeBody:
      "ã‚¹ã‚³ãƒƒãƒˆãƒ©ãƒ³ãƒ‰ã®å®£æ•™å¸«ã§ã‚ã‚Šä¸­å›½å­¦è€…ã§ã‚ã‚‹ã‚¸ã‚§ãƒ¼ãƒ ã‚ºãƒ»ãƒ¬ãƒƒã‚°ã¯ã€ãã®è¨˜å¿µç¢‘çš„è‘—ä½œã€Œæ±æ–¹è–æ›¸ã€ã®ä¸€éƒ¨ã¨ã—ã¦1882å¹´ã«æ˜“çµŒã‚’ç¿»è¨³ã—ã¾ã—ãŸã€‚å½¼ã®ã‚¢ãƒ—ãƒ­ãƒ¼ãƒã¯åŽ³å¯†ã«æ–‡çŒ®å­¦çš„ã‹ã¤å­¦è¡“çš„ã§ã‚ã‚Šã€å„’æ•™ãŠã‚ˆã³å„’æ•™ä»¥å‰ã®ãƒ†ã‚­ã‚¹ãƒˆã®æ–‡å­—é€šã‚Šã®æ„å‘³ã‚’è§£èª­ã—ã‚ˆã†ã¨ã—ã¾ã—ãŸã€‚å½¼ã®ãƒãƒ¼ã‚¸ãƒ§ãƒ³ã¯éžå¸¸ã«è²´é‡ãªè§£é‡ˆã®åŽ³å¯†ã•ã‚’ã‚‚ãŸã‚‰ã—ã¾ã™ã€‚",
    ichingZhouyiHeading: "åŽŸå…¸ å‘¨æ˜“",
    ichingZhouyiBody:
      "åŽŸå…¸ã§ã‚ã‚‹å‘¨æ˜“ï¼ˆæ–‡å­—é€šã‚Šã€Œå‘¨ã®å¤‰åŒ–ã€ï¼‰ã¯æ˜“çµŒã®ä¸­æ ¸ã§ã‚ã‚Šã€64å¦ã€æ–‡çŽ‹ã®å¦è¾žã€å‘¨å…¬ã®çˆ»è¾žã§æ§‹æˆã•ã‚Œã€å¾Œä»£ã®å„’æ•™ã®æ³¨é‡ˆï¼ˆåç¿¼ï¼‰ã‚’å«ã¿ã¾ã›ã‚“ã€‚ã“ã®æºæ³‰ã¯ã€ç¥žè¨—ã®ã‚·ãƒ£ãƒ¼ãƒžãƒ‹ã‚ºãƒ çš„ã§æœ€ã‚‚å¤ã„å±¤ã¨ã®ç›´æŽ¥çš„ãªã¤ãªãŒã‚Šã‚’å¯èƒ½ã«ã—ã¾ã™ã€‚",
    ichingChainHeading: "æ­£çµ±æ€§ã®é€£éŽ–",
    ichingChain:
      "åŽŸå…¸å‘¨æ˜“ï¼ˆå‘¨çŽ‹æœï¼‰â†’ å­”å­ã®å½–ä¼ï¼ˆç´€å…ƒå‰5ä¸–ç´€ï¼‰â†’ æœ±ç†¹ã®è¦å‰‡ï¼ˆ12ä¸–ç´€ï¼‰â†’ ãƒ´ã‚£ãƒ«ãƒ˜ãƒ«ãƒ ã®ãƒ‰ã‚¤ãƒ„èªžè¨³ï¼ˆ1924å¹´ï¼‰â†’ ãƒã‚¤ãƒ³ã‚ºã®è‹±èªžè¨³ï¼ˆ1950å¹´ï¼‰â†’ ãƒ‘ãƒ–ãƒªãƒƒã‚¯ãƒ‰ãƒ¡ã‚¤ãƒ³ï¼ˆ2020å¹´ï¼‰â†’ æœ¬ã‚¢ãƒ—ãƒªã€‚",
    bonesHeading: "ç”²éª¨å ã„ï¼ˆç”²éª¨ Â· JiÇŽgÇ”ï¼‰",
    bonesOriginHeading: "æ­´å²çš„èµ·æºï¼ˆå•†çŽ‹æœã€ç´€å…ƒå‰1600ã€œ1046å¹´é ƒï¼‰",
    bonesOriginBody:
      "ç”²éª¨å ã„ã¯ä¸­å›½ã§æ–‡æ›¸åŒ–ã•ã‚ŒãŸæœ€å¤ã®åœç­®æ³•ã§ã‚ã‚Šã€æˆæ–‡åŒ–ã•ã‚ŒãŸæ˜“çµŒã‚ˆã‚Šå¤ã„ä¼çµ±ã§ã™ã€‚å•†çŽ‹æœã®çŽ‹å®¤ã®å·«ç¥ã¯äº€ã®ç”²ç¾…ã‚„ç‰›ã®è‚©ç”²éª¨ã‚’ç„¼ãã€ç”Ÿã˜ãŸäº€è£‚ã‚’èª­ã¿å–ã‚‹ã“ã¨ã§ã€è»äº‹ãƒ»è¾²æ¥­ãƒ»æ°—å€™ãƒ»çŽ‹å€‹äººã®æ±ºå®šã«ã¤ã„ã¦ç¥–å…ˆã«ä¼ºã„ã‚’ç«‹ã¦ã¾ã—ãŸã€‚",
    bonesRitualHeading: "å„€å¼ã®ãƒ—ãƒ­ã‚»ã‚¹",
    bonesRitualBody:
      "ã“ã®ãƒ—ãƒ­ã‚»ã‚¹ã¯ç²¾ç¢ºã§åå¾©å¯èƒ½ã§ã—ãŸï¼šè‚¯å®šçš„ãªå‘½é¡Œã¨ãã®å¦å®šã‚’å®šå¼åŒ–ã—ã¾ã™ã€‚éª¨ã«ç™½ç†±ã—ãŸé’éŠ…ã‚’å½“ã¦ã€äº€è£‚ã‚’ç”Ÿã˜ã•ã›ã¾ã™ã€‚äº€è£‚ã®æ–¹å‘ã€é•·ã•ã€ãƒ‘ã‚¿ãƒ¼ãƒ³ãŒç¥žè¨—ã‚’æ±ºå®šã—ã¾ã—ãŸã€‚çµæžœã¯éª¨ãã®ã‚‚ã®ã«åˆ»ã¾ã‚Œã€ä¸­å›½æœ€å¤ã®æ–‡å­—è¨˜éŒ²ã‚’æ§‹æˆã—ã¦ã„ã¾ã™ã€‚",
    bonesVerdictsHeading: "ç¥žè¨—ã®å››ã¤ã®çŠ¶æ…‹",
    bonesVerdictAuspClear:
      "å‰, æ˜Žç¢ºã«å‰ï¼šãƒ‘ã‚¿ãƒ¼ãƒ³ã¯æ›–æ˜§ã•ãªãè‚¯å®šå‘½é¡Œã‚’ç¢ºèªã—ã¾ã™ã€‚",
    bonesVerdictAuspMod:
      "å‰ ä¸­ç¨‹åº¦, ã‚„ã‚„å‰ï¼šç¢ºèªã¯ã‚ã‚Šã¾ã™ãŒã€ãƒ‹ãƒ¥ã‚¢ãƒ³ã‚¹ã‚„æ¡ä»¶ãŒä¼´ã„ã¾ã™ã€‚",
    bonesVerdictInauspMod:
      "å‡¶ ä¸­ç¨‹åº¦, ã‚„ã‚„å‡¶ï¼šãƒ‘ã‚¿ãƒ¼ãƒ³ã¯ç•™ä¿ä»˜ãã§å¦å®šã«å‚¾ãã¾ã™ã€‚",
    bonesVerdictInauspClear:
      "å‡¶, æ˜Žç¢ºã«å‡¶ï¼šãƒ‘ã‚¿ãƒ¼ãƒ³ã¯æ›–æ˜§ã•ãªãè‚¯å®šå‘½é¡Œã‚’å¦å®šã—ã¾ã™ã€‚",
    bonesAuthHeading: "æ‰‹æ³•ã®æ­£çµ±æ€§",
    bonesAuthBody:
      "19ä¸–ç´€ä»¥é™ã€15ä¸‡ç‚¹ã‚’è¶…ãˆã‚‹ç”²éª¨ã®æ–­ç‰‡ãŒç™ºæŽ˜ãƒ»ç ”ç©¶ã•ã‚Œã¦ãã¾ã—ãŸã€‚ãã‚Œã‚‰ã¯å›½éš›çš„ã«èªã‚ã‚‰ã‚ŒãŸæ–‡åŒ–éºç”£ã§ã‚ã‚Šã€ä¸­å›½ãƒ»å°æ¹¾ãƒ»æ—¥æœ¬ãƒ»ãƒ¨ãƒ¼ãƒ­ãƒƒãƒ‘ã®åšç‰©é¤¨ã«ä¿å­˜ã•ã‚Œã¦ã„ã¾ã™ã€‚ã“ã®ã‚¢ãƒ—ãƒªã§å®Ÿè£…ã•ã‚ŒãŸæ‰‹æ³•ã¯ã€å•†ã‚·ã‚¹ãƒ†ãƒ ã®æ§‹é€ çš„è«–ç†ã‚’å°Šé‡ã—ã¦ã„ã¾ã™ï¼šè‚¯å®šå‘½é¡Œã€å¦å®šå‘½é¡Œã€ãƒ‘ã‚¿ãƒ¼ãƒ³ã«ã‚ˆã‚‹ç¥žè¨—ã€‚",
    yarrowHeading: "è“è‰ã«ã‚ˆã‚‹å ã„ (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "æ­´å²çš„èµ·æºï¼ˆç´€å…ƒå‰ç´„1000å¹´ï¼‰",
    yarrowOriginBody:
      "è“è‰ã«ã‚ˆã‚‹å ã„ã®æ–¹æ³•ã¯ã€æ˜“çµŒãã®ã‚‚ã®ã«è¨˜éŒ²ã•ã‚Œã¦ã„ã‚‹åœå æ‰‹é †ã§ã™ã€‚åç¿¼ã®ã²ã¨ã¤ã§ã‚ã‚‹å¤§ä¼ï¼ˆå¤§ä¼ , DÃ zhuÃ nï¼‰ã«ã¯ã€Œå¤§è¡ä¹‹æ•°äº”åã€å…¶ç”¨å››åæœ‰ä¹ï¼ˆå¤§ã„ãªã‚‹å±•é–‹ã®æ•°ã¯50ã€ãã®ã†ã¡49ã‚’ä½¿ã†ï¼‰ã€ã¨æ˜Žè¨˜ã•ã‚Œã¦ã„ã¾ã™ã€‚è«–èªžã§ã¯å­”å­ãŒæ˜“ã‚’å­¦ã¶ãŸã‚ã«äº”åå¹´æ¬²ã—ã„ã¨è¿°ã¹ã¦ãŠã‚Šã€å¤å…¸å­¦è€…ãŸã¡ã¯ãã®ã€Œ50ã€ã¨ã„ã†æ•°ã¸ã®è¨€åŠã‚’è“è‰ã®æ‰‹é †ã¸ã®ç›´æŽ¥çš„ãªç¤ºå”†ã¨ç†è§£ã—ã¦ã„ã¾ã™ã€‚ã“ã®æ–¹æ³•ã¯ä¸‰æžšç¡¬è²¨æ³•ã‚ˆã‚Šã‚‚åƒå¹´ä»¥ä¸Šå¤ã„ã‚‚ã®ã§ã™ã€‚ãƒªãƒ’ãƒ£ãƒ«ãƒˆãƒ»ãƒ´ã‚£ãƒ«ãƒ˜ãƒ«ãƒ ã¨ã‚±ãƒ¼ãƒªãƒ¼ãƒ»ãƒ™ã‚¤ãƒ³ã‚ºã¯1950å¹´ã®ç¿»è¨³ã®ä»˜éŒ²ï¼ˆãƒ—ãƒªãƒ³ã‚¹ãƒˆãƒ³å¤§å­¦å‡ºç‰ˆï¼‰ã«å®Œå…¨ãªæ‰‹é †ã‚’è¨˜éŒ²ã—ã¦ã„ã¾ã™ã€‚",
    yarrowProcedureHeading: "ç‰©ç†çš„ãªæ‰‹é †",
    yarrowProcedureBody:
      "ã“ã®æ–¹æ³•ã§ã¯ã€ç‰©ç†çš„ãªç­®ç«¹ã¾ãŸã¯åŒæ§˜ã®ç‰©ã‚’ç”¨ã„ã¾ã™ã€‚ä¸€ã¤ã‚’å–ã‚Šåˆ†ã‘ã€æ®‹ã‚Šã‚’å„€ç¤¼çš„ãªé †åºã§åˆ†ã‘ã¦æ•°ãˆã€å…­ã¤ã®çˆ»ã‚’å½¢æˆã—ã¦ã„ãã¾ã™ã€‚åˆ©ç”¨è€…ã«ã¨ã£ã¦å¤§åˆ‡ãªã®ã¯ãã®ãƒªã‚ºãƒ ã§ã™ã€‚æ³¨æ„ã€è§¦è¦šã€å¿è€ã‚’æ±‚ã‚ã‚‹ãŸã‚ã€ä¸‰æžšç¡¬è²¨ã‚ˆã‚Šã‚‚å„€ç¤¼çš„ãªç›¸è«‡ã¨ã—ã¦æ„Ÿã˜ã‚‰ã‚Œã¾ã™ã€‚",
    yarrowProbHeading: "æ–¹æ³•ã®æ€§æ ¼",
    yarrowProbBody:
      "ç­®ç«¹ã®æ–¹æ³•ã¯ã€ä¸‰æžšç¡¬è²¨ã‚ˆã‚Šã‚‚ã‚†ã£ãã‚Šã—ãŸå„€ç¤¼çš„ãªãƒªã‚ºãƒ ã‚’ä¿ã¡ã¾ã™ã€‚ã“ã®ã‚¢ãƒ—ãƒªã§ã¯ã€ãã®ä¾¡å€¤ã‚’æŠ€è¡“çš„ãªè¡¨ã¨ã—ã¦ã§ã¯ãªãã€åŒã˜æ˜“çµŒä¼çµ±ã«å…¥ã‚‹åˆ¥ã®æ–¹æ³•ã¨ã—ã¦ç¤ºã—ã¦ã„ã¾ã™ã€‚ã‚ˆã‚Šè§¦è¦šçš„ã§ã€ã‚ˆã‚Šæ„è­˜çš„ã§ã€Wilhelm/Baynes ãŒè¨˜éŒ²ã—ãŸå¤å…¸çš„æ‰‹é †ã«è¿‘ã„ã‚‚ã®ã§ã™ã€‚ã‚ˆã‚Šé€Ÿã„å ã„ã«ã¯ä¸‰æžšç¡¬è²¨ã®æ–¹æ³•ã‚‚åŒã˜ãæœ‰åŠ¹ã§ã™ã€‚",
    interpretHeading: "AIãŒç™ºæ˜Žã—ãªã„ç†ç”±",
    interpretBody:
      "ã“ã®ã‚¢ãƒ—ãƒªã®äººå·¥çŸ¥èƒ½ã«ã¯ç‰¹å®šã‹ã¤é™å®šçš„ãªæ©Ÿèƒ½ãŒã‚ã‚Šã¾ã™ï¼šã‚¢ãƒ«ã‚´ãƒªã‚ºãƒ ã®çµæžœï¼ˆå¦ã€å‹•çˆ»ã€äº€è£‚ã®ç¥žè¨—ï¼‰ã‚’å—ã‘å–ã‚Šã€ãƒ¦ãƒ¼ã‚¶ãƒ¼ã®è³ªå•ã®ã‚³ãƒ³ãƒ†ã‚­ã‚¹ãƒˆã¨å…±ã«ã€ãƒ¦ãƒ¼ã‚¶ãƒ¼ã®è¨€èªžã§è‡ªç„¶è¨€èªžã¨ã—ã¦è¡¨ç¾ã™ã‚‹ã“ã¨ã§ã™ã€‚AIã¯å¦ã‚’ç”Ÿæˆã›ãšã€ç¥žè¨—ã‚’æ±ºå®šã›ãšã€ãƒ´ã‚£ãƒ«ãƒ˜ãƒ«ãƒ ã®ãƒ†ã‚­ã‚¹ãƒˆã‚‚å•†ã®æ‰‹æ³•ã®ãƒ‘ã‚¿ãƒ¼ãƒ³ã‚‚æ”¹å¤‰ã—ã¾ã›ã‚“ã€‚æ•°å­¦çš„ã‚¢ãƒ«ã‚´ãƒªã‚ºãƒ ãŒãã‚Œã‚’å¿ å®Ÿã«è¡Œã„ã€ãã®å¾ŒAIãŒä»‹å…¥ã—ã¾ã™ã€‚AIã¯è§£é‡ˆè€…ã§ã™ã€‚ç¥žè¨—ã¯æ‰‹æ³•ã§ã™ã€‚",
    sourcesHeading: "å‡ºå…¸ã¨å‚è€ƒæ–‡çŒ®",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  zh: {
    title: "æ–¹æ³•æ³¨è®°ä¸Žèµ·æº",
    lead: "æœ¬é¡µä¸ºæŠ€æœ¯æ–‡åŒ–èƒŒæ™¯è¯´æ˜Žï¼Œéžä½¿ç”¨æŒ‡å—ã€‚",
    authNotice:
      "æœ¬åº”ç”¨æ‰€ä½¿ç”¨çš„æ‰€æœ‰æ–¹æ³•å‡æºè‡ªä¸­å›½æ–‡åŒ–æ•°åƒå¹´çš„ä¼ ç»Ÿï¼Œæœ‰åŽ†å²æ–‡çŒ®è®°è½½ï¼Œåœ¨å…¨çƒå­¦æœ¯ç•Œå—åˆ°å¹¿æ³›å°Šé‡ã€‚æœ¬åº”ç”¨ä¸è‡ªåˆ›è§£è¯»ï¼Œä¸ç”Ÿæˆç‹¬æœ‰å«ä¹‰ï¼Œè€Œæ˜¯å€ŸåŠ©äººå·¥æ™ºèƒ½è¾…åŠ©ï¼Œå°†çœŸå®žå¯ä¿¡çš„ä¼ ç»Ÿæ–¹æ³•ä»¥ç”¨æˆ·è¯­è¨€å‘ˆçŽ°ã€‚ä»»ä½•è¯»è€…å‡å¯ä¸Žæœ¬é¡µæœ«å°¾æ‰€åˆ—åŽŸå§‹æ–‡çŒ®ç›¸äº’å°è¯ã€‚",
    ichingHeading: "æ˜“ç»ï¼ˆå‘¨æ˜“ Â· Zhouyiï¼‰",
    ichingOriginHeading: "åŽ†å²æ¸Šæºï¼ˆçº¦å…¬å…ƒå‰1000å¹´ï¼‰",
    ichingOriginBody:
      'å‘¨æ˜“ï¼ˆ"å‘¨ä¹‹å˜åŒ–"ï¼‰æ˜¯äººç±»æœ€å¤è€çš„æ–‡çŒ®ä¹‹ä¸€ã€‚å…¶æ ¹æºå¯è¿½æº¯è‡³å‘¨æœï¼ˆå…¬å…ƒå‰1046è‡³256å¹´ï¼‰ï¼Œä½†å…¶åœç­®æ ¸å¿ƒæ›´ä¸ºä¹…è¿œã€‚è¯¥æ–‡æœ¬ç”±ä¸åŒåŽ†å²å±‚æ¬¡ç´¯ç§¯è€Œæˆï¼šæ–‡çŽ‹åœ¨å›šç¦ä¸­æ•´ç†äº†64å¦ï¼Œå¹¶å†™ä¸‹äº†å¦è¾žï¼ˆguÃ cÃ­ï¼‰ï¼›å…¶å­å‘¨å…¬è¡¥å……äº†å…­çˆ»è¾žï¼ˆçˆ»è¾žï¼ŒyÃ¡ocÃ­ï¼‰ï¼›æ•°ç™¾å¹´åŽï¼Œå­”å­åŠå…¶å¼Ÿå­å¢žæ·»äº†è¢«ç§°ä¸ºåç¿¼çš„ä¼ æ³¨ï¼Œæž„æˆæ–‡æœ¬æœ€æ·±åˆ»çš„å“²å­¦å±‚æ¬¡ã€‚',
    ichingHexHeading: "å…­åå››å¦ç³»ç»Ÿ",
    ichingHexBody:
      "æ¯ä¸€å¦ç”±å…­çˆ»ç»„æˆï¼Œæ¯çˆ»ä¸ºé˜´ï¼ˆæ–­è£‚ï¼ŒæŸ”é¡ºï¼‰æˆ–é˜³ï¼ˆè¿žç»­ï¼Œåˆšå¥ï¼‰ã€‚å…­åå››ç§å¯èƒ½çš„ç»„åˆæè¿°äº†è‡ªç„¶ä¸Žäººç±»ç”Ÿæ´»ä¸­å˜åŒ–çš„æ ¹æœ¬è§„å¾‹ã€‚åŠ¨çˆ»æŒ‡ç¤ºè½¬å˜ï¼šå½“ä¸‹ä¹‹å¦å˜åŒ–ä¸ºæœªæ¥ä¹‹å¦ï¼Œè¿™ä¸€è½¬å˜æ­£æ˜¯å åœçš„æ ¸å¿ƒæ‰€åœ¨ã€‚",
    ichingMethodHeading: "ä¸‰æžšé“œé’±æ³•ä¸Žæœ±ç†¹è§„åˆ™",
    ichingMethodBody:
      "ç»å…¸æ–¹æ³•ä»¥ä¸‰æžšé“œé’±æŽ·å…­æ¬¡ï¼Œé€çˆ»æž„å»ºå¦è±¡ã€‚å½“å¤šçˆ»å˜åŠ¨æ—¶ï¼Œæœ±ç†¹å­¦æ´¾ï¼ˆæ–°å„’å®¶ï¼Œå…¬å…ƒ12ä¸–çºªï¼‰åˆ¶å®šäº†ç²¾ç¡®çš„è§„åˆ™ï¼Œä»¥ç¡®å®šå“ªä¸€çˆ»ä¸»å¯¼è§£è¯»ï¼Œä»Žè€Œæ¶ˆé™¤è§£é‡Šä¸Šçš„æ­§ä¹‰ã€‚æœ¬åº”ç”¨ä¸¥æ ¼æŒ‰ç…§è¿™äº›è§„åˆ™å®žæ–½ï¼Œæœªä½œä»»ä½•ä¿®æ”¹ã€‚",
    ichingWilhelmHeading: "å«ç¤¼è´¤ï¼è´æ©æ–¯è¯‘æœ¬",
    ichingWilhelmBody:
      "å¾·å›½æ±‰å­¦å®¶å«ç¤¼è´¤ï¼ˆRichard Wilhelmï¼‰åœ¨ä¸­å›½ç”Ÿæ´»æ•°åå¹´ï¼ŒäºŽ1924å¹´å‡ºç‰ˆäº†è¥¿æ–¹è¯­è¨€ä¸­æœ€å®Œæ•´ã€æœ€å—æŽ¨å´‡çš„æ˜“ç»è¯‘æœ¬ï¼ŒåŒ…æ‹¬å¦è¾žã€çˆ»è¾žåŠåç¿¼æ³¨è§£ã€‚è´æ©æ–¯ï¼ˆCary Baynesï¼‰äºŽ1950å¹´å°†å…¶è¯‘ä¸ºè‹±æ–‡ã€‚è¯¥è‘—ä½œäºŽ2020å¹´è¿›å…¥å…¬æœ‰é¢†åŸŸï¼Œæ˜¯æœ¬åº”ç”¨çš„åŸºç¡€æ–‡æœ¬ï¼Œæœªä½œä»»ä½•ä¿®æ”¹æˆ–ç®€åŒ–ã€‚",
    ichingLeggeHeading: "ç†é›…å„ï¼ˆJames Leggeï¼‰è¯‘æœ¬",
    ichingLeggeBody:
      "è‹æ ¼å…°ä¼ æ•™å£«ã€æ±‰å­¦å®¶ç†é›…å„äºŽ1882å¹´ç¿»è¯‘äº†ã€Šæ˜“ç»ã€‹ï¼Œä½œä¸ºå…¶ä¸°ç¢‘å·¨è‘—ã€Šä¸œæ–¹åœ£ä¹¦ã€‹çš„ä¸€éƒ¨åˆ†ã€‚ä»–çš„æ–¹æ³•ä¸¥æ ¼éµå¾ªè¯­æ–‡å­¦å’Œå­¦æœ¯æ ‡å‡†ï¼ŒåŠ›å›¾ç ´è¯‘å„’å®¶åŠå‰å„’å®¶æ–‡æœ¬çš„å­—é¢æ„ä¹‰ã€‚ä»–çš„ç‰ˆæœ¬å¸¦æ¥äº†æ— å¯ä¼°é‡çš„é˜é‡Šä¸¥è°¨æ€§ã€‚",
    ichingZhouyiHeading: "åŽŸå…¸ã€Šå‘¨æ˜“ã€‹æ–‡æœ¬",
    ichingZhouyiBody:
      "åŽŸå…¸ã€Šå‘¨æ˜“ã€‹ï¼ˆå­—é¢æ„æ€æ˜¯â€œå‘¨çš„å˜åŒ–â€ï¼‰æ˜¯ã€Šæ˜“ç»ã€‹çš„æ ¸å¿ƒï¼Œç”±64å¦ã€æ–‡çŽ‹å¦è¾žå’Œå‘¨å…¬çˆ»è¾žç»„æˆï¼Œä¸åŒ…å«åŽæ¥çš„å„’å®¶æ³¨é‡Šï¼ˆåç¿¼ï¼‰ã€‚è¿™ä¸€æºå¤´ä½¿æˆ‘ä»¬èƒ½å¤Ÿç›´æŽ¥è¿žæŽ¥åˆ°ç¥žè°•ä¸­æœ€å¤è€çš„è¨æ»¡æ–‡åŒ–å±‚ã€‚",
    ichingChainHeading: "çœŸå®žæ€§ä¼ æ‰¿é“¾",
    ichingChain:
      "åŽŸå§‹å‘¨æ˜“ï¼ˆå‘¨æœï¼‰â†’ å­”å­æ³¨ç–ï¼ˆå…¬å…ƒå‰5ä¸–çºªï¼‰â†’ æœ±ç†¹è§„åˆ™ï¼ˆ12ä¸–çºªï¼‰â†’ å«ç¤¼è´¤å¾·æ–‡è¯‘æœ¬ï¼ˆ1924å¹´ï¼‰â†’ è´æ©æ–¯è‹±æ–‡è¯‘æœ¬ï¼ˆ1950å¹´ï¼‰â†’ å…¬æœ‰é¢†åŸŸï¼ˆ2020å¹´ï¼‰â†’ æœ¬åº”ç”¨ã€‚",
    bonesHeading: "ç”²éª¨å åœï¼ˆç”²éª¨ Â· JiÇŽgÇ”ï¼‰",
    bonesOriginHeading: "åŽ†å²æ¸Šæºï¼ˆå•†æœï¼Œçº¦å…¬å…ƒå‰1600è‡³1046å¹´ï¼‰",
    bonesOriginBody:
      "ç”²éª¨å åœæ˜¯ä¸­å›½æœ‰æ–‡çŒ®è®°è½½çš„æœ€å¤è€åœç­®å®žè·µï¼Œæ—©äºŽæˆæ–‡å½¢å¼çš„æ˜“ç»ã€‚å•†æœçŽ‹å®¤å·«å¸ˆç¼çƒ§é¾Ÿè…¹ç”²æˆ–ç‰›è‚©èƒ›éª¨ï¼Œé€šè¿‡è§£è¯»æ‰€äº§ç”Ÿçš„è£‚çº¹ï¼Œå°±å†›äº‹ã€å†œä¸šã€æ°”å€™åŠçŽ‹çš„ä¸ªäººå†³ç­–å‘ç¥–å…ˆé—®åœã€‚",
    bonesRitualHeading: "ä»ªå¼è¿‡ç¨‹",
    bonesRitualBody:
      "è¯¥è¿‡ç¨‹ç²¾ç¡®ä¸”å¯é‡å¤ï¼šå…ˆç¡®ç«‹æ­£é¢å‘½é¢˜åŠå…¶å¦å®šï¼›å°†ç¼çƒ­é’é“œæ–½äºŽéª¨ä¸Šï¼Œç›´è‡³äº§ç”Ÿè£‚çº¹ï¼›è£‚çº¹çš„æ–¹å‘ã€é•¿åº¦å’Œçº¹æ ·å†³å®šå…†è¾žï¼›ç»“æžœåˆ»äºŽéª¨ä¸Šï¼Œç”±æ­¤æž„æˆä¸­å›½æœ€æ—©çš„æ–‡å­—è®°å½•ã€‚",
    bonesVerdictsHeading: "å››ç§å…†è¾žçŠ¶æ€",
    bonesVerdictAuspClear: "å‰, æ˜Žæ˜¾ä¸ºå‰ï¼šçº¹æ ·æ˜Žç¡®ç¡®è®¤æ­£é¢å‘½é¢˜ï¼Œæ— æ­§ä¹‰ã€‚",
    bonesVerdictAuspMod: "åå‰, åå‘ä¸ºå‰ï¼šæœ‰æ‰€ç¡®è®¤ï¼Œä½†å¸¦æœ‰æ¡ä»¶æˆ–ç»†å¾®å·®åˆ«ã€‚",
    bonesVerdictInauspMod: "åå‡¶, åå‘ä¸ºå‡¶ï¼šçº¹æ ·æœ‰æ‰€ä¿ç•™åœ°å€¾å‘å¦å®šã€‚",
    bonesVerdictInauspClear: "å‡¶, æ˜Žæ˜¾ä¸ºå‡¶ï¼šçº¹æ ·æ˜Žç¡®å¦å®šæ­£é¢å‘½é¢˜ï¼Œæ— æ­§ä¹‰ã€‚",
    bonesAuthHeading: "æ–¹æ³•çš„çœŸå®žæ€§",
    bonesAuthBody:
      "è‡ª19ä¸–çºªä»¥æ¥ï¼Œå·²å‡ºåœŸå¹¶ç ”ç©¶äº†é€¾15ä¸‡ä»¶ç”²éª¨ç¢Žç‰‡ã€‚å®ƒä»¬æ˜¯å›½é™…å…¬è®¤çš„æ–‡åŒ–é—äº§ï¼Œä¿å­˜äºŽä¸­å›½ã€å°æ¹¾ã€æ—¥æœ¬åŠæ¬§æ´²çš„åšç‰©é¦†ä¸­ã€‚æœ¬åº”ç”¨æ‰€å®žæ–½çš„æ–¹æ³•å¿ å®žäºŽå•†ä»£ç³»ç»Ÿçš„ç»“æž„é€»è¾‘ï¼šæ­£é¢å‘½é¢˜ã€è´Ÿé¢å‘½é¢˜ã€ä¾çº¹æ ·ä½œå…†è¾žã€‚",
    yarrowHeading: "è“è‰å æ³• (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "åŽ†å²æ¸Šæºï¼ˆçº¦å…¬å…ƒå‰1000å¹´ï¼‰",
    yarrowOriginBody:
      "è“è‰å æ³•æ˜¯æ˜“ç»æœ¬èº«æ‰€è®°è½½çš„å åœç¨‹åºã€‚åç¿¼ä¹‹ä¸€çš„å¤§ä¼ ï¼ˆå¤§ä¼ , DÃ zhuÃ nï¼‰æ˜Žç¡®æŒ‡å‡ºï¼šã€Œå¤§è¡ä¹‹æ•°äº”åï¼Œå…¶ç”¨å››åæœ‰ä¹ã€‚ã€å­”å­åœ¨ã€Šè®ºè¯­ã€‹ä¸­è¡¨ç¤ºå¸Œæœ›èŠ±äº”åå¹´ç ”ä¹ ã€Šå‘¨æ˜“ã€‹ï¼›å¤å…¸å­¦è€…å°†è¿™ä¸€ã€Œäº”åã€çš„å¼•ç”¨ç†è§£ä¸ºå¯¹è“è‰ç¨‹åºçš„ç›´æŽ¥æš—ç¤ºã€‚è¯¥æ–¹æ³•æ¯”ä¸‰æžšé“œé’±æ³•æ—©ä¸€åƒä½™å¹´ã€‚å«ç¤¼è´¤ä¸Žè´æ©æ–¯åœ¨å…¶1950å¹´è¯‘æœ¬çš„é™„å½•ï¼ˆæ™®æž—æ–¯é¡¿å¤§å­¦å‡ºç‰ˆç¤¾ï¼‰ä¸­è®°å½•äº†å®Œæ•´çš„æ“ä½œæ­¥éª¤ã€‚",
    yarrowProcedureHeading: "å®žç‰©æ“ä½œæ­¥éª¤",
    yarrowProcedureBody:
      "è¿™ç§æ–¹æ³•ä½¿ç”¨ä¸€ç»„å®žä½“è“è‰æˆ–ç±»ä¼¼ç‰©ä»¶ã€‚å…ˆå–å‡ºä¸€æ ¹ï¼Œå…¶ä½™éƒ¨åˆ†é€šè¿‡åå¤çš„ä»ªå¼é¡ºåºæ¥åˆ†åˆä¸Žè®¡æ•°ï¼Œç›´åˆ°å½¢æˆå…­çˆ»ã€‚å¯¹ç”¨æˆ·æ¥è¯´ï¼Œå…³é”®åœ¨äºŽèŠ‚å¥ï¼šå®ƒéœ€è¦æ³¨æ„åŠ›ã€è§¦æ„Ÿå’Œè€å¿ƒï¼Œå› æ­¤æ¯”ä¸‰æžšé“œé’±æ–¹æ³•æ›´å…·ä»ªå¼æ„Ÿã€‚",
    yarrowProbHeading: "æ–¹æ³•çš„æ°”è´¨",
    yarrowProbBody:
      "è“è‰æ–¹æ³•ä¿ç•™äº†æ¯”ä¸‰æžšé“œé’±æ›´æ…¢çš„ä»ªå¼èŠ‚å¥ã€‚åœ¨æœ¬åº”ç”¨ä¸­ï¼Œå®ƒçš„ä»·å€¼ä¸ä»¥æŠ€æœ¯è¡¨æ ¼å‘ˆçŽ°ï¼Œè€Œæ˜¯ä½œä¸ºè¿›å…¥åŒä¸€ã€Šæ˜“ç»ã€‹ä¼ ç»Ÿçš„å¦ä¸€ç§æ–¹å¼ï¼šæ›´å…·è§¦æ„Ÿï¼Œæ›´å®¡æ…Žï¼Œä¹Ÿæ›´æŽ¥è¿‘ Wilhelm/Baynes æ‰€è®°å½•çš„ç»å…¸ç¨‹åºã€‚è‹¥éœ€è¦æ›´å¿«é€Ÿçš„å’¨è¯¢ï¼Œä¸‰æžšé“œé’±æ–¹æ³•åŒæ ·æœ‰æ•ˆã€‚",
    interpretHeading: "ä¸ºä½•äººå·¥æ™ºèƒ½ä¸è‡ªåˆ›å†…å®¹",
    interpretBody:
      "æœ¬åº”ç”¨ä¸­çš„äººå·¥æ™ºèƒ½å…·æœ‰ç‰¹å®šä¸”æœ‰é™çš„åŠŸèƒ½ï¼šèŽ·å–ç®—æ³•ç»“æžœï¼ˆå¦è±¡ã€åŠ¨çˆ»ã€è£‚çº¹å…†è¾žï¼‰å¹¶ç»“åˆç”¨æˆ·é—®é¢˜çš„è¯­å¢ƒï¼Œä»¥ç”¨æˆ·çš„è¯­è¨€å°†å…¶è¡¨è¿°ä¸ºè‡ªç„¶è¯­è¨€ã€‚äººå·¥æ™ºèƒ½ä¸ç”Ÿæˆå¦è±¡ï¼Œä¸è£å®šå…†è¾žï¼Œä¸ä¿®æ”¹å«ç¤¼è´¤çš„æ–‡æœ¬ï¼Œä¹Ÿä¸æ”¹å˜å•†ä»£æ–¹æ³•çš„çº¹æ ·ã€‚æ•°å­¦ç®—æ³•åœ¨äººå·¥æ™ºèƒ½ä»‹å…¥ä¹‹å‰ï¼Œå·²å¿ å®žåœ°å®Œæˆäº†è¿™ä¸€åˆ‡ã€‚äººå·¥æ™ºèƒ½æ˜¯è§£è¯»è€…ï¼Œç¥žè°•æ˜¯æ–¹æ³•æœ¬èº«ã€‚",
    sourcesHeading: "æ¥æºä¸Žå‚è€ƒæ–‡çŒ®",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  ko: {
    title: "ë°©ë²• ì£¼ì„ê³¼ ê¸°ì›",
    lead: "ì´ íŽ˜ì´ì§€ëŠ” ê¸°ìˆ ì Â·ë¬¸í™”ì  ë°°ê²½ ì •ë³´ìž…ë‹ˆë‹¤. ì‚¬ìš© ì•ˆë‚´ì„œê°€ ì•„ë‹™ë‹ˆë‹¤.",
    authNotice:
      "ì´ ì•±ì—ì„œ ì‚¬ìš©ë˜ëŠ” ëª¨ë“  ë°©ë²•ì€ ì—­ì‚¬ì ìœ¼ë¡œ ë¬¸ì„œí™”ë˜ê³  ì „ ì„¸ê³„ í•™ê³„ì—ì„œ ì¡´ì¤‘ë°›ëŠ” ì¤‘êµ­ ë¬¸í™”ì˜ ìˆ˜ì²œ ë…„ ì „í†µì—ì„œ ë¹„ë¡¯ë©ë‹ˆë‹¤. ì´ ì•±ì€ ë…ìžì ì¸ í•´ì„ì„ ì°½ìž‘í•˜ê±°ë‚˜ ê³ ìœ í•œ ì˜ë¯¸ë¥¼ ìƒì„±í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤, ì¸ê³µì§€ëŠ¥ì˜ ë„ì›€ì„ ë°›ì•„ ì •í†µ ë°©ë²•ì„ ì‚¬ìš©ìžì˜ ì–¸ì–´ë¡œ ì ‘ê·¼ ê°€ëŠ¥í•˜ê²Œ ì ìš©í•  ë¿ìž…ë‹ˆë‹¤. ë…ìžëŠ” ì´ íŽ˜ì´ì§€ í•˜ë‹¨ì— ë‚˜ì—´ëœ ì›ì „ê³¼ ëŒ€ì¡°í•˜ì—¬ í™•ì¸í•  ìˆ˜ ìžˆìŠµë‹ˆë‹¤.",
    ichingHeading: "ì£¼ì—­ï¼ˆå‘¨æ˜“ Â· Zhouyiï¼‰",
    ichingOriginHeading: "ì—­ì‚¬ì  ê¸°ì›ï¼ˆê¸°ì›ì „ 1000ë…„ê²½ï¼‰",
    ichingOriginBody:
      "ì£¼ì—­ï¼ˆ'ì£¼ë‚˜ë¼ì˜ ë³€í™”'ï¼‰ì€ ì¸ë¥˜ ì—­ì‚¬ìƒ ê°€ìž¥ ì˜¤ëž˜ëœ ë¬¸í—Œ ì¤‘ í•˜ë‚˜ìž…ë‹ˆë‹¤. ê·¸ ë¿Œë¦¬ëŠ” ì£¼ë‚˜ë¼ï¼ˆê¸°ì›ì „ 1046~256ë…„ï¼‰ë¡œ ê±°ìŠ¬ëŸ¬ ì˜¬ë¼ê°€ì§€ë§Œ, ê·¸ ì ë³µì  í•µì‹¬ì€ ë” ì´ì „ ì‹œëŒ€ì˜ ê²ƒìž…ë‹ˆë‹¤. ì´ ë¬¸í—Œì€ ì„œë¡œ ë‹¤ë¥¸ ì—­ì‚¬ì  ì¸µìœ„ë¡œ êµ¬ì„±ë©ë‹ˆë‹¤: ë¬¸ì™•ì€ ê°ì˜¥ì— ê°‡í˜€ ìžˆëŠ” ë™ì•ˆ 64ê´˜ë¥¼ ì •ë¦¬í•˜ê³  ê´˜ì‚¬ï¼ˆå¦è¾ž, guÃ cÃ­ï¼‰ë¥¼ ì €ìˆ í–ˆìŠµë‹ˆë‹¤. ê·¸ì˜ ì•„ë“¤ ì£¼ê³µì€ ì—¬ì„¯ íš¨ì‚¬ï¼ˆçˆ»è¾ž, yÃ¡ocÃ­ï¼‰ë¥¼ ë§ë¶™ì˜€ìŠµë‹ˆë‹¤. ìˆ˜ ì„¸ê¸° í›„, ê³µìžì™€ ê·¸ì˜ ì œìžë“¤ì€ ì‹­ìµï¼ˆåç¿¼ï¼‰ìœ¼ë¡œ ì•Œë ¤ì§„ ì „í†µì„ ì¶”ê°€í•˜ì—¬ ë¬¸í—Œì˜ ê°€ìž¥ ê¹Šì€ ì² í•™ì  ì¸µì„ í˜•ì„±í–ˆìŠµë‹ˆë‹¤.",
    ichingHexHeading: "64ê´˜ ì²´ê³„",
    ichingHexBody:
      "ê° ê´˜ëŠ” ì—¬ì„¯ íš¨ë¡œ ì´ë£¨ì–´ì§„ ë„í˜•ìœ¼ë¡œ, ê° íš¨ëŠ” ìŒï¼ˆëŠê¸´ ì„ , ìˆ˜ìš©ì ï¼‰ë˜ëŠ” ì–‘ï¼ˆì´ì–´ì§„ ì„ , ëŠ¥ë™ì ï¼‰ìž…ë‹ˆë‹¤. 64ê°€ì§€ ê°€ëŠ¥í•œ ì¡°í•©ì€ ìžì—°ê³¼ ì¸ê°„ì˜ ì‚¶ì—ì„œ ë³€í™”ì˜ ê·¼ë³¸ì ì¸ íŒ¨í„´ì„ ë¬˜ì‚¬í•©ë‹ˆë‹¤. ë³€í•˜ëŠ” íš¨ëŠ” ë³€í™˜ì„ ë‚˜íƒ€ëƒ…ë‹ˆë‹¤: í˜„ìž¬ì˜ ê´˜ëŠ” ë¯¸ëž˜ì˜ ê´˜ë¡œ ë³€í•˜ë©°, ê·¸ ì „í™˜ì´ ë…í•´ì˜ í•µì‹¬ìž…ë‹ˆë‹¤.",
    ichingMethodHeading: "ì‚¼ì „ë²•ê³¼ ì£¼í¬ì˜ ê·œì¹™",
    ichingMethodBody:
      "ê³ ì „ì  ë°©ë²•ì€ ë™ì „ ì„¸ ê°œë¥¼ ì—¬ì„¯ ë²ˆ ë˜ì ¸ íš¨ë¥¼ í•˜ë‚˜ì”© êµ¬ì„±í•©ë‹ˆë‹¤. ì—¬ëŸ¬ íš¨ê°€ ë³€í•  ë•Œ, ì£¼í¬ í•™íŒŒï¼ˆì‹ ìœ í•™, 12ì„¸ê¸°ï¼‰ëŠ” ì–´ë–¤ íš¨ê°€ ë…í•´ë¥¼ ì§€ë°°í•˜ëŠ”ì§€ë¥¼ ê²°ì •í•˜ëŠ” ì •í™•í•œ ê·œì¹™ì„ í™•ë¦½í•˜ì—¬ í•´ì„ìƒì˜ ëª¨í˜¸ì„±ì„ ì œê±°í•©ë‹ˆë‹¤. ì´ ì•±ì€ ìˆ˜ì • ì—†ì´ í•´ë‹¹ ê·œì¹™ì„ ì •í™•ížˆ êµ¬í˜„í•©ë‹ˆë‹¤.",
    ichingWilhelmHeading: "ë¹Œí—¬ë¦„/ë² ì¸ìŠ¤ ë²ˆì—­",
    ichingWilhelmBody:
      "ë…ì¼ ì¤‘êµ­í•™ìž ë¦¬í•˜ë¥´íŠ¸ ë¹Œí—¬ë¦„ì€ ìˆ˜ì‹­ ë…„ê°„ ì¤‘êµ­ì— ì‚´ë©° 1924ë…„ ì„œì–‘ ì–¸ì–´ë¡œ ëœ ê°€ìž¥ ì™„ì „í•˜ê³  ê¶Œìœ„ ìžˆëŠ” ì£¼ì—­ ë²ˆì—­ì„œë¥¼ ì¶œê°„í–ˆìŠµë‹ˆë‹¤. ê´˜ì‚¬, íš¨ì‚¬, ì‹­ìµ ì „í†µì„ ëª¨ë‘ í¬í•¨í•©ë‹ˆë‹¤. ì¼€ë¦¬ ë² ì¸ìŠ¤ê°€ 1950ë…„ ì˜ì–´ë¡œ ë²ˆì—­í–ˆìŠµë‹ˆë‹¤. ì´ ì €ìž‘ì€ 2020ë…„ì— ê³µê³µ ë„ë©”ì¸ì— ì§„ìž…í•˜ì˜€ìœ¼ë©°, ì´ ì•±ì˜ ê¸°ë³¸ í…ìŠ¤íŠ¸ìž…ë‹ˆë‹¤, ìˆ˜ì •ì´ë‚˜ ë‹¨ìˆœí™” ì—†ì´.",
    ichingLeggeHeading: "ì œìž„ìŠ¤ ë ˆê·¸ ë²ˆì—­",
    ichingLeggeBody:
      "ìŠ¤ì½”í‹€ëžœë“œì˜ ì„ êµì‚¬ì´ìž ì¤‘êµ­í•™ìžì¸ ì œìž„ìŠ¤ ë ˆê·¸ëŠ” ìžì‹ ì˜ ê¸°ë…ë¹„ì  ì €ìž‘ì¸ 'ë™ë°©ì˜ ì„±ì„œ'ì˜ ì¼ë¶€ë¡œ 1882ë…„ì— ì£¼ì—­ì„ ë²ˆì—­í–ˆìŠµë‹ˆë‹¤. ê·¸ì˜ ì ‘ê·¼ ë°©ì‹ì€ ì—„ê²©í•˜ê²Œ ë¬¸í—Œí•™ì ì´ê³  í•™ìˆ ì ì´ì—ˆìœ¼ë©°, ìœ êµ ë° ìœ êµ ì´ì „ í…ìŠ¤íŠ¸ì˜ ë¬¸ìžì  ì˜ë¯¸ë¥¼ í•´ë…í•˜ê³ ìž í–ˆìŠµë‹ˆë‹¤. ê·¸ì˜ ë²„ì „ì€ ë§¤ìš° ê·€ì¤‘í•œ í•´ì„ì  ì—„ë°€í•¨ì„ ì œê³µí•©ë‹ˆë‹¤.",
    ichingZhouyiHeading: "ì›ì „ ì£¼ì—­ í…ìŠ¤íŠ¸",
    ichingZhouyiBody:
      "ì›ì „ì¸ ì£¼ì—­(ë¬¸ìž ê·¸ëŒ€ë¡œ 'ì£¼ë‚˜ë¼ì˜ ë³€í™”')ì€ 64ê´˜, ë¬¸ì™•ì˜ ê´˜ì‚¬, ì£¼ê³µì˜ íš¨ì‚¬ë¡œ êµ¬ì„±ë˜ë©°, í›„ëŒ€ì˜ ìœ êµ ì£¼ì„(ì‹­ìµ)ì„ í¬í•¨í•˜ì§€ ì•ŠëŠ” ì£¼ì—­ì˜ í•µì‹¬ìž…ë‹ˆë‹¤. ì´ ì¶œì²˜ëŠ” ì‹ íƒì˜ ìƒ¤ë¨¸ë‹ˆì¦˜ì ì´ê³  ê°€ìž¥ ì˜¤ëž˜ëœ ì¸µê³¼ì˜ ì§ì ‘ì ì¸ ì—°ê²°ì„ ê°€ëŠ¥í•˜ê²Œ í•©ë‹ˆë‹¤.",
    ichingChainHeading: "ì •í†µì„±ì˜ ì—°ì‡„",
    ichingChain:
      "ì›ë³¸ ì£¼ì—­ï¼ˆì£¼ë‚˜ë¼ï¼‰â†’ ê³µìž ì „í†µï¼ˆê¸°ì›ì „ 5ì„¸ê¸°ï¼‰â†’ ì£¼í¬ ê·œì¹™ï¼ˆ12ì„¸ê¸°ï¼‰â†’ ë¹Œí—¬ë¦„ ë…ì¼ì–´ ë²ˆì—­ï¼ˆ1924ë…„ï¼‰â†’ ë² ì¸ìŠ¤ ì˜ì–´ ë²ˆì—­ï¼ˆ1950ë…„ï¼‰â†’ ê³µê³µ ë„ë©”ì¸ï¼ˆ2020ë…„ï¼‰â†’ ì´ ì•±.",
    bonesHeading: "ê°‘ê³¨ ì ë³µï¼ˆç”²éª¨ Â· JiÇŽgÇ”ï¼‰",
    bonesOriginHeading: "ì—­ì‚¬ì  ê¸°ì›ï¼ˆìƒë‚˜ë¼, ê¸°ì›ì „ 1600~1046ë…„ê²½ï¼‰",
    bonesOriginBody:
      "ê°‘ê³¨ ì ë³µì€ ì¤‘êµ­ì—ì„œ ë¬¸ì„œí™”ëœ ê°€ìž¥ ì˜¤ëž˜ëœ ì ë³µ ì‹¤ì²œìœ¼ë¡œ, ê¸°ë¡ëœ í˜•íƒœì˜ ì£¼ì—­ë³´ë‹¤ë„ ì•žì„  ì „í†µìž…ë‹ˆë‹¤. ìƒë‚˜ë¼ì˜ ì™•ì‹¤ ë¬´ë‹¹ë“¤ì€ ê±°ë¶ ë°°ê°‘ì´ë‚˜ ì†Œ ê²¬ê°‘ê³¨ì„ íƒœìš°ê³  ìƒê¸´ ê· ì—´ì„ ì½ì–´ êµ°ì‚¬, ë†ì—…, ê¸°í›„, ì™•ì˜ ê°œì¸ì  ê²°ì •ì— ëŒ€í•´ ì¡°ìƒì—ê²Œ ë¬¼ì—ˆìŠµë‹ˆë‹¤.",
    bonesRitualHeading: "ì˜ë¡€ì  ê³¼ì •",
    bonesRitualBody:
      "ì´ ê³¼ì •ì€ ì •í™•í•˜ê³  ë°˜ë³µ ê°€ëŠ¥í–ˆìŠµë‹ˆë‹¤: ê¸ì •ì ì¸ ëª…ì œì™€ ê·¸ ë¶€ì •ì„ ê³µì‹í™”í•©ë‹ˆë‹¤. ë¼ˆì— ëœ¨ê±°ìš´ ì²­ë™ì„ ê°€í•˜ì—¬ ê· ì—´ì„ ëƒ…ë‹ˆë‹¤. ê· ì—´ì˜ ë°©í–¥, ê¸¸ì´, íŒ¨í„´ì´ ì‹ íƒì„ ê²°ì •í–ˆìŠµë‹ˆë‹¤. ê²°ê³¼ëŠ” ë¼ˆ ìžì²´ì— ìƒˆê²¨ì¡Œìœ¼ë©°, ì´ëŠ” ì¤‘êµ­ ìµœì´ˆì˜ ë¬¸ìž ê¸°ë¡ì„ êµ¬ì„±í•©ë‹ˆë‹¤.",
    bonesVerdictsHeading: "ì‹ íƒì˜ ë„¤ ê°€ì§€ ìƒíƒœ",
    bonesVerdictAuspClear:
      "å‰, ëª…í™•ížˆ ê¸¸í•¨: íŒ¨í„´ì´ ê¸ì • ëª…ì œë¥¼ ëª¨í˜¸í•¨ ì—†ì´ í™•ì¸í•©ë‹ˆë‹¤.",
    bonesVerdictAuspMod:
      "å‰ ì¤‘ê°„, ë‹¤ì†Œ ê¸¸í•¨: í™•ì¸ì´ ìžˆì§€ë§Œ ë‰˜ì•™ìŠ¤ë‚˜ ì¡°ê±´ì´ ë”°ë¦…ë‹ˆë‹¤.",
    bonesVerdictInauspMod:
      "å‡¶ ì¤‘ê°„, ë‹¤ì†Œ í‰í•¨: íŒ¨í„´ì´ ìœ ë³´ì ìœ¼ë¡œ ë¶€ì • ìª½ìœ¼ë¡œ ê¸°ì›ë‹ˆë‹¤.",
    bonesVerdictInauspClear:
      "å‡¶, ëª…í™•ížˆ í‰í•¨: íŒ¨í„´ì´ ê¸ì • ëª…ì œë¥¼ ëª¨í˜¸í•¨ ì—†ì´ ë¶€ì •í•©ë‹ˆë‹¤.",
    bonesAuthHeading: "ë°©ë²•ì˜ ì •í†µì„±",
    bonesAuthBody:
      "19ì„¸ê¸° ì´ëž˜ 15ë§Œ ì  ì´ìƒì˜ ê°‘ê³¨ íŒŒíŽ¸ì´ ë°œêµ´ë˜ì–´ ì—°êµ¬ë˜ì—ˆìŠµë‹ˆë‹¤. ì´ëŠ” êµ­ì œì ìœ¼ë¡œ ì¸ì •ë°›ëŠ” ë¬¸í™”ìœ ì‚°ìœ¼ë¡œ ì¤‘êµ­, ëŒ€ë§Œ, ì¼ë³¸, ìœ ëŸ½ì˜ ë°•ë¬¼ê´€ì— ë³´ì¡´ë˜ì–´ ìžˆìŠµë‹ˆë‹¤. ì´ ì•±ì—ì„œ êµ¬í˜„ëœ ë°©ë²•ì€ ìƒ ì²´ê³„ì˜ êµ¬ì¡°ì  ë…¼ë¦¬ë¥¼ ì¡´ì¤‘í•©ë‹ˆë‹¤: ê¸ì • ëª…ì œ, ë¶€ì • ëª…ì œ, íŒ¨í„´ì— ì˜í•œ ì‹ íƒ.",
    yarrowHeading: "ì‹œì´ˆì ë²• (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "ì—­ì‚¬ì  ê¸°ì› (ê¸°ì›ì „ ì•½ 1000ë…„)",
    yarrowOriginBody:
      "ì‹œì´ˆ ë°©ë²•ì€ ì—­ê²½ ìžì²´ì— ê¸°ë¡ëœ ì ìˆ  ì ˆì°¨ìž…ë‹ˆë‹¤. ì‹­ìµ ì¤‘ í•˜ë‚˜ì¸ ëŒ€ì „(å¤§ä¼ , DÃ zhuÃ n)ì€ êµ¬ì²´ì ìœ¼ë¡œ ê¸°ìˆ í•©ë‹ˆë‹¤: 'ëŒ€ì—°ì§€ìˆ˜ì˜¤ì‹­, ê¸°ìš©ì‚¬ì‹­ìœ êµ¬(ëŒ€ì—°ì˜ ìˆ˜ëŠ” 50ì´ë©° ê·¸ ì¤‘ 49ë¥¼ ì‚¬ìš©í•œë‹¤).' ê³µìžëŠ” ë…¼ì–´ì—ì„œ ì—­ì„ ì˜¤ì‹­ ë…„ê°„ ê³µë¶€í•˜ê³  ì‹¶ë‹¤ê³  ë°í˜”ìœ¼ë©°, ê³ ì „í•™ìžë“¤ì€ ì´ 50ì´ë¼ëŠ” ìˆ«ìžë¥¼ ì‹œì´ˆ ì ˆì°¨ì— ëŒ€í•œ ì§ì ‘ì ì¸ ì•”ì‹œë¡œ í•´ì„í•©ë‹ˆë‹¤. ì´ ë°©ë²•ì€ ì‚¼ì „ë²•ë³´ë‹¤ ì²œ ë…„ ì´ìƒ ì•žì„­ë‹ˆë‹¤. ë¦¬í•˜ë¥´íŠ¸ ë¹Œí—¬ë¦„ê³¼ ìºë¦¬ ë² ì¸ìŠ¤ëŠ” 1950ë…„ ë²ˆì—­ë³¸ ë¶€ë¡(í”„ë¦°ìŠ¤í„´ ëŒ€í•™ ì¶œíŒë¶€)ì— ì „ì²´ ì ˆì°¨ë¥¼ ê¸°ë¡í–ˆìŠµë‹ˆë‹¤.",
    yarrowProcedureHeading: "ì‹¤ë¬¼ ì ˆì°¨",
    yarrowProcedureBody:
      "ì´ ë°©ë²•ì€ ì‹¤ì œ ì‹œì´ˆë‚˜ ë¹„ìŠ·í•œ ë¬¼ê±´ì˜ ë¬¶ìŒì„ ì‚¬ìš©í•©ë‹ˆë‹¤. í•˜ë‚˜ë¥¼ ë”°ë¡œ ë‘ê³  ë‚˜ë¨¸ì§€ë¥¼ ë°˜ë³µë˜ëŠ” ì˜ë¡€ì  ìˆœì„œì— ë”°ë¼ ë‚˜ëˆ„ê³  ì„¸ì–´ ì—¬ì„¯ íš¨ë¥¼ í˜•ì„±í•©ë‹ˆë‹¤. ì‚¬ìš©ìžì—ê²Œ ì¤‘ìš”í•œ ê²ƒì€ ê·¸ ë¦¬ë“¬ìž…ë‹ˆë‹¤. ì£¼ì˜, ì´‰ê°, ì¸ë‚´ë¥¼ ìš”êµ¬í•˜ê¸° ë•Œë¬¸ì— ì„¸ ë™ì „ ë°©ë²•ë³´ë‹¤ ë” ì˜ë¡€ì ì¸ ìƒë‹´ì²˜ëŸ¼ ëŠê»´ì§‘ë‹ˆë‹¤.",
    yarrowProbHeading: "ë°©ë²•ì˜ ì„±ê²©",
    yarrowProbBody:
      "ì‹œì´ˆ ë°©ë²•ì€ ì„¸ ë™ì „ ë°©ë²•ë³´ë‹¤ ë” ëŠë¦° ì˜ë¡€ì  ë¦¬ë“¬ì„ ë³´ì¡´í•©ë‹ˆë‹¤. ì´ ì•±ì—ì„œ ê·¸ ê°€ì¹˜ëŠ” ê¸°ìˆ ì ì¸ í‘œê°€ ì•„ë‹ˆë¼ ê°™ì€ ì£¼ì—­ ì „í†µì— ë“¤ì–´ê°€ëŠ” ë‹¤ë¥¸ ë°©ì‹ìœ¼ë¡œ ì œì‹œë©ë‹ˆë‹¤. ë” ì´‰ê°ì ì´ê³ , ë” ì‹ ì¤‘í•˜ë©°, Wilhelm/Baynesê°€ ê¸°ë¡í•œ ê³ ì „ì  ì ˆì°¨ì— ë” ê°€ê¹ìŠµë‹ˆë‹¤. ë¹ ë¥¸ ìƒë‹´ì—ëŠ” ì„¸ ë™ì „ ë°©ë²•ë„ ë˜‘ê°™ì´ ìœ íš¨í•©ë‹ˆë‹¤.",
    interpretHeading: "ì¸ê³µì§€ëŠ¥ì´ ì°½ìž‘í•˜ì§€ ì•ŠëŠ” ì´ìœ ",
    interpretBody:
      "ì´ ì•±ì˜ ì¸ê³µì§€ëŠ¥ì€ íŠ¹ì •í•˜ê³  í•œì •ëœ ê¸°ëŠ¥ì„ ìˆ˜í–‰í•©ë‹ˆë‹¤: ì•Œê³ ë¦¬ì¦˜ì˜ ê²°ê³¼, ê´˜, ë³€íš¨, ê· ì—´ ì‹ íƒ, ë¥¼ ë°›ì•„ ì‚¬ìš©ìžì˜ ì§ˆë¬¸ ë§¥ë½ê³¼ í•¨ê»˜ ì‚¬ìš©ìžì˜ ì–¸ì–´ë¡œ ìžì—°ì–´ë¡œ í‘œí˜„í•˜ëŠ” ê²ƒìž…ë‹ˆë‹¤. AIëŠ” ê´˜ë¥¼ ìƒì„±í•˜ì§€ ì•Šê³ , ì‹ íƒì„ ê²°ì •í•˜ì§€ ì•Šìœ¼ë©°, ë¹Œí—¬ë¦„ì˜ í…ìŠ¤íŠ¸ë‚˜ ìƒ ë°©ë²•ì˜ íŒ¨í„´ì„ ìˆ˜ì •í•˜ì§€ ì•ŠìŠµë‹ˆë‹¤. ìˆ˜í•™ì  ì•Œê³ ë¦¬ì¦˜ì´ AIê°€ ê°œìž…í•˜ê¸° ì „ì— ì¶©ì‹¤ížˆ ê·¸ ì—­í• ì„ í•©ë‹ˆë‹¤. AIëŠ” í•´ì„ìžìž…ë‹ˆë‹¤. ì‹ íƒì€ ë°©ë²• ê·¸ ìžì²´ìž…ë‹ˆë‹¤.",
    sourcesHeading: "ì¶œì²˜ ë° ì°¸ê³ ë¬¸í—Œ",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  ar: {
    title: "Ù…Ù„Ø§Ø­Ø¸Ø§Øª ÙˆØ£ØµÙˆÙ„ Ø§Ù„Ø·Ø±Ù‚",
    lead: "Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø© Ø³ÙŠØ§Ù‚ ØªÙ‚Ù†ÙŠ ÙˆØ«Ù‚Ø§ÙÙŠ. Ø¥Ù†Ù‡Ø§ Ù„ÙŠØ³Øª Ø¯Ù„ÙŠÙ„ Ø§Ø³ØªØ®Ø¯Ø§Ù….",
    authNotice:
      "Ø¬Ù…ÙŠØ¹ Ø§Ù„Ø·Ø±Ù‚ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…Ø© ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ù…Ø³ØªÙ…Ø¯Ø© Ù…Ù† ØªÙ‚Ø§Ù„ÙŠØ¯ Ø¹Ø±ÙŠÙ‚Ø© ÙÙŠ Ø§Ù„Ø«Ù‚Ø§ÙØ© Ø§Ù„ØµÙŠÙ†ÙŠØ©ØŒ Ù…ÙˆØ«Ù‚Ø© ØªØ§Ø±ÙŠØ®ÙŠØ§Ù‹ ÙˆÙ…Ø­ØªØ±Ù…Ø© Ø£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ§Ù‹ ÙÙŠ Ø¬Ù…ÙŠØ¹ Ø£Ù†Ø­Ø§Ø¡ Ø§Ù„Ø¹Ø§Ù„Ù…. Ù„Ø§ ÙŠØ®ØªØ±Ø¹ Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ ØªÙØ³ÙŠØ±Ø§Øª ÙˆÙ„Ø§ ÙŠÙˆÙ„Ø¯ Ù…Ø¹Ø§Ù†ÙŠ Ø®Ø§ØµØ© Ø¨Ù‡, Ø¨Ù„ ÙŠØ·Ø¨Ù‚ Ø·Ø±Ù‚Ø§Ù‹ Ø£ØµÙŠÙ„Ø© Ø¨Ù…Ø³Ø§Ø¹Ø¯Ø© Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ù„Ø¬Ø¹Ù„Ù‡Ø§ ÙÙŠ Ù…ØªÙ†Ø§ÙˆÙ„ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¨Ù„ØºØªÙ‡. ÙŠÙ…ÙƒÙ† Ù„Ø£ÙŠ Ù‚Ø§Ø±Ø¦ Ù…Ù‚Ø§Ø±Ù†Ø© Ø§Ù„Ù†ØµÙˆØµ Ø¨Ø§Ù„Ù…ØµØ§Ø¯Ø± Ø§Ù„Ø£ØµÙ„ÙŠØ© Ø§Ù„Ù…Ø¯Ø±Ø¬Ø© ÙÙŠ Ù†Ù‡Ø§ÙŠØ© Ù‡Ø°Ù‡ Ø§Ù„ØµÙØ­Ø©.",
    ichingHeading: "Ø§Ù„Ø¢ÙŠ ØªØ´ÙŠÙ†Øº (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "Ø§Ù„Ø£ØµÙˆÙ„ Ø§Ù„ØªØ§Ø±ÙŠØ®ÙŠØ© (Ù†Ø­Ùˆ 1000 Ù‚Ø¨Ù„ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯)",
    ichingOriginBody:
      "Ø§Ù„Ù€ Zhouyi, Â«ØªØ­ÙˆÙ„Ø§Øª Ø§Ù„Ù€ ZhouÂ», Ù‡Ùˆ Ø£Ø­Ø¯ Ø£Ù‚Ø¯Ù… Ø§Ù„Ù†ØµÙˆØµ ÙÙŠ ØªØ§Ø±ÙŠØ® Ø§Ù„Ø¨Ø´Ø±ÙŠØ©. ØªØ¹ÙˆØ¯ Ø¬Ø°ÙˆØ±Ù‡ Ø¥Ù„Ù‰ Ø£Ø³Ø±Ø© Zhou (1046â€“256 Ù‚Ø¨Ù„ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯)ØŒ ÙˆØ¥Ù† ÙƒØ§Ù† Ù†ÙˆØ§ØªÙ‡ Ø§Ù„ÙƒÙ‡Ù†ÙˆØªÙŠØ© Ø£Ù‚Ø¯Ù… Ù…Ù† Ø°Ù„Ùƒ. Ø¨ÙÙ†ÙŠ Ø§Ù„Ù†Øµ ÙÙŠ Ø·Ø¨Ù‚Ø§Øª ØªØ§Ø±ÙŠØ®ÙŠØ© Ù…ØªÙ…Ø§ÙŠØ²Ø©: Ù†Ø¸Ù‘Ù… Ø§Ù„Ù…Ù„Ùƒ Wen Ø§Ù„Ø£ØºØ±Ø§Ø¶ Ø§Ù„Ù€ 64 ÙˆÙƒØªØ¨ Ø§Ù„Ø£Ø­ÙƒØ§Ù… (å¦è¾žØŒ guÃ cÃ­) Ø£Ø«Ù†Ø§Ø¡ Ø³Ø¬Ù†Ù‡. Ø£Ø¶Ø§Ù Ø§Ø¨Ù†Ù‡ Ø§Ù„Ø¯ÙˆÙ‚ Zhou Ø¹Ø¨Ø§Ø±Ø§Øª Ø§Ù„Ø£Ø³Ø·Ø± Ø§Ù„Ø³Øª (çˆ»è¾žØŒ yÃ¡ocÃ­). ÙˆØ¨Ø¹Ø¯ Ù‚Ø±ÙˆÙ†ØŒ Ø£Ø¶Ø§Ù ÙƒÙˆÙ†ÙÙˆØ´ÙŠÙˆØ³ ÙˆØªÙ„Ø§Ù…ÙŠØ°Ù‡ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø§Ù„Ù…Ø¹Ø±ÙˆÙØ© Ø¨Ù€ Â«Ø§Ù„Ø£Ø¬Ù†Ø­Ø© Ø§Ù„Ø¹Ø´Ø±Ø©Â» (åç¿¼)ØŒ Ø£Ø¹Ù…Ù‚ Ø§Ù„Ø·Ø¨Ù‚Ø§Øª Ø§Ù„ÙÙ„Ø³ÙÙŠØ© ÙÙŠ Ø§Ù„Ù†Øµ.",
    ichingHexHeading: "Ù†Ø¸Ø§Ù… Ø§Ù„Ø£ØºØ±Ø§Ø¶ Ø§Ù„Ø£Ø±Ø¨Ø¹Ø© ÙˆØ§Ù„Ø³ØªÙŠÙ†",
    ichingHexBody:
      "ÙƒÙ„ ØºØ±Ø¶ Ù‡Ùˆ Ø´ÙƒÙ„ Ù…Ù† Ø³ØªØ© Ø®Ø·ÙˆØ·ØŒ ÙƒÙ„ Ù…Ù†Ù‡Ø§ Ø¥Ù…Ø§ ÙŠÙŠÙ† (Ù…ÙƒØ³ÙˆØ±ØŒ Ù…ØªÙ‚Ø¨Ù‘Ù„) Ø£Ùˆ ÙŠØ§Ù†Øº (Ù…Ø³ØªÙ…Ø±ØŒ Ù†Ø´Ø·). ØªØµÙ Ø§Ù„Ù€ 64 ØªØ±ÙƒÙŠØ¨Ø© Ø§Ù„Ù…Ù…ÙƒÙ†Ø© Ø§Ù„Ø£Ù†Ù…Ø§Ø· Ø§Ù„Ø£Ø³Ø§Ø³ÙŠØ© Ù„Ù„ØªØºÙŠÙŠØ± ÙÙŠ Ø§Ù„Ø·Ø¨ÙŠØ¹Ø© ÙˆØ§Ù„Ø­ÙŠØ§Ø© Ø§Ù„Ø¨Ø´Ø±ÙŠØ©. ØªØ´ÙŠØ± Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ù…ØªØ­Ø±ÙƒØ© Ø¥Ù„Ù‰ Ø§Ù„ØªØ­ÙˆÙ„: Ø§Ù„ØºØ±Ø¶ Ø§Ù„Ø­Ø§Ø¶Ø± ÙŠØªØ­ÙˆÙ„ Ø¥Ù„Ù‰ ØºØ±Ø¶ Ù…Ø³ØªÙ‚Ø¨Ù„ÙŠØŒ ÙˆÙ‡Ø°Ø§ Ø§Ù„Ø§Ù†ØªÙ‚Ø§Ù„ Ù‡Ùˆ Ø¬ÙˆÙ‡Ø± Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©.",
    ichingMethodHeading: "Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø«Ù„Ø§Ø« ÙˆÙ‚ÙˆØ§Ø¹Ø¯ Zhu Xi",
    ichingMethodBody:
      "ØªØ³ØªØ®Ø¯Ù… Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠØ© Ø«Ù„Ø§Ø« Ø¹Ù…Ù„Ø§Øª ØªÙÙ‚Ø°Ù Ø³Øª Ù…Ø±Ø§Øª Ù„Ø¨Ù†Ø§Ø¡ Ø§Ù„ØºØ±Ø¶ Ø®Ø·Ø§Ù‹ Ø¨Ø®Ø·. Ø¹Ù†Ø¯Ù…Ø§ ØªØªØºÙŠØ± Ø®Ø·ÙˆØ· Ù…ØªØ¹Ø¯Ø¯Ø©ØŒ ØªØ¶Ø¹ Ù…Ø¯Ø±Ø³Ø© Zhu Xi (Ø§Ù„ÙƒÙˆÙ†ÙÙˆØ´ÙŠØ§Ù†ÙŠØ© Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©ØŒ Ø§Ù„Ù‚Ø±Ù† Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø± Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯ÙŠ) Ù‚ÙˆØ§Ø¹Ø¯ Ø¯Ù‚ÙŠÙ‚Ø© Ù„ØªØ­Ø¯ÙŠØ¯ Ø£ÙŠ Ø®Ø· ÙŠØ­ÙƒÙ… Ø§Ù„Ù‚Ø±Ø§Ø¡Ø©ØŒ Ù…Ù…Ø§ ÙŠØ²ÙŠÙ„ Ø§Ù„ØºÙ…ÙˆØ¶ Ø§Ù„ØªÙØ³ÙŠØ±ÙŠ. ÙŠÙ†ÙØ° Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ ØªÙ„Ùƒ Ø§Ù„Ù‚ÙˆØ§Ø¹Ø¯ Ø¨Ø¯Ù‚Ø© Ø¯ÙˆÙ† Ø£ÙŠ ØªØ¹Ø¯ÙŠÙ„.",
    ichingWilhelmHeading: "ØªØ±Ø¬Ù…Ø© Wilhelm/Baynes",
    ichingWilhelmBody:
      "Ø±ÙŠØªØ´Ø§Ø±Ø¯ ÙÙŠÙ„Ù‡Ù„Ù…ØŒ Ø§Ù„Ù…Ø³ØªØ´Ø±Ù‚ Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠØŒ Ø¹Ø§Ø´ ÙÙŠ Ø§Ù„ØµÙŠÙ† Ø¹Ù‚ÙˆØ¯Ø§Ù‹ ÙˆØ£Ù†ØªØ¬ Ø¹Ø§Ù… 1924 Ø§Ù„ØªØ±Ø¬Ù…Ø© Ø§Ù„Ø£ÙƒØ«Ø± Ø§ÙƒØªÙ…Ø§Ù„Ø§Ù‹ ÙˆØ§Ø­ØªØ±Ø§Ù…Ø§Ù‹ Ù„Ù„Ù€ I Ching ÙÙŠ Ø§Ù„Ù„ØºØ§Øª Ø§Ù„ØºØ±Ø¨ÙŠØ©ØŒ Ø¨Ù…Ø§ ÙÙŠÙ‡Ø§ Ø§Ù„Ø£Ø­ÙƒØ§Ù… ÙˆØ§Ù„Ø®Ø·ÙˆØ· ÙˆØªØ¹Ù„ÙŠÙ‚Ø§Øª Â«Ø§Ù„Ø£Ø¬Ù†Ø­Ø© Ø§Ù„Ø¹Ø´Ø±Ø©Â». ØªØ±Ø¬Ù…ØªÙ‡Ø§ ÙƒØ§Ø±ÙŠ Ø¨ÙŠÙ†Ø² Ø¥Ù„Ù‰ Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© Ø¹Ø§Ù… 1950. Ø¯Ø®Ù„ Ù‡Ø°Ø§ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ø¹Ø§Ù… Ø¹Ø§Ù… 2020 ÙˆÙ‡Ùˆ Ø§Ù„Ù†Øµ Ø§Ù„Ø£Ø³Ø§Ø³ÙŠ Ù„Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚, Ø¯ÙˆÙ† ØªØ¹Ø¯ÙŠÙ„Ø§Øª Ø£Ùˆ ØªØ¨Ø³ÙŠØ·Ø§Øª.",
    ichingLeggeHeading: "ØªØ±Ø¬Ù…Ø© Ø¬ÙŠÙ…Ø³ Ù„ÙŠØº",
    ichingLeggeBody:
      "ØªØ±Ø¬Ù… Ø¬ÙŠÙ…Ø³ Ù„ÙŠØºØŒ ÙˆÙ‡Ùˆ Ù…Ø¨Ø´Ø± ÙˆØ¹Ø§Ù„Ù… ØµÙŠÙ†ÙŠØ§Øª Ø§Ø³ÙƒØªÙ„Ù†Ø¯ÙŠØŒ ÙƒØªØ§Ø¨ I Ching ÙÙŠ Ø¹Ø§Ù… 1882 ÙƒØ¬Ø²Ø¡ Ù…Ù† Ø¹Ù…Ù„Ù‡ Ø§Ù„Ø¶Ø®Ù… 'Ø§Ù„ÙƒØªØ¨ Ø§Ù„Ù…Ù‚Ø¯Ø³Ø© ÙÙŠ Ø§Ù„Ø´Ø±Ù‚'. ÙƒØ§Ù† Ù†Ù‡Ø¬Ù‡ ÙÙ‚Ù‡ÙŠØ§Ù‹ ÙˆØ£ÙƒØ§Ø¯ÙŠÙ…ÙŠØ§Ù‹ Ø¨ØµØ±Ø§Ù…Ø©ØŒ Ø³Ø¹ÙŠØ§Ù‹ Ù„ÙÙƒ Ø§Ù„Ù…Ø¹Ù†Ù‰ Ø§Ù„Ø­Ø±ÙÙŠ Ù„Ù„Ù†ØµÙˆØµ Ø§Ù„ÙƒÙˆÙ†ÙÙˆØ´ÙŠÙˆØ³ÙŠØ© ÙˆÙ…Ø§ Ù‚Ø¨Ù„ Ø§Ù„ÙƒÙˆÙ†ÙÙˆØ´ÙŠÙˆØ³ÙŠØ©. ÙˆØªÙˆÙØ± Ù†Ø³Ø®ØªÙ‡ Ø¯Ù‚Ø© ØªÙØ³ÙŠØ±ÙŠØ© Ù„Ø§ ØªÙ‚Ø¯Ø± Ø¨Ø«Ù…Ù†.",
    ichingZhouyiHeading: "Ù†Øµ Zhou Yi Ø§Ù„Ø£ØµÙ„ÙŠ",
    ichingZhouyiBody:
      "Ù†Øµ Zhou Yi Ø§Ù„Ø£ØµÙ„ÙŠ (Ø­Ø±ÙÙŠØ§Ù‹ 'ØªØºÙŠÙŠØ±Ø§Øª Zhou') Ù‡Ùˆ Ø¬ÙˆÙ‡Ø± I ChingØŒ ÙˆÙŠØªÙƒÙˆÙ† Ù…Ù† 64 Ø´ÙƒÙ„Ø§Ù‹ Ø³Ø¯Ø§Ø³ÙŠØ§Ù‹ØŒ ÙˆØ£Ø­ÙƒØ§Ù… Ø§Ù„Ù…Ù„Ùƒ WenØŒ ÙˆØ®Ø·ÙˆØ· Ø§Ù„Ø¯ÙˆÙ‚ ZhouØŒ Ø¨Ø¯ÙˆÙ† Ø§Ù„ØªØ¹Ù„ÙŠÙ‚Ø§Øª Ø§Ù„ÙƒÙˆÙ†ÙÙˆØ´ÙŠÙˆØ³ÙŠØ© Ø§Ù„Ù„Ø§Ø­Ù‚Ø© (Ø§Ù„Ø£Ø¬Ù†Ø­Ø© Ø§Ù„Ø¹Ø´Ø±Ø©). ÙŠØªÙŠØ­ Ù‡Ø°Ø§ Ø§Ù„Ù…ØµØ¯Ø± Ø§ØªØµØ§Ù„Ø§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø§Ù‹ Ø¨Ø§Ù„Ø·Ø¨Ù‚Ø© Ø§Ù„Ø´Ø§Ù…Ø§Ù†ÙŠØ© ÙˆØ§Ù„Ø£Ù‚Ø¯Ù… Ù…Ù† Ø§Ù„Ø¹Ø±Ø§ÙØ©.",
    ichingChainHeading: "Ø³Ù„Ø³Ù„Ø© Ø§Ù„Ø£ØµØ§Ù„Ø©",
    ichingChain:
      "Ø§Ù„Ù€ Zhou Yi Ø§Ù„Ø£ØµÙ„ÙŠ (Ø£Ø³Ø±Ø© Zhou) â†’ ØªØ¹Ù„ÙŠÙ‚Ø§Øª ÙƒÙˆÙ†ÙÙˆØ´ÙŠÙˆØ³ (Ø§Ù„Ù‚Ø±Ù† Ø§Ù„Ø®Ø§Ù…Ø³ Ù‚Ø¨Ù„ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯) â†’ Ù‚ÙˆØ§Ø¹Ø¯ Zhu Xi (Ø§Ù„Ù‚Ø±Ù† Ø§Ù„Ø«Ø§Ù†ÙŠ Ø¹Ø´Ø± Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯ÙŠ) â†’ ØªØ±Ø¬Ù…Ø© Wilhelm Ø§Ù„Ø£Ù„Ù…Ø§Ù†ÙŠØ© (1924) â†’ ØªØ±Ø¬Ù…Ø© Baynes Ø§Ù„Ø¥Ù†Ø¬Ù„ÙŠØ²ÙŠØ© (1950) â†’ Ø§Ù„Ù†Ø·Ø§Ù‚ Ø§Ù„Ø¹Ø§Ù… (2020) â†’ Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚.",
    bonesHeading: "Ø¹Ø¸Ø§Ù… Ø§Ù„Ø¹Ø±Ø§ÙØ© (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading:
      "Ø§Ù„Ø£ØµÙˆÙ„ Ø§Ù„ØªØ§Ø±ÙŠØ®ÙŠØ© (Ø£Ø³Ø±Ø© ShangØŒ Ù†Ø­Ùˆ 1600â€“1046 Ù‚Ø¨Ù„ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯)",
    bonesOriginBody:
      "Ø§Ù„ØªÙƒÙ‡Ù† Ø¨Ø¹Ø¸Ø§Ù… Ø§Ù„Ø¹Ø±Ø§ÙØ© Ù‡Ùˆ Ø£Ù‚Ø¯Ù… Ù…Ù…Ø§Ø±Ø³Ø© ÙƒÙ‡Ù†ÙˆØªÙŠØ© Ù…ÙˆØ«Ù‚Ø© ÙÙŠ Ø§Ù„ØµÙŠÙ†ØŒ ØªØ³Ø¨Ù‚ Ø§Ù„Ù€ I Ching ÙÙŠ Ø´ÙƒÙ„Ù‡ Ø§Ù„Ù…ÙƒØªÙˆØ¨. ÙƒØ§Ù† Ø´Ø§Ù…Ø§Ù†Ùˆ Ø£Ø³Ø±Ø© Shang Ø§Ù„Ù…Ù„ÙƒÙŠØ© ÙŠØ­Ø±Ù‚ÙˆÙ† Ø¯Ø±Ø¹ Ø§Ù„Ø³Ù„Ø§Ø­Ù Ø£Ùˆ Ù„ÙˆØ­ ÙƒØªÙ Ø§Ù„Ø«ÙˆØ± ÙˆÙŠÙ‚Ø±Ø¤ÙˆÙ† Ø§Ù„Ø´Ù‚ÙˆÙ‚ Ø§Ù„Ù†Ø§ØªØ¬Ø© Ù„Ù„ØªØ´Ø§ÙˆØ± Ù…Ø¹ Ø§Ù„Ø£Ø³Ù„Ø§Ù Ø­ÙˆÙ„ Ø§Ù„Ù‚Ø±Ø§Ø±Ø§Øª Ø§Ù„Ø¹Ø³ÙƒØ±ÙŠØ© ÙˆØ§Ù„Ø²Ø±Ø§Ø¹ÙŠØ© ÙˆØ§Ù„Ù…Ù†Ø§Ø®ÙŠØ© ÙˆØ§Ù„Ø´Ø®ØµÙŠØ© Ù„Ù„Ù…Ù„Ùƒ.",
    bonesRitualHeading: "Ø§Ù„Ø¹Ù…Ù„ÙŠØ© Ø§Ù„Ø·Ù‚Ø³ÙŠØ©",
    bonesRitualBody:
      "ÙƒØ§Ù†Øª Ø§Ù„Ø¹Ù…Ù„ÙŠØ© Ø¯Ù‚ÙŠÙ‚Ø© ÙˆÙ‚Ø§Ø¨Ù„Ø© Ù„Ù„ØªÙƒØ±Ø§Ø±: ØªÙØµØ§Øº Ø´Ø­Ù†Ø© Ø¥ÙŠØ¬Ø§Ø¨ÙŠØ© ÙˆÙ†Ù‚ÙŠØ¶Ù‡Ø§. ÙŠÙØ·Ø¨Ù‚ Ø¨Ø±ÙˆÙ†Ø² Ù…ØªÙˆÙ‡Ø¬ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ø¸Ù…Ø© Ø­ØªÙ‰ ØªØªØ´ÙƒÙ„ Ø§Ù„Ø´Ù‚ÙˆÙ‚. ÙŠØ­Ø¯Ø¯ Ø§ØªØ¬Ø§Ù‡ Ø§Ù„Ø´Ù‚ÙˆÙ‚ ÙˆØ·ÙˆÙ„Ù‡Ø§ ÙˆÙ†Ù…Ø·Ù‡Ø§ Ø§Ù„Ø­ÙƒÙ…. ÙŠÙÙ†Ù‚Ø´ Ø§Ù„Ù†Ø§ØªØ¬ Ø¹Ù„Ù‰ Ø§Ù„Ø¹Ø¸Ù…Ø© Ù†ÙØ³Ù‡Ø§, Ù…Ø´ÙƒÙ‘Ù„Ø§Ù‹ Ø£Ù‚Ø¯Ù… Ø§Ù„Ø³Ø¬Ù„Ø§Øª Ø§Ù„Ù…ÙƒØªÙˆØ¨Ø© ÙÙŠ Ø§Ù„ØµÙŠÙ†.",
    bonesVerdictsHeading: "Ø§Ù„Ø­Ø§Ù„Ø§Øª Ø§Ù„Ø£Ø±Ø¨Ø¹ Ù„Ù„Ø­ÙƒÙ…",
    bonesVerdictAuspClear:
      "å‰, Ù…Ø¨Ø´Ù‘Ø± Ø¨ÙˆØ¶ÙˆØ­: ÙŠØ¤ÙƒØ¯ Ø§Ù„Ù†Ù…Ø· Ø§Ù„Ø´Ø­Ù†Ø© Ø§Ù„Ø¥ÙŠØ¬Ø§Ø¨ÙŠØ© Ø¯ÙˆÙ† ØºÙ…ÙˆØ¶.",
    bonesVerdictAuspMod:
      "å‰ Ù…Ø¹ØªØ¯Ù„, Ù…Ø¨Ø´Ù‘Ø± Ø¨Ø¯Ø±Ø¬Ø© Ù…Ø¹ØªØ¯Ù„Ø©: Ø§Ù„ØªØ£ÙƒÙŠØ¯ Ù…ÙˆØ¬ÙˆØ¯ Ù„ÙƒÙ† Ù…Ø¹ ÙØ±ÙˆÙ‚ Ø¯Ù‚ÙŠÙ‚Ø© Ø£Ùˆ Ø´Ø±ÙˆØ·.",
    bonesVerdictInauspMod:
      "å‡¶ Ù…Ø¹ØªØ¯Ù„, ØºÙŠØ± Ù…Ø¨Ø´Ù‘Ø± Ø¨Ø¯Ø±Ø¬Ø© Ù…Ø¹ØªØ¯Ù„Ø©: ÙŠÙ…ÙŠÙ„ Ø§Ù„Ù†Ù…Ø· Ù†Ø­Ùˆ Ø§Ù„Ù†ÙÙŠ Ù…Ø¹ ØªØ­ÙØ¸Ø§Øª.",
    bonesVerdictInauspClear:
      "å‡¶, ØºÙŠØ± Ù…Ø¨Ø´Ù‘Ø± Ø¨ÙˆØ¶ÙˆØ­: ÙŠÙ†ÙÙŠ Ø§Ù„Ù†Ù…Ø· Ø§Ù„Ø´Ø­Ù†Ø© Ø§Ù„Ø¥ÙŠØ¬Ø§Ø¨ÙŠØ© Ø¯ÙˆÙ† ØºÙ…ÙˆØ¶.",
    bonesAuthHeading: "Ø£ØµØ§Ù„Ø© Ø§Ù„Ø·Ø±ÙŠÙ‚Ø©",
    bonesAuthBody:
      "ØªÙ… Ø§Ø³ØªØ®Ø±Ø§Ø¬ ÙˆØ¯Ø±Ø§Ø³Ø© Ø£ÙƒØ«Ø± Ù…Ù† 150,000 Ø´Ø¸ÙŠØ© Ù…Ù† Ø¹Ø¸Ø§Ù… Ø§Ù„Ø¹Ø±Ø§ÙØ© Ù…Ù†Ø° Ø§Ù„Ù‚Ø±Ù† Ø§Ù„ØªØ§Ø³Ø¹ Ø¹Ø´Ø±. Ù‡ÙŠ ØªØ±Ø§Ø« Ù…Ø¹ØªØ±Ù Ø¨Ù‡ Ø¯ÙˆÙ„ÙŠØ§Ù‹ ÙˆØªÙØ­ÙØ¸ ÙÙŠ Ù…ØªØ§Ø­Ù ÙÙŠ Ø§Ù„ØµÙŠÙ† ÙˆØªØ§ÙŠÙˆØ§Ù† ÙˆØ§Ù„ÙŠØ§Ø¨Ø§Ù† ÙˆØ£ÙˆØ±ÙˆØ¨Ø§. ØªØ­ØªØ±Ù… Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ù…ÙÙ†ÙÙŽÙ‘Ø°Ø© ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø§Ù„Ù…Ù†Ø·Ù‚ Ø§Ù„Ù‡ÙŠÙƒÙ„ÙŠ Ù„Ù†Ø¸Ø§Ù… Shang: Ø§Ù„Ø´Ø­Ù†Ø© Ø§Ù„Ø¥ÙŠØ¬Ø§Ø¨ÙŠØ©ØŒ Ø§Ù„Ø´Ø­Ù†Ø© Ø§Ù„Ø³Ù„Ø¨ÙŠØ©ØŒ Ø§Ù„Ø­ÙƒÙ… Ø¨Ø§Ù„Ù†Ù…Ø·.",
    yarrowHeading: "Ø¹ÙŠØ¯Ø§Ù† Ø§Ù„Ø²Ù†Ø¨Ù‚ (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "Ø§Ù„Ø£ØµÙˆÙ„ Ø§Ù„ØªØ§Ø±ÙŠØ®ÙŠØ© (~1000 Ù‚Ø¨Ù„ Ø§Ù„Ù…ÙŠÙ„Ø§Ø¯)",
    yarrowOriginBody:
      "Ø·Ø±ÙŠÙ‚Ø© Ø¹ÙŠØ¯Ø§Ù† Ø§Ù„Ø²Ù†Ø¨Ù‚ Ù‡ÙŠ Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø¹Ø±Ø§ÙØ© Ø§Ù„Ù…ÙˆØ«Ù‚ ÙÙŠ I Ching Ù†ÙØ³Ù‡. ÙŠÙØ­Ø¯Ø¯ Ø§Ù„ØªØ¹Ù„ÙŠÙ‚ Ø§Ù„ÙƒØ¨ÙŠØ± (å¤§ä¼ ØŒ DÃ zhuÃ n)ØŒ Ø£Ø­Ø¯ Ø§Ù„Ø¹Ø´Ø± Ø£Ø¬Ù†Ø­Ø©: Â«Ø¹Ø¯Ø¯ Ø§Ù„ØªÙˆØ³Ø¹ Ø§Ù„ÙƒØ¨ÙŠØ± Ù‡Ùˆ Ø®Ù…Ø³ÙˆÙ†ØŒ ÙŠÙØ³ØªØ®Ø¯Ù… Ù…Ù†Ù‡Ø§ ØªØ³Ø¹Ø© ÙˆØ£Ø±Ø¨Ø¹ÙˆÙ†Â». ÙˆÙŠÙØ±ÙˆÙ‰ ÙÙŠ Ø§Ù„Ø£Ù†Ø§Ù„ÙŠÙƒØª Ø£Ù† ÙƒÙˆÙ†ÙÙˆØ´ÙŠÙˆØ³ Ù‚Ø§Ù„ Ø¥Ù†Ù‡ ÙŠØªÙ…Ù†Ù‰ Ø¯Ø±Ø§Ø³Ø© Ø§Ù„ØªØ­ÙˆÙ„Ø§Øª Ø®Ù…Ø³ÙŠÙ† Ø³Ù†Ø©Ø› ÙŠÙÙ‡Ù… Ø§Ù„Ø¹Ù„Ù…Ø§Ø¡ Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠÙˆÙ† Ù‡Ø°Ù‡ Ø§Ù„Ø¥Ø´Ø§Ø±Ø© Ø¥Ù„Ù‰ Ø¹Ø¯Ø¯ 50 ØªÙ„Ù…ÙŠØ­Ø§Ù‹ Ù…Ø¨Ø§Ø´Ø±Ø§Ù‹ Ø¥Ù„Ù‰ Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„Ø¹ÙŠØ¯Ø§Ù†. Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ø£Ù‚Ø¯Ù… Ù…Ù† Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø£Ø³ÙƒØ© Ø§Ù„Ø«Ù„Ø§Ø« Ø¨Ø£ÙƒØ«Ø± Ù…Ù† Ø£Ù„Ù Ø³Ù†Ø©. ÙˆØ«Ù‘Ù‚ Ø±ÙŠØªØ´Ø§Ø±Ø¯ ÙÙŠÙ„Ù‡Ù„Ù… ÙˆÙƒØ§Ø±ÙŠ Ø¨ÙŠØ§Ù†Ø² Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ ÙƒØ§Ù…Ù„Ø§Ù‹ ÙÙŠ Ù…Ù„Ø­Ù‚ ØªØ±Ø¬Ù…ØªÙ‡Ù…Ø§ (Ù…Ø·Ø¨Ø¹Ø© Ø¬Ø§Ù…Ø¹Ø© Ø¨Ø±ÙŠÙ†Ø³ØªÙˆÙ†ØŒ 1950).",
    yarrowProcedureHeading: "Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„ÙÙŠØ²ÙŠØ§Ø¦ÙŠ",
    yarrowProcedureBody:
      "ØªØ³ØªØ®Ø¯Ù… Ø§Ù„Ø·Ø±ÙŠÙ‚Ø© Ù…Ø¬Ù…ÙˆØ¹Ø© Ù…Ù† Ø§Ù„Ø³ÙŠÙ‚Ø§Ù† Ø§Ù„Ù…Ø§Ø¯ÙŠØ© Ø£Ùˆ Ø£Ø´ÙŠØ§Ø¡ Ù…Ø´Ø§Ø¨Ù‡Ø©. ÙŠÙˆØ¶Ø¹ Ø£Ø­Ø¯Ù‡Ø§ Ø¬Ø§Ù†Ø¨Ø§ØŒ ÙˆØªÙÙ‚Ø³Ù‘Ù… Ø§Ù„Ø¨Ù‚ÙŠØ© ÙˆØªÙØ¹Ø¯ Ø¹Ø¨Ø± ØªØ³Ù„Ø³Ù„ Ø·Ù‚Ø³ÙŠ Ù…ØªÙƒØ±Ø± Ø­ØªÙ‰ ØªØªÙƒÙˆÙ‘Ù† Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ø³ØªØ©. Ø§Ù„Ù…Ù‡Ù… Ù„Ù„Ù…Ø³ØªØ®Ø¯Ù… Ù‡Ùˆ Ø§Ù„Ø¥ÙŠÙ‚Ø§Ø¹: ÙÙ‡ÙŠ ØªØ·Ù„Ø¨ Ø§Ù„Ø§Ù†ØªØ¨Ø§Ù‡ ÙˆØ§Ù„Ù„Ù…Ø³ ÙˆØ§Ù„ØµØ¨Ø±ØŒ ÙˆØªØ¬Ø¹Ù„ Ø§Ù„Ø§Ø³ØªØ´Ø§Ø±Ø© Ø£ÙƒØ«Ø± Ø·Ù‚Ø³ÙŠØ© Ù…Ù† Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø«Ù„Ø§Ø«.",
    yarrowProbHeading: "Ø·Ø§Ø¨Ø¹ Ø§Ù„Ø·Ø±ÙŠÙ‚Ø©",
    yarrowProbBody:
      "ØªØ­Ø§ÙØ¸ Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø³ÙŠÙ‚Ø§Ù† Ø¹Ù„Ù‰ Ø¥ÙŠÙ‚Ø§Ø¹ Ø·Ù‚Ø³ÙŠ Ø£Ø¨Ø·Ø£ Ù…Ù† Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø«Ù„Ø§Ø«. ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ù„Ø§ ØªØ¹Ø±Ø¶ Ù‚ÙŠÙ…ØªÙ‡Ø§ ÙƒØ¬Ø¯ÙˆÙ„ ØªÙ‚Ù†ÙŠØŒ Ø¨Ù„ ÙƒØ·Ø±ÙŠÙ‚Ø© Ù…Ø®ØªÙ„ÙØ© Ù„Ù„Ø¯Ø®ÙˆÙ„ ÙÙŠ ØªÙ‚Ù„ÙŠØ¯ Ø§Ù„Ø¢ÙŠ ØªØ´ÙŠÙ†Øº Ù†ÙØ³Ù‡: Ø£ÙƒØ«Ø± Ù„Ù…Ø³Ø§ØŒ ÙˆØ£ÙƒØ«Ø± ØªØ¹Ù…Ø¯Ø§ØŒ ÙˆØ£Ù‚Ø±Ø¨ Ø¥Ù„Ù‰ Ø§Ù„Ø¥Ø¬Ø±Ø§Ø¡ Ø§Ù„ÙƒÙ„Ø§Ø³ÙŠÙƒÙŠ Ø§Ù„Ø°ÙŠ ÙˆØ«Ù‚Ù‡ ÙˆÙŠÙ„Ù‡Ù„Ù…/Ø¨Ø§ÙŠÙ†Ø². ÙˆØªØ¸Ù„ Ø·Ø±ÙŠÙ‚Ø© Ø§Ù„Ø¹Ù…Ù„Ø§Øª Ø§Ù„Ø«Ù„Ø§Ø« ØµØ§Ù„Ø­Ø© Ø¨Ø§Ù„Ù‚Ø¯Ø± Ù†ÙØ³Ù‡ Ù„Ù„Ø§Ø³ØªØ´Ø§Ø±Ø© Ø§Ù„Ø£Ø³Ø±Ø¹.",
    interpretHeading: "Ù„Ù…Ø§Ø°Ø§ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ù„Ø§ ÙŠØ®ØªØ±Ø¹",
    interpretBody:
      "Ù„Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ ÙÙŠ Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ ÙˆØ¸ÙŠÙØ© Ù…Ø­Ø¯Ø¯Ø© ÙˆÙ…Ø­Ø¯ÙˆØ¯Ø©: Ø£Ø®Ø° Ù†ØªÙŠØ¬Ø© Ø§Ù„Ø®ÙˆØ§Ø±Ø²Ù…ÙŠØ©, Ø§Ù„ØºØ±Ø¶ØŒ Ø§Ù„Ø®Ø·ÙˆØ· Ø§Ù„Ù…ØªØ­Ø±ÙƒØ©ØŒ Ø­ÙƒÙ… Ø§Ù„Ø´Ù‚ÙˆÙ‚, ÙˆØµÙŠØ§ØºØªÙ‡Ø§ Ø¨Ù„ØºØ© Ø·Ø¨ÙŠØ¹ÙŠØ© ÙÙŠ Ù„ØºØ© Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù…ØŒ Ù…Ø¹ Ø³ÙŠØ§Ù‚ Ø³Ø¤Ø§Ù„Ù‡. Ù„Ø§ ÙŠÙÙˆÙ„Ù‘Ø¯ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ø£ØºØ±Ø§Ø¶Ø§Ù‹ØŒ ÙˆÙ„Ø§ ÙŠÙ‚Ø±Ø± Ø£Ø­ÙƒØ§Ù…Ø§Ù‹ØŒ ÙˆÙ„Ø§ ÙŠØ¹Ø¯Ù‘Ù„ Ù†ØµÙˆØµ Wilhelm Ø£Ùˆ Ø£Ù†Ù…Ø§Ø· Ø·Ø±ÙŠÙ‚Ø© Shang. Ø§Ù„Ø®ÙˆØ§Ø±Ø²Ù…ÙŠØ© Ø§Ù„Ø±ÙŠØ§Ø¶ÙŠØ© ØªÙØ¹Ù„ Ø°Ù„Ùƒ Ø¨Ø£Ù…Ø§Ù†Ø© Ù‚Ø¨Ù„ Ø£Ù† ÙŠØªØ¯Ø®Ù„ Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ. Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ù‡Ùˆ Ø§Ù„Ù…ÙØ³Ø±. Ø§Ù„Ø¹Ø±Ø§ÙØ© Ù‡ÙŠ Ø§Ù„Ø·Ø±ÙŠÙ‚Ø©.",
    sourcesHeading: "Ø§Ù„Ù…ØµØ§Ø¯Ø± ÙˆØ§Ù„Ù…Ø±Ø§Ø¬Ø¹",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
  hi: {
    title: "à¤µà¤¿à¤§à¤¿ à¤¨à¥‹à¤Ÿà¥à¤¸ à¤”à¤° à¤‰à¤¤à¥à¤ªà¤¤à¥à¤¤à¤¿",
    lead: "à¤¯à¤¹ à¤ªà¥ƒà¤·à¥à¤  à¤¤à¤•à¤¨à¥€à¤•à¥€-à¤¸à¤¾à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤¿à¤• à¤¸à¤‚à¤¦à¤°à¥à¤­ à¤¹à¥ˆà¥¤ à¤¯à¤¹ à¤‰à¤ªà¤¯à¥‹à¤— à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¿à¤•à¤¾ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤",
    authNotice:
      "à¤‡à¤¸ à¤à¤ª à¤®à¥‡à¤‚ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¥€ à¤œà¤¾à¤¨à¥‡ à¤µà¤¾à¤²à¥€ à¤¸à¤­à¥€ à¤µà¤¿à¤§à¤¿à¤¯à¤¾à¤‚ à¤šà¥€à¤¨à¥€ à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤à¤¿ à¤•à¥€ à¤¹à¤œà¤¾à¤°à¥‹à¤‚ à¤¸à¤¾à¤² à¤ªà¥à¤°à¤¾à¤¨à¥€ à¤ªà¤°à¤‚à¤ªà¤°à¤¾à¤“à¤‚ à¤¸à¥‡ à¤†à¤¤à¥€ à¤¹à¥ˆà¤‚, à¤œà¥‹ à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤°à¥‚à¤ª à¤¸à¥‡ à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼à¥€à¤•à¥ƒà¤¤ à¤”à¤° à¤¦à¥à¤¨à¤¿à¤¯à¤¾ à¤­à¤° à¤®à¥‡à¤‚ à¤¶à¥ˆà¤•à¥à¤·à¤£à¤¿à¤• à¤°à¥‚à¤ª à¤¸à¥‡ à¤¸à¤®à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤¹à¥ˆà¤‚à¥¤ à¤¯à¤¹ à¤à¤ª à¤•à¥‹à¤ˆ à¤µà¥à¤¯à¤¾à¤–à¥à¤¯à¤¾ à¤¨à¤¹à¥€à¤‚ à¤¬à¤¨à¤¾à¤¤à¤¾ à¤”à¤° à¤¨ à¤¹à¥€ à¤…à¤ªà¤¨à¥‡ à¤–à¥à¤¦ à¤•à¥‡ à¤…à¤°à¥à¤¥ à¤‰à¤¤à¥à¤ªà¤¨à¥à¤¨ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ, à¤¯à¤¹ à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾ à¤•à¥€ à¤­à¤¾à¤·à¤¾ à¤®à¥‡à¤‚ à¤ªà¤¹à¥à¤‚à¤š à¤¯à¥‹à¤—à¥à¤¯ à¤¬à¤¨à¤¾à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤•à¥ƒà¤¤à¥à¤°à¤¿à¤® à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾ à¤•à¥€ à¤¸à¤¹à¤¾à¤¯à¤¤à¤¾ à¤¸à¥‡ à¤ªà¥à¤°à¤¾à¤®à¤¾à¤£à¤¿à¤• à¤µà¤¿à¤§à¤¿à¤¯à¥‹à¤‚ à¤•à¥‹ à¤²à¤¾à¤—à¥‚ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤ à¤•à¥‹à¤ˆ à¤­à¥€ à¤ªà¤¾à¤ à¤• à¤‡à¤¸ à¤ªà¥ƒà¤·à¥à¤  à¤•à¥‡ à¤…à¤‚à¤¤ à¤®à¥‡à¤‚ à¤¸à¥‚à¤šà¥€à¤¬à¤¦à¥à¤§ à¤®à¥‚à¤² à¤¸à¥à¤°à¥‹à¤¤à¥‹à¤‚ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤—à¥à¤°à¤‚à¤¥à¥‹à¤‚ à¤•à¥€ à¤¤à¥à¤²à¤¨à¤¾ à¤•à¤° à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    ichingHeading: "à¤†à¤ˆ à¤šà¤¿à¤‚à¤— (å‘¨æ˜“ Â· Zhouyi)",
    ichingOriginHeading: "à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤‰à¤¤à¥à¤ªà¤¤à¥à¤¤à¤¿ (à¤²à¤—à¤­à¤— 1000 à¤ˆà¤¸à¤¾ à¤ªà¥‚à¤°à¥à¤µ)",
    ichingOriginBody:
      "à¤à¥‹à¤Šà¤¯à¥€, 'à¤à¥‹à¤Š à¤•à¥‡ à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨', à¤®à¤¾à¤¨à¤µà¤¤à¤¾ à¤•à¥‡ à¤¸à¤¬à¤¸à¥‡ à¤ªà¥à¤°à¤¾à¤šà¥€à¤¨ à¤—à¥à¤°à¤‚à¤¥à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¸à¥‡ à¤à¤• à¤¹à¥ˆà¥¤ à¤‡à¤¸à¤•à¥€ à¤œà¤¡à¤¼à¥‡à¤‚ à¤à¥‹à¤Š à¤°à¤¾à¤œà¤µà¤‚à¤¶ (1046â€“256 à¤ˆà¤¸à¤¾ à¤ªà¥‚à¤°à¥à¤µ) à¤¤à¤• à¤œà¤¾à¤¤à¥€ à¤¹à¥ˆà¤‚, à¤¹à¤¾à¤²à¤¾à¤‚à¤•à¤¿ à¤‡à¤¸à¤•à¤¾ à¤­à¤µà¤¿à¤·à¥à¤¯à¤µà¤¾à¤£à¥€ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤‡à¤¸à¤¸à¥‡ à¤­à¥€ à¤ªà¤¹à¤²à¥‡ à¤•à¤¾ à¤¹à¥ˆà¥¤ à¤¯à¤¹ à¤ªà¤¾à¤  à¤µà¤¿à¤­à¤¿à¤¨à¥à¤¨ à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤ªà¤°à¤¤à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¬à¤¨à¤¾à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¥à¤¾: à¤°à¤¾à¤œà¤¾ à¤µà¥‡à¤¨ à¤¨à¥‡ à¤•à¥ˆà¤¦ à¤®à¥‡à¤‚ à¤°à¤¹à¤¤à¥‡ à¤¹à¥à¤ 64 à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤® à¤•à¤¾ à¤†à¤¯à¥‹à¤œà¤¨ à¤•à¤¿à¤¯à¤¾ à¤”à¤° à¤¨à¤¿à¤°à¥à¤£à¤¯ (å¦è¾ž, guÃ cÃ­) à¤²à¤¿à¤–à¥‡à¥¤ à¤‰à¤¨à¤•à¥‡ à¤ªà¥à¤¤à¥à¤° à¤à¥‹à¤Š à¤•à¥‡ à¤¡à¥à¤¯à¥‚à¤• à¤¨à¥‡ à¤›à¤¹ à¤°à¥‡à¤–à¤¾à¤“à¤‚ à¤•à¥‡ à¤µà¤¾à¤•à¥à¤¯ (çˆ»è¾ž, yÃ¡ocÃ­) à¤œà¥‹à¤¡à¤¼à¥‡à¥¤ à¤¸à¤¦à¤¿à¤¯à¥‹à¤‚ à¤¬à¤¾à¤¦, à¤•à¤¨à¥à¤«à¥à¤¯à¥‚à¤¶à¤¿à¤¯à¤¸ à¤”à¤° à¤‰à¤¨à¤•à¥‡ à¤¶à¤¿à¤·à¥à¤¯à¥‹à¤‚ à¤¨à¥‡ à¤¦à¤¸ à¤ªà¤‚à¤–à¥‹à¤‚ (åç¿¼) à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤œà¤¾à¤¨à¥‡ à¤œà¤¾à¤¨à¥‡ à¤µà¤¾à¤²à¥‡ à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¤¿à¤¯à¤¾à¤‚ à¤œà¥‹à¤¡à¤¼à¥€à¤‚, à¤œà¥‹ à¤ªà¤¾à¤  à¤•à¥€ à¤¸à¤¬à¤¸à¥‡ à¤—à¤¹à¤°à¥€ à¤¦à¤¾à¤°à¥à¤¶à¤¨à¤¿à¤• à¤ªà¤°à¤¤ à¤¹à¥ˆà¥¤",
    ichingHexHeading: "64 à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤® à¤ªà¥à¤°à¤£à¤¾à¤²à¥€",
    ichingHexBody:
      "à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤® à¤›à¤¹ à¤°à¥‡à¤–à¤¾à¤“à¤‚ à¤•à¥€ à¤à¤• à¤†à¤•à¥ƒà¤¤à¤¿ à¤¹à¥ˆ, à¤ªà¥à¤°à¤¤à¥à¤¯à¥‡à¤• à¤¯à¤¿à¤¨ (à¤Ÿà¥‚à¤Ÿà¥€ à¤¹à¥à¤ˆ, à¤—à¥à¤°à¤¹à¤£à¤¶à¥€à¤²) à¤¯à¤¾ à¤¯à¤¾à¤‚à¤— (à¤…à¤–à¤‚à¤¡, à¤¸à¤•à¥à¤°à¤¿à¤¯)à¥¤ 64 à¤¸à¤‚à¤­à¤¾à¤µà¤¿à¤¤ à¤¸à¤‚à¤¯à¥‹à¤œà¤¨ à¤ªà¥à¤°à¤•à¥ƒà¤¤à¤¿ à¤”à¤° à¤®à¤¾à¤¨à¤µ à¤œà¥€à¤µà¤¨ à¤®à¥‡à¤‚ à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨ à¤•à¥‡ à¤®à¥Œà¤²à¤¿à¤• à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤•à¤¾ à¤µà¤°à¥à¤£à¤¨ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤—à¤¤à¤¿à¤¶à¥€à¤² à¤°à¥‡à¤–à¤¾à¤à¤‚ à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨ à¤•à¤¾ à¤¸à¤‚à¤•à¥‡à¤¤ à¤¦à¥‡à¤¤à¥€ à¤¹à¥ˆà¤‚: à¤µà¤°à¥à¤¤à¤®à¤¾à¤¨ à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤® à¤à¤• à¤­à¤µà¤¿à¤·à¥à¤¯ à¤•à¥‡ à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤® à¤®à¥‡à¤‚ à¤¬à¤¦à¤² à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆ, à¤”à¤° à¤µà¤¹ à¤¸à¤‚à¤•à¥à¤°à¤®à¤£ à¤ªà¤¾à¤ à¤¨ à¤•à¤¾ à¤•à¥‡à¤‚à¤¦à¥à¤° à¤¹à¥ˆà¥¤",
    ichingMethodHeading: "à¤¤à¥€à¤¨ à¤¸à¤¿à¤•à¥à¤•à¥‹à¤‚ à¤•à¥€ à¤µà¤¿à¤§à¤¿ à¤”à¤° Zhu Xi à¤•à¥‡ à¤¨à¤¿à¤¯à¤®",
    ichingMethodBody:
      "à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€à¤¯ à¤µà¤¿à¤§à¤¿ à¤¤à¥€à¤¨ à¤¸à¤¿à¤•à¥à¤•à¥‹à¤‚ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¤¤à¥€ à¤¹à¥ˆ à¤œà¤¿à¤¨à¥à¤¹à¥‡à¤‚ à¤›à¤¹ à¤¬à¤¾à¤° à¤«à¥‡à¤‚à¤•à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆ à¤¤à¤¾à¤•à¤¿ à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤® à¤à¤•-à¤à¤• à¤°à¥‡à¤–à¤¾ à¤¬à¤¨à¤¾à¤¯à¤¾ à¤œà¤¾ à¤¸à¤•à¥‡à¥¤ à¤œà¤¬ à¤•à¤ˆ à¤°à¥‡à¤–à¤¾à¤à¤‚ à¤¬à¤¦à¤²à¤¤à¥€ à¤¹à¥ˆà¤‚, à¤¤à¥‹ Zhu Xi à¤¸à¥à¤•à¥‚à¤² (à¤¨à¤µ-à¤•à¤¨à¥à¤«à¥à¤¯à¥‚à¤¶à¥€à¤µà¤¾à¤¦, 12à¤µà¥€à¤‚ à¤¸à¤¦à¥€ à¤ˆ.) à¤¸à¤Ÿà¥€à¤• à¤¨à¤¿à¤¯à¤® à¤¸à¥à¤¥à¤¾à¤ªà¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆ à¤œà¥‹ à¤¯à¤¹ à¤¨à¤¿à¤°à¥à¤§à¤¾à¤°à¤¿à¤¤ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚ à¤•à¤¿ à¤•à¥Œà¤¨ à¤¸à¥€ à¤°à¥‡à¤–à¤¾ à¤ªà¤¾à¤ à¤¨ à¤•à¥‹ à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤¿à¤¤ à¤•à¤°à¤¤à¥€ à¤¹à¥ˆ, à¤µà¥à¤¯à¤¾à¤–à¥à¤¯à¤¾à¤¤à¥à¤®à¤• à¤…à¤¸à¥à¤ªà¤·à¥à¤Ÿà¤¤à¤¾ à¤•à¥‹ à¤¸à¤®à¤¾à¤ªà¥à¤¤ à¤•à¤°à¤¤à¥‡ à¤¹à¥à¤à¥¤ à¤¯à¤¹ à¤à¤ª à¤¬à¤¿à¤¨à¤¾ à¤•à¤¿à¤¸à¥€ à¤¸à¤‚à¤¶à¥‹à¤§à¤¨ à¤•à¥‡ à¤‰à¤¨ à¤¨à¤¿à¤¯à¤®à¥‹à¤‚ à¤•à¥‹ à¤¸à¤Ÿà¥€à¤• à¤°à¥‚à¤ª à¤¸à¥‡ à¤²à¤¾à¤—à¥‚ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    ichingWilhelmHeading: "Wilhelm/Baynes à¤…à¤¨à¥à¤µà¤¾à¤¦",
    ichingWilhelmBody:
      "à¤œà¤°à¥à¤®à¤¨ à¤šà¥€à¤¨à¥€ à¤µà¤¿à¤¦à¥à¤µà¤¾à¤¨ à¤°à¤¿à¤šà¤°à¥à¤¡ à¤µà¤¿à¤²à¥à¤¹à¥‡à¤® à¤¦à¤¶à¤•à¥‹à¤‚ à¤¤à¤• à¤šà¥€à¤¨ à¤®à¥‡à¤‚ à¤°à¤¹à¥‡ à¤”à¤° 1924 à¤®à¥‡à¤‚ à¤ªà¤¶à¥à¤šà¤¿à¤®à¥€ à¤­à¤¾à¤·à¤¾à¤“à¤‚ à¤®à¥‡à¤‚ I Ching à¤•à¤¾ à¤¸à¤¬à¤¸à¥‡ à¤ªà¥‚à¤°à¥à¤£ à¤”à¤° à¤¸à¤®à¥à¤®à¤¾à¤¨à¤¿à¤¤ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤ªà¥à¤°à¤¸à¥à¤¤à¥à¤¤ à¤•à¤¿à¤¯à¤¾, à¤œà¤¿à¤¸à¤®à¥‡à¤‚ à¤¨à¤¿à¤°à¥à¤£à¤¯, à¤°à¥‡à¤–à¤¾à¤à¤‚ à¤”à¤° à¤¦à¤¸ à¤ªà¤‚à¤–à¥‹à¤‚ à¤•à¥€ à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¤¿à¤¯à¤¾à¤‚ à¤¶à¤¾à¤®à¤¿à¤² à¤¹à¥ˆà¤‚à¥¤ Cary Baynes à¤¨à¥‡ à¤‡à¤¸à¥‡ 1950 à¤®à¥‡à¤‚ à¤…à¤‚à¤—à¥à¤°à¥‡à¤œà¥€ à¤®à¥‡à¤‚ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤•à¤¿à¤¯à¤¾à¥¤ à¤¯à¤¹ à¤•à¤¾à¤°à¥à¤¯ 2020 à¤®à¥‡à¤‚ à¤¸à¤¾à¤°à¥à¤µà¤œà¤¨à¤¿à¤• à¤¡à¥‹à¤®à¥‡à¤¨ à¤®à¥‡à¤‚ à¤† à¤—à¤¯à¤¾ à¤”à¤° à¤‡à¤¸ à¤à¤ª à¤•à¤¾ à¤†à¤§à¤¾à¤° à¤ªà¤¾à¤  à¤¹à¥ˆ, à¤¬à¤¿à¤¨à¤¾ à¤•à¤¿à¤¸à¥€ à¤¸à¤‚à¤¶à¥‹à¤§à¤¨ à¤¯à¤¾ à¤¸à¤°à¤²à¥€à¤•à¤°à¤£ à¤•à¥‡à¥¤",
    ichingLeggeHeading: "à¤œà¥‡à¤®à¥à¤¸ à¤²à¥‡à¤— à¤…à¤¨à¥à¤µà¤¾à¤¦",
    ichingLeggeBody:
      "à¤à¤• à¤¸à¥à¤•à¥‰à¤Ÿà¤¿à¤¶ à¤®à¤¿à¤¶à¤¨à¤°à¥€ à¤”à¤° à¤šà¥€à¤¨à¤µà¤¿à¤œà¥à¤žà¤¾à¤¨à¥€ à¤œà¥‡à¤®à¥à¤¸ à¤²à¥‡à¤— à¤¨à¥‡ 1882 à¤®à¥‡à¤‚ à¤…à¤ªà¤¨à¥‡ à¤¸à¥à¤®à¤¾à¤°à¤•à¥€à¤¯ à¤•à¤¾à¤°à¥à¤¯ 'à¤¦ à¤¸à¥‡à¤•à¥à¤°à¥‡à¤¡ à¤¬à¥à¤•à¥à¤¸ à¤‘à¤« à¤¦ à¤ˆà¤¸à¥à¤Ÿ' à¤•à¥‡ à¤¹à¤¿à¤¸à¥à¤¸à¥‡ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤†à¤ˆ à¤šà¤¿à¤‚à¤— à¤•à¤¾ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤•à¤¿à¤¯à¤¾à¥¤ à¤‰à¤¨à¤•à¤¾ à¤¦à¥ƒà¤·à¥à¤Ÿà¤¿à¤•à¥‹à¤£ à¤•à¤¡à¤¼à¤¾à¤ˆ à¤¸à¥‡ à¤­à¤¾à¤·à¤¾à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€à¤¯ à¤”à¤° à¤¶à¥ˆà¤•à¥à¤·à¤£à¤¿à¤• à¤¥à¤¾, à¤œà¥‹ à¤•à¤¨à¥à¤«à¥à¤¯à¥‚à¤¶à¤¿à¤¯à¤¸ à¤”à¤° à¤ªà¥‚à¤°à¥à¤µ-à¤•à¤¨à¥à¤«à¥à¤¯à¥‚à¤¶à¤¿à¤¯à¤¸ à¤—à¥à¤°à¤‚à¤¥à¥‹à¤‚ à¤•à¥‡ à¤¶à¤¾à¤¬à¥à¤¦à¤¿à¤• à¤…à¤°à¥à¤¥ à¤•à¥‹ à¤¸à¤®à¤à¤¨à¥‡ à¤•à¥€ à¤•à¥‹à¤¶à¤¿à¤¶ à¤•à¤° à¤°à¤¹à¤¾ à¤¥à¤¾à¥¤ à¤‰à¤¨à¤•à¤¾ à¤¸à¤‚à¤¸à¥à¤•à¤°à¤£ à¤à¤• à¤…à¤®à¥‚à¤²à¥à¤¯ à¤µà¥à¤¯à¤¾à¤–à¥à¤¯à¤¾à¤¤à¥à¤®à¤• à¤•à¤ à¥‹à¤°à¤¤à¤¾ à¤²à¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    ichingZhouyiHeading: "à¤®à¥‚à¤² à¤à¥‹à¤‰ à¤¯à¥€ à¤ªà¤¾à¤ ",
    ichingZhouyiBody:
      "à¤®à¥‚à¤² à¤à¥‹à¤‰ à¤¯à¥€ (à¤¶à¤¾à¤¬à¥à¤¦à¤¿à¤• à¤°à¥‚à¤ª à¤¸à¥‡ 'à¤à¥‹à¤‰ à¤•à¥‡ à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨') à¤†à¤ˆ à¤šà¤¿à¤‚à¤— à¤•à¤¾ à¤®à¥‚à¤² à¤¹à¥ˆ, à¤œà¥‹ 64 à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤®, à¤°à¤¾à¤œà¤¾ à¤µà¥‡à¤¨ à¤•à¥‡ à¤¨à¤¿à¤°à¥à¤£à¤¯à¥‹à¤‚ à¤”à¤° à¤¡à¥à¤¯à¥‚à¤• à¤‘à¤« à¤à¥‹à¤‰ à¤•à¥€ à¤ªà¤‚à¤•à¥à¤¤à¤¿à¤¯à¥‹à¤‚ à¤¸à¥‡ à¤¬à¤¨à¤¾ à¤¹à¥ˆ, à¤¬à¤¿à¤¨à¤¾ à¤¬à¤¾à¤¦ à¤•à¥€ à¤•à¤¨à¥à¤«à¥à¤¯à¥‚à¤¶à¤¿à¤¯à¤¸ à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¤¿à¤¯à¥‹à¤‚ (à¤¦à¤¸ à¤ªà¤‚à¤–à¥‹à¤‚) à¤•à¥‡à¥¤ à¤¯à¤¹ à¤¸à¥à¤°à¥‹à¤¤ à¤¦à¥ˆà¤µà¤œà¥à¤ž à¤•à¥€ à¤“à¤à¤¾ à¤”à¤° à¤¸à¤¬à¤¸à¥‡ à¤ªà¥à¤°à¤¾à¤¨à¥€ à¤ªà¤°à¤¤ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¸à¥€à¤§à¤¾ à¤¸à¤‚à¤¬à¤‚à¤§ à¤¬à¤¨à¤¾à¤¨à¥‡ à¤•à¥€ à¤…à¤¨à¥à¤®à¤¤à¤¿ à¤¦à¥‡à¤¤à¤¾ à¤¹à¥ˆã€‚",
    ichingChainHeading: "à¤ªà¥à¤°à¤¾à¤®à¤¾à¤£à¤¿à¤•à¤¤à¤¾ à¤•à¥€ à¤¶à¥à¤°à¥ƒà¤‚à¤–à¤²à¤¾",
    ichingChain:
      "à¤®à¥‚à¤² Zhou Yi (à¤à¥‹à¤Š à¤°à¤¾à¤œà¤µà¤‚à¤¶) â†’ à¤•à¤¨à¥à¤«à¥à¤¯à¥‚à¤¶à¤¿à¤¯à¤¸ à¤•à¥€ à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¤¿à¤¯à¤¾à¤‚ (5à¤µà¥€à¤‚ à¤¸à¤¦à¥€ à¤ˆà¤¸à¤¾ à¤ªà¥‚à¤°à¥à¤µ) â†’ Zhu Xi à¤•à¥‡ à¤¨à¤¿à¤¯à¤® (12à¤µà¥€à¤‚ à¤¸à¤¦à¥€) â†’ Wilhelm à¤•à¤¾ à¤œà¤°à¥à¤®à¤¨ à¤…à¤¨à¥à¤µà¤¾à¤¦ (1924) â†’ Baynes à¤•à¤¾ à¤…à¤‚à¤—à¥à¤°à¥‡à¤œà¥€ à¤…à¤¨à¥à¤µà¤¾à¤¦ (1950) â†’ à¤¸à¤¾à¤°à¥à¤µà¤œà¤¨à¤¿à¤• à¤¡à¥‹à¤®à¥‡à¤¨ (2020) â†’ à¤¯à¤¹ à¤à¤ªà¥¤",
    bonesHeading: "à¤¦à¥ˆà¤µà¤œà¥à¤ž à¤¹à¤¡à¥à¤¡à¤¿à¤¯à¤¾à¤‚ (ç”²éª¨ Â· JiÇŽgÇ”)",
    bonesOriginHeading:
      "à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤‰à¤¤à¥à¤ªà¤¤à¥à¤¤à¤¿ (à¤¶à¤¾à¤‚à¤— à¤°à¤¾à¤œà¤µà¤‚à¤¶, à¤²à¤—à¤­à¤— 1600â€“1046 à¤ˆà¤¸à¤¾ à¤ªà¥‚à¤°à¥à¤µ)",
    bonesOriginBody:
      "à¤¦à¥ˆà¤µà¤œà¥à¤ž à¤¹à¤¡à¥à¤¡à¥€ à¤­à¤µà¤¿à¤·à¥à¤¯à¤µà¤¾à¤£à¥€ à¤šà¥€à¤¨ à¤•à¥€ à¤¸à¤¬à¤¸à¥‡ à¤ªà¥à¤°à¤¾à¤¨à¥€ à¤¦à¤¸à¥à¤¤à¤¾à¤µà¥‡à¤œà¤¼à¥€à¤•à¥ƒà¤¤ à¤­à¤µà¤¿à¤·à¥à¤¯à¤µà¤¾à¤£à¥€ à¤ªà¥à¤°à¤¥à¤¾ à¤¹à¥ˆ, à¤œà¥‹ I Ching à¤¸à¥‡ à¤­à¥€ à¤ªà¤¹à¤²à¥‡ à¤•à¥€ à¤¹à¥ˆà¥¤ à¤¶à¤¾à¤‚à¤— à¤°à¤¾à¤œà¤µà¤‚à¤¶ à¤•à¥‡ à¤¶à¤¾à¤¹à¥€ à¤“à¤à¤¾à¤“à¤‚ à¤¨à¥‡ à¤•à¤›à¥à¤ à¤•à¥€ à¤›à¤¾à¤¤à¥€ à¤•à¥€ à¤¹à¤¡à¥à¤¡à¥€ à¤¯à¤¾ à¤¬à¥ˆà¤² à¤•à¥‡ à¤•à¤‚à¤§à¥‡ à¤•à¥€ à¤¹à¤¡à¥à¤¡à¥€ à¤•à¥‹ à¤œà¤²à¤¾à¤¯à¤¾ à¤”à¤° à¤ªà¤°à¤¿à¤£à¤¾à¤®à¥€ à¤¦à¤°à¤¾à¤°à¥‹à¤‚ à¤•à¥‹ à¤ªà¤¢à¤¼à¤•à¤° à¤°à¤¾à¤œà¤¾ à¤•à¥‡ à¤¸à¥ˆà¤¨à¥à¤¯, à¤•à¥ƒà¤·à¤¿, à¤œà¤²à¤µà¤¾à¤¯à¥ à¤”à¤° à¤µà¥à¤¯à¤•à¥à¤¤à¤¿à¤—à¤¤ à¤¨à¤¿à¤°à¥à¤£à¤¯à¥‹à¤‚ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤ªà¥‚à¤°à¥à¤µà¤œà¥‹à¤‚ à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤•à¤¿à¤¯à¤¾à¥¤",
    bonesRitualHeading: "à¤…à¤¨à¥à¤·à¥à¤ à¤¾à¤¨ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾",
    bonesRitualBody:
      "à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤¸à¤Ÿà¥€à¤• à¤”à¤° à¤¦à¥‹à¤¹à¤°à¤¾à¤¨à¥‡ à¤¯à¥‹à¤—à¥à¤¯ à¤¥à¥€: à¤à¤• à¤¸à¤•à¤¾à¤°à¤¾à¤¤à¥à¤®à¤• à¤ªà¥à¤°à¤¸à¥à¤¤à¤¾à¤µ à¤”à¤° à¤‰à¤¸à¤•à¤¾ à¤–à¤‚à¤¡à¤¨ à¤¤à¥ˆà¤¯à¤¾à¤° à¤•à¤¿à¤¯à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¥à¤¾à¥¤ à¤¹à¤¡à¥à¤¡à¥€ à¤ªà¤° à¤¤à¤ªà¥à¤¤ à¤•à¤¾à¤‚à¤¸à¥‡ à¤•à¥‹ à¤¤à¤¬ à¤¤à¤• à¤²à¤—à¤¾à¤¯à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¥à¤¾ à¤œà¤¬ à¤¤à¤• à¤¦à¤°à¤¾à¤°à¥‡à¤‚ à¤¨ à¤¬à¤¨ à¤œà¤¾à¤à¤‚à¥¤ à¤¦à¤°à¤¾à¤°à¥‹à¤‚ à¤•à¥€ à¤¦à¤¿à¤¶à¤¾, à¤²à¤‚à¤¬à¤¾à¤ˆ à¤”à¤° à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤¨à¤¿à¤°à¥à¤§à¤¾à¤°à¤¿à¤¤ à¤•à¤°à¤¤à¤¾ à¤¥à¤¾à¥¤ à¤ªà¤°à¤¿à¤£à¤¾à¤® à¤¹à¤¡à¥à¤¡à¥€ à¤ªà¤° à¤¹à¥€ à¤‰à¤•à¥‡à¤°à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¥à¤¾, à¤œà¥‹ à¤šà¥€à¤¨ à¤•à¥‡ à¤¸à¤¬à¤¸à¥‡ à¤ªà¥à¤°à¤¾à¤¨à¥‡ à¤²à¤¿à¤–à¤¿à¤¤ à¤…à¤­à¤¿à¤²à¥‡à¤– à¤¬à¤¨à¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    bonesVerdictsHeading: "à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤•à¥€ à¤šà¤¾à¤° à¤…à¤µà¤¸à¥à¤¥à¤¾à¤à¤‚",
    bonesVerdictAuspClear:
      "å‰, à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤°à¥‚à¤ª à¤¸à¥‡ à¤¶à¥à¤­: à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¬à¤¿à¤¨à¤¾ à¤•à¤¿à¤¸à¥€ à¤¸à¤‚à¤¦à¥‡à¤¹ à¤•à¥‡ à¤¸à¤•à¤¾à¤°à¤¾à¤¤à¥à¤®à¤• à¤ªà¥à¤°à¤¸à¥à¤¤à¤¾à¤µ à¤•à¥€ à¤ªà¥à¤·à¥à¤Ÿà¤¿ à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    bonesVerdictAuspMod:
      "å‰ à¤®à¤§à¥à¤¯à¤®, à¤®à¤§à¥à¤¯à¤® à¤°à¥‚à¤ª à¤¸à¥‡ à¤¶à¥à¤­: à¤ªà¥à¤·à¥à¤Ÿà¤¿ à¤®à¥Œà¤œà¥‚à¤¦ à¤¹à¥ˆ à¤²à¥‡à¤•à¤¿à¤¨ à¤¬à¤¾à¤°à¥€à¤•à¤¿à¤¯à¥‹à¤‚ à¤¯à¤¾ à¤¶à¤°à¥à¤¤à¥‹à¤‚ à¤•à¥‡ à¤¸à¤¾à¤¥à¥¤",
    bonesVerdictInauspMod:
      "å‡¶ à¤®à¤§à¥à¤¯à¤®, à¤®à¤§à¥à¤¯à¤® à¤°à¥‚à¤ª à¤¸à¥‡ à¤…à¤¶à¥à¤­: à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤†à¤°à¤•à¥à¤·à¤£à¥‹à¤‚ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¨à¤•à¤¾à¤°à¤¾à¤¤à¥à¤®à¤•à¤¤à¤¾ à¤•à¥€ à¤“à¤° à¤à¥à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    bonesVerdictInauspClear:
      "å‡¶, à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤°à¥‚à¤ª à¤¸à¥‡ à¤…à¤¶à¥à¤­: à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¬à¤¿à¤¨à¤¾ à¤•à¤¿à¤¸à¥€ à¤¸à¤‚à¤¦à¥‡à¤¹ à¤•à¥‡ à¤¸à¤•à¤¾à¤°à¤¾à¤¤à¥à¤®à¤• à¤ªà¥à¤°à¤¸à¥à¤¤à¤¾à¤µ à¤•à¥‹ à¤¨à¤•à¤¾à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    bonesAuthHeading: "à¤µà¤¿à¤§à¤¿ à¤•à¥€ à¤ªà¥à¤°à¤¾à¤®à¤¾à¤£à¤¿à¤•à¤¤à¤¾",
    bonesAuthBody:
      "19à¤µà¥€à¤‚ à¤¸à¤¦à¥€ à¤¸à¥‡ 1,50,000 à¤¸à¥‡ à¤…à¤§à¤¿à¤• à¤¦à¥ˆà¤µà¤œà¥à¤ž à¤¹à¤¡à¥à¤¡à¥€ à¤•à¥‡ à¤Ÿà¥à¤•à¤¡à¤¼à¥‹à¤‚ à¤•à¥€ à¤–à¥à¤¦à¤¾à¤ˆ à¤”à¤° à¤…à¤§à¥à¤¯à¤¯à¤¨ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾ à¤¹à¥ˆà¥¤ à¤µà¥‡ à¤…à¤‚à¤¤à¤°à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¥€à¤¯ à¤¸à¥à¤¤à¤° à¤ªà¤° à¤®à¤¾à¤¨à¥à¤¯à¤¤à¤¾ à¤ªà¥à¤°à¤¾à¤ªà¥à¤¤ à¤µà¤¿à¤°à¤¾à¤¸à¤¤ à¤¹à¥ˆà¤‚ à¤”à¤° à¤šà¥€à¤¨, à¤¤à¤¾à¤‡à¤µà¤¾à¤¨, à¤œà¤¾à¤ªà¤¾à¤¨ à¤”à¤° à¤¯à¥‚à¤°à¥‹à¤ª à¤•à¥‡ à¤¸à¤‚à¤—à¥à¤°à¤¹à¤¾à¤²à¤¯à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¸à¤‚à¤°à¤•à¥à¤·à¤¿à¤¤ à¤¹à¥ˆà¤‚à¥¤ à¤‡à¤¸ à¤à¤ª à¤®à¥‡à¤‚ à¤²à¤¾à¤—à¥‚ à¤µà¤¿à¤§à¤¿ à¤¶à¤¾à¤‚à¤— à¤ªà¥à¤°à¤£à¤¾à¤²à¥€ à¤•à¥‡ à¤¸à¤‚à¤°à¤šà¤¨à¤¾à¤¤à¥à¤®à¤• à¤¤à¤°à¥à¤• à¤•à¤¾ à¤¸à¤®à¥à¤®à¤¾à¤¨ à¤•à¤°à¤¤à¥€ à¤¹à¥ˆ: à¤¸à¤•à¤¾à¤°à¤¾à¤¤à¥à¤®à¤• à¤ªà¥à¤°à¤¸à¥à¤¤à¤¾à¤µ, à¤¨à¤•à¤¾à¤°à¤¾à¤¤à¥à¤®à¤• à¤ªà¥à¤°à¤¸à¥à¤¤à¤¾à¤µ, à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¨à¤¿à¤°à¥à¤£à¤¯à¥¤",
    yarrowHeading: "à¤¯à¤¾à¤°à¥‹ à¤•à¥€ à¤›à¤¡à¤¼à¥‡à¤‚ (è“è‰ Â· ShÄ«cÇŽo)",
    yarrowOriginHeading: "à¤à¤¤à¤¿à¤¹à¤¾à¤¸à¤¿à¤• à¤‰à¤¤à¥à¤ªà¤¤à¥à¤¤à¤¿ (~1000 à¤ˆà¤¸à¤¾ à¤ªà¥‚à¤°à¥à¤µ)",
    yarrowOriginBody:
      "à¤¯à¤¾à¤°à¥‹ à¤•à¥€ à¤›à¤¡à¤¼à¥‹à¤‚ à¤•à¥€ à¤µà¤¿à¤§à¤¿ à¤µà¤¹ à¤¦à¤¿à¤µà¥à¤¯à¤œà¥à¤žà¤¾à¤¨ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤¹à¥ˆ à¤œà¥‹ à¤¸à¥à¤µà¤¯à¤‚ I Ching à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤²à¥‡à¤–à¤¿à¤¤ à¤¹à¥ˆà¥¤ à¤¦à¤¸ à¤ªà¤‚à¤–à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¸à¥‡ à¤à¤•, à¤®à¤¹à¤¾à¤¨ à¤Ÿà¥€à¤•à¤¾ (å¤§ä¼ , DÃ zhuÃ n), à¤¸à¥à¤ªà¤·à¥à¤Ÿ à¤°à¥‚à¤ª à¤¸à¥‡ à¤•à¤¹à¤¤à¤¾ à¤¹à¥ˆ: 'à¤®à¤¹à¤¾à¤¨ à¤µà¤¿à¤¸à¥à¤¤à¤¾à¤° à¤•à¥€ à¤¸à¤‚à¤–à¥à¤¯à¤¾ 50 à¤¹à¥ˆ, à¤œà¤¿à¤¨à¤®à¥‡à¤‚ à¤¸à¥‡ 49 à¤‰à¤ªà¤¯à¥‹à¤— à¤®à¥‡à¤‚ à¤²à¤¾à¤ˆ à¤œà¤¾à¤¤à¥€ à¤¹à¥ˆà¤‚à¥¤' à¤•à¤¨à¥à¤«à¥à¤¯à¥‚à¤¶à¤¿à¤¯à¤¸ à¤¨à¥‡ à¤à¤¨à¤¾à¤²à¥‡à¤•à¥à¤Ÿà¥à¤¸ à¤®à¥‡à¤‚ à¤•à¤¹à¤¾ à¤•à¤¿ à¤µà¥‡ à¤ªà¤šà¤¾à¤¸ à¤µà¤°à¥à¤·à¥‹à¤‚ à¤¤à¤• à¤ªà¤°à¤¿à¤µà¤°à¥à¤¤à¤¨à¥‹à¤‚ à¤•à¤¾ à¤…à¤§à¥à¤¯à¤¯à¤¨ à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¥à¥‡; à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€à¤¯ à¤µà¤¿à¤¦à¥à¤µà¤¾à¤¨ 50 à¤•à¥€ à¤‡à¤¸ à¤¸à¤‚à¤¦à¤°à¥à¤­ à¤•à¥‹ à¤›à¤¡à¤¼à¥‹à¤‚ à¤•à¥€ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤•à¥€ à¤“à¤° à¤ªà¥à¤°à¤¤à¥à¤¯à¤•à¥à¤· à¤¸à¤‚à¤•à¥‡à¤¤ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤¸à¤®à¤à¤¤à¥‡ à¤¹à¥ˆà¤‚à¥¤ à¤¯à¤¹ à¤µà¤¿à¤§à¤¿ à¤¤à¥€à¤¨ à¤¸à¤¿à¤•à¥à¤•à¥‹à¤‚ à¤•à¥€ à¤µà¤¿à¤§à¤¿ à¤¸à¥‡ à¤à¤• à¤¸à¤¹à¤¸à¥à¤°à¤¾à¤¬à¥à¤¦à¥€ à¤¸à¥‡ à¤…à¤§à¤¿à¤• à¤ªà¥à¤°à¤¾à¤¨à¥€ à¤¹à¥ˆà¥¤ à¤°à¤¿à¤šà¤°à¥à¤¡ à¤µà¤¿à¤²à¥à¤¹à¥‡à¤® à¤”à¤° à¤•à¥ˆà¤°à¥€ à¤¬à¥‡à¤¨à¤¿à¤¸ à¤¨à¥‡ 1950 à¤•à¥‡ à¤…à¤ªà¤¨à¥‡ à¤…à¤¨à¥à¤µà¤¾à¤¦ à¤•à¥‡ à¤ªà¤°à¤¿à¤¶à¤¿à¤·à¥à¤Ÿ (à¤ªà¥à¤°à¤¿à¤‚à¤¸à¤Ÿà¤¨ à¤¯à¥‚à¤¨à¤¿à¤µà¤°à¥à¤¸à¤¿à¤Ÿà¥€ à¤ªà¥à¤°à¥‡à¤¸) à¤®à¥‡à¤‚ à¤ªà¥‚à¤°à¥à¤£ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤ªà¥à¤°à¤²à¥‡à¤–à¤¿à¤¤ à¤•à¥€à¥¤",
    yarrowProcedureHeading: "à¤­à¥Œà¤¤à¤¿à¤• à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾",
    yarrowProcedureBody:
      "à¤¯à¤¹ à¤µà¤¿à¤§à¤¿ à¤­à¥Œà¤¤à¤¿à¤• à¤¡à¤‚à¤ à¤²à¥‹à¤‚ à¤¯à¤¾ à¤¸à¤®à¤¾à¤¨ à¤µà¤¸à¥à¤¤à¥à¤“à¤‚ à¤•à¥‡ à¤¸à¤®à¥‚à¤¹ à¤•à¤¾ à¤‰à¤ªà¤¯à¥‹à¤— à¤•à¤°à¤¤à¥€ à¤¹à¥ˆà¥¤ à¤à¤• à¤•à¥‹ à¤…à¤²à¤— à¤°à¤–à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆ à¤”à¤° à¤¬à¤¾à¤•à¥€ à¤•à¥‹ à¤¦à¥‹à¤¹à¤°à¤¾à¤ˆ à¤œà¤¾à¤¨à¥‡ à¤µà¤¾à¤²à¥€ à¤…à¤¨à¥à¤·à¥à¤ à¤¾à¤¨à¤¿à¤• à¤•à¥à¤°à¤® à¤®à¥‡à¤‚ à¤¬à¤¾à¤à¤Ÿà¤¾ à¤”à¤° à¤—à¤¿à¤¨à¤¾ à¤œà¤¾à¤¤à¤¾ à¤¹à¥ˆ, à¤œà¤¬ à¤¤à¤• à¤›à¤¹ à¤°à¥‡à¤–à¤¾à¤à¤ à¤¬à¤¨ à¤¨ à¤œà¤¾à¤à¤à¥¤ à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤®à¥à¤–à¥à¤¯ à¤¬à¤¾à¤¤ à¤‡à¤¸à¤•à¥€ à¤²à¤¯ à¤¹à¥ˆ: à¤¯à¤¹ à¤§à¥à¤¯à¤¾à¤¨, à¤¸à¥à¤ªà¤°à¥à¤¶ à¤”à¤° à¤§à¥ˆà¤°à¥à¤¯ à¤®à¤¾à¤‚à¤—à¤¤à¥€ à¤¹à¥ˆ, à¤œà¤¿à¤¸à¤¸à¥‡ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤¤à¥€à¤¨ à¤¸à¤¿à¤•à¥à¤•à¥‹à¤‚ à¤•à¥€ à¤µà¤¿à¤§à¤¿ à¤•à¥€ à¤¤à¥à¤²à¤¨à¤¾ à¤®à¥‡à¤‚ à¤…à¤§à¤¿à¤• à¤…à¤¨à¥à¤·à¥à¤ à¤¾à¤¨à¤¿à¤• à¤²à¤—à¤¤à¤¾ à¤¹à¥ˆà¥¤",
    yarrowProbHeading: "à¤µà¤¿à¤§à¤¿ à¤•à¤¾ à¤¸à¥à¤µà¤­à¤¾à¤µ",
    yarrowProbBody:
      "à¤¡à¤‚à¤ à¤² à¤µà¤¿à¤§à¤¿ à¤¤à¥€à¤¨ à¤¸à¤¿à¤•à¥à¤•à¥‹à¤‚ à¤•à¥€ à¤µà¤¿à¤§à¤¿ à¤•à¥€ à¤¤à¥à¤²à¤¨à¤¾ à¤®à¥‡à¤‚ à¤§à¥€à¤®à¥€ à¤…à¤¨à¥à¤·à¥à¤ à¤¾à¤¨à¤¿à¤• à¤²à¤¯ à¤°à¤–à¤¤à¥€ à¤¹à¥ˆà¥¤ à¤‡à¤¸ à¤à¤ª à¤®à¥‡à¤‚ à¤‡à¤¸à¤•à¤¾ à¤®à¥‚à¤²à¥à¤¯ à¤•à¤¿à¤¸à¥€ à¤¤à¤•à¤¨à¥€à¤•à¥€ à¤¤à¤¾à¤²à¤¿à¤•à¤¾ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤¨à¤¹à¥€à¤‚, à¤¬à¤²à¥à¤•à¤¿ à¤‰à¤¸à¥€ I Ching à¤ªà¤°à¤‚à¤ªà¤°à¤¾ à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤µà¥‡à¤¶ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ à¤¦à¥‚à¤¸à¤°à¥‡ à¤¤à¤°à¥€à¤•à¥‡ à¤•à¥‡ à¤°à¥‚à¤ª à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤¸à¥à¤¤à¥à¤¤ à¤¹à¥ˆ: à¤…à¤§à¤¿à¤• à¤¸à¥à¤ªà¤°à¥à¤¶à¤¨à¥€à¤¯, à¤…à¤§à¤¿à¤• à¤¸à¤œà¤— à¤”à¤° Wilhelm/Baynes à¤¦à¥à¤µà¤¾à¤°à¤¾ à¤¦à¤°à¥à¤œ à¤¶à¤¾à¤¸à¥à¤¤à¥à¤°à¥€à¤¯ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤•à¥‡ à¤¨à¤¿à¤•à¤Ÿà¥¤ à¤¤à¥‡à¤œ à¤ªà¤°à¤¾à¤®à¤°à¥à¤¶ à¤•à¥‡ à¤²à¤¿à¤ à¤¤à¥€à¤¨ à¤¸à¤¿à¤•à¥à¤•à¥‹à¤‚ à¤•à¥€ à¤µà¤¿à¤§à¤¿ à¤‰à¤¤à¤¨à¥€ à¤¹à¥€ à¤µà¥ˆà¤§ à¤°à¤¹à¤¤à¥€ à¤¹à¥ˆà¥¤",
    interpretHeading: "AI à¤•à¥à¤¯à¥‹à¤‚ à¤¨à¤¹à¥€à¤‚ à¤¬à¤¨à¤¾à¤¤à¤¾",
    interpretBody:
      "à¤‡à¤¸ à¤à¤ª à¤®à¥‡à¤‚ à¤•à¥ƒà¤¤à¥à¤°à¤¿à¤® à¤¬à¥à¤¦à¥à¤§à¤¿à¤®à¤¤à¥à¤¤à¤¾ à¤•à¥€ à¤à¤• à¤µà¤¿à¤¶à¤¿à¤·à¥à¤Ÿ à¤”à¤° à¤¸à¥€à¤®à¤¿à¤¤ à¤•à¤¾à¤°à¥à¤¯ à¤¹à¥ˆ: à¤à¤²à¥à¤—à¥‹à¤°à¤¿à¤¦à¤® à¤•à¤¾ à¤ªà¤°à¤¿à¤£à¤¾à¤®, à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤®, à¤—à¤¤à¤¿à¤¶à¥€à¤² à¤°à¥‡à¤–à¤¾à¤à¤‚, à¤¦à¤°à¤¾à¤° à¤¨à¤¿à¤°à¥à¤£à¤¯, à¤²à¥‡à¤¨à¤¾ à¤”à¤° à¤‰à¤¸à¥‡ à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾ à¤•à¥‡ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤•à¥‡ à¤¸à¤‚à¤¦à¤°à¥à¤­ à¤•à¥‡ à¤¸à¤¾à¤¥ à¤‰à¤ªà¤¯à¥‹à¤—à¤•à¤°à¥à¤¤à¤¾ à¤•à¥€ à¤­à¤¾à¤·à¤¾ à¤®à¥‡à¤‚ à¤ªà¥à¤°à¤¾à¤•à¥ƒà¤¤à¤¿à¤• à¤­à¤¾à¤·à¤¾ à¤®à¥‡à¤‚ à¤µà¥à¤¯à¤•à¥à¤¤ à¤•à¤°à¤¨à¤¾à¥¤ AI à¤¹à¥‡à¤•à¥à¤¸à¤¾à¤—à¥à¤°à¤¾à¤® à¤‰à¤¤à¥à¤ªà¤¨à¥à¤¨ à¤¨à¤¹à¥€à¤‚ à¤•à¤°à¤¤à¤¾, à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤¤à¤¯ à¤¨à¤¹à¥€à¤‚ à¤•à¤°à¤¤à¤¾, Wilhelm à¤•à¥‡ à¤—à¥à¤°à¤‚à¤¥à¥‹à¤‚ à¤¯à¤¾ à¤¶à¤¾à¤‚à¤— à¤µà¤¿à¤§à¤¿ à¤•à¥‡ à¤ªà¥ˆà¤Ÿà¤°à¥à¤¨ à¤•à¥‹ à¤¸à¤‚à¤¶à¥‹à¤§à¤¿à¤¤ à¤¨à¤¹à¥€à¤‚ à¤•à¤°à¤¤à¤¾à¥¤ à¤—à¤£à¤¿à¤¤à¥€à¤¯ à¤à¤²à¥à¤—à¥‹à¤°à¤¿à¤¦à¤® AI à¤•à¥‡ à¤¹à¤¸à¥à¤¤à¤•à¥à¤·à¥‡à¤ª à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤¯à¤¹ à¤¸à¤¬ à¤µà¤¿à¤¶à¥à¤µà¤¾à¤¸à¤ªà¥‚à¤°à¥à¤µà¤• à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤ AI à¤¦à¥à¤­à¤¾à¤·à¤¿à¤¯à¤¾ à¤¹à¥ˆà¥¤ à¤¦à¥ˆà¤µà¤œà¥à¤ž à¤µà¤¿à¤§à¤¿ à¤¹à¥ˆà¥¤",
    sourcesHeading: "à¤¸à¥à¤°à¥‹à¤¤ à¤”à¤° à¤¸à¤‚à¤¦à¤°à¥à¤­",
    sourcesList: [
      "Keightley, David N. Sources of Shang History: The Oracle-Bone Inscriptions of Bronze Age China. University of California Press.",
      "Shaughnessy, Edward L. I Ching: The Classic of Changes. Ballantine Books.",
      "Adler, Joseph A. Introduction to the Study of the Classic of Change (I-hsÃ¼eh châ€™i-meng). Global Scholarly Publications.",
      "Nielsen, Bent. A Companion to Yi Jing Numerology and Cosmology. Routledge.",
      "Wilhelm, Richard & Baynes, Cary F. The I Ching or Book of Changes. Princeton University Press.",
      "Rutt, Richard. The Book of Changes (Zhouyi): A Bronze Age Document. Routledge.",
    ],
  },
};

export function getNotesPageUiMessages(locale: AppLocale): NotesPageUiMessages {
  return NOTES_PAGE_UI[locale] ?? NOTES_PAGE_UI[DEFAULT_LOCALE];
}

