import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type TokenPackMarketingId = "tokens_seeker_20" | "tokens_practitioner_40" | "tokens_master_100";

export type TokenPackMarketingUiMessages = {
  freeTier: string;
  seeker: string;
  practitioner: string;
  master: string;
};

const TOKEN_PACK_MARKETING_UI: Record<AppLocale, TokenPackMarketingUiMessages> = {
  es: {
    freeTier:
      "Plan gratuito: 2 consultas de por vida, 1 pregunta por hilo. Sin renovación automática; los packs de pago son consumibles. Imágenes generadas en resolución básica.",
    seeker:
      "20 tokens por compra (pack consumible, sin renovación automática). Hasta 3 preguntas encadenadas por hilo. Imágenes generadas en resolución estándar.",
    practitioner:
      "40 tokens por compra (pack consumible, sin renovación automática). Hasta 5 preguntas encadenadas por hilo. Imágenes generadas en alta resolución.",
    master:
      "100 tokens por compra (pack consumible, sin renovación automática). Hasta 8 preguntas encadenadas por hilo. Imágenes generadas en máxima resolución.",
  },
  en: {
    freeTier:
      "Free plan: 2 lifetime consultations, 1 question per thread. No auto-renewal; paid packs are consumable. Generated images use basic resolution.",
    seeker:
      "20 tokens per purchase (consumable pack, no auto-renewal). Up to 3 follow-up questions per thread. Generated images use standard resolution.",
    practitioner:
      "40 tokens per purchase (consumable pack, no auto-renewal). Up to 5 follow-up questions per thread. Generated images use high resolution.",
    master:
      "100 tokens per purchase (consumable pack, no auto-renewal). Up to 8 follow-up questions per thread. Generated images use maximum resolution.",
  },
  pt: {
    freeTier:
      "Plano gratuito: 2 consultas vitalícias, 1 pergunta por fio. Sem renovação automática; os packs pagos são consumíveis. Imagens geradas em resolução básica.",
    seeker:
      "20 tokens por compra (pack consumível, sem renovação automática). Até 3 perguntas encadeadas por fio. Imagens geradas em resolução padrão.",
    practitioner:
      "40 tokens por compra (pack consumível, sem renovação automática). Até 5 perguntas encadeadas por fio. Imagens geradas em alta resolução.",
    master:
      "100 tokens por compra (pack consumível, sem renovação automática). Até 8 perguntas encadeadas por fio. Imagens geradas em resolução máxima.",
  },
  fr: {
    freeTier:
      "Forfait gratuit : 2 consultations à vie, 1 question par fil. Pas de renouvellement automatique ; les packs payants sont consommables. Images générées en résolution basique.",
    seeker:
      "20 jetons par achat (pack consommable, sans renouvellement auto). Jusqu’à 3 questions enchaînées par fil. Images générées en résolution standard.",
    practitioner:
      "40 jetons par achat (pack consommable, sans renouvellement auto). Jusqu’à 5 questions enchaînées par fil. Images générées en haute résolution.",
    master:
      "100 jetons par achat (pack consommable, sans renouvellement auto). Jusqu’à 8 questions enchaînées par fil. Images générées en résolution maximale.",
  },
  de: {
    freeTier:
      "Kostenloser Plan: 2 lebenslange Konsultationen, 1 Frage pro Thread. Keine automatische Verlängerung; bezahlte Pakete sind verbrauchbar. Generierte Bilder in Basisauflösung.",
    seeker:
      "20 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 3 Anschlussfragen pro Thread. Generierte Bilder in Standardauflösung.",
    practitioner:
      "40 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 5 Anschlussfragen pro Thread. Generierte Bilder in hoher Auflösung.",
    master:
      "100 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 8 Anschlussfragen pro Thread. Generierte Bilder in maximaler Auflösung.",
  },
  it: {
    freeTier:
      "Piano gratuito: 2 consultazioni a vita, 1 domanda per thread. Nessun rinnovo automatico; i pacchetti a pagamento sono consumabili. Immagini generate in risoluzione base.",
    seeker:
      "20 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 3 domande concatenate per thread. Immagini generate in risoluzione standard.",
    practitioner:
      "40 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 5 domande concatenate per thread. Immagini generate in alta risoluzione.",
    master:
      "100 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 8 domande concatenate per thread. Immagini generate in risoluzione massima.",
  },
  ja: {
    freeTier:
      "無料プラン：生涯2回の相談、スレッドあたり1問。自動更新なし。有料パックは消費型。生成画像は基本解像度です。",
    seeker:
      "購入ごとに20トークン（使い切りパック、自動更新なし）。スレッドあと3問まで連続で質問可能。生成画像は標準解像度。",
    practitioner:
      "購入ごとに40トークン（使い切りパック、自動更新なし）。スレッドあと5問まで連続で質問可能。生成画像は高解像度。",
    master:
      "購入ごとに100トークン（使い切りパック、自動更新なし）。スレッドあと8問まで連続で質問可能。生成画像は最高解像度。",
  },
  zh: {
    freeTier:
      "免费方案：终身 2 次咨询，每个线程 1 个问题。无自动续费；付费包为消耗型。生成图像为基础分辨率。",
    seeker:
      "每次购买 20 个代币（消耗型包，无自动续费）。每个线程最多连续 3 个追问。生成图像为标准分辨率。",
    practitioner:
      "每次购买 40 个代币（消耗型包，无自动续费）。每个线程最多连续 5 个追问。生成图像为高分辨率。",
    master:
      "每次购买 100 个代币（消耗型包，无自动续费）。每个线程最多连续 8 个追问。生成图像为最高分辨率。",
  },
  ko: {
    freeTier:
      "무료 플랜: 평생 2회 상담, 스레드당 1개 질문. 자동 갱신 없음. 유료 팩은 소모형입니다. 생성 이미지는 기본 해상도입니다.",
    seeker:
      "구매당 20토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 3개의 연속 질문. 생성 이미지는 표준 해상도.",
    practitioner:
      "구매당 40토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 5개의 연속 질문. 생성 이미지는 고해상도.",
    master:
      "구매당 100토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 8개의 연속 질문. 생성 이미지는 최고 해상도.",
  },
};

