<!-- changelog:last-release:849fcf5 -->

# Changelog — The Original I Ching App

Full project change history.

## [3.5.2] — 2026-06-07 | versionCode: 45 | Stage: Closed Testing

### New
- feat(db): production Supabase closure — migration 069, Fase 4 ops, recovery docs | commit: 9d40aef
- feat(db+web): Phase 3 scale — RPC write path, thread=1, serial bootstrap | commit: 4455e7b
- feat(db): Phase 2 TOAST split — consultation_content table (migrations 062-064) | commit: 828c894
- feat(mobile): native auth bar + build warning fixes | commit: 215db01

### Fix
- fix(db): align verify_migrations 064 check with post-069 prod state | commit: 849fcf5
- fix(db): stop sync trigger from wiping consultation_content on NULL | commit: bf33b59
- fix(web+mobile): remove legacy TOAST fetch paths | commit: 32702c8
- fix(db): migration 065 — correct pg_prewarm cron for consultation_content | commit: fa3ab63
- fix(web): sort chat list by firstConsultationAt — matches displayed date | commit: 26c33bb
- fix(web): skip iching:account-refresh on SIGNED_IN — bootstrap handles login hydration | commit: 89e4c26
- fix(db): revoke anon/authenticated execute on sync_consultation_content — matches 054 pattern | commit: 2a25074
- fix(db): remove VACUUM ANALYZE from 063 — cannot run inside transaction block | commit: 6a49b8d
- fix(bootstrap): move optimistic lock to effect start — blocks duplicate fetch before it fires | commit: 08b49c7
- fix(stability): eliminate post-consult /api/account/me burst + bootstrap re-run guard | commit: 90a4eb4
- fix(stability): close 3 Phase 1 follow-up gaps — cache invalidation, mobile bootstrap, onLoadEnd refresh | commit: 16cc497
- fix(db+api+web+mobile): Phase 1 — eliminate PostgREST connection burst (Supabase stability) | commit: da699cf
- fix(db+api): definitive Warp timeout fix — 2s guard + eliminate all-sessions TOAST bomb | commit: ac0008b
- fix(api): protect full thread fetch against Warp timeouts — parallel meta+content | commit: 982781a
- fix(db): switch get_session_content_safe to SECURITY INVOKER — closes 0028/0029 | commit: 91b8e86
- fix(db+api): bound TOAST read timeout to prevent Warp thread kills in production | commit: bf14613
- fix(web): prevent Phase 1 from overwriting full thread content with summaries | commit: 88874f9
- fix(prompt+context): narrative Encuadre, no-dash rule, TOAST-free consult context | commit: e35ab4c
- fix(sync): await in-flight syncChatContent promise instead of discarding — v3.5.1 | commit: 3ffe15c
- fix(interpretation): merge staging — transformed hexagram Chinese name fixes | commit: 508d3c0
- fix(migrations): correct verify_migrations 051 syntax | commit: 816faa3
- fix(web): persist tour-completed flag in public.users — migration 051 | commit: f81e3c9
- fix(web): persist tour-completed flag to Supabase user_metadata across reinstalls | commit: 04205d7
- fix(web): always show sign-in/sign-out button during auth loading window | commit: 7934ae1
- fix(web): suppress white-frame flash on Next.js App Router navigation | commit: fa32b1c
- fix(web+mobile): revert native auth bar + fix hydration gap in web bar | commit: 3d7b89b
- fix(mobile): eliminate double auth bar | commit: 75fc3e0
- fix(mobile): install expo-device — missing peer dep of expo-app-integrity | commit: 23a97d1
- fix(ci): update package-lock.json — babel 7.29.7 drift | commit: 1aa8047

### Docs
- docs(db): P0 incident consultation_content wipe + permanent migration gates | commit: 99f32dc
- docs(audit): Warp root cause closure + verification checklist | commit: 7a2778b
- docs(audit): update SUPABASE_DB_STABILITY_AUDIT — Phase 2 implemented, migration instructions added | commit: cbccf39
- docs(audit): close Phase 1 in SUPABASE_DB_STABILITY_AUDIT — status yellow, changelog updated | commit: 96a0e05

### Maintenance
- merge(main): Phase 2 TOAST split + Warp remediation (staging) | commit: d22a81c
- merge(main): Phase 1 Supabase stability — complete (11 fixes) | commit: a203e5a
- merge(staging): Phase 1 Supabase stability — 9 fixes applied | commit: 7e67f27
- merge(main): definitive Warp timeout fix — 2s guard + exception handler | commit: fd5a08e
- merge(main): close last unprotected TOAST read path in chats route | commit: 8a86e34
- merge(main): two-phase loading, TOAST timeout guard, flash fix, narrative Encuadre — v3.5.1 | commit: d59e56b
- merge(main): two-phase thread loading + P1 inFlight fix — v3.5.1 | commit: 1dc9b5b
- chore(fallbacks): merge staging — remove old PNG pool | commit: 33de9e5
- revert: undo user_metadata tour flag | commit: e413717
- chore(release): bump version 3.4.8 / versionCode 41 | commit: 439a2bb

---

## [3.5.1] — 2026-06-06 | versionCode: 44 | Stage: Closed Testing

### New
- feat(sync): two-phase thread loading — meta first, TOAST content in background | commit: 9ebc4f1

### Fix
- fix(db+mobile): prevent TOAST-driven pool exhaustion + deduplicate sync requests | commit: f38d52c

### Maintenance
- merge(staging): two-phase thread loading from feature/two-phase-thread-loading | commit: 979d61a

---

## [3.5.0] — 2026-06-06 | versionCode: 43 | Stage: Closed Testing

### Fix
- fix(prompt): remove compression trade-off from Encuadre + bump master_combined budget | commit: 653fbc9
- fix(prompt): enforce full hexagram chain in Encuadre for deep threads (up to 8 consultations) | commit: b1619f1

### Maintenance
- chore(release): bump version 3.4.9 / versionCode 42 | commit: bbd9d47

---

## [3.4.9] — 2026-06-06 | versionCode: 42 | Stage: Closed Testing
> Mobile + web fix. New AAB build required (index.tsx + chat-store.ts modified).

### Fix
- fix(mobile+web): fix chat thread hydration — stale partial threads after login | commit: 75e71d4
  - **Fix 1** — chat-store.ts: add `deleteSyncMeta`, `deleteSyncMetaByPrefix`, `getChatMessageCount` (filters `is_deleted=0`)
  - **Fix 2** — index.tsx `auth_signout`: bulk-invalidate `chat_content_synced:*` on sign-out; chat list metadata and message rows preserved
  - **Fix 2b** — index.tsx `request_thread`: bypass per-chat sync cooldown when SQLite rows < `chats.message_count` (direct SQLite query, avoids race with `injectCachedChats`)
  - **Fix 2c** — page.tsx `signOut()`: postMessage `auth_signout` to ReactNativeWebView — web-UI logout now also clears SQLite cooldowns
  - **Fix 3** — page.tsx: change both `loadSessionThread` gates from `thread.length===0` to `thread.length<messageCount` (sidebar click line 4213 + auto-load after summary line 2722)
  - **Fix 4** — page.tsx summary merge: clear partial thread to `[]` unless complete or active session (`activeSessionLocalIdRef` guard prevents clearing visible thread on JWT refresh)
  - **Fix 5** — index.tsx `request_thread`: re-dispatch on `updated[0]?.id !== cached[0]?.id` in addition to length change (DESC array — index 0 is most recent)
  - **Fix 6** — index.tsx `INJECTED_JS __rnSignOut`: clear `iching_chat_state_*` + `iching_chat_summaries_*` from both storages before postMessage — aligns native sign-out with web `signOut()` cleanup

### Docs
- docs(audit): close CHAT_THREAD_HYDRATION_AUDIT.md — add cross-analysis Claude+Cursor, full fix implementation details, and coverage table H1–H7 | commit: baf72f0

### Maintenance
- chore(release): bump version 3.4.8 / versionCode 41 | commit: 89ecebc (previous release marker)

---

## [3.4.8] — 2026-06-05 | versionCode: 41 | Stage: Closed Testing
> APK build generated and submitted to Play Store (versionCode 41).

### New
- feat(mobile): native auth bar + build warning fixes | commit: 46a3304
- feat(mobile): native auth bar replaces web session strip | commit: 92166a7

### Fix
- fix(web): always show sign-in/sign-out button during auth loading window | commit: 2e1ecb8
- fix(web): suppress white-frame flash on Next.js App Router navigation | commit: 9acd42d
- fix(web): eliminate auth bar blank-flash on WebView cold start | commit: 33aadb8
- fix(mobile): eliminate double auth bar — triple-layer session strip suppression | commit: 357835e
- fix(build): suppress Sentry deprecation warning + declare GOOGLE_SERVICE_ACCOUNT_JSON in turbo | commit: 92425eb
- fix(claude): suppress internal prompt keys from user-visible output | commit: 351877b
- fix(mobile/security): persist last-known UID in SecureStore to prevent cross-user SQLite leak | commit: 7367a97

