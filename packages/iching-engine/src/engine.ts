import { getHexagramRecordByBinaryTopFirst, type HexagramRecord } from "@iching-oracle/iching-data";
import {
  type CastingMethod,
  type CastResult,
  type Hexagram,
  type InterpretationMode,
  type Line,
  type LineType,
  type LineValue,
  type MutationRule,
  type TextsForClaude,
} from "./types.js";


export type Rng = () => number;

function recordToHexagram(r: HexagramRecord): Hexagram {
  return {
    number: r.number,
    name: r.name,
    chineseName: r.chineseName,
    pinyin: r.pinyin,
    upperTrigram: r.upperTrigram,
    lowerTrigram: r.lowerTrigram,
    judgment: r.judgment,
    image: r.image,
    lines: r.lines,
    ...(r.yongJiu !== undefined ? { yongJiu: r.yongJiu } : {}),
    ...(r.yongLiu !== undefined ? { yongLiu: r.yongLiu } : {}),
  };
}

/** Bottom line = position 1; returns King Wen binary (line 6 → line 1, top first). */
export function linesToBinaryTopFirst(lines: Line[]): string {
  const sorted = [...lines].sort((a, b) => a.position - b.position);
  const bottomFirst = sorted
    .map((l) => (l.value === 7 || l.value === 9 ? "1" : "0"))
    .join("");
  return bottomFirst.split("").reverse().join("");
}

export function getHexagram(lines: Line[], translator: InterpretationMode = "wilhelm"): Hexagram {
  const key = linesToBinaryTopFirst(lines);
  const effectiveTranslator = translator === "master_combined" ? "wilhelm" : translator;
  return recordToHexagram(getHexagramRecordByBinaryTopFirst(key, { translator: effectiveTranslator }));
}

export function throwThreeCoins(rng: Rng = Math.random): LineValue {
  const c = () => (rng() < 0.5 ? 2 : 3);
  return (c() + c() + c()) as LineValue;
}

export function buildLine(value: LineValue, position: Line["position"]): Line {
  const map = {
    6: { type: "yin_old" as LineType, isChanging: true, symbol: "——✕——" },
    7: { type: "yang_young" as LineType, isChanging: false, symbol: "———————" },
    8: { type: "yin_young" as LineType, isChanging: false, symbol: "—— ——" },
    9: { type: "yang_old" as LineType, isChanging: true, symbol: "——○——" },
  };
  return { value, position, ...map[value] };
}

export function castSixLines(rng: Rng = Math.random): Line[] {
  return ([1, 2, 3, 4, 5, 6] as const).map((pos) => buildLine(throwThreeCoins(rng), pos));
}

export function applyMutations(lines: Line[]): Line[] {
  return lines.map((l) => {
    if (!l.isChanging) return l;
    if (l.type === "yin_old") return buildLine(7, l.position);
    if (l.type === "yang_old") return buildLine(8, l.position);
    return l;
  });
}

export function determineMutationRule(
  primary: Hexagram,
  lines: Line[],
  changing: number[],
): MutationRule {
  const n = changing.length;
  if (n === 6) {
    if (primary.number === 1) return "QIAN_ALL_NINE";
    if (primary.number === 2) return "KUN_ALL_SIX";
    return "SIX_ALL_CHANGING";
  }
  if (n === 0) return "NO_CHANGING";
  if (n === 1) return "ONE_CHANGING";
  if (n === 2) {
    const cl = lines.filter((l) => changing.includes(l.position));
    const yins = cl.filter((l) => l.type === "yin_old").length;
    const yangs = cl.filter((l) => l.type === "yang_old").length;
    if (yins === 1 && yangs === 1) return "TWO_YIN_YANG";
    return "TWO_SAME_LOWER";
  }
  if (n === 3) return "THREE_MIDDLE";
  if (n === 4) return "FOUR_LOWEST_STABLE";
  if (n === 5) return "FIVE_ONLY_STABLE";
  return "NO_CHANGING";
}

