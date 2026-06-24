import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type AuditReportStatus = "closed" | "monitoring" | "ongoing";

export type AuditReportEntry = {
  id: string;
  date: string;
  title: string;
  /** Short public summary: source audited + outcome only. */
  summary: string;
  status: AuditReportStatus;
  statusLabel: string;
};

export type AuditsPageUiMessages = {
  title: string;
  lead: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  introHeading: string;
  introBody: string;
  oracleTextsHeading: string;
  oracleTextsBody: string;
  mutationRulesHeading: string;
  mutationRulesIntro: string;
  mutationRulesHuangHeading: string;
  mutationRulesHuangBody: string;
  mutationRulesZhuxiHeading: string;
  mutationRulesZhuxiBody: string;
  reportsHeading: string;
  reports: AuditReportEntry[];
  seeAlsoNotes: string;
};

const REPORTS_EN: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 Jun 2026",
    title: "Library: classical commentary and accordion UI",
    summary:
      "Feature release: optional classical commentary (Wilhelm and Legge) in the Hexagram Library, shown as an expandable \"+\" next to the Judgment, the Image, and each line. Result: pass. Library-only, never sent to the AI during a consultation.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 Jun 2026",
    title: "Oracle texts: Wilhelm, Legge and Zhou Yi",
    summary:
      "Audited against Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882), and the Zhou Yi (Chinese Text Project). Result: pass. All oracle fields verified.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 Jun 2026",
    title: "Changing lines: Alfred Huang",
    summary:
      "Audited against The Complete I Ching (10th Anniversary Edition, Taoist Master Alfred Huang, 2010). Result: pass. Published changing-line rules verified.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 Jun 2026",
    title: "Changing lines: Zhu Xi (Adler translation)",
    summary:
      "Audited against Zhu Xi, Yixue Qimeng ch. IV (Joseph Adler translation, Bilingual Texts in Chinese History). Result: pass. Core changing-line rules verified.",
    status: "closed",
    statusLabel: "Closed",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 Jun 2026",
    title: "Dual line-reading systems (Huang or Zhu Xi)",
    summary:
      "Feature release: user-selectable Huang or Zhu Xi changing-line reading. Result: pass. Both systems available in the app.",
    status: "closed",
    statusLabel: "Closed",
  },
];

const REPORTS_ES: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 jun 2026",
    title: "Biblioteca: comentario clásico e interfaz de acordeón",
    summary:
      "Lanzamiento de funcionalidad: comentario clásico opcional (Wilhelm y Legge) en la Biblioteca de hexagramas, mostrado como un \"+\" desplegable junto al Juicio, la Imagen y cada línea. Resultado: aprobado. Solo en la Biblioteca, nunca se envía a la IA durante una consulta.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 jun 2026",
    title: "Textos del oráculo: Wilhelm, Legge y Zhou Yi",
    summary:
      "Auditado contra Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882) y el Zhou Yi (Chinese Text Project). Resultado: aprobado. Todos los campos del oráculo verificados.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Líneas cambiantes: Alfred Huang",
    summary:
      "Auditado contra The Complete I Ching (10th Anniversary Edition, Taoist Master Alfred Huang, 2010). Resultado: aprobado. Reglas publicadas de líneas cambiantes verificadas.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Líneas cambiantes: Zhu Xi (traducción Adler)",
    summary:
      "Auditado contra Zhu Xi, Yixue Qimeng cap. IV (traducción de Joseph Adler, Bilingual Texts in Chinese History). Resultado: aprobado. Reglas núcleo de líneas cambiantes verificadas.",
    status: "closed",
    statusLabel: "Cerrada",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 jun 2026",
    title: "Dos sistemas de lectura (Huang o Zhu Xi)",
    summary:
      "Lanzamiento de función: lectura Huang o Zhu Xi seleccionable por el usuario. Resultado: aprobado. Ambos sistemas disponibles en la app.",
    status: "closed",
    statusLabel: "Cerrada",
  },
];

const REPORTS_PT: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 jun 2026",
    title: "Biblioteca: comentário clássico e interface em acordeão",
    summary:
      "Lançamento de funcionalidade: comentário clássico opcional (Wilhelm e Legge) na Biblioteca de hexagramas, mostrado como um \"+\" expansível junto ao Julgamento, à Imagem e a cada linha. Resultado: aprovado. Apenas na Biblioteca, nunca enviado à IA durante uma consulta.",
    status: "closed",
    statusLabel: "Encerrada",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 jun 2026",
    title: "Textos do oráculo: Wilhelm, Legge e Zhou Yi",
    summary:
      "Auditado contra Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882) e o Zhou Yi (Chinese Text Project). Resultado: aprovado. Todos os campos do oráculo verificados.",
    status: "closed",
    statusLabel: "Encerrada",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Linhas mutantes: Alfred Huang",
    summary:
      "Auditado contra The Complete I Ching (10th Anniversary Edition, Taoist Master Alfred Huang, 2010). Resultado: aprovado. Regras publicadas de linhas mutantes verificadas.",
    status: "closed",
    statusLabel: "Encerrada",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 jun 2026",
    title: "Linhas mutantes: Zhu Xi (tradução Adler)",
    summary:
      "Auditado contra Zhu Xi, Yixue Qimeng cap. IV (tradução de Joseph Adler, Bilingual Texts in Chinese History). Resultado: aprovado. Regras-núcleo de linhas mutantes verificadas.",
    status: "closed",
    statusLabel: "Encerrada",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 jun 2026",
    title: "Dois sistemas de leitura (Huang ou Zhu Xi)",
    summary:
      "Lançamento de funcionalidade: leitura Huang ou Zhu Xi selecionável pelo utilizador. Resultado: aprovado. Ambos os sistemas disponíveis na app.",
    status: "closed",
    statusLabel: "Encerrada",
  },
];

