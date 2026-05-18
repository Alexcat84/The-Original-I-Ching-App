import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type DeleteAccountPageMessages = {
  pageTitle: string;
  pageDescription: string;
  h1: string;
  intro: string;
  howTitle: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  afterSteps: string;
  deletedTitle: string;
  deletedItems: [string, string, string, string, string];
  retainedTitle: string;
  retainedBody: string;
  rcTitle: string;
  rcBody: string;
  noAccessTitle: string;
  noAccessBody: string;
};

const MESSAGES: Record<AppLocale, DeleteAccountPageMessages> = {
  es: {
    pageTitle: "Eliminación de cuenta | The Original I Ching App",
    pageDescription: "Cómo eliminar tu cuenta y qué datos se eliminan en The Original I Ching App.",
    h1: "Eliminación de cuenta",
    intro: "Puedes eliminar tu cuenta y todos los datos asociados directamente desde la app.",
    howTitle: "Cómo eliminar tu cuenta",
    step1: "Abre la app e inicia sesión.",
    step2: "Toca Opciones (el botón de ajustes en el pie del compositor).",
    step3: "Desplázate hasta Eliminar cuenta y toca Eliminar mi cuenta.",
    step4: "En el diálogo de confirmación, escribe ELIMINAR (o DELETE en inglés) y confirma.",
    afterSteps: "Tu cuenta se elimina de inmediato. La sesión se cierra automáticamente.",
    deletedTitle: "Qué datos se eliminan",
    deletedItems: [
      "Tu perfil de usuario y credenciales de acceso.",
      "Todas las sesiones de consulta e historial de chat.",
      "Saldo de tokens y registros de uso.",
      "Configuración de autenticación de dos factores.",
      "Todas las preferencias y ajustes personales.",
    ],
    retainedTitle: "Qué datos se conservan",
    retainedBody:
      "Los registros de compras y transacciones se conservan durante el período mínimo exigido por las leyes fiscales y contables aplicables. Estos registros se anonimizan y no contienen información personal identificable tras la eliminación.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "La eliminación de tu cuenta también envía una solicitud de eliminación a RevenueCat (nuestro procesador de pagos). Stripe puede conservar registros de transacciones anonimizados según lo exigen las normativas financieras.",
    noAccessTitle: "¿No puedes acceder a la app?",
    noAccessBody:
      "Si no puedes iniciar sesión y deseas solicitar la eliminación de tu cuenta, envíanos un correo a privacy@theoriginaliching.com con tu dirección de email registrada. Procesaremos tu solicitud en un plazo de 30 días.",
  },
  en: {
    pageTitle: "Account Deletion | The Original I Ching App",
    pageDescription: "How to delete your account and what data is removed from The Original I Ching App.",
    h1: "Account Deletion",
    intro: "You can permanently delete your account and all associated data directly from within the app.",
    howTitle: "How to delete your account",
    step1: "Open the app and sign in.",
    step2: "Tap Options (the gear / settings button in the composer footer).",
    step3: "Scroll to Delete account and tap Delete my account.",
    step4: "In the confirmation dialog, type DELETE (or ELIMINAR in Spanish) and confirm.",
    afterSteps: "Your account is deleted immediately. You will be signed out automatically.",
    deletedTitle: "What data is deleted",
    deletedItems: [
      "Your user profile and login credentials.",
      "All consultation sessions and chat history.",
      "Token balance and usage records.",
      "Two-factor authentication configuration.",
      "All personal preferences and settings.",
    ],
    retainedTitle: "What data is retained",
    retainedBody:
      "Purchase and transaction records are retained for a minimum period required by applicable tax and accounting laws. These records are anonymized and contain no personally identifiable information after deletion.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "Deleting your account also sends a deletion request to RevenueCat (our payment processor). Stripe may retain anonymized transaction records as required by financial regulations.",
    noAccessTitle: "Cannot access the app?",
    noAccessBody:
      "If you are unable to sign in and wish to request account deletion, email us at privacy@theoriginaliching.com with your registered email address. We will process your request within 30 days.",
  },
  pt: {
    pageTitle: "Eliminação de conta | The Original I Ching App",
    pageDescription: "Como eliminar a tua conta e quais os dados removidos na The Original I Ching App.",
    h1: "Eliminação de conta",
    intro: "Podes eliminar permanentemente a tua conta e todos os dados associados diretamente na app.",
    howTitle: "Como eliminar a tua conta",
    step1: "Abre a app e inicia sessão.",
    step2: "Toca em Opções (o botão de definições no rodapé do compositor).",
    step3: "Desloca-te até Eliminar conta e toca em Eliminar a minha conta.",
    step4: "No diálogo de confirmação, escreve ELIMINAR (ou DELETE em inglês) e confirma.",
    afterSteps: "A tua conta é eliminada imediatamente. A sessão é encerrada automaticamente.",
    deletedTitle: "Que dados são eliminados",
    deletedItems: [
      "O teu perfil de utilizador e credenciais de acesso.",
      "Todas as sessões de consulta e histórico de chat.",
      "Saldo de tokens e registos de utilização.",
      "Configuração de autenticação de dois fatores.",
      "Todas as preferências e definições pessoais.",
    ],
    retainedTitle: "Que dados são conservados",
    retainedBody:
      "Os registos de compras e transações são conservados pelo período mínimo exigido pelas leis fiscais e contabilísticas aplicáveis. Estes registos são anonimizados e não contêm informação pessoal identificável após a eliminação.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "A eliminação da tua conta também envia um pedido de eliminação ao RevenueCat (o nosso processador de pagamentos). O Stripe pode conservar registos de transações anonimizados conforme exigido pelas regulamentações financeiras.",
    noAccessTitle: "Não consegues aceder à app?",
    noAccessBody:
      "Se não consegues iniciar sessão e pretendes solicitar a eliminação da conta, envia-nos um email para privacy@theoriginaliching.com com o teu endereço de email registado. Processaremos o teu pedido no prazo de 30 dias.",
  },
  fr: {
    pageTitle: "Suppression de compte | The Original I Ching App",
    pageDescription: "Comment supprimer votre compte et quelles données sont effacées dans The Original I Ching App.",
    h1: "Suppression de compte",
    intro: "Vous pouvez supprimer définitivement votre compte et toutes les données associées directement depuis l'application.",
    howTitle: "Comment supprimer votre compte",
    step1: "Ouvrez l'application et connectez-vous.",
    step2: "Appuyez sur Options (le bouton paramètres dans le pied du compositeur).",
    step3: "Faites défiler jusqu'à Supprimer le compte et appuyez sur Supprimer mon compte.",
    step4: "Dans la boîte de confirmation, tapez DELETE et confirmez.",
    afterSteps: "Votre compte est supprimé immédiatement. Vous serez déconnecté automatiquement.",
    deletedTitle: "Données supprimées",
    deletedItems: [
      "Votre profil utilisateur et vos identifiants.",
      "Toutes les sessions de consultation et l'historique des chats.",
      "Le solde de jetons et les enregistrements d'utilisation.",
      "La configuration de l'authentification à deux facteurs.",
      "Toutes les préférences et paramètres personnels.",
    ],
    retainedTitle: "Données conservées",
    retainedBody:
      "Les enregistrements d'achats et de transactions sont conservés pendant la période minimale requise par les lois fiscales et comptables applicables. Ces enregistrements sont anonymisés et ne contiennent aucune information personnelle identifiable après suppression.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "La suppression de votre compte envoie également une demande de suppression à RevenueCat (notre prestataire de paiement). Stripe peut conserver des enregistrements de transactions anonymisés conformément aux réglementations financières.",
    noAccessTitle: "Impossible d'accéder à l'application ?",
    noAccessBody:
      "Si vous ne pouvez pas vous connecter et souhaitez demander la suppression de votre compte, envoyez-nous un e-mail à privacy@theoriginaliching.com avec votre adresse e-mail enregistrée. Nous traiterons votre demande dans les 30 jours.",
  },
  de: {
    pageTitle: "Konto löschen | The Original I Ching App",
    pageDescription: "So löschen Sie Ihr Konto und welche Daten in der The Original I Ching App entfernt werden.",
    h1: "Konto löschen",
    intro: "Du kannst dein Konto und alle zugehörigen Daten dauerhaft direkt in der App löschen.",
    howTitle: "So löschst du dein Konto",
    step1: "Öffne die App und melde dich an.",
    step2: "Tippe auf Optionen (das Einstellungs-Symbol in der Composer-Fußzeile).",
    step3: "Scrolle zu Konto löschen und tippe auf Mein Konto löschen.",
    step4: "Gib im Bestätigungsdialog DELETE ein und bestätige.",
    afterSteps: "Dein Konto wird sofort gelöscht. Du wirst automatisch abgemeldet.",
    deletedTitle: "Gelöschte Daten",
    deletedItems: [
      "Dein Benutzerprofil und deine Anmeldedaten.",
      "Alle Beratungssitzungen und der Chat-Verlauf.",
      "Token-Guthaben und Nutzungsaufzeichnungen.",
      "Konfiguration der Zwei-Faktor-Authentifizierung.",
      "Alle persönlichen Einstellungen und Präferenzen.",
    ],
    retainedTitle: "Aufbewahrte Daten",
    retainedBody:
      "Kauf- und Transaktionsaufzeichnungen werden für den gesetzlich vorgeschriebenen Mindestzeitraum aufbewahrt. Diese Aufzeichnungen werden anonymisiert und enthalten nach der Löschung keine personenbezogenen Daten mehr.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "Die Kontolöschung sendet auch eine Löschanfrage an RevenueCat (unseren Zahlungsdienstleister). Stripe kann anonymisierte Transaktionsaufzeichnungen gemäß den Finanzvorschriften aufbewahren.",
    noAccessTitle: "Kein Zugriff auf die App?",
    noAccessBody:
      "Falls du dich nicht anmelden kannst und die Löschung deines Kontos beantragen möchtest, schreibe uns eine E-Mail an privacy@theoriginaliching.com mit deiner registrierten E-Mail-Adresse. Wir bearbeiten deinen Antrag innerhalb von 30 Tagen.",
  },
  it: {
    pageTitle: "Eliminazione account | The Original I Ching App",
    pageDescription: "Come eliminare il tuo account e quali dati vengono rimossi da The Original I Ching App.",
    h1: "Eliminazione account",
    intro: "Puoi eliminare definitivamente il tuo account e tutti i dati associati direttamente dall'app.",
    howTitle: "Come eliminare il tuo account",
    step1: "Apri l'app e accedi.",
    step2: "Tocca Opzioni (il pulsante impostazioni nel piè del compositore).",
    step3: "Scorri fino a Elimina account e tocca Elimina il mio account.",
    step4: "Nella finestra di conferma, scrivi DELETE e conferma.",
    afterSteps: "Il tuo account viene eliminato immediatamente. Verrai disconnesso automaticamente.",
    deletedTitle: "Dati eliminati",
    deletedItems: [
      "Il tuo profilo utente e le credenziali di accesso.",
      "Tutte le sessioni di consultazione e la cronologia delle chat.",
      "Saldo token e registri di utilizzo.",
      "Configurazione dell'autenticazione a due fattori.",
      "Tutte le preferenze e impostazioni personali.",
    ],
    retainedTitle: "Dati conservati",
    retainedBody:
      "I registri di acquisto e transazione sono conservati per il periodo minimo richiesto dalle leggi fiscali e contabili applicabili. Questi record vengono anonimizzati e non contengono informazioni personali identificabili dopo l'eliminazione.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "L'eliminazione del tuo account invia anche una richiesta di cancellazione a RevenueCat (il nostro elaboratore di pagamenti). Stripe può conservare registri di transazioni anonimizzati come richiesto dalle normative finanziarie.",
    noAccessTitle: "Non riesci ad accedere all'app?",
    noAccessBody:
      "Se non riesci ad accedere e desideri richiedere l'eliminazione del tuo account, inviaci un'email a privacy@theoriginaliching.com con il tuo indirizzo email registrato. Elaboreremo la tua richiesta entro 30 giorni.",
  },
  ja: {
    pageTitle: "アカウント削除 | The Original I Ching App",
    pageDescription: "The Original I Ching Appでアカウントを削除する方法と削除されるデータについて。",
    h1: "アカウント削除",
    intro: "アカウントとすべての関連データをアプリから直接、完全に削除できます。",
    howTitle: "アカウントの削除方法",
    step1: "アプリを開いてサインインします。",
    step2: "コンポーザーフッターの「オプション」（歯車アイコン）をタップします。",
    step3: "「アカウントを削除」までスクロールし、「アカウントを削除する」をタップします。",
    step4: "確認ダイアログに DELETE と入力して確定します。",
    afterSteps: "アカウントは即時削除されます。自動的にサインアウトされます。",
    deletedTitle: "削除されるデータ",
    deletedItems: [
      "ユーザープロファイルとログイン認証情報。",
      "すべての相談セッションとチャット履歴。",
      "トークン残高と利用履歴。",
      "二段階認証の設定。",
      "すべての個人設定と環境設定。",
    ],
    retainedTitle: "保持されるデータ",
    retainedBody:
      "購入記録と取引記録は、適用される税法および会計法が定める最低期間保持されます。これらの記録は削除後に匿名化され、個人を特定できる情報は含まれません。",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "アカウント削除により、RevenueCat（決済サービス）への削除リクエストも送信されます。Stripeは金融規制に基づき、匿名化された取引記録を保持する場合があります。",
    noAccessTitle: "アプリにアクセスできない場合",
    noAccessBody:
      "サインインできない場合や、アカウント削除を申請したい場合は、登録済みのメールアドレスを添えて privacy@theoriginaliching.com までご連絡ください。30日以内にご対応いたします。",
  },
  zh: {
    pageTitle: "删除账户 | The Original I Ching App",
    pageDescription: "如何删除账户以及 The Original I Ching App 会移除哪些数据。",
    h1: "删除账户",
    intro: "你可以直接在应用内永久删除账户及所有关联数据。",
    howTitle: "如何删除账户",
    step1: "打开应用并登录。",
    step2: "点击「选项」（编辑器底部的设置按钮）。",
    step3: "滚动至「删除账户」，点击「删除我的账户」。",
    step4: "在确认对话框中输入 DELETE 并确认。",
    afterSteps: "账户将立即删除，并自动退出登录。",
    deletedTitle: "将被删除的数据",
    deletedItems: [
      "用户资料和登录凭证。",
      "所有咨询会话和聊天记录。",
      "代币余额和使用记录。",
      "两步验证配置。",
      "所有个人偏好和设置。",
    ],
    retainedTitle: "将被保留的数据",
    retainedBody:
      "购买和交易记录将根据适用税法和会计法的要求保留最低期限。这些记录在删除后将被匿名处理，不含任何可识别个人身份的信息。",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "删除账户时，系统还会向 RevenueCat（我们的支付处理商）发送删除请求。Stripe 可能依照金融法规保留匿名交易记录。",
    noAccessTitle: "无法访问应用？",
    noAccessBody:
      "如果你无法登录且希望请求删除账户，请发送邮件至 privacy@theoriginaliching.com，并附上你的注册邮箱地址。我们将在 30 天内处理你的请求。",
  },
  ko: {
    pageTitle: "계정 삭제 | The Original I Ching App",
    pageDescription: "The Original I Ching App에서 계정을 삭제하는 방법과 삭제되는 데이터.",
    h1: "계정 삭제",
    intro: "앱에서 직접 계정과 관련 데이터를 영구적으로 삭제할 수 있습니다.",
    howTitle: "계정 삭제 방법",
    step1: "앱을 열고 로그인합니다.",
    step2: "작성기 하단의 옵션(설정 아이콘)을 탭합니다.",
    step3: "계정 삭제로 스크롤한 후 내 계정 삭제를 탭합니다.",
    step4: "확인 대화 상자에 DELETE를 입력하고 확인합니다.",
    afterSteps: "계정은 즉시 삭제되며 자동으로 로그아웃됩니다.",
    deletedTitle: "삭제되는 데이터",
    deletedItems: [
      "사용자 프로필 및 로그인 자격 증명.",
      "모든 상담 세션 및 채팅 기록.",
      "토큰 잔액 및 사용 기록.",
      "이중 인증 설정.",
      "모든 개인 환경 설정.",
    ],
    retainedTitle: "보관되는 데이터",
    retainedBody:
      "구매 및 거래 기록은 적용 세법 및 회계법에서 요구하는 최소 기간 동안 보관됩니다. 이 기록은 삭제 후 익명화되며 개인 식별 정보를 포함하지 않습니다.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "계정 삭제 시 RevenueCat(결제 처리사)에도 삭제 요청이 전송됩니다. Stripe는 금융 규정에 따라 익명화된 거래 기록을 보관할 수 있습니다.",
    noAccessTitle: "앱에 접근할 수 없나요?",
    noAccessBody:
      "로그인이 불가능하여 계정 삭제를 요청하려는 경우, 등록된 이메일 주소를 포함하여 privacy@theoriginaliching.com으로 이메일을 보내주세요. 30일 이내에 처리해 드립니다.",
  },
  ar: {
    pageTitle: "حذف الحساب | The Original I Ching App",
    pageDescription: "كيفية حذف حسابك والبيانات التي تُزال من The Original I Ching App.",
    h1: "حذف الحساب",
    intro: "يمكنك حذف حسابك وجميع البيانات المرتبطة به نهائياً مباشرةً من داخل التطبيق.",
    howTitle: "كيفية حذف حسابك",
    step1: "افتح التطبيق وسجّل الدخول.",
    step2: "اضغط على الخيارات (زر الإعدادات في تذييل المحرر).",
    step3: "انتقل إلى حذف الحساب واضغط على حذف حسابي.",
    step4: "في مربع الحوار، اكتب DELETE وأكّد.",
    afterSteps: "يُحذف حسابك فوراً وتُسجَّل خروجاً تلقائياً.",
    deletedTitle: "البيانات المحذوفة",
    deletedItems: [
      "ملفك الشخصي وبيانات اعتماد الدخول.",
      "جميع جلسات الاستشارة وسجل المحادثات.",
      "رصيد الرموز وسجلات الاستخدام.",
      "إعداد المصادقة الثنائية.",
      "جميع التفضيلات والإعدادات الشخصية.",
    ],
    retainedTitle: "البيانات المحتفظ بها",
    retainedBody:
      "تُحتفظ بسجلات الشراء والمعاملات للمدة الدنيا المطلوبة بموجب قوانين الضرائب والمحاسبة المعمول بها. تُجعل هذه السجلات مجهولة الهوية بعد الحذف ولا تحتوي على أي معلومات شخصية.",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "يُرسَل أيضاً طلب حذف إلى RevenueCat (معالج الدفع) عند حذف حسابك. قد يحتفظ Stripe بسجلات معاملات مجهولة الهوية وفقاً للوائح المالية.",
    noAccessTitle: "لا يمكنك الوصول إلى التطبيق؟",
    noAccessBody:
      "إذا لم تتمكن من تسجيل الدخول وترغب في طلب حذف حسابك، أرسل لنا بريداً إلكترونياً إلى privacy@theoriginaliching.com مع عنوان بريدك المسجّل. سنعالج طلبك في غضون 30 يوماً.",
  },
  hi: {
    pageTitle: "खाता हटाएं | The Original I Ching App",
    pageDescription: "The Original I Ching App में खाता कैसे हटाएं और कौन सा डेटा हटाया जाता है।",
    h1: "खाता हटाएं",
    intro: "आप सीधे ऐप से अपना खाता और सभी संबंधित डेटा स्थायी रूप से हटा सकते हैं।",
    howTitle: "खाता कैसे हटाएं",
    step1: "ऐप खोलें और साइन इन करें।",
    step2: "कंपोज़र फुटर में विकल्प (सेटिंग बटन) पर टैप करें।",
    step3: "खाता हटाएं तक स्क्रॉल करें और मेरा खाता हटाएं पर टैप करें।",
    step4: "पुष्टि संवाद में DELETE टाइप करें और पुष्टि करें।",
    afterSteps: "आपका खाता तुरंत हटा दिया जाता है। आप स्वचालित रूप से साइन आउट हो जाएंगे।",
    deletedTitle: "हटाया जाने वाला डेटा",
    deletedItems: [
      "आपका उपयोगकर्ता प्रोफ़ाइल और लॉगिन क्रेडेंशियल।",
      "सभी परामर्श सत्र और चैट इतिहास।",
      "टोकन शेष और उपयोग रिकॉर्ड।",
      "दो-कारक प्रमाणीकरण कॉन्फ़िगरेशन।",
      "सभी व्यक्तिगत प्राथमिकताएं और सेटिंग्स।",
    ],
    retainedTitle: "संरक्षित डेटा",
    retainedBody:
      "खरीद और लेनदेन रिकॉर्ड लागू कर और लेखांकन कानूनों द्वारा आवश्यक न्यूनतम अवधि के लिए रखे जाते हैं। ये रिकॉर्ड हटाने के बाद गुमनाम कर दिए जाते हैं और इनमें कोई व्यक्तिगत पहचान योग्य जानकारी नहीं होती।",
    rcTitle: "RevenueCat / Stripe",
    rcBody:
      "खाता हटाने पर RevenueCat (हमारे भुगतान प्रोसेसर) को भी हटाने का अनुरोध भेजा जाता है। Stripe वित्तीय नियमों के अनुसार गुमनाम लेनदेन रिकॉर्ड रख सकता है।",
    noAccessTitle: "ऐप तक पहुंच नहीं है?",
    noAccessBody:
      "यदि आप साइन इन नहीं कर पा रहे और खाता हटाने का अनुरोध करना चाहते हैं, तो अपने पंजीकृत ईमेल पते के साथ privacy@theoriginaliching.com पर हमें ईमेल करें। हम 30 दिनों के भीतर आपके अनुरोध को संसाधित करेंगे।",
  },
};

export function getDeleteAccountPageMessages(locale: AppLocale): DeleteAccountPageMessages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
