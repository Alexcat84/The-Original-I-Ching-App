import { describe, expect, it } from "vitest";
import { FREE_SESSION_LIMIT, FREE_TOKENS, getPackConfig, getSessionLimit } from "../lib/token-packs";

describe("getPackConfig", () => {
  it("returns correct config for each pack", () => {
    expect(getPackConfig("tokens_seeker_20")).toMatchObject({
      tokens: 20,
      price: 6.99,
      label: "Seeker Pack",
      sessionLimit: 3,
    });
    expect(getPackConfig("tokens_practitioner_40")).toMatchObject({
      tokens: 40,
      price: 11.99,
      label: "Practitioner Pack",
      sessionLimit: 5,
    });
    expect(getPackConfig("tokens_master_100")).toMatchObject({
      tokens: 100,
      price: 19.99,
      label: "Master Pack",
      sessionLimit: 8,
    });
  });

  it("returns null for unknown or removed products", () => {
    expect(getPackConfig("seeker_monthly")).toBeNull();
    expect(getPackConfig("practitioner_annual")).toBeNull();
    expect(getPackConfig("")).toBeNull();
    expect(getPackConfig("tokens_oracle_350")).toBeNull();
  });
});

describe("getSessionLimit", () => {
  it("returns free default for free/unknown", () => {
    expect(getSessionLimit("free")).toBe(FREE_SESSION_LIMIT);
    expect(getSessionLimit("unknown")).toBe(FREE_SESSION_LIMIT);
  });

  it("returns pack-specific limits", () => {
    expect(getSessionLimit("tokens_seeker_20")).toBe(3);
    expect(getSessionLimit("tokens_practitioner_40")).toBe(5);
    expect(getSessionLimit("tokens_master_100")).toBe(8);
  });
});

describe("constants", () => {
  it("FREE_TOKENS is 2", () => {
    expect(FREE_TOKENS).toBe(2);
  });

  it("FREE_SESSION_LIMIT is 1", () => {
    expect(FREE_SESSION_LIMIT).toBe(1);
  });
});
