<!-- changelog:last-release:e444f596 -->

# Changelog — The Original I Ching App

Full project change history.

## [4.2.4] — 2026-07-16 | versionCode: 64 | Stage: Production

### New
- feat(mobile): internal-staging-aab EAS profile — staging env pinned explicitly | commit: b0e3c079

### Fix
- fix(mobile): expo doctor 20/20 — collapse orphan chains, pin bundled versions, inert react exclude | commit: 2f5fb358
- fix(mobile): correct version to 4.2.3 (pure correlative) + versioning ops doc | commit: 6043886a
- fix(mobile): expo doctor cleanup — typescript ~6.0.3 + collapse SDK-53 orphans | commit: 4fe87f4e

### Docs
- docs(mobile): execution log (13 problems/solutions), build registry, AAB size anatomy, final state | commit: e444f596

### Maintenance
- chore(mobile): bump version 4.3.0 / versionCode 63 — SDK 57 internal testing | commit: 52223962

---

## [4.2.3] — 2026-07-15 | versionCode: 63 | Stage: Internal Testing

### New
- feat(mobile): Expo SDK 57 dry-run + assessment/plan docs (target API 36) | commit: 180f4f89
- feat(marketing): smooth per-navigation page fade | commit: 78935366
- feat(marketing): register-free CTA on pricing + new question-led hero subtitle | commit: c5dbb03d
- feat(marketing): re-skin doc pages with the marketing shell + SEO touches | commit: 3db3cc7d
- feat(web)!: move chat to /chat, new marketing homepage at / | commit: da6bd195
- feat(marketing): design system, i18n and shared nav/footer for the new website | commit: 13f74044
- feat(auth): implement password reset — /auth/update-password | commit: b0207086
- feat(seo): add /mutation-explorer to sitemap and robots allow list | commit: cb8b43df

### Fix
- fix(mobile): force react-native singleton in Metro (SDK 57 mixed-RN bundle) | commit: 257495fd
- fix(mobile): apply external audit adjustments to SDK 57 dry-run | commit: 84949cbe
- fix(ci): correct AUD-WEB-02 ground truth + add resolution guard | commit: 884833b0
- fix(ci): add explicit @types/three (was transitive via @react-three) | commit: 84cde8e2
- fix(marketing): stop celeste flash in navigation loading fallback | commit: d7cd4016
- fix(docs): app-adaptive link color in APK + audits date alignment | commit: 21efc6e8
- fix(apk): restore inter-doc nav row in WebView doc pages | commit: 810671f5
- fix(marketing): keep app light/dark theme on docs inside the APK WebView | commit: 19874977
- fix(sentry): suppress benign 'Connection closed.' from APK WebView redirect | commit: 582c89be
- fix(security): reject non-production (sandbox) purchase events in RevenueCat webhook | commit: 7a4326f2
- fix(marketing): fix nav anchor race (cross-page + unsettled layout) + debug logging | commit: d7962b78
- fix(marketing): lock nav underline to clicked item until manual scroll | commit: 5543ec3d
- fix(marketing): fix hero glyph on RTL (Arabic) language switch | commit: 8336ee9c
- fix(marketing): robust nav anchor-scroll + on-screen glyph caption | commit: e14b1fb4
- fix(marketing): enlarge hero glyph further, viewport-scaled to avoid overlap | commit: 9061e5f9
- fix(marketing): align nav actions, wrap hero title, enlarge hero glyph | commit: ff343ce4
- fix(marketing): nav scroll-spy + anchor scroll, ink locale picker, softer card motion | commit: 33d7c3fd
- fix(build): sentinel-file check for build:data instead of directory check | commit: 5e993eab
- fix(i18n): add missing verifyButton translation for pt/fr/de/it | commit: f8b32897
- fix(i18n): complete mutation-explorer-ui translations for 9 locales | commit: 599f88c4
- fix(ci): restore i18n-audit to scripts/ after tools/ gitignore | commit: 605f9c8e
- fix(ci): resolve typecheck errors in zhouyi 64hex generator test | commit: 1bb0bc97
- fix(ci): skip build:data unconditionally on CI/Vercel via env-var detection | commit: f3b8b69d
- fix(ci): align library-data test to Legge englishName source | commit: 64b55dd7
- fix(ci): align mutation-rules tests to Wilhelm DE 1924 source | commit: d749d54a
- fix(ci): resolve TS18047 typecheck failure in library-data test | commit: 2581c75f

### Docs
- docs(mobile): smoke criteria for purchase/integrity items on sideloaded staging APK | commit: 93a14b8e
- docs(mobile): smoke .env procedure — flip the documented PREVIEW/PRODUCTION pairs | commit: 5a018210
- docs(mobile): correct build invariant — smoke APK is ALWAYS local, EAS is prod-only | commit: 5ed4b025
- docs(mobile): record Windows MAX_PATH build blocker; realpath-aware Metro roots | commit: 9cdb089b
- docs(mobile): record Phase 5 bundle gate + metro singleton fix in PLAN-MOB-01 | commit: 2106e2aa
- docs(sec): register external deep security audit (EXT-SEC-02) | commit: eb911506
- docs(web): pause React 18.3.1 hedge — monorepo resolution blocker (AUD-WEB-02) | commit: d074769d
- docs(web): pause React 19 upgrade — ViewTransition not in stable React | commit: 2a432760
- docs(web): external-review corrections addendum for React 19 migration plan | commit: e076a9d7
- docs(web): React 18→19 upgrade assessment + step-by-step migration plan | commit: 68f4fd48
- docs(inc): INC-OPS-01 — ZIP v1 malformado (regenerado v2) + 6 libros fuente perdidos no recuperables de git | commit: 8fea59b0
- docs: register 20260711-OPS-WEB-01 (site restructure) + 20260711-INC-OPS-01 (local assets loss/backup) | commit: 964d7035
- docs(play): add 4.2.2 / versionCode 62 Play Store changelog block | commit: a49cbf88

### Maintenance
- ci: make resolution-guard blocking (drop continue-on-error) | commit: 2fd3ab1b
- ci: run the ci job under npm@10.9.2 (lockfile generator) + report toolchain | commit: 16bf3f81
- chore(web): remove dead @react-three/fiber + drei deps | commit: 80de657d
- chore(audits): order library-commentary so current entries sit above superseded | commit: 8e5881a2
- chore: merge staging — Play Store changelog 4.2.2 | commit: d9d0a05e
- chore: merge staging — CI typecheck + i18n-audit fixes | commit: 215189c8
- chore: merge staging — fix CI typecheck for zhouyi 64hex test | commit: f13099c3
- chore: merge staging → main (4.2.2 / versionCode 62) | commit: 377c75ca
- chore(release): bump 4.2.2 / versionCode 62 — security + auth + marketing | commit: 3113df86
- chore: merge staging → main | commit: 11fa7e02
- chore(release): merge staging → main (2026-07-03) | commit: e81632a5
- merge: staging — W-08 audit completo, Wilhelm DE, Mutation Explorer, bump 4.2.1/61 | commit: d6b9ba25
- merge: feature/mutation-explorer — auto-run on input, no verify button | commit: 8e9a1411
- style(mutation-explorer): remove box background/border from oracle blocks | commit: cd490c82
- merge: staging — mutation-explorer three-tier hierarchy + overlay QA headers | commit: e6255cd5
- Revert "Merge branch 'feature/wilhelm-de-dataset' — Wilhelm DE 1924 runtime source" | commit: 308fe125

---

## [4.2.2] — 2026-07-04 | versionCode: 62 | Stage: Closed Testing

### New
- feat(marketing): watermark highContrast override + Zhou Yi 64hex promo generator | commit: 3d2038c7
- feat(auth): 2FA gate + security notification for password reset | commit: 7949a781
- feat(auth): implement password reset flow — /auth/update-password page | commit: ef72e6a4
- feat(seo): add /mutation-explorer to sitemap and robots allow list | commit: 85cfe08e

### Fix
- fix(build): skip build:data on Vercel when tools/datasets not available | commit: ff910d57
- fix(auth): global session invalidation + consolidated post-change actions | commit: 47ac29a7
- fix(auth): enforce 2FA server-side for password reset, fail-closed on bootstrap error | commit: 9eb3cfe1
- fix(tests): align library-data test to current englishName source (Legge) | commit: 8088000a
- fix(tests): align mutation-rules test assertions to Wilhelm DE 1924 | commit: f9f1db75
- fix(tests): non-null assertion for getLibraryDetail in library-data test | commit: 9847fddc
- fix(audits-i18n): normalizar statusLabel a exactamente 2 valores por locale (11 idiomas) | commit: b31cbede

### Security
- sec: remediate AUD-FABLE5-01 — WebView origin guard, prompt injection, JWT cache bypass, dead field | commit: 39904124

### Docs
- docs(audits): concordance fixes + Play Store 4.2.1 copy correction | commit: 13f63f8b

### Maintenance
- chore: untrack tools/ and reports/ from git; align root version to 4.2.1 | commit: 732c40b1

---

## [4.2.1] — 2026-07-02 | versionCode: 61 | Stage: Closed Testing

### New
- feat(mutation-explorer): add cast catalog, engine, UI and consultation verify mode | commit: fbee84c5
- feat(mut-08): SSoT mutation rules — bundle EN prompt + UI i18n remediación | commit: f1d204cd
- feat(web): polish Mutation Explorer reading verification UX | commit: 7620c750
- feat(data): Wilhelm DE 1924 as runtime wilhelm source (514/514 gate) | commit: 413eb56a
- feat(data): ingest Wilhelm DE Ten Wings (Drittes Buch) and fix CI tests | commit: 615e521e
- feat(data): complete Wilhelm DE Ten Wings parity with Baynes | commit: 604e6d37
- feat(data): Wilhelm DE Erstes Buch extract from zeno.org at 514/514 commentary fill. | commit: 793de48e
- feat(data): switch Wilhelm runtime to clean Zeno DE 1924 maestro. | commit: 58cfb073
- feat(data): close Wilhelm DE Ten Wings AU JPG phase D (64×37). | commit: d9849802
- feat(data): promote Wilhelm DE Ten Wings AU to merged maestro (fase E). | commit: f67d7511
- feat(data): sync Wilhelm DE Ten Wings chinese_roman from Erstes (fase F). | commit: 628519e1
- feat(data): JPG literal audit Wilhelm DE Ten Wings hex 3-43 (AUD-DAT-W-07). | commit: 97153a44
- feat(data): JPG literal audit Wilhelm DE Ten Wings hex 44-48 (AUD-DAT-W-07). | commit: e510d4c0
- feat(wilhelm-de): cerrar JPG literal hex 49-64 + 1-2-8 (AUD-DAT-W-07) | commit: 6af73499
- feat(mutation-explorer): MUT-09 two tabs with live cast diagram | commit: 12cfd7b0
- feat(mutation-explorer): full oracle context with theme-aware read highlight | commit: feeef0d9
- feat(mutation-explorer): three-tier reading hierarchy + prompt transformedImage fix | commit: d30f8e68
- feat(mutation-explorer): auto-update results on line reading system change | commit: 5051a082
- feat(mutation-explorer): remove verify button; auto-run on input ready | commit: 7d023b68
- feat(wilhelm-de): integrate Wilhelm 1924 German edition as runtime translator | commit: 6a0e5e99
- feat(wilhelm-de): use Legge name on master_combined overlay, fix lang attr, update prompt labels | commit: 8466b913
- feat(library): remove redundant romanized names; add verification section to guide; expand tour target | commit: 4c6a5160

### Fix
- fix(notes): show I Ching before Oracle Bones; Keightley last in bibliography | commit: 9777bd95
- fix(notes): place Oracle Bones after full I Ching block, before AI section | commit: c7958e64
- fix(notes): restore APA 7 alphabetical order in ACADEMIC_SOURCES | commit: c31aeee9
- fix(play): correct Confucian/footnote conflation in 4.2.0 notes; sync CHANGELOG.md | commit: 9e50993c
- fix(css): promote oracle-toggle thumb/glow to GPU layer (completes af37871) | commit: 173428a0
- fix(sentry): suppress Facebook in-app browser postMessage noise | commit: e22f7d65
- fix(overlay): render hexagram title via Pango/sharp instead of resvg <text> | commit: 73b2dba5
- fix(overlay): vendor a complete CJK font subset, closing a pre-existing tofu gap | commit: 67973d32
- fix(overlay): replace blurry 8-offset stroke hack with alpha-dilation halo | commit: 41326145
- fix(overlay): migrate title renderer from Pango/sharp to @napi-rs/canvas (Skia) | commit: c0286688
- fix(overlay): resolve title font paths for Vercel serverless bundles | commit: a46f3a9f
- fix(overlay): remove unused GlobalFonts import blocking Vercel build | commit: dda97328
- fix(overlay): segment mixed CJK/Latin in Zhou Yi subtitle lines | commit: 4f8dd2ae
- fix(mutation-explorer): require Seeker+ for all verify modes | commit: 26c46a46
- fix(mutation-explorer): read-only consultation verify with ritual cast view | commit: 808de7fd
- fix(mutation-explorer): full gold oracle texts and cast diagram polish | commit: 35ddc6d8
- fix(mutation-explorer): center hex titles and split reading rules from oracle | commit: 935ebaae
- fix(web): library and mutation verifier buttons side by side in options panel | commit: ab9f8e47
- fix(mut-08): judgment-image-gate test uses mutationRuleBookText | commit: fed1d8af
- fix(mut-08): short mutation rule summary in card/PDF, full text only in Explorer | commit: ba372365
- fix(mut-08): Zhu Xi Qian/Kun Explorer translation matches Adler preamble EN | commit: ee825a6a
- fix(web): drop redundant question from record card; align PDF summary | commit: ac166ce7
- fix(web): PDF summary two-column layout matching record card | commit: 723645f1
- fix(i18n): remove false Wilhelm/Baynes public-domain claims in FAQ and notes | commit: d95d09ac
- fix(i18n): remove false Wilhelm/Baynes public-domain claims in FAQ and notes | commit: 7185f33f
- fix(data): align Wilhelm DE trigrams, library filter, and runtime build for overlay smoke. | commit: 3f6185cc
- fix(data): split Urteil/Bild oracle when zeno marks all paragraphs as commentary. | commit: 864dc64f
- fix(data): keep canonical trigram lines separate from Zeno intro narrative. | commit: b8910a42
- fix(data): accept der/die in canonical Zeno trigram lines (hex 5). | commit: abbbc1d7
- fix(data): strip Zeno layout bullets and cite Wilhelm 1924 as primary source. | commit: de020e70
- fix(mutation-explorer): results cleanup and per-translator expand | commit: 40255756
- fix(mutation-explorer): validate cast code and show only selected oracle texts | commit: 80fd31cb
- fix(i18n): replace em-dashes with commas/semicolons/colons in mutation-explorer-ui | commit: fb250646
- fix(library): use Legge names for hexagram display throughout library, mutation explorer, and historical diagrams | commit: 69b04717
- fix(data): remediate W-08 OCR field contamination in Wilhelm DE 1924 | commit: b485d92a
- fix(data): W-08 round 2 — 35 OCR contamination fixes in Wilhelm DE 1924 | commit: 652e9e57
- fix(data): hex2 commentary_image repair Hingebung hyphenation | commit: 1e9ea602
- fix(data): W-08 ruler_note corrections from physical book (hex 49/60/61) | commit: 50705abf
- fix(data): W-08 run02/run03 — 6 residual OCR fixes in Wilhelm DE | commit: be47dede
- fix(data): apply W-08 run04 CAT-A remediation — 49 OCR fixes + new hex44 Type A bleed | commit: 2cd8eb5f
- fix(data): W-08 CAT-B round1 — 11 fixes from physical book (hex 44/45/49/52/55) | commit: ef1872e7
- fix(data): W-08 CAT-B round2 — 13 fixes from physical book (hex 2/6/15/49/55/56) | commit: 40b3fd98

### i18n
- merge: MUT-08 SSoT mutation rules (bookText EN prompt + UI i18n) | commit: 2e6e7f05
- merge: fix/copyright-wilhelm-attribution — remove false Wilhelm/Baynes PD claims in i18n | commit: 207c94db

