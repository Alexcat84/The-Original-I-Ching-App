# Plan de cierre total — pendientes de fondo del repo

**Código:** `20260716-PLAN-SEC-02 cierre-total` · **Familia:** SEC · **Estado:** open
**Fecha:** 2026-07-16 · **Objetivo:** cerrar todo lo que queda de las auditorías (EXT-SEC-02 P2/P3, GATE-SEC-01, PLAN-SUP-02) para dejar el proyecto sin deudas de fondo, implementado y probado.
**Verificado contra main (`146bdad9`)** antes de escribir: cada ítem confirmado o corregido contra el repo real.
**Naturaleza:** plan de auditoría externa, transcrito sin alterar contenido (solo codificación).

> **Nota de estado al registrar (2026-07-17):** el plan fue escrito contra un main previo al cierre de los P1. El **Ticket 0 ya está completo** al momento del registro: PR #9 mergeado 2026-07-17T02:14Z, PR #8 (con la corrección del bloque `dependencies`) mergeado 02:17Z, EXT-SEC-02 actualizado a `closed` con nota de cierre. Los demás tickets se ejecutan en el orden del plan.

Ordenado por lo que de verdad importa, no por número. Cada ticket es independiente y va con su gate de verificación. Invariantes de siempre: npm@10.9.2, lockfile sin editar a mano, sin `--legacy-peer-deps`, `resolution-guard` verde, nada se mergea sin verificación.

## Ticket 0 — PRIMERO: cerrar los dos P1 ✅ COMPLETADO (pre-registro)

1. **PR #8 (CVEs):** corrección aplicada (bloque `dependencies { ws }` removido vía npm uninstall; override solo produce el mismo árbol; gates reconfirmados) y mergeado.
2. **PR #9 (RLS):** mergeado con `rls-test` en `continue-on-error`; primer 9/9 y criterio del flip registrados en GATE-SEC-01.
3. EXT-SEC-02: los dos P1 cerrados con referencia a los PRs (incluida la corrección posterior del registro de las 6 moderate: 1 real postcss + 5 ecos transitivos, se cierran con Next 16).

---

## Ticket 1 — Rama `backup/local-assets` — HECHO (2026-07-17: Alexis borró backup/local-assets-2026-07-11)

**Contexto.** La rama `backup/local-assets-2026-07-11` contiene obras de terceros con copyright vigente (EPUBs de Wilhelm/Baynes-Bollingen 2011, Zhu Xi/Adler, y un PDF de Shang History; el Legge es dominio público).

**Decisión de Alexis (2026-07-16):** el repo es público de forma temporal y deliberada, solo para dar acceso de auditoría, y vuelve a privado al terminar este trabajo. Con esa ventana acotada, el riesgo es bajo y **este ticket NO es prioritario ni bloqueante**. Se registra la decisión, no se escala.

**Acción sugerida (opcional, 10 segundos, no bloquea nada):**
```bash
git push origin --delete backup/local-assets-2026-07-11
```
La rama no se necesita para el trabajo en curso (la auditoría externa solo lee `main` y ramas de feature). Borrarla cierra la ventana antes en vez de dejarla depender de acordarse de volver el repo privado. Si se prefiere dejarla y cerrar todo de una al volver a privado, es un juicio de riesgo válido.

**Matiz de hecho, para la decisión informada:** los repos públicos de GitHub se rastrean automáticamente (buscadores de código, scrapers, servicios de archivo), así que la exposición no depende de que un humano navegue al repo. La consecuencia práctica para tres EPUBs en una rama de backup durante unos días sigue siendo pequeña; el dato es para calibrar, no para alarmar.

**Si se borra:** verificar que los blobs no vivan también en la historia de `main` (`git log --all --oneline -- "tools/source-pdfs/*"`). Si solo están en la rama backup, borrarla basta. Si aparecieran en main, eso sería una decisión aparte (reescritura de historia), fuera del alcance de este plan.

**Cierra:** el ítem "revisar rama backup" de EXT-SEC-02.

---

## Ticket 2 — Branch protection en `main` — NO APLICABLE (cerrado 2026-07-17)

Los checks bloqueantes (`ci`, `resolution-guard`) ya existen pero sin branch protection pintan rojo sin impedir el merge administrativo. Ahora que hay dos gates de seguridad más entrando (`rls-test` tras su flip), vale cerrar el enforcement.

**RESULTADO (2026-07-17): NO APLICABLE en el plan actual.** El comando devolvió **403**: "Upgrade to GitHub Pro or make this repository public to enable this feature". Causa verificada: el repo volvió a **privado** y la cuenta es **GitHub Free**; las ramas protegidas están disponibles en repos públicos con Free, y en privados solo con Pro/Team/Enterprise. Los **rulesets NO son workaround** (misma restricción de plan). **Valor real perdido = marginal:** la config acordada llevaba `enforce_admins: false` y Alexis es el único admin, así que podría saltarse la protección igual; **los tres gates (`ci`, `resolution-guard`, `rls-test`) siguen corriendo y pintando rojo en cada PR**, que es donde está el grueso del valor. **Condición de reevaluación:** si entra un colaborador con write, o si se compra GitHub Pro. El comando queda registrado abajo para ese momento.

