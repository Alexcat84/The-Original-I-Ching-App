# Plan: lanzamiento en iOS App Store
**Código:** `20260627-PLAN-MOB-IOS-01 ios-app-store-launch` · **Familia:** MOB-IOS · **Estado:** open

**Fecha apertura:** 2026-06-27
**Contexto:** Android (Expo + WebView, APK/AAB vía EAS) ya está en producción en Play Console. Este plan cubre **desde cero** el lanzamiento equivalente en iOS — el repo hoy no tiene ningún rastro de configuración iOS (`platforms: ["android"]` explícito en `app.config.js`, ningún perfil `ios` en `eas.json`, sin Sign in with Apple, sin assets iOS). No es un "completar lo que falta", es un **setup completo nuevo**.

---

## 0. Resumen ejecutivo — los 3 riesgos que definen todo lo demás

Antes del checklist técnico, estas 3 cosas determinan el esfuerzo real y deben decidirse primero:

### Riesgo 1 — Guideline 4.2 "Minimum Functionality" (riesgo de rechazo más probable)
Apple rechaza apps que son "simplemente un sitio web reempaquetado". Esta app **ya tiene** capas nativas reales que ayudan a defenderse de esto: caché SQLite offline de chats, puente nativo de auth (SecureStore + recuperación de sesión), exportación de PDF nativa (`expo-sharing`), guardado de imágenes nativo (`expo-media-library`), deep linking, attestation de integridad (Android). El plan incluye preparar **notas de revisión explícitas** para el reviewer de Apple destacando esto — es la mitigación de mayor retorno con menor esfuerzo.

### Riesgo 2 — Compras dentro de la app DEBEN ir por Apple In-App Purchase
Cualquier compra de los 3 packs de tokens consumida **dentro de la app de iOS** tiene que pasar por StoreKit (vía RevenueCat, que ya se usa en Android con Play Billing — es la misma integración, solo se agrega la tienda de Apple al mismo proyecto RC). Apple cobra su comisión (15% si calificas para el Small Business Program con <$1M/año, si no 30%) — **esto no es opcional ni evitable** dentro de la app sin arriesgar rechazo. Es una decisión de negocio (¿se mantienen los mismos precios en iOS aunque la comisión sea distinta a Stripe/Google, o se ajustan?), no solo técnica.

### Riesgo 3 — Sign in with Apple pasa a ser obligatorio (Guideline 4.8)
La app ya ofrece Google OAuth como login de terceros. Si se ofrece un login de terceros y se recolecta data del usuario, Apple **exige** ofrecer también "Sign in with Apple" como alternativa equivalente. No es opcional si se mantiene Google OAuth en iOS.

**Decisión que falta tomar (te toca a ti):** confirmar que aceptas estos 3 puntos como costo de hacer negocio en iOS — no hay forma de evitarlos sin cambiar el modelo de producto. El resto del plan asume que sí.

### Nota permanente — por qué NO se migra a un framework distinto (Capacitor, template WKWebView nativo)

**Decisión cerrada 2026-06-27**, documentada aquí para que no se reabra por una recomendación genérica de IA/freelancer en el futuro: la app **ya es Expo + React Native**, que **ya soporta iOS como plataforma de build del mismo código** (`eas build --platform ios`). No hay "migración entre stacks" que hacer — es agregar `ios` a `platforms` en `app.config.js` (§4.1).

Recomendaciones tipo "clona un template WKWebView en Swift" o "migra a Capacitor" parten de asumir que el Android actual es un WebView nativo puro (Kotlin/Java) que necesita una contraparte nativa separada en iOS. Eso describe un proyecto distinto al de este repo. Seguir ese consejo aquí significaría **reconstruir desde cero**, en un ecosistema sin compatibilidad con el código actual, todo lo que ya funciona en producción: caché SQLite offline (3 capas), puente nativo de autenticación con recuperación de sesión, integración completa de RevenueCat, deep linking, exportación de PDF/imagen nativa, y el guard de cross-origin del WebView. Sería semanas/meses de trabajo extra para terminar con **menos** funcionalidad que la actual, no más.

---

## 1. Inventario del estado actual (verificado en código, 2026-06-27)

