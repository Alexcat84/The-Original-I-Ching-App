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

## Estrategia de backup adoptada

1. **Rama huérfana `backup/local-assets-2026-07-11`** (pusheada a origin):
   solo lo irremplazable (~170 MB) — `tools/datasets/`, `manual-gold/`,
   `source-pdfs/`, `output/{fidelity-gold,archive,legge-raw,zhuxi-32charts}`,
   scripts `tools/*.mjs`, `reports/` completo. Excluye regenerables
   (`fallback-tools/output` ya en R2; `output/zhouyi-64hex-master` regenerable;
   `node_modules`). Ver `BACKUP-README.md` en esa rama.
2. **ZIP completo offline** (757 MB, incluye los regenerables):
   `iching-git-backup-2026-07-11.zip` → Drive del usuario.

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
