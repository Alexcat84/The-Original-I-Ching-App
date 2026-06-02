"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import {
  getFeedbackPageUiMessages,
  getDocNavUiMessages,
  FEEDBACK_CATEGORIES,
  type FeedbackCategory,
} from "@iching-oracle/i18n";
import { useAppLocale } from "@/lib/use-app-locale";
import { CustomSelect, type SelectOption } from "@/components/CustomSelect";

const WEB_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "web";
const SUPPORT_EMAIL = "support@theoriginaliching.com";

declare global {
  interface Window {
    __RN_APP_INFO?: { version: string; androidVersionCode: number | null };
    __rnBridgeInstalled?: boolean;
  }
}

function detectPlatform(): "web" | "android" | "ios" {
  if (typeof document === "undefined") return "web";
  if (document.documentElement.classList.contains("iching-rn-webview")) return "android";
  return "web";
}

function detectAppVersion(): string {
  if (typeof window === "undefined") return WEB_VERSION;
  const rnInfo = window.__RN_APP_INFO;
  if (rnInfo?.version) return rnInfo.version;
  return WEB_VERSION;
}

function categoryLabel(category: FeedbackCategory, m: ReturnType<typeof getFeedbackPageUiMessages>): string {
  switch (category) {
    case "bugs_crashes":             return m.categoryBugsCrashes;
    case "oracle_response_quality":  return m.categoryOracleResponseQuality;
    case "hexagram_generation":      return m.categoryHexagramGeneration;
    case "oracle_bones":             return m.categoryOracleBones;
    case "image_generation":         return m.categoryImageGeneration;
    case "translations":             return m.categoryTranslations;
    case "token_purchase":           return m.categoryTokenPurchase;
    case "account_access":           return m.categoryAccountAccess;
    case "ui_ux":                    return m.categoryUiUx;
    case "general_suggestion":       return m.categoryGeneralSuggestion;
  }
}

export default function FeedbackPage() {
  const locale = useAppLocale();
  const m = getFeedbackPageUiMessages(locale);
  const nav = getDocNavUiMessages(locale);

  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!category) errors.category = m.errorRequired;
    if (description.trim().length < 20) errors.description = m.errorDescriptionMin;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = m.errorEmailFormat;
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [category, description, email, m]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description.trim(),
          email: email.trim() || null,
          locale,
          app_version: detectAppVersion(),
          platform: detectPlatform(),
          metadata: {},
        }),
      });
      if (res.status === 429) { setServerError(m.errorRateLimit); return; }
      if (!res.ok) { setServerError(m.errorServer); return; }
      setSuccess(true);
    } catch {
      setServerError(m.errorServer);
    } finally {
      setLoading(false);
    }
  }, [validate, category, description, email, locale, m]);

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/privacy">{nav.privacyShort}</Link>
      </nav>

      <article className="doc-article">
        <h1>{m.title}</h1>
        <p className="doc-lead">{m.subtitle}</p>

        {success ? (
          <div className="feedback-success">
            <h2>{m.successTitle}</h2>
            <p>{m.successMessage}</p>
            <p className="feedback-support-line">
              {m.supportLabel}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <Link href="/" className="feedback-back-btn">
              {nav.backToOracle}
            </Link>
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleSubmit} noValidate>

            {/* Category */}
            <div className="feedback-field">
              <label htmlFor="fb-category">{m.categoryLabel}</label>
              <CustomSelect<FeedbackCategory>
                id="fb-category"
                value={category}
                onChange={setCategory}
                options={FEEDBACK_CATEGORIES.map((cat): SelectOption<FeedbackCategory> => ({
                  value: cat,
                  label: categoryLabel(cat, m),
                }))}
                placeholder={m.categoryPlaceholder}
                ariaLabel={m.categoryLabel}
                error={!!fieldErrors.category}
              />
              {fieldErrors.category && <span className="feedback-error">{fieldErrors.category}</span>}
            </div>

            {/* Description */}
            <div className="feedback-field">
              <label htmlFor="fb-description">
                {m.descriptionLabel}
                <span className="feedback-char-count">
                  {description.length} / 1000
                </span>
              </label>
              <textarea
                id="fb-description"
                rows={6}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={m.descriptionPlaceholder}
                className={fieldErrors.description ? "feedback-input--error" : ""}
              />
              <span className="feedback-hint">{m.descriptionMinHint}</span>
              {fieldErrors.description && <span className="feedback-error">{fieldErrors.description}</span>}
            </div>

            {/* Email */}
            <div className="feedback-field">
              <label htmlFor="fb-email">
                {m.emailLabel}
                <span className="feedback-optional">{m.emailOptional}</span>
              </label>
              <input
                id="fb-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={m.emailPlaceholder}
                className={fieldErrors.email ? "feedback-input--error" : ""}
              />
              {fieldErrors.email && <span className="feedback-error">{fieldErrors.email}</span>}
            </div>

            {serverError && (
              <p className="feedback-server-error">{serverError}</p>
            )}

            <button
              type="submit"
              className="feedback-submit-btn"
              disabled={loading}
            >
              {loading ? m.submitting : m.submitButton}
            </button>

            <p className="feedback-support-line">
              {m.supportLabel}{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
          </form>
        )}
      </article>

      <nav className="doc-nav">
        <Link href="/">{nav.backToOracle}</Link> ·{" "}
        <Link href="/faqs">{nav.faqs}</Link> ·{" "}
        <Link href="/guia">{nav.userGuide}</Link> ·{" "}
        <Link href="/privacy">{nav.privacyShort}</Link>
      </nav>
    </div>
  );
}
