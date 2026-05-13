import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";
import { interpolate } from "./interpolate.js";

/** Chat/history/session flows on the home page (not the 2FA modal copy). */
export type HomeSessionUiMessages = {
  defaultSessionTitle: string;
  deleteConfirm: string;
  couldNotDeleteConversation: string;
  chatLoadSessionExpired: string;
  chatNoLongerExists: string;
  chatLoadFailedStatus: string;
  chatLoadNetworkError: string;
  historySupabaseMissing: string;
  historySessionExpired: string;
  historyLoadFailedStatus: string;
  historyNetworkError: string;
  idleSignedOut: string;
  missingClientConfig: string;
  missingClientConfigAnd: string;
  consultFailedGeneric: string;
  /** Appended when the server returns no extra message (leading space in ES/EN). */
  consultFailedPersistHint: string;
  requestFailedStatus: string;
  charLimitHint: string;
  /** Generic session-expired-or-invalid message used during consultation flow. */
  sessionExpiredInvalid: string;
  /** Server returned an unexpected/unparseable response body. */
  invalidServerResponse: string;
  /** No active session is open when the user tries to consult. */
  noActiveSession: string;
  /** Translator requires a higher-tier pack — {{pack}} is the pack name. */
  translatorRequiresPack: string;
  /** CTA suffix appended after translatorRequiresPack. */
  translatorRequiresPackCta: string;
  /** User tried to submit without typing a question (I Ching mode). */
  emptyQueryIching: string;
  /** User tried to submit without typing the positive charge (Oracle Bones mode). */
  emptyQueryBones: string;
  /** SSE stream ended before the final payload arrived. */
  streamInterrupted: string;
  /** Server returned a non-OK status with no parseable JSON body — {{status}}. */
  serverErrorStatus: string;
};

