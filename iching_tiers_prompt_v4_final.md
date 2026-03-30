# ACTUALIZACIÓN DE TIERS v4 — The Original I Ching App
# Prompt definitivo para Cursor — basado en análisis real de costos
# Todos los cambios detallados con justificación económica
# ─────────────────────────────────────────────────────────────────

Actualiza TODOS los archivos del proyecto donde aparezcan configuraciones
de tiers, límites, precios o comportamiento por plan. Lee primero cada
archivo antes de modificarlo.

---

## FUENTE ÚNICA (código)

- **Cupos, precios mensuales USD y descuento anual:** `apps/web/src/lib/tier-billing-constants.ts`  
  Cambiar ahí propaga a `credits.ts`, `/api/account/me`, webhooks/sync y copy de **Guía** (`app/guia/page.tsx`).
- **Resto de flags por tier (historial, watermark, modelo, etc.):** `apps/web/src/lib/credits.ts` → `TIER_CONFIG`.
- **Variantes RevenueCat Seeker:** `seeker_monthly` y `seeker_annual` (mismo cupo mensual); mapeo en `apps/web/src/lib/revenuecat-tiers.ts`.
- **Profundidad de hilo (consultas en el mismo chat):** `packages/context-engine/src/index.ts` → `CONTEXT_LIMITS`.

---

## CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR

1. Free: 2 consultas LIFETIME (no por mes) — el usuario las usa una vez y nunca más
2. Oracle: consultas/mes 500 → 350
3. Oracle: contexto por sesión 10 → 12
4. Plan anual: **10%** de descuento vs 12× mensual (`ANNUAL_PLAN_DISCOUNT = 0.1` en `tier-billing-constants.ts`)
5. 2FA: de obligatorio en Practitioner+ → OPCIONAL en todos los tiers
6. Watermark: se mantiene en TODOS los tiers incluyendo Oracle (es publicidad)
7. Modelo Claude: Sonnet 4.5 para TODOS los tiers sin excepción
8. Sin límite de max_tokens en ningún tier — respuestas completas siempre
9. Sharing viral eliminado — solo descarga por PDF
10. Oracle Bones e I Ching disponibles en TODOS los tiers incluyendo Free
11. Modo de tirada (monedas + yarrow) igual en todos los tiers

---

## TABLA MAESTRA DE TIERS — VERSIÓN DEFINITIVA

### PRECIOS

Anual = `monthly × 12 × (1 - ANNUAL_PLAN_DISCOUNT)` con `ANNUAL_PLAN_DISCOUNT = 0.1` (redondeo a 2 decimales en código).

| Tier         | Mensual  | Anual    | Notas                          |
|---|---|---|---|
| Free         | $0.00    | —        | —                              |
| Seeker       | $6.99    | $75.49   | 10% vs 12× mensual             |
| Practitioner | $11.99   | $129.49  | idem                           |
| Master       | $19.99   | $215.89  | idem                           |
| Oracle       | $44.99   | $485.89  | idem                           |

Mensaje de marketing (opcional): "10% de ahorro en el plan anual" o equivalente.

### CONSULTAS, CONTEXTO Y FUNCIONALIDADES

| Tier         | Consultas     | Ctx/sesión | Historial    | Patrones      |
|---|---|---|---|---|
| Free         | 2 LIFETIME    | Sin ctx    | No visible   | No            |
| Seeker       | 20/mes (mensual **y** anual, mismo cupo/mes) | 3 | 90 días | No |
| Practitioner | 40/mes        | 5          | Ilimitado    | No            |
| Master       | 100/mes       | 8          | Ilimitado    | 10 consultas  |
| Oracle       | 350/mes       | 12         | Ilimitado    | 30 consultas  |

IGUAL EN TODOS LOS TIERS (no varía por plan):
- Modelo Claude: claude-sonnet-4-5-20250929
- Sin límite de max_tokens (respuestas completas)
- I Ching (易經) disponible
- Oracle Bones (甲骨文) disponible
- Modo tirada: monedas + yarrow stalks
- Calidad imagen: HD
- Watermark: sí en todos (es canal de marketing)
- Descarga PDF: sí en todos
- 2FA: opcional en todos (no obligatorio en ninguno)
- Compartir: ELIMINADO — solo descarga PDF

---

## CONFIGURACIÓN EN CÓDIGO (no duplicar aquí)

1. **`tier-billing-constants.ts`** — define `FREE_LIFETIME_CONSULTATIONS`, `SEEKER_CONSULTATIONS_PER_MONTH` (20), `PRACTITIONER_*`, `MASTER_*`, `ORACLE_*`, `TIER_MONTHLY_PRICES_USD`, `ANNUAL_PLAN_DISCOUNT`, `annualPriceUsd()`.
2. **`credits.ts`** — `TIER_CONFIG` importa esos valores para `creditsTotal` y precios; incluye claves `seeker`, `seeker_monthly`, `seeker_annual` (Seeker mensual y anual comparten el mismo `creditsTotal` vía constante).
3. No mantener una segunda tabla de números en este `.md` como fuente de verdad: si difiere del repo, el repo gana.

---

## LÓGICA CRÍTICA: FREE LIFETIME

