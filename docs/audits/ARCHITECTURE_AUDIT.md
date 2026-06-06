# Arquitectura Completa — The Original I Ching App

**Última actualización:** 2026-05-26  
**Branch de referencia:** `main` @ `1316508`  
**Alcance:** Documentación técnica completa de A a Z

---

## Estado · Changelog de cierre

> **Estado:** 📋 DOCUMENTO VIVO — referencia de arquitectura; deuda técnica parcialmente resuelta post-auditoría

| Campo | Valor |
|-------|-------|
| **Creado** | 2026-05-26 |
| **Última revisión de deuda** | 2026-06-05 |

### Estado de la Deuda Técnica (Sección 18)

| # | Ítem | Estado actual | Commit / Decisión |
|---|------|--------------|-------------------|
| 1 | Race condition en consumo de tokens (2 tabs simultáneos) | 🟡 Abierto — bajo volumen actual, riesgo aceptado | — |
| 2 | Rate limiting inoperativo sin Upstash | ✅ Resuelto | `3d773ab` — fail-closed en producción (H1) |
| 3 | Sin Sentry en Web | 🟡 Abierto — `instrumentation-client.ts` existe, Sentry no configurado aún | — |
| 4 | Fallback chain de Claude silencia errores | 🟡 Abierto — logging mejorado pero sin alertas estructuradas | — |
| 5 | Cache hit rate Claude ~15-20% | ✅ Aceptado por diseño — bloque de contexto crece por necesidad | — |
| 6 | Timeout Vercel si plan Hobby | ✅ Resuelto — plan Pro activo en producción | — |
| 7 | GitHub Actions CI — deadline 2 jun 2026 | ✅ Resuelto | Actualizado a `actions/checkout@v6` + `setup-node@v6` el 2026-05-31 |
| 8 | Google Play Console — verificación + assets | 🟡 En progreso — cuenta creada, verificación pendiente | — |
| 9 | i18n formal con next-intl | 🟡 Abierto — post-lanzamiento Fase 2; estandarización de paquete `@iching-oracle/i18n` en curso | — |
| 10 | Animación ritual Huesos de Oráculo (Three.js) | 🟡 Abierto — post-lanzamiento Fase 2 | — |
| 11 | Supabase Pro | ✅ Resuelto — ambos entornos (staging + producción) en Pro | — |

### Cambios arquitectónicos significativos post-auditoría

| Fecha | Cambio | Commit |
|-------|--------|--------|
| 2026-05-26 | Webhook idempotency atómico (`grant_tokens_idempotent`) | `3d773ab` |
| 2026-05-26 | `admin/public-config` eliminado | `3d773ab` |
| 2026-05-30 | Docs reorganizados en `docs/` con categorías | `4f0597a` |
| 2026-06-04 | SQLite: padding JWT fix + preservar caché en sign-out + UID en SecureStore | `4ebafc3`, `c22696f`, `7367a97` |
| 2026-06-04 | Tour onboarding: persistencia en `public.users.tour_v1_completed_at` (migración 051) | `b634e7e` |
| 2026-06-04 | Auth bar: fix de hydration gap con `_rnAuthEmail` en localStorage | `33aadb8` |

---

---

## Índice

