import { describe, expect, it } from "vitest";
import { isDuplicateInsertErrorMessage } from "../db-idempotency";

describe("isDuplicateInsertErrorMessage", () => {
  it("detects common duplicate/unique errors", () => {
    expect(isDuplicateInsertErrorMessage("duplicate key value violates unique constraint")).toBe(true);
    expect(isDuplicateInsertErrorMessage("Unique constraint failed")).toBe(true);
  });

  it("returns false for unrelated or empty messages", () => {
    expect(isDuplicateInsertErrorMessage("network timeout")).toBe(false);
    expect(isDuplicateInsertErrorMessage("")).toBe(false);
    expect(isDuplicateInsertErrorMessage(null)).toBe(false);
  });
});
