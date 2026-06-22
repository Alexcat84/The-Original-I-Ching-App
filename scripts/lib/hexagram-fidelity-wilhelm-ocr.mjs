/**
 * OCR repairs for Wilhelm/Baynes 1950 pdftotext output and fidelity diffs.
 */

/** @type {[RegExp, string][]} */
export const WILHELM_OCR_REPAIRS = [
  [/\bHo\.?LpInG\b/gi, "HOLDING TOGETHER"],
  [/\bBirinG\b/gi, "BITING"],
  [/\bMopesty\b/gi, "MODESTY"],
  [/\bEwruusiasM\b/gi, "ENTHUSIASM"],
  [/\bENTHUsIAsM\b/gi, "ENTHUSIASM"],
  [/\bTue\s+army\b/gi, "THE ARMY"],
  [/\bOxsrruction\b/gi, "OBSTRUCTION"],
  [/\bDe\s+tiverAnce\b/gi, "DELIVERANCE"],
  [/\bDecreEase\b/gi, "DECREASE"],
  [/\bdeceases\b/gi, "decreases"],
  [/\bComine\s+To\s+MEET\b/gi, "COMING TO MEET"],
  [/\bPROGREss\b/gi, "PROGRESS"],
  [/\bF\s*lying\b/gi, "Flying"],
  [/\bConFrtict\b/gi, "CONFLICT"],
  [/\bDispErsion\b/gi, "Dispersion"],
  [/\bFo\.?LLow1?nc\b/gi, "Following"],
  [/\bFis\s+nose\b/gi, "His nose"],
  [/\bJame\s+man\b/gi, "lame man"],
  [/\bbrakes\b/gi, "breaks"],
  [/\bset'armies\b/gi, "set armies"],
  [/\bfoal\b/gi, "goal"],
  [/\bean\s+drink\b/gi, "can drink"],
  [/\bthere\s+is\s+not\s+water\b/gi, "there is no water"],
  [/\bgoes\s+gradually\b/gi, "gradually"],
  [/\bclouds\s+heights\b/gi, "cloud heights"],
  [/\bGreat\s+hearted\b/gi, "Greathearted"],
  [/\bBoy\s+like\b/gi, "Boylike"],
  [/\bA\.\s+good\b/gi, "A good"],
  [/\bA\.\s+big\b/gi, "A big"],
  [/\bring\s+humiliation\b/gi, "rings humiliation"],
  [/\bdepriving\s+other,?\s*$/gi, "depriving others"],
  [/\bwithout\s+depriving\s+other\b/gi, "without depriving others"],
  [/\bbowl"\b/gi, "bowl"],
  [/\bwho\.\s+When\b/gi, "who, when"],
  [/\brice'\s+with\b/gi, "rice with"],
  [/\bGrace in hills\b/gi, "Grace in the hills"],
  [/\bthree\s+sides\s*\n\s*only\b/gi, "three sides only"],
  [/\bwell\s+hole\b/gi, "wellhole"],
  [/\bforgoes\b/gi, "foregoes"],
  [/\bgroup\.'\s*$/gi, "group."],
  [/\benters\s+the\s+house\b/gi, "enters his house"],
  [/\bDo\s+not\s+act\s+this\s+way\b/gi, "Do not act in this way"],
];

/** Commentary starters that end oracle stanza extraction. */
export const WILHELM_ORACLE_COMMENTARY_START =
  /^(According|When a |When an |When the |When one |The symbol|Just as |In the |In times of |Note\.|©|\d+\s+\[|These lines|This hexagram|Religious forces|Clouds and thunder|Hidden dragon\.|Nine |Six |It is the law|The time of |Fundamental sincerity|For youthful folly|Great\. No blame|The usual translation|Good-hearted approach|If an inferior man|Confucius says|This describes|Since the hexagram|Yellow is the color|Making a boast|One man permits|A man permits|He is oppressed|In time after|Derives from the fact|At hand an eminent|He furthers and regulates|Law is the beginning|A man withdraws|Thus one acts|Thunder rolls|Water reaches its goal|When the water has flowed|He who knows limitation\b|the basis of Chinese)/i;

/** First line of Wilhelm commentary after a changing-line statement (Pantheon layout). */
export const WILHELM_LINE_COMMENTARY_OPENERS =
  /^(Movement within the mind|The situation is abnormal|The dark element opens|If we are in pursuit|When we are in danger|When we are in|The two elements|Whatever endures can be|A woman should follow|A man should at all|One should strive to|He who does not|Here the effects of|The place of transition|A place of transition|At the transition|Cause for remorse then|However, since it is|Lao-tse says|Confucius says|This refers|Such a|Such is|Therefore |Because |Although |While |Thus he |Thus the |One must set about|Derives from|The image here|The weak element|The strong line|The ruler|The superior man has already|In this way|At this time|If we|It is the same|It is not|It would|This is the|This describes|These lines|The time is|The line|The fourth|A spring succeeds|Water is something|Character is developed|Duration is a state|WHEN A man|Inferior people are on the rise|The power of the inferior|Every man must have something|It is a bad thing for a man|While a conflict is in|At the beginning of a military|Here the great man has attained|Through friendly relations with|A man's faults often prevent|If there are ulterior motives|The goat is noted for|Thus he proves to inferior|In the end, good fortune comes|An inexperienced person|If a person encounters|We are in a situation|The difficulties at the beginning|In face of a superior enemy|Danger gradually comes|Mud is no place|Even in the midst|The warm attachment|The beginning of union|There is danger here|Here fellowship|The situation is very favorable|Here an attempt|Here the reconciliation|Here ENTHUSIASM|Here the relations|Here we have|In the sphere|In nature nothing|In human affairs|The danger is not yet|Sand is near|The situation is extremely|Making a boast|He is oppressed|Yellow is the color|Religious forces|Clouds and thunder|Water reaches its goal|When the water has flowed|He who knows limitation\b|the basis of Chinese)/i;

/** Prose paragraph opening a judgment commentary block (after oracle verses). */
export const WILHELM_JUDGMENT_COMMENTARY_OPENERS =
  /^(Duration is a state|WHEN A man|When a man is|Conditions of time|This hexagram|According to|The judgment|The Chinese word|Heavenly bodies exemplify|So likewise the dedicated|In the sphere of social|In nature|In human affairs|Fundamental to|The name of the hexagram|One must understand|We must understand|It is the same with|This is the situation|These are the|There is no blame in|Here we have|Here the situation|Now the situation|A man who|The situation shows|The course of events|The movement of|The light-giving power begins|The dark forces are|Thus the superior man|Thus the ruler|Thus the king|Therefore |However |Because |Since |Although |While )/i;

/**
 * @param {string} line
 * @param {number} index 0-based index within the line block
 */
export function isWilhelmLineCommentaryLine(line, index = 0) {
  const t = String(line ?? "").trim();
  if (!t) return false;
  if (isWilhelmOracleContinuationLine(t)) return false;
  if (index === 0) {
    return WILHELM_ORACLE_COMMENTARY_START.test(t) && t.length > 50;
  }

  // pdftotext often continues a commentary sentence on the next line (lowercase tail).
  if (/^[a-z(]/.test(t)) return true;

  if (WILHELM_LINE_COMMENTARY_OPENERS.test(t)) return true;
  if (WILHELM_ORACLE_COMMENTARY_START.test(t) && t.length > 40) return true;

  // Changing-line oracle verses are short; commentary runs in long prose sentences.
  if (
    t.length > 92 &&
    /^(The |An |This |These |Here |There |A place of |A man who |If a person |If we are |If there are |When we are |When the time |In face of |In the midst |In this |At the beginning |Great possession |Modesty that |Enthusiasm |Deluded |Religious |Clouds and |Water reaches )/i.test(
      t,
    )
  ) {
    return true;
  }

  // Known oracle-verse continuations (keep multi-line statements from the book).
  if (
    t.length <= 105 &&
    /^(It furthers|If by chance|If one |When one goes|No blame|Good fortune|Misfortune|Perseverance|He who |Hidden |Flying |Waiting |Difficulties |Horse and |Take not |In punishing|To make a |Childlike |Entangled |Simple conduct|Wavering |All day|One cannot |One falls |One may |One returns |Bites |Loses |Sincere |Return to |He allows |The spokes |If you are |Manifestation |Standstill |Missing the |Mighty in |He finds |He climbs |He hides |He makes |He whose |He shoots |Look to |Men bound |Fellowship |No relationship|A big wagon|A prince |A superior |A tied-up|They bear |When ribbon|Persistently |Enthusiasm |Bearing with |The sovereign|Nine |Six )/i.test(
      t,
    )
  ) {
    return false;
  }

  return false;
}

/** Oracle stanza often ends on these standalone lines before Wilhelm commentary. */
export function lineEndsWilhelmOracleStanza(line) {
  const t = String(line ?? "").trim();
  if (!t) return false;
  if (
    /^(Misfortune\.|No blame\.|Good fortune\.|Supreme good fortune\.|Humiliation\.|No remorse\.|Progress without blame\.|Nothing that would further\.|Nothing furthers\.|Remain free of guilt\.)/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/bring to completion\.?\s*$/i.test(t)) return true;
  if (/To go on brings humiliation\.?\s*$/i.test(t)) return true;
  if (/In the end, good fortune comes\.?\s*$/i.test(t)) return true;
  return /\bNo blame\.?\s*$/i.test(t) || /\bMisfortune\.?\s*$/i.test(t);
}

/** Short oracle tag-lines that follow Misfortune/No blame (not Wilhelm commentary). */
export function isWilhelmOracleContinuationLine(line) {
  const t = String(line ?? "").trim();
  if (!t || t.length > 130) return false;
  return /^Thus (?:does|the|one|he|it|in|a|an)\b/i.test(t) ||
    /^(?:In this way |In the end this |In the end, good fortune |In the end this brings |Nothing (?:further|serves|that would further) |No remorse\.?$|No blame\.?$|No mistake\.?$|No praise\.?$|It furthers one |It brings good fortune\.?$|One should strive |One obtains |One must not |When one goes |Starting brings |To continue is |To be conscious |To remain persevering |one should remain calm\.?$|there is rest\.?$|This is due to the lasting |Perseverance brings the woman |The moon is nearly full |If the superior man persists |Dispersion leads |This is something that ordinary |Spying about |If there are ulterior |If one meets with no confidence |Undertakings bring |Everything serves |Tarrying brings |Perseverance brings (?:good fortune|humiliation)|This is certainly true\.?$|Simply handed in through the window\.?$|Shut in between |For three years one |He holds him fast |No one can tear |This brings blessing |And supreme good fortune\.?$|And foregoes game |The citizens need no warning\.?$|Thus he proves to inferior men |Thus one may manage |Thus does a warrior |In the hunt the king |The standstill serves |One makes a mistake\.?$|and walks\.?$|and tongue\.?$)/i.test(
      t,
    );
}

/** Commentary line that typically follows a complete oracle stanza. */
export function lineFollowsWilhelmOracleStanza(line) {
  if (isWilhelmOracleContinuationLine(line)) return false;
  const t = String(line ?? "").trim();
  if (!t) return false;

  if (
    t.length <= 90 &&
    /^(There is some gossip|There is a little gossip|There is no blame|There is rest|There is not|This is without|This brings|The end brings|Otherwise you will|In danger like|It is favorable|If one remains|If the superior|If one does not|When ribbon|Between himself|He makes a difference|No relationship|No boasting|No plain not|They bear and|Manifestation of|Standstill is|Waiting on the|If one does not perpetuate)/i.test(
      t,
    )
  ) {
    return false;
  }

  if (t.length <= 48 && /^There is /i.test(t)) return false;

  if (
    /^(Thus |This describes |This refers |This hexagram |This is the |This offers |Now it is the time of |The danger |The head |The situation |The beginning |The work |The waiting |The standstill |The time of obstruction |The-time of obstruction |The back of the neck is |The toes are in |The high plateau is |The image is that |An individual |An inexperienced |If a man tries |If a man is free |If a person |If we |When we |When the danger |When the water |Here we |Here the |Here fellowship |Here an |Here every step\b|Here life comes to |One must |We are |We must |He who knows |It is the law |It lies |It would |Loyalty leads |Making a boast |Great possession |Modesty that comes|A sphere of |A weak, |A man tries |A girl |A man's understanding |A well that is fed |A truculent stranger |The danger gradually |The waiting is over |There are people who |“Tlustrious Ancestor” |"Tlustrious Ancestor" |“Out of |"Out of )/i.test(
      t,
    )
  ) {
    return true;
  }
  return isWilhelmLineCommentaryLine(t, 1);
}

/**
 * @param {string} line
 * @param {number} index 0-based index within judgment oracle block
 */
export function isWilhelmJudgmentCommentaryLine(line, index = 0) {
  const t = String(line ?? "").trim();
  if (!t || index === 0) return false;
  if (WILHELM_JUDGMENT_COMMENTARY_OPENERS.test(t)) return true;
  return WILHELM_ORACLE_COMMENTARY_START.test(t) && t.length > 60;
}

/**
 * @param {string} text
 */
export function repairWilhelmOcrText(text) {
  if (!text) return "";
  let out = String(text);
  for (const [re, rep] of WILHELM_OCR_REPAIRS) {
    out = out.replace(re, rep);
  }
  return out
    .replace(/\u2019|\u2018/g, "'")
    .replace(/\s+'\s+/g, " ")
    .replace(/[™©°]/g, "")
    .replace(/\s+\|\s*$/gm, "")
    .replace(/\*\s*/g, "")
    .replace(/\s+,/g, ",")
    .replace(/,\s+/g, ", ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
