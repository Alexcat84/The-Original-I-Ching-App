# Bloqueo de resolución del monorepo — pausa del bump React 18.3.1

**Código:** `20260713-AUD-WEB-02 monorepo-resolution-blocker` · **Familia:** WEB · **Estado:** reference

> **Hallazgo, no un bump.** Este doc **no** documenta una migración: documenta por qué el bump acordado a React 18.3.1 (el "hedge" de [`20260713-AUD-WEB-01`](./20260713-AUD-WEB-01-react-19-upgrade-assessment.md) / [`PLAN-WEB-01`](./20260713-PLAN-WEB-01-react-19-migration.md)) **quedó pausado por costo desproporcionado**, y sobre todo la **restricción estructural del monorepo** que hay que resolver **antes** de la futura migración a Next 16.

- **Fecha:** 2026-07-13
- **Rama:** `chore/react-18-3-1` (creada, ejecutada como dry-run, **abandonada sin merge**). `main` intacto y verde.
- **Alcance intentado:** `apps/web` + `packages/ui` + `overrides` raíz. **`apps/mobile` nunca se tocó (19.0.0).**
- **Relacionado:** [`20260713-AUD-WEB-01`](./20260713-AUD-WEB-01-react-19-upgrade-assessment.md), [`20260713-PLAN-WEB-01`](./20260713-PLAN-WEB-01-react-19-migration.md), [`20260713-PLAN-WEB-01b`](./20260713-PLAN-WEB-01b-react-19-migration-corrections.md)

---

## 0. Veredicto

**El bump a `react@18.3.1` se pausa.** No por tipos ni por incompatibilidad de librerías (todo eso salió limpio), sino porque **no existe forma de regenerar un lockfile limpio con `18.3.1` hoisteado para el web** usando solo los mecanismos permitidos (dep directa de `apps/web` + override de `react-dom`, sin override global de `react`), debido a una **restricción estructural preexistente del monorepo**. El payoff, además, es marginal (ver §4). El catálogo de warnings de React 19 se obtendrá durante la **migración real a Next 16**.

---

## 1. La restricción estructural (el hallazgo de valor)

Cuatro factores del repo confluyen y se bloquean entre sí:

1. **`.npmrc` → `install-strategy=hoisted`.** npm aplana a **una sola versión de `react`** en `node_modules/` raíz (de ahí resuelven `next` y las deps del web).
2. **Split de versiones react.** `apps/web` pide `react` exacto (hoy `18.2.0`); `apps/mobile` pide `19.0.0` exacto (Expo SDK 53 / RN 0.79.6). **Ninguna satisface a la otra.**
3. **Deps del web con peer `^18`** (`next`, `@sentry/*`, `@vercel/*`, etc.). En resolución estricta fuerzan la línea 18.x para el árbol web.
4. **Conflicto peer PREEXISTENTE de expo/mobile:** `expo-app-integrity@0.3.0` declara peer `expo-device@~5.2.1`, pero el proyecto usa `~7.1.4` (hay un `overrides.expo-app-integrity` que lo remapea). Aun así, **`npm install` desde cero falla con `ERESOLVE`** en el subárbol de expo — **también en `main`**, no solo en la rama del bump.

**Consecuencia:** el lockfile del repo **solo puede mantenerse con `npm ci`** (instala del lockfile sin re-resolver peers) **o con `npm install --legacy-peer-deps`**. Un `npm install` limpio desde cero **no** es posible hoy.

---

## 2. Por qué el bump 18.3.1 no sale limpio (matriz de intentos)