const REPORTS_FR: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 juin 2026",
    title: "Bibliothèque : commentaire classique et interface en accordéon",
    summary:
      "Sortie de fonctionnalité : commentaire classique optionnel (Wilhelm et Legge) dans la Bibliothèque des hexagrammes, affiché comme un \"+\" dépliable près du Jugement, de l'Image et de chaque trait. Résultat : réussi. Réservé à la Bibliothèque, jamais envoyé à l'IA pendant une consultation.",
    status: "closed",
    statusLabel: "Clos",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 juin 2026",
    title: "Textes de l'oracle : Wilhelm, Legge et Zhou Yi",
    summary:
      "Audité par rapport à Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882) et le Zhou Yi (Chinese Text Project). Résultat : réussi. Tous les champs de l'oracle vérifiés.",
    status: "closed",
    statusLabel: "Clos",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 juin 2026",
    title: "Lignes changeantes : Alfred Huang",
    summary:
      "Audité par rapport à The Complete I Ching (10th Anniversary Edition, Taoist Master Alfred Huang, 2010). Résultat : réussi. Règles publiées de lignes changeantes vérifiées.",
    status: "closed",
    statusLabel: "Clos",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 juin 2026",
    title: "Lignes changeantes : Zhu Xi (traduction Adler)",
    summary:
      "Audité par rapport à Zhu Xi, Yixue Qimeng ch. IV (traduction de Joseph Adler, Bilingual Texts in Chinese History). Résultat : réussi. Règles fondamentales de lignes changeantes vérifiées.",
    status: "closed",
    statusLabel: "Clos",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 juin 2026",
    title: "Deux systèmes de lecture (Huang ou Zhu Xi)",
    summary:
      "Sortie de fonctionnalité : lecture Huang ou Zhu Xi sélectionnable par l'utilisateur. Résultat : réussi. Les deux systèmes sont disponibles dans l'app.",
    status: "closed",
    statusLabel: "Clos",
  },
];

const REPORTS_DE: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24. Juni 2026",
    title: "Bibliothek: klassischer Kommentar und Akkordeon-Oberfläche",
    summary:
      "Feature-Release: optionaler klassischer Kommentar (Wilhelm und Legge) in der Hexagramm-Bibliothek, gezeigt als aufklappbares \"+\" neben dem Urteil, dem Bild und jeder Linie. Ergebnis: bestanden. Nur in der Bibliothek, nie an die KI während einer Beratung gesendet.",
    status: "closed",
    statusLabel: "Abgeschlossen",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22. Juni 2026",
    title: "Orakeltexte: Wilhelm, Legge und Zhou Yi",
    summary:
      "Geprüft gegen Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882) und den Zhou Yi (Chinese Text Project). Ergebnis: bestanden. Alle Orakelfelder verifiziert.",
    status: "closed",
    statusLabel: "Abgeschlossen",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22. Juni 2026",
    title: "Wechselnde Linien: Alfred Huang",
    summary:
      "Geprüft gegen The Complete I Ching (10th Anniversary Edition, Taoist Master Alfred Huang, 2010). Ergebnis: bestanden. Veröffentlichte Regeln für wechselnde Linien verifiziert.",
    status: "closed",
    statusLabel: "Abgeschlossen",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22. Juni 2026",
    title: "Wechselnde Linien: Zhu Xi (Adler-Übersetzung)",
    summary:
      "Geprüft gegen Zhu Xi, Yixue Qimeng Kap. IV (Übersetzung von Joseph Adler, Bilingual Texts in Chinese History). Ergebnis: bestanden. Kernregeln für wechselnde Linien verifiziert.",
    status: "closed",
    statusLabel: "Abgeschlossen",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20. Juni 2026",
    title: "Zwei Lesesysteme (Huang oder Zhu Xi)",
    summary:
      "Feature-Release: vom Nutzer wählbare Huang- oder Zhu-Xi-Lesart wechselnder Linien. Ergebnis: bestanden. Beide Systeme in der App verfügbar.",
    status: "closed",
    statusLabel: "Abgeschlossen",
  },
];

