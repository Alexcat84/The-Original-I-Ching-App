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
        "25 tokens per purchase (consumable pack, no auto-renewal). Up to 3 follow-up questions per thread. Generated images use standard resolution. Access to Wilhelm and Legge.",
      practitioner:
        "50 tokens per purchase (consumable pack, no auto-renewal). Up to 5 follow-up questions per thread. Generated images use high resolution. Access to Zhou Yi (Original Source), the oldest and purest version in traditional Chinese, along with Wilhelm and Legge.",
      master:
        "100 tokens per purchase (consumable pack, no auto-renewal). Up to 8 follow-up questions per thread. Generated images use maximum resolution. Full access, including the Master (3) engine: a superior analysis that triangulates all three sources in a dialectical essay. (Consumes 2 tokens per consultation).",
    },
    pt: {
      freeTier:
        "Plano gratuito: 2 consultas vitalícias, 1 pergunta por fio. Sem renovação automática; os packs pagos são consumíveis. Imagens geradas em resolução básica.",
      seeker:
        "25 tokens por compra (pack consumível, sem renovação automática). Até 3 perguntas encadeadas por fio. Imagens geradas em resolução padrão. Acesso a Wilhelm e Legge.",
      practitioner:
        "50 tokens por compra (pack consumível, sem renovação automática). Até 5 perguntas encadeadas por fio. Imagens geradas em alta resolução. Acesso ao Zhou Yi (Fonte Original), a versão mais antiga e pura escrita em chinês tradicional, junto a Wilhelm e Legge.",
      master:
        "100 tokens por compra (pack consumível, sem renovação automática). Até 8 perguntas encadeadas por fio. Imagens geradas em resolução máxima. Acesso total, incluindo o Motor Mestre (3): uma análise superior que triangula as três fontes num ensaio dialético. (Consome 2 tokens por consulta).",
    },
    fr: {
      freeTier:
        "Forfait gratuit : 2 consultations à vie, 1 question par fil. Pas de renouvellement automatique ; les packs payants sont consommables. Images générées en résolution basique.",
      seeker:
        "25 jetons par achat (pack consommable, sans renouvellement auto). Jusqu'à 3 questions enchaînées par fil. Images générées en résolution standard. Accès à Wilhelm et Legge.",
      practitioner:
        "50 jetons par achat (pack consommable, sans renouvellement auto). Jusqu'à 5 questions enchaînées par fil. Images générées en haute résolution. Accès au Zhou Yi (Source Originale), la version la plus ancienne et pure en chinois traditionnel, avec Wilhelm et Legge.",
      master:
        "100 jetons par achat (pack consommable, sans renouvellement auto). Jusqu'à 8 questions enchaînées par fil. Images générées en résolution maximale. Accès complet, incluant le moteur Master (3) : une analyse supérieure qui triangule les trois sources dans un essai dialectique. (Consomme 2 jetons par consultation).",
    },
    de: {
      freeTier:
        "Kostenloser Plan: 2 lebenslange Konsultationen, 1 Frage pro Thread. Keine automatische Verlängerung; bezahlte Pakete sind verbrauchbar. Generierte Bilder in Basisauflösung.",
      seeker:
        "25 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 3 Anschlussfragen pro Thread. Generierte Bilder in Standardauflösung. Zugang zu Wilhelm und Legge.",
      practitioner:
        "50 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 5 Anschlussfragen pro Thread. Generierte Bilder in hoher Auflösung. Zugang zu Zhou Yi (Originalquelle), der ältesten und reinsten Version in traditionellem Chinesisch, zusammen mit Wilhelm und Legge.",
      master:
        "100 Tokens pro Kauf (verbrauchbares Paket, keine automatische Verlängerung). Bis zu 8 Anschlussfragen pro Thread. Generierte Bilder in maximaler Auflösung. Vollständiger Zugang, einschließlich der Master (3) Engine: eine überlegene Analyse, die alle drei Quellen in einem dialektischen Essay trianguliert. (Verbraucht 2 Tokens pro Konsultation).",
    },
    it: {
      freeTier:
        "Piano gratuito: 2 consultazioni a vita, 1 domanda per thread. Nessun rinnovo automatico; i pacchetti a pagamento sono consumabili. Immagini generate in risoluzione base.",
      seeker:
        "25 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 3 domande concatenate per thread. Immagini generate in risoluzione standard. Accesso a Wilhelm e Legge.",
      practitioner:
        "50 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 5 domande concatenate per thread. Immagini generate in alta risoluzione. Accesso allo Zhou Yi (Fonte Originale), la versione più antica e pura in cinese tradizionale, insieme a Wilhelm e Legge.",
      master:
        "100 token per acquisto (pacchetto consumabile, senza rinnovo automatico). Fino a 8 domande concatenate per thread. Immagini generate in risoluzione massima. Accesso completo, incluso il motore Master (3): un'analisi superiore che triangola le tre fonti in un saggio dialettico. (Consuma 2 token per consultazione).",
    },
    ja: {
      freeTier:
        "無料プラン：生涯2回の相談、スレッドあたり1問。自動更新なし。有料パックは消費型。生成画像は基本解像度です。",
      seeker:
        "購入ごとに25トークン（使い切りパック、自動更新なし）。スレッドあたり最大3問まで連続質問可能。生成画像は標準解像度。ウィルヘルムとレッゲへのアクセス。",
      practitioner:
        "購入ごとに50トークン（使い切りパック、自動更新なし）。スレッドあたり最大5問まで連続質問可能。生成画像は高解像度。周易（原典）——繁体字中国語で書かれた最古かつ最純粋な版——ウィルヘルム及びレッゲとともにアクセス可能。",
      master:
        "購入ごとに100トークン（使い切りパック、自動更新なし）。スレッドあたり最大8問まで連続質問可能。生成画像は最高解像度。Master (3)エンジンを含む全アクセス：3つの典拠を弁証法的な論文として統合する高度な分析。（1回の相談につき2トークン消費）。",
    },
    zh: {
      freeTier:
        "免费方案：终身 2 次咨询，每个线程 1 个问题。无自动续费；付费包为消耗型。生成图像为基础分辨率。",
      seeker:
        "每次购买 25 个代币（消耗型包，无自动续费）。每个线程最多连续 3 个追问。生成图像为标准分辨率。可访问威廉和理雅各译本。",
      practitioner:
        "每次购买 50 个代币（消耗型包，无自动续费）。每个线程最多连续 5 个追问。生成图像为高分辨率。可访问周易（原典）——以繁体中文写成的最古老、最纯粹的版本——以及威廉和理雅各译本。",
      master:
        "每次购买 100 个代币（消耗型包，无自动续费）。每个线程最多连续 8 个追问。生成图像为最高分辨率。完整访问权限，包含大师（3）引擎：以辩证论文形式融合三种典籍来源的高级分析。（每次咨询消耗 2 个代币）。",
    },
    ko: {
      freeTier:
        "무료 플랜: 평생 2회 상담, 스레드당 1개 질문. 자동 갱신 없음. 유료 팩은 소모형입니다. 생성 이미지는 기본 해상도입니다.",
      seeker:
        "구매당 25토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 3개의 연속 질문. 생성 이미지는 표준 해상도. 빌헬름과 레그 번역본 이용 가능.",
      practitioner:
        "구매당 50토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 5개의 연속 질문. 생성 이미지는 고해상도. 주역（원전）——전통 한자로 쓰인 가장 오래되고 순수한 판본——빌헬름 및 레그와 함께 이용 가능.",
      master:
        "구매당 100토큰(소모형 팩, 자동 갱신 없음). 스레드당 최대 8개의 연속 질문. 생성 이미지는 최고 해상도. Master (3) 엔진을 포함한 전체 접근 권한: 세 가지 출전을 변증법적 에세이로 통합하는 고급 분석. (상담 1회당 2토큰 소모).",
    },
    ar: {
      freeTier:
        "الخطة المجانية: استشارتان مدى الحياة، سؤال واحد لكل محادثة. لا تجديد تلقائي؛ الباقات المدفوعة قابلة للاستهلاك. الصور المُنشأة بدقة أساسية.",
      seeker:
        "25 رمزًا لكل عملية شراء (باقة قابلة للاستهلاك، لا تجديد تلقائي). حتى 3 أسئلة متابعة لكل محادثة. الصور المُنشأة بدقة قياسية. الوصول إلى ويلهلم وليغ.",
      practitioner:
        "50 رمزًا لكل عملية شراء (باقة قابلة للاستهلاك، لا تجديد تلقائي). حتى 5 أسئلة متابعة لكل محادثة. الصور المُنشأة بدقة عالية. الوصول إلى Zhou Yi (المصدر الأصلي)، أقدم نسخة وأنقاها باللغة الصينية التقليدية، مع ويلهلم وليغ.",
      master:
        "100 رمز لكل عملية شراء (باقة قابلة للاستهلاك، لا تجديد تلقائي). حتى 8 أسئلة متابعة لكل محادثة. الصور المُنشأة بأقصى دقة. وصول كامل، يشمل محرك Master (3): تحليل متقدم يُثلّث المصادر الثلاثة في مقالة جدلية. (يستهلك 2 رموز لكل استشارة).",
    },
    hi: {
      freeTier:
        "मुफ़्त योजना: जीवनभर 2 परामर्श, प्रति थ्रेड 1 प्रश्न। ऑटो-रिन्यू नहीं; पेड पैक उपभोज्य हैं। जनरेटेड इमेज बेसिक रिज़ॉल्यूशन में होती हैं।",
      seeker:
        "प्रति खरीद 25 टोकन (उपभोज्य पैक, ऑटो-रिन्यू नहीं)। प्रति थ्रेड 3 फॉलो-अप प्रश्न तक। इमेज स्टैंडर्ड रिज़ॉल्यूशन में। Wilhelm और Legge तक पहुंच।",
      practitioner:
        "प्रति खरीद 50 टोकन (उपभोज्य पैक, ऑटो-रिन्यू नहीं)। प्रति थ्रेड 5 फॉलो-अप प्रश्न तक। इमेज हाई रिज़ॉल्यूशन में। Zhou Yi (मूल स्रोत), पारंपरिक चीनी में लिखा गया सबसे प्राचीन और शुद्ध संस्करण, Wilhelm और Legge के साथ पहुंच।",
      master:
        "प्रति खरीद 100 टोकन (उपभोज्य पैक, ऑटो-रिन्यू नहीं)। प्रति थ्रेड 8 फॉलो-अप प्रश्न तक। इमेज अधिकतम रिज़ॉल्यूशन में। पूर्ण पहुंच, जिसमें Master (3) इंजन शामिल है: एक श्रेष्ठ विश्लेषण जो तीनों स्रोतों को द्वंद्वात्मक निबंध में संयोजित करता है। (प्रति परामर्श 2 टोकन खर्च होते हैं)।",
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
