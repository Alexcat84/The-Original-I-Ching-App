# App Store Changelog (What's New)
**Código:** `00000000-OPS-IOS-01 app-store-changelog` · **Familia:** MOB-IOS · **Estado:** reference

Release notes copy for the App Store Connect listing ("What's New").
Keep each entry short and user facing. Use a leading hyphen as the bullet. Do not use em-dash or en-dash.
App Store Connect caps this field at **4000 characters per locale** — stay well under it.
Localize for all **11 locales** the app supports. Apple locale codes differ slightly from Play (e.g. `es-MX` vs Play `es-419`).
Newest version on top. The internal engineering changelog lives in `CHANGELOG.md` at the repo root.

| Version | buildNumber | Date | Stage |
|---|---|---|---|
| 4.2.0 | 1 | (pending first iOS release) | — |

---

## 4.2.0 (buildNumber 1) — placeholder

Copy for App Store Connect "What's New" will be drafted in Fase 3 (App Store compliance), before first TestFlight external or public submission.

**Engineering changelog (Android + shared):** use `npm run changelog:update` with both `--versionCode` (Android) and `--buildNumber` (iOS) when cutting a cross-platform release:

```bash
node scripts/update-changelog.js \
  --version 4.2.0 \
  --versionCode 60 \
  --buildNumber 1 \
  --stage "Production"
```

**iOS-only release bump:** update `ios.buildNumber` in `apps/mobile/app.config.js` only; `buildNumber` must strictly increase (App Store Connect rejects reused CFBundleVersion).

---

## Locale reference (Apple)

| App locale | Notes |
|------------|-------|
| en-US | Primary |
| es-MX | Apple uses es-MX (Play uses es-419) |
| pt-BR | |
| fr-FR | |
| de-DE | |
| it | |
| ja | |
| zh-Hans | Simplified Chinese |
| ko | |
| ar | |
| hi | |

Add bulk-paste blocks below each release (mirror [`00000000-OPS-PLAY-01-play-store-changelog.md`](./00000000-OPS-PLAY-01-play-store-changelog.md) workflow).