const REPORTS_IT: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 giugno 2026",
    title: "Biblioteca: commento classico e interfaccia ad accordion",
    summary:
      "Rilascio funzionalità: commento classico opzionale (Wilhelm e Legge) nella Biblioteca degli esagrammi, mostrato come un \"+\" espandibile accanto al Giudizio, all'Immagine e a ciascuna linea. Risultato: superato. Solo nella Biblioteca, mai inviato all'IA durante una consultazione.",
    status: "closed",
    statusLabel: "Chiusa",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 giu 2026",
    title: "Testi dell'oracolo: Wilhelm, Legge e Zhou Yi",
    summary:
      "Verificato rispetto a Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882) e lo Zhou Yi (Chinese Text Project). Risultato: superato. Tutti i campi dell'oracolo verificati.",
    status: "closed",
    statusLabel: "Chiusa",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 giu 2026",
    title: "Linee mutanti: Alfred Huang",
    summary:
      "Verificato rispetto a The Complete I Ching (10th Anniversary Edition, Taoist Master Alfred Huang, 2010). Risultato: superato. Regole pubblicate delle linee mutanti verificate.",
    status: "closed",
    statusLabel: "Chiusa",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 giu 2026",
    title: "Linee mutanti: Zhu Xi (traduzione Adler)",
    summary:
      "Verificato rispetto a Zhu Xi, Yixue Qimeng cap. IV (traduzione di Joseph Adler, Bilingual Texts in Chinese History). Risultato: superato. Regole fondamentali delle linee mutanti verificate.",
    status: "closed",
    statusLabel: "Chiusa",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 giu 2026",
    title: "Due sistemi di lettura (Huang o Zhu Xi)",
    summary:
      "Rilascio funzionalità: lettura Huang o Zhu Xi selezionabile dall'utente. Risultato: superato. Entrambi i sistemi disponibili nell'app.",
    status: "closed",
    statusLabel: "Chiusa",
  },
];

const REPORTS_JA: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "2026年6月24日",
    title: "図書館：古典注釈とアコーディオンUI",
    summary:
      "機能リリース：易経図書館における任意の古典注釈（ヴィルヘルムとレッグ）。判断・象・各爻の横の展開可能な「+」で表示。結果：合格。図書館内のみで、相談中にAIへ送信されることはありません。",
    status: "closed",
    statusLabel: "完了",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "2026年6月22日",
    title: "神託文: Wilhelm、Legge、周易",
    summary:
      "Wilhelm/Baynes（Pantheon 1950）、James Legge（Sacred Books of the East XVI、1882）、周易（Chinese Text Project）と照合して検証。結果: 合格。すべての神託文フィールドを検証済み。",
    status: "closed",
    statusLabel: "完了",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "2026年6月22日",
    title: "変爻: アルフレッド・ホアン",
    summary:
      "The Complete I Ching（第10周年記念版、Taoist Master Alfred Huang、2010年）と照合して検証。結果: 合格。公開された変爻ルールを検証済み。",
    status: "closed",
    statusLabel: "完了",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "2026年6月22日",
    title: "変爻: 朱熹（アドラー訳）",
    summary:
      "朱熹『易学啓蒙』第4章（ジョセフ・アドラー訳、Bilingual Texts in Chinese History）と照合して検証。結果: 合格。中核となる変爻ルールを検証済み。",
    status: "closed",
    statusLabel: "完了",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "2026年6月20日",
    title: "2つの読み方体系（ホアンまたは朱熹）",
    summary:
      "機能リリース: ユーザーが選択可能なホアンまたは朱熹の変爻読み方。結果: 合格。両体系がアプリで利用可能。",
    status: "closed",
    statusLabel: "完了",
  },
];

const REPORTS_ZH: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "2026年6月24日",
    title: "图书馆：古典注释与折叠式界面",
    summary:
      "功能发布：易经图书馆中可选的古典注释（威廉与理雅各），以判断、象和每条爻旁可展开的「+」显示。结果：通过。仅限图书馆内，咨询过程中绝不会发送给AI。",
    status: "closed",
    statusLabel: "已结案",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "2026年6月22日",
    title: "神谕文本：卫礼贤、理雅各与周易",
    summary:
      "对照卫礼贤/贝恩斯（Pantheon 1950）、理雅各（Sacred Books of the East XVI，1882）与周易（Chinese Text Project）进行审计。结果：通过。所有神谕字段均已验证。",
    status: "closed",
    statusLabel: "已结案",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "2026年6月22日",
    title: "变爻：Alfred Huang",
    summary:
      "对照《The Complete I Ching》（十周年纪念版，Taoist Master Alfred Huang，2010年）进行审计。结果：通过。已公开的变爻规则均已验证。",
    status: "closed",
    statusLabel: "已结案",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "2026年6月22日",
    title: "变爻：朱熹（Adler 译本）",
    summary:
      "对照朱熹《易学启蒙》第四章（Joseph Adler 译，Bilingual Texts in Chinese History）进行审计。结果：通过。核心变爻规则均已验证。",
    status: "closed",
    statusLabel: "已结案",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "2026年6月20日",
    title: "双重读法体系（黄忠天或朱熹）",
    summary:
      "功能发布：用户可选择黄忠天或朱熹变爻读法。结果：通过。两种体系均已在应用中提供。",
    status: "closed",
    statusLabel: "已结案",
  },
];

