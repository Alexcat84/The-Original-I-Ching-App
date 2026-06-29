import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export const ICHING_MUTATION_RULE_IDS = [
  "NO_CHANGING",
  "ONE_CHANGING",
  "TWO_YIN_YANG",
  "TWO_SAME_LOWER",
  "THREE_MIDDLE",
  "FOUR_LOWEST_STABLE",
  "FIVE_ONLY_STABLE",
  "SIX_ALL_CHANGING",
  "QIAN_ALL_NINE",
  "KUN_ALL_SIX",
  "ZX_ZERO",
  "ZX_ONE",
  "ZX_TWO_UPPER",
  "ZX_THREE_JUDGMENTS",
  "ZX_FOUR_LOWER",
  "ZX_FIVE_ONLY",
  "ZX_SIX_TRANSFORMED",
] as const;

export type IchingMutationRuleId = (typeof ICHING_MUTATION_RULE_IDS)[number];

type RuleMap = Record<IchingMutationRuleId, string>;

/** UI EN display comes from @iching-oracle/iching-data bundle; kept for fallback only. */
const EN: RuleMap = {
  NO_CHANGING:
    "When there is no moving line, you need only consult the name, symbol, and decision of the gua.",
  ONE_CHANGING:
    "When you have exactly one moving line, you should pay special attention to the Yao Text for this line, and then you should consult the approached gua, the new hexagram that will result when the moving line changes",
  TWO_YIN_YANG:
    "If there are two moving lines—one yin and the other yang—consult only the yin moving line.",
  TWO_SAME_LOWER:
    "If the two moving lines are both yin or both yang, consult the lower one.",
  THREE_MIDDLE: "If there are three moving lines, consult only the middle one.",
  FOUR_LOWEST_STABLE:
    "If there are four moving lines, consult only the upper of the two nonmoving lines.",
  FIVE_ONLY_STABLE:
    "If there are five moving lines, consult only the other, nonmoving line.",
  SIX_ALL_CHANGING:
    "If six lines are all moving, consult the Decision of the new gua, the approached gua.",
  QIAN_ALL_NINE:
    "Since there is a seventh invisible line in the first and second gua, Qian and Kun, for these gua consult the seventh Yao Text, called All Nines or All Sixes.",
  KUN_ALL_SIX:
    "Since there is a seventh invisible line in the first and second gua, Qian and Kun, for these gua consult the seventh Yao Text, called All Nines or All Sixes.",
  ZX_ZERO:
    "Any hexagram may have all unchanging lines. In that case we prognosticate on the basis of the original hexagram's T'uan statement, taking the inner hexagram as chen [the question, or present situation] and the outer hexagram as hui [the prognostication].",
  ZX_ONE:
    "When only one line changes, we take the statement of the original hexagram's changing line as the prognostication.",
  ZX_TWO_UPPER:
    "When two lines change, we take the statements of the two changing lines of the original hexagram as the prognostication, but we take the upper line [of the two] as ruler.",
  ZX_THREE_JUDGMENTS:
    "When three lines change, the prognostication is the T'uan statement of the original hexagram and the resulting hexagram, and we use the original hexagram as chen and the resulting hexagram as hui. In the first ten hexagrams [of this sort] we make chen the ruler; in the latter ten hexagrams we make hui the ruler.",
  ZX_FOUR_LOWER:
    "When four lines change, we use the two unchanging lines in the resulting hexagram as the prognostication. But we take the lower line as ruler.",
  ZX_FIVE_ONLY:
    "When five lines change, we use the unchanging line of the resulting hexagram as the prognostication.",
  ZX_SIX_TRANSFORMED:
    "For other hexagrams, the prognostication is the T'uan statement of the resulting hexagram.",
};

