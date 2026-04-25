import { describe, expect, it } from "vitest";
import { normalizeInterpretationPunctuation, stripInterpretationFluff } from "@/lib/response-clean";

describe("normalizeInterpretationPunctuation", () => {
  it("inserts space after comma before a letter", () => {
    expect(normalizeInterpretationPunctuation("sostiene,según la")).toBe("sostiene, según la");
    expect(normalizeInterpretationPunctuation("dirección,Seguir aquí")).toBe("dirección, Seguir aquí");
  });

  it("does not break decimal comma before digit", () => {
    expect(normalizeInterpretationPunctuation("valor 1,5 mm")).toBe("valor 1,5 mm");
  });

  it("fixes comma followed by period", () => {
    expect(normalizeInterpretationPunctuation("externas,. Si ella")).toBe("externas. Si ella");
  });

  it("inserts space after colon before letter without forcing uppercase", () => {
    expect(normalizeInterpretationPunctuation("tensión:el veredicto")).toBe("tensión: el veredicto");
    expect(normalizeInterpretationPunctuation("revela: la Reunión")).toBe("revela: la Reunión");
  });

  it("adds space before word after closing paren", () => {
    expect(normalizeInterpretationPunctuation("(45)Siguiente")).toBe("(45) Siguiente");
  });
});

describe("stripInterpretationFluff", () => {
  it("removes leading CATEGORY line with newline", () => {
    const raw = "CATEGORY: love_relationship\n\n## ENCUADRE\n\nBody";
    expect(stripInterpretationFluff(raw)).toContain("## ENCUADRE");
    expect(stripInterpretationFluff(raw)).not.toMatch(/CATEGORY/i);
  });

  it("removes leading CATEGORÍA line when slug is on its own line", () => {
    const raw = "CATEGORÍA: general\r\n## Título";
    const out = stripInterpretationFluff(raw);
    expect(out).not.toMatch(/CATEGOR/i);
    expect(out).toContain("## Título");
  });
});
