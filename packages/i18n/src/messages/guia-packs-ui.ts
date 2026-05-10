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
  libraryUnlockNote: string;
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
    libraryUnlockNote:
      "Acceso a la Biblioteca: La adquisición de cualquier pack de pago desbloquea de forma permanente el acceso a la Biblioteca para el estudio de los escritos y fuentes consultadas. Estos escritos están en el idioma original, sin traducción, para no perder la fidelidad de los textos.",
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
    libraryUnlockNote:
      "Library Access: Purchasing any paid pack permanently unlocks access to the Library for the study of the consulted writings and sources. These writings are in their original language, without translation, so as not to lose the fidelity of the texts.",
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
    libraryUnlockNote:
      "Acesso à Biblioteca: A aquisição de qualquer pacote pago desbloqueia permanentemente o acesso à Biblioteca para o estudo dos escritos e fontes consultadas. Estes escritos estão no idioma original, sem tradução, para não perder a fidelidade dos textos.",
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
    libraryUnlockNote:
      "Accès à la Bibliothèque : L'achat de tout pack payant débloque de façon permanente l'accès à la Bibliothèque pour l'étude des écrits et des sources consultées. Ces écrits sont dans leur langue d'origine, sans traduction, afin de ne pas perdre la fidélité des textes.",
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
    libraryUnlockNote:
      "Bibliothekszugang: Der Kauf eines kostenpflichtigen Pakets schaltet dauerhaft den Zugang zur Bibliothek für das Studium der konsultierten Schriften und Quellen frei. Diese Schriften sind in ihrer Originalsprache, ohne Übersetzung, um die Treue der Texte nicht zu verlieren.",
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
    libraryUnlockNote:
      "Accesso alla Biblioteca: L'acquisto di qualsiasi pacchetto a pagamento sblocca in modo permanente l'accesso alla Biblioteca per lo studio degli scritti e delle fonti consultate. Questi scritti sono nella lingua originale, senza traduzione, per non perdere la fedeltà dei testi.",
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
    libraryUnlockNote:
      "ライブラリへのアクセス: 有料パックを購入すると、参照された記述と情報源を学習するためのライブラリへのアクセスが永久にアンロックされます。これらの記述は、テキストの忠実性を失わないように、翻訳なしの元の言語で提供されます。",
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
    libraryUnlockNote:
      "资料库访问权限：购买任何付费包即可永久解锁访问资料库的权限，以供研究参考文章和来源。这些文章采用原文，没有翻译，以保持文本的忠实度。",
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
    libraryUnlockNote:
      "라이브러리 액세스: 유료 팩을 구매하면 참고된 글과 출처를 학습할 수 있는 라이브러리 액세스 권한이 영구적으로 해제됩니다. 이 글들은 텍스트의 충실도를 잃지 않기 위해 번역 없이 원어로 제공됩니다.",
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
    libraryUnlockNote:
      "الوصول إلى المكتبة: يؤدي شراء أي حزمة مدفوعة إلى فتح الوصول الدائم إلى المكتبة لدراسة الكتابات والمصادر المستشارة. هذه الكتابات بلغتها الأصلية، بدون ترجمة، لكي لا تفقد دقة النصوص.",
    perPlanDetailHeading: "تفاصيل حسب الخطة (حدود الخيط، الحزم القابلة للاستهلاك، ودقة الصور):",
  },
  hi: {
    sectionTitle: "पैक और भुगतान",
    currentPricing: "वर्तमान मूल्य:",
    freeTierLabel: "निःशुल्क:",
    freeProductName: "निःशुल्क",
    freeLine: "$0 · {{count}} जीवनकाल मुफ्त परामर्श",
    packPriceTemplate: "${{price}} · {{tokens}} {{tokensWord}}",
    tokensAccumulate:
      "आपके टोकन जमा होते हैं: यदि आप टोकन समाप्त होने से पहले नया पैक खरीदते हैं, तो शेष टोकन नए पैक में जुड़ जाते हैं।",
    libraryUnlockNote:
      "पुस्तकालय तक पहुंच: कोई भी भुगतान किया गया पैक खरीदने से परामर्श किए गए लेख और स्रोत के अध्ययन के लिए पुस्तकालय तक पहुंच स्थायी रूप से अनलॉक हो जाती है। ये लेख अपनी मूल भाषा में हैं, बिना अनुवाद के, ताकि ग्रंथों की प्रामाणिकता बनी रहे।",
    perPlanDetailHeading: "प्रति योजना विवरण (प्रति थ्रेड सीमाएं, उपभोज्य पैक और छवि रिज़ॉल्यूशन):",
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