const HOME_SESSION_UI: Record<AppLocale, HomeSessionUiMessages> = {
  es: {
    defaultSessionTitle: "Consulta",
    deleteConfirm: "¿Eliminar esta conversación de forma permanente?",
    couldNotDeleteConversation: "No se pudo eliminar la conversación.",
    chatLoadSessionExpired:
      "Tu sesión expiró al cargar este chat. Inicia sesión de nuevo.",
    chatNoLongerExists: "Este chat ya no existe o fue eliminado.",
    chatLoadFailedStatus: "No se pudo cargar este chat ({{status}}).",
    chatLoadNetworkError:
      "Error de red al cargar el chat. Revisa tu conexión e inténtalo de nuevo.",
    historySupabaseMissing:
      "No se puede cargar el historial: falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.",
    historySessionExpired:
      "Tu sesión expiró al cargar el historial. Inicia sesión de nuevo.",
    historyLoadFailedStatus: "No se pudo cargar el historial ({{status}}).",
    historyNetworkError:
      "Error de red al cargar el historial. Revisa tu conexión e inténtalo de nuevo.",
    idleSignedOut:
      "Sesión cerrada por inactividad. Inicia sesión para continuar.",
    missingClientConfig: "Falta configuración del cliente:",
    missingClientConfigAnd: "y",
    consultFailedGeneric: "No se pudo completar la consulta.",
    consultFailedPersistHint:
      " Si persiste, revisa la configuración del servidor.",
    requestFailedStatus: "Solicitud fallida ({{status}})",
    charLimitHint: "Hasta 1500 caracteres.",
    sessionExpiredInvalid: "Sesión caducada o no válida. Vuelve a iniciar sesión.",
    invalidServerResponse: "Respuesta del servidor inválida.",
    noActiveSession: "No hay una conversación activa. Abre o crea una sesión.",
    translatorRequiresPack: "Este traductor requiere el pack {{pack}}.",
    translatorRequiresPackCta: " Visita la sección de Packs para desbloquearlo.",
    emptyQueryIching: "Escribe una consulta antes de enviar.",
    emptyQueryBones: "Escribe el cargo positivo (una afirmación clara) para consultar los huesos.",
    streamInterrupted: "La respuesta se interrumpió antes de completarse. Inténtalo de nuevo.",
    serverErrorStatus: "Error del servidor ({{status}}). Inténtalo de nuevo en unos minutos.",
  },
  en: {
    defaultSessionTitle: "Consultation",
    deleteConfirm: "Delete this conversation permanently?",
    couldNotDeleteConversation: "Could not delete conversation.",
    chatLoadSessionExpired:
      "Your session expired while loading this chat. Please sign in again.",
    chatNoLongerExists: "This chat no longer exists or was deleted.",
    chatLoadFailedStatus: "Could not load this chat ({{status}}).",
    chatLoadNetworkError:
      "Network error while loading chat. Check your connection and try again.",
    historySupabaseMissing:
      "Could not load chat history: SUPABASE_SERVICE_ROLE_KEY is missing on the server.",
    historySessionExpired:
      "Your session expired while loading history. Please sign in again.",
    historyLoadFailedStatus: "Could not load chat history ({{status}}).",
    historyNetworkError:
      "Network error while loading history. Check your connection and try again.",
    idleSignedOut: "Session signed out due to inactivity. Sign in to continue.",
    missingClientConfig: "Missing client configuration:",
    missingClientConfigAnd: "and",
    consultFailedGeneric: "Could not complete the consultation.",
    consultFailedPersistHint:
      " If it keeps happening, check the server configuration.",
    requestFailedStatus: "Request failed ({{status}})",
    charLimitHint: "Up to 1500 characters.",
    sessionExpiredInvalid: "Session expired or invalid. Please sign in again.",
    invalidServerResponse: "Invalid server response.",
    noActiveSession: "No active conversation. Open or create a session.",
    translatorRequiresPack: "This translator requires the {{pack}} pack.",
    translatorRequiresPackCta: " Visit the Packs section to unlock it.",
    emptyQueryIching: "Write a question before submitting.",
    emptyQueryBones: "Write the positive charge (a clear affirmation) to consult the bones.",
    streamInterrupted: "The response was interrupted before completion. Please try again.",
    serverErrorStatus: "Server error ({{status}}). Please try again in a few minutes.",
  },
  pt: {
    defaultSessionTitle: "Consulta",
    deleteConfirm: "Eliminar esta conversa permanentemente?",
    couldNotDeleteConversation: "Não foi possível eliminar a conversa.",
    chatLoadSessionExpired:
      "A tua sessão expirou ao carregar este chat. Inicia sessão novamente.",
    chatNoLongerExists: "Este chat já não existe ou foi eliminado.",
    chatLoadFailedStatus: "Não foi possível carregar este chat ({{status}}).",
    chatLoadNetworkError:
      "Erro de rede ao carregar o chat. Verifica a ligação e tenta novamente.",
    historySupabaseMissing:
      "Não é possível carregar o histórico: falta configurar SUPABASE_SERVICE_ROLE_KEY no servidor.",
    historySessionExpired:
      "A tua sessão expirou ao carregar o histórico. Inicia sessão novamente.",
    historyLoadFailedStatus:
      "Não foi possível carregar o histórico ({{status}}).",
    historyNetworkError:
      "Erro de rede ao carregar o histórico. Verifica a ligação e tenta novamente.",
    idleSignedOut:
      "Sessão terminada por inatividade. Inicia sessão para continuar.",
    missingClientConfig: "Falta configuração do cliente:",
    missingClientConfigAnd: "e",
    consultFailedGeneric: "Não foi possível concluir a consulta.",
    consultFailedPersistHint:
      " Se continuar, verifica a configuração do servidor.",
    requestFailedStatus: "Pedido falhou ({{status}})",
    charLimitHint: "Até 1500 caracteres.",
    sessionExpiredInvalid: "Sessão expirada ou inválida. Inicia sessão novamente.",
    invalidServerResponse: "Resposta do servidor inválida.",
    noActiveSession: "Não há conversa ativa. Abre ou cria uma sessão.",
    translatorRequiresPack: "Este tradutor requer o pack {{pack}}.",
    translatorRequiresPackCta: " Visita a secção de Packs para o desbloquear.",
    emptyQueryIching: "Escreve uma consulta antes de enviar.",
    emptyQueryBones: "Escreve a afirmação positiva para consultar os ossos.",
    streamInterrupted: "A resposta foi interrompida antes de terminar. Tenta novamente.",
    serverErrorStatus: "Erro do servidor ({{status}}). Tenta novamente em alguns minutos.",
  },
  fr: {
    defaultSessionTitle: "Consultation",
    deleteConfirm: "Supprimer définitivement cette conversation ?",
    couldNotDeleteConversation: "Impossible de supprimer la conversation.",
    chatLoadSessionExpired:
      "Votre session a expiré lors du chargement de ce chat. Reconnectez-vous.",
    chatNoLongerExists: "Ce chat n’existe plus ou a été supprimé.",
    chatLoadFailedStatus: "Impossible de charger ce chat ({{status}}).",
    chatLoadNetworkError:
      "Erreur réseau lors du chargement du chat. Vérifiez la connexion.",
    historySupabaseMissing:
      "Impossible de charger l’historique : SUPABASE_SERVICE_ROLE_KEY manque sur le serveur.",
    historySessionExpired:
      "Votre session a expiré lors du chargement de l’historique. Reconnectez-vous.",
    historyLoadFailedStatus: "Impossible de charger l’historique ({{status}}).",
    historyNetworkError:
      "Erreur réseau lors du chargement de l’historique. Vérifiez la connexion.",
    idleSignedOut:
      "Session fermée pour inactivité. Reconnectez-vous pour continuer.",
    missingClientConfig: "Configuration client manquante :",
    missingClientConfigAnd: "et",
    consultFailedGeneric: "Impossible de terminer la consultation.",
    consultFailedPersistHint:
      " Si cela continue, vérifiez la configuration du serveur.",
    requestFailedStatus: "Échec de la requête ({{status}})",
    charLimitHint: "Jusqu'à 1500 caractères.",
    sessionExpiredInvalid: "Session expirée ou invalide. Reconnectez-vous.",
    invalidServerResponse: "Réponse du serveur invalide.",
    noActiveSession: "Pas de conversation active. Ouvrez ou créez une session.",
    translatorRequiresPack: "Ce traducteur nécessite le pack {{pack}}.",
    translatorRequiresPackCta: " Visitez la section Packs pour le débloquer.",
    emptyQueryIching: "Écrivez une question avant d'envoyer.",
    emptyQueryBones: "Écrivez la proposition positive pour consulter les os.",
    streamInterrupted: "La réponse a été interrompue avant d'être complète. Réessayez.",
    serverErrorStatus: "Erreur serveur ({{status}}). Réessayez dans quelques minutes.",
  },
  de: {
    defaultSessionTitle: "Konsultation",
    deleteConfirm: "Diese Konversation dauerhaft löschen?",
    couldNotDeleteConversation: "Konversation konnte nicht gelöscht werden.",
    chatLoadSessionExpired:
      "Deine Sitzung ist beim Laden dieses Chats abgelaufen. Bitte erneut anmelden.",
    chatNoLongerExists: "Dieser Chat existiert nicht mehr oder wurde gelöscht.",
    chatLoadFailedStatus: "Chat konnte nicht geladen werden ({{status}}).",
    chatLoadNetworkError:
      "Netzwerkfehler beim Laden des Chats. Verbindung prüfen und erneut versuchen.",
    historySupabaseMissing:
      "Verlauf kann nicht geladen werden: SUPABASE_SERVICE_ROLE_KEY fehlt auf dem Server.",
    historySessionExpired:
      "Deine Sitzung ist beim Laden des Verlaufs abgelaufen. Bitte erneut anmelden.",
    historyLoadFailedStatus:
      "Verlauf konnte nicht geladen werden ({{status}}).",
    historyNetworkError:
      "Netzwerkfehler beim Laden des Verlaufs. Verbindung prüfen und erneut versuchen.",
    idleSignedOut: "Sitzung wegen Inaktivität beendet. Bitte erneut anmelden.",
    missingClientConfig: "Client-Konfiguration fehlt:",
    missingClientConfigAnd: "und",
    consultFailedGeneric: "Konsultation konnte nicht abgeschlossen werden.",
    consultFailedPersistHint:
      " Wenn es weiterhin passiert, prüfen Sie die Serverkonfiguration.",
    requestFailedStatus: "Anfrage fehlgeschlagen ({{status}})",
    charLimitHint: "Bis zu 1500 Zeichen.",
    sessionExpiredInvalid: "Sitzung abgelaufen oder ungültig. Bitte erneut anmelden.",
    invalidServerResponse: "Ungültige Serverantwort.",
    noActiveSession: "Keine aktive Konversation. Öffne oder erstelle eine Sitzung.",
    translatorRequiresPack: "Dieser Übersetzer erfordert das {{pack}}-Paket.",
    translatorRequiresPackCta: " Besuche den Packs-Bereich zum Freischalten.",
    emptyQueryIching: "Schreibe eine Frage, bevor du sendest.",
    emptyQueryBones: "Schreibe die positive Aussage, um die Knochen zu befragen.",
    streamInterrupted: "Die Antwort wurde vor dem Abschluss unterbrochen. Bitte erneut versuchen.",
    serverErrorStatus: "Serverfehler ({{status}}). Bitte in einigen Minuten erneut versuchen.",
  },
  it: {
    defaultSessionTitle: "Consultazione",
    deleteConfirm: "Eliminare definitivamente questa conversazione?",
    couldNotDeleteConversation: "Impossibile eliminare la conversazione.",
    chatLoadSessionExpired:
      "Sessione scaduta durante il caricamento della chat. Accedi di nuovo.",
    chatNoLongerExists: "Questa chat non esiste più o è stata eliminata.",
    chatLoadFailedStatus: "Impossibile caricare questa chat ({{status}}).",
    chatLoadNetworkError:
      "Errore di rete durante il caricamento della chat. Controlla la connessione.",
    historySupabaseMissing:
      "Impossibile caricare la cronologia: manca SUPABASE_SERVICE_ROLE_KEY sul server.",
    historySessionExpired:
      "Sessione scaduta durante il caricamento della cronologia. Accedi di nuovo.",
    historyLoadFailedStatus: "Impossibile caricare la cronologia ({{status}}).",
    historyNetworkError:
      "Errore di rete durante il caricamento della cronologia. Controlla la connessione.",
    idleSignedOut:
      "Sessione chiusa per inattività. Accedi di nuovo per continuare.",
    missingClientConfig: "Configurazione client mancante:",
    missingClientConfigAnd: "e",
    consultFailedGeneric: "Impossibile completare la consultazione.",
    consultFailedPersistHint:
      " Se continua, controlla la configurazione del server.",
    requestFailedStatus: "Richiesta non riuscita ({{status}})",
    charLimitHint: "Fino a 1500 caratteri.",
    sessionExpiredInvalid: "Sessione scaduta o non valida. Accedi di nuovo.",
    invalidServerResponse: "Risposta del server non valida.",
    noActiveSession: "Nessuna conversazione attiva. Apri o crea una sessione.",
    translatorRequiresPack: "Questo traduttore richiede il pack {{pack}}.",
    translatorRequiresPackCta: " Visita la sezione Packs per sbloccarlo.",
    emptyQueryIching: "Scrivi una domanda prima di inviare.",
    emptyQueryBones: "Scrivi l'affermazione positiva per consultare le ossa.",
    streamInterrupted: "La risposta è stata interrotta prima del completamento. Riprova.",
    serverErrorStatus: "Errore del server ({{status}}). Riprova tra qualche minuto.",
  },
  ja: {
    defaultSessionTitle: "相談",
    deleteConfirm: "この会話を完全に削除しますか？",
    couldNotDeleteConversation: "会話を削除できませんでした。",
    chatLoadSessionExpired:
      "このチャットの読み込み中にセッションの有効期限が切れました。再度サインインしてください。",
    chatNoLongerExists: "このチャットは存在しないか削除されました。",
    chatLoadFailedStatus: "チャットを読み込めませんでした ({{status}})。",
    chatLoadNetworkError:
      "チャット読み込み中にネットワークエラーが発生しました。接続を確認してください。",
    historySupabaseMissing:
      "履歴を読み込めません：サーバーに SUPABASE_SERVICE_ROLE_KEY がありません。",
    historySessionExpired:
      "履歴の読み込み中にセッションの有効期限が切れました。再度サインインしてください。",
    historyLoadFailedStatus: "履歴を読み込めませんでした ({{status}})。",
    historyNetworkError:
      "履歴読み込み中にネットワークエラーが発生しました。接続を確認してください。",
    idleSignedOut:
      "無操作のためサインアウトしました。続行するにはサインインしてください。",
    missingClientConfig: "クライアント設定が不足しています:",
    missingClientConfigAnd: "および",
    consultFailedGeneric: "相談を完了できませんでした。",
    consultFailedPersistHint: " 繰り返す場合はサーバー設定を確認してください。",
    requestFailedStatus: "リクエストに失敗しました ({{status}})",
    charLimitHint: "最大1500文字まで。",
    sessionExpiredInvalid: "セッションが期限切れまたは無効です。再度サインインしてください。",
    invalidServerResponse: "サーバーから無効な応答が返されました。",
    noActiveSession: "アクティブな会話がありません。セッションを開くか作成してください。",
    translatorRequiresPack: "この翻訳者は{{pack}}パックが必要です。",
    translatorRequiresPackCta: " パックセクションでアンロックしてください。",
    emptyQueryIching: "送信前に質問を入力してください。",
    emptyQueryBones: "骨を占うために肯定的な命題を入力してください。",
    streamInterrupted: "完了前に応答が中断されました。もう一度お試しください。",
    serverErrorStatus: "サーバーエラー ({{status}})。しばらくしてからもう一度お試しください。",
  },
  zh: {
    defaultSessionTitle: "咨询",
    deleteConfirm: "要永久删除此对话吗？",
    couldNotDeleteConversation: "无法删除对话。",
    chatLoadSessionExpired: "加载此聊天时会话已过期。请重新登录。",
    chatNoLongerExists: "此聊天已不存在或已被删除。",
    chatLoadFailedStatus: "无法加载此聊天 ({{status}})。",
    chatLoadNetworkError: "加载聊天时出现网络错误。请检查连接后重试。",
    historySupabaseMissing:
      "无法加载历史记录：服务器缺少 SUPABASE_SERVICE_ROLE_KEY。",
    historySessionExpired: "加载历史记录时会话已过期。请重新登录。",
    historyLoadFailedStatus: "无法加载历史记录 ({{status}})。",
    historyNetworkError: "加载历史记录时出现网络错误。请检查连接后重试。",
    idleSignedOut: "因长时间未操作已退出登录。请重新登录以继续。",
    missingClientConfig: "缺少客户端配置：",
    missingClientConfigAnd: "和",
    consultFailedGeneric: "无法完成咨询。",
    consultFailedPersistHint: " 若持续出现，请检查服务器配置。",
    requestFailedStatus: "请求失败 ({{status}})",
    charLimitHint: "最多1500个字符。",
    sessionExpiredInvalid: "会话已过期或无效。请重新登录。",
    invalidServerResponse: "服务器响应无效。",
    noActiveSession: "没有活动的对话。请打开或创建一个会话。",
    translatorRequiresPack: "此翻译需要 {{pack}} 套餐。",
    translatorRequiresPackCta: " 请前往套餐页面解锁。",
    emptyQueryIching: "请在发送前输入问题。",
    emptyQueryBones: "请输入肯定句以占问骨卜。",
    streamInterrupted: "响应在完成前被中断。请重试。",
    serverErrorStatus: "服务器错误 ({{status}})。请稍后重试。",
  },
  ko: {
    defaultSessionTitle: "상담",
    deleteConfirm: "이 대화를 영구적으로 삭제할까요?",
    couldNotDeleteConversation: "대화를 삭제할 수 없습니다.",
    chatLoadSessionExpired:
      "이 채팅을 불러오는 동안 세션이 만료되었습니다. 다시 로그인하세요.",
    chatNoLongerExists: "이 채팅은 없거나 삭제되었습니다.",
    chatLoadFailedStatus: "이 채팅을 불러올 수 없습니다 ({{status}}).",
    chatLoadNetworkError:
      "채팅을 불러오는 중 네트워크 오류가 발생했습니다. 연결을 확인하세요.",
    historySupabaseMissing:
      "기록을 불러올 수 없습니다: 서버에 SUPABASE_SERVICE_ROLE_KEY가 없습니다.",
    historySessionExpired:
      "기록을 불러오는 동안 세션이 만료되었습니다. 다시 로그인하세요.",
    historyLoadFailedStatus: "기록을 불러올 수 없습니다 ({{status}}).",
    historyNetworkError:
      "기록을 불러오는 중 네트워크 오류가 발생했습니다. 연결을 확인하세요.",
    idleSignedOut:
      "장시간 비활동으로 로그아웃되었습니다. 계속하려면 다시 로그인하세요.",
    missingClientConfig: "클라이언트 설정이 없습니다:",
    missingClientConfigAnd: "및",
    consultFailedGeneric: "상담을 완료할 수 없습니다.",
    consultFailedPersistHint: " 계속되면 서버 설정을 확인하세요.",
    requestFailedStatus: "요청 실패 ({{status}})",
    charLimitHint: "최대 1500자까지.",
    sessionExpiredInvalid: "세션이 만료되었거나 유효하지 않습니다. 다시 로그인하세요.",
    invalidServerResponse: "서버 응답이 유효하지 않습니다.",
    noActiveSession: "활성 대화가 없습니다. 세션을 열거나 만드세요.",
    translatorRequiresPack: "이 번역기는 {{pack}} 팩이 필요합니다.",
    translatorRequiresPackCta: " 잠금 해제하려면 팩 섹션을 방문하세요.",
    emptyQueryIching: "제출 전에 질문을 입력하세요.",
    emptyQueryBones: "뼈를 점치려면 긍정적인 명제를 입력하세요.",
    streamInterrupted: "응답이 완료되기 전에 중단되었습니다. 다시 시도하세요.",
    serverErrorStatus: "서버 오류 ({{status}}). 잠시 후 다시 시도하세요.",
  },
  ar: {
    defaultSessionTitle: "استشارة",
    deleteConfirm: "هل تريد حذف هذه المحادثة نهائيًا؟",
    couldNotDeleteConversation: "تعذّر حذف المحادثة.",
    chatLoadSessionExpired:
      "انتهت جلستك أثناء تحميل المحادثة. يرجى تسجيل الدخول مرة أخرى.",
    chatNoLongerExists: "هذه المحادثة لم تعد موجودة أو تم حذفها.",
    chatLoadFailedStatus: "تعذّر تحميل هذه المحادثة ({{status}}).",
    chatLoadNetworkError:
      "خطأ في الشبكة أثناء تحميل المحادثة. تحقق من اتصالك وحاول مجددًا.",
    historySupabaseMissing:
      "تعذّر تحميل السجل: SUPABASE_SERVICE_ROLE_KEY مفقود على الخادم.",
    historySessionExpired:
      "انتهت جلستك أثناء تحميل السجل. يرجى تسجيل الدخول مرة أخرى.",
    historyLoadFailedStatus: "تعذّر تحميل سجل المحادثات ({{status}}).",
    historyNetworkError:
      "خطأ في الشبكة أثناء تحميل السجل. تحقق من اتصالك وحاول مجددًا.",
    idleSignedOut: "تم تسجيل خروجك تلقائيًا بعد 45 دقيقة من الخمول.",
    missingClientConfig:
      "مفاتيح Supabase مفقودة. يرجى التحقق من NEXT_PUBLIC_SUPABASE_URL",
    missingClientConfigAnd: " و NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    consultFailedGeneric: "تعذّر إكمال الاستشارة.",
    consultFailedPersistHint: " قد لا تكون الجلسة محفوظة.",
    requestFailedStatus: "فشل الطلب ({{status}}).",
    charLimitHint: "حتى 1500 حرف.",
    sessionExpiredInvalid: "انتهت الجلسة أو غير صالحة. يرجى تسجيل الدخول مجددًا.",
    invalidServerResponse: "استجابة الخادم غير صالحة.",
    noActiveSession: "لا توجد محادثة نشطة. افتح جلسة أو أنشئ واحدة.",
    translatorRequiresPack: "هذا المترجم يتطلب باقة {{pack}}.",
    translatorRequiresPackCta: " تفضل بزيارة قسم الباقات لفتح الإمكانية.",
    emptyQueryIching: "اكتب سؤالًا قبل الإرسال.",
    emptyQueryBones: "اكتب الادعاء الإيجابي للاستفسار من العظام.",
    streamInterrupted: "انقطع الرد قبل اكتماله. يرجى المحاولة مرة أخرى.",
    serverErrorStatus: "خطأ في الخادم ({{status}}). حاول مرة أخرى بعد دقائق.",
  },
  hi: {
    defaultSessionTitle: "परामर्श",
    deleteConfirm: "क्या आप इस वार्तालाप को स्थायी रूप से हटाना चाहते हैं?",
    couldNotDeleteConversation: "वार्तालाप हटाया नहीं जा सका।",
    chatLoadSessionExpired:
      "चैट लोड करते समय आपका सत्र समाप्त हो गया। कृपया पुनः लॉग इन करें।",
    chatNoLongerExists: "यह चैट अब मौजूद नहीं है या हटा दी गई है।",
    chatLoadFailedStatus: "यह चैट लोड नहीं हो सकी ({{status}})।",
    chatLoadNetworkError:
      "चैट लोड करते समय नेटवर्क त्रुटि। अपना कनेक्शन जाँचें और पुनः प्रयास करें।",
    historySupabaseMissing:
      "चैट इतिहास लोड नहीं हो सका: सर्वर पर SUPABASE_SERVICE_ROLE_KEY अनुपस्थित है।",
    historySessionExpired:
      "इतिहास लोड करते समय आपका सत्र समाप्त हो गया। कृपया पुनः लॉग इन करें।",
    historyLoadFailedStatus: "चैट इतिहास लोड नहीं हो सका ({{status}})।",
    historyNetworkError:
      "इतिहास लोड करते समय नेटवर्क त्रुटि। अपना कनेक्शन जाँचें और पुनः प्रयास करें।",
    idleSignedOut:
      "45 मिनट की निष्क्रियता के बाद आपको स्वचालित रूप से लॉग आउट कर दिया गया।",
    missingClientConfig:
      "Supabase कुंजियाँ अनुपस्थित हैं। NEXT_PUBLIC_SUPABASE_URL जाँचें",
    missingClientConfigAnd: " और NEXT_PUBLIC_SUPABASE_ANON_KEY।",
    consultFailedGeneric: "परामर्श पूरा नहीं हो सका।",
    consultFailedPersistHint: " सत्र सहेजा नहीं गया हो सकता।",
    requestFailedStatus: "अनुरोध विफल ({{status}})।",
    charLimitHint: "1500 वर्णों तक।",
    sessionExpiredInvalid: "सत्र समाप्त या अमान्य है। कृपया पुनः लॉग इन करें।",
    invalidServerResponse: "सर्वर से अमान्य प्रतिक्रिया।",
    noActiveSession: "कोई सक्रिय वार्तालाप नहीं है। कोई सत्र खोलें या बनाएं।",
    translatorRequiresPack: "इस अनुवादक के लिए {{pack}} पैक आवश्यक है।",
    translatorRequiresPackCta: " इसे अनलॉक करने के लिए पैक्स अनुभाग पर जाएं।",
    emptyQueryIching: "भेजने से पहले प्रश्न लिखें।",
    emptyQueryBones: "हड्डियों से परामर्श के लिए सकारात्मक प्रस्ताव लिखें।",
    streamInterrupted: "प्रतिक्रिया पूरी होने से पहले बाधित हुई। कृपया पुनः प्रयास करें।",
    serverErrorStatus: "सर्वर त्रुटि ({{status}})। कुछ मिनटों में पुनः प्रयास करें।",
  },
};

