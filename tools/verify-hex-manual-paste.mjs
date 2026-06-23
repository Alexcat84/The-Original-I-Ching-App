import { parseWilhelmEpubFullHtml } from "../scripts/lib/wilhelm-epub-full.mjs";
import { readWilhelmEpubHexHtml } from "../scripts/lib/wilhelm-epub-extract.mjs";
import { loadBundle } from "../scripts/lib/hexagram-fidelity-fetch.mjs";
import { pathToFileURL } from "node:url";

/** @type {Record<number, Record<string, string>>} */
export const USER_HEX2_3 = {
  2: {
    intro: `This hexagram is made up of broken lines only. The broken line represents the dark, yielding, receptive primal power of yin. The attribute of the hexagram is devotion; its image is the earth. It is the perfect complement of THE CREATIVE—the complement, not the opposite, for the Receptive does not combat the Creative but completes it. It represents nature in contrast to spirit, earth in contrast to heaven, space as against time, the female-maternal as against the male-paternal. However, as applied to human affairs, the principle of this complementary relationship is found not only in the relation between man and woman, but also in that between prince and minister and between father and son. Indeed, even in the individual this duality appears in the coexistence of the spiritual world and the world of the senses.
But strictly speaking there is no real dualism here, because there is a clearly defined hierarchic relationship between the two principles. In itself of course the Receptive is just as important as the Creative, but the attribute of devotion defines the place occupied by this primal power in relation to the Creative. For the Receptive must be activated and led by the Creative; then it is productive of good. Only when it abandons this position and tries to stand as an equal side by side with the Creative, does it become evil. The result then is opposition to and struggle against the Creative, which is productive of evil to both.`,
    judgment_oraculo: `THE RECEPTIVE brings about sublime success,
Furthering through the perseverance of a mare.
If the superior man undertakes something and tries to lead,
He goes astray;
But if he follows, he finds guidance.
It is favorable to find friends in the west and south,
To forego friends in the east and north.
Quiet perseverance brings good fortune.`,
    judgment_comentario: `The four fundamental aspects of the Creative—"sublime success, furthering through perseverance"—are also attributed to the Receptive. Here, however, the perseverance is more closely defined: it is that of a mare. The Receptive connotes spatial reality in contrast to the spiritual potentiality of the Creative. The potential becomes real and the spiritual becomes spatial through a specifically qualifying definition. Thus the qualification, "of a mare," is here added to the idea of perseverance. The horse belongs to earth just as the dragon belongs to heaven. Its tireless roaming over the plains is taken as a symbol of the vast expanse of the earth. This is the symbol chosen because the mare combines the strength and swiftness of the horse with the gentleness and devotion of the cow.
Only because nature in its myriad forms corresponds with the myriad impulses of the Creative can it make these impulses real. Nature's richness lies in its power to nourish all living things; its greatness lies in its power to give them beauty and splendor. Thus it prospers all that lives. It is the Creative that begets things, but they are brought to birth by the Receptive. Applied to human affairs, therefore, what the hexagram indicates is action in conformity with the situation. The person in question is not in an independent position, but is acting as an assistant. This means that he must achieve something. It is not his task to try to lead-that would only make him lose the way-but to let himself be led. If he knows how to meet fate with an attitude of acceptance, he is sure to find the right guidance. The superior man lets himself be guided; he does not go ahead blindly, but learns from the situation what is demanded of him and then follows this intimation from fate.
Since there is something to be accomplished, we need friends and helpers in the hour of toil and effort, once the ideas to be realized are firmly set. The time of toil and effort is indicated by the west and the south, for west and south symbolize the place where the Receptive works for the Creative, as nature does in summer and autumn. If in that situation one does not mobilize all one's powers, the work to be accomplished will not be done. Hence to find friends there means to find guidance. But in addition to the time of toil and effort, there is also a time of planning, and for this we need solitude. The east symbolizes the place where a man receives orders from his master, and the north the place where he reports on what he has done. At that time he must be alone and objective. In this sacred hour he must do without companions, so that the purity of the moment may not be spoiled by factional hates and favoritism.`,
    image_oraculo: `The earth's condition is receptive devotion.
Thus the superior man who has breadth of character
Carries the outer world.`,
    image_comentario:
      "Just as there is only one heaven, so too there is only one earth. In the hexagram of heaven the doubling of the trigram implies duration in time, but in the hexagram of earth the doubling connotes the solidity and extension in space by virtue of which the earth is able to carry and preserve all things that live and move upon it. The earth in its devotion carries all things, good and evil, without exception. In the same way the superior man gives to his character breadth, purity, and sustaining power, so that he is able both to support and to bear with people and things.",
    L1_etiqueta: "Six at the beginning means:",
    L1_oraculo: `When there is hoarfrost underfoot,
Solid ice is not far off.`,
    L1_comentario: `Just as the light-giving power represents life, so the dark power, the shadowy, represents death. When the first hoarfrost comes in the autumn, the power of darkness and cold is just at its beginning. After these first warnings, signs of death will gradually multiply, until, in obedience to immutable laws, stark winter with its ice is here.
In life it is the same. After certain scarcely noticeable signs of decay have appeared, they go on increasing until final dissolution comes. But in life precautions can be taken by heeding the first signs of decay and checking them in time.`,
    L2_etiqueta: "Six in the second place means:",
    L2_oraculo: `Straight, square, great.
Without purpose,
Yet nothing remains unfurthered.`,
    L2_comentario: `The symbol of heaven is the circle, and that of earth is the square. Thus squareness is a primary quality of the earth. On the other hand, movement in a straight line, as well as magnitude, is a primary quality of the Creative. But all square things have their origin in a straight line and in turn form solid bodies. In mathematics, when we discriminate between lines, planes, and solids, we find that rectangular planes result from straight lines, and cubic magnitudes from rectangular planes. The Receptive accommodates itself to the qualities of the Creative and makes them its own. Thus a square develops out of a straight line and a cube out of a square. This is compliance with the laws of the Creative; nothing is taken away, nothing added. Therefore the Receptive has no need of a special purpose of its own, nor of any effort; yet everything turns out as it should.
Nature creates all beings without erring: this is its straightness. It is calm and still: this is its foursquareness. It tolerates all creatures equally: this is its greatness. Therefore it attains what is right for all without artifice or special intentions. Man achieves the height of wisdom when all that he does is as self-evident as what nature does.`,
    L3_etiqueta: "Six in the third place means:",
    L3_oraculo: `Hidden lines.
One is able to remain persevering.
If by chance you are in the service of a king,
Seek not works, but bring to completion.`,
    L3_comentario:
      "If a man is free of vanity he is able to conceal his abilities and keep them from attracting attention too soon; thus he can mature undisturbed. If conditions demand it, he can also enter public life, but that too he does with restraint. The wise man gladly leaves fame to others. He does not seek to have credited to himself things that stand accomplished, but hopes to release active forces; that is, he completes his works in such a manner that they may bear fruit for the future.",
    L4_etiqueta: "Six in the fourth place means:",
    L4_oraculo: "A tied-up sack. No blame, no praise.",
    L4_comentario:
      "The dark element opens when it moves and closes when at rest. The strictest reticence is indicated here. The time is dangerous, because any degree of prominence leads either to the enmity of irresistible antagonists if one challenges them or to misconceived recognition if one is complaisant. Therefore a man ought to maintain reserve, be it in solitude or in the turmoil of the world, for there too he can hide himself so well that no one knows him.",
    L5_etiqueta: "Six in the fifth place means:",
    L5_oraculo: "A yellow lower garment brings supreme good fortune.",
    L5_comentario:
      "Yellow is the color of the earth and of the middle; it is the symbol of that which is reliable and genuine. The lower garment is inconspicuously decorated—the symbol of aristocratic reserve. When anyone is called upon to work in a prominent but not independent position, true success depends on the utmost discretion. A man's genuineness and refinement should not reveal themselves directly; they should express themselves only indirectly as an effect from within.",
    L6_etiqueta: "Six at the top means:",
    L6_oraculo: `Dragons fight in the meadow.
Their blood is black and yellow.`,
    L6_comentario:
      "In the top place the dark element should yield to the light. If it attempts to maintain a position to which it is not entitled and to rule instead of serving, it draws down upon itself the anger of the strong. A struggle ensues in which it is overthrown, with injury, however, to both sides. The dragon, symbol of heaven, comes to fight the false dragon that symbolizes the inflation of the earth principle. Midnight blue is the color of heaven; yellow is the color of the earth. Therefore, when black and yellow blood flow, it is a sign that in this unnatural contest both primal powers suffer injury.",
    yong_etiqueta: "When all the lines are sixes, it means:",
    yong_oraculo: "Lasting perseverance furthers.",
    yong_comentario:
      "When nothing but sixes appears, the hexagram of THE RECEPTIVE changes into the hexagram of THE CREATIVE. By holding fast to what is right, it gains the power of enduring. There is indeed no advance, but neither is there retrogression.",
  },
  3: {
    intro:
      'The name of the hexagram, Chun, really connotes a blade of grass pushing against an obstacle as it sprouts out of the earth—hence the meaning, "difficulty at the beginning." The hexagram indicates the way in which heaven and earth bring forth individual beings. It is their first meeting, which is beset with difficulties. The lower trigram Chên is the Arousing; its motion is upward and its image is thunder. The upper trigram K\'an stands for the Abysmal, the dangerous. Its motion is downward and its image is rain. The situation points to teeming, chaotic profusion; thunder and rain fill the air. But the chaos clears up. While the Abysmal sinks, the upward movement eventually passes beyond the danger. A thunderstorm brings release from tension, and all things breathe freely again.',
    judgment_oraculo: `Difficulty at the Beginning works supreme success,
Furthering through perseverance.
Nothing should be undertaken.
It furthers one to appoint helpers.`,
    judgment_comentario:
      "Times of growth are beset with difficulties. They resemble a first birth. But these difficulties arise from the very profusion of all that is struggling to attain form. Everything is in motion: therefore if one perseveres there is a prospect of great success, in spite of the existing danger. When it is a man's fate to undertake such new beginnings, everything is still unformed, dark. Hence he must hold back, because any premature move might bring disaster. Likewise, it is very important not to remain alone; in order to overcome the chaos he needs helpers. This is not to say, however, that he himself should look on passively at what is happening. He must lend his hand and participate with inspiration and guidance.",
    image_oraculo: `Clouds and thunder:
The image of Difficulty at the Beginning.
Thus the superior man
Brings order out of confusion.`,
    image_comentario:
      "Clouds and thunder are represented by definite decorative lines; this means that in the chaos of difficulty at the beginning, order is already implicit. So too the superior man has to arrange and organize the inchoate profusion of such times of beginning, just as one sorts out silk threads from a knotted tangle and binds them into skeins. In order to find one's place in the infinity of being, one must be able both to separate and to unite.",
    L1_etiqueta: "Nine at the beginning means:",
    L1_oraculo: `Hesitation and hindrance.
It furthers one to remain persevering.
It furthers one to appoint helpers.`,
    L1_comentario:
      "If a person encounters a hindrance at the beginning of an enterprise, he must not try to force advance but must pause and take thought. However, nothing should put him off his course; he must persevere and constantly keep the goal in sight. It is important to seek out the right assistants, but he can find them only if he avoids arrogance and associates with his fellows in a spirit of humility. Only then will he attract those with whose help he can combat the difficulties.",
    L2_etiqueta: "Six in the second place means:",
    L2_oraculo: `Difficulties pile up.
Horse and wagon part.
He is not a robber;
He wants to woo when the time comes.
The maiden is chaste,
She does not pledge herself.
Ten years—then she pledges herself.`,
    L2_comentario: `We find ourselves beset by difficulties and hindrances. Suddenly there is a turn of affairs, as if someone were coming up with a horse and wagon and unhitching them. This event comes so unexpectedly that we assume the newcomer to be a robber. Gradually it becomes clear that he has no evil intentions but seeks to be friendly and to offer help. But this offer is not to be accepted, because it does not come from the right quarter. We must wait until the time is fulfilled; ten years is a fulfilled cycle of time. Then normal conditions return of themselves, and we can join forces with the friend intended for us.
Using the image of a betrothed girl who remains true to her lover in face of grave conflicts, the hexagram gives counsel for a special situation. When in times of difficulty a hindrance is encountered and unexpected relief is offered from a source unrelated to us, we must be careful and not take upon ourselves any obligations entailed by such help; otherwise our freedom of decision is impaired. If we bide our time, things will quiet down again, and we shall attain what we have hoped for.`,
    L3_etiqueta: "Six in the third place means:",
    L3_oraculo: `Whoever hunts deer without the forester
Only loses his way in the forest.
The superior man understands the signs of the time
And prefers to desist.
To go on brings humiliation.`,
    L3_comentario:
      "If a man tries to hunt in a strange forest and has no guide, he loses his way. When he finds himself in difficulties he must not try to steal out of them unthinkingly and without guidance. Fate cannot be duped; premature effort, without the necessary guidance, ends in failure and disgrace. Therefore the superior man, discerning the seeds of coming events, prefers to renounce a wish rather than to provoke failure and humiliation by trying to force its fulfillment.",
    L4_etiqueta: "Six in the fourth place means:",
    L4_oraculo: `Horse and wagon part.
Strive for union.
To go brings good fortune.
Everything acts to further.`,
    L4_comentario:
      "We are in a situation in which it is our duty to act, but we lack sufficient power. However, an opportunity to make connections offers itself. It must be seized. Neither false pride nor false reserve should deter us. Bringing oneself to take the first step, even when it involves a certain degree of self-abnegation, is a sign of inner clarity. To accept help in a difficult situation is not a disgrace. If the right helper is found, all goes well.",
    L5_etiqueta: "Nine in the fifth place means:",
    L5_oraculo: `Difficulties in blessing.
A little perseverance brings good fortune.
Great perseverance brings misfortune.`,
    L5_comentario:
      "An individual is in a position in which he cannot so express his good intentions that they will actually take shape and be understood. Other people interpose and distort everything he does. He should then be cautious and proceed step by step. He must not try to force the consummation of a great undertaking, because success is possible only when general confidence already prevails. It is only through faithful and conscientious work, unobtrusively carried on, that the situation gradually clears up and the hindrance disappears.",
    L6_etiqueta: "Six at the top means:",
    L6_oraculo: `Horse and wagon part.
Bloody tears flow.`,
    L6_comentario:
      'The difficulties at the beginning are too great for some persons. They get stuck and never find their way out; they fold their hands and give up the struggle. Such resignation is the saddest of all things. Therefore Confucius says of this line: "Bloody tears flow: one should not persist in this."',
    yong_etiqueta: "",
    yong_oraculo: "",
    yong_comentario: "",
  },
};

