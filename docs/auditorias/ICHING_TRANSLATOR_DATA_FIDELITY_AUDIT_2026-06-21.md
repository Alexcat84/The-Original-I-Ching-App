# Auditoría de fidelidad 1:1 — Datasets Wilhelm / Legge / Zhou Yi

**App:** The Original I Ching · **Paquete:** `@iching-oracle/iching-data`  
**Fecha apertura:** 2026-06-21  
**Estado:** 📋 **ABIERTA** — plan maestro + re-auditoría completa pendiente de ejecución automatizada  
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

## 5. Señales rojas preliminares (muestra manual, no exhaustiva)

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

**Primera pasada (2026-06-21):** ver `reports/hexagram-fidelity-2026-06-21T18-45-54-890Z.{json,md}`.

**Comando:** `npm run verify:hexagram-fidelity` · flags: `--live`, `--translator=wilhelm|legge|zhouyi|all`

### Fase 2 — Auditoría 1:1 completa (3–5 días)

Matriz de cobertura obligatoria:

| Traductor | Hexágonos | Campos / hex | Total comparaciones |
|-----------|-----------|--------------|---------------------|
| Wilhelm | 64 | judgment + image + 6 lines + yong* | ~448 |
| Legge | 64 | idem | ~448 |
| Zhou Yi | 64 | idem | ~448 |
| **Total** | | | **~1,344** |

Además:

- **64×2** trigram labels (Wilhelm) vs estructura binaria
- **64×3** `binaryTopFirst` alineado entre bundles (ya cubierto por tests — reconfirmar)

**Clasificación de diffs:**

| Clase | Acción |
|-------|--------|
| A — Typo/OCR en nuestra copia | Fix en script fuente + rebuild |
| B — Normalización (solo whitespace/punct) | Ajustar normalizer, no texto |
| C — Decisión de producto (ej. cortar comentario Wilhelm) | Documentar + actualizar claim (“extracto del judgment”) |
| D — Error en gold mirror | Triangular con Tier 0 alternativo; documentar |
| E — Bug parser scrape | Fix ingester + re-ingest |

**Gate Fase 2:** reporte completo archivado; cada mismatch clasificado A–E; **0 mismatches clase A sin ticket**.

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

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Mirrors web caen o cambian HTML | Snapshots hasheados en repo; pin de versión |
| Wilhelm Princeton vs Baynes vs Parma difieren en puntuación | Normalizer + doc de reglas; no “arreglar” a mano sin fuente |
| Baharna ≠ Sacred Texts en párrafos | Migrar ingester Legge a Sacred Texts |
| ctext rate-limit | Cache local; backoff |
| Tiempo (~1,344 diffs) | Automatizar 100%; revisión humana solo en mismatches |

---

## 9. Próximo paso inmediato

**Fase 2** — revisar reporte `reports/hexagram-fidelity-*.json`, clasificar mismatches A–E, refinar parsers (Parma `<br>` labels, Legge ic02 judgment multi-párrafo, ctext HTML fallback). **Sin remediar textos de producto** hasta go del usuario.

---

*Auditoría abierta 2026-06-21. Supersedes el veredicto “100% accurate” de DATA_INTEGRITY_AUDIT (2026-05-10) hasta completar Fase 2.*
