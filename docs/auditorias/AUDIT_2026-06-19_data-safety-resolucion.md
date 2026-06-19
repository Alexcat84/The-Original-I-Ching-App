# Auditoría y Resolución — Data Safety Form (Google Play)

**App:** The Original I Ching (com.theoriginaliching.app)
**Fecha del rechazo:** 18 Jun 2026 · **Version code afectado:** 49
**Fecha de resolución:** 19 Jun 2026
**Tipo de issue:** Policy Declaration — Data Safety Section: Device Or Other IDs

---

## 1. Hallazgo original (Google Play)

Google rechazó la release vc49 con el siguiente motivo:

> *"The way that your app collects and shares user data does not match your declaration in the data safety form. We detected user data transmitted off devices that you have not disclosed in your app's data safety form as user data collected."*
>
> **Área específica:** Data Safety Section — Device Or Other IDs (Advertising ID, Android ID, IMEI, BSSID, MAC address).

La app en versiones anteriores (vc45, vc47) ya tenía el mismo gap — la actualización de política de Google de abril 2025 reclasificó el **Android ID / installation ID** como "Device or other IDs" de declaración obligatoria, y el escáner binario automático de Play Console lo detectó en vc49.

---

## 2. Auditoría técnica — causa raíz

### Proceso de investigación

1. Escaneo de dependencias del repo para identificar SDKs que recopilan Device IDs.
2. Inspección del manifest fusionado del build real (vc49) para confirmar permisos embarcados.
3. Revisión del código de configuración de Sentry y RevenueCat.
4. Revisión de la política de privacidad (los 11 locales en `packages/i18n`).

### Hallazgos verificados

| Hallazgo | Detalle |
|----------|---------|
| **Fuente del Device ID: Sentry** | `@sentry/react-native` inicializado con `Sentry.init({ dsn, debug })` sin restricciones (`enableNative: false` no presente). Por defecto adjunta **installation ID** + device context a cada evento/crash. **Esta es la fuente que disparó el rechazo.** |
| **RevenueCat: sin Advertising ID** | `Purchases.configure({ apiKey, appUserID })` sin llamada a `collectDeviceIdentifiers()` en ningún punto del repo. RevenueCat NO recopila el Advertising ID en esta configuración. |
| **Permiso AD_ID: NO embarcado** | Inspección del manifest fusionado del build vc49 confirmó ausencia de `com.google.android.gms.permission.AD_ID`. Lista real de permisos: INTERNET, SYSTEM_ALERT_WINDOW, VIBRATE, WRITE_EXTERNAL_STORAGE, ACCESS_NETWORK_STATE, READ_MEDIA_AUDIO, USE_BIOMETRIC, USE_FINGERPRINT, com.android.vending.BILLING, DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION, BIND_GET_INSTALL_REFERRER_SERVICE. |
| **BIND_GET_INSTALL_REFERRER_SERVICE** | Inyectado por RevenueCat (atribución de instalación). No es "Device or other IDs" — es dato de atribución (URL de referencia). No fue la causa del rechazo. |
| **Política de privacidad: gap confirmado** | `packages/i18n/src/messages/privacy-page-ui.ts` (721 líneas, 11 locales) no mencionaba identificadores de dispositivo/instalación ni categorías de proveedor (diagnóstico de fallos, gestión de compras, atestación de dispositivo) en ningún idioma. Solo lenguaje genérico ("specialized providers", "technical providers"). |
| **Formulario Data Safety previo: incompleto** | No declaraba "Device or other IDs" ni varios tipos adicionales que la app sí recopila. |

### Fuentes de datos recopilados (mapa completo)

| Tipo de dato | SDK / Sistema | Observación |
|---|---|---|
| Device or other IDs | Sentry (installation ID) | Declaración obligatoria desde abr 2025 |
| Crash logs / Diagnostics | Sentry | Crash reports con contexto de dispositivo |
| Purchase history | RevenueCat | Historial de tokens comprados |
| Email address | Supabase Auth / Resend | Registro, 2FA, activación de cuenta |
| User IDs | Supabase + RevenueCat appUserID | Identificadores de sesión y billing |
| Name | Google OAuth (user_metadata) | Nombre tomado del perfil de Google |
| App interactions | Backend propio (consultation_count, racha, chats) | Contadores de actividad en Supabase |
| Other user-generated content | Backend propio (tabla consultations, columna question) | La pregunta del usuario se persiste en DB |
| Emails (Messages) | Resend (2FA, activación) | Emails transaccionales |

