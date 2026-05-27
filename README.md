# 🔮 The Original I Ching App

<div align="center">

![Version](https://img.shields.io/badge/version-3.3.0-gold)
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

- **I Ching** — The classic Chinese Book of Changes. Three coins cast 64 hexagrams, interpreted by Claude AI using the Wilhelm/Baynes and Zhu Xi traditions.
- **Oracle Bones** — Shang dynasty–style divination. A charge is inscribed, cracked over heat, and a verdict appears: *auspicious 吉* or *inauspicious 凶*.

Every consultation includes a unique **AI-generated ritual image** that reflects the energy of your reading.

---

## 🌟 Features

| Feature | Description |
|---------|-------------|
| 🔮 **I Ching Consultation** | Full three-coin casting following Zhu Xi method. 64 hexagrams + changing lines |
| 🦴 **Oracle Bones** | Shang dynasty divination with turtle shell / ox bone medium and full verdict system |
| 🤖 **AI Interpretation** | Claude AI generates deep, contextual readings. Each one unique |
| 🖼️ **Ritual Images** | AI-generated art per consultation via FLUX.1 Schnell. Resolution scales with your tier |
| 💬 **Conversation Threads** | Deepen your reading across multiple exchanges in the same session |
| 📜 **Chat History** | All consultations saved, browsable, and fully searchable |
| 📄 **Export to PDF** | Download any consultation as a beautifully formatted PDF |
| 📚 **Hexagram Library** | Browse all 64 hexagrams with Wilhelm, Legge, and Zhou Yi translations |
| 🌍 **9 Languages** | ES · EN · PT · FR · DE · IT · JA · ZH · KO |
| 🔒 **2FA Security** | TOTP authenticator app + email code verification |
| 🔑 **Google OAuth** | One-tap sign in with your Google account |
| 🌙 **Dark / Light Mode** | Full theme support, synced to your system preference |
| ⏳ **Idle Timeout** | Auto-locks after 45 minutes of inactivity (your readings stay private) |
| 📱 **Android App** | Native WebView APK with SQLite offline cache (3-tier), image saving, and PDF export |

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

The app auto-detects the language of your question and responds accordingly.

🇪🇸 Spanish · 🇺🇸 English · 🇧🇷 Portuguese · 🇫🇷 French · 🇩🇪 German · 🇮🇹 Italian · 🇯🇵 Japanese · 🇨🇳 Chinese · 🇰🇷 Korean

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

- 🌐 Language selector in the native top bar
- 🔐 Google OAuth via external browser (avoids WebView 403 restrictions)
- 🖼️ Save generated images directly to your gallery
- 📄 Share consultations as PDF via native share sheet
- 🔒 No shared cookie storage (Play Store compliant)
- 📏 Proper safe area insets and status bar integration

**Current version:** 3.3.0 (versionCode 23) · **Platform:** Android · **Min SDK:** 24

---

## 🛠️ Tech Stack

**Frontend**
- [Next.js 15](https://nextjs.org/) App Router + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) + custom design system
- [Supabase](https://supabase.com/) — Auth + PostgreSQL

**Mobile**
- [Expo](https://expo.dev/) + React Native WebView
- EAS Build (APK + App Bundle)

**AI & Images**
- [Anthropic Claude](https://anthropic.com/) — oracle interpretations
- [Together AI FLUX.1 Schnell](https://together.ai/) — ritual image generation

**Payments**
- [RevenueCat](https://revenuecat.com/) Web Billing + [Stripe](https://stripe.com/)

**Infrastructure**
- [Vercel](https://vercel.com/) — web deployment (staging + production)
- [Upstash Redis](https://upstash.com/) — rate limiting
- [Resend](https://resend.com/) — transactional email (2FA codes)
- [Turborepo](https://turbo.build/) — monorepo build system

---

## 🚀 Quick Start (Developers)

**Prerequisites:** Node.js 20+ · npm 10+

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
npm run test         # Run all tests
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
│   ├── web/                  # Next.js app → Vercel
│   └── mobile/               # Expo WebView APK → Google Play
├── packages/
│   ├── iching-engine/        # Hexagram casting logic
│   ├── oracle-bones-engine/  # Shang divination logic
│   ├── context-engine/       # AI context + session management
│   ├── claude/               # Anthropic API integration
│   ├── image-engine/         # Image prompt construction
│   └── i18n/                 # 9-language strings
└── backend/
    └── db/migrations/        # 38 ordered SQL migrations (Supabase)
```

### 🗄️ Database

Run migrations in `backend/db/migrations/` **in numeric order** on your Supabase project.

---

## 🔐 Security

- All API routes require authentication via Supabase JWT
- Webhook signatures verified with `timingSafeEqual`
- Service role key never exposed to client
- CSP headers with per-request nonce (Cloudflare Turnstile compatible)
- 2FA: TOTP + email code
- Rate limiting on all sensitive endpoints (Upstash Redis)
- No `.env` files committed to git

---

## 🔗 Links

| | |
|--|--|
| 🌐 Production | [theoriginaliching.com](https://theoriginaliching.com) |
| 🧪 Staging | [Vercel preview URL](https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app) |
| 📱 EAS Builds | [expo.dev/accounts/alexcat84](https://expo.dev/accounts/alexcat84/projects/the-original-i-ching/builds) |
| 🎮 Play Console | [Google Play Console](https://play.google.com/console/u/0/developers/7735925863707716505) |

---

## 📄 License

Private repository — all rights reserved.
