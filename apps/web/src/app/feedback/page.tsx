"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import {
  getFeedbackPageUiMessages,
  getDocNavUiMessages,
  FEEDBACK_CATEGORIES,
  SUPPORTED_LOCALES,
  type FeedbackCategory,
  type AppLocale,
} from "@iching-oracle/i18n";
import { useAppLocale } from "@/lib/use-app-locale";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "web";
const SUPPORT_EMAIL = "support@theoriginaliching.com";

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
  const [appLocale, setAppLocale] = useState<AppLocale>(locale);
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
          locale: appLocale,
          app_version: APP_VERSION,
          platform: "web",
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
  }, [validate, category, description, email, appLocale, m]);

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
              <select
                id="fb-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory | "")}
                className={fieldErrors.category ? "feedback-input--error" : ""}
              >
                <option value="" disabled>{m.categoryPlaceholder}</option>
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{categoryLabel(cat, m)}</option>
                ))}
              </select>
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

            {/* App locale at time of issue */}
            <div className="feedback-field">
              <label htmlFor="fb-locale">{m.localeLabel}</label>
              <select
                id="fb-locale"
                value={appLocale}
                onChange={(e) => setAppLocale(e.target.value as AppLocale)}
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <option key={loc} value={loc}>{loc.toUpperCase()}</option>
                ))}
              </select>
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