export function selectTextsForClaude(
  primary: Hexagram,
  transformed: Hexagram | null,
  lines: Line[],
  changing: number[],
  rule: MutationRule,
  translator: InterpretationMode = "wilhelm",
): TextsForClaude {
  const base: TextsForClaude = {
    primaryJudgment: primary.judgment,
    primaryImage: primary.image,
    selectedLineTexts: [],
    transformedJudgment: transformed?.judgment ?? null,
    transformedImage: transformed?.image ?? null,
    specialYaoText: null,
    ruleExplanation: "",
  };
  const gl = (hex: Hexagram, pos: number) => hex.lines.find((l) => l.position === pos)?.text ?? "";

  switch (rule) {
    case "NO_CHANGING":
      return {
        ...base,
        transformedJudgment: null,
        transformedImage: null,
        ruleExplanation: "Sin mutaciones. Solo Juicio e Imagen del hexagrama primario.",
      };

    case "ONE_CHANGING": {
      const pos = changing[0]!;
      return {
        ...base,
        selectedLineTexts: [{ position: pos, text: gl(primary, pos), fromHexagram: "primary" }],
        ruleExplanation: `Una mutación en línea ${pos}. Es el elemento más importante.`,
      };
    }

    case "TWO_YIN_YANG": {
      const yin = lines.find((l) => changing.includes(l.position) && l.type === "yin_old")!;
      return {
        ...base,
        selectedLineTexts: [
          { position: yin.position, text: gl(primary, yin.position), fromHexagram: "primary" },
        ],
        ruleExplanation: `Dos mutaciones yin+yang. Solo se lee la línea Yin (pos ${yin.position}).`,
      };
    }

    case "TWO_SAME_LOWER": {
      const low = Math.min(...changing);
      return {
        ...base,
        selectedLineTexts: [
          { position: low, text: gl(primary, low), fromHexagram: "primary" },
        ],
        ruleExplanation: `Dos mutaciones mismo tipo. Solo se lee la inferior (pos ${low}).`,
      };
    }

    case "THREE_MIDDLE": {
      const mid = [...changing].sort((a, b) => a - b)[1]!;
      return {
        ...base,
        selectedLineTexts: [
          { position: mid, text: gl(primary, mid), fromHexagram: "primary" },
        ],
        ruleExplanation: `Tres mutaciones. Línea central (pos ${mid}). Ambos juicios igual peso.`,
      };
    }

    case "FOUR_LOWEST_STABLE": {
      if (!transformed) return base;
      const stable = [1, 2, 3, 4, 5, 6].filter((p) => !changing.includes(p));
      const low = Math.min(...stable);
      return {
        ...base,
        selectedLineTexts: [
          { position: low, text: gl(transformed, low), fromHexagram: "transformed" },
        ],
        ruleExplanation: `Cuatro mutaciones. Línea estable más baja del TRANSFORMADO (pos ${low}).`,
      };
    }

    case "FIVE_ONLY_STABLE": {
      if (!transformed) return base;
      const only = [1, 2, 3, 4, 5, 6].find((p) => !changing.includes(p))!;
      return {
        ...base,
        selectedLineTexts: [
          { position: only, text: gl(transformed, only), fromHexagram: "transformed" },
        ],
        ruleExplanation: `Cinco mutaciones. Único testigo estable del TRANSFORMADO (pos ${only}).`,
      };
    }

    case "SIX_ALL_CHANGING":
      return {
        ...base,
        primaryImage: "",
        selectedLineTexts: [],
        ruleExplanation: "Mutación total. Solo Juicio del hexagrama transformado.",
      };

    case "QIAN_ALL_NINE":
      return {
        ...base,
        selectedLineTexts: [],
        specialYaoText:
          primary.yongJiu ??
          'Todos los Nueves (用九): "Rebaño de dragones sin cabeza; ventura."',
        ruleExplanation: "Qian (1) con todos Yang Viejos. Séptimo Yao 用九.",
      };

    case "KUN_ALL_SIX":
      return {
        ...base,
        selectedLineTexts: [],
        specialYaoText:
          primary.yongLiu ?? 'Todos los Seises (用六): "Ventajoso la perseverancia duradera."',
        ruleExplanation: "Kun (2) con todos Yin Viejos. Séptimo Yao 用六.",
      };

    default:
      break;
  }

  if (translator === "master_combined") {
    const keyP = linesToBinaryTopFirst(lines);
    const keyT = transformed ? linesToBinaryTopFirst(applyMutations(lines)) : null;

    const fetchExtra = (tId: "legge" | "zhouyi") => {
      const pRec = getHexagramRecordByBinaryTopFirst(keyP, { translator: tId });
      const tRec = keyT ? getHexagramRecordByBinaryTopFirst(keyT, { translator: tId }) : null;
      
      let linesArray: Array<{ position: number; text: string; fromHexagram: "primary" | "transformed" }> = [];
      if (base.selectedLineTexts && base.selectedLineTexts.length > 0) {
        linesArray = base.selectedLineTexts.map((lt) => {
          const rec = lt.fromHexagram === "primary" ? pRec : tRec;
          const text = rec?.lines.find((l) => l.position === lt.position)?.text ?? "";
          return { ...lt, text };
        });
      }
      return {
        judgment: pRec.judgment,
        image: pRec.image,
        lines: linesArray,
      };
    };

    const leggeExtra = fetchExtra("legge");
    const zhouyiExtra = fetchExtra("zhouyi");

    base.leggeJudgment = leggeExtra.judgment;
    base.leggeImage = leggeExtra.image;
    base.leggeSelectedLineTexts = leggeExtra.lines;

    base.zhouyiJudgment = zhouyiExtra.judgment;
    base.zhouyiImage = zhouyiExtra.image;
    base.zhouyiSelectedLineTexts = zhouyiExtra.lines;
  }

  return base;
}

