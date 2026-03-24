import raw from "./generated/hexagrams.json" with { type: "json" };
import { hexagramsFileSchema, type HexagramRecord } from "./schema.js";

const parsed: readonly HexagramRecord[] = hexagramsFileSchema.parse(raw);

export function getAllHexagramRecords(): readonly HexagramRecord[] {
  return parsed;
}

export function getHexagramRecordByBinaryTopFirst(key: string): HexagramRecord {
  const found = parsed.find((h) => h.binaryTopFirst === key);
  if (!found) {
    throw new Error(`Unknown hexagram binary pattern: ${key}`);
  }
  return found;
}

export function getHexagramRecordByNumber(num: number): HexagramRecord {
  const found = parsed.find((h) => h.number === num);
  if (!found) {
    throw new Error(`Unknown hexagram number: ${num}`);
  }
  return found;
}

export type { HexagramRecord } from "./schema.js";
