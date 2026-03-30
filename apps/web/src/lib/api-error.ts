import { NextResponse } from "next/server";

export type ApiErrorAction =
  | "retry"
  | "login"
  | "wait_and_retry"
  | "upgrade_plan"
  | "setup_2fa"
  | "fix_input"
  | "check_config"
  | "apply_db_migration";

type ApiErrorPayload = {
  error: string;
  code: string;
  action: ApiErrorAction;
  message?: string;
  details?: unknown;
};

export function apiError(status: number, payload: ApiErrorPayload): NextResponse {
  return NextResponse.json(payload, { status });
}
