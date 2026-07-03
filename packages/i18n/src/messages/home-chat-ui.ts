import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type HomeChatUiMessages = {
  language: string;
  chats: string;
  signIn: string;
  signOut: string;
  options: string;
  writeConsultation: string;
  positiveCharge: string;
  threadLimitReached: string;
  /** aria-label for dismissing the thread-limit strip only; composer stays blocked. */
  dismissThreadLimitBannerAria: string;
  sessionNew: string;
  drawerClose: string;
  iChing: string;
  bones: string;
  iChingTagline: string;
  bonesTagline: string;
  emptyInviteMorning: string;
  emptyInviteAfternoon: string;
  emptyInviteNight: string;
  logoutConfirmTitle: string;
  logoutConfirmMessage: string;
  logoutConfirmYes: string;
  logoutConfirmNo: string;
};

const HOME_CHAT_UI: Record<AppLocale, HomeChatUiMessages> = {
  es: {
    language: "Idioma",
    chats: "Chats",
    signIn: "Iniciar sesión",
    signOut: "Cerrar sesión",
    options: "Opciones",
    writeConsultation: "Escribe tu consulta…",
    positiveCharge: "Cargo positivo (afirmación)…",
    threadLimitReached: "Límite de hilo alcanzado. Usa «Nueva sesión» arriba.",
    dismissThreadLimitBannerAria: "Ocultar aviso del límite de hilo",
    sessionNew: "Nueva sesión",
    drawerClose: "Cerrar",
    iChing: "I Ching",
    bones: "Huesos",
    iChingTagline: "Tres monedas · Zhu Xi · Wilhelm (1924)",
    bonesTagline: "Huesos de Oráculo · Grietas 兆 · estilo Shang",
    emptyInviteMorning:
      "Buen momento para escuchar al oráculo. ¿Qué inquietud trae este nuevo día? Escribe tu consulta con intención.",
    emptyInviteAfternoon:
      "El cambio sigue moviéndose. ¿Qué necesitas ver con más claridad en el curso de hoy?",
    emptyInviteNight:
      "La noche también pregunta. ¿Qué frente de tu vida quieres explorar?",
    logoutConfirmTitle: "Cerrar sesión",
    logoutConfirmMessage: "¿Confirmas que quieres cerrar sesión?",
    logoutConfirmYes: "Cerrar sesión",
    logoutConfirmNo: "Cancelar",
  },
  en: {
    language: "Language",
    chats: "Chats",
    signIn: "Sign in",
    signOut: "Sign out",
    options: "Options",
    writeConsultation: "Type your consultation…",
    positiveCharge: "Positive charge (affirmation)…",
    threadLimitReached: 'Thread limit reached. Use "New session" above.',
    dismissThreadLimitBannerAria: "Dismiss thread limit notice",
    sessionNew: "New session",
    drawerClose: "Close",
    iChing: "I Ching",
    bones: "Bones",
    iChingTagline: "Three coins · Zhu Xi · Wilhelm (1924)",
    bonesTagline: "Oracle Bones · Cracks 兆 · Shang style",
    emptyInviteMorning:
      "Good time to consult the oracle. What concern comes with this new day?",
    emptyInviteAfternoon:
      "Change keeps moving. What do you need to see more clearly today?",
    emptyInviteNight:
      "The night also asks. Which part of your life do you want to explore?",
    logoutConfirmTitle: "Sign Out",
    logoutConfirmMessage: "Are you sure you want to sign out?",
    logoutConfirmYes: "Sign Out",
    logoutConfirmNo: "Cancel",
  },
  pt: {
    language: "Idioma",
    chats: "Conversas",
    signIn: "Entrar",
    signOut: "Sair",
    options: "Opções",
    writeConsultation: "Escreva sua consulta…",
    positiveCharge: "Cargo positivo (afirmação)…",
    threadLimitReached: "Limite do fio atingido. Use «Nova sessão» acima.",
    dismissThreadLimitBannerAria: "Ocultar aviso do limite do fio",
    sessionNew: "Nova sessão",
    drawerClose: "Fechar",
    iChing: "I Ching",
    bones: "Ossos",
    iChingTagline: "Três moedas · Zhu Xi · Wilhelm (1924)",
    bonesTagline: "Ossos de Oráculo · Fissuras 兆 · estilo Shang",
    emptyInviteMorning:
      "Bom momento para ouvir o oráculo. Que inquietação traz este novo dia?",
    emptyInviteAfternoon:
      "A mudança continua. O que você precisa ver com mais clareza hoje?",
    emptyInviteNight:
      "A noite também pergunta. Qual frente da sua vida você quer explorar?",
    logoutConfirmTitle: "Sair",
    logoutConfirmMessage: "Tens certeza que queres sair?",
    logoutConfirmYes: "Sair",
    logoutConfirmNo: "Cancelar",
  },
  fr: {
    language: "Langue",
    chats: "Discussions",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    options: "Options",
    writeConsultation: "Écris ta consultation…",
    positiveCharge: "Charge positive (affirmation)…",
    threadLimitReached:
      "Limite du fil atteinte. Utilisez « Nouvelle session ».",
    dismissThreadLimitBannerAria: "Masquer l'avis de limite de fil",
    sessionNew: "Nouvelle session",
    drawerClose: "Fermer",
    iChing: "I Ching",
    bones: "Os",
    iChingTagline: "Trois pièces · Zhu Xi · Wilhelm (1924)",
    bonesTagline: "Os Oracle · Fissures 兆 · style Shang",
    emptyInviteMorning:
      "Bon moment pour écouter l'oracle. Quelle préoccupation t'accompagne aujourd'hui ?",
    emptyInviteAfternoon:
      "Le changement continue. Que dois-tu voir plus clairement aujourd'hui ?",
    emptyInviteNight:
      "La nuit pose aussi des questions. Quelle partie de ta vie veux-tu explorer ?",
    logoutConfirmTitle: "Se déconnecter",
    logoutConfirmMessage: "Veux-tu vraiment te déconnecter ?",
    logoutConfirmYes: "Se déconnecter",
    logoutConfirmNo: "Annuler",
  },
  de: {
    language: "Sprache",
    chats: "Chats",
    signIn: "Anmelden",
    signOut: "Abmelden",
    options: "Optionen",
    writeConsultation: "Schreibe deine Frage…",
    positiveCharge: "Positive Ladung (Bejahung)…",
    threadLimitReached: "Thread-Limit erreicht. Oben «Neue Sitzung» verwenden.",
    dismissThreadLimitBannerAria: "Hinweis zum Thread-Limit ausblenden",
    sessionNew: "Neue Sitzung",
    drawerClose: "Schließen",
    iChing: "I Ching",
    bones: "Knochen",
    iChingTagline: "Drei Münzen · Zhu Xi · Wilhelm (1924)",
    bonesTagline: "Orakelknochen · Risse 兆 · Shang-Stil",
    emptyInviteMorning:
      "Guter Zeitpunkt für das Orakel. Welche Frage bringt dieser Tag mit sich?",
    emptyInviteAfternoon:
      "Der Wandel geht weiter. Was musst du heute klarer sehen?",
    emptyInviteNight:
      "Auch die Nacht fragt. Welchen Bereich deines Lebens möchtest du erkunden?",
    logoutConfirmTitle: "Abmelden",
    logoutConfirmMessage: "Möchtest du dich wirklich abmelden?",
    logoutConfirmYes: "Abmelden",
    logoutConfirmNo: "Abbrechen",
  },
  it: {
    language: "Lingua",
    chats: "Chat",
    signIn: "Accedi",
    signOut: "Esci",
    options: "Opzioni",
    writeConsultation: "Scrivi la tua consultazione…",
    positiveCharge: "Carica positiva (affermazione)…",
    threadLimitReached: "Limite del thread raggiunto. Usa «Nuova sessione».",
    dismissThreadLimitBannerAria: "Nascondi avviso limite thread",
    sessionNew: "Nuova sessione",
    drawerClose: "Chiudi",
    iChing: "I Ching",
    bones: "Ossa",
    iChingTagline: "Tre monete · Zhu Xi · Wilhelm (1924)",
    bonesTagline: "Ossa dell'Oracolo · Crepe 兆 · stile Shang",
    emptyInviteMorning:
      "Momento ideale per l'oracolo. Quale inquietudine porta questo nuovo giorno?",
    emptyInviteAfternoon:
      "Il cambiamento continua. Cosa devi vedere con più chiarezza oggi?",
    emptyInviteNight:
      "Anche la notte fa domande. Quale fronte della tua vita vuoi esplorare?",
    logoutConfirmTitle: "Esci",
    logoutConfirmMessage: "Sei sicuro di voler uscire?",
    logoutConfirmYes: "Esci",
    logoutConfirmNo: "Annulla",
  },
  ja: {
    language: "言語",
    chats: "チャット",
    signIn: "ログイン",
    signOut: "ログアウト",
    options: "オプション",
    writeConsultation: "相談内容を入力…",
    positiveCharge: "肯定の問い（肯定電荷）…",
    threadLimitReached: "スレッド上限です。上の「新しいセッション」を使用。",
    dismissThreadLimitBannerAria: "スレッド上限の通知を閉じる",
    sessionNew: "新しいセッション",
    drawerClose: "閉じる",
    iChing: "I Ching",
    bones: "骨占",
    iChingTagline: "三枚の硬貨 · 朱熹 · ヴィルヘルム（1924）",
    bonesTagline: "甲骨占 · 亀裂 兆 · 殷様式",
    emptyInviteMorning:
      "いまは託宣に向いた時間。今日の不安を問いにしてみましょう。",
    emptyInviteAfternoon:
      "変化は動き続けています。今日、何をより明確に見たいですか。",
    emptyInviteNight: "夜もまた問いを生みます。人生のどの面を探りますか。",
    logoutConfirmTitle: "ログアウト",
    logoutConfirmMessage: "本当にログアウトしますか？",
    logoutConfirmYes: "ログアウト",
    logoutConfirmNo: "キャンセル",
  },
  zh: {
    language: "语言",
    chats: "聊天",
    signIn: "登录",
    signOut: "退出登录",
    options: "选项",
    writeConsultation: "输入你的咨询…",
    positiveCharge: "正向命题（肯定）…",
    threadLimitReached: "线程已达上限，请使用“新会话”。",
    dismissThreadLimitBannerAria: "关闭线程上限提示",
    sessionNew: "新会话",
    drawerClose: "关闭",
    iChing: "I Ching",
    bones: "甲骨",
    iChingTagline: "三枚铜钱 · 朱熹 · Wilhelm (1924)",
    bonesTagline: "甲骨 · 裂纹 兆 · 商式",
    emptyInviteMorning: "此刻适合聆听神谕。今天你带着什么问题而来？",
    emptyInviteAfternoon: "变化仍在流动。今天你需要看清什么？",
    emptyInviteNight: "夜晚也会发问。你想探索人生的哪一面？",
    logoutConfirmTitle: "退出登录",
    logoutConfirmMessage: "确定要退出登录吗？",
    logoutConfirmYes: "退出登录",
    logoutConfirmNo: "取消",
  },
  ko: {
    language: "언어",
    chats: "채팅",
    signIn: "로그인",
    signOut: "로그아웃",
    options: "옵션",
    writeConsultation: "질문을 입력하세요…",
    positiveCharge: "긍정 명제(affirmation)…",
    threadLimitReached: "스레드 한도 도달. 위의 «새 세션» 사용.",
    dismissThreadLimitBannerAria: "스레드 한도 알림 숨기기",
    sessionNew: "새 세션",
    drawerClose: "닫기",
    iChing: "I Ching",
    bones: "골복",
    iChingTagline: "세 동전 · 주희 · Wilhelm (1924)",
    bonesTagline: "골복 · 균열 兆 · 상나라 방식",
    emptyInviteMorning:
      "지금은 오라클에 귀 기울이기 좋은 시간입니다. 어떤 고민이 있나요?",
    emptyInviteAfternoon:
      "변화는 계속 움직입니다. 오늘 무엇을 더 분명히 보고 싶나요?",
    emptyInviteNight: "밤도 질문합니다. 삶의 어떤 영역을 탐색하고 싶나요?",
    logoutConfirmTitle: "로그아웃",
    logoutConfirmMessage: "정말 로그아웃하시겠습니까?",
    logoutConfirmYes: "로그아웃",
    logoutConfirmNo: "취소",
  },
  ar: {
    language: "اللغة",
    chats: "المحادثات",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    options: "خيارات",
    writeConsultation: "اكتب استشارتك…",
    positiveCharge: "الشحنة الإيجابية (تأكيد)…",
    threadLimitReached: "تم بلوغ حد الخيط. استخدم «جلسة جديدة» أعلاه.",
    dismissThreadLimitBannerAria: "إخفاء إشعار حد الخيط",
    sessionNew: "جلسة جديدة",
    drawerClose: "إغلاق",
    iChing: "I Ching",
    bones: "عظام الكهانة",
    iChingTagline: "ثلاث عملات · تشو شي · فيلهلم (1924)",
    bonesTagline: "عظام الكهانة · الشقوق 兆 · أسلوب شانغ",
    emptyInviteMorning:
      "وقت مناسب للتشاور مع الأوراكل. ما القلق الذي يحمله هذا اليوم الجديد؟ اكتب استشارتك بنية صادقة.",
    emptyInviteAfternoon:
      "التغيير لا يتوقف. ما الذي تحتاج إلى رؤيته بوضوح أكبر اليوم؟",
    emptyInviteNight: "الليل أيضاً يسأل. أي جانب من حياتك تريد استكشافه؟",
    logoutConfirmTitle: "تسجيل الخروج",
    logoutConfirmMessage: "هل تريد تسجيل الخروج؟",
    logoutConfirmYes: "تسجيل الخروج",
    logoutConfirmNo: "إلغاء",
  },
  hi: {
    language: "भाषा",
    chats: "चैट",
    signIn: "साइन इन",
    signOut: "साइन आउट",
    options: "विकल्प",
    writeConsultation: "अपनी सलाह लिखें…",
    positiveCharge: "सकारात्मक प्रस्ताव (पुष्टि)…",
    threadLimitReached: "थ्रेड सीमा पूरी। ऊपर «नई सत्र» का उपयोग करें।",
    dismissThreadLimitBannerAria: "थ्रेड सीमा सूचना छिपाएँ",
    sessionNew: "नई सत्र",
    drawerClose: "बंद करें",
    iChing: "I Ching",
    bones: "अस्थि ओरेकल",
    iChingTagline: "तीन सिक्के · झू शी · विल्हेल्म (1924)",
    bonesTagline: "अस्थि ओरेकल · दरारें 兆 · शांग शैली",
    emptyInviteMorning:
      "ओरेकल से पूछने का अच्छा समय है। आज की आपकी मुख्य चिंता क्या है?",
    emptyInviteAfternoon:
      "परिवर्तन चलता रहता है। आज आपको किस बात को और स्पष्ट देखना है?",
    emptyInviteNight:
      "रात भी प्रश्न पूछती है। जीवन के किस हिस्से को आप समझना चाहते हैं?",
    logoutConfirmTitle: "साइन आउट",
    logoutConfirmMessage: "क्या आप वाकई साइन आउट करना चाहते हैं?",
    logoutConfirmYes: "साइन आउट",
    logoutConfirmNo: "रद्द करें",
  },
};

export function getHomeChatUiMessages(locale: AppLocale): HomeChatUiMessages {
  return HOME_CHAT_UI[locale] ?? HOME_CHAT_UI[DEFAULT_LOCALE];
}
