import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type TokenPackMarketingId =
  | "tokens_seeker_20"
  | "tokens_practitioner_40"
  | "tokens_master_100";

export type TokenPackMarketingUiMessages = {
  freeTier: string;
  seeker: string;
  practitioner: string;
  master: string;
};

const TOKEN_PACK_MARKETING_UI: Record<AppLocale, TokenPackMarketingUiMessages> =
  {
    es: {
      freeTier:
        "Plan gratuito: 2 consultas de por vida, 1 pregunta por hilo. Sin renovación automática; los packs de pago son consumibles. Imágenes generadas en resolución básica.",
      seeker:
        "25 tokens por compra (pack consumible, sin renovación automática). Hasta 3 preguntas encadenadas por hilo. Imágenes generadas en resolución estándar. Acceso a Wilhelm y Legge.",
      practitioner:
        "50 tokens por compra (pack consumible, sin renovación automática). Hasta 5 preguntas encadenadas por hilo. Imágenes generadas en alta resolución. Acceso al Zhou Yi (Fuente Original), la versión más antigua y pura escrita en chino tradicional, junto a Wilhelm y Legge.",
      master:
        "100 tokens por compra (pack consumible, sin renovación automática). Hasta 8 preguntas encadenadas por hilo. Imágenes generadas en máxima resolución. Acceso total, incluyendo el Motor Maestro (3): un análisis superior que triangula las tres fuentes en un ensayo dialéctico. (Consume 2 tokens por consulta).",
    },
    en: {
      freeTier:
        "Free plan: 2 lifetime consultations, 1 question per thread. No auto-renewal; paid packs are consumable. Generated images use basic resolution.",
      seeker:
        "25 tokens per purchase (consumable pack, no auto-renewal). Up to 3 follow-up questions per thread. Generated images use standard resolution. Access to the 3 main translators.",
      practitioner:
        "50 tokens per purchase (consumable pack, no auto-renewal). Up to 5 follow-up questions per thread. Generated images use high resolution. Access to the 3 main translators.",
      master:
        "100 tokens per purchase (consumable pack, no auto-renewal). Up to 8 follow-up questions per thread. Generated images use maximum resolution. Additional access to the Master (3) engine, which combines all 3 translators.",
    },
    pt: {
      freeTier:
        "Plano gratuito: 2 consultas vitalícias, 1 pergunta por fio. Sem renovação automática; os packs pagos são consumíveis. Imagens geradas em resolução básica.",
      seeker:
        "25 tokens por compra (pack consumível, sem renovação automática). Até 3 perguntas encadeadas por fio. Imagens geradas em resolução padrão. Acesso aos 3 tradutores principais.",
      practitioner:
        "50 tokens por compra (pack consumível, sem renovação automática). Até 5 perguntas encadeadas por fio. Imagens geradas em alta resolução. Acesso aos 3 tradutores principais.",
      master:
        "100 tokens por compra (pack consumível, sem renovação automática). Até 8 perguntas encadeadas por fio. Imagens geradas em resolução máxima. Acesso adicional ao motor Master (3), que combina os 3 tradutores.",
    },
    fr: {
      freeTier:
        "Forfait gratuit : 2 consultations à vie, 1 question par fil. Pas de renouvellement automatique ; les packs payants sont consommables. Images générées en résolution basique.",
      seeker:
        "25 jetons par achat (pack consommable, sans renouvellement auto). Jusqu'à 3 questions enchaînées par fil. Images générées en résolution standard. Accès aux 3 traducteurs principaux.",
      practitioner:
        "50 jetons par achat (pack consommable, sans renouvellement auto). Jusqu'à 5 questions enchaînées par fil. Images générées en haute résolution. Accès aux 3 traducteurs principaux.",
      master:
        "100 jetons par achat (pack consommable, sans renouvellement auto). Jusqu'à 8 questions enchaînées par fil. Images générées en résolution maximale. Accès supplémentaire au moteur Master (3), qui combine les 3 traducteurs.",
    },
    de: {
      freeTier:
        "Kostenloser Plan: 2 lebenslange Konsultationen, 1 Frage pro Thread. Keine automatische Verlängerung; bezahlte Pakete sind verbrauchbar. Generierte Bilder in Basisauflösung.",
      seeker:
        "25 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 3 Anschlussfragen pro Thread. Generierte Bilder in Standardauflösung. Zugang zu den 3 Hauptübersetzern.",
      practitioner:
        "50 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 5 Anschlussfragen pro Thread. Generierte Bilder in hoher Auflösung. Zugang zu den 3 Hauptübersetzern.",
      master:
        "100 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 8 Anschlussfragen pro Thread. Generierte Bilder in maximaler Auflösung. Zusätzlicher Zugang zur Master (3) Engine, die alle 3 Übersetzer kombiniert.",
    },
    it: {
      freeTier:
        "Piano gratuito: 2 consultazioni a vita, 1 domanda per thread. Nessun rinnovo automatico; i pacchetti a pagamento sono consumabili. Immagini generate in risoluzione base.",
      seeker:
        "25 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 3 domande concatenate per thread. Immagini generate in risoluzione standard. Accesso ai 3 traduttori principali.",
      practitioner:
        "50 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 5 domande concatenate per thread. Immagini generate in alta risoluzione. Accesso ai 3 traduttori principali.",
      master:
        "100 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 8 domande concatenate per thread. Immagini generate in risoluzione massima. Accesso aggiuntivo al motore Master (3), che combina i 3 traduttori.",
    },
    ja: {
      freeTier:
        "無料プラン：生涯2回の相談、スレッドあたり1問。自動更新なし。有料パックは消費型。生成画像は基本解像度です。",
      seeker:
        "購入ごとに25トークン（使い切りパック、自動更新なし）。スレッドあと3問まで連続で質問可能。生成画像は標準解像度。 3つの主要な翻訳者へのアクセス。",
      practitioner:
        "購入ごとに50トークン（使い切りパック、自動更新なし）。スレッドあと5問まで連続で質問可能。生成画像は高解像度。 3つの主要な翻訳者へのアクセス。",
      master:
        "購入ごとに100トークン（使い切りパック、自動更新なし）。スレッドあと8問まで連続で質問可能。生成画像は最高解像度。 3つの翻訳を組み合わせるMaster (3)エンジンへの追加アクセス。",
    },
    zh: {
      freeTier:
        "免费方案：终身 2 次咨询，每个线程 1 个问题。无自动续费；付费包为消耗型。生成图像为基础分辨率。",
      seeker:
        "每次购买 25 个代币（消耗型包，无自动续费）。每个线程最多连续 3 个追问。生成图像为标准分辨率。 访问 3 个主要译本。",
      practitioner:
        "每次购买 50 个代币（消耗型包，无自动续费）。每个线程最多连续 5 个追问。生成图像为高分辨率。 访问 3 个主要译本。",
      master:
        "每次购买 100 个代币（消耗型包，无自动续费）。每个线程最多连续 8 个追问。生成图像为最高分辨率。 额外使用 Master (3) 引擎，该引擎结合了 3 个译本。",
    },
    ko: {
      freeTier:
        "무료 플랜: 평생 2회 상담, 스레드당 1개 질문. 자동 갱신 없음. 유료 팩은 소모형입니다. 생성 이미지는 기본 해상도입니다.",
      seeker:
        "구매당 25토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 3개의 연속 질문. 생성 이미지는 표준 해상도. 3가지 주요 번역본 이용 가능.",
      practitioner:
        "구매당 50토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 5개의 연속 질문. 생성 이미지는 고해상도. 3가지 주요 번역본 이용 가능.",
      master:
        "구매당 100토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 8개의 연속 질문. 생성 이미지는 최고 해상도. 3가지 번역본을 결합하는 Master (3) 엔진 추가 이용 가능.",
    },
    ar: {
      freeTier:
        "الخطة المجانية: استشارتان مدى الحياة، سؤال واحد لكل محادثة. لا تجديد تلقائي؛ الباقات المدفوعة قابلة للاستهلاك. الصور المُنشأة بدقة أساسية.",
      seeker:
        "25 رمزًا لكل عملية شراء (باقة قابلة للاستهلاك، لا تجديد تلقائي). حتى 3 أسئلة متابعة لكل محادثة. الصور المُنشأة بدقة قياسية. الوصول إلى المترجمين الثلاثة الرئيسيين.",
      practitioner:
        "50 رمزًا لكل عملية شراء (باقة قابلة للاستهلاك، لا تجديد تلقائي). حتى 5 أسئلة متابعة لكل محادثة. الصور المُنشأة بدقة عالية. الوصول إلى المترجمين الثلاثة الرئيسيين.",
      master:
        "100 رمز لكل عملية شراء (باقة قابلة للاستهلاك، لا تجديد تلقائي). حتى 8 أسئلة متابعة لكل محادثة. الصور المُنشأة بأقصى دقة. وصول إضافي لمحرك Master (3) الذي يجمع بين المترجمين الثلاثة.",
    },
    hi: {
      freeTier:
        "मुफ़्त योजना: जीवनभर 2 परामर्श, प्रति थ्रेड 1 प्रश्न। ऑटो-रिन्यू नहीं; पेड पैक उपभोज्य हैं। जनरेटेड इमेज बेसिक रिज़ॉल्यूशन में होती हैं।",
      seeker:
        "प्रति खरीद 25 टोकन (उपभोज्य पैक, ऑटो-रिन्यू नहीं)। प्रति थ्रेड 3 फॉलो-अप प्रश्न तक। इमेज स्टैंडर्ड रिज़ॉल्यूशन में। 3 मुख्य अनुवादकों तक पहुंच।",
      practitioner:
        "प्रति खरीद 50 टोकन (उपभोज्य पैक, ऑटो-रिन्यू नहीं)। प्रति थ्रेड 5 फॉलो-अप प्रश्न तक। इमेज हाई रिज़ॉल्यूशन में। 3 मुख्य अनुवादकों तक पहुंच।",
      master:
        "प्रति खरीद 100 टोकन (उपभोज्य पैक, ऑटो-रिन्यू नहीं)। प्रति थ्रेड 8 फॉलो-अप प्रश्न तक। इमेज अधिकतम रिज़ॉल्यूशन में। मास्टर (3) इंजन तक अतिरिक्त पहुंच, जो सभी 3 अनुवादकों को जोड़ता है।",
    },
  };