### Fix (web-only — 2026-06-06, no new APK build required)
- fix(interpretation): show actual transformed hexagram Chinese name in all response headings — was always showing static 之卦 | commit: 10b0221
- fix(interpretation): replace static 之卦 in TRANSLATOR RULE section reference with dynamic trChinese | commit: 2857460
- fix(interpretation): escape backticks in section role description — TS parse error in CI/Vercel | commit: 2c68a01
- fix(ui): ConsultationRecordCard trace now shows real transformed hexagram name (#X 乾 → #Y 坤) instead of hardcoded 之卦 | commit: 10b0221
- fix(ui): PDF export trace uses real transformed hexagram Chinese name | commit: 10b0221
- fix(api): route.ts now returns transformedHexagramChinese field in consult response | commit: 10b0221
- fix(session-store): historical consultations derive transformedHexagramChinese from stored number via getHexagramRecordByNumber | commit: 10b0221

### Fix (web-only — 2026-06-06, prompt + UI polish, no new APK build required)
- fix(api): add transformedHexagramChinese to SSE final_ready event — auto-cast (streaming) path now shows full #X 汉 → #Y 汉 trace in ConsultationRecordCard; non-streaming path was already correct | commit: 752877d
- fix(prompt): add La imagen (象傳) as explicit ## heading in all translators including master_combined; add section role + triangulation requirement in masterSynthesisInstruction so master_combined shows three labeled blockquotes (Wilhelm → Legge → Zhou Yi) instead of bold text | commit: 46e41db
- fix(master-combined): bump targetWordCount 1200-1600 → 1400-1800 to accommodate 6-section structure with triple image source blockquotes without Claude compressing other sections | commit: 8b951d3
- fix(prompt): force literary variety in Encuadre session-arc paragraph — removed seeded metaphors (arco, hilo, teje) from instruction; added VARIEDAD LITERARIA OBLIGATORIA rule requiring a different narrative stance (observational, dramatic, intimate, seasonal…) in each consultation of the same thread | commit: f57214f
- fix(prompt): SNAPSHOT vocabulary firewall — SNAPSHOT internal terms (arc, traced, session arc) declared as internal notation; Encuadre explicitly told it is a literary re-entry, not a SNAPSHOT paraphrase | commit: 61008da
- fix(prompt): prohibit slash-separated blockquotes — Wilhelm judgment and image texts use actual line breaks (\\n) in JSON; Claude was collapsing them into single lines with / separators; each verse line must now render as its own "> *line*" blockquote row | commit: 2c8ef08
- fix(prompt): enforce multiline blockquotes for Wilhelm in master_combined — masterSynthesisInstruction's single-line template was overriding the SYSTEM_PROMPT rule; added explicit CRITICAL FOR WILHELM note and cross-reference to typography section | commit: 06caf05
- fix(css): promote translator + binary toggle label layers to own GPU compositor layer (translateZ(0) + will-change: transform) — prevents text labels disappearing during scroll on Android WebView due to z-order collapse between the thumb's compositor layer and the main content layer | commit: af37871

### Docs (2026-06-06)
- docs(audit): DYNAMIC_SYMBOLS_AUDIT.md — inventario completo de símbolos chinos en la cadena de respuesta (I Ching + Oracle Bones), verificación estático/dinámico, cadena de propagación y lección de CI | commit: 0833541

### Maintenance
- chore(fallbacks): remove old PNG pool — WebP-only local fallbacks | commit: 307d60b
- feat(fallbacks): replace local prebuilt pool with clean WebP images | commit: 76feb6e
- revert: remove NativeAuthBar — reverting to web bar approach | commit: 26d8597
- chore(release): bump version 3.4.7 / versionCode 40 | commit: b1e448a

---

## [3.4.7] — 2026-06-04 | versionCode: 40 | Stage: Closed Testing

### Fix
- fix(mobile): preserve SQLite through sign-out — instant re-login for same user | commit: c22696f
- fix(web): restore Supabase fallback in rn:thread-not-found handler | commit: 6b1a81b
- fix(mobile): fix atob padding in getUserIdFromJwt — root cause of SQLite wipe on every cold start | commit: 4ebafc3

### Maintenance
- chore(release): bump version 3.4.6 / versionCode 39 | commit: 718a6c1

---

## [3.4.6] — 2026-06-04 | versionCode: 39 | Stage: Closed Testing

### Fix
- fix(mobile): sequential prewarm + fetch timeout to prevent stuck loading states | commit: 09704c9

### Maintenance
- chore(release): bump version 3.4.5 / versionCode 38 | commit: 32ec893

---

## [3.4.5] — 2026-06-04 | versionCode: 38 | Stage: Closed Testing

### Fix
- fix(mobile): fix JVM target mismatch in expo-app-integrity Gradle build | commit: 40abfd8
- fix(mobile): rewrite expo-app-integrity build.gradle for AGP 8 compatibility | commit: 49b973c
- fix(mobile): remove maven-publish from expo-app-integrity + stacktrace flag | commit: d4ebdce
- fix(ci): increase Node.js heap for Next.js build to prevent OOM | commit: 87883d2
- fix(mobile): fix expo-device version and patch expo-app-integrity for Gradle 8 | commit: 6bb241f
- fix(mobile): fix expo-app-integrity config plugin and pass cloudProjectNumber at runtime | commit: 33d84da
- fix(mobile): install expo-device — missing peer dep of expo-app-integrity | commit: 6b5a054

### Performance
- perf(mobile): pre-warm SQLite message cache for all chats, not just top 3 | commit: b81ea35
- perf(mobile): pre-warm SQLite message cache for 3 most recent chats | commit: 9a5c1c1

### Maintenance
- chore(release): bump version 3.4.4 / versionCode 37 | commit: 075bd2f

---

## [3.4.4] — 2026-06-03 | versionCode: 37 | Stage: Closed Testing

### New
- feat(security): add Play Protect and App Access Risk verdict checks | commit: f3df720
- feat(security): implement Play Integrity API attestation for Android app | commit: 1fc2e6e
- feat(security): gate library behind auth+tier and rate-limit scraping | commit: e18b77c

### Fix
- fix(ci): update package-lock.json — babel 7.29.7 drift after dep install | commit: a2debf7
- fix(deps): resolve expo-app-integrity peer dep conflict for Vercel build | commit: 1e403a9
- fix(security): harden Play Integrity verification (security review findings) | commit: 3c6c194
- fix(library): fix rate limit blocking normal library browsing | commit: 303788f
- fix(security): delete legacy public hexagram API routes (audit finding) | commit: c6bc636
- fix(security): server-side data isolation for library translations | commit: 13c19dd
- fix(web): noindex delete-account page and disallow crawling | commit: 4b3f03f
- fix(i18n): remove BOM from mobile-native-ui.ts | commit: 72dd87c
- fix(web): remove dead fields from notes page | commit: 3622c4d
- fix(i18n): restore characters corrupted by incorrect encoding on previous commits | commit: df61e00
- fix(security): revoke PUBLIC execute + deny-all policies on internal tables (migration 050) | commit: e61ba39
- fix(security): revoke RPC execute on trigger-only function (migration 049) | commit: 2063c96

### Maintenance
- chore(audit): resolve minor debt items from library-protection audit | commit: 630f2ed
- chore(release): bump version 3.4.3 / versionCode 36 | commit: f821f09

---

## [3.4.3] — 2026-06-01 | versionCode: 36 | Stage: Closed Testing

### Fix
- fix(mobile): fix chat drawer last item hidden behind Android nav bar | commit: 8e85dbe
- fix(feedback): remove locale dropdown — send locale silently from useAppLocale | commit: d10d1f9
- fix(ux): remove free_depleted token message and hexagram grid from notes | commit: f056fd7
- fix(mobile): fix getUserIdFromJwt base64url decode — root cause of purchase failures | commit: 3310d84

### Maintenance
- chore(i18n): remove dead fields and simplify TokenCenterMessageKey | commit: d34f163

---

## [3.4.2] — 2026-06-01 | versionCode: 35 | Stage: Closed Testing

### Maintenance
- chore(release): bump version 3.4.1 / versionCode 34 | commit: fcba50a

---

## [3.4.1] — 2026-06-01 | versionCode: 34 | Stage: Closed Testing

### New
- feat(faqs): add /delete-account link inside delete-account FAQ item (11 locales) | commit: e9d0440
- feat(compliance): restore /delete-account page for Play Store Data Safety | commit: cba82d7

### Maintenance
- debug(rc): expose actual RC getOfferings error in purchase dialog | commit: 97529b4
- chore(release): bump version 3.4.0 / versionCode 33 | commit: 2d65563

---

## [3.4.0] — 2026-06-01 | versionCode: 33 | Stage: Closed Testing

### Fix
- fix(auth): force full reload after legal consent to guarantee tour fires | commit: 663bc75
- fix(auth): remove pre-OAuth consent modal for Google users | commit: 65ee379
- fix(i18n): re-evaluate tokenCenterMessage on locale change | commit: ae61daf
- fix(billing): implement sync-billing — return live credits from Supabase | commit: c28edb4

### Maintenance
- chore(canvas): fix FLOW_LAYERS RC direction, add missing modules, fix API groups | commit: 9933dbb
- chore(release): bump version 3.3.9 / versionCode 32 | commit: 1410e8d

---

## [3.3.9] — 2026-05-31 | versionCode: 32 | Stage: Closed Testing

### Fix
- fix(tour): guard against re-trigger on concurrent account-refresh events | commit: 922dfe8
- fix(tour): trigger onboarding tour for auto-filled and google users | commit: 2b70a28
- fix(web): remove unused sessionIds variable left after .in() removal | commit: 0c6e260
- fix(chats): resolve infinite loading bugs for heavy accounts and chinese unicode | commit: afb67bb
- fix(mobile): unify legal consent backdrop to use --rn-safe-area-inset-bottom | commit: 5320302
- fix(mobile): use native bottom inset instead of buggy env() for chat drawer padding | commit: 7bfebfb
- fix(mobile): use identityCheckFailed message on RC logIn error; add migration 048 verify check | commit: fc68337
- fix(db): add extensions to search_path in init_free_user to resolve digest() | commit: 0013433
- fix(mobile): enforce RevenueCat logIn before purchase to prevent anonymous IDs | commit: 338f197
- fix(account): remove dropped alias table ref and silence RC 404 on delete | commit: bd63258

### Maintenance
- chore(release): bump version 3.3.8 / versionCode 31 | commit: 88b7264

---

## [3.3.8] — 2026-05-31 | versionCode: 31 | Stage: Internal Testing

### Fix
- fix(mobile): remove invalid react-native-purchases config plugin entry | commit: 890143c
- fix: revert migration 048 to no-op — trial email guard already in 046 | commit: 2294ef5
- fix(security): block free trial re-grant after delete+re-register, fix anonymize crash, fix legal double-prompt | commit: b5199b4
- fix(mobile): safe area for PackPickerModal and chat drawer list | commit: ad36c3d
- fix(mobile): add react-native-purchases Expo plugin | commit: 214c0fe
- fix(payments): resolve RevenueCat anonymous purchases automatically | commit: a42ab0c
- fix(security/billing): block free trial re-grant after account delete+re-register | commit: 1279093
- fix(mobile/security): hermetic SQLite isolation — no cross-user data leaks | commit: 0120c50
- fix(mobile+web): prevent cross-user SQLite contamination and silence Sentry noise | commit: 8c64658
- fix(auth): auto-populate display_name for Google OAuth users | commit: 103c8e3

### Maintenance
- chore(db): add migration verification script | commit: 4adbca1
- chore: remove migration 048 — free trial guard already complete in 046 | commit: 9d46337
- chore(mobile): bump version 3.3.7 / versionCode 30 | commit: 5e98736

---

## [3.3.7] — 2026-05-31 | versionCode: 30 | Stage: Closed Testing

### Fix
- fix(mobile/billing): configure RevenueCat with stored UID on cold start | commit: 7b433a4
- fix(mobile+web): clear stale sidebar chats when SQLite confirms empty account | commit: 5a9b141
- fix(mobile/cache): evict stale SQLite chats when server confirms empty account | commit: 102ceec
- fix(db): allow intentional tier downgrades in grant_tokens (corrects 043) | commit: 0b14e69
- fix(billing+mobile+drawer): three independent bug fixes | commit: 86fabf3
- fix(changelog): remove --all flag, fix window ordering, correct stage threshold | commit: fb0cdd1

### Docs
- docs(claude): mark CI actions upgrade as done (v6, 2026-05-31) | commit: 1f76095

### Maintenance
- chore(ci): upgrade actions/checkout and setup-node to v6 | commit: 2cb197c

---

## [3.3.6] — 2026-05-31 | versionCode: 29 | Stage: Closed Testing

### Fix
- fix(mobile): chat drawer list respects Android bottom nav safe area | commit: 2864db8

### Maintenance
- chore(mobile): bump version 3.3.6 / versionCode 29 | commit: 392a717

---


## [3.3.5] — 2026-05-31 | versionCode: 28 | Stage: Closed Testing

### Fix
- fix(billing+chats): tokens not granted after purchase; chat delete fails silently | commit: f51743b

### Maintenance
- chore(mobile): bump version 3.3.5 / versionCode 28 | commit: 01d911e

---


## [3.3.4] — 2026-05-30 | versionCode: 27 | Stage: Closed Testing

### Maintenance
- chore(assets): resize pack icons to 512x512 — reduce AAB size | commit: b56447f
- chore(mobile): bump version 3.3.4 / versionCode 27 | commit: 1717b0e

---


## [3.3.3] — 2026-05-30 | versionCode: 26 | Stage: Closed Testing

### New
- feat(feedback): replace native <select> with themed custom dropdown | commit: 137d776
- feat(billing): replace Alert.alert pack picker with visual modal cards | commit: 9e4d8dd

### Fix
- fix(changelog): insert new release at top instead of appending at bottom | commit: 19b9565
- fix(feedback): add explicit text color to custom select rows for both themes | commit: 883f4b6

### Docs
- docs(changelog): fix 3.3.2 entry order — move to top (newest first) | commit: 0eb7dc8

### Maintenance
- chore(mobile): bump version 3.3.3 / versionCode 26 | commit: 66dbca5

---


## [3.3.2] — 2026-05-30 | versionCode: 25 | Stage: Closed Testing

### New
- feat(faq): convert delete-account doc to FAQs + add delete-chats FAQ | commit: d048578
- feat(consult-panel): add Tutorial label before info icon in header button | commit: 7197db9
- feat(danger-zone): style delete-account btn to match other action buttons | commit: 9bb750c
- feat(feedback): add user feedback page with Supabase storage and rate limiting | commit: 96d2da8
- feat(i18n): move theme toggle labels to @iching-oracle/i18n | commit: c5f155f
- feat(i18n): stage 1 — audit CI and migrate home UI copy to package | commit: 6a14b38
- feat(i18n): stage 2 — complete token-panel and two-factor locale records | commit: e49a395
- feat(i18n): stage 3 — wire PDF export and 2FA email to app locale | commit: 0d7cd40
- feat(i18n): stage 4 — SEO hreflang, backend locale fallbacks, and context theme | commit: 573045d
- feat(i18n): localize app shell title and consult API error messages | commit: 7f8a2a9
- feat(billing): implement native Google Play Billing via RevenueCat | commit: 02ee288

### Fix
- fix(options-panel): remove delete-account doc link + rename to Danger zone | commit: 4e7b20f
- fix(faq): remove long-press and em dashes from delete-chats/delete-account answers | commit: bc5d202
- fix(i18n): use DEFAULT_LOCALE in credits exhausted fallback | commit: 30ab092
- fix(feedback): detect WebView platform and native app version | commit: 8efd492
- fix(changelog): correct EAS build command in pre-release checklist | commit: 83e068b
- fix(webview): suppress GPU compositing glitches on scroll in Android WebView | commit: 0dfe0a8
- fix(db): tighten feedback RLS — drop redundant service_role policy and replace WITH CHECK (true) | commit: a4daa81
- fix(tour): scope step-8 spotlight to doc links only; remove duplicate feedback btn from FAQs | commit: 20fbf85
- fix(options-panel): restore doc links vertical layout after tour refactor | commit: 5b0c9a6
- fix(prompt): name active translator explicitly — prevent cross-translator bleed | commit: 8059bb4
- fix(prompt): scope translator rule to current reading — permit historical arc references | commit: 2cce477
- fix(prompt): scope translator rule to current reading — permit historical arc references | commit: a14a340
- fix(prompt): add explicit SELECTED_TRANSLATOR metadata field before BIBLIOTECA | commit: 980574b

### Docs
- docs(i18n): add language expansion guide for development agents | commit: 93f782c
- docs(i18n): add language expansion guide for development agents | commit: 1023a55
- docs(readme): align language count with 11 supported locales | commit: 3b28870
- docs(i18n): align workflow guides with post-standardization state | commit: 841581b
- docs(changelog): generate full project changelog and add update script | commit: 1e899f1

### Maintenance
- chore(docs): organize .md files into docs/ with categories | commit: 4f0597a
- chore(i18n): stage 5 — update expansion guide and remove dead chat-suggestions | commit: 9f5fc8b
- chore(agents): refresh learned preferences after i18n standardization | commit: 957e277
- chore: trigger redeploy — update Axiom env vars | commit: 5d5ba78
- chore(i18n): replace dialectical/dialéctico with unified interpretation across all 11 locales | commit: 2062133
- chore(mobile): bump version 3.3.2 / versionCode 25 | commit: 99d4993

---


## [3.3.1] — 2026-05-29 | versionCode: 24 | Stage: Closed Testing

### New
- feat(onboarding): add react-joyride tour with 7 steps in 11 languages | commit: 65a8dce
- feat(onboarding): fix tour trigger + add custom styled tooltip | commit: baf1fa7
- feat(onboarding): add Nueva Sesión step (step 2) to tour | commit: 169c98c
- feat(claude): implement cache diagnostics (cache-diagnosis-2026-04-07) | commit: 51e1e33
- feat(onboarding): replace ? text with compass SVG icon on tutorial replay button | commit: dfd89dd
- feat(onboarding): add info SVG icon to Tutorial button | commit: fe91bd4
- feat(onboarding): dark mode spotlight fix + docs/FAQs step (9 steps total) | commit: 49ae6fc
- feat: password visibility toggle + logout confirmation dialog | commit: b758130

### Fix
- fix(security): harden WebView security settings in Android shell | commit: 9885963
- fix(prompt): enforce thread continuity in opening paragraph for all I Ching modes | commit: e7649d1
- fix(prompt): expand Oracle Bones word budget when thread context exists | commit: 4a211ee
- fix(prompt): enforce full session arc in thread references and SNAPSHOT | commit: 410970a
- fix(api): raise maxDuration and MAX_TOKENS for Master deep threads | commit: 75d13cb
- fix(api): raise maxDuration and MAX_TOKENS for Master deep threads | commit: b75075b
- fix(output): strip CATEGORY line even when model prefixes with ## heading | commit: 7112366
- fix(mobile): skip parallel Supabase API call in RN thread loading | commit: 9bb3abc
- fix(api): distinguish DB errors from session-not-found in chats GET | commit: 4d96052
- fix(db): raise statement_timeout for PostgREST roles to 30s | commit: 4f761e7
- fix(library): allow admin to bypass free-tier gate on library button | commit: 2af1a27
- fix(rate-limit): fail-closed when Upstash credentials are invalid/rotated | commit: 3436e8f
- fix(onboarding): scroll panel to target before each inner step | commit: 0effd26
- fix(onboarding): fix step 5 target and race condition on panel steps | commit: cc71917
- fix(header): anchor logo to center + replace compass with Tutorial pill button | commit: e694725
- fix(onboarding): align Tutorial button + green tint + shorten label | commit: c46ee0c
- fix(ci): sync package-lock.json with react-joyride and its dependencies | commit: c1736ab
- fix(onboarding): mobile APK tour fixes | commit: 2d15e8c
- fix(onboarding): dark mode overlay — low opacity + SVG spotlight stroke | commit: 76e8d78
- fix(onboarding): instant scroll + correct placement for panel steps | commit: e5cc953
- fix(header): move info icon between Chats and logo | commit: fa9ca98
- fix(header): move tour-info icon into consult panel header | commit: 7141d59
- fix(consult-panel): match info btn shape to Cerrar, keep green colors | commit: 5de6e75
- fix(login): vertically center eye toggle button in password field | commit: 13b807f
- fix(login): fix eye icon vertical centering via display:flex on wrapper | commit: b73ef1f
- fix(login): use CSS Grid overlay for eye icon — guaranteed vertical center | commit: 7c0eaed
- fix(login): CSS class approach for eye icon — block input + top:50% transform | commit: 43eb404
- fix(login): inline styles only for eye toggle — bypasses CSS cache | commit: 50fbf7f
- fix(login): fix eye icon — margin:0 resets global button{margin-top:0.75rem} | commit: 9332444

### Security
- security: remediate pentest findings H1–H5 | commit: 3d773ab

### Docs
- docs(claude): correct token counts and warn against changing pack IDs | commit: b348101
- docs: update README, architecture audit, and DB setup guide | commit: febd5fe
- docs(migrations): expand 040 comment with full historical context | commit: 3653512

### Maintenance
- chore(db): migration 037 — grant is_admin to app owner account | commit: dafd1a4
- chore: remove dead code revenuecat-alias-map + rollback migration | commit: 1ba4b94
- chore(mobile): bump version 3.3.1 / versionCode 24 | commit: 1a5c424

---


## [3.3.0] — 2026-05-25 | versionCode: 23 | Stage: Closed Testing

### Fix
- fix(csp): add base-uri, form-action, object-src directives | commit: 4abd651
- fix(security): route ritual debug logs through Axiom instead of console | commit: fd96d69

### Maintenance
- chore(mobile): bump version to 3.3.0 (versionCode 23) | commit: fbdeaef

---


## [3.2.9] — 2026-05-24 | versionCode: 22 | Stage: Closed Testing

### New
- feat(web): IndexedDB cache for chat list and thread content | commit: a80e49f
- feat(legal): add support@theoriginaliching.com contact link in Terms section 10 | commit: a4ad475
- feat(mobile): redesign offline screen v2 — brand logo, fix transparent bleed-through | commit: 9e93778
- feat(mobile): offline screen full-bleed image layout — text overlaid on bottom band | commit: 357c311

### Fix
- fix(seo): canonical tags, hreflang, sitemap update — resolve Search Console indexing issues | commit: 98decea
- fix(seo): remove /library from sitemap and disallow crawling — premium content | commit: a541496
- fix(seo): fix pricing layout type error — async function for Next.js 15 React types compat | commit: 9af2867
- fix(prompt): enforce second-person address — prevent third-person narration when displayName is set | commit: 0e41a35

### Maintenance
- chore(mobile): bump version to 3.2.9 (versionCode 22) | commit: cb8ea88

---


## [3.2.8] — 2026-05-21 | versionCode: 21 | Stage: Internal Testing

### New
- feat(mobile): custom offline screen with animated radar when WebView fails | commit: afaa88f
- feat(mobile): simplify offline screen — Signal Lost / The oracle is waiting | commit: 93ca2a3

### Maintenance
- chore(mobile): bump version to 3.2.8 (versionCode 21) | commit: cbfd016

---


## [3.2.7] — 2026-05-21 | versionCode: 20 | Stage: Internal Testing

### Fix
- fix(mobile): remove READ_MEDIA_IMAGES/VIDEO permissions + bump to 3.2.7 (versionCode 20) | commit: e3086c3

### Maintenance
- chore(mobile): sync package.json version to 3.2.6 | commit: be2444c

---


## [3.2.6] — 2026-05-21 | versionCode: 19 | Stage: Internal Testing

### New
- feat: implement full account deletion flow for Google Play compliance | commit: d239b5b
- feat(i18n): full localization of account deletion flow | commit: 76477c4
- feat: merge account deletion flow into staging | commit: 4bfe2de
- feat: merge staging → main (account deletion flow) | commit: e56db2e
- feat(mobile/db): add expo-sqlite schema and chat-store for local cache | commit: 9da23ec
- feat(mobile/sync): background sync service and opportunistic image cache | commit: b61ba48
- feat(mobile): integrate SQLite sync and cached-chats injection into WebView shell | commit: 486eb42
- feat(web): consume rn:cached-chats event from native SQLite injection | commit: 401673d
- feat(mobile): implement SQLite stale-while-revalidate cache for chat list | commit: 84f3050
- feat(cache): offline-first conversation cache — WhatsApp model | commit: 4aae78b

### Fix
- fix(pdf): word-boundary wrapping + readable mutation rule label | commit: dba3197
- fix(pdf): justified canvas text + summary matches app reading card | commit: 9451e70
- fix(i18n): delete-account page — locale-specific confirm word, corrected provider/email copy | commit: 3aa21b9
- fix(i18n): sync delete-account page corrections from main | commit: 1709e79
- fix(images): retry overlay+watermark on local fallback when R2 fetch fails silently | commit: 2a5a9d9
- fix(bones): remove Silence verdict — no archaeological basis in Shang tradition | commit: f462f43
- fix(webview): block accidental navigation to production domain in staging APK | commit: 90b2648
- fix(webview): generalize cross-origin guard to all environments | commit: 2fbeaba
- fix(bones): remove Silence verdict — no archaeological basis in Shang tradition | commit: a1a8e3a
- fix(ci): update package-lock.json with expo-sqlite@14.0.4 | commit: 621032c
- fix(mobile): re-export initDb from chat-store — fixes crash on mount | commit: 1654e45
- fix(mobile): replace deprecated moduleResolution=node with bundler | commit: 4ce987d
- fix(mobile): eliminate slide-up animation when cached thread data arrives | commit: 79ec8ab
- fix(mobile): defer loading indicator so SQLite cache eliminates brief flash | commit: 5c1a3bb
- fix(cache): sync SQLite on chat delete and account deletion | commit: bc7e23c

### Docs
- docs(legal): add permanent account deletion section to Privacy Policy and Terms | commit: 6bd2d30
- docs: add DIVINATION_METHODS_AUDIT.md — technical reference for all oracle methods | commit: 60115a6
- docs(claude): document Windows glob fix for expo prebuild and mobile cache feature | commit: 0c58c7e
- docs: rewrite ARCHITECTURE_AUDIT.md — complete A-to-Z architecture reference | commit: 3b5fe41

### Maintenance
- test(images): FORCE_TOGETHER_FAIL env flag to bypass Together AI for fallback testing | commit: 5983171
- revert(images): remove FORCE_TOGETHER_FAIL test flag, restore normal Together AI flow | commit: 2fe4123
- merge(staging): local storage SQLite, WebView cross-origin guard, silence removal | commit: dc5c6e9
- merge(main): local storage SQLite, WebView cross-origin guard, silence removal | commit: 70cdabf
- chore: ignore keystore backups and temp sim scripts | commit: c2f0828
- refactor(cache): 3-tier local-first architecture — lazy per-chat sync | commit: 58b56c4
- chore(mobile): bump version to 3.2.6 (versionCode 19) | commit: 9d418be

---


## [3.2.5] — 2026-05-18 | versionCode: 18 | Stage: Internal Testing

### Maintenance
- chore(mobile): bump version 3.2.5 / versionCode 18 | commit: 12ac967

---


## [3.2.4] — 2026-05-18 | versionCode: 17 | Stage: Internal Testing

### Fix
- fix(eas): suppress Expo Go warning and clean cached native dir before prebuild | commit: 64e3ef5
- fix(eas): add root .easignore so apps/mobile/.env reaches Metro bundler + bump 3.2.3/16 | commit: 79f61da
- fix(mobile): handle PKCE auth/callback deep link so Google OAuth returns to app | commit: a7bd129

### Maintenance
- chore(mobile): link EAS project to alexcat84, switch to local keystore credentials | commit: b93e4ad
- chore(mobile): bump version 3.2.4 / versionCode 17 | commit: e15e42e

---


## [3.2.2] — 2026-05-18 | versionCode: 15 | Stage: Internal Testing

### Fix
- fix: strip orphaned [SNAPSHOT_END], PDF saves to Downloads with permission + bump 3.2.2/versionCode 15 | commit: 2bd1de5

---


## [3.2.1] — 2026-05-18 | versionCode: 14 | Stage: Internal Testing

### Fix
- fix(mobile): respect native dialog confirmation before removing chat + bump 3.2.1/versionCode 14 | commit: 6afead0

### Maintenance
- chore(mobile): bump versionCode to 13 for production Play Store AAB | commit: e6fe089

---


## [3.2.0] — 2026-05-17 | versionCode: 12 | Stage: Internal Testing

### New
- feat(i18n): add library unlock and translator label to Seeker pack description | commit: 61744a3

### Fix
- fix(ci): commit package-lock.json with next-axiom entry | commit: 5903471
- fix(i18n): align pack descriptions in all 10 languages with Spanish source of truth | commit: 61e3878
- fix(i18n): ES as single source of truth — FAQ, pack descriptions, credits notices | commit: 1e01de3
- fix(hydration): eliminate React #418 caused by localStorage read in useState initializer | commit: 42c3daa

### Maintenance
- chore(mobile): add .easignore to exclude android dir from EAS archive | commit: 1da3622
- chore(mobile): add staging-aab build profile for Play Store submission testing | commit: c77c3b0
- chore(mobile): bump version to 3.2.0 / versionCode 12 for production Play Store AAB | commit: a712675

---


## [3.1.8] — 2026-05-17 | versionCode: 11 | Stage: Internal Testing

### New
- feat(i18n): translate guide/FAQ sections for all 11 locales + remove Zhou Yi inline translation | commit: c417049
- feat(r2-fallback): hexagram-specific fallback image generator (2,760 WebP) | commit: 8c457c9
- feat(r2-fallback): integrate Cloudflare R2 as primary image fallback | commit: 9761b5d
- feat(logging): structured Axiom logging across Next.js web app | commit: 4362651

### Fix
- fix(android): always use light color-scheme on inputs + add forceDarkAllowed=false plugin | commit: 90431b4
- fix(android): disable spellcheck/autocorrect on chat textarea | commit: 6ddcfe2
- fix(android): remove forceDarkOn prop to prevent crash on Android 11 | commit: 8ceb9b4
- fix(build): resolve all Sentry deprecation and Turbo env-var warnings | commit: 782b58d

### Maintenance
- revert: restore spellCheck on chat textarea | commit: d24591b
- chore(mobile): bump version to 3.1.8 (versionCode 11) | commit: 2237ae9

---


## [3.1.7] — 2026-05-16 | versionCode: 10 | Stage: Internal Testing

### New
- feat: update seeker tokens 20→25 and practitioner tokens 40→50 | commit: 4deee43
- feat(yarrow): implement Yarrow Stalks casting method | commit: a45f4bb
- feat(yarrow): Block A — chip selectors, dynamic hint, em dash cleanup | commit: ef59d86
- feat(yarrow): replace chip selectors with sliding oracle toggle | commit: 5b6a143
- feat(yarrow/B1): format-invariance instruction in buildCurrentCastPrompt | commit: 1a258e2
- feat(yarrow): compact wizard layout and stalks dividing animation (Block C) | commit: 90f8f53
- feat(i18n+tests): Block D — full i18n for yarrow wizard and unit tests | commit: dc9d59f
- feat(docs): Block E — Yarrow Stalks section in user guide (all 11 locales) | commit: 546aa6e
- feat(i18n): Block F — FAQ yarrow vs coins, notes yarrow section, wizard warning | commit: e4e80a2
- feat(docs): reorganize /faqs into categories and /guia by practical sections | commit: c6f9b5d
- feat(wizard): G+H — step-by-step yarrow wizard redesign and em dash cleanup | commit: 7437a79
- feat(wizard): add physical-coins intro screen to coin wizard | commit: 24e297a
- feat(library): add I Ching hexagram library with Wilhelm/Legge/Zhou Yi datasets (PR1) | commit: 8063006
- feat(web): Move library access to dedicated drawer section | commit: 3e42494
- feat(web): Disable library link for free tier users | commit: b676613
- feat: integrate premium library access messaging across locales | commit: c34e878
- feat(library & anthropic): implement premium library i18n texts and Anthropic API prompt caching | commit: 60df9a4
- feat(ui): bottom doc-nav in all doc pages, fix dark-mode webkit-text-fill, maxLength=1500 on chat textarea | commit: 1e518c6
- feat: Etapa 1 - Soporte para selección de traductores (Wilhelm, Legge, Zhou Yi, Master) en frontend y backend | commit: 5d0e781
- feat: Etapa 2 - Integración de múltiples traducciones simultáneas en prompt (Master Synthesis) | commit: a5c5027
- feat: complete multi-translator documentation and UI polishing | commit: 1f4f23c
- feat: align master (3) UI toggle styling and update pack features/FAQ across all 11 locales | commit: 669721c
- feat: implementar bloqueo UI Master mode y actualizar escalera de valores | commit: feccedb
- feat: tooltip flotante en Master (3) y nombres reales en seccion docs de la guia | commit: 0dc5eba
- feat(hardening): F2-F3 implement resilience, backoff, observability and decoupled stream | commit: c7cc2d3
- feat(oracle-bones): add identifier card and standardize summary layout | commit: dfbadb9
- feat(translator): persist translator field in DB and wire through full chain | commit: 083689b
- feat(prompt-cache): stabilize system block for real cache hits | commit: ffc0b29

### Fix
- fix(chat): stale-while-revalidate — skip spinner on back-navigation | commit: ef4ffe5
- fix(chat): instant scroll on mount to eliminate back-navigation slide | commit: c421315
- fix(prompt): enforce italic-only for hexagram text quotes, never bold | commit: a6683d5
- fix(fonts): cobertura latin-ext en webfonts y body para pinyin | commit: 3c89b98
- fix(consult): centra el thumb del oracle-toggle dentro del track engrosado | commit: f21518b
- fix(library): serialize i18n function fields before passing to client components | commit: 872f17b
- fix(library): search scoring, yong-line fix, table layout for lines | commit: 89f8425
- fix(library): strict numeric search, better table row spacing | commit: 07c94d6
- fix(library): visible yin/yang line gap, wider symbol column | commit: 0c80374
- fix(library): equal-width yin/yang line symbols, bolder stroke | commit: 2d33014
- fix(library): halved line width, equal yin halves | commit: d40df18
- Fix: restored missing button closing tag in composer | commit: 89124a0
- Fix: Unclosed CSS block in globals.css after text alignment cleanup | commit: 0e81c8a
- Fix: Corregir error de sintaxis en About page (tag duplicado) | commit: 4e68018
- Fix: Eliminar importaciones y funciones no utilizadas tras refactor de TrigramPicker | commit: 6243686
- Fix: Eliminar import isTrigramId no utilizado | commit: 75e3ce6
- fix(ui): blindaje de selector de traductor y variables Sentry en turbo.json | commit: f53235b
- fix: ajustar dirección del tooltip de Master (3) hacia abajo para evitar recortes de overflow y limpieza de scripts | commit: 63bba47
- fix: permitir visibilidad del tooltip Master (3) mediante overflow: visible !important | commit: 2d164f4
- fix: bloqueo de tier con jerarquia ordinal en handleTranslatorChange + overflow visible en tooltip | commit: 0e7172d
- fix: tiers array con indexOf en handleTranslatorChange, overflow visible en track padre, reset loading en nueva sesion | commit: 59a201e
- fix: enforce tier ladder, session isolation, and master mode activation | commit: 319e0de
- fix: harden master consult flow and improve cache observability | commit: f656bc3
- fix: improve library framing and raise consult input limits | commit: 778ad62
- fix: diversify together image prompts for both oracle modes | commit: a213b48
- fix: align master prompt triangulation and tooltip i18n | commit: ccafedb
- fix: strengthen master outputs and isolate thread context | commit: bde4fb6
- fix: restore thread memory quality and prevent repeated fallback outputs | commit: 9a1caab
- fix: prioritize personal thread memory in oracle summaries | commit: 8f11606
- fix: keep flux2 model with docs-safe sizing and no fake time cues | commit: 71052d9
- fix: raise tier resolutions with 4MP-safe Together sizing | commit: c9914ad
- fix: cap together tier output to <=1mp for cost control | commit: 4a88605
- fix: restore tier resolutions, FLUX.2-dev steps 30, SNAPSHOT leak filter, tooltip reposition + i18n | commit: 6a34593
- fix: restore tier resolutions, FLUX.2-dev steps 30, SNAPSHOT leak filter, tooltip reposition + i18n | commit: 6d878ec
- fix: repair interpretation stripping regex, image diversity, and Master cost badge | commit: dafc846
- fix: blockquote format for Lines in motion, oracle bones seed diversity, Together AI timeout | commit: 8b5b419
- fix: real image diversity — rotating elements and environment for all categories | commit: 15dd7e3
- fix: Together AI reliability — steps, timeout, remove undocumented response_format | commit: 2d741cd
- fix: switch default model to FLUX.1-schnell at 12 steps for timing reliability | commit: 95d7c9a
- fix: language override — detect Italian/PT wrong-language responses, strengthen instruction | commit: cf43f6d
- fix: language detection hierarchy — question language > selector > ignore context | commit: 419a642
- fix: generalize language instruction — remove hardcoded language examples | commit: ed46f1d
- fix(i18n): update docs to reflect 3 translators and oracle-native Bones language | commit: 2acf32d
- fix(image): remove negative_prompt for FLUX.1-schnell, add overlay on fallback, remove bamboo/cultural contamination triggers | commit: d5ce08e
- fix(i18n): redirect all token/billing FAQ items to Token Center across 11 languages | commit: 204ef9f
- fix(claude): build error in oracle-bones-interpretation and unused variable | commit: 4cd5720
- fix(web): use Promise for route params in Next.js 15 | commit: 5b3660d
- fix(web): remove unused getTokenBalance import | commit: 2d37825
- fix(web): resolve getHexagram param mismatch and unused request var | commit: 0cede36
- fix(scale-hardening): audit corrections — sentry node pkg, oracle-bones retry, withSentryConfig, env.ts import, static hexagram params | commit: da10756
- fix(interpretation): suppress system messages from user-facing response and enforce blockquote formatting | commit: 60ecbb5
- fix(test-image-pipe): composite pipeline completo — auto-load .env, resvg render, sharp composite | commit: 0f102e9
- fix(fallback-image): apply hexagram overlay to prebuilt local fallback images | commit: 6b49380
- fix(test-image-pipe): production-identical overlay — Chinese chars, centered hexagram bars, auto-open | commit: 56bc13d
- fix(session-depth): scope thread depth limit per oracle type; fix changing-line blockquote rule | commit: f477e8f
- fix(db): drop legacy single-param consume_token left by migration 032 | commit: 8b7f173
- fix(session-depth): always verify session in DB regardless of isDeepening flag | commit: 8d6f5e7
- fix(oracle-bones): full thread history, no heading, clean card | commit: ca9a910
- fix(dark-mode): increase chat bubble border contrast | commit: 263905d
- fix(dark-mode): visible borders on consultation-record card and dividers | commit: bd3322e
- fix: blockquote rule, shared thread history, translator field in card | commit: a2126b2
- fix(session-store): cascade fallback for missing translator column + FAQ token-center i18n | commit: b5ae30d
- fix(apk): defer chat delete until native dialog confirmed; clean oracle bones card | commit: dbfeebe
- fix(oracle-bones): add dividers after verdict header and before both section headings | commit: e66603e
- fix(oracle-bones): overlay verdict glyph on prebuilt fallback when Together fails | commit: 5a43950
- fix(locale-picker): add no-theme CSS fallback to prevent unstyled trigger on first load | commit: f06d4bc
- fix(locale-picker): add no-theme fallback to dropdown menu styles | commit: 8e92504
- fix(apk+zhouyi): preserve Chinese verbatim in blockquotes; disable WebView force dark | commit: 983cea2
- fix(translators): enforce universal source fidelity across all three libraries | commit: a32fd36

### i18n
- i18n(yarrow): shorten toggle section labels across all locales | commit: fd3512b
- merge(staging): feature/yarrow-stalks — yarrow wizard + docs + i18n | commit: 5ce91d4
- merge(main): staging — yarrow wizard + docs + i18n | commit: e43e100
- Remove AI references from Zhou Yi classical notice across all 11 locales | commit: 69c30e8
- Remove Zhou Yi classical notice entirely from UI and i18n | commit: 59ee938
- UI: Eliminación quirúrgica definitiva del texto de profundidad del hilo y limpieza total de i18n asociado en las 11 locales | commit: 8f3bf7c
- Refinamiento de UI de traductores, corrección de locales y color premium | commit: 520e7d8
- merge(staging→main): oracle bones card, translator field, dark-mode borders, cache fallback, FAQ i18n | commit: d60e822

### Docs
- docs(ci): document Node.js 20 action upgrade deadline (2 Jun 2026) | commit: fe5fa2b
- docs(i18n): add Oracle Bones FAQ, drop probability internals, reorder /notes | commit: 355f864
- docs(notes/faq): grid de los 64 hexagramas, FAQ de mecanismo del I Ching y 5 estados Huesos | commit: ae385b1
- docs: refinamiento del tono a Maestría Silenciosa y actualización de Pilares de Sabiduría | commit: 737354e
- docs: reestructuración final del manual funcional y maestría premium | commit: e7a15f9

### Maintenance
- chore(mobile): exclude react-native-screens and @sentry from expo doctor check | commit: 29d5607
- refactor(i18n+ui): remove em dashes from all user-facing strings | commit: fb8b4ef
- refactor(i18n+docs): consolidate duplicate content — single source of truth | commit: 10597d3
- chore(ci): fix failing CI — update lockfile and bump Node to 22 | commit: d0c24a4
- chore(ci): pin npm@11.5.1 in CI to match lockfile generator | commit: 5c00e90
- chore(ci): install rollup Linux binary after npm ci | commit: b38c495
- chore(ci): disable corepack and revert packageManager field | commit: 4ce3009
- chore(ci): remove packageManager field to fix yarn registry detection | commit: a53e4c6
- chore(ci): restore packageManager and pin yarn@1.22.19 | commit: 226a771
- style(notes): agranda los hexagramas y reordena tarjeta del grid | commit: 89287b1
- style(consult): sweep en switch I Ching/Huesos y borde más marcado en toggles claro | commit: 4b35395
- style(consult): borde 2px en oracle-toggle-track para igualar switch I Ching/Huesos | commit: 7190d10
- style(consult): unifica tipografía de labels del panel y refuerza CONSULTAR | commit: 7f61085
- merge(main): staging — pinyin font fix + consult panel polish | commit: b610292
- Replace Unicode line symbols with CSS-drawn glyphs for pixel-perfect alignment | commit: 05cf64a
- Center line glyphs vertically in table cells | commit: 3272aa8
- Add text-card containers for Judgment/Image and remove duplicate Lines header | commit: 13f5b65
- refactor(web): Sever navigation links between docs and library | commit: 24be01c
- UI: fixed dark mode selects, mobile spellcheck, and documented 1500 char limit across 11 languages | commit: 29e58d9
- UI: minimalist character counter with absolute positioning | commit: 53517f3
- UI: repositioned character counter inside visible area | commit: c3cf051
- Adición de la librería completa de los hexagramas en los tres textos literarios | commit: c4a5221
- Adición de la librería completa de los hexagramas en los tres textos literarios | commit: 80e0e1d
- Adición de la librería completa de los hexagramas en los tres textos literarios | commit: 9728c48
- Fix syntax error in globals.css for library tabs | commit: 5749ba8
- Refactor library header layout and optimize tabs for mobile | commit: fa4ad1a
- Restore text justification for docs and library prose, keeping start alignment for stanzas | commit: 92dd52d
- Restore justify alignment for chat interpretation markdown elements | commit: 5a803ec
- Redesign library tabs to professional segmented style and justify line descriptions | commit: b0eeaa6
- Change library tabs to classic folder style | commit: 23ad086
- Fix incorrect lower trigram label for Hexagram 23 (Mountain over Earth) | commit: 07a6132
- Fix source metadata for Hexagram 23 (Mountain over Earth) in Wilhelm translation | commit: 617a144
- Documentación de auditoría de integridad de datos y actualización de FAQ multi-idioma | commit: 1b04f40
- Corrección estructural de FAQ y finalización de internacionalización de auditoría | commit: 29712fd
- Adición de control de cambios al documento de integridad de datos | commit: 319509a
- Actualización de auditor oficial en el log de integridad | commit: b961e1b
- Auditoria de integridad completada y actualizacion de fuentes academicas (Parma, Sacred-Texts, CTP) | commit: 822fd93
- chore: remove temporary audit scripts | commit: 83c9ae7
- Estandarización bibliográfica completa y corrección de paridad técnica en Biblioteca de Hexagramas | commit: 8810ac1
- Sincronización de contenido español en Notas y Origen de Métodos | commit: fd1ce52
- Estandarización de localización: Migración de español de España a español latino neutro en FAQ y 2FA | commit: cd412b8
- Refinamiento de UI: Estilización de fuentes académicas y simplificación de navegación en About | commit: 166dc33
- Mejora de UX: Implementación de Web Share API para exportación de PDF e imágenes en móviles | commit: d9d7b3e
- Revert: Restaurar lógica de descarga original para interceptación del puente nativo | commit: c5d8a28
- Mejora nativa: Implementación de Storage Access Framework (SAF) para descarga de PDF en Android | commit: 8c265b9
- UI: Eliminaci\u00F3n de textos de ayuda en el composer para ganar espacio vertical | commit: c559386
- Revert "UI: Eliminaci\u00F3n de textos de ayuda en el composer para ganar espacio vertical" | commit: a9e1548
- UI: Eliminar texto descriptivo del selector de modo (modeIChingHint/modeBonesHint) para liberar espacio en panel de consulta | commit: 0f426b8
- UI: Eliminar texto 'Plan X · este hilo admite hasta N lectura(s)' del panel de consulta para liberar espacio | commit: f196988
- Fix build: eliminar page_old.tsx corrupto + UI cambios quirurgicos (caption selector modo + plan suffix) en los 11 idiomas | commit: c9912ae
- UI: Remarcado de divisiones en pestañas de traducción de la biblioteca (soporte claro/oscuro) | commit: d38fed2
- UI: Eliminar contador de caracteres del composer para evitar solapamientos | commit: 475db53
- UI: Sustituir selectores nativos por TrigramPicker premium en la biblioteca | commit: 24ff0b8
- style: Afinar selector de traductor usando la variante de 4 opciones del pill animado | commit: 3fc8be0
- merge(feat/scale-hardening): image fallback overlay, blockquote formatting, oracle bones thread memory | commit: 9466d1a
- revert(session-depth): restore shared thread depth limit across oracle types | commit: b36b90b
- chore(mobile): bump version to 3.1.7 / versionCode 10 | commit: b6b8042

---


## [3.1.6] — 2026-05-07 | versionCode: 9 | Stage: Internal Testing

### New
- feat(iching): manual three-coin cast mode with preview and API validation | commit: d116551
- feat(web): Kangxi cash coins + instant dual-hex ritual for manual I Ching | commit: 8cc1053
- feat(web): compact manual coin wizard; add expo export test artifacts | commit: c1847b8
- feat(iching): equilibrar tiempos del ritual en modo manual | commit: 3dff5f5
- feat(images): más diversidad de composición sin reintroducir triggers de glifos | commit: 795efe2
- feat(images): clean-plate positive line + trim prompts for FLUX 2000 budget | commit: b519ba1
- feat(images): diversify light/water/forest vs moon-mist; rebalance category themes | commit: 2cbe671

### Fix
- fix(bones): degradar ritual a fallback 2D si WebGL no está disponible | commit: 1e65f6d
- fix(bones): primer frame WebGL oculto, sin getContext redundante, teardown y webglcontextlost | commit: bfa141d
- fix(web): restore bone ritual rendering to match staging | commit: 488fb61
- fix(web): legible Kangxi cash coin + bronze rim + i18n copy | commit: 0e8d04f
- fix(web): manual cast UX, chat width, image negative-prompt order | commit: abe9bfa
- fix(web): restore browser chat column and bubble text widths | commit: e47cefe
- fix(web): manual coin SVG, wizard jump-to-step, Together negative_prompt | commit: 856e1da
- fix: restore main anti-corner prompt copy, Together 1500 cap, coin rim in SVG | commit: 43da53d
- fix(image): I Ching FLUX prompt aligned with bones; wizard progress UI | commit: 0c1e577
- fix(images): restore landscape-first I Ching prompts for Together FLUX | commit: f7bd209
- fix(images): mitigar sellos FLUX y documentar pipeline de prompts | commit: 1eba125
- fix(images): sesgo ilustrativo fantasy y fusión .env en script de muestras | commit: 077f7ce
- fix(iching): finale manual acoplado al tiempo de respuesta del servidor | commit: 3a61c27
- fix(iching): modo manual nunca pide stream_ritual por error de payload | commit: 277b683
- fix(iching): body explícito auto vs manual; imagen con más variación | commit: d83abc1
- fix(ritual): cap coin tick delay; tighten FLUX anti-signature negative | commit: 9b5c974
- fix(ritual): drop stacked 900ms pause after SSE stream_ritual completes | commit: f303cef
- fix(ritual+images): align auto tick budget ~36s; break patio-bench trope | commit: 4304669
- fix(ritual): decouple manual gating and scale reveal to wall time | commit: cd19456
- fix(ritual): set 62-38 timing with untimed finale | commit: e13e463
- fix(ritual): hold final stage until response render | commit: d0f28f1
- fix(ritual): ensure manual finale paints before reading | commit: b783275
- fix(ritual): split manual phase timing before response | commit: 30d41d1
- fix(ritual): tune manual phase split to 70-30 | commit: ee93f8c
- fix(ritual): adjust manual phase split to 60-30 | commit: 601f628
- fix(bones): normalize headings and dedupe structural verdict | commit: a4670e5
- fix(security): harden scan signal and expose rate-limit backend health | commit: 9a52eb8
- fix(security): patch 16 HIGH CVEs via overrides; document tar build-tool risk | commit: f87bf6c
- fix(build): add @resvg/resvg-js-linux-x64-gnu to lockfile for Vercel | commit: 7a6eecb
- fix(build): add sharp linux-x64 binaries to lockfile for Vercel | commit: 7acdf1f
- fix(build): pin expo-modules-autolinking in root dependencies | commit: 430e0c8

### Docs
- docs(i18n): guía y notas para tirada I Ching auto vs manual | commit: fb69746
- docs(faq): I Ching manual/auto vs huesos siempre automático y mezcla en hilo | commit: f4d0ffd
- docs(timing): clarify NEXT_PUBLIC_ICHING_* absent uses compiled defaults only | commit: 2b670bf

### Maintenance
- chore(qa): manual ritual timing experiment — seal 22s vs finale clamp 44s | commit: e0bdb9c
- revert(manual): restore ritual seal/finale defaults after QA timing probe | commit: 1576870
- chore(mobile): bump version to 3.1.6 (versionCode 9) for Play Store | commit: 5644f64
- chore(mobile): bump version to 3.1.6 (versionCode 9) for Play Store | commit: 126b542

---


## [3.1.5] — 2026-05-03 | versionCode: 8 | Stage: Internal Testing

### New
- feat: v3.1.4 - fix EAS env vars, staging build with all secrets | commit: d34d0c3
- feat(seo): add openGraph, Twitter, keywords, per-page metadata and sitemap to all public routes | commit: a4360f0
- feat(notes): expand historical content for I Ching and Oracle Bones in all 11 languages | commit: 47f0804

### Fix
- fix: bold Veredicto estructural label in Bone Oracle response | commit: b89e258
- fix(i18n): escape inner double quotes in zh locale notes-page-ui | commit: 6f6e257
- fix(faqs): correct i18n bug showing FAQs in English for all locales — feat(faqs): add 5 new FAQs covering AI role, text authenticity, Silence state, languages, and privacy | commit: 5bb6b10
- fix(android): bump react-native-screens to fix NoSuchMethodError on Android 12 — release 3.1.5 versionCode 8 | commit: b14c6f4

---


## [3.1.3] — 2026-04-30 | versionCode: 6 | Stage: Internal Testing

### Maintenance
- chore(mobile): bump version to 3.1.3 (versionCode 6) | commit: 2d3a244

---


## [3.1.2] — 2026-04-30 | versionCode: 5 | Stage: Internal Testing

### Fix
- fix: re-enable R8, add Sentry crash reporting and error boundary | commit: 3c27976
- fix: re-enable R8, add Sentry crash reporting and error boundary | commit: 17c83aa
- fix(android): persist R8 keep rules via Expo config plugin | commit: 1f42ddc

### Maintenance
- chore(mobile): bump version to 3.1.2 (versionCode 5) | commit: 46b94e3

---


## [3.1.1] — 2026-04-29 | versionCode: 4 | Stage: Internal Testing

### New
- feat(web): franja Play arriba, cierre hilo y aviso límite; i18n | commit: e7a4996
- feat(auth): mandatory legal consent on signup and OAuth | commit: 0808806
- feat(web): i18n docs wording, legal consent flow, locale cookies, ritual UI | commit: 4e6fe8e
- feat(auth): post-login legal gate and staging user purge script | commit: 76ddeb6
- feat(auth): configurable register rate limit and Retry-After header | commit: 68ed75c
- feat(csp): move CSP to middleware for per-request nonce generation (Etapa 1) | commit: 17e7a53
- feat(csp): pass nonce to theme-init Script in layout (Etapa 2) | commit: 5f7da84
- feat: v3 README, hide Vercel toolbar in WebView, clean postcss override | commit: 13e9033
- feat: add Arabic (ar) language support with RTL for web and mobile | commit: 08cadec
- feat(i18n): complete Arabic and Hindi support across web, mobile, and backend (11 locales) | commit: 147ad57

### Fix
- fix(auth): clarify email signup errors for duplicate DB and weak password | commit: 8363a75
- fix(auth): diagnose email signup 400s (identities, mail, codes) and Turnstile cleanup | commit: ff2e3c3
- fix(auth): tighten mail-failure detection for register, use 502, log raw message | commit: b4b823f
- fix(auth): case-insensitive email precheck and map unexpected_failure | commit: 7590435
- fix(auth): reset register rate limit bucket (v2 key) and default 15/hr | commit: de56e32
- fix(auth): classify unexpected_failure before SMTP heuristics | commit: 02b980f
- fix(auth): store email signup legal consent as object in user_metadata | commit: 896f3ff
- fix(auth): align email signUp with OAuth — no user_metadata on signUp | commit: e68f203
- fix(auth): precheck auth email RPC, orphan-safe trigger, signup diagnostics | commit: 8b50d22
- fix(ui): hide CATEGORY line in readings, left-align copyright lines | commit: bf9afe6
- fix(claude): localize oracle-bones verdict header and I Ching structural correction for all UI locales | commit: 0190b5e
- fix(mobile): raise Node heap and cap Metro workers for EAS release bundle | commit: eb940ad
- fix(csp+auth): add missing CSP domains and fix consent expiry check order | commit: 86948eb
- fix(csp+auth): add vercel.live to frame-src and move rate limiter before body parse | commit: 42ecf48
- fix(auth): suppress account/me fetch during logout via isSigningOutRef | commit: 632be18
- fix(csp+a11y+three): data: in connect-src, inert drawer, THREE.Timer | commit: ea0e7bc
- fix(types): inert prop must be boolean not string in React 18 | commit: f7157f5
- fix(three): correct THREE.Timer API — update(timestamp) + getElapsed() | commit: f534eb4
- fix(three+css+data): cleanup warning, autocorrect color, hexagram 33 glyph | commit: fdb2db2
- fix(csp): resolve Trusted Types violations and nonce propagation in App Router | commit: dacc790
- fix(csp): unsafe-eval for Turnstile, cspNonce wiring, remove data leak log | commit: 52967fe
- fix: patch postcss DoS vulnerability GHSA-q4gf-8mx6-v5v3 | commit: 0567049
- fix(ci): remove postcss override — lock file out of sync with npm ci | commit: 01b68ec
- fix(eas): add prepare script to i18n package so dist/ compiles on npm install | commit: bb1ae12
- fix(mobile-release): disable proguard and drop mapping artifact upload to prevent startup crash | commit: 985b70d

### Security
- security(fase-2): webhook fail-closed, cookie secure, mobile env vars required | commit: 955007d
- security(fase-3): idempotencia webhook RC, 2FA atómico, depth desde DB | commit: c6afd9a
- security(phase-4): enforce CSP, harden register + 2FA endpoints | commit: 720fde9
- security(H-3): normalize RC webhook auth header before single comparison | commit: d9c6ab3
- security(M-5,M-6,L-7): tighten admin email regex, rate-limit display-name, sanitize debug logs | commit: daa813a
- security(csp): remove unsafe-inline from script-src (Etapa 3) | commit: ad79040

### Docs
- docs(db): confirm purge script keep list for staging auth users | commit: d1a9082
- docs(csp): documentar comportamiento esperado de Cloudflare Turnstile en middleware | commit: 4940819

### Maintenance
- Mobile: versión About/WebView desde manifest (expo-application), no expoConfig embebido obsoleto. | commit: 32afc87
- Android release: siempre expo prebuild antes de Gradle para alinear expoConfig y manifest. | commit: 02e2664
- trigger vercel preview deploy | commit: 6bffe4c
- remove(debug): eliminar logs [token-debug] y variable LOG_TOKEN_BALANCE_DEBUG | commit: 7b562a7
- remove(debug): eliminar LOG_TOKEN_BALANCE_DEBUG de account/me/route.ts | commit: db376d2
- chore: clean migrations + db setup docs + admin scripts | commit: a36ea56
- chore: remove obsolete migrations + update superseded ones | commit: 267d733
- chore: merge staging → main (security hardening + postcss fix) | commit: 5727bcb
- chore: merge staging → main (v3 README + WebView Vercel toolbar fix) | commit: c96a014
- Fix hi/ar localization gaps in FAQ and reading summary. | commit: e0ae3ca
- Bump Android app version to 3.1.1. | commit: 65c9187

---


## [1.0.0] — 2026-04-23 | versionCode: 10 | Stage: Internal Testing

### New
- feat(mobile): themed native chrome, locale bridge for login, i18n dialogs | commit: fb3a95e
- feat(mobile): default UI locale EN, device detection via expo-localization | commit: 6f10cbf
- feat(chat): rounded top cap on auth strip, square join to app bar | commit: fee9f72
- feat(mobile): square shell + inset rounded auth card above WebView | commit: 552ac80

### Fix
- fix(mobile): neutralize extra vertical gaps in WebView chat (SDK35) | commit: 67b94ac
- fix(mobile): v3 gap fix — force .oracle-chat-app flex:1 and zero .chat-surface margin | commit: 9dedb30
- fix(android-webview): fill chat shell height on API 35 (dvh letterboxing) | commit: 03f4cfb
- fix(mobile-webview): robust viewport height sync for SPA hydration (API 35) | commit: 70e9f4e
- fix(chat): align shell to aqua, flex chat-surface, composer sheet overlay | commit: ae6053f
- fix(mobile): inject chat layout CSS so WebView matches staging without stale CDN | commit: 1a423fb
- fix(mobile): resolve WebView URL from app.config extra.apiUrl | commit: fa8590f
- fix(mobile): tighten native chrome gap and narrow composer pill | commit: 62d51c2
- fix(chat): align composer footer width with history inset on narrow viewports | commit: bf5b86e
- fix(chat): full-bleed composer footer + compact mobile bar height | commit: 0086aa1
- fix(chat): move composer footer out of chat-room for flush bottom layout | commit: 4bf4648
- fix(chat): tighten composer bottom inset for RN WebView | commit: 295788f
- fix(chat): restore safe bottom inset above Android nav (clamp env) | commit: 7d4e0d5
- fix(chat): show bottom rounded border above Android nav (surface margin) | commit: 12353d6
- fix(rn-ui): native top bar rounded cap + square-top WebView card | commit: e4c939f
- fix(mobile): native top bar starts below status bar inset | commit: 8779d14
- fix(mobile): align native auth strip with WebView shell (0.45rem pad) | commit: 1d25c42
- fix(mobile): RN WebView auth strip parity, status bar, local APK script | commit: 5e26b8c
- fix(web,mobile): auth strip controls match former native chrome | commit: 7dbcbd9
- fix(web): locale picker portal + RN chat width; mobile inject overflow | commit: 95613bb
- fix(mobile,web): RN chat width, locale menu scroll, dark shell border; inject + AGENTS | commit: a2c955e
- fix(web): hydrate UI locale in useLayoutEffect so return from /guia keeps language | commit: 28d97a0
- fix(mobile): sync WebView locale from web storage on navigation (avoid EN clobber) | commit: 8d9c681
- fix(mobile,web): persist locale across docs and restore docs scrolling/nav in WebView | commit: fdf29bc
- fix(mobile,web): WebView locale sync and doc nav overlap | commit: e9b4901
- fix(web): hide chat card contour and dot grid outside RN WebView | commit: 99238ad
- fix: revert doc nav sticky; manual-first locale (web + APK) | commit: d2978c7
- fix(web): skip initial locale persist race vs useLayoutEffect | commit: 88247c7

### Docs
- Docs: rutas /faqs y /about independientes; guía sin FAQ ni trazabilidad; APK navega a ambas. | commit: 43b3219

### Maintenance
- revert(ui): restore full-width composer dock; keep RN top spacing | commit: 5106115
- style(web): justify docs and token center copy on web | commit: 3f57c36
- web: persist session_limit in sessionStorage for tier hydration | commit: f71a06f
- web: FAQ page, Play Store dock, and copyright outside chat | commit: 570a6e4
- Web: FAQs solo en /guia; trazabilidad APK sin package id; WebView rellena versión y build. | commit: 86d549b
- Composer: enlaces a FAQs y About en /guia; hoja opciones más alta; About visible en web. | commit: 135b020
- Android WebView: no interceptar SPA en /guia, notas y legales (evita freeze en FAQs/About). | commit: 4d30b5a
- WebView: evitar bucle MutationObserver en /about al rellenar trazabilidad (rAF + no-op si mismo texto). | commit: c5f713c
- Mobile 1.0.0 (versionCode 10); badge Google Play más grande en web. | commit: a3c0641

---


## [3.0.0] — 2026-04-23 | versionCode: 3 | Stage: Internal Testing

### Maintenance
- Mobile 3.0.0 (versionCode 3) para siguiente internal tras 2.0.0 en Play. | commit: e4a82ff

---


## [2.0.0] — 2026-04-20 | versionCode: 2 | Stage: Internal Testing

### New
- feat(web): Cloudflare Turnstile for register; turbo env passthrough | commit: 6ee4630
- feat(web): chat UX refresh, docs routes, richer image prompts | commit: 0ae15d1
- feat(web): logo header, drawer stats, prune empty chats, mode showcase | commit: 491e68f
- feat(web): UI de chat, modos I Ching/Huesos y límite de hilo | commit: 07f9d35
- feat(web): Supabase auth, login flow, API Bearer + DB migrations 003-004 | commit: 7c64aa5
- feat(security-ui): add optional 2FA setup in options panel | commit: fda1920
- feat(tiers): implement v4 pricing and runtime policy | commit: e69d6dc
- feat(docs): add quickstart and legal pages in options | commit: adf1be2
- feat(billing): add self-service subscription management | commit: bd653e5
- feat(auth): add password reset and confirmation resend actions | commit: 3d266da
- feat(security,subscription): modal 2FA flow and richer account status | commit: 1c9735b
- feat(subscription): add dedicated subscription center with revenuecat status | commit: 67aa234
- feat(billing): Seeker monthly 20 credits, annual 15 per month | commit: 909ab44
- feat(web): polish auth/subscription modals, fix pricing flow, remove reading mode UX | commit: 9d7b3d1
- feat(billing): RevenueCat as single source for subscription period | commit: bf5e363
- feat(billing): grace window 3-consultation limit with support message when exhausted | commit: 981c79b
- feat(billing): RC v2 product map env + nested product tokens for tier resolution | commit: d81654b
- feat(web): checkout success page with billing sync and tier polling | commit: d17ed45
- feat(billing): RC customer portal + plan change webhook fix | commit: f8fd484
- feat: migrate billing to consumable token packs | commit: 148f9c3
- feat(db): user_trial_log to prevent duplicate free trial; fix token center copy | commit: 5b2d8d4
- feat(web): cleaner options panel, pack marketing copy, legal dates | commit: 2cf407e
- feat(web): doc locale by auth, thread depth fixes, EN default, browser locale | commit: f7ba4a8
- feat(web): oracle bones image overlay shows verdict glyph (吉/凶/沉默) | commit: cf1aecd
- feat(images): oracle bones verdict glyph size + verdict-colored gradients | commit: ef0f86c
- feat(web): PDF lectura multipágina y títulos; logo de marca actualizado | commit: 5da0cbd
- feat(web): logo marca, barra sesión, cinta I Ching y cabecera chat | commit: ce0762c
- feat(i18n): centralize UI strings in @iching-oracle/i18n for nine locales | commit: 7ae0da4
- feat(web): cookie consent gate and colored hint lines | commit: 267b1da
- feat(bones): upgrade ritual animation with 5 verdict patterns | commit: 42267b4
- feat(ritual): refine animations and harden oracle outputs | commit: d72eb41
- feat(web): naturalize verdict copy, add particles, and prebuilt fallbacks | commit: 9f0be44
- feat(web): progressive interpretation reveal and scroll anchor | commit: 7b4bf52
- feat(ritual): integrate approved I Ching reveal flow into chat | commit: 26d6d60
- feat(ritual): refine loading flow and pacing | commit: a3e1461
- feat(i18n): localize web UI across nine locales; mobile Expo config | commit: 4a1ca3e
- feat(web): expose supabase singleton on window for APK WebView setSession | commit: 68238de
- feat(web): redirect Android to APK deep link on checkout success | commit: ca94e23
- feat(api): add OpenRouter as Claude fallback between Anthropic and Groq | commit: 22acdfe
- feat: onboarding modal for display_name + fix APK locale bug | commit: c4fda61
- feat(onboarding): auto-fill display_name from Google full_name, modal for email | commit: 41f2f0c
- feat(admin): is_admin DB column + complementary allowlist/DB admin logic | commit: 3772243
- feat(admin): read is_admin from /api/account/me + show "admin" tier in UI | commit: 42e31ff
- feat(mobile): replace Android system dialogs with custom dark-themed modal | commit: 0d9c51f
- feat(mobile): v2.0.0 (versionCode 2), R8 release minify, EAS mapping artifacts | commit: 73dbf0e

### Fix
- fix(web): add @iching-oracle/sharing dependency for Vercel build | commit: d2a0ed5
- fix(web): use nodejs runtime for RevenueCat webhook (silence edge SSG warning) | commit: 7bd67c9
- fix(web): consult 500 con Supabase, hidratación y JSON vacío | commit: ee3fc5f
- fix(claude): modelos Anthropic actuales y fallback si la API falla | commit: 8264c82
- fix(image): Together FLUX steps within allowed range | commit: 3453b61
- fix(image): enforce hexagram bars in Together prompt | commit: 3e2b05a
- fix(web): prevent localStorage quota crash | commit: d1b77f3
- fix(image): overlay deterministic hexagram over backgrounds | commit: 5960741
- fix(web): explore-first auth UX and polished login layout | commit: 5231865
- fix(web): header account row, credits UX copy, API cycle metadata | commit: cd694d0
- fix(web): strip Iniciar sesión/Cerrar sesión; remove header Entrar; restore logo size | commit: e47a137
- fix(ci): skip Google Fonts fetch in GitHub Actions build | commit: 6515b75
- fix(ci): run dependency builds before typecheck | commit: cbae810
- fix(free-tier): allow 2 consultations per thread (sessionDepth 2) | commit: eb24636
- fix(images): CJK overlay + watermark render on server (Sharp/librsvg) | commit: ff6d205
- fix(admin+images): admin bypass credits; restore previous watermark/overlay pattern | commit: b5ffca5
- fix(admin): persist admin key client-side for unlimited testing | commit: aaf43e3
- fix(admin): unlimited testing via verified email allowlist | commit: a77ea82
- fix(admin): skip 2FA gate for allowlisted test accounts | commit: be04bcf
- fix(flow): avoid 2FA dead-end with tier gate flag and explicit UX | commit: 5c26696
- fix(flow): harden auth/billing policy and restore image reliability | commit: 8fc272c
- fix(auth): make 2FA optional by default | commit: 6cc4b8a
- fix(privacy): persist chats in DB and disable public sharing | commit: 4426446
- fix(images): strengthen watermark visibility and upscale iching overlays | commit: 091a08d
- fix(images): restore chinese glyphs and watermark text rendering | commit: 3036bf3
- fix(images): prevent tofu regression by keeping latin fallback fonts | commit: 88a4d2f
- fix(images): restore overlay geometry and watermark text label | commit: c4c7fb1
- fix(images): use local bundled CJK font for overlay rendering | commit: 2b56481
- fix(images): stabilize traditional CJK overlay font loading | commit: 8ee2628
- fix(images): enforce readable watermark visibility across tiers | commit: 636514c
- fix(chats): harden consultation persistence and DB compatibility fallback | commit: e94bd51
- fix(images): make CJK font resolution Vercel-safe | commit: 9f493ef
- fix(images): include latin chars in overlay font subset fallback | commit: 4d23c13
- fix(images): use resvg-js for SVG rendering instead of sharp/librsvg | commit: fb389b9
- fix(build): mark @resvg/resvg-js as external for webpack | commit: ec82adf
- fix(images): bundle subset TTF for resvg CJK rendering on Vercel | commit: 5fd9eab
- fix(ui,auth): compact header and add email 2FA flow | commit: 0b2b19f
- fix(ui): stabilize header strip alignment and edge-to-edge mode bar | commit: fb2ec26
- fix(i18n,ux,pdf): complete multilingual runtime and improve chat export | commit: 3822dfd
- fix(pdf,chats): improve export layout and add secure deletion | commit: 10dd48e
- fix(chats): tighten session lifetime and improve history UX | commit: 8bf35b9
- fix(chats): add backward-compatible history query fallback | commit: a681606
- fix(chats): surface explicit config errors for history loading | commit: dff9b93
- fix(account): harden billing UX and user-scoped activity stats | commit: 11ec634
- fix(consult): block empty sends and enforce thread limits in API | commit: e4da665
- fix(ux): stabilize chat summaries and improve 2FA/billing diagnostics | commit: cef4d84
- fix(chats,2fa): preserve loaded threads and surface provider delivery errors | commit: aeeb19a
- fix(auth,consult): improve registration and thread-limit UX | commit: 47c7c5b
- fix(db): sync auth user deletions to public profile | commit: 6d735fa
- fix(pricing): prevent self-redirect loops | commit: 66a96af
- fix(pricing): attach supabase user id to purchase links | commit: 435f97f
- fix(revenuecat): apply webhook purchases to tier and cycle correctly | commit: 9500b9b
- fix(images): preserve pinyin diacritics in composed overlays | commit: bcb7013
- fix(images): remove pinyin subtitle from hexagram overlays | commit: c64863b
- fix(app): stabilize images, billing UX, and locale defaults | commit: 55adedb
- fix(2fa): separate enrollment and login challenge flows | commit: 4a0487b
- fix(2fa): harden challenge validation and simplify login flow | commit: 3d1edd6
- fix(2fa): enforce configured method and keep errors inside modal | commit: 12c2201
- fix(billing): sync RC EXPIRATION via REST; map subscriptions in v1; wait for session on /pricing | commit: 7dfe968
- fix(2fa): always save email method on email enroll; challenge UI and hash compare | commit: 53cba40
- fix(billing): merge RevenueCat v2 customer subscriptions into sync-billing (Web Billing) | commit: 6a15987
- fix(billing): map v2 RC entitlements + epoch dates; fail loud on query_credits upsert error | commit: 904dc0b
- fix(auth+billing): self-heal public.users and enforce billing FK preconditions | commit: c1e2153
- fix(billing): stop query_credits onConflict dependency; harden credits_type schema | commit: 982f608
- fix(billing): force RevenueCat user alignment before checkout redirect | commit: 3fac4b7
- fix(billing): heal public.users from auth before upsertUserTier | commit: b1e0d85
- fix(api-error): add apply_db_migration action for 2FA schema errors | commit: e3554f0
- fix(web): center modal close, checkout via NEXT_PUBLIC_PLANS_URL, 2FA single-method steps | commit: 17a4ba4
- fix(billing): address audit bf5e363 — RC stale cycles, Redis key, /me, CANCELLATION | commit: c510ae2
- fix(security): harden auth, credits, and admin runtime config | commit: 62bfe1d
- fix(auth): handle existing signup email with modal guidance | commit: cc48825
- fix(billing): add paid grace window on temporary RC outages | commit: 2759f43
- fix(ui): hide redundant subscription count message in center | commit: 8404c4d
- fix(billing): pick best active v2 subscription by tier, not items[0] | commit: 3c9d4a2
- fix(billing): log v2 tier tokens when active rows map to free | commit: b5805de
- fix(billing): RC v2 subscription UI — eligibility + status field fallbacks | commit: 5cfd2d6
- fix(web): subscription center status for free tier, avoid manage 404 | commit: 8f10664
- fix(web): neutral billing copy and block homepage-as-plans URL | commit: a136b8f
- fix(web): always attach app_user_id to plans checkout when authenticated | commit: cedda8a
- fix(auth): persist Supabase session in localStorage for multi-tab checkout | commit: a99d563
- fix(billing): harden plans CTA routing and RC v1 403 handling | commit: 0086754
- fix(billing): strip UUID path segment from plans URL before appending app_user_id | commit: 2225f64
- fix(checkout): use tierLabelForDisplay for welcome message and add tier logging | commit: 2dc6fd4
- fix(webhook): resolve opaque RC Billing product_ids in PRODUCT_CHANGE via tier map | commit: 11c78d7
- fix(billing): add portal session logging + remove RC v1 API calls | commit: e5a0dee
- fix(billing): resolve RC anonymous ID alias for customer portal sessions | commit: 119ab4c
- fix(billing): RC portal fallback + identity fix para futuros usuarios | commit: e4f19de
- fix(billing): persist RC alias graph and enforce identified checkout | commit: 1746c1a
- fix(next15): adapt dynamic route params and config keys | commit: d9f0397
- fix(billing): use v2 authenticated management URL for portal access | commit: 6853286
- fix(billing): detect active RC subscriptions without tier-map dependency | commit: 3ef72ae
- fix(billing): downgrade to free when RC has no active subscription | commit: 7e4bbd9
- fix(billing): avoid portal 404 fallback and preserve free lifetime usage | commit: ba9bc5f
- fix: refine token center UX and live balance refresh | commit: ea839d0
- fix(images): tier-aware sizes for Together; toContextTierKey in resize; pack copy for resolution | commit: 850c45a
- fix(ui): shorten Huesos tagline and 2FA options copy | commit: 38535a1
- fix(web): split doc-locale cookies for client bundle (Vercel build) | commit: 8c4be8a
- fix(web): thread depth UI uses plan cap; add consult panel dividers | commit: 5ff1041
- fix(web): oracle bones mock is tier-sized PNG with glyph only + watermark | commit: 0626628
- fix(images): oracle bones mock stays 1344×768; tier sizes unchanged for remote | commit: d99ac02
- fix(images): oracle bones overlay viewBox matches output size (no letterbox bars) | commit: baddac2
- fix(oracle-bones): center verdict glyph on image (overlay + mock) | commit: c4bc0de
- fix(web): persist chat session state across route navigation | commit: 7ea1ba1
- fix(web): unify user guide and align token tier copy | commit: bddcde3
- fix(web): polish token-center guide link and close button | commit: c5a8c9c
- fix(web): trim options panel copy; compact centered token/2FA buttons | commit: 4155a4b
- fix(web): center compact CTAs; Ver packs matches options pills | commit: 05ec297
- fix(web): align panel CTA pills to text mid-axis | commit: 3620b09
- fix(web): keep token modal Ver packs centered; left nudge only in options | commit: dc30bce
- fix(web): harden chat hydration and idle session handling | commit: 31fa4db
- fix(web): preserve new session and simulate tier transitions | commit: 629d084
- fix(web): use neutral token-depleted notice copy | commit: 8ac8c39
- fix(2fa): reset totp_last_used_step on enroll and disable | commit: 1e1f76e
- fix(2fa): reset replay step in follow-up update, not upsert | commit: 52e136a
- fix(2fa): add recovery-code challenge fallback | commit: 42b1fe6
- fix(2fa): keep setup session verified after enrollment | commit: 25d7655
- fix(2fa): separate setup verification from recovery step | commit: 4a5a795
- fix(web): improve SVG font embedding and image rendering path | commit: c9ccede
- fix(2fa): improve challenge fallback and retry flow | commit: 63afba3
- fix(ui): tone down hint emphasis, highlight 2FA send-email CTA | commit: 105789a
- fix(web): prevent client crash in bone ritual animation | commit: 4c6c83f
- fix(bones): strengthen fire visuals and ensure crack reveal timing | commit: f8e2154
- fix(chat): autosize input and stabilize bones fallback | commit: 9301c1f
- fix(ui): tune fullscreen particle interaction | commit: 6f365ab
- fix(fallbacks): purge text artifacts from prebuilt images | commit: 0c91f58
- fix: interpretation typography, safe markdown reveal, disable auto hyphens | commit: 350cdd7
- fix(ritual): restore visible awaiting animation | commit: 2941a42
- fix(ritual): stabilize loading visuals and pacing | commit: fd72896
- fix(auth): bootstrap free credits on auth signup | commit: 0e1086e
- fix(ui): restore chat loading states and Yi glyph rendering | commit: 42d94ec
- fix(ui): restore plan tier skeleton and optimistic chat delete | commit: 7988938
- fix(pdf): add controlled hyphenation in wrapped text | commit: d66424c
- fix(mobile): harden auth bridge, PDF export, and pinch zoom in APK | commit: c3a1bec
- fix(mobile): stabilize auth sync and oauth handoff in webview | commit: b111d7b
- fix(mobile): align oauth host and recover auth token sync | commit: 01096c8
- fix(mobile): use staging supabase fallback and heartbeat auth sync | commit: c1ee00b
- fix(mobile): stabilize deep-link callback parsing and auth state reconciliation | commit: 0460308
- fix(mobile): pin auth bridge to staging supabase project ref | commit: 4b1d8d1
- fix(mobile): hard reset webview on sign-out and enforce locale sync | commit: cc4bf68
- fix(mobile): Google OAuth implicit flow + sign out fix | commit: b37903b
- fix(mobile): purchase success deep link + RevenueCat redirect flow | commit: 820af9d
- fix(api): add required action field to apiError calls in display-name route | commit: 053b938
- fix(admin): adminUnlimitedCredits always true when adminBypassAllowed | commit: 9ec6719
- fix(policy): remove unused shouldAllowAdminUnlimitedCredits function | commit: c9b8975
- fix(admin): bypass sessionDepth limit for admin users | commit: 08bc9ba
- fix(mobile): bump ignoreDeprecations to "6.0" to silence moduleResolution deprecation | commit: 480f8a7
- fix(admin): bypass client-side thread depth limit + show ∞ in depth indicator | commit: 9edb80b
- fix(mobile): declare process.env globally to silence TS2591 without @types/node | commit: cb564d6
- fix(mobile): translucent status bar with transparent background | commit: a3dfa51
- fix(mobile): harden webview header hiding for sdk35 layout parity | commit: 3e35814
- fix(mobile): stabilize SDK35 WebView layout and Android insets | commit: ab204d1

### Security
- audit: security headers, RC webhook, public reads, CI, tests, observability | commit: b6a11c2

### Performance
- perf(chats): lazy-load threads and improve delete icon UX | commit: 4bf7a84
- perf(api): reduce chat delete roundtrips | commit: a0cd6d3

### Docs
- docs: AUDIT_REPORT note on CI lint | commit: f6888a4
- docs: align tier specs with tier-billing-constants and runtime | commit: daed162
- docs(env): document Web Billing return URL alignment with NEXT_PUBLIC_APP_URL | commit: 6ce9f18

### Maintenance
- Initial commit: I Ching monorepo (web, packages, backends) | commit: 87c5c9b
- refactor(claude): un solo modelo Anthropic (Sonnet) para todos los planes | commit: 77d6865
- chore(claude): default Anthropic model claude-sonnet-4-5 | commit: de22e98
- Asegura que el arte sumi-e de fallback varíe de forma determinista por consulta y actualiza la marca de agua a inglés. | commit: 137f64f
- Debug: log Together vs svg-art provider | commit: 3598d53
- copy: soften auth dialog (remove harsh phrasing) | commit: 2b0cd12
- copy(login): trim brand panel; drop unused brand-list styles | commit: 0062ef4
- chore: skip mobile eslint in turbo until config exists; note web lint hoist issue | commit: d6edcc8
- ci: skip lint step until eslint-config-next resolves in monorepo | commit: 224fdb6
- Revert "fix(images): prevent tofu regression by keeping latin fallback fonts" | commit: f2e722b
- Revert "fix(images): restore chinese glyphs and watermark text rendering" | commit: 0116a58
- Revert "fix(images): strengthen watermark visibility and upscale iching overlays" | commit: 1bba002
- chore(staging): trigger preview deployment | commit: 2c5727d
- style(subscription): refine subscription center visual design | commit: a039187
- db: cascade delete two_factor_attempts when public.users is removed | commit: 63d4297
- db: before-delete trigger to wipe public.users before auth; manual delete script | commit: 62d3557
- chore(db): do not modify applied migration 009; rely on 015 for seeker variants | commit: a25af20
- refactor(billing): centralize tier quotas in tier-billing-constants | commit: 08a65b3
- chore(billing): add detailed RC v1/v2 upstream failure logs | commit: 00c011e
- chore(security): enforce RLS on internal RevenueCat tables | commit: 48bd6f8
- chore(security): harden auth origin, webhook compare, and app headers | commit: d75c6ec
- chore(next): update generated next-env references | commit: 24c778d
- chore(turbo): register Vercel env vars in globalEnv | commit: e3dc3a7
- refactor: remove legacy subscription traces | commit: 371a306
- refactor: finalize token-only naming and cleanup | commit: 849dc8f
- chore: add token balance debug tracing | commit: b9334a5
- refactor(web): rename monthlyCreditsLimit to accountSessionLimit | commit: 24796e1
- refactor(web): drop unused credits notice cycle/limit fields | commit: cdd0032
- style: aumentar tamaño del logo en cabecera | commit: 8e1298d
- style(web): match token-center modal to consult panel | commit: 59196eb
- revert(web): restore token-center layout; keep consult-style close | commit: 3a11ae5
- style(web): align token center CTA with 2FA; full-width Ver packs | commit: f8855db
- style(web): shift options and token modal CTAs further left | commit: aaa62c4
- refactor(2fa): simplify modal actions and reduce button noise | commit: 9fb15ca
- chore(ui): align particles density with demo | commit: 6eddeaa
- chore(text): align punctuation normalization | commit: 6799513
- chore(debug): add ritual stream diagnostics | commit: 2087ce7
- chore(db): add security baseline and audit runbook | commit: 7d7094e
- chore(git): ignore .env* and remove .env.example from version control | commit: 8dda9e4
- chore(git): ignore .claude and stop tracking agent settings | commit: 86eec78
- chore(mobile): add bridge diagnostics for auth and navigation flows | commit: b7efc55
- chore: add env vars to turbo.json globalPassThroughEnv + fix TS deprecation warning in mobile | commit: 1fc148b
- chore(mobile): re-link EAS project to alex_cat account (new projectId) | commit: 5cbd8a4
- chore(mobile): switch to CNG workflow — gitignore android/ folder | commit: 7a97913
- chore(mobile): change package name to com.theoriginaliching.mobile + add apk build profile | commit: 3cc42aa
- chore(mobile): set targetSdkVersion/compileSdkVersion to 35 | commit: a751ad5
- chore(mobile): bump versionCode to 2 | commit: ebe94be
- chore(mobile): bump versionCode to 3 | commit: c8d9f1c
- chore(mobile): versionCode 4 + edge-to-edge translucent bars | commit: 73dc3b8
- revert(staging): restore Apr-18 mobile/web baseline for regression isolation | commit: eac8e6b
- revert(staging): align mobile/web baseline to cb564d6 | commit: 37bf878
- chore(mobile): inject Play verification token asset in Android builds | commit: 103ead2
- chore(web): update header brand logo asset | commit: 199ad87
- chore(web): replace header logo with transparent PNG | commit: 97c9cda
- chore(web): update brand logo with cropped transparent PNG | commit: 84ccf7b

---

## Version Summary

| Version | versionCode | Date | Stage | Commits | Notable changes |
|---------|-------------|------|-------|---------|-----------------|
| 3.5.2 | 45 | 2026-06-07 | Closed Testing | 47 | production Supabase closure — migration 069, Fase 4 ops, recovery docs; Phase 3 scale — RPC write path, thread=1, serial bootstrap; Phase 2 TOAST split — consultation_content table (migrations 062-064) |
| 3.5.1 | 44 | 2026-06-06 | Closed Testing | 0 | — |
| 3.5.0 | 43 | 2026-06-06 | Closed Testing | 0 | — |
| 3.4.9 | 42 | 2026-06-06 | Closed Testing | 0 | — |
| 3.4.8 | 41 | 2026-06-05 | Closed Testing | 0 | — |
| 3.4.7 | 40 | 2026-06-04 | Closed Testing | 0 | — |
| 3.4.6 | 39 | 2026-06-04 | Closed Testing | 0 | — |
| 3.4.5 | 38 | 2026-06-04 | Closed Testing | 0 | — |
| 3.4.4 | 37 | 2026-06-03 | Closed Testing | 0 | — |
| 3.4.3 | 36 | 2026-06-01 | Closed Testing | 0 | — |
| 3.4.2 | 35 | 2026-06-01 | Closed Testing | 0 | — |
| 3.4.1 | 34 | 2026-06-01 | Closed Testing | 0 | — |
| 3.4.0 | 33 | 2026-06-01 | Closed Testing | 0 | — |
| 3.3.9 | 32 | 2026-05-31 | Closed Testing | 0 | — |
| 3.3.8 | 31 | 2026-05-31 | Internal Testing | 0 | — |
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
