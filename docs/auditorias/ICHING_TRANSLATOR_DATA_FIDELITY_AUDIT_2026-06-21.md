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
| Wilhelm | 18 | lines 1–5 | **D/E — refutado** | **Falso positivo:** bundle `main` correcto (L1 padre, L2 madre); swap está en **parser gold Parma**, no en producto. **No hotfix.** |
| Wilhelm | 2 | yongLiu | **B — por verificar** | Texto distinto: gold «Lasting perseverance…» vs bundle «Perseverance furthers.» — confirmar contra fuente antes de tocar |
| Wilhelm | 27, 62 | judgment | **C** (histórico) | Comentario Wilhelm embebido — el harness Parma extrae solo oracle; el bundle incluye bleed (match parcial por prefijo) |
| Legge | 2, 4, 5… | judgment/image | **B + gap ingest** | `Khwan` vs `Khwăn`, entidades HTML sin decodificar en gold parser; bundle desde **Baharna** ≠ Sacred Texts |
| Legge | 7–64 (muestra) | judgment | **E→resuelto** | Judgment multi-párrafo en ic07+ — parser harness corregido; 18 missing gold residuales (icap2 hex partido, ic08 líneas «In the…») |
| Zhou Yi | 14 | line 2 | **A — crítico** | Bundle tiene **爻辞 de hex 13** (`同人於宗，吝。`) donde gold ctext espera `大車以載…` |
| Zhou Yi | 19 | lines 1–2 | **A** | `咸→鹹` en `鹹臨` (omitido en primera pasada interna; confirmado por auditoría externa) |
| Zhou Yi | 31 | judgment + lines | **A** | Glifo **鹹** (salado) sustituye **咸** (influencia) en todo el hex; prefijos `，` corruptos en líneas |
| Zhou Yi | 44 | line 5 | **A** | Label duplicado en bundle: `九五：…` concatenado al texto |
| Zhou Yi | ~40 campos | varios | **B** | Variantes 简/繁 (`无/無`, `于/於`, `后/後`, `志/誌`) — freizl zh-TW vs ctext |

Las señales rojas de §5 preliminar (**hex 25 truncado, 27 Mencius, 62 hex 28**) quedan **subsumidas** en el reporte JSON; no invalidan la necesidad de remediación.

### Clasificación agregada (165 mismatches producto + 26 parser)

| Clase | Wilhelm | Legge | Zhou Yi | Acción recomendada |
|-------|--------:|------:|--------:|-------------------|
| **A** — error en bundle | ~4 (excl. hex 18) | ~0 corrupción (est.) | **5 hex** (13/14, 19, 31, 44) | Re-ingest desde gold |
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

**Gate Fase 2 (parcial):** reporte archivado ✅ · clasificación A–E en §5 ✅ · **P0 Zhou Yi cerrado por evidencia:** 5 hex (13/14, 19, 31, 44) vía `tools/scan-zhouyi-corruption.mjs`

### Fase 3 — Remediación ✅ implementada 2026-06-21

**Ingesters nuevos (gold-aligned):**

| Traductor | Script | Fuente primaria | Intermedio |
|-----------|--------|-----------------|------------|
| Zhou Yi | `tools/ingest-zhouyi-ctext.mjs` | ctext.org API + HTML 大象 | `scripts/iching_zhouyi_translation.mjs` |
| Wilhelm | `tools/ingest-wilhelm.mjs` | Parma mirror | `scripts/iching_wilhelm_translation.mjs` (solo oracle) |
| Legge | `tools/ingest-legge-sacred.mjs` | sacred-texts ic01–64 + icap2 | `scripts/iching_legge_translation.mjs` |

**Scripts npm (raíz):**

```bash
npm run ingest:zhouyi      # ctext → iching_zhouyi_translation.mjs
npm run ingest:wilhelm     # Parma → oracle fields en iching_wilhelm_translation.mjs
npm run ingest:legge       # sacred-texts → iching_legge_translation.mjs
npm run ingest:translations  # los tres en orden Zhou Yi → Wilhelm → Legge
npm run build:data         # scripts/build-hexagrams.mjs → packages/iching-data/src/generated/
```

Flags comunes: `--live` (refetch remoto; sin flag usa cache `tools/output/fidelity-gold/`).

