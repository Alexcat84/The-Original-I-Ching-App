import type { OracleType } from "@iching-oracle/context-engine";
import { z } from "zod";

const lineValueSchema = z.union([z.literal(6), z.literal(7), z.literal(8), z.literal(9)]);

export const ichingManualLineValuesSchema = z.tuple([
  lineValueSchema,
  lineValueSchema,
  lineValueSchema,
  lineValueSchema,
  lineValueSchema,
  lineValueSchema,
]);

export type IchingManualLineTuple = z.infer<typeof ichingManualLineValuesSchema>;

export type IchingManualParseResult =
  | { ok: true; mode: "auto" }
  | { ok: true; mode: "manual"; lineValues: IchingManualLineTuple }
  | { ok: false; status: 400; body: Record<string, unknown> };

export function parseIchingManualPayload(
  raw: { ichingCastMode?: unknown; ichingManualLineValues?: unknown },
  oracleMode: OracleType,
): IchingManualParseResult {
  const wantsManual = raw.ichingCastMode === "manual";
  const hasLineArray = Array.isArray(raw.ichingManualLineValues);

  if (oracleMode !== "iching") {
    if (wantsManual) {
      return {
        ok: false,
        status: 400,
        body: {
          error: "invalid_cast_mode",
          code: "ICHING_MANUAL_NOT_ICHING",
          action: "fix_input",
        },
      };
    }
    if (hasLineArray) {
      return {
        ok: false,
        status: 400,
        body: {
          error: "invalid_manual_payload",
          code: "ICHING_MANUAL_PAYLOAD_MISMATCH",
          action: "fix_input",
        },
      };
    }
    return { ok: true, mode: "auto" };
  }

  if (!wantsManual) {
    if (hasLineArray) {
      return {
        ok: false,
        status: 400,
        body: {
          error: "invalid_manual_payload",
          code: "ICHING_MANUAL_PAYLOAD_MISMATCH",
          action: "fix_input",
        },
      };
    }
    return { ok: true, mode: "auto" };
  }

  const parsed = ichingManualLineValuesSchema.safeParse(raw.ichingManualLineValues);
  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      body: {
        error: "invalid_manual_lines",
        code: "ICHING_MANUAL_LINES_INVALID",
        action: "fix_input",
      },
    };
  }
  return { ok: true, mode: "manual", lineValues: parsed.data };
}