const ES: RuleMap = {
  NO_CHANGING:
    "Cuando no hay ninguna línea móvil, sólo necesitas consultar el nombre, símbolo y dictamen del gua.",
  ONE_CHANGING:
    "Cuando tienes exactamente una línea móvil, debes prestar especial atención al Texto del Yao para esta línea, y luego debes consultar el gua acercado, el nuevo hexagrama que resultará cuando la línea móvil cambie.",
  TWO_YIN_YANG:
    "Si hay dos líneas móviles —una yin y la otra yang— consulta solo la línea móvil yin.",
  TWO_SAME_LOWER:
    "Si las dos líneas móviles son ambas yin o ambas yang, consulta la inferior.",
  THREE_MIDDLE: "Si hay tres líneas móviles, consulta solo la del medio.",
  FOUR_LOWEST_STABLE:
    "Si hay cuatro líneas móviles, consulta solo la superior de las dos líneas no móviles.",
  FIVE_ONLY_STABLE:
    "Si hay cinco líneas móviles, consulta solo la otra, la línea no móvil.",
  SIX_ALL_CHANGING:
    "Si las seis líneas son todas móviles, consulta el Dictamen del nuevo gua, el gua acercado.",
  QIAN_ALL_NINE:
    "Dado que hay una séptima línea invisible en el primer y segundo gua, Qian y Kun, para estos gua consulta el séptimo Texto del Yao, llamado Todos los Nueves o Todos los Seises.",
  KUN_ALL_SIX:
    "Dado que hay una séptima línea invisible en el primer y segundo gua, Qian y Kun, para estos gua consulta el séptimo Texto del Yao, llamado Todos los Nueves o Todos los Seises.",
  ZX_ZERO:
    "Cualquier hexagrama puede tener todas sus líneas inmutables. En ese caso prognosticamos con base en el dictamen T'uan del hexagrama original, tomando el hexagrama interior como chen [la pregunta o situación presente] y el hexagrama exterior como hui [el pronóstico].",
  ZX_ONE:
    "Cuando solo cambia una línea, tomamos el dictamen de la línea mutante del hexagrama original como el pronóstico.",
  ZX_TWO_UPPER:
    "Cuando cambian dos líneas, tomamos los dictámenes de las dos líneas mutantes del hexagrama original como el pronóstico, pero tomamos la línea superior [de las dos] como regente.",
  ZX_THREE_JUDGMENTS:
    "Cuando cambian tres líneas, el pronóstico es el dictamen T'uan del hexagrama original y del hexagrama resultante, y usamos el hexagrama original como chen y el hexagrama resultante como hui. En los primeros diez hexagramas [de este tipo] hacemos chen el regente; en los diez posteriores hacemos hui el regente.",
  ZX_FOUR_LOWER:
    "Cuando cambian cuatro líneas, usamos las dos líneas inmutables en el hexagrama resultante como el pronóstico. Pero tomamos la línea inferior como regente.",
  ZX_FIVE_ONLY:
    "Cuando cambian cinco líneas, usamos la línea inmutable del hexagrama resultante como el pronóstico.",
  ZX_SIX_TRANSFORMED:
    "Para otros hexagramas, el pronóstico es el dictamen T'uan del hexagrama resultante.",
};

const PT: RuleMap = {
  NO_CHANGING:
    "Quando não há nenhuma linha móvel, basta consultar o nome, o símbolo e o dictame do gua.",
  ONE_CHANGING:
    "Quando há exatamente uma linha móvel, deve prestar especial atenção ao Texto do Yao desta linha e, em seguida, consultar o gua aproximado, o novo hexagrama que resultará quando a linha móvel mudar.",
  TWO_YIN_YANG:
    "Se houver duas linhas móveis — uma yin e a outra yang — consulte apenas a linha móvel yin.",
  TWO_SAME_LOWER:
    "Se as duas linhas móveis forem ambas yin ou ambas yang, consulte a inferior.",
  THREE_MIDDLE: "Se houver três linhas móveis, consulte apenas a do meio.",
  FOUR_LOWEST_STABLE:
    "Se houver quatro linhas móveis, consulte apenas a superior das duas linhas não móveis.",
  FIVE_ONLY_STABLE:
    "Se houver cinco linhas móveis, consulte apenas a outra, a linha não móvel.",
  SIX_ALL_CHANGING:
    "Se as seis linhas forem todas móveis, consulte o Dictame do novo gua, o gua aproximado.",
  QIAN_ALL_NINE:
    "Como há uma sétima linha invisível no primeiro e no segundo gua, Qian e Kun, para estes gua consulte o sétimo Texto do Yao, chamado Todos os Noves ou Todos os Seises.",
  KUN_ALL_SIX:
    "Como há uma sétima linha invisível no primeiro e no segundo gua, Qian e Kun, para estes gua consulte o sétimo Texto do Yao, chamado Todos os Noves ou Todos os Seises.",
  ZX_ZERO:
    "Qualquer hexagrama pode ter todas as linhas imutáveis. Nesse caso prognosticamos com base no dictame T'uan do hexagrama original, tomando o hexagrama interior como chen [a pergunta ou situação presente] e o hexagrama exterior como hui [o prognóstico].",
  ZX_ONE:
    "Quando apenas uma linha muda, tomamos o dictame da linha mutante do hexagrama original como prognóstico.",
  ZX_TWO_UPPER:
    "Quando duas linhas mudam, tomamos os dictames das duas linhas mutantes do hexagrama original como prognóstico, mas tomamos a linha superior [das duas] como regente.",
  ZX_THREE_JUDGMENTS:
    "Quando três linhas mudam, o prognóstico é o dictame T'uan do hexagrama original e do hexagrama resultante, e usamos o hexagrama original como chen e o hexagrama resultante como hui. Nos primeiros dez hexagramas [deste tipo] fazemos chen o regente; nos dez posteriores fazemos hui o regente.",
  ZX_FOUR_LOWER:
    "Quando quatro linhas mudam, usamos as duas linhas imutáveis no hexagrama resultante como prognóstico. Mas tomamos a linha inferior como regente.",
  ZX_FIVE_ONLY:
    "Quando cinco linhas mudam, usamos a linha imutável do hexagrama resultante como prognóstico.",
  ZX_SIX_TRANSFORMED:
    "Para outros hexagramas, o prognóstico é o dictame T'uan do hexagrama resultante.",
};

