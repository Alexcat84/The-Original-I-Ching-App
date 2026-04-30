import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Web-only: compact Play promo strip (top of chat app; hidden in RN WebView). */
export type OraclePresentationUiMessages = {
  regionAria: string;
  playBadgeTitle: string;
  playBadgeSubtitle: string;
  playSoon: string;
  /** Visible label when the listing URL is configured. */
  playInstall: string;
  playCtaAria: string;
  /** aria-label for dismissing the Play promo strip. */
  playStripDismissAria: string;
};

const ORACLE_PRESENTATION_UI: Record<AppLocale, OraclePresentationUiMessages> = {
  es: {
    regionAria: "Descargar la app en Google Play",
    playBadgeTitle: "Llévala contigo",
    playBadgeSubtitle: "Google Play",
    playSoon: "Enlace próximamente",
    playInstall: "Instalar",
    playCtaAria: "Abrir en Google Play",
    playStripDismissAria: "Cerrar aviso de Google Play",
  },
  en: {
    regionAria: "Download the app on Google Play",
    playBadgeTitle: "Take it with you",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link coming soon",
    playInstall: "Install",
    playCtaAria: "Open on Google Play",
    playStripDismissAria: "Dismiss Google Play notice",
  },
  pt: {
    regionAria: "Baixar o app na Google Play",
    playBadgeTitle: "Leve com você",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link em breve",
    playInstall: "Instalar",
    playCtaAria: "Abrir na Google Play",
    playStripDismissAria: "Fechar aviso da Google Play",
  },
  fr: {
    regionAria: "Télécharger l’app sur Google Play",
    playBadgeTitle: "Emportez l’oracle",
    playBadgeSubtitle: "Google Play",
    playSoon: "Lien bientôt disponible",
    playInstall: "Installer",
    playCtaAria: "Ouvrir sur Google Play",
    playStripDismissAria: "Fermer l’avis Google Play",
  },
  de: {
    regionAria: "App bei Google Play herunterladen",
    playBadgeTitle: "Immer dabei",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link folgt in Kürze",
    playInstall: "Installieren",
    playCtaAria: "In Google Play öffnen",
    playStripDismissAria: "Google Play-Hinweis schließen",
  },
  it: {
    regionAria: "Scarica l’app su Google Play",
    playBadgeTitle: "Portala con te",
    playBadgeSubtitle: "Google Play",
    playSoon: "Link disponibile a breve",
    playInstall: "Installa",
    playCtaAria: "Apri su Google Play",
    playStripDismissAria: "Chiudi avviso Google Play",
  },
  ja: {
    regionAria: "Google Play でアプリを入手",
    playBadgeTitle: "いつでも手元に",
    playBadgeSubtitle: "Google Play",
    playSoon: "リンクは近日公開",
    playInstall: "インストール",
    playCtaAria: "Google Play で開く",
    playStripDismissAria: "Google Play の案内を閉じる",
  },
  zh: {
    regionAria: "在 Google Play 下载应用",
    playBadgeTitle: "随身携带",
    playBadgeSubtitle: "Google Play",
    playSoon: "链接即将上线",
    playInstall: "安装",
    playCtaAria: "在 Google Play 打开",
    playStripDismissAria: "关闭 Google Play 提示",
  },
  ko: {
    regionAria: "Google Play에서 앱 받기",
    playBadgeTitle: "언제 어디서나",
    playBadgeSubtitle: "Google Play",
    playSoon: "링크 준비 중",
    playInstall: "설치",
    playCtaAria: "Google Play에서 열기",
    playStripDismissAria: "Google Play 안내 닫기",
  },
  ar: {
    regionAria: "تحميل التطبيق على Google Play",
    playBadgeTitle: "احمله معك",
    playBadgeSubtitle: "Google Play",
    playSoon: "الرابط قريبًا",
    playInstall: "تثبيت",
    playCtaAria: "فتح على Google Play",
    playStripDismissAria: "إغلاق شريط إشعار Google Play",
  },
  hi: {
    regionAria: "Google Play पर ऐप डाउनलोड करें",
    playBadgeTitle: "इसे अपने साथ ले जाएं",
    playBadgeSubtitle: "Google Play",
    playSoon: "लिंक जल्द आएगा",
    playInstall: "इंस्टॉल करें",
    playCtaAria: "Google Play पर खोलें",
    playStripDismissAria: "Google Play सूचना बंद करें",
  },
};

export function getOraclePresentationUiMessages(locale: AppLocale): OraclePresentationUiMessages {
  return ORACLE_PRESENTATION_UI[locale] ?? ORACLE_PRESENTATION_UI[DEFAULT_LOCALE];
}