1. [Visión General](#1-visión-general)
2. [Monorepo y Toolchain](#2-monorepo-y-toolchain)
3. [Web App — Next.js](#3-web-app--nextjs)
4. [API Endpoints](#4-api-endpoints)
5. [Mobile App — Expo WebView](#5-mobile-app--expo-webview)
6. [SQLite Local Cache (3 Tiers)](#6-sqlite-local-cache-3-tiers)
7. [WebView Bridge Protocol](#7-webview-bridge-protocol)
8. [Base de Datos — Supabase](#8-base-de-datos--supabase)
9. [Paquetes Compartidos](#9-paquetes-compartidos)
10. [Sistema de Tokens Consumibles](#10-sistema-de-tokens-consumibles)
11. [Autenticación](#11-autenticación)
12. [Generación de Imágenes](#12-generación-de-imágenes)
13. [Claude AI — Interpretación](#13-claude-ai--interpretación)
14. [Servicios Externos](#14-servicios-externos)
15. [Deploy y CI/CD](#15-deploy-y-cicd)
16. [Seguridad](#16-seguridad)
17. [Observabilidad](#17-observabilidad)
18. [Deuda Técnica y Hallazgos Abiertos](#18-deuda-técnica-y-hallazgos-abiertos)

---

## 1. Visión General

**Producto:** App de consultas al I Ching con IA. Oráculo ancestral chino (y Huesos de Oráculo Shang) con interpretación moderna via Claude AI.

**Modelo de negocio:** Tokens consumibles (no suscripción). El usuario compra packs; los tokens se acumulan entre compras.

**Plataformas:**
- Web: SPA/SSR vía Next.js, accesible en `theoriginaliching.com`
- Android: APK via Expo + React Native WebView (la app nativa es un wrapper de la web)

**Stack de alto nivel:**

```
Usuario
  │
  ├── Browser → Next.js (Vercel) → Supabase (PostgreSQL + Auth)
  │                              → Claude API (Anthropic)
  │                              → Together AI (FLUX.1 Schnell)
  │
  └── Android APK → WebView → misma URL web
                  → SQLite local (offline cache, 3 tiers)
                  → expo-file-system (imágenes descargadas)
```

---

## 2. Monorepo y Toolchain

```
/
├── apps/
│   ├── web/              # Next.js 14 App Router (SSR + API Routes)
│   └── mobile/           # Expo 51 + React Native WebView (APK Android)
├── packages/
│   ├── iching-engine/    # Algoritmos de sorteo
│   ├── context-engine/   # Límites de sesión, créditos por tier
│   ├── oracle-bones-engine/  # Sorteo Huesos de Oráculo Shang
│   ├── image-engine/     # Prompt builder para imágenes AI
│   ├── i18n/             # 11 idiomas
│   ├── ui/               # Componentes React compartidos
│   ├── sharing/          # URLs públicas de lecturas
│   ├── iching-data/      # Biblioteca estática de 64 hexagramas
│   └── mobile-api-contracts/  # Tipos del bridge nativo-web
├── backend/
│   ├── claude/           # Integración Anthropic API
│   ├── auth/             # 2FA, validación de email, bcrypt
│   └── db/migrations/    # 38 migraciones SQL (Supabase)
└── tools/
    └── fallback-tools/   # Utilidades locales de generación/QA
```

**Package manager:** pnpm workspaces  
**Monorepo orchestrator:** Turborepo (builds paralelos, cache remoto)  
**CI:** GitHub Actions (`.github/workflows/ci.yml`) — lint + typecheck + build

### Versiones clave

| Pieza | Versión |
|-------|---------|
| Next.js | 15.5.14 |
| React | 18.2.0 |
| TypeScript | 5.3.3 (mobile) / 5.7.3 (web) |
| Expo | 51.0.39 |
| React Native | 0.74.5 |
| expo-sqlite | 14.0.4 |
| Node.js | ≥20 (CI) |

### Apps/mobile — gestión de dependencias

`apps/mobile` usa **npm** (no pnpm), con su propio `package-lock.json`. Esto es para compatibilidad con EAS Build y el toolchain de Expo.

**Fix de Windows requerido después de cada `npm install`:** `@expo/config-plugins` (glob v10) no resuelve rutas con backslashes + extglob `@(java|kt)` en Windows. Aplicar manualmente en `node_modules`:

```js
// @expo/config-plugins/build/android/Paths.js — getProjectFilePath()
const rawPattern = path().join(projectRoot, `android/app/src/main/java/**/${name}.@(java|kt)`);
const filePath = (0, _glob().sync)(rawPattern.replace(/\\/g, '/'))[0];

// @expo/config-plugins/build/android/Package.js — getCurrentPackageForProjectFile()
const rawPattern = _path().default.join(projectRoot, `android/app/src/${type}/java/**/${fileName}.@(java|kt)`);
const filePath = (0, _glob().sync)(rawPattern.replace(/\\/g, '/'))[0];
```

> EAS Build (Linux cloud) nunca necesita este fix. Solo afecta `expo prebuild` local en Windows.

---

## 3. Web App — Next.js

**Directorio:** `apps/web/src/app/`

### Layout raíz (`layout.tsx`)

- `dynamic = "force-dynamic"` — SSR en cada request
- Inyecta nonce CSP en el HTML
- Providers: `CookieConsentGate`, **`ChatSessionProvider`** (estado de chats nunca se destruye al navegar entre rutas — fix crítico para el bug de "chats desaparecen")
- Script de tema (dark/light) via `localStorage` con fallback a `prefers-color-scheme`

### Página principal (`page.tsx`)

Un único componente monolítico (~6,500 líneas) que contiene:

- **Estado global de sesión:** `useChatSessionState<ConsultationItem>()` del `ChatSessionProvider`
- **Oracle UI:** selector de método (Tres Monedas, Yarrow Stalks, Huesos de Oráculo), input de consulta, stream de respuesta
- **Sidebar de chats:** listado de sesiones, búsqueda, eliminación
- **Thread view:** renderizado de hexagramas, imágenes, interpretaciones
- **Native bridge hooks:** event listeners para `rn:cached-chats` y `rn:thread-data` (inyectados desde el APK)

**Tipos clave:**

```typescript
type ConsultResponse = {
  oracleType: "iching" | "oracle_bones";
  consultationId: string;
  primaryHexagram: number;
  primaryHexagramName: string;
  primaryHexagramChinese: string;
  transformedHexagram: number | null;
  transformedHexagramName: string | null;
  mutationRule: string;
  translator?: "wilhelm" | "legge" | "zhouyi" | "master_combined";
  lines: ApiLine[];            // position: 1-6, value: 6|7|8|9, isChanging, symbol
  changingLines: number[];
  interpretation: string;
  imageProvider: "auto" | "mock" | "svg-art" | "pollinations" | "fal" | "gpt-image" | "together";
  imageUrl: string;
  imageFallbackUrl?: string;
  sessionId: string | null;
  sessionPosition: number;
  publicReadingId: string;
  publicSessionId: string;
  remainingCredits?: number;
  category?: string;
  oracleBones?: { pattern_id: number; verdict: OracleBonesVerdict; ... };
};

type ChatSessionState<T> = {
  localId: string;
  title: string;
  sessionId: string;
  publicSessionId: string | null;
  thread: T[];
  threadMaxDepth: number | null;
  messageCount: number;
  updatedAt: number;
  firstConsultationAt: number | null;
};
```

**Bridge event listeners en page.tsx:**

```typescript
// Tier 1 — lista de chats desde SQLite (cold start)
window.addEventListener("rn:cached-chats", handler);
if (window.__rnCachedChats) applyCache(window.__rnCachedChats);

// Tier 2/3 — thread cacheado + sync incremental
window.addEventListener("rn:thread-data", handler);
// handler: mapApiConsultationToItem → setSessions → setHistoryLoading(false)
```

### Idiomas soportados (i18n)

`en`, `es`, `pt`, `fr`, `de`, `it`, `ja`, `zh`, `ko`, `ar`, `hi` — 11 idiomas. Implementación: objeto de strings planos por idioma dentro de `page.tsx` (no next-intl — i18n formal es post-lanzamiento Fase 2).

---

## 4. API Endpoints

Todos en `apps/web/src/app/api/`.

### Consulta Oracle (endpoint principal)

#### `POST /api/consult`

```
Runtime:     nodejs
maxDuration: 120s
Auth:        Bearer token (Supabase JWT)
```

**Flujo de ejecución:**

```
1. getAuthenticatedUser()          → 401 si no autenticado
2. Rate limit por IP (30 req/60s)  → 429
3. Rate limit por usuario (15/60s) → 429
4. getTokenBalance()               → leer créditos
5. if balance < tokensToConsume    → 402 Payment Required
6. consumeToken() (RPC atómico)    → descontar en DB
7. buildContextBlock()             → contexto sesión para Claude
8. interpret() / oracle-bones      → Claude API (streaming)
9. generateImage()                 → Together AI / fallback
10. Emit final_ready event         → cliente recibe resultado
```

**Eventos del stream SSE:**
```
cast_ready   → hexagrama + líneas + imagen prebuilt       (~15ms)
final_ready  → interpretación Claude + imagen definitiva  (~37-65s total)
error        → si falla el proceso
```

**Consumo de tokens por método:**
- Wilhelm/Baynes, Legge, Zhou Yi, Oracle Bones: 1 token
- Master Combined: 2 tokens

### Historial y sesiones

#### `GET /api/account/chats`
- `?summary=1` → lista de sesiones con metadata (title, messageCount, updatedAt). Usado por mobile para sincronizar el Tier 1.
- `?sessionId={uuid}` → sesión completa con todas sus consultas (consultations). Usado por mobile para Tier 3 y por web para cargar el thread.

#### `DELETE /api/account/chats?sessionId={uuid}`

### Perfil de usuario

#### `GET /api/account/me`
Retorna: `session_limit`, `credits_total`, `credits_used`, `last_pack`, `display_name`, `two_factor_enabled`, `tour_v1_completed`, estado de aceptación legal.

#### `POST /api/account/display-name`
#### `POST /api/account/delete`
#### `POST /api/account/create-portal-session` (Stripe)
#### `POST /api/account/sync-billing` (RevenueCat manual sync)
#### `POST /api/account/tour-complete` — marca `tour_v1_completed_at` en `public.users` (idempotente)

### Autenticación

```
POST /api/auth/register
POST /api/auth/legal-consent
POST /api/auth/2fa/enroll
POST /api/auth/2fa/verify
POST /api/auth/2fa/challenge/verify
POST /api/auth/2fa/disable
POST /api/auth/2fa/email/send
POST /api/auth/2fa/email/verify
```

### Datos

```
GET /api/library/[number]      → traducciones de hexagrama (Bearer + Seeker+)
GET /api/library/access        → check de acceso a biblioteca (Bearer + Seeker+)
```

> ⚠️ `/api/hexagrams` y `/api/hexagram/[number]` eliminadas en feat/library-protection.
> Eran rutas legacy sin consumidores, force-static, públicas — vector de scraping.

### Admin

```
POST /api/admin/login
POST /api/admin/logout
POST /api/admin/config   → requiere Origin/Host check (CSRF protection)
```

> ⚠️ `/api/admin/public-config` fue **eliminada** en `3d773ab` (2026-05-26). Exponía toggles operativos sin auth.

### Feedback

```
POST /api/feedback         → formulario de feedback (rate-limited, guarda en tabla feedback)
```

### Integridad (App Integrity)

```
GET  /api/integrity/challenge   → genera nonce para attestation (Bearer + Upstash TTL 10min)
POST /api/integrity/challenge   → verifica token de attestation Play Protect
```

### Webhooks y utilidades

```
POST /api/webhooks/revenuecat  → pagos RevenueCat (grant_tokens_idempotent — atómico)
GET  /api/health               → health check
POST /api/ritual-debug         → debug (dev only)
```

---

## 5. Mobile App — Expo WebView

**Directorio:** `apps/mobile/`

### Arquitectura general

El APK Android es fundamentalmente un **shell nativo alrededor de un WebView** que carga la URL de producción/staging. Toda la lógica de negocio vive en la web app.

La capa nativa aporta:
- Autenticación Google OAuth sin error 403 (abre browser externo)
- Storage seguro de tokens (expo-secure-store) + UID persistido para cross-user guard
- Cache SQLite para funcionamiento offline (3 tiers — sidebar instantáneo, hilos lazy, sync background)
- Prewarm de caché al inicio (todos los chats pre-cargados antes de que WebView cargue)
- Descarga de imágenes al sistema de archivos local (expo-file-system)
- Modal nativo de zoom para imágenes
- Export de PDF via expo-sharing
- Idioma nativo dropdown (sincronizado con la web — 11 idiomas)
- Barras de estado y SafeAreaView correctas
- App Integrity attestation (Play Protect + App Access Risk — `src/hooks/useIntegrityCheck.ts`)
- Purchase success deep link (`app/purchase-success.tsx` → evento nativo → reload web)
- OAuth callback nativo (`app/auth/callback.tsx`)

### Archivo principal: `app/index.tsx`

**Estado nativo principal:**
```typescript
const webViewRef = useRef<WebView>(null);
const accessTokenRef = useRef<string | null>(null);    // Token JWT actual
const cachedChatsRef = useRef<RnCachedChatEntry[]>([]); // Pre-fetch SQLite
const webReadyRef = useRef(false);                      // WebView cargado
const authTransitionRef = useRef(false);                // Evita race en reload
```

### Configuración de la WebView

```typescript
<WebView
  source={{ uri: BASE_URL }}
  javaScriptEnabled
  domStorageEnabled
  allowsInlineMediaPlayback
  mediaPlaybackRequiresUserAction={false}
  scalesPageToFit={false}        // Zoom gestionado por modal nativo
  onLoadEnd={onLoadEnd}
  onMessage={onMessage}
  onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
/>
```

**Cross-origin guard (`onShouldStartLoadWithRequest`):** Bloquea cualquier URL que no pertenezca a `BASE_URL`. Aplica igual en staging y producción — el APK nunca navega fuera de la app. Google OAuth es la única excepción (se detecta por `accounts.google.com` o `provider=google` y se intercepta para abrir en browser externo).

### URLs resueltas (`resolveWebBaseUrl`)

- Variable de entorno: `EXPO_PUBLIC_API_URL`
- Fallback hard-coded: URL de staging
- El APK de producción (Play Store) apunta a `theoriginaliching.com`

### Startup sequence

```
1. SplashScreen.preventAutoHideAsync()
2. initDb() → esquema SQLite
3. getCachedChatsForInjection() → cachedChatsRef ← pre-fetch paralelo al load del WebView
4. SecureStore.getItemAsync(SECURE_TOKEN_KEY) → rehydrate auth token
5. AsyncStorage.getItem(LOCALE_STORAGE_KEY) → rehydrate locale
6. WebView load (~1-3s)
7. onLoadEnd() → inyectar window.__rnCachedChats + locale + forzar refresh de cuenta
8. syncChats(token) en background → actualizar Tier 1
9. SplashScreen.hideAsync()
```

---

## 6. SQLite Local Cache (3 Tiers)

### Arquitectura de 3 niveles (modelo WhatsApp/Telegram)

| Tier | Qué hace | Cuándo | Cooldown |
|------|----------|--------|----------|
| **1 — Chat list** | Metadata de sesiones (título, fecha, count) | Al recibir `auth_token` | 5 min |
| **2 — Thread paginado** | Últimos 30 mensajes de SQLite al abrir un chat | Inmediato, sin red | — |
| **3 — Sync incremental** | Fetch full de ese chat desde Supabase | Tras servir Tier 2 | 1 min por chat |

### Schema SQLite (`apps/mobile/src/db/schema.ts`)

```sql
-- iching_cache.db
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE chats (
  id                    TEXT    PRIMARY KEY,           -- sessionId de Supabase
  title                 TEXT    NOT NULL DEFAULT '',   -- firstQuestion[:120] o session.title
  created_at            TEXT    NOT NULL,
  updated_at            TEXT    NOT NULL,
  synced_at             TEXT    NOT NULL,              -- último upsert de metadata
  message_count         INTEGER NOT NULL DEFAULT 0,
  first_consultation_at TEXT,
  is_deleted            INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_chats_updated ON chats(updated_at DESC);

CREATE TABLE messages (
  id                TEXT PRIMARY KEY,                  -- consultationId de Supabase
  chat_id           TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK(role IN ('user','assistant')),
  content           TEXT NOT NULL DEFAULT '',          -- JSON de ApiChatConsultation completo
  created_at        TEXT NOT NULL,
  synced_at         TEXT NOT NULL,
  image_url         TEXT,                              -- URL remota de la imagen generada
  local_image_path  TEXT,                              -- Path local descargado (file://)
  image_sync_status TEXT NOT NULL DEFAULT 'none'
                         CHECK(image_sync_status IN ('none','pending','done','error'))
);
CREATE INDEX idx_messages_chat ON messages(chat_id, created_at ASC);
CREATE INDEX idx_messages_img ON messages(image_sync_status) WHERE image_url IS NOT NULL;

CREATE TABLE sync_meta (
  key   TEXT PRIMARY KEY,                              -- e.g. "last_sync", "chat_content_synced:{sessionId}"
  value TEXT NOT NULL
);
```

### Funciones del store (`apps/mobile/src/db/chat-store.ts`)

```typescript
initDb(): Promise<void>                    // Crea tablas si no existen (idempotente)
upsertChats(chats: ChatRow[]): Promise<void>
upsertMessages(rows: MessageRow[]): Promise<void>
  // ON CONFLICT: actualiza content (si nuevo != ''), image_url, image_sync_status
  // Preserva local_image_path (nunca sobreescrito por sync)
softDeleteChat(chatId: string): Promise<void>
clearAllData(): Promise<void>              // Limpia todo (no se usa en signout — datos persisten)

getPagedThread(sessionId, limit=30, offset=0): Promise<MessageRow[]>
  // Más recientes primero (DESC). El caller revierte para display cronológico.
  // OFFSET para paginación al hacer scroll hacia arriba.

getCachedChatsForInjection(): Promise<RnCachedChatEntry[]>
  // Top 50 chats no eliminados con messageCount > 0, ordenados por updated_at DESC
  // Formato: { localId: "db-{id}", sessionId, title, messageCount, updatedAt, ... }

getLocalImagePath(imageUrl: string): Promise<string | null>
  // Busca si una URL remota tiene path local descargado (image_sync_status='done')

getPendingImages(limit=20): Promise<PendingImageRow[]>
  // Imágenes pendientes de descarga, ordenadas por c.updated_at DESC (chats más recientes)

getSyncMeta(key): Promise<string | null>
setSyncMeta(key, value): Promise<void>
setLocalImagePath(messageId, localPath): Promise<void>
markImageError(messageId): Promise<void>
```

### Sync service (`apps/mobile/src/sync/sync-service.ts`)

#### `syncChats(token, baseUrl)` — Tier 1

```typescript
// Cooldown: 5 minutos (sync_meta key: "last_sync")
// Endpoint: GET /api/account/chats?summary=1
// Acción: upsertChats() + void syncPendingImages()
// NO sincroniza contenido de mensajes (solo metadata)
```

#### `syncChatContent(token, baseUrl, sessionId)` — Tier 3

```typescript
// Cooldown: 1 minuto por chat (sync_meta key: "chat_content_synced:{sessionId}")
// Endpoint: GET /api/account/chats?sessionId={uuid}
// Acción: fetch todas las consultas → upsertMessages() con full JSON
//         Cada MessageRow.content = JSON.stringify(ApiChatConsultation completo)
//         image_sync_status = "pending" si imageUrl existe
//         void syncPendingImages() al finalizar
```

### Image sync (`apps/mobile/src/sync/image-sync.ts`)

```typescript
syncPendingImages(batchSize=10): Promise<void>
  // 1. Asegura directorio: ${FileSystem.documentDirectory}iching_images/
  // 2. getPendingImages(batchSize) — ya ordenados por recency
  // 3. Para cada imagen: FileSystem.downloadAsync(imageUrl, localPath)
  // 4. setLocalImagePath() en éxito, markImageError() en fallo
  // Idempotente — si el archivo ya existe localmente, salta el download

computeLocalImagePath(imageUrl): string
  // Hash FNV-1a de la URL + extensión extraída
  // Path: {documentDirectory}iching_images/{hash}.{ext}
```

**Política de imágenes:** Solo se descargan imágenes de los chats más recientes (natural via `getPendingImages` ordenado por `c.updated_at DESC`). Imágenes antiguas se sirven desde la URL remota (en caché del WebView nativo).

### Flujo completo al abrir un chat

```
[Web JS] loadSessionThread(sessionId, localId) llamado
    │
    ├── rnBridge.postMessage({type:"request_thread", sessionId, localId})
    │       │
    │       └── [Native onMessage] case "request_thread":
    │               ├── getPagedThread(sessionId, 30) ← SQLite
    │               ├── dispatchEvent("rn:thread-data", {localId, consultations})
    │               │       └── [Web handler] mapApiConsultationToItem → setSessions
    │               │           setHistoryLoading(false) ← spinner desaparece
    │               └── syncChatContent(token, BASE_URL, sessionId) [background]
    │                       ├── GET /api/account/chats?sessionId=...
    │                       ├── upsertMessages (nuevas consultas)
    │                       ├── si count cambió: dispatchEvent("rn:thread-data") [2ª vez]
    │                       └── si count == 0 y SQLite vacío: dispatchEvent("rn:thread-not-found")
    │
    └── [Web loadSessionThread retorna aquí — NO hace fetch paralelo en modo RN]
        El native bridge es el único dueño de la carga en APK.
        Esto evita la race condition que causaba doble query a Supabase y timeout.
```

---

## 7. WebView Bridge Protocol

Comunicación bidireccional entre la web app y la capa nativa.

### Web → Native (`window.ReactNativeWebView.postMessage`)

| Tipo | Payload | Acción nativa |
|------|---------|---------------|
| `auth_token` | `{token, email?}` | Guarda en SecureStore, syncChats, injectCachedChats |
| `auth_signout` | — | Borra token, navega a /login |
| `locale_changed` | `{locale}` | Guarda en AsyncStorage |
| `open_google_auth` | — | Abre OAuth en browser externo |
| `download_file` | `{filename, dataUrl}` | Guarda en MediaLibrary |
| `download_file_start/chunk/end` | chunked transfer | Reconstruye y guarda archivo grande |
| `delete_chat` | `{url, reqId}` | DELETE vía Bearer token, softDelete SQLite |
| `open_image` | `{url}` | Busca path local → abre modal zoom nativo |
| `request_thread` | `{sessionId, localId}` | Tier 2 + Tier 3 (ver sección 6) |
| `shell_theme` | `{theme: "light"\|"dark"}` | Actualiza tema nativo (StatusBar, etc.) |
| `web_alert/confirm/prompt` | `{message}` | Dialog nativo del sistema |
| `pkce_verifier` | `{verifier}` | PKCE para OAuth |

### Native → Web (`webViewRef.injectJavaScript`)

| Evento / Variable | Cuándo | Datos |
|-------------------|--------|-------|
| `window.__rnCachedChats` + `rn:cached-chats` | onLoadEnd + post-sync | `RnCachedChatEntry[]` |
| `rn:thread-data` | Post request_thread | `{localId, consultations: ApiChatConsultation[]}` |
| `rn:thread-not-found` | Si SQLite + Supabase sync devuelven vacío | `{localId}` — la web limpia el spinner sin mostrar error de "no existe" |
| `window.__rnForceAccountRefresh()` | onLoadEnd + post-auth | Trigger refresco de cuenta |
| `buildSyncLocaleFromWebOrNativeScript()` | onLoadEnd si locale hydrated | Sincroniza idioma |

---

## 8. Base de Datos — Supabase

### Tablas principales (PostgreSQL)

| Tabla | Descripción | RLS |
|-------|-------------|-----|
| `users` | Perfil (email, 2FA, display_name, is_admin, **tour_v1_completed_at**) | ✅ |
| `consultation_sessions` | Hilos de consulta (user_id, title, theme_category, public_sharing_id) | ✅ |
| `consultations` | Consultas individuales (session_id, lines JSONB, interpretation TEXT, image_url) | ✅ |
| `consultation_notes` | Notas adicionales del usuario | ✅ |
| `query_credits` | Saldo de tokens (credits_total, credits_used, total_purchased, last_pack) | ✅ |
| `user_trial_log` | Blindaje de free trial lifetime por user_id | service-role |
| `trial_email_log` | Blindaje de free trial por email hash (migración 046) | deny-all |
| `anonymous_purchase_log` | Purchases antes de autenticarse (migración 047) | deny-all |
| `feedback` | Feedback de usuarios (migración 041) | ✅ |
| `admin_runtime_config` | Configuración runtime (feature flags, limites) | service-role |
| `revenuecat_webhook_events` | Idempotencia de webhooks de pago | service-role |
| `two_factor_attempts`, `two_factor_email_codes`, `two_factor_recovery_codes` | 2FA | ✅ |
| `user_legal_acceptances` | Registro de aceptación de términos (migración 027) | ✅ |
| `pattern_analyses` | Análisis de patrones de consulta | ✅ |
| ~~`revenuecat_customer_aliases`~~ | ~~Mapping RevenueCat ↔ user_id~~ | **ELIMINADA** en migración 040 |

### Índices críticos

```sql
-- Chat history queries (migration 008)
CREATE INDEX idx_consultation_sessions_user_created_at
  ON consultation_sessions(user_id, created_at DESC);

CREATE INDEX idx_consultations_user_session_position
  ON consultations(user_id, session_id, session_position ASC);

CREATE INDEX idx_consultations_session_created_at
  ON consultations(session_id, created_at DESC);

-- Migration 036
CREATE INDEX idx_consultations_session_id ON consultations(session_id);
```

### RPCs (Stored Procedures) clave

```sql
-- migration 032: Consumo atómico de token
-- Retorna credits_total post-descuento. Si ya es 0 antes del descuento, retorna -1.
consume_token(p_user_id UUID, p_amount INT) → INT

-- Otorgar tokens (siempre suma, nunca reemplaza)
grant_tokens(p_user_id UUID, p_tokens INT, p_pack TEXT) → VOID
  -- ON CONFLICT DO UPDATE credits_total = credits_total + p_tokens

-- migration 039: Grant + dedup atómico para webhooks de pago
grant_tokens_idempotent(p_user_id UUID, p_tokens INT, p_pack TEXT, p_event_hash TEXT) → VOID
  -- Ejecuta INSERT en revenuecat_webhook_events + grant_tokens en una transacción

-- Init free user (protegido por user_trial_log + trial_email_log)
init_free_user(p_user_id UUID) → VOID
  -- INSERT INTO query_credits ... ON CONFLICT DO NOTHING
  -- INSERT INTO user_trial_log + trial_email_log ... (previene re-otorgamiento lifetime)
```

### Migraciones (51 total)

```
001_init.sql
002_oracle_bones.sql
003_auth_public_users_sync.sql
004_security_advisor_rls.sql
005_revenuecat_webhook_idempotency.sql
006_disable_public_sharing.sql
007_two_factor_email_codes.sql
008_chat_history_query_indexes.sql
010_auth_public_users_delete_sync.sql
011_two_factor_attempts_cascade.sql
012_auth_delete_public_users_before.sql
013_auth_public_users_resync.sql
016_totp_replay_guard.sql
017_admin_runtime_config.sql
018_revenuecat_customer_aliases.sql
019_revenuecat_internal_tables_rls.sql
021_consumable_tokens.sql           ← modelo consumible, consume_token, grant_tokens
022_user_trial_log.sql              ← blindaje free trial lifetime
023_auth_user_free_bootstrap_sync.sql
024_security_baseline_hardening.sql
025_display_name.sql
026_is_admin.sql
027_user_legal_acceptances.sql
028_auth_email_registered_rpc.sql
029_handle_new_auth_user_email_orphans.sql
030_2fa_reset_recovery_codes_atomic.sql
031_interpretation_summary.sql
032_atomic_token_consumption.sql    ← consume_token devuelve -1 si saldo vacío
033_drop_legacy_consume_token.sql
034_translator_column.sql
035_revoke_public_execute_on_secdef_functions.sql
036_consultations_session_id_index.sql
037_grant_is_admin_to_app_owner.sql
038_raise_statement_timeout.sql     ← authenticated→30s, anon→10s, authenticator→30s
039_atomic_webhook_grant.sql        ← grant_tokens_idempotent (dedup + grant en 1 transacción)
040_drop_revenuecat_customer_aliases.sql ← tabla aliases eliminada
041_feedback.sql                    ← tabla feedback de usuarios
042_feedback_rls_fix.sql
043_grant_tokens_protect_tier.sql
044_grant_tokens_allow_tier_downgrade.sql
045_auto_display_name_google.sql    ← trigger display name desde Google OAuth
046_trial_email_log.sql             ← blindaje free trial por email hash
047_anonymous_purchase_log.sql      ← purchases antes de autenticarse
048_fix_init_free_user_search_path.sql
049_revoke_trigger_fn_execute.sql   ← revoca EXECUTE en funciones trigger-only
050_security_linter_fixes.sql       ← deny-all RLS en tablas internas
051_tour_v1.sql                     ← tour_v1_completed_at en users (onboarding lifetime)
```

---

## 9. Paquetes Compartidos

### `packages/iching-engine`

Algoritmos de sorteo. Sin dependencias externas.

```typescript
performCast(method, manualLines?) → CastResult
  // methods: "three_coins" | "yarrow_stalks" | "manual"
performYarrowCast() → CastResult
applyMutations(lines) → { primary, transformed }
getHexagram(number) → HexagramData
castSixLines(throwFn) → Line[]
throwThreeCoins() → LineValue   // 6|7|8|9
throwYarrowStalks() → LineValue
previewCastFromLineValues(lines) → CastPreview
```

### `packages/context-engine`

Límites de sesión y costo de contexto por tier.

```typescript
type TierKey = "free" | "seeker" | "practitioner" | "master" | "oracle";
type OracleType = "iching" | "oracle_bones";

CONTEXT_LIMITS: Record<TierKey, { sessionDepth: number; historyCount: number }>
// free:         { sessionDepth: 1, historyCount: 0 }
// seeker:       { sessionDepth: 3, historyCount: 0 }
// practitioner: { sessionDepth: 5, historyCount: 0 }
// master:       { sessionDepth: 8, historyCount: 10 }
// oracle:       { sessionDepth: 12, historyCount: 30 }

CONTEXT_COST_PER_PRIOR = 0.00024  // costo por consulta previa en contexto

resolveSessionContext(userId, sessionId, tier) → SessionContext
```

### `packages/oracle-bones-engine`

Sorteo estilo Shang (huesos de tortuga / escápula de buey).

```typescript
performOracleBonesCast(question) → OracleBonesCastResult
rollCrackPattern() → PatternId      // 1-16 patrones documentados
defaultNegativeCharge(medium) → string

// Veredictos (sin Silence — eliminado por falta de base arqueológica):
type OracleBonesVerdict = "auspicious" | "auspicious_with_caution" | "inauspicious" | ...
```

### `packages/image-engine`

Construcción de prompts para imágenes AI.

```typescript
buildImagePrompt(params: {
  hexagram, hexagramName, category, consultationId, tier, oracleType
}) → string
  // Variedad via hash de consultationId (evita encuadres repetitivos)
  // Componentes: paisaje chino, atmósfera, composición rotada, refuerzo anti-sellos

buildTogetherNegativePrompt() → string
  // Solo para Together AI. Anti-texto, anti-sellos, anti-bandas verticales.
  // NO se antepone al prompt positivo (evita repetición de palabras disparadoras)

buildOracleBonesImagePrompt(params) → string
  // Prompt específico para estilo Shang (oracle bones)

describeHexagramLinesForImage(lines) → string

VISUAL_THEMES: Record<string, string[]>   // categorías de paisaje por tema
WATERMARK_CONFIG: { text, position, ... } // overlay de watermark por tier
```

### `packages/i18n`

```typescript
DEFAULT_LOCALE = "en"
SUPPORTED_LOCALES = ["en","es","pt","fr","de","it","ja","zh","ko","ar","hi"]

commonStrings        // Strings compartidos web + mobile
interpolate(template, vars) → string

getMobileNativeUiMessages(locale) → MobileNativeUiMessages
  // Botones, confirmaciones, diálogos del shell nativo
getHomeChromeUiMessages(locale) → HomeChromeUiMessages
getTokenPackMarketingMessages(locale) → TokenPackMarketingMessages
```

### `packages/sharing`

```typescript
consultationPublicPath(publicId) → string    // /r/{id}
sessionPublicPath(publicId) → string         // /s/{id}
sharingUtm(source) → URLSearchParams
```

### `packages/iching-data`

Biblioteca estática de los 64 hexagramas con:
- Número, nombre (inglés/chino), trigrama superior/inferior
- Líneas (texto Wilhelm/Baynes, Legge, Zhou Yi)
- Julgamento, Imagem, texto de cada línea
- Validado con Zod

### `backend/claude`

```typescript
generateInterpretation(params): Promise<ReadableStream>
  // Modelo: claude-sonnet-4-5-20250929 (único modelo para todos los tiers)
  // max_tokens: 4096 (fijo)
  // Prompt caching con cache_control: "ephemeral" en 3 bloques:
  //   1. System prompt estático (~450 tokens)
  //   2. Biblioteca Wilhelm+Legge+Zhou Yi (~2,000 tokens)
  //   3. Contexto de sesión previa (~150-200 tokens por consulta)
  // Fallback chain: Anthropic → OpenRouter → Groq → texto offline

generateOracleBonesInterpretation(params): Promise<ReadableStream>
  // Mismo modelo, prompt específico para estilo Shang
```

### `backend/auth`

```typescript
validateEmailForRegistration(email) → { valid, reason }
  // Bloquea dominios desechables (disposable-email-domains)
createTotpEnrollment(userId) → { secret, qrUrl, backupCodes }
verifyTotpTokenWithReplayGuard(userId, token) → boolean
  // Guarda en DB el último token usado (previene replay)
```

---

## 10. Sistema de Tokens Consumibles

### Packs disponibles

| Pack | Precio | Tokens | Consultas/hilo | Resolución imagen |
|------|--------|--------|----------------|-------------------|
| Free | $0 | 2 lifetime | 1 | 1024×768 |
| Seeker | $6.99 | 25 | 3 | 1024×1024 |
| Practitioner | $11.99 | 50 | 5 | 1184×1184 |
| Master | $19.99 | 100 | 8 | 1504×1504 |

**Reglas críticas:**
- Tokens son **acumulables** — se suman con cada compra nueva
- El límite por hilo depende del `last_pack` activo (no del saldo total)
- Free trial: 2 tokens LIFETIME, nunca se renuevan
- `user_trial_log` previene re-otorgamiento del free trial
- Gate de acceso basado ÚNICAMENTE en `credits_total > 0`

### Flujo de consumo (atómico)

```typescript
// route.ts — consumo ANTES de llamar a servicios externos
const isMasterCombined = resolvedTranslator === "master_combined";
const tokensToConsume = isMasterCombined ? 2 : 1;
const balance = await getTokenBalance(userId);
if (balance < tokensToConsume) return 402;
// luego: consume_token RPC en DB (atómico, sin ventana de race)
```

> **Nota:** Existe una pequeña ventana de race condition entre `getTokenBalance()` (lectura) y `consumeToken()` (escritura). Si el usuario abre dos tabs simultáneos con saldo = 1, ambos podrían pasar la validación. El RPC en DB evita saldo negativo, pero Claude podría ser invocado dos veces. Ver sección 18 para solución propuesta.

### RevenueCat Web Billing + Stripe

- Checkout completo vía RevenueCat (incluye GST/QST automático para Quebec)
- Webhooks en `POST /api/webhooks/revenuecat` con verificación HMAC
- Idempotencia vía `revenuecat_webhook_events` (deduplicación por event_id)
- Al recibir `INITIAL_PURCHASE` o `NON_SUBSCRIPTION_PURCHASE`: llama `grant_tokens()`

---

## 11. Autenticación

### Supabase Auth

- **Email/Password:** Con verificación de email
- **Google OAuth:** Via Supabase Auth (`/auth/v1/authorize?provider=google`)
  - En mobile: interceptado por la WebView y abierto en browser externo (evita error 403 `disallowed_useragent`)
  - Deep link callback: `theoriginaliching://auth/callback`
- **JWT:** Tokens de Supabase, almacenados en SecureStore (mobile) y cookies/localStorage (web)

### 2FA (Two-Factor Authentication)

- **TOTP:** Implementado con `otplib`. QR generado via `qrcode`. Replay guard en DB.
- **Email OTP:** Código de 6 dígitos via Resend. Expiración configurable.
- **Recovery codes:** Generados en enrollment, uso único, almacenados hasheados.

### Idle Timeout

45 minutos de inactividad → cierre automático de sesión. Implementado en el web app con `setInterval` de 30s. Motivo: el contenido de las consultas puede ser íntimo/privado.

### Mobile Auth Flow

```
Cold start:
  SecureStore.getItemAsync(SECURE_TOKEN_KEY)
    → validateStoredToken() [verifica JWT con Supabase]
    → si válido: injectJavaScript para forzar refresh de cuenta
    → si inválido: borra token

Login:
  Web app hace login → emite auth_token via postMessage
    → Native guarda en SecureStore
    → syncChats() en background
    → injectCachedChats()

Signout:
  Web emite auth_signout → Native borra SecureStore
  [SQLite NO se borra — los datos persisten para el próximo login]
```

---

## 12. Generación de Imágenes

### Proveedores (en orden de preferencia)

```typescript
type ImageProvider = "auto" | "mock" | "svg-art" | "pollinations" | "fal" | "gpt-image" | "together";
```

**Together AI (producción):** FLUX.1-schnell, 12 steps, 1 imagen por consulta.

| Tier | Resolución | Costo estimado |
|------|-----------|----------------|
| Free | 1024×768 | ~$0.0021/img |
| Seeker | 1024×1024 | ~$0.0028/img |
| Practitioner | 1184×1184 | ~$0.0039/img |
| Master | 1504×1504 | ~$0.0061/img |

**Restricciones Together API:** Múltiplos de 32, mínimo 256px, máximo 4MP total.

### Mitigation de alucinaciones (glifos/sellos)

FLUX tendía a añadir calligrafía/sellos rojos en imágenes de temática china.

| Elemento | Archivo | Rol |
|----------|---------|-----|
| Prompt positivo | `packages/image-engine/src/prompt.ts → buildImagePrompt()` | Paisaje primero, variantes rotadas por hash de consultationId + hexagrama + categoría |
| Prompt negativo | mismo archivo → `buildTogetherNegativePrompt()` | Anti-texto, anti-sellos, anti-bandas — solo enviado como `negative_prompt`, nunca antepuesto al positivo |
| Límites API | `packages/image-engine/src/together-flux-limits.ts` | Tope de caracteres, compactación antes del request |

### Fallback chain de imágenes

```
Together AI → prebuilt fallback PNG → SVG sumi-e generado localmente
```

- **Prebuilt fallbacks:** `/fallbacks/prebuilt/{kind}/{tier}/{WxH}/{index}.png`, índice 1-10, seed determinístico por consulta
- **SVG fallback:** Generado en runtime con `sharp`, no requiere red

### Watermark

Overlay posterior a la generación (no parte del prompt). Configuración en `WATERMARK_CONFIG` de `image-engine`.

### Cache local en mobile

Una vez sincronizado (Tier 3), la imagen se descarga via `syncPendingImages()` a `documentDirectory/iching_images/{hash}.{ext}`. El zoom modal nativo (`open_image`) usa `getLocalImagePath()` para servir desde local primero.

---

## 13. Claude AI — Interpretación

**Modelo:** `claude-sonnet-4-5-20250929` (único para todos los tiers y métodos)  
**max_tokens:** 4096 (fijo)  
**Streaming:** Sí, via `ReadableStream<Uint8Array>` (SSE)

### Estructura del System Prompt

| Bloque | Tipo | Cache |
|--------|------|-------|
| Identidad + rol ("You are the Sage of the Oracle") | Estático | ✅ ephemeral |
| ABSOLUTE RULES (10 reglas de comportamiento) | Estático | ✅ ephemeral |
| ANTI-REPETITION, TYPOGRAPHY, TEMPORAL RESTRAINT | Estático | ✅ ephemeral |
| Biblioteca Wilhelm+Legge+Zhou Yi + hexagrama transformado | Estático por consulta | ✅ ephemeral |
| Contexto de sesión previa (resúmenes de consultas previas) | Dinámico | ✅ ephemeral* |
| Nombre de usuario + idioma | Dinámico | ❌ |
| Pregunta actual | Dinámico | ❌ |

(*) El bloque de contexto de sesión crece con cada consulta del hilo → cache miss sistemático porque el bloque N es diferente al bloque N-1. Cache hit efectivo: ~15-20% pese a estar marcado como ephemeral.

### Estimación de tokens (Master, 8 consultas previas)

```
System prompt estático:            ~450 tokens  (cached)
Biblioteca Wilhelm+Legge+Zhou Yi:  ~2,000 tokens (cached)
Contexto sesión (8 consultas):     ~1,600 tokens (cached con miss alto)
Pregunta actual:                   ~200 tokens  (sin cache)
──────────────────────────────────────────────────────────
Total input:                       ~4,250 tokens
Output máximo:                      4,096 tokens
```

### Fallback chain de interpretación

```
1. Anthropic API (claude-sonnet-4-5)
2. OpenRouter API (mismo modelo o equivalente)
3. Groq API
4. Texto offline predefinido
```

Los errores de cada step se silencian sin alerta estructurada (ver sección 18).

---

## 14. Servicios Externos

| Servicio | Propósito | Estado |
|----------|-----------|--------|
| **Supabase** | PostgreSQL + Auth | ✅ Staging + Producción (proyectos separados) |
| **Anthropic** | Claude AI interpretaciones | ✅ |
| **Together AI** | FLUX.1-schnell imágenes | ✅ |
| **RevenueCat** | Web Billing (checkout) | ✅ |
| **Stripe** | Procesador de pagos (via RevenueCat) | ✅ |
| **Resend** | Emails transaccionales (dominio: theoriginaliching.com) | ✅ |
| **Cloudflare Turnstile** | CAPTCHA en /login y /register | ✅ |
| **Upstash Redis** | Rate limiting (30 req/60s por IP, 15/60s por usuario) | ✅* |
| **Sentry** | Error tracking (solo mobile) | ⚠️ Web sin Sentry |
| **Vercel** | Deploy web | ✅ Staging + Producción |
| **EAS Build** | Build APK Android | ✅ cuenta alexcat84 |
| **Google Play Console** | Distribución Android | ✅ verificación en curso |
| **Google OAuth** | Login social | ✅ Staging + Producción |
| **OpenRouter / Groq** | Fallback IA | ✅ configurados |

(*) Rate limiting con fallback in-memory en local. **Crítico:** el fallback in-memory no funciona en serverless Vercel — Upstash debe estar configurado en producción.

### Variables de entorno requeridas

**Web (Vercel):**
```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY  (public)
SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
TOGETHER_API_KEY
REVENUECAT_WEBHOOK_SECRET
RESEND_API_KEY
UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_TURNSTILE_SITE_KEY  (public)
TURNSTILE_SECRET_KEY
OPENROUTER_API_KEY / GROQ_API_KEY
LOG_TOKEN_BALANCE_DEBUG=true (staging)
```

**Mobile (`apps/mobile/.env`):**
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_API_URL  (URL de staging o producción)
EXPO_PUBLIC_REVENUECAT_API_KEY
EXPO_PUBLIC_SENTRY_DSN
```

---

## 15. Deploy y CI/CD

### Ramas

| Branch | Entorno | Supabase | Vercel |
|--------|---------|----------|--------|
| `main` | Producción | Proyecto original | `theoriginaliching.com` |
| `staging` | Preview | Proyecto nuevo | URL de preview |

**Regla de workflow:** Todo commit va a `staging` primero. `main` solo via merge desde `staging`, nunca directo.

### CI (GitHub Actions)

Archivo: `.github/workflows/ci.yml`

```yaml
# Pasos: checkout → setup-node → pnpm install → lint → typecheck → build
uses: actions/checkout@v4
uses: actions/setup-node@v4
```

> **⚠️ DEADLINE:** GitHub forzará Node.js 24 el **2 junio 2026**. Actualizar a `@v5` cuando estén disponibles.

### Build APK local (Windows)

```bash
# 1. cd apps/mobile && npm install
# 2. Re-aplicar fix de Windows en node_modules (ver sección 2)
# 3. npx expo prebuild --platform android --clean
# 4. cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Build APK cloud (EAS)

```bash
cd apps/mobile
eas build --platform android --profile preview   # APK
eas build --platform android --profile production # AAB (Play Store)
```

EAS Build corre en Linux — no requiere el fix de Windows del glob.

### Vercel timeout

```typescript
export const runtime = "nodejs";
export const maxDuration = 120; // requiere plan Pro
// Tiempo real de una consulta Master: 37-66s
// Plan Hobby: límite 60s → riesgo de timeout en P75
```

---

## 16. Seguridad

### API Keys

- Todas las keys privadas están en variables de entorno del servidor
- Ninguna key privada en código fuente ni en `.env` commiteados
- `EXPO_PUBLIC_*` y `TURNSTILE_SITE_KEY` son públicos por diseño

### Row Level Security (Supabase)

RLS activo en todas las tablas de usuario:
```sql
-- policy en consultations, consultation_sessions, query_credits, etc.
auth.uid() = user_id
```

Tablas admin sin RLS pero protegidas por `service_role` (el anon key no puede acceder).

### WebView Cross-Origin Guard

```typescript
onShouldStartLoadWithRequest: (request) => {
  // Bloquea cualquier URL fuera de BASE_URL
  // Excepción: accounts.google.com / provider=google → abre en browser externo
  // Funciona igual en staging y producción
}
```

### Rate Limiting

- Por IP: 30 req/60s en `/api/consult`
- Por usuario: 15 req/60s en `/api/consult`
- Implementado con Upstash Redis. Fallback in-memory no efectivo en serverless.

### Protección Free Trial

```sql
-- user_trial_log + ON CONFLICT DO NOTHING en init_free_user()
-- Previene que un usuario reciba los 2 tokens gratis más de una vez
```

### Autenticación de Webhooks

RevenueCat webhooks verificados con HMAC-SHA256 via `REVENUECAT_WEBHOOK_SECRET`.

### Turnstile (CAPTCHA)

Activo en `/login` y `/register`. Falla cerrada: si la key no está configurada, rechaza el request.

### Play Store Compliance

- Sin cookies compartidas entre sesiones (cumple política de Google)
- `privacyPolicyUrl` configurado en `app.config.js`
- Data Safety Form pendiente

---

## 17. Observabilidad

### Logging disponible

| Log | Variable | Contiene |
|-----|----------|---------|
| Stream ritual | `LOG_RITUAL_STREAM_DEBUG=1` | `+{elapsedMs}ms` por evento |
| Cache de Claude | `LOG_CLAUDE_CACHE_METRICS=1` | tokens input/output/cache_read/cache_creation, ratio |
| Token balance | `LOG_TOKEN_BALANCE_DEBUG=true` | Solo en staging |

### Sentry

- **Mobile:** `@sentry/react-native` con error boundary global en `_layout.tsx` ✅
- **Web:** `@sentry/nextjs` declarado en dependencias pero **sin configuración activa** ❌

### Alertas

Sin alertas automáticas configuradas. Toda la observabilidad requiere revisión manual de Vercel Logs / Supabase Dashboard.

---

## 18. Deuda Técnica y Hallazgos Abiertos

### 🔴 Críticos

**1. Race condition en consumo de tokens**  
Entre `getTokenBalance()` y `consumeToken()`, dos requests paralelos del mismo usuario pueden pasar la validación con el mismo saldo. El RPC evita saldo negativo pero Claude es invocado dos veces.  
**Fix:** Mover `consumeToken()` antes de `getTokenBalance()` — el RPC ya retorna el saldo post-descuento (-1 si vacío). Eliminar la lectura previa.

**2. Rate limiting inoperativo sin Upstash**  
El fallback `Map` en memoria no persiste entre invocaciones serverless. Sin `UPSTASH_REDIS_REST_URL` configurado, no hay protección contra abuse.  
**Fix:** Validar en startup de `route.ts` que Upstash está operativo.

### 🟡 Importantes

**3. Sin Sentry en Web**  
Errores de Anthropic (429, 500), errores de Together AI, y excepciones en rutas de API son invisibles en producción.  
**Fix:** Activar `@sentry/nextjs` en `instrumentation.ts`.

**4. Fallback chain de Claude silencia errores**  
Los errores de Anthropic se absorben sin logging estructurado ni alerta. Una degradación de la API pasaría desapercibida hasta que usuarios reporten.

**5. Cache hit rate de Claude ~15-20%**  
El bloque de contexto de sesión crece con cada consulta del hilo → cache miss sistemático en el bloque más pesado. El potencial de ahorro con 60% hit rate es ~$200-400/mes en volumen alto.

**6. Timeout Vercel si el plan es Hobby**  
`maxDuration = 120` requiere plan Pro. En Hobby (límite 60s), el P75 de consultas Master falla con timeout.

### 🟢 Pendiente de producto

**7. GitHub Actions CI — deadline 2 junio 2026**  
`actions/checkout@v4` y `actions/setup-node@v4` deben actualizarse a `@v5` cuando estén disponibles.

**8. Google Play Console**  
Verificación de identidad pendiente (1-3 días hábiles). Data Safety Form pendiente. Assets para Play Store (icon 512×512, feature graphic 1024×500) pendientes.

**9. i18n formal (Fase 2)**  
El sistema actual es un objeto de strings planos en `page.tsx`. Migración a `next-intl` es post-lanzamiento.

**10. Animación ritual de Huesos de Oráculo (Fase 2)**  
Three.js + animación de fuego pendiente de integración completa.

**11. Supabase Pro** ✅ Activo  
Ambos proyectos (staging y producción) están en Supabase Pro ($25/mes). El proyecto original saturó el egress Free (2GB/mes) durante las pruebas de carga — resuelto con Pro.

---

*Documento generado con análisis estático del codebase + historial de sesiones de desarrollo.*  
*Branch: `main` @ `58b56c4` — 2026-05-20*