const PACK_KEY: Record<TokenPackMarketingId, keyof TokenPackMarketingUiMessages> = {
  tokens_seeker_20: "seeker",
  tokens_practitioner_40: "practitioner",
  tokens_master_100: "master",
};

/** Short product titles for pricing tables, checkout, and guide lists (aligned with TOKEN_PACKS ids). */
const TOKEN_PACK_LABELS: Record<AppLocale, Record<TokenPackMarketingId, string>> = {
  es: {
    tokens_seeker_20: "Pack Seeker",
    tokens_practitioner_40: "Pack Practitioner",
    tokens_master_100: "Pack Master",
  },
  en: {
    tokens_seeker_20: "Seeker Pack",
    tokens_practitioner_40: "Practitioner Pack",
    tokens_master_100: "Master Pack",
  },
  pt: {
    tokens_seeker_20: "Pack Seeker",
    tokens_practitioner_40: "Pack Practitioner",
    tokens_master_100: "Pack Master",
  },
  fr: {
    tokens_seeker_20: "Pack Seeker",
    tokens_practitioner_40: "Pack Practitioner",
    tokens_master_100: "Pack Master",
  },
  de: {
    tokens_seeker_20: "Seeker-Paket",
    tokens_practitioner_40: "Practitioner-Paket",
    tokens_master_100: "Master-Paket",
  },
  it: {
    tokens_seeker_20: "Pack Seeker",
    tokens_practitioner_40: "Pack Practitioner",
    tokens_master_100: "Pack Master",
  },
  ja: {
    tokens_seeker_20: "シーカーパック",
    tokens_practitioner_40: "プラクティショナーパック",
    tokens_master_100: "マスターパック",
  },
  zh: {
    tokens_seeker_20: "探索者套餐",
    tokens_practitioner_40: "修行者套餐",
    tokens_master_100: "大师套餐",
  },
  ko: {
    tokens_seeker_20: "시커 팩",
    tokens_practitioner_40: "프랙티셔너 팩",
    tokens_master_100: "마스터 팩",
  },
};

export function getTokenPackLabel(packId: TokenPackMarketingId, locale: AppLocale): string {
  const byLocale = TOKEN_PACK_LABELS[locale] ?? TOKEN_PACK_LABELS[DEFAULT_LOCALE];
  return byLocale[packId] ?? TOKEN_PACK_LABELS.en[packId];
}

export function getTokenPackMarketingMessages(locale: AppLocale): TokenPackMarketingUiMessages {
  return TOKEN_PACK_MARKETING_UI[locale] ?? TOKEN_PACK_MARKETING_UI[DEFAULT_LOCALE];
}

export function getFreeTierMarketing(locale: AppLocale): string {
  return getTokenPackMarketingMessages(locale).freeTier;
}

export function getPackMarketingLine(packId: TokenPackMarketingId, locale: AppLocale): string {
  const m = getTokenPackMarketingMessages(locale);
  const key = PACK_KEY[packId];
  return m[key];
}
