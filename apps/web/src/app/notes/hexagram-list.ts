/**
 * Static list of the 64 King Wen hexagrams (number, traditional Chinese name,
 * pinyin). Glyphs are derived from the Unicode hexagram block (U+4DC0..U+4DFF),
 * which follows the King Wen sequence one-to-one starting at hexagram 1.
 *
 * Names follow the canonical King Wen ordering used by Wilhelm/Baynes and the
 * Wikipedia reference. This data is language-agnostic: the only meaning we
 * expose here is "which hexagram is which", never the interpretive judgment.
 */
export type HexagramListEntry = {
  number: number;
  glyph: string;
  chineseName: string;
  pinyin: string;
};

const HEXAGRAM_NAMES: ReadonlyArray<{ chineseName: string; pinyin: string }> = [
  { chineseName: "乾", pinyin: "Qián" },
  { chineseName: "坤", pinyin: "Kūn" },
  { chineseName: "屯", pinyin: "Zhūn" },
  { chineseName: "蒙", pinyin: "Méng" },
  { chineseName: "需", pinyin: "Xū" },
  { chineseName: "訟", pinyin: "Sòng" },
  { chineseName: "師", pinyin: "Shī" },
  { chineseName: "比", pinyin: "Bǐ" },
  { chineseName: "小畜", pinyin: "Xiǎo Chù" },
  { chineseName: "履", pinyin: "Lǚ" },
  { chineseName: "泰", pinyin: "Tài" },
  { chineseName: "否", pinyin: "Pǐ" },
  { chineseName: "同人", pinyin: "Tóng Rén" },
  { chineseName: "大有", pinyin: "Dà Yǒu" },
  { chineseName: "謙", pinyin: "Qiān" },
  { chineseName: "豫", pinyin: "Yù" },
  { chineseName: "隨", pinyin: "Suí" },
  { chineseName: "蠱", pinyin: "Gǔ" },
  { chineseName: "臨", pinyin: "Lín" },
  { chineseName: "觀", pinyin: "Guān" },
  { chineseName: "噬嗑", pinyin: "Shì Hè" },
  { chineseName: "賁", pinyin: "Bì" },
  { chineseName: "剝", pinyin: "Bō" },
  { chineseName: "復", pinyin: "Fù" },
  { chineseName: "無妄", pinyin: "Wú Wàng" },
  { chineseName: "大畜", pinyin: "Dà Chù" },
  { chineseName: "頤", pinyin: "Yí" },
  { chineseName: "大過", pinyin: "Dà Guò" },
  { chineseName: "坎", pinyin: "Kǎn" },
  { chineseName: "離", pinyin: "Lí" },
  { chineseName: "咸", pinyin: "Xián" },
  { chineseName: "恆", pinyin: "Héng" },
  { chineseName: "遯", pinyin: "Dùn" },
  { chineseName: "大壯", pinyin: "Dà Zhuàng" },
  { chineseName: "晉", pinyin: "Jìn" },
  { chineseName: "明夷", pinyin: "Míng Yí" },
  { chineseName: "家人", pinyin: "Jiā Rén" },
  { chineseName: "睽", pinyin: "Kuí" },
  { chineseName: "蹇", pinyin: "Jiǎn" },
  { chineseName: "解", pinyin: "Jiě" },
  { chineseName: "損", pinyin: "Sǔn" },
  { chineseName: "益", pinyin: "Yì" },
  { chineseName: "夬", pinyin: "Guài" },
  { chineseName: "姤", pinyin: "Gòu" },
  { chineseName: "萃", pinyin: "Cuì" },
  { chineseName: "升", pinyin: "Shēng" },
  { chineseName: "困", pinyin: "Kùn" },
  { chineseName: "井", pinyin: "Jǐng" },
  { chineseName: "革", pinyin: "Gé" },
  { chineseName: "鼎", pinyin: "Dǐng" },
  { chineseName: "震", pinyin: "Zhèn" },
  { chineseName: "艮", pinyin: "Gèn" },
  { chineseName: "漸", pinyin: "Jiàn" },
  { chineseName: "歸妹", pinyin: "Guī Mèi" },
  { chineseName: "豐", pinyin: "Fēng" },
  { chineseName: "旅", pinyin: "Lǚ" },
  { chineseName: "巽", pinyin: "Xùn" },
  { chineseName: "兌", pinyin: "Duì" },
  { chineseName: "渙", pinyin: "Huàn" },
  { chineseName: "節", pinyin: "Jié" },
  { chineseName: "中孚", pinyin: "Zhōng Fú" },
  { chineseName: "小過", pinyin: "Xiǎo Guò" },
  { chineseName: "既濟", pinyin: "Jì Jì" },
  { chineseName: "未濟", pinyin: "Wèi Jì" },
];

const HEXAGRAM_GLYPH_BASE = 0x4dc0;

export const HEXAGRAM_LIST: ReadonlyArray<HexagramListEntry> = HEXAGRAM_NAMES.map(
  (entry, idx) => ({
    number: idx + 1,
    glyph: String.fromCodePoint(HEXAGRAM_GLYPH_BASE + idx),
    chineseName: entry.chineseName,
    pinyin: entry.pinyin,
  }),
);
