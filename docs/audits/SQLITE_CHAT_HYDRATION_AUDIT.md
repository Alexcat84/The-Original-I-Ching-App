# Auditoría — SQLite / hidratación de chats (mobile)

**Fecha:** 2026-06-04  
**Rama auditada:** `staging` @ `4ebafc3`  
**Alcance:** Historial git completo desde `feature/local-storage-and-webview-fix` hasta HEAD de staging; código native (`apps/mobile`) y bridge web (`apps/web/src/app/page.tsx`).

---

## Resumen ejecutivo

SQLite **no se eliminó del código**. La hidratación rápida dejó de funcionar por una **cadena de regresiones**:

1. **`0120c50` (31 may 2026)** — guards de seguridad herméticos que vacían SQLite agresivamente.
2. **`3310d84` (1 jun 2026)** — bug JWT base64url sin padding → `clearAllData()` en **cada cold start**.
3. **Carrera `auth_token` vs SecureStore** — introducida en `0120c50`, **aún activa** en HEAD: borra SQLite ~150 ms después de una inyección exitosa.

El fix JWT (`4ebafc3`, 4 jun) está en `staging` HEAD pero **no corrige la carrera `auth_token`**. Un APK compilado antes de `4ebafc3` (versionCode 39 / 3.4.6) sigue afectado por el wipe sistemático en cold start.

**Veredicto:** la feature nunca desapareció; fue degradada por sus propios guards de seguridad y un bug JWT. El código en staging está a **un fix de carrera** de recuperar el comportamiento "WhatsApp offline" original.

---

## 1. Cuándo funcionó — implementación original

### Timeline de introducción (20 mayo 2026)

| Commit | Mensaje | Cambio |
|--------|---------|--------|
| `9da23ec` | `feat(mobile/db): expo-sqlite` | Schema + `chat-store.ts` |
| `b61ba48` | `feat(mobile/sync):` | `sync-service.ts` + `image-sync.ts` |
| `486eb42` | Integración WebView | Sync + `injectCachedChats` |
| `401673d` | Web: evento `rn:cached-chats` | Listener en `page.tsx` |
| `1654e45` | Re-export `initDb` | Fix crash on mount |
| `84f3050` | Stale-while-revalidate lista | Deja de `clearAllData` en sign-out |
| `dc5c6e9` / `70cdabf` | Merge staging/main | Feature en producción el mismo día |

**Rama de origen:** `feature/local-storage-and-webview-fix` → merge vía `dc5c6e9`.

### Pico de funcionamiento (20–26 mayo, commit `58b56c4`)

Arquitectura **3-tier local-first**:

```
┌─────────────────────────────────────────────────────────────┐
│ TIER 1 — Lista sidebar (metadata)                           │
│ syncChats() → SQLite → getCachedChatsForInjection()         │
│ → window.__rnCachedChats + event rn:cached-chats            │
│ → onLoadEnd inyecta desde cachedChatsRef (sin round-trip)   │
├─────────────────────────────────────────────────────────────┤
│ TIER 2 — Hilo al abrir chat                                 │
│ Web postMessage request_thread                              │
│ → getPagedThread(sessionId, 30) → rn:thread-data            │
├─────────────────────────────────────────────────────────────┤
│ TIER 3 — Sync incremental en background                     │
│ syncChatContent() → upsertMessages → re-dispatch si cambió    │
└─────────────────────────────────────────────────────────────┘
```

En esta fase:

- `auth_token` **no borraba** SQLite en cold start (solo ejecutaba `syncChats`).
- Sign-out **no borraba** disco (`84f3050`) — el caché sobrevivía entre sesiones.
- Sidebar instantáneo + hilos desde SQLite en ~150 ms.

### Evolución respecto al modelo "WhatsApp" bulk (`4aae78b`)

Desde `58b56c4` se eliminó `window.__rnCachedThreads` y el bulk sync de 20 chats. Los hilos pasaron a cargarse **lazy** vía `request_thread`. Esto es evolución arquitectónica correcta, no eliminación del caché.

---

## 2. Línea temporal de regresiones