const REPORTS_KO: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "2026년 6월 24일",
    title: "도서관: 고전 주석 및 아코디언 UI",
    summary:
      "기능 출시: 괘사, 상, 각 효 옆에 펼칠 수 있는 \"+\"로 표시되는 헥사그램 도서관의 선택적 고전 주석(빌헬름과 레그). 결과: 통과. 도서관 전용이며 상담 중 AI로 전송되지 않습니다.",
    status: "closed",
    statusLabel: "종료",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "2026년 6월 22일",
    title: "신탁문: Wilhelm, Legge, 주역",
    summary:
      "Wilhelm/Baynes(Pantheon 1950), James Legge(Sacred Books of the East XVI, 1882), 주역(Chinese Text Project)과 대조하여 감사. 결과: 통과. 모든 신탁문 필드 검증 완료.",
    status: "closed",
    statusLabel: "종료",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "2026년 6월 22일",
    title: "변효: Alfred Huang",
    summary:
      "The Complete I Ching(10주년 기념판, Taoist Master Alfred Huang, 2010년)과 대조하여 감사. 결과: 통과. 공개된 변효 규칙 검증 완료.",
    status: "closed",
    statusLabel: "종료",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "2026년 6월 22일",
    title: "변효: 주희(Adler 번역본)",
    summary:
      "주희 역학계몽 제4장(Joseph Adler 번역, Bilingual Texts in Chinese History)과 대조하여 감사. 결과: 통과. 핵심 변효 규칙 검증 완료.",
    status: "closed",
    statusLabel: "종료",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "2026년 6월 20일",
    title: "이중 변효 읽기 체계(Huang 또는 주희)",
    summary:
      "기능 출시: 사용자가 선택 가능한 Huang 또는 주희 변효 읽기. 결과: 통과. 두 체계 모두 앱에서 사용 가능.",
    status: "closed",
    statusLabel: "종료",
  },
];

const REPORTS_AR: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 يونيو 2026",
    title: "المكتبة: تعليق كلاسيكي وواجهة أكورديون",
    summary:
      "إصدار ميزة: تعليق كلاسيكي اختياري (ويلهلم وليج) في مكتبة الهكساغرامات، يظهر كعلامة \"+\" قابلة للتوسيع بجانب الحكم والصورة وكل خط. النتيجة: نجاح. خاص بالمكتبة فقط، ولا يُرسل إلى الذكاء الاصطناعي أثناء الاستشارة.",
    status: "closed",
    statusLabel: "مغلقة",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 يونيو 2026",
    title: "نصوص الأوراكل: Wilhelm وLegge وZhou Yi",
    summary:
      "تم التدقيق مقابل Wilhelm/Baynes (Pantheon 1950) وJames Legge (Sacred Books of the East XVI، 1882) وZhou Yi (Chinese Text Project). النتيجة: نجاح. تم التحقق من جميع حقول الأوراكل.",
    status: "closed",
    statusLabel: "مغلقة",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 يونيو 2026",
    title: "الخطوط المتغيرة: Alfred Huang",
    summary:
      "تم التدقيق مقابل The Complete I Ching (إصدار الذكرى العاشرة، Taoist Master Alfred Huang، 2010). النتيجة: نجاح. تم التحقق من قواعد الخطوط المتغيرة المنشورة.",
    status: "closed",
    statusLabel: "مغلقة",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 يونيو 2026",
    title: "الخطوط المتغيرة: Zhu Xi (ترجمة Adler)",
    summary:
      "تم التدقيق مقابل Zhu Xi، Yixue Qimeng الفصل الرابع (ترجمة Joseph Adler، Bilingual Texts in Chinese History). النتيجة: نجاح. تم التحقق من القواعد الأساسية للخطوط المتغيرة.",
    status: "closed",
    statusLabel: "مغلقة",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 يونيو 2026",
    title: "نظاما قراءة مزدوجان (Huang أو Zhu Xi)",
    summary:
      "إصدار ميزة: قراءة خطوط متغيرة قابلة للاختيار من المستخدم بين Huang وZhu Xi. النتيجة: نجاح. كلا النظامين متاحان في التطبيق.",
    status: "closed",
    statusLabel: "مغلقة",
  },
];

const REPORTS_HI: AuditReportEntry[] = [
  {
    id: "library-commentary-2026-06-24",
    date: "24 जून 2026",
    title: "लाइब्रेरी: शास्त्रीय टिप्पणी और अकॉर्डियन UI",
    summary:
      "फ़ीचर रिलीज़: हेक्साग्राम लाइब्रेरी में वैकल्पिक शास्त्रीय टिप्पणी (विल्हेम और लेग), जो निर्णय, छवि और हर रेखा के पास विस्तार योग्य \"+\" के रूप में दिखती है। परिणाम: उत्तीर्ण। केवल लाइब्रेरी के लिए, परामर्श के दौरान कभी AI को नहीं भेजी जाती।",
    status: "closed",
    statusLabel: "बंद",
  },
  {
    id: "translator-pdf-gold-2026-06-22",
    date: "22 जून 2026",
    title: "Oracle पाठ: Wilhelm, Legge और Zhou Yi",
    summary:
      "Wilhelm/Baynes (Pantheon 1950), James Legge (Sacred Books of the East XVI, 1882), और Zhou Yi (Chinese Text Project) के विरुद्ध ऑडिट किया गया। परिणाम: पास। सभी Oracle फ़ील्ड सत्यापित।",
    status: "closed",
    statusLabel: "बंद",
  },
  {
    id: "huang-book-mutation-2026-06-22",
    date: "22 जून 2026",
    title: "बदलती रेखाएँ: Alfred Huang",
    summary:
      "The Complete I Ching (10वीं वर्षगांठ संस्करण, Taoist Master Alfred Huang, 2010) के विरुद्ध ऑडिट किया गया। परिणाम: पास। प्रकाशित बदलती-रेखा नियम सत्यापित।",
    status: "closed",
    statusLabel: "बंद",
  },
  {
    id: "zhuxi-adler-mutation-2026-06-22",
    date: "22 जून 2026",
    title: "बदलती रेखाएँ: Zhu Xi (Adler अनुवाद)",
    summary:
      "Zhu Xi, Yixue Qimeng अध्याय IV (Joseph Adler अनुवाद, Bilingual Texts in Chinese History) के विरुद्ध ऑडिट किया गया। परिणाम: पास। मूल बदलती-रेखा नियम सत्यापित।",
    status: "closed",
    statusLabel: "बंद",
  },
  {
    id: "line-reading-selector-2026-06-20",
    date: "20 जून 2026",
    title: "दोहरी पठन प्रणालियाँ (Huang या Zhu Xi)",
    summary:
      "फ़ीचर रिलीज़: उपयोगकर्ता द्वारा चयन योग्य Huang या Zhu Xi बदलती-रेखा पठन। परिणाम: पास। ऐप में दोनों प्रणालियाँ उपलब्ध।",
    status: "closed",
    statusLabel: "बंद",
  },
];