**Fix parser Parma (hex 18):** regex de líneas ampliado a `(?:at|in) the beginning` — ver §12 y Fase 3b.

**Política merge (Wilhelm judgment/image):** Parma primero; si judgment vacío, **tier-2 Baynes** (`hexagram-fidelity-wilhelm-baynes-supplement.mjs`, hoy solo hex 56) y solo entonces fallback bundle previo. Líneas: siempre Parma.

**Zhou Yi:** reemplazo total desde ctext; normalización 繁 en ingest (`toCanonicalZhouYiText`).

**Deprecados como fuente primaria (cross-check only):**

- `tools/ingest-zhouyi.mjs` (freizl/yijing)
- `tools/ingest-legge.mjs` (baharna.com)
- adamblvck Wilhelm dataset (metadata estructural conservada; oracle refrescado desde Parma)

**Reporte post-remediación (Fase 3):** `reports/hexagram-fidelity-2026-06-21T19-27-17-467Z.{json,md}`

### Fase 3b — Parser gold + re-ingest ✅ 2026-06-21

**Reporte canónico:** `reports/hexagram-fidelity-2026-06-21T19-40-28-164Z.{json,md}`

| Traductor | Match % | Mismatch | Gate |
|-----------|--------:|---------:|------|
| **Zhou Yi** | **100%** (514/514) | 0 | `scan:zhouyi-corruption` = 0 ✅ |
| **Legge** | **100%** (513/513) | 0 | sacred-texts ic + icap2 ✅ |
| **Wilhelm** | **99.81%** (513/514) | 0 | 1 excepción documentada (hex 56) |

**Fixes parser aplicados:**

| Componente | Fix | Hex afectados |
|------------|-----|---------------|
| `hexagram-fidelity-parma.mjs` | Mapeo etiqueta→posición (1–6) en lugar de contador secuencial | 20, 21, 26, 52 (L6) |
| idem | `THE IMAGE.` con punto; imagen multi-párrafo hasta comentario | 38 |
| idem | `(?:at\|in) the beginning` | 18 (regresión) |
| `hexagram-fidelity-legge-sacred.mjs` | Thwan = primer `<p>` post-HEXAGRAM antes de línea 1 | 10, 12, 13, 28, 29, 35, 37, 44, 50, 52, 61 |
| idem | Líneas sin prefijo `N.`; `(To the subject of)`; `From the first`; `2 .`; `T he`; romano `I.` | 8, 39, 40, 41, 55, 60, 61 |
| idem | icap2: `</A>.?` opcional (hex 19 XIX sin punto) | 19 |
| idem | Entidades HTML Legge (`&icirc;`, `&ucirc;`, …) | ortografía vs bundle |
| `ingest-legge-sacred.mjs` | Solo sacred-texts (sin merge baharna) | paridad gold=bundle |
| `ingest-wilhelm.mjs` | Líneas siempre desde Parma (sin merge adamblvck en líneas) | alineación posiciones |

---

## 12. Investigación causa raíz — gaps pre-3b y excepción hex 56

### 12.1 Veredicto: ¿era imposible el 100%?

**No globalmente.** Tras Fase 3b:

- **Zhou Yi + Legge:** 100% alcanzable y **alcanzado** contra gold declarado (ctext / sacred-texts).
- **Wilhelm:** 100% contra el mirror Parma **no es alcanzable** sin fuente suplementaria — **1 campo** (hex 56 judgment) omite el bloque oracle canónico Baynes en el HTML de Parma.

Los gaps pre-3b **no eran** typos de una letra en masa: eran **bugs de parser** (≈95%) + **1 omisión estructural en la fuente gold** (≈5%).

### 12.2 Wilhelm — causas raíz (7 → 1 gap)

| Síntoma pre-3b | Causa raíz | Resolución |
|----------------|------------|------------|
| L6 vacío en gold (hex 20, 21, 26, 52) | Parser incrementaba posición 1…N por orden de aparición; Parma omite «in the fifth place» y salta a «at the top» | Mapeo semántico de etiqueta |
| image vacío (hex 38) | Encabezado `THE IMAGE.` con punto; parser exigía match exacto | Normalización de heading |
| image incompleto (hex 38) | Imagen oracle = 4 párrafos cortos; parser tomaba solo el primero | `extractImageOracle()` multi-párrafo |
| judgment vacío (hex 56) | **HTML Parma no contiene `THE JUDGMENT` ni el oracle breve Baynes** | Tier-2 Baynes supplement (Fase 3c §12.6) |