const FR: RuleMap = {
  NO_CHANGING:
    "Lorsqu'il n'y a aucune ligne mobile, il suffit de consulter le nom, le symbole et la Décision du gua.",
  ONE_CHANGING:
    "Lorsqu'il y a exactement une ligne mobile, accordez une attention particulière au Texte du Yao de cette ligne, puis consultez le gua approché, le nouvel hexagramme qui résultera du changement de la ligne mobile.",
  TWO_YIN_YANG:
    "S'il y a deux lignes mobiles — une yin et l'autre yang — consultez uniquement la ligne mobile yin.",
  TWO_SAME_LOWER:
    "Si les deux lignes mobiles sont toutes deux yin ou toutes deux yang, consultez la ligne inférieure.",
  THREE_MIDDLE: "S'il y a trois lignes mobiles, consultez uniquement celle du milieu.",
  FOUR_LOWEST_STABLE:
    "S'il y a quatre lignes mobiles, consultez uniquement la supérieure des deux lignes immobiles.",
  FIVE_ONLY_STABLE:
    "S'il y a cinq lignes mobiles, consultez uniquement l'autre, la ligne immobile.",
  SIX_ALL_CHANGING:
    "Si les six lignes sont toutes mobiles, consultez la Décision du nouveau gua, le gua approché.",
  QIAN_ALL_NINE:
    "Comme il existe une septième ligne invisible dans le premier et le second gua, Qian et Kun, pour ces gua consultez le septième Texte du Yao, appelé Tous les Neuf ou Tous les Six.",
  KUN_ALL_SIX:
    "Comme il existe une septième ligne invisible dans le premier et le second gua, Qian et Kun, pour ces gua consultez le septième Texte du Yao, appelé Tous les Neuf ou Tous les Six.",
  ZX_ZERO:
    "Tout hexagramme peut avoir toutes ses lignes immuables. Dans ce cas nous pronostiquons sur la base de l'énoncé T'uan de l'hexagramme original, en prenant l'hexagramme intérieur comme chen [la question ou la situation présente] et l'hexagramme extérieur comme hui [le pronostic].",
  ZX_ONE:
    "Lorsqu'une seule ligne change, nous prenons l'énoncé de la ligne changeante de l'hexagramme original comme pronostic.",
  ZX_TWO_UPPER:
    "Lorsque deux lignes changent, nous prenons les énoncés des deux lignes changeantes de l'hexagramme original comme pronostic, mais nous prenons la ligne supérieure [des deux] comme souveraine.",
  ZX_THREE_JUDGMENTS:
    "Lorsque trois lignes changent, le pronostic est l'énoncé T'uan de l'hexagramme original et de l'hexagramme résultant, et nous utilisons l'hexagramme original comme chen et l'hexagramme résultant comme hui. Dans les dix premiers hexagrammes [de ce type] nous faisons chen souverain ; dans les dix suivants nous faisons hui souverain.",
  ZX_FOUR_LOWER:
    "Lorsque quatre lignes changent, nous utilisons les deux lignes immuables de l'hexagramme résultant comme pronostic. Mais nous prenons la ligne inférieure comme souveraine.",
  ZX_FIVE_ONLY:
    "Lorsque cinq lignes changent, nous utilisons la ligne immuable de l'hexagramme résultant comme pronostic.",
  ZX_SIX_TRANSFORMED:
    "Pour les autres hexagrammes, le pronostic est l'énoncé T'uan de l'hexagramme résultant.",
};