const EN_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Fidelity Audits",
  lead:
    "We verify oracle texts and changing-line rules against named classical editions. This page lists audit dates, sources, and outcomes.",
  lastUpdatedLabel: "Last updated",
  lastUpdated: "24 June 2026",
  introHeading: "What we publish here",
  introBody:
    "Each entry records when we audited, which edition or translation we used as reference, and whether the app passed. Detailed methodology and engineering reports are kept internally, not on this page.",
  oracleTextsHeading: "Oracle texts (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Last verified: 22 June 2026. Reference editions: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project). Result: pass.",
  mutationRulesHeading: "Changing-line reading rules",
  mutationRulesIntro:
    "The app offers two classical systems. Each is checked against its named source book.",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "Last verified: 22 June 2026. Reference: 10th Anniversary Edition (2010). Result: pass.",
  mutationRulesZhuxiHeading: "Zhu Xi: Yixue Qimeng (trans. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Last verified: 22 June 2026. Reference: ch. IV, Joseph Adler translation. Result: pass.",
  reportsHeading: "Audit log",
  seeAlsoNotes:
    "For historical context of the casting methods, see Method Notes. For how to use the app, see the User Guide.",
};

const ES_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Auditorías de fidelidad",
  lead:
    "Verificamos textos del oráculo y reglas de líneas cambiantes contra ediciones clásicas nombradas. Esta página lista fechas, fuentes y resultados.",
  lastUpdatedLabel: "Última actualización",
  lastUpdated: "24 de junio de 2026",
  introHeading: "Qué publicamos aquí",
  introBody:
    "Cada entrada indica cuándo auditamos, qué edición o traducción usamos como referencia y si la app aprobó. La metodología detallada y los informes de ingeniería son internos y no aparecen en esta página.",
  oracleTextsHeading: "Textos del oráculo (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Última verificación: 22 de junio de 2026. Ediciones de referencia: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project). Resultado: aprobado.",
  mutationRulesHeading: "Reglas de lectura de líneas cambiantes",
  mutationRulesIntro:
    "La app ofrece dos sistemas clásicos. Cada uno se contrasta con su libro fuente indicado.",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "Última verificación: 22 de junio de 2026. Referencia: edición 10.º aniversario (2010). Resultado: aprobado.",
  mutationRulesZhuxiHeading: "Zhu Xi: Yixue Qimeng (trad. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Última verificación: 22 de junio de 2026. Referencia: cap. IV, traducción de Joseph Adler. Resultado: aprobado.",
  reportsHeading: "Registro de auditorías",
  seeAlsoNotes:
    "Para contexto histórico de los métodos de tirada, ver Notas de métodos. Para uso de la app, ver la Guía de uso.",
};

const PT_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Auditorias de fidelidade",
  lead:
    "Verificamos os textos do oráculo e as regras de linhas mutantes contra edições clássicas nomeadas. Esta página lista datas de auditoria, fontes e resultados.",
  lastUpdatedLabel: "Última atualização",
  lastUpdated: "24 de junho de 2026",
  introHeading: "O que publicamos aqui",
  introBody:
    "Cada entrada indica quando auditámos, qual edição ou tradução usámos como referência e se a app passou. A metodologia detalhada e os relatórios de engenharia são internos e não aparecem nesta página.",
  oracleTextsHeading: "Textos do oráculo (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Última verificação: 22 de junho de 2026. Edições de referência: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project). Resultado: aprovado.",
  mutationRulesHeading: "Regras de leitura de linhas mutantes",
  mutationRulesIntro:
    "A app oferece dois sistemas clássicos. Cada um é verificado contra o seu livro-fonte indicado.",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "Última verificação: 22 de junho de 2026. Referência: edição do 10.º aniversário (2010). Resultado: aprovado.",
  mutationRulesZhuxiHeading: "Zhu Xi: Yixue Qimeng (trad. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Última verificação: 22 de junho de 2026. Referência: cap. IV, tradução de Joseph Adler. Resultado: aprovado.",
  reportsHeading: "Registo de auditorias",
  seeAlsoNotes:
    "Para o contexto histórico dos métodos de tiragem, ver Notas de método. Para saber como usar a app, ver o Guia do utilizador.",
};

