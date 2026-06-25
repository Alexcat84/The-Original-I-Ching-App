# Auditoría: Race condition en `__rnNavigateTo` × Next.js App Router

**Código:** `20260619-AUD-MOB-NAV-01 router-navigate-race` · **Familia:** MOB-NAV · **Estado:** closed

**Fecha de detección:** 2026-06-19  
**Sentry Issue:** 7562273839  
**Release afectado:** `6210f52` (4.1.5/vc54)  
**Severidad:** P2 — no bloquea al usuario pero genera errores Sentry + full reloads  
**Estado:** ✅ Fix aplicado — `apps/web/src/components/RouterReadySignal.tsx` (nuevo) + `apps/mobile/app/index.tsx` línea 935 (guard `__nextRouterReady`)

---

## Resumen

La función `window.__rnNavigateTo` inyectada en el WebView usa `window.next.router.push()`, que es la API interna del **Pages Router** de Next.js. Sin embargo, esta app usa **App Router** (Next.js 15.5.19 con `next/navigation`). En App Router, `window.next.router` existe como objeto legacy pero **requiere que el LayoutRouter haya completado su inicialización (hydration)**. Si se invoca antes, lanza:

```
Error: Internal Next.js error: Router action dispatched before initialization.
```

---

## Código afectado

### Bridge: `__rnNavigateTo` (INJECTED_JS)

**Archivo:** `apps/mobile/app/index.tsx`, líneas 935–946

```javascript
window.__rnNavigateTo = function (path) {
  try {
    if (window.next && window.next.router) {
      window.next.router.push(path);        // ← problema: API de Pages Router
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  } catch (e) {
    window.location.href = path;             // ← fallback funciona
  }
};
```

### Invocación desde el lado nativo

**Archivo:** `apps/mobile/app/index.tsx`, líneas 3108–3121

```typescript
if (webReadyRef.current && url.startsWith(BASE_URL)) {
  const path = url.slice(BASE_URL.length) || "/";
  // ... auth callback / public doc checks ...
  webViewRef.current?.injectJavaScript(
    `window.__rnNavigateTo && window.__rnNavigateTo(${JSON.stringify(path)}); true;`
  );
  return false; // cancel WebView navigation
}
```

### Señal de readiness

**Archivo:** `apps/mobile/app/index.tsx`, línea 2148

```typescript
const onLoadEnd = useCallback(() => {
  webReadyRef.current = true;  // ← señala "listo" cuando HTML carga, NO cuando React hydrata
  // ...
});
```

---

## Cadena causal

```
1. WebView carga página HTML → onLoadEnd dispara → webReadyRef = true
2. Next.js App Router comienza hydration (React reconciliation)
3. ┌─ Ventana de race ─┐
   │                    │
   │  webReadyRef = true pero Router no inicializado
   │                    │
4. └─ Navegación interceptada → __rnNavigateTo(path) inyectado
5. window.next.router.push(path) → ❌ "Router action dispatched before initialization"
6. catch(e) → window.location.href = path → ✅ funciona, pero error ya reportado
```

**Factores agravantes:**
- Chrome WebView 90 (Android 11, OnePlus8Pro): hydration más lenta
- Edge-to-edge (vc54): safe area injection en `onLoadEnd` puede añadir ms
- `onLoadEnd` ≠ hydration completa de React

---

## Impacto observado

| Métrica | Valor |
|---------|-------|
| Frecuencia | ~3 ocurrencias en la sesión observada |
| Bloqueo de usuario | No — fallback `window.location.href` funciona |
| Degradación UX | Sí — full reload en vez de navegación SPA |
| Ruido Sentry | Sí — error `unhandled` genera alertas |
| Dispositivos afectados | WebView ≤90 / Android 11 y hardware lento |

---

## Fix propuesto: Señal `__nextRouterReady` desde la web

### Paso 1: Web — componente root client

```tsx
// apps/web/src/app/layout.tsx (o componente root)
'use client';
import { useEffect } from 'react';

export function RouterReadySignal() {
  useEffect(() => {
    (window as any).__nextRouterReady = true;
  }, []);
  return null;
}
```

### Paso 2: INJECTED_JS — verificar flag

```javascript
window.__rnNavigateTo = function (path) {
  try {
    if (window.__nextRouterReady && window.next && window.next.router) {
      window.next.router.push(path);
    } else {
      // App Router no listo — usar history API (funciona para la mayoría de rutas)
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  } catch (e) {
    // Última red de seguridad
    window.location.href = path;
  }
};
```

### Consideraciones

1. `history.pushState` + `popstate` **ya se probó antes** y no funciona para ciertas rutas como `/guia#faqs` (documentado en comentario línea 133–137). Pero esas rutas ya se filtran con `isPublicDocInternalPath()` y pasan por hard nav.

2. El flag `__nextRouterReady` se establece después de la hydration de React (dentro de `useEffect`), por lo que garantiza que el router esté inicializado.

3. El fallback `window.location.href` sigue como última red de seguridad — sin regresiones.

---

## Relación con auditoría AXIOM_LOGIN_SPIKE_AUDIT_2026-06-19

El error Sentry fue detectado durante la investigación del spike de 96 requests a `/login`. El spike fue causado por Google WRS (crawlers) y no por usuarios reales. Sin embargo, el bug de race condition es real e independiente del spike — puede afectar a cualquier usuario con un WebView lento.

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `apps/mobile/app/index.tsx` L935–946 | Verificar `__nextRouterReady` antes de `router.push` |
| `apps/web/src/app/layout.tsx` (o root client) | Añadir `RouterReadySignal` component |
