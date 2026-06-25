# Inventario raíz del repositorio

**Código:** `20260625-AUD-REPO-01 repo-root-inventory` · **Familia:** REPO · **Estado:** closed

**Fecha:** 2026-06-25 · **Alcance:** archivos y directorios en `/` (raíz del monorepo)

---

## Resumen ejecutivo

| Categoría | Cantidad | Acción |
|-----------|----------|--------|
| Config / monorepo (permanecen en raíz) | 9 | OK |
| Documentación agente/proyecto | 5 | OK en raíz |
| Canvas arquitectura | 1 | OK en raíz |
| **Residuos one-shot (patch JS)** | 12 | **Movidos** → `scripts/archive/legacy-root-patches/` |
| QA efímeros | 2 | **Movidos** → `scripts/archive/ephemeral-qa/` |
| Directorios estándar | 12+ | OK |
| Ignorados / local-only | varios | No commitear |

---

## Permanecen en raíz (correcto)

### Configuración monorepo

| Archivo | Rol |
|---------|-----|
| `package.json` | Workspaces npm, scripts QA/verify |
| `package-lock.json` | Lockfile |
| `turbo.json` | Turborepo pipeline |
| `tsconfig.base.json` | TS base compartido |
| `pnpm-workspace.yaml` | Referencia legacy (npm es PM canónico) |
| `eas.json` | Perfiles EAS Build |
| `app.json` | Config Expo raíz (referencia mobile) |

### Documentación

| Archivo | Rol | ¿Registrar en `docs/registry.json`? |
|---------|-----|-------------------------------------|
| `README.md` | Landing GitHub / onboarding | No — fuera de `docs/` |
| `CHANGELOG.md` | Historial release | No — generado (`changelog:*`) |
| `CONTRIBUTING.md` | Guía contribución | No |
| `CLAUDE.md` | Contexto agentes | No — convención Cursor/Claude |
| `AGENTS.md` | Preferencias agente | No |

### Artefactos

| Archivo | Rol |
|---------|-----|
| `ARCHITECTURE_SYSTEM.canvas.tsx` | Mapa visual arquitectura (Cursor Canvas) |

### Dotfiles operativos

| Archivo | Rol |
|---------|-----|
| `.gitignore` | Exclusiones git |
| `.npmrc` | Config npm |
| `.easignore` | Exclusiones EAS |
| `.trivyignore` | Exclusiones security scan |
| `.claudeignore` | Exclusiones Claude Code |

---

## Residuos remediados

### Patch scripts (ex raíz)

Doce scripts Node one-shot de migraciones i18n/UI tempranas. Mutaban fuentes por regex; **obsoletos** para el árbol actual.

**Destino:** `scripts/archive/legacy-root-patches/` + [`README.md`](../../scripts/archive/legacy-root-patches/README.md)

| Archivo | Destino histórico |
|---------|-------------------|
| `add_guia.js` | `guia-page-ui.ts` |
| `patch_faq*.js` (3) | FAQ i18n |
| `patch_guia_*.js` (2) | Guía |
| `patch_tooltip_*.js` (2) | Tooltips |
| `patch_ui*.js` (2) | `page.tsx` |
| `update_guia_and_chrome.js` | Guía + chrome |
| `update_packs.js` | Token packs copy |

### QA efímeros (ex `scripts/`)

| Archivo | Motivo archivo | Sustituto registrado |
|---------|----------------|---------------------|
| `smoke-literal-fidelity-2026-06-24.mjs` | Smoke puntual post-fix | `QA-LRS-001`, `QA-RDG-001` |
| `mutation-recheck-failures.mjs` | Re-run 9 fixtures Jun-15 | `QA-MUT-001` |

**Destino:** `scripts/archive/ephemeral-qa/`

---

## Scripts QA no registrados (remediado en misma sesión)

| Script | Acción |
|--------|--------|
| `scripts/line-reading-system-qa.mjs` | Registrado `QA-LRS-001` |
| `scripts/master-synthesis-qa.mjs` | Registrado `QA-RDG-002` |
| `scripts/test-image-pipe.mjs` | Exento (dev ad-hoc) en [`docs/qa/exempt-paths.json`](../qa/exempt-paths.json) |

---

## Directorios raíz (sin acción)

| Directorio | Rol |
|------------|-----|
| `apps/` | Web + mobile |
| `backend/` | Claude + auth + migraciones SQL |
| `packages/` | Engines compartidos |
| `scripts/` | Gates QA, pipeline dataset, archive |
| `tools/` | Extracción gold, audits dataset |
| `docs/` | Documentación codificada |
| `reports/` | Artefactos QA (gitignored parcial) |
| `security/` | Salida `security:scan` |
| `supabase/` | Config CLI local |
| `.github/` | CI |

---

## Local-only (no commitear)

| Path | Notas |
|------|-------|
| `.env`, `.env.*` | Secretos |
| `node_modules/`, `.turbo/`, `dist/` | Build |
| `.cache/`, `.tmp/`, `.vercel/` | Runtime local |
| `.cursor/`, `.claude/`, `.agents/` | Agent state |
| `skills-lock.json` | En `.gitignore` |

---

## Política raíz (nueva)

1. **Prohibido** añadir scripts `.js`/`.mjs` sueltos en raíz — usar `scripts/` o `tools/`.
2. **Prohibido** añadir auditorías `.md` en raíz — usar `docs/auditorias/` con código.
3. Documentación operativa → `docs/` con registro ([WF-DOC-02](../workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md)).
4. Tests/gates → [`docs/qa/`](../qa/) ([WF-QA-01](../workflows/00000000-WF-QA-01-test-lifecycle.md)).
5. One-shots archivados → `scripts/archive/` con README.

---

## Verificación continua

```bash
npm run verify:qa-registry
```

Desde v1.3.0: orphan `*.test.ts`, npm gates no registrados, cabeceras QA.

---

## Enlaces

- Workflow tests: [`WF-QA-01`](../workflows/00000000-WF-QA-01-test-lifecycle.md)
- Exenciones QA: [`docs/qa/exempt-paths.json`](../qa/exempt-paths.json)