| Fecha | Commit | Impacto |
|-------|--------|---------|
| 2026-05-20 | `58b56c4` | Arquitectura 3-tier estable — **referencia "funcionaba bien"** |
| 2026-05-21 | `bc7e23c` | Sync SQLite en delete chat / delete account |
| 2026-05-26 | `9bb3abc` | Web RN deja fetch paralelo; depende 100 % del bridge |
| 2026-05-31 | `8c64658` | Wipe solo si ambos UIDs existen y difieren |
| 2026-05-31 | **`0120c50`** | **Hermetic isolation** — wipe agresivo + `last_synced_user` |
| 2026-05-31 | `102ceec` / `5a9b141` | Evict chats stale si cuenta vacía en servidor |
| 2026-06-01 | **`3310d84`** | JWT base64url sin padding → wipe en **cada cold start** |
| 2026-06-04 | `09704c9` | Prewarm secuencial + timeout 12s (fix loading stuck, no wipe) |
| 2026-06-04 | `b81ea35` | Prewarm todos los chats (no solo top 3) |
| 2026-06-04 | **`4ebafc3`** | Fix padding JWT — **parcial**, carrera `auth_token` persiste |

---

## 3. Causas raíz verificadas

### 🔴 Causa A — Bug JWT (`3310d84` → fix `4ebafc3`)

**Introducido:** `3310d84` (1 jun) — reemplazó `Buffer.from(payload, "base64")` por `atob(b64)` **sin padding**.

**Mecanismo:**

```
atob(payload) falla en Hermes si length % 4 ≠ 0
→ getUserIdFromJwt() retorna null
→ mount effect: storedUid = null
→ clearAllData() en CADA cold start
→ SQLite siempre vacío → chats siempre desde red
```

**Fix aplicado en `4ebafc3`:**

```typescript
// apps/mobile/app/index.tsx — getUserIdFromJwt
const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
const json = atob(padded);
```

**Estado:** Fix en `staging` HEAD. Mismo `versionCode: 39` / `3.4.6` que el bump anterior (`718a6c1`). APKs compilados **antes** de `4ebafc3` siguen afectados.

**Ventana afectada:** builds 3.4.1–3.4.6 (~1–4 jun) sin padding fix.

---

### 🔴 Causa B — Hermetic isolation (`0120c50`) — AÚN ACTIVA

**31 mayo 2026** — cuatro cambios de seguridad cross-user:

| Cambio | Antes | Después `0120c50` |
|--------|-------|-------------------|
| Cold start mount | Usar caché si existe | Requiere `storedUid === last_synced_user`; si no → `clearAllData()` |
| `auth_token` wipe | `prevUid && newUid && prevUid !== newUid` | `newUid && prevUid !== newUid` (**incluye `prevUid === null`**) |
| Sign-out | Caché persistía en disco | `clearAllData()` + wipe memoria |
| `syncChats` | Sin meta de usuario | Escribe `last_synced_user` tras sync exitoso |

**Mount guard actual** (`apps/mobile/app/index.tsx` L1798–1815):

```typescript
if (storedUid && lastSyncedUser && storedUid === lastSyncedUser) {
  cachedChatsRef.current = chats;
} else {
  await clearAllData();
  cachedChatsRef.current = [];
}
```

**Consecuencias:**

- Primer arranque tras upgrade: sin `last_synced_user` → wipe aunque haya datos válidos.
- Offline antes del primer `auth_token` + sync completado → sin caché en cold start.
- Sign-out borra disco; re-login requiere sync de red antes de hidratación instantánea.

---

### 🔴 Causa C — Carrera `auth_token` vs SecureStore — NO CORREGIDA

**Flujo en cold start:**

1. Mount async carga SQLite → `cachedChatsRef` poblado (si pasa guard B).
2. `onLoadEnd` inyecta sidebar instantáneo ✓
3. `INJECTED_JS` llama `_sendToken()` a 0 / 150 / 400 / 500 ms desde localStorage web.
4. Handler `auth_token`:

