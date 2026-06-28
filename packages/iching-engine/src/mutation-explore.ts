import {
  getHexagramRecordByBinaryTopFirst,
  getHexagramRecordByNumber,
} from "@iching-oracle/iching-data";
import {
  applyMutations,
  buildLine,
  determineMutationRule,
  getHexagram,
  selectTextsForClaude,
} from "./engine.js";
import { determineMutationRuleZhuXi } from "./rules/zhuxi.js";
import type {
  AnyMutationRule,
  Hexagram,
  Line,
  LineReadingSystem,
  LineValue,
  TextsForClaude,
} from "./types.js";

export type MutationTextSelection = {
  kind: "line" | "judgment" | "image" | "yong";
  hex: number;
  position?: number;
  emphasis?: "primary" | "secondary";
  judgmentScope?: "primary" | "transformed";
};

export type MutationExploreInput = {
  primaryNumber: number;
  transformedNumber?: number;
  mask?: number;
  castIndex?: number;
  lineReadingSystem: LineReadingSystem;
  /** Stored consultation lines — 100% parity with live cast when provided. */
  lines?: Line[];
};

export type MutationExploreResult = {
  castIndex: number;
  primaryNumber: number;
  transformedNumber: number;
  changingLines: number[];
  stableLines: number[];
  mutationRule: AnyMutationRule;
  lineReadingSystem: LineReadingSystem;
  textsByTranslator: Record<"wilhelm" | "legge" | "zhouyi", TextsForClaude>;
  selections: MutationTextSelection[];
  linesUsed: Line[];
};

export class MutationExploreError extends Error {
  constructor(
    message: string,
    readonly code: "invalid_cast_index" | "invalid_mask" | "invalid_hex_pair" | "missing_primary",
  ) {
    super(message);
    this.name = "MutationExploreError";
  }
}

const CAST_INDEX_MIN = 1;
const CAST_INDEX_MAX = 4096;

export function encodeCastIndex(primary: number, mask: number): number {
  if (primary < 1 || primary > 64) {
    throw new MutationExploreError(`primary must be 1–64, got ${primary}`, "missing_primary");
  }
  if (mask < 0 || mask > 63) {
    throw new MutationExploreError(`mask must be 0–63, got ${mask}`, "invalid_mask");
  }
  return (primary - 1) * 64 + mask + 1;
}

export function decodeCastIndex(castIndex: number): { primary: number; mask: number } {
  if (castIndex < CAST_INDEX_MIN || castIndex > CAST_INDEX_MAX) {
    throw new MutationExploreError(
      `castIndex must be ${CAST_INDEX_MIN}–${CAST_INDEX_MAX}, got ${castIndex}`,
      "invalid_cast_index",
    );
  }
  const n = castIndex - 1;
  return { primary: Math.floor(n / 64) + 1, mask: n % 64 };
}

export function maskFromChangingLines(changingLines: number[]): number {
  return changingLines.reduce((m, pos) => m | (1 << (pos - 1)), 0);
}

export function changingLinesFromMask(mask: number): number[] {
  const changing: number[] = [];
  for (let pos = 1; pos <= 6; pos++) {
    if ((mask & (1 << (pos - 1))) !== 0) changing.push(pos);
  }
  return changing;
}

function primaryBitAtPosition(primaryNumber: number, position: number): "0" | "1" {
  const primary = getHexagramRecordByNumber(primaryNumber, { translator: "wilhelm" });
  const idx = 6 - position;
  return primary.binaryTopFirst[idx] as "0" | "1";
}

