# Auditoría de fidelidad 1:1 — Datasets Wilhelm / Legge / Zhou Yi

**App:** The Original I Ching · **Paquete:** `@iching-oracle/iching-data`  
**Fecha apertura:** 2026-06-21  
**Estado:** 📋 **ABIERTA** — Fase 2 primera pasada completa (2026-06-21); remediación pendiente de go  
**Relacionado:** [DATA_INTEGRITY_AUDIT.md](./DATA_INTEGRITY_AUDIT.md) (cierre 2026-05-10, hex 23) · [packages/iching-data/README.md](../../packages/iching-data/README.md)

---

## Veredicto provisional (pre-ejecución)

Los **claims de producto** (“texto base sin modificaciones”, “verificado 1:1 contra universidades/proyectos académicos”) **no están respaldados hoy por evidencia reproducible** en el repo. Existe una auditoría cerrada del **2026-05-10** que corrigió **solo metadata del hex 23 (Wilhelm)** y afirmó “100% correcto” en el resto **sin harness automatizado** ni diff persistente en `reports/`.

El pipeline real mezcla **fuentes primarias prestigiosas (claims)** con **fuentes intermedias de scraping/GitHub (implementación)**. Hasta completar esta auditoría, los claims deben considerarse **aspiracionales**, no demostrados.

---

## 1. Contexto — lo que ya corregimos (hex 23)

| Campo | Detalle |
|-------|---------|
| **Trigger histórico** | Hexagrama 23 (剝 Bō): trigrama inferior etiquetado “The Clinging” (Li) en lugar de “The Receptive” (Kūn) |
| **Origen** | Error en `adamblvck/iching-wilhelm-dataset`, no en Wilhelm/Baynes |
| **Fix** | Manual en `scripts/iching_wilhelm_translation.mjs` + `npm run build:data` |
| **Documentado en** | `DATA_INTEGRITY_AUDIT.md` (2026-05-10) |

Ese incidente demuestra que **un solo campo erróneo puede pasar desapercibido** aunque el texto literario parezca correcto. No garantiza fidelidad 1:1 del cuerpo completo.

---

## 2. Inventario de claims (qué promete la app)

| Ubicación | Claim |
|-----------|-------|
| `packages/i18n` → `notes-page-ui.ts` | Wilhelm/Baynes es “texto base… **sin modificaciones ni simplificaciones**” |
| `scripts/build-hexagrams.mjs` → `licenseNote` | Wilhelm: “Cross-verified 1:1 against **University of Parma**” |
| Idem Legge | “Cross-verified 1:1 against **Internet Sacred Text Archive**” |
| Idem Zhou Yi | “Cross-verified 1:1 against **Chinese Text Project (ctext.org)**” |
| `DATA_INTEGRITY_AUDIT.md` | “100% accurate literary content” (63 hex restantes, mayo 2026) |

---