function normalizeText(s) {
  return String(s ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u2019/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2014/g, "—")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function compareField(name, userVal, epubVal) {
  const u = normalizeText(userVal);
  const e = normalizeText(epubVal);
  if (u === e) return { name, status: "OK" };
  const uFlat = u.replace(/\n+/g, " ");
  const eFlat = e.replace(/\n+/g, " ");
  if (uFlat === eFlat) return { name, status: "OK_NEWLINES_ONLY" };
  let diffAt = 0;
  const minLen = Math.min(u.length, e.length);
  for (let i = 0; i < minLen; i++) {
    if (u[i] !== e[i]) {
      diffAt = i;
      break;
    }
  }
  return {
    name,
    status: "DIFF",
    userLen: u.length,
    epubLen: e.length,
    userSnippet: u.slice(Math.max(0, diffAt - 25), diffAt + 100),
    epubSnippet: e.slice(Math.max(0, diffAt - 25), diffAt + 100),
  };
}

function buildEpubFields(full) {
  /** @type {Record<string, string>} */
  const EPUB = {
    intro: full.introduction.paragraphs.join("\n\n"),
    judgment_oraculo: full.judgment.oracle,
    judgment_comentario: full.judgment.commentary.join("\n\n"),
    image_oraculo: full.image.oracle,
    image_comentario: full.image.commentary.join("\n\n"),
  };
  for (let i = 1; i <= 6; i++) {
    const L = full.lines[String(i)];
    EPUB[`L${i}_etiqueta`] = L?.label ?? "";
    EPUB[`L${i}_oraculo`] = L?.oracle ?? "";
    EPUB[`L${i}_comentario`] = L?.commentary?.join("\n\n") ?? "";
  }
  const y = full.lines.yongLiu ?? full.lines.yongJiu;
  EPUB.yong_etiqueta = y?.label ?? "";
  EPUB.yong_oraculo = y?.oracle ?? "";
  EPUB.yong_comentario = y?.commentary?.join("\n\n") ?? "";
  return EPUB;
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  const hexNums = process.argv.slice(2).map(Number).filter(Boolean);
const targets = hexNums.length ? hexNums : [2, 3];
const bundle = await loadBundle("wilhelm");

for (const hexNum of targets) {
  const html = await readWilhelmEpubHexHtml(hexNum);
  const full = parseWilhelmEpubFullHtml(html);
  const EPUB = buildEpubFields(full);
  const user = USER_HEX2_3[hexNum];
  if (!user) {
    console.log(`No USER data for hex ${hexNum}`);
    continue;
  }

  console.log(`\n=== HEX ${hexNum} USER vs EPUB ===\n`);
  const fields = Object.keys(EPUB);
  /** @type {Array<{name:string,status:string}>} */
  const diffs = [];
  for (const f of fields) {
    const r = compareField(f, user[f], EPUB[f]);
    if (r.status === "OK") console.log(`OK  ${r.name}`);
    else if (r.status === "OK_NEWLINES_ONLY") console.log(`OK~ ${r.name} (solo saltos)`);
    else {
      console.log(`DIFF ${r.name} (user ${r.userLen} vs epub ${r.epubLen})`);
      console.log(`  user: ${JSON.stringify(r.userSnippet)}`);
      console.log(`  epub: ${JSON.stringify(r.epubSnippet)}`);
      diffs.push(r);
    }
  }

  console.log(`\n=== HEX ${hexNum} ORACLES vs RUNTIME ===\n`);
  const hex = bundle.hexagrams[hexNum - 1];
  const oracleChecks = [
    ["judgment_oraculo", hex.judgment],
    ["image_oraculo", hex.image],
    ...hex.lines.map((l, i) => [`L${i + 1}_oraculo`, l.text]),
    ...(hex.yongJiu ? [["yong_oraculo", hex.yongJiu]] : []),
    ...(hex.yongLiu ? [["yong_oraculo", hex.yongLiu]] : []),
  ];
  for (const [name, runtime] of oracleChecks) {
    const r = compareField(name, user[name], runtime);
    console.log(`${r.status === "OK" || r.status === "OK_NEWLINES_ONLY" ? "OK" : "DIFF"} ${name}`);
  }
}
}