const DE: RuleMap = {
  NO_CHANGING:
    "Wenn keine Linie wandelt, brauchen Sie nur Name, Symbol und Urteil des Gua zu konsultieren.",
  ONE_CHANGING:
    "Wenn genau eine Linie wandelt, sollten Sie dem Yao-Text dieser Linie besondere Aufmerksamkeit schenken und dann den angenäherten Gua konsultieren, das neue Hexagramm, das entsteht, wenn die wandelnde Linie sich ändert.",
  TWO_YIN_YANG:
    "Wenn zwei Linien wandeln — eine yin und die andere yang — konsultieren Sie nur die wandelnde yin-Linie.",
  TWO_SAME_LOWER:
    "Wenn die beiden wandelnden Linien beide yin oder beide yang sind, konsultieren Sie die untere.",
  THREE_MIDDLE: "Wenn drei Linien wandeln, konsultieren Sie nur die mittlere.",
  FOUR_LOWEST_STABLE:
    "Wenn vier Linien wandeln, konsultieren Sie nur die obere der beiden unbeweglichen Linien.",
  FIVE_ONLY_STABLE:
    "Wenn fünf Linien wandeln, konsultieren Sie nur die andere, unbewegliche Linie.",
  SIX_ALL_CHANGING:
    "Wenn alle sechs Linien wandeln, konsultieren Sie das Urteil des neuen Gua, des angenäherten Gua.",
  QIAN_ALL_NINE:
    "Da es in den ersten beiden Gua, Qian und Kun, eine siebte unsichtbare Linie gibt, konsultieren Sie für diese Gua den siebten Yao-Text, genannt Alle Neun oder Alle Sechs.",
  KUN_ALL_SIX:
    "Da es in den ersten beiden Gua, Qian und Kun, eine siebte unsichtbare Linie gibt, konsultieren Sie für diese Gua den siebten Yao-Text, genannt Alle Neun oder Alle Sechs.",
  ZX_ZERO:
    "Jedes Hexagramm kann alle Linien unverändert haben. In diesem Fall prognostizieren wir auf Grundlage der T'uan-Aussage des ursprünglichen Hexagramms, wobei das innere Hexagramm als chen [die Frage oder gegenwärtige Situation] und das äußere als hui [die Prognose] gilt.",
  ZX_ONE:
    "Wenn nur eine Linie wechselt, nehmen wir die Aussage der wandelnden Linie des ursprünglichen Hexagramms als Prognose.",
  ZX_TWO_UPPER:
    "Wenn zwei Linien wechseln, nehmen wir die Aussagen der beiden wandelnden Linien des ursprünglichen Hexagramms als Prognose, aber die obere [der beiden] ist Herrscher.",
  ZX_THREE_JUDGMENTS:
    "Wenn drei Linien wechseln, ist die Prognose die T'uan-Aussage des ursprünglichen und des resultierenden Hexagramms, und wir verwenden das ursprüngliche Hexagramm als chen und das resultierende als hui. In den ersten zehn Hexagrammen [dieser Art] ist chen Herrscher; in den folgenden zehn ist hui Herrscher.",
  ZX_FOUR_LOWER:
    "Wenn vier Linien wechseln, verwenden wir die beiden unveränderten Linien im resultierenden Hexagramm als Prognose. Aber die untere Linie ist Herrscher.",
  ZX_FIVE_ONLY:
    "Wenn fünf Linien wechseln, verwenden wir die unveränderte Linie des resultierenden Hexagramms als Prognose.",
  ZX_SIX_TRANSFORMED:
    "Bei anderen Hexagrammen ist die Prognose die T'uan-Aussage des resultierenden Hexagramms.",
};

