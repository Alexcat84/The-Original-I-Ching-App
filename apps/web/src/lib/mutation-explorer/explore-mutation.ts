import { getHexagramRecordByNumber } from "@iching-oracle/iching-data";
import { getMutationRuleBookText } from "@iching-oracle/iching-data";
import {
  buildLine,
  exploreMutation,
  type LineReadingSystem,
  type MutationExploreResult,
  type MutationTextSelection,
  type TextsForClaude,
} from "@iching-oracle/iching-engine";
import type { MutationExplorerUiMessages } from "@iching-oracle/i18n";

export type OracleTextBlock = {
  id: string;
  kind: "line" | "judgment" | "image" | "yong" | "rule";
  heading: string;
  text: string;
  emphasis?: "primary" | "secondary";
  /** True when this block is read under the active line-reading rule. */
  isRead?: boolean;
};

export type ConsultationExploreContext = {
  consultationId: string;
  sessionId: string;
  sessionPosition: number;
  question: string;
  primaryHexagram: number;
  transformedHexagram: number | null;
  changingLines: number[];
  lines: number[];
  mutationRule: string;
  lineReadingSystem: LineReadingSystem;
  translator: "wilhelm" | "legge" | "zhouyi" | "master_combined";
  castIndex: number;
  createdAt: string;
};

function linesFromValues(values: number[]) {
  return values.map((v, i) =>
    buildLine(v as 6 | 7 | 8 | 9, (i + 1) as 1 | 2 | 3 | 4 | 5 | 6),
  );
}

export function runExploreFromConsultation(
  ctx: ConsultationExploreContext,
  lineReadingSystem: LineReadingSystem,
): MutationExploreResult {
  return exploreMutation({
    primaryNumber: ctx.primaryHexagram,
    mask: undefined,
    castIndex: ctx.castIndex,
    lineReadingSystem,
    lines: linesFromValues(ctx.lines),
  });
}

function textsForTranslator(
  result: MutationExploreResult,
  translator: "wilhelm" | "legge" | "zhouyi",
): TextsForClaude {
  return result.textsByTranslator[translator];
}

function pushBlock(
  blocks: OracleTextBlock[],
  block: OracleTextBlock | null,
): void {
  if (block && block.text.trim()) blocks.push(block);
}

function lineSelection(
  result: MutationExploreResult,
  hex: number,
  position: number,
): MutationTextSelection | undefined {
  return result.selections.find(
    (sel) => sel.kind === "line" && sel.hex === hex && sel.position === position,
  );
}

function isReadJudgment(
  result: MutationExploreResult,
  scope: "primary" | "transformed",
): boolean {
  return result.selections.some(
    (sel) => sel.kind === "judgment" && sel.judgmentScope === scope,
  );
}

function isReadImage(
  result: MutationExploreResult,
  scope: "primary" | "transformed",
): boolean {
  return result.selections.some(
    (sel) => sel.kind === "image" && sel.judgmentScope === scope,
  );
}

function isReadYong(result: MutationExploreResult): boolean {
  return result.selections.some((sel) => sel.kind === "yong");
}

function judgmentEmphasis(
  result: MutationExploreResult,
  scope: "primary" | "transformed",
): "primary" | "secondary" | undefined {
  const sel = result.selections.find(
    (s) => s.kind === "judgment" && s.judgmentScope === scope,
  );
  return sel?.emphasis;
}

/**
 * Full oracle context for verification — all relevant texts visible;
 * `isRead` marks blocks the active line-reading rule selects.
 */
export function buildOracleTextBlocks(
  result: MutationExploreResult,
  translator: "wilhelm" | "legge" | "zhouyi",
  ui: MutationExplorerUiMessages,
): OracleTextBlock[] {
  const texts = textsForTranslator(result, translator);
  const blocks: OracleTextBlock[] = [];

  pushBlock(blocks, {
    id: "judgment-primary",
    kind: "judgment",
    heading: ui.judgmentPrimary,
    text: texts.primaryJudgment,
    emphasis: judgmentEmphasis(result, "primary"),
    isRead: isReadJudgment(result, "primary"),
  });

  pushBlock(blocks, {
    id: "image-primary",
    kind: "image",
    heading: ui.imagePrimary,
    text: texts.primaryImage,
    isRead: isReadImage(result, "primary"),
  });

  for (const line of texts.selectedLineTexts) {
    const hex =
      line.fromHexagram === "primary" ? result.primaryNumber : result.transformedNumber;
    const sel = lineSelection(result, hex, line.position);
    pushBlock(blocks, {
      id: `line-selected-${line.fromHexagram}-${line.position}`,
      kind: "line",
      heading: ui.lineTextHeading(hex, line.position),
      text: line.text,
      emphasis: sel?.emphasis ?? line.emphasis,
      isRead: Boolean(sel),
    });
  }

  const selectedPositions = new Set(
    texts.selectedLineTexts
      .filter((line) => line.fromHexagram === "primary")
      .map((line) => line.position),
  );
  if (result.changingLines.length > 0) {
    const primaryRecord = getHexagramRecordByNumber(result.primaryNumber, { translator });
    for (const position of result.changingLines) {
      if (selectedPositions.has(position)) continue;
      const sel = lineSelection(result, result.primaryNumber, position);
      const text = primaryRecord.lines.find((line) => line.position === position)?.text ?? "";
      pushBlock(blocks, {
        id: `line-changing-${position}`,
        kind: "line",
        heading: ui.changingLineVerbatimHeading(position),
        text,
        isRead: Boolean(sel),
      });
    }
  }

  pushBlock(blocks, {
    id: "judgment-transformed",
    kind: "judgment",
    heading: ui.judgmentTransformed,
    text: texts.transformedJudgment ?? "",
    emphasis: judgmentEmphasis(result, "transformed"),
    isRead: isReadJudgment(result, "transformed"),
  });

  pushBlock(blocks, {
    id: "image-transformed",
    kind: "image",
    heading: ui.imageTransformed,
    text: texts.transformedImage ?? "",
    isRead: isReadImage(result, "transformed"),
  });

  if (texts.specialYaoText?.trim()) {
    pushBlock(blocks, {
      id: "yong",
      kind: "yong",
      heading: result.primaryNumber === 1 ? ui.yongJiu : ui.yongLiu,
      text: texts.specialYaoText,
      isRead: isReadYong(result),
    });
  }

  return blocks;
}

/** Gold bookText EN for the active line-reading system — not oracle translator text. */
export function getReadingRuleExplanation(result: MutationExploreResult): string {
  const system = result.lineReadingSystem === "zhuxi" ? "zhuxi" : "huang";
  return getMutationRuleBookText(system, result.mutationRule).trim();
}

export function formatConsultRef(id: string): string {
  const compact = id.replace(/-/g, "");
  const core = compact.slice(0, 10).toUpperCase();
  return core.length >= 8 ? `${core.slice(0, 4)}·${core.slice(4, 8)}` : id.slice(0, 8);
}