---

## 3. Resolución aplicada

### 3a. Política de privacidad (11 idiomas)

Se actualizó `packages/i18n/src/messages/privacy-page-ui.ts` para declarar explícitamente:
- Recopilación de **identificadores de dispositivo e instalación** vía herramientas de diagnóstico y reporte de fallos.
- Categorías de proveedores técnicos con rol de **service providers** (no terceros): reporte de fallos y diagnósticos, gestión de compras y suscripciones, y — en Android — atestación de dispositivo para prevención de fraude y seguridad. (Por decisión de producto, la política declara **categorías de función**, no nombres de marca — Google Play no exige nombrar proveedores específicos, solo el tipo de dato y el tipo de destinatario; ver §6.)
- Datos de compra y datos de cuenta.

Aplicado en los 11 locales: es, en, pt, fr, de, it, ja, zh, ko, ar, hi.

### 3b. Formulario Data Safety en Play Console

Se actualizó el formulario completo (paso a paso documentado en §4 abajo).

### 3c. Decisión sobre AD_ID (preventiva)

El permiso `AD_ID` no estaba embarcado en el binario, pero se evaluó añadirlo a `blockedPermissions` preventivamente. Decisión: **no aplicado** — bloquear algo que no está presente no tiene efecto funcional y podría generar confusión en el build. Si en un futuro un SDK lo inyecta, el `blockedPermissions` ya existente sirve de modelo.

---

## 4. Declaración completa en Play Console

### Paso 1 — Data collection and security

| Campo | Valor |
|-------|-------|
| Does your app collect or share any required user data types? | **Yes** |
| Is all user data encrypted in transit? | **Yes** (todo por HTTPS/TLS) |
| Account creation methods | **Username and password** + **Username, password, and other authentication** (2FA TOTP/email) + **OAuth** (Google) |
| Delete account URL | **https://theoriginaliching.com/delete-account** |
| Partial data deletion without deleting account | **No** (la eliminación de chats se hace dentro de la UI de la app, sin URL de solicitud separada) |
| Independent security review | No aplica |
| UPI Payments verified | No aplica |

### Paso 2 — Data types seleccionados

**Personal info**
- ✅ Name
- ✅ Email address
- ✅ User IDs
- ❌ Address, Phone number, Race/ethnicity, Political/religious beliefs, Sexual orientation, Other info

**Financial info**
- ❌ User payment info (Stripe/Google Play manejan los datos de tarjeta directamente; nunca pasan por la app)
- ✅ Purchase history
- ❌ Credit score, Other financial info

**Messages**
- ✅ Emails (emails transaccionales de 2FA y activación)
- ❌ SMS or MMS, Other in-app messages

**App activity**
- ✅ App interactions (racha de días, consultas del día, contadores de actividad)
- ✅ Other user-generated content (pregunta del usuario persistida en tabla consultations)
- ❌ In-app search history, Installed apps, Other actions

**App info and performance**
- ✅ Crash logs
- ✅ Diagnostics
- ❌ Other app performance data

**Device or other IDs**
- ✅ Device or other IDs **(el tipo que causó el rechazo)**
- ❌ Photos/videos, Audio, Files/docs, Calendar, Contacts, Location, Health/fitness, Sensitive info

### Paso 3 — Collected vs Shared (todos los tipos)

Todos los tipos declarados son **Collected únicamente**. Ninguno es **Shared**, porque todos los proveedores terceros (procesamiento de errores, gestión de pagos, base de datos, email transaccional) actúan como **service providers** (procesan datos en nombre del desarrollador, bajo sus instrucciones, sin usarlos para fines propios). La distinción es:

- **Service provider** — solo Collected
- **Third party** (usa datos para fines propios: ads, cross-app profiling) — Shared