const IT: RuleMap = {
  NO_CHANGING:
    "Quando non c'è alcuna linea mutante, basta consultare il nome, il simbolo e il Giudizio del gua.",
  ONE_CHANGING:
    "Quando c'è esattamente una linea mutante, presta particolare attenzione al Testo dello Yao per questa linea, poi consulta il gua avvicinato, il nuovo esagramma che risulterà quando la linea mutante cambia.",
  TWO_YIN_YANG:
    "Se ci sono due linee mutanti — una yin e l'altra yang — consulta solo la linea mutante yin.",
  TWO_SAME_LOWER:
    "Se le due linee mutanti sono entrambe yin o entrambe yang, consulta quella inferiore.",
  THREE_MIDDLE: "Se ci sono tre linee mutanti, consulta solo quella centrale.",
  FOUR_LOWEST_STABLE:
    "Se ci sono quattro linee mutanti, consulta solo la superiore delle due linee non mutanti.",
  FIVE_ONLY_STABLE:
    "Se ci sono cinque linee mutanti, consulta solo l'altra, la linea non mutante.",
  SIX_ALL_CHANGING:
    "Se tutte e sei le linee sono mutanti, consulta il Giudizio del nuovo gua, il gua avvicinato.",
  QIAN_ALL_NINE:
    "Poiché esiste una settima linea invisibile nel primo e nel secondo gua, Qian e Kun, per questi gua consulta il settimo Testo dello Yao, chiamato Tutti i Nove o Tutti i Sei.",
  KUN_ALL_SIX:
    "Poiché esiste una settima linea invisibile nel primo e nel secondo gua, Qian e Kun, per questi gua consulta il settimo Testo dello Yao, chiamato Tutti i Nove o Tutti i Sei.",
  ZX_ZERO:
    "Qualsiasi esagramma può avere tutte le linee immutabili. In tal caso pronostichiamo sulla base dell'enunciato T'uan dell'esagramma originale, prendendo l'esagramma interno come chen [la domanda o la situazione presente] e l'esagramma esterno come hui [il pronostico].",
  ZX_ONE:
    "Quando cambia solo una linea, prendiamo l'enunciato della linea mutante dell'esagramma originale come pronostico.",
  ZX_TWO_UPPER:
    "Quando cambiano due linee, prendiamo gli enunciati delle due linee mutanti dell'esagramma originale come pronostico, ma prendiamo la linea superiore [delle due] come reggente.",
  ZX_THREE_JUDGMENTS:
    "Quando cambiano tre linee, il pronostico è l'enunciato T'uan dell'esagramma originale e di quello risultante, e usiamo l'esagramma originale come chen e quello risultante come hui. Nei primi dieci esagrammi [di questo tipo] facciamo chen reggente; nei dieci successivi facciamo hui reggente.",
  ZX_FOUR_LOWER:
    "Quando cambiano quattro linee, usiamo le due linee immutabili nell'esagramma risultante come pronostico. Ma prendiamo la linea inferiore come reggente.",
  ZX_FIVE_ONLY:
    "Quando cambiano cinque linee, usiamo la linea immutabile dell'esagramma risultante come pronostico.",
  ZX_SIX_TRANSFORMED:
    "Per gli altri esagrammi, il pronostico è l'enunciato T'uan dell'esagramma risultante.",
};

const JA: RuleMap = {
  NO_CHANGING:
    "変爻がない場合は、卦の名、象、判辞だけを参照すればよい。",
  ONE_CHANGING:
    "変爻がちょうど一つある場合は、その爻の爻辞に特に注意し、次に変爻が変化したときに生じる新しい卦、之卦を参照する。",
  TWO_YIN_YANG:
    "変爻が二つあり、一つが陰で一つが陽の場合は、陰の変爻だけを参照する。",
  TWO_SAME_LOWER:
    "二つの変爻がともに陰またはともに陽の場合は、下の爻を参照する。",
  THREE_MIDDLE: "変爻が三つある場合は、中央の爻だけを参照する。",
  FOUR_LOWEST_STABLE:
    "変爻が四つある場合は、不変の二爻のうち上の爻だけを参照する。",
  FIVE_ONLY_STABLE:
    "変爻が五つある場合は、もう一つの不変の爻だけを参照する。",
  SIX_ALL_CHANGING:
    "六爻すべてが変爻の場合は、新しい卦、之卦の判辞を参照する。",
  QIAN_ALL_NINE:
    "第一卦と第二卦の乾と坤には第七の見えない爻があるため、これらの卦では「用九」または「用六」と呼ばれる第七の爻辞を参照する。",
  KUN_ALL_SIX:
    "第一卦と第二卦の乾と坤には第七の見えない爻があるため、これらの卦では「用九」または「用六」と呼ばれる第七の爻辞を参照する。",
  ZX_ZERO:
    "どの卦もすべての爻が不変であることがある。その場合は本卦の彖辞に基づいて占い、内卦をchen［問い、現在の状況］、外卦をhui［占断］とする。",
  ZX_ONE:
    "変爻が一つだけの場合は、本卦の変爻の辞を占断とする。",
  ZX_TWO_UPPER:
    "変爻が二つの場合は、本卦の二つの変爻の辞を占断とするが、［二つのうち］上の爻を主とする。",
  ZX_THREE_JUDGMENTS:
    "変爻が三つの場合、占断は本卦と変卦の彖辞であり、本卦をchen、変卦をhuiとする。この種の最初の十卦ではchenを主とし、後の十卦ではhuiを主とする。",
  ZX_FOUR_LOWER:
    "変爻が四つの場合は、変卦の二つの不変爻を占断とする。ただし下の爻を主とする。",
  ZX_FIVE_ONLY:
    "変爻が五つの場合は、変卦の不変爻を占断とする。",
  ZX_SIX_TRANSFORMED:
    "その他の卦では、占断は変卦の彖辞である。",
};

