# WORKFLOW: Legal acceptance post-authentication gate

**Código:** `00000000-WF-AUTH-01 legal-post-auth` · **Familia:** AUTH · **Estado:** reference

**Version**: 1.0  
**Status**: Approved (implementation)  
**Primary code**: [`apps/web/src/app/auth/callback/page.tsx`](../../apps/web/src/app/auth/callback/page.tsx), [`apps/web/src/app/auth/complete-legal/page.tsx`](../../apps/web/src/app/auth/complete-legal/page.tsx), [`apps/web/src/lib/post-auth-legal.ts`](../../apps/web/src/lib/post-auth-legal.ts)

## Overview

After the user obtains a Supabase session (OAuth code exchange, email link, or email/password sign-in), the app must ensure a row exists in `user_legal_acceptances` for the **current** terms and privacy versions before using the main app. If not, the user is routed to `/auth/complete-legal`, accepts the modal, and `POST /api/auth/legal-consent` runs with `source: post_login`.

## Actors

| Actor | Role |
| --- | --- |
| Browser client | Exchanges OAuth code, holds session, fetches `/api/account/me`, shows modal |
| Next.js API | `GET /api/account/me`, `POST /api/auth/legal-consent` |
| Supabase Auth | Session / JWT |
| Postgres | `public.users`, `user_legal_acceptances` |

## Prerequisites

- `CURRENT_TERMS_VERSION` / `CURRENT_PRIVACY_VERSION` defined in [`apps/web/src/lib/legal-consent.ts`](../../apps/web/src/lib/legal-consent.ts).
- `SUPABASE_SERVICE_ROLE_KEY` available server-side for inserts (existing legal-consent route).

## Trigger

- Successful navigation to `/auth/callback` with optional `?code=`.
- Successful `signInWithPassword` on `/login`.
- Direct visit to `/login` while already signed in (session refresh).

## Workflow tree (summary)

1. **Session present?** No → redirect `/login`.
2. **Best-effort legacy sync** (callback only): if `sessionStorage` holds valid `google_oauth` consent, or `user_metadata` holds pending email signup consent → `POST /api/auth/legal-consent` (existing behaviour).
3. **GET `/api/account/me`** with `Authorization: Bearer <access_token>`.
4. **Response 401** → redirect `/login` (invalid/expired session).
5. **Response 200** and `legal_acceptance_current === true` → redirect `/`.
6. **Otherwise** → redirect `/auth/complete-legal`.
7. **On `/auth/complete-legal`**: show `LegalConsentModal`; on accept → `POST /api/auth/legal-consent` with `createLegalConsentPayload("post_login")`; on success → clear `sessionStorage` key `iching_legal_consent_pending_v1` if present → redirect `/`. On cancel → `signOut()` → `/login`.
8. **Home (`/`) hydration**: when `/api/account/me` returns `legal_acceptance_current === false`, client redirects to `/auth/complete-legal` (covers deep links / refresh with session but missing acceptance).

## Handoff: Client → `GET /api/account/me`

- **Headers**: `Authorization: Bearer <supabase_access_token>`
- **Success 200**: JSON includes `legal_acceptance_current: boolean` (among other fields). See [`apps/web/src/app/api/account/me/route.ts`](../../apps/web/src/app/api/account/me/route.ts).
- **Failure 401**: Treat as unauthenticated → `/login`.
- **Other errors**: Treat as `legal_acceptance_current` false (user sent to complete-legal; can retry).

## Handoff: Client → `POST /api/auth/legal-consent`

- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**: `LegalConsentPayload` with `source` in `google_oauth` | `post_login` | `email_signup` (complete-legal uses `post_login`).
- **Success**: `{ ok: true }`
- **400**: validation / wrong versions
- **401**: auth required

## Test cases

| ID | Scenario | Expected |
| --- | --- | --- |
| TC-01 | New Google user, no sessionStorage | Callback → GET me → false → `/auth/complete-legal` → POST → row in `user_legal_acceptances` → `/` |
| TC-02 | Returning Google user with current legal row | Callback → GET me → true → `/` |
| TC-03 | User with old acceptance versions only | GET me → false → complete-legal → new row (unique per version pair) |
| TC-04 | Email/password sign-in, no legal row | After signIn → GET me → false → complete-legal |
| TC-05 | Email signup confirmation with metadata + callback POST | Regression: metadata path still attempted before gate |
| TC-06 | WebView OAuth, sessionStorage missing | Gate still routes to complete-legal |

## Assumptions

| ID | Assumption | Risk if wrong |
| --- | --- | --- |
| A1 | `legal_acceptance_current` from `account/me` matches DB truth for current version pair | User blocked or admitted incorrectly |
| A2 | `post_login` is acceptable in analytics for gate-driven acceptances | Reporting semantics |

## Integration checklist (release)

- [ ] Bump legal versions only with migration / comms plan.
- [ ] Staging: create user without `user_legal_acceptances` → sign in → lands on complete-legal → after accept, row exists for `CURRENT_*`.
- [ ] Staging: OAuth in Android WebView without prior modal → complete-legal appears.
- [ ] No redirect loop: `/auth/complete-legal` with no session → `/login`.
- [ ] `npm run typecheck` and `npm run test` in `apps/web` pass.

## QA manual — WebView / APK

1. Install staging APK (or WebView to staging URL).
2. Sign out; use Google from **Iniciar sesión** (no pre-modal).
3. Complete Google in external browser; return to app.
4. Confirm **legal modal** appears (complete-legal); scroll and accept.
5. Verify Supabase `user_legal_acceptances` for your `user_id` with current versions.
6. Sign out and sign in again with Google → should go **straight** to oracle (no modal).

## Registry (view: by workflow)

| Workflow | Spec file | Status | Trigger |
| --- | --- | --- | --- |
| Legal post-auth gate | 00000000-WF-AUTH-01-legal-post-auth.md | Approved | Session established |
