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
  ichingCastModeHeading: string;
  ichingCastModeP1: string;
  ichingCastAutoLi: string;
  ichingCastManualLi: string;
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
      "En Opciones eliges el tipo de consulta (I Ching o Huesos); con I Ching también el modo de tirada (automática o manual), ves la profundidad permitida en el hilo activo, gestionas tokens y 2FA, y al final tienes enlaces a documentación, privacidad y términos.",
    ichingBullet: "lectura por hexagrama y líneas.",
    bonesBulletSuffix: "formato sí/no con lectura simbólica de grietas.",
    threadDepthBullet:
      "Profundidad del hilo: cuántas lecturas encadenadas caben en el mismo chat según tu pack (el plan gratuito no permite seguir preguntando en el mismo hilo tras la primera lectura).",
    ichingCastModeHeading: "I Ching: tirada automática o manual",
    ichingCastModeP1:
      "Con I Ching activo en Opciones puedes elegir el modo de tirada. En ambos casos el servidor aplica las mismas reglas de Zhu Xi y el mismo corpus; solo cambia quién fija las seis líneas antes de la interpretación.",
    ichingCastAutoLi:
      "Automática: al enviar la consulta, el ritual anima el trazado y las seis líneas se obtienen en el servidor (tres monedas simuladas por línea).",
    ichingCastManualLi:
      "Manual: se abre un asistente para registrar, de abajo arriba, el resultado de tres monedas por línea (cara/cruz → totales 6, 7, 8 o 9). Tras completar las seis líneas verás una vista previa del hexagrama en el hilo hasta que llegue la lectura; la responsabilidad de reflejar bien tu tirada física es tuya.",
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
      "In Options you pick the consultation type (I Ching or Bones); with I Ching you also pick the cast mode (automatic or manual), see allowed depth for the active thread, manage tokens and 2FA, and find links to documentation, privacy, and terms at the bottom.",
    ichingBullet: "hexagram and line-based reading.",
    bonesBulletSuffix: "yes/no format with symbolic crack reading.",
    threadDepthBullet:
      "Thread depth: how many chained readings fit in one chat for your pack (the free plan does not allow follow-up readings in the same thread after the first one).",
    ichingCastModeHeading: "I Ching: automatic or manual cast",
    ichingCastModeP1:
      "With I Ching selected in Options you can pick the cast mode. In both cases the server applies the same Zhu Xi rules and the same text base; only who supplies the six lines before interpretation changes.",
    ichingCastAutoLi:
      "Automatic: when you send the consultation, the ritual animates the pattern and the six lines are generated on the server (three simulated coins per line).",
    ichingCastManualLi:
      "Manual: an assistant opens so you can record, bottom to top, three coins per line (heads/tails → totals 6, 7, 8, or 9). After all six lines you will see a hexagram preview in the thread until the reading arrives; you are responsible for accurately reflecting your physical throw.",
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
      "Em Opções escolhes o tipo de consulta (I Ching ou Ossos); com o I Ching também o modo de tiragem (automática ou manual), vês a profundidade permitida no fio ativo, geres tokens e 2FA, e no final tens ligações a documentação, privacidade e termos.",
    ichingBullet: "leitura por hexagrama e linhas.",
    bonesBulletSuffix: "formato sim/não com leitura simbólica de fendas.",
    threadDepthBullet:
      "Profundidade do fio: quantas leituras encadeadas cabem no mesmo chat conforme o teu pack (o plano gratuito não permite novas perguntas no mesmo fio após a primeira leitura).",
    ichingCastModeHeading: "I Ching: tiragem automática ou manual",
    ichingCastModeP1:
      "Com o I Ching ativo em Opções podes escolher o modo de tiragem. Em ambos os casos o servidor aplica as mesmas regras de Zhu Xi e o mesmo corpus; só muda quem define as seis linhas antes da interpretação.",
    ichingCastAutoLi:
      "Automática: ao enviar a consulta, o ritual anima o traçado e as seis linhas são obtidas no servidor (três moedas simuladas por linha).",
    ichingCastManualLi:
      "Manual: abre-se um assistente para registares, de baixo para cima, o resultado de três moedas por linha (cara/coroa → totais 6, 7, 8 ou 9). Depois das seis linhas vês uma pré-visualização do hexagrama no fio até chegar a leitura; a responsabilidade de refletir corretamente a tua tiragem física é tua.",
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
      "Dans Options vous choisissez le type de consultation (I Ching ou Os) ; avec I Ching aussi le mode de tirage (automatique ou manuel), voyez la profondeur autorisée du fil actif, gérez les jetons et la 2FA, et trouvez en bas les liens vers la documentation, la confidentialité et les conditions.",
    ichingBullet: "lecture par hexagramme et traits.",
    bonesBulletSuffix: "format oui/non avec lecture symbolique des fissures.",
    threadDepthBullet:
      "Profondeur du fil : combien de lectures enchaînées sont possibles dans le même chat selon votre pack (le plan gratuit ne permet pas de poursuivre dans le même fil après la première lecture).",
    ichingCastModeHeading: "I Ching : tirage automatique ou manuel",
    ichingCastModeP1:
      "Avec I Ching sélectionné dans Options, vous choisissez le mode de tirage. Dans les deux cas le serveur applique les mêmes règles de Zhu Xi et le même corpus ; seul change l’origine des six traits avant l’interprétation.",
    ichingCastAutoLi:
      "Automatique : à l’envoi, le rituel anime le tracé et les six traits sont générés côté serveur (trois pièces simulées par trait).",
    ichingCastManualLi:
      "Manuel : un assistant permet d’enregistrer, du bas vers le haut, trois pièces par trait (pile/face → totaux 6, 7, 8 ou 9). Après les six traits, un aperçu d’hexagramme s’affiche dans le fil jusqu’à l’interprétation ; vous êtes responsable de refléter fidèlement votre jet physique.",
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
      "In Optionen wählst du den Beratungstyp (I Ching oder Knochen); bei I Ging auch den Wurfmodus (automatisch oder manuell), siehst die erlaubte Tiefe im aktiven Thread, verwaltest Token und 2FA und findest unten Links zu Dokumentation, Datenschutz und Nutzungsbedingungen.",
    ichingBullet: "Lesung nach Hexagramm und Strichen.",
    bonesBulletSuffix: "Ja/Nein-Format mit symbolischer Riss-Lesung.",
    threadDepthBullet:
      "Thread-Tiefe: wie viele verkettete Lesungen in einem Chat je nach Pack möglich sind (der kostenlose Plan erlaubt nach der ersten Lesung keine Folgefragen im selben Thread).",
    ichingCastModeHeading: "I Ging: automatischer oder manueller Wurf",
    ichingCastModeP1:
      "Mit ausgewähltem I Ging unter Optionen wählst du den Wurfmodus. In beiden Fällen wendet der Server dieselben Zhu-Xi-Regeln und denselben Textbestand an; nur die Herkunft der sechs Striche vor der Auslegung ändert sich.",
    ichingCastAutoLi:
      "Automatisch: Beim Senden animiert das Ritual das Muster, die sechs Striche entstehen auf dem Server (drei simulierte Münzen pro Strich).",
    ichingCastManualLi:
      "Manuell: Ein Assistent öffnet; du trägst von unten nach oben pro Strich drei Münzen ein (Kopf/Zahl → Summen 6, 7, 8 oder 9). Nach sechs Strichen erscheint eine Hexagramm-Vorschau im Thread bis zur Lesung; du bist dafür verantwortlich, deinen physischen Wurf korrekt abzubilden.",
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
      "In Opzioni scegli il tipo di consulta (I Ching o Ossa); con I Ching anche la modalità di lancio (automatica o manuale), vedi la profondità consentita nel thread attivo, gestisci token e 2FA e in fondo trovi link a documentazione, privacy e termini.",
    ichingBullet: "lettura per esagramma e linee.",
    bonesBulletSuffix: "formato sì/no con lettura simbolica delle crepe.",
    threadDepthBullet:
      "Profondità del thread: quante letture concatenate sono possibili nella stessa chat in base al pack (il piano gratuito non consente ulteriori domande nello stesso thread dopo la prima lettura).",
    ichingCastModeHeading: "I Ching: lancio automatico o manuale",
    ichingCastModeP1:
      "Con I Ching attivo in Opzioni puoi scegliere la modalità di lancio. In entrambi i casi il server applica le stesse regole di Zhu Xi e lo stesso corpus; cambia solo chi fornisce le sei linee prima dell’interpretazione.",
    ichingCastAutoLi:
      "Automatico: all’invio il rituale anima il tracciato e le sei linee sono generate sul server (tre monete simulate per linea).",
    ichingCastManualLi:
      "Manuale: si apre un assistente per registrare dal basso tre monete per linea (testa/croce → totali 6, 7, 8 o 9). Dopo le sei linee compare un’anteprima dell’esagramma nel thread fino alla lettura; sei responsabile di riflettere fedelmente il tuo lancio fisico.",
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
      "オプションでは相談タイプ（I Ching または甲骨）を選び、I Ching では占い方（自動または手動）も選べます。アクティブスレッドの深さ、トークンと2FAの管理、下部のドキュメント・プライバシー・利用規約リンクもここです。",
    ichingBullet: "卦と爻による読み。",
    bonesBulletSuffix: "亀裂パターンによるイエス／ノー形式の象徴的読み。",
    threadDepthBullet:
      "スレッドの深さ：パックに応じて同一チャットで連続できる読み取り回数（無料プランは最初の読み取り後、同じスレッドでの追問は不可）。",
    ichingCastModeHeading: "易経：自動か手動の占い",
    ichingCastModeP1:
      "オプションで易経を選ぶと占い方を選べます。どちらもサーバー側で朱熹の同じルールと同じ本文系を適用します。解釈の前に六爻を誰が確定するかだけが異なります。",
    ichingCastAutoLi:
      "自動：送信すると儀式が卦の展開をアニメーションし、六爻はサーバーで得られます（各爻に三銭をシミュレート）。",
    ichingCastManualLi:
      "手動：アシスタントで下から各爻ごとに三銭の結果（表裏→6・7・8・9）を記録します。六爻が揃うと解釈が届くまでスレッドに卦のプレビューが表示されます。実際の投げ結果を正確に入力する責任は利用者にあります。",
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
      "在选项中选择咨询类型（I Ching 或甲骨）；选易经时还可选择起卦方式（自动或手动），查看当前会话允许的深度、管理代币与双因素认证，底部有文档、隐私政策与服务条款链接。",
    ichingBullet: "基于卦象与爻辞的解读。",
    bonesBulletSuffix: "以裂纹图案进行的是／否象征性解读。",
    threadDepthBullet:
      "会话深度：根据套餐，同一聊天中可连续解读的次数（免费计划在首次解读后不允许在同一会话中继续追问）。",
    ichingCastModeHeading: "易经：自动起卦或手动起卦",
    ichingCastModeP1:
      "在选项中选择易经后，可选择起卦方式。两种方式服务器都应用相同的朱熹规则与同一套文本；差别仅在于六爻由谁确定。",
    ichingCastAutoLi:
      "自动：发送咨询后会有仪式动画，六爻由服务器生成（每爻模拟三钱）。",
    ichingCastManualLi:
      "手动：打开助手自下而上逐爻记录三钱结果（字/背→6、7、8、9）。六爻完成后会话中会显示卦象预览，直至解读返回；请确保输入与您实际投掷一致。",
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
      "옵션에서 상담 유형(I Ching 또는 갑골)을 고르고, I Ching일 때는 점 방식(자동 또는 수동)도 고릅니다. 활성 스레드 허용 깊이, 토큰 및 2FA 관리, 하단의 문서·개인정보·약관 링크도 여기 있습니다.",
    ichingBullet: "괘와 효(爻)에 따른 해석.",
    bonesBulletSuffix: "균열 패턴을 사용한 예/아니오 형식의 상징적 해석.",
    threadDepthBullet:
      "스레드 깊이: 팩에 따라 같은 채팅에서 연속 해석 가능 횟수(무료 플랜은 첫 해석 후 같은 스레드에서 추가 질문 불가).",
    ichingCastModeHeading: "역경: 자동 또는 수동 점",
    ichingCastModeP1:
      "옵션에서 역경을 선택하면 점 방식을 고를 수 있습니다. 두 경우 모두 서버는 동일한 주희 규칙과 동일한 텍스트 체계를 적용합니다. 해석 전 여섯 효를 누가 확정하느냐만 다릅니다.",
    ichingCastAutoLi:
      "자동: 전송하면 의식 애니메이션이 재생되고 여섯 효는 서버에서 생성됩니다(효마다 동전 세 개 시뮬레이션).",
    ichingCastManualLi:
      "수동: 도우미에서 아래에서 위로 효마다 동전 세 개 결과(앞/뒤→6·7·8·9)를 기록합니다. 여섯 효가 끝나면 해석이 올 때까지 스레드에 괘 미리보기가 표시됩니다. 실제 던진 결과를 정확히 반영할 책임은 사용자에게 있습니다.",
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
      "في الخيارات تختار نوع الاستشارة (I Ching أو العظام)، ومع I Ching تختار أيضًا وضع القَسْم (تلقائي أو يدوي)، وترى العمق المسموح به في الخيط النشط، وتدير الرموز و2FA، وفي الأسفل روابط للوثائق والخصوصية والشروط.",
    ichingBullet: "قراءة بالهكساغرام والخطوط.",
    bonesBulletSuffix: "تنسيق نعم/لا مع قراءة رمزية للشقوق.",
    threadDepthBullet:
      "عمق الخيط: عدد القراءات المتسلسلة الممكنة في نفس المحادثة حسب حزمتك (الخطة المجانية لا تتيح أسئلة متابعة في نفس الخيط بعد القراءة الأولى).",
    ichingCastModeHeading: "I Ching: قَسْم تلقائي أو يدوي",
    ichingCastModeP1:
      "عند اختيار I Ching في الخيارات يمكنك اختيار أسلوب القَسْم. في الحالتين يطبق الخادم نفس قواعد زو شي ونفس المرجع النصي؛ يتغيّر فقط من يثبت الخطوط الستة قبل التفسير.",
    ichingCastAutoLi:
      "تلقائي: عند الإرسال يعرض الطقس الحركة وتُولَّد الخطوط الستة على الخادم (ثلاث عملات محاكاة لكل خط).",
    ichingCastManualLi:
      "يدوي: يفتح مساعد لتسجيل ثلاث عملات لكل خط من الأسفل إلى الأعلى (وجه/كتابة → المجاميع 6 أو 7 أو 8 أو 9). بعد اكتمال الخطوط الستة يظهر معاينة للهكساغرام في الخيط حتى تصل القراءة؛ مسؤوليتك أن تعكس رميتك الفعلية بدقة.",
    exportHeading: "التصدير والحفظ",
    exportBody:
      "من لوحة الخيارات يمكنك متى شئت تنزيل صورة القراءة وإنشاء PDF للمحادثة النشطة. هذا اختياري ويُستخدم للاحتفاظ بنسخة على جهازك. يُنشأ PDF في المتصفح ولا يحل محل السجل داخل التطبيق.",
    legalMetaBeforePrivacy: "للتفاصيل الكاملة، راجع ",
    legalMetaBetween: " و ",
    legalMetaAfterTerms: ".",
    gettingStartedHeading: "البدء",
  },
  hi: {
    title: "उपयोगकर्ता मार्गदर्शिका",
    leadPart1: "यह ऐप दो परामर्श शैलियों में उपलब्ध है: ",
    leadPart2: " और ",
    leadPart3:
      "। यह प्रतीकात्मक चिंतन और मार्गदर्शन का उपकरण है। यह चिकित्सा, वित्तीय या किसी अन्य पेशेवर सलाह का विकल्प नहीं है।",
    bonesLabel: "हड्डियाँ",
    privacyHeading: "गोपनीयता",
    privacyLi1:
      "आपकी चैट और छवियाँ आपके खाते से जुड़ी हैं और केवल लॉग इन रहने पर ही पहुँच योग्य हैं।",
    privacyLi2:
      "सेवा आपके इतिहास या परामर्श विषयों को आपके प्रमाणित पहुँच के बाहर उजागर नहीं करती।",
    privacyLi3:
      "यदि आप अपने डिवाइस पर रिकॉर्ड रखना चाहते हैं, तो आप अपने विवेक से पठन छवि डाउनलोड कर सकते हैं और विकल्प से वर्तमान थ्रेड को PDF में निर्यात कर सकते हैं; वे फ़ाइलें स्थानीय रूप से बनती हैं और उनकी देखभाल आपकी जिम्मेदारी है।",
    chatsHeading: "चैट और सत्र",
    chatsLabel: "चैट",
    chatsOpensHistory: "आपका इतिहास खोलता है।",
    newSessionLabel: "नया सत्र",
    newSessionDesc: "नए विषय के लिए नई चैट शुरू करता है।",
    chatsUnlimited: "चैट की कोई निश्चित संख्या नहीं है: जितनी जरूरत हो उतनी बनाएं।",
    packChangesLine:
      "आपके पैक के साथ जो बदलता है वह है उपलब्ध टोकन शेष और एक थ्रेड में कितने अनुवर्ती परामर्श हो सकते हैं (प्रति थ्रेड सीमा)।",
    optionsHeading: "विकल्प (नीचे का पैनल)",
    optionsIntro:
      "विकल्प में आप परामर्श प्रकार (I Ching या हड्डियाँ) चुनते हैं; I Ching के साथ कास्ट मोड (स्वचालित या मैन्युअल) भी, सक्रिय थ्रेड की अनुमत गहराई, टोकन और 2FA प्रबंधित करते हैं, और नीचे दस्तावेज़ीकरण, गोपनीयता और शर्तों के लिंक होते हैं।",
    ichingBullet: "हेक्साग्राम और रेखा-आधारित पठन।",
    bonesBulletSuffix: "प्रतीकात्मक दरार पठन के साथ हाँ/नहीं प्रारूप।",
    threadDepthBullet:
      "थ्रेड गहराई: आपके पैक के अनुसार एक चैट में कितने श्रृंखलाबद्ध पठन हो सकते हैं (निःशुल्क योजना पहले पठन के बाद उसी थ्रेड में अनुवर्ती प्रश्नों की अनुमति नहीं देती)।",
    ichingCastModeHeading: "I Ching: स्वचालित या मैन्युअल कास्ट",
    ichingCastModeP1:
      "विकल्पों में I Ching चुनने पर आप कास्ट मोड चुन सकते हैं। दोनों स्थितियों में सर्वर समान झू शी नियम और समान पाठ आधार लागू करता है; केवल यह बदलता है कि व्याख्या से पहले छह रेखाएँ कौन तय करता है।",
    ichingCastAutoLi:
      "स्वचालित: भेजने पर अनुष्ठान चित्रण चलाता है और छह रेखाएँ सर्वर पर बनती हैं (प्रति रेखा तीन सिम्युलेटेड सिक्के)।",
    ichingCastManualLi:
      "मैन्युअल: सहायक खुलता है ताकि नीचे से ऊपर प्रति रेखा तीन सिक्के दर्ज कर सकें (चित/पट → योग 6, 7, 8 या 9)। छह रेखाओं के बाद पठन आने तक थ्रेड में हेक्साग्राम पूर्वावलोकन दिखता है; अपने भौतिक फेंक को सटीक दर्शाना आपकी जिम्मेदारी है।",
    exportHeading: "निर्यात और सहेजना",
    exportBody:
      "विकल्प पैनल से आप जब चाहें पठन छवि डाउनलोड कर सकते हैं और सक्रिय चैट का PDF बना सकते हैं। यह वैकल्पिक है और अपने डिवाइस पर प्रति रखने के लिए है। PDF ब्राउज़र में बनता है; यह ऐप इतिहास को प्रतिस्थापित नहीं करता।",
    legalMetaBeforePrivacy: "पूर्ण विवरण के लिए देखें ",
    legalMetaBetween: " और ",
    legalMetaAfterTerms: "।",
    gettingStartedHeading: "शुरुआत करना",
  },
};

export function getGuiaPageUiMessages(locale: AppLocale): GuiaPageUiMessages {
  return GUIA_PAGE_UI[locale] ?? GUIA_PAGE_UI[DEFAULT_LOCALE];
}
