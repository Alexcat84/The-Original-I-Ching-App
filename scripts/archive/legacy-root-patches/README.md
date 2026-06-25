# Legacy root patch scripts (archived)

One-off Node scripts used during early i18n/UI migrations (2025). They mutate source files in-place via regex — **do not run** on the current tree.

Moved from repo root on 2026-06-25 per [`20260625-AUD-REPO-01-repo-root-inventory.md`](../../../docs/auditorias/20260625-AUD-REPO-01-repo-root-inventory.md).

| File | Target (historical) |
|------|---------------------|
| `add_guia.js` | `packages/i18n/src/messages/guia-page-ui.ts` |
| `patch_faq*.js` | FAQ i18n messages |
| `patch_guia_*.js` | Guía page copy |
| `patch_tooltip_*.js` | Tooltips + docs chrome |
| `patch_ui*.js` | `apps/web/src/app/page.tsx` translator toggles |
| `update_guia_and_chrome.js` | Guía + chrome strings |
| `update_packs.js` | Token pack copy |

For current i18n changes use [`docs/workflows/00000000-WF-I18N-01-i18n-guide.md`](../../../docs/workflows/00000000-WF-I18N-01-i18n-guide.md).
