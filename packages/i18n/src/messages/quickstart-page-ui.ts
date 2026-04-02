import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type QuickstartPageUiMessages = {
  title: string;
  lead: string;
  bonesLabel: string;
  s1Heading: string;
  ichingLi: string;
  bonesLi: string;
  s2Heading: string;
  s2Li1: string;
  s2Li2: string;
  s2Li3: string;
  s2Li4: string;
  s2Li5: string;
  s3Heading: string;
  s3Li1: string;
  s3Li2: string;
  s3Li3: string;
};

const QUICKSTART_PAGE_UI: Record<AppLocale, QuickstartPageUiMessages> = {
  es: {
    title: "Quickstart: cómo usar la app",
    lead: "Esta guía es práctica: solo cómo usar I Ching, Huesos y las opciones del panel inferior.",
    bonesLabel: "Huesos",
    s1Heading: "1) Elige el modo de consulta",
    ichingLi:
      "lectura por hexagramas y líneas. Úsalo para preguntas abiertas y reflexión amplia.",
    bonesLi:
      "lectura de sí/no por patrón de grietas. Úsalo para validar dirección o decisión puntual.",
    s2Heading: "2) Usa el panel Opciones",
    s2Li1: "Cambias entre I Ching y Huesos.",
    s2Li2:
      "Ves el estado de profundidad del hilo activo (cuántas lecturas encadenadas permite tu plan en ese chat).",
    s2Li3: "Gestionas tokens y compra de packs.",
    s2Li4: "Gestionas seguridad 2FA opcional.",
    s2Li5: "Accedes a documentación y textos legales al final del panel.",
    s3Heading: "3) Resultados y copia local",
    s3Li1: "Cada consulta puede traer interpretación + imagen.",
    s3Li2:
      "Si quieres conservar un registro fuera de la app, en Opciones puedes descargar la imagen y exportar el hilo actual a PDF; es opcional y el archivo se guarda en tu dispositivo bajo tu criterio.",
    s3Li3: "Puedes eliminar chats desde el historial (Chats).",
  },
  en: {
    title: "Quickstart: how to use the app",
    lead: "This guide is practical: only how to use I Ching, Bones, and the options in the bottom panel.",
    bonesLabel: "Bones",
    s1Heading: "1) Choose consultation mode",
    ichingLi: "hexagram-and-lines reading. Use it for open questions and broad reflection.",
    bonesLi:
      "yes/no crack-pattern reading. Use it to validate direction or a specific decision.",
    s2Heading: "2) Use the Options panel",
    s2Li1: "Switch between I Ching and Bones.",
    s2Li2:
      "See active thread depth status (how many chained readings your plan allows in that chat).",
    s2Li3: "Manage tokens and pack purchases.",
    s2Li4: "Manage optional 2FA security.",
    s2Li5: "Documentation and legal links are at the bottom of the panel.",
    s3Heading: "3) Results and local copy",
    s3Li1: "Each consultation can include interpretation + image.",
    s3Li2:
      "If you want a record outside the app, Options lets you download the image and export the current thread to PDF; this is optional and the file is saved on your device at your discretion.",
    s3Li3: "You can delete chats from history (Chats).",
  },
  pt: {
    title: "Quickstart: como usar a app",
    lead: "Este guia é prático: apenas como usar I Ching, Ossos e as opções do painel inferior.",
    bonesLabel: "Ossos",
    s1Heading: "1) Escolhe o modo de consulta",
    ichingLi:
      "leitura por hexagramas e linhas. Usa para perguntas abertas e reflexão ampla.",
    bonesLi:
      "leitura sim/não por padrão de fendas. Usa para validar direção ou decisão pontual.",
    s2Heading: "2) Usa o painel Opções",
    s2Li1: "Alternas entre I Ching e Ossos.",
    s2Li2:
      "Vês o estado de profundidade do fio ativo (quantas leituras encadeadas o teu plano permite nesse chat).",
    s2Li3: "Geres tokens e compra de packs.",
    s2Li4: "Geres segurança 2FA opcional.",
    s2Li5: "No final do painel tens documentação e textos legais.",
    s3Heading: "3) Resultados e cópia local",
    s3Li1: "Cada consulta pode incluir interpretação + imagem.",
    s3Li2:
      "Se quiseres um registo fora da app, em Opções podes descarregar a imagem e exportar o fio atual para PDF; é opcional e o ficheiro fica no teu dispositivo à tua discrição.",
    s3Li3: "Podes eliminar chats a partir do histórico (Chats).",
  },
  fr: {
    title: "Quickstart : utiliser l’app",
    lead: "Ce guide est pratique : I Ching, Os et options du panneau du bas uniquement.",
    bonesLabel: "Os",
    s1Heading: "1) Choisir le mode de consultation",
    ichingLi:
      "lecture par hexagrammes et traits. Pour questions ouvertes et réflexion large.",
    bonesLi:
      "lecture oui/non par motif de fissures. Pour valider une direction ou une décision ponctuelle.",
    s2Heading: "2) Utiliser le panneau Options",
    s2Li1: "Basculer entre I Ching et Os.",
    s2Li2:
      "Voir la profondeur du fil actif (combien de lectures enchaînées votre offre autorise dans ce chat).",
    s2Li3: "Gérer les jetons et l’achat de packs.",
    s2Li4: "Gérer la 2FA optionnelle.",
    s2Li5: "Documentation et mentions légales en bas du panneau.",
    s3Heading: "3) Résultats et copie locale",
    s3Li1: "Chaque consultation peut inclure interprétation + image.",
    s3Li2:
      "Pour un enregistrement hors app, Options permet de télécharger l’image et d’exporter le fil en PDF ; facultatif, fichier sur votre appareil à votre discrétion.",
    s3Li3: "Vous pouvez supprimer des chats depuis l’historique (Chats).",
  },
  de: {
    title: "Quickstart: App nutzen",
    lead: "Diese Anleitung ist praktisch: nur I Ching, Knochen und Optionen in der unteren Leiste.",
    bonesLabel: "Knochen",
    s1Heading: "1) Beratungsmodus wählen",
    ichingLi:
      "Lesung mit Hexagrammen und Strichen. Für offene Fragen und breite Reflexion.",
    bonesLi:
      "Ja/Nein-Lesung nach Rissmuster. Zur Validierung von Richtung oder konkreter Entscheidung.",
    s2Heading: "2) Optionen-Bereich nutzen",
    s2Li1: "Zwischen I Ching und Knochen wechseln.",
    s2Li2:
      "Aktive Thread-Tiefe sehen (wie viele verkettete Lesungen dein Plan in diesem Chat erlaubt).",
    s2Li3: "Token und Pack-Käufe verwalten.",
    s2Li4: "Optionale 2FA-Sicherheit verwalten.",
    s2Li5: "Dokumentation und Rechtliches stehen unten im Panel.",
    s3Heading: "3) Ergebnisse und lokale Kopie",
    s3Li1: "Jede Beratung kann Deutung + Bild enthalten.",
    s3Li2:
      "Für eine Kopie außerhalb der App kannst du in Optionen Bild herunterladen und Thread als PDF exportieren; optional, Datei liegt auf deinem Gerät.",
    s3Li3: "Chats kannst du über den Verlauf (Chats) löschen.",
  },
  it: {
    title: "Quickstart: come usare l’app",
    lead: "Questa guida è pratica: solo I Ching, Ossa e le opzioni nel pannello inferiore.",
    bonesLabel: "Ossa",
    s1Heading: "1) Scegli la modalità di consulto",
    ichingLi:
      "lettura con esagrammi e linee. Per domande aperte e riflessione ampia.",
    bonesLi:
      "lettura sì/no tramite pattern di crepe. Per validare direzione o decisione specifica.",
    s2Heading: "2) Usa il pannello Opzioni",
    s2Li1: "Passi tra I Ching e Ossa.",
    s2Li2:
      "Vedi la profondità del thread attivo (quante letture concatenate consente il tuo piano in quella chat).",
    s2Li3: "Gestisci token e acquisto di pacchetti.",
    s2Li4: "Gestisci 2FA opzionale.",
    s2Li5: "Documentazione e testi legali in fondo al pannello.",
    s3Heading: "3) Risultati e copia locale",
    s3Li1: "Ogni consulto può includere interpretazione + immagine.",
    s3Li2:
      "Per un archivio fuori dall’app, Opzioni consente di scaricare l’immagine ed esportare il thread in PDF; facoltativo, file sul dispositivo a tua discrezione.",
    s3Li3: "Puoi eliminare chat dalla cronologia (Chat).",
  },
  ja: {
    title: "クイックスタート：アプリの使い方",
    lead: "実用的な手順のみ：I Ching、甲骨、下部パネルのオプションです。",
    bonesLabel: "甲骨",
    s1Heading: "1) 相談モードを選ぶ",
    ichingLi: "卦と爻による読み。オープンな問いや広い内省向け。",
    bonesLi: "亀裂パターンによるイエス／ノー読み。方向や具体的判断の確認向け。",
    s2Heading: "2) オプションパネルを使う",
    s2Li1: "I Ching と甲骨を切り替えます。",
    s2Li2: "アクティブスレッドの深さ（プランがそのチャットで許容する連続読み取り回数）を確認します。",
    s2Li3: "トークンとパック購入を管理します。",
    s2Li4: "任意の2要素認証を管理します。",
    s2Li5: "パネル下部にドキュメントと法務リンクがあります。",
    s3Heading: "3) 結果とローカル保存",
    s3Li1: "各相談に解釈＋画像が含まれる場合があります。",
    s3Li2:
      "アプリ外に記録を残す場合、オプションから画像のダウンロードや現行スレッドのPDF出力が可能です。任意で、ファイルは端末に保存されます。",
    s3Li3: "履歴（チャット）からチャットを削除できます。",
  },
  zh: {
    title: "快速上手：如何使用本应用",
    lead: "本指南侧重操作：易经、甲骨与底部选项面板。",
    bonesLabel: "甲骨",
    s1Heading: "1) 选择咨询模式",
    ichingLi: "卦象与爻辞解读。适合开放性问题与广泛反思。",
    bonesLi: "以裂纹图案进行的是／否解读。适合验证方向或具体决定。",
    s2Heading: "2) 使用选项面板",
    s2Li1: "在易经与甲骨之间切换。",
    s2Li2: "查看当前会话深度状态（您的方案在该聊天中允许的连续解读次数）。",
    s2Li3: "管理代币与套餐购买。",
    s2Li4: "管理可选双因素认证。",
    s2Li5: "面板底部有文档与法律链接。",
    s3Heading: "3) 结果与本地副本",
    s3Li1: "每次咨询可包含解读与图像。",
    s3Li2:
      "若要在应用外留存记录，可在选项中下载图像并将当前会话导出为 PDF；此为可选，文件保存在您的设备上。",
    s3Li3: "可在历史（聊天）中删除聊天。",
  },
  ko: {
    title: "퀵스타트: 앱 사용법",
    lead: "실용 중심: I Ching, 갑골, 하단 패널 옵션만 다룹니다.",
    bonesLabel: "갑골",
    s1Heading: "1) 상담 모드 선택",
    ichingLi: "괘와 효에 따른 해석. 열린 질문과 넓은 성찰에 적합.",
    bonesLi: "균열 패턴의 예/아니오 해석. 방향이나 구체적 결정 검증에 적합.",
    s2Heading: "2) 옵션 패널 사용",
    s2Li1: "I Ching과 갑골을 전환합니다.",
    s2Li2: "활성 스레드 깊이(플랜이 해당 채팅에서 허용하는 연속 해석 횟수)를 확인합니다.",
    s2Li3: "토큰과 팩 구매를 관리합니다.",
    s2Li4: "선택적 2단계 인증을 관리합니다.",
    s2Li5: "패널 하단에 문서·법적 링크가 있습니다.",
    s3Heading: "3) 결과와 로컬 사본",
    s3Li1: "상담마다 해석+이미지가 포함될 수 있습니다.",
    s3Li2:
      "앱 밖 기록이 필요하면 옵션에서 이미지를 내려받고 현재 스레드를 PDF로보낼 수 있습니다. 선택 사항이며 파일은 기기에 저장됩니다.",
    s3Li3: "기록(채팅)에서 채팅을 삭제할 수 있습니다.",
  },
};

export function getQuickstartPageUiMessages(locale: AppLocale): QuickstartPageUiMessages {
  return QUICKSTART_PAGE_UI[locale] ?? QUICKSTART_PAGE_UI[DEFAULT_LOCALE];
}