**Comando para cuando aplique (repo público o plan Pro), ahora con los 3 contexts (rls-test ya bloqueante):**
```bash
gh api -X PUT repos/Alexcat84/The-Original-I-Ching-App/branches/main/protection --input - <<'JSON'
{
  "required_status_checks": { "strict": false, "contexts": ["ci", "resolution-guard", "rls-test"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
JSON
```
`enforce_admins: false` a propósito: conserva el escape ante un rojo falso de red. Sin reviewers obligatorios: self-merge tras verde.

**Verificación:** abrir un PR trivial, confirmar que `ci` y `resolution-guard` aparecen como required y que el merge se habilita solo con ambos verdes. Añadir `rls-test` a los contexts DESPUÉS de su flip a bloqueante (Ticket 4), no antes.

---

## Ticket 3 — Deuda de replayabilidad de migraciones (PLAN-SUP-02)

**Rama:** `chore/migrations-replayable`

**Pasos (nuevas migraciones 075+, JAMÁS editar aplicadas sin la verificación de PLAN-SUP-02):**
1. Hacer la 037 condicional: patrón de la 053 — si el usuario owner no existe, `RAISE NOTICE` y skip, no fallo.
2. Guards de `pg_cron` en 064 y 065 (patrón 053). Si la mecánica exige editar archivos aplicados, documentar por qué.
3. Con eso, el gate RLS puede quitar el preludio `000_ci_enable_pg_cron` y la exclusión de la 037. Criterio de éxito: replay limpio de la cadena completa en base vacía.
4. Actualizar `verify_migrations.sql` en el MISMO commit.

**Gate:** replay completo en base vacía (sin preludio ni exclusión) — verde; `rls-test` de CI verde con staging simplificado.

**Verificación externa:** migraciones nuevas no editan aplicadas (o la edición está justificada), `verify_migrations.sql` cubre lo nuevo, replay sin exclusiones pasa.

---

## Ticket 4 — Flip del `rls-test` a bloqueante (cierre de GATE-SEC-01)

Tras acumular 3-5 corridas verdes de `rls-test` en main después del merge del PR #9. El pin de la CLI (2.109.1) ya mitiga el flakiness.

**Pasos:** quitar `continue-on-error: true` del job (patrón del flip del `resolution-guard`, PR #6). Registrar en GATE-SEC-01 la fecha del flip. Después, añadir `rls-test` a los required contexts de branch protection (Ticket 2).

**Verificación:** un PR con un cambio que rompa deliberadamente una policy RLS (rama descartable) debe poner el check en rojo. Probar el bloqueo una vez valida que el gate muerde.

---

## Ticket 5 — Higiene de bajo riesgo (EXT-SEC-02 P3, agrupados en un commit)

**Rama:** `chore/repo-hygiene`

1. **`.gitignore` para caches de asistentes IA.** Verificado: `.continue/`, `.qwen/`, `.windsurf/` solo contienen reglas y permisos, cero credenciales. Acción: añadir `.cache/` y los `*.orig` a `.gitignore`. Los dirs de reglas pueden quedarse versionados.
2. **Ramas stale.** Borrar las remotas ya mergeadas (listar con `git branch -r --merged origin/main`, revisar, borrar las confirmadas). Excluir `backup/*` (Ticket 1, decisión aparte).
3. **Peso del repo (560 MB).** NO reescribir historia de un repo público por esto. Dejar como está; solo evitar binarios nuevos grandes. Documentar la decisión de no actuar.

**Ítem retirado de la lista original:** "mover el anon key de Supabase a env" — verificado que ya se lee de `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`; la nota P3 estaba desactualizada. Nada que hacer.

**Verificación:** ramas remotas solo activas; `.gitignore` cubre los caches; CI verde.

---

## Orden de ejecución

1. **Ticket 0** ✅ completado pre-registro.
2. **Ticket 3 (migraciones replayable)** — el de más trabajo.
3. **Ticket 5 (higiene)** — commit único, rápido.
4. **Ticket 4 (flip rls-test)** — tras 3-5 corridas verdes en main.
5. **Ticket 2 (branch protection)** — último, cuando `rls-test` ya sea bloqueante. Acción de Alexis.
6. **Ticket 1 (rama backup)** — opcional; o se resuelve al volver el repo a privado.

## Nota sobre el cierre de la ventana de auditoría

El repo vuelve a privado al terminar este trabajo. El acceso directo del auditor a git termina con ello y el bucle vuelve a diffs/reportes pegados (más lento y dependiente de la fidelidad del reporte; el historial de este ciclo tiene un caso de "pushed" anunciado sin commit real). Conviene **agotar la cola de verificación externa mientras el repo siga público**.

## Estado final esperado

Cero deudas de fondo: tres gates bloqueantes y probados (resolution-guard, rls-test, branch protection); cadena de migraciones replayable sin parches; repo público sin material con copyright de terceros; cola de auditoría cerrada. El único frente grande vivo: Next 16.

## Restricciones (todos los tickets)
- npm@10.9.2. Lockfile sin editar a mano. Sin `--legacy-peer-deps`. `resolution-guard` verde.
- Migraciones: solo nuevas (075+), jamás editar aplicadas sin la verificación de PLAN-SUP-02; `verify_migrations.sql` en el mismo commit.
- No `apps/mobile` fuera de su gate. No mergear sin verificación externa.
- Cada ticket, su rama, su PR, su verificación antes de merge.
