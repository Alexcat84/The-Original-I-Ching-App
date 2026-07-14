# Resolución del monorepo — ground truth + blindaje (split react 18/19)

**Código:** `20260713-AUD-WEB-02 monorepo-resolution-blocker` · **Familia:** WEB · **Estado:** reference

> **⚠️ CORRECCIÓN (2026-07-14, verificación de ground truth).** La versión original de este doc afirmaba que `main` tiene un **ERESOLVE preexistente** que impide `npm install` desde cero. **Eso era incorrecto.** Verificado en clon fresco de `main`: con **`npm@10.9.2`** (el `packageManager` declarado, que generó el lockfile) `rm package-lock.json && npm install --package-lock-only` **sin flags** da **exit 0 — resuelve limpio**. El ERESOLVE que vi antes fue un **artefacto de `npm@11.5.1`** (mi npm de sistema; también el que CI instala), más estricto con peers. Este doc queda reescrito alrededor de las **dos fragilidades reales** (override load-bearing + no-determinismo de hoisting), no de un bloqueo inexistente.

- **Fecha:** 2026-07-13 · **corregido:** 2026-07-14
- **Alcance:** diagnóstico de resolución de `apps/web` + `apps/mobile` en el monorepo npm. **`apps/mobile` no se toca (19.0.0). El lockfile no se edita a mano.**
- **Relacionado:** [`20260713-AUD-WEB-01`](./20260713-AUD-WEB-01-react-19-upgrade-assessment.md), [`20260713-PLAN-WEB-01`](./20260713-PLAN-WEB-01-react-19-migration.md), [`20260713-PLAN-WEB-01b`](./20260713-PLAN-WEB-01b-react-19-migration-corrections.md)

---

## 0. Veredicto

**`main` resuelve limpio con el npm declarado (`10.9.2`).** No hay bloqueo duro. Pero el split react 18 (web) / 19 (mobile) deja **dos fragilidades reales** que ahora quedan **blindadas** (doc + guard de CI), y por las que el hedge a React 18.3.1 **sigue pausado** (payoff marginal — ver §4):

1. **Override `expo-app-integrity` load-bearing** (§2.a).
2. **No-determinismo de hoisting de react** (§2.b).

---

## 1. Ground truth (Fase 0 — clon fresco de `main`, `--package-lock-only`, sin flags)

| npm | Resultado | Detalle |
|-----|-----------|---------|
| **`10.9.2`** (packageManager declarado) | **exit 0 — limpio** | pero el regen **hoistea `react@19.0.0`** al root (≠ committeado `18.2.0`); `apps/web` **nestea `18.2.0`**, `apps/mobile` `19.0.0` |
| **`11.5.1`** (mi sistema + lo que CI instala con `npm install -g npm@11.5.1`) | **ERESOLVE (exit 1)** | conflicto de **expo**: `peer expo@"*" from expo-device@7.1.4` bajo `expo-app-integrity@0.3.0` — **no** es react |

**Lockfile committeado:** `node_modules/react` = **18.2.0** hoisteado (web + `next` en 18.2.0; mobile anidado 19.0.0). **Es el único estado sano** y se instala con `npm ci` con cualquiera de los dos npm (npm ci no re-resuelve peers, por eso CI —npm 11— está verde).

---

## 2. Las dos fragilidades reales

### 2.a — El override `expo-app-integrity` es LOAD-BEARING

`expo-app-integrity@0.3.0` declara **peers de Expo SDK-49 obsoletos** (`expo-device ~5.2.1`, `expo-secure-store ~12.1.1`, `expo-build-properties ~0.5.1`) que chocan con las versiones **SDK-53** del proyecto. El bloque en `overrides` del `package.json` raíz los **remapea** a las versiones SDK-53:

```json
"expo-app-integrity": {
  "expo-build-properties": "~0.14.8",
  "expo-secure-store": "~14.2.4",
  "expo-device": "~7.1.4"
}
```