| Área | Estado hoy | Implicación |
|------|-----------|--------------|
| `app.config.js` | `platforms: ["android"]` explícito; sin bloque `ios` en ningún lado | Hay que agregar el bloque `ios` completo desde cero |
| `eas.json` | 6 perfiles (`development`, `preview`, `staging-aab`, `production`, `apk`, `verification`), todos **solo** con clave `android` | Cada perfil necesita su contraparte `ios`, o perfiles nuevos dedicados |
| RevenueCat (`react-native-purchases` 10.4.0) | SDK ya es cross-platform; **una sola** API key (`EXPO_PUBLIC_REVENUECAT_API_KEY`), sin distinción de plataforma | Hace falta una segunda key de RC para la app de App Store (RC siempre separa key por tienda) + lógica `Platform.select` |
| Token packs (`tokens_seeker_20`, etc.) | Definidos genéricamente en código (`token-packs.ts`), no hardcodeados a Android | El código no bloquea iOS; falta crear los 3 productos consumibles equivalentes en App Store Connect |
| Auth Google | OAuth vía navegador externo + deep link, sin SDK nativo | Patrón reutilizable para Apple Sign-In (mismo bridge, nuevo provider) |
| Auth Apple | **No existe** — cero referencias a `expo-apple-authentication` en el repo | Hay que construirlo completo |
| `expo-app-integrity` (Play Integrity) | Plugin Android-only, sin equivalente iOS instalado | Sin equivalente directo (ver §4.7) — decisión: omitir en v1 de iOS, no es requisito de Apple, es elección de producto |
| Assets de ícono | Solo `icon.png` (Android adaptive icon) + export 512×512 de Play Store | Falta ícono 1024×1024 sin alfa para App Store + sets de capturas iOS |
| Changelog (`CHANGELOG.md`, doc Play Store) | Esquema hardcodeado a `versionCode` (entero Android); sin campo `buildNumber` (iOS) | Necesita extensión menor de tooling, no romper lo existente |
| Apple Developer Program | Sin enrolar (sin evidencia en el repo ni mencionado antes) | Es el primer paso de todos — toma días en confirmarse |

---

## 2. Fase 0 — Decisiones de negocio (antes de tocar código)

| # | Decisión | Por qué importa | Pendiente de |
|---|----------|------------------|--------------|
| D1 | ¿Cuenta de Apple Developer **individual** o **organización**? | Individual es inmediato; organización requiere número D-U-N-S (puede tardar 1-5 días hábiles o más) y verificación legal de la empresa | Tu decisión |
| D2 | ¿Se ajustan los precios de los 3 packs para iOS, o se mantienen iguales a Android/Stripe pese a la comisión distinta de Apple? | Apple Small Business Program = 15% si <$1M USD/año de ingresos en la app; si no, 30% | Tu decisión |
| D3 | ¿Bundle identifier? | Recomendado `com.theoriginaliching.app` (igual al package Android) para consistencia de marca | Confirmar o elegir otro |
| D4 | ¿Se lanza con soporte de iPad o solo iPhone? | iPad multiplica el QA de capturas/layout; si el producto es 100% uso personal en celular, limitar a iPhone reduce alcance de pruebas | Tu decisión (recomiendo solo iPhone para v1) |
| D5 | ¿Se omite el equivalente de Play Integrity en la v1 de iOS? | No es requisito de Apple — es una protección anti-abuso que el equipo eligió para Android. Construir el equivalente (App Attest) añade semanas | Recomiendo: **sí, omitir en v1**, revisar post-lanzamiento |
| D6 | ¿Se agregan push notifications (APNs) antes del envío? | **No existen hoy en ninguna plataforma** (ni Android ni iOS). No es requisito de Apple, pero es la única señal "app nativa" del checklist típico de revisión que falta — refuerza la defensa contra Riesgo 1 si el reviewer es estricto. Costo real: certificados APNs + `expo-notifications` + lógica de envío del lado servidor | Recomiendo: **omitir en v1** salvo que el primer envío sea rechazado citando 4.2 — entonces es la primera mejora a agregar antes de reenviar |

---

## 3. Fase 1 — Cuentas e infraestructura Apple (la más lenta, empieza primero)

