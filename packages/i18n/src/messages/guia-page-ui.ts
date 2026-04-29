import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type GuiaPageUiMessages = {
  title: string;
  leadPart1: string;
  leadPart2: string;
  leadPart3: string;
  bonesLabel: string;
  privacyHeading: string;
  privacyLi1: string;
  privacyLi2: string;
  privacyLi3: string;
  chatsHeading: string;
  chatsLabel: string;
  chatsOpensHistory: string;
  newSessionLabel: string;
  newSessionDesc: string;
  chatsUnlimited: string;
  packChangesLine: string;
  optionsHeading: string;
  optionsIntro: string;
  ichingBullet: string;
  bonesBulletSuffix: string;
  threadDepthBullet: string;
  exportHeading: string;
  exportBody: string;
  legalMetaBeforePrivacy: string;
  legalMetaBetween: string;
  legalMetaAfterTerms: string;
  gettingStartedHeading: string;
};

const GUIA_PAGE_UI: Record<AppLocale, GuiaPageUiMessages> = {
  es: {
    title: "Guía de uso",
    leadPart1: "Esta app te permite consultar en dos estilos: ",
    leadPart2: " y ",
    leadPart3:
      ". Es una herramienta de reflexión y orientación simbólica. No sustituye consejo médico ni financiero ni otro asesoramiento profesional.",
    bonesLabel: "Huesos",
    privacyHeading: "Privacidad",
    privacyLi1:
      "Tus chats e imágenes quedan asociados a tu cuenta y solo son accesibles con tu sesión iniciada.",
    privacyLi2:
      "El servicio no expone tu historial ni tus temas de consulta fuera de tu propio acceso autenticado.",
    privacyLi3:
      "Si quieres conservar un registro en tu dispositivo, bajo tu propia discreción puedes descargar la imagen de una lectura y exportar el hilo actual a PDF desde Opciones; esos archivos se generan localmente y su custodia es tuya.",
    chatsHeading: "Chats y sesiones",
    chatsLabel: "Chats",
    chatsOpensHistory: "abre tu historial.",
    newSessionLabel: "Nueva sesión",
    newSessionDesc: "inicia un chat nuevo para cambiar de tema o empezar desde cero.",
    chatsUnlimited: "No hay un número fijo de chats: puedes crear nuevos chats cuando quieras.",
    packChangesLine:
      "Lo que cambia según tu pack es el saldo de tokens disponible y cuántas consultas encadenadas caben en un mismo hilo (límite por hilo).",
    optionsHeading: "Opciones (barra inferior)",
    optionsIntro:
      "En Opciones eliges el tipo de consulta (I Ching o Huesos), ves la profundidad permitida en el hilo activo, gestionas tokens y 2FA, y al final tienes enlaces a documentación, privacidad y términos.",
    ichingBullet: "lectura por hexagrama y líneas.",
    bonesBulletSuffix: "formato sí/no con lectura simbólica de grietas.",
    threadDepthBullet:
      "Profundidad del hilo: cuántas lecturas encadenadas caben en el mismo chat según tu pack (el plan gratuito no permite seguir preguntando en el mismo hilo tras la primera lectura).",
    exportHeading: "Exportar y guardar",
    exportBody:
      "Desde el panel Opciones puedes, cuando lo decidas, descargar la imagen de la lectura y generar un PDF del chat activo. Es opcional: sirve para guardar una copia en tu propio equipo o dispositivo. El archivo PDF se crea en el navegador; no sustituye el historial en la app ni obliga a conservar copias fuera del servicio.",
    legalMetaBeforePrivacy: "Para los detalles completos, consulta la ",
    legalMetaBetween: " y los ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Primeros pasos",
  },
  en: {
    title: "User guide",
    leadPart1: "This app offers two consultation styles: ",
    leadPart2: " and ",
    leadPart3:
      ". It is a symbolic reflection tool and should not replace medical, financial, or other professional advice.",
    bonesLabel: "Bones",
    privacyHeading: "Privacy",
    privacyLi1: "Your chats and images are tied to your account and are only accessible while you are signed in.",
    privacyLi2:
      "The service does not expose your history or consultation topics outside your own authenticated access.",
    privacyLi3:
      "If you want a record on your device, you may—at your sole discretion—download a reading image and export the current thread to PDF from Options; those files are generated locally on your device and you are responsible for keeping them.",
    chatsHeading: "Chats and sessions",
    chatsLabel: "Chats",
    chatsOpensHistory: "opens your history.",
    newSessionLabel: "New session",
    newSessionDesc: "starts a fresh thread for a new topic.",
    chatsUnlimited: "There is no fixed chat count: create as many threads as you need.",
    packChangesLine:
      "What changes with your pack is your available token balance and how many follow-up consultations fit in one thread (per-thread limit).",
    optionsHeading: "Options (bottom panel)",
    optionsIntro:
      "In Options you pick the consultation type (I Ching or Bones), see allowed depth for the active thread, manage tokens and 2FA, and find links to documentation, privacy, and terms at the bottom.",
    ichingBullet: "hexagram and line-based reading.",
    bonesBulletSuffix: "yes/no format with symbolic crack reading.",
    threadDepthBullet:
      "Thread depth: how many chained readings fit in one chat for your pack (the free plan does not allow follow-up readings in the same thread after the first one).",
    exportHeading: "Export and save",
    exportBody:
      "From the Options panel you may, whenever you choose, download the reading image and generate a PDF of the active chat. This is optional: it is for keeping a copy on your own computer or device. The PDF is built in your browser; it does not replace in-app history and you are not required to keep copies outside the service.",
    legalMetaBeforePrivacy: "For full details, see the ",
    legalMetaBetween: " and ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Getting started",
  },
  pt: {
    title: "Guia de utilização",
    leadPart1: "Esta app permite consultar em dois estilos: ",
    leadPart2: " e ",
    leadPart3:
      ". É uma ferramenta de reflexão e orientação simbólica. Não substitui aconselhamento médico ou financeiro nem outro aconselhamento profissional.",
    bonesLabel: "Ossos",
    privacyHeading: "Privacidade",
    privacyLi1:
      "Os teus chats e imagens ficam associados à tua conta e só são acessíveis com sessão iniciada.",
    privacyLi2:
      "O serviço não expõe o teu histórico nem os teus temas de consulta fora do teu acesso autenticado.",
    privacyLi3:
      "Se quiseres um registo no teu dispositivo, à tua discrição podes descarregar a imagem de uma leitura e exportar o fio atual para PDF em Opções; esses ficheiros são gerados localmente e a sua custódia é tua.",
    chatsHeading: "Chats e sessões",
    chatsLabel: "Chats",
    chatsOpensHistory: "abre o teu histórico.",
    newSessionLabel: "Nova sessão",
    newSessionDesc: "inicia um chat novo para mudar de tema ou começar de novo.",
    chatsUnlimited: "Não há um número fixo de chats: podes criar novos quando quiseres.",
    packChangesLine:
      "O que muda com o teu pack é o saldo de tokens disponível e quantas consultas encadeadas cabem no mesmo fio (limite por fio).",
    optionsHeading: "Opções (barra inferior)",
    optionsIntro:
      "Em Opções escolhes o tipo de consulta (I Ching ou Ossos), vês a profundidade permitida no fio ativo, geres tokens e 2FA, e no final tens ligações a documentação, privacidade e termos.",
    ichingBullet: "leitura por hexagrama e linhas.",
    bonesBulletSuffix: "formato sim/não com leitura simbólica de fendas.",
    threadDepthBullet:
      "Profundidade do fio: quantas leituras encadeadas cabem no mesmo chat conforme o teu pack (o plano gratuito não permite novas perguntas no mesmo fio após a primeira leitura).",
    exportHeading: "Exportar e guardar",
    exportBody:
      "No painel Opções podes, quando quiseres, descarregar a imagem da leitura e gerar um PDF do chat ativo. É opcional: serve para guardar uma cópia no teu dispositivo. O PDF é criado no navegador; não substitui o histórico na app nem obriga a cópias fora do serviço.",
    legalMetaBeforePrivacy: "Para todos os detalhes, consulta a ",
    legalMetaBetween: " e os ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Primeiros passos",
  },
  fr: {
    title: "Guide d’utilisation",
    leadPart1: "Cette app permet de consulter selon deux styles : ",
    leadPart2: " et ",
    leadPart3:
      ". C’est un outil de réflexion et d’orientation symbolique. Il ne remplace pas un avis médical, financier ou autre conseil professionnel.",
    bonesLabel: "Os",
    privacyHeading: "Confidentialité",
    privacyLi1:
      "Vos chats et images sont liés à votre compte et ne sont accessibles que lorsque vous êtes connecté.",
    privacyLi2:
      "Le service n’expose pas votre historique ni vos sujets de consultation en dehors de votre accès authentifié.",
    privacyLi3:
      "Si vous souhaitez conserver une trace sur votre appareil, à votre discrétion vous pouvez télécharger l’image d’une lecture et exporter le fil actuel en PDF depuis Options ; ces fichiers sont générés localement et vous en assurez la conservation.",
    chatsHeading: "Chats et sessions",
    chatsLabel: "Chats",
    chatsOpensHistory: "ouvre votre historique.",
    newSessionLabel: "Nouvelle session",
    newSessionDesc: "démarre un nouveau chat pour changer de sujet ou repartir de zéro.",
    chatsUnlimited: "Il n’y a pas de nombre fixe de chats : créez-en autant que nécessaire.",
    packChangesLine:
      "Ce qui change selon votre pack, c’est le solde de jetons disponible et le nombre de consultations enchaînées possibles dans un même fil (limite par fil).",
    optionsHeading: "Options (barre du bas)",
    optionsIntro:
      "Dans Options vous choisissez le type de consultation (I Ching ou Os), voyez la profondeur autorisée du fil actif, gérez les jetons et la 2FA, et trouvez en bas les liens vers la documentation, la confidentialité et les conditions.",
    ichingBullet: "lecture par hexagramme et traits.",
    bonesBulletSuffix: "format oui/non avec lecture symbolique des fissures.",
    threadDepthBullet:
      "Profondeur du fil : combien de lectures enchaînées sont possibles dans le même chat selon votre pack (le plan gratuit ne permet pas de poursuivre dans le même fil après la première lecture).",
    exportHeading: "Exporter et enregistrer",
    exportBody:
      "Depuis le panneau Options, vous pouvez quand vous le souhaitez télécharger l’image de la lecture et générer un PDF du chat actif. C’est facultatif : cela sert à garder une copie sur votre appareil. Le PDF est créé dans le navigateur ; il ne remplace pas l’historique dans l’app et n’oblige pas à conserver des copies hors service.",
    legalMetaBeforePrivacy: "Pour le détail complet, consultez la ",
    legalMetaBetween: " et les ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Premiers pas",
  },
  de: {
    title: "Nutzungsanleitung",
    leadPart1: "Mit dieser App kannst du in zwei Stilen konsultieren: ",
    leadPart2: " und ",
    leadPart3:
      ". Sie ist ein Werkzeug für symbolische Reflexion und Orientierung. Sie ersetzt keine medizinische oder finanzielle Beratung und auch keine sonstige professionelle Beratung.",
    bonesLabel: "Knochen",
    privacyHeading: "Datenschutz",
    privacyLi1:
      "Deine Chats und Bilder sind mit deinem Konto verknüpft und nur mit angemeldeter Sitzung zugänglich.",
    privacyLi2:
      "Der Dienst gibt deinen Verlauf und deine Beratungsthemen nicht außerhalb deines authentifizierten Zugriffs preis.",
    privacyLi3:
      "Wenn du auf deinem Gerät eine Aufzeichnung möchtest, kannst du nach eigenem Ermessen ein Lesebild herunterladen und den aktuellen Thread als PDF aus Optionen exportieren; diese Dateien werden lokal erzeugt und liegen in deiner Verantwortung.",
    chatsHeading: "Chats und Sitzungen",
    chatsLabel: "Chats",
    chatsOpensHistory: "öffnet deinen Verlauf.",
    newSessionLabel: "Neue Sitzung",
    newSessionDesc: "startet einen neuen Chat für ein neues Thema oder von vorn.",
    chatsUnlimited: "Es gibt keine feste Chat-Anzahl: du kannst jederzeit neue Chats anlegen.",
    packChangesLine:
      "Je nach Pack ändern sich dein verfügbares Token-Guthaben und wie viele verkettete Beratungen in einem Thread möglich sind (Limit pro Thread).",
    optionsHeading: "Optionen (untere Leiste)",
    optionsIntro:
      "In Optionen wählst du den Beratungstyp (I Ching oder Knochen), siehst die erlaubte Tiefe im aktiven Thread, verwaltest Token und 2FA und findest unten Links zu Dokumentation, Datenschutz und Nutzungsbedingungen.",
    ichingBullet: "Lesung nach Hexagramm und Strichen.",
    bonesBulletSuffix: "Ja/Nein-Format mit symbolischer Riss-Lesung.",
    threadDepthBullet:
      "Thread-Tiefe: wie viele verkettete Lesungen in einem Chat je nach Pack möglich sind (der kostenlose Plan erlaubt nach der ersten Lesung keine Folgefragen im selben Thread).",
    exportHeading: "Exportieren und speichern",
    exportBody:
      "Im Optionen-Bereich kannst du bei Bedarf das Lesebild herunterladen und den aktiven Chat als PDF erzeugen. Das ist optional und dient dazu, eine Kopie auf deinem Gerät zu behalten. Das PDF entsteht im Browser; es ersetzt nicht den App-Verlauf und verpflichtet nicht zu Kopien außerhalb des Dienstes.",
    legalMetaBeforePrivacy: "Alle Details findest du in der ",
    legalMetaBetween: " und die ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Erste Schritte",
  },
  it: {
    title: "Guida all’uso",
    leadPart1: "Questa app consente di consultare in due stili: ",
    leadPart2: " e ",
    leadPart3:
      ". È uno strumento di riflessione e orientamento simbolico. Non sostituisce pareri medici o finanziari né altri pareri professionali.",
    bonesLabel: "Ossa",
    privacyHeading: "Privacy",
    privacyLi1:
      "Le tue chat e immagini sono associate al tuo account e accessibili solo con sessione avviata.",
    privacyLi2:
      "Il servizio non espone la tua cronologia né gli argomenti di consultazione al di fuori del tuo accesso autenticato.",
    privacyLi3:
      "Se vuoi conservare una copia sul dispositivo, a tua discrezione puoi scaricare l’immagine di una lettura ed esportare il thread attivo in PDF da Opzioni; quei file sono generati in locale e ne sei custode.",
    chatsHeading: "Chat e sessioni",
    chatsLabel: "Chat",
    chatsOpensHistory: "apre la cronologia.",
    newSessionLabel: "Nuova sessione",
    newSessionDesc: "avvia una nuova chat per cambiare argomento o ricominciare.",
    chatsUnlimited: "Non c’è un numero fisso di chat: puoi crearne quante ne servono.",
    packChangesLine:
      "Ciò che cambia in base al pack è il saldo token disponibile e quante consultazioni concatenate stanno in un thread (limite per thread).",
    optionsHeading: "Opzioni (barra inferiore)",
    optionsIntro:
      "In Opzioni scegli il tipo di consulta (I Ching o Ossa), vedi la profondità consentita nel thread attivo, gestisci token e 2FA e in fondo trovi link a documentazione, privacy e termini.",
    ichingBullet: "lettura per esagramma e linee.",
    bonesBulletSuffix: "formato sì/no con lettura simbolica delle crepe.",
    threadDepthBullet:
      "Profondità del thread: quante letture concatenate sono possibili nella stessa chat in base al pack (il piano gratuito non consente ulteriori domande nello stesso thread dopo la prima lettura).",
    exportHeading: "Esportare e salvare",
    exportBody:
      "Dal pannello Opzioni puoi, quando vuoi, scaricare l’immagine della lettura e generare un PDF della chat attiva. È facoltativo: serve a tenere una copia sul tuo dispositivo. Il PDF viene creato nel browser; non sostituisce la cronologia nell’app e non obbliga a copie fuori dal servizio.",
    legalMetaBeforePrivacy: "Per i dettagli completi, consulta ",
    legalMetaBetween: " e i ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "Primi passi",
  },
  ja: {
    title: "利用ガイド",
    leadPart1: "このアプリでは次の2つのスタイルで占えます：",
    leadPart2: " と ",
    leadPart3:
      "。象徴的な内省と方向づけのためのツールであり、医療・金融などの専門的アドバイスに代わるものではありません。",
    bonesLabel: "甲骨",
    privacyHeading: "プライバシー",
    privacyLi1: "チャットと画像はアカウントに紐づき、サインイン中にのみアクセスできます。",
    privacyLi2: "サービスは、認証されたご本人以外に履歴や相談内容を公開しません。",
    privacyLi3:
      "端末に記録を残す場合は、ご自身の判断で読み取り画像のダウンロードや、オプションから現行スレッドのPDF出力が可能です。これらは端末上で生成され、保管はご自身の責任です。",
    chatsHeading: "チャットとセッション",
    chatsLabel: "チャット",
    chatsOpensHistory: "履歴を開きます。",
    newSessionLabel: "新しいセッション",
    newSessionDesc: "新しいトピック用の新しいチャットを始めます。",
    chatsUnlimited: "チャット数に上限はありません。必要なだけ作成できます。",
    packChangesLine:
      "パックによって変わるのは、利用可能なトークン残高と、1スレッドあたり連続して行える相談回数（スレッド上限）です。",
    optionsHeading: "オプション（下部パネル）",
    optionsIntro:
      "オプションでは相談タイプ（I Ching または甲骨）、アクティブスレッドの深さ、トークンと2FAの管理を行い、下部にドキュメント・プライバシー・利用規約へのリンクがあります。",
    ichingBullet: "卦と爻による読み。",
    bonesBulletSuffix: "亀裂パターンによるイエス／ノー形式の象徴的読み。",
    threadDepthBullet:
      "スレッドの深さ：パックに応じて同一チャットで連続できる読み取り回数（無料プランは最初の読み取り後、同じスレッドでの追問は不可）。",
    exportHeading: "エクスポートと保存",
    exportBody:
      "オプションパネルから、必要に応じて読み取り画像のダウンロードやアクティブチャットのPDF生成ができます。任意です。ブラウザ内でPDFが作成され、アプリ内の履歴を置き換えたり、サービス外への保存を義務付けたりはしません。",
    legalMetaBeforePrivacy: "詳細は次をご確認ください：",
    legalMetaBetween: "および",
    legalMetaAfterTerms: "をご確認ください。",
    gettingStartedHeading: "はじめに",
  },
  zh: {
    title: "使用指南",
    leadPart1: "本应用支持两种咨询方式：",
    leadPart2: " 与 ",
    leadPart3:
      "。它是象征性反思与取向的工具，不能替代医疗、财务或其他专业建议。",
    bonesLabel: "甲骨",
    privacyHeading: "隐私",
    privacyLi1: "您的聊天记录与图片与账户关联，仅在登录后可访问。",
    privacyLi2: "服务不会在您本人认证访问之外暴露历史或咨询主题。",
    privacyLi3:
      "若要在设备上留存记录，您可自行决定从选项下载解读图、将当前会话导出为 PDF；这些文件在本地生成，由您自行保管。",
    chatsHeading: "聊天与会话",
    chatsLabel: "聊天",
    chatsOpensHistory: "打开历史记录。",
    newSessionLabel: "新会话",
    newSessionDesc: "开始新聊天以更换主题或从头开始。",
    chatsUnlimited: "聊天数量不设固定上限，可按需创建。",
    packChangesLine:
      "随套餐变化的是可用代币余额以及同一会话中可连续进行的咨询次数（每会话上限）。",
    optionsHeading: "选项（底部栏）",
    optionsIntro:
      "在选项中选择咨询类型（I Ching 或甲骨）、查看当前会话允许的深度、管理代币与双因素认证，底部有文档、隐私政策与服务条款链接。",
    ichingBullet: "基于卦象与爻辞的解读。",
    bonesBulletSuffix: "以裂纹图案进行的是／否象征性解读。",
    threadDepthBullet:
      "会话深度：根据套餐，同一聊天中可连续解读的次数（免费计划在首次解读后不允许在同一会话中继续追问）。",
    exportHeading: "导出与保存",
    exportBody:
      "在选项面板中，您可随时下载解读图并生成当前聊天的 PDF。此为可选操作，用于在自有设备上保存副本。PDF 在浏览器中生成，不替代应用内历史，也不要求在服务外保留副本。",
    legalMetaBeforePrivacy: "完整说明请参阅",
    legalMetaBetween: "以及",
    legalMetaAfterTerms: "。",
    gettingStartedHeading: "快速入门",
  },
  ko: {
    title: "사용 안내",
    leadPart1: "이 앱에서는 두 가지 방식으로 점칠 수 있습니다: ",
    leadPart2: " 및 ",
    leadPart3:
      ". 상징적 성찰과 방향 제시를 위한 도구이며 의료·재무 등 전문 조언을 대체하지 않습니다.",
    bonesLabel: "갑골",
    privacyHeading: "개인정보",
    privacyLi1: "채팅과 이미지는 계정에 연결되며 로그인한 상태에서만 접근할 수 있습니다.",
    privacyLi2: "서비스는 본인의 인증된 접근 밖에서 기록이나 상담 주제를 노출하지 않습니다.",
    privacyLi3:
      "기기에 기록을 남기려면, 본인 판단으로 해석 이미지를 내려받거나 옵션에서 현재 스레드를 PDF로보낼 수 있습니다. 해당 파일은 기기에서 생성되며 보관 책임은 사용자에게 있습니다.",
    chatsHeading: "채팅과 세션",
    chatsLabel: "채팅",
    chatsOpensHistory: "기록을 엽니다.",
    newSessionLabel: "새 세션",
    newSessionDesc: "새 주제를 위해 새 채팅을 시작합니다.",
    chatsUnlimited: "채팅 개수에 고정 상한이 없으며 필요한 만큼 만들 수 있습니다.",
    packChangesLine:
      "팩에 따라 달라지는 것은 사용 가능한 토큰 잔액과 한 스레드에서 연속 상담 가능 횟수(스레드당 한도)입니다.",
    optionsHeading: "옵션(하단 패널)",
    optionsIntro:
      "옵션에서 상담 유형(I Ching 또는 갑골), 활성 스레드의 허용 깊이, 토큰 및 2FA를 관리하고 하단에 문서·개인정보 처리방침·서비스 약관 링크가 있습니다.",
    ichingBullet: "괘와 효(爻)에 따른 해석.",
    bonesBulletSuffix: "균열 패턴을 사용한 예/아니오 형식의 상징적 해석.",
    threadDepthBullet:
      "스레드 깊이: 팩에 따라 같은 채팅에서 연속 해석 가능 횟수(무료 플랜은 첫 해석 후 같은 스레드에서 추가 질문 불가).",
    exportHeading: "보내기 및 저장",
    exportBody:
      "옵션 패널에서 해석 이미지를 내려받고 활성 채팅을 PDF로 만들 수 있습니다. 선택 사항이며 기기에 사본을 보관하기 위함입니다. PDF는 브라우저에서 생성되며 앱 내 기록을 대체하지 않고 서비스 밖 보관을 강제하지 않습니다.",
    legalMetaBeforePrivacy: "자세한 내용은 다음을 확인하세요: ",
    legalMetaBetween: " 및 ",
    legalMetaAfterTerms: "을(를) 확인하세요.",
    gettingStartedHeading: "시작하기",
  },
  ar: {
    title: "دليل المستخدم",
    leadPart1: "يتيح هذا التطبيق الاستشارة بأسلوبين: ",
    leadPart2: " و ",
    leadPart3:
      ". إنه أداة للتأمل والتوجيه الرمزي، ولا يحل محل المشورة الطبية أو المالية أو أي مشورة مهنية أخرى.",
    bonesLabel: "العظام",
    privacyHeading: "الخصوصية",
    privacyLi1: "محادثاتك وصورك مرتبطة بحسابك ولا يمكن الوصول إليها إلا عند تسجيل الدخول.",
    privacyLi2: "لا تكشف الخدمة عن سجلاتك أو موضوعات استشاراتك خارج نطاق وصولك المصادق عليه.",
    privacyLi3:
      "إذا أردت الاحتفاظ بسجل على جهازك، يمكنك بمحض إرادتك تنزيل صورة القراءة وتصدير الخيط الحالي إلى PDF من خيارات الاستشارة؛ هذه الملفات تُنشأ محليًا وأنت مسؤول عن حفظها.",
    chatsHeading: "المحادثات والجلسات",
    chatsLabel: "المحادثات",
    chatsOpensHistory: "يفتح سجلك.",
    newSessionLabel: "جلسة جديدة",
    newSessionDesc: "يبدأ محادثة جديدة لموضوع مختلف.",
    chatsUnlimited: "لا يوجد عدد ثابت للمحادثات: أنشئ ما تحتاجه.",
    packChangesLine:
      "ما يتغير بحسب حزمتك هو رصيد الرموز المتاح وعدد الاستشارات المتسلسلة المسموح بها في خيط واحد (الحد لكل خيط).",
    optionsHeading: "الخيارات (اللوحة السفلية)",
    optionsIntro:
      "في الخيارات تختار نوع الاستشارة (I Ching أو العظام)، وترى العمق المسموح به في الخيط النشط، وتدير الرموز و2FA، وفي الأسفل روابط للوثائق والخصوصية والشروط.",
    ichingBullet: "قراءة بالهكساغرام والخطوط.",
    bonesBulletSuffix: "تنسيق نعم/لا مع قراءة رمزية للشقوق.",
    threadDepthBullet:
      "عمق الخيط: عدد القراءات المتسلسلة الممكنة في نفس المحادثة حسب حزمتك (الخطة المجانية لا تتيح أسئلة متابعة في نفس الخيط بعد القراءة الأولى).",
    exportHeading: "التصدير والحفظ",
    exportBody:
      "من لوحة الخيارات يمكنك متى شئت تنزيل صورة القراءة وإنشاء PDF للمحادثة النشطة. هذا اختياري ويُستخدم للاحتفاظ بنسخة على جهازك. يُنشأ PDF في المتصفح ولا يحل محل السجل داخل التطبيق.",
    legalMetaBeforePrivacy: "للتفاصيل الكاملة، راجع ",
    legalMetaBetween: " و ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "البدء",
  },
};

export function getGuiaPageUiMessages(locale: AppLocale): GuiaPageUiMessages {
  return GUIA_PAGE_UI[locale] ?? GUIA_PAGE_UI[DEFAULT_LOCALE];
}