export function deriveChangingLinesFromHexPair(
  primaryNumber: number,
  transformedNumber: number,
): { changingLines: number[]; stableLines: number[] } {
  const primary = getHexagramRecordByNumber(primaryNumber, { translator: "wilhelm" });
  const transformed = getHexagramRecordByNumber(transformedNumber, { translator: "wilhelm" });
  const changing: number[] = [];
  let hamming = 0;
  for (let position = 1; position <= 6; position++) {
    const idx = 6 - position;
    if (primary.binaryTopFirst[idx] !== transformed.binaryTopFirst[idx]) {
      changing.push(position);
      hamming++;
    }
  }
  if (hamming > 6) {
    throw new MutationExploreError(
      `Hex pair ${primaryNumber}→${transformedNumber} is not reachable in one cast`,
      "invalid_hex_pair",
    );
  }
  const stable = [1, 2, 3, 4, 5, 6].filter((p) => !changing.includes(p));
  return { changingLines: changing, stableLines: stable };
}

export function applyMaskToPrimary(primaryNumber: number, mask: number): number {
  const primary = getHexagramRecordByNumber(primaryNumber, { translator: "wilhelm" });
  const bits = primary.binaryTopFirst.split("");
  for (let pos = 1; pos <= 6; pos++) {
    if ((mask & (1 << (pos - 1))) !== 0) {
      const idx = 6 - pos;
      bits[idx] = bits[idx] === "1" ? "0" : "1";
    }
  }
  return getHexagramRecordByBinaryTopFirst(bits.join("")).number;
}

export function buildSyntheticLinesFromMask(primaryNumber: number, mask: number): Line[] {
  const lines: Line[] = [];
  for (let pos = 1; pos <= 6; pos++) {
    const isChanging = (mask & (1 << (pos - 1))) !== 0;
    const bit = primaryBitAtPosition(primaryNumber, pos);
    let value: LineValue;
    if (isChanging) {
      value = bit === "1" ? 9 : 6;
    } else {
      value = bit === "1" ? 7 : 8;
    }
    lines.push(buildLine(value, pos as Line["position"]));
  }
  return lines;
}

export function lineValuesFromLines(lines: Line[]): LineValue[] {
  return [...lines]
    .sort((a, b) => a.position - b.position)
    .map((l) => l.value);
}

function resolvePrimaryAndMask(input: MutationExploreInput): { primary: number; mask: number } {
  if (input.castIndex !== undefined) {
    const decoded = decodeCastIndex(input.castIndex);
    if (input.primaryNumber !== decoded.primary) {
      // primaryNumber is authoritative when both provided; castIndex wins for mask
      return { primary: decoded.primary, mask: decoded.mask };
    }
    return decoded;
  }
  if (input.mask !== undefined) {
    return { primary: input.primaryNumber, mask: input.mask };
  }
  if (input.transformedNumber !== undefined) {
    const { changingLines } = deriveChangingLinesFromHexPair(
      input.primaryNumber,
      input.transformedNumber,
    );
    return { primary: input.primaryNumber, mask: maskFromChangingLines(changingLines) };
  }
  throw new MutationExploreError(
    "Provide castIndex, mask, or transformedNumber",
    "invalid_hex_pair",
  );
}

export function textsToSelections(
  texts: TextsForClaude,
  primary: Hexagram,
  transformed: Hexagram | null,
  changingLines: number[],
  rule: AnyMutationRule,
  system: LineReadingSystem,
): MutationTextSelection[] {
  const selections: MutationTextSelection[] = [];

  for (const line of texts.selectedLineTexts) {
    selections.push({
      kind: "line",
      hex: line.fromHexagram === "primary" ? primary.number : (transformed?.number ?? primary.number),
      position: line.position,
      ...(line.emphasis ? { emphasis: line.emphasis } : {}),
    });
  }

  const includePrimaryJudgment =
    changingLines.length === 0 ||
    rule === "ZX_THREE_JUDGMENTS" ||
    rule === "THREE_MIDDLE" ||
    texts.readBothJudgments === true ||
    (system === "zhuxi" && changingLines.length === 3);

  if (includePrimaryJudgment || texts.primaryJudgment) {
    selections.push({
      kind: "judgment",
      hex: primary.number,
      judgmentScope: "primary",
      ...(texts.judgmentEmphasis === "primary" ? { emphasis: "primary" } : {}),
    });
  }

  if (texts.transformedJudgment) {
    selections.push({
      kind: "judgment",
      hex: transformed?.number ?? primary.number,
      judgmentScope: "transformed",
      ...(texts.judgmentEmphasis === "transformed" ? { emphasis: "primary" } : {}),
    });
  }

  if (changingLines.length === 0 || texts.readBothJudgments) {
    selections.push({ kind: "image", hex: primary.number, judgmentScope: "primary" });
    if (texts.transformedImage && transformed) {
      selections.push({ kind: "image", hex: transformed.number, judgmentScope: "transformed" });
    }
  }

  if (texts.specialYaoText) {
    selections.push({ kind: "yong", hex: primary.number });
  }

  return selections;
}

