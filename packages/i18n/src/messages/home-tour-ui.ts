import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type HomeTourUiMessages = {
  step1Title: string; step1Body: string;
  step2Title: string; step2Body: string;
  step3Title: string; step3Body: string;
  step4Title: string; step4Body: string;
  step5Title: string; step5Body: string;
  step6Title: string; step6Body: string;
  lineReadingTitle: string; lineReadingBody: string;
  methodTitle: string; methodBody: string;
  step7Title: string; step7Body: string;
  step8Title: string; step8Body: string;
  step9Title: string; step9Body: string;
  back: string; next: string; skip: string; finish: string;
  replayLabel: string; tutorialLabel: string;
};

const HOME_TOUR_UI: Record<AppLocale, HomeTourUiMessages> = {
  es: {
    step1Title: "Historial de Chats", step1Body: "Accede a tus consultas anteriores y estadísticas de actividad.",
    step2Title: "Nueva Sesión", step2Body: "Inicia un hilo de consulta nuevo. Cada sesión queda guardada en tu historial.",
    step3Title: "Opciones de Consulta", step3Body: "Configura tu consulta: modo de oráculo, traductor y método de lanzamiento.",
    step4Title: "Modo de Oráculo", step4Body: "Elige el I Ching (monedas, tradición Zhu Xi) o los Huesos de Oráculo (estilo Shang, el método de adivinación más antiguo de China).",
    step5Title: "Traductor", step5Body: "Fuente de interpretación: Wilhelm (clásico), Legge, Zhou Yi o Master Combined. Los niveles superiores desbloquean más opciones.",
    step6Title: "Ejecución", step6Body: "Automático: la IA lanza las monedas. Manual: tú las lanzas físicamente y registras el resultado.",
    lineReadingTitle: "Lectura de líneas cambiantes", lineReadingBody: "Elige entre Alfred Huang (por defecto) o Zhu Xi (clásico) para interpretar las líneas en movimiento. Tu elección se recuerda.",
    methodTitle: "Método", methodBody: "Tres Monedas: el método más común y rápido. Varillas (Yarrow): distribución Zhou auténtica, con yang móvil más frecuente.",
    step7Title: "Biblioteca de Hexagramas", step7Body: "Consulta los 64 hexagramas con interpretación completa. Disponible desde el nivel Seeker.",
    step8Title: "Documentación y FAQs", step8Body: "Guía completa, preguntas frecuentes, notas del método y más. Todo desde el panel de opciones.",
    step9Title: "Tu Consulta", step9Body: "Escribe tu pregunta y pulsa ➤ para recibir la interpretación del oráculo.",
    back: "Atrás", next: "Siguiente", skip: "Saltar", finish: "¡Listo!", replayLabel: "Ver tutorial", tutorialLabel: "Tutorial",
  },
  en: {
    step1Title: "Chat History", step1Body: "Access your previous consultations and activity statistics.",
    step2Title: "New Session", step2Body: "Start a new consultation thread. Each session is saved in your history.",
    step3Title: "Consultation Options", step3Body: "Configure your consultation: oracle mode, translator, and casting method.",
    step4Title: "Oracle Mode", step4Body: "Choose I Ching (coins, Zhu Xi tradition) or Oracle Bones (Shang style, the oldest Chinese divination method).",
    step5Title: "Translator", step5Body: "Interpretation source: Wilhelm (classic), Legge, Zhou Yi, or Master Combined. Higher tiers unlock more options.",
    step6Title: "Execution", step6Body: "Automatic: the AI casts the coins. Manual: you cast them physically and record the result.",
    lineReadingTitle: "Changing-line reading", lineReadingBody: "Choose between Alfred Huang (default) or Zhu Xi (classical) for interpreting the changing lines. Your choice is remembered.",
    methodTitle: "Method", methodBody: "Three Coins: the most common and fastest method. Yarrow Stalks: authentic Zhou distribution, with moving yang more frequent.",
    step7Title: "Hexagram Library", step7Body: "Browse all 64 hexagrams with full interpretation. Available from the Seeker tier.",
    step8Title: "Documentation & FAQs", step8Body: "Full user guide, frequently asked questions, method notes and more. All from the options panel.",
    step9Title: "Your Consultation", step9Body: "Type your question and press ➤ to receive the oracle's interpretation.",
    back: "Back", next: "Next", skip: "Skip", finish: "Done!", replayLabel: "View tutorial", tutorialLabel: "Tutorial",
  },
  pt: {
    step1Title: "Histórico de Chats", step1Body: "Acesse suas consultas anteriores e estatísticas de atividade.",
    step2Title: "Nova Sessão", step2Body: "Inicie um novo tópico de consulta. Cada sessão fica salva no seu histórico.",
    step3Title: "Opções de Consulta", step3Body: "Configure sua consulta: modo de oráculo, tradutor e método de lançamento.",
    step4Title: "Modo de Oráculo", step4Body: "Escolha o I Ching (moedas, tradição Zhu Xi) ou os Ossos de Oráculo (estilo Shang, o método de adivinhação mais antigo da China).",
    step5Title: "Tradutor", step5Body: "Fonte de interpretação: Wilhelm (clássico), Legge, Zhou Yi ou Master Combined. Níveis superiores desbloqueiam mais opções.",
    step6Title: "Execução", step6Body: "Automático: a IA lança as moedas. Manual: você as lança fisicamente e registra o resultado.",
    lineReadingTitle: "Leitura de linhas mutantes", lineReadingBody: "Escolha entre Alfred Huang (padrão) ou Zhu Xi (clássico) para interpretar as linhas em movimento. Sua escolha é lembrada.",
    methodTitle: "Método", methodBody: "Três Moedas: o método mais comum e rápido. Varetas (Yarrow): distribuição Zhou autêntica, com yang móvel mais frequente.",
    step7Title: "Biblioteca de Hexagramas", step7Body: "Consulte os 64 hexagramas com interpretação completa. Disponível a partir do nível Seeker.",
    step8Title: "Documentação e FAQs", step8Body: "Guia completo, perguntas frequentes, notas do método e mais. Tudo no painel de opções.",
    step9Title: "Sua Consulta", step9Body: "Escreva sua pergunta e pressione ➤ para receber a interpretação do oráculo.",
    back: "Voltar", next: "Próximo", skip: "Pular", finish: "Pronto!", replayLabel: "Ver tutorial", tutorialLabel: "Tutorial",
  },
  fr: {
    step1Title: "Historique des Chats", step1Body: "Accédez à vos consultations précédentes et à vos statistiques d'activité.",
    step2Title: "Nouvelle Session", step2Body: "Démarrez un nouveau fil de consultation. Chaque session est sauvegardée dans votre historique.",
    step3Title: "Options de Consultation", step3Body: "Configurez votre consultation : mode oracle, traducteur et méthode de tirage.",
    step4Title: "Mode Oracle", step4Body: "Choisissez le I Ching (pièces, tradition Zhu Xi) ou les Os Oraculaires (style Shang, la méthode divinatoire la plus ancienne de Chine).",
    step5Title: "Traducteur", step5Body: "Source d'interprétation : Wilhelm (classique), Legge, Zhou Yi ou Master Combined. Les niveaux supérieurs débloquent plus d'options.",
    step6Title: "Exécution", step6Body: "Automatique : l'IA lance les pièces. Manuel : vous les lancez physiquement et enregistrez le résultat.",
    lineReadingTitle: "Lecture des lignes mobiles", lineReadingBody: "Choisissez entre Alfred Huang (par défaut) ou Zhu Xi (classique) pour interpréter les traits mobiles. Votre choix est mémorisé.",
    methodTitle: "Méthode", methodBody: "Trois Pièces : la méthode la plus courante et rapide. Tiges d'achillée (Yarrow) : distribution Zhou authentique, avec yang mobile plus fréquent.",
    step7Title: "Bibliothèque des Hexagrammes", step7Body: "Consultez les 64 hexagrammes avec une interprétation complète. Disponible à partir du niveau Seeker.",
    step8Title: "Documentation & FAQ", step8Body: "Guide complet, questions fréquentes, notes de méthode et plus. Tout depuis le panneau des options.",
    step9Title: "Votre Consultation", step9Body: "Tapez votre question et appuyez sur ➤ pour recevoir l'interprétation de l'oracle.",
    back: "Retour", next: "Suivant", skip: "Passer", finish: "Terminé !", replayLabel: "Voir le tutoriel", tutorialLabel: "Tutoriel",
  },
  de: {
    step1Title: "Chat-Verlauf", step1Body: "Greife auf deine früheren Beratungen und Aktivitätsstatistiken zu.",
    step2Title: "Neue Sitzung", step2Body: "Starte einen neuen Beratungsthread. Jede Sitzung wird in deinem Verlauf gespeichert.",
    step3Title: "Beratungsoptionen", step3Body: "Konfiguriere deine Beratung: Orakel-Modus, Übersetzer und Wurf-Methode.",
    step4Title: "Orakel-Modus", step4Body: "Wähle zwischen I Ching (Münzen, Zhu Xi-Tradition) oder Orakelknochen (Shang-Stil, die älteste chinesische Wahrsagemethode).",
    step5Title: "Übersetzer", step5Body: "Interpretationsquelle: Wilhelm (klassisch), Legge, Zhou Yi oder Master Combined. Höhere Stufen schalten mehr Optionen frei.",
    step6Title: "Ausführung", step6Body: "Automatisch: Die KI wirft die Münzen. Manuell: Du wirfst sie physisch und trägst das Ergebnis ein.",
    lineReadingTitle: "Lesung wandelnder Linien", lineReadingBody: "Wähle zwischen Alfred Huang (Standard) oder Zhu Xi (klassisch) zur Deutung der bewegten Linien. Deine Wahl wird gespeichert.",
    methodTitle: "Methode", methodBody: "Drei Münzen: die gängigste und schnellste Methode. Schafgarbenstangen (Yarrow): authentische Zhou-Verteilung, mit häufigerem bewegtem Yang.",
    step7Title: "Hexagramm-Bibliothek", step7Body: "Durchsuche alle 64 Hexagramme mit vollständiger Interpretation. Ab der Seeker-Stufe verfügbar.",
    step8Title: "Dokumentation & FAQs", step8Body: "Vollständige Anleitung, häufige Fragen, Methodennotizen und mehr. Alles im Optionsbereich.",
    step9Title: "Deine Beratung", step9Body: "Schreibe deine Frage und drücke ➤, um die Interpretation des Orakels zu erhalten.",
    back: "Zurück", next: "Weiter", skip: "Überspringen", finish: "Fertig!", replayLabel: "Tutorial anzeigen", tutorialLabel: "Tutorial",
  },
  it: {
    step1Title: "Storico Chat", step1Body: "Accedi alle tue consultazioni precedenti e alle statistiche di attività.",
    step2Title: "Nuova Sessione", step2Body: "Avvia un nuovo thread di consultazione. Ogni sessione viene salvata nella tua cronologia.",
    step3Title: "Opzioni di Consultazione", step3Body: "Configura la tua consultazione: modalità oracolo, traduttore e metodo di lancio.",
    step4Title: "Modalità Oracolo", step4Body: "Scegli l'I Ching (monete, tradizione Zhu Xi) o le Ossa Oracolari (stile Shang, il metodo divinatorio più antico della Cina).",
    step5Title: "Traduttore", step5Body: "Fonte di interpretazione: Wilhelm (classico), Legge, Zhou Yi o Master Combined. I livelli superiori sbloccano più opzioni.",
    step6Title: "Esecuzione", step6Body: "Automatico: l'IA lancia le monete. Manuale: le lanci fisicamente e registri il risultato.",
    lineReadingTitle: "Lettura delle linee mutanti", lineReadingBody: "Scegli tra Alfred Huang (predefinito) o Zhu Xi (classico) per interpretare le linee mobili. La tua scelta viene memorizzata.",
    methodTitle: "Metodo", methodBody: "Tre Monete: il metodo più comune e veloce. Steli di achillea (Yarrow): distribuzione Zhou autentica, con yang mobile più frequente.",
    step7Title: "Biblioteca degli Esagrammi", step7Body: "Consulta tutti i 64 esagrammi con interpretazione completa. Disponibile dal livello Seeker.",
    step8Title: "Documentazione e FAQ", step8Body: "Guida completa, domande frequenti, note sul metodo e altro. Tutto nel pannello opzioni.",
    step9Title: "La Tua Consultazione", step9Body: "Scrivi la tua domanda e premi ➤ per ricevere l'interpretazione dell'oracolo.",
    back: "Indietro", next: "Avanti", skip: "Salta", finish: "Fatto!", replayLabel: "Vedi tutorial", tutorialLabel: "Tutorial",
  },
  ja: {
    step1Title: "チャット履歴", step1Body: "過去の相談とアクティビティ統計にアクセスできます。",
    step2Title: "新しいセッション", step2Body: "新しい相談スレッドを開始します。各セッションは履歴に保存されます。",
    step3Title: "相談オプション", step3Body: "相談の設定：占いモード、翻訳者、投げ方を選択してください。",
    step4Title: "占いモード", step4Body: "易経（コイン、朱熹伝統）か神託骨（殷商スタイル、中国最古の占い方法）を選択してください。",
    step5Title: "翻訳者", step5Body: "解釈の出典：Wilhelm（古典）、Legge、Zhou Yi、またはMaster Combined。上位ティアでより多くの選択肢が解放されます。",
    step6Title: "実行", step6Body: "自動：AIがコインを投げます。手動：物理的に投げて結果を記録します。",
    lineReadingTitle: "変爻の読み方", lineReadingBody: "変爻の読み方をAlfred Huang（既定）か朱熹（古典）から選べます。選択は記憶されます。",
    methodTitle: "方法", methodBody: "三枚のコイン：最も一般的で速い方法。筮竹（Yarrow）：本格的な周代の確率分布で、陽の変爻がより多く出ます。",
    step7Title: "六十四卦ライブラリ", step7Body: "全64卦の完全な解釈を閲覧できます。Seekerティア以上で利用可能。",
    step8Title: "ドキュメント & FAQ", step8Body: "完全なユーザーガイド、よくある質問、メソッドノートなどをオプションパネルから確認できます。",
    step9Title: "あなたの相談", step9Body: "質問を入力して➤を押すと、神託の解釈が届きます。",
    back: "戻る", next: "次へ", skip: "スキップ", finish: "完了！", replayLabel: "チュートリアルを見る", tutorialLabel: "チュートリアル",
  },
  zh: {
    step1Title: "聊天记录", step1Body: "访问您的历史咨询和活动统计。",
    step2Title: "新建会话", step2Body: "开始新的咨询线程。每个会话都会保存在您的历史记录中。",
    step3Title: "咨询选项", step3Body: "配置您的咨询：神谕模式、译者和占卜方式。",
    step4Title: "神谕模式", step4Body: "选择易经（铜钱，朱熹传统）或甲骨神谕（商朝风格，中国最古老的占卜方式）。",
    step5Title: "译者", step5Body: "解读来源：Wilhelm（经典）、Legge、周易或Master Combined。更高等级可解锁更多选项。",
    step6Title: "执行", step6Body: "自动：AI抛铜钱。手动：您亲手抛铜钱并记录结果。",
    lineReadingTitle: "变爻解读法", lineReadingBody: "选择用 Alfred Huang（默认）还是朱熹（古典）来解读变爻。你的选择会被记住。",
    methodTitle: "方法", methodBody: "三枚铜钱：最常见、最快捷的方式。蓍草（Yarrow）：正宗的周代概率分布，动爻为阳的概率更高。",
    step7Title: "六十四卦典库", step7Body: "浏览全部64卦的完整解读。从Seeker等级起可用。",
    step8Title: "文档与常见问题", step8Body: "完整的用户指南、常见问题、方法说明等。均可从选项面板中访问。",
    step9Title: "您的咨询", step9Body: "输入您的问题，按➤接收神谕解读。",
    back: "上一步", next: "下一步", skip: "跳过", finish: "完成！", replayLabel: "查看教程", tutorialLabel: "教程",
  },
  ko: {
    step1Title: "채팅 기록", step1Body: "이전 상담 내역과 활동 통계에 접근하세요.",
    step2Title: "새 세션", step2Body: "새 상담 스레드를 시작하세요. 각 세션은 기록에 저장됩니다.",
    step3Title: "상담 옵션", step3Body: "상담 설정: 신탁 모드, 번역자, 주조 방법을 선택하세요.",
    step4Title: "신탁 모드", step4Body: "주역(동전, 주희 전통) 또는 신탁 뼈(상나라 양식, 중국에서 가장 오래된 점술 방법) 중 선택하세요.",
    step5Title: "번역자", step5Body: "해석 출처: Wilhelm(고전), Legge, Zhou Yi 또는 Master Combined. 상위 등급에서 더 많은 옵션이 해제됩니다.",
    step6Title: "실행", step6Body: "자동: AI가 동전을 던집니다. 수동: 직접 던지고 결과를 기록합니다.",
    lineReadingTitle: "변효 해석 방식", lineReadingBody: "동효를 해석할 때 Alfred Huang(기본값) 또는 주희(고전) 중에서 선택하세요. 선택한 설정은 저장됩니다.",
    methodTitle: "방법", methodBody: "세 개의 동전: 가장 일반적이고 빠른 방법. 시초(Yarrow): 정통 주나라 분포로, 움직이는 양이 더 자주 나옵니다.",
    step7Title: "육십사괘 도서관", step7Body: "64개 모든 괘의 완전한 해석을 탐색하세요. Seeker 등급부터 이용 가능합니다.",
    step8Title: "문서 및 FAQ", step8Body: "전체 사용자 가이드, 자주 묻는 질문, 방법 노트 등을 옵션 패널에서 찾을 수 있습니다.",
    step9Title: "나의 상담", step9Body: "질문을 입력하고 ➤를 눌러 신탁의 해석을 받으세요.",
    back: "이전", next: "다음", skip: "건너뛰기", finish: "완료!", replayLabel: "튜토리얼 보기", tutorialLabel: "튜토리얼",
  },
  ar: {
    step1Title: "سجل المحادثات", step1Body: "الوصول إلى استشاراتك السابقة وإحصاءات النشاط.",
    step2Title: "جلسة جديدة", step2Body: "ابدأ موضوع استشارة جديدًا. يتم حفظ كل جلسة في سجلك.",
    step3Title: "خيارات الاستشارة", step3Body: "اضبط استشارتك: وضع الأوراكل والمترجم وطريقة الرمي.",
    step4Title: "وضع الأوراكل", step4Body: "اختر بين آي تشينغ (العملات، تقليد Zhu Xi) أو عظام الأوراكل (أسلوب شانغ، أقدم طريقة عرافة صينية).",
    step5Title: "المترجم", step5Body: "مصدر التفسير: Wilhelm (الكلاسيكي) أو Legge أو Zhou Yi أو Master Combined. تفتح المستويات الأعلى المزيد من الخيارات.",
    step6Title: "تنفيذ", step6Body: "تلقائي: الذكاء الاصطناعي يرمي العملات. يدوي: ترميها بنفسك وتسجّل النتيجة.",
    lineReadingTitle: "قراءة الخطوط المتغيرة", lineReadingBody: "اختر بين Alfred Huang (الافتراضي) أو Zhu Xi (الكلاسيكي) لتفسير الخطوط المتغيرة. يُحفظ اختيارك.",
    methodTitle: "طريقة", methodBody: "ثلاث عملات: الطريقة الأكثر شيوعًا وسرعة. أعواد اليارو (Yarrow): توزيع تشو الأصيل، مع ظهور أكثر تكرارًا لليانغ المتحرك.",
    step7Title: "مكتبة الهكساغرامات", step7Body: "تصفح جميع الـ 64 هكساغراماً مع تفسير كامل. متاح من مستوى Seeker.",
    step8Title: "التوثيق والأسئلة الشائعة", step8Body: "الدليل الكامل والأسئلة الشائعة وملاحظات المنهجية والمزيد. كل ذلك من لوحة الخيارات.",
    step9Title: "استشارتك", step9Body: "اكتب سؤالك واضغط ➤ لتلقّي تفسير الأوراكل.",
    back: "رجوع", next: "التالي", skip: "تخطي", finish: "تم!", replayLabel: "مشاهدة الدرس", tutorialLabel: "درس",
  },
  hi: {
    step1Title: "चैट इतिहास", step1Body: "अपनी पिछली परामर्श और गतिविधि आँकड़े देखें।",
    step2Title: "नया सत्र", step2Body: "एक नया परामर्श थ्रेड शुरू करें। हर सत्र आपके इतिहास में सहेजा जाता है।",
    step3Title: "परामर्श विकल्प", step3Body: "अपनी परामर्श सेट करें: ओरेकल मोड, अनुवादक और डाल पद्धति।",
    step4Title: "ओरेकल मोड", step4Body: "आई चिंग (सिक्के, Zhu Xi परंपरा) या ओरेकल हड्डियाँ (शांग शैली, चीन की सबसे पुरानी भविष्यवाणी विधि) में से चुनें।",
    step5Title: "अनुवादक", step5Body: "व्याख्या स्रोत: Wilhelm (क्लासिक), Legge, Zhou Yi, या Master Combined। उच्च स्तर अधिक विकल्प अनलॉक करते हैं।",
    step6Title: "निष्पादन", step6Body: "स्वचालित: AI सिक्के फेंकता है। मैनुअल: आप भौतिक रूप से फेंकते हैं और परिणाम दर्ज करते हैं।",
    lineReadingTitle: "परिवर्तनशील रेखाओं का पठन", lineReadingBody: "बदलती रेखाओं की व्याख्या के लिए Alfred Huang (डिफ़ॉल्ट) या Zhu Xi (शास्त्रीय) में से चुनें। आपकी पसंद याद रखी जाती है।",
    methodTitle: "विधि", methodBody: "तीन सिक्के: सबसे आम और तेज़ विधि। येरो छड़ें (Yarrow): प्रामाणिक झोऊ वितरण, जिसमें गतिशील यांग अधिक बार आता है।",
    step7Title: "हेक्साग्राम पुस्तकालय", step7Body: "पूर्ण व्याख्या सहित सभी 64 हेक्साग्राम देखें। Seeker स्तर से उपलब्ध।",
    step8Title: "दस्तावेज़ और FAQs", step8Body: "पूर्ण उपयोगकर्ता मार्गदर्शिका, अक्सर पूछे जाने वाले प्रश्न, विधि नोट्स और अधिक। विकल्प पैनल से उपलब्ध।",
    step9Title: "आपकी परामर्श", step9Body: "अपना प्रश्न लिखें और ओरेकल की व्याख्या पाने के लिए ➤ दबाएँ।",
    back: "वापस", next: "अगला", skip: "छोड़ें", finish: "हो गया!", replayLabel: "ट्यूटोरियल देखें", tutorialLabel: "ट्यूटोरियल",
  },
};

export function getHomeTourUiMessages(locale: AppLocale): HomeTourUiMessages {
  return HOME_TOUR_UI[locale] ?? HOME_TOUR_UI[DEFAULT_LOCALE];
}