```typescript
const prevUid = getUserIdFromJwt(accessTokenRef.current ?? "");
const newUid  = getUserIdFromJwt(msg.token);
if (newUid && prevUid !== newUid) {
  cachedChatsRef.current = [];
  void clearAllData().catch(() => undefined);
}
```

5. `accessTokenRef` se restaura desde SecureStore **después**, vía `validateStoredToken()` → fetch a `/api/account/me` (más lento que `_sendToken`).

**Resultado:** `prevUid = null`, `newUid = uuid válido` → **`clearAllData()` para el mismo usuario** → SQLite borrado ~150 ms después de la inyección exitosa.

**Comparación histórica del handler `auth_token`:**

| Commit | Condición de wipe |
|--------|-------------------|
| `58b56c4` (funcionaba) | Sin wipe — solo `syncChats` |
| `8c64658` | `prevUid && newUid && prevUid !== newUid` |
| `0120c50` (actual) | `newUid && prevUid !== newUid` ← **null-safe roto** |

**Síntoma observable:**

- Sidebar aparece un instante (Tier 1 inyectado en estado web).
- Al abrir chat: SQLite vacío → "Loading conversation…" lento o vacío.
- Siguiente cold start: sin caché persistente.

---

### 🟡 Causa D — Gaps en capa web (`page.tsx`)

**D1 — `applyCache` no sobreescribe si ya hay sessions:**

```typescript
setSessions((prev) => {
  if (prev.some((s) => s.messageCount > 0)) return prev;
  return entries;
});
```

Si Supabase llega antes que RN, el caché nativo se ignora (aceptable en stale-while-revalidate).

**D2 — Cuenta vacía en servidor no limpia sidebar:**

```typescript
if (hydrated.length === 0) {
  setHistoryLoadError(null);
  return; // no setSessions([])
}
```

Los fixes `102ceec`/`5a9b141` dependen de que native inyecte `[]` explícitamente.

**D3 — Sin fallback web en RN** (`9bb3abc`): Tier 2/3 dependen 100 % del bridge native. Si SQLite se borra, web no tiene plan B.

---

## 4. Archivos núcleo (estado actual)

| Archivo | Rol |
|---------|-----|
| `apps/mobile/src/db/schema.ts` | Schema SQLite (`iching_cache.db`) |
| `apps/mobile/src/db/chat-store.ts` | CRUD, `getCachedChatsForInjection`, `getPagedThread`, `clearAllData`, `sync_meta` |
| `apps/mobile/src/sync/sync-service.ts` | Tier 1 `syncChats`, Tier 3 `syncChatContent`, prewarm secuencial |
| `apps/mobile/src/sync/image-sync.ts` | Descarga imágenes a disco local |
| `apps/mobile/app/index.tsx` | Mount guard, `injectCachedChats`, `onLoadEnd`, handlers bridge |
| `apps/web/src/app/page.tsx` | Listeners `rn:cached-chats`, `rn:thread-data`, `request_thread` |

**Dependencia:** `expo-sqlite@~14.0.4` en `apps/mobile/package.json`.

---

## 5. Estado git actual vs "cuando funcionaba"

| Aspecto | Mayo 20 (`58b56c4`) | Staging (`4ebafc3`) |
|---------|---------------------|---------------------|
| Tier 1 sidebar | Instantáneo | Diseñado igual; wipe lo anula |
| Tier 2 hilos | `request_thread` + SQLite | Igual |
| Bulk `__rnCachedThreads` | Eliminado en refactor | Lazy per-chat (correcto) |
| Sign-out | Caché persistía | Wipe total |
| Guard de usuario | No existía | `last_synced_user` + JWT |
| JWT decode | Menos crítico | Crítico; padding fix en HEAD |
| `auth_token` wipe | No existía | Wipe si `prevUid !== newUid` (carrera) |
| Rate limit Upstash | N/A | Fail-closed si no configurado |

**Lo que NO cambió:** ningún commit elimina `expo-sqlite`, `chat-store`, `injectCachedChats` ni el merge `dc5c6e9`.

---

## 6. Por qué los intentos de arreglo no bastaron