Ningún SDK de esta app cae en la categoría de "third party" bajo esa definición.

### Paso 4 — Detalles por tipo de dato

#### EMAIL ADDRESS

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** (almacenado en Supabase como parte del perfil) |
| Required or optional | **Required** (sin email no hay cuenta ni autenticación) |
| Purposes | App functionality, Fraud prevention/security/compliance (2FA), Account management |

#### USER IDs

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** |
| Required or optional | **Required** |
| Purposes | App functionality, Account management |

#### NAME

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** |
| Required or optional | **Required** (Google OAuth lo pasa automáticamente) |
| Purposes | App functionality, Account management |

#### PURCHASE HISTORY

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** (RevenueCat retiene el historial) |
| Required or optional | **Required** (necesario para gestionar tokens y acceso) |
| Purposes | App functionality, Account management |

#### EMAILS (Messages)

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** (almacenado en Supabase y transmitido a Resend) |
| Required or optional | **Required** |
| Purposes | App functionality, Fraud prevention/security/compliance, Account management |

#### APP INTERACTIONS

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** (contadores persistidos en Supabase) |
| Required or optional | **Required** |
| Purposes | App functionality, Analytics |

#### OTHER USER-GENERATED CONTENT

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** (pregunta persistida en tabla consultations) |
| Required or optional | **Required** (la pregunta es el input de la consulta) |
| Purposes | App functionality |

#### CRASH LOGS

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** (Sentry retiene crash reports) |
| Required or optional | **Required** |
| Purposes | Analytics |

#### DIAGNOSTICS

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** |
| Required or optional | **Required** |
| Purposes | Analytics |

#### DEVICE OR OTHER IDs (el tipo que causó el rechazo)

| Campo | Valor |
|-------|-------|
| Collected / Shared | **Collected** |
| Processed ephemerally | **No** (Sentry retiene el installation ID con los crash reports) |
| Required or optional | **Required** (embebido en el SDK; el usuario no puede desactivarlo) |
| Purposes | **Analytics** (Sentry agrupa crashes del mismo dispositivo), **Fraud prevention, security, and compliance** (Play Integrity — atestación del dispositivo) |

---

## 5. Estado

| Acción | Estado |
|--------|--------|
| Política de privacidad actualizada (11 idiomas) | ✅ Aplicado |
| Formulario Data Safety actualizado en Play Console | ✅ Aplicado |
| Enviado para revisión | ✅ Jun 19 2026 |
| Aprobación de Google | Pendiente (hasta 7 días) |

**Nota:** el rechazo era sobre vc49. La versión anterior en producción (vc48) sigue activa mientras dura la revisión. Una vez aprobado el formulario actualizado, la release vc49 puede completar su revisión sin el bloqueador de Data Safety.

---

## 6. Nota de alcance — nombres de marca vs. categorías

La política de privacidad declara **categorías de función** de los proveedores técnicos (reporte de fallos, gestión de compras, atestación de dispositivo), no nombres de marca (Sentry, RevenueCat, Google Play Integrity, Stripe). Se verificó contra la política oficial de Google ("Provide information for Google Play's Data safety section" y "User Data policy") que el requisito es declarar **tipos de datos**, **tipos de destinatario** y **propósitos** — el formulario de Data Safety es de categorías por diseño, y la política de privacidad debe divulgar "the types of parties with whom data is shared", no las empresas específicas por nombre. No es un requisito de Google Play; fue decisión de producto para no exponer el stack técnico interno.

## Referencias

| Recurso | Ubicación |
|---|---|
| Política de privacidad (11 locales) | `packages/i18n/src/messages/privacy-page-ui.ts` |
| Init de Sentry | `apps/mobile/app/_layout.tsx` |
| Config de RevenueCat | `apps/mobile/app/index.tsx` (`Purchases.configure`) |
| Manifest fusionado (build real) | `apps/mobile/android/app/build/intermediates/packaged_manifests/release/processReleaseManifestForPackage/AndroidManifest.xml` |
| Índice de auditorías | [`docs/auditorias/README.md`](./README.md) |