| Intento | Resultado |
|---|---|
| `npm install` incremental (lockfile de main de base) | Mantiene el **root stale en `18.2.0`**; el override `react-dom@18.3.1` **no se aplica** (el lockfile lo pinnea). El web correría en 18.2.0 → **no enciende los warnings de 18.3** (el objetivo del hedge). |
| Borrar `react`/`react-dom` físicos + `npm install` (mantener lockfile) | Deja el `react` del web **anidado en 18.3.1** y el **root sin react** → **`next` (hoisteado al root) no encuentra react** → `next build` rompe con `Cannot find module 'react'`. |
| `npm install` **desde cero** (para aplicar el override) | **`ERESOLVE` de expo** (factor 4). |
| `npm install --legacy-peer-deps` desde cero | Ignora los peer `^18`; con `hoisted` **hoistea `19.0.0`** al root (16 deps del web quedan en 19.0.0 + `react-dom@18.3.1`) → mezcla incoherente, peor. |

`react-dom@18.3.1` tiene peer `react: "^18.3.1"`: **tenerlo hoisteado forzaría** `react@18.3.1`. Ese es el mecanismo que el override pretende usar, pero requiere re-resolución del lockfile — que es justo lo que rompe con el ERESOLVE de expo.

> En `main` funciona porque su lockfile **ya tiene** `18.2.0` hoisteado + `19.0.0` anidado, y `npm ci` lo instala tal cual sin re-resolver.

---

## 3. Lo que SÍ quedó verificado (el bump no era el problema)

Cuando el web resolvió `18.3.1` de forma aislada (antes de que `next` rompiera por el root vacío):

- **`tsc --noEmit` VERDE en `apps/web` y en `packages/ui`.** `packages/ui/dist` recompiló sin errores.
- **Tipos sin cambios:** la línea 18.2 → 18.3.1 no altera `@types/react`. El scan estático de [`AUD-WEB-01`](./20260713-AUD-WEB-01-react-19-upgrade-assessment.md) queda **confirmado**: cero APIs eliminadas, cero fricción de tipos.

**El problema nunca fue de tipos ni de compatibilidad — fue puramente de resolución/hoisting del árbol npm.**

---

## 4. Por qué el payoff es marginal

El objetivo del hedge era (1) llegar al fin de la línea React 18 y (2) **encender los warnings de deprecación de React 19** (que React 18.3 añade) para catalogar la superficie de migración. Pero:

- El **scan estático de `AUD-WEB-01` ya salió limpio** (cero APIs eliminadas en uso, cero `useRef()` sin arg, cero `JSX.Element`/`React.FC`/`forwardRef`, cero legacy context).
- `tsc` en 18.3.1 salió **verde**.
- → El catálogo de warnings en runtime sería **casi seguro vacío**. El valor incremental de forzar el install no compensa el costo (5–7 ediciones coordinadas de lockfile por el requisito de sync de `npm ci`, o desviarse a un override de react).

---

## 5. Implicación CRÍTICA para Next 16 (acción futura)

La migración real será a **Next 16** (que trae su propio React canary con View Transitions). Next 16 implica un bump mayor de `next` + `react`/`react-dom`, es decir **una re-resolución completa del árbol**. Esa re-resolución **chocará de frente con el `ERESOLVE` de expo del factor 4.**

> **Prerrequisito duro de Next 16:** resolver el conflicto peer `expo-app-integrity` ↔ `expo-device` **antes** de intentar la migración — actualizar `expo-app-integrity` a una versión cuyo peer acepte `expo-device@~7.1.x`, o reemplazarlo, o coordinar el override de forma que `npm install` desde cero resuelva sin `--legacy-peer-deps`. Sin eso, Next 16 no podrá regenerar el lockfile limpio y se topará con el mismo muro, agravado por el salto simultáneo de `next` y `react`.

---

## 6. Estado y recomendación

- **Bump 18.3.1: PAUSADO/abandonado.** Rama `chore/react-18-3-1` sin merge. `main` intacto.
- **`apps/mobile`: sin tocar (19.0.0).** El lockfile **no** se editó a mano.
- **Siguiente paso (cuando toque):** durante la migración a Next 16, (a) resolver primero el conflicto peer de expo (§5), (b) hacer la re-resolución completa, (c) capturar ahí el catálogo de warnings de React 19 / canary. Los scans de compatibilidad de los docs WEB-01/01b siguen vigentes como insumo.
