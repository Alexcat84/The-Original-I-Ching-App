import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type TermsPageMessages = {
  title: string;
  lead: string;
  lastUpdated: string;
  s1Title: string;
  s1Body: string;
  s2Title: string;
  s2Items: [string, string, string];
  s3Title: string;
  s3Items: [string, string, string];
  s4Title: string;
  s4Items: [string, string, string];
  s5Title: string;
  s5p1: string;
  s5p2: string;
  s6Title: string;
  s6Body: string;
  s7Title: string;
  s7Items: [string, string, string];
  s8Title: string;
  s8Body: string;
  s9Title: string;
  s9Body: string;
  s10Title: string;
  s10BeforeLink: string;
  s10AfterLink: string;
};

const TERMS_EN: TermsPageMessages = {
  title: "Terms of Service",
  lead: "These terms govern access to and use of The Original I Ching App. By using the service, you accept these terms.",
  lastUpdated: "Last updated: April 1, 2026.",
  s1Title: "1) Service nature",
  s1Body:
    "The platform provides symbolic consultations in I Ching and Bones modes with AI support. It is a personal reflection tool and does not replace professional medical, legal, financial, or psychological advice.",
  s2Title: "2) Eligibility and account",
  s2Items: [
    "You must use accurate account data and keep your access credentials confidential.",
    "You are responsible for activity performed from your account.",
    "We may suspend accounts for abuse, fraud, or material violations.",
  ],
  s3Title: "3) Token packs and payments",
  s3Items: [
    "The service uses consumable token packs plus a one-time initial free balance.",
    "There are no recurring charges or auto-renewals in the current model.",
    "Prices may be updated; any change will be reflected in current commercial information.",
  ],
  s4Title: "4) Acceptable use",
  s4Items: [
    "Do not use the service for unlawful, fraudulent, or harassing activities.",
    "Do not attempt unauthorized access to accounts, systems, or data.",
    "Do not automate abusive requests or evade technical or token limits.",
  ],
  s5Title: "5) User content",
  s5p1:
    "You retain ownership of your questions and content. You grant us a limited license to process and store it solely to operate, improve, and secure the service.",
  s5p2:
    "If you use PDF export or image download, you do so on your own initiative and at your sole discretion; those files are generated on your device and you are responsible for safeguarding them.",
  s6Title: "6) Availability and changes",
  s6Body:
    "We may update features, providers, or architecture to maintain quality, security, and performance. We do not guarantee uninterrupted availability.",
  s7Title: "7) Disclaimers and liability limits",
  s7Items: [
    "Readings are symbolic and interpretive in nature.",
    "We do not guarantee personal, financial, or health outcomes from use.",
    "To the maximum extent permitted by law, we limit liability for indirect or consequential damages.",
  ],
  s8Title: "8) Termination",
  s8Body:
    "You may stop using the service at any time. We may suspend or terminate access for violations, security risk, or legal requirements.",
  s9Title: "9) Governing law",
  s9Body:
    "These terms are interpreted under applicable law according to your jurisdiction and agreements with payment/platform providers.",
  s10Title: "10) Contact",
  s10BeforeLink:
    "For questions about these terms or privacy, use the official contact channels indicated on the site. Personal data processing is described in the ",
  s10AfterLink: ".",
};

