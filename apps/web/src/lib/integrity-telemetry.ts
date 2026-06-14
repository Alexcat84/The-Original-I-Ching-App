import { createHash } from "node:crypto";

/** Correlation id: native shell → challenge → consult (header x-integrity-trace-id). */
export const INTEGRITY_TRACE_HEADER = "x-integrity-trace-id";

/** Short SHA-256 prefix — safe to log; never log raw nonce or integrity tokens. */
export function fingerprintIntegrityValue(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

export function describeNonceShape(nonce: string): {
  len: number;
  hasDash: boolean;
  hasUnderscore: boolean;
  hasPlus: boolean;
  hasSlash: boolean;
  hasPadding: boolean;
} {
  return {
    len: nonce.length,
    hasDash: nonce.includes("-"),
    hasUnderscore: nonce.includes("_"),
    hasPlus: nonce.includes("+"),
    hasSlash: nonce.includes("/"),
    hasPadding: nonce.endsWith("="),
  };
}

export function readIntegrityTraceId(req: Request): string | null {
  const raw = req.headers.get(INTEGRITY_TRACE_HEADER)?.trim();
  return raw && raw.length <= 128 ? raw : null;
}
