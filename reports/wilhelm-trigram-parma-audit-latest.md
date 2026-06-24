# Wilhelm trigram injector vs Parma print

- Generated: 2026-06-23T17:47:28.318Z
- Reference: `C:\Users\AlexDesk\Documents\iching-app\tools\reference\wilhelm-parma-trigram-headers.json`
- Injector: `scripts/iching_wilhelm_translation.mjs`

## Summary

| Check | Result |
|-------|--------|
| Injector matches Parma (128 lines) | **PASS with notes** |
| Our gaps (missing WOOD / typos) | **0** |
| Book-internal variants (FIRE/FLAME, Wade-Giles) | **63** hex match; variants documented below |
| Parma header anomaly (hex 23) | **1** — injector follows binary + intro |



## Hex 23 — Parma header vs structure

Parma line: `below LI THE CLINGING, FIRE`. Injector + Princeton TXT intro: **earth below, mountain above** (binary 100000 = Gen/Kun). Trust injector + intro over formal header line.


## Book variants (not our typos — do not normalize in book-primary dataset)

- **FIRE vs FLAME** for Li (離): Wilhelm alternates by hex (e.g. 13–14 FLAME, 21+ often FIRE).
- **CHêN vs CHEN** (hex 32): Parma prints CHEN without circumflex.
- **KEN vs KêN** (hex 15 vs others): Parma prints KEN without circumflex.
- **Sun vs SUN** (hex 18): Parma prints mixed case `Sun`.

| Hex | Pos | Injector (= Parma) |
|-----|-----|--------------------|
| 34 | above | above CHêN THE AROUSING, THUNDER |