### 12.3 Legge — causas raíz (24 → 0 gap)

| Síntoma | Causa raíz | Resolución |
|---------|------------|------------|
| 9 judgments vacíos | Thwan no usa siempre `(represents)`; heurístico `looksLikeLeggeJudgment` fallaba | `findThwanJudgment()` |
| 6 mismatches | Parser elegía comentario de línea/nota al pie (párrafos 601+ chars con `has…success` embebido) | Thwan antes de línea 1; excluir comentario |
| 8 líneas vacías | Variantes HTML: sin `N.`, `From the first`, `(To the subject of)`, `2 .`, `3. .`, `T he`, `I.` romano | Regex ampliado |
| image hex 19 | icap2 `<FONT>XIX</FONT></A>` sin punto tras `</A>` (solo este hex en 64) | `\.?` en regex icap2 |

**Fuentes externas que confirman variabilidad HTML Legge (no corrupción de texto):**

- [sacred-texts icap2-1](https://www.sacred-texts.com/ich/icap2-1.htm) — hex XIX sin punto tras anchor (verificado en cache local).
- [baharna.com Legge 19](https://baharna.com/iching/legge/110000.htm) — misma edición Legge, markup distinto (confirma que baharna ≠ parser gold, no que el Thwan difiera).
- Legge *Introduction* Appendix II ([icintr03.htm](https://www.sacred-texts.com/ich/icintr03.htm)) — describe estructura «Great Symbolism» separada del Thwan; coherente con pipeline ic + icap2.

### 12.4 Excepción documentada — Wilhelm hex 56 (Lu / The Wanderer)

**Campo:** `judgment` · **Estado verify:** `missing_gold` (gold Parma vacío; bundle tiene texto).

**Hecho verificado en HTML Parma** (`tools/output/fidelity-gold/parma-wilhelm.html`):

- No existe sección `THE JUDGMENT`.
- No aparece la cadena oracle Baynes: *«The Wanderer. Success through smallness. Perseverance brings good fortune to the wanderer.»*
- El HTML salta de comentario introductorio trigramático a `THE IMAGE` / `THE LINES`.

**Cross-check mirrors digitales (misma omisión estructural):**

- [wisdomportal.com IChing-Wilhelm](https://www.wisdomportal.com/IChing/IChing-Wilhelm.html) — hex 56: mismo layout (intro + IMAGE, sin oracle breve separado). Usado como referencia por [ExtraJuiceMan/BookOfChanges](https://github.com/ExtraJuiceMan/BookOfChanges) para corregir typos adamblvck vs Parma.
- [harrywang/iching-book](https://github.com/harrywang/iching-book) — fuente Parma; issues de calidad OCR reconocidos upstream.

**Edición Princeton / Baynes (oracle presente):**

- [wengu Wilhelm hex 56](http://wengu.tartarie.com/wg/wengu.php?l=Yijing&no=56) — Judgment con oracle + comentario separados.
- [iching-online.com hex 56](https://www.iching-online.com/hexagrams/iching-hexagram-101100.html) — idem.
- [castiching.com hex 56](https://castiching.com/hexagrams/56-wanderer) — cita oracle Baynes estándar.

**Política producto (ingest, post-3c):**

- `ingest-wilhelm.mjs` → `resolveWilhelmJudgmentForIngest()`: Parma, luego tier-2 Baynes (§12.6), luego fallback previo.
- Contenido bundle hex 56 = oracle Baynes + primer párrafo comentario Wilhelm — alineado wengu / iching-online.

**Para 514/514 verify:** resuelto en Fase 3c con gold tier-2 documentado (Parma + Baynes supplement solo donde Parma omite oracle).

### 12.5 Gates finales Fase 3b

| Gate | Resultado |
|------|-----------|
| `npm run scan:zhouyi-corruption` | 0 ✅ |
| `npm run verify:hexagram-fidelity` Zhou Yi | 100% ✅ |
| idem Legge | 100% ✅ |
| idem Wilhelm vs Parma | 99.81% (1 excepción §12.4, cerrada en 3c) |
| `npm run build:data` | ✅ |

### 12.6 Fase 3c — gold tier-2 Baynes (hex 56 judgment)

**Decisión:** aceptar supplement tier-2 solo para el único campo donde Parma omite el oracle canónico Baynes.

| Artefacto | Ruta |
|-----------|------|
| Supplement module | `scripts/lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs` |
| Verify | `applyWilhelmBaynesSupplements()` en `verify-hexagram-fidelity.mjs` |
| Ingest | `resolveWilhelmJudgmentForIngest()` en `tools/ingest-wilhelm.mjs` |

**Texto tier-2 hex 56 judgment:** oracle Baynes (*The Wanderer. Success through smallness…*) + comentario Wilhelm (*WHEN A man is a wanderer…*) — cross-check wengu, iching-online, castiching; fuentes citadas en el módulo.

**Gates Fase 3c:**

| Gate | Resultado |
|------|-----------|
| `npm run ingest:wilhelm` | hex 56 `tier2_baynes` ✅ |
| `npm run verify:hexagram-fidelity` Wilhelm | **514/514 (100%)** ✅ |
| Zhou Yi + Legge | 100% (sin regresión) ✅ |
| Reporte | `reports/hexagram-fidelity-2026-06-21T19-45-04-900Z.json` |

**Gates Fase 3 (obsoletos post-3b):**

| Gate | Estado |
|------|--------|
| `npm run scan:zhouyi-corruption` = 0 | ✅ PASS |
| Zhou Yi verify 100% | ✅ PASS |
| Wilhelm/Legge ≥99.5% | ⏳ Pendiente mejoras parser gold (Fase 3b) |
| `npm run build:data` + bundles regenerados | ✅ |

**Regla ≥99.5% global:** cumplida los 3 traductores al **100%** post-Fase 3c (Wilhelm: Parma + tier-2 Baynes hex 56).

### Fase 4 — Alineación de claims legales/producto ✅ 2026-06-21

- `packages/i18n` → `notes-page-ui.ts`, `faq-page-ui.ts` (11 locales)
- `scripts/build-hexagrams.mjs` → `licenseNote` con fecha de auditoría + id de reporte
- `DATA_INTEGRITY_AUDIT.md` → apartado «Auditorías realizadas» (solo resultado final)
- `packages/iching-data/README.md` → fuentes gold reales del ingester

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
| Ingesters Fase 3 | `tools/ingest-zhouyi-ctext.mjs`, `tools/ingest-wilhelm.mjs`, `tools/ingest-legge-sacred.mjs` |
| Wilhelm tier-2 supplement (3c) | `scripts/lib/hexagram-fidelity-wilhelm-baynes-supplement.mjs` |
| Escáner Zhou Yi | `tools/scan-zhouyi-corruption.mjs` |
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

**Diagnóstico:** El bundle proviene de `adamblvck/iching-wilhelm-dataset`; el gold es Parma. La mayoría del texto coincide. **Hex 18 refutado** (auditoría externa + verificación bundle): el dato en producto es canónico; el mismatch venía del parser Parma. Resto: typos OCR puntuales, comentario Wilhelm en judgment (clase C).

**Fix puntual:** **no aplicar swap hex 18** (introduciría el bug). yongLiu hex 2 solo tras verificar fuente.

**Re-ingesta:** crear `tools/ingest-wilhelm.mjs` desde Parma **tras validar parser gold** (spot-check incluye hex 18). adamblvck queda cross-check.

**Beneficio:** ingest = gold → un solo pipeline; CI fidelity pasa al ~100% oracle; claims defendibles.

### Legge (~77% match vs sacred-texts)

**Diagnóstico:** El gap principal **no es calidad del scrape Baharna en abstracto**, sino **fuente distinta al gold declarado**. ~60+ mismatches son ortografía (`Khwan`/`Khwăn`, `Mang`/`Măng`) y formato de líneas (`In the first SIX` vs `The first SIX`). ~18 campos aún son límites del parser harness (no del bundle).

**Fix puntual:** normalizar entidades + diccionario de nombres Legge podría subir el % artificialmente **sin demostrar equivalencia Baharna ≡ Sacred Texts**.

**Re-ingesta:** crear `tools/ingest-legge-sacred.mjs` (ic + icap2, Wayback fallback), deprecar `tools/ingest-legge.mjs` (Baharna). Baharna solo triangulación.

**Beneficio:** alinea implementación con claim IST; elimina debate Baharna vs gold.

### Zhou Yi (~91% match vs ctext)

**Diagnóstico:** freizl/yijing zh-TW está **cerca** de ctext en ~90% de campos. El ~10% restante incluye:
- **~40 campos clase B** (variantes 简/繁, puntuación) — resoluble con política de normalización al ingest
- **~5 campos clase A críticos** en **5 hex** (13/14 cross-contam, **19**, 31, 44) — gate determinista `node tools/scan-zhouyi-corruption.mjs` = **0** post-remediación

**Re-ingesta (fix único acordado):** `tools/ingest-zhouyi-ctext.mjs` — API + HTML 大象, 繁 canónico, strip etiquetas. freizl solo cross-check. Hotfix manual hex-a-hex **desaconsejado** salvo P0 urgente pre-ingester.

**Beneficio:** fuente única ctext = claim actual; hex 1 (乾) ya demostró 100% match en 卦辭+爻辭+用九+大象 post-normalizer.

### Orden de ejecución propuesto (Fase 3)

1. **Zhou Yi** — menor volumen de texto, bugs A más graves (hex 14/31); re-ingest ctext da win rápido en integridad china.
2. **Wilhelm** — alto impacto producto EN; re-ingest Parma cierra gap claim vs implementación.
3. **Legge** — mayor esfuerzo de parsing HTML (64 ic + icap2), pero patrón ya probado en harness.

Tras cada re-ingest: `npm run build:data` → Zhou Yi: **`node tools/scan-zhouyi-corruption.mjs` exit 0**; luego `verify:hexagram-fidelity` (≥99.5% solo tras validar parser gold + política 繁/简).

### Cuándo sí un fix puntual

- Metadata estructural (trigramas, ya corregido hex 23).
- Ajustes **solo normalizer** (clase B masiva Zhou Yi) si se documenta política 繁/简 en README.
- **Prohibido:** hotfix Wilhelm hex 18; parches manuales masivos Legge “99 errores”.

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

**Fase 5** — CI gate permanente (`verify:hexagram-fidelity` en CI).

Reporte canónico: `reports/hexagram-fidelity-2026-06-21T20-26-09-152Z.json` · workflow: `npm run ingest:translations && npm run build:data`.

---

## 13. Fase 3d — Regresión encontrada en re-verificación y corregida (21 jun 2026, Claude Sonnet 4.6)

Tras el cierre de la Fase 3c (reporte `19-45-04-900Z`, claim "514/514 Wilhelm, 513/513 Legge, ambos 100%"), una re-verificación independiente —pedida explícitamente por el usuario tras notar que el cierre anterior daba por buena la auditoría sin re-ejecutar nada— encontró que esos números eran en parte un **falso positivo del propio harness**, no solo del producto.

### 13.1 — Los dos bugs del harness

1. **`textsMatch("", "") === true`** (`hexagram-fidelity-normalize.mjs`). Un campo vacío en el gold **y** vacío en el bundle se contaba como `match`. Esto enmascaraba que el re-ingest de la Fase 3 ("líneas Wilhelm siempre desde Parma, sin merge adamblvck") había **vaciado 5 líneas** que antes tenían texto correcto: hex 20 línea 5, hex 21 líneas 2 y 3, hex 26 línea 3, hex 52 línea 2. Confirmado leyendo el bundle generado directamente (no solo el reporte): esas 5 posiciones tenían `text: ""` en `hexagrams.wilhelm.json`, y el bundle previo a la Fase 3 (commit `2276c30`) tenía texto real en esas mismas posiciones.
2. **Matriz de Legge asimétrica respecto a Zhou Yi**: `compareLegge()` solo añadía `yongJiu`/`yongLiu` a la comparación `if (yongField && gold.supernumerary)` — si el parser gold no extraía nada, el campo se omitía **por completo** de la matriz (ni match, ni mismatch, ni missing). Por eso Legge totalizaba 513 campos y no 514 como los otros dos traductores. El campo `yongLiu` del hex 2 estaba completamente ausente (`undefined`, no `""`) en el bundle — y el texto **sí existe** en el HTML cacheado de sacred-texts (confirmado leyendo el HTML crudo), así que era puramente un bug de parser: `isNumberedLine()` exige que el párrafo empiece con "The first/second/…/sixth…", y el párrafo supernumerario empieza con "(The lines of this hexagram are all…)", por lo que nunca matcheaba; el fallback que sí lo captura para el hex 1 depende de la frase de cabecera "Explanation of the separate lines by the duke", ausente en la página individual del hex 2.

Ambos bugs se detectaron primero por una vía independiente del propio harness: `npx vitest run` en `packages/iching-data` (`src/index.test.ts`), que verifica invariantes absolutos (ningún campo oráculo vacío, `yongJiu`/`yongLiu` presentes en hex 1/2) sin depender de ninguna fuente gold. Ese test existe desde antes de la Fase 1 pero **no formaba parte de los gates documentados** de ninguna Fase — correrlo de inmediato habría detectado la regresión sin necesidad de leer bundles a mano.

### 13.2 — Remediación

| Componente | Cambio |
|---|---|
| `hexagram-fidelity-diff.mjs` (`makeDiff`) | Ambos lados vacíos → status `missing_gold` (nunca `match`); nuevo `hint: "both_empty"` |
| `verify-hexagram-fidelity.mjs` (`compareLegge`) | `yongJiu`/`yongLiu` entran a la matriz **incondicionalmente**, simétrico con `compareZhouYi` |
| `hexagram-fidelity-legge-sacred.mjs` (`parseLineEntries`) | Nueva `isSupernumeraryStatement()` que detecta el párrafo por su frase fija, independiente de `sawLinesSection`/`isNumberedLine` |
| `hexagram-fidelity-wilhelm-baynes-supplement.mjs` | Extendido de "solo `judgment`" a también `WILHELM_BAYNES_LINE_SUPPLEMENTS` (5 líneas), con `getWilhelmBaynesLineSupplement()` y `resolveWilhelmLineForIngest()` |
| `tools/ingest-wilhelm.mjs` | Las líneas usan ahora `resolveWilhelmLineForIngest()` (Parma → tier-2 Baynes → existente) — antes sobrescribían con `""` cuando Parma no tenía el dato, perdiendo el texto previo silenciosamente |
| `scripts/iching_wilhelm_translation.mjs` | Las 5 líneas restauradas manualmente desde el bundle previo a la Fase 3 (commit `2276c30`), única fuente disponible en esta sesión — los mirrors externos usados para el cross-check del hex 56 (wengu.tartarie.com) no respondieron (`ECONNREFUSED`) al intentar recontrastar |
| `tools/ingest-legge-sacred.mjs` / `iching_legge_translation.mjs` | Sin cambio de código — el fix del parser ya captura `yong_supernumerary` del hex 2 correctamente en el siguiente `npm run ingest:legge` |

**Diferencia de confianza explícita:** el judgment del hex 56 fue cross-checked en la Fase 3c contra 3 mirrors independientes (wengu, iching-online, castiching). Las 5 líneas de esta Fase 3d **no** se recontrastaron contra un mirror fresco (herramienta de fetch no disponible en esta sesión) — se restauraron desde el bundle previamente publicado (transcripción Wilhelm/Baynes 1950 vía `adamblvck/iching-wilhelm-dataset`). Esto se documenta así, explícitamente, en `hexagram-fidelity-wilhelm-baynes-supplement.mjs`, en `DATA_INTEGRITY_AUDIT.md` y en los claims de producto — no se presenta como del mismo nivel de verificación que el hex 56.

### 13.3 — Resultado final (re-verificado en vivo, no solo reportado)

| Gate | Resultado |
|---|---|
| `npm run verify:hexagram-fidelity` | **514/514, 514/514, 514/514** — los tres 100%, **0** diffs con `hint: "both_empty"` |
| `npm run scan:zhouyi-corruption` | 0 |
| `npx vitest run` (`packages/iching-data`) | **14/14 PASS** (antes: 2 fallos reales) |
| Escaneo manual de los 3 bundles completos (judgment/image/6 líneas/yong* × 64 hex × 3 traductores = 576 campos) | **0 campos vacíos** |

Reporte canónico actualizado: `reports/hexagram-fidelity-2026-06-21T20-26-09-152Z.json`. `licenseNote` de Wilhelm en `build-hexagrams.mjs` y claims de producto (`notes-page-ui.ts`, `faq-page-ui.ts`, 11 locales) actualizados de "1 suplemento (hex 56)" a "6 suplementos documentados" para reflejar el estado real.

### 13.4 — Lección para Fase 5 (CI gate)

El gate de CI planeado (`verify:hexagram-fidelity` contra snapshots hasheados) **debe incluir también** `npx vitest run` en `packages/iching-data` como verificación independiente — un harness de fidelidad que compara dos fuentes puede tener bugs que afectan a ambos lados de la comparación por igual; un test de invariantes absolutos sobre el producto final no depende de que el harness de comparación esté bien escrito.

---

*Auditoría abierta 2026-06-21. Fase 3 remediación 2026-06-21. Fase 3b parser gold 2026-06-21 (Legge+Zhou Yi 100%). Fase 3c tier-2 Baynes hex 56 → Wilhelm **514/514 (100%)**. Fase 3d (re-verificación independiente) → regresión real de 6 campos encontrada y corregida; los tres traductores **514/514 (100%) genuino**, confirmado por `index.test.ts` y por escaneo manual de los 576 campos, sin matches vacíos.*

---

## 14. Política book-primary · Fase PDF (2026-06-22)

**Rama:** `feat/pdf-gold-verification`  
**Decisión de producto (Alexis, 2026-06-22):** la **única fuente de verdad** para fidelidad 1:1 es el **libro físico** (PDF/EPUB local en `tools/source-pdfs/`). El dataset (`scripts/iching_*_translation.mjs` → `npm run build:data`) se compara **solo** contra el texto extraído de esa edición. **No más verificaciones contra fuentes secundarias web** ni inyección de suplementos desde mirrors.

### 14.1 — Qué queda obsoleto

| Componente | Estado | Motivo |
|------------|--------|--------|
| `npm run verify:hexagram-fidelity:mirrors-deprecated` | **OBSOLETO** | Comparaba bundle vs Parma / sacred-texts / ctext |
| `npm run ingest:wilhelm` (Parma → tier-2 Baynes inject) | **OBSOLETO** para producción | Sobrescribe desde mirror web + inyecta huecos |
| `npm run ingest:legge` (sacred-texts scrape) | **OBSOLETO** para producción | Gold debe ser EPUB Legge local |
| `npm run ingest:zhouyi` (ctext scrape) | **Vigente para Zhou Yi** | Gold operativo ctext.org; excepción a book-primary (PDF 注疏 = reserva académica) |
| `applyWilhelmBaynesSupplements()` / `resolveWilhelm*ForIngest()` | **Legacy** | Solo útil como histórico; no gate de CI |
| Claims “cross-verified vs Uni Parma / sacred-texts / ctext” | **Retirados** (Wilhelm actualizado) | Sustituidos por verificación contra edición impresa |

Los scripts legacy **permanecen en el repo** como referencia arqueológica y cross-check manual puntual, pero **no definen el gate de calidad** ni deben ejecutarse en el flujo normal de cierre de dataset.

### 14.2 — Gate canónico (vigente)

```bash
npm run pdf-gold:preflight          # PDF/EPUB locales presentes (manifest)
npm run extract:gold:wilhelm-pdf    # cache gold JSON desde PDF Pantheon
npm run build:data
npm run verify:hexagram-fidelity    # Wilhelm 513/513 vs libro (alias pdf-wilhelm)
```

**Flujo:** libro → parser gold → `compare(bundle, gold)` → corregir `iching_*_translation.mjs` → `build:data` → re-verify hasta 100%.

**Overrides foto-verificados** (`hexagram-fidelity-wilhelm-pdf-verified.mjs`): solo cuando `pdftotext` corrompe un pasaje; el texto sigue siendo del **mismo libro físico**, no de web.

### 14.3 — Wilhelm · cierre Fase PDF

| Campo | Detalle |
|-------|---------|
| **Edición gold** | Wilhelm/Baynes 1950, Pantheon (Bollingen XIX) — `wilhelm-baynes-1950-pantheon.pdf` |
| **Parser** | `scripts/lib/hexagram-fidelity-wilhelm-pdf.mjs` + OCR repairs + trim comentario Wilhelm |
| **Resultado** | **513/513 (100%)** — `reports/hexagram-fidelity-2026-06-22T01-52-32-542Z.json` |
| **Remediación** | Correcciones directas en `scripts/iching_wilhelm_translation.mjs` |

### 14.3b — Legge · cierre Fase PDF book-primary (2026-06-22)

| Campo | Detalle |
|-------|---------|
| **Edición gold** | James Legge, SBE XVI — escaneo Oxford PDF (manifest) |
| **Parser** | `hexagram-fidelity-legge-sbe-pdf.mjs` + OCR repairs + parches foto (`book-primary.mjs`) |
| **EPUB** | **No** en producción — solo `audit:legge-pdf-vs-epub` |
| **Sync** | `npm run sync:legge-oracle-from-pdf-gold` → `iching_legge_translation.mjs` |
| **Resultado** | **514/514 (100%)** — `reports/hexagram-fidelity-2026-06-22T23-23-50-099Z.json` |
| **Auditoría** | [`LEGGE_SBE_XVI_PDF_BOOK_PRIMARY_AUDIT_2026-06-22.md`](LEGGE_SBE_XVI_PDF_BOOK_PRIMARY_AUDIT_2026-06-22.md) |
| **Rama** | `fix/legge-pdf-fidelity-100` · commit `e8ba543` |

### 14.4 — Legge · histórico EPUB (obsoleto como gate)

| Campo | Detalle |
|-------|---------|
| **Edición** | EPUB sacred-texts re-pack |
| **Estado** | Superseded por PDF book-primary; conservar solo como cross-check |
| **Verify alterno** | `verify:hexagram-fidelity:epub-legge` |

### 14.5 — Próximas fases (mismo modelo)

| Traductor | Gold local | Formato | Estado |
|-----------|------------|---------|--------|
| **Legge** | SBE XVI Oxford PDF (manifest) + EPUB cross-check diagnóstico | pdf-ocr | **514/514 cerrado** · [`LEGGE_SBE_XVI_PDF_BOOK_PRIMARY_AUDIT_2026-06-22.md`](LEGGE_SBE_XVI_PDF_BOOK_PRIMARY_AUDIT_2026-06-22.md) |
| **Zhou Yi** | ctext.org (Chinese Text Project) | API + HTML 大象 | **514/514 cerrado** · `scan:zhouyi-corruption` + `check:hex-glyph-uniqueness` · PDF 注疏 local = futuro opcional |

### 14.6 — Comandos npm (post-2026-06-22)

| Comando | Rol |
|---------|-----|
| `verify:hexagram-fidelity` | Wilhelm PDF + Legge PDF (pendiente alinear alias default post-merge) |
| `verify:hexagram-fidelity:pdf-wilhelm` | Wilhelm vs Pantheon PDF |
| `verify:hexagram-fidelity:pdf-legge` | **Legge gate producción** — SBE XVI scan OCR + parches foto |
| `verify:hexagram-fidelity:epub-legge` | Legge vs EPUB (diagnóstico) |
| `extract:gold:legge-sbe-pdf` | OCR + JSON gold Legge SBE (sin EPUB por defecto) |
| `audit:legge-pdf-vs-epub` | Transparencia PDF vs EPUB |
| `verify:hexagram-fidelity:zhouyi-ctext` | Zhou Yi vs ctext.org (514/514) |
| `scan:zhouyi-corruption` | Gate corrupción Zhou Yi (咸→鹹, cross-hex, etc.) |
| `check:hex-glyph-uniqueness` | Nombres/glyphs únicos por hex 1–64 (biblioteca) |
| `verify:hexagram-fidelity:mirrors-deprecated` | Obsoleto para W/L — no usar en CI; Zhou Yi usa `verify:hexagram-fidelity:zhouyi-ctext` |

---

*Actualizado 2026-06-22 · Wilhelm PDF 513/513 · Legge PDF book-primary 514/514 (sin EPUB repair) · Zhou Yi ctext 514/514 · mirrors deprecated para W/L.*
