/**
 * QA code: TS-WEB-006 post-auth-legal · v1.0.0
 * Area: apps/web/src/lib/post-auth-legal
 * Family: AUTH
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { CURRENT_PRIVACY_VERSION, CURRENT_TERMS_VERSION } from "@/lib/legal-consent";
import { fetchLegalAcceptanceCurrent, resolvePostAuthClientRoute } from "@/lib/post-auth-legal";

/** Mirrors contract in `apps/web/src/app/api/auth/legal-consent/route.ts` */
const legalConsentSchema = z.object({
  accepted: z.literal(true),
  termsVersion: z.literal(CURRENT_TERMS_VERSION),
  privacyVersion: z.literal(CURRENT_PRIVACY_VERSION),
  acceptedAt: z.string().datetime(),
  source: z.enum(["google_oauth", "post_login", "email_signup"]),
});

describe("post-auth-legal client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("fetchLegalAcceptanceCurrent", () => {
    it("returns null on 401", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 401,
          ok: false,
        }),
      );
      await expect(fetchLegalAcceptanceCurrent("token")).resolves.toBeNull();
    });

    it("returns true when API reports legal_acceptance_current", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 200,
          ok: true,
          json: async () => ({ legal_acceptance_current: true }),
        }),
      );
      await expect(fetchLegalAcceptanceCurrent("token")).resolves.toBe(true);
    });

    it("returns false when API reports not current", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 200,
          ok: true,
          json: async () => ({ legal_acceptance_current: false }),
        }),
      );
      await expect(fetchLegalAcceptanceCurrent("token")).resolves.toBe(false);
    });

    it("returns false on 500", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 500,
          ok: false,
        }),
      );
      await expect(fetchLegalAcceptanceCurrent("token")).resolves.toBe(false);
    });
  });

  describe("resolvePostAuthClientRoute", () => {
    it("routes to login when token rejected", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 401,
          ok: false,
        }),
      );
      await expect(resolvePostAuthClientRoute("t")).resolves.toBe("/login");
    });

    it("routes home when legal current", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 200,
          ok: true,
          json: async () => ({ legal_acceptance_current: true }),
        }),
      );
      await expect(resolvePostAuthClientRoute("t")).resolves.toBe("/chat");
    });

    it("routes to complete-legal when not current", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          status: 200,
          ok: true,
          json: async () => ({ legal_acceptance_current: false }),
        }),
      );
      await expect(resolvePostAuthClientRoute("t")).resolves.toBe("/auth/complete-legal");
    });
  });
});

describe("legal consent POST body contract", () => {
  it("accepts post_login payload", () => {
    const parsed = legalConsentSchema.safeParse({
      accepted: true,
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
      acceptedAt: new Date().toISOString(),
      source: "post_login",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects outdated terms version", () => {
    const parsed = legalConsentSchema.safeParse({
      accepted: true,
      termsVersion: "terms-2025-04-01",
      privacyVersion: CURRENT_PRIVACY_VERSION,
      acceptedAt: new Date().toISOString(),
      source: "post_login",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects missing accepted flag", () => {
    const parsed = legalConsentSchema.safeParse({
      accepted: false,
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
      acceptedAt: new Date().toISOString(),
      source: "post_login",
    });
    expect(parsed.success).toBe(false);
  });
});
