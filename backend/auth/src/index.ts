import bcrypt from "bcryptjs";
import { authenticator } from "@otplib/preset-default";
import QRCode from "qrcode";
import { resolveMx } from "node:dns/promises";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";
import { z } from "zod";

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "yopmail.com",
]);

export const registerStep1Schema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(8)
    .regex(/[0-9]/, "Need one digit")
    .regex(/[A-Z]/, "Need one uppercase letter"),
});

export type RegisterStep1 = z.infer<typeof registerStep1Schema>;

export async function validateEmailForRegistration(email: string): Promise<{
  ok: boolean;
  reason?: "disposable_domain" | "missing_mx_record";
}> {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) {
    return { ok: false, reason: "missing_mx_record" };
  }
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { ok: false, reason: "disposable_domain" };
  }
  try {
    const mx = await resolveMx(domain);
    if (!mx || mx.length === 0) {
      return { ok: false, reason: "missing_mx_record" };
    }
  } catch {
    return { ok: false, reason: "missing_mx_record" };
  }
  return { ok: true };
}

export interface TotpEnrollment {
  secret: string;
  otpauthUrl: string;
  qrDataUrl: string;
}

export async function createTotpEnrollment(email: string, issuer = "I Ching Oracle"): Promise<TotpEnrollment> {
  const secret = authenticator.generateSecret();
  const otpauthUrl = authenticator.keyuri(email, issuer, secret);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, {
    margin: 1,
    width: 280,
  });
  return { secret, otpauthUrl, qrDataUrl };
}

export function verifyTotpToken(secret: string, token: string): boolean {
  authenticator.options = { window: 1 };
  return authenticator.verify({ secret, token });
}

export function generateRecoveryCodes(count = 8): string[] {
  return Array.from({ length: count }, () => randomBytes(4).toString("hex").toUpperCase());
}

export async function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}

export async function consumeRecoveryCode(code: string, hashes: string[]): Promise<{
  consumed: boolean;
  remainingHashes: string[];
}> {
  for (let i = 0; i < hashes.length; i += 1) {
    const ok = await bcrypt.compare(code, hashes[i]!);
    if (ok) {
      const remaining = hashes.filter((_, idx) => idx !== i);
      return { consumed: true, remainingHashes: remaining };
    }
  }
  return { consumed: false, remainingHashes: hashes };
}

export interface TwoFactorAttempt {
  timestampMs: number;
  success: boolean;
}

export function shouldLockTwoFactor(attempts: TwoFactorAttempt[], nowMs = Date.now()): boolean {
  const withinWindow = attempts.filter((a) => nowMs - a.timestampMs <= 15 * 60 * 1000);
  const failed = withinWindow.filter((a) => !a.success).length;
  return failed >= 5;
}

export function encryptTotpSecret(secret: string, encryptionKey: string): string {
  const iv = randomBytes(12);
  const key = createHash("sha256").update(encryptionKey).digest();
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptTotpSecret(encryptedValue: string, encryptionKey: string): string {
  const [ivB64, tagB64, payloadB64] = encryptedValue.split(".");
  if (!ivB64 || !tagB64 || !payloadB64) {
    throw new Error("Invalid encrypted secret format");
  }
  const key = createHash("sha256").update(encryptionKey).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payloadB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