- [ ] Enrolar en **Apple Developer Program** ($99 USD/año) — developer.apple.com/programs
  - Si es cuenta de organización: solicitar/confirmar **D-U-N-S number** primero (gratis, vía D&B) — este paso es el que históricamente más demora todo el plan
- [ ] Crear el **App ID** (bundle identifier, según D3) en el portal de desarrolladores, con capacidad **Sign in with Apple** habilitada
- [ ] Crear el registro de la app en **App Store Connect**
- [ ] Firmar el **Paid Applications Agreement** en App Store Connect (obligatorio incluso para apps "gratis" si tienen compras dentro de la app) + configurar info bancaria/fiscal (proceso separado del de Google Play)
- [ ] **RevenueCat**: agregar la app de App Store al proyecto RC existente; generar la API key específica de iOS; configurar los 3 productos consumibles en App Store Connect espejo de Android, mapeados a las mismas entitlements de RC
- [ ] **Supabase Auth**: configurar el provider "Apple" (requiere Service ID + clave privada generados en el portal de Apple — este flujo es notoriamente más largo que el de Google, dedicar tiempo aparte)

---

## 4. Fase 2 — Cambios de código

### 4.1 `apps/mobile/app.config.js`
- Cambiar `platforms: ["android"]` → `platforms: ["android", "ios"]`
- Agregar bloque `ios: { bundleIdentifier, buildNumber, infoPlist: {...}, associatedDomains?, config: { usesNonExemptEncryption: false } }`
- `infoPlist`: descripciones de uso para cámara/fotos si `expo-media-library` las requiere en iOS (`NSPhotoLibraryUsageDescription` / `NSPhotoLibraryAddUsageDescription`) — verificar si el plugin las autogenera desde la config actual o si hay que declararlas explícitas
- `CFBundleURLTypes` para el deep link `theoriginaliching://auth/callback` y el scheme de RevenueCat (`rc-340e77bf41`) — equivalente iOS de los `android.intentFilters` actuales
- Revisar plugins con sub-bloque `android`-only (`react-native-edge-to-edge`, `expo-build-properties`) — decidir si necesitan configuración `ios` propia o si el default de Expo basta

### 4.2 `apps/mobile/eas.json`
- Agregar clave `ios` a los perfiles relevantes (mínimo: uno tipo `preview`/TestFlight interno, uno `production`)
- Dejar que EAS administre credenciales (certificados/provisioning profiles) automáticamente — evita la gestión manual de Xcode
- `submit.production.ios`: credenciales de App Store Connect (API key, no usuario/contraseña)

### 4.3 Sign in with Apple
- Instalar `expo-apple-authentication`
- Replicar el patrón ya usado para Google (puente nativo → deep link → Supabase) pero usando el flujo nativo de Apple (`AppleAuthentication.signInAsync`), que es más directo que el redirect-por-navegador de Google
- Conectar al provider "Apple" de Supabase configurado en Fase 1
- Probar reglas de privacidad de Apple: el usuario puede ocultar su email real (relay de Apple) — confirmar que el flujo de registro/billing soporta un email de relay sin romper nada (envío de recibos, etc.)

### 4.4 RevenueCat multi-key
- `Purchases.configure({ apiKey: Platform.select({ ios: RC_KEY_IOS, android: RC_KEY_ANDROID }), appUserID })`
- Nueva env var `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` (mantener la actual para Android sin tocarla)

