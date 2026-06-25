# Documentation (`docs/`)

Punto de entrada a la documentación interna del monorepo.

| Recurso | Descripción |
|---------|-------------|
| [`workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md`](./workflows/00000000-WF-DOC-02-mandatory-doc-qa-registration.md) | **Reglas obligatorias** al crear docs/tests |
| [`INDEX.md`](./INDEX.md) | Índice maestro (runbooks, planes, workflows, setup, ops) |
| [`CONVENTIONS.md`](./CONVENTIONS.md) | Codificación unificada y redirects legacy |
| [`registry.json`](./registry.json) | Registro machine-readable de `docs/` (excl. sub-índices completos) |
| [`auditorias/`](./auditorias/) | Auditorías, incidentes, gates — [`INDEX.md`](./auditorias/INDEX.md) |
| [`qa/`](./qa/) | Tests Vitest y harnesses — [`INDEX.md`](./qa/INDEX.md) |

Validación: `npm run verify:qa-registry`
