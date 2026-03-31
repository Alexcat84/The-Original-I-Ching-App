import { cookies } from "next/headers";
import { createHash } from "node:crypto";

export const ADMIN_COOKIE_NAME = "iching_admin_session";

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function expectedAdminToken(secret: string): string {
  return sha256(`iching-admin:${secret}`);
}

function adminSessionSeed(): string | null {
  const fromHash = process.env.ADMIN_PANEL_KEY_HASH?.trim();
  if (fromHash) return fromHash;
  const fromPlain = process.env.ADMIN_PANEL_KEY?.trim();
  if (fromPlain) return fromPlain;
  return null;
}

export function isValidAdminSession(token: string | undefined | null): boolean {
  const seed = adminSessionSeed();
  if (!seed || !token) return false;
  return token === expectedAdminToken(seed);
}

export function getAdminSessionTokenFromCookies(): string | undefined {
  return cookies().get(ADMIN_COOKIE_NAME)?.value;
}

