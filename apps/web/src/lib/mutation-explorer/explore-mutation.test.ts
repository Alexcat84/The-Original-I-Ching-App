/**
 * QA code: TS-WEB-015 mutation-explorer-oracle-blocks · v1.0.0
 * Area: apps/web/src/lib/mutation-explorer/explore-mutation
 * Family: WEB-MUT
 */

import { describe, expect, it } from "vitest";
import { getMutationRuleRecord } from "@iching-oracle/iching-data";
import {
  exploreMutation,
  maskFromChangingLines,
  type LineReadingSystem,
} from "@iching-oracle/iching-engine";
import type { MutationExplorerUiMessages } from "@iching-oracle/i18n";
import { buildOracleTextBlocks } from "@/lib/mutation-explorer/explore-mutation";

const ui = {
  judgmentPrimary: "Judgment (primary)",
  judgmentTransformed: "Judgment (transformed)",
  imagePrimary: "Image (primary)",
  imageTransformed: "Image (transformed)",
  yongJiu: "Yong Jiu",
  yongLiu: "Yong Liu",
  lineTextHeading: (hex: number, position: number) => `Line ${position} · Hexagram ${hex}`,
  changingLineVerbatimHeading: (position: number) => `Changing line ${position} (literal text)`,
} satisfies Pick<
  MutationExplorerUiMessages,
  | "judgmentPrimary"
  | "judgmentTransformed"
  | "imagePrimary"
  | "imageTransformed"
  | "yongJiu"
  | "yongLiu"
  | "lineTextHeading"
  | "changingLineVerbatimHeading"
>;

function readBlocks(
  primary: number,
  mask: number,
  system: LineReadingSystem,
) {
  const result = exploreMutation({ primaryNumber: primary, mask, lineReadingSystem: system });
  const blocks = buildOracleTextBlocks(result, "wilhelm", ui as MutationExplorerUiMessages);
  return { result, blocks };
}

function changingLineBlocks(blocks: ReturnType<typeof buildOracleTextBlocks>) {
  return blocks.filter((b) => b.kind === "line" && b.id.startsWith("line-changing-"));
}

function readBlockCount(blocks: ReturnType<typeof buildOracleTextBlocks>) {
  return blocks.filter((b) => b.isRead).length;
}

describe("buildOracleTextBlocks — full context + isRead", () => {
  it("9→4 code 534 Huang: all primary changing lines visible; only L3 read", () => {
    const mask = maskFromChangingLines([1, 3, 5]);
    const { result, blocks } = readBlocks(9, mask, "huang");
    expect(result.castIndex).toBe(534);
    expect(result.mutationRule).toBe("THREE_MIDDLE");
    expect(changingLineBlocks(blocks).map((b) => b.id)).toEqual([
      "line-changing-1",
      "line-changing-5",
    ]);
    const readLines = blocks.filter((b) => b.isRead && b.kind === "line");
    expect(readLines).toHaveLength(1);
    expect(readLines[0]?.id).toBe("line-selected-primary-3");
    expect(blocks.find((b) => b.id === "judgment-primary")?.isRead).toBe(false);
  });

  it("9→4 Huang: primary judgment shown as context but not read", () => {
    const mask = maskFromChangingLines([1, 3, 5]);
    const { blocks } = readBlocks(9, mask, "huang");
    const judgment = blocks.find((b) => b.id === "judgment-primary");
    expect(judgment?.text.trim().length).toBeGreaterThan(0);
    expect(judgment?.isRead).toBe(false);
  });

  it("9→4 Zhu Xi: three changing line blocks; both judgments read", () => {
    const mask = maskFromChangingLines([1, 3, 5]);
    const { result, blocks } = readBlocks(9, mask, "zhuxi");
    expect(result.mutationRule).toBe("ZX_THREE_JUDGMENTS");
    expect(changingLineBlocks(blocks)).toHaveLength(3);
    expect(blocks.filter((b) => b.isRead && b.kind === "line")).toHaveLength(0);
    expect(blocks.find((b) => b.id === "judgment-primary")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "judgment-transformed")?.isRead).toBe(true);
  });

  it("9→54 code 573 Huang: L2 transformed read; four changing lines on primary visible", () => {
    const mask = maskFromChangingLines([3, 4, 5, 6]);
    const { result, blocks } = readBlocks(9, mask, "huang");
    expect(result.castIndex).toBe(573);
    expect(result.mutationRule).toBe("FOUR_LOWEST_STABLE");
    expect(changingLineBlocks(blocks)).toHaveLength(4);
    const readLine = blocks.find((b) => b.isRead && b.kind === "line");
    expect(readLine?.id).toBe("line-selected-transformed-2");
  });

  it("9→54 Zhu Xi: L1+L2 transformed read with primary/secondary emphasis", () => {
    const mask = maskFromChangingLines([3, 4, 5, 6]);
    const { blocks } = readBlocks(9, mask, "zhuxi");
    const readLines = blocks.filter((b) => b.isRead && b.kind === "line");
    expect(readLines.map((b) => b.id).sort()).toEqual([
      "line-selected-transformed-1",
      "line-selected-transformed-2",
    ]);
    expect(readLines.find((b) => b.id === "line-selected-transformed-1")?.emphasis).toBe(
      "primary",
    );
    expect(readLines.find((b) => b.id === "line-selected-transformed-2")?.emphasis).toBe(
      "secondary",
    );
  });

  it("read block count matches gold textTypes for THREE_MIDDLE Huang", () => {
    const mask = maskFromChangingLines([1, 3, 5]);
    const { result, blocks } = readBlocks(9, mask, "huang");
    const gold = getMutationRuleRecord("huang", result.mutationRule);
    expect(readBlockCount(blocks)).toBe(gold.textTypes.length);
  });

  it("read block count matches gold textTypes for ZX_THREE_JUDGMENTS", () => {
    const mask = maskFromChangingLines([1, 3, 5]);
    const { result, blocks } = readBlocks(9, mask, "zhuxi");
    const gold = getMutationRuleRecord("zhuxi", result.mutationRule);
    expect(readBlockCount(blocks)).toBe(gold.textTypes.length);
  });
});
