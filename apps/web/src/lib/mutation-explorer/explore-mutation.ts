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

function selectionSortKey(sel: MutationTextSelection): number {
  if (sel.kind === "judgment" && sel.judgmentScope === "primary") return 10;
  if (sel.kind === "image" && sel.judgmentScope === "primary") return 20;
  if (sel.kind === "line") return 30 + (sel.position ?? 0);
  if (sel.kind === "judgment" && sel.judgmentScope === "transformed") return 40;
  if (sel.kind === "image" && sel.judgmentScope === "transformed") return 50;
  if (sel.kind === "yong") return 60;
  return 100;
}

function lineTextForSelection(
  result: MutationExploreResult,
  texts: TextsForClaude,
  sel: MutationTextSelection,
  translator: "wilhelm" | "legge" | "zhouyi",
): string {
  if (!sel.position) return "";
  const fromSelected = texts.selectedLineTexts.find(
    (line) =>
      line.position === sel.position &&
      (sel.hex === result.primaryNumber
        ? line.fromHexagram === "primary"
        : line.fromHexagram === "transformed"),
  );
  if (fromSelected?.text.trim()) return fromSelected.text;
  const record = getHexagramRecordByNumber(sel.hex, { translator });
  return record.lines.find((line) => line.position === sel.position)?.text ?? "";
}

/**
 * Verbatim oracle texts the engine selected for this cast — mirrors `result.selections`.
 */
export function buildOracleTextBlocks(
  result: MutationExploreResult,
  translator: "wilhelm" | "legge" | "zhouyi",
  ui: MutationExplorerUiMessages,
): OracleTextBlock[] {
  const texts = textsForTranslator(result, translator);
  const blocks: OracleTextBlock[] = [];
  const lineSelections = result.selections.filter((sel) => sel.kind === "line");
  const singleLineRead = lineSelections.length === 1;

  const ordered = [...result.selections].sort(
    (a, b) => selectionSortKey(a) - selectionSortKey(b),
  );

  for (const sel of ordered) {
    if (sel.kind === "line" && sel.position) {
      const emphasis =
        sel.emphasis ?? (singleLineRead ? ("primary" as const) : undefined);
      pushBlock(blocks, {
        id: `line-${sel.hex}-${sel.position}`,
        kind: "line",
        heading: ui.lineTextHeading(sel.hex, sel.position),
        text: lineTextForSelection(result, texts, sel, translator),
        emphasis,
      });
      continue;
    }

    if (sel.kind === "judgment") {
      const isTransformed = sel.judgmentScope === "transformed";
      pushBlock(blocks, {
        id: `judgment-${sel.judgmentScope ?? "primary"}`,
        kind: "judgment",
        heading: isTransformed ? ui.judgmentTransformed : ui.judgmentPrimary,
        text: isTransformed ? (texts.transformedJudgment ?? "") : texts.primaryJudgment,
        emphasis: sel.emphasis,
      });
      continue;
    }

    if (sel.kind === "image") {
      const isTransformed = sel.judgmentScope === "transformed";
      pushBlock(blocks, {
        id: `image-${sel.judgmentScope ?? "primary"}`,
        kind: "image",
        heading: isTransformed ? ui.imageTransformed : ui.imagePrimary,
        text: isTransformed ? (texts.transformedImage ?? "") : texts.primaryImage,
      });
      continue;
    }

    if (sel.kind === "yong") {
      pushBlock(blocks, {
        id: "yong",
        kind: "yong",
        heading: result.primaryNumber === 1 ? ui.yongJiu : ui.yongLiu,
        text: texts.specialYaoText ?? "",
      });
    }
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