- **NO removerlo** mientras se siga usando `expo-app-integrity`. Sin él, la resolución se rompe (y `npm@11` ya ERESOLVE incluso con él, por el peer `expo@"*"` en cadena).
- Son peers de paquetes **`expo-*`**, **ortogonales a react**: el override **se queda** incluso después de unificar react en Next 16.
- (Nota: `package.json` es JSON y no admite comentarios inline; este doc es el registro. El guard de §6 vigila la salud de la resolución.)

### 2.b — No-determinismo de hoisting (split react 18/19)

Con `install-strategy=hoisted` (`.npmrc`) npm aplana a **una sola versión de react** en el root. `apps/web` pide `18.x` exacto y `apps/mobile` `19.0.0` exacto — ninguna satisface a la otra, así que **cuál queda hoisteada depende de la resolución**:

- **Lockfile committeado:** `18.2.0` hoisteado → `next` (root) y el web comparten `18.2.0`. **Sano.**
- **Regen fresco (incluso npm 10.9.2):** hoistea **`19.0.0`** → `next` (root) quedaría en 19 mientras el web nestea `18.2.0` → **two Reacts / mismatch next↔app → build roto.**

**Implicación operativa:** **no regenerar ni commitear un lockfile nuevo** mientras exista el split. El committeado (`18.2.0` hoisteado) es el estado correcto y debe preservarse tal cual. `--legacy-peer-deps` **empeora** las cosas (ignora los peer `^18`, hoistea 19.0.0) y **no debe usarse** en ningún flujo.

---

## 3. Lo verificado del bump 18.3.1 (sigue vigente)

Cuando el web resolvió `18.3.1` aislado: **`tsc --noEmit` verde en `apps/web` y `packages/ui`**, `dist` recompiló, tipos sin cambios. El scan estático de [`AUD-WEB-01`](./20260713-AUD-WEB-01-react-19-upgrade-assessment.md) queda **confirmado**. **El problema del bump nunca fue de tipos ni de compatibilidad — fue de resolución/hoisting (§2.b).**

---

## 4. Estado del bump 18.3.1: PAUSADO

- El bump en sí resuelve y tipa limpio, pero **regenerar el lockfile para aplicarlo dispara la no-determinismo (§2.b)** y el payoff es marginal (scan estático limpio + `tsc` verde → catálogo de warnings de React 19 casi seguro vacío).
- Se deja **pausado**. Rama `chore/react-18-3-1` no mergeada. `main` intacto (18.2.0 hoisteado).

---

## 5. Implicación para Next 16 (corregida)

- **Prereq real de Next 16:** **unificar react a 19** — que **Next 16 hace de por sí** (trae su propio React 19/canary). Al desaparecer el split 18/19, **desaparece la no-determinismo de hoisting** (§2.b): habrá una sola versión de react posible.
- **El override de expo (§2.a) es ortogonal a react y se queda:** sus peers son de paquetes `expo-*`, no de react; hay que mantenerlo mientras se use `expo-app-integrity`.
- **Cuidado con el npm de la re-resolución de Next 16:** con `npm@11` la re-resolución completa ERESOLVE por el peer de expo. Hacerla con el `packageManager` declarado (`npm@10.9.2`) o resolver el peer `expo@"*"` de `expo-app-integrity` antes (actualizar/reemplazar la lib) — el guard de §6 lo señalará.

---

## 6. Blindaje aplicado

1. **Este doc** documenta el override load-bearing (§2.a) y la no-determinismo (§2.b).
2. **Guard de CI** (`.github/workflows/ci.yml` → job `resolution-guard`, **no bloqueante** al inicio): con `npm@10.9.2` regenera el lockfile desde cero (sin flags) y falla si (a) hay ERESOLVE o (b) el web no resuelve `18.x` o mobile no `19.0.0`; además **reporta** la versión hoisteada al root (señala la no-determinismo de §2.b). Convierte cualquier futura ruptura de resolución en señal temprana.
3. **Ningún flujo depende de `--legacy-peer-deps`** (verificado: no aparece en workflows, scripts ni docs de setup).
