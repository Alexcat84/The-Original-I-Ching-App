# Incident audit — Bottom gap in RN WebView chat (Release A)

**Project:** The Original I Ching App  
**Date:** 2026-06-18  
**Regression introduced in:** `16dc714` — `fix(mobile): auto-adjusting chat bottom inset + full-bleed splash image`  
**Fix commit:** `e4b04e5` — `fix(mobile+web): remove fake 18px chat bottom gap in RN WebView`  
**Branches:** `main`, `staging` (pushed together)  
**Severity:** Medium — visual UX; not functionally blocking  
**Status:** ✅ Fixed and deployed to remote

---

## Executive summary

On Android **Release A** (Expo SDK 53, `edgeToEdgeEnabled: false`), the chat composer showed a **black gap** below the orange card (`.chat-surface`), above the system navigation bar. The root cause was a **forced 18px floor** on `.chat-surface` bottom margin — intended for gesture nav / Release B — applied even when native inset reported **0px** (3-button nav devices).

The fix moves safe-area inset **onto the composer only** (`.composer-minibar`) and keeps `.chat-surface` flush with the bottom of the WebView.

---

## Symptom

| Observation | Detail |
|---|---|
| Where | Below the chat input, **outside** the composer but **inside** the orange `.chat-surface` frame |
| Color | Shell background (`#0c0f14`), visible as a black band |
| When | After SDK 53 upgrade / commit `16dc714`; reproducible on local APK and WebView loading staging |
| Debug | With `DEBUG_WEBVIEW_CHAT_DOM_OUTLINES`, the gap sits **below** the orange `.chat-surface` outline, not inside the composer |

---

## Technical context (Release A)

| Piece | Behavior |
|---|---|
| Native shell | `apps/mobile/app/index.tsx` — `insets.bottom` injected as `--rn-safe-area-inset-bottom` |
| Release A | No edge-to-edge → on most devices **`insets.bottom === 0`** (WebView ends above the 3-button nav bar) |
| Content | WebView loads remote URL (staging/prod); remote CSS + **`INJECTED_JS`** (forced parity via `!important`) |
| Commit `16dc714` | Tried to “lift” `.chat-surface` off gesture nav using `max(18px, var(--rn-safe-area-inset-bottom))` |

---

## Root cause

### 1. Forced margin on `.chat-surface` (primary)

Both remote CSS and injected JS applied a **minimum 18px offset** even when there was no real inset:

```css
/* Before (regression) */
--rn-chat-bottom-offset: calc(0.25rem + max(18px, var(--rn-safe-area-inset-bottom, 0px)));
html.iching-rn-webview .chat-surface {
  margin-bottom: var(--rn-chat-bottom-offset);
}
```

With `--rn-safe-area-inset-bottom: 0px` → **always ≥ 18px** margin under the whole card, not just the composer.

### 2. Duplicated INJECTED_JS ↔ globals.css

| File | Role |
|---|---|
| `apps/web/src/app/globals.css` | RN styles when web deploy is current |
| `apps/mobile/app/index.tsx` → `INJECTED_JS` | Parity baked into APK; **wins** over stale remote CSS via `!important` |

In `16dc714` **both** carried the same bad logic; the gap persisted even with old remote CSS if the installed APK still injected the regression.

### 3. Why the local fix was not visible immediately

| Factor | Effect |
|---|---|
| No initial commit/push | Remote staging kept serving `globals.css` with `--rn-chat-bottom-offset` |
| Play Store / older APK | Installed binary still had `margin-bottom: calc(0.25rem + max(18px, …))` in `INJECTED_JS` |
| Validation | Requires **web deploy** and/or **reinstall APK** built with `e4b04e5` |

---

## Fix (`e4b04e5`)

### Principle

1. **`.chat-surface`:** `margin-bottom: 0` — card reaches the WebView bottom on Release A.  
2. **`.composer-minibar`:** only place with dynamic bottom padding: `calc(0.42rem + var(--rn-safe-area-inset-bottom, 0px))`.  
3. **Parity:** same rules in `globals.css` and `INJECTED_JS`; removed duplicate mobile media-query padding in injected JS.

### Changes by file

**`apps/web/src/app/globals.css`**

```css
html.iching-rn-webview {
  --rn-composer-bottom-padding: calc(0.42rem + var(--rn-safe-area-inset-bottom, 0px));
}
html.iching-rn-webview .chat-surface {
  margin-bottom: 0;
}
html.iching-rn-webview .composer-minibar {
  padding-bottom: var(--rn-composer-bottom-padding) !important;
}
```

**`apps/mobile/app/index.tsx` (`INJECTED_JS`)**

- `.chat-surface` → `margin-bottom: 0 !important`
- `html.iching-rn-webview .composer-minibar` → `padding-bottom: calc(0.42rem + var(--rn-safe-area-inset-bottom, 0px)) !important`
- Removed composer `padding-bottom` with inset in `@media (max-width:520px)` (avoids double inset)

### Release B (edge-to-edge / gesture nav)

When `insets.bottom > 0`, composer padding grows with the real inset. The **18px floor on `.chat-surface` is not restored** — avoids the Release A gap without breaking safe area on Release B.

---

## Verification

### Web (staging/prod)

1. After push, confirm Vercel deploy on `staging` / `main`.
2. Open chat in browser with `html.iching-rn-webview` or inspect in remote WebView.
3. Check computed styles: `.chat-surface { margin-bottom: 0 }`, composer bottom padding ~0.42rem when inset is 0.

### Local APK (Release A)

```powershell
cd apps\mobile
$env:NODE_ENV = "production"
npm run android:apk:release
```

Output: `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`  
**Uninstall** the previous build before installing (avoids WebView cache / Android backup state).

### Visual checklist

- [ ] Composer flush with the rounded bottom edge of the orange card  
- [ ] No black band between composer and `.chat-surface` bottom edge  
- [ ] Chat drawer: bottom spacer **unchanged** (still uses `--rn-safe-area-inset-bottom` so last item clears nav bar on scroll)

---

## Lessons / prevention

1. **Do not use `max(18px, …)` as a floor** when injected inset is the source of truth on Release A.  
2. **Apply inset on the control that needs it** (composer), not the flex parent (`.chat-surface`).  
3. **Always keep `INJECTED_JS` and `globals.css` aligned** — the APK does not depend on web deploy alone.  
4. **Audit ≠ remediation:** document and push before asking for on-device validation; WebView mixes binary + remote.  
5. **`versionCode` bumps:** optional for local QA builds; reserve for Play/EAS.

---

## References

| Resource | Location |
|---|---|
| WebView shell + safe-area injection | `apps/mobile/app/index.tsx` |
| RN WebView styles | `apps/web/src/app/globals.css` (`html.iching-rn-webview` block) |
| SDK 53 / Release A | `CLAUDE.md`, upgrade plan under `docs/plans/` |
| Audit index | [`docs/auditorias/README.md`](./README.md) |
| Related RN hydration / layout | [`HYDRATION_GATE_AUDIT_2026-06-13.md`](./HYDRATION_GATE_AUDIT_2026-06-13.md) |
