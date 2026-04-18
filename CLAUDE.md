# The Original I Ching App — Contexto del Proyecto

## Descripción
App de consultas al I Ching con IA. Oráculo ancestral chino con interpretación
moderna usando Claude AI. Modelo de negocio: tokens consumibles (no suscripción).

## Stack Tecnológico
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Auth)
- **Mobile**: Expo + React Native WebView (APK Android)
- **Pagos**: RevenueCat Web Billing + Stripe
- **Emails**: Resend (dominio: theoriginaliching.com)
- **Imágenes IA**: Together AI — FLUX.1 Schnell
- **Consultas IA**: Anthropic Claude API
- **Deploy web**: Vercel (staging + production)
- **Build APK**: EAS Build (Expo Application Services)
- **Monorepo**: Turborepo + pnpm workspaces

## Estructura del Proyecto
```
/
├── apps/
│   ├── web/                    # Next.js app principal
│   │   └── src/app/
│   │       ├── page.tsx        # Componente principal (chat + oráculo)
│   │       ├── guia/           # Documentación/quickstart
│   │       ├── pricing/        # Página de precios
│   │       ├── privacy/        # Política de privacidad
│   │       ├── terms/          # Términos de servicio
│   │       └── api/            # API routes
│   │           ├── consult/    # Endpoint principal de consulta
│   │           ├── account/    # Chats, historial, perfil
│   │           ├── auth/       # Callbacks de autenticación
│   │           └── webhooks/   # RevenueCat webhooks
│   └── mobile/                 # Expo WebView APK Android
│       ├── app/index.tsx       # Componente principal WebView
│       └── app.config.js       # Configuración Expo
├── backend/
│   └── db/migrations/          # 22 migraciones SQL (001-022)
├── packages/                   # Paquetes compartidos del monorepo
└── .claude/                    # Skills de Claude Code
```

## Branches
- `staging` — desarrollo y pruebas activas
- `main` — producción (merge pendiente hasta 25 de abril 2026)

## Entornos y Variables

### Web (Vercel)
- **Production** → Supabase proyecto original (egress saturado hasta 25 abril)
- **Preview/Staging** → Supabase proyecto nuevo (egress fresco)

Variables en Vercel separadas por entorno:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TOGETHER_API_KEY` — generación de imágenes (backend only)
- `ANTHROPIC_API_KEY` — consultas IA (backend only)
- `REVENUECAT_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `LOG_TOKEN_BALANCE_DEBUG=true` — logs de tokens en staging