| Intento | Commit | Qué hizo | Por qué no bastó |
|---------|--------|----------|------------------|
| Fix JWT padding | `4ebafc3` | Corrige mount guard | No arregla carrera `auth_token` |
| Prewarm secuencial | `09704c9` | Evita loading stuck | Mejora Tier 2/3 cuando SQLite **tiene** datos |
| Prewarm all chats | `b81ea35` | Pre-carga todos los hilos | Idem — no evita wipe |
| Hermetic isolation | `0120c50` | Seguridad cross-user | **Introdujo** el wipe que rompe cold start |
| Agentes previos | — | Retocaron sync/web sin git archaeology | No identificaron cadena `0120c50` + `3310d84` + carrera |

---

## 7. Matriz de síntomas vs causas

| Síntoma observado | Causa más probable |
|-------------------|-------------------|
| Sidebar siempre carga desde red (nunca instantáneo) | APK sin `4ebafc3` (JWT wipe en mount) |
| Sidebar flash rápido, hilos lentos/vacíos | Carrera `auth_token` (Causa C) |
| Funcionaba ayer, hoy vacío tras upgrade | Sin `last_synced_user` en `sync_meta` (Causa B) |
| Chats de otro entorno desaparecen | `102ceec` evict correcto (comportamiento esperado) |
| "Loading conversation…" infinito | Prewarm bloqueado / timeout red (`09704c9` mitiga) |
| Sidebar stale tras borrar todos los chats en web | Gap D2 en `page.tsx` |

---

## 8. Checklist de verificación en dispositivo

- [ ] Confirmar que el APK se compiló desde `staging` @ `4ebafc3` o posterior.
- [ ] Cold start con usuario ya logueado: ¿sidebar instantáneo?
- [ ] Abrir un chat inmediatamente: ¿contenido en < 300 ms o "Loading…"?
- [ ] Segundo cold start sin sign-out: ¿sidebar sigue instantáneo?
- [ ] Tras sign-out + re-login mismo usuario: ¿requiere sync de red completo? (esperado con política actual).
- [ ] Verificar `UPSTASH_REDIS_REST_*` solo afecta web/library, no SQLite native.

---

## 9. Fixes recomendados (fase remediación — pendiente)

Prioridad sugerida:

1. **`auth_token`:** no ejecutar wipe si `prevUid === null` y el token corresponde al mismo usuario que `last_synced_user`; o restaurar SecureStore **antes** de que WebView dispare `_sendToken`.
2. **Mount guard:** si hay chats en SQLite + JWT válido pero falta `last_synced_user`, no wipe — escribir meta tras primer sync exitoso.
3. **Bump version** a 3.4.7 / versionCode 40 incluyendo `4ebafc3` + fix de carrera.
4. **Web:** en fetch summary, `hydrated.length === 0` → `setSessions([])` en path RN.
5. **Tests:** simular cold start con timing SecureStore vs `auth_token`.

---

## 10. Veredicto final

| Pregunta | Respuesta |
|----------|-----------|
| ¿Se perdió SQLite del código? | **No** |
| ¿Cuándo funcionó? | **20–30 mayo 2026** (pre-`0120c50`) |
| ¿Cuándo se rompió? | **31 mayo** (security wipe) + **1–4 jun** (JWT bug) |
| ¿Está arreglado en git? | **Parcialmente** — JWT sí (`4ebafc3`); carrera `auth_token` **no** |
| ¿Por qué sigue fallando en APK? | Build sin `4ebafc3` y/o bug de carrera activo |
| ¿Listo para remediación? | **Sí** — un patch focalizado en `auth_token` + bump de versión |

---

## Referencias git

```
git log --oneline --grep=sqlite
git log --oneline staging -- apps/mobile/app/index.tsx apps/mobile/src/db/ apps/mobile/src/sync/
git show 58b56c4   # arquitectura 3-tier de referencia
git show 0120c50   # hermetic isolation (regresión seguridad)
git show 3310d84   # JWT bug
git show 4ebafc3   # JWT fix (HEAD staging)
```

**Rama auditada:** `staging` @ `4ebafc3` (2026-06-04)
