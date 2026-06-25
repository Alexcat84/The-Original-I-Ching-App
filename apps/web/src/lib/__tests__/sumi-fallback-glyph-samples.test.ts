import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  MUTATION_QA_FIXTURES,
  previewCastFromLineValues,
  type LineValue,
} from "@iching-oracle/iching-engine";
import { describe, expect, it } from "vitest";
import { embedCjkFontInOverlaySvg } from "@/lib/embed-svg-overlay-font";
import { renderSvgToPng } from "@/lib/svg-to-png";
import {
  buildSumiHexagramSvgDataUrl,
  type SumiLineInput,
} from "@/lib/sumi-hexagram-art";

const GENERATE = process.env.GENERATE_SUMI_GLYPH_SAMPLES === "1";
const ROOT = join(process.cwd(), "..", "..");
const OUT_DIR = join(ROOT, "reports", "sumi-fallback-glyphs");

/** Pure doubled hexagrams — one per canonical trigram (upper = lower). */
const TRIGRAM_PURE_HEX: ReadonlyArray<{
  readonly id: string;
  readonly number: number;
  readonly chinese: string;
}> = [
  { id: "heaven", number: 1, chinese: "乾" },
  { id: "earth", number: 2, chinese: "坤" },
  { id: "water", number: 29, chinese: "坎" },
  { id: "fire", number: 30, chinese: "離" },
  { id: "thunder", number: 51, chinese: "震" },
  { id: "mountain", number: 52, chinese: "艮" },
  { id: "wind", number: 57, chinese: "巽" },
  { id: "lake", number: 58, chinese: "兌" },
];

type HexRow = {
  number: number;
  name: string;
  chineseName: string;
  binaryTopFirst: string;
};

function decodeSvgDataUrl(dataUrl: string): string {
  const prefix = "data:image/svg+xml;charset=utf-8,";
  if (!dataUrl.startsWith(prefix)) {
    throw new Error("Expected sumi SVG data URL");
  }
  return decodeURIComponent(dataUrl.slice(prefix.length));
}

function linesFromBinaryTopFirst(binaryTopFirst: string): SumiLineInput[] {
  const bits = binaryTopFirst.padStart(6, "0").slice(-6);
  return [...bits].map((bit, index) => ({
    position: (6 - index) as SumiLineInput["position"],
    value: bit === "1" ? 7 : 8,
    isChanging: false,
  }));
}

