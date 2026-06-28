import { getHexagramRecordByNumber } from "@iching-oracle/iching-data";
import {
  buildLine,
  exploreMutation,
  type LineReadingSystem,
  type MutationExploreResult,
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

/**
 * Full verbatim oracle payload for the verifier — every non-empty field from
 * selectTextsForClaude (gold @iching-oracle/iching-data) plus any remaining
 * changing-line texts from the primary hexagram.
 */
export function buildOracleTextBlocks(
  result: MutationExploreResult,
  translator: "wilhelm" | "legge" | "zhouyi",
  ui: MutationExplorerUiMessages,
): OracleTextBlock[] {
  const texts = textsForTranslator(result, translator);
  const blocks: OracleTextBlock[] = [];

  pushBlock(blocks, {
    id: "rule-explanation",
    kind: "rule",
    heading: ui.ruleExplanationHeading,
    text: texts.ruleExplanation,
  });

  pushBlock(blocks, {
    id: "judgment-primary",
    kind: "judgment",
    heading: ui.judgmentPrimary,
    text: texts.primaryJudgment,
    emphasis: texts.judgmentEmphasis === "primary" ? "primary" : undefined,
  });

  pushBlock(blocks, {
    id: "image-primary",
    kind: "image",
    heading: ui.imagePrimary,
    text: texts.primaryImage,
  });

  for (const line of texts.selectedLineTexts) {
    const hex =
      line.fromHexagram === "primary" ? result.primaryNumber : result.transformedNumber;
    pushBlock(blocks, {
      id: `line-selected-${line.fromHexagram}-${line.position}`,
      kind: "line",
      heading: ui.lineTextHeading(hex, line.position),
      text: line.text,
      emphasis: line.emphasis,
    });
  }

  const selectedPositions = new Set(
    texts.selectedLineTexts.map((line) => line.position),
  );
  if (result.changingLines.length > 0) {
    const primaryRecord = getHexagramRecordByNumber(result.primaryNumber, { translator });
    for (const position of result.changingLines) {
      if (selectedPositions.has(position)) continue;
      const text = primaryRecord.lines.find((line) => line.position === position)?.text ?? "";
      pushBlock(blocks, {
        id: `line-changing-${position}`,
        kind: "line",
        heading: ui.changingLineVerbatimHeading(position),
        text,
      });
    }
  }

  pushBlock(blocks, {
    id: "judgment-transformed",
    kind: "judgment",
    heading: ui.judgmentTransformed,
    text: texts.transformedJudgment ?? "",
    emphasis: texts.judgmentEmphasis === "transformed" ? "primary" : undefined,
  });

  pushBlock(blocks, {
    id: "image-transformed",
    kind: "image",
    heading: ui.imageTransformed,
    text: texts.transformedImage ?? "",
  });

  if (texts.specialYaoText?.trim()) {
    pushBlock(blocks, {
      id: "yong",
      kind: "yong",
      heading: result.primaryNumber === 1 ? ui.yongJiu : ui.yongLiu,
      text: texts.specialYaoText,
    });
  }

  return blocks;
}

export function formatConsultRef(id: string): string {
  const compact = id.replace(/-/g, "");
  const core = compact.slice(0, 10).toUpperCase();
  return core.length >= 8 ? `${core.slice(0, 4)}·${core.slice(4, 8)}` : id.slice(0, 8);
}