## 3. Pipeline real (implementación vs claims)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ WILHELM                                                                 │
│ Fuente committed: adamblvck/iching-wilhelm-dataset                    │
│ Script: scripts/iching_wilhelm_translation.mjs (NO hay tools/ingest)  │
│ Claim de verificación: Uni Parma mirror                                 │
│ GAP: ingestión ≠ fuente de verificación declarada                       │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│ LEGGE                                                                   │
│ Ingest: tools/ingest-legge.mjs → scrape baharna.com/iching/legge/*.htm  │
│ Script: scripts/iching_legge_translation.mjs                            │
│ Claim de verificación: sacred-texts.com                                 │
│ GAP: scrapeamos Baharna; verificamos contra Sacred Texts (distinto)     │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│ ZHOU YI                                                                 │
│ Ingest: tools/ingest-zhouyi.mjs → freizl/yijing zh-TW/64gua.json        │
│ Script: scripts/iching_zhouyi_translation.mjs                         │
│ Claim de verificación: ctext.org                                        │
│ GAP: upstream GitHub ≠ ctext (puede coincidir, hay que demostrarlo)     │
│ Nota: `image` = 大象傳 (Da Xiang), no 彖傳/小象 — decisión de producto OK │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
              scripts/build-hexagrams.mjs
                              ↓
     packages/iching-data/src/generated/hexagrams.{wilhelm,legge,zhouyi}.json
                              ↓
        Oráculo Claude · Biblioteca Seeker+ · PDF · prompts
```

**Tests actuales** (`packages/iching-data/src/index.test.ts`): schema, 64 hex, metadatos estructurales idénticos, yong 1/2 — **no comparan texto contra fuente canónica**.

---

## 4. Jerarquía de fuentes oro (gold standards)

Usar **Tier 0** para verificación 1:1. Tier 1–2 solo como respaldo o cuando Tier 0 no tenga HTML estable.

### Wilhelm / Baynes (inglés, ed. Princeton 1950)

| Tier | Fuente | URL / referencia | Rol |
|------|--------|------------------|-----|
| **0** | Princeton Univ. Press / Internet Archive scan | [archive.org](https://archive.org/search?query=I+Ching+Wilhelm+Baynes+1950) — edición 1950 completa | Gold preferido si OCR/texto limpio disponible |
| **0b** | Uni Parma academic mirror | http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html | Gold operativo hoy (ya citado en bundle) |
| 1 | adamblvck/iching-wilhelm-dataset | GitHub | Fuente de ingestión actual — **no** gold |
| 2 | Otros mirrors web | Varios | Solo triangulación |

**Campos a comparar por hex:** `judgment`, `image` (Image / Symbolism), `lines[1..6].text`, `yongJiu` (hex 1), `yongLiu` (hex 2).  
**Excluir de diff estricto:** nombres modernos de hex (`Initiating` vs `The Creative`), mayúsculas de título en judgment, saltos de línea (normalizar).

### James Legge (inglés, Sacred Books of the East vol. XVI, 1882/1899)

| Tier | Fuente | URL | Rol |
|------|--------|-----|-----|
| **0** | Internet Sacred Text Archive | https://sacred-texts.com/ich/index.htm (+ páginas por hex) | Gold — coincide con claim público |
| 1 | Oxford / Dover reprints | Referencia bibliográfica | Citación académica, no scrape automático |
| 2 | baharna.com/iching/legge | Scrape actual | **Ingestión** — verificar ≡ Tier 0, no sustituir |

**Campos:** Thwan (judgment), Great Symbolism (image), Line Statements 1–6, supernumerary 7 (hex 1/2).  
**Parser risk:** Baharna mezcla notas editoriales `[Whincup]`, `[Legge]` — el ingester filtra; hay que validar que **no se cuelan** ni **se pierdan** párrafos Legge.

### Zhou Yi (chino clásico)

| Tier | Fuente | URL | Rol |
|------|--------|-----|-----|
| **0** | Chinese Text Project | https://ctext.org/book-of-changes | Gold — coincide con claim público |
| 1 | 维基文库 / Wikisource 周易 | zh.wikisource.org | Respaldo independiente |
| 2 | freizl/yijing `zh-TW/64gua.json` | GitHub | **Ingestión** — demostrar ≡ Tier 0 |

**Campos:** 卦辭 → judgment, 大象 → image, 爻辭 1–6 → lines, 用九/用六 → yong*.  
**Normalización:** strip prefijos `初九：`, full-width punctuation, variantes 繁/简 (usamos tradicional).

---

## 5. Resultados Fase 2 — auditoría 1:1 (2026-06-21)

**Reporte canónico:** `reports/hexagram-fidelity-2026-06-21T18-59-13-876Z.{json,md}`  
**Comando:** `npm run verify:hexagram-fidelity` (cache-first; gold en `tools/output/fidelity-gold/`)

### Resumen por traductor

| Traductor | Match | Mismatch | Missing gold (parser) | Total campos | Match % | Gold usado |
|-----------|------:|---------:|----------------------:|-------------:|--------:|------------|
| **Wilhelm** | 488 | 18 | 8 | 514 | **94.94%** | Uni Parma (oracle text only) |
| **Legge** | 396 | 99 | 18 | 513 | **77.19%** | sacred-texts ic01–64 + icap2 (Great Symbolism) |
| **Zhou Yi** | 466 | 48 | 0 | 514 | **90.66%** | ctext gettext + HTML (大象傳 incluido) |
| **Total** | 1,350 | 165 | 26 | 1,541 | **87.6%** | — |

Cobertura: **64 hex × 3 traductores × (judgment + image + 6 lines + yong*)** — sin skips en Zhou Yi 大象 (resuelto vía HTML ctext).

### Hallazgos confirmados (muestra representativa)

| Traductor | Hex | Campo | Clase | Evidencia |
|-----------|-----|-------|-------|-----------|
| Wilhelm | 18 | lines 1–5 | **A** | Padre/madre **intercambiados** vs Parma (swap en bundle adamblvck) |
| Wilhelm | 2 | yongLiu | **A/B** | Texto distinto: gold «Lasting perseverance…» vs bundle «Perseverance furthers.» |
| Wilhelm | 27, 62 | judgment | **C** (histórico) | Comentario Wilhelm embebido — el harness Parma extrae solo oracle; el bundle incluye bleed (match parcial por prefijo) |
| Legge | 2, 4, 5… | judgment/image | **B + gap ingest** | `Khwan` vs `Khwăn`, entidades HTML sin decodificar en gold parser; bundle desde **Baharna** ≠ Sacred Texts |
| Legge | 7–64 (muestra) | judgment | **E→resuelto** | Judgment multi-párrafo en ic07+ — parser harness corregido; 18 missing gold residuales (icap2 hex partido, ic08 líneas «In the…») |
| Zhou Yi | 14 | line 2 | **A — crítico** | Bundle tiene **爻辞 de hex 13** (`同人於宗，吝。`) donde gold ctext espera `大車以載…` |
| Zhou Yi | 31 | judgment + lines | **A** | Glifo **鹹** (salado) sustituye **咸** (influencia) en todo el hex; prefijos `，` corruptos en líneas |
| Zhou Yi | 44 | line 5 | **A** | Label duplicado en bundle: `九五：…` concatenado al texto |
| Zhou Yi | ~40 campos | varios | **B** | Variantes 简/繁 (`无/無`, `于/於`, `后/後`, `志/誌`) — freizl zh-TW vs ctext |

Las señales rojas de §5 preliminar (**hex 25 truncado, 27 Mencius, 62 hex 28**) quedan **subsumidas** en el reporte JSON; no invalidan la necesidad de remediación.

### Clasificación agregada (165 mismatches producto + 26 parser)

| Clase | Wilhelm | Legge | Zhou Yi | Acción recomendada |
|-------|--------:|------:|--------:|-------------------|
| **A** — error en bundle | ~12 | ~15–20 (est.) | ~5 | Re-ingest o patch puntual + rebuild |
| **B** — normalización | ~6 | ~60+ (ortografía Legge) | ~40 | Normalizer + política 繁/简 explícita |
| **C** — producto (extracto oracle) | ~0–8 | — | — | Actualizar claim UI si se mantiene extracto |
| **D** — gold mirror | ~8 | ~1 image | 0 | Triangular; no tocar bundle |
| **E** — parser harness | 8 missing | 18 missing | 0 | Refinar `hexagram-fidelity-*.mjs` (no producto) |

---

## 5b. Señales rojas preliminares (histórico — pre-harness)

Revisión rápida de `hexagrams.wilhelm.json` (`generatedAt: 2026-06-12`) — **requieren verificación en Fase 2**:

| Hex | Campo | Observación |
|-----|-------|-------------|
| 25 | line 2 | Texto aparentemente **truncado** (“If one does not count on the harvest while plowing,”) |
| 27 | judgment | Párrafo de **Mencius** embebido en judgment (probable bleed del comentario Wilhelm, no 卦辭) |
| 29 | image | “foal” vs “goal” — posible OCR/typo |
| 62 | judgment | Texto de **hex 28** (Ta Kuo) incrustado al final del judgment |
| Varios | lines | Comillas/typo OCR (`'`, `IT` vs `It`, `deceases` vs `decreases`) |

Esto **contradice** el cierre “100% accurate” de mayo 2026 y justifica reabrir la auditoría.

---

## 6. Master plan — fases

### Fase 0 — Charter y congelación (1 día) ✅ este documento

- [x] Mapear pipeline, claims, gold sources, gaps
- [x] Reabrir auditoría formal (supersedes cierre optimista DATA_INTEGRITY)
- [ ] Comunicar a producto: **no ampliar claims** en marketing hasta Fase 5

### Fase 1 — Harness de verificación reproducible (2–3 días) ✅ 2026-06-21

Crear `scripts/verify-hexagram-fidelity.mjs` (+ tests vitest):

1. **Fetch/cache** gold HTML/JSON en `tools/output/fidelity-gold/` (gitignored, regenerable) ✅
2. **Extractors** por fuente (Parma, Sacred Texts, ctext) — selectores documentados ✅
3. **Normalizer** compartido ✅
4. **Diff engine** ✅
5. **Report JSON** → `reports/hexagram-fidelity-{timestamp}.json` ✅
6. **Report MD humano** → `reports/hexagram-fidelity-{timestamp}.md` ✅

**Gate Fase 1:** script corre offline con cache; 0 secretos; documentado en README del script. ✅

**Primera pasada (2026-06-21):** ver evolución en `reports/hexagram-fidelity-2026-06-21T18-45-54-890Z` (parsers incompletos) → **`18-59-13-876Z`** (auditoría completa 3 traductores).

**Comando:** `npm run verify:hexagram-fidelity` · flags: `--live`, `--translator=wilhelm|legge|zhouyi|all`

### Fase 2 — Auditoría 1:1 completa ✅ primera pasada 2026-06-21

Matriz de cobertura obligatoria:

| Traductor | Hexágonos | Campos / hex | Total comparaciones |
|-----------|-----------|--------------|---------------------|
| Wilhelm | 64 | judgment + image + 6 lines + yong* | 514 |
| Legge | 64 | idem | 513 |
| Zhou Yi | 64 | idem (大象 incluido) | 514 |
| **Total** | | | **1,541** |

**Gate Fase 2 (parcial):** reporte archivado ✅ · clasificación A–E en §5 ✅ · mismatches **clase A abiertos** (hex 14, 31 Zhou Yi; hex 18 Wilhelm; etc.) — **pendiente Fase 3**

### Fase 3 — Remediación (variable, post-aprobación)

Orden recomendado:

1. Wilhelm — corregir `iching_wilhelm_translation.mjs` o nuevo `tools/ingest-wilhelm.mjs` desde Parma/Archive
2. Legge — re-ingest desde Sacred Texts **directo** (nuevo ingester), Baharna solo como validación cruzada
3. Zhou Yi — re-ingest desde ctext API/HTML o validar freizl ≡ ctext
4. `npm run build:data` + tests + diff report **PASS**

**Regla:** no merge a staging hasta reporte post-fix con ≥99.5% match exact post-normalizer, 100% en campos críticos (lines + judgment core).

### Fase 4 — Alineación de claims legales/producto (1 día)

Actualizar solo si Fase 2–3 PASS:

- `packages/i18n` → `notes-page-ui.ts` (11 locales vía `@iching-oracle/i18n`)
- `scripts/build-hexagrams.mjs` → `licenseNote` con fecha + hash del reporte
- `DATA_INTEGRITY_AUDIT.md` → enlace a este doc; marcar superseded
- `packages/iching-data/README.md` → fuentes gold reales del ingester

Si quedan extractos (ej. judgment sin comentario Confucio): cambiar “sin modificaciones” → “texto del oráculo (卦辞/爻辞/象传) sin parafrasear; comentarios editoriales excluidos”.

### Fase 5 — CI gate permanente (1 día)

- `npm run verify:hexagram-fidelity` en CI (usa cache committed de gold snapshots **hasheados**, no live scrape en cada PR)
- Falla CI si alguien regenera bundles sin actualizar snapshots de fidelity
- Añadir entrada en `docs/auditorias/README.md`

### Fase 6 — Cierre

| Criterio | Requerido |
|----------|-----------|
| Reporte 1:1 completo | 3 traductores × 64 hex |
| Mismatches clase A | 0 abiertos |
| Claims UI/docs | Alineados con evidencia |
| Harness | En CI |
| Oráculo / biblioteca | Smoke: hex 1, 23, 44, 62 spot-check en app |

---

## 7. Entregables

| Entregable | Ruta |
|------------|------|
| Plan maestro (este doc) | `docs/auditorias/ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md` |
| Script verificación | `scripts/verify-hexagram-fidelity.mjs` (Fase 1) |
| Reporte JSON | `reports/hexagram-fidelity-*.json` |
| Reporte legible | `reports/hexagram-fidelity-*.md` |
| Gold cache | `tools/output/fidelity-gold/` (gitignored) |
| Gold snapshots CI | `packages/iching-data/fixtures/gold-snapshots/` (TBD Fase 5) |

---

## 9. Evaluación estratégica — ¿fix puntual o re-ingesta desde gold?

### Veredicto ejecutivo

| Traductor | Recomendación | Confianza |
|-----------|---------------|-----------|
| **Wilhelm** | **Re-ingesta** desde Parma (o Archive 1950 cuando esté disponible) | Alta |
| **Legge** | **Re-ingesta** desde sacred-texts.com directo | Alta |
| **Zhou Yi** | **Re-ingesta** desde ctext.org + normalización 繁 explícita | Alta |

**No recomendado:** parchear manualmente decenas/cientos de campos en los scripts actuales sobre datasets intermedios (adamblvck, baharna, freizl). El coste de mantenimiento supera el de un ingester nuevo alineado con el gold que ya verificamos.

### Wilhelm (~95% match vs Parma)

**Diagnóstico:** El bundle proviene de `adamblvck/iching-wilhelm-dataset`; el gold es Parma. La mayoría del texto coincide; los ~26 desvíos restantes mezclan **swap líneas (hex 18)**, **typos OCR**, y **comentario Wilhelm en judgment** (clase C — el producto puede incluir más texto que el oracle puro de Parma).

**Fix puntual:** viable solo para ≤5 campos A confirmados (hex 18, yongLiu hex 2, typos puntuales). No escala.

**Re-ingesta:** crear `tools/ingest-wilhelm.mjs` que scrape/cache Parma (misma fuente que el claim público), mapee judgment/image/lines/yong*, excluya comentario Wilhelm de forma **explícita y documentada**, y reemplace `iching_wilhelm_translation.mjs` + adamblvck como fuente primaria. adamblvck queda como validación cruzada opcional.

**Beneficio:** ingest = gold → un solo pipeline; CI fidelity pasa al ~100% oracle; claims defendibles.

### Legge (~77% match vs sacred-texts)

**Diagnóstico:** El gap principal **no es calidad del scrape Baharna en abstracto**, sino **fuente distinta al gold declarado**. ~60+ mismatches son ortografía (`Khwan`/`Khwăn`, `Mang`/`Măng`) y formato de líneas (`In the first SIX` vs `The first SIX`). ~18 campos aún son límites del parser harness (no del bundle).

**Fix puntual:** normalizar entidades + diccionario de nombres Legge podría subir el % artificialmente **sin demostrar equivalencia Baharna ≡ Sacred Texts**.

**Re-ingesta:** crear `tools/ingest-legge-sacred.mjs` (ic + icap2, Wayback fallback), deprecar `tools/ingest-legge.mjs` (Baharna). Baharna solo triangulación.

**Beneficio:** alinea implementación con claim IST; elimina debate Baharna vs gold.

### Zhou Yi (~91% match vs ctext)

**Diagnóstico:** freizl/yijing zh-TW está **cerca** de ctext en ~90% de campos. El ~10% restante incluye:
- **~40 campos clase B** (variantes 简/繁, puntuación) — resoluble con política de normalización al ingest
- **~5 campos clase A críticos** (hex 14 línea 2 intercambiada, hex 31 咸→鹹 corrupto, hex 44 label duplicado) — **no** son variantes; son bugs de upstream o ingest

**Fix puntual:** corregir hex 14/31/44 en `iching_zhouyi_translation.mjs` es rápido pero **frágil** (¿qué más está mal en freizl no detectado?).

**Re-ingesta:** `tools/ingest-zhouyi-ctext.mjs` — API gettext + HTML para 大象, normalizar a **tradicional canónico** (mapa 简→繁 documentado, mismo que el harness). freizl queda cross-check.

**Beneficio:** fuente única ctext = claim actual; hex 1 (乾) ya demostró 100% match en 卦辭+爻辭+用九+大象 post-normalizer.

### Orden de ejecución propuesto (Fase 3)

1. **Zhou Yi** — menor volumen de texto, bugs A más graves (hex 14/31); re-ingest ctext da win rápido en integridad china.
2. **Wilhelm** — alto impacto producto EN; re-ingest Parma cierra gap claim vs implementación.
3. **Legge** — mayor esfuerzo de parsing HTML (64 ic + icap2), pero patrón ya probado en harness.

Tras cada re-ingest: `npm run build:data` → `npm run verify:hexagram-fidelity` → gate ≥99.5% match.

### Cuándo sí un fix puntual

- Hotfix **P0** (hex 14 Zhou Yi en producción) antes del ingester nuevo.
- Metadata estructural (trigramas, ya corregido hex 23).
- Ajustes **solo normalizer** (clase B masiva Zhou Yi) si se documenta política 繁/简 en README.

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Mirrors web caen o cambian HTML | Snapshots hasheados en repo; pin de versión |
| Wilhelm Princeton vs Baynes vs Parma difieren en puntuación | Normalizer + doc de reglas; no “arreglar” a mano sin fuente |
| Baharna ≠ Sacred Texts en párrafos | Migrar ingester Legge a Sacred Texts |
| ctext rate-limit | Cache local; backoff |
| Tiempo (~1,344 diffs) | Automatizar 100%; revisión humana solo en mismatches |

---

## 11. Próximo paso inmediato

**Fase 3 (post-go)** — implementar re-ingesters alineados con gold (orden: Zhou Yi → Wilhelm → Legge). Hotfix opcional hex 14/31 Zhou Yi si se prioriza antes del ingester.

**Sin remediar textos de producto** hasta confirmación explícita de alcance.

Reporte de referencia: `reports/hexagram-fidelity-2026-06-21T18-59-13-876Z.json`.

---

*Auditoría abierta 2026-06-21. Fase 2 primera pasada completada 2026-06-21. Supersedes el veredicto “100% accurate” de DATA_INTEGRITY_AUDIT (2026-05-10).*
