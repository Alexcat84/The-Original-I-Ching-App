import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type NotesPageUiMessages = {
  title: string;
  lead: string;
  ichingHeading: string;
  ichingBody: string;
  bonesHeading: string;
  bonesBody: string;
  interpretHeading: string;
  interpretLi1: string;
  interpretLi2: string;
  interpretLi3: string;
  sourcesHeading: string;
};

const NOTES_PAGE_UI: Record<AppLocale, NotesPageUiMessages> = {
  es: {
    title: "Notas y origen de los métodos",
    lead: "Aquí se explica el fundamento de los métodos usados en la app. Esta página es técnica-cultural (no es guía de uso).",
    ichingHeading: "I Ching (Zhouyi 周易)",
    ichingBody:
      "El modo I Ching se inspira en la tradición de 64 hexagramas y lectura por líneas cambiantes. En la app se presenta de forma moderna para interpretación simbólica y reflexión personal.",
    bonesHeading: "Huesos de oráculo (甲骨)",
    bonesBody:
      "El modo Huesos toma como referencia la adivinación por grietas y lo adapta a un flujo digital de preguntas tipo sí/no.",
    interpretHeading: "Cómo interpretar estas lecturas",
    interpretLi1: "Como herramienta simbólica de enfoque y toma de perspectiva.",
    interpretLi2: "No como predicción literal garantizada.",
    interpretLi3: "Complementaria a juicio personal y asesoría profesional cuando aplique.",
    sourcesHeading: "Fuentes externas para profundizar",
  },
  en: {
    title: "Method notes and origins",
    lead: "This page explains the foundation of methods used in the app. It is technical-cultural context (not a usage guide).",
    ichingHeading: "I Ching (Zhouyi 周易)",
    ichingBody:
      "I Ching mode is inspired by the 64-hexagram tradition and changing-line reading. In the app, it is presented in a modern way for symbolic interpretation and personal reflection.",
    bonesHeading: "Oracle bones (甲骨)",
    bonesBody: "Bones mode references crack divination and adapts it into a digital yes/no consultation flow.",
    interpretHeading: "How to interpret these readings",
    interpretLi1: "As a symbolic tool for focus and perspective.",
    interpretLi2: "Not as guaranteed literal prediction.",
    interpretLi3: "Complementary to personal judgment and professional advice where applicable.",
    sourcesHeading: "External references for deeper study",
  },
  pt: {
    title: "Notas e origem dos métodos",
    lead: "Aqui se explica o fundamento dos métodos usados na app. Esta página é técnico-cultural (não é guia de uso).",
    ichingHeading: "I Ching (Zhouyi 周易)",
    ichingBody:
      "O modo I Ching inspira-se na tradição dos 64 hexagramas e leitura por linhas mutantes. Na app é apresentado de forma moderna para interpretação simbólica e reflexão pessoal.",
    bonesHeading: "Ossos de oráculo (甲骨)",
    bonesBody:
      "O modo Ossos referencia a adivinhação por fendas e adapta-a a um fluxo digital de perguntas sim/não.",
    interpretHeading: "Como interpretar estas leituras",
    interpretLi1: "Como ferramenta simbólica de foco e perspetiva.",
    interpretLi2: "Não como previsão literal garantida.",
    interpretLi3: "Complementar ao juízo pessoal e aconselhamento profissional quando aplicável.",
    sourcesHeading: "Fontes externas para aprofundar",
  },
  fr: {
    title: "Notes et origine des méthodes",
    lead: "Cette page présente le fondement des méthodes utilisées dans l’app. Elle est de nature technique et culturelle (pas un guide d’utilisation).",
    ichingHeading: "I Ching (Zhouyi 周易)",
    ichingBody:
      "Le mode I Ching s’inspire de la tradition des 64 hexagrammes et de la lecture des traits mobiles. Dans l’app, il est présenté de façon moderne pour une interprétation symbolique et une réflexion personnelle.",
    bonesHeading: "Os d’oracle (甲骨)",
    bonesBody:
      "Le mode Os s’appuie sur la divination par fissures et l’adapte à un flux numérique de questions oui/non.",
    interpretHeading: "Comment interpréter ces lectures",
    interpretLi1: "Comme outil symbolique de mise au point et de perspective.",
    interpretLi2: "Pas comme prédiction littérale garantie.",
    interpretLi3: "Complément du jugement personnel et des conseils professionnels le cas échéant.",
    sourcesHeading: "Références externes pour aller plus loin",
  },
  de: {
    title: "Hinweise und Ursprung der Methoden",
    lead: "Hier wird die Grundlage der in der App genutzten Methoden erklärt. Diese Seite ist technisch-kulturell (keine Nutzungsanleitung).",
    ichingHeading: "I Ging (Zhouyi 周易)",
    ichingBody:
      "Der I-Ging-Modus orientiert sich an der Tradition der 64 Hexagramme und der Lesung wechselnder Linien. In der App wird er modern präsentiert für symbolische Deutung und persönliche Reflexion.",
    bonesHeading: "Orakelknochen (甲骨)",
    bonesBody:
      "Der Knochen-Modus bezieht sich auf Riss-Orakel und wandelt es in einen digitalen Ja/Nein-Ablauf um.",
    interpretHeading: "Wie man diese Lesungen versteht",
    interpretLi1: "Als symbolisches Werkzeug für Fokus und Perspektive.",
    interpretLi2: "Nicht als garantierte wörtliche Vorhersage.",
    interpretLi3: "Ergänzend zu eigenem Urteil und professioneller Beratung wo zutreffend.",
    sourcesHeading: "Externe Quellen zum Vertiefen",
  },
  it: {
    title: "Note e origine dei metodi",
    lead: "Qui si spiega il fondamento dei metodi usati nell’app. Questa pagina è tecnico-culturale (non è una guida d’uso).",
    ichingHeading: "I Ching (Zhouyi 周易)",
    ichingBody:
      "La modalità I Ching si ispira alla tradizione dei 64 esagrammi e alla lettura delle linee mutanti. Nell’app è presentata in forma moderna per interpretazione simbolica e riflessione personale.",
    bonesHeading: "Ossa oracolari (甲骨)",
    bonesBody:
      "La modalità Ossa richiama la divinazione per crepe e la adatta a un flusso digitale di domande sì/no.",
    interpretHeading: "Come interpretare queste letture",
    interpretLi1: "Come strumento simbolico di focus e prospettiva.",
    interpretLi2: "Non come previsione letterale garantita.",
    interpretLi3: "Complementare al giudizio personale e alla consulenza professionale ove applicabile.",
    sourcesHeading: "Fonti esterne per approfondire",
  },
  ja: {
    title: "方法の注記と由来",
    lead: "本ページではアプリで用いる方法の根拠を説明します。技術・文化的な背景の説明であり、利用手順のガイドではありません。",
    ichingHeading: "易経（I Ching, Zhouyi 周易）",
    ichingBody:
      "易経モードは64卦と変爻の読みの伝統に着想を得ています。アプリでは象徴的解釈と個人的内省のために現代的に提示されます。",
    bonesHeading: "甲骨（甲骨）",
    bonesBody:
      "甲骨モードは亀甲・獣骨の兆し占いを参照し、デジタル上のイエス／ノー形式の相談フローに適応しています。",
    interpretHeading: "これらの読みをどう捉えるか",
    interpretLi1: "焦点と視点のための象徴的ツールとして。",
    interpretLi2: "文字どおりの保証された予言としてではない。",
    interpretLi3: "個人の判断や必要に応じた専門的助言を補完するものとして。",
    sourcesHeading: "さらに学ぶための外部資料",
  },
  zh: {
    title: "方法说明与渊源",
    lead: "本页说明应用中方法的学理基础，属技术—文化背景介绍，并非操作教程。",
    ichingHeading: "易经（周易 Zhouyi）",
    ichingBody:
      "易经模式承自六十四卦与变爻占读传统，在应用中以现代方式呈现，用于象征性解读与个人反思。",
    bonesHeading: "甲骨占卜（甲骨）",
    bonesBody: "甲骨模式参考裂纹占卜，并适配为数字化的是否问答流程。",
    interpretHeading: "如何理解这些解读",
    interpretLi1: "作为聚焦与换位思考的象征性工具。",
    interpretLi2: "而非保证成真的字面预言。",
    interpretLi3: "作为个人判断与（如适用）专业建议的补充。",
    sourcesHeading: "延伸阅读（外部）",
  },
  ko: {
    title: "방법에 대한 노트와 유래",
    lead: "이 페이지는 앱에서 사용하는 방법의 토대를 설명합니다. 기술·문화적 맥락이며 사용 설명서가 아닙니다.",
    ichingHeading: "역경(I Ching, 주역 周易)",
    ichingBody:
      "역경 모드는 64괘와 변효(變爻) 읽기 전통에서 영감을 받았습니다. 앱에서는 상징적 해석과 개인적 성찰을 위해 현대적으로 제시됩니다.",
    bonesHeading: "갑골 점(甲骨)",
    bonesBody:
      "갑골 모드는 균열 점을 참고하여 디지털 예/아니오 상담 흐름으로 맞춥니다.",
    interpretHeading: "이 해석들을 어떻게 받아들일지",
    interpretLi1: "초점과 관점을 위한 상징적 도구로서.",
    interpretLi2: "보장된 문자 그대로의 예언이 아닙니다.",
    interpretLi3: "개인 판단 및 해당 시 전문 조언을 보완하는 것으로서.",
    sourcesHeading: "더 깊이 공부할 외부 자료",
  },
};

export function getNotesPageUiMessages(locale: AppLocale): NotesPageUiMessages {
  return NOTES_PAGE_UI[locale] ?? NOTES_PAGE_UI[DEFAULT_LOCALE];
}
