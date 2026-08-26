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
| 4.2.4 | 64 | Production | 2026-07-16 | release SDK 57 SUBIDO (64 quemado); bug conocido: descarga de imagen (fix en 4.2.5) |
| 4.2.5 | 65 | Production | 2026-07-16 | fix: import legacy de expo-media-library (descarga de imagen a galería) |
| (siguiente) | 66 | | | después de 4.2.5 sigue 4.2.6 |

---

## 5. Perfiles de EAS y de dónde sale el AAB de Play

Los nombres de los perfiles en `apps/mobile/eas.json` **no describen su entorno**, y esa es la trampa. Estado tras el 2026-08-26:

| Perfil | Tipo | `credentialsSource` | Entorno embebido |
|--------|------|---------------------|------------------|
| `staging-aab` | `app-bundle` | `remote` | **producción** (fijado en `eas.json`) |
| `production` | `app-bundle` | `local` | **producción** (fijado en `eas.json`) |
| `internal-staging-aab` | hereda de `staging-aab` | heredado | **staging** (fija sus propias variables, que ganan sobre las del padre) |
| `preview` | `apk` | por defecto | **el del dashboard de EAS**: NO usar para smoke |

### Por qué ambos perfiles de bundle llevan producción fijada

Hasta el 2026-08-26 ninguno de los dos fijaba variable alguna, así que la URL embebida salía del **dashboard de EAS**: estado no versionado, invisible en revisión de código y sin trazabilidad en git. La auditoría externa lo marcó como la misma clase de fragilidad del incidente de julio, donde un APK de `preview` salió con la URL de producción embebida sin que nadie lo viera.

Se fijaron `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` de producción **en los dos perfiles de bundle**, no en uno solo. Motivo: el nombre del perfil no permite deducir cuál sube a Play (`staging-aab` suena a staging pero apunta a producción), y fijar solo uno dejaría el otro dependiendo del dashboard con la falsa sensación de estar cubierto. Con ambos fijados, el AAB sale correcto sea cual sea el que se use.

La anon key es **pública por diseño** (JWT con `role: anon`, protegida por RLS) y ya existía el precedente de tenerla versionada en `internal-staging-aab`. **Nunca versionar la `service_role`.**

### Verificación antes de un release

```bash
node -e 'const j=require("./apps/mobile/eas.json");
for (const n of ["staging-aab","production"]) console.log(n, j.build[n].env.EXPO_PUBLIC_API_URL);'
```
Debe imprimir `https://theoriginaliching.com` en ambos, **leído de `eas.json`**, sin consultar el dashboard de EAS.

### Verificación del artefacto, después de construir y antes de subir

Lo de arriba comprueba la **configuración**. Esto comprueba el **artefacto**, que es lo que de verdad se instala. La distinción no es pedante: un gate que pregunta "¿está bien configurado?" no prueba "¿salió bien?", y este proyecto ya pagó once semanas de un job de `VACUUM` muerto con el gate en verde por confundir las dos cosas.

Un AAB es un zip. El bundle de JS vive en `base/assets/index.android.bundle`, y las cadenas de las variables `EXPO_PUBLIC_*` quedan embebidas ahí.

**1. Chequeo inverso, que es el que importa.** No basta con confirmar que la URL de producción está: hay que confirmar que **la de staging NO está**. Ese es el error que un dashboard mal configurado produce, y el único que un chequeo positivo deja pasar.

```bash
# Extraer el bundle del AAB
unzip -p <ruta>.aab base/assets/index.android.bundle > /tmp/bundle.hbc

# DEBE aparecer:
grep -c "theoriginaliching.com" /tmp/bundle.hbc

# DEBE dar CERO. Si da otra cosa, el AAB apunta a staging: NO subir.
grep -c "git-staging" /tmp/bundle.hbc
grep -c "pjbjpdpgpzwgrellvsor" /tmp/bundle.hbc
```

**2. Versión y versionCode reales del manifiesto**, no los del `app.config.js`:

```bash
aapt dump badging <ruta>.aab | head -1
```

Debe coincidir con el bump planificado, y el `versionCode` ser +1 sobre el último **subido**.

> Estos comandos están documentados pero **no se han ejecutado todavía contra un AAB real**, porque no había artefacto cuando se escribieron. La primera vez que se corran, ajustar aquí lo que difiera (rutas dentro del zip, disponibilidad de `aapt`) y quitar esta nota.

### Pendiente conocido

`EXPO_PUBLIC_APP_ENV` y `EXPO_PUBLIC_MOBILE_API_MODE` **siguen sin fijarse** en los perfiles de bundle y aún dependen del dashboard. Quedan fuera del alcance autorizado en su momento; conviene fijarlas también en el próximo cambio de este archivo.
