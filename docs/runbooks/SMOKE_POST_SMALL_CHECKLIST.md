# Smoke post-Small + PR1–PR3 — Checklist

**Proyecto:** The Original I Ching App (prod)  
**Infra:** Supabase Small, ticket Support abierto  
**Código:** `d58fb28` (PR1 resilience + PR2 mobile gate + PR3 bootstrap cache 30s)  
**APK:** dist **48** (`versionCode: 48`)

## Pre-requisitos

- [ ] Web prod desplegada (`main` / `staging` = `d58fb28` o posterior)
- [ ] APK instalada: `adb install -r apps/mobile/android/app/build/outputs/apk/release/app-release.apk`
- [ ] Dispositivo anotado: _______________
- [ ] Ventana smoke inicio (UTC): _______________

## Monitoreo en paralelo

- Supabase Dashboard → Logs → API (`service:api`): Warp, 500, `logout`
- Vercel logs: `/api/account/bootstrap`, `/api/account/chats`, `/api/consult`
- Buscar en Vercel: `[auth_resilience_retry]`

---

## A — Uso normal (§4.4, ~10 min)

| # | Paso | Pausa | OK | Notas |
|---|------|-------|----|-------|
| 1 | Cold open app | — | [ ] | |
| 2 | UI estable (tokens/tier visibles) | 3 s | [ ] | Bootstrap duration: _____ s |
| 3 | Abrir chat A | 5 s | [ ] | |
| 4 | Abrir chat B | 5 s | [ ] | |
| 5 | 1 consulta Seeker (monedas) | SSE complete | [ ] | |
| 6 | Export PDF hilo activo | — | [ ] | |

## B — Escenarios extra

| Escenario | OK | Notas |
|-----------|----|-------|
| Cold open ×3 (kill app entre intentos) | [ ] | 0 logout auto |
| Red lenta / airplane mode breve | [ ] | Recupera sin kick OAuth |
| Consulta Master ×1 | [ ] | Warp ≤2 tolerable; 0 kick |
| PDF hilo 6+ consultas | [ ] | Sin OOM |

---

## SLI — Criterios PASS (soft launch)

| SLI | Target | Resultado |
|-----|--------|-----------|
| Warp en ventana smoke | **0** | _____ |
| `POST /auth/v1/logout` sin acción usuario | **0** | _____ |
| 5xx bootstrap/chats | **0** o recuperación sin kick | _____ |
| Bootstrap p95 (normal) | **< 8 s** | _____ s |
| Consulta + PDF | OK | [ ] |

## Veredicto final

- [ ] **PASS** — listo soft launch Play Store
- [x] **FAIL** — anotar fase y correlacionar logs

**Fin ventana (UTC):** 2026-06-10 ~02:14 UTC  
**Observaciones:**

- **Dispositivo:** SM-S918U1, dist 48, prod `d58fb28`
- **Fase fallo:** carga de chats → kick a `/login` → OAuth Google en Chrome externo → atascado en selector de cuenta
- **Supabase auth (02:13:44–48 UTC):** `authorize` + `login` callback OK, **sin** `POST /logout` previo
- **Supabase API:** bootstrap/chats en **200** (JWT válido en servidor)
- **Causa raíz:** 401 transitorio en Vercel (`getUser` bajo carga) tras `refreshSession` OK → `signOut` + `auth_signout` → redirect `/login` → OAuth externo
- **Fix aplicado (post-smoke):** retry 401 post-refresh; no `signOut` si `getSession()` válido; native `auth_signout` re-inyecta sesión si JWT en SecureStore sigue usable