### Docs
- docs(oracle-bones): close F2-1/F2-2 in checklists, fix stale pending markers | commit: 55b67785
- docs: close Oracle Bones audits (business decision) + Supabase Warp/OOM audit | commit: 37b746b5
- docs(sup): close Warp/PostgREST audit with live cross-checked evidence | commit: 7144782e
- docs(mob-ios): add iOS App Store launch plan | commit: c6a937d1
- docs(mob-ios): reject framework-migration advice, add push notifications as optional D6 | commit: 8e1cf845
- docs(img-ovr): diagnose production tofu+arrow-overlap regression (Legge #2 Khwan -> #1 Khien) | commit: 2ab368da
- docs(overlay): close AU IMG-OVR-03; add prod-pipeline sample generators | commit: 563b1670
- docs(mut-08): document display split and lineReadingSystem in rule summaries | commit: 8cd82445
- docs(audit): codificar runs 01-03 de validación W-08 + actualizar doc principal | commit: 68749d1b
- docs(audit): cerrar W-08 — documentar CAT-B rounds 1/2 + confirmación H15 verificada | commit: 17a68f7b

### Maintenance
- style(docs): clearer h1-h3 heading sizes on doc pages | commit: 2afe867e
- merge: staging — Play Store 4.2.0 changelog fix + CHANGELOG.md sync | commit: f5f16ce4
- chore(docs): fix stale open status on closed Zhu Xi 32-charts plan | commit: 06821076
- merge: staging — final debt sweep (stale plan status) | commit: c5aea919
- merge: staging — oracle bones checklist debt cleanup | commit: 30a85f41
- merge: staging — close Oracle Bones + Supabase Warp/OOM audits (business decisions) | commit: 567f19b2
- merge: staging — Warp/PostgREST audit closed with live Supabase MCP + Axiom evidence | commit: 0bdbadda
- merge: staging — GPU layer fix for oracle-toggle thumb/glow (line-reading selector glitch) | commit: dc4b58a7
- merge: staging — suppress Facebook in-app browser Sentry noise | commit: ffed7201
- merge: overlay title Pango render fix + CJK font subset (closes 20260627-AUD-IMG-OVR-03) | commit: dfaf9c65
- test(overlay): add e2e sample generator using full production pipeline | commit: 3bf77fd6
- merge: mutation-explorer hex title centering and reading rules section | commit: 5ff8bb42
- merge: fix/mut-08-ssot-completion — build fix judgment-image-gate test | commit: a307b92b
- merge: fix/mut-08-ssot-completion — short rule summary in card/PDF | commit: 330e02c1
- merge: fix/mut-08-ssot-completion — Zhu Xi Q/K translation fix | commit: c0d00710
- merge: fix/mut-08-ssot-completion — MUT-08 summary docs and Q/K lineReadingSystem | commit: 860e6e16
- merge: fix/mut-08-ssot-completion — Mutation Explorer reading verification UX | commit: d48b88e7
- merge: fix/mut-08-ssot-completion — record card question removal and PDF summary parity | commit: 3e376245
- merge: fix/mut-08-ssot-completion — PDF summary two-column layout | commit: f6ac9213
- Close Wilhelm DE Ten Wings JPG attestation (2304/2304). | commit: 01bd692f
- merge: feature/mutation-explorer — MUT-09 cast diagram two tabs | commit: 840d88bd
- refactor(mutation-explorer): single manual panel with polished UI | commit: a7571a79
- merge: feature/mutation-explorer — single tab UI polish | commit: bfd942fd
- merge: feature/mutation-explorer — results cleanup per-translator expand | commit: 8a17a175
- merge: feature/mutation-explorer — cast validation and selection-based oracle texts | commit: 3487070d
- merge: feature/mutation-explorer — full context and read highlight | commit: 7fdee099
- chore(overlay): add QA headers + register TS-WEB-OVR-007/008 in registry | commit: d1eed272
- style(mutation-explorer): remove box background/border from oracle blocks | commit: feb542bd
- chore(data): add hexagrams.baynes.json as gold reference dataset | commit: 3c49a9cb
- style(data): pretty-print hexagrams.wilhelm.json (2-space indent, matches baynes format) | commit: 2b2b2432
- chore(data): add hexagrams.baynes.commentary.json as gold reference dataset | commit: c745b545
- chore(qa): codificar auditoría externa W-08 + script validación fidelidad Wilhelm DE | commit: f9f94dd9
- chore(mobile): bump 4.2.1 / versionCode 61 — W-08 audit + Wilhelm DE + Mutation Explorer | commit: 6380fa73

---


## [4.2.0] — 2026-06-25 | versionCode: 60 | Stage: Closed Testing

### New
- feat(audits): redesign /audits as source-by-source verification blocks | commit: 16ac75ea
- feat(audits): replace /audits sections with single expandable timeline | commit: ac128365
- feat(audits): add I Ching casting methods section from DIV-01/DIV-02 | commit: 505d49d6
- feat(oracle-bones): honest legacy framing in FAQ/notes + Keightley reprint citation | commit: e05f7d96

### Fix
- fix(faq): citas reales en lugar de PDF, separa traductores de tiers, agrega manual de docs | commit: 4a055897
- fix(images): dual font-stack overlay for Legge diacritics | commit: 357fcf72
- fix(ci): sync root lockfile for @fontsource/noto-serif | commit: 86f9f9d8
- fix(images): overlay mutation titles, arrow tspan, and sumi glyph QA harness | commit: 6c5711a3
- fix(images): elimina tspan en linea de mutacion EN, cierra bug resvg de texto ausente | commit: 804dbe01
- fix(images): restaura ajuste de margen vertical en mutaciones de 2 lineas + APA en notas | commit: 169af00d
- fix(build): resuelve warnings de Vercel — hooks Sentry + env vars en turbo.json | commit: 2752968f
- fix(audits): align timeline UI with version-history mockup | commit: a186d047
- fix(audits): collapsible tree with date circle outline only | commit: 826f31b6
- fix(audits): classic expandable tree with YYYY.MM.DD dates | commit: 6816bd02
- fix(audits): categorized timeline with historical fidelity detail | commit: 0d348f53
- fix(audits): truthful EPUB claims, standalone entries, green dates | commit: d993f1ae
- fix(audits): light-mode date chip and left-aligned field labels | commit: eea0c93c
- fix(audits): standardize timeline entry titles to final verification | commit: 7c2fca82
- fix(audits): separate library commentary and ongoing verification naming | commit: 0fc374fc
- fix(audits): classical commentary copy and public-facing hygiene | commit: 8cb06ba9
- fix(audits): plural classical commentaries and Confucius Ten Wings | commit: bdfec452
- fix(audits): remove internal jargon and correct overstated/understated claims | commit: d5c94e9a
- fix(divination): correct manual coin yin/yang mapping to match Wilhelm/Baynes | commit: 262c3dc3
- fix(divination): exact arithmetic for yarrow gates + procedural sources of truth doc | commit: de0e28da
- fix(audits): split casting methods per coin/yarrow with accurate sources | commit: 5a4a9f51
- fix(audits): status field is only Obsoleto./Vigente a la fecha. | commit: b449e4fc
- fix(audits-i18n): align KO/AR status labels with WF-DOC-03 standard | commit: c3ee5812
- fix(turbo): declare REVENUECAT_ALLOW_TEST_EVENTS and trim remote cache outputs | commit: a31d88ca
- fix(build): remove nested web lockfile and set monorepo tracing root | commit: 76d0fa6f
- fix(build): eliminate webpack critical dependency font warnings | commit: f76e60aa
- fix(audits-ui): rounded tree connectors and red superseded status | commit: a9d6df04
- fix(audits): correct yarrow gate count + disclose procedural nuance; restore wilhelm-pdf script | commit: c24f50c4
- fix(oracle-bones): replace fidelity claim with inspiration claim (H-DIV-03-J/I) | commit: a19dccd4
- fix(audits-ui): stronger timeline tree lines in light and dark mode | commit: e19f02b6

### Docs
- docs(qa): codificar auditorías, tests y docs con registros e índices maestros | commit: 44ddab21
- docs(qa): reglas obligatorias de registro, area en tests y validación | commit: 8e6e0769
- docs(qa): ciclo de vida tests, cabeceras QA y limpieza raíz repo | commit: eb8869e1
- docs(divination): Oracle Bones vs Keightley audit (Fase 1) + procedural reference | commit: 89783ac5
- docs(play): add 4.2.0 Play Store notes; refresh AGENTS.md memory | commit: cce9bcbe

### Maintenance
- merge: staging — docs remediation P0-P4 + version 4.1.9/59 | commit: 65db0374
- merge: staging — FAQ citas reales, fix harness, manual de docs, stage Production | commit: 42d9ec97
- test(fidelity): smoke test 20/20 real con normalizacion correcta + Play Store changelog mas completo | commit: 47d3ff00
- merge: staging — smoke test 20/20 verificado + Play Store changelog ampliado | commit: ba37bf2b
- merge(staging): dual font-stack overlay Legge diacritics | commit: 212017c2
- chore(qa): publish reading-quality, LRS and literal fidelity smoke reports | commit: a0ee5139
- merge(staging): QA smoke reports 2026-06-24 | commit: d3838e5d
- merge(staging): fix CI lockfile for noto-serif | commit: 0ecf179d
- merge: staging — fix overlay tspan/diacriticos, reestructuracion docs/QA, APA en notas | commit: 87cd687c
- refactor(claude): standardize hexagram header order across all translators | commit: 315d99ce
- merge: staging — audits UI, Vercel build warnings, header order Claude | commit: c1019c6d
- test(divination): add coin/yarrow verification harness vs Wilhelm Appendix I | commit: 0726327f
- merge: staging — divination Wilhelm appendix, audits timeline, coin mapping fix | commit: 5d043048
- merge: main — casting methods on /audits | commit: edc10ba2
- merge: staging — audits UI, build fixes, turbo cache | commit: 76bcd378
- merge: staging — yarrow/coins exact-math review fixes + Oracle Bones DIV-03 audit | commit: 4088b2d8
- chore(mobile): bump 4.2.0 / versionCode 60 for Play production AAB | commit: 27c1d6b5

---


## [4.1.9] — 2026-06-24 | versionCode: 59 | Stage: Closed Testing

### New
- feat(data): add hexagram fidelity harness and first audit report | commit: b853d63d
- feat(data): Fase 3 gold-aligned ingesters for all three translators | commit: 0e003ea5
- feat(data): scaffold PDF Tier-0 gold verification branch | commit: 800ff70d
- feat(data): Wilhelm PDF gold parser with 64/64 hex extraction | commit: 73a74a80
- feat(data): Wilhelm 100% book-primary fidelity gate | commit: da607cf7
- feat(data): Legge 100% EPUB book-primary fidelity gate | commit: f0a4208a
- feat(data): Legge SBE XVI PDF OCR gold parser at 71% fidelity | commit: 0b9c5c6f
- feat(data): Legge PDF OCR with repair-only EPUB guide (book-primary) | commit: 3647fc94
- feat(data): Legge bundle synced from Oxford SBE PDF gold at 514/514. | commit: 46aa80a8
- feat(data): sync Wilhelm bundle from Pantheon PDF gold at 513/513. | commit: 6f19218c
- feat(mutations): Zhu Xi Adler gold, readBothJudgments, and public /audits page. | commit: 86f6b2b2
- feat(audits): Huang PDF gold, public summary only, internal AU docs. | commit: 2dbfa760
- feat(audits,i18n): surface Fidelity Audits in app menu and refine docs for 4.1.8 | commit: 25af895c
- feat(tooling): add Supabase DB tooling (types generation + migration helpers) | commit: 282a8a3b
- feat(data): EPUB-primary oracle injectors for Wilhelm + Legge (fix CI) | commit: 58a9b290
- feat(wilhelm): maestro TXT Princeton + gates AU 100/100 | commit: fbc2e8cc
- feat(legge): maestro TXT official + política notas W/L | commit: c52f774e
- feat(library): optional scholarly-commentary layer for Wilhelm + Legge | commit: ae26e306
- feat(data): trigram pinyin gold gate + artefactos TXT maestro W/L | commit: a209f70a
- feat(qa): master-synthesis QA harness + confirma gap verbatim también en Wilhelm | commit: 4325279d
- feat(claude): Gate H7 verbatim juicio/imagen (warn + telemetria), cierra audit 2026-06-24 | commit: 2a1ce727
- feat(library): rediseno de la capa de comentario (orden, "+", titulos, color) | commit: 1133f6bd

### Fix
- fix(consult): idioma correcto + lineReadingSystem en SSE y resumen | commit: 8d2d09e4
- fix(data): Fase 3b parser gold — Legge and Zhou Yi 100% fidelity | commit: 1fc4cbf4
- fix(data): Fase 3c tier-2 Baynes supplement for Wilhelm hex 56 judgment | commit: 59cff16d
- fix(data): corregir regresion real enmascarada por bugs del harness de fidelidad | commit: bfbe8f61
- fix(test): update stale Wilhelm hex2 yongLiu assertion (case mismatch) | commit: 9e53377d
- fix(data): close Legge SBE PDF gold at 514/514 with OCR cleanup pipeline. | commit: 44090627
- fix(data): T2 Wilhelm metadata Pantheon gold, Legge licenseNote | commit: 4af56146
- fix(data): T1 normalize Zhou Yi commas to full-width canonical | commit: 2db05c5e
- fix(i18n): remove freizl disclosure from public audits | commit: 166ac7d4
- fix(i18n): align ES FAQ Zhou Yi source wording with /audits | commit: 9d80e954
- fix(wilhelm): close Pantheon PDF oracle fidelity at 513/513 | commit: 3802fae4
- fix(legge): close SBE XVI PDF oracle fidelity at 514/514 without EPUB repair | commit: e8ba5436
- fix(data): default verify gate uses PDF book-primary for Wilhelm and Legge | commit: feda460c
- fix(i18n): complete audits page and FAQ translations across all locales | commit: f0d9a9c1
- fix(build): sync lockfile with database-types workspace package | commit: f23c41c4
- fix(data): restore clean Wilhelm + Legge oracle bundles (pre book-primary PDF regression) | commit: 30759983
- fix(iching-data): restaura versos del Gran Símbolo (大象) en Wilhelm EPUB | commit: 58a3d046
- fix(data): correct two Wilhelm EPUB digitization typos + reinforce Legge parenthesis fidelity in prompt | commit: ef40fb8d
- fix(data): alinear trigramas Sun alchemical WIND, WOOD con Parma | commit: 6fc8ced4
- fix(library): correct hexagram name/title field from TXT-maestro book-one | commit: 9f26a5a1
- fix(library): acordeon ribbon full-width para comentario por punto | commit: 6d6eff82
- fix(library): pulir ribbon comentario — cian tema, toggle dentro de zona | commit: bf25a164
- fix(library): toggle inline en lineas y bloques hex, footer - solo si extenso | commit: 35fe89c7
- fix(library,claude): ribbon height via JS measurado + Gate H7 etiqueta traductor real | commit: 4460ad57

### i18n
- merge: 4.1.8 audits/i18n docs (Fidelity Audits menu link, FAQ bullets, em-dash cleanup) into main | commit: 5df8c1a7
- merge: i18n fixes for audits page and FAQ data-reliability into main | commit: 14e1769b

### Docs
- docs(changelog): 4.1.7 / versionCode 57 (Closed Testing) | commit: 608555fe
- docs(auditorias): Parte 9-10 - verificacion independiente del selector Huang/Zhu Xi y fix de idioma/lineReadingSystem | commit: ed6daffa
- docs(auditorias): Parte 11 - verificacion directa en Supabase produccion + Axiom | commit: 9116e591
- docs: sync developer docs for 4.1.7, LRS selector, and detect-input-language | commit: 18de19cb
- docs(changelog): document SDK 53 dual-React cold-start crash (vc50 to vc51) | commit: cb77424f
- docs(audit): complete Fase 2 fidelity report for all three translators | commit: 4afb84a7
- docs(audit): align fidelity remediation with external validation and add Zhou Yi corruption scanner | commit: 2276c303
- docs(data): Fase 4 align fidelity claims with 2026-06-21 audit results | commit: 26469c97
- docs(i18n): reframe public fidelity audit against academic editions | commit: 0da877b0
- docs(data): cite Wilhelm/Baynes 1950 print edition for six Parma gaps | commit: 8c33479e
- docs(auditorias): master fidelity/mutation audit with source evidence and 32-chart plan. | commit: 92e312d5
- docs(auditorias): archive Opus 4.8 validation and Zhu Xi plan v2 | commit: 12ca5b82
- docs(auditorias): Opus 4.8 v2.1 greenfield plan for executor | commit: 01741206
- docs(auditorias): Gate 0 pending and Zhou Yi traceability | commit: d937af5d
- docs(auditorias): Zhou Yi ctext gold + public 咸/鹹 disclosure | commit: 94b5217d
- docs(auditorias): Gate 0 ejecutado - Fig.19 imagen, Fases A-E bloqueadas | commit: e730aabf
- docs(auditorias): Gate 0 cerrado - 32 charts Zhu Xi equivalen a reglas por conteo | commit: 1fcec437
- docs(changelog): 4.1.8 / versionCode 58 (Closed Testing) | commit: b9725a82
- docs(auditorias): document Legge SBE XVI PDF book-primary process (514/514, no EPUB repair) | commit: c412ad9c
- docs(changelog): fold post-25af895 commits into existing 4.1.8/58 entry | commit: e58340e3
- docs(play-store): strip markdown markup from changelog locale blocks | commit: edf24934
- docs(play-store): wrap each locale block in XML tags matching Play Console bulk-paste format | commit: 645e08ba
- docs(auditoria): cierra adjudicacion Legge 41 L2 (sin punto, fiel) + spot-check Wilhelm hex 43 | commit: 592d0ade
- docs(auditoria): indice WILHELM_TXT_AU_MAESTRO en README | commit: 44686e0b
- docs(wilhelm): cierra AU profunda ronda 2 book-one + comments | commit: a09f22b6
- docs(audit): gap verbatim juicio/imagen en lecturas IA + QA smoke | commit: b9e96f2d
- docs(auditorias): cerrar UI ribbon Biblioteca — validada en main | commit: 1e46d3b9
- docs(auditorias): cierra decision H2 con datos reales Axiom + confirma fix ribbon en APK real | commit: 52684e36
- docs: remediacion completa P0-P4 docs de usuario vs implementacion | commit: 3a52d00e

### Maintenance
- release: merge staging into main — 4.1.7 / versionCode 57 (line-reading system selector, legal update header) | commit: 80dcda4c
- chore(gitignore): ignore transient QA/audit artifacts | commit: 0067f7a2
- chore(gitignore): ignore transient QA/audit artifacts | commit: 6b4c925b
- chore(reports): add line-reading system QA results (Capa 4) | commit: 33eaf1a4
- merge: line-reading QA reports (Capa 4) | commit: 2670b959
- merge: fix consult idioma + lineReadingSystem SSE/resumen | commit: a8330ab8
- merge: docs auditoria Parte 9-10 (verificacion independiente selector + fix idioma/lineReadingSystem) | commit: 27dc1687
- merge: docs auditoria Parte 11 (verificacion produccion Supabase + Axiom) | commit: 6d0a7119
- merge: fix regresion real Wilhelm/Legge enmascarada por bugs del harness de fidelidad | commit: bc97045f
- merge: fix stale Wilhelm hex2 yongLiu test assertion (CI green) | commit: 2dbada74
- merge: Wilhelm Pantheon PDF oracle fidelity 513/513 into staging | commit: 36266b92
- merge: Legge SBE XVI PDF book-primary fidelity 514/514 (no EPUB repair) into staging | commit: 25874766
- merge: Wilhelm 513/513 + Legge 514/514 PDF book-primary fidelity (audits incl.) into main | commit: e4b601ad
- merge: default verify gate PDF book-primary for Wilhelm and Legge into main | commit: 61aff7d9
- test(engine): align H6 Legge assertion with Oxford SBE PDF line wording | commit: 2feef74a
- merge: fix H6 Legge test for Oxford PDF wording into main | commit: fa6fde83
- merge: fold 4.1.8/58 changelog + db tooling into main | commit: f6dc342b
- merge: sync lockfile with database-types workspace package | commit: de713f9e
- merge(staging->main): restore clean Wilhelm + Legge oracle bundles (revert book-primary PDF regression) | commit: e6b28947
- merge(staging->main): EPUB-primary oracle injectors for Wilhelm + Legge (fix CI) | commit: de85b00e
- merge(staging): fix Gran Símbolo (大象) truncado en Wilhelm EPUB | commit: 03a8dee6
- merge(staging): cierre adjudicacion Legge 41 L2 + spot-check Wilhelm 43 | commit: 1815bd44
- merge(staging): fix typos Wilhelm EPUB + fidelidad parentesis Legge en prompt | commit: d8371c6e
- merge: maestro TXT Wilhelm + Legge official (notas W/L, sin ingest runtime) | commit: 13f089e3
- merge: staging — audit verbatim blockquote gap + QA smoke | commit: 97bd8d4e
- merge: fix/library-commentary-ribbon-ui — acordeon ribbon comentario Biblioteca | commit: 0915bafa
- merge: fix/library-ribbon-ui-polish — pulir ribbon cian y toggle en zona | commit: 033f5233
- merge: staging — biblioteca ribbon comentario UI cerrada | commit: 7679281d
- merge: staging — docs cierre auditoria biblioteca ribbon | commit: cf5b40ec
- release: bump version 4.1.9 / versionCode 59 (biblioteca comentario W+L, docs remediation) | commit: 12c0ac5c

---


## [4.1.7] — 2026-06-20 | versionCode: 57 | Stage: Closed Testing

### New
- feat(animation): plan v3 Actions 2-7 — gate + budget store + watchdog + typewriter | commit: 60dbee47
- feat(integrity): Axiom trace chain + Sentry alerts for Play Integrity failures | commit: 598e2b44
- feat(animation): tune tick pacing for M3 — 48s active / 45s hold (was 36s/57s) | commit: 6573cc91
- feat(i18n): add ichingTraditionNote — best of both worlds (Zhu Xi + orthodox school) | commit: 16faf3fe
- feat(guia): render ichingTraditionNote in Section 1 — best of both worlds | commit: 3250ce7f
- feat(i18n): add iching-mutation-rules FAQ in all 11 locales | commit: c1de3bbc
- feat(observability): cache tokens, fases Claude, retry Together 5xx, fallback logging | commit: d0d4650c
- feat(mobile): Release B edge-to-edge for Play Console warning #1 | commit: 7a73aadd
- feat(iching-engine): add Zhu Xi changing-line reading system (Phase 1: core + prompt + route, no UI/persistence yet) | commit: f698848b
- feat(db): persist line_reading_system end-to-end (Phase 2 — H5/H6/H7) | commit: c15a0735
- feat(iching): UI selector for Huang/Zhu Xi line-reading system | commit: 4eef2cac
- feat(line-reading-system): document selector in tour, FAQ and guide (Fase 5) | commit: b73739a2
- feat(ui): renombrar y reubicar selector de lectura de líneas cambiantes | commit: 3985a3b8
- feat(line-reading-system): mostrar sistema de líneas en resumen + fix barra de estado | commit: 01882fdf

### Fix
- fix(db): revoke PUBLIC execute on get_user_session_summaries + deny-all RLS on token_refund_log (073) | commit: ab19e522
- fix(hydration): per-session consult gate + RN accounting + watchdog (audit 2026-06-13) | commit: 2e8044e7
- fix(mobile): attestKey correct API name + bump 3.5.7/vc55 | commit: 6d79c650
- fix(stream): TDZ imagePrompt in stream_ritual + Sentry captureException (audit 2026-06-13) | commit: b94e7bc6
- fix(animation): post-audit minor fixes + verification docs (2026-06-13) | commit: ff1ecbd5
- fix(mobile): fresh Play Integrity nonce per consult — dist 56 / v3.5.8 | commit: eea5cb8f
- fix(integrity): label Axiom/Sentry events from Google verdicts only | commit: dfcc0ccc
- fix(prompt): restore mutation-rule explanation in Líneas en movimiento section | commit: f50156c9
- fix(prompt): apply mutation-rule explanation fix to master_combined mode | commit: 7c4a5bc9
- fix(integrity): downgrade KNOWN_CONTROLLING/CAPTURING from block to warn-only | commit: 5e9e3c6b
- fix(integrity): log KNOWN_* access risk as info, not warn — no Sentry | commit: fae26331
- fix(prompt): enforce strict forward chronological order in Encuadre PARTE 1 | commit: 530b3406
- fix(prompt): enforce forward chronological order in oracle bones threadMemoryNote | commit: 4b1fdc0c
- fix(fallback): OpenRouter → Gemini Flash via fetch; Groq payload truncation | commit: 1313afe1
- fix(fallback): OpenRouter model gpt-4o + TS error response→orResponse | commit: ab44d099
- fix(prompt): mutation rule explanation no longer displaces line text analysis | commit: 9da09b85
- fix(image): CJK font for subtitle text on ZhouYi translator | commit: a5ec79bc
- fix(prompt): restrict LINE TEXTS citation to provided positions only | commit: 33eb879d
- fix(prompt/i18n): architectural fix for mutation-rule line scope + sinological corrections | commit: edfbd8c5
- fix(iching): Fase 2 mutation rules — gates, prompt authority, QA harness | commit: 2cb6e488
- fix(qa): H3 multilingual robustness + full-text transcripts for QA barrido | commit: 8f929bc9
- fix(gates): H1 multiline fingerprint + CJK punctuation + H6 false positive | commit: 4cc0b5db
- fix(gates+prompt): code-review Fase 2 — INTERPRETED_LINES alignment + H3/H5 gate fixes | commit: 970cf8e4
- fix(deps): npm audit — next 15.5.19 + sentry 10.58.0 + turbo 2.9.18 | commit: 08233588
- fix(tokens): oracle_bones siempre cuesta 1 token independiente del translator activo | commit: c7d59646
- fix(tokens): oracle_bones siempre cuesta 1 token independiente del translator activo | commit: 93ac0215
- fix(oracle-bones): no enviar translatorId en requests de oracle_bones | commit: a8168385
- fix(oracle-bones): no enviar translatorId en requests de oracle_bones | commit: 35f101a6
- fix(mobile): remove broad photo read permissions for Play policy (vc48) | commit: 612c1ce0
- fix(mobile): add promise dep — Sentry 6.x requires it, removed from RN 0.79 | commit: cb4e00ee
- fix(mobile): restore expo-app-integrity Gradle 8 postinstall fix | commit: b28560eb
- fix(mobile): add splash and app icon assets for SDK 53 native build | commit: de6c501c
- fix(oracle): omit 'El trazado' section when no changing lines | commit: f77ac00c
- fix(oracle): rename fifth section to 'El hexagrama en su plenitud' when no mutations | commit: 7bd4a726
- fix(mobile): force React singleton via extraNodeModules in Metro config | commit: 62fd288d
- fix(mobile): extraNodeModules only for react, not react-native/react-dom | commit: 24a4a29b
- fix(web): correct broken anchors in privacy/guia doc links | commit: 5f2ef9be
- fix(mobile): true React singleton via resolveRequest + replace banner icon with square app icon | commit: 5c6fe87f
- fix(mobile): correct versionCode to 51, not 55 | commit: 2e572e84
- fix(mobile): use the actual brand icon (swirl) as the launcher icon | commit: 7ba4a0da
- fix(observability): instrument Oracle Bones Claude call in Axiom traces | commit: df3e2041
- fix(mobile): auto-adjusting chat bottom inset + full-bleed splash image | commit: 16dc7149
- fix(mobile+web): remove fake 18px chat bottom gap in RN WebView | commit: e4b04e5b
- fix(mobile): theme-aware SystemBars and Android top inset fallback | commit: 5f83864e
- fix(mobile+web): chat drawer safe-area top and nav bar on RN | commit: 4d79fd5b
- fix(web+mobile): guard __rnNavigateTo against pre-hydration router dispatch | commit: af6c4761
- fix(web): block WordPress probe paths, require Turnstile on sign-in too | commit: aa55620a
- fix(auth): invalidate bootstrap redis cache on legal consent acceptance | commit: 54252c36
- fix(auth): invalidate bootstrap redis cache on legal consent acceptance | commit: 0eb84fd4
- fix(iching-engine): align FOUR_LOWEST_STABLE mutation rule to Alfred Huang's reduction system | commit: f05b1895
- fix(line-reading-system): post-impl audit remediation (H10/H11/H12) | commit: 338247e9
- fix(ui): reordenar barra de estado a Traductor -> Lectura de lineas -> Metodo | commit: 951615ce
- fix(tour): alinear tutorial con el panel (Metodo + titulo Ejecucion) | commit: a8e80144
- fix(legal): encabezado de actualización al re-aceptar políticas | commit: 834c8f90

### i18n
- merge(staging→main): ichingTraditionNote i18n — orthodox school in guia docs | commit: 4733cdb7
- i18n(faq,guia): propagate Huang/Zhu Xi attribution fix to all 11 locales | commit: 6b1e3a90

### Docs
- docs(canvas): update architecture canvas to v3.5.6 + ignore agent runtime files | commit: 93f5d1f5
- docs(audit): update hydration gate + pre-production audit — post-session state 2026-06-13 | commit: e3a119d2
- docs: changelog 3.5.3 — Play Integrity + animation plan v3 + prompt fixes | commit: 07ee2c13
- docs(audit): add sinological validation — orthodox school (Alfred Huang / Nanjing) | commit: c20a45b6
- docs: auditoría observabilidad + mutationRule checked en changing lines audit | commit: 9aaf5840
- docs(audit): align Fase 2 closure with Opcion B and commit 2cb6e48 | commit: e4c249f7
- docs(audit): auditoría general pre-producción 2026-06-16 | commit: 062ca614
- docs(agents): update preferences — oracle bones independence, PDF export, QA mutation tracing | commit: 788878c9
- docs(agents): update preferences — oracle bones independence, PDF export, QA mutation tracing | commit: e29db4f2
- docs(auditorias): consolidate audits folder and document RN WebView bottom gap | commit: 6e4885ba
- docs(privacy): disclose device/installation identifiers and provider categories | commit: cbaca120
- docs(auditorias): document Data Safety rejection root cause and resolution | commit: f2574c06
- docs(legal): align current terms and privacy versions with publication dates | commit: 331811e8
- docs(legal): align current terms and privacy versions with publication dates | commit: 805e9723
- docs(changelog): document legal-consent bootstrap-cache loop fix and version date alignment | commit: f0d0366f
- docs(auditorias): document Huang/Zhu Xi line-reading selector plan + audit | commit: e887c95b
- docs(auditorias): record Phase 1-5 implementation against the Zhu Xi audit | commit: 3b71822c
- docs: reorganizar guia/notes por orden de selectores + limpiar em-dashes FAQ | commit: 26ebfd41
- docs(audit): documentar resultados de pruebas Parte 8 (build/tsc PASS, 0 dashes, hashes) | commit: 713c5846
- docs(auditorias): Parte 9 verificacion independiente del line-reading system selector | commit: 4b5cf028

### Maintenance
- chore(mobile): restore 3.5.3/versionCode 46 — official Play Store submission | commit: 9e247135
- refactor(integrity): remove Sentry from integrity events — Axiom only | commit: 1f23425a
- Revert "refactor(integrity): remove Sentry from integrity events — Axiom only" | commit: 3c566cc8
- ﻿fix(prompt): mutation-rule audit -- fix 6-line and QIAN/KUN edge cases | commit: 1e7a8585
- ﻿feat(gate): H1/H2 line citation gate + retry for missing line blockquotes | commit: 83e1cc2e
- test(engine): comprehensive mutation-rule regression suite + gate tests + audit update | commit: dd46fce5
- merge(staging→main): Zhu Xi mutation audit — H1/H2 gate, tests, QIAN/KUN fix | commit: 390bd4d1
- merge(staging→main): sinological validation docs — orthodox school confirmed | commit: 09a5cf79
- merge(staging→main): wire ichingTraditionNote into guia page | commit: 0fca6c68
- chore: trigger redeploy staging (testing claude-sonnet-4-6) | commit: a1b889ea
- chore: trigger redeploy production (claude-sonnet-4-5-20250929) | commit: 5104e2ad
- merge: staging into main (mutation rules Fase 2) | commit: 040f41f6
- merge: staging into main (audit Fase 2 closure) | commit: bc04befc
- chore(mobile): bump to 4.0.0/versionCode 47 — official production launch | commit: 5e9df738
- chore(mobile): bump to 4.0.0/versionCode 47 — official production launch | commit: 5f6707f2
- merge: fix/android-media-permissions-vc48 into staging | commit: 6e88af55
- chore(changelog): add 4.0.1/vc48 — permissions fix entry | commit: 23e6ae86
- chore(mobile): upgrade Expo SDK 51 → 53, RN 0.74 → 0.79 (Release A) | commit: f1815fe9
- chore(changelog): add 4.1.0/vc49 — SDK 53 upgrade entry | commit: 84c8f14d
- merge: chore/upgrade-expo-sdk53 into staging — SDK 53 + RN 0.79 (Release A, vc49) | commit: 3cd462e2
- merge: staging into main — SDK 53 + RN 0.79 Release A (vc49 / 4.1.0) | commit: d69d9394
- chore(mobile): bump to 4.1.1 / versionCode 50 | commit: 28c47a21
- chore(mobile): drop stale changelog row, shrink icon.png 1.3MB -> 237KB | commit: 35ac93d4
- chore(mobile): bump to 4.1.4 / versionCode 53 | commit: 17c0b015
- chore(mobile): bump to 4.1.5 / versionCode 54 for Release B Play upload | commit: 24672d6b
- chore(mobile): keep 4.1.5 / versionCode 54 — drawer fix without version bump | commit: 12c0d0ba
- chore(reports): add mutation QA recheck and post-fix npm audit reports | commit: 2dc640ad
- chore(mobile): bump to 4.1.6 / versionCode 55 for Play Console release | commit: fa3f82bd
- refactor(iching-engine,context-engine): housekeeping from Zhu Xi audit (H8/H9) | commit: 3a8ba788
- merge: line reading system selector (Huang/Zhu Xi) into staging | commit: 4baed773
- merge: mostrar sistema de líneas en resumen + fix barra de estado | commit: 385d8a28
- merge: reordenar barra de estado (traductor -> lectura -> metodo) | commit: 2b164ad7
- merge: alinear tour con panel (Metodo + Ejecucion) + memoria | commit: bf001d24
- merge: reorganizar docs (guia/notes orden de selectores) + limpiar em-dashes FAQ | commit: cdaf73d9
- merge: documentar resultados de pruebas Parte 8 en audit | commit: b699a47c
- merge: fix(legal) encabezado de actualizacion al re-aceptar politicas | commit: 258383e0
- chore(mobile): bump version 4.1.7 / versionCode 57 for Play release | commit: e21426e6

---


## [3.5.6] — 2026-06-13 | versionCode: 54 | Stage: Closed Testing

### New
- feat(db): migration 072 — refund_token RPC + token_refund_log (audit CRIT-02) | commit: c39a00d8
- feat(api): token refund on post-charge failure (audit CRIT-02) | commit: 36243b12
- feat(perf/phase-0): telemetry baseline for prompt-cache optimization | commit: 30ce9ecf
- feat(perf): Phase 1 — prompt caching V2 with real conversation history pairs | commit: 4b931b48
- feat(perf): Phase 2 — streaming deltas via ANTHROPIC_STREAM_DELTAS flag | commit: 7e34f48e
- feat(perf): Phase 3 — parallel image generation via ANTHROPIC_PARALLEL_IMAGE flag | commit: 907d3265

### Fix
- fix(infra): lower PostgREST semaphore cap 20→8 (audit CRIT-01) | commit: 05177a5e
- fix(infra): pin Vercel region to iad1 (audit MED-01) | commit: 58815b43
- fix(infra): correct Redis TTL semantics comment + Sentry drift alert (audit ALT-01) | commit: ae97849d
- fix(infra): recalibrate Sentry drift threshold + fix migration comment (audit OBS-01) | commit: 4f661978
- fix(mobile): fix PDF export failing with 'No se pudo guardar' on Android | commit: 2788727b
- fix(mobile): fix PDF export — corrupt base64 from blob slicing | commit: c590e8a8
- fix(images): overlay compositing for data:image/ URLs (b64_json fallback path) | commit: b4b2dc4e
- fix(pdf): route image fetches through server proxy to bypass CORS on R2 URLs | commit: dd276c57
- fix(stream): SSE heartbeat + client-side recovery for Android WebView timeout | commit: b3383292
- fix(stream): move recovery to both failure paths + polling + i18n (RCA 2026-06-12) | commit: 33bbfaf2
- fix(response): strip I CHING READING / ORACLE BONES READING title headers | commit: 06e7be1a
- fix(perf): resolve Opus 4.8 audit blockers B1 + B2 | commit: 0f130960
- fix(perf): resolve B3 — guard undefined image from failed parallel build | commit: 63bbea67
- fix(sec): SEC-01 — gate TEST webhook events behind REVENUECAT_ALLOW_TEST_EVENTS | commit: e6d425ff

### Performance
- perf(pdf): preload jspdf bundle when thread has content to eliminate click delay | commit: adf26b12

### Docs
- docs: add perf optimization audit (Fable initial + Phase 1-3 impl + Opus 4.8 follow-up) | commit: 51e3e2d3
- docs: changelog 3.5.6 + pre-production audit update (all findings closed) | commit: 54b31a5e

### Maintenance
- sync version bump 3.5.5 from main | commit: 698f3121
- test(api): token refund decision matrix + helper contracts (audit CRIT-02) | commit: 325a5813
- chore: trigger Vercel redeploy for new env vars | commit: fb8aeb1f
- chore: trigger Vercel redeploy for new env vars | commit: e0e83e3a
- chore: trigger Vercel staging redeploy for REVENUECAT_ALLOW_TEST_EVENTS | commit: 48d3be1d
- chore(mobile): bump to 3.5.6 (versionCode 54) for local APK smoke test | commit: 65a12170

---


## [3.5.5] — 2026-06-10 | versionCode: 53 | Stage: Closed Testing

### Fix
- fix(mobile): use relative path .\gradlew.bat on Windows in assemble-android-release script | commit: 9cd94f0b
- fix(web): Phase 7 P0 — reduce PostgREST connections per login (Warp kill root cause) | commit: e542d7a8
- fix(web): Phase 7 P1 — consolidate getUserSessionSummaries from 2 queries to 1 RPC + Redis cache | commit: a3e8ac31
- fix(mobile): Phase 8 — prevent OOM crash + restore session on renderer kill | commit: 90a66500

### Maintenance
- sync version bump 3.5.4 from main | commit: b84ae843
- sync main → staging: Phase 8 OOM crash fix + session recovery | commit: c8b86071
- chore(mobile): bump to 3.5.5 (versionCode 53) — Phase 7+8 APK | commit: dfdcdf6f

---


## [3.5.4] — 2026-06-10 | versionCode: 52 | Stage: Closed Testing

### New
- feat(web): Phase 1 — upload generated images to R2 for permanent storage | commit: 0cc3a08f
- feat(web): Phase 2 — global Redis semaphore for PostgREST connections | commit: 7cc5ef6c
- feat(web): Phase 4 — explicit Vercel function timeouts in vercel.json | commit: f223dd25
- feat(web): Phase 3 — per-user inflight gate on /api/consult | commit: 12646b63
- feat(db): Phase 5 — weekly VACUUM ANALYZE via pg_cron (migration 070) | commit: 44c36f6a
- feat(web): Phase 6 — Sentry monitoring alerts on consult failures, R2 errors, and semaphore pressure | commit: 8d4aed83

### Fix
- fix(web): prevent bootstrap race leaving account tier/tokens invisible | commit: 1e9a831e
- fix(web): prevent bootstrap race leaving account tier/tokens invisible | commit: 21469c6a
- fix(claude): remove mutation rule code from prompt to prevent leakage in response | commit: f5dca4d4
- fix(perf): eliminate double-bootstrap burst on login (D+C pattern) | commit: 0fb94ff6
- fix(perf): reduce PostgREST pool saturation on login and consult | commit: abf581e9
- fix(observability): enable Supabase telemetry gate and instrument chats routes | commit: cc344210
- fix(web,mobile): serialize PostgREST burst on hydration and consult | commit: b4654ce6
- fix(mobile,web): prevent OOM on large downloads and stabilize auth on 401 | commit: 7b298b01
- fix(i18n,mobile): localize RevenueCat web purchase redemption dialogs | commit: 084c487b
- fix(mobile,web): restore long-thread PDF export without OOM block | commit: e6f9c2b9
- fix(web,mobile): resilient cold-open bootstrap and sync coordination | commit: d58fb287
- fix(web,mobile): avoid signOut on transient 401 after Warp during chat load | commit: 40b54465
- fix(mobile,web): restore b111d7b auth_signout debounce — no forced OAuth redirect | commit: eeea551a
- fix(web): guard /api/health PostgREST query with withSupabaseSemaphore | commit: dac7bbe7
- fix(mobile): restore URL-safe OAuth intercept — remove accounts.google.com catch | commit: 288bce4b
- fix(web): async wrapper in withSupabaseSemaphore health check + scalability runbooks | commit: 4a510bfa
- fix(web): lower PostgREST semaphore from 4 to 2 concurrent per instance | commit: fb54ca24
- fix(web): fix image open/download for R2 URLs — bypass browser CORS | commit: 6c08057d
- fix(security): harden image-proxy against SSRF and header injection | commit: 4c84d7e6
- fix(web): Phase 2 corrections — db_pool=30, await DECR, TTL only on create | commit: 6bc11bfb
- fix(mobile): handle WebView renderer crash with onRenderProcessGone | commit: e91ca2a0

### Docs
- docs: add scale infrastructure plan A-Z (10K-100K users) | commit: 3c7ccb84
- docs: mark Phase 1 R2 image persistence as complete | commit: 65ad5c26

### Maintenance
- merge: fix/warp-pool-saturation into staging | commit: d4d4e200
- Add Supabase telemetry for Warp correlation in Axiom. | commit: 04a4bd92
- chore(mobile): bump Android versionCode to 46 for OOM/auth hotfix APK | commit: d5c76093
- merge: feat/r2-image-persistence → staging (Phase 1 R2 image persistence) | commit: c9363efb
- merge: staging → main (Phase 1 R2 image persistence + image-proxy fix) | commit: efe7cc99
- merge: feat/global-redis-semaphore → staging (Phase 2) | commit: 1ff7eb25
- merge: staging → main (Phase 2 global Redis semaphore + corrections) | commit: 37e300ed
- merge: staging → main (Phase 4 Vercel timeouts + Android crash fix) | commit: a44a4695
- merge: feat/consult-rate-limit → staging (Phase 3) | commit: 9e4256cb
- merge: feat/pg-cron-vacuum → staging (Phase 5) | commit: 789cd9c5
- chore(mobile): bump to 3.5.4 (versionCode 52) for local APK release | commit: eca19cf0

---


## [3.5.2] — 2026-06-07 | versionCode: 45 | Stage: Closed Testing

### New
- feat(sync): two-phase thread loading — meta first, TOAST content in background | commit: 9ebc4f15
- feat(db): Phase 2 TOAST split — consultation_content table (migrations 062-064) | commit: 828c8945
- feat(db+web): Phase 3 scale — RPC write path, thread=1, serial bootstrap | commit: 4455e7b3
- feat(db): production Supabase closure — migration 069, Fase 4 ops, recovery docs | commit: 9d40aefd

### Fix
- fix(prompt): enforce full hexagram chain in Encuadre for deep threads (up to 8 consultations) | commit: b1619f1f
- fix(prompt): remove compression trade-off from Encuadre + bump master_combined budget | commit: 653fbc9d
- fix(db+mobile): prevent TOAST-driven pool exhaustion + deduplicate sync requests | commit: f38d52cd
- fix(sync): await in-flight syncChatContent promise instead of discarding — v3.5.1 | commit: 3ffe15cb
- fix(prompt+context): narrative Encuadre, no-dash rule, TOAST-free consult context | commit: e35ab4c2
- fix(web): prevent Phase 1 from overwriting full thread content with summaries | commit: 88874f90
- fix(db+api): bound TOAST read timeout to prevent Warp thread kills in production | commit: bf146134
- fix(db): switch get_session_content_safe to SECURITY INVOKER — closes 0028/0029 | commit: 91b8e865
- fix(api): protect full thread fetch against Warp timeouts — parallel meta+content | commit: 982781a1
- fix(db+api): definitive Warp timeout fix — 2s guard + eliminate all-sessions TOAST bomb | commit: ac0008bc
- fix(db+api+web+mobile): Phase 1 — eliminate PostgREST connection burst (Supabase stability) | commit: da699cfa
- fix(stability): close 3 Phase 1 follow-up gaps — cache invalidation, mobile bootstrap, onLoadEnd refresh | commit: 16cc4974
- fix(stability): eliminate post-consult /api/account/me burst + bootstrap re-run guard | commit: 90a4eb4c
- fix(bootstrap): move optimistic lock to effect start — blocks duplicate fetch before it fires | commit: 08b49c7f
- fix(db): remove VACUUM ANALYZE from 063 — cannot run inside transaction block | commit: 6a49b8d5
- fix(db): revoke anon/authenticated execute on sync_consultation_content — matches 054 pattern | commit: 2a250741
- fix(web): skip iching:account-refresh on SIGNED_IN — bootstrap handles login hydration | commit: 89e4c26a
- fix(web): sort chat list by firstConsultationAt — matches displayed date | commit: 26c33bb2
- fix(db): migration 065 — correct pg_prewarm cron for consultation_content | commit: fa3ab63c
- fix(web+mobile): remove legacy TOAST fetch paths | commit: 32702c81
- fix(db): stop sync trigger from wiping consultation_content on NULL | commit: bf33b59d
- fix(db): align verify_migrations 064 check with post-069 prod state | commit: 849fcf5a

### Docs
- docs(audit): close Phase 1 in SUPABASE_DB_STABILITY_AUDIT — status yellow, changelog updated | commit: 96a0e05a
- docs(audit): update SUPABASE_DB_STABILITY_AUDIT — Phase 2 implemented, migration instructions added | commit: cbccf396
- docs(audit): Warp root cause closure + verification checklist | commit: 7a2778ba
- docs(db): P0 incident consultation_content wipe + permanent migration gates | commit: 99f32dcf

### Maintenance
- merge(staging): two-phase thread loading from feature/two-phase-thread-loading | commit: 979d61a7
- merge(main): two-phase thread loading + P1 inFlight fix — v3.5.1 | commit: 1dc9b5b0
- merge(main): two-phase loading, TOAST timeout guard, flash fix, narrative Encuadre — v3.5.1 | commit: d59e56b9
- merge(main): close last unprotected TOAST read path in chats route | commit: 8a86e347
- merge(main): definitive Warp timeout fix — 2s guard + exception handler | commit: fd5a08e3
- merge(staging): Phase 1 Supabase stability — 9 fixes applied | commit: 7e67f27a
- merge(main): Phase 1 Supabase stability — complete (11 fixes) | commit: a203e5a9
- merge(main): Phase 2 TOAST split + Warp remediation (staging) | commit: d22a81c5
- chore(release): bump version 3.5.2 / versionCode 45 | commit: 02723850

---


## [3.4.9] — 2026-06-06 | versionCode: 42 | Stage: Closed Testing

### New
- feat(fallbacks): replace local prebuilt pool with clean WebP images | commit: 76feb6e3

### Fix
- fix(web): persist tour-completed flag to Supabase user_metadata across reinstalls | commit: a02108b4
- fix(web): persist tour-completed flag to Supabase user_metadata across reinstalls | commit: 04205d7a
- fix(web): persist tour-completed flag in public.users across app reinstalls | commit: b634e7e0
- fix(web): persist tour-completed flag in public.users — migration 051 | commit: f81e3c90
- fix(migrations): correct verify_migrations 051 syntax — UNION ALL instead of comma subquery | commit: f761909a
- fix(migrations): correct verify_migrations 051 syntax | commit: 816faa3c
- fix(image): map oracle bones verdict names to R2 bucket folder names | commit: 01edc4cb
- fix(interpretation): show actual transformed hexagram Chinese name instead of static 之卦 | commit: 10b0221b
- fix(interpretation): merge staging — transformed hexagram Chinese name fixes | commit: 508d3c00
- fix(interpretation): replace static 之卦 in translator rule with trChinese variable | commit: 2857460f
- fix(interpretation): escape backticks in section role description inside template literal | commit: 2c68a01a
- fix(api): add transformedHexagramChinese to SSE final_ready event; standardize changelog to English | commit: 752877d1
- fix(prompt): add La imagen (象傳) as explicit ## heading in all translators including master_combined | commit: 46e41db3
- fix(master-combined): bump targetWordCount to 1400-1800 for image section | commit: 8b951d38
- fix(prompt): force literary variety in session-arc paragraph of Encuadre | commit: f57214f1
- fix(prompt): snapshot vocabulary firewall + Encuadre/SNAPSHOT separation lock | commit: 61008da8
- fix(prompt): prohibit slash-separated blockquotes — preserve verse line breaks | commit: 2c8ef084
- fix(prompt): enforce multiline blockquotes for Wilhelm in master_combined | commit: 06caf05a
- fix(css): promote toggle label layers to GPU to prevent text disappearing on scroll | commit: af378719
- fix(mobile+web): fix chat thread hydration — stale partial threads after login | commit: 75e71d41

### Docs
- docs(mobile): SQLite chat hydration audit — root cause analysis | commit: d9645caa
- docs(audits): add closure changelog to all 5 audit documents | commit: a9aa199d
- docs: sync README, CLAUDE.md, and ARCHITECTURE_AUDIT to current state (v3.4.8) | commit: b1508f69
- docs(audit): DYNAMIC_SYMBOLS_AUDIT + changelog 3.4.9 | commit: 08335413
- docs(audit): add 象傳 as intentionally static symbol in DYNAMIC_SYMBOLS_AUDIT | commit: 60310ee1
- docs(audit): add Oracle Bones symbol audit to DYNAMIC_SYMBOLS_AUDIT | commit: 87a39f11
- docs(audit): close chat thread hydration audit with cross-analysis and fix details | commit: baf72f0a

### Maintenance
- revert: undo user_metadata tour flag — migrating to public.users column instead | commit: 2a458fc8
- revert: undo user_metadata tour flag | commit: e4137170
- chore(ci): force staging redeploy — testing R2 image fallback with IMAGE_PROVIDER=mock | commit: 2910bbb8
- chore(ci): force staging redeploy — testing R2 fallback with invalid Together key | commit: 6452fd5f
- chore(ci): force staging redeploy — restore real Together API key | commit: 0080934c
- chore(fallbacks): remove old PNG pool — WebP-only local fallbacks | commit: 307d60b6
- chore(fallbacks): merge staging — remove old PNG pool | commit: 33de9e52
- chore(changelog): fold 2026-06-06 web fixes into 3.4.8 — no new Play Store release | commit: 33f6c6a6
- chore(changelog): clarify 3.4.8 — APK built for Play Store; web-only fixes separated | commit: 654426e0
- chore(changelog): add 2026-06-06 prompt + UI polish fixes to 3.4.8 | commit: 89ecebc0
- chore(release): bump version 3.4.9 / versionCode 42 | commit: bbd9d475

---


## [3.4.8] — 2026-06-05 | versionCode: 41 | Stage: Closed Testing

### New
- feat(mobile): native auth bar replaces web session strip | commit: 92166a79
- feat(mobile): native auth bar + build warning fixes | commit: 46a33044
- feat(mobile): native auth bar + build warning fixes | commit: 215db012

### Fix
- fix(mobile/security): persist last-known UID in SecureStore to prevent cross-user SQLite leak | commit: 7367a97c
- fix(claude): suppress internal prompt keys from user-visible output | commit: 351877b0
- fix(build): suppress Sentry deprecation warning + declare GOOGLE_SERVICE_ACCOUNT_JSON in turbo | commit: 92425eb6
- fix(mobile): eliminate double auth bar — triple-layer session strip suppression | commit: 357835ef
- fix(mobile): eliminate double auth bar | commit: 75fc3e04
- fix(web): eliminate auth bar blank-flash on WebView cold start | commit: 33aadb8c
- fix(web+mobile): revert native auth bar + fix hydration gap in web bar | commit: 3d7b89b7
- fix(web): suppress white-frame flash on Next.js App Router navigation | commit: 9acd42d7
- fix(web): suppress white-frame flash on Next.js App Router navigation | commit: fa32b1c9
- fix(web): always show sign-in/sign-out button during auth loading window | commit: 2e1ecb85
- fix(web): always show sign-in/sign-out button during auth loading window | commit: 7934ae12

### Maintenance
- revert: remove NativeAuthBar — reverting to web bar approach | commit: 26d85971
- chore(release): bump version 3.4.8 / versionCode 41 | commit: 57a97bc0
- chore(release): bump version 3.4.8 / versionCode 41 | commit: 439a2bb3

---


## [3.4.7] — 2026-06-04 | versionCode: 40 | Stage: Closed Testing

### Fix
- fix(mobile): fix atob padding in getUserIdFromJwt — root cause of SQLite wipe on every cold start | commit: 4ebafc37
- fix(web): restore Supabase fallback in rn:thread-not-found handler | commit: 6b1a81ba
- fix(mobile): preserve SQLite through sign-out — instant re-login for same user | commit: c22696f0

### Maintenance
- chore(release): bump version 3.4.7 / versionCode 40 | commit: b1e448ab

---


## [3.4.6] — 2026-06-04 | versionCode: 39 | Stage: Closed Testing

### Fix
- fix(mobile): sequential prewarm + fetch timeout to prevent stuck loading states | commit: 09704c9a

### Maintenance
- chore(release): bump version 3.4.6 / versionCode 39 | commit: 718a6c1e

---


## [3.4.5] — 2026-06-04 | versionCode: 38 | Stage: Closed Testing

### Fix
- fix(mobile): install expo-device — missing peer dep of expo-app-integrity | commit: 6b5a054e
- fix(mobile): install expo-device — missing peer dep of expo-app-integrity | commit: 23a97d19
- fix(mobile): fix expo-app-integrity config plugin and pass cloudProjectNumber at runtime | commit: 33d84da1
- fix(mobile): fix expo-device version and patch expo-app-integrity for Gradle 8 | commit: 6bb241f7
- fix(ci): increase Node.js heap for Next.js build to prevent OOM | commit: 87883d26
- fix(mobile): remove maven-publish from expo-app-integrity + stacktrace flag | commit: d4ebdce4
- fix(mobile): rewrite expo-app-integrity build.gradle for AGP 8 compatibility | commit: 49b973c9
- fix(mobile): fix JVM target mismatch in expo-app-integrity Gradle build | commit: 40abfd81

### Performance
- perf(mobile): pre-warm SQLite message cache for 3 most recent chats | commit: 9a5c1c16
- perf(mobile): pre-warm SQLite message cache for all chats, not just top 3 | commit: b81ea354

### Maintenance
- chore(release): bump version 3.4.5 / versionCode 38 | commit: 32ec8935

---


## [3.4.4] — 2026-06-03 | versionCode: 37 | Stage: Closed Testing

### New
- feat(security): gate library behind auth+tier and rate-limit scraping | commit: e18b77cf
- feat(security): implement Play Integrity API attestation for Android app | commit: 1fc2e6ec
- feat(security): add Play Protect and App Access Risk verdict checks | commit: f3df7203

### Fix
- fix(security): revoke RPC execute on trigger-only function (migration 049) | commit: 2063c962
- fix(security): revoke PUBLIC execute + deny-all policies on internal tables (migration 050) | commit: e61ba399
- fix(i18n): restore characters corrupted by incorrect encoding on previous commits | commit: df61e00f
- fix(web): remove dead fields from notes page | commit: 3622c4d3
- fix(i18n): remove BOM from mobile-native-ui.ts | commit: 72dd87cd
- fix(web): noindex delete-account page and disallow crawling | commit: 4b3f03fd
- fix(security): server-side data isolation for library translations | commit: 13c19dd6
- fix(security): delete legacy public hexagram API routes (audit finding) | commit: c6bc6365
- fix(library): fix rate limit blocking normal library browsing | commit: 303788f0
- fix(security): harden Play Integrity verification (security review findings) | commit: 3c6c1947
- fix(deps): resolve expo-app-integrity peer dep conflict for Vercel build | commit: 1e403a95
- fix(ci): update package-lock.json — babel 7.29.7 drift after dep install | commit: a2debf71
- fix(ci): update package-lock.json — babel 7.29.7 drift | commit: 1aa80478

### Maintenance
- chore(audit): resolve minor debt items from library-protection audit | commit: 630f2ed1
- chore(release): bump version 3.4.4 / versionCode 37 | commit: 075bd2fd

---


## [3.4.3] — 2026-06-01 | versionCode: 36 | Stage: Closed Testing

### Fix
- fix(mobile): fix getUserIdFromJwt base64url decode — root cause of purchase failures | commit: 3310d844
- fix(ux): remove free_depleted token message and hexagram grid from notes | commit: f056fd7f
- fix(feedback): remove locale dropdown — send locale silently from useAppLocale | commit: d10d1f9c
- fix(mobile): fix chat drawer last item hidden behind Android nav bar | commit: 8e85dbe6

### Maintenance
- chore(i18n): remove dead fields and simplify TokenCenterMessageKey | commit: d34f1634
- chore(release): bump version 3.4.3 / versionCode 36 | commit: f821f096

---


## [3.4.1] — 2026-06-01 | versionCode: 34 | Stage: Closed Testing

### New
- feat(compliance): restore /delete-account page for Play Store Data Safety | commit: cba82d7e
- feat(faqs): add /delete-account link inside delete-account FAQ item (11 locales) | commit: e9d04401

### Maintenance
- debug(rc): expose actual RC getOfferings error in purchase dialog | commit: 97529b47
- chore(release): bump version 3.4.1 / versionCode 34 | commit: fcba50a0

---


## [3.4.0] — 2026-06-01 | versionCode: 33 | Stage: Closed Testing

### Fix
- fix(billing): implement sync-billing — return live credits from Supabase | commit: c28edb48
- fix(i18n): re-evaluate tokenCenterMessage on locale change | commit: ae61dafc
- fix(auth): remove pre-OAuth consent modal for Google users | commit: 65ee3798
- fix(auth): force full reload after legal consent to guarantee tour fires | commit: 663bc750

### Maintenance
- chore(canvas): fix FLOW_LAYERS RC direction, add missing modules, fix API groups | commit: 9933dbb2
- chore(release): bump version 3.4.0 / versionCode 33 | commit: 2d655630

---


## [3.3.9] — 2026-05-31 | versionCode: 32 | Stage: Closed Testing

### Fix
- fix(account): remove dropped alias table ref and silence RC 404 on delete | commit: bd632584
- fix(mobile): enforce RevenueCat logIn before purchase to prevent anonymous IDs | commit: 338f1974
- fix(db): add extensions to search_path in init_free_user to resolve digest() | commit: 00134334
- fix(mobile): use identityCheckFailed message on RC logIn error; add migration 048 verify check | commit: fc68337d
- fix(mobile): use native bottom inset instead of buggy env() for chat drawer padding | commit: 7bfebfbb
- fix(mobile): unify legal consent backdrop to use --rn-safe-area-inset-bottom | commit: 53203024
- fix(chats): resolve infinite loading bugs for heavy accounts and chinese unicode | commit: afb67bb4
- fix(web): remove unused sessionIds variable left after .in() removal | commit: 0c6e260f
- fix(tour): trigger onboarding tour for auto-filled and google users | commit: 2b70a28a
- fix(tour): guard against re-trigger on concurrent account-refresh events | commit: 922dfe8a

### Maintenance
- chore(release): bump version 3.3.9 / versionCode 32 | commit: 1410e8d7

---


## [3.3.8] — 2026-05-31 | versionCode: 31 | Stage: Closed Testing

### Fix
- fix(auth): auto-populate display_name for Google OAuth users | commit: 103c8e35
- fix(mobile+web): prevent cross-user SQLite contamination and silence Sentry noise | commit: 8c64658a
- fix(mobile/security): hermetic SQLite isolation — no cross-user data leaks | commit: 0120c50c
- fix(security/billing): block free trial re-grant after account delete+re-register | commit: 12790935
- fix(payments): resolve RevenueCat anonymous purchases automatically | commit: a42ab0c1
- fix(mobile): add react-native-purchases Expo plugin | commit: 214c0fed
- fix(mobile): safe area for PackPickerModal and chat drawer list | commit: ad36c3d5
- fix(security): block free trial re-grant after delete+re-register, fix anonymize crash, fix legal double-prompt | commit: b5199b49
- fix: revert migration 048 to no-op — trial email guard already in 046 | commit: 2294ef58
- fix(mobile): remove invalid react-native-purchases config plugin entry | commit: 890143cc

### Maintenance
- chore: remove migration 048 — free trial guard already complete in 046 | commit: 9d463379
- chore(db): add migration verification script | commit: 4adbca17
- chore(release): bump version 3.3.8 / versionCode 31 | commit: 88b72645

---


## [3.3.7] — 2026-05-31 | versionCode: 30 | Stage: Closed Testing

### Fix
- fix(changelog): remove --all flag, fix window ordering, correct stage threshold | commit: fb0cdd14
- fix(billing+mobile+drawer): three independent bug fixes | commit: 86fabf36
- fix(db): allow intentional tier downgrades in grant_tokens (corrects 043) | commit: 0b14e697
- fix(mobile/cache): evict stale SQLite chats when server confirms empty account | commit: 102ceec8
- fix(mobile+web): clear stale sidebar chats when SQLite confirms empty account | commit: 5a9b141a
- fix(mobile/billing): configure RevenueCat with stored UID on cold start | commit: 7b433a40

### Docs
- docs(claude): mark CI actions upgrade as done (v6, 2026-05-31) | commit: 1f760951

### Maintenance
- chore(ci): upgrade actions/checkout and setup-node to v6 | commit: 2cb197c7
- chore(mobile): bump version 3.3.7 / versionCode 30 | commit: 5e987365

---


## [3.3.6] — 2026-05-31 | versionCode: 29 | Stage: Closed Testing

### Fix
- fix(mobile): chat drawer list respects Android bottom nav safe area | commit: 2864db83

### Maintenance
- chore(mobile): bump version 3.3.6 / versionCode 29 | commit: 392a717d

---


## [3.3.5] — 2026-05-31 | versionCode: 28 | Stage: Closed Testing

### Fix
- fix(billing+chats): tokens not granted after purchase; chat delete fails silently | commit: f51743b8

### Maintenance
- chore(mobile): bump version 3.3.5 / versionCode 28 | commit: 01d911ed

---


## [3.3.4] — 2026-05-30 | versionCode: 27 | Stage: Closed Testing

### Maintenance
- chore(assets): resize pack icons to 512x512 — reduce AAB size | commit: b56447fa
- chore(mobile): bump version 3.3.4 / versionCode 27 | commit: 1717b0ee

---


## [3.3.3] — 2026-05-30 | versionCode: 26 | Stage: Closed Testing

### New
- feat(feedback): replace native <select> with themed custom dropdown | commit: 137d776b
- feat(billing): replace Alert.alert pack picker with visual modal cards | commit: 9e4d8dd9

### Fix
- fix(changelog): insert new release at top instead of appending at bottom | commit: 19b95651
- fix(feedback): add explicit text color to custom select rows for both themes | commit: 883f4b66

### Docs
- docs(changelog): fix 3.3.2 entry order — move to top (newest first) | commit: 0eb7dc80

### Maintenance
- chore(mobile): bump version 3.3.3 / versionCode 26 | commit: 66dbca5a

---


## [3.3.2] — 2026-05-30 | versionCode: 25 | Stage: Closed Testing

### New
- feat(faq): convert delete-account doc to FAQs + add delete-chats FAQ | commit: d0485783
- feat(consult-panel): add Tutorial label before info icon in header button | commit: 7197db96
- feat(danger-zone): style delete-account btn to match other action buttons | commit: 9bb750cd
- feat(feedback): add user feedback page with Supabase storage and rate limiting | commit: 96d2da8d
- feat(i18n): move theme toggle labels to @iching-oracle/i18n | commit: c5f155fd
- feat(i18n): stage 1 — audit CI and migrate home UI copy to package | commit: 6a14b38a
- feat(i18n): stage 2 — complete token-panel and two-factor locale records | commit: e49a3956
- feat(i18n): stage 3 — wire PDF export and 2FA email to app locale | commit: 0d7cd408
- feat(i18n): stage 4 — SEO hreflang, backend locale fallbacks, and context theme | commit: 573045da
- feat(i18n): localize app shell title and consult API error messages | commit: 7f8a2a95
- feat(billing): implement native Google Play Billing via RevenueCat | commit: 02ee2883

### Fix
- fix(options-panel): remove delete-account doc link + rename to Danger zone | commit: 4e7b20fc
- fix(faq): remove long-press and em dashes from delete-chats/delete-account answers | commit: bc5d2023
- fix(i18n): use DEFAULT_LOCALE in credits exhausted fallback | commit: 30ab092f
- fix(feedback): detect WebView platform and native app version | commit: 8efd492c
- fix(changelog): correct EAS build command in pre-release checklist | commit: 83e068b7
- fix(webview): suppress GPU compositing glitches on scroll in Android WebView | commit: 0dfe0a84
- fix(db): tighten feedback RLS — drop redundant service_role policy and replace WITH CHECK (true) | commit: a4daa818
- fix(tour): scope step-8 spotlight to doc links only; remove duplicate feedback btn from FAQs | commit: 20fbf851
- fix(options-panel): restore doc links vertical layout after tour refactor | commit: 5b0c9a68
- fix(prompt): name active translator explicitly — prevent cross-translator bleed | commit: 8059bb44
- fix(prompt): scope translator rule to current reading — permit historical arc references | commit: 2cce4776
- fix(prompt): scope translator rule to current reading — permit historical arc references | commit: a14a340a
- fix(prompt): add explicit SELECTED_TRANSLATOR metadata field before BIBLIOTECA | commit: 980574bd

### Docs
- docs(i18n): add language expansion guide for development agents | commit: 93f782c9
- docs(i18n): add language expansion guide for development agents | commit: 1023a55c
- docs(readme): align language count with 11 supported locales | commit: 3b288708
- docs(i18n): align workflow guides with post-standardization state | commit: 841581ba
- docs(changelog): generate full project changelog and add update script | commit: 1e899f17

### Maintenance
- chore(docs): organize .md files into docs/ with categories | commit: 4f0597a1
- chore(i18n): stage 5 — update expansion guide and remove dead chat-suggestions | commit: 9f5fc8b1
- chore(agents): refresh learned preferences after i18n standardization | commit: 957e277b
- chore: trigger redeploy — update Axiom env vars | commit: 5d5ba784
- chore(i18n): replace dialectical/dialéctico with unified interpretation across all 11 locales | commit: 20621332
- chore(mobile): bump version 3.3.2 / versionCode 25 | commit: 99d49937

---


## [3.3.1] — 2026-05-29 | versionCode: 24 | Stage: Closed Testing

### New
- feat(onboarding): add react-joyride tour with 7 steps in 11 languages | commit: 65a8dce4
- feat(onboarding): fix tour trigger + add custom styled tooltip | commit: baf1fa7c
- feat(onboarding): add Nueva Sesión step (step 2) to tour | commit: 169c98c3
- feat(claude): implement cache diagnostics (cache-diagnosis-2026-04-07) | commit: 51e1e338
- feat(onboarding): replace ? text with compass SVG icon on tutorial replay button | commit: dfd89dd6
- feat(onboarding): add info SVG icon to Tutorial button | commit: fe91bd4a
- feat(onboarding): dark mode spotlight fix + docs/FAQs step (9 steps total) | commit: 49ae6fc1
- feat: password visibility toggle + logout confirmation dialog | commit: b7581307

### Fix
- fix(security): harden WebView security settings in Android shell | commit: 9885963a
- fix(prompt): enforce thread continuity in opening paragraph for all I Ching modes | commit: e7649d19
- fix(prompt): expand Oracle Bones word budget when thread context exists | commit: 4a211eec
- fix(prompt): enforce full session arc in thread references and SNAPSHOT | commit: 410970a1
- fix(api): raise maxDuration and MAX_TOKENS for Master deep threads | commit: 75d13cb8
- fix(api): raise maxDuration and MAX_TOKENS for Master deep threads | commit: b75075b7
- fix(output): strip CATEGORY line even when model prefixes with ## heading | commit: 7112366c
- fix(mobile): skip parallel Supabase API call in RN thread loading | commit: 9bb3abc1
- fix(api): distinguish DB errors from session-not-found in chats GET | commit: 4d960524
- fix(db): raise statement_timeout for PostgREST roles to 30s | commit: 4f761e79
- fix(library): allow admin to bypass free-tier gate on library button | commit: 2af1a278
- fix(rate-limit): fail-closed when Upstash credentials are invalid/rotated | commit: 3436e8fc
- fix(onboarding): scroll panel to target before each inner step | commit: 0effd268
- fix(onboarding): fix step 5 target and race condition on panel steps | commit: cc71917f
- fix(header): anchor logo to center + replace compass with Tutorial pill button | commit: e694725f
- fix(onboarding): align Tutorial button + green tint + shorten label | commit: c46ee0c6
- fix(ci): sync package-lock.json with react-joyride and its dependencies | commit: c1736abd
- fix(onboarding): mobile APK tour fixes | commit: 2d15e8c1
- fix(onboarding): dark mode overlay — low opacity + SVG spotlight stroke | commit: 76e8d780
- fix(onboarding): instant scroll + correct placement for panel steps | commit: e5cc9535
- fix(header): move info icon between Chats and logo | commit: fa9ca989
- fix(header): move tour-info icon into consult panel header | commit: 7141d594
- fix(consult-panel): match info btn shape to Cerrar, keep green colors | commit: 5de6e753
- fix(login): vertically center eye toggle button in password field | commit: 13b807f0
- fix(login): fix eye icon vertical centering via display:flex on wrapper | commit: b73ef1fc
- fix(login): use CSS Grid overlay for eye icon — guaranteed vertical center | commit: 7c0eaed5
- fix(login): CSS class approach for eye icon — block input + top:50% transform | commit: 43eb4042
- fix(login): inline styles only for eye toggle — bypasses CSS cache | commit: 50fbf7fd
- fix(login): fix eye icon — margin:0 resets global button{margin-top:0.75rem} | commit: 9332444d

### Security
- security: remediate pentest findings H1–H5 | commit: 3d773abc

### Docs
- docs(claude): correct token counts and warn against changing pack IDs | commit: b348101a
- docs: update README, architecture audit, and DB setup guide | commit: febd5fef
- docs(migrations): expand 040 comment with full historical context | commit: 36535127

### Maintenance
- chore(db): migration 037 — grant is_admin to app owner account | commit: dafd1a4d
- chore: remove dead code revenuecat-alias-map + rollback migration | commit: 1ba4b941
- chore(mobile): bump version 3.3.1 / versionCode 24 | commit: 1a5c4245

---


## [3.3.0] — 2026-05-25 | versionCode: 23 | Stage: Closed Testing

### Fix
- fix(csp): add base-uri, form-action, object-src directives | commit: 4abd651e
- fix(security): route ritual debug logs through Axiom instead of console | commit: fd96d69a

### Maintenance
- chore(mobile): bump version to 3.3.0 (versionCode 23) | commit: fbdeaefa

---


## [3.2.9] — 2026-05-24 | versionCode: 22 | Stage: Closed Testing

### New
- feat(web): IndexedDB cache for chat list and thread content | commit: a80e49f6
- feat(legal): add support@theoriginaliching.com contact link in Terms section 10 | commit: a4ad475f
- feat(mobile): redesign offline screen v2 — brand logo, fix transparent bleed-through | commit: 9e93778b
- feat(mobile): offline screen full-bleed image layout — text overlaid on bottom band | commit: 357c3110

### Fix
- fix(seo): canonical tags, hreflang, sitemap update — resolve Search Console indexing issues | commit: 98decea8
- fix(seo): remove /library from sitemap and disallow crawling — premium content | commit: a5414969
- fix(seo): fix pricing layout type error — async function for Next.js 15 React types compat | commit: 9af2867b
- fix(prompt): enforce second-person address — prevent third-person narration when displayName is set | commit: 0e41a350

### Maintenance
- chore(mobile): bump version to 3.2.9 (versionCode 22) | commit: cb8ea882

---


## [3.2.8] — 2026-05-21 | versionCode: 21 | Stage: Internal Testing

### New
- feat(mobile): custom offline screen with animated radar when WebView fails | commit: afaa88fa
- feat(mobile): simplify offline screen — Signal Lost / The oracle is waiting | commit: 93ca2a3c

### Maintenance
- chore(mobile): bump version to 3.2.8 (versionCode 21) | commit: cbfd016c

---


## [3.2.7] — 2026-05-21 | versionCode: 20 | Stage: Internal Testing

### Fix
- fix(mobile): remove READ_MEDIA_IMAGES/VIDEO permissions + bump to 3.2.7 (versionCode 20) | commit: e3086c3d

### Maintenance
- chore(mobile): sync package.json version to 3.2.6 | commit: be2444cb

---


## [3.2.6] — 2026-05-21 | versionCode: 19 | Stage: Internal Testing

### New
- feat: implement full account deletion flow for Google Play compliance | commit: d239b5b4
- feat(i18n): full localization of account deletion flow | commit: 76477c4d
- feat: merge account deletion flow into staging | commit: 4bfe2de4
- feat: merge staging → main (account deletion flow) | commit: e56db2e1
- feat(mobile/db): add expo-sqlite schema and chat-store for local cache | commit: 9da23ec6
- feat(mobile/sync): background sync service and opportunistic image cache | commit: b61ba48e
- feat(mobile): integrate SQLite sync and cached-chats injection into WebView shell | commit: 486eb42e
- feat(web): consume rn:cached-chats event from native SQLite injection | commit: 401673d8
- feat(mobile): implement SQLite stale-while-revalidate cache for chat list | commit: 84f3050e
- feat(cache): offline-first conversation cache — WhatsApp model | commit: 4aae78b8

### Fix
- fix(pdf): word-boundary wrapping + readable mutation rule label | commit: dba31979
- fix(pdf): justified canvas text + summary matches app reading card | commit: 9451e705
- fix(i18n): delete-account page — locale-specific confirm word, corrected provider/email copy | commit: 3aa21b96
- fix(i18n): sync delete-account page corrections from main | commit: 1709e79d
- fix(images): retry overlay+watermark on local fallback when R2 fetch fails silently | commit: 2a5a9d92
- fix(bones): remove Silence verdict — no archaeological basis in Shang tradition | commit: f462f438
- fix(webview): block accidental navigation to production domain in staging APK | commit: 90b26488
- fix(webview): generalize cross-origin guard to all environments | commit: 2fbeabad
- fix(bones): remove Silence verdict — no archaeological basis in Shang tradition | commit: a1a8e3a9
- fix(ci): update package-lock.json with expo-sqlite@14.0.4 | commit: 621032c5
- fix(mobile): re-export initDb from chat-store — fixes crash on mount | commit: 1654e45b
- fix(mobile): replace deprecated moduleResolution=node with bundler | commit: 4ce987de
- fix(mobile): eliminate slide-up animation when cached thread data arrives | commit: 79ec8abd
- fix(mobile): defer loading indicator so SQLite cache eliminates brief flash | commit: 5c1a3bb0
- fix(cache): sync SQLite on chat delete and account deletion | commit: bc7e23c1

### Docs
- docs(legal): add permanent account deletion section to Privacy Policy and Terms | commit: 6bd2d308
- docs: add DIVINATION_METHODS_AUDIT.md — technical reference for all oracle methods | commit: 60115a66
- docs(claude): document Windows glob fix for expo prebuild and mobile cache feature | commit: 0c58c7eb
- docs: rewrite ARCHITECTURE_AUDIT.md — complete A-to-Z architecture reference | commit: 3b5fe41e

### Maintenance
- test(images): FORCE_TOGETHER_FAIL env flag to bypass Together AI for fallback testing | commit: 5983171b
- revert(images): remove FORCE_TOGETHER_FAIL test flag, restore normal Together AI flow | commit: 2fe41237
- merge(staging): local storage SQLite, WebView cross-origin guard, silence removal | commit: dc5c6e9e
- merge(main): local storage SQLite, WebView cross-origin guard, silence removal | commit: 70cdabff
- chore: ignore keystore backups and temp sim scripts | commit: c2f08283
- refactor(cache): 3-tier local-first architecture — lazy per-chat sync | commit: 58b56c42
- chore(mobile): bump version to 3.2.6 (versionCode 19) | commit: 9d418be3

---


## [3.2.5] — 2026-05-18 | versionCode: 18 | Stage: Internal Testing

### Maintenance
- chore(mobile): bump version 3.2.5 / versionCode 18 | commit: 12ac967d

---


## [3.2.4] — 2026-05-18 | versionCode: 17 | Stage: Internal Testing

### Fix
- fix(eas): suppress Expo Go warning and clean cached native dir before prebuild | commit: 64e3ef5e
- fix(eas): add root .easignore so apps/mobile/.env reaches Metro bundler + bump 3.2.3/16 | commit: 79f61da4
- fix(mobile): handle PKCE auth/callback deep link so Google OAuth returns to app | commit: a7bd1290

### Maintenance
- chore(mobile): link EAS project to alexcat84, switch to local keystore credentials | commit: b93e4adb
- chore(mobile): bump version 3.2.4 / versionCode 17 | commit: e15e42e0

---


## [3.2.2] — 2026-05-18 | versionCode: 15 | Stage: Internal Testing

### Fix
- fix: strip orphaned [SNAPSHOT_END], PDF saves to Downloads with permission + bump 3.2.2/versionCode 15 | commit: 2bd1de5b

---


## [3.2.1] — 2026-05-18 | versionCode: 14 | Stage: Internal Testing

### Fix
- fix(mobile): respect native dialog confirmation before removing chat + bump 3.2.1/versionCode 14 | commit: 6afead0a

### Maintenance
- chore(mobile): bump versionCode to 13 for production Play Store AAB | commit: e6fe0896

---


## [3.2.0] — 2026-05-17 | versionCode: 12 | Stage: Internal Testing

### New
- feat(i18n): add library unlock and translator label to Seeker pack description | commit: 61744a37

### Fix
- fix(ci): commit package-lock.json with next-axiom entry | commit: 5903471a
- fix(i18n): align pack descriptions in all 10 languages with Spanish source of truth | commit: 61e3878e
- fix(i18n): ES as single source of truth — FAQ, pack descriptions, credits notices | commit: 1e01de30
- fix(hydration): eliminate React #418 caused by localStorage read in useState initializer | commit: 42c3daa3

### Maintenance
- chore(mobile): add .easignore to exclude android dir from EAS archive | commit: 1da3622c
- chore(mobile): add staging-aab build profile for Play Store submission testing | commit: c77c3b09
- chore(mobile): bump version to 3.2.0 / versionCode 12 for production Play Store AAB | commit: a7126759

---


## [3.1.8] — 2026-05-17 | versionCode: 11 | Stage: Internal Testing

### New
- feat(i18n): translate guide/FAQ sections for all 11 locales + remove Zhou Yi inline translation | commit: c4170496
- feat(r2-fallback): hexagram-specific fallback image generator (2,760 WebP) | commit: 8c457c9c
- feat(r2-fallback): integrate Cloudflare R2 as primary image fallback | commit: 9761b5d3
- feat(logging): structured Axiom logging across Next.js web app | commit: 43626514

### Fix
- fix(android): always use light color-scheme on inputs + add forceDarkAllowed=false plugin | commit: 90431b40
- fix(android): disable spellcheck/autocorrect on chat textarea | commit: 6ddcfe28
- fix(android): remove forceDarkOn prop to prevent crash on Android 11 | commit: 8ceb9b4d
- fix(build): resolve all Sentry deprecation and Turbo env-var warnings | commit: 782b58db

### Maintenance
- revert: restore spellCheck on chat textarea | commit: d24591b7
- chore(mobile): bump version to 3.1.8 (versionCode 11) | commit: 2237ae91

---


## [3.1.7] — 2026-05-16 | versionCode: 10 | Stage: Internal Testing

### New
- feat: update seeker tokens 20→25 and practitioner tokens 40→50 | commit: 4deee43e
- feat(yarrow): implement Yarrow Stalks casting method | commit: a45f4bbf
- feat(yarrow): Block A — chip selectors, dynamic hint, em dash cleanup | commit: ef59d862
- feat(yarrow): replace chip selectors with sliding oracle toggle | commit: 5b6a1432
- feat(yarrow/B1): format-invariance instruction in buildCurrentCastPrompt | commit: 1a258e29
- feat(yarrow): compact wizard layout and stalks dividing animation (Block C) | commit: 90f8f530
- feat(i18n+tests): Block D — full i18n for yarrow wizard and unit tests | commit: dc9d59fd
- feat(docs): Block E — Yarrow Stalks section in user guide (all 11 locales) | commit: 546aa6e6
- feat(i18n): Block F — FAQ yarrow vs coins, notes yarrow section, wizard warning | commit: e4e80a26
- feat(docs): reorganize /faqs into categories and /guia by practical sections | commit: c6f9b5d0
- feat(wizard): G+H — step-by-step yarrow wizard redesign and em dash cleanup | commit: 7437a792
- feat(wizard): add physical-coins intro screen to coin wizard | commit: 24e297a3
- feat(library): add I Ching hexagram library with Wilhelm/Legge/Zhou Yi datasets (PR1) | commit: 8063006d
- feat(web): Move library access to dedicated drawer section | commit: 3e424941
- feat(web): Disable library link for free tier users | commit: b6766131
- feat: integrate premium library access messaging across locales | commit: c34e8782
- feat(library & anthropic): implement premium library i18n texts and Anthropic API prompt caching | commit: 60df9a48
- feat(ui): bottom doc-nav in all doc pages, fix dark-mode webkit-text-fill, maxLength=1500 on chat textarea | commit: 1e518c67
- feat: Etapa 1 - Soporte para selección de traductores (Wilhelm, Legge, Zhou Yi, Master) en frontend y backend | commit: 5d0e781f
- feat: Etapa 2 - Integración de múltiples traducciones simultáneas en prompt (Master Synthesis) | commit: a5c50276
- feat: complete multi-translator documentation and UI polishing | commit: 1f4f23cf
- feat: align master (3) UI toggle styling and update pack features/FAQ across all 11 locales | commit: 669721c7
- feat: implementar bloqueo UI Master mode y actualizar escalera de valores | commit: feccedb7
- feat: tooltip flotante en Master (3) y nombres reales en seccion docs de la guia | commit: 0dc5eba9
- feat(hardening): F2-F3 implement resilience, backoff, observability and decoupled stream | commit: c7cc2d31
- feat(oracle-bones): add identifier card and standardize summary layout | commit: dfbadb9e
- feat(translator): persist translator field in DB and wire through full chain | commit: 083689b7
- feat(prompt-cache): stabilize system block for real cache hits | commit: ffc0b297

### Fix
- fix(chat): stale-while-revalidate — skip spinner on back-navigation | commit: ef4ffe58
- fix(chat): instant scroll on mount to eliminate back-navigation slide | commit: c4213153
- fix(prompt): enforce italic-only for hexagram text quotes, never bold | commit: a6683d5d
- fix(fonts): cobertura latin-ext en webfonts y body para pinyin | commit: 3c89b980
- fix(consult): centra el thumb del oracle-toggle dentro del track engrosado | commit: f21518be
- fix(library): serialize i18n function fields before passing to client components | commit: 872f17b5
- fix(library): search scoring, yong-line fix, table layout for lines | commit: 89f84251
- fix(library): strict numeric search, better table row spacing | commit: 07c94d60
- fix(library): visible yin/yang line gap, wider symbol column | commit: 0c803743
- fix(library): equal-width yin/yang line symbols, bolder stroke | commit: 2d330140
- fix(library): halved line width, equal yin halves | commit: d40df183
- Fix: restored missing button closing tag in composer | commit: 89124a06
- Fix: Unclosed CSS block in globals.css after text alignment cleanup | commit: 0e81c8ad
- Fix: Corregir error de sintaxis en About page (tag duplicado) | commit: 4e680182
- Fix: Eliminar importaciones y funciones no utilizadas tras refactor de TrigramPicker | commit: 62436865
- Fix: Eliminar import isTrigramId no utilizado | commit: 75e3ce62
- fix(ui): blindaje de selector de traductor y variables Sentry en turbo.json | commit: f53235b7
- fix: ajustar dirección del tooltip de Master (3) hacia abajo para evitar recortes de overflow y limpieza de scripts | commit: 63bba47b
- fix: permitir visibilidad del tooltip Master (3) mediante overflow: visible !important | commit: 2d164f46
- fix: bloqueo de tier con jerarquia ordinal en handleTranslatorChange + overflow visible en tooltip | commit: 0e7172d9
- fix: tiers array con indexOf en handleTranslatorChange, overflow visible en track padre, reset loading en nueva sesion | commit: 59a201e8
- fix: enforce tier ladder, session isolation, and master mode activation | commit: 319e0de4
- fix: harden master consult flow and improve cache observability | commit: f656bc3a
- fix: improve library framing and raise consult input limits | commit: 778ad624
- fix: diversify together image prompts for both oracle modes | commit: a213b48a
- fix: align master prompt triangulation and tooltip i18n | commit: ccafedb9
- fix: strengthen master outputs and isolate thread context | commit: bde4fb6c
- fix: restore thread memory quality and prevent repeated fallback outputs | commit: 9a1caab3
- fix: prioritize personal thread memory in oracle summaries | commit: 8f11606f
- fix: keep flux2 model with docs-safe sizing and no fake time cues | commit: 71052d9e
- fix: raise tier resolutions with 4MP-safe Together sizing | commit: c9914adf
- fix: cap together tier output to <=1mp for cost control | commit: 4a886051
- fix: restore tier resolutions, FLUX.2-dev steps 30, SNAPSHOT leak filter, tooltip reposition + i18n | commit: 6a345934
- fix: restore tier resolutions, FLUX.2-dev steps 30, SNAPSHOT leak filter, tooltip reposition + i18n | commit: 6d878ec8
- fix: repair interpretation stripping regex, image diversity, and Master cost badge | commit: dafc846f
- fix: blockquote format for Lines in motion, oracle bones seed diversity, Together AI timeout | commit: 8b5b4199
- fix: real image diversity — rotating elements and environment for all categories | commit: 15dd7e39
- fix: Together AI reliability — steps, timeout, remove undocumented response_format | commit: 2d741cde
- fix: switch default model to FLUX.1-schnell at 12 steps for timing reliability | commit: 95d7c9a4
- fix: language override — detect Italian/PT wrong-language responses, strengthen instruction | commit: cf43f6dc
- fix: language detection hierarchy — question language > selector > ignore context | commit: 419a642e
- fix: generalize language instruction — remove hardcoded language examples | commit: ed46f1d7
- fix(i18n): update docs to reflect 3 translators and oracle-native Bones language | commit: 2acf32d7
- fix(image): remove negative_prompt for FLUX.1-schnell, add overlay on fallback, remove bamboo/cultural contamination triggers | commit: d5ce08ee
- fix(i18n): redirect all token/billing FAQ items to Token Center across 11 languages | commit: 204ef9fc
- fix(claude): build error in oracle-bones-interpretation and unused variable | commit: 4cd57206
- fix(web): use Promise for route params in Next.js 15 | commit: 5b3660dc
- fix(web): remove unused getTokenBalance import | commit: 2d378259
- fix(web): resolve getHexagram param mismatch and unused request var | commit: 0cede36a
- fix(scale-hardening): audit corrections — sentry node pkg, oracle-bones retry, withSentryConfig, env.ts import, static hexagram params | commit: da10756e
- fix(interpretation): suppress system messages from user-facing response and enforce blockquote formatting | commit: 60ecbb5f
- fix(test-image-pipe): composite pipeline completo — auto-load .env, resvg render, sharp composite | commit: 0f102e9f
- fix(fallback-image): apply hexagram overlay to prebuilt local fallback images | commit: 6b49380f
- fix(test-image-pipe): production-identical overlay — Chinese chars, centered hexagram bars, auto-open | commit: 56bc13d1
- fix(session-depth): scope thread depth limit per oracle type; fix changing-line blockquote rule | commit: f477e8f6
- fix(db): drop legacy single-param consume_token left by migration 032 | commit: 8b7f1732
- fix(session-depth): always verify session in DB regardless of isDeepening flag | commit: 8d6f5e79
- fix(oracle-bones): full thread history, no heading, clean card | commit: ca9a910e
- fix(dark-mode): increase chat bubble border contrast | commit: 263905d4
- fix(dark-mode): visible borders on consultation-record card and dividers | commit: bd3322e6
- fix: blockquote rule, shared thread history, translator field in card | commit: a2126b28
- fix(session-store): cascade fallback for missing translator column + FAQ token-center i18n | commit: b5ae30d1
- fix(apk): defer chat delete until native dialog confirmed; clean oracle bones card | commit: dbfeebe6
- fix(oracle-bones): add dividers after verdict header and before both section headings | commit: e66603e7
- fix(oracle-bones): overlay verdict glyph on prebuilt fallback when Together fails | commit: 5a43950d
- fix(locale-picker): add no-theme CSS fallback to prevent unstyled trigger on first load | commit: f06d4bc0
- fix(locale-picker): add no-theme fallback to dropdown menu styles | commit: 8e92504f
- fix(apk+zhouyi): preserve Chinese verbatim in blockquotes; disable WebView force dark | commit: 983cea22
- fix(translators): enforce universal source fidelity across all three libraries | commit: a32fd36e

### i18n
- i18n(yarrow): shorten toggle section labels across all locales | commit: fd3512bc
- merge(staging): feature/yarrow-stalks — yarrow wizard + docs + i18n | commit: 5ce91d4e
- merge(main): staging — yarrow wizard + docs + i18n | commit: e43e100a
- Remove AI references from Zhou Yi classical notice across all 11 locales | commit: 69c30e82
- Remove Zhou Yi classical notice entirely from UI and i18n | commit: 59ee9386
- UI: Eliminación quirúrgica definitiva del texto de profundidad del hilo y limpieza total de i18n asociado en las 11 locales | commit: 8f3bf7ca
- Refinamiento de UI de traductores, corrección de locales y color premium | commit: 520e7d8b
- merge(staging→main): oracle bones card, translator field, dark-mode borders, cache fallback, FAQ i18n | commit: d60e8224

### Docs
- docs(ci): document Node.js 20 action upgrade deadline (2 Jun 2026) | commit: fe5fa2bc
- docs(i18n): add Oracle Bones FAQ, drop probability internals, reorder /notes | commit: 355f8642
- docs(notes/faq): grid de los 64 hexagramas, FAQ de mecanismo del I Ching y 5 estados Huesos | commit: ae385b19
- docs: refinamiento del tono a Maestría Silenciosa y actualización de Pilares de Sabiduría | commit: 737354e1
- docs: reestructuración final del manual funcional y maestría premium | commit: e7a15f93

### Maintenance
- chore(mobile): exclude react-native-screens and @sentry from expo doctor check | commit: 29d56071
- refactor(i18n+ui): remove em dashes from all user-facing strings | commit: fb8b4ef5
- refactor(i18n+docs): consolidate duplicate content — single source of truth | commit: 10597d3e
- chore(ci): fix failing CI — update lockfile and bump Node to 22 | commit: d0c24a40
- chore(ci): pin npm@11.5.1 in CI to match lockfile generator | commit: 5c00e904
- chore(ci): install rollup Linux binary after npm ci | commit: b38c4953
- chore(ci): disable corepack and revert packageManager field | commit: 4ce30093
- chore(ci): remove packageManager field to fix yarn registry detection | commit: a53e4c6b
- chore(ci): restore packageManager and pin yarn@1.22.19 | commit: 226a771f
- style(notes): agranda los hexagramas y reordena tarjeta del grid | commit: 89287b19
- style(consult): sweep en switch I Ching/Huesos y borde más marcado en toggles claro | commit: 4b35395b
- style(consult): borde 2px en oracle-toggle-track para igualar switch I Ching/Huesos | commit: 7190d105
- style(consult): unifica tipografía de labels del panel y refuerza CONSULTAR | commit: 7f61085f
- merge(main): staging — pinyin font fix + consult panel polish | commit: b6102929
- Replace Unicode line symbols with CSS-drawn glyphs for pixel-perfect alignment | commit: 05cf64a3
- Center line glyphs vertically in table cells | commit: 3272aa8b
- Add text-card containers for Judgment/Image and remove duplicate Lines header | commit: 13f5b65d
- refactor(web): Sever navigation links between docs and library | commit: 24be01c3
- UI: fixed dark mode selects, mobile spellcheck, and documented 1500 char limit across 11 languages | commit: 29e58d98
- UI: minimalist character counter with absolute positioning | commit: 53517f33
- UI: repositioned character counter inside visible area | commit: c3cf0511
- Adición de la librería completa de los hexagramas en los tres textos literarios | commit: c4a52214
- Adición de la librería completa de los hexagramas en los tres textos literarios | commit: 80e0e1d8
- Adición de la librería completa de los hexagramas en los tres textos literarios | commit: 9728c487
- Fix syntax error in globals.css for library tabs | commit: 5749ba88
- Refactor library header layout and optimize tabs for mobile | commit: fa4ad1af
- Restore text justification for docs and library prose, keeping start alignment for stanzas | commit: 92dd52d3
- Restore justify alignment for chat interpretation markdown elements | commit: 5a803ecf
- Redesign library tabs to professional segmented style and justify line descriptions | commit: b0eeaa6f
- Change library tabs to classic folder style | commit: 23ad086a
- Fix incorrect lower trigram label for Hexagram 23 (Mountain over Earth) | commit: 07a61321
- Fix source metadata for Hexagram 23 (Mountain over Earth) in Wilhelm translation | commit: 617a1448
- Documentación de auditoría de integridad de datos y actualización de FAQ multi-idioma | commit: 1b04f40d
- Corrección estructural de FAQ y finalización de internacionalización de auditoría | commit: 29712fd8
- Adición de control de cambios al documento de integridad de datos | commit: 319509ab
- Actualización de auditor oficial en el log de integridad | commit: b961e1b8
- Auditoria de integridad completada y actualizacion de fuentes academicas (Parma, Sacred-Texts, CTP) | commit: 822fd939
- chore: remove temporary audit scripts | commit: 83c9ae72
- Estandarización bibliográfica completa y corrección de paridad técnica en Biblioteca de Hexagramas | commit: 8810ac19
- Sincronización de contenido español en Notas y Origen de Métodos | commit: fd1ce52a
- Estandarización de localización: Migración de español de España a español latino neutro en FAQ y 2FA | commit: cd412b8b
- Refinamiento de UI: Estilización de fuentes académicas y simplificación de navegación en About | commit: 166dc335
- Mejora de UX: Implementación de Web Share API para exportación de PDF e imágenes en móviles | commit: d9d7b3eb
- Revert: Restaurar lógica de descarga original para interceptación del puente nativo | commit: c5d8a286
- Mejora nativa: Implementación de Storage Access Framework (SAF) para descarga de PDF en Android | commit: 8c265b9a
- UI: Eliminaci\u00F3n de textos de ayuda en el composer para ganar espacio vertical | commit: c5593862
- Revert "UI: Eliminaci\u00F3n de textos de ayuda en el composer para ganar espacio vertical" | commit: a9e1548c
- UI: Eliminar texto descriptivo del selector de modo (modeIChingHint/modeBonesHint) para liberar espacio en panel de consulta | commit: 0f426b8b
- UI: Eliminar texto 'Plan X · este hilo admite hasta N lectura(s)' del panel de consulta para liberar espacio | commit: f196988e
- Fix build: eliminar page_old.tsx corrupto + UI cambios quirurgicos (caption selector modo + plan suffix) en los 11 idiomas | commit: c9912aeb
- UI: Remarcado de divisiones en pestañas de traducción de la biblioteca (soporte claro/oscuro) | commit: d38fed2e
- UI: Eliminar contador de caracteres del composer para evitar solapamientos | commit: 475db539
- UI: Sustituir selectores nativos por TrigramPicker premium en la biblioteca | commit: 24ff0b88
- style: Afinar selector de traductor usando la variante de 4 opciones del pill animado | commit: 3fc8be03
- merge(feat/scale-hardening): image fallback overlay, blockquote formatting, oracle bones thread memory | commit: 9466d1ac
- revert(session-depth): restore shared thread depth limit across oracle types | commit: b36b90b8
- chore(mobile): bump version to 3.1.7 / versionCode 10 | commit: b6b8042a

---


## [3.1.6] — 2026-05-07 | versionCode: 9 | Stage: Internal Testing

### New
- feat(iching): manual three-coin cast mode with preview and API validation | commit: d1165516
- feat(web): Kangxi cash coins + instant dual-hex ritual for manual I Ching | commit: 8cc10537
- feat(web): compact manual coin wizard; add expo export test artifacts | commit: c1847b8e
- feat(iching): equilibrar tiempos del ritual en modo manual | commit: 3dff5f57
- feat(images): más diversidad de composición sin reintroducir triggers de glifos | commit: 795efe21
- feat(images): clean-plate positive line + trim prompts for FLUX 2000 budget | commit: b519ba1c
- feat(images): diversify light/water/forest vs moon-mist; rebalance category themes | commit: 2cbe6712

### Fix
- fix(bones): degradar ritual a fallback 2D si WebGL no está disponible | commit: 1e65f6dd
- fix(bones): primer frame WebGL oculto, sin getContext redundante, teardown y webglcontextlost | commit: bfa141d5
- fix(web): restore bone ritual rendering to match staging | commit: 488fb618
- fix(web): legible Kangxi cash coin + bronze rim + i18n copy | commit: 0e8d04f7
- fix(web): manual cast UX, chat width, image negative-prompt order | commit: abe9bfac
- fix(web): restore browser chat column and bubble text widths | commit: e47cefe2
- fix(web): manual coin SVG, wizard jump-to-step, Together negative_prompt | commit: 856e1da4
- fix: restore main anti-corner prompt copy, Together 1500 cap, coin rim in SVG | commit: 43da53d4
- fix(image): I Ching FLUX prompt aligned with bones; wizard progress UI | commit: 0c1e5774
- fix(images): restore landscape-first I Ching prompts for Together FLUX | commit: f7bd2093
- fix(images): mitigar sellos FLUX y documentar pipeline de prompts | commit: 1eba1250
- fix(images): sesgo ilustrativo fantasy y fusión .env en script de muestras | commit: 077f7cef
- fix(iching): finale manual acoplado al tiempo de respuesta del servidor | commit: 3a61c27b
- fix(iching): modo manual nunca pide stream_ritual por error de payload | commit: 277b683a
- fix(iching): body explícito auto vs manual; imagen con más variación | commit: d83abc1c
- fix(ritual): cap coin tick delay; tighten FLUX anti-signature negative | commit: 9b5c9742
- fix(ritual): drop stacked 900ms pause after SSE stream_ritual completes | commit: f303ceff
- fix(ritual+images): align auto tick budget ~36s; break patio-bench trope | commit: 43046696
- fix(ritual): decouple manual gating and scale reveal to wall time | commit: cd194564
- fix(ritual): set 62-38 timing with untimed finale | commit: e13e4637
- fix(ritual): hold final stage until response render | commit: d0f28f16
- fix(ritual): ensure manual finale paints before reading | commit: b7832756
- fix(ritual): split manual phase timing before response | commit: 30d41d19
- fix(ritual): tune manual phase split to 70-30 | commit: ee93f8c2
- fix(ritual): adjust manual phase split to 60-30 | commit: 601f628c
- fix(bones): normalize headings and dedupe structural verdict | commit: a4670e5e
- fix(security): harden scan signal and expose rate-limit backend health | commit: 9a52eb81
- fix(security): patch 16 HIGH CVEs via overrides; document tar build-tool risk | commit: f87bf6c8
- fix(build): add @resvg/resvg-js-linux-x64-gnu to lockfile for Vercel | commit: 7a6eecb2
- fix(build): add sharp linux-x64 binaries to lockfile for Vercel | commit: 7acdf1f7
- fix(build): pin expo-modules-autolinking in root dependencies | commit: 430e0c85

### Docs
- docs(i18n): guía y notas para tirada I Ching auto vs manual | commit: fb697462
- docs(faq): I Ching manual/auto vs huesos siempre automático y mezcla en hilo | commit: f4d0ffde
- docs(timing): clarify NEXT_PUBLIC_ICHING_* absent uses compiled defaults only | commit: 2b670bf7

### Maintenance
- chore(qa): manual ritual timing experiment — seal 22s vs finale clamp 44s | commit: e0bdb9cb
- revert(manual): restore ritual seal/finale defaults after QA timing probe | commit: 1576870b
- chore(mobile): bump version to 3.1.6 (versionCode 9) for Play Store | commit: 5644f640
- chore(mobile): bump version to 3.1.6 (versionCode 9) for Play Store | commit: 126b5421

---


## [3.1.5] — 2026-05-03 | versionCode: 8 | Stage: Internal Testing

### New
- feat: v3.1.4 - fix EAS env vars, staging build with all secrets | commit: d34d0c32
- feat(seo): add openGraph, Twitter, keywords, per-page metadata and sitemap to all public routes | commit: a4360f00
- feat(notes): expand historical content for I Ching and Oracle Bones in all 11 languages | commit: 47f0804c

### Fix
- fix: bold Veredicto estructural label in Bone Oracle response | commit: b89e2585
- fix(i18n): escape inner double quotes in zh locale notes-page-ui | commit: 6f6e2573
- fix(faqs): correct i18n bug showing FAQs in English for all locales — feat(faqs): add 5 new FAQs covering AI role, text authenticity, Silence state, languages, and privacy | commit: 5bb6b10d
- fix(android): bump react-native-screens to fix NoSuchMethodError on Android 12 — release 3.1.5 versionCode 8 | commit: b14c6f4f

---


## [3.1.3] — 2026-04-30 | versionCode: 6 | Stage: Internal Testing

### Maintenance
- chore(mobile): bump version to 3.1.3 (versionCode 6) | commit: 2d3a2443

---


## [3.1.2] — 2026-04-30 | versionCode: 5 | Stage: Internal Testing

### Fix
- fix: re-enable R8, add Sentry crash reporting and error boundary | commit: 3c279766
- fix: re-enable R8, add Sentry crash reporting and error boundary | commit: 17c83aa9
- fix(android): persist R8 keep rules via Expo config plugin | commit: 1f42ddc5

### Maintenance
- chore(mobile): bump version to 3.1.2 (versionCode 5) | commit: 46b94e31

---


## [3.1.1] — 2026-04-29 | versionCode: 4 | Stage: Internal Testing

### New
- feat(web): franja Play arriba, cierre hilo y aviso límite; i18n | commit: e7a49969
- feat(auth): mandatory legal consent on signup and OAuth | commit: 0808806e
- feat(web): i18n docs wording, legal consent flow, locale cookies, ritual UI | commit: 4e6fe8e8
- feat(auth): post-login legal gate and staging user purge script | commit: 76ddeb65
- feat(auth): configurable register rate limit and Retry-After header | commit: 68ed75c0
- feat(csp): move CSP to middleware for per-request nonce generation (Etapa 1) | commit: 17e7a536
- feat(csp): pass nonce to theme-init Script in layout (Etapa 2) | commit: 5f7da843
- feat: v3 README, hide Vercel toolbar in WebView, clean postcss override | commit: 13e9033e
- feat: add Arabic (ar) language support with RTL for web and mobile | commit: 08cadecc
- feat(i18n): complete Arabic and Hindi support across web, mobile, and backend (11 locales) | commit: 147ad577

### Fix
- fix(auth): clarify email signup errors for duplicate DB and weak password | commit: 8363a750
- fix(auth): diagnose email signup 400s (identities, mail, codes) and Turnstile cleanup | commit: ff2e3c39
- fix(auth): tighten mail-failure detection for register, use 502, log raw message | commit: b4b823fc
- fix(auth): case-insensitive email precheck and map unexpected_failure | commit: 75904357
- fix(auth): reset register rate limit bucket (v2 key) and default 15/hr | commit: de56e32e
- fix(auth): classify unexpected_failure before SMTP heuristics | commit: 02b980f0
- fix(auth): store email signup legal consent as object in user_metadata | commit: 896f3ff8
- fix(auth): align email signUp with OAuth — no user_metadata on signUp | commit: e68f2039
- fix(auth): precheck auth email RPC, orphan-safe trigger, signup diagnostics | commit: 8b50d22e
- fix(ui): hide CATEGORY line in readings, left-align copyright lines | commit: bf9afe68
- fix(claude): localize oracle-bones verdict header and I Ching structural correction for all UI locales | commit: 0190b5e9
- fix(mobile): raise Node heap and cap Metro workers for EAS release bundle | commit: eb940ad3
- fix(csp+auth): add missing CSP domains and fix consent expiry check order | commit: 86948eb0
- fix(csp+auth): add vercel.live to frame-src and move rate limiter before body parse | commit: 42ecf482
- fix(auth): suppress account/me fetch during logout via isSigningOutRef | commit: 632be18b
- fix(csp+a11y+three): data: in connect-src, inert drawer, THREE.Timer | commit: ea0e7bc1
- fix(types): inert prop must be boolean not string in React 18 | commit: f7157f55
- fix(three): correct THREE.Timer API — update(timestamp) + getElapsed() | commit: f534eb42
- fix(three+css+data): cleanup warning, autocorrect color, hexagram 33 glyph | commit: fdb2db2d
- fix(csp): resolve Trusted Types violations and nonce propagation in App Router | commit: dacc790b
- fix(csp): unsafe-eval for Turnstile, cspNonce wiring, remove data leak log | commit: 52967fe8
- fix: patch postcss DoS vulnerability GHSA-q4gf-8mx6-v5v3 | commit: 0567049c
- fix(ci): remove postcss override — lock file out of sync with npm ci | commit: 01b68ec8
- fix(eas): add prepare script to i18n package so dist/ compiles on npm install | commit: bb1ae128
- fix(mobile-release): disable proguard and drop mapping artifact upload to prevent startup crash | commit: 985b70d2

### Security
- security(fase-2): webhook fail-closed, cookie secure, mobile env vars required | commit: 955007d3
- security(fase-3): idempotencia webhook RC, 2FA atómico, depth desde DB | commit: c6afd9a9
- security(phase-4): enforce CSP, harden register + 2FA endpoints | commit: 720fde99
- security(H-3): normalize RC webhook auth header before single comparison | commit: d9c6ab3c
- security(M-5,M-6,L-7): tighten admin email regex, rate-limit display-name, sanitize debug logs | commit: daa813a5
- security(csp): remove unsafe-inline from script-src (Etapa 3) | commit: ad79040c

### Docs
- docs(db): confirm purge script keep list for staging auth users | commit: d1a90826
- docs(csp): documentar comportamiento esperado de Cloudflare Turnstile en middleware | commit: 49408192

### Maintenance
- Mobile: versión About/WebView desde manifest (expo-application), no expoConfig embebido obsoleto. | commit: 32afc87a
- Android release: siempre expo prebuild antes de Gradle para alinear expoConfig y manifest. | commit: 02e2664d
- trigger vercel preview deploy | commit: 6bffe4c5
- remove(debug): eliminar logs [token-debug] y variable LOG_TOKEN_BALANCE_DEBUG | commit: 7b562a7c
- remove(debug): eliminar LOG_TOKEN_BALANCE_DEBUG de account/me/route.ts | commit: db376d23
- chore: clean migrations + db setup docs + admin scripts | commit: a36ea56e
- chore: remove obsolete migrations + update superseded ones | commit: 267d733f
- chore: merge staging → main (security hardening + postcss fix) | commit: 5727bcbb
- chore: merge staging → main (v3 README + WebView Vercel toolbar fix) | commit: c96a014e
- Fix hi/ar localization gaps in FAQ and reading summary. | commit: e0ae3ca6
- Bump Android app version to 3.1.1. | commit: 65c9187e

---


## [1.0.0] — 2026-04-23 | versionCode: 10 | Stage: Internal Testing

### New
- feat(mobile): themed native chrome, locale bridge for login, i18n dialogs | commit: fb3a95ea
- feat(mobile): default UI locale EN, device detection via expo-localization | commit: 6f10cbf6
- feat(chat): rounded top cap on auth strip, square join to app bar | commit: fee9f72d
- feat(mobile): square shell + inset rounded auth card above WebView | commit: 552ac80c

### Fix
- fix(mobile): neutralize extra vertical gaps in WebView chat (SDK35) | commit: 67b94ac0
- fix(mobile): v3 gap fix — force .oracle-chat-app flex:1 and zero .chat-surface margin | commit: 9dedb302
- fix(android-webview): fill chat shell height on API 35 (dvh letterboxing) | commit: 03f4cfb2
- fix(mobile-webview): robust viewport height sync for SPA hydration (API 35) | commit: 70e9f4e4
- fix(chat): align shell to aqua, flex chat-surface, composer sheet overlay | commit: ae6053fe
- fix(mobile): inject chat layout CSS so WebView matches staging without stale CDN | commit: 1a423fb1
- fix(mobile): resolve WebView URL from app.config extra.apiUrl | commit: fa8590f9
- fix(mobile): tighten native chrome gap and narrow composer pill | commit: 62d51c2a
- fix(chat): align composer footer width with history inset on narrow viewports | commit: bf5b86e4
- fix(chat): full-bleed composer footer + compact mobile bar height | commit: 0086aa1a
- fix(chat): move composer footer out of chat-room for flush bottom layout | commit: 4bf4648c
- fix(chat): tighten composer bottom inset for RN WebView | commit: 295788f7
- fix(chat): restore safe bottom inset above Android nav (clamp env) | commit: 7d4e0d59
- fix(chat): show bottom rounded border above Android nav (surface margin) | commit: 12353d6f
- fix(rn-ui): native top bar rounded cap + square-top WebView card | commit: e4c939fd
- fix(mobile): native top bar starts below status bar inset | commit: 8779d140
- fix(mobile): align native auth strip with WebView shell (0.45rem pad) | commit: 1d25c427
- fix(mobile): RN WebView auth strip parity, status bar, local APK script | commit: 5e26b8cf
- fix(web,mobile): auth strip controls match former native chrome | commit: 7dbcbd9b
- fix(web): locale picker portal + RN chat width; mobile inject overflow | commit: 95613bb2
- fix(mobile,web): RN chat width, locale menu scroll, dark shell border; inject + AGENTS | commit: a2c955ed
- fix(web): hydrate UI locale in useLayoutEffect so return from /guia keeps language | commit: 28d97a02
- fix(mobile): sync WebView locale from web storage on navigation (avoid EN clobber) | commit: 8d9c681a
- fix(mobile,web): persist locale across docs and restore docs scrolling/nav in WebView | commit: fdf29bc3
- fix(mobile,web): WebView locale sync and doc nav overlap | commit: e9b49010
- fix(web): hide chat card contour and dot grid outside RN WebView | commit: 99238ad2
- fix: revert doc nav sticky; manual-first locale (web + APK) | commit: d2978c7a
- fix(web): skip initial locale persist race vs useLayoutEffect | commit: 88247c75

### Docs
- Docs: rutas /faqs y /about independientes; guía sin FAQ ni trazabilidad; APK navega a ambas. | commit: 43b32196

### Maintenance
- revert(ui): restore full-width composer dock; keep RN top spacing | commit: 5106115c
- style(web): justify docs and token center copy on web | commit: 3f57c361
- web: persist session_limit in sessionStorage for tier hydration | commit: f71a06f4
- web: FAQ page, Play Store dock, and copyright outside chat | commit: 570a6e42
- Web: FAQs solo en /guia; trazabilidad APK sin package id; WebView rellena versión y build. | commit: 86d549be
- Composer: enlaces a FAQs y About en /guia; hoja opciones más alta; About visible en web. | commit: 135b0209
- Android WebView: no interceptar SPA en /guia, notas y legales (evita freeze en FAQs/About). | commit: 4d30b5a7
- WebView: evitar bucle MutationObserver en /about al rellenar trazabilidad (rAF + no-op si mismo texto). | commit: c5f713c0
- Mobile 1.0.0 (versionCode 10); badge Google Play más grande en web. | commit: a3c06412

---


## [3.0.0] — 2026-04-23 | versionCode: 3 | Stage: Internal Testing

### Maintenance
- Mobile 3.0.0 (versionCode 3) para siguiente internal tras 2.0.0 en Play. | commit: e4a82ff6

---


## [2.0.0] — 2026-04-20 | versionCode: 2 | Stage: Internal Testing

### New
- feat(web): Cloudflare Turnstile for register; turbo env passthrough | commit: 6ee4630b
- feat(web): chat UX refresh, docs routes, richer image prompts | commit: 0ae15d18
- feat(web): logo header, drawer stats, prune empty chats, mode showcase | commit: 491e68f0
- feat(web): UI de chat, modos I Ching/Huesos y límite de hilo | commit: 07f9d35f
- feat(web): Supabase auth, login flow, API Bearer + DB migrations 003-004 | commit: 7c64aa5b
- feat(security-ui): add optional 2FA setup in options panel | commit: fda19204
- feat(tiers): implement v4 pricing and runtime policy | commit: e69d6dc7
- feat(docs): add quickstart and legal pages in options | commit: adf1be2b
- feat(billing): add self-service subscription management | commit: bd653e5a
- feat(auth): add password reset and confirmation resend actions | commit: 3d266da3
- feat(security,subscription): modal 2FA flow and richer account status | commit: 1c9735ba
- feat(subscription): add dedicated subscription center with revenuecat status | commit: 67aa234d
- feat(billing): Seeker monthly 20 credits, annual 15 per month | commit: 909ab44a
- feat(web): polish auth/subscription modals, fix pricing flow, remove reading mode UX | commit: 9d7b3d17
- feat(billing): RevenueCat as single source for subscription period | commit: bf5e3637
- feat(billing): grace window 3-consultation limit with support message when exhausted | commit: 981c79ba
- feat(billing): RC v2 product map env + nested product tokens for tier resolution | commit: d81654b3
- feat(web): checkout success page with billing sync and tier polling | commit: d17ed45d
- feat(billing): RC customer portal + plan change webhook fix | commit: f8fd484d
- feat: migrate billing to consumable token packs | commit: 148f9c31
- feat(db): user_trial_log to prevent duplicate free trial; fix token center copy | commit: 5b2d8d4c
- feat(web): cleaner options panel, pack marketing copy, legal dates | commit: 2cf407eb
- feat(web): doc locale by auth, thread depth fixes, EN default, browser locale | commit: f7ba4a82
- feat(web): oracle bones image overlay shows verdict glyph (吉/凶/沉默) | commit: cf1aecd4
- feat(images): oracle bones verdict glyph size + verdict-colored gradients | commit: ef0f86c6
- feat(web): PDF lectura multipágina y títulos; logo de marca actualizado | commit: 5da0cbd2
- feat(web): logo marca, barra sesión, cinta I Ching y cabecera chat | commit: ce0762cb
- feat(i18n): centralize UI strings in @iching-oracle/i18n for nine locales | commit: 7ae0da41
- feat(web): cookie consent gate and colored hint lines | commit: 267b1da7
- feat(bones): upgrade ritual animation with 5 verdict patterns | commit: 42267b45
- feat(ritual): refine animations and harden oracle outputs | commit: d72eb413
- feat(web): naturalize verdict copy, add particles, and prebuilt fallbacks | commit: 9f0be440
- feat(web): progressive interpretation reveal and scroll anchor | commit: 7b4bf52f
- feat(ritual): integrate approved I Ching reveal flow into chat | commit: 26d6d607
- feat(ritual): refine loading flow and pacing | commit: a3e14616
- feat(i18n): localize web UI across nine locales; mobile Expo config | commit: 4a1ca3e2
- feat(web): expose supabase singleton on window for APK WebView setSession | commit: 68238dea
- feat(web): redirect Android to APK deep link on checkout success | commit: ca94e236
- feat(api): add OpenRouter as Claude fallback between Anthropic and Groq | commit: 22acdfe4
- feat: onboarding modal for display_name + fix APK locale bug | commit: c4fda610
- feat(onboarding): auto-fill display_name from Google full_name, modal for email | commit: 41f2f0c6
- feat(admin): is_admin DB column + complementary allowlist/DB admin logic | commit: 3772243f
- feat(admin): read is_admin from /api/account/me + show "admin" tier in UI | commit: 42e31ffa
- feat(mobile): replace Android system dialogs with custom dark-themed modal | commit: 0d9c51f2
- feat(mobile): v2.0.0 (versionCode 2), R8 release minify, EAS mapping artifacts | commit: 73dbf0ec

### Fix
- fix(web): add @iching-oracle/sharing dependency for Vercel build | commit: d2a0ed51
- fix(web): use nodejs runtime for RevenueCat webhook (silence edge SSG warning) | commit: 7bd67c9c
- fix(web): consult 500 con Supabase, hidratación y JSON vacío | commit: ee3fc5fa
- fix(claude): modelos Anthropic actuales y fallback si la API falla | commit: 8264c828
- fix(image): Together FLUX steps within allowed range | commit: 3453b61e
- fix(image): enforce hexagram bars in Together prompt | commit: 3e2b05a8
- fix(web): prevent localStorage quota crash | commit: d1b77f38
- fix(image): overlay deterministic hexagram over backgrounds | commit: 59607411
- fix(web): explore-first auth UX and polished login layout | commit: 52318655
- fix(web): header account row, credits UX copy, API cycle metadata | commit: cd694d0f
- fix(web): strip Iniciar sesión/Cerrar sesión; remove header Entrar; restore logo size | commit: e47a1374
- fix(ci): skip Google Fonts fetch in GitHub Actions build | commit: 6515b756
- fix(ci): run dependency builds before typecheck | commit: cbae8102
- fix(free-tier): allow 2 consultations per thread (sessionDepth 2) | commit: eb24636d
- fix(images): CJK overlay + watermark render on server (Sharp/librsvg) | commit: ff6d2056
- fix(admin+images): admin bypass credits; restore previous watermark/overlay pattern | commit: b5ffca50
- fix(admin): persist admin key client-side for unlimited testing | commit: aaf43e3b
- fix(admin): unlimited testing via verified email allowlist | commit: a77ea82e
- fix(admin): skip 2FA gate for allowlisted test accounts | commit: be04bcf8
- fix(flow): avoid 2FA dead-end with tier gate flag and explicit UX | commit: 5c26696f
- fix(flow): harden auth/billing policy and restore image reliability | commit: 8fc272c4
- fix(auth): make 2FA optional by default | commit: 6cc4b8ac
- fix(privacy): persist chats in DB and disable public sharing | commit: 44264468
- fix(images): strengthen watermark visibility and upscale iching overlays | commit: 091a08df
- fix(images): restore chinese glyphs and watermark text rendering | commit: 3036bf33
- fix(images): prevent tofu regression by keeping latin fallback fonts | commit: 88a4d2f5
- fix(images): restore overlay geometry and watermark text label | commit: c4c7fb14
- fix(images): use local bundled CJK font for overlay rendering | commit: 2b56481b
- fix(images): stabilize traditional CJK overlay font loading | commit: 8ee26281
- fix(images): enforce readable watermark visibility across tiers | commit: 636514c8
- fix(chats): harden consultation persistence and DB compatibility fallback | commit: e94bd511
- fix(images): make CJK font resolution Vercel-safe | commit: 9f493efa
- fix(images): include latin chars in overlay font subset fallback | commit: 4d23c139
- fix(images): use resvg-js for SVG rendering instead of sharp/librsvg | commit: fb389b9b
- fix(build): mark @resvg/resvg-js as external for webpack | commit: ec82adf4
- fix(images): bundle subset TTF for resvg CJK rendering on Vercel | commit: 5fd9eabb
- fix(ui,auth): compact header and add email 2FA flow | commit: 0b2b19f6
- fix(ui): stabilize header strip alignment and edge-to-edge mode bar | commit: fb2ec26d
- fix(i18n,ux,pdf): complete multilingual runtime and improve chat export | commit: 3822dfd5
- fix(pdf,chats): improve export layout and add secure deletion | commit: 10dd48ea
- fix(chats): tighten session lifetime and improve history UX | commit: 8bf35b93
- fix(chats): add backward-compatible history query fallback | commit: a6816069
- fix(chats): surface explicit config errors for history loading | commit: dff9b93c
- fix(account): harden billing UX and user-scoped activity stats | commit: 11ec6348
- fix(consult): block empty sends and enforce thread limits in API | commit: e4da6658
- fix(ux): stabilize chat summaries and improve 2FA/billing diagnostics | commit: cef4d846
- fix(chats,2fa): preserve loaded threads and surface provider delivery errors | commit: aeeb19aa
- fix(auth,consult): improve registration and thread-limit UX | commit: 47c7c5bf
- fix(db): sync auth user deletions to public profile | commit: 6d735fa6
- fix(pricing): prevent self-redirect loops | commit: 66a96af1
- fix(pricing): attach supabase user id to purchase links | commit: 435f97f2
- fix(revenuecat): apply webhook purchases to tier and cycle correctly | commit: 9500b9b5
- fix(images): preserve pinyin diacritics in composed overlays | commit: bcb70130
- fix(images): remove pinyin subtitle from hexagram overlays | commit: c64863bc
- fix(app): stabilize images, billing UX, and locale defaults | commit: 55adedb7
- fix(2fa): separate enrollment and login challenge flows | commit: 4a0487b4
- fix(2fa): harden challenge validation and simplify login flow | commit: 3d1edd6f
- fix(2fa): enforce configured method and keep errors inside modal | commit: 12c22018
- fix(billing): sync RC EXPIRATION via REST; map subscriptions in v1; wait for session on /pricing | commit: 7dfe9689
- fix(2fa): always save email method on email enroll; challenge UI and hash compare | commit: 53cba404
- fix(billing): merge RevenueCat v2 customer subscriptions into sync-billing (Web Billing) | commit: 6a15987b
- fix(billing): map v2 RC entitlements + epoch dates; fail loud on query_credits upsert error | commit: 904dc0b8
- fix(auth+billing): self-heal public.users and enforce billing FK preconditions | commit: c1e2153c
- fix(billing): stop query_credits onConflict dependency; harden credits_type schema | commit: 982f6086
- fix(billing): force RevenueCat user alignment before checkout redirect | commit: 3fac4b78
- fix(billing): heal public.users from auth before upsertUserTier | commit: b1e0d859
- fix(api-error): add apply_db_migration action for 2FA schema errors | commit: e3554f0c
- fix(web): center modal close, checkout via NEXT_PUBLIC_PLANS_URL, 2FA single-method steps | commit: 17a4ba4e
- fix(billing): address audit bf5e363 — RC stale cycles, Redis key, /me, CANCELLATION | commit: c510ae2a
- fix(security): harden auth, credits, and admin runtime config | commit: 62bfe1dc
- fix(auth): handle existing signup email with modal guidance | commit: cc488251
- fix(billing): add paid grace window on temporary RC outages | commit: 2759f431
- fix(ui): hide redundant subscription count message in center | commit: 8404c4d5
- fix(billing): pick best active v2 subscription by tier, not items[0] | commit: 3c9d4a20
- fix(billing): log v2 tier tokens when active rows map to free | commit: b5805deb
- fix(billing): RC v2 subscription UI — eligibility + status field fallbacks | commit: 5cfd2d62
- fix(web): subscription center status for free tier, avoid manage 404 | commit: 8f106649
- fix(web): neutral billing copy and block homepage-as-plans URL | commit: a136b8f6
- fix(web): always attach app_user_id to plans checkout when authenticated | commit: cedda8a8
- fix(auth): persist Supabase session in localStorage for multi-tab checkout | commit: a99d5632
- fix(billing): harden plans CTA routing and RC v1 403 handling | commit: 00867547
- fix(billing): strip UUID path segment from plans URL before appending app_user_id | commit: 2225f64e
- fix(checkout): use tierLabelForDisplay for welcome message and add tier logging | commit: 2dc6fd45
- fix(webhook): resolve opaque RC Billing product_ids in PRODUCT_CHANGE via tier map | commit: 11c78d78
- fix(billing): add portal session logging + remove RC v1 API calls | commit: e5a0deef
- fix(billing): resolve RC anonymous ID alias for customer portal sessions | commit: 119ab4c7
- fix(billing): RC portal fallback + identity fix para futuros usuarios | commit: e4f19de7
- fix(billing): persist RC alias graph and enforce identified checkout | commit: 1746c1a1
- fix(next15): adapt dynamic route params and config keys | commit: d9f03978
- fix(billing): use v2 authenticated management URL for portal access | commit: 6853286c
- fix(billing): detect active RC subscriptions without tier-map dependency | commit: 3ef72aee
- fix(billing): downgrade to free when RC has no active subscription | commit: 7e4bbd95
- fix(billing): avoid portal 404 fallback and preserve free lifetime usage | commit: ba9bc5fd
- fix: refine token center UX and live balance refresh | commit: ea839d08
- fix(images): tier-aware sizes for Together; toContextTierKey in resize; pack copy for resolution | commit: 850c45af
- fix(ui): shorten Huesos tagline and 2FA options copy | commit: 38535a17
- fix(web): split doc-locale cookies for client bundle (Vercel build) | commit: 8c4be8a8
- fix(web): thread depth UI uses plan cap; add consult panel dividers | commit: 5ff10418
- fix(web): oracle bones mock is tier-sized PNG with glyph only + watermark | commit: 0626628b
- fix(images): oracle bones mock stays 1344×768; tier sizes unchanged for remote | commit: d99ac02c
- fix(images): oracle bones overlay viewBox matches output size (no letterbox bars) | commit: baddac20
- fix(oracle-bones): center verdict glyph on image (overlay + mock) | commit: c4bc0de3
- fix(web): persist chat session state across route navigation | commit: 7ea1ba13
- fix(web): unify user guide and align token tier copy | commit: bddcde3c
- fix(web): polish token-center guide link and close button | commit: c5a8c9c3
- fix(web): trim options panel copy; compact centered token/2FA buttons | commit: 4155a4b1
- fix(web): center compact CTAs; Ver packs matches options pills | commit: 05ec297f
- fix(web): align panel CTA pills to text mid-axis | commit: 3620b09b
- fix(web): keep token modal Ver packs centered; left nudge only in options | commit: dc30bcec
- fix(web): harden chat hydration and idle session handling | commit: 31fa4dba
- fix(web): preserve new session and simulate tier transitions | commit: 629d084f
- fix(web): use neutral token-depleted notice copy | commit: 8ac8c39c
- fix(2fa): reset totp_last_used_step on enroll and disable | commit: 1e1f76e5
- fix(2fa): reset replay step in follow-up update, not upsert | commit: 52e136a6
- fix(2fa): add recovery-code challenge fallback | commit: 42b1fe6a
- fix(2fa): keep setup session verified after enrollment | commit: 25d76554
- fix(2fa): separate setup verification from recovery step | commit: 4a5a795e
- fix(web): improve SVG font embedding and image rendering path | commit: c9ccede4
- fix(2fa): improve challenge fallback and retry flow | commit: 63afba33
- fix(ui): tone down hint emphasis, highlight 2FA send-email CTA | commit: 105789a6
- fix(web): prevent client crash in bone ritual animation | commit: 4c6c83f2
- fix(bones): strengthen fire visuals and ensure crack reveal timing | commit: f8e2154a
- fix(chat): autosize input and stabilize bones fallback | commit: 9301c1fb
- fix(ui): tune fullscreen particle interaction | commit: 6f365ab9
- fix(fallbacks): purge text artifacts from prebuilt images | commit: 0c91f587
- fix: interpretation typography, safe markdown reveal, disable auto hyphens | commit: 350cdd7a
- fix(ritual): restore visible awaiting animation | commit: 2941a42f
- fix(ritual): stabilize loading visuals and pacing | commit: fd72896d
- fix(auth): bootstrap free credits on auth signup | commit: 0e1086ea
- fix(ui): restore chat loading states and Yi glyph rendering | commit: 42d94eca
- fix(ui): restore plan tier skeleton and optimistic chat delete | commit: 7988938c
- fix(pdf): add controlled hyphenation in wrapped text | commit: d66424c9
- fix(mobile): harden auth bridge, PDF export, and pinch zoom in APK | commit: c3a1bece
- fix(mobile): stabilize auth sync and oauth handoff in webview | commit: b111d7b7
- fix(mobile): align oauth host and recover auth token sync | commit: 01096c8a
- fix(mobile): use staging supabase fallback and heartbeat auth sync | commit: c1ee00bd
- fix(mobile): stabilize deep-link callback parsing and auth state reconciliation | commit: 04603082
- fix(mobile): pin auth bridge to staging supabase project ref | commit: 4b1d8d1d
- fix(mobile): hard reset webview on sign-out and enforce locale sync | commit: cc4bf68d
- fix(mobile): Google OAuth implicit flow + sign out fix | commit: b37903b4
- fix(mobile): purchase success deep link + RevenueCat redirect flow | commit: 820af9d8
- fix(api): add required action field to apiError calls in display-name route | commit: 053b938e
- fix(admin): adminUnlimitedCredits always true when adminBypassAllowed | commit: 9ec67199
- fix(policy): remove unused shouldAllowAdminUnlimitedCredits function | commit: c9b89759
- fix(admin): bypass sessionDepth limit for admin users | commit: 08bc9ba7
- fix(mobile): bump ignoreDeprecations to "6.0" to silence moduleResolution deprecation | commit: 480f8a72
- fix(admin): bypass client-side thread depth limit + show ∞ in depth indicator | commit: 9edb80b9
- fix(mobile): declare process.env globally to silence TS2591 without @types/node | commit: cb564d63
- fix(mobile): translucent status bar with transparent background | commit: a3dfa514
- fix(mobile): harden webview header hiding for sdk35 layout parity | commit: 3e358145
- fix(mobile): stabilize SDK35 WebView layout and Android insets | commit: ab204d16

### Security
- audit: security headers, RC webhook, public reads, CI, tests, observability | commit: b6a11c2f

### Performance
- perf(chats): lazy-load threads and improve delete icon UX | commit: 4bf7a849
- perf(api): reduce chat delete roundtrips | commit: a0cd6d34

### Docs
- docs: AUDIT_REPORT note on CI lint | commit: f6888a43
- docs: align tier specs with tier-billing-constants and runtime | commit: daed162f
- docs(env): document Web Billing return URL alignment with NEXT_PUBLIC_APP_URL | commit: 6ce9f18d

### Maintenance
- Initial commit: I Ching monorepo (web, packages, backends) | commit: 87c5c9b0
- refactor(claude): un solo modelo Anthropic (Sonnet) para todos los planes | commit: 77d68653
- chore(claude): default Anthropic model claude-sonnet-4-5 | commit: de22e984
- Asegura que el arte sumi-e de fallback varíe de forma determinista por consulta y actualiza la marca de agua a inglés. | commit: 137f64fd
- Debug: log Together vs svg-art provider | commit: 3598d538
- copy: soften auth dialog (remove harsh phrasing) | commit: 2b0cd12a
- copy(login): trim brand panel; drop unused brand-list styles | commit: 0062ef4b
- chore: skip mobile eslint in turbo until config exists; note web lint hoist issue | commit: d6edcc8b
- ci: skip lint step until eslint-config-next resolves in monorepo | commit: 224fdb67
- Revert "fix(images): prevent tofu regression by keeping latin fallback fonts" | commit: f2e722b7
- Revert "fix(images): restore chinese glyphs and watermark text rendering" | commit: 0116a583
- Revert "fix(images): strengthen watermark visibility and upscale iching overlays" | commit: 1bba002d
- chore(staging): trigger preview deployment | commit: 2c5727d4
- style(subscription): refine subscription center visual design | commit: a0391874
- db: cascade delete two_factor_attempts when public.users is removed | commit: 63d42977
- db: before-delete trigger to wipe public.users before auth; manual delete script | commit: 62d35573
- chore(db): do not modify applied migration 009; rely on 015 for seeker variants | commit: a25af20d
- refactor(billing): centralize tier quotas in tier-billing-constants | commit: 08a65b36
- chore(billing): add detailed RC v1/v2 upstream failure logs | commit: 00c011e3
- chore(security): enforce RLS on internal RevenueCat tables | commit: 48bd6f83
- chore(security): harden auth origin, webhook compare, and app headers | commit: d75c6ece
- chore(next): update generated next-env references | commit: 24c778d0
- chore(turbo): register Vercel env vars in globalEnv | commit: e3dc3a74
- refactor: remove legacy subscription traces | commit: 371a3060
- refactor: finalize token-only naming and cleanup | commit: 849dc8f0
- chore: add token balance debug tracing | commit: b9334a54
- refactor(web): rename monthlyCreditsLimit to accountSessionLimit | commit: 24796e16
- refactor(web): drop unused credits notice cycle/limit fields | commit: cdd00328
- style: aumentar tamaño del logo en cabecera | commit: 8e1298da
- style(web): match token-center modal to consult panel | commit: 59196eb9
- revert(web): restore token-center layout; keep consult-style close | commit: 3a11ae59
- style(web): align token center CTA with 2FA; full-width Ver packs | commit: f8855db1
- style(web): shift options and token modal CTAs further left | commit: aaa62c40
- refactor(2fa): simplify modal actions and reduce button noise | commit: 9fb15ca0
- chore(ui): align particles density with demo | commit: 6eddeaab
- chore(text): align punctuation normalization | commit: 67995139
- chore(debug): add ritual stream diagnostics | commit: 2087ce7d
- chore(db): add security baseline and audit runbook | commit: 7d7094e7
- chore(git): ignore .env* and remove .env.example from version control | commit: 8dda9e42
- chore(git): ignore .claude and stop tracking agent settings | commit: 86eec78a
- chore(mobile): add bridge diagnostics for auth and navigation flows | commit: b7efc551
- chore: add env vars to turbo.json globalPassThroughEnv + fix TS deprecation warning in mobile | commit: 1fc148b2
- chore(mobile): re-link EAS project to alex_cat account (new projectId) | commit: 5cbd8a4f
- chore(mobile): switch to CNG workflow — gitignore android/ folder | commit: 7a979135
- chore(mobile): change package name to com.theoriginaliching.mobile + add apk build profile | commit: 3cc42aaa
- chore(mobile): set targetSdkVersion/compileSdkVersion to 35 | commit: a751ad56
- chore(mobile): bump versionCode to 2 | commit: ebe94bed
- chore(mobile): bump versionCode to 3 | commit: c8d9f1c8
- chore(mobile): versionCode 4 + edge-to-edge translucent bars | commit: 73dc3b8a
- revert(staging): restore Apr-18 mobile/web baseline for regression isolation | commit: eac8e6b6
- revert(staging): align mobile/web baseline to cb564d6 | commit: 37bf8785
- chore(mobile): inject Play verification token asset in Android builds | commit: 103ead29
- chore(web): update header brand logo asset | commit: 199ad87e
- chore(web): replace header logo with transparent PNG | commit: 97c9cdae
- chore(web): update brand logo with cropped transparent PNG | commit: 84ccf7b1

---

## Version Summary

| Version | versionCode | Date | Stage | Commits | Notable changes |
|---------|-------------|------|-------|---------|-----------------|
| 4.2.4 | 64 | 2026-07-16 | Production | 6 | internal-staging-aab EAS profile — staging env pinned explicitly; expo doctor 20/20 — collapse orphan chains, pin bundled versions, inert react…; correct version to 4.2.3 (pure correlative) + versioning ops doc |
| 4.2.3 | 63 | 2026-07-15 | Internal Testing | 0 | — |
| 4.2.2 | 62 | 2026-07-04 | Closed Testing | 0 | — |
| 4.2.1 | 61 | 2026-07-02 | Closed Testing | 0 | — |
| 4.2.0 | 60 | 2026-06-25 | Closed Testing | 0 | — |
| 4.1.9 | 59 | 2026-06-24 | Closed Testing | 0 | — |
| 4.1.7 | 57 | 2026-06-20 | Closed Testing | 0 | — |
| 3.5.6 | 54 | 2026-06-13 | Closed Testing | 0 | — |
| 3.5.5 | 53 | 2026-06-10 | Closed Testing | 0 | — |
| 3.5.4 | 52 | 2026-06-10 | Closed Testing | 0 | — |
| 3.5.2 | 45 | 2026-06-07 | Closed Testing | 0 | — |
| 3.4.9 | 42 | 2026-06-06 | Closed Testing | 0 | — |
| 3.4.8 | 41 | 2026-06-05 | Closed Testing | 0 | — |
| 3.4.7 | 40 | 2026-06-04 | Closed Testing | 0 | — |
| 3.4.6 | 39 | 2026-06-04 | Closed Testing | 0 | — |
| 3.4.5 | 38 | 2026-06-04 | Closed Testing | 0 | — |
| 3.4.4 | 37 | 2026-06-03 | Closed Testing | 0 | — |
| 3.4.3 | 36 | 2026-06-01 | Closed Testing | 0 | — |
| 3.4.1 | 34 | 2026-06-01 | Closed Testing | 0 | — |
| 3.4.0 | 33 | 2026-06-01 | Closed Testing | 0 | — |
| 3.3.9 | 32 | 2026-05-31 | Closed Testing | 0 | — |
| 3.3.8 | 31 | 2026-05-31 | Closed Testing | 0 | — |
| 3.3.7 | 30 | 2026-05-31 | Closed Testing | 0 | — |
| 3.3.6 | 29 | 2026-05-31 | Closed Testing | 0 | — |
| 3.3.5 | 28 | 2026-05-31 | Closed Testing | 0 | — |
| 3.3.4 | 27 | 2026-05-30 | Closed Testing | 0 | — |
| 3.3.3 | 26 | 2026-05-30 | Closed Testing | 0 | — |
| 3.3.2 | 25 | 2026-05-30 | Closed Testing | 0 | — |
| 3.3.1 | 24 | 2026-05-29 | Closed Testing | 0 | — |
| 3.3.0 | 23 | 2026-05-25 | Closed Testing | 0 | — |
| 3.2.9 | 22 | 2026-05-24 | Closed Testing | 0 | — |
| 3.2.8 | 21 | 2026-05-21 | Internal Testing | 0 | — |
| 3.2.7 | 20 | 2026-05-21 | Internal Testing | 0 | — |
| 3.2.6 | 19 | 2026-05-21 | Internal Testing | 0 | — |
| 3.2.5 | 18 | 2026-05-18 | Internal Testing | 0 | — |
| 3.2.4 | 17 | 2026-05-18 | Internal Testing | 0 | — |
| 3.2.2 | 15 | 2026-05-18 | Internal Testing | 0 | — |
| 3.2.1 | 14 | 2026-05-18 | Internal Testing | 0 | — |
| 3.2.0 | 12 | 2026-05-17 | Internal Testing | 0 | — |
| 3.1.8 | 11 | 2026-05-17 | Internal Testing | 0 | — |
| 3.1.7 | 10 | 2026-05-16 | Internal Testing | 0 | — |
| 3.1.6 | 9 | 2026-05-07 | Internal Testing | 0 | — |
| 3.1.5 | 8 | 2026-05-03 | Internal Testing | 0 | — |
| 3.1.3 | 6 | 2026-04-30 | Internal Testing | 0 | — |
| 3.1.2 | 5 | 2026-04-30 | Internal Testing | 0 | — |
| 3.1.1 | 4 | 2026-04-29 | Internal Testing | 0 | — |
| 1.0.0 | 10 | 2026-04-23 | Internal Testing | 0 | — |
| 3.0.0 | 3 | 2026-04-23 | Internal Testing | 0 | — |
| 2.0.0 | 2 | 2026-04-20 | Internal Testing | 0 | — |