const TERMS_ES: TermsPageMessages = {
  title: "Términos del Servicio",
  lead: "Estos términos regulan el acceso y uso de The Original I Ching App. Al usar el servicio, aceptas estos términos.",
  lastUpdated: "Última actualización: 1 de abril de 2026.",
  s1Title: "1) Naturaleza del servicio",
  s1Body:
    "La plataforma ofrece consultas simbólicas en modos I Ching y Huesos con apoyo de IA. Es una herramienta de reflexión personal y no sustituye asesoría profesional médica, legal, financiera o psicológica.",
  s2Title: "2) Elegibilidad y cuenta",
  s2Items: [
    "Debes usar datos de cuenta veraces y mantener la confidencialidad de acceso.",
    "Eres responsable de la actividad realizada desde tu cuenta.",
    "Podemos suspender cuentas por abuso, fraude o incumplimiento grave.",
  ],
  s3Title: "3) Packs de tokens y pagos",
  s3Items: [
    "El servicio usa packs de tokens consumibles y un saldo gratuito inicial único.",
    "No existen cobros recurrentes ni renovaciones automáticas en el modelo actual.",
    "Los precios pueden actualizarse; cualquier cambio se reflejará en la información comercial vigente.",
  ],
  s4Title: "4) Uso permitido",
  s4Items: [
    "No usar el servicio para actividades ilícitas, fraudulentas o de acoso.",
    "No intentar acceder de forma no autorizada a cuentas, sistemas o datos.",
    "No automatizar abuso de consultas ni evadir límites técnicos o de tokens.",
  ],
  s5Title: "5) Contenido del usuario",
  s5p1:
    "Mantienes titularidad sobre tus preguntas y contenido. Nos concedes una licencia limitada para procesarlo y almacenarlo exclusivamente para operar, mejorar y asegurar el servicio.",
  s5p2:
    "Si utilizas la exportación a PDF o la descarga de imagen, lo haces por tu cuenta y bajo tu propia discreción; esos archivos se generan en tu dispositivo y su custodia es responsabilidad tuya.",
  s6Title: "6) Disponibilidad y cambios",
  s6Body:
    "Podemos actualizar funciones, proveedores o arquitectura para mantener calidad, seguridad y rendimiento. No garantizamos disponibilidad ininterrumpida.",
  s7Title: "7) Descargos y límites de responsabilidad",
  s7Items: [
    "Las lecturas son de carácter simbólico e interpretativo.",
    "No garantizamos resultados personales, económicos o de salud derivados del uso.",
    "En la máxima medida permitida por ley, limitamos responsabilidad por daños indirectos o consecuentes.",
  ],
  s8Title: "8) Terminación",
  s8Body:
    "Puedes dejar de usar el servicio en cualquier momento. Podemos suspender o terminar acceso por incumplimientos, riesgo de seguridad o requerimiento legal.",
  s9Title: "9) Ley aplicable",
  s9Body:
    "Estos términos se interpretan conforme a la ley aplicable según tu jurisdicción y los acuerdos con proveedores de pago y plataforma.",
  s10Title: "10) Contacto",
  s10BeforeLink:
    "Para dudas sobre estos términos o sobre privacidad, utiliza los canales oficiales indicados en el sitio. El tratamiento de datos personales se describe en la ",
  s10AfterLink: ".",
};

