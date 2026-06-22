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
  [/\benters\s+the\s+house\b/gi, "enters his house"],
  [/\bDo\s+not\s+act\s+this\s+way\b/gi, "Do not act in this way"],
];

/** Commentary starters that end oracle stanza extraction. */
export const WILHELM_ORACLE_COMMENTARY_START =
  /^(According|When a |When an |When the |When one |The symbol|Just as |In the |In times of |Note\.|©|\d+\s+\[|These lines|This hexagram|Religious forces|Clouds and thunder|Hidden dragon\.|Nine |Six |It is the law|The time of |Fundamental sincerity|For youthful folly|Great\. No blame|The usual translation|Good-hearted approach|If an inferior man|Confucius says|This describes|Since the hexagram|Yellow is the color|Making a boast|One man permits|A man permits|He is oppressed|In time after|Derives from the fact|At hand an eminent|He furthers and regulates|Law is the beginning|A man withdraws|Thus one acts|Thunder rolls|Water reaches its goal|When the water has flowed|He who knows limitation\b|the basis of Chinese)/i;

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