El tier Free tiene `credits_type: 'lifetime'`. Esto significa:

```typescript
// En la función que verifica/resetea créditos:
if (user.tier === 'free') {
  // NUNCA resetear los créditos del free
  // Si credits_used >= 2 → bloqueado para siempre
  // No hay fecha de renovación para free
  return; // no hacer reset
}

// Para todos los demás tiers:
if (user.subscription_renewal_date <= today) {
  resetCredits(user);
}
```

El usuario Free que agotó sus 2 consultas ve un mensaje:
"Has usado tus 2 consultas de prueba. Para continuar, elige un plan."
No hay forma de obtener más consultas gratis — debe suscribirse.

---

## LÓGICA: ANÁLISIS DE PATRONES (Master y Oracle)

El análisis de patrones es una función disponible para Master y Oracle
que Claude ejecuta sobre el historial del usuario para detectar
hexagramas recurrentes, temas y tendencias.

```typescript
// Se activa solo cuando el usuario presiona "Analizar mis patrones"
// Consume 1 crédito del límite mensual del usuario
// NO es automático — solo bajo demanda explícita del usuario

async function analyzePatterns(userId: string, tier: 'master' | 'oracle') {
  const lookback = tier === 'oracle' ? 30 : 10;
  // Cargar las últimas `lookback` consultas del usuario
  // Enviar a Claude para análisis de patrones
  // Cobrar 1 crédito
  // Retornar el análisis
}
```

Costo estimado por análisis:
- Master (10 consultas): ~$0.063
- Oracle (30 consultas): ~$0.143
El costo es aceptable porque es poco frecuente y está limitado por créditos.

---

## LÓGICA: RESET DE CRÉDITOS POR FECHA DE RENOVACIÓN

```typescript
// CORRECTO — usar fecha de renovación del ciclo de suscripción
const resetDate = subscription.current_period_end; // de RevenueCat

// INCORRECTO — nunca hacer esto
// const resetDate = new Date(año, mes + 1, 1); // primer día del mes
```

---

## POLÍTICA DE RETENCIÓN DE DATOS

Implementar en la base de datos un campo `subscription_inactive_since`
que se marca cuando el usuario cancela. Las consultas NO se borran
automáticamente. La política es:

- Suscripción activa: datos conservados indefinidamente
- Cancelación: marcar `subscription_inactive_since = now()`
- Reactivación antes de 12 meses: historial completamente restaurado
- Más de 12 meses inactivo: datos archivables bajo solicitud del usuario
- Solicitud GDPR de eliminación: borrado inmediato de todos sus datos

Documentar en Privacy Policy — no requiere cambio de código,
solo agregar campo `subscription_inactive_since TIMESTAMPTZ` a la
tabla `subscriptions`.

---

## ARCHIVOS RELEVANTES (lista de mantenimiento)

1. `apps/web/src/lib/tier-billing-constants.ts` — **cupos y precios (editar primero)**
2. `apps/web/src/lib/credits.ts` — `TIER_CONFIG`, consumo y upsert de créditos
3. `apps/web/src/lib/revenuecat-tiers.ts` — mapeo RC → tier (incl. seeker_monthly / seeker_annual)
4. `apps/web/src/app/api/webhooks/revenuecat/route.ts` y `revenuecat-rest.ts` — sync billing
5. `apps/web/src/app/guia/page.tsx` — copy de planes (lee constantes)
6. `packages/context-engine/src/index.ts` — `CONTEXT_LIMITS` (profundidad de hilo)
7. Tests: `apps/web/src/lib/__tests__/credits-constants.test.ts`
8. Cualquier mención a "500 consultas" en docs/UI → **350**
9. Descuento anual en copy → **10%** (no 11% ni 20%)

---

## BÚSQUEDAS DE TEXTO PARA ENCONTRAR TODO

Ejecuta estos greps para encontrar cada ocurrencia a actualizar:

```bash
grep -r "500" apps/web/src --include="*.tsx" --include="*.ts" -l
grep -r "20%" apps/web/src --include="*.tsx" --include="*.ts" -l
grep -r "sharing" apps/web/src --include="*.tsx" --include="*.ts" -l
grep -r "haiku" apps/web/src --include="*.tsx" --include="*.ts" -l
grep -r "max_tokens" apps/web/src --include="*.tsx" --include="*.ts" -l
grep -r "monthly.*free\|free.*monthly" apps/web/src --include="*.ts" -l
```

---

## VERIFICACIÓN FINAL

```bash
npm run typecheck   # debe pasar sin errores
npm run build       # debe compilar exitosamente
```

Verificar en UI / guía:
- Free: 2 consultas lifetime (valores desde `FREE_LIFETIME_CONSULTATIONS`)
- Seeker: precios desde `TIER_MONTHLY_PRICES_USD` + `annualPriceUsd`; **20** consultas/mes (mensual o anual)
- Oracle: 350 consultas/mes; profundidad de sesión 12 (`CONTEXT_LIMITS.oracle`)
- Ningún tier menciona sharing viral — solo descarga PDF donde aplique
- Todos los tiers: I Ching + Oracle Bones (según `TIER_CONFIG`)
