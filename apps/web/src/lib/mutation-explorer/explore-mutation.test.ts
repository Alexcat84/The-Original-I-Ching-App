/**
 * QA code: TS-WEB-015 mutation-explorer-oracle-blocks · v1.1.0
 * Area: apps/web/src/lib/mutation-explorer/explore-mutation
 * Family: WEB-MUT
 */

import { describe, expect, it } from "vitest";
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
  changingLineVerbatimHeading: (position: number) => `Changing line ${position}`,
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

function omittedChangingLineBlocks(blocks: ReturnType<typeof buildOracleTextBlocks>) {
  return blocks.filter((b) => b.kind === "line" && b.id.startsWith("line-changing-"));
}

describe("buildOracleTextBlocks — three-tier reading hierarchy", () => {
  it("NO_CHANGING: primary judgment + image only", () => {
    const { result, blocks } = readBlocks(9, 0, "huang");
    expect(result.mutationRule).toBe("NO_CHANGING");
    expect(blocks.map((b) => b.id)).toEqual(["judgment-primary", "image-primary"]);
    expect(blocks.every((b) => b.isRead)).toBe(true);
    expect(omittedChangingLineBlocks(blocks)).toHaveLength(0);
  });

  it("THREE_MIDDLE Huang: tier 1 + one line + tier 3; no omitted changing lines", () => {
    const mask = maskFromChangingLines([1, 3, 5]);
    const { result, blocks } = readBlocks(9, mask, "huang");
    expect(result.castIndex).toBe(534);
    expect(result.mutationRule).toBe("THREE_MIDDLE");
    expect(omittedChangingLineBlocks(blocks)).toHaveLength(0);
    expect(blocks.find((b) => b.id === "judgment-primary")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "image-primary")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "judgment-transformed")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "image-transformed")?.isRead).toBe(true);
    const readLines = blocks.filter((b) => b.kind === "line");
    expect(readLines).toHaveLength(1);
    expect(readLines[0]?.id).toBe("line-selected-primary-3");
  });

  it("ZX_THREE_JUDGMENTS: both judgments with emphasis; no line blocks", () => {
    const mask = maskFromChangingLines([1, 3, 5]);
    const { result, blocks } = readBlocks(9, mask, "zhuxi");
    expect(result.mutationRule).toBe("ZX_THREE_JUDGMENTS");
    expect(blocks.filter((b) => b.kind === "line")).toHaveLength(0);
    expect(blocks.find((b) => b.id === "judgment-primary")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "judgment-transformed")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "image-primary")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "image-transformed")?.isRead).toBe(true);
  });

  it("FOUR_LOWEST_STABLE Huang: tier 1 + L2 transformed + tier 3", () => {
    const mask = maskFromChangingLines([3, 4, 5, 6]);
    const { result, blocks } = readBlocks(9, mask, "huang");
    expect(result.castIndex).toBe(573);
    expect(result.mutationRule).toBe("FOUR_LOWEST_STABLE");
    expect(omittedChangingLineBlocks(blocks)).toHaveLength(0);
    expect(blocks.find((b) => b.id === "line-selected-transformed-2")?.isRead).toBe(true);
    expect(blocks.filter((b) => b.isRead).length).toBe(blocks.length);
  });

  it("ZX_FOUR_LOWER: two transformed lines with primary/secondary emphasis", () => {
    const mask = maskFromChangingLines([3, 4, 5, 6]);
    const { blocks } = readBlocks(9, mask, "zhuxi");
    const readLines = blocks.filter((b) => b.kind === "line");
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

  it("QIAN_ALL_NINE Zhu Xi: tier 1 + yong + tier 3", () => {
    const { result, blocks } = readBlocks(1, 63, "zhuxi");
    expect(result.mutationRule).toBe("QIAN_ALL_NINE");
    expect(blocks.some((b) => b.id === "yong" && b.isRead)).toBe(true);
    expect(blocks.find((b) => b.id === "image-primary")?.isRead).toBe(true);
    expect(blocks.find((b) => b.id === "image-transformed")?.isRead).toBe(true);
    expect(blocks.every((b) => b.isRead)).toBe(true);
  });
});
