# Auditoría de Seguimiento — Bloqueo de Consultas por Hidratación + SQLite
## The Original I Ching App

| Campo | Valor |
|---|---|
| **Fecha** | 2026-06-13 |
| **Commit auditado** | `bf2f489` (Merge branch 'staging') |
| **Documento fuente** | `AUDIT_2026-06-13_followup_hydration-gating.md` |
| **Rama de fix** | `fix/hydration-gate-per-session` |
| **Severidad original** | Alta — bloqueante para lanzamiento Android |
| **Estado** | ✅ TODOS LOS HALLAZGOS IMPLEMENTADOS |

---

## Hallazgos e implementación

### Acción 1 — Gate por sesión activa (Alta / Bloqueante) ✅

**Síntoma:** Tras hidratar los chats, al crear una sesión nueva aparecía "Tus chats aún se están cargando..." y no permitía consultar.

**Causa raíz:** `isPostgrestHydrationBusy` usaba contadores globales — cualquier hidratación de cualquier chat bloqueaba todas las sesiones.

**Implementación:**
- `apps/web/src/lib/session-thread-hydration.ts`: nueva función `isActiveSessionThreadHydrating` + tipo `ActiveSessionGateInput`
- `apps/web/src/app/page.tsx`: reemplazado el gate en `executeConsultationRequest` por la nueva función; eliminado el import de `isPostgrestHydrationBusy`

**Comportamiento post-fix:**

| Caso | Antes | Después |
|---|---|---|
| Sesión nueva (sin `sessionId`) | Bloqueada si algo hidrata | **Nunca bloqueada** ✅ |
| Sesión ya hidratada | Bloqueada si algo hidrata | **Nunca bloqueada** ✅ |
| Sesión con su propio hilo cargando | Bloqueada | Bloqueada hasta que llegue su hilo ✅ |
| Contador global atascado por otro chat | Bloquea TODO | **No afecta el gate** ✅ |

---

### Acción 2 — Unificar contabilidad RN en el Set (Media) ✅

**Causa raíz:** El path RN incrementaba `postgrestHydrationBusyRef` (contador) pero usaba un Set para el dedup. Si el mismo `localId` disparaba `request_thread` dos veces antes de responder, el contador subía a 2 pero el Set solo tenía 1 entrada — el primer decremento lo dejaba en 1 y nunca volvía a 0.

**Implementación en `page.tsx`:**
- RN branch de `loadSessionThreadImpl`: eliminado `postgrestHydrationBusyRef.current += 1`
- `onRnThread`: eliminado decremento del counter; solo `rnHydrationLocalIdsRef.current.delete(localId)`
- `onRnThreadNotFound`: idem

El path no-RN (bootstrap + web thread loads) sigue usando el counter correctamente.

---

### Acción 3 — Watchdog por `localId` (Media) ✅

**Causa raíz:** `injectJavaScript` es fire-and-forget. Si el contexto del WebView cambia entre `request_thread` y la respuesta, el evento se pierde y el spinner queda eternamente activo.

**Implementación en `page.tsx`:**
- Nuevo ref `rnWatchdogTimersRef: Map<string, ReturnType<typeof setTimeout>>`
- En RN branch de `loadSessionThreadImpl`: timer de 10 s por `localId` que limpia el Set, el timer de 250 ms y el loading state
- En `onRnThread` y `onRnThreadNotFound`: clearTimeout del watchdog al recibir respuesta nativa

---

### Acción 4 — Estado de carga inmediato para sesiones sin caché (Baja) ✅

**Problema:** Para sesiones no cacheadas, `dispatchThread(cached)` retornaba silenciosamente y el usuario no veía nada hasta que el timer de 250 ms del lado web disparaba.

**Implementación:**
- `apps/mobile/app/index.tsx`: cuando `cached.length === 0` (y hay token para hacer sync), emite `rn:thread-loading` inmediatamente vía `injectJavaScript`
- `apps/web/src/app/page.tsx`: nuevo handler `onRnThreadLoading` que cancela el timer de 250 ms y activa `setHistoryLoading(true)` + `setLoadingSessionLocalId(localId)` al instante

---

### Acción 5 — Ignorar cooldown si caché vacía (Baja) ✅

**Problema:** Si `chat_content_synced:{sessionId}` estaba fresco (<5 min) pero las filas no estaban en SQLite (sync previo guardó la meta-key pero falló antes de escribir contenido), `syncChatThread` retornaba por cooldown y `getPagedThread` devolvía vacío.

**Implementación en `apps/mobile/src/sync/sync-service.ts`:**
- Importado `getChatMessageCount` desde `chat-store`
- Dentro del bloque de cooldown: si `rowCount === 0` o `null`, se bypasea el cooldown y se fuerza el sync

---

### Acción 6 — Telemetría de tiempos de hidratación (Baja) ✅

**Implementación en `apps/mobile/app/index.tsx`:**
- `[rn:thread] tier2_cache localId=… rows=… ms=…` — tiempo desde `request_thread` hasta primer `dispatchThread`
- `[rn:thread] tier3_sync localId=… ms=…` — duración de `syncChatThread`

Visible en logcat (`adb logcat`) y en Metro bundler durante desarrollo.

---

## Archivos modificados

| Archivo | Acciones |
|---|---|
| `apps/web/src/lib/session-thread-hydration.ts` | 1 (nuevo `isActiveSessionThreadHydrating`) |
| `apps/web/src/app/page.tsx` | 1, 2, 3, 4 |
| `apps/mobile/app/index.tsx` | 4, 6 |
| `apps/mobile/src/sync/sync-service.ts` | 5 |

---

## Validación recomendada en Android

1. Login → esperar hidratación de varios chats → **crear sesión nueva → consultar** (debe funcionar sin bloqueo) ← caso bloqueante principal
2. Abrir chat ya hidratado → consulta de seguimiento → no debe bloquearse
3. Abrir chat que no está en SQLite → ver que aparece spinner inmediatamente (sin 250 ms de silencio)
4. Forzar restart del WebView durante hidratación → verificar que el spinner desaparece en ~10 s (watchdog)
5. `adb logcat -s ReactNativeJS` → verificar logs `[rn:thread] tier2_cache` y `tier3_sync` con tiempos razonables

---

*Implementado el 2026-06-13 sobre la rama `fix/hydration-gate-per-session` en respuesta a la auditoría de seguimiento post-primera-prueba en Android.*