function asciiSlug(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Parity with image-provider `toTransformedHexagramLines` for sumi fallback display. */
function toSumiDisplayLines(lineValues: readonly LineValue[]): SumiLineInput[] {
  const hasChanges = lineValues.some((value) => value === 6 || value === 9);
  const raw: SumiLineInput[] = lineValues.map((value, index) => ({
    position: (index + 1) as SumiLineInput["position"],
    value,
    isChanging: value === 6 || value === 9,
  }));
  if (!hasChanges) {
    return raw;
  }
  return raw.map((line) => {
    if (line.value === 6) {
      return { ...line, value: 7, isChanging: false };
    }
    if (line.value === 9) {
      return { ...line, value: 8, isChanging: false };
    }
    return { ...line, isChanging: false };
  });
}

function mutationLineValuesForHex(binaryTopFirst: string): LineValue[] {
  const bits = binaryTopFirst.padStart(6, "0").slice(-6);
  const values = [...bits].reverse().map((bit) => (bit === "1" ? 7 : 8)) as LineValue[];
  for (let pos = 0; pos < 6; pos++) {
    const trial = [...values] as LineValue[];
    trial[pos] = trial[pos] === 7 ? 9 : 6;
    const preview = previewCastFromLineValues(trial);
    if (
      preview.transformedHexagram &&
      preview.transformedHexagram.number !== preview.primaryHexagram.number
    ) {
      return trial;
    }
  }
  const fallback = [...values] as LineValue[];
  fallback[0] = fallback[0] === 7 ? 9 : 6;
  return fallback;
}

function hexRowByNumber(
  translator: "wilhelm" | "legge",
  wilByNum: Map<number, HexRow>,
  legByNum: Map<number, HexRow>,
  number: number,
): HexRow {
  const row = translator === "wilhelm" ? wilByNum.get(number) : legByNum.get(number);
  if (!row) {
    throw new Error(`Missing ${translator} hex #${number}`);
  }
  return row;
}

async function loadHexRows(translator: "wilhelm" | "legge"): Promise<HexRow[]> {
  const path = join(
    ROOT,
    "packages/iching-data/src/generated",
    `hexagrams.${translator}.json`,
  );
  const raw = JSON.parse(await readFile(path, "utf8")) as { hexagrams: HexRow[] };
  return raw.hexagrams;
}

async function rasterizeSumiFallback(params: {
  lines: SumiLineInput[];
  primaryNumber: number;
  primaryName: string;
  primaryChinese: string;
  transformed?: { number: number; name: string; chineseName: string } | null;
  artSeed: string;
}): Promise<Buffer> {
  const dataUrl = buildSumiHexagramSvgDataUrl({
    lines: params.lines,
    primaryNumber: params.primaryNumber,
    primaryName: params.primaryName,
    primaryChinese: params.primaryChinese,
    transformedNumber: params.transformed?.number ?? null,
    transformedName: params.transformed?.name ?? null,
    transformedChinese: params.transformed?.chineseName ?? null,
    artSeed: params.artSeed,
    category: "glyph-sample",
    changingLines: [],
  });
  const svg = decodeSvgDataUrl(dataUrl);
  const embedded = await embedCjkFontInOverlaySvg(svg);
  expect(embedded).toContain("NotoSerifTCOverlay");
  expect(embedded).toContain("NotoSerifLatinOverlay");
  return renderSvgToPng(embedded, 1344);
}

async function rasterizeCastPreview(params: {
  lineValues: readonly LineValue[];
  translator: "wilhelm" | "legge";
  wilByNum: Map<number, HexRow>;
  legByNum: Map<number, HexRow>;
  artSeed: string;
}): Promise<{
  primary: HexRow;
  transformed: HexRow | null;
  png: Buffer;
}> {
  const preview = previewCastFromLineValues(params.lineValues);
  const primary = hexRowByNumber(
    params.translator,
    params.wilByNum,
    params.legByNum,
    preview.primaryHexagram.number,
  );
  const transformed = preview.transformedHexagram
    ? hexRowByNumber(
        params.translator,
        params.wilByNum,
        params.legByNum,
        preview.transformedHexagram.number,
      )
    : null;
  const png = await rasterizeSumiFallback({
    lines: toSumiDisplayLines(params.lineValues),
    primaryNumber: primary.number,
    primaryName: primary.name,
    primaryChinese: primary.chineseName,
    transformed: transformed
      ? {
          number: transformed.number,
          name: transformed.name,
          chineseName: transformed.chineseName,
        }
      : null,
    artSeed: params.artSeed,
  });
  return { primary, transformed, png };
}

describe.skipIf(!GENERATE)("sumi fallback glyph samples (GENERATE_SUMI_GLYPH_SAMPLES=1)", () => {
  it(
    "renders 64×2 static titles + trigrams + 64×2 by-hex mutations + QA fixtures",
    async () => {
      const wilhelm = await loadHexRows("wilhelm");
      const legge = await loadHexRows("legge");
      const wilByNum = new Map(wilhelm.map((h) => [h.number, h]));
      const legByNum = new Map(legge.map((h) => [h.number, h]));

      await mkdir(join(OUT_DIR, "wilhelm"), { recursive: true });
      await mkdir(join(OUT_DIR, "legge"), { recursive: true });
      await mkdir(join(OUT_DIR, "trigrams"), { recursive: true });
      await mkdir(join(OUT_DIR, "mutations", "by-hex", "wilhelm"), { recursive: true });
      await mkdir(join(OUT_DIR, "mutations", "by-hex", "legge"), { recursive: true });
      await mkdir(join(OUT_DIR, "mutations", "fixtures", "wilhelm"), { recursive: true });
      await mkdir(join(OUT_DIR, "mutations", "fixtures", "legge"), { recursive: true });

      const manifest: Array<Record<string, unknown>> = [];

      for (const hex of wilhelm) {
        const file = `${String(hex.number).padStart(2, "0")}-${asciiSlug(hex.name)}.png`;
        const png = await rasterizeSumiFallback({
          lines: linesFromBinaryTopFirst(hex.binaryTopFirst),
          primaryNumber: hex.number,
          primaryName: hex.name,
          primaryChinese: hex.chineseName,
          artSeed: `wilhelm-${hex.number}`,
        });
        await writeFile(join(OUT_DIR, "wilhelm", file), png);
        manifest.push({ group: "wilhelm", number: hex.number, name: hex.name, file: `wilhelm/${file}` });
      }

      for (const hex of legge) {
        const file = `${String(hex.number).padStart(2, "0")}-${asciiSlug(hex.name)}.png`;
        const png = await rasterizeSumiFallback({
          lines: linesFromBinaryTopFirst(hex.binaryTopFirst),
          primaryNumber: hex.number,
          primaryName: hex.name,
          primaryChinese: hex.chineseName,
          artSeed: `legge-${hex.number}`,
        });
        await writeFile(join(OUT_DIR, "legge", file), png);
        manifest.push({ group: "legge", number: hex.number, name: hex.name, file: `legge/${file}` });
      }

      for (const tri of TRIGRAM_PURE_HEX) {
        for (const translator of ["wilhelm", "legge"] as const) {
          const hex = translator === "wilhelm" ? wilByNum.get(tri.number)! : legByNum.get(tri.number)!;
          const file = `${tri.id}-${translator}.png`;
          const png = await rasterizeSumiFallback({
            lines: linesFromBinaryTopFirst(hex.binaryTopFirst),
            primaryNumber: hex.number,
            primaryName: hex.name,
            primaryChinese: hex.chineseName,
            artSeed: `trigram-${tri.id}-${translator}`,
          });
          await writeFile(join(OUT_DIR, "trigrams", file), png);
          manifest.push({
            group: "trigrams",
            trigramId: tri.id,
            translator,
            number: hex.number,
            name: hex.name,
            file: `trigrams/${file}`,
          });
        }
      }

      let mutationsByHexWilhelm = 0;
      let mutationsByHexLegge = 0;
      let mutationsFixturesWilhelm = 0;
      let mutationsFixturesLegge = 0;

      for (const hex of wilhelm) {
        const lineValues = mutationLineValuesForHex(hex.binaryTopFirst);
        const preview = previewCastFromLineValues(lineValues);
        const transformedNum = preview.transformedHexagram!.number;
        const transformedWil = wilByNum.get(transformedNum)!;
        const file = `${String(hex.number).padStart(2, "0")}-${asciiSlug(hex.name)}-to-${String(transformedNum).padStart(2, "0")}-${asciiSlug(transformedWil.name)}.png`;
        const { primary, transformed, png } = await rasterizeCastPreview({
          lineValues,
          translator: "wilhelm",
          wilByNum,
          legByNum,
          artSeed: `mutation-wilhelm-${hex.number}`,
        });
        await writeFile(join(OUT_DIR, "mutations", "by-hex", "wilhelm", file), png);
        mutationsByHexWilhelm += 1;
        manifest.push({
          group: "mutations-by-hex",
          translator: "wilhelm",
          primaryNumber: primary.number,
          primaryName: primary.name,
          transformedNumber: transformed!.number,
          transformedName: transformed!.name,
          file: `mutations/by-hex/wilhelm/${file}`,
        });
      }

      for (const hex of legge) {
        const lineValues = mutationLineValuesForHex(hex.binaryTopFirst);
        const preview = previewCastFromLineValues(lineValues);
        const transformedNum = preview.transformedHexagram!.number;
        const transformedLeg = legByNum.get(transformedNum)!;
        const file = `${String(hex.number).padStart(2, "0")}-${asciiSlug(hex.name)}-to-${String(transformedNum).padStart(2, "0")}-${asciiSlug(transformedLeg.name)}.png`;
        const { primary, transformed, png } = await rasterizeCastPreview({
          lineValues,
          translator: "legge",
          wilByNum,
          legByNum,
          artSeed: `mutation-legge-${hex.number}`,
        });
        await writeFile(join(OUT_DIR, "mutations", "by-hex", "legge", file), png);
        mutationsByHexLegge += 1;
        manifest.push({
          group: "mutations-by-hex",
          translator: "legge",
          primaryNumber: primary.number,
          primaryName: primary.name,
          transformedNumber: transformed!.number,
          transformedName: transformed!.name,
          file: `mutations/by-hex/legge/${file}`,
        });
      }

      for (const fixture of MUTATION_QA_FIXTURES) {
        for (const translator of ["wilhelm", "legge"] as const) {
          const file = `${fixture.id}.png`;
          const { primary, transformed, png } = await rasterizeCastPreview({
            lineValues: fixture.lineValues,
            translator,
            wilByNum,
            legByNum,
            artSeed: `mutation-fixture-${fixture.id}-${translator}`,
          });
          await writeFile(join(OUT_DIR, "mutations", "fixtures", translator, file), png);
          if (translator === "wilhelm") {
            mutationsFixturesWilhelm += 1;
          } else {
            mutationsFixturesLegge += 1;
          }
          manifest.push({
            group: "mutations-fixtures",
            fixtureId: fixture.id,
            expectedRule: fixture.expectedRule,
            translator,
            primaryNumber: primary.number,
            primaryName: primary.name,
            transformedNumber: transformed?.number ?? null,
            transformedName: transformed?.name ?? null,
            file: `mutations/fixtures/${translator}/${file}`,
          });
        }
      }

      const summary = {
        generatedAt: new Date().toISOString(),
        outputDir: OUT_DIR,
        counts: {
          wilhelm: wilhelm.length,
          legge: legge.length,
          trigrams: TRIGRAM_PURE_HEX.length * 2,
          mutationsByHexWilhelm,
          mutationsByHexLegge,
          mutationsFixturesWilhelm,
          mutationsFixturesLegge,
          mutationsTotal:
            mutationsByHexWilhelm +
            mutationsByHexLegge +
            mutationsFixturesWilhelm +
            mutationsFixturesLegge,
          total: manifest.length,
        },
        note: "Sumi-e fallback (svg-art) rasterized locally — no Together tokens consumed.",
      };

      await writeFile(join(OUT_DIR, "manifest.json"), JSON.stringify({ summary, samples: manifest }, null, 2));
      await writeFile(
        join(OUT_DIR, "manifest.md"),
        `# Sumi fallback glyph samples\n\n- Generated: ${summary.generatedAt}\n- Total PNGs: ${summary.counts.total}\n- Wilhelm static: ${summary.counts.wilhelm}\n- Legge static: ${summary.counts.legge}\n- Trigrams (8×2): ${summary.counts.trigrams}\n- Mutations by hex (Wilhelm): ${summary.counts.mutationsByHexWilhelm}\n- Mutations by hex (Legge): ${summary.counts.mutationsByHexLegge}\n- Mutation QA fixtures (Wilhelm): ${summary.counts.mutationsFixturesWilhelm}\n- Mutation QA fixtures (Legge): ${summary.counts.mutationsFixturesLegge}\n- Mutations total: ${summary.counts.mutationsTotal}\n`,
      );

      expect(manifest.length).toBe(64 + 64 + 16 + 64 + 64 + MUTATION_QA_FIXTURES.length * 2);
    },
    900_000,
  );
});

describe("sumi fallback glyph smoke", () => {
  it("rasterizes Legge hex 32 with embedded Latin Extended face", async () => {
    const legge = await loadHexRows("legge");
    const hex = legge.find((h) => h.number === 32);
    expect(hex?.name).toBe("Hăng");

    const dataUrl = buildSumiHexagramSvgDataUrl({
      lines: linesFromBinaryTopFirst(hex!.binaryTopFirst),
      primaryNumber: 32,
      primaryName: hex!.name,
      primaryChinese: hex!.chineseName,
      artSeed: "smoke-legge-32",
      category: "glyph-sample",
      changingLines: [],
    });
    const embedded = await embedCjkFontInOverlaySvg(decodeSvgDataUrl(dataUrl));
    expect(embedded).toContain("NotoSerifLatinOverlay");
    expect(embedded).toContain("Hăng");

    const png = await renderSvgToPng(embedded, 1344);
    expect(png.byteLength).toBeGreaterThan(10_000);
  });

  it("rasterizes Legge mutation Hăng → Žin with arrow title and dual fonts", async () => {
    const legge = await loadHexRows("legge");
    const wilByNum = new Map((await loadHexRows("wilhelm")).map((h) => [h.number, h]));
    const legByNum = new Map(legge.map((h) => [h.number, h]));
    const lineValues = mutationLineValuesForHex(
      legge.find((h) => h.number === 32)!.binaryTopFirst,
    );
    const { primary, transformed, png } = await rasterizeCastPreview({
      lineValues,
      translator: "legge",
      wilByNum,
      legByNum,
      artSeed: "smoke-legge-32-mutation",
    });
    expect(primary.name).toBe("Hăng");
    expect(primary.number).toBe(32);
    expect(transformed).not.toBeNull();
    expect(transformed!.number).not.toBe(32);
    expect(transformed.name.length).toBeGreaterThan(0);

    const dataUrl = buildSumiHexagramSvgDataUrl({
      lines: toSumiDisplayLines(lineValues),
      primaryNumber: primary.number,
      primaryName: primary.name,
      primaryChinese: primary.chineseName,
      transformedNumber: transformed.number,
      transformedName: transformed.name,
      transformedChinese: transformed.chineseName,
      artSeed: "smoke-legge-32-mutation-svg",
      category: "glyph-sample",
      changingLines: [],
    });
    const embedded = await embedCjkFontInOverlaySvg(decodeSvgDataUrl(dataUrl));
    expect(embedded).toContain("NotoSerifLatinOverlay");
    expect(embedded).toContain("Hăng");
    expect(embedded).toContain(transformed!.name);
    expect(embedded).toMatch(
      /<tspan font-family="'NotoSymbols2Overlay'" font-size="inherit">\u2192<\/tspan>/,
    );
    expect(embedded).not.toMatch(/class="overlay-title-en"[^>]*>[^<]*-&gt;/);
    expect(png.byteLength).toBeGreaterThan(10_000);
  });
});
