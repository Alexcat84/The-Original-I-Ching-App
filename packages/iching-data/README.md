# @iching-oracle/iching-data

Three public-domain translations of the I Ching (Yijing), shipped as
schema-validated JSON bundles plus typed accessor functions. This package is
the canonical source of hexagram texts for the rest of the monorepo.

## What ships in PR1 (`feature/iching-library`)

| Translator | ID | Source | Edition |
| --- | --- | --- | --- |
| Wilhelm / Baynes | `wilhelm` | [adamblvck/iching-wilhelm-dataset](https://github.com/adamblvck/iching-wilhelm-dataset) | _The I Ching or Book of Changes_ — Richard Wilhelm / Cary F. Baynes (1950, public domain since 2020). |
| James Legge | `legge` | [Baharna.com / Sacred Texts](https://www.baharna.com/iching/index.htm) | _The Sacred Books of China — The Yî King_ (1882/1899, public domain). |
| Zhou Yi (original Chinese) | `zhouyi` | [freizl/yijing](https://github.com/freizl/yijing) (`zh-TW/64gua.json`) | Classical Chinese, traditional script. Public domain. |

Each bundle covers all 64 King Wen hexagrams, with the same schema:

```ts
{
  number, name, chineseName, pinyin,
  upperTrigram, lowerTrigram,
  judgment, image,
  lines: [{ position: 1..6, text, type: "yin" | "yang" }],
  binaryTopFirst, // e.g. "111111" for hex 1
  yongJiu?, yongLiu?, // present only on hex 1 / hex 2
}
```

For Wilhelm and Legge `image` is the canonical "Image / Symbolism" passage. For
**Zhou Yi we use the Da Xiang (大象) commentary** in `image` so the field has
visual parity with the other two translations across the library UI.

Structural metadata (number, binary, Chinese name, pinyin, trigrams) is
**identical across all three bundles** — only `name`, `judgment`, `image`,
`lines`, and `yong*` differ. This invariant is enforced by tests in
`src/index.test.ts`.

## API

```ts
import {
  getAllHexagramRecords,
  getHexagramRecordByNumber,
  getHexagramRecordByBinaryTopFirst,
  getHexagramBundle,
  getAvailableTranslators,
  TRANSLATOR_IDS,
  type TranslatorId,
} from "@iching-oracle/iching-data";

// Wilhelm is the default and the only translator the AI oracle uses (PR1).
const all = getAllHexagramRecords();

// Pass `{ translator }` to read other bundles.
const leggeHex1 = getHexagramRecordByNumber(1, { translator: "legge" });
const zhouyiHex1 = getHexagramRecordByNumber(1, { translator: "zhouyi" });

// Bundle metadata (edition, license, source URL, generatedAt).
const bundle = getHexagramBundle("legge");
```

## Build

```bash
npm run build:data --workspace @iching-oracle/iching-data   # regenerates all 3 bundles
npm run build --workspace @iching-oracle/iching-data        # build:data + tsc + copy
npm run test --workspace @iching-oracle/iching-data         # vitest
```

`build:data` runs `scripts/build-hexagrams.mjs` which combines the three
ingested sources (`scripts/iching_wilhelm_translation.mjs`,
`scripts/iching_legge_translation.mjs`,
`scripts/iching_zhouyi_translation.mjs`) into validated bundles in
`src/generated/`. Those JSON files **are committed to the repo** for
reproducibility, so consumers don't need to re-ingest at install time.

## Re-ingesting from primary sources

The two ingester scripts live in `tools/` and write raw caches to
`tools/output/<translator>-raw/` (gitignored):

```bash
node tools/ingest-legge.mjs    # Baharna.com → scripts/iching_legge_translation.mjs
node tools/ingest-zhouyi.mjs   # freizl/yijing → scripts/iching_zhouyi_translation.mjs
```

After ingestion, run `npm run build:data` to rebuild the JSON bundles.

## What this package does NOT do

- It does **not** drive the AI oracle. PR1 keeps Claude prompts byte-identical
  to `staging`; only Wilhelm/Baynes is wired into `selectTextsForClaude`.
- The `iching-engine` stub `assertSupportedInterpretationMode("wilhelm")`
  enforces that contract: any other mode throws until PR2 ships.

## Licence note

All three editions are in the public domain (United States and most
jurisdictions). The Wilhelm/Baynes English translation entered the public
domain in 2020 in the USA. Legge's translation has been public domain since
the early 20th century. The Zhou Yi base text predates copyright entirely.
