import { useCallback, useRef } from "react";

interface TokenState {
  token: string;
  expiresAt: number;
  traceId: string | null;
}

/** iOS v1: Play Integrity omitted (D5). No-op stub — same return shape as Android hook. */
export function useIntegrityCheck(_isAuthenticated: boolean) {
  const currentTokenRef = useRef<string | null>(null);
  const currentTraceIdRef = useRef<string | null>(null);
  const refreshToken = useCallback(async (_traceId?: string): Promise<string | null> => null, []);

  return {
    currentTokenRef,
    currentTraceIdRef,
    tokenState: null as TokenState | null,
    refreshToken,
  };
}

export function createIntegrityTraceId(): string {
  return `itr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