const FR_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Audits de fidélité",
  lead:
    "Nous vérifions les textes de l'oracle et les règles de lignes changeantes par rapport à des éditions classiques nommées. Cette page liste les dates d'audit, les sources et les résultats.",
  lastUpdatedLabel: "Dernière mise à jour",
  lastUpdated: "24 juin 2026",
  introHeading: "Ce que nous publions ici",
  introBody:
    "Chaque entrée indique quand nous avons audité, quelle édition ou traduction nous avons utilisée comme référence, et si l'app a réussi. La méthodologie détaillée et les rapports d'ingénierie restent internes, pas sur cette page.",
  oracleTextsHeading: "Textes de l'oracle (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Dernière vérification : 22 juin 2026. Éditions de référence : Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project). Résultat : réussi.",
  mutationRulesHeading: "Règles de lecture des lignes changeantes",
  mutationRulesIntro:
    "L'app propose deux systèmes classiques. Chacun est vérifié par rapport à son livre source nommé.",
  mutationRulesHuangHeading: "Alfred Huang : The Complete I Ching",
  mutationRulesHuangBody:
    "Dernière vérification : 22 juin 2026. Référence : édition du 10e anniversaire (2010). Résultat : réussi.",
  mutationRulesZhuxiHeading: "Zhu Xi : Yixue Qimeng (trad. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Dernière vérification : 22 juin 2026. Référence : ch. IV, traduction de Joseph Adler. Résultat : réussi.",
  reportsHeading: "Journal des audits",
  seeAlsoNotes:
    "Pour le contexte historique des méthodes de tirage, voir les Notes sur les méthodes. Pour savoir comment utiliser l'app, voir le Guide de l'utilisateur.",
};

const DE_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Fidelitätsprüfungen",
  lead:
    "Wir prüfen Orakeltexte und Regeln für wechselnde Linien gegen namentlich genannte klassische Ausgaben. Diese Seite listet Prüfdaten, Quellen und Ergebnisse auf.",
  lastUpdatedLabel: "Zuletzt aktualisiert",
  lastUpdated: "24. Juni 2026",
  introHeading: "Was wir hier veröffentlichen",
  introBody:
    "Jeder Eintrag zeigt, wann wir geprüft haben, welche Ausgabe oder Übersetzung als Referenz diente und ob die App bestanden hat. Detaillierte Methodik und technische Berichte bleiben intern und erscheinen nicht auf dieser Seite.",
  oracleTextsHeading: "Orakeltexte (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Zuletzt geprüft: 22. Juni 2026. Referenzausgaben: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project). Ergebnis: bestanden.",
  mutationRulesHeading: "Regeln zum Lesen wechselnder Linien",
  mutationRulesIntro:
    "Die App bietet zwei klassische Systeme an. Jedes wird gegen sein benanntes Quellbuch geprüft.",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "Zuletzt geprüft: 22. Juni 2026. Referenz: 10th Anniversary Edition (2010). Ergebnis: bestanden.",
  mutationRulesZhuxiHeading: "Zhu Xi: Yixue Qimeng (Übers. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Zuletzt geprüft: 22. Juni 2026. Referenz: Kap. IV, Übersetzung von Joseph Adler. Ergebnis: bestanden.",
  reportsHeading: "Prüfprotokoll",
  seeAlsoNotes:
    "Für den historischen Kontext der Orakelmethoden siehe die Methodenhinweise. Für die Nutzung der App siehe den Benutzerleitfaden.",
};

const IT_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "Audit di fedeltà",
  lead:
    "Verifichiamo i testi dell'oracolo e le regole delle linee mutanti rispetto a edizioni classiche nominate. Questa pagina elenca date di audit, fonti e risultati.",
  lastUpdatedLabel: "Ultimo aggiornamento",
  lastUpdated: "24 giugno 2026",
  introHeading: "Cosa pubblichiamo qui",
  introBody:
    "Ogni voce indica quando abbiamo eseguito l'audit, quale edizione o traduzione abbiamo usato come riferimento e se l'app ha superato il test. La metodologia detagliata e i rapporti di ingegneria restano interni, non in questa pagina.",
  oracleTextsHeading: "Testi dell'oracolo (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "Ultima verifica: 22 giugno 2026. Edizioni di riferimento: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project). Risultato: superato.",
  mutationRulesHeading: "Regole di lettura delle linee mutanti",
  mutationRulesIntro:
    "L'app offre due sistemi classici. Ciascuno è verificato rispetto al proprio libro fonte indicato.",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "Ultima verifica: 22 giugno 2026. Riferimento: edizione del 10º anniversario (2010). Risultato: superato.",
  mutationRulesZhuxiHeading: "Zhu Xi: Yixue Qimeng (trad. Joseph Adler)",
  mutationRulesZhuxiBody:
    "Ultima verifica: 22 giugno 2026. Riferimento: cap. IV, traduzione di Joseph Adler. Risultato: superato.",
  reportsHeading: "Registro audit",
  seeAlsoNotes:
    "Per il contesto storico dei metodi di consultazione, vedi le Note sui metodi. Per come usare l'app, vedi la Guida utente.",
};