const TERMS_BY_LOCALE: Record<AppLocale, TermsPageMessages> = {
  es: TERMS_ES,
  en: TERMS_EN,
  pt: {
    ...TERMS_EN,
    title: "Termos de Serviço",
    lead: "Estes termos regem o acesso e uso de The Original I Ching App. Ao usar o serviço, aceita estes termos.",
    lastUpdated: "Última atualização: 1 de abril de 2026.",
    s1Title: "1) Natureza do serviço",
    s1Body:
      "A plataforma oferece consultas simbólicas nos modos I Ching e Ossos com apoio de IA. É uma ferramenta de reflexão pessoal e não substitui aconselhamento médico, jurídico, financeiro ou psicológico profissional.",
    s2Title: "2) Elegibilidade e conta",
    s2Items: [
      "Deves usar dados de conta corretos e manter a confidencialidade das credenciais.",
      "És responsável pela atividade realizada a partir da tua conta.",
      "Podemos suspender contas por abuso, fraude ou violações materiais.",
    ],
    s3Title: "3) Pacotes de tokens e pagamentos",
    s3Items: [
      "O serviço usa pacotes de tokens consumíveis e um saldo gratuito inicial único.",
      "Não há cobranças recorrentes nem renovações automáticas no modelo atual.",
      "Os preços podem ser atualizados; qualquer alteração refletir-se-á na informação comercial vigente.",
    ],
    s4Title: "4) Uso permitido",
    s4Items: [
      "Não uses o serviço para atividades ilegais, fraudulentas ou de assédio.",
      "Não tentes aceder sem autorização a contas, sistemas ou dados.",
      "Não automatizes pedidos abusivos nem contornes limites técnicos ou de tokens.",
    ],
    s5Title: "5) Conteúdo do utilizador",
    s5p1:
      "Manténs a titularidade das tuas perguntas e conteúdo. Concedes-nos uma licença limitada para o processar e armazenar apenas para operar, melhorar e proteger o serviço.",
    s5p2:
      "Se usares exportação PDF ou descarga de imagem, fá-lo por tua iniciativa e discricionariedade; os ficheiros são gerados no teu dispositivo e a sua custódia é tua responsabilidade.",
    s6Title: "6) Disponibilidade e alterações",
    s6Body:
      "Podemos atualizar funcionalidades, fornecedores ou arquitetura para manter qualidade, segurança e desempenho. Não garantimos disponibilidade ininterrupta.",
    s7Title: "7) Exclusões e limites de responsabilidade",
    s7Items: [
      "As leituras são de natureza simbólica e interpretativa.",
      "Não garantimos resultados pessoais, financeiros ou de saúde derivados do uso.",
      "Na máxima extensão permitida por lei, limitamos a responsabilidade por danos indiretos ou consequenciais.",
    ],
    s8Title: "8) Rescisão",
    s8Body:
      "Podes deixar de usar o serviço a qualquer momento. Podemos suspender ou encerrar o acesso por violações, risco de segurança ou exigências legais.",
    s9Title: "9) Lei aplicável",
    s9Body:
      "Estes termos interpretam-se segundo a lei aplicável na tua jurisdição e acordos com fornecedores de pagamento e plataforma.",
    s10Title: "10) Contacto",
    s10BeforeLink:
      "Para questões sobre estes termos ou privacidade, usa os canais oficiais indicados no site. O tratamento de dados pessoais está descrito na ",
    s10AfterLink: ".",
  },
  fr: {
    ...TERMS_EN,
    title: "Conditions d’utilisation",
    lead: "Les présentes conditions régissent l’accès et l’utilisation de The Original I Ching App. En utilisant le service, vous les acceptez.",
    lastUpdated: "Dernière mise à jour : 1er avril 2026.",
    s1Title: "1) Nature du service",
    s1Body:
      "La plateforme propose des consultations symboliques en modes I Ching et Os avec assistance IA. C’est un outil de réflexion personnelle et ne remplace pas un conseil médical, juridique, financier ou psychologique professionnel.",
    s2Title: "2) Admissibilité et compte",
    s2Items: [
      "Vous devez fournir des informations de compte exactes et garder vos identifiants confidentiels.",
      "Vous êtes responsable de l’activité effectuée depuis votre compte.",
      "Nous pouvons suspendre les comptes en cas d’abus, de fraude ou de violation grave.",
    ],
    s3Title: "3) Packs de jetons et paiements",
    s3Items: [
      "Le service utilise des packs de jetons consommables et un solde gratuit initial unique.",
      "Il n’y a pas d’abonnement récurrent ni de renouvellement automatique dans le modèle actuel.",
      "Les prix peuvent être mis à jour ; tout changement sera reflété dans l’information commerciale en vigueur.",
    ],
    s4Title: "4) Usage acceptable",
    s4Items: [
      "N’utilisez pas le service à des fins illégales, frauduleuses ou harcelantes.",
      "N’essayez pas d’accéder sans autorisation à des comptes, systèmes ou données.",
      "N’automatisez pas d’abus ni ne contournez les limites techniques ou de jetons.",
    ],
    s5Title: "5) Contenu utilisateur",
    s5p1:
      "Vous conservez la propriété de vos questions et contenus. Vous nous accordez une licence limitée pour les traiter et les stocker uniquement pour exploiter, améliorer et sécuriser le service.",
    s5p2:
      "Si vous exportez en PDF ou téléchargez une image, vous le faites à votre initiative et à votre discrétion ; les fichiers sont générés sur votre appareil et vous en êtes responsable.",
    s6Title: "6) Disponibilité et changements",
    s6Body:
      "Nous pouvons mettre à jour fonctionnalités, prestataires ou architecture pour la qualité, la sécurité et les performances. Nous ne garantissons pas une disponibilité ininterrompue.",
    s7Title: "7) Avertissements et limites de responsabilité",
    s7Items: [
      "Les lectures sont de nature symbolique et interprétative.",
      "Nous ne garantissons aucun résultat personnel, financier ou sanitaire.",
      "Dans la mesure maximale permise par la loi, nous limitons la responsabilité pour dommages indirects ou consécutifs.",
    ],
    s8Title: "8) Résiliation",
    s8Body:
      "Vous pouvez cesser d’utiliser le service à tout moment. Nous pouvons suspendre ou résilier l’accès en cas de violation, risque de sécurité ou obligation légale.",
    s9Title: "9) Droit applicable",
    s9Body:
      "Ces conditions s’interprètent selon le droit applicable à votre juridiction et les accords avec les prestataires de paiement et de plateforme.",
    s10Title: "10) Contact",
    s10BeforeLink:
      "Pour toute question sur ces conditions ou la confidentialité, utilisez les canaux officiels du site. Le traitement des données personnelles est décrit dans la ",
    s10AfterLink: ".",
  },
  de: {
    ...TERMS_EN,
    title: "Nutzungsbedingungen",
    lead: "Diese Bedingungen regeln den Zugang zu und die Nutzung von The Original I Ching App. Mit der Nutzung akzeptieren Sie sie.",
    lastUpdated: "Zuletzt aktualisiert: 1. April 2026.",
    s1Title: "1) Art des Dienstes",
    s1Body:
      "Die Plattform bietet symbolische Beratungen in I-Ging- und Knochen-Modi mit KI-Unterstützung. Sie ist ein persönliches Reflexionswerkzeug und ersetzt keine professionelle medizinische, rechtliche, finanzielle oder psychologische Beratung.",
    s2Title: "2) Berechtigung und Konto",
    s2Items: [
      "Sie müssen korrekte Kontodaten nutzen und Zugangsdaten vertraulich behandeln.",
      "Sie sind für Aktivitäten von Ihrem Konto verantwortlich.",
      "Wir können Konten bei Missbrauch, Betrug oder erheblichen Verstößen sperren.",
    ],
    s3Title: "3) Token-Pakete und Zahlungen",
    s3Items: [
      "Der Dienst nutzt verbrauchbare Token-Pakete plus einmaliges anfängliches Gratis-Guthaben.",
      "Im aktuellen Modell gibt es keine Abonnements oder automatische Verlängerungen.",
      "Preise können sich ändern; Änderungen zeigen sich in der jeweils gültigen Produktinformation.",
    ],
    s4Title: "4) Zulässige Nutzung",
    s4Items: [
      "Nutzen Sie den Dienst nicht für rechtswidrige, betrügerische oder belästigende Zwecke.",
      "Versuchen Sie keinen unbefugten Zugriff auf Konten, Systeme oder Daten.",
      "Automatisieren Sie keinen Missbrauch und umgehen Sie keine technischen oder Token-Limits.",
    ],
    s5Title: "5) Nutzerinhalte",
    s5p1:
      "Sie behalten das Eigentum an Fragen und Inhalten. Sie gewähren uns eine beschränkte Lizenz zur Verarbeitung und Speicherung ausschließlich zum Betrieb, zur Verbesserung und Sicherung des Dienstes.",
    s5p2:
      "PDF-Export oder Bilddownload erfolgen auf eigene Initiative; Dateien entstehen auf Ihrem Gerät, Sie sind für deren Schutz verantwortlich.",
    s6Title: "6) Verfügbarkeit und Änderungen",
    s6Body:
      "Wir können Funktionen, Anbieter oder Architektur für Qualität, Sicherheit und Leistung anpassen. Ununterbrochene Verfügbarkeit garantieren wir nicht.",
    s7Title: "7) Haftungsausschluss und -begrenzung",
    s7Items: [
      "Lesungen sind symbolischer und interpretativer Natur.",
      "Wir garantieren keine persönlichen, finanziellen oder gesundheitlichen Ergebnisse.",
      "Soweit gesetzlich zulässig, beschränken wir die Haftung für indirekte oder Folgeschäden.",
    ],
    s8Title: "8) Beendigung",
    s8Body:
      "Sie können die Nutzung jederzeit beenden. Wir können den Zugang bei Verstößen, Sicherheitsrisiko oder gesetzlichen Anforderungen aussetzen oder beenden.",
    s9Title: "9) Anwendbares Recht",
    s9Body:
      "Diese Bedingungen richten sich nach anwendbarem Recht Ihrer Rechtsordnung und Vereinbarungen mit Zahlungs- und Plattformanbietern.",
    s10Title: "10) Kontakt",
    s10BeforeLink:
      "Fragen zu diesen Bedingungen oder zum Datenschutz richten Sie bitte an die offiziellen Kanäle auf der Website. Die Verarbeitung personenbezogener Daten ist in der ",
    s10AfterLink: " beschrieben.",
  },
  it: {
    ...TERMS_EN,
    title: "Termini di servizio",
    lead: "Questi termini regolano l’accesso e l’uso di The Original I Ching App. Usando il servizio, li accetti.",
    lastUpdated: "Ultimo aggiornamento: 1 aprile 2026.",
    s1Title: "1) Natura del servizio",
    s1Body:
      "La piattaforma offre consultazioni simboliche in modalità I Ching e Ossa con supporto IA. È uno strumento di riflessione personale e non sostituisce pareri medici, legali, finanziari o psicologici professionali.",
    s2Title: "2) Idoneità e account",
    s2Items: [
      "Devi usare dati di account accurati e mantenere riservate le credenziali.",
      "Sei responsabile dell’attività svolta dal tuo account.",
      "Possiamo sospendere account per abuso, frode o violazioni rilevanti.",
    ],
    s3Title: "3) Pacchetti token e pagamenti",
    s3Items: [
      "Il servizio usa pacchetti token consumabili e un saldo gratuito iniziale una tantum.",
      "Non ci sono addebiti ricorrenti né rinnovi automatici nel modello attuale.",
      "I prezzi possono aggiornarsi; le modifiche saranno riflesse nell’informazione commerciale vigente.",
    ],
    s4Title: "4) Uso consentito",
    s4Items: [
      "Non usare il servizio per attività illecite, fraudolente o di molestia.",
      "Non tentare accessi non autorizzati a account, sistemi o dati.",
      "Non automatizzare abusi né eludere limiti tecnici o di token.",
    ],
    s5Title: "5) Contenuti dell’utente",
    s5p1:
      "Conservi la titolarità di domande e contenuti. Ci concedi una licenza limitata per elaborarli e archiviarli solo per operare, migliorare e proteggere il servizio.",
    s5p2:
      "Se usi export PDF o download immagine, lo fai di tua iniziativa; i file sono generati sul tuo dispositivo e ne sei responsabile.",
    s6Title: "6) Disponibilità e modifiche",
    s6Body:
      "Possiamo aggiornare funzioni, fornitori o architettura per qualità, sicurezza e prestazioni. Non garantiamo disponibilità ininterrotta.",
    s7Title: "7) Disclaimer e limiti di responsabilità",
    s7Items: [
      "Le letture sono di natura simbolica e interpretativa.",
      "Non garantiamo esiti personali, finanziari o sulla salute.",
      "Nella misura massima consentita dalla legge, limitiamo la responsabilità per danni indiretti o consequenziali.",
    ],
    s8Title: "8) Risoluzione",
    s8Body:
      "Puoi smettere di usare il servizio in qualsiasi momento. Possiamo sospendere o terminare l’accesso per violazioni, rischio per la sicurezza o obblighi di legge.",
    s9Title: "9) Legge applicabile",
    s9Body:
      "Questi termini si interpretano secondo la legge applicabile nella tua giurisdizione e gli accordi con fornitori di pagamento e piattaforma.",
    s10Title: "10) Contatto",
    s10BeforeLink:
      "Per domande su questi termini o sulla privacy usa i canali ufficiali sul sito. Il trattamento dei dati personali è descritto nella ",
    s10AfterLink: ".",
  },
  ja: {
    ...TERMS_EN,
    title: "利用規約",
    lead: "本規約は The Original I Ching App へのアクセスと利用を定めます。サービスを利用することで本規約に同意したものとみなされます。",
    lastUpdated: "最終更新：2026年4月1日",
    s1Title: "1) サービスの性質",
    s1Body:
      "本プラットフォームは AI 支援のもと、易経モードおよび甲骨モードで象徴的な相談を提供します。個人的内省のためのツールであり、専門的な医療・法律・金融・心理のアドバイスに代わるものではありません。",
    s2Title: "2) 資格とアカウント",
    s2Items: [
      "正確なアカウント情報を使用し、認証情報の機密を保ってください。",
      "アカウントから行われる活動について責任を負います。",
      "濫用、詐欺、重大な違反がある場合、アカウントを停止することがあります。",
    ],
    s3Title: "3) トークンパックと支払い",
    s3Items: [
      "サービスは消費型トークンパックと初回のみの無料残高を使用します。",
      "現在のモデルに定期課金や自動更新はありません。",
      "価格は変更される場合があり、変更は現行の商業情報に反映されます。",
    ],
    s4Title: "4) 許容される利用",
    s4Items: [
      "違法、詐欺、嫌がらせ目的での利用を禁止します。",
      "アカウント、システム、データへの無許可アクセスを試みないでください。",
      "濫用リクエストの自動化や、技術的・トークン上の制限の回避を禁止します。",
    ],
    s5Title: "5) ユーザーコンテンツ",
    s5p1:
      "質問とコンテンツの所有権はユーザーに留まります。サービスの運営・改善・保護のためにのみ処理・保存する限定的ライセンスを当社に付与します。",
    s5p2:
      "PDF 出力や画像ダウンロードはご自身の判断で行い、ファイルは端末上で生成されます。保管はご自身の責任です。",
    s6Title: "6) 可用性と変更",
    s6Body:
      "品質・セキュリティ・パフォーマンスのため、機能、プロバイダ、アーキテクチャを更新することがあります。中断のない可用性は保証しません。",
    s7Title: "7) 免責と責任制限",
    s7Items: [
      "読み取りは象徴的・解釈的な性質のものです。",
      "利用による個人的・経済的・健康面の結果を保証しません。",
      "法律が許す最大限の範囲で、間接的・結果的損害についての責任を制限します。",
    ],
    s8Title: "8) 終了",
    s8Body:
      "いつでもサービス利用を停止できます。違反、セキュリティ上のリスク、法的要件に基づきアクセスを停止または終了することがあります。",
    s9Title: "9) 準拠法",
    s9Body:
      "本規約は、お客様の法域の適用法および決済・プラットフォーム提供者との契約に従って解釈されます。",
    s10Title: "10) お問い合わせ",
    s10BeforeLink:
      "本規約またはプライバシーに関するご質問は、サイトに記載の公式連絡先へ。個人データの取り扱いは ",
    s10AfterLink: " に記載されています。",
  },
  zh: {
    ...TERMS_EN,
    title: "服务条款",
    lead: "本条款规范对 The Original I Ching App 的访问与使用。使用服务即表示您接受本条款。",
    lastUpdated: "最后更新：2026 年 4 月 1 日",
    s1Title: "1) 服务性质",
    s1Body:
      "平台在 AI 支持下提供易经与甲骨模式的象征性咨询。其为个人反思工具，不替代专业医疗、法律、财务或心理建议。",
    s2Title: "2) 资格与账户",
    s2Items: [
      "您须使用准确的账户资料并保密登录凭据。",
      "您对通过您账户进行的活动负责。",
      "我们可因滥用、欺诈或重大违规暂停账户。",
    ],
    s3Title: "3) 代币包与付款",
    s3Items: [
      "服务使用可消耗的代币包及一次性初始免费额度。",
      "当前模式无周期性扣费或自动续订。",
      "价格可能更新；任何变更将反映于现行商业信息。",
    ],
    s4Title: "4) 允许的使用",
    s4Items: [
      "不得将服务用于违法、欺诈或骚扰活动。",
      "不得试图未经授权访问账户、系统或数据。",
      "不得自动化滥用请求或规避技术或代币限制。",
    ],
    s5Title: "5) 用户内容",
    s5p1:
      "您保留对问题与内容的所有权。您授予我们有限的许可，仅为运营、改进与保护服务而处理与存储。",
    s5p2:
      "若使用 PDF 导出或图像下载，由您自主决定；文件在您的设备上生成，由您负责保管。",
    s6Title: "6) 可用性与变更",
    s6Body:
      "我们可更新功能、提供方或架构以维护质量、安全与性能。不保证不间断可用。",
    s7Title: "7) 免责声明与责任限制",
    s7Items: [
      "解读具有象征性与解释性。",
      "我们不保证使用带来的个人、财务或健康结果。",
      "在法律允许的最大范围内，我们对间接或后果性损害的责任予以限制。",
    ],
    s8Title: "8) 终止",
    s8Body:
      "您可随时停止使用服务。我们可因违规、安全风险或法律要求暂停或终止访问。",
    s9Title: "9) 适用法律",
    s9Body:
      "本条款根据您所在司法辖区的适用法律以及与支付、平台提供方的协议进行解释。",
    s10Title: "10) 联系",
    s10BeforeLink:
      "有关本条款或隐私的疑问，请使用网站所示官方渠道。个人数据处理说明见",
    s10AfterLink: "。",
  },
  ko: {
    ...TERMS_EN,
    title: "서비스 약관",
    lead: "본 약관은 The Original I Ching App에 대한 접근과 이용을 규율합니다. 서비스를 이용하면 본 약관에 동의한 것으로 간주됩니다.",
    lastUpdated: "최종 업데이트: 2026년 4월 1일",
    s1Title: "1) 서비스 성격",
    s1Body:
      "플랫폼은 AI 지원 하에 역경 및 갑골 모드에서 상징적 상담을 제공합니다. 개인 성찰 도구이며 전문 의료·법률·재무·심리 조언을 대체하지 않습니다.",
    s2Title: "2) 자격 및 계정",
    s2Items: [
      "정확한 계정 정보를 사용하고 접속 정보를 비밀로 유지해야 합니다.",
      "계정에서 수행된 활동에 대해 책임을 집니다.",
      "남용, 사기 또는 중대한 위반 시 계정을 정지할 수 있습니다.",
    ],
    s3Title: "3) 토큰 팩 및 결제",
    s3Items: [
      "서비스는 소비형 토큰 팩과 1회성 초기 무료 잔액을 사용합니다.",
      "현재 모델에 정기 청구나 자동 갱신은 없습니다.",
      "가격은 변경될 수 있으며 변경 사항은 현행 상업 정보에 반영됩니다.",
    ],
    s4Title: "4) 허용되는 이용",
    s4Items: [
      "불법, 사기 또는 괴롭힘 목적으로 서비스를 사용하지 마십시오.",
      "계정, 시스템 또는 데이터에 무단 접근을 시도하지 마십시오.",
      "남용 요청을 자동화하거나 기술·토큰 한도를 우회하지 마십시오.",
    ],
    s5Title: "5) 사용자 콘텐츠",
    s5p1:
      "질문과 콘텐츠의 소유권은 귀하에게 있습니다. 운영·개선·보안을 위해서만 처리·저장할 수 있는 제한적 라이선스를 당사에 부여합니다.",
    s5p2:
      "PDF보내기나 이미지 다운로드는 본인 판단으로 수행하며, 파일은 기기에서 생성되며 보관 책임은 귀하에게 있습니다.",
    s6Title: "6) 가용성 및 변경",
    s6Body:
      "품질·보안·성능을 위해 기능, 제공업체, 아키텍처를 업데이트할 수 있습니다. 중단 없는 가용성은 보장하지 않습니다.",
    s7Title: "7) 면책 및 책임 제한",
    s7Items: [
      "해석은 상징적·해석적 성격입니다.",
      "이용으로 인한 개인적·재무적·건강 결과를 보장하지 않습니다.",
      "법이 허용하는 최대 한도 내에서 간접적·결과적 손해에 대한 책임을 제한합니다.",
    ],
    s8Title: "8) 종료",
    s8Body:
      "언제든 서비스 이용을 중단할 수 있습니다. 위반, 보안 위험 또는 법적 요구에 따라 접근을 정지하거나 종료할 수 있습니다.",
    s9Title: "9) 준거법",
    s9Body:
      "본 약관은 귀하 관할의 적용 법률 및 결제·플랫폼 제공업체와의 계약에 따라 해석됩니다.",
    s10Title: "10) 문의",
    s10BeforeLink:
      "본 약관 또는 개인정보 관련 문의는 사이트에 안내된 공식 채널을 이용하세요. 개인정보 처리는 ",
    s10AfterLink: "에 설명되어 있습니다.",
  },
};

export function getTermsPageMessages(locale: AppLocale): TermsPageMessages {
  return TERMS_BY_LOCALE[locale] ?? TERMS_BY_LOCALE[DEFAULT_LOCALE];
}