### Mobile (apps/mobile/.env)
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_API_URL` — URL de staging o producción

## Modelo de Tokens (Consumibles, NO suscripción)
| Pack | Precio | Tokens | Consultas/hilo | Resolución imagen |
|------|--------|--------|----------------|-------------------|
| Free | $0 | 2 lifetime | 1 | 1024×768 |
| Seeker | $6.99 | 20 | 3 | 1024×1024 |
| Practitioner | $11.99 | 40 | 5 | 1184×1184 |
| Master | $19.99 | 100 | 8 | 1504×1504 |

**Reglas clave:**
- Tokens son ACUMULABLES — se suman con cada compra
- El límite por hilo depende del `last_pack` activo (no del saldo)
- Free trial: 2 tokens LIFETIME, nunca se renuevan
- `user_trial_log` protege contra re-otorgamiento del free trial
- Gate de acceso basado ÚNICAMENTE en `credits_total > 0`

## Schema DB (Supabase) — Tablas principales
```sql
query_credits          -- credits_total, credits_used, total_purchased, last_pack
user_trial_log         -- blindaje free trial lifetime
consultation_sessions  -- historial de chats
consultations          -- mensajes individuales
consultation_notes     -- notas adicionales
pattern_analyses       -- análisis de patrones
admin_runtime_config   -- configuración runtime
revenuecat_customer_aliases
revenuecat_webhook_events
two_factor_attempts
two_factor_email_codes
two_factor_recovery_codes
users
```

## Funcionalidades Implementadas y Probadas

### Web (staging — verified ✅)
- [x] Consulta I Ching (tres monedas, Zhu Xi, Wilhelm/Baynes)
- [x] Consulta Huesos de Oráculo (estilo Shang)
- [x] Generación de imágenes por tier (Together AI FLUX.1 Schnell)
- [x] Sistema de tokens consumibles (free, seeker, practitioner, master)
- [x] RevenueCat Web Billing + Stripe (checkout con GST/QST automático)
- [x] Historial de chats persistente (ChatSessionProvider en layout raíz)
- [x] Exportar chat PDF
- [x] Descargar imagen generada
- [x] 2FA (TOTP + email)
- [x] Google OAuth
- [x] 9 idiomas (ES, EN, PT, FR, DE, IT, JA, ZH, KO)
- [x] Modo oscuro/claro
- [x] Idle timeout 45 minutos (privacidad — contenido íntimo)
- [x] Centro de tokens con info de saldo y límites
- [x] Aviso de tokens acumulables en UI y documentación
- [x] Resolución de imagen por tier (bug del last_pack corregido)
- [x] Watermark por tier en imágenes generadas

### Mobile APK (apps/mobile)
- [x] WebView cargando staging URL
- [x] Barra nativa: selector de idioma dropdown (9 idiomas) + auth state
- [x] Google OAuth via browser externo (evita error 403 disallowed_useragent)
- [x] Status bar correctamente posicionada (SafeAreaView)
- [x] Zoom habilitado solo en imágenes (modal nativo PanResponder)
- [x] Export PDF via expo-sharing
- [x] Descarga de imágenes via expo-media-library
- [x] Eliminación de chats via SecureStore token
- [x] Sin cookies compartidas (cumple Play Store)
- [x] privacyPolicyUrl configurado en app.config.js
- [x] EAS Build configurado (profile: preview)

### Arquitectura clave
- **ChatSessionProvider** en `app/layout.tsx` — estado de chats nunca se destruye
  al navegar entre rutas (solución al bug de "chats desaparecen")
- **consume_token** en DB — decrementa credits_total, incrementa credits_used
- **grant_tokens** en DB — SIEMPRE suma al saldo (ON CONFLICT DO UPDATE credits_total + p_tokens)
- **init_free_user** — INSERT con ON CONFLICT DO NOTHING + verificación user_trial_log
- Token refresh post-consulta: remainingCredits en response → actualiza UI inmediatamente

## Servicios Externos Configurados
| Servicio | Propósito | Configurado |
|----------|-----------|-------------|
| Supabase | DB + Auth | ✅ Staging + Producción |
| RevenueCat | Pagos | ✅ Web Billing |
| Stripe | Procesador de pagos | ✅ via RevenueCat |
| Together AI | Imágenes FLUX.1 | ✅ |
| Anthropic | Claude API consultas | ✅ |
| Resend | Emails transaccionales | ✅ dominio verificado |
| Vercel | Deploy web | ✅ |
| EAS Build | Build APK | ✅ cuenta alexcat84 |
| Google Play Console | Distribución Android | ✅ cuenta creada, verificación pendiente |
| Google OAuth | Login social | ✅ staging + producción |

## Resoluciones de Imagen (Together AI FLUX.1 Schnell)
- Precio: $0.0027/MP
- Max: 2048×2048px, múltiplos de 32
- Free: 1024×768 ($0.0021/img)
- Seeker: 1024×1024 ($0.0028/img)
- Practitioner: 1184×1184 ($0.0039/img)
- Master: 1504×1504 ($0.0061/img)

## Historial de Cambios Importantes

### Migraciones DB (022 total)
- `021_consumable_tokens.sql` — modelo consumible, consume_token, grant_tokens
- `022_user_trial_log.sql` — blindaje free trial lifetime con backfill

### Fixes Críticos Realizados
1. **Bug display de tokens** — panel opciones ahora refresca post-consulta via evento `iching:account-refresh`
2. **Bug tier en imágenes** — `resolveTierSize` ahora usa `toContextTierKey()` antes de comparar
3. **Bug chats desaparecen** — `ChatSessionProvider` en layout raíz elimina reset en cada montaje
4. **Bug carga historial** — eliminado reset incondicional `setSessions([fresh])`, ahora condicional
5. **Free trial doble** — `user_trial_log` + `ON CONFLICT DO NOTHING` previene re-otorgamiento
6. **Auth egress Supabase** — debounce en refresh de token evita refetch innecesario

### Decisiones de Producto
- Tokens ACUMULABLES (no se pierden al comprar nuevo pack)
- Límite por hilo depende de `last_pack`, NO del saldo
- Idle timeout: 45 minutos (contenido íntimo/privado)
- Imágenes diferenciadas por tier (no solo watermark)
- Free tier: 2 consultas LIFETIME, 1 por hilo
- Sin suscripciones — solo packs consumibles

## Comandos Útiles
```bash
# Desarrollo web
pnpm dev

# Build staging
git push origin staging

# Build APK
cd apps/mobile
eas build --platform android --profile preview

# Verificar proyecto mobile
npx expo doctor

# Login EAS
npx eas login

# Ver builds
eas build:list

# Variables de entorno
vercel env pull .env.staging
```

## URLs Importantes
- Staging web: https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app
- Producción: https://theoriginaliching.com
- EAS builds: https://expo.dev/accounts/alexcat84/projects/the-original-i-ching/builds
- Play Console: https://play.google.com/console/u/0/developers/7735925863707716505

## Pendiente para Lanzamiento
- [ ] Merge staging → main (después del 25 abril cuando resetea egress)
- [ ] Upgrade Supabase a Pro ($25/mes) al tener usuarios reales
- [ ] Verificación de identidad Google Play Console (1-3 días hábiles)
- [ ] Assets para Play Store: icon 512×512, feature graphic 1024×500, screenshots
- [ ] Data Safety Form en Play Console
- [ ] APK final con todos los fixes verificados en dispositivo
- [ ] i18n formal con next-intl (post-lanzamiento, Fase 2)
- [ ] App Expo nativa completa (post-lanzamiento, Fase 2)
- [ ] Animación ritual de hueso (Three.js + fuego) — pendiente integración
