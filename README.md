# 🔮 The Original I Ching App

<div align="center">

![Version](https://img.shields.io/badge/version-4.2.5-gold)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![License](https://img.shields.io/badge/license-Private-red)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

**Ancient Chinese oracle meets modern AI.**
Ask your question. Cast the hexagram. Receive your reading.

[🌐 Web App](https://theoriginaliching.com) · [📱 Android App](#-android-app) · [📖 User Guide](https://theoriginaliching.com/guia) · [💰 Pricing](https://theoriginaliching.com/pricing)

</div>

---

<!-- SCREENSHOT PLACEHOLDER
<div align="center">
  <img src="docs/screenshots/hero-dark.png" alt="App screenshot — dark mode oracle consultation" width="300" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/hero-light.png" alt="App screenshot — light mode" width="300" />
</div>
-->

## ✨ What is this?

The Original I Ching App is an AI-powered oracle that brings two of the oldest divination systems in the world to your phone and browser:

- **I Ching** — The classic Chinese Book of Changes. Cast with three coins or yarrow stalks; choose your translator (Wilhelm/Baynes, Legge, Zhou Yi, or Master Combined) and your **changing-line reading system** (Alfred Huang or classical Zhu Xi). Interpreted by Claude AI.
- **Oracle Bones** — Shang dynasty–style divination. A charge is inscribed, cracked over heat, and a verdict appears: *auspicious 吉* or *inauspicious 凶*.

Every consultation includes a unique **AI-generated ritual image** that reflects the energy of your reading.

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🔮 **I Ching Consultation** | Three-coin and Yarrow Stalk methods. 64 hexagrams + changing lines |
| 📐 **Changing-line systems** | User-selectable **Alfred Huang** (default) or **Zhu Xi** — affects mutation rules, AI prompt, and persisted metadata |
| 🪙 **Manual Yarrow Wizard** | Step-by-step physical stalk counting with mathematically correct Zhou dynasty distribution |
| 🦴 **Oracle Bones** | Shang dynasty divination with turtle shell / ox bone medium. 4 archaeologically authentic verdicts |
| 🤖 **AI Interpretation** | Claude AI generates deep, contextual readings. Each one unique |
| 🖼️ **Ritual Images** | AI-generated art per consultation via FLUX.1 Schnell. Resolution scales with your tier |
| 💬 **Conversation Threads** | Deepen your reading across multiple exchanges in the same session |
| 📜 **Chat History** | All consultations saved, browsable, and fully searchable |
| 📄 **Export to PDF** | Download any consultation as a beautifully formatted PDF |
| 📚 **Hexagram Library** | Browse all 64 hexagrams with Wilhelm, Legge, and Zhou Yi translations (Seeker+ required) |
| 💬 **Feedback** | In-app feedback form with rate limiting and Supabase storage |
| 🌍 **11 Languages** | ES · EN · PT · FR · DE · IT · JA · ZH · KO · AR · HI |
| 🔒 **2FA Security** | TOTP authenticator app + email code verification |
| 🔑 **Google OAuth** | One-tap sign in with your Google account |
| 🌙 **Dark / Light Mode** | Full theme support, synced to your system preference |
| ⏳ **Idle Timeout** | Auto-locks after 45 minutes of inactivity (your readings stay private) |
| 📱 **Android App** | Native WebView APK with SQLite offline cache (3-tier), image saving, and PDF export |

**Consultation panel order:** Translator → Changing-line reading → Method (coins/yarrow) → Execution (auto/manual).

---

## 💰 Token Packs

Tokens are **consumable and accumulate** — they never expire and stack with every purchase.

| Pack | Price | Tokens | Conversations/thread | Image resolution |
|------|-------|--------|----------------------|-----------------|
| 🆓 **Free** | $0 | 2 lifetime | 1 | 1024 × 768 |
| 🔍 **Seeker** | $6.99 | 25 | 3 | 1024 × 1024 |
| 🧘 **Practitioner** | $11.99 | 50 | 5 | 1184 × 1184 |
| 🏯 **Master** | $19.99 | 100 | 8 | 1504 × 1504 |

> Tokens accumulate across purchases. Your conversation depth limit is set by your last purchased pack.
> **Master Combined** mode (all three translators in parallel) consumes **2 tokens** per consultation.

---

## 🌍 Supported Languages

The app responds in the **language you write in**, when that language is clearly detectable. If the question is ambiguous, it falls back to your UI locale (language selector).

Detection is shared between client and server via `apps/web/src/lib/detect-input-language.ts` (script override for CJK/Arabic/Hindi; Latin scripts use scored word patterns with confidence margin).

🇪🇸 Spanish · 🇺🇸 English · 🇧🇷 Portuguese · 🇫🇷 French · 🇩🇪 German · 🇮🇹 Italian · 🇯🇵 Japanese · 🇨🇳 Chinese · 🇰🇷 Korean · 🇸🇦 Arabic · 🇮🇳 Hindi

---

## 📱 Android App

<!-- SCREENSHOT PLACEHOLDER
<div align="center">
  <img src="docs/screenshots/android-home.png" width="180" />
  <img src="docs/screenshots/android-reading.png" width="180" />
  <img src="docs/screenshots/android-image.png" width="180" />
  <img src="docs/screenshots/android-history.png" width="180" />
</div>
-->

The Android app wraps the web experience in a native shell with extras:

- 🌐 Language selector in the native top bar (11 languages)
- 🔐 Google OAuth via external browser (avoids WebView 403 restrictions)
- 📦 SQLite offline cache (3-tier): instant sidebar on cold start, lazy thread loading, background sync
- 🖼️ Save generated images directly to your gallery (local cache + gallery save)
- 📄 Share consultations as PDF via native share sheet
- 🗑️ Chat deletion via secure bearer token (with SQLite sync)
- 🔒 No shared cookie storage (Play Store compliant)
- 📏 Proper safe area insets and status bar integration
- 🛡️ App Integrity attestation (Play Protect + App Access Risk checks)

**Current version:** 4.2.5 (versionCode 65) · **Platform:** Android · **Min SDK:** 24 · **Target SDK:** 36 (Android 16)

> Built on Expo SDK 57 (React Native 0.86, New Architecture) to meet Google Play's target API 36 requirement.
> The APK loads the production web URL (`theoriginaliching.com`) in a WebView — most feature fixes deploy via Vercel without a new APK.

---

## 🛠️ Tech Stack

**Frontend**
- [Next.js 15](https://nextjs.org/) App Router + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + custom design system
- [Supabase](https://supabase.com/) — Auth + PostgreSQL

**Mobile**
- [Expo](https://expo.dev/) SDK 57 + React Native 0.86 (New Architecture) + React Native WebView
- Target API 36 (Android 16); EAS Build (APK + App Bundle)

**AI & Images**
- [Anthropic Claude](https://anthropic.com/) — oracle interpretations
- [Together AI FLUX.1 Schnell](https://together.ai/) — ritual image generation

**Payments**
- [RevenueCat](https://revenuecat.com/) Web Billing + [Stripe](https://stripe.com/)

**Infrastructure**
- [Vercel](https://vercel.com/) — web deployment (staging + production)
- [Upstash Redis](https://upstash.com/) — distributed rate limiting (fail-closed in production)
- [Resend](https://resend.com/) — transactional email (2FA codes, domain: theoriginaliching.com)
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) — CAPTCHA on login/register
- [OpenRouter](https://openrouter.ai/) / [Groq](https://groq.com/) — AI interpretation fallback chain
- [Turborepo](https://turbo.build/) — monorepo build system

---

## 🚀 Quick Start (Developers)

**Prerequisites:** Node.js 22+ · npm 10.9.2 (the declared `packageManager`; the one that resolves the monorepo cleanly; CI installs it explicitly)

```bash
git clone https://github.com/Alexcat84/The-Original-I-Ching-App.git iching-oracle
cd iching-oracle
npm install
cp .env.example .env
```

Edit `.env` with your keys (see comments in `.env.example`).

```bash
npm run dev          # Start all workspaces (web at localhost:3000)
npm run build        # Production build
npm run typecheck    # TypeScript check across monorepo
npm test             # Run all tests
```

**Minimum keys needed for local dev:**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

### 📁 Monorepo Structure

```
├── apps/
│   ├── web/                  # Next.js 15 app → Vercel
│   └── mobile/               # Expo WebView APK → Google Play
├── packages/
│   ├── iching-engine/        # Casting (3-coin, yarrow, Huang/Zhu Xi line rules)
│   ├── oracle-bones-engine/  # Shang divination logic (4 authentic verdicts)
│   ├── context-engine/       # AI context + session limits per tier
│   ├── image-engine/         # Image prompt construction + FLUX limits
│   ├── i18n/                 # 11-language strings (shared web + mobile)
│   ├── iching-data/          # Static 64-hexagram library (Wilhelm/Legge/Zhou Yi)
│   ├── sharing/              # Public reading URL helpers
│   ├── ui/                   # Shared React components
│   └── mobile-api-contracts/ # TypeScript types for native↔web bridge
├── backend/
│   ├── claude/               # Anthropic API integration + fallback chain
│   ├── auth/                 # TOTP, email 2FA, registration validation
│   └── db/migrations/        # ordered SQL migrations (Supabase), latest 075
└── docs/
    ├── auditorias/           # Security, architecture, data integrity audits
    ├── workflows/            # i18n guide, legal flow
    └── setup/                # New DB setup guide
```

### 🗄️ Database

Run migrations in `backend/db/migrations/` **in numeric order** on your Supabase project (001–075). Use `verify_migrations.sql` to confirm all checks pass after applying.

Key recent migrations:
- **075**: codifies the `on_auth_user_created` trigger in the chain (was Dashboard-created; makes the chain blank-DB replayable).
- **074**: `consultations.line_reading_system` (`huang` | `zhuxi`, default `huang`).

> The chain is blank-DB replayable (037 conditional, pg_cron guards in 059/064/065). A CI job (`rls-test`) replays it from scratch and runs cross-user RLS isolation tests on every PR.

### 🧪 Developer QA scripts

```bash
npm run qa:mutation-output      # Mutation-rule interpretation QA (Claude)
node scripts/line-reading-system-qa.mjs   # Huang/Zhu Xi line-reading harness
```

---

## 🔐 Security

- All API routes require authentication via Supabase JWT
- Webhook signatures verified with `timingSafeEqual`
- Service role key never exposed to client
- CSP headers with per-request nonce (Cloudflare Turnstile compatible)
- 2FA: TOTP + email code
- Rate limiting on all sensitive endpoints (Upstash Redis)
- No `.env` files committed to git
- Row-Level Security enforced by Postgres and **verified in CI**: an integration test (`rls-test`) authenticates as two users against a real local stack and asserts cross-user isolation on every user-scoped table
- Blocking CI gates: `ci` (typecheck + tests + build), `resolution-guard` (monorepo react-split integrity), `rls-test` (RLS isolation). See [`docs/auditorias/`](docs/auditorias/)

---

## 🔗 Links

| | |
|--|--|
| 🌐 Production | [theoriginaliching.com](https://theoriginaliching.com) |
| 🧪 Staging | [Vercel preview URL](https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app) |
| 📱 EAS Builds | [expo.dev/accounts/alexcat84](https://expo.dev/accounts/alexcat84/projects/the-original-i-ching/builds) |
| 🎮 Play Console | [Google Play Console](https://play.google.com/console/u/0/developers/7735925863707716505) |
| 🗺️ Architecture map | [`docs/auditorias/00000000-RPT-ARCH-02-system-canvas.md`](docs/auditorias/00000000-RPT-ARCH-02-system-canvas.md) (Mermaid, renders on GitHub) · `ARCHITECTURE_SYSTEM.canvas.tsx` = optional Cursor view |

---

## 📄 License

Private repository — all rights reserved.