const ZH: RuleMap = {
  NO_CHANGING: "无变爻时，只需查阅卦名、卦象与卦辞。",
  ONE_CHANGING:
    "恰有一爻变时，应特别留意该爻的爻辞，然后查阅之卦，即变爻变化后形成的新卦。",
  TWO_YIN_YANG: "若有两爻变，一阴一阳，则只读阴爻。",
  TWO_SAME_LOWER: "若两变爻同为阴或同为阳，则读下爻。",
  THREE_MIDDLE: "若有三爻变，则只读中间一爻。",
  FOUR_LOWEST_STABLE: "若有四爻变，则只读两不变爻中的上爻。",
  FIVE_ONLY_STABLE: "若有五爻变，则只读另一不变爻。",
  SIX_ALL_CHANGING: "若六爻皆变，则读新卦、之卦的卦辞。",
  QIAN_ALL_NINE:
    "因乾、坤两卦有第七不可见爻，故这两卦应读第七爻辞，称为用九或用六。",
  KUN_ALL_SIX:
    "因乾、坤两卦有第七不可见爻，故这两卦应读第七爻辞，称为用九或用六。",
  ZX_ZERO:
    "任何卦都可能六爻皆不变。此时据本卦彖辞占断，以内卦为chen［问、现状］，外卦为hui［占断］。",
  ZX_ONE: "仅一爻变时，以本卦变爻辞为占断。",
  ZX_TWO_UPPER:
    "两爻变时，以本卦两变爻辞为占断，但以上爻［两爻中］为主。",
  ZX_THREE_JUDGMENTS:
    "三爻变时，占断为本卦与变卦的彖辞，以本卦为chen、变卦为hui。此类前十卦以chen为主，后十卦以hui为主。",
  ZX_FOUR_LOWER:
    "四爻变时，以变卦中两不变爻为占断，但以下爻为主。",
  ZX_FIVE_ONLY: "五爻变时，以变卦中不变爻为占断。",
  ZX_SIX_TRANSFORMED: "其他卦则占断为变卦的彖辞。",
};

const KO: RuleMap = {
  NO_CHANGING:
    "변효가 없을 때는 괘의 이름, 상, 판사만 참고하면 된다.",
  ONE_CHANGING:
    "변효가 정확히 하나일 때는 그 효의 효사에 특별히 주의하고, 변효가 변할 때 생기는 새로운 괘, 지괘를 참고한다.",
  TWO_YIN_YANG:
    "변효가 둘이고 하나는 음, 하나는 양이면 음 변효만 참고한다.",
  TWO_SAME_LOWER:
    "두 변효가 모두 음이거나 모두 양이면 아래 효를 참고한다.",
  THREE_MIDDLE: "변효가 셋이면 가운데 효만 참고한다.",
  FOUR_LOWEST_STABLE:
    "변효가 넷이면 변하지 않은 두 효 중 위 효만 참고한다.",
  FIVE_ONLY_STABLE:
    "변효가 다섯이면 나머지 하나, 변하지 않은 효만 참고한다.",
  SIX_ALL_CHANGING:
    "여섯 효가 모두 변하면 새로운 괘, 지괘의 판사를 참고한다.",
  QIAN_ALL_NINE:
    "첫째·둘째 괘인 건과 곤에는 일곱 번째 보이지 않는 효가 있으므로, 이 괘들에서는 용구 또는 용육이라 불리는 일곱 번째 효사를 참고한다.",
  KUN_ALL_SIX:
    "첫째·둘째 괘인 건과 곤에는 일곱 번째 보이지 않는 효가 있으므로, 이 괘들에서는 용구 또는 용육이라 불리는 일곱 번째 효사를 참고한다.",
  ZX_ZERO:
    "어떤 괘든 모든 효가 불변이 될 수 있다. 이 경우 본괘의 단사에 따라 점치며, 내괘를 chen［질문·현재 상황］, 외괘를 hui［점断］으로 삼는다.",
  ZX_ONE:
    "한 효만 변할 때는 본괘 변효의 사(辞)를 점断으로 삼는다.",
  ZX_TWO_UPPER:
    "두 효가 변할 때는 본괘 두 변효의 사를 점断으로 삼되, ［둘 중］ 위 효를 주(主)로 삼는다.",
  ZX_THREE_JUDGMENTS:
    "세 효가 변할 때 점断은 본괘와 변괘의 단사이며, 본괘를 chen, 변괘를 hui로 삼는다. 이 종류의 처음 열 괘에서는 chen을 주로, 다음 열 괘에서는 hui를 주로 삼는다.",
  ZX_FOUR_LOWER:
    "네 효가 변할 때는 변괘의 두 불변효를 점断으로 삼되, 아래 효를 주로 삼는다.",
  ZX_FIVE_ONLY:
    "다섯 효가 변할 때는 변괘의 불변효를 점断으로 삼는다.",
  ZX_SIX_TRANSFORMED:
    "다른 괘의 경우 점断은 변괘의 단사이다.",
};

