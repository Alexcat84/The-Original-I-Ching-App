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
  bonesVerdictSilence: string;
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
};

const NOTES_PAGE_UI: Record<AppLocale, NotesPageUiMessages> = {
  es: {
    title: "Notas y Origen de los Métodos",
    lead: "Esta página es contexto técnico-cultural. No es una guía de uso.",
    authNotice:
      "Todos los métodos usados en esta app provienen de tradiciones milenarias de la cultura china, documentadas históricamente y respetadas académicamente en todo el mundo. Esta app no inventa interpretaciones ni genera significados propios; aplica métodos auténticos asistidos por inteligencia artificial para hacerlos accesibles en el idioma del usuario. Cualquier lector puede contrastar los textos con las fuentes originales listadas al final de esta página.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origen histórico (~1000 a.C.)",
    ichingOriginBody:
      "El Zhouyi, «Los Cambios de Zhou», es uno de los textos más antiguos de la humanidad. Sus raíces se remontan a la dinastía Zhou (1046–256 a.C.), aunque su núcleo oracular es anterior. El texto se construyó en capas históricas distintas: el Rey Wen organizó los 64 hexagramas y escribió los Juicios (卦辞, guàcí) mientras estaba prisionero. Su hijo el Duque de Zhou añadió las sentencias de las seis líneas (爻辞, yáocí). Siglos después, Confucio y sus discípulos agregaron los Comentarios conocidos como las Diez Alas (十翼), el estrato filosófico más profundo del texto.",
    ichingHexHeading: "El sistema de los 64 hexagramas",
    ichingHexBody:
      "Cada hexagrama es una figura de seis líneas, cada una yin (rota, receptiva) o yang (entera, activa). Las 64 combinaciones posibles describen los patrones fundamentales del cambio en la naturaleza y en la vida humana. Las líneas en movimiento indican transformación: el hexagrama presente muta hacia uno futuro, y esa transición es el corazón de la lectura.",
    ichingHexListHeading: "Los 64 hexagramas en orden King Wen",
    ichingHexListIntro:
      "Listado completo de los 64 hexagramas con su número, su glifo y su nombre clásico en chino y pinyin. Aquí no se incluye su significado: cada hexagrama solo cobra sentido en una consulta concreta, donde la pregunta y el contexto del consultante determinan la lectura.",
    ichingHexListAriaLabel: "Listado de los 64 hexagramas",
    ichingMethodHeading: "El método de las tres monedas y las reglas de Zhu Xi",
    ichingMethodBody:
      "El método clásico usa tres monedas lanzadas seis veces para construir el hexagrama línea por línea. Cuando múltiples líneas cambian, la escuela de Zhu Xi (neoconfucianismo, siglo XII d.C.) establece reglas precisas para determinar qué línea gobierna la lectura, eliminando la ambigüedad interpretativa. Esta app implementa exactamente esas reglas sin modificación.",
    ichingWilhelmHeading: "La traducción Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm, sinólogo alemán, vivió en China durante décadas y produjo en 1924 la traducción más completa y respetada del I Ching en lengua occidental, incluyendo los Juicios, las líneas y los Comentarios de las Diez Alas. Cary Baynes la tradujo al inglés en 1950. Esta obra entró al dominio público en 2020 y es el texto base de esta app, sin modificaciones ni simplificaciones.",
    ichingChainHeading: "La cadena de autenticidad",
    ichingChain:
      "Zhou Yi original (dinastía Zhou) → Comentarios de Confucio (s. V a.C.) → Reglas de Zhu Xi (s. XII d.C.) → Traducción Wilhelm alemán (1924) → Traducción Baynes inglés (1950) → Dominio público (2020) → Esta app.",
    bonesHeading: "Huesos de Oráculo (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Origen histórico (dinastía Shang, ~1600–1046 a.C.)",
    bonesOriginBody:
      "La adivinación por huesos oraculares es la práctica oracular documentada más antigua de China, anterior al I Ching en su forma escrita. Los chamanes reales de la dinastía Shang quemaban plastrón de tortuga o escápula de buey y leían las grietas resultantes para consultar a los ancestros sobre decisiones militares, agrícolas, climáticas y personales del rey.",
    bonesRitualHeading: "El proceso ritual",
    bonesRitualBody:
      "El proceso era preciso y repetible: se formulaba una carga positiva y su negación. Se aplicaba bronce incandescente al hueso hasta producir grietas. La orientación, longitud y patrón de las grietas determinaba el veredicto. El resultado era grabado en el mismo hueso, constituyendo los primeros registros escritos de China.",
    bonesVerdictsHeading: "Los cinco estados del veredicto",
    bonesVerdictAuspClear: "吉. Favorable claro: el patrón confirma la carga positiva sin ambigüedad.",
    bonesVerdictAuspMod: "吉 moderado. Favorable moderado: hay confirmación pero con matices o condiciones.",
    bonesVerdictInauspMod: "凶 moderado. Desfavorable moderado: el patrón se inclina hacia la negación con reservas.",
    bonesVerdictInauspClear: "凶. Desfavorable claro: el patrón niega la carga positiva sin ambigüedad.",
    bonesVerdictSilence:
      "沉默. El Silencio: el patrón no produce grietas legibles. En la tradición Shang, el silencio del hueso no era un error, era en sí mismo una respuesta: los ancestros no hablan porque el momento no está maduro para esa pregunta, o porque la respuesta trasciende el marco de lo que puede ser dicho. Esta app respeta ese estado y lo devuelve cuando el patrón lo indica.",
    bonesAuthHeading: "Autenticidad del método",
    bonesAuthBody:
      "Más de 150.000 fragmentos de huesos oraculares han sido excavados y estudiados desde el siglo XIX. Son patrimonio reconocido internacionalmente y se conservan en museos de China, Taiwán, Japón y Europa. El método implementado en esta app respeta la lógica estructural del sistema Shang: carga positiva, carga negativa, veredicto por patrón, incluyendo el silencio como estado legítimo.",
    yarrowHeading: "Varillas de Milenrama (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origen histórico (~1000 a.C.)",
    yarrowOriginBody:
      "El método de las varillas de milenrama es el procedimiento de adivinación descrito en el propio I Ching. El Gran Comentario (大传, Dàzhuàn), una de las Diez Alas, precisa: «El número de la Gran Expansión es 50, de los que se usan 49». En los Anales, Confucio declaró que deseaba estudiar los Cambios durante cincuenta años; los estudiosos clásicos entienden esa referencia al número 50 como alusión directa al procedimiento de las varillas. El método es anterior al de tres monedas en más de un milenio. Richard Wilhelm y Cary Baynes documentaron el procedimiento completo en el Apéndice de su traducción (Princeton, 1950).",
    yarrowProcedureHeading: "El procedimiento físico",
    yarrowProcedureBody:
      "El método usa un conjunto de varillas físicas u objetos similares. Una se aparta y las demás se dividen y cuentan mediante una secuencia ritual repetida hasta formar cada una de las seis líneas. Lo importante para el usuario es el ritmo: exige atención, tacto y paciencia, y hace que la consulta se sienta más ceremonial que el método de tres monedas.",
    yarrowProbHeading: "Carácter del método",
    yarrowProbBody:
      "El método de varillas conserva un ritmo ritual más lento que el de tres monedas. En esta app su valor no se presenta como una tabla técnica, sino como una forma distinta de entrar en la misma tradición del I Ching: más táctil, más deliberada y más cercana al procedimiento clásico documentado por Wilhelm/Baynes. El método de tres monedas sigue siendo igualmente válido para una consulta más rápida.",
    interpretHeading: "Por qué la IA no inventa",
    interpretBody:
      "La inteligencia artificial en esta app tiene una función específica y acotada: tomar el resultado del algoritmo (hexagrama, líneas en movimiento, veredicto de grietas) y articularlo en lenguaje natural en el idioma del usuario, con el contexto de su pregunta. La IA no genera hexagramas, no decide veredictos, no modifica los textos de Wilhelm ni los patrones del método Shang. El algoritmo matemático hace eso, fielmente, antes de que la IA intervenga. La IA es el intérprete. El oráculo es el método.",
    sourcesHeading: "Fuentes y referencias",
  },
  en: {
    title: "Method Notes and Origins",
    lead: "This page is technical-cultural context. It is not a usage guide.",
    authNotice:
      "All methods used in this app come from millennial traditions of Chinese culture, historically documented and academically respected worldwide. This app does not invent interpretations or generate its own meanings; it applies authentic methods assisted by artificial intelligence to make them accessible in the user's language. Any reader can verify the texts against the original sources listed at the bottom of this page.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Historical Origins (~1000 BCE)",
    ichingOriginBody:
      "The Zhouyi, 'Changes of Zhou', is one of the oldest texts in human history. Its roots trace back to the Zhou dynasty (1046–256 BCE), though its oracular core is older. The text was built in distinct historical layers: King Wen organized the 64 hexagrams and wrote the Judgments (卦辞, guàcí) while imprisoned. His son, the Duke of Zhou, added the line statements (爻辞, yáocí). Centuries later, Confucius and his disciples added the Commentaries known as the Ten Wings (十翼), the deepest philosophical stratum of the text.",
    ichingHexHeading: "The 64-Hexagram System",
    ichingHexBody:
      "Each hexagram is a figure of six lines, each either yin (broken, receptive) or yang (solid, active). The 64 possible combinations describe the fundamental patterns of change in nature and human life. Moving lines indicate transformation: the present hexagram mutates into a future one, and that transition is the heart of the reading.",
    ichingHexListHeading: "The 64 hexagrams in King Wen order",
    ichingHexListIntro:
      "Complete list of the 64 hexagrams with their number, glyph, and classical name in Chinese and pinyin. Their meaning is not included here: each hexagram only takes shape inside a specific consultation, where the question and the seeker's context determine the reading.",
    ichingHexListAriaLabel: "List of the 64 hexagrams",
    ichingMethodHeading: "The Three-Coin Method and Zhu Xi's Rules",
    ichingMethodBody:
      "The classic method uses three coins cast six times to build the hexagram line by line. When multiple lines change, the Zhu Xi school (Neo-Confucianism, 12th century CE) establishes precise rules to determine which line governs the reading, eliminating interpretive ambiguity. This app implements those rules exactly without modification.",
    ichingWilhelmHeading: "The Wilhelm/Baynes Translation",
    ichingWilhelmBody:
      "Richard Wilhelm, a German sinologist, lived in China for decades and produced in 1924 the most complete and respected translation of the I Ching in Western languages, including the Judgments, lines, and Ten Wings Commentaries. Cary Baynes translated it into English in 1950. This work entered the public domain in 2020 and is the base text of this app, without modifications or simplifications.",
    ichingChainHeading: "The Chain of Authenticity",
    ichingChain:
      "Original Zhou Yi (Zhou dynasty) → Confucian Commentaries (5th c. BCE) → Zhu Xi's Rules (12th c. CE) → Wilhelm German translation (1924) → Baynes English translation (1950) → Public domain (2020) → This app.",
    bonesHeading: "Oracle Bones (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Historical Origins (Shang Dynasty, ~1600–1046 BCE)",
    bonesOriginBody:
      "Oracle bone divination is the oldest documented oracular practice in China, predating the I Ching in its written form. Royal shamans of the Shang dynasty burned turtle plastrons or ox scapulae and read the resulting cracks to consult ancestors about the king's military, agricultural, climatic, and personal decisions.",
    bonesRitualHeading: "The Ritual Process",
    bonesRitualBody:
      "The process was precise and repeatable: a positive charge and its negation were formulated. Incandescent bronze was applied to the bone until cracks formed. The orientation, length, and pattern of the cracks determined the verdict. The result was inscribed on the bone itself, constituting China's earliest written records.",
    bonesVerdictsHeading: "The Five Verdict States",
    bonesVerdictAuspClear: "吉. Clearly favorable: the pattern confirms the positive charge without ambiguity.",
    bonesVerdictAuspMod: "吉 moderate. Moderately favorable: confirmation is present but with nuance or conditions.",
    bonesVerdictInauspMod: "凶 moderate. Moderately unfavorable: the pattern leans toward negation with reservations.",
    bonesVerdictInauspClear: "凶. Clearly unfavorable: the pattern negates the positive charge without ambiguity.",
    bonesVerdictSilence:
      "沉默. Silence: the pattern produces no readable cracks. In the Shang tradition, the bone's silence was not an error; it was itself an answer: the ancestors do not speak because the moment is not ripe for that question, or because the answer transcends what can be said. This app respects that state and returns it when the pattern indicates it.",
    bonesAuthHeading: "Authenticity of the Method",
    bonesAuthBody:
      "More than 150,000 oracle bone fragments have been excavated and studied since the 19th century. They are internationally recognized heritage and are preserved in museums in China, Taiwan, Japan, and Europe. The method implemented in this app respects the structural logic of the Shang system: positive charge, negative charge, verdict by pattern, including silence as a legitimate state.",
    yarrowHeading: "Yarrow Stalks (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Historical Origins (~1000 BCE)",
    yarrowOriginBody:
      "The yarrow stalk method is the divination procedure documented in the I Ching itself. The Great Commentary (大传, Dàzhuàn), one of the Ten Wings, states: 'The number of the Great Expansion is 50, of which 49 are used.' Confucius is recorded in the Analects as wishing to study the Changes for fifty years; classical scholars read that reference to the number 50 as a direct allusion to the stalk procedure. The method predates the three-coin method by more than a millennium. Richard Wilhelm and Cary Baynes documented the complete procedure in the Appendix of their translation (Princeton University Press, 1950). Edward Shaughnessy's Sources of Western Zhou History (1993) provides additional philological context.",
    yarrowProcedureHeading: "Physical Procedure",
    yarrowProcedureBody:
      "The method uses a set of physical stalks or similar objects. One is set aside, and the rest are divided and counted through a repeated ritual sequence until each of the six lines is formed. The important point for users is the pace: it asks for attention, touch, and patience, making the consultation feel more ceremonial than the three-coin method.",
    yarrowProbHeading: "Character of the method",
    yarrowProbBody:
      "The stalk method preserves a slower ritual tempo than the three-coin method. Its value in this app is not presented as a technical table, but as a different way of entering the same I Ching tradition: more tactile, more deliberate, and closer to the classical procedure documented by Wilhelm/Baynes. The three-coin method remains equally valid for a faster consultation.",
    interpretHeading: "Why AI Does Not Invent",
    interpretBody:
      "The artificial intelligence in this app has a specific and bounded function: to take the algorithm's result (hexagram, moving lines, crack verdict) and articulate it in natural language in the user's language, with the context of their question. The AI does not generate hexagrams, does not decide verdicts, does not modify Wilhelm's texts or the Shang method's patterns. The mathematical algorithm does that, faithfully, before the AI intervenes. The AI is the interpreter. The oracle is the method.",
    sourcesHeading: "Sources and References",
  },
  pt: {
    title: "Notas e Origem dos Métodos",
    lead: "Esta página é contexto técnico-cultural. Não é um guia de uso.",
    authNotice:
      "Todos os métodos usados nesta app provêm de tradições milenares da cultura chinesa, documentadas historicamente e respeitadas academicamente em todo o mundo. Esta app não inventa interpretações nem gera significados próprios; aplica métodos autênticos assistidos por inteligência artificial para os tornar acessíveis no idioma do utilizador. Qualquer leitor pode verificar os textos com as fontes originais listadas no final desta página.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origem histórica (~1000 a.C.)",
    ichingOriginBody:
      "O Zhouyi, «As Mutações de Zhou», é um dos textos mais antigos da humanidade. As suas raízes remontam à dinastia Zhou (1046–256 a.C.), embora o seu núcleo oracular seja anterior. O texto foi construído em camadas históricas distintas: o Rei Wen organizou os 64 hexagramas e escreveu os Juízos (卦辞, guàcí) enquanto estava prisioneiro. O seu filho, o Duque de Zhou, acrescentou as sentenças das seis linhas (爻辞, yáocí). Séculos depois, Confúcio e os seus discípulos acrescentaram os Comentários conhecidos como as Dez Asas (十翼), o estrato filosófico mais profundo do texto.",
    ichingHexHeading: "O sistema dos 64 hexagramas",
    ichingHexBody:
      "Cada hexagrama é uma figura de seis linhas, cada uma yin (partida, receptiva) ou yang (inteira, ativa). As 64 combinações possíveis descrevem os padrões fundamentais da mudança na natureza e na vida humana. As linhas em movimento indicam transformação: o hexagrama presente muta para um futuro, e essa transição é o coração da leitura.",
    ichingHexListHeading: "Os 64 hexagramas em ordem King Wen",
    ichingHexListIntro:
      "Listagem completa dos 64 hexagramas com o seu número, glifo e nome clássico em chinês e pinyin. O significado não é apresentado aqui: cada hexagrama só ganha sentido numa consulta concreta, onde a pergunta e o contexto do consultante determinam a leitura.",
    ichingHexListAriaLabel: "Listagem dos 64 hexagramas",
    ichingMethodHeading: "O método das três moedas e as regras de Zhu Xi",
    ichingMethodBody:
      "O método clássico usa três moedas lançadas seis vezes para construir o hexagrama linha a linha. Quando múltiplas linhas mudam, a escola de Zhu Xi (neo-confucionismo, século XII d.C.) estabelece regras precisas para determinar qual linha governa a leitura, eliminando a ambiguidade interpretativa. Esta app implementa exatamente essas regras sem modificação.",
    ichingWilhelmHeading: "A tradução Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm, sinólogo alemão, viveu na China durante décadas e produziu em 1924 a tradução mais completa e respeitada do I Ching em língua ocidental, incluindo os Juízos, as linhas e os Comentários das Dez Asas. Cary Baynes traduziu-a para inglês em 1950. Esta obra entrou no domínio público em 2020 e é o texto base desta app, sem modificações nem simplificações.",
    ichingChainHeading: "A cadeia de autenticidade",
    ichingChain:
      "Zhou Yi original (dinastia Zhou) → Comentários de Confúcio (séc. V a.C.) → Regras de Zhu Xi (séc. XII d.C.) → Tradução Wilhelm alemão (1924) → Tradução Baynes inglês (1950) → Domínio público (2020) → Esta app.",
    bonesHeading: "Ossos Oraculares (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Origem histórica (dinastia Shang, ~1600–1046 a.C.)",
    bonesOriginBody:
      "A adivinhação por ossos oraculares é a prática oracular documentada mais antiga da China, anterior ao I Ching na sua forma escrita. Os xamãs reais da dinastia Shang queimavam plastrão de tartaruga ou escápula de boi e liam as fissuras resultantes para consultar os ancestrais sobre decisões militares, agrícolas, climáticas e pessoais do rei.",
    bonesRitualHeading: "O processo ritual",
    bonesRitualBody:
      "O processo era preciso e repetível: formulava-se uma carga positiva e a sua negação. Aplicava-se bronze incandescente ao osso até produzir fissuras. A orientação, comprimento e padrão das fissuras determinava o veredicto. O resultado era gravado no próprio osso, constituindo os primeiros registos escritos da China.",
    bonesVerdictsHeading: "Os cinco estados do veredicto",
    bonesVerdictAuspClear: "吉. Favorável claro: o padrão confirma a carga positiva sem ambiguidade.",
    bonesVerdictAuspMod: "吉 moderado. Favorável moderado: há confirmação mas com nuances ou condições.",
    bonesVerdictInauspMod: "凶 moderado. Desfavorável moderado: o padrão inclina-se para a negação com reservas.",
    bonesVerdictInauspClear: "凶. Desfavorável claro: o padrão nega a carga positiva sem ambiguidade.",
    bonesVerdictSilence:
      "沉默. O Silêncio: o padrão não produz fissuras legíveis. Na tradição Shang, o silêncio do osso não era um erro, era em si mesmo uma resposta: os ancestrais não falam porque o momento não está maduro para essa pergunta, ou porque a resposta transcende o que pode ser dito. Esta app respeita esse estado e devolve-o quando o padrão o indica.",
    bonesAuthHeading: "Autenticidade do método",
    bonesAuthBody:
      "Mais de 150.000 fragmentos de ossos oraculares foram escavados e estudados desde o século XIX. São património reconhecido internacionalmente e conservam-se em museus da China, Taiwan, Japão e Europa. O método implementado nesta app respeita a lógica estrutural do sistema Shang: carga positiva, carga negativa, veredicto por padrão, incluindo o silêncio como estado legítimo.",
    yarrowHeading: "Varetas de Milenrama (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origem histórica (~1000 a.C.)",
    yarrowOriginBody:
      "O método das varetas de milenrama é o procedimento de adivinhação documentado no próprio I Ching. O Grande Comentário (大传, Dàzhuàn), uma das Dez Asas, afirma: «O número da Grande Expansão é 50, dos quais 49 são usados». Confúcio declarou nos Analetos que desejava estudar as Mutações durante cinquenta anos; os estudiosos clássicos entendem essa referência ao número 50 como uma alusão direta ao procedimento das varetas. O método é anterior ao das três moedas em mais de um milénio. Richard Wilhelm e Cary Baynes documentaram o procedimento completo no Apêndice da sua tradução (Princeton University Press, 1950).",
    yarrowProcedureHeading: "Procedimento físico",
    yarrowProcedureBody:
      "O método usa um conjunto de varetas físicas ou objetos semelhantes. Uma é posta de lado e as restantes são divididas e contadas através de uma sequência ritual repetida até formar cada uma das seis linhas. O ponto importante para o utilizador é o ritmo: pede atenção, toque e paciência, fazendo a consulta parecer mais cerimonial do que o método das três moedas.",
    yarrowProbHeading: "Caráter do método",
    yarrowProbBody:
      "O método das varetas preserva um ritmo ritual mais lento do que o das três moedas. Nesta app, o seu valor não é apresentado como uma tabela técnica, mas como uma forma diferente de entrar na mesma tradição do I Ching: mais tátil, mais deliberada e mais próxima do procedimento clássico documentado por Wilhelm/Baynes. O método das três moedas continua igualmente válido para uma consulta mais rápida.",
    interpretHeading: "Por que a IA não inventa",
    interpretBody:
      "A inteligência artificial nesta app tem uma função específica e delimitada: tomar o resultado do algoritmo (hexagrama, linhas em movimento, veredicto de fissuras) e articulá-lo em linguagem natural no idioma do utilizador, com o contexto da sua pergunta. A IA não gera hexagramas, não decide veredictos, não modifica os textos de Wilhelm nem os padrões do método Shang. O algoritmo matemático faz isso, fielmente, antes de a IA intervir. A IA é o intérprete. O oráculo é o método.",
    sourcesHeading: "Fontes e referências",
  },
  fr: {
    title: "Notes et origine des méthodes",
    lead: "Cette page est un contexte technique et culturel. Ce n'est pas un guide d'utilisation.",
    authNotice:
      "Toutes les méthodes utilisées dans cette app proviennent de traditions millénaires de la culture chinoise, documentées historiquement et respectées académiquement dans le monde entier. Cette app n'invente pas d'interprétations ni ne génère ses propres significations; elle applique des méthodes authentiques assistées par l'intelligence artificielle pour les rendre accessibles dans la langue de l'utilisateur. Tout lecteur peut vérifier les textes avec les sources originales listées en bas de cette page.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origines historiques (~1000 av. J.-C.)",
    ichingOriginBody:
      "Le Zhouyi, « Les Mutations de Zhou », est l'un des textes les plus anciens de l'humanité. Ses racines remontent à la dynastie Zhou (1046–256 av. J.-C.), bien que son noyau oraculaire soit antérieur. Le texte a été construit en couches historiques distinctes : le roi Wen organisa les 64 hexagrammes et rédigea les Jugements (卦辞, guàcí) pendant son emprisonnement. Son fils, le duc de Zhou, ajouta les sentences des six traits (爻辞, yáocí). Des siècles plus tard, Confucius et ses disciples ajoutèrent les Commentaires connus sous le nom des Dix Ailes (十翼), la strate philosophique la plus profonde du texte.",
    ichingHexHeading: "Le système des 64 hexagrammes",
    ichingHexBody:
      "Chaque hexagramme est une figure de six traits, chacun yin (brisé, réceptif) ou yang (plein, actif). Les 64 combinaisons possibles décrivent les modèles fondamentaux du changement dans la nature et la vie humaine. Les traits en mouvement indiquent une transformation : l'hexagramme présent mute en un futur, et cette transition est au cœur de la lecture.",
    ichingHexListHeading: "Les 64 hexagrammes selon l'ordre du Roi Wen",
    ichingHexListIntro:
      "Liste complète des 64 hexagrammes avec leur numéro, leur glyphe et leur nom classique en chinois et pinyin. Leur signification n'est pas indiquée ici : chaque hexagramme ne prend forme qu'au sein d'une consultation précise, où la question et le contexte du consultant déterminent la lecture.",
    ichingHexListAriaLabel: "Liste des 64 hexagrammes",
    ichingMethodHeading: "La méthode des trois pièces et les règles de Zhu Xi",
    ichingMethodBody:
      "La méthode classique utilise trois pièces lancées six fois pour construire l'hexagramme trait par trait. Lorsque plusieurs traits changent, l'école de Zhu Xi (néoconfucianisme, XIIe siècle ap. J.-C.) établit des règles précises pour déterminer quel trait gouverne la lecture, éliminant toute ambiguïté interprétative. Cette app implémente exactement ces règles sans modification.",
    ichingWilhelmHeading: "La traduction Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm, sinologue allemand, vécut en Chine pendant des décennies et produisit en 1924 la traduction la plus complète et la plus respectée du I Ching en langue occidentale, incluant les Jugements, les traits et les Commentaires des Dix Ailes. Cary Baynes la traduisit en anglais en 1950. Cette œuvre est entrée dans le domaine public en 2020 et constitue le texte de base de cette app, sans modifications ni simplifications.",
    ichingChainHeading: "La chaîne d'authenticité",
    ichingChain:
      "Zhou Yi original (dynastie Zhou) → Commentaires de Confucius (Ve s. av. J.-C.) → Règles de Zhu Xi (XIIe s. ap. J.-C.) → Traduction Wilhelm en allemand (1924) → Traduction Baynes en anglais (1950) → Domaine public (2020) → Cette app.",
    bonesHeading: "Os oraculaires (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Origines historiques (dynastie Shang, ~1600–1046 av. J.-C.)",
    bonesOriginBody:
      "La divination par os oraculaires est la pratique oraculaire documentée la plus ancienne de Chine, antérieure au I Ching dans sa forme écrite. Les chamanes royaux de la dynastie Shang brûlaient des plastrons de tortue ou des omoplates de bœuf et lisaient les fissures résultantes pour consulter les ancêtres sur les décisions militaires, agricoles, climatiques et personnelles du roi.",
    bonesRitualHeading: "Le processus rituel",
    bonesRitualBody:
      "Le processus était précis et reproductible : on formulait une charge positive et sa négation. On appliquait du bronze incandescent sur l'os jusqu'à produire des fissures. L'orientation, la longueur et le motif des fissures déterminaient le verdict. Le résultat était gravé sur l'os lui-même, constituant les premiers écrits de Chine.",
    bonesVerdictsHeading: "Les cinq états du verdict",
    bonesVerdictAuspClear: "吉. Clairement favorable : le motif confirme la charge positive sans ambiguïté.",
    bonesVerdictAuspMod: "吉 modéré. Modérément favorable : la confirmation est présente mais avec des nuances ou des conditions.",
    bonesVerdictInauspMod: "凶 modéré. Modérément défavorable : le motif penche vers la négation avec des réserves.",
    bonesVerdictInauspClear: "凶. Clairement défavorable : le motif nie la charge positive sans ambiguïté.",
    bonesVerdictSilence:
      "沉默. Le Silence : le motif ne produit pas de fissures lisibles. Dans la tradition Shang, le silence de l'os n'était pas une erreur; c'était en soi une réponse : les ancêtres ne parlent pas parce que le moment n'est pas mûr pour cette question, ou parce que la réponse transcende ce qui peut être dit. Cette app respecte cet état et le retourne lorsque le motif l'indique.",
    bonesAuthHeading: "Authenticité de la méthode",
    bonesAuthBody:
      "Plus de 150 000 fragments d'os oraculaires ont été excavés et étudiés depuis le XIXe siècle. Ils constituent un patrimoine reconnu internationalement et sont conservés dans des musées en Chine, à Taïwan, au Japon et en Europe. La méthode implémentée dans cette app respecte la logique structurelle du système Shang : charge positive, charge négative, verdict par motif, incluant le silence comme état légitime.",
    yarrowHeading: "Tiges d'Achillée (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origines historiques (~1000 av. J.-C.)",
    yarrowOriginBody:
      "La méthode des tiges d'achillée est le procédé de divination documenté dans le I Ching lui-même. Le Grand Commentaire (大传, Dàzhuàn), l'une des Dix Ailes, précise : « Le nombre de la Grande Expansion est 50, dont 49 sont utilisés. » Confucius déclare dans les Entretiens vouloir étudier les Mutations pendant cinquante ans ; les spécialistes classiques voient dans cette référence au chiffre 50 une allusion directe au procédé des tiges. La méthode est antérieure de plus d'un millénaire à celle des trois pièces. Richard Wilhelm et Cary Baynes ont documenté le procédé complet dans l'Appendice de leur traduction (Princeton University Press, 1950).",
    yarrowProcedureHeading: "Procédure physique",
    yarrowProcedureBody:
      "La méthode utilise un ensemble de tiges physiques ou d'objets semblables. Une tige est mise de côté, puis les autres sont divisées et comptées selon une séquence rituelle répétée jusqu'à former chacun des six traits. Pour l'utilisateur, l'essentiel est le rythme: elle demande attention, contact et patience, ce qui rend la consultation plus cérémonielle que la méthode des trois pièces.",
    yarrowProbHeading: "Caractère de la méthode",
    yarrowProbBody:
      "La méthode des tiges conserve un rythme rituel plus lent que celle des trois pièces. Dans cette app, sa valeur n'est pas présentée comme un tableau technique, mais comme une autre façon d'entrer dans la même tradition du I Ching: plus tactile, plus délibérée et plus proche du procédé classique documenté par Wilhelm/Baynes. La méthode des trois pièces reste tout aussi valide pour une consultation plus rapide.",
    interpretHeading: "Pourquoi l'IA n'invente pas",
    interpretBody:
      "L'intelligence artificielle dans cette app a une fonction spécifique et délimitée : prendre le résultat de l'algorithme (hexagramme, traits en mouvement, verdict de fissures) et l'articuler en langage naturel dans la langue de l'utilisateur, avec le contexte de sa question. L'IA ne génère pas d'hexagrammes, ne décide pas des verdicts, ne modifie pas les textes de Wilhelm ni les motifs de la méthode Shang. L'algorithme mathématique fait cela, fidèlement, avant que l'IA intervienne. L'IA est l'interprète. L'oracle est la méthode.",
    sourcesHeading: "Sources et références",
  },
  de: {
    title: "Methodennotizen und Ursprünge",
    lead: "Diese Seite ist technisch-kultureller Kontext. Es ist keine Bedienungsanleitung.",
    authNotice:
      "Alle in dieser App verwendeten Methoden stammen aus jahrtausendealten Traditionen der chinesischen Kultur, historisch dokumentiert und weltweit akademisch anerkannt. Diese App erfindet keine Interpretationen und generiert keine eigenen Bedeutungen; sie wendet authentische Methoden an, die durch künstliche Intelligenz unterstützt werden, um sie in der Sprache des Nutzers zugänglich zu machen. Jeder Leser kann die Texte mit den am Ende dieser Seite aufgeführten Originalquellen vergleichen.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Historischer Ursprung (~1000 v. Chr.)",
    ichingOriginBody:
      "Das Zhouyi, «Die Wandlungen von Zhou», ist einer der ältesten Texte der Menschheit. Seine Wurzeln reichen bis in die Zhou-Dynastie (1046–256 v. Chr.), obwohl sein orakelhafter Kern noch älter ist. Der Text wurde in verschiedenen historischen Schichten aufgebaut: König Wen ordnete die 64 Hexagramme und verfasste die Urteile (卦辞, guàcí) während seiner Gefangenschaft. Sein Sohn, der Herzog von Zhou, fügte die Liniensätze (爻辞, yáocí) hinzu. Jahrhunderte später fügten Konfuzius und seine Schüler die als Zehn Flügel (十翼) bekannten Kommentare hinzu, das tiefste philosophische Stratum des Textes.",
    ichingHexHeading: "Das System der 64 Hexagramme",
    ichingHexBody:
      "Jedes Hexagramm ist eine Figur aus sechs Linien, jede entweder yin (gebrochen, empfänglich) oder yang (ganz, aktiv). Die 64 möglichen Kombinationen beschreiben die grundlegenden Muster des Wandels in der Natur und im menschlichen Leben. Bewegende Linien zeigen Transformation an: das gegenwärtige Hexagramm wandelt sich in ein zukünftiges, und dieser Übergang ist das Herzstück der Lesung.",
    ichingHexListHeading: "Die 64 Hexagramme in der Reihenfolge nach König Wen",
    ichingHexListIntro:
      "Vollständige Liste der 64 Hexagramme mit Nummer, Schriftzeichen und klassischem Namen in Chinesisch und Pinyin. Ihre Bedeutung wird hier nicht aufgeführt: Jedes Hexagramm gewinnt erst innerhalb einer konkreten Beratung Gestalt, in der Frage und Kontext der ratsuchenden Person die Lesung bestimmen.",
    ichingHexListAriaLabel: "Liste der 64 Hexagramme",
    ichingMethodHeading: "Die Drei-Münzen-Methode und Zhu Xis Regeln",
    ichingMethodBody:
      "Die klassische Methode verwendet drei Münzen, die sechsmal geworfen werden, um das Hexagramm Linie für Linie aufzubauen. Wenn mehrere Linien wechseln, legt die Schule von Zhu Xi (Neokonfuzianismus, 12. Jh. n. Chr.) genaue Regeln fest, um zu bestimmen, welche Linie die Lesung regiert, wodurch interpretative Mehrdeutigkeit beseitigt wird. Diese App implementiert genau diese Regeln ohne Änderung.",
    ichingWilhelmHeading: "Die Übersetzung Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm, ein deutscher Sinologe, lebte jahrzehntelang in China und erstellte 1924 die vollständigste und angesehenste Übersetzung des I Ching in westlicher Sprache, einschließlich der Urteile, Linien und Kommentare der Zehn Flügel. Cary Baynes übersetzte sie 1950 ins Englische. Dieses Werk ist 2020 gemeinfrei geworden und ist der Grundtext dieser App, ohne Modifikationen oder Vereinfachungen.",
    ichingChainHeading: "Die Authentizitätskette",
    ichingChain:
      "Ursprüngliches Zhou Yi (Zhou-Dynastie) → Konfuzius-Kommentare (5. Jh. v. Chr.) → Zhu Xis Regeln (12. Jh. n. Chr.) → Wilhelms deutsche Übersetzung (1924) → Baynes' englische Übersetzung (1950) → Gemeinfrei (2020) → Diese App.",
    bonesHeading: "Orakelknochen (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Historischer Ursprung (Shang-Dynastie, ~1600–1046 v. Chr.)",
    bonesOriginBody:
      "Die Orakelknochen-Wahrsagerei ist die älteste dokumentierte Orakelpraktik Chinas, älter als das I Ching in seiner schriftlichen Form. Die königlichen Schamanen der Shang-Dynastie verbrannten Schildkrötenpanzer oder Rinderschulterblätter und lasen die entstandenen Risse, um die Ahnen zu den militärischen, landwirtschaftlichen, klimatischen und persönlichen Entscheidungen des Königs zu befragen.",
    bonesRitualHeading: "Der rituelle Prozess",
    bonesRitualBody:
      "Der Prozess war präzise und wiederholbar: Eine positive Ladung und ihre Verneinung wurden formuliert. Glühendes Bronze wurde auf den Knochen aufgetragen, bis Risse entstanden. Die Ausrichtung, Länge und das Muster der Risse bestimmten den Befund. Das Ergebnis wurde in den Knochen selbst eingraviert, dies bildet Chinas früheste Schriftaufzeichnungen.",
    bonesVerdictsHeading: "Die fünf Befundzustände",
    bonesVerdictAuspClear: "吉. Eindeutig günstig: das Muster bestätigt die positive Ladung ohne Mehrdeutigkeit.",
    bonesVerdictAuspMod: "吉 mäßig. Mäßig günstig: Bestätigung ist vorhanden, aber mit Nuancen oder Bedingungen.",
    bonesVerdictInauspMod: "凶 mäßig. Mäßig ungünstig: das Muster neigt sich mit Vorbehalten zur Verneinung.",
    bonesVerdictInauspClear: "凶. Eindeutig ungünstig: das Muster verneint die positive Ladung ohne Mehrdeutigkeit.",
    bonesVerdictSilence:
      "沉默. Das Schweigen: das Muster erzeugt keine lesbaren Risse. In der Shang-Tradition war das Schweigen des Knochens kein Fehler; es war selbst eine Antwort: Die Ahnen sprechen nicht, weil der Moment für diese Frage noch nicht reif ist oder weil die Antwort den Rahmen dessen übersteigt, was gesagt werden kann. Diese App respektiert diesen Zustand und gibt ihn zurück, wenn das Muster es anzeigt.",
    bonesAuthHeading: "Authentizität der Methode",
    bonesAuthBody:
      "Mehr als 150.000 Orakelknochenfragmente wurden seit dem 19. Jahrhundert ausgegraben und untersucht. Sie sind international anerkanntes Kulturerbe und werden in Museen in China, Taiwan, Japan und Europa aufbewahrt. Die in dieser App implementierte Methode respektiert die strukturelle Logik des Shang-Systems: positive Ladung, negative Ladung, Befund nach Muster, einschließlich des Schweigens als legitimen Zustand.",
    yarrowHeading: "Schafgarbenstäbe (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Historische Ursprünge (~1000 v. Chr.)",
    yarrowOriginBody:
      "Die Schafgarbenstab-Methode ist das Weissagungsverfahren, das im I Ching selbst dokumentiert ist. Der Große Kommentar (大传, Dàzhuàn), einer der Zehn Flügel, hält fest: «Die Zahl der Großen Expansion ist 50, von denen 49 verwendet werden.» Konfuzius erklärte in den Analekten, er wünsche sich, die Wandlungen fünfzig Jahre lang zu studieren; klassische Gelehrte verstehen diesen Hinweis auf die Zahl 50 als direkte Anspielung auf das Stabverfahren. Die Methode ist mehr als ein Jahrtausend älter als die Drei-Münzen-Methode. Richard Wilhelm und Cary Baynes dokumentierten das vollständige Verfahren im Anhang ihrer Übersetzung (Princeton University Press, 1950).",
    yarrowProcedureHeading: "Das physische Verfahren",
    yarrowProcedureBody:
      "Die Methode verwendet eine Gruppe physischer Stäbe oder ähnlicher Gegenstände. Einer wird beiseitegelegt, die übrigen werden in einer wiederholten rituellen Abfolge geteilt und gezählt, bis jede der sechs Linien entsteht. Für Nutzer ist vor allem das Tempo wichtig: Es verlangt Aufmerksamkeit, Berührung und Geduld und wirkt dadurch zeremonieller als die Drei Münzen Methode.",
    yarrowProbHeading: "Charakter der Methode",
    yarrowProbBody:
      "Die Stäbchenmethode bewahrt ein langsameres rituelles Tempo als die Drei Münzen Methode. Ihr Wert wird in dieser App nicht als technische Tabelle dargestellt, sondern als andere Art, in dieselbe I Ging Tradition einzutreten: taktiler, bewusster und näher am klassischen Verfahren, das Wilhelm/Baynes dokumentiert haben. Für eine schnellere Befragung bleibt die Drei Münzen Methode ebenso gültig.",
    interpretHeading: "Warum die KI nicht erfindet",
    interpretBody:
      "Die künstliche Intelligenz in dieser App hat eine spezifische und begrenzte Funktion: das Ergebnis des Algorithmus (Hexagramm, bewegende Linien, Riss-Befund) zu nehmen und es in natürlicher Sprache in der Sprache des Nutzers zu artikulieren, mit dem Kontext seiner Frage. Die KI generiert keine Hexagramme, entscheidet keine Befunde, modifiziert weder Wilhelms Texte noch die Muster der Shang-Methode. Der mathematische Algorithmus tut das, getreu, bevor die KI eingreift. Die KI ist der Interpret. Das Orakel ist die Methode.",
    sourcesHeading: "Quellen und Referenzen",
  },
  it: {
    title: "Note e origine dei metodi",
    lead: "Questa pagina è un contesto tecnico-culturale. Non è una guida d'uso.",
    authNotice:
      "Tutti i metodi utilizzati in questa app provengono da tradizioni millenarie della cultura cinese, storicamente documentate e accademicamente rispettate in tutto il mondo. Questa app non inventa interpretazioni né genera significati propri, applica metodi autentici assistiti dall'intelligenza artificiale per renderli accessibili nella lingua dell'utente. Qualsiasi lettore può verificare i testi con le fonti originali elencate in fondo a questa pagina.",
    ichingHeading: "I Ching (周易 · Zhouyi)",
    ichingOriginHeading: "Origini storiche (~1000 a.C.)",
    ichingOriginBody:
      "Lo Zhouyi, «Le Mutazioni di Zhou», è uno dei testi più antichi dell'umanità. Le sue radici risalgono alla dinastia Zhou (1046–256 a.C.), sebbene il suo nucleo oracolare sia anteriore. Il testo fu costruito in strati storici distinti: il Re Wen organizzò i 64 esagrammi e scrisse i Giudizi (卦辞, guàcí) mentre era prigioniero. Suo figlio, il Duca di Zhou, aggiunse le sentenze delle sei linee (爻辞, yáocí). Secoli dopo, Confucio e i suoi discepoli aggiunsero i Commentari noti come le Dieci Ali (十翼), lo strato filosofico più profondo del testo.",
    ichingHexHeading: "Il sistema dei 64 esagrammi",
    ichingHexBody:
      "Ogni esagramma è una figura di sei linee, ciascuna yin (spezzata, ricettiva) o yang (intera, attiva). Le 64 combinazioni possibili descrivono i modelli fondamentali del cambiamento nella natura e nella vita umana. Le linee in movimento indicano trasformazione: l'esagramma presente muta in uno futuro, e quella transizione è il cuore della lettura.",
    ichingHexListHeading: "I 64 esagrammi nell'ordine di Re Wen",
    ichingHexListIntro:
      "Elenco completo dei 64 esagrammi con numero, glifo e nome classico in cinese e pinyin. Il significato non è riportato qui: ogni esagramma prende forma solo all'interno di una consultazione precisa, dove la domanda e il contesto di chi consulta determinano la lettura.",
    ichingHexListAriaLabel: "Elenco dei 64 esagrammi",
    ichingMethodHeading: "Il metodo delle tre monete e le regole di Zhu Xi",
    ichingMethodBody:
      "Il metodo classico usa tre monete lanciate sei volte per costruire l'esagramma linea per linea. Quando più linee cambiano, la scuola di Zhu Xi (neo-confucianesimo, XII secolo d.C.) stabilisce regole precise per determinare quale linea governa la lettura, eliminando l'ambiguità interpretativa. Questa app implementa esattamente quelle regole senza modifiche.",
    ichingWilhelmHeading: "La traduzione Wilhelm/Baynes",
    ichingWilhelmBody:
      "Richard Wilhelm, sinologo tedesco, visse in Cina per decenni e produsse nel 1924 la traduzione più completa e rispettata dello I Ching in lingua occidentale, inclusi i Giudizi, le linee e i Commentari delle Dieci Ali. Cary Baynes la tradusse in inglese nel 1950. Quest'opera è entrata nel dominio pubblico nel 2020 ed è il testo base di questa app, senza modifiche né semplificazioni.",
    ichingChainHeading: "La catena di autenticità",
    ichingChain:
      "Zhou Yi originale (dinastia Zhou) → Commentari di Confucio (V sec. a.C.) → Regole di Zhu Xi (XII sec. d.C.) → Traduzione Wilhelm tedesco (1924) → Traduzione Baynes inglese (1950) → Dominio pubblico (2020) → Questa app.",
    bonesHeading: "Ossa oracolari (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "Origini storiche (dinastia Shang, ~1600–1046 a.C.)",
    bonesOriginBody:
      "La divinazione con le ossa oracolari è la pratica oracolare documentata più antica della Cina, anteriore allo I Ching nella sua forma scritta. I chamani reali della dinastia Shang bruciavano piastrone di tartaruga o scapole di bue e leggevano le crepe risultanti per consultare gli antenati sulle decisioni militari, agricole, climatiche e personali del re.",
    bonesRitualHeading: "Il processo rituale",
    bonesRitualBody:
      "Il processo era preciso e ripetibile: si formulava una carica positiva e la sua negazione. Si applicava bronzo incandescente all'osso finché non si formavano crepe. L'orientamento, la lunghezza e il motivo delle crepe determinavano il verdetto. Il risultato veniva inciso nell'osso stesso, costituendo i primi documenti scritti della Cina.",
    bonesVerdictsHeading: "I cinque stati del verdetto",
    bonesVerdictAuspClear: "吉. Chiaramente favorevole: il motivo conferma la carica positiva senza ambiguità.",
    bonesVerdictAuspMod: "吉 moderato. Moderatamente favorevole: c'è conferma ma con sfumature o condizioni.",
    bonesVerdictInauspMod: "凶 moderato. Moderatamente sfavorevole: il motivo pende verso la negazione con riserve.",
    bonesVerdictInauspClear: "凶. Chiaramente sfavorevole: il motivo nega la carica positiva senza ambiguità.",
    bonesVerdictSilence:
      "沉默. Il Silenzio: il motivo non produce crepe leggibili. Nella tradizione Shang, il silenzio dell'osso non era un errore, era di per sé una risposta: gli antenati non parlano perché il momento non è maturo per quella domanda, o perché la risposta trascende ciò che può essere detto. Questa app rispetta quello stato e lo restituisce quando il motivo lo indica.",
    bonesAuthHeading: "Autenticità del metodo",
    bonesAuthBody:
      "Più di 150.000 frammenti di ossa oracolari sono stati scavati e studiati dal XIX secolo. Sono patrimonio riconosciuto internazionalmente e conservati in musei in Cina, Taiwan, Giappone ed Europa. Il metodo implementato in questa app rispetta la logica strutturale del sistema Shang: carica positiva, carica negativa, verdetto per motivo, includendo il silenzio come stato legittimo.",
    yarrowHeading: "Steli di Achillea (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "Origini storiche (~1000 a.C.)",
    yarrowOriginBody:
      "Il metodo degli steli di achillea è il procedimento di divinazione documentato nell'I Ching stesso. Il Grande Commentario (大传, Dàzhuàn), una delle Dieci Ali, precisa: «Il numero della Grande Espansione è 50, dei quali 49 vengono usati». Confucio dichiara nei Dialoghi di voler studiare le Mutazioni per cinquant'anni; gli studiosi classici leggono in quel riferimento al numero 50 un'allusione diretta al procedimento degli steli. Il metodo è anteriore di oltre un millennio a quello delle tre monete. Richard Wilhelm e Cary Baynes documentarono il procedimento completo nell'Appendice della loro traduzione (Princeton University Press, 1950).",
    yarrowProcedureHeading: "Procedura fisica",
    yarrowProcedureBody:
      "Il metodo usa un insieme di steli fisici o oggetti simili. Uno viene messo da parte e gli altri vengono divisi e contati attraverso una sequenza rituale ripetuta fino a formare ciascuna delle sei linee. Per l'utente il punto centrale è il ritmo: richiede attenzione, tatto e pazienza, rendendo la consultazione più cerimoniale rispetto alle tre monete.",
    yarrowProbHeading: "Carattere del metodo",
    yarrowProbBody:
      "Il metodo degli steli conserva un ritmo rituale più lento rispetto alle tre monete. In questa app il suo valore non viene presentato come una tabella tecnica, ma come un modo diverso di entrare nella stessa tradizione dell'I Ching: più tattile, più deliberato e più vicino alla procedura classica documentata da Wilhelm/Baynes. Il metodo delle tre monete rimane ugualmente valido per una consultazione più rapida.",
    interpretHeading: "Perché l'IA non inventa",
    interpretBody:
      "L'intelligenza artificiale in questa app ha una funzione specifica e delimitata: prendere il risultato dell'algoritmo, esagramma, linee in movimento, verdetto delle crepe, e articolarlo in linguaggio naturale nella lingua dell'utente, con il contesto della sua domanda. L'IA non genera esagrammi, non decide verdetti, non modifica i testi di Wilhelm né i motivi del metodo Shang. L'algoritmo matematico fa questo, fedelmente, prima che l'IA intervenga. L'IA è l'interprete. L'oracolo è il metodo.",
    sourcesHeading: "Fonti e riferimenti",
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
    ichingMethodHeading: "三枚銭法と朱熹の規則",
    ichingMethodBody:
      "古典的な方法は、三枚の銭を六回投じて卦を一爻ずつ構築します。複数の爻が変化する場合、朱熹の学派（新儒学、12世紀）は、どの爻が占いを支配するかを決定する精確な規則を設けており、解釈上の曖昧さを排除しています。このアプリはその規則を改変なく正確に実装しています。",
    ichingWilhelmHeading: "ヴィルヘルム/バインズ訳",
    ichingWilhelmBody:
      "ドイツ人中国学者リヒャルト・ヴィルヘルムは数十年間中国に住み、1924年に西洋語として最も完全で尊重される易経の翻訳を出版しました。卦辞、爻辞、十翼の彖伝を含んでいます。キャリー・バインズが1950年に英語に翻訳しました。この著作は2020年にパブリックドメインに入り、このアプリのベーステキストです, 改変も簡略化もなく。",
    ichingChainHeading: "正統性の連鎖",
    ichingChain:
      "原典周易（周王朝）→ 孔子の彖伝（紀元前5世紀）→ 朱熹の規則（12世紀）→ ヴィルヘルムのドイツ語訳（1924年）→ バインズの英語訳（1950年）→ パブリックドメイン（2020年）→ 本アプリ。",
    bonesHeading: "甲骨占い（甲骨 · Jiǎgǔ）",
    bonesOriginHeading: "歴史的起源（商王朝、紀元前1600〜1046年頃）",
    bonesOriginBody:
      "甲骨占いは中国で文書化された最古の卜筮法であり、成文化された易経より古い伝統です。商王朝の王室の巫祝は亀の甲羅や牛の肩甲骨を焼き、生じた亀裂を読み取ることで、軍事・農業・気候・王個人の決定について祖先に伺いを立てました。",
    bonesRitualHeading: "儀式のプロセス",
    bonesRitualBody:
      "このプロセスは精確で反復可能でした：肯定的な命題とその否定を定式化します。骨に白熱した青銅を当て、亀裂を生じさせます。亀裂の方向、長さ、パターンが神託を決定しました。結果は骨そのものに刻まれ、中国最古の文字記録を構成しています。",
    bonesVerdictsHeading: "神託の五つの状態",
    bonesVerdictAuspClear: "吉, 明確に吉：パターンは曖昧さなく肯定命題を確認します。",
    bonesVerdictAuspMod: "吉 中程度, やや吉：確認はありますが、ニュアンスや条件が伴います。",
    bonesVerdictInauspMod: "凶 中程度, やや凶：パターンは留保付きで否定に傾きます。",
    bonesVerdictInauspClear: "凶, 明確に凶：パターンは曖昧さなく肯定命題を否定します。",
    bonesVerdictSilence:
      "沉默, 沈黙：パターンは読み取れる亀裂を生じさせません。商の伝統では、骨の沈黙はエラーではなく、それ自体が答えでした：祖先は、その問いの時が熟していないため、あるいはその答えが言語で表現できる範囲を超えているために語らない。このアプリはその状態を尊重し、パターンが示す際にそれを返します。",
    bonesAuthHeading: "手法の正統性",
    bonesAuthBody:
      "19世紀以降、15万点を超える甲骨の断片が発掘・研究されてきました。それらは国際的に認められた文化遺産であり、中国・台湾・日本・ヨーロッパの博物館に保存されています。このアプリで実装された手法は、商システムの構造的論理を尊重しています：肯定命題、否定命題、パターンによる神託、沈黙を正当な状態として含めて。",
    yarrowHeading: "蓍草による占い (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "歴史的起源（紀元前約1000年）",
    yarrowOriginBody:
      "蓍草による占いの方法は、易経そのものに記録されている卜占手順です。十翼のひとつである大伝（大传, Dàzhuàn）には「大衍之数五十、其用四十有九（大いなる展開の数は50、そのうち49を使う）」と明記されています。論語では孔子が易を学ぶために五十年欲しいと述べており、古典学者たちはその「50」という数への言及を蓍草の手順への直接的な示唆と理解しています。この方法は三枚硬貨法よりも千年以上古いものです。リヒャルト・ヴィルヘルムとケーリー・ベインズは1950年の翻訳の付録（プリンストン大学出版）に完全な手順を記録しています。",
    yarrowProcedureHeading: "物理的な手順",
    yarrowProcedureBody:
      "この方法では、物理的な筮竹または同様の物を用います。一つを取り分け、残りを儀礼的な順序で分けて数え、六つの爻を形成していきます。利用者にとって大切なのはそのリズムです。注意、触覚、忍耐を求めるため、三枚硬貨よりも儀礼的な相談として感じられます。",
    yarrowProbHeading: "方法の性格",
    yarrowProbBody:
      "筮竹の方法は、三枚硬貨よりもゆっくりした儀礼的なリズムを保ちます。このアプリでは、その価値を技術的な表としてではなく、同じ易経伝統に入る別の方法として示しています。より触覚的で、より意識的で、Wilhelm/Baynes が記録した古典的手順に近いものです。より速い占いには三枚硬貨の方法も同じく有効です。",
    interpretHeading: "AIが発明しない理由",
    interpretBody:
      "このアプリの人工知能には特定かつ限定的な機能があります：アルゴリズムの結果（卦、動爻、亀裂の神託）を受け取り、ユーザーの質問のコンテキストと共に、ユーザーの言語で自然言語として表現することです。AIは卦を生成せず、神託を決定せず、ヴィルヘルムのテキストも商の手法のパターンも改変しません。数学的アルゴリズムがそれを忠実に行い、その後AIが介入します。AIは解釈者です。神託は手法です。",
    sourcesHeading: "出典と参考文献",
  },
  zh: {
    title: "方法注记与起源",
    lead: "本页为技术文化背景说明，非使用指南。",
    authNotice:
      "本应用所使用的所有方法均源自中国文化数千年的传统，有历史文献记载，在全球学术界受到广泛尊重。本应用不自创解读，不生成独有含义，而是借助人工智能辅助，将真实可信的传统方法以用户语言呈现。任何读者均可与本页末尾所列原始文献相互印证。",
    ichingHeading: "易经（周易 · Zhouyi）",
    ichingOriginHeading: "历史渊源（约公元前1000年）",
    ichingOriginBody:
      "周易（\"周之变化\"）是人类最古老的文献之一。其根源可追溯至周朝（公元前1046至256年），但其卜筮核心更为久远。该文本由不同历史层次累积而成：文王在囚禁中整理了64卦，并写下了卦辞（guàcí）；其子周公补充了六爻辞（爻辞，yáocí）；数百年后，孔子及其弟子增添了被称为十翼的传注，构成文本最深刻的哲学层次。",
    ichingHexHeading: "六十四卦系统",
    ichingHexBody:
      "每一卦由六爻组成，每爻为阴（断裂，柔顺）或阳（连续，刚健）。六十四种可能的组合描述了自然与人类生活中变化的根本规律。动爻指示转变：当下之卦变化为未来之卦，这一转变正是占卜的核心所在。",
    ichingHexListHeading: "周文王序列下的六十四卦总览",
    ichingHexListIntro:
      "完整列出六十四卦的卦序、卦象、汉字名称与拼音。此处不附释义：每一卦的意涵都只有在具体咨询中才会成形，由问题与问卜者的处境共同决定解读。",
    ichingHexListAriaLabel: "六十四卦列表",
    ichingMethodHeading: "三枚铜钱法与朱熹规则",
    ichingMethodBody:
      "经典方法以三枚铜钱掷六次，逐爻构建卦象。当多爻变动时，朱熹学派（新儒家，公元12世纪）制定了精确的规则，以确定哪一爻主导解读，从而消除解释上的歧义。本应用严格按照这些规则实施，未作任何修改。",
    ichingWilhelmHeading: "卫礼贤／贝恩斯译本",
    ichingWilhelmBody:
      "德国汉学家卫礼贤（Richard Wilhelm）在中国生活数十年，于1924年出版了西方语言中最完整、最受推崇的易经译本，包括卦辞、爻辞及十翼注解。贝恩斯（Cary Baynes）于1950年将其译为英文。该著作于2020年进入公有领域，是本应用的基础文本，未作任何修改或简化。",
    ichingChainHeading: "真实性传承链",
    ichingChain:
      "原始周易（周朝）→ 孔子注疏（公元前5世纪）→ 朱熹规则（12世纪）→ 卫礼贤德文译本（1924年）→ 贝恩斯英文译本（1950年）→ 公有领域（2020年）→ 本应用。",
    bonesHeading: "甲骨占卜（甲骨 · Jiǎgǔ）",
    bonesOriginHeading: "历史渊源（商朝，约公元前1600至1046年）",
    bonesOriginBody:
      "甲骨占卜是中国有文献记载的最古老卜筮实践，早于成文形式的易经。商朝王室巫师灼烧龟腹甲或牛肩胛骨，通过解读所产生的裂纹，就军事、农业、气候及王的个人决策向祖先问卜。",
    bonesRitualHeading: "仪式过程",
    bonesRitualBody:
      "该过程精确且可重复：先确立正面命题及其否定；将灼热青铜施于骨上，直至产生裂纹；裂纹的方向、长度和纹样决定兆辞；结果刻于骨上，由此构成中国最早的文字记录。",
    bonesVerdictsHeading: "五种兆辞状态",
    bonesVerdictAuspClear: "吉, 明显为吉：纹样明确确认正面命题，无歧义。",
    bonesVerdictAuspMod: "偏吉, 偏向为吉：有所确认，但带有条件或细微差别。",
    bonesVerdictInauspMod: "偏凶, 偏向为凶：纹样有所保留地倾向否定。",
    bonesVerdictInauspClear: "凶, 明显为凶：纹样明确否定正面命题，无歧义。",
    bonesVerdictSilence:
      "静默, 沉默：纹样未产生可解读的裂纹。在商代传统中，骨的沉默并非失误，本身即为答复：祖先不言，是因为此问时机未到，或答案超越了可言说的范畴。本应用尊重此状态，并在纹样指示时予以返回。",
    bonesAuthHeading: "方法的真实性",
    bonesAuthBody:
      "自19世纪以来，已出土并研究了逾15万件甲骨碎片。它们是国际公认的文化遗产，保存于中国、台湾、日本及欧洲的博物馆中。本应用所实施的方法忠实于商代系统的结构逻辑：正面命题、负面命题、依纹样作兆辞，并将沉默视为合法状态。",
    yarrowHeading: "蓍草占法 (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "历史渊源（约公元前1000年）",
    yarrowOriginBody:
      "蓍草占法是易经本身所记载的占卜程序。十翼之一的大传（大传, Dàzhuàn）明确指出：「大衍之数五十，其用四十有九。」孔子在《论语》中表示希望花五十年研习《周易》；古典学者将这一「五十」的引用理解为对蓍草程序的直接暗示。该方法比三枚铜钱法早一千余年。卫礼贤与贝恩斯在其1950年译本的附录（普林斯顿大学出版社）中记录了完整的操作步骤。",
    yarrowProcedureHeading: "实物操作步骤",
    yarrowProcedureBody:
      "这种方法使用一组实体蓍草或类似物件。先取出一根，其余部分通过反复的仪式顺序来分合与计数，直到形成六爻。对用户来说，关键在于节奏：它需要注意力、触感和耐心，因此比三枚铜钱方法更具仪式感。",
    yarrowProbHeading: "方法的气质",
    yarrowProbBody:
      "蓍草方法保留了比三枚铜钱更慢的仪式节奏。在本应用中，它的价值不以技术表格呈现，而是作为进入同一《易经》传统的另一种方式：更具触感，更审慎，也更接近 Wilhelm/Baynes 所记录的经典程序。若需要更快速的咨询，三枚铜钱方法同样有效。",
    interpretHeading: "为何人工智能不自创内容",
    interpretBody:
      "本应用中的人工智能具有特定且有限的功能：获取算法结果（卦象、动爻、裂纹兆辞）并结合用户问题的语境，以用户的语言将其表述为自然语言。人工智能不生成卦象，不裁定兆辞，不修改卫礼贤的文本，也不改变商代方法的纹样。数学算法在人工智能介入之前，已忠实地完成了这一切。人工智能是解读者，神谕是方法本身。",
    sourcesHeading: "来源与参考文献",
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
    ichingMethodHeading: "삼전법과 주희의 규칙",
    ichingMethodBody:
      "고전적 방법은 동전 세 개를 여섯 번 던져 효를 하나씩 구성합니다. 여러 효가 변할 때, 주희 학파（신유학, 12세기）는 어떤 효가 독해를 지배하는지를 결정하는 정확한 규칙을 확립하여 해석상의 모호성을 제거합니다. 이 앱은 수정 없이 해당 규칙을 정확히 구현합니다.",
    ichingWilhelmHeading: "빌헬름/베인스 번역",
    ichingWilhelmBody:
      "독일 중국학자 리하르트 빌헬름은 수십 년간 중국에 살며 1924년 서양 언어로 된 가장 완전하고 권위 있는 주역 번역서를 출간했습니다. 괘사, 효사, 십익 전통을 모두 포함합니다. 케리 베인스가 1950년 영어로 번역했습니다. 이 저작은 2020년에 공공 도메인에 진입하였으며, 이 앱의 기본 텍스트입니다, 수정이나 단순화 없이.",
    ichingChainHeading: "정통성의 연쇄",
    ichingChain:
      "원본 주역（주나라）→ 공자 전통（기원전 5세기）→ 주희 규칙（12세기）→ 빌헬름 독일어 번역（1924년）→ 베인스 영어 번역（1950년）→ 공공 도메인（2020년）→ 이 앱.",
    bonesHeading: "갑골 점복（甲骨 · Jiǎgǔ）",
    bonesOriginHeading: "역사적 기원（상나라, 기원전 1600~1046년경）",
    bonesOriginBody:
      "갑골 점복은 중국에서 문서화된 가장 오래된 점복 실천으로, 기록된 형태의 주역보다도 앞선 전통입니다. 상나라의 왕실 무당들은 거북 배갑이나 소 견갑골을 태우고 생긴 균열을 읽어 군사, 농업, 기후, 왕의 개인적 결정에 대해 조상에게 물었습니다.",
    bonesRitualHeading: "의례적 과정",
    bonesRitualBody:
      "이 과정은 정확하고 반복 가능했습니다: 긍정적인 명제와 그 부정을 공식화합니다. 뼈에 뜨거운 청동을 가하여 균열을 냅니다. 균열의 방향, 길이, 패턴이 신탁을 결정했습니다. 결과는 뼈 자체에 새겨졌으며, 이는 중국 최초의 문자 기록을 구성합니다.",
    bonesVerdictsHeading: "신탁의 다섯 가지 상태",
    bonesVerdictAuspClear: "吉, 명확히 길함: 패턴이 긍정 명제를 모호함 없이 확인합니다.",
    bonesVerdictAuspMod: "吉 중간, 다소 길함: 확인이 있지만 뉘앙스나 조건이 따릅니다.",
    bonesVerdictInauspMod: "凶 중간, 다소 흉함: 패턴이 유보적으로 부정 쪽으로 기웁니다.",
    bonesVerdictInauspClear: "凶, 명확히 흉함: 패턴이 긍정 명제를 모호함 없이 부정합니다.",
    bonesVerdictSilence:
      "침묵, 沉默: 패턴이 읽을 수 있는 균열을 생성하지 않습니다. 상 전통에서 뼈의 침묵은 오류가 아니라 그 자체로 응답이었습니다: 조상들은 그 질문에 대한 때가 무르익지 않았거나, 그 답이 말로 표현될 수 있는 범위를 초월하기 때문에 말하지 않습니다. 이 앱은 해당 상태를 존중하고 패턴이 나타낼 때 반환합니다.",
    bonesAuthHeading: "방법의 정통성",
    bonesAuthBody:
      "19세기 이래 15만 점 이상의 갑골 파편이 발굴되어 연구되었습니다. 이는 국제적으로 인정받는 문화유산으로 중국, 대만, 일본, 유럽의 박물관에 보존되어 있습니다. 이 앱에서 구현된 방법은 상 체계의 구조적 논리를 존중합니다: 긍정 명제, 부정 명제, 패턴에 의한 신탁, 침묵을 합법적 상태로 포함하여.",
    yarrowHeading: "시초점법 (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "역사적 기원 (기원전 약 1000년)",
    yarrowOriginBody:
      "시초 방법은 역경 자체에 기록된 점술 절차입니다. 십익 중 하나인 대전(大传, Dàzhuàn)은 구체적으로 기술합니다: '대연지수오십, 기용사십유구(대연의 수는 50이며 그 중 49를 사용한다).' 공자는 논어에서 역을 오십 년간 공부하고 싶다고 밝혔으며, 고전학자들은 이 50이라는 숫자를 시초 절차에 대한 직접적인 암시로 해석합니다. 이 방법은 삼전법보다 천 년 이상 앞섭니다. 리하르트 빌헬름과 캐리 베인스는 1950년 번역본 부록(프린스턴 대학 출판부)에 전체 절차를 기록했습니다.",
    yarrowProcedureHeading: "실물 절차",
    yarrowProcedureBody:
      "이 방법은 실제 시초나 비슷한 물건의 묶음을 사용합니다. 하나를 따로 두고 나머지를 반복되는 의례적 순서에 따라 나누고 세어 여섯 효를 형성합니다. 사용자에게 중요한 것은 그 리듬입니다. 주의, 촉감, 인내를 요구하기 때문에 세 동전 방법보다 더 의례적인 상담처럼 느껴집니다.",
    yarrowProbHeading: "방법의 성격",
    yarrowProbBody:
      "시초 방법은 세 동전 방법보다 더 느린 의례적 리듬을 보존합니다. 이 앱에서 그 가치는 기술적인 표가 아니라 같은 주역 전통에 들어가는 다른 방식으로 제시됩니다. 더 촉각적이고, 더 신중하며, Wilhelm/Baynes가 기록한 고전적 절차에 더 가깝습니다. 빠른 상담에는 세 동전 방법도 똑같이 유효합니다.",
    interpretHeading: "인공지능이 창작하지 않는 이유",
    interpretBody:
      "이 앱의 인공지능은 특정하고 한정된 기능을 수행합니다: 알고리즘의 결과, 괘, 변효, 균열 신탁, 를 받아 사용자의 질문 맥락과 함께 사용자의 언어로 자연어로 표현하는 것입니다. AI는 괘를 생성하지 않고, 신탁을 결정하지 않으며, 빌헬름의 텍스트나 상 방법의 패턴을 수정하지 않습니다. 수학적 알고리즘이 AI가 개입하기 전에 충실히 그 역할을 합니다. AI는 해석자입니다. 신탁은 방법 그 자체입니다.",
    sourcesHeading: "출처 및 참고문헌",
  },
  ar: {
    title: "ملاحظات وأصول الطرق",
    lead: "هذه الصفحة سياق تقني وثقافي. إنها ليست دليل استخدام.",
    authNotice:
      "جميع الطرق المستخدمة في هذا التطبيق مستمدة من تقاليد عريقة في الثقافة الصينية، موثقة تاريخياً ومحترمة أكاديمياً في جميع أنحاء العالم. لا يخترع هذا التطبيق تفسيرات ولا يولد معاني خاصة به, بل يطبق طرقاً أصيلة بمساعدة الذكاء الاصطناعي لجعلها في متناول المستخدم بلغته. يمكن لأي قارئ مقارنة النصوص بالمصادر الأصلية المدرجة في نهاية هذه الصفحة.",
    ichingHeading: "الآي تشينغ (周易 · Zhouyi)",
    ichingOriginHeading: "الأصول التاريخية (نحو 1000 قبل الميلاد)",
    ichingOriginBody:
      "الـ Zhouyi, «تحولات الـ Zhou», هو أحد أقدم النصوص في تاريخ البشرية. تعود جذوره إلى أسرة Zhou (1046–256 قبل الميلاد)، وإن كان نواته الكهنوتية أقدم من ذلك. بُني النص في طبقات تاريخية متمايزة: نظّم الملك Wen الأغراض الـ 64 وكتب الأحكام (卦辞، guàcí) أثناء سجنه. أضاف ابنه الدوق Zhou عبارات الأسطر الست (爻辞، yáocí). وبعد قرون، أضاف كونفوشيوس وتلاميذه التعليقات المعروفة بـ «الأجنحة العشرة» (十翼)، أعمق الطبقات الفلسفية في النص.",
    ichingHexHeading: "نظام الأغراض الأربعة والستين",
    ichingHexBody:
      "كل غرض هو شكل من ستة خطوط، كل منها إما يين (مكسور، متقبّل) أو يانغ (مستمر، نشط). تصف الـ 64 تركيبة الممكنة الأنماط الأساسية للتغيير في الطبيعة والحياة البشرية. تشير الخطوط المتحركة إلى التحول: الغرض الحاضر يتحول إلى غرض مستقبلي، وهذا الانتقال هو جوهر القراءة.",
    ichingHexListHeading: "الأغراض الأربعة والستون وفق ترتيب الملك Wen",
    ichingHexListIntro:
      "قائمة كاملة بالأغراض الأربعة والستين مع رقم كل غرض ورمزه واسمه الكلاسيكي بالصينية والبينين. لا يُذكر هنا معناها: لا يكتمل أي غرض إلا داخل استشارة محددة، حيث يحدد سؤال المستشير وسياقه الشخصي القراءة.",
    ichingHexListAriaLabel: "قائمة الأغراض الأربعة والستين",
    ichingMethodHeading: "طريقة العملات الثلاث وقواعد Zhu Xi",
    ichingMethodBody:
      "تستخدم الطريقة الكلاسيكية ثلاث عملات تُقذف ست مرات لبناء الغرض خطاً بخط. عندما تتغير خطوط متعددة، تضع مدرسة Zhu Xi (الكونفوشيانية الجديدة، القرن الثاني عشر الميلادي) قواعد دقيقة لتحديد أي خط يحكم القراءة، مما يزيل الغموض التفسيري. ينفذ هذا التطبيق تلك القواعد بدقة دون أي تعديل.",
    ichingWilhelmHeading: "ترجمة Wilhelm/Baynes",
    ichingWilhelmBody:
      "ريتشارد فيلهلم، المستشرق الألماني، عاش في الصين عقوداً وأنتج عام 1924 الترجمة الأكثر اكتمالاً واحتراماً للـ I Ching في اللغات الغربية، بما فيها الأحكام والخطوط وتعليقات «الأجنحة العشرة». ترجمتها كاري بينز إلى الإنجليزية عام 1950. دخل هذا العمل النطاق العام عام 2020 وهو النص الأساسي لهذا التطبيق, دون تعديلات أو تبسيطات.",
    ichingChainHeading: "سلسلة الأصالة",
    ichingChain:
      "الـ Zhou Yi الأصلي (أسرة Zhou) → تعليقات كونفوشيوس (القرن الخامس قبل الميلاد) → قواعد Zhu Xi (القرن الثاني عشر الميلادي) → ترجمة Wilhelm الألمانية (1924) → ترجمة Baynes الإنجليزية (1950) → النطاق العام (2020) → هذا التطبيق.",
    bonesHeading: "عظام العرافة (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "الأصول التاريخية (أسرة Shang، نحو 1600–1046 قبل الميلاد)",
    bonesOriginBody:
      "التكهن بعظام العرافة هو أقدم ممارسة كهنوتية موثقة في الصين، تسبق الـ I Ching في شكله المكتوب. كان شامانو أسرة Shang الملكية يحرقون درع السلاحف أو لوح كتف الثور ويقرؤون الشقوق الناتجة للتشاور مع الأسلاف حول القرارات العسكرية والزراعية والمناخية والشخصية للملك.",
    bonesRitualHeading: "العملية الطقسية",
    bonesRitualBody:
      "كانت العملية دقيقة وقابلة للتكرار: تُصاغ شحنة إيجابية ونقيضها. يُطبق برونز متوهج على العظمة حتى تتشكل الشقوق. يحدد اتجاه الشقوق وطولها ونمطها الحكم. يُنقش الناتج على العظمة نفسها, مشكّلاً أقدم السجلات المكتوبة في الصين.",
    bonesVerdictsHeading: "الحالات الخمس للحكم",
    bonesVerdictAuspClear: "吉, مبشّر بوضوح: يؤكد النمط الشحنة الإيجابية دون غموض.",
    bonesVerdictAuspMod: "吉 معتدل, مبشّر بدرجة معتدلة: التأكيد موجود لكن مع فروق دقيقة أو شروط.",
    bonesVerdictInauspMod: "凶 معتدل, غير مبشّر بدرجة معتدلة: يميل النمط نحو النفي مع تحفظات.",
    bonesVerdictInauspClear: "凶, غير مبشّر بوضوح: ينفي النمط الشحنة الإيجابية دون غموض.",
    bonesVerdictSilence:
      "沉默, الصمت: لا ينتج النمط شقوقاً يمكن قراءتها. في التقليد Shang، لم يكن صمت العظمة خطأً, كان في حد ذاته إجابة: الأسلاف لا يتكلمون لأن اللحظة لم تنضج لهذا السؤال، أو لأن الإجابة تتجاوز ما يمكن قوله. يحترم هذا التطبيق هذه الحالة ويعيدها عندما يشير إليها النمط.",
    bonesAuthHeading: "أصالة الطريقة",
    bonesAuthBody:
      "تم استخراج ودراسة أكثر من 150,000 شظية من عظام العرافة منذ القرن التاسع عشر. هي تراث معترف به دولياً وتُحفظ في متاحف في الصين وتايوان واليابان وأوروبا. تحترم الطريقة المُنفَّذة في هذا التطبيق المنطق الهيكلي لنظام Shang: الشحنة الإيجابية، الشحنة السلبية، الحكم بالنمط، بما في ذلك الصمت كحالة مشروعة.",
    yarrowHeading: "عيدان الزنبق (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "الأصول التاريخية (~1000 قبل الميلاد)",
    yarrowOriginBody:
      "طريقة عيدان الزنبق هي إجراء العرافة الموثق في I Ching نفسه. يُحدد التعليق الكبير (大传، Dàzhuàn)، أحد العشر أجنحة: «عدد التوسع الكبير هو خمسون، يُستخدم منها تسعة وأربعون». ويُروى في الأناليكت أن كونفوشيوس قال إنه يتمنى دراسة التحولات خمسين سنة؛ يفهم العلماء الكلاسيكيون هذه الإشارة إلى عدد 50 تلميحاً مباشراً إلى إجراء العيدان. الطريقة أقدم من طريقة الأسكة الثلاث بأكثر من ألف سنة. وثّق ريتشارد فيلهلم وكاري بيانز الإجراء كاملاً في ملحق ترجمتهما (مطبعة جامعة برينستون، 1950).",
    yarrowProcedureHeading: "الإجراء الفيزيائي",
    yarrowProcedureBody:
      "تستخدم الطريقة مجموعة من السيقان المادية أو أشياء مشابهة. يوضع أحدها جانبا، وتُقسّم البقية وتُعد عبر تسلسل طقسي متكرر حتى تتكوّن الخطوط الستة. المهم للمستخدم هو الإيقاع: فهي تطلب الانتباه واللمس والصبر، وتجعل الاستشارة أكثر طقسية من طريقة العملات الثلاث.",
    yarrowProbHeading: "طابع الطريقة",
    yarrowProbBody:
      "تحافظ طريقة السيقان على إيقاع طقسي أبطأ من طريقة العملات الثلاث. في هذا التطبيق لا تعرض قيمتها كجدول تقني، بل كطريقة مختلفة للدخول في تقليد الآي تشينغ نفسه: أكثر لمسا، وأكثر تعمدا، وأقرب إلى الإجراء الكلاسيكي الذي وثقه ويلهلم/باينز. وتظل طريقة العملات الثلاث صالحة بالقدر نفسه للاستشارة الأسرع.",
    interpretHeading: "لماذا الذكاء الاصطناعي لا يخترع",
    interpretBody:
      "للذكاء الاصطناعي في هذا التطبيق وظيفة محددة ومحدودة: أخذ نتيجة الخوارزمية, الغرض، الخطوط المتحركة، حكم الشقوق, وصياغتها بلغة طبيعية في لغة المستخدم، مع سياق سؤاله. لا يُولّد الذكاء الاصطناعي أغراضاً، ولا يقرر أحكاماً، ولا يعدّل نصوص Wilhelm أو أنماط طريقة Shang. الخوارزمية الرياضية تفعل ذلك بأمانة قبل أن يتدخل الذكاء الاصطناعي. الذكاء الاصطناعي هو المفسر. العرافة هي الطريقة.",
    sourcesHeading: "المصادر والمراجع",
  },
  hi: {
    title: "विधि नोट्स और उत्पत्ति",
    lead: "यह पृष्ठ तकनीकी-सांस्कृतिक संदर्भ है। यह उपयोग मार्गदर्शिका नहीं है।",
    authNotice:
      "इस ऐप में उपयोग की जाने वाली सभी विधियां चीनी संस्कृति की हजारों साल पुरानी परंपराओं से आती हैं, जो ऐतिहासिक रूप से दस्तावेज़ीकृत और दुनिया भर में शैक्षणिक रूप से सम्मानित हैं। यह ऐप कोई व्याख्या नहीं बनाता और न ही अपने खुद के अर्थ उत्पन्न करता है, यह उपयोगकर्ता की भाषा में पहुंच योग्य बनाने के लिए कृत्रिम बुद्धिमत्ता की सहायता से प्रामाणिक विधियों को लागू करता है। कोई भी पाठक इस पृष्ठ के अंत में सूचीबद्ध मूल स्रोतों के साथ ग्रंथों की तुलना कर सकता है।",
    ichingHeading: "आई चिंग (周易 · Zhouyi)",
    ichingOriginHeading: "ऐतिहासिक उत्पत्ति (लगभग 1000 ईसा पूर्व)",
    ichingOriginBody:
      "झोऊयी, 'झोऊ के परिवर्तन', मानवता के सबसे प्राचीन ग्रंथों में से एक है। इसकी जड़ें झोऊ राजवंश (1046–256 ईसा पूर्व) तक जाती हैं, हालांकि इसका भविष्यवाणी केंद्र इससे भी पहले का है। यह पाठ विभिन्न ऐतिहासिक परतों में बनाया गया था: राजा वेन ने कैद में रहते हुए 64 हेक्साग्राम का आयोजन किया और निर्णय (卦辞, guàcí) लिखे। उनके पुत्र झोऊ के ड्यूक ने छह रेखाओं के वाक्य (爻辞, yáocí) जोड़े। सदियों बाद, कन्फ्यूशियस और उनके शिष्यों ने दस पंखों (十翼) के रूप में जाने जाने वाले टिप्पणियां जोड़ीं, जो पाठ की सबसे गहरी दार्शनिक परत है।",
    ichingHexHeading: "64 हेक्साग्राम प्रणाली",
    ichingHexBody:
      "प्रत्येक हेक्साग्राम छह रेखाओं की एक आकृति है, प्रत्येक यिन (टूटी हुई, ग्रहणशील) या यांग (अखंड, सक्रिय)। 64 संभावित संयोजन प्रकृति और मानव जीवन में परिवर्तन के मौलिक पैटर्न का वर्णन करते हैं। गतिशील रेखाएं परिवर्तन का संकेत देती हैं: वर्तमान हेक्साग्राम एक भविष्य के हेक्साग्राम में बदल जाता है, और वह संक्रमण पाठन का केंद्र है।",
    ichingHexListHeading: "राजा वेन के क्रम में 64 हेक्साग्राम",
    ichingHexListIntro:
      "सभी 64 हेक्साग्रामों की पूरी सूची, उनके क्रमांक, चिह्न और चीनी तथा पिनयिन में पारंपरिक नाम के साथ। उनका अर्थ यहां नहीं दिया गया है: प्रत्येक हेक्साग्राम केवल किसी ठोस परामर्श के भीतर ही रूप लेता है, जहां प्रश्न और परामर्शक का संदर्भ पठन तय करते हैं।",
    ichingHexListAriaLabel: "64 हेक्साग्रामों की सूची",
    ichingMethodHeading: "तीन सिक्कों की विधि और Zhu Xi के नियम",
    ichingMethodBody:
      "शास्त्रीय विधि तीन सिक्कों का उपयोग करती है जिन्हें छह बार फेंका जाता है ताकि हेक्साग्राम एक-एक रेखा बनाया जा सके। जब कई रेखाएं बदलती हैं, तो Zhu Xi स्कूल (नव-कन्फ्यूशीवाद, 12वीं सदी ई.) सटीक नियम स्थापित करता है जो यह निर्धारित करते हैं कि कौन सी रेखा पाठन को नियंत्रित करती है, व्याख्यात्मक अस्पष्टता को समाप्त करते हुए। यह ऐप बिना किसी संशोधन के उन नियमों को सटीक रूप से लागू करता है।",
    ichingWilhelmHeading: "Wilhelm/Baynes अनुवाद",
    ichingWilhelmBody:
      "जर्मन चीनी विद्वान रिचर्ड विल्हेम दशकों तक चीन में रहे और 1924 में पश्चिमी भाषाओं में I Ching का सबसे पूर्ण और सम्मानित अनुवाद प्रस्तुत किया, जिसमें निर्णय, रेखाएं और दस पंखों की टिप्पणियां शामिल हैं। Cary Baynes ने इसे 1950 में अंग्रेजी में अनुवाद किया। यह कार्य 2020 में सार्वजनिक डोमेन में आ गया और इस ऐप का आधार पाठ है, बिना किसी संशोधन या सरलीकरण के।",
    ichingChainHeading: "प्रामाणिकता की श्रृंखला",
    ichingChain:
      "मूल Zhou Yi (झोऊ राजवंश) → कन्फ्यूशियस की टिप्पणियां (5वीं सदी ईसा पूर्व) → Zhu Xi के नियम (12वीं सदी) → Wilhelm का जर्मन अनुवाद (1924) → Baynes का अंग्रेजी अनुवाद (1950) → सार्वजनिक डोमेन (2020) → यह ऐप।",
    bonesHeading: "दैवज्ञ हड्डियां (甲骨 · Jiǎgǔ)",
    bonesOriginHeading: "ऐतिहासिक उत्पत्ति (शांग राजवंश, लगभग 1600–1046 ईसा पूर्व)",
    bonesOriginBody:
      "दैवज्ञ हड्डी भविष्यवाणी चीन की सबसे पुरानी दस्तावेज़ीकृत भविष्यवाणी प्रथा है, जो I Ching से भी पहले की है। शांग राजवंश के शाही ओझाओं ने कछुए की छाती की हड्डी या बैल के कंधे की हड्डी को जलाया और परिणामी दरारों को पढ़कर राजा के सैन्य, कृषि, जलवायु और व्यक्तिगत निर्णयों के बारे में पूर्वजों से परामर्श किया।",
    bonesRitualHeading: "अनुष्ठान प्रक्रिया",
    bonesRitualBody:
      "प्रक्रिया सटीक और दोहराने योग्य थी: एक सकारात्मक प्रस्ताव और उसका खंडन तैयार किया जाता था। हड्डी पर तप्त कांसे को तब तक लगाया जाता था जब तक दरारें न बन जाएं। दरारों की दिशा, लंबाई और पैटर्न निर्णय निर्धारित करता था। परिणाम हड्डी पर ही उकेरा जाता था, जो चीन के सबसे पुराने लिखित अभिलेख बनाता है।",
    bonesVerdictsHeading: "निर्णय की पांच अवस्थाएं",
    bonesVerdictAuspClear: "吉, स्पष्ट रूप से शुभ: पैटर्न बिना किसी संदेह के सकारात्मक प्रस्ताव की पुष्टि करता है।",
    bonesVerdictAuspMod: "吉 मध्यम, मध्यम रूप से शुभ: पुष्टि मौजूद है लेकिन बारीकियों या शर्तों के साथ।",
    bonesVerdictInauspMod: "凶 मध्यम, मध्यम रूप से अशुभ: पैटर्न आरक्षणों के साथ नकारात्मकता की ओर झुकता है।",
    bonesVerdictInauspClear: "凶, स्पष्ट रूप से अशुभ: पैटर्न बिना किसी संदेह के सकारात्मक प्रस्ताव को नकारता है।",
    bonesVerdictSilence:
      "沉默, मौन: पैटर्न पठनीय दरारें उत्पन्न नहीं करता। शांग परंपरा में, हड्डी का मौन एक त्रुटि नहीं था, यह स्वयं एक उत्तर था: पूर्वज इसलिए नहीं बोलते क्योंकि उस प्रश्न के लिए क्षण परिपक्व नहीं है, या क्योंकि उत्तर उस सीमा से परे है जो कहा जा सकता है। यह ऐप उस अवस्था का सम्मान करता है और जब पैटर्न इसे इंगित करता है तो इसे लौटाता है।",
    bonesAuthHeading: "विधि की प्रामाणिकता",
    bonesAuthBody:
      "19वीं सदी से 1,50,000 से अधिक दैवज्ञ हड्डी के टुकड़ों की खुदाई और अध्ययन किया गया है। वे अंतरराष्ट्रीय स्तर पर मान्यता प्राप्त विरासत हैं और चीन, ताइवान, जापान और यूरोप के संग्रहालयों में संरक्षित हैं। इस ऐप में लागू विधि शांग प्रणाली के संरचनात्मक तर्क का सम्मान करती है: सकारात्मक प्रस्ताव, नकारात्मक प्रस्ताव, पैटर्न द्वारा निर्णय, मौन को वैध अवस्था के रूप में शामिल करते हुए।",
    yarrowHeading: "यारो की छड़ें (蓍草 · Shīcǎo)",
    yarrowOriginHeading: "ऐतिहासिक उत्पत्ति (~1000 ईसा पूर्व)",
    yarrowOriginBody:
      "यारो की छड़ों की विधि वह दिव्यज्ञान प्रक्रिया है जो स्वयं I Ching में प्रलेखित है। दस पंखों में से एक, महान टीका (大传, Dàzhuàn), स्पष्ट रूप से कहता है: 'महान विस्तार की संख्या 50 है, जिनमें से 49 उपयोग में लाई जाती हैं।' कन्फ्यूशियस ने एनालेक्ट्स में कहा कि वे पचास वर्षों तक परिवर्तनों का अध्ययन करना चाहते थे; शास्त्रीय विद्वान 50 की इस संदर्भ को छड़ों की प्रक्रिया की ओर प्रत्यक्ष संकेत के रूप में समझते हैं। यह विधि तीन सिक्कों की विधि से एक सहस्राब्दी से अधिक पुरानी है। रिचर्ड विल्हेम और कैरी बेनिस ने 1950 के अपने अनुवाद के परिशिष्ट (प्रिंसटन यूनिवर्सिटी प्रेस) में पूर्ण प्रक्रिया प्रलेखित की।",
    yarrowProcedureHeading: "भौतिक प्रक्रिया",
    yarrowProcedureBody:
      "यह विधि भौतिक डंठलों या समान वस्तुओं के समूह का उपयोग करती है। एक को अलग रखा जाता है और बाकी को दोहराई जाने वाली अनुष्ठानिक क्रम में बाँटा और गिना जाता है, जब तक छह रेखाएँ बन न जाएँ। उपयोगकर्ता के लिए मुख्य बात इसकी लय है: यह ध्यान, स्पर्श और धैर्य मांगती है, जिससे परामर्श तीन सिक्कों की विधि की तुलना में अधिक अनुष्ठानिक लगता है।",
    yarrowProbHeading: "विधि का स्वभाव",
    yarrowProbBody:
      "डंठल विधि तीन सिक्कों की विधि की तुलना में धीमी अनुष्ठानिक लय रखती है। इस ऐप में इसका मूल्य किसी तकनीकी तालिका के रूप में नहीं, बल्कि उसी I Ching परंपरा में प्रवेश करने के दूसरे तरीके के रूप में प्रस्तुत है: अधिक स्पर्शनीय, अधिक सजग और Wilhelm/Baynes द्वारा दर्ज शास्त्रीय प्रक्रिया के निकट। तेज परामर्श के लिए तीन सिक्कों की विधि उतनी ही वैध रहती है।",
    interpretHeading: "AI क्यों नहीं बनाता",
    interpretBody:
      "इस ऐप में कृत्रिम बुद्धिमत्ता की एक विशिष्ट और सीमित कार्य है: एल्गोरिदम का परिणाम, हेक्साग्राम, गतिशील रेखाएं, दरार निर्णय, लेना और उसे उपयोगकर्ता के प्रश्न के संदर्भ के साथ उपयोगकर्ता की भाषा में प्राकृतिक भाषा में व्यक्त करना। AI हेक्साग्राम उत्पन्न नहीं करता, निर्णय तय नहीं करता, Wilhelm के ग्रंथों या शांग विधि के पैटर्न को संशोधित नहीं करता। गणितीय एल्गोरिदम AI के हस्तक्षेप से पहले यह सब विश्वासपूर्वक करता है। AI दुभाषिया है। दैवज्ञ विधि है।",
    sourcesHeading: "स्रोत और संदर्भ",
  },
};

export function getNotesPageUiMessages(locale: AppLocale): NotesPageUiMessages {
  return NOTES_PAGE_UI[locale] ?? NOTES_PAGE_UI[DEFAULT_LOCALE];
}
