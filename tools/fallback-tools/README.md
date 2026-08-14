# Fallback Image Generator — R2 Cloudflare

Genera 2,760 imágenes WebP organizadas por hexagrama/estado de huesos → variante → tier.
Estas imágenes se suben a Cloudflare R2 y se sirven como fallback precomputado,
reemplazando la generación real-time de Together AI para respuestas más rápidas.

## Estructura de output

```
output/
├── TEST/                        ← solo en modo test (8 imágenes de QA)
├── iching/
│   ├── 1/                       ← hexagrama 1 (Qian)
│   │   ├── 1/                   ← variante 1 (estilo ink wash)
│   │   │   ├── 1024x768.webp    ← tier free
│   │   │   ├── 1024x1024.webp   ← tier seeker
│   │   │   ├── 1184x1184.webp   ← tier practitioner
│   │   │   └── 1504x1504.webp   ← tier master
│   │   ├── 2/ … 10/
│   └── … 2/ hasta 64/
└── bones/
    ├── ji_clear/
    ├── ji_moderate/
    ├── xiong_moderate/
    ├── xiong_clear/
    └── silence/
        └── 1/ … 10/
```

## Instalación

```bash
cd tools/fallback-tools
npm install
```

## Paso 1 — Test de calidad (ejecutar primero)

```bash
TOGETHER_API_KEY=xxx node generate-fallbacks.mjs --test
```

Genera 8 imágenes representativas en `output/TEST/`. Revisarlas antes de continuar.

## Paso 2 — Generación completa

```bash
TOGETHER_API_KEY=xxx node generate-fallbacks.mjs
```

El script es **totalmente resumable** — si se interrumpe, `progress.json` guarda
el estado y al relanzar continúa desde donde quedó, sin regenerar imágenes existentes.

## Totales

| Categoría | Sujetos | Variantes | Tiers | Imágenes |
|-----------|---------|-----------|-------|----------|
| I Ching   | 64      | 10        | 4     | 2,560    |
| Bones     | 5       | 10        | 4     | 200      |
| **Total** |         |           |       | **2,760**|

**Costo estimado**: ~$10 USD  
**Tiempo estimado**: ~45-60 min (concurrencia 3)

## Notas de diseño

- **Sin `negative_prompt`**: FLUX.1 Schnell no lo procesa. Las restricciones se
  expresan como descripciones positivas del resultado deseado en el prompt principal.
- **Variantes de estilo**: cada variante usa un modificador de estilo distinto
  (ink wash, panorama Song, chiaroscuro, zen, etc.) para diversidad visual.
- **WebP quality 85**: buen balance calidad/tamaño para imágenes de 1024-1504px.
- **La clave R2** coincide con la ruta del archivo: `iching/{n}/{v}/{w}x{h}.webp`
