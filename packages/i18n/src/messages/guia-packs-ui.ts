import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

/** Quick guide § packs & pricing (server-rendered with `resolveDocLocale`). */
export type GuiaPacksUiMessages = {
  sectionTitle: string;
  currentPricing: string;
  /** Label before free tier marketing line, e.g. "Free:" */
  freeTierLabel: string;
  /** Product name in pricing list, e.g. "Free" */
  freeProductName: string;
  /** {{count}} for FREE_TOKENS */
  freeLine: string;
  /** {{price}} {{tokens}} {{tokensWord}} — caller fills from TOKEN_PACKS */
  packPriceTemplate: string;
  tokensAccumulate: string;
  perPlanDetailHeading: string;
};

const GUIA_PACKS_UI: Record<AppLocale, GuiaPacksUiMessages> = {
  es: {
    sectionTitle: "Packs y pagos",
    currentPricing: "Precios actuales:",
    freeTierLabel: "Gratuito:",
    freeProductName: "Gratis",
    freeLine: "$0 · {{count}} consultas gratuitas de por vida",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "Tus tokens se acumulan: si compras un nuevo pack antes de agotar el actual, los tokens restantes se suman al nuevo pack.",
    perPlanDetailHeading:
      "Detalle por plan (límites por hilo, consumibles y resolución de imágenes):",
  },
  en: {
    sectionTitle: "Packs and pricing",
    currentPricing: "Current pricing:",
    freeTierLabel: "Free:",
    freeProductName: "Free",
    freeLine: "$0 · {{count}} free lifetime consultations",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "Your tokens accumulate: if you buy a new pack before running out, your remaining tokens carry over and add to the new pack.",
    perPlanDetailHeading: "Per-plan details (per-thread limits, consumable packs, and image resolution):",
  },
  pt: {
    sectionTitle: "Pacotes e pagamentos",
    currentPricing: "Preços atuais:",
    freeTierLabel: "Gratuito:",
    freeProductName: "Grátis",
    freeLine: "$0 · {{count}} consultas gratuitas vitalícias",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "Os teus tokens acumulam-se: se comprares um novo pack antes de esgotar o atual, os tokens restantes somam-se ao novo pack.",
    perPlanDetailHeading:
      "Detalhe por plano (limites por fio, consumíveis e resolução de imagem):",
  },
  fr: {
    sectionTitle: "Packs et paiements",
    currentPricing: "Tarifs actuels :",
    freeTierLabel: "Gratuit :",
    freeProductName: "Gratuit",
    freeLine: "$0 · {{count}} consultations gratuites à vie",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "Vos jetons s’accumulent : si vous achetez un nouveau pack avant d’épuiser l’actuel, les jetons restants s’ajoutent au nouveau pack.",
    perPlanDetailHeading:
      "Détails par offre (limites par fil, packs consommables et résolution d’image) :",
  },
  de: {
    sectionTitle: "Pakete und Zahlungen",
    currentPricing: "Aktuelle Preise:",
    freeTierLabel: "Kostenlos:",
    freeProductName: "Kostenlos",
    freeLine: "$0 · {{count}} lebenslange Gratis-Konsultationen",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "Deine Token summieren sich: Wenn du ein neues Paket kaufst, bevor das aktuelle aufgebraucht ist, werden die restlichen Token zum neuen Paket addiert.",
    perPlanDetailHeading: "Details pro Plan (Thread-Limits, verbrauchbare Pakete, Bildauflösung):",
  },
  it: {
    sectionTitle: "Pacchetti e pagamenti",
    currentPricing: "Prezzi attuali:",
    freeTierLabel: "Gratuito:",
    freeProductName: "Gratuito",
    freeLine: "$0 · {{count}} consultazioni gratuite a vita",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "I tuoi token si accumulano: se acquisti un nuovo pacchetto prima di esaurire quello attuale, i token rimanenti si sommano al nuovo pacchetto.",
    perPlanDetailHeading: "Dettagli per piano (limiti per thread, pacchetti consumabili, risoluzione immagini):",
  },
  ja: {
    sectionTitle: "パックとお支払い",
    currentPricing: "現在の価格:",
    freeTierLabel: "無料：",
    freeProductName: "無料",
    freeLine: "$0 · 生涯無料コンサル {{count}} 回",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "トークンは累積します。現在のパックを使い切る前に新しいパックを購入すると、残りのトークンは新しいパックに加算されます。",
    perPlanDetailHeading: "プラン別の詳細（スレッド上限、消費型パック、画像解像度）:",
  },
  zh: {
    sectionTitle: "套餐与付款",
    currentPricing: "当前价格：",
    freeTierLabel: "免费：",
    freeProductName: "免费",
    freeLine: "$0 · 终身免费咨询 {{count}} 次",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "代币会累积：若在当前包用完前购买新包，剩余代币会并入新包。",
    perPlanDetailHeading: "各方案详情（每线程上限、消耗型包、图像分辨率）：",
  },
  ko: {
    sectionTitle: "팩 및 결제",
    currentPricing: "현재 가격:",
    freeTierLabel: "무료:",
    freeProductName: "무료",
    freeLine: "$0 · 평생 무료 상담 {{count}}회",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "토큰은 누적됩니다. 현재 팩을 다 쓰기 전에 새 팩을 구매하면 남은 토큰이 새 팩에 더해집니다.",
    perPlanDetailHeading: "플랜별 상세(스레드 한도, 소비형 팩, 이미지 해상도):",
  },
  ar: {
    sectionTitle: "الحزم والمدفوعات",
    currentPricing: "الأسعار الحالية:",
    freeTierLabel: "مجاني:",
    freeProductName: "مجاني",
    freeLine: "$0 · {{count}} استشارات مجانية مدى الحياة",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "رموزك تتراكم: إذا اشتريت حزمة جديدة قبل نفاد رموزك، تنتقل الرموز المتبقية وتُضاف إلى الحزمة الجديدة.",
    perPlanDetailHeading: "تفاصيل حسب الخطة (حدود الخيط، الحزم القابلة للاستهلاك، ودقة الصور):",
  },
};

export function getGuiaPacksUiMessages(locale: AppLocale): GuiaPacksUiMessages {
  return GUIA_PACKS_UI[locale] ?? GUIA_PACKS_UI[DEFAULT_LOCALE];
}

export function formatGuiaFreeLine(msg: GuiaPacksUiMessages, freeTokens: number): string {
  return interpolate(msg.freeLine, { count: freeTokens });
}

export function formatGuiaPackPrice(
  msg: GuiaPacksUiMessages,
  price: number,
  tokens: number,
  tokensWord: string,
): string {
  return interpolate(msg.packPriceTemplate, {
    price: price.toFixed(2),
    tokens: String(tokens),
    tokensWord,
  });
}
