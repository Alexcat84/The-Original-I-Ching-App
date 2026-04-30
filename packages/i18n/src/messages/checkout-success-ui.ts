import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

export type CheckoutSuccessUiMessages = {
  sessionWaitTitle: string;
  sessionWaitSub: string;
  processingTitle: string;
  /** Use {{label}} for pack or free tier name */
  successTitle: string;
  successSub: string;
  pendingTitle: string;
  pendingSub: string;
  ctaOracle: string;
};

const CHECKOUT_SUCCESS_UI: Record<AppLocale, CheckoutSuccessUiMessages> = {
  es: {
    sessionWaitTitle: "Redirigiendo…",
    sessionWaitSub: "Estamos recuperando tu sesión.",
    processingTitle: "Procesando tu compra de tokens…",
    successTitle: "¡Bienvenido a {{label}}!",
    successSub: "Tus consultas están listas.",
    pendingTitle: "Tu pago está siendo procesado.",
    pendingSub: "En unos minutos verás tus tokens acreditados. Puedes seguir usando la app.",
    ctaOracle: "Ir al oráculo",
  },
  en: {
    sessionWaitTitle: "Redirecting…",
    sessionWaitSub: "Restoring your session.",
    processingTitle: "Processing your token purchase…",
    successTitle: "Welcome to {{label}}!",
    successSub: "Your consultations are ready.",
    pendingTitle: "Your payment is being processed.",
    pendingSub: "Your tokens will appear within a few minutes. You can keep using the app.",
    ctaOracle: "Go to oracle",
  },
  pt: {
    sessionWaitTitle: "A redirecionar…",
    sessionWaitSub: "A recuperar a tua sessão.",
    processingTitle: "A processar a tua compra de tokens…",
    successTitle: "Bem-vindo a {{label}}!",
    successSub: "As tuas consultas estão prontas.",
    pendingTitle: "O teu pagamento está a ser processado.",
    pendingSub: "Em poucos minutos verás os tokens creditados. Podes continuar a usar a app.",
    ctaOracle: "Ir ao oráculo",
  },
  fr: {
    sessionWaitTitle: "Redirection…",
    sessionWaitSub: "Nous rétablissons votre session.",
    processingTitle: "Traitement de votre achat de jetons…",
    successTitle: "Bienvenue sur {{label}} !",
    successSub: "Vos consultations sont prêtes.",
    pendingTitle: "Votre paiement est en cours de traitement.",
    pendingSub: "Vos jetons seront crédités dans quelques minutes. Vous pouvez continuer à utiliser l’app.",
    ctaOracle: "Aller à l’oracle",
  },
  de: {
    sessionWaitTitle: "Weiterleitung…",
    sessionWaitSub: "Wir stellen Ihre Sitzung wieder her.",
    processingTitle: "Ihr Token-Kauf wird verarbeitet…",
    successTitle: "Willkommen bei {{label}}!",
    successSub: "Ihre Konsultationen sind bereit.",
    pendingTitle: "Ihre Zahlung wird bearbeitet.",
    pendingSub: "In wenigen Minuten werden Ihre Token gutgeschrieben. Sie können die App weiter nutzen.",
    ctaOracle: "Zum Orakel",
  },
  it: {
    sessionWaitTitle: "Reindirizzamento…",
    sessionWaitSub: "Stiamo ripristinando la sessione.",
    processingTitle: "Elaborazione dell’acquisto di token…",
    successTitle: "Benvenuto in {{label}}!",
    successSub: "Le tue consultazioni sono pronte.",
    pendingTitle: "Il pagamento è in elaborazione.",
    pendingSub: "Tra pochi minuti vedrai i token accreditati. Puoi continuare a usare l’app.",
    ctaOracle: "Vai all’oracolo",
  },
  ja: {
    sessionWaitTitle: "リダイレクト中…",
    sessionWaitSub: "セッションを復元しています。",
    processingTitle: "トークン購入を処理しています…",
    successTitle: "{{label}}へようこそ！",
    successSub: "相談の準備ができました。",
    pendingTitle: "お支払いを処理しています。",
    pendingSub: "数分以内にトークンが反映されます。そのままアプリをご利用いただけます。",
    ctaOracle: "オラクルへ",
  },
  zh: {
    sessionWaitTitle: "正在跳转…",
    sessionWaitSub: "正在恢复您的会话。",
    processingTitle: "正在处理您的代币购买…",
    successTitle: "欢迎加入 {{label}}！",
    successSub: "您的咨询已就绪。",
    pendingTitle: "正在处理您的付款。",
    pendingSub: "几分钟内代币将会到账。您可以继续使用应用。",
    ctaOracle: "前往占卜",
  },
  ko: {
    sessionWaitTitle: "이동 중…",
    sessionWaitSub: "세션을 복구하는 중입니다.",
    processingTitle: "토큰 구매를 처리하는 중…",
    successTitle: "{{label}}에 오신 것을 환영합니다!",
    successSub: "상담을 시작할 준비가 되었습니다.",
    pendingTitle: "결제를 처리하는 중입니다.",
    pendingSub: "잠시 후 토큰이 적립됩니다. 앱을 계속 사용하실 수 있습니다.",
    ctaOracle: "오라클로 이동",
  },
  ar: {
    sessionWaitTitle: "جارٍ إعادة التوجيه…",
    sessionWaitSub: "جارٍ استعادة جلستك.",
    processingTitle: "جارٍ معالجة شراء الرموز…",
    successTitle: "مرحبًا بك في {{label}}!",
    successSub: "استشاراتك جاهزة.",
    pendingTitle: "جارٍ معالجة دفعتك.",
    pendingSub: "ستظهر رموزك خلال دقائق قليلة. يمكنك الاستمرار في استخدام التطبيق.",
    ctaOracle: "الذهاب إلى الأوراكل",
  },
  hi: {
    sessionWaitTitle: "पुनर्निर्देशित हो रहा है…",
    sessionWaitSub: "आपका सत्र पुनः प्राप्त हो रहा है।",
    processingTitle: "आपकी टोकन खरीद संसाधित हो रही है…",
    successTitle: "{{label}} में आपका स्वागत है!",
    successSub: "आपके परामर्श तैयार हैं।",
    pendingTitle: "आपका भुगतान संसाधित हो रहा है।",
    pendingSub: "कुछ मिनटों में आपके टोकन दिखाई देंगे। आप ऐप का उपयोग जारी रख सकते हैं।",
    ctaOracle: "ओरेकल पर जाएं",
  },
};

export function getCheckoutSuccessUiMessages(locale: AppLocale): CheckoutSuccessUiMessages {
  return CHECKOUT_SUCCESS_UI[locale] ?? CHECKOUT_SUCCESS_UI[DEFAULT_LOCALE];
}

export function formatCheckoutSuccessTitle(m: CheckoutSuccessUiMessages, label: string): string {
  return interpolate(m.successTitle, { label });
}