const PACK_KEY: Record<
  TokenPackMarketingId,
  keyof TokenPackMarketingUiMessages
> = {
  tokens_seeker_20: "seeker",
  tokens_practitioner_40: "practitioner",
  tokens_master_100: "master",
};

/** Short product titles for pricing tables, checkout, and guide lists (aligned with TOKEN_PACKS ids). */
const TOKEN_PACK_LABELS: Record<
  AppLocale,
  Record<TokenPackMarketingId, string>
> = {
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
  ar: {
    tokens_seeker_20: "باقة Seeker",
    tokens_practitioner_40: "باقة Practitioner",
    tokens_master_100: "باقة Master",
  },
  hi: {
    tokens_seeker_20: "सीकर पैक",
    tokens_practitioner_40: "प्रैक्टिशनर पैक",
    tokens_master_100: "मास्टर पैक",
  },
};

export function getTokenPackLabel(
  packId: TokenPackMarketingId,
  locale: AppLocale,
): string {
  const byLocale =
    TOKEN_PACK_LABELS[locale] ?? TOKEN_PACK_LABELS[DEFAULT_LOCALE];
  return byLocale[packId] ?? TOKEN_PACK_LABELS.en[packId];
}

export function getTokenPackMarketingMessages(
  locale: AppLocale,
): TokenPackMarketingUiMessages {
  return (
    TOKEN_PACK_MARKETING_UI[locale] ?? TOKEN_PACK_MARKETING_UI[DEFAULT_LOCALE]
  );
}

export function getFreeTierMarketing(locale: AppLocale): string {
  return getTokenPackMarketingMessages(locale).freeTier;
}

export function getPackMarketingLine(
  packId: TokenPackMarketingId,
  locale: AppLocale,
): string {
  const m = getTokenPackMarketingMessages(locale);
  const key = PACK_KEY[packId];
  return m[key];
}
