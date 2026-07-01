# Wilhelm DE 1924 — política de fidelidad y cita (APA 7)

**Código:** `20260630-AUD-DAT-W-04 wilhelm-de-fidelity-policy` · **Familia:** DAT-W · **Estado:** open

**Relacionado:** `20260628-AUD-DAT-W-02`, `20260629-PLAN-DAT-W-03`, `20260623-POL-DAT-MAESTRO-00`

## Decisión de producto

El traductor `wilhelm` en runtime muestra el **texto oracular literal en alemán** de la Erstausgabe 1924, con la misma lógica que **Zhou Yi** muestra el 文言文 clásico:

| Traductor | Idioma en blockquote / biblioteca | Fuente citada | ¿Parafrasear al idioma UI? |
|-----------|-----------------------------------|---------------|----------------------------|
| `zhouyi` | Chino clásico (原文) | Zhou Yi / ctext.org | No — solo la IA interpreta fuera del blockquote |
| `wilhelm` | Alemán (Wilhelm 1924) | Diederichs Erstausgabe | No — solo la IA interpreta fuera del blockquote |
| `legge` | Inglés (Legge 1882) | SBE XVI | No |

**No hay obligación de parecerse a Baynes (1950).** Baynes tradujo al inglés una obra distinta en otro momento editorial; queda **archivado solo para triangulación diagnóstica**, no como estándar de fidelidad del maestro alemán.

## Referencia APA 7 (fuente canónica)

Texto completo para auditorías, `/notes`, `/audits` y metadatos del dataset:

> Wilhelm, R. (1924). *I Ging: Das Buch der Wandlungen*. Eugen Diederichs Verlag.

| Campo | Valor |
|-------|--------|
| Autor | Richard Wilhelm (1873–1930) |
| Año | 1924 (Erstausgabe) |
| Editorial | Eugen Diederichs Verlag, Köln |
| Dominio público | Sí (EE. UU.: publicación 1924; autor f. 1930) |
| **No citar como fuente** | zeno.org, Baynes 1950, mirrors web |

Ingesta Zeno (`/Philosophie/M/Anonym/I+Ging+-+Buch+der+Wandlungen`) es **mirror de extracción** únicamente; la cita de producto es siempre el libro impreso anterior.

## Qué validamos (y qué no)

### Sí — gates de fidelidad Wilhelm DE

| Gate | Comando | Pregunta que responde |
|------|---------|------------------------|
| Extracción completa | `extract:wilhelm-de-from-zeno:all` | ¿Los 514 slots oráculo/comentario inline tienen texto? |
| Contaminación | `audit:wilhelm-de-contamination` | ¿Hay comentario, footer o ruido en slots oráculo? |
| AU campo a campo | Gold TSV + PDF físico local | ¿Cada línea coincide con el libro 1924? |
| Gold oráculo | `verify:hexagram-fidelity:wilhelm-de` | ¿514/514 vs gold merged/PDF? |

### No — descartado como gate de fidelidad

| Enfoque | Motivo |
|---------|--------|
| MT DE→EN vs Baynes | Mide proximidad a **otra traducción**, no fidelidad al alemán |
| `% match` estructural EN↔DE | Baynes omite `Bemerkung`, intros más cortas, títulos distintos |
| Alinear títulos `nombre` con Baynes | Son traducciones de hanzi distintas por diseño |

## Contenido válido en el maestro alemán (no es “contaminación”)

Estos bloques **pertenecen al libro Wilhelm 1924** aunque Baynes no los tenga:

- **`Bemerkung:`** en intro o comentario de línea (p. ej. hex 54 — costumbre matrimonial china).
- **Intro Erstes Buch** con cabecera hex + trigramas + «Das Zeichen…» (maquetación del volumen I).
- **Comentario inline Wilhelm** en `*_comentario` (libro I, no Ten Wings).

Solo se marca **contaminación** si ese material aparece en **`*_oraculo`** o si hay footers (`Buchempfehlung`, paginación).

Resultado auditoría contaminación (2026-06-30, extract Zeno):

- **0** slots oráculo contaminados
- **12** `de_book_extra` (editorial Wilhelm válido)
- **55** `review` en `intro` (layout DE más largo que Baynes — esperado)

## Implementación en código

| Artefacto | Rol |
|-----------|-----|
| `WILHELM_DE_PRIMARY_SOURCE` en `wilhelm-de-dataset-paths.mjs` | Cita APA + metadatos ingest |
| `interpretation.ts` | Blockquotes Wilhelm en alemán literal |
| `hexagrams.wilhelm.json` (post-AU) | Bundle runtime desde maestro DE |
| `tools/datasets/wilhelm-baynes/` | Archivo diagnóstico — no promover a runtime |

## Próximo paso AU

1. Cerrar gold TSV 64×33 contra PDF físico `tools/source-pdfs/W german/`.
2. Promover `wilhelm-de-64hex-merged.json` solo tras AU humana.
3. Entrada `/audits` (WF-DOC-03): fuente `wilhelmDiederichs1924`, método ingest Zeno + PDF arbiter, estándar **libro 1924**, no Baynes.
