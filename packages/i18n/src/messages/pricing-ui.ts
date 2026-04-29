import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

export type PricingUiMessages = {
  title: string;
  /** Use {{count}} for balance */
  balanceLoggedIn: string;
  balanceUnknown: string;
  modelLine: string;
  tokensAccumulate: string;
  threadLimitDepends: string;
  /** Use {{n}} for session limit */
  perThreadCap: string;
  buyTokens: string;
  opening: string;
  loginRequired: string;
  errorCheckout: string;
  depleted: string;
  /** Word after a number, e.g. "20 tokens" */
  tokensWord: string;
};

const PRICING_UI: Record<AppLocale, PricingUiMessages> = {
  es: {
    title: "Packs de tokens",
    balanceLoggedIn: "Tienes {{count}} tokens disponibles",
    balanceUnknown: "Inicia sesión para ver tu saldo",
    modelLine: "El modelo activo es 100% por packs de tokens consumibles.",
    tokensAccumulate:
      "Tus tokens se acumulan: si compras un nuevo pack antes de agotar el actual, los tokens restantes se suman al nuevo pack.",
    threadLimitDepends:
      "El máximo de preguntas encadenadas por hilo no depende de cuántos tokens tengas en total: lo fija siempre el último pack que hayas adquirido (p. ej. Seeker hasta 3, Practitioner hasta 5, Master hasta 8 por hilo). Cada nueva compra actualiza ese límite según ese pack.",
    perThreadCap: "Hasta {{n}} preguntas por hilo",
    buyTokens: "Comprar tokens",
    opening: "Abriendo...",
    loginRequired: "Para comprar tokens necesitas iniciar sesión.",
    errorCheckout:
      "No se pudo preparar el enlace de compra. Revisa la URL de planes en variables de entorno.",
    depleted: "Has usado todos tus tokens. Compra un nuevo paquete para continuar.",
    tokensWord: "tokens",
  },
  en: {
    title: "Token packs",
    balanceLoggedIn: "You have {{count}} tokens available",
    balanceUnknown: "Sign in to see your balance",
    modelLine: "The active model is 100% consumable token packs.",
    tokensAccumulate:
      "Your tokens accumulate: if you buy a new pack before running out, your remaining tokens carry over and add to the new pack.",
    threadLimitDepends:
      "The maximum chained questions per thread does not depend on your total token balance: it is always set by the last pack you purchased (e.g. Seeker up to 3, Practitioner up to 5, Master up to 8 per thread). Each new purchase updates that limit according to that pack.",
    perThreadCap: "Up to {{n}} questions per thread",
    buyTokens: "Buy tokens",
    opening: "Opening...",
    loginRequired: "You need to sign in to buy tokens.",
    errorCheckout: "Could not prepare the checkout link. Check the plans URL in environment variables.",
    depleted: "You have used all your tokens. Buy a new pack to continue.",
    tokensWord: "tokens",
  },
  pt: {
    title: "Pacotes de tokens",
    balanceLoggedIn: "Tens {{count}} tokens disponíveis",
    balanceUnknown: "Inicia sessão para ver o teu saldo",
    modelLine: "O modelo ativo é 100% baseado em pacotes de tokens consumíveis.",
    tokensAccumulate:
      "Os teus tokens acumulam-se: se comprares um novo pack antes de esgotar o atual, os tokens restantes somam-se ao novo pack.",
    threadLimitDepends:
      "O máximo de perguntas encadeadas por fio não depende do total de tokens: é sempre definido pelo último pack que compraste (p.ex. Seeker até 3, Practitioner até 5, Master até 8 por fio). Cada nova compra atualiza esse limite conforme esse pack.",
    perThreadCap: "Até {{n}} perguntas por fio",
    buyTokens: "Comprar tokens",
    opening: "A abrir...",
    loginRequired: "Precisas de iniciar sessão para comprar tokens.",
    errorCheckout:
      "Não foi possível preparar a ligação de compra. Verifica o URL dos planos nas variáveis de ambiente.",
    depleted: "Usaste todos os tokens. Compra um novo pacote para continuar.",
    tokensWord: "tokens",
  },
  fr: {
    title: "Packs de jetons",
    balanceLoggedIn: "Vous avez {{count}} jetons disponibles",
    balanceUnknown: "Connectez-vous pour voir votre solde",
    modelLine: "Le modèle actif repose à 100 % sur des packs de jetons consommables.",
    tokensAccumulate:
      "Vos jetons s’accumulent : si vous achetez un nouveau pack avant d’épuiser l’actuel, les jetons restants s’ajoutent au nouveau pack.",
    threadLimitDepends:
      "Le nombre maximal de questions enchaînées par fil ne dépend pas de votre solde total de jetons : il est toujours fixé par le dernier pack acheté (p. ex. Seeker jusqu’à 3, Practitioner jusqu’à 5, Master jusqu’à 8 par fil). Chaque nouvel achat met à jour cette limite selon ce pack.",
    perThreadCap: "Jusqu’à {{n}} questions par fil",
    buyTokens: "Acheter des jetons",
    opening: "Ouverture...",
    loginRequired: "Vous devez être connecté pour acheter des jetons.",
    errorCheckout:
      "Impossible de préparer le lien de paiement. Vérifiez l’URL des plans dans les variables d’environnement.",
    depleted: "Vous avez utilisé tous vos jetons. Achetez un nouveau pack pour continuer.",
    tokensWord: "jetons",
  },
  de: {
    title: "Token-Pakete",
    balanceLoggedIn: "Du hast {{count}} Token verfügbar",
    balanceUnknown: "Melde dich an, um dein Guthaben zu sehen",
    modelLine: "Das aktive Modell basiert zu 100 % auf verbrauchbaren Token-Paketen.",
    tokensAccumulate:
      "Deine Token summieren sich: Wenn du ein neues Paket kaufst, bevor das aktuelle aufgebraucht ist, werden die restlichen Token zum neuen Paket addiert.",
    threadLimitDepends:
      "Die maximale Anzahl verketteter Fragen pro Thread hängt nicht von deinem gesamten Token-Guthaben ab: Sie richtet sich immer nach dem zuletzt gekauften Paket (z. B. Seeker bis 3, Practitioner bis 5, Master bis 8 pro Thread). Jeder neue Kauf aktualisiert dieses Limit entsprechend dem Paket.",
    perThreadCap: "Bis zu {{n}} Fragen pro Thread",
    buyTokens: "Token kaufen",
    opening: "Wird geöffnet...",
    loginRequired: "Du musst angemeldet sein, um Token zu kaufen.",
    errorCheckout:
      "Checkout-Link konnte nicht vorbereitet werden. Prüfe die Pläne-URL in den Umgebungsvariablen.",
    depleted: "Du hast alle Token aufgebraucht. Kaufe ein neues Paket, um fortzufahren.",
    tokensWord: "Token",
  },
  it: {
    title: "Pacchetti di token",
    balanceLoggedIn: "Hai {{count}} token disponibili",
    balanceUnknown: "Accedi per vedere il saldo",
    modelLine: "Il modello attivo è al 100% basato su pacchetti di token consumabili.",
    tokensAccumulate:
      "I tuoi token si accumulano: se acquisti un nuovo pacchetto prima di esaurire quello attuale, i token rimanenti si sommano al nuovo pacchetto.",
    threadLimitDepends:
      "Il massimo di domande concatenate per thread non dipende dal totale di token: è sempre definito dall’ultimo pacchetto acquistato (es. Seeker fino a 3, Practitioner fino a 5, Master fino a 8 per thread). Ogni nuovo acquisto aggiorna quel limite in base al pacchetto.",
    perThreadCap: "Fino a {{n}} domande per thread",
    buyTokens: "Acquista token",
    opening: "Apertura...",
    loginRequired: "Devi accedere per acquistare token.",
    errorCheckout:
      "Impossibile preparare il link di acquisto. Controlla l’URL dei piani nelle variabili d’ambiente.",
    depleted: "Hai usato tutti i token. Acquista un nuovo pacchetto per continuare.",
    tokensWord: "token",
  },
  ja: {
    title: "トークンパック",
    balanceLoggedIn: "利用可能なトークンは {{count}} です",
    balanceUnknown: "サインインすると残高を表示できます",
    modelLine: "現在のモデルは、すべて消費型トークンパック方式です。",
    tokensAccumulate:
      "トークンは累積します。現在のパックを使い切る前に新しいパックを購入すると、残りのトークンは新しいパックに加算されます。",
    threadLimitDepends:
      "1スレッドあたりの連続質問の上限は、トークン総量ではなく、最後に購入したパックで決まります（例：Seeker は最大3、Practitioner は最大5、Master は最大8／スレッド）。新しい購入のたびに、そのパックに応じて上限が更新されます。",
    perThreadCap: "スレッドあたり最大 {{n}} 問まで",
    buyTokens: "トークンを購入",
    opening: "開いています…",
    loginRequired: "トークンを購入するにはサインインが必要です。",
    errorCheckout: "決済リンクを準備できませんでした。環境変数のプランURLを確認してください。",
    depleted: "トークンを使い切りました。続けるには新しいパックを購入してください。",
    tokensWord: "トークン",
  },
  zh: {
    title: "代币包",
    balanceLoggedIn: "您有 {{count}} 枚可用代币",
    balanceUnknown: "登录后可查看余额",
    modelLine: "当前模式完全基于可消耗的代币包。",
    tokensAccumulate:
      "代币会累积：若在当前包用完前购买新包，剩余代币会并入新包。",
    threadLimitDepends:
      "每个会话（线程）可连续追问的上限不取决于代币总余额，而始终由您最后购买的包决定（例如 Seeker 每线程最多 3 问，Practitioner 5 问，Master 8 问）。每次新购买都会按该包更新此上限。",
    perThreadCap: "每线程最多 {{n}} 个问题",
    buyTokens: "购买代币",
    opening: "正在打开…",
    loginRequired: "购买代币需要先登录。",
    errorCheckout: "无法准备结账链接。请检查环境变量中的套餐 URL。",
    depleted: "您已用完所有代币。请购买新包以继续使用。",
    tokensWord: "枚代币",
  },
  ko: {
    title: "토큰 팩",
    balanceLoggedIn: "사용 가능한 토큰이 {{count}}개입니다",
    balanceUnknown: "로그인하면 잔액을 확인할 수 있습니다",
    modelLine: "현재 모델은 100% 소비형 토큰 팩 기반입니다.",
    tokensAccumulate:
      "토큰은 누적됩니다. 현재 팩을 다 쓰기 전에 새 팩을 구매하면 남은 토큰이 새 팩에 더해집니다.",
    threadLimitDepends:
      "스레드당 연속 질문 상한은 총 토큰 잔액이 아니라 마지막으로 구매한 팩으로 정해집니다(예: Seeker 최대 3, Practitioner 최대 5, Master 최대 8/스레드). 새 구매마다 해당 팩에 따라 상한이 갱신됩니다.",
    perThreadCap: "스레드당 최대 {{n}}개 질문",
    buyTokens: "토큰 구매",
    opening: "여는 중…",
    loginRequired: "토큰을 구매하려면 로그인해야 합니다.",
    errorCheckout: "결제 링크를 준비할 수 없습니다. 환경 변수의 플랜 URL을 확인하세요.",
    depleted: "토큰을 모두 사용했습니다. 계속하려면 새 팩을 구매하세요.",
    tokensWord: "토큰",
  },
  ar: {
    title: "باقات الرموز",
    balanceLoggedIn: "لديك {{count}} رمز متاح",
    balanceUnknown: "سجّل الدخول لرؤية رصيدك",
    modelLine: "النموذج النشط يعتمد 100% على باقات رموز قابلة للاستهلاك.",
    tokensAccumulate:
      "رموزك تتراكم: إذا اشتريت باقة جديدة قبل نفاد الحالية، تنتقل الرموز المتبقية وتُضاف إلى الباقة الجديدة.",
    threadLimitDepends:
      "الحد الأقصى للأسئلة المتسلسلة لكل محادثة لا يعتمد على إجمالي رصيدك من الرموز: بل يُحدَّد دائمًا بآخر باقة اشتريتها (مثلًا: Seeker حتى 3، Practitioner حتى 5، Master حتى 8 لكل محادثة). كل عملية شراء جديدة تحدّث هذا الحد وفق الباقة.",
    perThreadCap: "حتى {{n}} سؤال لكل محادثة",
    buyTokens: "شراء رموز",
    opening: "جارٍ الفتح…",
    loginRequired: "يجب تسجيل الدخول لشراء الرموز.",
    errorCheckout: "تعذّر تجهيز رابط الدفع. تحقق من رابط الخطط في متغيرات البيئة.",
    depleted: "لقد استنفدت جميع رموزك. اشترِ باقة جديدة للمتابعة.",
    tokensWord: "رمز",
  },
};

export function getPricingUiMessages(locale: AppLocale): PricingUiMessages {
  return PRICING_UI[locale] ?? PRICING_UI[DEFAULT_LOCALE];
}

export function formatPricingBalance(msg: PricingUiMessages, count: number): string {
  return interpolate(msg.balanceLoggedIn, { count });
}

export function formatPerThreadCap(msg: PricingUiMessages, n: number): string {
  return interpolate(msg.perThreadCap, { n });
}

/** Marketing blurbs in token-packs only have es/en; map UI locale to one of those. */
export function packMarketingLocale(locale: AppLocale): "es" | "en" {
  return locale === "es" ? "es" : "en";
}
