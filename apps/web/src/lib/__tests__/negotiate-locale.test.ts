/**
 * QA code: TS-WEB-017 locale-negotiate · v1.0.0
 * Area: apps/web/src/lib/negotiate-locale
 * Family: WEB
 */

import { describe, expect, it } from "vitest";
import { negotiateLocale } from "@/lib/negotiate-locale";

describe("negotiateLocale — Accept-Language first-visit matcher", () => {
  it("pt-BR -> pt (region resolves to primary subtag)", () => {
    expect(negotiateLocale("pt-BR")).toBe("pt");
  });

  it("zh-TW -> zh", () => {
    expect(negotiateLocale("zh-TW")).toBe("zh");
  });

  it("en-US -> en", () => {
    expect(negotiateLocale("en-US")).toBe("en");
  });

  it("unsupported language -> en (default)", () => {
    expect(negotiateLocale("sv-SE")).toBe("en");
    expect(negotiateLocale("ru")).toBe("en");
  });

  it("no header / empty -> en (default)", () => {
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
  });

  it("honours q-values (highest quality wins over source order)", () => {
    expect(negotiateLocale("en;q=0.5,de;q=0.9")).toBe("de");
  });

  it("falls through unsupported tags to the first supported one", () => {
    expect(negotiateLocale("sv,nb;q=0.9,fr;q=0.8,en;q=0.7")).toBe("fr");
  });

  it("ignores the wildcard and picks the supported match", () => {
    expect(negotiateLocale("*,ja;q=0.6")).toBe("ja");
  });

  it("full real-world header lands on the top supported preference", () => {
    expect(negotiateLocale("pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("pt");
  });
});
