/**
 * QA code: TS-WEB-001 detect-input-language · v1.1.0
 * Area: apps/web/src/lib/detect-input-language
 * Family: WEB
 */

import { describe, expect, it } from "vitest";
import { detectInputLanguage } from "../detect-input-language";

describe("detectInputLanguage", () => {
  it("keeps Spanish for a Spanish question when UI is ES (regression: le/está/francés)", () => {
    const q =
      "Sabes, le escribi a Cherry tratando de ser amable, y ofreciendole mi apoyo, ya que no pasó su examen de nivel de francés y está muy triste";
    expect(detectInputLanguage(q, "es")).toBe("es");
  });

  it("uses English when UI is ES but question is clearly English", () => {
    const q =
      "What should I do about my relationship with my brother? I feel stuck and need guidance about the path forward.";
    expect(detectInputLanguage(q, "es")).toBe("en");
  });

  it("falls back to UI locale when question is too short to detect", () => {
    expect(detectInputLanguage("ok", "es")).toBe("es");
    expect(detectInputLanguage("hi", "en")).toBe("en");
  });

  it("detects French when question is clearly French even if UI is ES", () => {
    const q =
      "Pourquoi est-ce que cette relation avec mon frère me préoccupe autant en ce moment?";
    expect(detectInputLanguage(q, "es")).toBe("fr");
  });

  it("detects CJK scripts regardless of UI locale", () => {
    expect(detectInputLanguage("我应该怎么办？", "en")).toBe("zh");
    expect(detectInputLanguage("どうすればいいですか", "es")).toBe("ja");
    expect(detectInputLanguage("어떻게 해야 하나요", "en")).toBe("ko");
  });
});
