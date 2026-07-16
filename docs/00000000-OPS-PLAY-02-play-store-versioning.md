# Ops: control de versiones para Play Store (correlativos)

**Código:** `00000000-OPS-PLAY-02 play-store-versioning` · **Familia:** MOB-PLAY · **Estado:** reference

Regla del proyecto, definida por el owner (2026-07-15). Este documento es la fuente de verdad del versionado de la app Android. Complementa a [`00000000-OPS-PLAY-01`](./00000000-OPS-PLAY-01-play-store-changelog.md) (changelog).

---

## 1. La regla: correlativo puro, NO semver

La versión visible (`version` en `apps/mobile/app.config.js`) tiene forma `X.Y.Z` y avanza **estrictamente de uno en uno**. Cada dígito va de 0 a 9, y **solo al finalizar un 9 se evoluciona el siguiente dígito**:

```
4.2.2 -> 4.2.3 -> 4.2.4 -> ... -> 4.2.9 -> 4.3.0 -> 4.3.1 -> ... -> 4.9.9 -> 5.0.0
```

- **NO se salta ningún número.** Después de 4.2.2 sigue 4.2.3, siempre, sin excepciones.
- **El tamaño o importancia del cambio NO influye.** Una migración mayor de SDK, un fix de una línea o un release de seguridad avanzan igual: +1 al último dígito. Las convenciones semver (minor para features, major para breaking changes) **no aplican** en este proyecto.
- La cadencia la marca el orden de releases, no el contenido.

### Antipatrón real que motivó este doc

El 2026-07-15, tras la migración a Expo SDK 57, se asignó `4.3.0` "por ser una migración grande" (hábito semver). **Incorrecto**: la última versión era `4.2.2`, por lo tanto la siguiente es `4.2.3`. El AAB 4.3.0/63 se descartó sin subirse y se regeneró como 4.2.3/63.

## 2. versionCode: monotónico, independiente de la cadena visible

- `versionCode` (en `app.config.js`) es un entero que **siempre sube de 1 en 1** respecto al último **subido a Play Console** (cualquier track: internal, closed, production).
- Play rechaza cualquier AAB con un versionCode ya usado en la consola. No hay excepciones ni reutilización una vez subido.
- **Un build que nunca se subió NO quema su versionCode** (se puede reutilizar en el build corregido, como se hizo con el 63).
- No hay relación matemática entre `version` y `versionCode`; solo avanzan juntos: cada release incrementa ambos.

## 3. Procedimiento por release (resumen operativo)

1. Determinar la versión siguiente: último release + 1 según la regla del punto 1 (consultar el tope de `CHANGELOG.md` o Play Console).
2. Determinar versionCode: último **subido** + 1.
3. Editar `apps/mobile/app.config.js` (`version` + `versionCode`).
4. `npm run changelog:update -- --version X.Y.Z --versionCode N --stage "<track>"`.
5. Commit juntos (`app.config.js` + `CHANGELOG.md`), push a staging, merge a main según flujo.
6. Build según destino (ver invariante en CLAUDE.md): AAB para Play vía EAS; APK de smoke SIEMPRE local.

## 4. Estado del correlativo (actualizar en cada release)

| Versión | versionCode | Track | Fecha | Nota |
|---|---|---|---|---|
| 4.2.2 | 62 | Production | 2026-07 | último release pre-SDK 57 |
| 4.2.3 | 63 | Internal Testing | 2026-07-16 | migración Expo SDK 57 / target API 36 (apunta a staging; SUBIDO: código 63 quemado; smoke completo OK) |
| 4.2.4 | 64 | Production | 2026-07-16 | release de producción SDK 57 (mismo código app que 4.2.3; apunta a producción) |
| (siguiente) | 65 | | | después de 4.2.4 sigue 4.2.5 |
