# Plan — Anti-Warp: serializar hidratación vs consulta

**Código:** `00000000-PLAN-SUP-08 anti-warp-serialize-burst` · **Familia:** SUP · **Estado:** reference

**Rama:** `fix/anti-warp-serialize-burst`  
**Alcance:** solo fix raíz app (PostgREST burst). **Fuera de scope:** VACUUM FULL, IPv4, ticket Supabase.

## Problema

Warp kills en **uso normal** cuando:
1. Hidratación de chats (login / abrir hilo)
2. Nueva consulta

**Causa:** solapamiento de requests → cola en pool PostgREST (10). Postgres **no** está saturado (70 filas).

## Fixes (R1–R4)

| ID | Cambio | Archivo |
|----|--------|---------|
| R1 | APK: quitar `__rnForceAccountRefresh` en login; defer `syncChats` 12s | `apps/mobile/app/index.tsx` |
| R2 | Bloquear consulta mientras hidratación in-flight | `apps/web/src/app/page.tsx` |
| R3 | Single-flight `thread=1` por sessionId | `apps/web/src/app/page.tsx` |
| R4 | No auto-fetch hilo si thread ya tiene contenido completo | `session-thread-hydration.ts` + bootstrap |

## Fuera de este PR

- VACUUM FULL (higiene disco)
- Dedicated IPv4
- Respuesta ticket Supabase (escala multi-usuario concurrente)

## Verificación

1. Login web → abrir chat → consulta (sin Warp en logs API uso normal)
2. APK: login → abrir chat → consulta
3. Axiom: `supabase_op` con `waitMs=0` en flujo simple
4. `pnpm test` — `session-thread-hydration.test.ts`
