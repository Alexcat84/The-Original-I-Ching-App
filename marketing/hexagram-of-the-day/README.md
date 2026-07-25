# Hexagram of the Day — campaña social

Campaña de marketing "un hexagrama al día" (64 posts, uno por hexagrama).

## Contenido

| Archivo | Qué es | En git |
|---|---|---|
| `posts.md` | El guion: 64 posts sociales (copy + hashtags) + instrucciones de programación en Meta Business Suite | Sí (versionado) |
| `images/hex-01-乾.png` … `hex-64-未濟.png` | Las 64 imágenes (una por hexagrama), Together FLUX | No (local-only, ~171 MB) |
| `images/manifest.json` | Metadatos de la tanda (traductor, tier, resolución, negative prompt, seed) | No (va con las imágenes) |

## Estado de programación

Programado hasta el **hexagrama #20** (actualizar esta línea al avanzar).

## Por qué las imágenes no están en git

Son ~171 MB de binarios que no forman parte de la app desplegable (misma política que `tools/` y `reports/`). Quedan **local-only**; respaldarlas aparte (p. ej. ZIP en Drive) si se quieren fuera de este disco. El **guion (`posts.md`) sí se versiona** porque es texto valioso y liviano.

## Origen de los datos

- Copy: paráfrasis del juicio de cada hexagrama, fuente `packages/iching-data/src/generated/hexagrams.baynes.json` (Wilhelm/Baynes EN).
- Imágenes: generadas con `scripts/generate-zhouyi-64hex-master-together.mjs` (Together FLUX); texto fuente Zhou Yi en `tools/output/zhouyi-raw/64gua.json`.
