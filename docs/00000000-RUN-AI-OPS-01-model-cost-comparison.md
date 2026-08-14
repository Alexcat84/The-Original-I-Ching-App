# Runbook: comparación de costo real entre modelos Anthropic

**Código:** `00000000-RUN-AI-OPS-01 model-cost-comparison` · **Familia:** AI-OPS · **Estado:** reference

## Por qué existe

Comparar precios de lista por token entre dos modelos **no basta** para decidir un
cambio de modelo: un modelo más nuevo puede tener un tokenizador distinto (más o
menos tokens por el mismo texto) y puede activar "thinking" por defecto, que
consume tokens de salida sin que el usuario los vea. La única forma honesta de
saber cuánto cuesta *en la práctica* un cambio de modelo es correr la ruta real
de producción y medir `usage` de la respuesta real de la API.

Este runbook documenta el script que hace eso: `scripts/compare-model-cost.mjs`.

## Qué hace el script

Llama directamente a `generateInterpretation` (la función real de
`backend/claude`, la misma que usa `/api/consult` en producción) con dos
modelos distintos vía `ANTHROPIC_MODEL`, para dos casos representativos:

1. **Seeker / Wilhelm, sin contexto**: consulta simple, `max_tokens` default (4096).
2. **Master Combined, con contexto**: el caso más caro y con más riesgo de
   truncado (`max_tokens` 5000/7000 según haya contexto previo).

Para cada caso, en cada modelo, imprime `usage` real (`inputTokens`,
`outputTokens`, `cacheCreationTokens`, `cacheReadTokens`), el largo del texto
generado, y el costo en USD a precio de lista (y, si aplica, a precio promocional).

**Hace llamadas reales a la API de Anthropic**: cuesta dinero real (unos
centavos por corrida) y requiere `ANTHROPIC_API_KEY` en el entorno. No toca
Supabase ni consume tokens de ningún usuario: es 100% aparte del flujo de
créditos de la app.

## Cómo correrlo

```bash
# Build de los paquetes que el script importa (si no están frescos)
npm run build --prefix packages/iching-engine
npm run build --prefix backend/claude

# Comparación default: claude-sonnet-4-6 vs claude-sonnet-5
node --env-file=.env scripts/compare-model-cost.mjs

# Comparación explícita entre otros dos modelos
node --env-file=.env scripts/compare-model-cost.mjs claude-opus-4-8 claude-opus-5
```

Si comparas contra un modelo sin entrada en la tabla `PRICING` del script,
agrégala antes de correr (el script tira error explícito si falta).

## Resultado de referencia (2026-08-08): Sonnet 4.6 vs Sonnet 5

Corrida real, ambos casos, con la promoción de Sonnet 5 vigente (thru
2026-08-31: $2/$10 por MTok; precio de lista desde 2026-09-01: $3/$15,
idéntico a Sonnet 4.6).

| Caso | Modelo | in | cache esc. | cache lect. | out | chars | $ lista | $ promo |
|---|---|---|---|---|---|---|---|---|
| Seeker/Wilhelm, sin contexto | sonnet-4-6 | 3811 | 1316 | 0 | 1618 | 4420 | 0.03965 | - |
| Seeker/Wilhelm, sin contexto | sonnet-5 | 5886 | 1891 | 0 | 2006 | 3956 | 0.05342 | 0.03561 |
| Master Combined, con contexto | sonnet-4-6 | 6746 | 65 | 1316 | 2914 | 8454 | 0.06809 | - |
| Master Combined, con contexto | sonnet-5 | 9614 | 88 | 1891 | 6375 | 7397 | 0.13040 | 0.08694 |

### Lectura

- **Seeker (caso simple):** Sonnet 5 usa ~50-55% más tokens de entrada y ~24%
  más de salida que 4.6 (tokenizador nuevo). Costo a precio de lista: **+35%**
  por consulta. Con la promo vigente: **-10%** (más barato que 4.6 ahora mismo).
- **Master Combined con contexto (caso caro):** la diferencia es mucho mayor de
  lo que el ~30% de "más tokens por tokenizador" hace esperar. Sonnet 5 generó
  **6375 tokens de salida** contra 2914 de 4.6 (+119%), pero el texto visible
  fue **más corto** (7397 caracteres vs 8454). La diferencia son tokens de
  "thinking" que Sonnet 5 activa por defecto y que se cobran, aunque el usuario
  no los vea. Costo a precio de lista: **+92%** por consulta. Con la promo:
  **+28%** (ya no es más barato, incluso con descuento).
- **Riesgo de truncado:** 6375 de 7000 tokens de `max_tokens` disponibles para
  Master Combined con contexto = **91% del presupuesto usado**. No truncó en
  esta corrida, pero queda poco margen; una consulta con contexto más largo
  podría cortar la interpretación (`stop_reason: "max_tokens"`).

### Conclusión de esa corrida

El cambio de modelo **no es "mismo precio, mejor calidad"** de forma pareja en
todos los tiers. En el tier más caro (Master Combined + contexto, que es
justo donde más le importa la calidad al usuario que paga más), el salto de
costo real fue mucho mayor que el anunciado por precio de lista, por el
consumo de tokens de thinking. Antes de mover producción a Sonnet 5 conviene:

1. Re-correr este script tras el 2026-08-31 (precio de lista, no promo) para
   confirmar el número real que se va a facturar.
2. Revisar si conviene subir `MAX_TOKENS_MASTER_WITH_CONTEXT` /
   `MAX_TOKENS_MASTER_NO_CONTEXT` en `backend/claude/src/anthropic-interpretation-params.ts`
   para dar margen al thinking, o desactivar thinking explícitamente
   (`thinking: {type: "disabled"}`) si el costo extra no se justifica.
3. Medir con más de una corrida por caso; esto son 2 muestras, no un promedio
   estadístico.

## Ver también

- `backend/claude/src/anthropic-interpretation-params.ts`: de dónde salen los
  límites de `max_tokens` por tier que este script ejercita.
- `backend/claude/src/interpretation.ts` → `generateInterpretation`: la
  función real que este script invoca.
