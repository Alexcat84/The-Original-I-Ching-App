/**
 * QA code: TS-WEB-002 manual-iching-consult · v1.0.0
 * Area: apps/web/src/lib/manual-iching-consult
 * Family: WEB
 */

import { describe, expect, it } from "vitest";
import { ichingManualLineValuesSchema, parseIchingManualPayload } from "../manual-iching-consult";

describe("ichingManualLineValuesSchema", () => {
  it("accepts six valid values", () => {
    const r = ichingManualLineValuesSchema.safeParse([6, 7, 8, 9, 7, 8]);
    expect(r.success).toBe(true);
  });

  it("rejects wrong length", () => {
    const r = ichingManualLineValuesSchema.safeParse([6, 7, 8]);
    expect(r.success).toBe(false);
  });
});

describe("parseIchingManualPayload", () => {
  it("returns manual with tuple for iching + manual", () => {
    const p = parseIchingManualPayload(
      { ichingCastMode: "manual", ichingManualLineValues: [7, 7, 7, 8, 8, 8] },
      "iching",
    );
    expect(p.ok).toBe(true);
    if (p.ok) expect(p.mode).toBe("manual");
    if (p.ok && p.mode === "manual") expect(p.lineValues).toEqual([7, 7, 7, 8, 8, 8]);
  });

  it("rejects manual with oracle bones", () => {
    const p = parseIchingManualPayload(
      { ichingCastMode: "manual", ichingManualLineValues: [7, 7, 7, 7, 7, 7] },
      "oracle_bones",
    );
    expect(p.ok).toBe(false);
  });

  it("rejects auto with line array", () => {
    const p = parseIchingManualPayload(
      { ichingCastMode: "auto", ichingManualLineValues: [7, 7, 7, 7, 7, 7] },
      "iching",
    );
    expect(p.ok).toBe(false);
  });
});