### 4.5 Assets
- Ícono 1024×1024 **sin canal alfa** para App Store Connect (distinto del adaptive icon de Android)
- Capturas de pantalla iPhone (mínimo un tamaño, recomendado 6.9" que cubre la mayoría) — reusar las pantallas ya preparadas para Play Store si el diseño es responsive

### 4.6 Changelog tooling
- Extender `scripts/update-changelog.js` y el doc de Play Store para aceptar `--buildNumber` además de `--versionCode` (cambio pequeño, no rompe lo existente — mismo patrón, columna nueva opcional)
- Decidir: ¿un doc de changelog compartido Android+iOS, o uno nuevo `docs/00000000-OPS-IOS-01-app-store-changelog.md` espejo del de Play? (Recomiendo doc separado — los formatos de "what's new" y los locale codes difieren ligeramente entre consolas)

### 4.7 `expo-app-integrity` (Play Integrity)
- Sin paquete Expo equivalente confirmado para App Attest a la fecha de este plan
- **Decisión recomendada (ver D5):** excluir condicionalmente el plugin solo en build iOS (`app.config.js` puede filtrar plugins por plataforma) y omitir la verificación de integridad en iOS v1 — no bloquea la revisión de Apple, es una elección de robustez, no un requisito

---

## 5. Fase 3 — Cumplimiento y ficha de App Store

- [ ] **App Privacy ("nutrition label")** en App Store Connect: cuestionario de qué datos se recolectan (email, datos de auth, datos de pago vía RC/Stripe, datos de error vía Sentry) y si están vinculados a identidad / se usan para tracking — reusar la investigación ya hecha (o pendiente) para el "Data Safety Form" de Google Play, son preguntas equivalentes
- [ ] Confirmar que Privacy Policy / Terms ya publicados (theoriginaliching.com) son válidos para iOS sin cambios — probablemente sí
- [ ] Cuestionario de clasificación de edad (Age Rating) — contenido de adivinación/I Ching, sin violencia/contenido maduro, debería calificar en la categoría más baja
- [ ] **Notas para el revisor de Apple** (texto libre en App Store Connect, no público): explicar explícitamente las capas nativas (SQLite offline, exportación PDF, auth nativo) para mitigar el Riesgo 1 (§0) antes de que el reviewer lo cuestione. Redacción base sugerida (ajustar tono, no copiar literal): *"This app is a native container with an optimized mobile web layer: it includes offline local caching (SQLite), native authentication with session recovery, native PDF/image export, and deep linking — the embedded content is purpose-built for this app, not a generic website."*
- [ ] **Cuenta de demo** para el reviewer (usuario + contraseña de prueba, ya que la app requiere login) — confirmar que tiene tokens suficientes para que el reviewer pueda probar una consulta real sin pagar

---

## 6. Fase 4 — Build y pruebas

- [ ] `eas build --platform ios --profile preview` (cloud, **no requiere Mac**) — primer build de validación
- [ ] Distribuir vía **TestFlight interno** (equivalente a "internal testing" de Play Console)
- [ ] Probar de punta a punta: Sign in with Apple, Google OAuth (sigue funcionando en iOS), deep links (`auth/callback` y RC scheme), compra de un pack con **sandbox tester** de App Store Connect, exportación de PDF, guardado de imagen, caché SQLite offline
- [ ] Verificar comportamiento del WebView en **WebKit** (motor de Safari, distinto del Chrome WebView de Android) — especial atención a `safe-area-insets` (ya hay soporte cross-platform vía `react-native-safe-area-context`, pero hay que confirmar visualmente) y cualquier CSS/JS que se haya probado solo en Chrome WebView

---

## 7. Fase 5 — Envío y revisión

- [ ] (Opcional, recomendado) **TestFlight externo** — grupo beta más amplio antes del envío público
- [ ] Enviar a revisión con las notas del reviewer + cuenta demo de §5
- [ ] **Anticipar 1-2 ciclos de rechazo/reenvío** como algo normal para apps tipo WebView — tener lista la respuesta si Apple cita 4.2 (reforzar las notas, posiblemente agregar más funcionalidad nativa visible)
- [ ] Una vez aprobado: publicación pública

---

## 8. Fase 6 — Post-lanzamiento

- [ ] Confirmar que Sentry recibe eventos de iOS correctamente (ya es cross-platform, solo verificar en producción real)
- [ ] Localizar la ficha de App Store Connect a los 11 idiomas ya soportados (códigos de locale de Apple difieren levemente de los de Play — verificar mapeo, ej. `es-MX` vs `es-419`)
- [ ] Evaluar si construir el equivalente de App Attest (omitido en D5) vale la pena según volumen real de abuso observado

---

## 9. Costos y tiempos estimados

| Ítem | Costo | Tiempo |
|------|-------|--------|
| Apple Developer Program | $99 USD/año | Inmediato (individual) / 1-5+ días hábiles (organización, por D-U-N-S) |
| Comisión Apple IAP | 15% (<$1M/año) o 30% | Recurrente, por transacción |
| Setup Sign in with Apple (Supabase + código) | $0 | ~1 día de trabajo |
| Primer build + TestFlight | $0 (incluido en EAS/cuenta gratuita o plan existente) | Minutos de build, horas de configuración |
| Revisión de Apple (por intento) | $0 | 24-48h típico, más si hay rechazo y reenvío |
| **Total estimado hasta primer envío** | ~$99 + comisión variable | **1-3 semanas**, dominado por la espera de la cuenta de desarrollador y la configuración de Sign in with Apple/RevenueCat |

---

## 10. Checklist maestro (copiar para seguimiento)

```text
Fase 0 — Decisiones
[ ] D1 cuenta individual u organización
[ ] D2 precios iOS iguales o ajustados
[ ] D3 bundle identifier confirmado
[ ] D4 solo iPhone o + iPad
[ ] D5 confirmar omitir App Attest en v1
[ ] D6 confirmar omitir push notifications en v1 (agregar solo si hay rechazo 4.2)

Fase 1 — Cuentas
[ ] Apple Developer Program enrolado
[ ] App ID creado (Sign in with Apple habilitado)
[ ] App Store Connect: app creada
[ ] Paid Applications Agreement firmado + banca/fiscal
[ ] RevenueCat: app iOS agregada + key generada
[ ] App Store Connect: 3 productos IAP creados
[ ] Supabase: provider Apple configurado

Fase 2 — Código
[ ] app.config.js: platforms + bloque ios completo
[ ] eas.json: perfiles ios agregados
[ ] expo-apple-authentication instalado + flujo implementado
[ ] RevenueCat multi-key (Platform.select)
[ ] Ícono 1024×1024 sin alfa + capturas iPhone
[ ] Changelog tooling acepta buildNumber
[ ] expo-app-integrity excluido de build iOS

Fase 3 — Cumplimiento
[ ] App Privacy nutrition label completado
[ ] Age rating completado
[ ] Notas de revisor escritas
[ ] Cuenta demo con tokens lista

Fase 4 — Build/QA
[ ] Build preview vía EAS cloud
[ ] TestFlight interno funcionando
[ ] Sign in with Apple probado end-to-end
[ ] Compra sandbox probada end-to-end
[ ] WebView/WebKit verificado visualmente

Fase 5 — Envío
[ ] TestFlight externo (opcional)
[ ] Enviado a revisión
[ ] Aprobado y publicado
```

---

## 11. Documentos relacionados

- `apps/mobile/app.config.js`, `apps/mobile/eas.json` — archivos a modificar
- `CLAUDE.md` — actualizar sección "Pendiente para Lanzamiento" y stack tecnológico una vez iOS esté en marcha
- `docs/00000000-OPS-PLAY-01-play-store-changelog.md` — referencia de formato para el equivalente iOS
- `00000000-AUD-MOB-PLAY-*` (familia existente) — para comparar contra el proceso ya recorrido en Play Console

---

## 12. Changelog

| Fecha | Evento |
|-------|--------|
| 2026-06-27 | Apertura del plan. Inventario completo del estado actual (sin nada de iOS configurado); identificados los 3 riesgos críticos (4.2 Minimum Functionality, IAP obligatorio, Sign in with Apple obligatorio); fases 0-6 documentadas con checklist maestro. |
| 2026-06-27 | Revisado un segundo input externo (Grok). Se descarta explícitamente su recomendación central (template WKWebView separado / migrar a Capacitor) — parte de la premisa equivocada de que Android es nativo puro; en realidad ya es Expo/RN, que ya soporta iOS del mismo código, así que esa ruta significaría reconstruir desde cero sin necesidad. Se incorpora lo útil: D6 (push notifications, opcional, solo si hay rechazo 4.2) y redacción base para las notas del reviewer. |
| 2026-06-27 | Creada la rama `feature/ios-app-store-launch` (base: `staging`). Flujo de trabajo establecido: Cursor produce un plan concreto de implementación para la Fase 2 (§4) primero, sin escribir código todavía; Claude lo revisa/aprueba antes de implementar; tras implementar, Claude audita el resultado antes de cualquier merge a `staging`. Fases 0-1 (decisiones de negocio, cuentas Apple) quedan fuera del alcance de Cursor — requieren acción humana directa en los portales de Apple/RevenueCat/Supabase. |