export interface PerformCastOptions {
  rng?: Rng;
  id?: string;
  now?: Date;
  castingMethod?: CastingMethod;
  translator?: InterpretationMode;
}

function newCastId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID();
  return `cast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function buildCastResultFromLines(
  lines: Line[],
  question: string,
  language: string,
  options?: PerformCastOptions,
): CastResult {
  const translator = options?.translator ?? "wilhelm";
  const changing = lines.filter((l) => l.isChanging).map((l) => l.position);
  const primary = getHexagram(lines, translator);
  const transformedLines = changing.length > 0 ? applyMutations(lines) : null;
  const transformed = transformedLines ? getHexagram(transformedLines, translator) : null;
  const rule = determineMutationRule(primary, lines, changing);
  const texts = selectTextsForClaude(primary, transformed, lines, changing, rule, translator);
  return {
    id: options?.id ?? newCastId(),
    question,
    language,
    lines,
    primaryHexagram: primary,
    transformedHexagram: transformed,
    changingLines: changing,
    mutationRule: rule,
    textsForClaude: texts,
    timestamp: options?.now ?? new Date(),
    ...(options?.castingMethod !== undefined ? { castingMethod: options.castingMethod } : {}),
  };
}

export type ManualCastPreview = Pick<
  CastResult,
  "lines" | "primaryHexagram" | "transformedHexagram" | "changingLines" | "mutationRule"
>;

/** Six line values, position 1 = bottom line. Throws if length !== 6 or any value invalid. */
export function performCastFromLineValues(
  question: string,
  language: string,
  lineValues: readonly LineValue[],
  options?: PerformCastOptions,
): CastResult {
  if (lineValues.length !== 6) {
    throw new RangeError("performCastFromLineValues requires exactly 6 line values");
  }
  const positions = [1, 2, 3, 4, 5, 6] as const;
  const lines: Line[] = positions.map((pos, i) => {
    const v = lineValues[i];
    if (v !== 6 && v !== 7 && v !== 8 && v !== 9) {
      throw new RangeError(`Invalid line value at index ${i}: ${String(v)}`);
    }
    return buildLine(v, pos);
  });
  return buildCastResultFromLines(lines, question, language, {
    ...options,
    castingMethod: options?.castingMethod ?? "three-coins",
  });
}

/** Client-side preview of primary / transformed hexagram from six values (same geometry as performCastFromLineValues). */
export function previewCastFromLineValues(lineValues: readonly LineValue[]): ManualCastPreview {
  if (lineValues.length !== 6) {
    throw new RangeError("previewCastFromLineValues requires exactly 6 line values");
  }
  const positions = [1, 2, 3, 4, 5, 6] as const;
  const lines: Line[] = positions.map((pos, i) => buildLine(lineValues[i]!, pos));
  const changing = lines.filter((l) => l.isChanging).map((l) => l.position);
  const primary = getHexagram(lines);
  const transformedLines = changing.length > 0 ? applyMutations(lines) : null;
  const transformed = transformedLines ? getHexagram(transformedLines) : null;
  const rule = determineMutationRule(primary, lines, changing);
  return { lines, primaryHexagram: primary, transformedHexagram: transformed, changingLines: changing, mutationRule: rule };
}

export function performCast(
  question: string,
  language = "es",
  options?: PerformCastOptions,
): CastResult {
  const rng = options?.rng ?? Math.random;
  const lines = castSixLines(rng);
  return buildCastResultFromLines(lines, question, language, {
    ...options,
    castingMethod: options?.castingMethod ?? "three-coins",
  });
}

// ─── Yarrow Stalks ──────────────────────────────────────────────────────────

/** Authentic Zhou-dynasty distribution: 6=1/16, 7=5/16, 8=7/16, 9=3/16 */
export function throwYarrowStalks(rng: Rng = Math.random): LineValue {
  const n = Math.floor(rng() * 16);
  if (n < 1) return 6;
  if (n < 6) return 7;
  if (n < 13) return 8;
  return 9;
}

export function castYarrowSixLines(rng: Rng = Math.random): Line[] {
  return ([1, 2, 3, 4, 5, 6] as const).map((pos) => buildLine(throwYarrowStalks(rng), pos));
}

/**
 * Convert the three phase residues from a manual yarrow-stalk count into a LineValue.
 * Phase 1 residue: 5 or 9. Phases 2–3 residue: 4 or 8.
 * Valid sums → values: 13→9, 17→8, 21→7, 25→6
 */
export function yarrowSumToLine(phase1: 5 | 9, phase2: 4 | 8, phase3: 4 | 8): LineValue {
  return ((49 - (phase1 + phase2 + phase3)) / 4) as LineValue;
}

export function performYarrowCast(
  question: string,
  language = "es",
  options?: PerformCastOptions,
): CastResult {
  const rng = options?.rng ?? Math.random;
  const lines = castYarrowSixLines(rng);
  return buildCastResultFromLines(lines, question, language, {
    ...options,
    castingMethod: "yarrow-stalks",
  });
}
