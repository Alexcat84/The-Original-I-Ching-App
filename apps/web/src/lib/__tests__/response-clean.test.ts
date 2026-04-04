import { describe, expect, it } from "vitest";
import { normalizeInterpretationPunctuation } from "@/lib/response-clean";

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

  it("inserts space after colon before letter and capitalizes following lowercase", () => {
    expect(normalizeInterpretationPunctuation("tensión:el veredicto")).toBe("tensión: El veredicto");
    expect(normalizeInterpretationPunctuation("revela: la Reunión")).toBe("revela: La Reunión");
  });

  it("adds space before word after closing paren", () => {
    expect(normalizeInterpretationPunctuation("(45)Siguiente")).toBe("(45) Siguiente");
  });
});
