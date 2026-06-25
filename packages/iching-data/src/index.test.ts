/**
 * QA code: TS-DATA-001 iching-data-index · v1.0.0
 * Area: packages/iching-data/src/index
 * Family: DATA
 */

import { describe, expect, it } from "vitest";
import {
  getAllHexagramRecords,
  getAvailableTranslators,
  getHexagramBundle,
  getHexagramRecordByBinaryTopFirst,
  getHexagramRecordByNumber,
  TRANSLATOR_IDS,
} from "./index.js";

describe("translator bundles", () => {
  it("ships every declared translator", () => {
    expect(getAvailableTranslators()).toEqual(TRANSLATOR_IDS);
  });

  for (const translator of TRANSLATOR_IDS) {
    describe(`${translator}`, () => {
      it("has 64 hexagrams with full structural metadata", () => {
        const records = getAllHexagramRecords({ translator });
        expect(records).toHaveLength(64);
        for (const r of records) {
          expect(r.binaryTopFirst).toMatch(/^[01]{6}$/);
          expect(r.chineseName.length).toBeGreaterThan(0);
          expect(r.pinyin.length).toBeGreaterThan(0);
          expect(r.upperTrigram.length).toBeGreaterThan(0);
          expect(r.lowerTrigram.length).toBeGreaterThan(0);
          expect(r.judgment.length).toBeGreaterThan(0);
          expect(r.image.length).toBeGreaterThan(0);
          expect(r.lines).toHaveLength(6);
          for (let pos = 1; pos <= 6; pos++) {
            const line = r.lines.find((l) => l.position === pos);
            expect(line).toBeDefined();
            expect(line?.text.length ?? 0).toBeGreaterThan(0);
            expect(line?.type === "yin" || line?.type === "yang").toBe(true);
          }
        }
      });

      it("includes editorial bundle metadata", () => {
        const bundle = getHexagramBundle(translator);
        expect(bundle.translator).toBe(translator);
        expect(bundle.edition.length).toBeGreaterThan(0);
        expect(bundle.sourceUrl).toMatch(/^https?:\/\//);
        expect(bundle.licenseNote.length).toBeGreaterThan(0);
        expect(bundle.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(bundle.hexagrams).toHaveLength(64);
      });

      it("preserves yong supernumerary lines for hex 1 and 2", () => {
        const qian = getHexagramRecordByNumber(1, { translator });
        const kun = getHexagramRecordByNumber(2, { translator });
        expect(qian.yongJiu?.length ?? 0).toBeGreaterThan(0);
        expect(kun.yongLiu?.length ?? 0).toBeGreaterThan(0);
      });
    });
  }

  it("agrees on chineseName / pinyin / trigrams across all translators", () => {
    const wilhelm = getAllHexagramRecords({ translator: "wilhelm" });
    for (const w of wilhelm) {
      const legge = getHexagramRecordByNumber(w.number, { translator: "legge" });
      const zhouyi = getHexagramRecordByNumber(w.number, { translator: "zhouyi" });
      expect(legge.chineseName).toBe(w.chineseName);
      expect(zhouyi.chineseName).toBe(w.chineseName);
      expect(legge.pinyin).toBe(w.pinyin);
      expect(zhouyi.pinyin).toBe(w.pinyin);
      expect(legge.upperTrigram).toBe(w.upperTrigram);
      expect(zhouyi.upperTrigram).toBe(w.upperTrigram);
      expect(legge.lowerTrigram).toBe(w.lowerTrigram);
      expect(zhouyi.lowerTrigram).toBe(w.lowerTrigram);
      expect(legge.binaryTopFirst).toBe(w.binaryTopFirst);
      expect(zhouyi.binaryTopFirst).toBe(w.binaryTopFirst);
    }
  });

  it("agrees on line type (yin/yang geometry) across all translators", () => {
    const wilhelm = getAllHexagramRecords({ translator: "wilhelm" });
    for (const w of wilhelm) {
      const legge = getHexagramRecordByNumber(w.number, { translator: "legge" });
      const zhouyi = getHexagramRecordByNumber(w.number, { translator: "zhouyi" });
      for (let pos = 1; pos <= 6; pos++) {
        const wType = w.lines.find((l) => l.position === pos)?.type;
        const lType = legge.lines.find((l) => l.position === pos)?.type;
        const zType = zhouyi.lines.find((l) => l.position === pos)?.type;
        expect(lType).toBe(wType);
        expect(zType).toBe(wType);
      }
    }
  });

  it("looks up by binaryTopFirst per translator", () => {
    const w = getHexagramRecordByBinaryTopFirst("000111", { translator: "wilhelm" });
    expect(w.number).toBe(11);
    const l = getHexagramRecordByBinaryTopFirst("000111", { translator: "legge" });
    expect(l.number).toBe(11);
    const z = getHexagramRecordByBinaryTopFirst("000111", { translator: "zhouyi" });
    expect(z.number).toBe(11);
  });

  it("defaults to wilhelm when no translator option given", () => {
    const r = getHexagramRecordByNumber(1);
    expect(r.name).toMatch(/Initiating|Creative/i);
  });
});
