# Guía para actualizar docs de usuario (FAQ, guía, notas, tour, audits)

Documento operativo para cualquier cambio de copy explicativa de cara al usuario:
`faq-page-ui.ts`, `guia-page-ui.ts`, `notes-page-ui.ts`, `home-tour-ui.ts`, `audits-page-ui.ts` y
equivalentes. No cubre `privacy-page-ui.ts` / `terms-page-ui.ts` (esos requieren revisión legal,
no solo de producto).

Para **agregar un idioma nuevo**, usa [`I18N_GUIDE.md`](./I18N_GUIDE.md). Esta guía es sobre
**qué decir y cómo verificarlo**, no sobre la mecánica de añadir un locale.

Nace de una sesión de remediación (24 jun 2026) donde varias entradas de FAQ tenían los problemas
que esta guía existe para prevenir — ver §4 con los casos reales.

---

## 1. Antes de escribir una palabra

- [ ] Lee el archivo `id`/entrada actual completa en **EN y ES** con `Read` o `grep -n`, no asumas
  el contenido por el nombre de la clave. Varias entradas de este proyecto tenían el nombre
  correcto pero el contenido equivocado.
- [ ] **La pregunta y la respuesta deben tratar el mismo tema.** Verifícalo explícitamente: si la
  pregunta dice "¿Cuáles son los tres traductores?" la respuesta no puede hablar de packs/tiers.
  Esto pasó en `translators-tiers` (la pregunta era sobre traductores, la respuesta sobre packs) —
  ahora son dos FAQs separadas: `translators-three` (solo traductores) y `tier-features` (solo qué
  incluye cada pack, sin precios).
- [ ] **No dupliques ángulos ya cubiertos.** Antes de crear una FAQ nueva, busca si el ángulo ya
  está cubierto en otra entrada (`grep -n "id:" packages/i18n/src/messages/faq-page-ui.ts`) y
  decide extender esa en vez de crear una redundante. Ejemplo: el comentario clásico de
  Biblioteca ya estaba cubierto por `library-unlock`, `library-source-language` y
  `zhouyi-no-commentary` — no hizo falta una cuarta FAQ, solo extender `/guia`.
- [ ] **Calibra el nivel de detalle al canal.** Un FAQ es un resumen breve y coherente, no la
  documentación técnica completa. El lector puede ir a `/audits` o a la fuente primaria y
  comparar por su cuenta. No pegues ahí jerga de auditoría interna (`Tier-0`, `gates`, fechas de
  "última auditoría") ni un desglose caso por caso de 10 líneas — eso pertenece a
  `docs/auditorias/*.md` o a `/audits`, no a `/faqs`.

---

## 2. Citar fuentes: nunca "PDF", siempre la edición real

"PDF" no es una fuente — es un formato de archivo. Cualquier afirmación de fiabilidad/fidelidad
debe citar **autor, título, editorial y año** de la edición real consultada. Tabla de referencia
(ya verificada y usada en el motor — no inventar variantes):

