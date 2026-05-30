import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

export type TwoFactorEmailUiMessages = {
  subject: string;
  text: string;
  html: string;
};

const TWO_FACTOR_EMAIL_UI: Record<AppLocale, TwoFactorEmailUiMessages> = {
  es: {
    subject: "Tu código de verificación (2FA) | The Original I Ching App",
    text: "Tu código de verificación es: {{code}}. Expira en {{ttlMinutes}} minutos.",
    html: "<p>Tu código de verificación es:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>Expira en {{ttlMinutes}} minutos.</p>",
  },
  en: {
    subject: "Your verification code (2FA) | The Original I Ching App",
    text: "Your verification code is: {{code}}. It expires in {{ttlMinutes}} minutes.",
    html: "<p>Your verification code is:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>It expires in {{ttlMinutes}} minutes.</p>",
  },
  pt: {
    subject: "O teu código de verificação (2FA) | The Original I Ching App",
    text: "O teu código de verificação é: {{code}}. Expira em {{ttlMinutes}} minutos.",
    html: "<p>O teu código de verificação é:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>Expira em {{ttlMinutes}} minutos.</p>",
  },
  fr: {
    subject: "Votre code de vérification (2FA) | The Original I Ching App",
    text: "Votre code de vérification est : {{code}}. Il expire dans {{ttlMinutes}} minutes.",
    html: "<p>Votre code de vérification est :</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>Il expire dans {{ttlMinutes}} minutes.</p>",
  },
  de: {
    subject: "Dein Bestätigungscode (2FA) | The Original I Ching App",
    text: "Dein Bestätigungscode lautet: {{code}}. Er läuft in {{ttlMinutes}} Minuten ab.",
    html: "<p>Dein Bestätigungscode lautet:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>Er läuft in {{ttlMinutes}} Minuten ab.</p>",
  },
  it: {
    subject: "Il tuo codice di verifica (2FA) | The Original I Ching App",
    text: "Il tuo codice di verifica è: {{code}}. Scade tra {{ttlMinutes}} minuti.",
    html: "<p>Il tuo codice di verifica è:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>Scade tra {{ttlMinutes}} minuti.</p>",
  },
  ja: {
    subject: "確認コード (2FA) | The Original I Ching App",
    text: "確認コード: {{code}}。有効期限は {{ttlMinutes}} 分です。",
    html: "<p>確認コード:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>有効期限は {{ttlMinutes}} 分です。</p>",
  },
  zh: {
    subject: "您的验证码 (2FA) | The Original I Ching App",
    text: "您的验证码是：{{code}}。将在 {{ttlMinutes}} 分钟后过期。",
    html: "<p>您的验证码是：</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>将在 {{ttlMinutes}} 分钟后过期。</p>",
  },
  ko: {
    subject: "인증 코드 (2FA) | The Original I Ching App",
    text: "인증 코드: {{code}}. {{ttlMinutes}}분 후 만료됩니다.",
    html: "<p>인증 코드:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>{{ttlMinutes}}분 후 만료됩니다.</p>",
  },
  ar: {
    subject: "رمز التحقق (2FA) | The Original I Ching App",
    text: "رمز التحقق الخاص بك: {{code}}. ينتهي خلال {{ttlMinutes}} دقيقة.",
    html: "<p>رمز التحقق الخاص بك:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>ينتهي خلال {{ttlMinutes}} دقيقة.</p>",
  },
  hi: {
    subject: "आपका सत्यापन कोड (2FA) | The Original I Ching App",
    text: "आपका सत्यापन कोड: {{code}}। {{ttlMinutes}} मिनट में समाप्त होगा।",
    html: "<p>आपका सत्यापन कोड:</p><p style=\"font-size:24px;font-weight:700;letter-spacing:3px\">{{code}}</p><p>{{ttlMinutes}} मिनट में समाप्त होगा।</p>",
  },
};

export function getTwoFactorEmailUiMessages(
  locale: AppLocale,
): TwoFactorEmailUiMessages {
  return TWO_FACTOR_EMAIL_UI[locale] ?? TWO_FACTOR_EMAIL_UI[DEFAULT_LOCALE];
}

export function formatTwoFactorEmailBody(
  m: TwoFactorEmailUiMessages,
  code: string,
  ttlMinutes: number,
): { subject: string; text: string; html: string } {
  const vars = { code, ttlMinutes: String(ttlMinutes) };
  return {
    subject: m.subject,
    text: interpolate(m.text, vars),
    html: interpolate(m.html, vars),
  };
}
