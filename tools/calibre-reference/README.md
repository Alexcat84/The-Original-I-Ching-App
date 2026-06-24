# EPUB reference extraction (Calibre optional)

Production oracle sync uses **native HTML parsers** (`scripts/lib/*-epub*.mjs`) — not Calibre.

This folder holds **optional** raw dumps for cross-check against the book or against structured JSON from `npm run extract:epub-full`.

## Primary path (recommended)

```bash
npm run extract:epub-full
```

Writes (gitignored under `tools/output/epub-full/`):

| File | Contents |
|------|----------|
| `wilhelm-full.json` | Oracle + Wilhelm commentary per hex (intro, judgment, image, lines) |
| `legge-full.json` | Oracle + Appendix II symbolism + Duke line commentary + footnotes |
| `manifest.json` | Run metadata |

Oracle text in `oracleSummary` matches the production EPUB-primary bundles.

## Optional: Calibre raw dump

Install [Calibre](https://calibre-ebook.com/) and ensure `ebook-convert` is on PATH (Windows: typically `C:\Program Files\Calibre2\ebook-convert.exe`).

EPUB paths come from `tools/source-pdfs/manifest.json` (`fileCrossCheckEpub`), same files as sync.

```powershell
.\tools\calibre-reference\extract-raw.ps1
```

Outputs plain text/HTML under `tools/output/calibre-reference/` for manual diff. Does **not** segment by hexagram; use for spot-checks only.

## EPUB sources (local, gitignored)

- Wilhelm: `The I Ching or Book of Changes (Bollingen Series) -- Wilhelm, Hellmut -- Bollingen Series, 2011.epub`
- Legge: `The Yi King or, Book of Changes -- James Legge.epub`

Place in `tools/source-pdfs/` per `npm run pdf-gold:preflight`.
