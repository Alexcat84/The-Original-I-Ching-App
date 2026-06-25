/**
 * QA code: TS-CLAUDE-003 interpretation-v2 · v1.0.0
 * Area: backend/claude/src/interpretation.v2
 * Family: CLAUDE
 */

import { describe, it, expect } from "vitest";
import { buildV2HistoricalUserBlock } from "./interpretation-context.js";
import type { ConsultationSummary } from "@iching-oracle/context-engine";

// ---- Fixtures ---------------------------------------------------------------

function makeIChingConsult(overrides: Partial<ConsultationSummary> = {}): ConsultationSummary {
  return {
    position: 1,
    question: "¿Qué me dice el oráculo sobre mi carrera?",
    primaryHexagramNumber: 11,
    primaryHexagramName: "T'ai",
    primaryHexagramChinese: "泰",
    transformedHexagramName: null,
    changingLines: [],
    mutationRule: "NO_CHANGING",
    interpretationSummary: "La paz y la armonía prevalecen; avanza con confianza.",
    oracleType: "iching",
    ...overrides,
  };
}

function makeOracleBonesConsult(overrides: Partial<ConsultationSummary> = {}): ConsultationSummary {
  return {
    position: 4,
    question: "¿Debo firmar el contrato hoy?",
    primaryHexagramNumber: 0,
    primaryHexagramName: "",
    primaryHexagramChinese: "",
    transformedHexagramName: null,
    changingLines: [],
    mutationRule: "ORACLE_BONES",
    interpretationSummary: "El veredicto confirma la acción; procede sin demora.",
    oracleType: "oracle_bones",
    oracleBones: {
      pattern_id: 3,
      verdict: "auspicious_clear",
      positive_charge: "El contrato será exitoso",
      negative_charge: "El contrato fracasará",
      medium: "turtle",
    },
    ...overrides,
  };
}

// ---- F1.2: 11-language labels -----------------------------------------------

describe("buildV2HistoricalUserBlock – language coverage (F1.2)", () => {
  const languages = ["en", "es", "pt", "fr", "de", "it", "ja", "zh", "ko", "ar", "hi"];
  const consult = makeIChingConsult();

  it.each(languages)("produces non-empty output for language=%s", (lang) => {
    const block = buildV2HistoricalUserBlock(consult, lang);
    expect(block.trim().length).toBeGreaterThan(0);
  });

  it("unknown language falls back to en", () => {
    const blockUnknown = buildV2HistoricalUserBlock(consult, "xx");
    const blockEn = buildV2HistoricalUserBlock(consult, "en");
    expect(blockUnknown).toBe(blockEn);
  });
});

// ---- F1.1: User block content -----------------------------------------------

describe("buildV2HistoricalUserBlock – I Ching content", () => {
  it("includes position number", () => {
    const block = buildV2HistoricalUserBlock(makeIChingConsult({ position: 3 }), "en");
    expect(block).toContain("#3");
  });

  it("includes question (truncated to 120 chars)", () => {
    const long = "x".repeat(200);
    const block = buildV2HistoricalUserBlock(makeIChingConsult({ question: long }), "en");
    expect(block).toContain("x".repeat(120));
    expect(block).not.toContain("x".repeat(121));
  });

  it("includes hexagram number and name", () => {
    const block = buildV2HistoricalUserBlock(makeIChingConsult(), "es");
    expect(block).toContain("#11");
    expect(block).toContain("T'ai");
    expect(block).toContain("泰");
  });

  it("includes changing lines when present", () => {
    const block = buildV2HistoricalUserBlock(
      makeIChingConsult({ changingLines: [2, 5], transformedHexagramName: "Kên" }),
      "en",
    );
    expect(block).toContain("Kên");
    expect(block).toContain("[2, 5]");
  });

  it("omits changing lines section when empty", () => {
    const block = buildV2HistoricalUserBlock(makeIChingConsult({ changingLines: [] }), "en");
    expect(block).not.toContain("Changing lines");
    expect(block).not.toContain("[]");
  });

  it("does NOT include interpretationSummary (that goes in assistant turn)", () => {
    const block = buildV2HistoricalUserBlock(
      makeIChingConsult({ interpretationSummary: "UNIQUE_SUMMARY_MARKER" }),
      "en",
    );
    expect(block).not.toContain("UNIQUE_SUMMARY_MARKER");
  });
});

// ---- F1.3: Oracle Bones user block ------------------------------------------

describe("buildV2HistoricalUserBlock – Oracle Bones content", () => {
  it("includes verdict and medium", () => {
    const block = buildV2HistoricalUserBlock(makeOracleBonesConsult(), "en");
    expect(block).toContain("auspicious_clear");
    expect(block).toContain("turtle");
    expect(block).toContain("pattern 3");
  });

  it("uses localized oracle-bones label for es", () => {
    const block = buildV2HistoricalUserBlock(makeOracleBonesConsult(), "es");
    expect(block).toContain("huesos de oráculo");
  });

  it("does NOT contain I Ching hexagram labels for oracle bones consult", () => {
    const block = buildV2HistoricalUserBlock(makeOracleBonesConsult(), "en");
    expect(block).not.toContain("Hexagram");
    expect(block).not.toContain("Changing lines");
  });
});

// ---- F1.1: Determinism ------------------------------------------------------

describe("buildV2HistoricalUserBlock – determinism", () => {
  it("produces identical output for identical inputs", () => {
    const c = makeIChingConsult({ changingLines: [1, 4], transformedHexagramName: "Chien" });
    expect(buildV2HistoricalUserBlock(c, "es")).toBe(buildV2HistoricalUserBlock(c, "es"));
  });
});