const JA_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "忠実度監査",
  lead:
    "神託文と変爻ルールを、明示された古典版と照合して検証します。このページには監査日、出典、結果を記載します。",
  lastUpdatedLabel: "最終更新",
  lastUpdated: "2026年6月24日",
  introHeading: "ここに掲載する内容",
  introBody:
    "各項目には、監査を実施した日時、参照に使用した版または訳、アプリが合格したかどうかを記載します。詳細な方法論とエンジニアリングレポートは社内で保管し、このページには掲載しません。",
  oracleTextsHeading: "神託文（Wilhelm、Legge、周易）",
  oracleTextsBody:
    "最終検証: 2026年6月22日。参照版: Wilhelm/Baynes（Pantheon 1950）、James Legge（SBE XVI、1882）、周易（Chinese Text Project）。結果: 合格。",
  mutationRulesHeading: "変爻の読み方ルール",
  mutationRulesIntro:
    "アプリは2つの古典的な体系を提供します。それぞれが指定された原典と照合されます。",
  mutationRulesHuangHeading: "アルフレッド・ホアン: The Complete I Ching",
  mutationRulesHuangBody:
    "最終検証: 2026年6月22日。参照: 第10周年記念版（2010年）。結果: 合格。",
  mutationRulesZhuxiHeading: "朱熹: 易学啓蒙（訳: ジョセフ・アドラー）",
  mutationRulesZhuxiBody:
    "最終検証: 2026年6月22日。参照: 第4章、ジョセフ・アドラー訳。結果: 合格。",
  reportsHeading: "監査ログ",
  seeAlsoNotes:
    "占法の歴史的背景については方法ノートを参照してください。アプリの使い方についてはユーザーガイドを参照してください。",
};

const ZH_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "保真审计",
  lead:
    "我们将神谕文本和变爻规则与指定的经典版本进行核对。本页列出审计日期、来源和结果。",
  lastUpdatedLabel: "最后更新",
  lastUpdated: "2026年6月24日",
  introHeading: "本页发布内容",
  introBody:
    "每条记录显示我们何时进行审计、使用哪个版本或译本作为参照，以及应用是否通过。详细方法论和工程报告仅供内部使用，不在本页公开。",
  oracleTextsHeading: "神谕文本（卫礼贤、理雅各、周易）",
  oracleTextsBody:
    "最近一次验证：2026年6月22日。参照版本：卫礼贤/贝恩斯（Pantheon 1950）、理雅各（SBE XVI，1882）、周易（Chinese Text Project）。结果：通过。",
  mutationRulesHeading: "变爻阅读规则",
  mutationRulesIntro:
    "应用提供两种经典体系，每种均对照其指定的原始文献进行核对。",
  mutationRulesHuangHeading: "黄忠天（Alfred Huang）：《The Complete I Ching》",
  mutationRulesHuangBody:
    "最近一次验证：2026年6月22日。参照：十周年纪念版（2010年）。结果：通过。",
  mutationRulesZhuxiHeading: "朱熹：《易学启蒙》（Joseph Adler 译）",
  mutationRulesZhuxiBody:
    "最近一次验证：2026年6月22日。参照：第四章，Joseph Adler 译本。结果：通过。",
  reportsHeading: "审计记录",
  seeAlsoNotes: "占法的历史背景请参见方法说明。应用使用方法请参见用户指南。",
};

const KO_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "충실도 감사",
  lead:
    "신탁문과 변효 규칙을 명시된 고전판과 대조하여 검증합니다. 이 페이지에는 감사 날짜, 출처, 결과가 나열됩니다.",
  lastUpdatedLabel: "최종 업데이트",
  lastUpdated: "2026년 6월 24일",
  introHeading: "여기에 게시하는 내용",
  introBody:
    "각 항목은 감사 시점, 참조로 사용한 판본이나 번역본, 앱의 통과 여부를 기록합니다. 상세 방법론과 엔지니어링 보고서는 내부적으로만 보관하며 이 페이지에는 게시하지 않습니다.",
  oracleTextsHeading: "신탁문(Wilhelm, Legge, 주역)",
  oracleTextsBody:
    "최종 검증: 2026년 6월 22일. 참조 판본: Wilhelm/Baynes(Pantheon 1950), James Legge(SBE XVI, 1882), 주역(Chinese Text Project). 결과: 통과.",
  mutationRulesHeading: "변효 읽기 규칙",
  mutationRulesIntro:
    "앱은 두 가지 고전 체계를 제공합니다. 각각 지정된 원전과 대조하여 검증합니다.",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "최종 검증: 2026년 6월 22일. 참조: 10주년 기념판(2010년). 결과: 통과.",
  mutationRulesZhuxiHeading: "주희: 역학계몽(번역 Joseph Adler)",
  mutationRulesZhuxiBody:
    "최종 검증: 2026년 6월 22일. 참조: 제4장, Joseph Adler 번역본. 결과: 통과.",
  reportsHeading: "감사 로그",
  seeAlsoNotes:
    "점법의 역사적 배경은 방법 노트를 참조하세요. 앱 사용법은 사용자 가이드를 참조하세요.",
};

