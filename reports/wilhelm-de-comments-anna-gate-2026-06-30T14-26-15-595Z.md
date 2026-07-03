# Wilhelm DE comments Anna gate (G-anna)

- Manifest: `C:\Users\AlexDesk\Documents\iching-app\tools\datasets\wilhelm-de\comments\anna\manifest.json`

## Pass 02
- Coverage: 1526/1920
- G0: FAIL
- hex 19: empty sequence (expected from hex 3+)

## Pass 04
- Coverage: 1488/1920
- G0: FAIL
- hex 5: empty sequence (expected from hex 3+)
- hex 6: empty commentary_decision
- hex 6: empty commentary_image
- hex 6: empty sequence (expected from hex 3+)
- hex 6: only 0/6 line commentaries parsed
- hex 8: empty sequence (expected from hex 3+)
- hex 15: empty sequence (expected from hex 3+)
- hex 16: empty sequence (expected from hex 3+)
- hex 22: empty sequence (expected from hex 3+)
- hex 31: empty sequence (expected from hex 3+)
- hex 40: empty sequence (expected from hex 3+)
- hex 44: empty sequence (expected from hex 3+)
- hex 45: empty sequence (expected from hex 3+)
- hex 47: empty sequence (expected from hex 3+)
- hex 52: empty sequence (expected from hex 3+)

## Dual-pass diff (02 vs 04)
- Identical: 955/1530
- Differing: 575

Sample diffs (length only):
- hex 1 ruler_note: pass02=649 chars, pass04=664 chars
- hex 1 commentary_decision: pass02=5338 chars, pass04=5345 chars
- hex 1 image_oraculo: pass02=1764 chars, pass04=1764 chars
- hex 1 commentary_image: pass02=3304 chars, pass04=3302 chars
- hex 1 L1_b_comentario: pass02=278 chars, pass04=276 chars
- hex 1 L2_b_comentario: pass02=488 chars, pass04=490 chars
- hex 1 L5_b_comentario: pass02=201 chars, pass04=199 chars
- hex 1 wen_yen: pass02=13114 chars, pass04=13120 chars
- hex 1 wen_yen_note: pass02=4052 chars, pass04=4049 chars
- hex 2 ruler_note: pass02=873 chars, pass04=791 chars
- hex 2 commentary_decision: pass02=4368 chars, pass04=4364 chars
- hex 2 image_oraculo: pass02=1595 chars, pass04=1595 chars
- hex 2 commentary_image: pass02=2406 chars, pass04=2404 chars
- hex 2 L3_b_comentario: pass02=676 chars, pass04=675 chars
- hex 2 L4_b_comentario: pass02=332 chars, pass04=334 chars
- hex 2 L5_b_comentario: pass02=314 chars, pass04=312 chars
- hex 2 L6_b_comentario: pass02=420 chars, pass04=419 chars
- hex 2 wen_yen: pass02=7759 chars, pass04=7750 chars
- hex 2 wen_yen_note: pass02=2544 chars, pass04=2544 chars
- hex 3 ruler_note: pass02=259 chars, pass04=281 chars
- hex 3 sequence: pass02=585 chars, pass04=576 chars
- hex 3 commentary_decision: pass02=2111 chars, pass04=2116 chars
- hex 3 image_oraculo: pass02=555 chars, pass04=539 chars
- hex 3 commentary_image: pass02=555 chars, pass04=539 chars
- hex 3 L1_b_comentario: pass02=831 chars, pass04=831 chars
- hex 3 L2_b_comentario: pass02=821 chars, pass04=821 chars
- hex 3 L3_b_comentario: pass02=951 chars, pass04=947 chars
- hex 3 L4_b_comentario: pass02=541 chars, pass04=541 chars
- hex 3 L5_b_comentario: pass02=907 chars, pass04=908 chars
- hex 3 L6_b_comentario: pass02=3665 chars, pass04=3666 chars
- hex 4 ruler_note: pass02=409 chars, pass04=385 chars
- hex 4 commentary_decision: pass02=2360 chars, pass04=2359 chars
- hex 4 image_oraculo: pass02=432 chars, pass04=417 chars
- hex 4 commentary_image: pass02=432 chars, pass04=417 chars
- hex 4 L1_b_comentario: pass02=349 chars, pass04=348 chars
- hex 4 L3_b_comentario: pass02=467 chars, pass04=467 chars
- hex 4 L4_b_comentario: pass02=401 chars, pass04=401 chars
- hex 4 L6_a_oraculo: pass02=126 chars, pass04=115 chars
- hex 5 ruler_note: pass02=324 chars, pass04=605 chars
- hex 5 sequence: pass02=364 chars, pass04=0 chars

## Verdict

**STRUCTURE ISSUES** — fix parser/markers before AU.

