# Plan: activación diferida de los proveedores de imagen de respaldo

**Código:** `20260814-PLAN-IMG-PROV-01 image-fallback-providers-deferred` · **Familia:** IMG-PROV · **Estado:** deferred · **Fecha:** 2026-08-14

## Decisión

**No se dan de alta por ahora las cuentas ni las claves de fal.ai ni de Runware.** Se hará más adelante. La contingencia actual se considera suficiente.

Esta decisión es del propietario del producto y está tomada con el código de ambos proveedores ya escrito, no por falta de implementación.

## Por qué la contingencia actual basta

Cuando el proveedor primario falla, la cadena vigente es:

```
Together (Juggernaut-Lightning-Flux)
  -> [fal.ai: implementado pero INACTIVO, sin FAL_AI_KEY]
  -> pool precalculado en R2      <-- aquí cae hoy
  -> prebuilt local (80 imagenes)
  -> SVG sumi generado en el momento
```

El pool de R2 se amplió el 2026-08-14 a **5440 objetos** (64 hexagramas y 4 veredictos de huesos, por 20 variantes, por 4 tamaños de tier), verificado entero con `npm run verify:r2-fallback-coverage`: 5440/5440 presentes, 0 faltantes. Ningún usuario se queda sin imagen aunque Together caiga por completo.

## Lo que se pierde mientras tanto (limitación real, asumida)

El pool de R2 es **precalculado**: si Together falla, el usuario recibe una de las 20 variantes de su hexagrama, no una imagen generada para su consulta concreta. Dos usuarios con el mismo hexagrama tienen 1 en 20 (5%) de recibir la misma imagen. Con fal.ai activo, ese caso se resolvería con una **regeneración en vivo** y la imagen volvería a ser única.

Es una degradación de exclusividad, no de disponibilidad. Solo se manifiesta cuando el primario ya está fallando.

## Lo que YA está construido (no rehacer)

| Pieza | Estado | Dónde |
|---|---|---|
| Adaptador de fal.ai + FLUX.1-schnell | Completo y desplegado en main. Inactivo sin clave: `generateWithFal` devuelve `hasKey: false` y la cadena sigue al pool de R2 | `apps/web/src/lib/image-provider.ts` |
| Cadena de fallback con fal como paso 1 | Cableada tras el fallo de Together, con overlay dimensionado al tamaño real | mismo archivo, rama `provider === "together"` |
| Sonda de operatividad de Runware | Escrita, **nunca ejecutada** (falta la clave) | `tools/fallback-tools/probe-runware.mjs` |

El adaptador de fal usa deliberadamente **el mismo FLUX.1-schnell** que este producto usó hasta que Together lo deprecó el 2026-08-19, y que fal sigue sirviendo. No es un modelo sustituto: es la dirección de arte con la que se envió el producto durante meses.

## Cómo activarlo cuando se decida

**fal.ai** (fallback 1):
1. Crear la cuenta eligiendo **Model APIs** (no Serverless, que es para desplegar código propio, ni Compute, que reserva GPUs).
2. Generar la API key.
3. Ponerla como `FAL_AI_KEY` en Vercel, en **Production y Preview**.
4. No hace falta desplegar nada: el código ya está en main y se activa solo al existir la variable.

**Runware** (candidato a fallback 2, sin validar):
1. Cuenta simple, sin estructura de organización: todavía no se sabe si sirve.
2. `RUNWARE_API_KEY` en el entorno.
3. Correr `node --env-file=.env tools/fallback-tools/probe-runware.mjs`.
4. La sonda mide auth, los 4 tamaños de tier (incluidos 1184 y 1504, que no son múltiplos de 64 y que la infraestructura de Together rechaza), el prompt real de ~1950 caracteres, la latencia contra el presupuesto de 65s, si el tamaño devuelto coincide con el pedido, y contaminación por sellos. Emite veredicto explícito.
5. **Solo si pasa** se cablea como fallback 2.

## Proveedores descartados en el camino

- **Qwen/Qwen-Image** (la recomendación oficial de Together): 429 persistentes y ~3.6x más lento cuando respondía. Descartado por fiabilidad, no por calidad.
- **pollinations** y **gpt-image**: sus rutas de generación se eliminaron del código. Gratuitos y nunca validados para calidad, sellos ni disponibilidad. Sus nombres sobreviven solo en `imageProviderFromUrl` de `session-store` para que las consultas históricas sigan etiquetándose bien.

## Cuándo revisar esta decisión

- Si Together empieza a fallar con frecuencia observable (revisar Sentry por `provider: together_ai`).
- Si la repetición de imágenes de respaldo se vuelve visible para los usuarios.
- Antes de cualquier campaña que multiplique el volumen de consultas.

## Ver también

- `00000000-RUN-AI-OPS-01 model-cost-comparison`: cómo medir costo real antes de cambiar de modelo.
- `VF-IMG-001 r2-fallback-coverage`: el gate que verifica que el pool de contingencia está completo. Correrlo antes de subir `R2_VARIANTS_PER_KEY`.