| Fuente | Cita completa |
|--------|----------------|
| Wilhelm/Baynes | Richard Wilhelm (alemán) y Cary F. Baynes (inglés), *The I Ching or Book of Changes*, Bollingen Series XIX, Princeton University Press, 1950 |
| Legge | James Legge, *The Yi King*, en *The Sacred Books of the East*, vol. XVI, Oxford, 1882 |
| Zhou Yi | Texto clásico en chino, Chinese Text Project (ctext.org) |
| Huang | Alfred Huang, *The Complete I Ching* (10th Anniversary Edition, 2010; publicado originalmente en 1998) |
| Zhu Xi / Adler | Zhu Xi, *Yixue Qimeng* (易學啟蒙), traducido por Joseph A. Adler como *Introduction to the Study of the Classic of Change* (I-hsüeh ch'i-meng), Global Scholarly Publications, 2002 |

Fuente original de esta tabla y de otras citas bibliográficas del proyecto (Shaughnessy, Rutt,
Nielsen, etc.): [`docs/auditorias/DIVINATION_METHODS_AUDIT.md`](../auditorias/DIVINATION_METHODS_AUDIT.md).
Detalle de extracción y folios exactos: `ICHING_TRANSLATOR_DATA_FIDELITY_AUDIT_2026-06-21.md`,
`MUTATION_RULES_PDF_GOLD_AUDIT_2026-06-22.md`.

**Define "fiabilidad" explícitamente cuando el copy lo mencione**, no asumas que el lector sabe a
qué te refieres: significa que el texto que ve (Juicio/Imagen/líneas) nunca lo escribe ni lo altera
la IA, es una cita directa verificada contra la edición publicada con nombre propio. Recién después
de definirlo, cita las fuentes — no al revés.

---

## 3. Pasos obligatorios de i18n (no negociables)

1. Escribe primero **EN y ES** con cuidado — son los que más se revisan a mano.
2. Traduce a los 11 locales (`SUPPORTED_LOCALES` en `packages/i18n/src/locales.ts`). Los títulos de
   libros y nombres propios (Wilhelm, Baynes, Legge, Zhou Yi, Huang, Zhu Xi, Adler, y los títulos
   en inglés de las obras citadas) **no se traducen** en ningún locale — son citas bibliográficas
   reales, igual que no traducirías el título de un libro citado en una nota al pie.
3. Antes de escribir una traducción nueva, `grep` el mismo archivo por cómo ya se tradujo ese
   concepto en otra entrada del mismo locale (p. ej. "Diez Alas"/"Ten Wings", "Gran Simbolismo")
   para no introducir una segunda traducción distinta del mismo término.
4. **Cero guion medio (—) ni guion corto (–)** en ningún locale. Verificar con
   `grep -c "—" <archivo>` y `grep -c "–" <archivo>` → debe dar `0`. Es una convención del proyecto
   contra puntuación que delata redacción de IA.
5. Cero muletillas de redacción IA en inglés (`leverage`, `seamless`, `delve`, `tapestry`,
   `moreover`, `furthermore`, `it's worth noting`, etc.) — grep rápido antes de comitear.
6. Si el contenido vive en un **array por locale** (`FAQ_ITEMS_EN`, `FAQ_ITEMS_ES`, …) en vez de un
   `Record<AppLocale, T>` con claves tipadas, **TypeScript no detecta** si un `id` queda
   desincronizado entre locales (un locale con el `id` viejo, otro con el nuevo). Esto pasó
   literalmente en esta sesión al renombrar `translators-tiers` → `translators-three`: 2 de 11
   locales quedaron actualizados y `tsc` no se quejó. Por eso `tools/i18n-audit.mjs` ahora incluye
   `scanFaqIdParity()`, que importa el `dist` compilado y compara el conjunto de `id` de
   `getFaqPageUiMessages(locale).items` entre los 11 locales — **debe pasar siempre**, ver §5.

---

## 4. Casos reales de esta sesión (24 jun 2026) — qué falló y por qué

| Problema | Dónde | Causa |
|----------|-------|-------|
| Cita vaga "Wilhelm/Baynes (PDF Pantheon)" en vez de la edición real | `data-reliability` | Se copió la abreviatura interna de auditoría en vez de la cita bibliográfica completa que el usuario final necesita |
| Pregunta sobre traductores respondida con tiers/precios | `translators-tiers` | La pregunta cambió de intención en una edición anterior y la respuesta nunca se actualizó para que coincidiera |
| Desglose caso-por-caso (0 a 6 líneas cambiantes, 9 viñetas) en una FAQ | `iching-mutation-rules` | Se trasladó documentación de ingeniería completa a un canal que solo necesitaba el resumen de los dos métodos |
| Falso FAIL en harness de QA (`line-reading-system-qa.mjs`) | `caseChecks()` | Un recordatorio "verify in transcript" se implementó como `issues.push(...)` incondicional — el harness lo contaba como fallo real para siempre, sin comparar nada |
| Hueco sin gate automático en Juicios del hexagrama transformado (casos Zhu Xi 3 líneas) | mismo harness | El check existente solo validaba con una regex laxa ("¿menciona transformación?"), no el texto literal de `primaryJudgment`/`transformedJudgment` |
| Segundo falso FAIL, esta vez en el propio fix del punto anterior | mismo harness + `smoke-literal-fidelity-2026-06-24.mjs` | El comparador literal nuevo (`text.includes(canonico.trim())`) no normalizaba el blockquote-por-línea que el modelo usa para Juicios/Imágenes con saltos de línea internos (Wilhelm); 10/20 llamadas reales fallaron con contenido 100% correcto, solo por formato. Fix: reutilizar `normalizeForVerbatimCompare` (la misma función del gate de producción H7), no reinventar la comparación |

Ver `docs/auditorias/LINE_READING_SYSTEM_ZHUXI_SELECTOR_AUDIT_2026-06-20.md` (Partes 12 y 13) y
`docs/auditorias/USER_FACING_DOCS_VS_IMPLEMENTATION_AUDIT_2026-06-22.md` (§12) para el detalle
completo de la remediación de cada fila.

**Lección reforzada por la Parte 13:** una verificación sintética de un comparador de citas solo es
confiable si el texto de prueba imita la *forma* real de la salida del modelo (blockquote `> *línea*`
por cada línea interna), no solo su contenido. Un texto canónico pegado tal cual, con `\n` crudos,
no expone defectos de normalización de markdown — pasa la prueba sintética y falla con la API real.
Antes de confiar en cualquier comparador de texto nuevo, reutiliza `normalizeForVerbatimCompare`
(`backend/claude/src/interpretation-judgment-image-gate.ts`, ya validada en producción vía el gate
H7) en vez de escribir una normalización propia desde cero.

---

## 5. Verificación (antes de comitear)

```bash
# 1. Rebuild del paquete i18n (obligatorio antes de typecheck en apps/web — dist puede estar stale)
cd packages/i18n && npx tsc && cd ../..

# 2. Typecheck
cd apps/web && npx tsc --noEmit && cd ../..

# 3. Lint de las páginas tocadas
cd apps/web && npx eslint src/app/<pagina>/page.tsx && cd ../..

# 4. Audit i18n — incluye paridad de ids de FAQ entre los 11 locales
npm run i18n:audit

# 5. Higiene de puntuación (debe dar 0 en ambos)
grep -c "—" packages/i18n/src/messages/<archivo>.ts
grep -c "–" packages/i18n/src/messages/<archivo>.ts
```

Si el cambio afecta a un test/harness de QA (no solo copy), verifica la lógica del propio test de
forma aislada antes de confiar en su resultado: aísla la función de validación, dale una entrada
sintética que sabes que es correcta y otra que sabes que es incorrecta, y confirma que el test
distingue entre ambas. Un test que falla siempre (o pasa siempre) sin importar el contenido no está
verificando nada — es exactamente el bug de §4.

---

## 6. Cuándo cerrar un audit doc

Si el cambio remedia hallazgos de un documento en `docs/auditorias/`:

- [ ] Marcar el checklist del documento como hecho (`[x]`)
- [ ] Cambiar el header de estado a `✅ Cerrada (FECHA)`
- [ ] Añadir una sección de cierre con qué se verificó y cómo (comandos reales, no solo "se probó")
- [ ] Actualizar la fila de estado en `docs/auditorias/README.md`

Convención de nombres y estados completa en
[`docs/auditorias/README.md`](../auditorias/README.md).