export function getHomeSessionUiMessages(
  locale: AppLocale,
): HomeSessionUiMessages {
  return HOME_SESSION_UI[locale] ?? HOME_SESSION_UI[DEFAULT_LOCALE];
}

export function formatChatLoadFailedStatus(
  m: HomeSessionUiMessages,
  status: number,
): string {
  return interpolate(m.chatLoadFailedStatus, { status });
}

export function formatHistoryLoadFailedStatus(
  m: HomeSessionUiMessages,
  status: number,
): string {
  return interpolate(m.historyLoadFailedStatus, { status });
}

export function formatConsultFailedMessage(
  m: HomeSessionUiMessages,
  serverMessage: string | undefined,
): string {
  const trimmed = typeof serverMessage === "string" ? serverMessage.trim() : "";
  if (trimmed) {
    return `${m.consultFailedGeneric} ${trimmed}`;
  }
  return `${m.consultFailedGeneric}${m.consultFailedPersistHint}`;
}

export function formatTranslatorRequiresPack(
  m: HomeSessionUiMessages,
  packName: string,
): string {
  return `${interpolate(m.translatorRequiresPack, { pack: packName })}${m.translatorRequiresPackCta}`;
}

export function formatServerErrorStatus(
  m: HomeSessionUiMessages,
  status: number,
): string {
  return interpolate(m.serverErrorStatus, { status });
}
