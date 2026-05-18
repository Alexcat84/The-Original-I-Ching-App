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
    step4: "En el diálogo de confirmación, escribe ELIMINAR y confirma.",
    afterSteps: "Tu cuenta se elimina de inmediato. La sesión se cierra automáticamente.",
    deletedTitle: "Qué datos se eliminan",
    deletedItems: [
      "Tu perfil de usuario y credenciales de acceso.",
      "Todas las sesiones de consulta e historial de chat.",
      "Saldo de tokens y registros de uso.",
      "Configuración de autenticación de dos factores.",
      "Todas las preferencias y ajustes personales.",
    ],
    retainedTitle: "Datos de compra y facturación",
    retainedBody:
      "Nuestros proveedores de pasarelas de pago conservan los registros de compras para efectos fiscales, de facturación y cobros, según lo exigen las regulaciones financieras aplicables.",
    rcTitle: "Proveedores de pago",
    rcBody:
      "Al eliminar tu cuenta, enviamos una solicitud de eliminación de datos a nuestros proveedores de pasarelas de pago.",
    noAccessTitle: "¿No puedes acceder a la app?",
    noAccessBody:
      "Si no puedes iniciar sesión y deseas solicitar la eliminación de tu cuenta, escríbenos a support@theoriginaliching.com con tu dirección de email registrada. Procesaremos tu solicitud en un plazo de 30 días.",
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
    step4: "In the confirmation dialog, type DELETE and confirm.",
    afterSteps: "Your account is deleted immediately. You will be signed out automatically.",
    deletedTitle: "What data is deleted",
    deletedItems: [
      "Your user profile and login credentials.",
      "All consultation sessions and chat history.",
      "Token balance and usage records.",
      "Two-factor authentication configuration.",
      "All personal preferences and settings.",
    ],
    retainedTitle: "Purchase and billing data",
    retainedBody:
      "Our payment gateway providers retain purchase records for tax, billing, and invoicing purposes, as required by applicable financial regulations.",
    rcTitle: "Payment providers",
    rcBody:
      "When you delete your account, we send a data deletion request to our payment gateway providers.",
    noAccessTitle: "Cannot access the app?",
    noAccessBody:
      "If you are unable to sign in and wish to request account deletion, email us at support@theoriginaliching.com with your registered email address. We will process your request within 30 days.",
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
    step4: "No diálogo de confirmação, escreve ELIMINAR e confirma.",
    afterSteps: "A tua conta é eliminada imediatamente. A sessão é encerrada automaticamente.",
    deletedTitle: "Que dados são eliminados",
    deletedItems: [
      "O teu perfil de utilizador e credenciais de acesso.",
      "Todas as sessões de consulta e histórico de chat.",
      "Saldo de tokens e registos de utilização.",
      "Configuração de autenticação de dois fatores.",
      "Todas as preferências e definições pessoais.",
    ],
    retainedTitle: "Dados de compra e faturação",
    retainedBody:
      "Os nossos fornecedores de passerelles de pagamento conservam os registos de compras para efeitos fiscais, de faturação e cobranças, conforme exigido pelas regulamentações financeiras aplicáveis.",
    rcTitle: "Fornecedores de pagamento",
    rcBody:
      "Ao eliminar a tua conta, enviamos um pedido de eliminação de dados aos nossos fornecedores de passerelles de pagamento.",
    noAccessTitle: "Não consegues aceder à app?",
    noAccessBody:
      "Se não consegues iniciar sessão e pretendes solicitar a eliminação da conta, envia-nos um email para support@theoriginaliching.com com o teu endereço de email registado. Processaremos o teu pedido no prazo de 30 dias.",
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
    step4: "Dans la boîte de confirmation, écris SUPPRIMER et confirme.",
    afterSteps: "Votre compte est supprimé immédiatement. Vous serez déconnecté automatiquement.",
    deletedTitle: "Données supprimées",
    deletedItems: [
      "Votre profil utilisateur et vos identifiants.",
      "Toutes les sessions de consultation et l'historique des chats.",
      "Le solde de jetons et les enregistrements d'utilisation.",
      "La configuration de l'authentification à deux facteurs.",
      "Toutes les préférences et paramètres personnels.",
    ],
    retainedTitle: "Données d'achat et de facturation",
    retainedBody:
      "Nos prestataires de passerelles de paiement conservent les enregistrements d'achats à des fins fiscales, de facturation et de recouvrement, conformément aux réglementations financières applicables.",
    rcTitle: "Prestataires de paiement",
    rcBody:
      "Lors de la suppression de ton compte, nous envoyons une demande de suppression de données à nos prestataires de passerelles de paiement.",
    noAccessTitle: "Impossible d'accéder à l'application ?",
    noAccessBody:
      "Si tu ne peux pas te connecter et souhaites demander la suppression de ton compte, écris-nous à support@theoriginaliching.com avec ton adresse e-mail enregistrée. Nous traiterons ta demande dans les 30 jours.",
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
    step4: "Gib im Bestätigungsdialog LÖSCHEN ein und bestätige.",
    afterSteps: "Dein Konto wird sofort gelöscht. Du wirst automatisch abgemeldet.",
    deletedTitle: "Gelöschte Daten",
    deletedItems: [
      "Dein Benutzerprofil und deine Anmeldedaten.",
      "Alle Beratungssitzungen und der Chat-Verlauf.",
      "Token-Guthaben und Nutzungsaufzeichnungen.",
      "Konfiguration der Zwei-Faktor-Authentifizierung.",
      "Alle persönlichen Einstellungen und Präferenzen.",
    ],
    retainedTitle: "Kauf- und Abrechnungsdaten",
    retainedBody:
      "Unsere Zahlungsgateway-Anbieter speichern Kaufbelege zu steuerlichen, Abrechnungs- und Inkassozwecken, wie es die geltenden Finanzvorschriften vorschreiben.",
    rcTitle: "Zahlungsanbieter",
    rcBody:
      "Beim Löschen deines Kontos senden wir eine Datenlöschanfrage an unsere Zahlungsgateway-Anbieter.",
    noAccessTitle: "Kein Zugriff auf die App?",
    noAccessBody:
      "Falls du dich nicht anmelden kannst und die Löschung deines Kontos beantragen möchtest, schreibe uns an support@theoriginaliching.com mit deiner registrierten E-Mail-Adresse. Wir bearbeiten deinen Antrag innerhalb von 30 Tagen.",
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
    step4: "Nella finestra di conferma, scrivi ELIMINA e conferma.",
    afterSteps: "Il tuo account viene eliminato immediatamente. Verrai disconnesso automaticamente.",
    deletedTitle: "Dati eliminati",
    deletedItems: [
      "Il tuo profilo utente e le credenziali di accesso.",
      "Tutte le sessioni di consultazione e la cronologia delle chat.",
      "Saldo token e registri di utilizzo.",
      "Configurazione dell'autenticazione a due fattori.",
      "Tutte le preferenze e impostazioni personali.",
    ],
    retainedTitle: "Dati di acquisto e fatturazione",
    retainedBody:
      "I nostri fornitori di gateway di pagamento conservano i registri degli acquisti per finalità fiscali, di fatturazione e di riscossione, come richiesto dalle normative finanziarie applicabili.",
    rcTitle: "Fornitori di pagamento",
    rcBody:
      "Quando elimini il tuo account, inviamo una richiesta di cancellazione dei dati ai nostri fornitori di gateway di pagamento.",
    noAccessTitle: "Non riesci ad accedere all'app?",
    noAccessBody:
      "Se non riesci ad accedere e desideri richiedere l'eliminazione del tuo account, scrivici a support@theoriginaliching.com con il tuo indirizzo email registrato. Elaboreremo la tua richiesta entro 30 giorni.",
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
    retainedTitle: "購入・請求データ",
    retainedBody:
      "当社の決済ゲートウェイプロバイダーは、適用される財務規制に従い、税務・請求・決済目的で購入記録を保持します。",
    rcTitle: "決済プロバイダー",
    rcBody:
      "アカウントを削除すると、当社の決済ゲートウェイプロバイダーにデータ削除リクエストが送信されます。",
    noAccessTitle: "アプリにアクセスできない場合",
    noAccessBody:
      "サインインできない場合や、アカウント削除を申請したい場合は、登録済みのメールアドレスを添えて support@theoriginaliching.com までご連絡ください。30日以内にご対応いたします。",
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
    retainedTitle: "购买与账单数据",
    retainedBody:
      "我们的支付网关提供商根据适用的财务法规，出于税务、账单及收款目的保留购买记录。",
    rcTitle: "支付提供商",
    rcBody:
      "删除账户时，我们会向支付网关提供商发送数据删除请求。",
    noAccessTitle: "无法访问应用？",
    noAccessBody:
      "如果你无法登录且希望请求删除账户，请发送邮件至 support@theoriginaliching.com，并附上你的注册邮箱地址。我们将在 30 天内处理你的请求。",
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
    retainedTitle: "구매 및 청구 데이터",
    retainedBody:
      "결제 게이트웨이 제공업체는 적용 가능한 재무 규정에 따라 세금, 청구 및 수금 목적으로 구매 기록을 보관합니다.",
    rcTitle: "결제 제공업체",
    rcBody:
      "계정 삭제 시, 결제 게이트웨이 제공업체에 데이터 삭제 요청이 전송됩니다.",
    noAccessTitle: "앱에 접근할 수 없나요?",
    noAccessBody:
      "로그인이 불가능하여 계정 삭제를 요청하려는 경우, 등록된 이메일 주소를 포함하여 support@theoriginaliching.com으로 이메일을 보내주세요. 30일 이내에 처리해 드립니다.",
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
    retainedTitle: "بيانات الشراء والفوترة",
    retainedBody:
      "يحتفظ مزودو بوابات الدفع لدينا بسجلات المشتريات لأغراض ضريبية وإصدار الفواتير والتحصيل، وفقاً للوائح المالية المعمول بها.",
    rcTitle: "مزودو الدفع",
    rcBody:
      "عند حذف حسابك، نُرسل طلب حذف بيانات إلى مزودي بوابات الدفع لدينا.",
    noAccessTitle: "لا يمكنك الوصول إلى التطبيق؟",
    noAccessBody:
      "إذا لم تتمكن من تسجيل الدخول وترغب في طلب حذف حسابك، أرسل لنا بريداً إلكترونياً إلى support@theoriginaliching.com مع عنوان بريدك المسجّل. سنعالج طلبك في غضون 30 يوماً.",
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
    retainedTitle: "खरीद और बिलिंग डेटा",
    retainedBody:
      "हमारे पेमेंट गेटवे प्रदाता लागू वित्तीय नियमों के अनुसार कर, बिलिंग और संग्रह उद्देश्यों के लिए खरीद रिकॉर्ड रखते हैं।",
    rcTitle: "भुगतान प्रदाता",
    rcBody:
      "खाता हटाने पर, हम अपने पेमेंट गेटवे प्रदाताओं को डेटा हटाने का अनुरोध भेजते हैं।",
    noAccessTitle: "ऐप तक पहुंच नहीं है?",
    noAccessBody:
      "यदि आप साइन इन नहीं कर पा रहे और खाता हटाने का अनुरोध करना चाहते हैं, तो अपने पंजीकृत ईमेल पते के साथ support@theoriginaliching.com पर हमें ईमेल करें। हम 30 दिनों के भीतर आपके अनुरोध को संसाधित करेंगे।",
  },
};

export function getDeleteAccountPageMessages(locale: AppLocale): DeleteAccountPageMessages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
