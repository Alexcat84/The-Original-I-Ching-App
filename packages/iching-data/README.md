# @iching-oracle/iching-data

Three public-domain translations of the I Ching (Yijing), shipped as
schema-validated JSON bundles plus typed accessor functions. This package is
the canonical source of hexagram texts for the rest of the monorepo.

## Translators and gold sources

| Translator | ID | Ingest pipeline | Gold source (verify) |
| --- | --- | --- | --- |
| Wilhelm / Baynes | `wilhelm` | `npm run ingest:wilhelm` | [Uni Parma mirror](http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html) + Baynes tier-2 supplement (6 fields where Parma's HTML omits the passage entirely) |
| James Legge | `legge` | `npm run ingest:legge` | [sacred-texts.com](https://sacred-texts.com/ich/index.htm) (ic + icap2) |
| Zhou Yi (original Chinese) | `zhouyi` | `npm run ingest:zhouyi` | [ctext.org](https://ctext.org/book-of-changes) (API + 大象 HTML) |

**Last 1:1 fidelity audit:** 21 June 2026. Legge and Zhou Yi: 100% oracle-field match. Wilhelm: 100% with 6 documented tier-2 Baynes supplements (hex 56 judgment; hex 20 line 5; hex 21 lines 2 and 3; hex 26 line 3; hex 52 line 2). Report: `reports/hexagram-fidelity-2026-06-21T20-26-09-152Z.json`. See `docs/auditorias/DATA_INTEGRITY_AUDIT.md`.

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
**identical across all three bundles**; only `name`, `judgment`, `image`,
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
npm run verify:hexagram-fidelity                            # 1:1 gold verify (repo root)
```

`build:data` runs `scripts/build-hexagrams.mjs` which combines the three
ingested sources (`scripts/iching_wilhelm_translation.mjs`,
`scripts/iching_legge_translation.mjs`,
`scripts/iching_zhouyi_translation.mjs`) into validated bundles in
`src/generated/`. Those JSON files **are committed to the repo** for
reproducibility, so consumers don't need to re-ingest at install time.

## Re-ingesting from primary sources

Gold-aligned ingesters in `tools/`:

```bash
npm run ingest:wilhelm    # Parma mirror → scripts/iching_wilhelm_translation.mjs
npm run ingest:legge      # sacred-texts → scripts/iching_legge_translation.mjs
npm run ingest:zhouyi     # ctext.org → scripts/iching_zhouyi_translation.mjs
npm run ingest:translations   # all three
```

Legacy ingesters (`tools/ingest-legge.mjs` Baharna, `tools/ingest-zhouyi.mjs` freizl) are deprecated for production; use only for cross-check.

After ingestion, run `npm run build:data` and `npm run verify:hexagram-fidelity`.

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
