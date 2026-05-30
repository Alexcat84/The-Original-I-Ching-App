import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type HomeDrawerUiMessages = {
  activity: string;
  streak: string;
  consultationsToday: string;
  chatsWithMessages: string;
  loadingChats: string;
  loadingConversation: string;
  onlyThreads: string;
  noSaved: string;
  messages: string;
  deleteConversation: string;
  deletingConversation: string;
};

const HOME_DRAWER_UI: Record<AppLocale, HomeDrawerUiMessages> = {
  es: {
    activity: "Tu actividad",
    streak: "Racha (días)",
    consultationsToday: "Consultas hoy",
    chatsWithMessages: "Chats con mensajes",
    loadingChats: "Cargando chats…",
    loadingConversation: "Cargando conversación…",
    onlyThreads: "Solo se listan hilos con al menos una lectura.",
    noSaved:
      "Aún no hay conversaciones guardadas. Envía una consulta para verla aquí.",
    messages: "mensajes",
    deleteConversation: "Eliminar conversación",
    deletingConversation: "Eliminando conversación…",
  },
  en: {
    activity: "Your activity",
    streak: "Streak (days)",
    consultationsToday: "Consultations today",
    chatsWithMessages: "Chats with messages",
    loadingChats: "Loading chats…",
    loadingConversation: "Loading conversation…",
    onlyThreads: "Only threads with at least one reading are listed.",
    noSaved: "No saved conversations yet. Send a consultation to see it here.",
    messages: "messages",
    deleteConversation: "Delete conversation",
    deletingConversation: "Deleting conversation…",
  },
  pt: {
    activity: "Sua atividade",
    streak: "Sequência (dias)",
    consultationsToday: "Consultas hoje",
    chatsWithMessages: "Chats com mensagens",
    loadingChats: "Carregando chats…",
    loadingConversation: "Carregando conversa…",
    onlyThreads: "Somente fios com ao menos uma leitura são listados.",
    noSaved:
      "Ainda não há conversas salvas. Envie uma consulta para vê-la aqui.",
    messages: "mensagens",
    deleteConversation: "Excluir conversa",
    deletingConversation: "Excluindo conversa…",
  },
  fr: {
    activity: "Votre activité",
    streak: "Série (jours)",
    consultationsToday: "Consultations aujourd'hui",
    chatsWithMessages: "Chats avec messages",
    loadingChats: "Chargement des chats…",
    loadingConversation: "Chargement de la conversation…",
    onlyThreads: "Seuls les fils avec au moins une lecture sont listés.",
    noSaved: "Aucune conversation enregistrée pour le moment.",
    messages: "messages",
    deleteConversation: "Supprimer la conversation",
    deletingConversation: "Suppression de la conversation…",
  },
  de: {
    activity: "Deine Aktivität",
    streak: "Serie (Tage)",
    consultationsToday: "Heutige Konsultationen",
    chatsWithMessages: "Chats mit Nachrichten",
    loadingChats: "Chats werden geladen…",
    loadingConversation: "Konversation wird geladen…",
    onlyThreads: "Nur Threads mit mindestens einer Lesung werden gelistet.",
    noSaved: "Noch keine gespeicherten Konversationen.",
    messages: "Nachrichten",
    deleteConversation: "Konversation löschen",
    deletingConversation: "Konversation wird gelöscht…",
  },
  it: {
    activity: "La tua attività",
    streak: "Serie (giorni)",
    consultationsToday: "Consultazioni oggi",
    chatsWithMessages: "Chat con messaggi",
    loadingChats: "Caricamento chat…",
    loadingConversation: "Caricamento conversazione…",
    onlyThreads: "Sono elencati solo i thread con almeno una lettura.",
    noSaved: "Nessuna conversazione salvata al momento.",
    messages: "messaggi",
    deleteConversation: "Elimina conversazione",
    deletingConversation: "Eliminazione conversazione…",
  },
  ja: {
    activity: "あなたの履歴",
    streak: "連続日数",
    consultationsToday: "本日の相談",
    chatsWithMessages: "メッセージ付きチャット",
    loadingChats: "チャットを読み込み中…",
    loadingConversation: "会話を読み込み中…",
    onlyThreads: "少なくとも1件の読みがあるスレッドのみ表示されます。",
    noSaved: "保存された会話はまだありません。",
    messages: "件のメッセージ",
    deleteConversation: "会話を削除",
    deletingConversation: "会話を削除中…",
  },
  zh: {
    activity: "你的活动",
    streak: "连续天数",
    consultationsToday: "今日咨询",
    chatsWithMessages: "有消息的聊天",
    loadingChats: "正在加载聊天…",
    loadingConversation: "正在加载会话…",
    onlyThreads: "仅显示至少含1次解读的线程。",
    noSaved: "暂时没有已保存的对话。",
    messages: "条消息",
    deleteConversation: "删除对话",
    deletingConversation: "正在删除对话…",
  },
  ko: {
    activity: "활동 내역",
    streak: "연속 일수",
    consultationsToday: "오늘의 상담",
    chatsWithMessages: "메시지가 있는 채팅",
    loadingChats: "채팅 불러오는 중…",
    loadingConversation: "대화 불러오는 중…",
    onlyThreads: "최소 한 번의 리딩이 있는 스레드만 표시됩니다.",
    noSaved: "저장된 대화가 아직 없습니다.",
    messages: "개의 메시지",
    deleteConversation: "대화 삭제",
    deletingConversation: "대화 삭제 중…",
  },
  ar: {
    activity: "نشاطك",
    streak: "التسلسل (أيام)",
    consultationsToday: "الاستشارات اليوم",
    chatsWithMessages: "المحادثات برسائل",
    loadingChats: "جارٍ تحميل المحادثات…",
    loadingConversation: "جارٍ تحميل المحادثة…",
    onlyThreads: "تُعرض فقط الخيوط ذات قراءة واحدة على الأقل.",
    noSaved: "لا توجد محادثات محفوظة بعد. أرسل استشارة لرؤيتها هنا.",
    messages: "رسائل",
    deleteConversation: "حذف المحادثة",
    deletingConversation: "جارٍ حذف المحادثة…",
  },
  hi: {
    activity: "आपकी गतिविधि",
    streak: "लगातार दिन (स्ट्रीक)",
    consultationsToday: "आज की परामर्श",
    chatsWithMessages: "संदेश वाली चैट",
    loadingChats: "चैट लोड हो रही हैं…",
    loadingConversation: "वार्ता लोड हो रही है…",
    onlyThreads: "केवल वे थ्रेड दिखाए जाते हैं जिनमें कम से कम एक रीडिंग हो।",
    noSaved:
      "अभी कोई सहेजी गई बातचीत नहीं है। यहाँ देखने के लिए एक परामर्श भेजें।",
    messages: "संदेश",
    deleteConversation: "बातचीत हटाएँ",
    deletingConversation: "बातचीत हटाई जा रही है…",
  },
};

export function getHomeDrawerUiMessages(locale: AppLocale): HomeDrawerUiMessages {
  return HOME_DRAWER_UI[locale] ?? HOME_DRAWER_UI[DEFAULT_LOCALE];
}
