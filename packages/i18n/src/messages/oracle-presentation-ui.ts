import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Web-only chrome: Play badge + copyright outside the chat card. */
export type OraclePresentationUiMessages = {
  regionAria: string;
  playBadgeTitle: string;
  playBadgeSubtitle: string;
  playSoon: string;
  /** Visible label when the listing URL is configured. */
  playInstall: string;
  playCtaAria: string;
  copyrightRights: string;
  /** Visible year in copyright line. */
  copyrightYear: string;
  /** Domain label (no scheme) for the public site link. */
  siteDomain: string;
};

const ORACLE_PRESENTATION_UI: Record<AppLocale, OraclePresentationUiMessages> = {
  es: {
    regionAria: "Descarga en Google Play y aviso legal",
    playBadgeTitle: "Llévala contigo",
    playBadgeSubtitle: "Google Play",
    playSoon: "Enlace próximamente",
    playInstall: "Instalar",
    playCtaAria: "Abrir en Google Play",
    copyrightRights: "Todos los derechos reservados",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  en: {
    regionAria: "Google Play download and legal",
    playBadgeTitle: "Take it with you",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link coming soon",
    playInstall: "Install",
    playCtaAria: "Open on Google Play",
    copyrightRights: "All rights reserved",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  pt: {
    regionAria: "Google Play e aviso legal",
    playBadgeTitle: "Leve com você",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link em breve",
    playInstall: "Instalar",
    playCtaAria: "Abrir na Google Play",
    copyrightRights: "Todos os direitos reservados",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  fr: {
    regionAria: "Téléchargement Google Play et mentions",
    playBadgeTitle: "Emportez l’oracle",
    playBadgeSubtitle: "Google Play",
    playSoon: "Lien bientôt disponible",
    playInstall: "Installer",
    playCtaAria: "Ouvrir sur Google Play",
    copyrightRights: "Tous droits réservés",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  de: {
    regionAria: "Google Play und rechtlicher Hinweis",
    playBadgeTitle: "Immer dabei",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link folgt in Kürze",
    playInstall: "Installieren",
    playCtaAria: "In Google Play öffnen",
    copyrightRights: "Alle Rechte vorbehalten",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  it: {
    regionAria: "Google Play e note legali",
    playBadgeTitle: "Portala con te",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link disponibile a breve",
    playInstall: "Installa",
    playCtaAria: "Apri su Google Play",
    copyrightRights: "Tutti i diritti riservati",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  ja: {
    regionAria: "Google Play と著作権表示",
    playBadgeTitle: "いつでも手元に",
    playBadgeSubtitle: "Google Play",
    playSoon: "リンクは近日公開",
    playInstall: "インストール",
    playCtaAria: "Google Play で開く",
    copyrightRights: "無断複写・転載を禁じます",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  zh: {
    regionAria: "Google Play 与版权信息",
    playBadgeTitle: "随身携带",
    playBadgeSubtitle: "Google Play",
    playSoon: "链接即将上线",
    playInstall: "安装",
    playCtaAria: "在 Google Play 打开",
    copyrightRights: "保留所有权利",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
  ko: {
    regionAria: "Google Play 및 법적 고지",
    playBadgeTitle: "언제 어디서나",
    playBadgeSubtitle: "Google Play",
    playSoon: "링크 준비 중",
    playInstall: "설치",
    playCtaAria: "Google Play에서 열기",
    copyrightRights: "판권 소유",
    copyrightYear: "2026",
    siteDomain: "theoriginaliching.com",
  },
};

export function getOraclePresentationUiMessages(locale: AppLocale): OraclePresentationUiMessages {
  return ORACLE_PRESENTATION_UI[locale] ?? ORACLE_PRESENTATION_UI[DEFAULT_LOCALE];
}
