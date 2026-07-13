# Correcciones y luz verde — Migración React 18.2 → 19.2 (web)

**Código:** `20260713-PLAN-WEB-01b react-19-migration-corrections` · **Familia:** WEB · **Estado:** open

- **Fecha:** 2026-07-13
- **Rama objetivo:** `chore/react-19` → `staging` → `main`
- **Plan base (se ejecuta tal cual, con las correcciones de aquí):** [`20260713-PLAN-WEB-01-react-19-migration.md`](./20260713-PLAN-WEB-01-react-19-migration.md)
- **Evaluación previa:** [`20260713-AUD-WEB-01-react-19-upgrade-assessment.md`](./20260713-AUD-WEB-01-react-19-upgrade-assessment.md)
- **Naturaleza:** addendum de revisión externa. Aprueba el plan y solo corrige la Fase 1.2, añade dos gates y acota el alcance. No sustituye al plan base.

---

## 0. Veredicto

**LUZ VERDE.** El análisis del assessment y del plan es sólido: cero APIs eliminadas en uso, todas las libs compatibles, `apps/mobile` ya en React 19.0.0, y el aislamiento "dos Reacts" del APK es correcto. Target `react@19.2.7` + `react-dom@19.2.7` confirmado como última estable en npm.

Se ejecuta el plan base con **una corrección obligatoria** (Fase 1.2), **dos gates añadidos** (Fase 1 y Fase 4) y **un acotamiento de alcance** (three.js). El resto queda aprobado sin cambios.

---

## 1. CORRECCIÓN OBLIGATORIA — Fase 1.2 (overrides raíz)

**No añadir un override global de `react`.**

Este monorepo es npm (`"packageManager": "npm@10.9.2"`, `workspaces`, `package-lock.json`; `pnpm-workspace.yaml` es secundario). En npm, los `overrides` de la raíz son **globales a todo el árbol** e ignoran las fronteras de workspace. Un `"react": "19.2.7"` global forzaría también el `react` de `apps/mobile`, sacándolo del `19.0.0` que valida Expo SDK 53 / RN 0.79.6 (el reconciler nativo va emparejado a esa versión de React). Eso rompe la invariante "no tocar mobile" que el propio plan promete, y contradice su verificación de Fase 1.4 (`npm ls react → 19.0.0 en mobile`), imposible de cumplir con override global.

Funciona hoy solo porque el único override React es `react-dom: 18.2.0`, y mobile no tiene `react-dom` (React Native no lo usa).

**Cambio correcto en `package.json` raíz → `overrides`:**

```diff
   "overrides": {
-    "react-dom": "18.2.0",
+    "react-dom": "19.2.7",
```

- **No** se añade `"react"` a los overrides.
- El `react` del árbol web ya queda resuelto por la declaración directa de `apps/web/package.json` (Fase 1.1). No necesita override.
- El override de `react-dom` a `19.2.7` sí se mantiene: es inocuo para mobile (no lo usa) y clava cualquier `react-dom` transitivo del árbol web en una sola versión, evitando el "two react-doms".

> Si tras el install algún dep transitivo del árbol **web** resolviera un `react@18.x`, añadir un override **scoped** bajo ese paquete concreto, nunca global. Ver Fase 1 gate abajo.

El resto de la Fase 1 (1.1, 1.3, 1.4 install y recompilado de `packages/ui/dist`) queda igual.

---

## 2. GATE NUEVO — Fase 1 (fail-closed sobre mobile)

Tras `npm install`, correr `npm ls react react-dom` y verificar de forma estricta:

- Árbol web resuelve `react@19.2.7` y `react-dom@19.2.7`.
- `apps/mobile` sigue en `react@19.0.0`.

**Si mobile se movió de 19.0.0, PARAR y reportar. No continuar a Fase 2.** Este gate protege el APK de una regresión silenciosa que, de colarse, aparecería recién en el `assembleRelease` de la Fase 4 (o peor, en EAS cloud) y se atribuiría por error a la hidratación.

---

## 3. ACOTAMIENTO DE ALCANCE — three.js fuera de este PR

El assessment marca `@react-three/fiber` v8 y `@react-three/drei` v9 como dep muerta. Correcto: cero imports de `@react-three/*`. **Pero `three` puro sí está en uso en producción**: `apps/web/src/components/BoneRitualAnimation.tsx` (`import * as THREE from "three"`), consumido por `chat/page.tsx` y `ritual-preview/page.tsx`.

- **En este PR: no tocar `three` ni `@react-three/*`.** Su limpieza va en un PR aparte.
- Cuando se limpie: quitar `@react-three/fiber` y `@react-three/drei`, **conservar `three`**.
- Nota: `three` puro es agnóstico a React, así que no añade riesgo al upgrade (refuerza el riesgo cero de esa fila).

---

## 4. GATE AMPLIADO — Fase 4 (APK, hidratación en frío)

Al checklist actual de la Fase 4 se añade una prueba de **arranque en frío / cache miss**:

- [ ] Instalar el APK con la app cerrada y caché limpia, apuntando el WebView a staging (web ya en React 19), y confirmar que **no hay flash ni pérdida de la clase `iching-rn-webview` bajo hidratación lenta**.

Motivo: React 19 hace *client re-render* del subárbol en mismatch de hidratación en vez de tirar error. Dado el historial de timeouts del WebView (cache miss → silencio prolongado), el escenario de riesgo real es la hidratación lenta, no la caliente. La prueba con caché caliente no basta para cerrar este gate.

---

## 5. LOCKFILE Y CI

- Commitear el `package-lock.json` actualizado en el mismo PR que los bumps.
- Confirmar que Vercel (web) y EAS (APK) resuelven contra el lockfile (`npm ci`), no contra un install fresco. Esto sella la garantía de que el árbol resuelto en la nube coincide con el local, incluida la permanencia de mobile en 19.0.0.

---

## 6. Qué queda sin cambios (aprobado)

- Fase 1.1 y 1.3 (bumps de `apps/web` y `packages/ui`, peer `^18.2.0 || ^19.0.0`).
- Fase 2 completa (codemod `types-react-codemod preset-19` + `tsc --noEmit`).
- Fase 3 completa (build Next 15.5 + smoke browser).
- Fase 5 (View Transitions, commit aparte, opcional).
- Fase 6 (merge staging → main con validación del usuario).
- Estrategia de rollback (con la corrección de la Fase 1.2, el revert sigue dejando el árbol web consistente).

> Nota menor sin acción: `react-joyride@3.1.0` no está "al límite". Su peer `"16.8 - 19"` es un rango con guion cuyo tope parcial `19` expande a `<20.0.0`, así que `19.2.7` lo satisface holgadamente.

---

## 7. Cambios respecto al plan base — resumen accionable

| Fase | Plan base decía | Corrección de este addendum |
|------|-----------------|------------------------------|
| 1.2 | override raíz: `react` **y** `react-dom` a 19.2.7 | **solo** `react-dom` a 19.2.7; **NO** override de `react` |
| 1 (gate) | verificar `npm ls` | gate fail-closed: si mobile ≠ 19.0.0 → PARAR |
| 3/scope | `three` no mencionado | `three` puro EN USO (BoneRitualAnimation) — no tocar en este PR |
| 4 (gate) | checklist APK caliente | añadir prueba de **arranque en frío / cache miss** |
| CI | — | commitear `package-lock.json`; nube usa `npm ci` |
