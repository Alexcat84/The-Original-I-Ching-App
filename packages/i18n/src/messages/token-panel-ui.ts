import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

/** Options panel: token row + token center errors/messages (aligned with pricing copy). */
export type TokenPanelUiMessages = {
  ariaTokenGroup: string;
  tokensHeading: string;
  lastPack: string;
  remaining: string;
  loading: string;
  tokenCenter: string;
  accumulation: string;
  loadError: string;
  messageFreeDepleted: string;
  messageNoActivePurchase: string;
  consultThreadLimit: string;
  noTokensDepleted: string;
  signInForBalance: string;
  /** Link label → `/guia#planes` from token center modal. */
  tokenCenterGuideLink: string;
};

const TOKEN_PANEL_UI: Record<AppLocale, TokenPanelUiMessages> = {
  es: {
    ariaTokenGroup: "Gestión de tokens",
    tokensHeading: "Tokens",
    lastPack: "Último pack:",
    remaining: "restantes",
    loading: "Cargando...",
    tokenCenter: "Centro de tokens",
    accumulation:
      "Tus tokens se acumulan: si compras un nuevo pack antes de agotar el actual, los tokens restantes se suman al nuevo pack.",
    loadError: "No se pudo cargar el centro de tokens. Inténtalo de nuevo.",
    messageFreeDepleted:
      "Has agotado tus consultas gratuitas de por vida. Compra tokens en Planes y pagos para continuar.",
    messageNoActivePurchase:
      "No hay una compra activa reciente. Puedes comprar más tokens en Planes y pagos.",
    consultThreadLimit: "Has alcanzado el límite de este hilo. Inicia una nueva sesión para continuar.",
    noTokensDepleted: "Has usado todos tus tokens. Compra un nuevo paquete para continuar.",
    signInForBalance: "Inicia sesión para ver tu saldo.",
    tokenCenterGuideLink: "Packs y límites en la guía de uso (solo lectura)",
  },
  en: {
    ariaTokenGroup: "Token management",
    tokensHeading: "Tokens",
    lastPack: "Last pack:",
    remaining: "remaining",
    loading: "Loading...",
    tokenCenter: "Token center",
    accumulation:
      "Your tokens accumulate: if you buy a new pack before running out, your remaining tokens carry over and add to the new pack.",
    loadError: "Could not load token center. Please try again.",
    messageFreeDepleted:
      "You have used your lifetime free consultations. Buy tokens in Plans & payments to continue.",
    messageNoActivePurchase:
      "There is no recent active purchase. You can buy more tokens in Plans & payments.",
    consultThreadLimit: "You reached this thread limit. Start a new session to continue.",
    noTokensDepleted: "You used all your tokens. Buy a new pack to continue.",
    signInForBalance: "Sign in to view your balance.",
    tokenCenterGuideLink: "Packs and limits in the user guide (read-only)",
  },
  pt: {
    ariaTokenGroup: "Gestão de tokens",
    tokensHeading: "Tokens",
    lastPack: "Último pack:",
    remaining: "restantes",
    loading: "A carregar...",
    tokenCenter: "Centro de tokens",
    accumulation:
      "Os teus tokens acumulam-se: se comprares um novo pack antes de esgotar o atual, os tokens restantes somam-se ao novo pack.",
    loadError: "Não foi possível carregar o centro de tokens. Tenta novamente.",
    messageFreeDepleted:
      "Esgotaste as consultas gratuitas de vida. Compra tokens em Planos e pagamentos para continuar.",
    messageNoActivePurchase:
      "Não há uma compra ativa recente. Podes comprar mais tokens em Planos e pagamentos.",
    consultThreadLimit: "Atingiste o limite deste fio. Inicia uma nova sessão para continuar.",
    noTokensDepleted: "Usaste todos os tokens. Compra um novo pacote para continuar.",
    signInForBalance: "Inicia sessão para veres o teu saldo.",
    tokenCenterGuideLink: "Packs e limites no guia de utilização (só leitura)",
  },
  fr: {
    ariaTokenGroup: "Gestion des jetons",
    tokensHeading: "Jetons",
    lastPack: "Dernier pack :",
    remaining: "restants",
    loading: "Chargement...",
    tokenCenter: "Centre jetons",
    accumulation:
      "Vos jetons s’accumulent : si vous achetez un nouveau pack avant d’épuiser l’actuel, les jetons restants s’ajoutent au nouveau pack.",
    loadError: "Impossible de charger le centre jetons. Réessayez.",
    messageFreeDepleted:
      "Vous avez utilisé vos consultations gratuites à vie. Achetez des jetons dans Plans et paiements pour continuer.",
    messageNoActivePurchase:
      "Aucun achat actif récent. Vous pouvez acheter plus de jetons dans Plans et paiements.",
    consultThreadLimit: "Limite de ce fil atteinte. Démarrez une nouvelle session pour continuer.",
    noTokensDepleted: "Vous avez utilisé tous vos jetons. Achetez un nouveau pack pour continuer.",
    signInForBalance: "Connectez-vous pour voir votre solde.",
    tokenCenterGuideLink: "Packs et limites dans le guide d’utilisation (lecture seule)",
  },
  de: {
    ariaTokenGroup: "Token-Verwaltung",
    tokensHeading: "Token",
    lastPack: "Letztes Paket:",
    remaining: "verbleibend",
    loading: "Wird geladen...",
    tokenCenter: "Token-Center",
    accumulation:
      "Deine Token summieren sich: Wenn du ein neues Paket kaufst, bevor das aktuelle aufgebraucht ist, werden die restlichen Token zum neuen Paket addiert.",
    loadError: "Token-Center konnte nicht geladen werden. Bitte erneut versuchen.",
    messageFreeDepleted:
      "Du hast deine lebenslangen Gratis-Konsultationen aufgebraucht. Kaufe Token unter Pläne & Zahlungen, um fortzufahren.",
    messageNoActivePurchase:
      "Kein aktueller aktiver Kauf. Du kannst unter Pläne & Zahlungen weitere Token kaufen.",
    consultThreadLimit: "Thread-Limit erreicht. Starte eine neue Sitzung, um fortzufahren.",
    noTokensDepleted: "Du hast alle Token aufgebraucht. Kaufe ein neues Paket, um fortzufahren.",
    signInForBalance: "Melde dich an, um dein Guthaben zu sehen.",
    tokenCenterGuideLink: "Packs und Limits in der Nutzungsanleitung (nur lesen)",
  },
  it: {
    ariaTokenGroup: "Gestione token",
    tokensHeading: "Token",
    lastPack: "Ultimo pacchetto:",
    remaining: "rimanenti",
    loading: "Caricamento...",
    tokenCenter: "Centro token",
    accumulation:
      "I tuoi token si accumulano: se acquisti un nuovo pacchetto prima di esaurire quello attuale, i token rimanenti si sommano al nuovo pacchetto.",
    loadError: "Impossibile caricare il centro token. Riprova.",
    messageFreeDepleted:
      "Hai esaurito le consultazioni gratuite a vita. Acquista token in Piani e pagamenti per continuare.",
    messageNoActivePurchase:
      "Nessun acquisto attivo recente. Puoi acquistare altri token in Piani e pagamenti.",
    consultThreadLimit: "Hai raggiunto il limite di questo thread. Avvia una nuova sessione per continuare.",
    noTokensDepleted: "Hai usato tutti i token. Acquista un nuovo pacchetto per continuare.",
    signInForBalance: "Accedi per vedere il saldo.",
    tokenCenterGuideLink: "Pacchetti e limiti nella guida all’uso (sola lettura)",
  },
  ja: {
    ariaTokenGroup: "トークン管理",
    tokensHeading: "トークン",
    lastPack: "最後のパック:",
    remaining: "残り",
    loading: "読み込み中…",
    tokenCenter: "トークンセンター",
    accumulation:
      "トークンは累積します。現在のパックを使い切る前に新しいパックを購入すると、残りのトークンは新しいパックに加算されます。",
    loadError: "トークンセンターを読み込めませんでした。もう一度お試しください。",
    messageFreeDepleted:
      "無料の生涯コンサル枠を使い切りました。プランとお支払いでトークンを購入して続行してください。",
    messageNoActivePurchase:
      "最近のアクティブな購入はありません。プランとお支払いでさらにトークンを購入できます。",
    consultThreadLimit: "このスレッドの上限に達しました。新しいセッションを開始して続行してください。",
    noTokensDepleted: "トークンを使い切りました。続けるには新しいパックを購入してください。",
    signInForBalance: "サインインすると残高を表示できます。",
    tokenCenterGuideLink: "利用ガイド内のパックと上限（閲覧のみ）",
  },
  zh: {
    ariaTokenGroup: "代币管理",
    tokensHeading: "代币",
    lastPack: "最近购买的包：",
    remaining: "剩余",
    loading: "加载中…",
    tokenCenter: "代币中心",
    accumulation:
      "代币会累积：若在当前包用完前购买新包，剩余代币会并入新包。",
    loadError: "无法加载代币中心。请重试。",
    messageFreeDepleted: "您已用完终身免费咨询次数。请在「套餐与付款」购买代币以继续使用。",
    messageNoActivePurchase: "没有最近的生效购买。您可以在「套餐与付款」购买更多代币。",
    consultThreadLimit: "已达到本会话上限。请开始新会话以继续。",
    noTokensDepleted: "您已用完所有代币。请购买新包以继续使用。",
    signInForBalance: "登录后可查看余额。",
    tokenCenterGuideLink: "使用指南中的套餐与限制（只读）",
  },
  ko: {
    ariaTokenGroup: "토큰 관리",
    tokensHeading: "토큰",
    lastPack: "마지막 팩:",
    remaining: "남음",
    loading: "불러오는 중…",
    tokenCenter: "토큰 센터",
    accumulation:
      "토큰은 누적됩니다. 현재 팩을 다 쓰기 전에 새 팩을 구매하면 남은 토큰이 새 팩에 더해집니다.",
    loadError: "토큰 센터를 불러올 수 없습니다. 다시 시도하세요.",
    messageFreeDepleted:
      "평생 무료 상담을 모두 사용했습니다. 요금제 및 결제에서 토큰을 구매해 계속하세요.",
    messageNoActivePurchase:
      "최근 활성 구매가 없습니다. 요금제 및 결제에서 토큰을 더 구매할 수 있습니다.",
    consultThreadLimit: "이 스레드 한도에 도달했습니다. 새 세션을 시작해 계속하세요.",
    noTokensDepleted: "토큰을 모두 사용했습니다. 계속하려면 새 팩을 구매하세요.",
    signInForBalance: "로그인하면 잔액을 확인할 수 있습니다.",
    tokenCenterGuideLink: "사용 안내의 팩 및 한도(읽기 전용)",
  },
};

export function getTokenPanelUiMessages(locale: AppLocale): TokenPanelUiMessages {
  return TOKEN_PANEL_UI[locale] ?? TOKEN_PANEL_UI[DEFAULT_LOCALE];
}