const AR: RuleMap = {
  NO_CHANGING:
    "عندما لا يوجد خط متحرك، يكفي الرجوع إلى اسم القُبَيل ورمزه وحكمه.",
  ONE_CHANGING:
    "عندما يكون هناك خط متحرك واحد بالضبط، انتبه بشكل خاص إلى نص الyao لهذا الخط، ثم ارجع إلى القُبَيل المُقترب، السداسي الجديد الذي ينتج عند تغيّر الخط المتحرك.",
  TWO_YIN_YANG:
    "إذا كان هناك خطان متحركان — أحدهما yin والآخر yang — فارجع إلى خط yin المتحرك فقط.",
  TWO_SAME_LOWER:
    "إذا كان الخطان المتحركان كلاهما yin أو كلاهما yang، فارجع إلى الخط السفلي.",
  THREE_MIDDLE: "إذا كان هناك ثلاثة خطوط متحركة، فارجع إلى الخط الأوسط فقط.",
  FOUR_LOWEST_STABLE:
    "إذا كان هناك أربعة خطوط متحركة، فارجع إلى الخط العلوي من الخطين غير المتحركين.",
  FIVE_ONLY_STABLE:
    "إذا كان هناك خمسة خطوط متحركة، فارجع إلى الخط الآخر غير المتحرك.",
  SIX_ALL_CHANGING:
    "إذا كانت كل الخطوط الستة متحركة، فارجع إلى حكم القُبَيل الجديد، القُبَيل المُقترب.",
  QIAN_ALL_NINE:
    "لأن هناك خطاً سابعاً غير مرئي في القُبَيلين الأول والثاني، Qian وKun، ففي هذين القُبَيلين ارجع إلى نص الyao السابع، المسمّى All Nines أو All Sixes.",
  KUN_ALL_SIX:
    "لأن هناك خطاً سابعاً غير مرئي في القُبَيلين الأول والثاني، Qian وKun، ففي هذين القُبَيلين ارجع إلى نص الyao السابع، المسمّى All Nines أو All Sixes.",
  ZX_ZERO:
    "قد يكون لأي سداسي كل خطوطه ثابتة. في هذه الحالة نتنبأ بناءً على بيان T'uan للسداسي الأصلي، مع اعتبار السداسي الداخلي chen［السؤال أو الوضع الحالي］ والسداسي الخارجي hui［التنبؤ］.",
  ZX_ONE:
    "عندما يتغيّر خط واحد فقط، نأخذ بيان الخط المتغيّر في السداسي الأصلي كتنبؤ.",
  ZX_TWO_UPPER:
    "عندما يتغيّران خطان، نأخذ بيانَي الخطين المتغيّرين في السداسي الأصلي كتنبؤ، لكن نجعل الخط العلوي［من الاثنين］ هو الحاكم.",
  ZX_THREE_JUDGMENTS:
    "عندما تتغيّر ثلاثة خطوط، يكون التنبؤ بيان T'uan للسداسي الأصلي والسداسي الناتج، ونستخدم السداسي الأصلي كـ chen والسداسي الناتج كـ hui. في أول عشرة سداسيات［من هذا النوع］ نجعل chen حاكماً؛ في العشرة التالية نجعل hui حاكماً.",
  ZX_FOUR_LOWER:
    "عندما تتغيّر أربعة خطوط، نستخدم الخطين الثابتين في السداسي الناتج كتنبؤ. لكن نجعل الخط السفلي حاكماً.",
  ZX_FIVE_ONLY:
    "عندما تتغيّر خمسة خطوط، نستخدم الخط الثابت في السداسي الناتج كتنبؤ.",
  ZX_SIX_TRANSFORMED:
    "في السداسيات الأخرى، التنبؤ هو بيان T'uan للسداسي الناتج.",
};

