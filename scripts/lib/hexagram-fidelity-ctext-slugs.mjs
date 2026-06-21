/** King Wen 1–64 → ctext.org chapter slug (verified 2026-06-21). */
export const CTEXT_SLUGS = [
  "qian",
  "kun",
  "zhun",
  "meng",
  "xu",
  "song",
  "shi",
  "bi",
  "xiao-xu",
  "lu",
  "tai",
  "pi",
  "tong-ren",
  "da-you",
  "qian1",
  "yu",
  "sui",
  "gu",
  "lin",
  "guan",
  "shi-he",
  "bi1",
  "bo",
  "fu",
  "wu-wang",
  "da-xu",
  "yi",
  "da-guo",
  "kan",
  "li",
  "xian",
  "heng",
  "dun",
  "da-zhuang",
  "jin",
  "ming-yi",
  "jia-ren",
  "kui",
  "jian",
  "jie",
  "sun",
  "yi1",
  "guai",
  "gou",
  "cui",
  "sheng",
  "kun1",
  "jing",
  "ge",
  "ding",
  "zhen",
  "gen",
  "jian1",
  "gui-mei",
  "feng",
  "lu1",
  "xun",
  "dui",
  "huan",
  "jie1",
  "zhong-fu",
  "xiao-guo",
  "ji-ji",
  "wei-ji",
];

export function ctextSlugForHex(number) {
  const slug = CTEXT_SLUGS[number - 1];
  if (!slug) throw new Error(`No ctext slug for hex ${number}`);
  return slug;
}

export function ctextUrnForHex(number) {
  return `ctp:book-of-changes/${ctextSlugForHex(number)}`;
}

/** @param {number} n 1..64 */
export function romanNumeral(n) {
  const map = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let x = n;
  let out = "";
  for (const [val, sym] of map) {
    while (x >= val) {
      out += sym;
      x -= val;
    }
  }
  return out;
}
