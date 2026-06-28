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
  kind: "line" | "judgment" | "image" | "yong";
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

export function buildOracleTextBlocks(
  result: MutationExploreResult,
  translator: "wilhelm" | "legge" | "zhouyi",
  ui: MutationExplorerUiMessages,
): OracleTextBlock[] {
  const texts = textsForTranslator(result, translator);
  const blocks: OracleTextBlock[] = [];

  for (const line of texts.selectedLineTexts) {
    const hex =
      line.fromHexagram === "primary" ? result.primaryNumber : result.transformedNumber;
    blocks.push({
      id: `line-${hex}-${line.position}`,
      kind: "line",
      heading: ui.lineTextHeading(hex, line.position),
      text: line.text,
      emphasis: line.emphasis,
    });
  }

  if (texts.primaryJudgment) {
    blocks.push({
      id: "judgment-primary",
      kind: "judgment",
      heading: ui.judgmentPrimary,
      text: texts.primaryJudgment,
      emphasis: texts.judgmentEmphasis === "primary" ? "primary" : undefined,
    });
  }

  if (texts.transformedJudgment) {
    blocks.push({
      id: "judgment-transformed",
      kind: "judgment",
      heading: ui.judgmentTransformed,
      text: texts.transformedJudgment,
      emphasis: texts.judgmentEmphasis === "transformed" ? "primary" : undefined,
    });
  }

  if (texts.primaryImage && (result.changingLines.length === 0 || texts.readBothJudgments)) {
    blocks.push({
      id: "image-primary",
      kind: "image",
      heading: ui.imagePrimary,
      text: texts.primaryImage,
    });
  }

  if (texts.transformedImage) {
    blocks.push({
      id: "image-transformed",
      kind: "image",
      heading: ui.imageTransformed,
      text: texts.transformedImage,
    });
  }

  if (texts.specialYaoText) {
    blocks.push({
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
