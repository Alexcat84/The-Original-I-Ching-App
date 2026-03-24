import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export const ADMIN_COOKIE_NAME = "iching_admin_session";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function expectedAdminToken(secret: string): string {
  return sha256(`iching-admin:${secret}`);
}

export function isValidAdminSession(token: string | undefined | null): boolean {
  const secret = process.env.ADMIN_PANEL_KEY;
  if (!secret || !token) return false;
  return token === expectedAdminToken(secret);
}

export function getAdminSessionTokenFromCookies(): string | undefined {
  return cookies().get(ADMIN_COOKIE_NAME)?.value;
}