const AR_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "تدقيقات المطابقة",
  lead:
    "نتحقق من نصوص العرافة وقواعد الخطوط المتغيرة مقابل إصدارات كلاسيكية محددة بالاسم. تسرد هذه الصفحة تواريخ التدقيق والمصادر والنتائج.",
  lastUpdatedLabel: "آخر تحديث",
  lastUpdated: "24 يونيو 2026",
  introHeading: "ما ننشره هنا",
  introBody:
    "يسجل كل إدخال وقت التدقيق، والإصدار أو الترجمة التي استخدمناها كمرجع، وما إذا نجح التطبيق. تبقى المنهجية التفصيلية وتقارير الهندسة داخلية، ولا تُنشر في هذه الصفحة.",
  oracleTextsHeading: "نصوص الأوراكل (Wilhelm، Legge، Zhou Yi)",
  oracleTextsBody:
    "آخر تحقق: 22 يونيو 2026. الإصدارات المرجعية: Wilhelm/Baynes (Pantheon 1950)، James Legge (SBE XVI، 1882)، Zhou Yi (Chinese Text Project). النتيجة: نجاح.",
  mutationRulesHeading: "قواعد قراءة الخطوط المتغيرة",
  mutationRulesIntro:
    "يقدم التطبيق نظامين كلاسيكيين. يتم التحقق من كل منهما مقابل كتابه المرجعي المحدد.",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "آخر تحقق: 22 يونيو 2026. المرجع: إصدار الذكرى العاشرة (2010). النتيجة: نجاح.",
  mutationRulesZhuxiHeading: "Zhu Xi: Yixue Qimeng (ترجمة Joseph Adler)",
  mutationRulesZhuxiBody:
    "آخر تحقق: 22 يونيو 2026. المرجع: الفصل الرابع، ترجمة Joseph Adler. النتيجة: نجاح.",
  reportsHeading: "سجل التدقيق",
  seeAlsoNotes:
    "للسياق التاريخي لطرق العرافة، راجع ملاحظات المنهج. لمعرفة كيفية استخدام التطبيق، راجع دليل المستخدم.",
};

const HI_BASE: Omit<AuditsPageUiMessages, "reports"> = {
  title: "निष्ठा ऑडिट",
  lead:
    "हम Oracle पाठ और बदलती रेखाओं के नियमों को नामित शास्त्रीय संस्करणों के विरुद्ध सत्यापित करते हैं। इस पृष्ठ पर ऑडिट तिथियाँ, स्रोत और परिणाम सूचीबद्ध हैं।",
  lastUpdatedLabel: "अंतिम अपडेट",
  lastUpdated: "24 जून 2026",
  introHeading: "हम यहाँ क्या प्रकाशित करते हैं",
  introBody:
    "प्रत्येक प्रविष्टि यह दर्शाती है कि हमने कब ऑडिट किया, किस संस्करण या अनुवाद को संदर्भ के रूप में उपयोग किया, और ऐप पास हुआ या नहीं। विस्तृत पद्धति और इंजीनियरिंग रिपोर्ट आंतरिक रूप से रखी जाती हैं, इस पृष्ठ पर नहीं।",
  oracleTextsHeading: "Oracle पाठ (Wilhelm, Legge, Zhou Yi)",
  oracleTextsBody:
    "अंतिम सत्यापन: 22 जून 2026। संदर्भ संस्करण: Wilhelm/Baynes (Pantheon 1950), James Legge (SBE XVI, 1882), Zhou Yi (Chinese Text Project)। परिणाम: पास।",
  mutationRulesHeading: "बदलती रेखाओं को पढ़ने के नियम",
  mutationRulesIntro:
    "ऐप दो शास्त्रीय प्रणालियाँ प्रदान करता है। प्रत्येक को उसकी नामित स्रोत पुस्तक के विरुद्ध जाँचा जाता है।",
  mutationRulesHuangHeading: "Alfred Huang: The Complete I Ching",
  mutationRulesHuangBody:
    "अंतिम सत्यापन: 22 जून 2026। संदर्भ: 10वीं वर्षगांठ संस्करण (2010)। परिणाम: पास।",
  mutationRulesZhuxiHeading: "Zhu Xi: Yixue Qimeng (अनुवाद Joseph Adler)",
  mutationRulesZhuxiBody:
    "अंतिम सत्यापन: 22 जून 2026। संदर्भ: अध्याय IV, Joseph Adler अनुवाद। परिणाम: पास।",
  reportsHeading: "ऑडिट लॉग",
  seeAlsoNotes:
    "तिरने की विधियों के ऐतिहासिक संदर्भ के लिए विधि नोट्स देखें। ऐप का उपयोग कैसे करें इसके लिए उपयोगकर्ता गाइड देखें।",
};

function withReports(
  base: Omit<AuditsPageUiMessages, "reports">,
  reports: AuditReportEntry[],
): AuditsPageUiMessages {
  return { ...base, reports };
}

const AUDITS_PAGE_UI: Record<AppLocale, AuditsPageUiMessages> = {
  en: withReports(EN_BASE, REPORTS_EN),
  es: withReports(ES_BASE, REPORTS_ES),
  pt: withReports(PT_BASE, REPORTS_PT),
  fr: withReports(FR_BASE, REPORTS_FR),
  de: withReports(DE_BASE, REPORTS_DE),
  it: withReports(IT_BASE, REPORTS_IT),
  ja: withReports(JA_BASE, REPORTS_JA),
  zh: withReports(ZH_BASE, REPORTS_ZH),
  ko: withReports(KO_BASE, REPORTS_KO),
  ar: withReports(AR_BASE, REPORTS_AR),
  hi: withReports(HI_BASE, REPORTS_HI),
};

export function getAuditsPageUiMessages(locale: AppLocale): AuditsPageUiMessages {
  return AUDITS_PAGE_UI[locale] ?? AUDITS_PAGE_UI[DEFAULT_LOCALE];
}
