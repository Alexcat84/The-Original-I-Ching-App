/**
 * QA code: TS-WEB-007 legal-consent-pending-meta · v1.0.0
 * Area: apps/web/src/lib/legal-consent-pending-meta
 * Family: AUTH
 */

import { describe, expect, it } from "vitest";
import {
  createLegalConsentPayload,
  parsePendingEmailLegalConsentFromUserMetadata,
} from "@/lib/legal-consent";

describe("parsePendingEmailLegalConsentFromUserMetadata", () => {
  it("parses legacy JSON string metadata", () => {
    const payload = createLegalConsentPayload("email_signup");
    const raw = JSON.stringify(payload);
    expect(parsePendingEmailLegalConsentFromUserMetadata(raw)).toEqual(payload);
  });

  it("accepts object metadata from signUp data", () => {
    const payload = createLegalConsentPayload("email_signup");
    expect(parsePendingEmailLegalConsentFromUserMetadata({ ...payload })).toEqual(payload);
  });

  it("rejects google source", () => {
    const payload = createLegalConsentPayload("google_oauth");
    expect(parsePendingEmailLegalConsentFromUserMetadata(JSON.stringify(payload))).toBeNull();
  });
});
