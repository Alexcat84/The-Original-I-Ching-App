import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** User-facing error messages returned by POST /api/consult. */
export type ConsultApiUiMessages = {
  authRequired: string;
  sessionLimit: string;
  insufficientCredits: string;
  insufficientCreditsMaster: string;
  consultationInProgress: string;
};

const CONSULT_API_UI: Record<AppLocale, ConsultApiUiMessages> = {
  es: {
    authRequired:
      "Inicia sesión con un correo verificado o con Google. Crea cuenta en /login si aún no tienes una.",
    sessionLimit:
      "Has alcanzado el límite de este hilo. Inicia una nueva sesión para continuar explorando.",
    insufficientCredits:
      "Has usado todos tus tokens. Compra un nuevo paquete para continuar.",
    insufficientCreditsMaster:
      "El Ensayo Maestro requiere 2 tokens. Compra un nuevo paquete para continuar.",
    consultationInProgress:
      "Ya hay una consulta en proceso. Por favor espera a que termine antes de iniciar otra.",
  },
  en: {
    authRequired:
      "Sign in with a verified email or Google. Create an account at /login if you do not have one yet.",
    sessionLimit:
      "You reached this thread limit. Start a new session to continue exploring.",
    insufficientCredits: "You used all your tokens. Buy a new pack to continue.",
    insufficientCreditsMaster:
      "Master Combined requires 2 tokens. Buy a new pack to continue.",
    consultationInProgress:
      "A consultation is already in progress. Please wait for it to finish before starting another.",
  },
  pt: {
    authRequired:
      "Inicia sessão com um e-mail verificado ou com o Google. Cria conta em /login se ainda não tens uma.",
    sessionLimit:
      "Atingiste o limite deste fio. Inicia uma nova sessão para continuar a explorar.",
    insufficientCredits:
      "Usaste todos os tokens. Compra um novo pacote para continuar.",
    insufficientCreditsMaster:
      "Master Combined requer 2 tokens. Compra um novo pacote para continuar.",
    consultationInProgress:
      "Já há uma consulta em curso. Aguarda que termine antes de iniciar outra.",
  },
  fr: {
    authRequired:
      "Connectez-vous avec un e-mail vérifié ou Google. Créez un compte sur /login si vous n'en avez pas encore.",
    sessionLimit:
      "Vous avez atteint la limite de ce fil. Démarrez une nouvelle session pour continuer à explorer.",
    insufficientCredits:
      "Vous avez utilisé tous vos jetons. Achetez un nouveau pack pour continuer.",
    insufficientCreditsMaster:
      "Master Combined nécessite 2 jetons. Achetez un nouveau pack pour continuer.",
    consultationInProgress:
      "Une consultation est déjà en cours. Veuillez attendre qu'elle se termine avant d'en commencer une autre.",
  },
  de: {
    authRequired:
      "Melde dich mit einer verifizierten E-Mail oder Google an. Erstelle ein Konto unter /login, falls du noch keins hast.",
    sessionLimit:
      "Du hast das Limit dieses Threads erreicht. Starte eine neue Sitzung, um weiter zu erkunden.",
    insufficientCredits:
      "Du hast alle Token verbraucht. Kaufe ein neues Paket, um fortzufahren.",
    insufficientCreditsMaster:
      "Master Combined erfordert 2 Token. Kaufe ein neues Paket, um fortzufahren.",
    consultationInProgress:
      "Eine Beratung läuft bereits. Bitte warte, bis sie abgeschlossen ist, bevor du eine neue startest.",
  },
  it: {
    authRequired:
      "Accedi con un'e-mail verificata o Google. Crea un account su /login se non ne hai ancora uno.",
    sessionLimit:
      "Hai raggiunto il limite di questo filo. Avvia una nuova sessione per continuare a esplorare.",
    insufficientCredits:
      "Hai usato tutti i token. Acquista un nuovo pacchetto per continuare.",
    insufficientCreditsMaster:
      "Master Combined richiede 2 token. Acquista un nuovo pacchetto per continuare.",
    consultationInProgress:
      "È già in corso una consultazione. Attendi che finisca prima di iniziarne un'altra.",
  },
  ja: {
    authRequired:
      "確認済みメールまたはGoogleでサインインしてください。アカウントがない場合は /login で作成してください。",
    sessionLimit:
      "このスレッドの上限に達しました。新しいセッションを開始して続けてください。",
    insufficientCredits:
      "トークンをすべて使い切りました。続けるには新しいパックを購入してください。",
    insufficientCreditsMaster:
      "Master Combinedには2トークン必要です。続けるには新しいパックを購入してください。",
    consultationInProgress:
      "すでに相談が進行中です。別の相談を始める前に完了をお待ちください。",
  },
  zh: {
    authRequired:
      "请使用已验证的邮箱或 Google 登录。若尚无账号，请在 /login 注册。",
    sessionLimit: "此对话线程已达上限。请开始新会话以继续探索。",
    insufficientCredits: "你已用完所有代币。请购买新套餐以继续。",
    insufficientCreditsMaster:
      "Master Combined 需要 2 枚代币。请购买新套餐以继续。",
    consultationInProgress:
      "已有一个咨询正在进行中。请等待其完成后再开始新的咨询。",
  },
  ko: {
    authRequired:
      "인증된 이메일 또는 Google로 로그인하세요. 계정이 없으면 /login에서 만드세요.",
    sessionLimit:
      "이 스레드 한도에 도달했습니다. 새 세션을 시작해 계속 탐색하세요.",
    insufficientCredits:
      "토큰을 모두 사용했습니다. 계속하려면 새 팩을 구매하세요.",
    insufficientCreditsMaster:
      "Master Combined에는 2토큰이 필요합니다. 계속하려면 새 팩을 구매하세요.",
    consultationInProgress:
      "이미 진행 중인 상담이 있습니다. 다른 상담을 시작하기 전에 완료될 때까지 기다려 주세요.",
  },
  ar: {
    authRequired:
      "سجّل الدخول ببريد مُحقَّق أو عبر Google. أنشئ حسابًا في /login إن لم يكن لديك حساب بعد.",
    sessionLimit:
      "لقد وصلت إلى حد هذه المحادثة. ابدأ جلسة جديدة للمتابعة في الاستكشاف.",
    insufficientCredits:
      "لقد استخدمت جميع رموزك. اشترِ باقة جديدة للمتابعة.",
    insufficientCreditsMaster:
      "يتطلب Master Combined رمزين. اشترِ باقة جديدة للمتابعة.",
    consultationInProgress:
      "استشارة جارية بالفعل. يرجى الانتظار حتى تنتهي قبل بدء استشارة أخرى.",
  },
  hi: {
    authRequired:
      "सत्यापित ईमेल या Google से लॉग इन करें। यदि खाता नहीं है तो /login पर बनाएं।",
    sessionLimit:
      "आप इस थ्रेड की सीमा तक पहुँच गए हैं। आगे बढ़ने के लिए नया सत्र शुरू करें।",
    insufficientCredits:
      "आपने सभी टोकन उपयोग कर लिए हैं। जारी रखने के लिए नया पैक खरीदें।",
    insufficientCreditsMaster:
      "Master Combined के लिए 2 टोकन चाहिए। जारी रखने के लिए नया पैक खरीदें।",
    consultationInProgress:
      "एक परामर्श पहले से चल रही है। कृपया दूसरी शुरू करने से पहले उसके पूरा होने की प्रतीक्षा करें।",
  },
};

export function getConsultApiUiMessages(locale: AppLocale): ConsultApiUiMessages {
  return CONSULT_API_UI[locale] ?? CONSULT_API_UI[DEFAULT_LOCALE];
}