export function exploreMutation(input: MutationExploreInput): MutationExploreResult {
  const { primary, mask } = resolvePrimaryAndMask(input);
  const transformedNumber = applyMaskToPrimary(primary, mask);
  const changingLines = changingLinesFromMask(mask);
  const stableLines = [1, 2, 3, 4, 5, 6].filter((p) => !changingLines.includes(p));

  const linesUsed = input.lines ?? buildSyntheticLinesFromMask(primary, mask);
  const primaryHex = getHexagram(linesUsed);
  const transformedHex =
    changingLines.length > 0 ? getHexagram(applyMutations(linesUsed)) : null;

  const mutationRule: AnyMutationRule =
    input.lineReadingSystem === "zhuxi"
      ? determineMutationRuleZhuXi(primaryHex, changingLines)
      : determineMutationRule(primaryHex, linesUsed, changingLines);

  const huangRule =
    input.lineReadingSystem === "huang"
      ? (mutationRule as import("./types.js").MutationRule)
      : determineMutationRule(primaryHex, linesUsed, changingLines);

  const buildTexts = (translator: "wilhelm" | "legge" | "zhouyi") =>
    selectTextsForClaude(
      primaryHex,
      transformedHex,
      linesUsed,
      changingLines,
      huangRule,
      translator,
      input.lineReadingSystem,
      input.lineReadingSystem === "zhuxi"
        ? (mutationRule as import("./types.js").ZhuXiMutationRule)
        : undefined,
    );

  const textsByTranslator = {
    wilhelm: buildTexts("wilhelm"),
    legge: buildTexts("legge"),
    zhouyi: buildTexts("zhouyi"),
  };

  const selections = textsToSelections(
    textsByTranslator.wilhelm,
    primaryHex,
    transformedHex,
    changingLines,
    mutationRule,
    input.lineReadingSystem,
  );

  return {
    castIndex: encodeCastIndex(primary, mask),
    primaryNumber: primary,
    transformedNumber,
    changingLines,
    stableLines,
    mutationRule,
    lineReadingSystem: input.lineReadingSystem,
    textsByTranslator,
    selections,
    linesUsed,
  };
}

export type CastCatalogSystemEntry = {
  rule: AnyMutationRule;
  selections: MutationTextSelection[];
};

export type CastCatalogEntry = {
  castIndex: number;
  primary: number;
  mask: number;
  transformed: number;
  changingLines: number[];
  lineValues: LineValue[];
  huang: CastCatalogSystemEntry;
  zhuxi: CastCatalogSystemEntry;
};

export function buildCastCatalogEntry(primary: number, mask: number): CastCatalogEntry {
  const huang = exploreMutation({ primaryNumber: primary, mask, lineReadingSystem: "huang" });
  const zhuxi = exploreMutation({ primaryNumber: primary, mask, lineReadingSystem: "zhuxi" });
  return {
    castIndex: encodeCastIndex(primary, mask),
    primary,
    mask,
    transformed: huang.transformedNumber,
    changingLines: huang.changingLines,
    lineValues: lineValuesFromLines(huang.linesUsed),
    huang: { rule: huang.mutationRule, selections: huang.selections },
    zhuxi: { rule: zhuxi.mutationRule, selections: zhuxi.selections },
  };
}