const HI: RuleMap = {
  NO_CHANGING:
    "जब कोई चल रेखा न हो, तो केवल गुआ का नाम, प्रतीक और निर्णय देखें।",
  ONE_CHANGING:
    "जब ठीक एक रेखा चल रही हो, तो इस रेखा के याओ पाठ पर विशेष ध्यान दें, फिर निकट गुआ, नए हेक्साग्राम को देखें जो चल रेखा बदलने पर बनेगा।",
  TWO_YIN_YANG:
    "यदि दो रेखाएं चल रही हों — एक yin और दूसरी yang — तो केवल yin चल रेखा देखें।",
  TWO_SAME_LOWER:
    "यदि दोनों चल रेखाएं yin हों या दोनों yang, तो निचली रेखा देखें।",
  THREE_MIDDLE: "यदि तीन रेखाएं चल रही हों, तो केवल बीच वाली रेखा देखें।",
  FOUR_LOWEST_STABLE:
    "यदि चार रेखाएं चल रही हों, तो दो अचल रेखाओं में से ऊपरी रेखा देखें।",
  FIVE_ONLY_STABLE:
    "यदि पांच रेखाएं चल रही हों, तो दूसरी, अचल रेखा देखें।",
  SIX_ALL_CHANGING:
    "यदि सभी छह रेखाएं चल रही हों, तो नए गुआ, निकट गुआ के निर्णय को देखें।",
  QIAN_ALL_NINE:
    "चूंकि पहले और दूसरे गुआ, Qian और Kun में सातवीं अदृश्य रेखा है, इन गुआ के लिए सातवें याओ पाठ को देखें, जिसे All Nines या All Sixes कहा जाता है।",
  KUN_ALL_SIX:
    "चूंकि पहले और दूसरे गुआ, Qian और Kun में सातवीं अदृश्य रेखा है, इन गुआ के लिए सातवें याओ पाठ को देखें, जिसे All Nines या All Sixes कहा जाता है।",
  ZX_ZERO:
    "किसी भी हेक्साग्राम की सभी रेखाएं अचल हो सकती हैं। उस स्थिति में हम मूल हेक्साग्राम के T'uan कथन के आधार पर भविष्यवाणी करते हैं, आंतरिक हेक्साग्राम को chen［प्रश्न या वर्तमान स्थिति］ और बाहरी को hui［भविष्यवाणी］ मानते हैं।",
  ZX_ONE:
    "जब केवल एक रेखा बदले, तो मूल हेक्साग्राम की बदलती रेखा का कथन भविष्यवाणी होता है।",
  ZX_TWO_UPPER:
    "जब दो रेखाएं बदलें, तो मूल हेक्साग्राम की दो बदलती रेखाओं के कथन भविष्यवाणी होते हैं, पर ［दोनों में से］ ऊपरी रेखा शासक होती है।",
  ZX_THREE_JUDGMENTS:
    "जब तीन रेखाएं बदलें, भविष्यवाणी मूल और परिणामी हेक्साग्राम के T'uan कथन है, और हम मूल को chen और परिणामी को hui मानते हैं। इस प्रकार के पहले दस हेक्साग्राम में chen शासक; अगले दस में hui शासक।",
  ZX_FOUR_LOWER:
    "जब चार रेखाएं बदलें, परिणामी हेक्साग्राम की दो अचल रेखाओं को भविष्यवाणी मानते हैं। पर निचली रेखा शासक होती है।",
  ZX_FIVE_ONLY:
    "जब पांच रेखाएं बदलें, परिणामी हेक्साग्राम की अचल रेखा भविष्यवाणी होती है।",
  ZX_SIX_TRANSFORMED:
    "अन्य हेक्साग्रामों में भविष्यवाणी परिणामी हेक्साग्राम का T'uan कथन है।",
};

const BY_LOCALE: Record<AppLocale, RuleMap> = {
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

function lookupTranslation(locale: AppLocale, rule: string): string | null {
  const map = BY_LOCALE[locale] ?? BY_LOCALE[DEFAULT_LOCALE];
  if (rule in map) return map[rule as IchingMutationRuleId];
  return null;
}

/** Locale translation of mutation rule bookText (null for en — use iching-data bundle). */
export function getMutationRuleTranslation(
  locale: AppLocale,
  rule: string,
): string | null {
  if (locale === "en") return null;
  return lookupTranslation(locale, rule);
}

/** @deprecated Use getMutationRuleTranslation + formatMutationRuleForUi (web). */
export function getIchingMutationRuleLabel(
  locale: AppLocale,
  rule: string,
): string {
  const translation = lookupTranslation(locale, rule);
  if (translation) return translation;
  return lookupTranslation("en", rule) ?? rule;
}
