# INC: Pérdida local de tools/ y reports/ tras el untrack — restauración y estrategia de backup
**Código:** `20260711-INC-OPS-01 local-assets-loss-and-backup` · **Familia:** OPS · **Estado:** closed

## Resumen

El 2026-07-04 se sacaron `tools/` y `reports/` de git (`git rm -r --cached`,
commit `732c40b1`) para reducir el peso del repo; los archivos quedaron solo en
el disco local, sin protección de git. Entre esa fecha y el 2026-07-11 algo
eliminó del disco la mayoría de esos archivos (probable `git clean` o limpieza
manual). Detectado el 2026-07-11 cuando `npm run dev` falló con ENOENT sobre
`tools/datasets/wilhelm-de/book-one/wilhelm-de-64hex-merged.json` — la fuente
upstream del corpus Wilhelm 1924 con toda la remediación W-08.

## Alcance de la pérdida (local únicamente)

| Ruta | Trackeados pre-untrack | En disco al detectar |
|------|------------------------|----------------------|
| `tools/` (trackeados) | 387 | 57 faltantes → luego 330 más detectados |
| `reports/` | 261 | 0 |

Nada se perdió de forma permanente: el commit padre del untrack (`40b3fd98`)
conservaba todo en el historial.

## Restauración (2026-07-11)

1. `git checkout 732c40b1~1 -- tools/datasets` + resto de faltantes + `reports/`.
2. Verificación de integridad: `npm run build:data` con las fuentes restauradas
   reproduce **byte a byte** los JSONs generados committeados (solo difiere
   `generatedAt`) → el snapshot incluye toda la remediación W-08.
3. Verificación de completitud: 0 archivos faltantes contra
   `git ls-tree 732c40b1~1 -- tools reports`.

## Hallazgos de la verificación final (2026-07-11, segunda pasada)

1. **ZIP v1 malformado.** El primer ZIP (creado con `tar -a`, bsdtar/Windows)
   tenía el directorio central corrupto: Python/Explorer/Drive solo veían 12
   entradas de un XLSX interno. Los datos estaban (bsdtar streaming leía
   10 424 entradas) pero un backup que exige herramientas no estándar no es
   backup. **Regenerado como `iching-git-backup-2026-07-11-v2.zip`** (zipfile
   estándar, 8 897 archivos, test de corrupción OK, 648 MB). El v1 subido a
   Drive debe reemplazarse. Regla: verificar SIEMPRE el archivo con una
   herramienta distinta a la que lo creó antes de declararlo backup.
2. **6 libros fuente perdidos (no recuperables de git).** `tools/source-pdfs/`
   perdió en la misma limpieza local los libros que el manifest v2 cataloga y
   que NUNCA estuvieron en git (gitignored, solo el manifest se commitea):
   - `wilhelm-baynes-1950-pantheon.pdf` (gold Apéndice I — casting audits)
   - `16_ The Sacred Books of China, vol 2… (Legge SBE XVI).pdf`
   - `legge-yi-king-sbe-xvi.pdf` (legacy)
   - `zhouyi-zhushu-song-er07.pdf`
   - `Introduction To The Study Of The Classic Of Change (Zhu Xi/Adler).epub`
   - `The Complete I Ching 10th Anniversary (Alfred Huang).epub`
   Consecuencia: `npm run verify:hexagram-fidelity` (gate PDF-gold local) queda
   sin fuentes. **No es bloqueante:** el usuario confirma (2026-07-11) que la
   validación campo-a-campo contra los libros ya se completó vía Claude API y
   los datasets master están validados y congelados; los libros fuente ya no
   son necesarios para operar ni releasear. El usuario conserva copias propias
   de los libros. El gate PDF-gold local queda como herramienta histórica; si
   se quisiera re-ejecutar, reponer las fuentes desde esas copias.

## Verificación final ejecutada

- Hash por archivo disco vs git pre-untrack: 648/648 OK.
- Hash por archivo disco vs rama backup: 2 784/2 784 OK; rama confirmada en
  origin (`c02f7566`).
- Corpus generado reproduce byte a byte desde datasets restaurados.
- ZIP v2 verificado con zipfile estándar (test corrupción + conteo + merged.json).

## Estrategia de backup adoptada

1. **Rama huérfana `backup/local-assets-2026-07-11`** (pusheada a origin):
   solo lo irremplazable (~170 MB) — `tools/datasets/`, `manual-gold/`,
   `source-pdfs/`, `output/{fidelity-gold,archive,legge-raw,zhuxi-32charts}`,
   scripts `tools/*.mjs`, `reports/` completo. Excluye regenerables
   (`fallback-tools/output` ya en R2; `output/zhouyi-64hex-master` regenerable;
   `node_modules`). Ver `BACKUP-README.md` en esa rama.
2. **ZIP completo offline** (648 MB, incluye los regenerables):
   `iching-git-backup-2026-07-11-v2.zip` → Drive del usuario (el v1 de 757 MB
   está malformado — descartar).
3. Los 6 libros fuente de `tools/source-pdfs/` NO se reponen (hallazgo 2): los
   datasets master ya están validados y congelados; el usuario conserva copias
   propias. No se requiere ZIP v3.

## Reglas derivadas (obligatorias)

- **NUNCA reescribir el historial de git (F5-08 / BFG) sin confirmar antes que
  la rama `backup/*` y el ZIP offline existen y están íntegros.** La rama
  backup debe re-pushearse tras cualquier rewrite.
- Tras editar fuentes en `tools/datasets/` (p. ej. remediaciones tipo W-08),
  actualizar la rama backup con un nuevo commit o crear una rama backup nueva
  con fecha.
- Precaución operativa: al cambiar entre staging y ramas `backup/*`, usar
  `git checkout -f` destruye los archivos trackeados-solo-en-backup del árbol
  de trabajo; restaurarlos después con
  `git checkout backup/<rama> -- tools reports` + `git restore --staged`.

## Relacionados

- `20260704-AUD-FABLE5-01 full-repo-audit` (F5-08: peso de .git / rewrite pendiente)
- `20260701-EXT-DAT-W-08` (remediación cuyo output vive en estas fuentes)
