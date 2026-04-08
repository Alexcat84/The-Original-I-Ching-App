import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type CookieConsentUiMessages = {
  bannerIntroBeforePrivacy: string;
  bannerPrivacyLink: string;
  bannerIntroAfterPrivacy: string;
  necessaryOnly: string;
  acceptAll: string;
};

const COOKIE_CONSENT_UI: Record<AppLocale, CookieConsentUiMessages> = {
  es: {
    bannerIntroBeforePrivacy:
      "Usamos cookies necesarias para la sesión y el idioma en las páginas legales; si aceptas, también analítica para mejorar el servicio. Más detalle en ",
    bannerPrivacyLink: "privacidad",
    bannerIntroAfterPrivacy: ".",
    necessaryOnly: "Solo necesarias",
    acceptAll: "Aceptar todas",
  },
  en: {
    bannerIntroBeforePrivacy:
      "We use necessary cookies for session and language on legal pages; if you accept, we also use analytics to improve the service. More detail in ",
    bannerPrivacyLink: "privacy",
    bannerIntroAfterPrivacy: ".",
    necessaryOnly: "Necessary only",
    acceptAll: "Accept all",
  },
  pt: {
    bannerIntroBeforePrivacy:
      "Usamos cookies necessárias para sessão e idioma nas páginas legais; se aceitares, também analítica para melhorar o serviço. Mais detalhes em ",
    bannerPrivacyLink: "privacidade",
    bannerIntroAfterPrivacy: ".",
    necessaryOnly: "Só necessárias",
    acceptAll: "Aceitar todas",
  },
  fr: {
    bannerIntroBeforePrivacy:
      "Nous utilisons des cookies nécessaires pour la session et la langue sur les pages légales ; si vous acceptez, aussi de l’analytique pour améliorer le service. Plus de détails dans ",
    bannerPrivacyLink: "confidentialité",
    bannerIntroAfterPrivacy: ".",
    necessaryOnly: "Nécessaires uniquement",
    acceptAll: "Tout accepter",
  },
  de: {
    bannerIntroBeforePrivacy:
      "Wir nutzen notwendige Cookies für Sitzung und Sprache auf Rechtsseiten; bei Zustimmung auch Analyse zur Verbesserung des Dienstes. Mehr in ",
    bannerPrivacyLink: "Datenschutz",
    bannerIntroAfterPrivacy: ".",
    necessaryOnly: "Nur notwendige",
    acceptAll: "Alle akzeptieren",
  },
  it: {
    bannerIntroBeforePrivacy:
      "Usiamo cookie necessari per sessione e lingua sulle pagine legali; se accetti, anche analitica per migliorare il servizio. Dettagli in ",
    bannerPrivacyLink: "privacy",
    bannerIntroAfterPrivacy: ".",
    necessaryOnly: "Solo necessari",
    acceptAll: "Accetta tutti",
  },
  ja: {
    bannerIntroBeforePrivacy:
      "法的ページではセッションと言語に必要なクッキーを使用します。同意いただくと、サービス改善のための分析も行います。詳しくは",
    bannerPrivacyLink: "プライバシー",
    bannerIntroAfterPrivacy: "をご覧ください。",
    necessaryOnly: "必要なもののみ",
    acceptAll: "すべて許可",
  },
  zh: {
    bannerIntroBeforePrivacy:
      "我们在法律页面使用必要的会话与语言 Cookie；若您同意，还会使用分析以改进服务。详见",
    bannerPrivacyLink: "隐私政策",
    bannerIntroAfterPrivacy: "。",
    necessaryOnly: "仅必要",
    acceptAll: "接受全部",
  },
  ko: {
    bannerIntroBeforePrivacy:
      "법적 페이지에서 세션과 언어에 필요한 쿠키를 사용합니다. 동의하시면 서비스 개선을 위한 분석도 사용합니다. 자세한 내용은 ",
    bannerPrivacyLink: "개인정보 처리방침",
    bannerIntroAfterPrivacy: "을 참고하세요.",
    necessaryOnly: "필수만",
    acceptAll: "모두 허용",
  },
};

export function getCookieConsentUiMessages(locale: AppLocale): CookieConsentUiMessages {
  return COOKIE_CONSENT_UI[locale] ?? COOKIE_CONSENT_UI[DEFAULT_LOCALE];
}
