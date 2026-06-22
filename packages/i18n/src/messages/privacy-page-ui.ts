import type { AppLocale } from "../locales.js";
import { DEFAULT_LOCALE } from "../locales.js";

export type PrivacyPageMessages = {
  title: string;
  lead: string;
  lastUpdated: string;
  s1Title: string;
  s1Body: string;
  s2Title: string;
  s2Items: [string, string, string, string, string];
  s3Title: string;
  s3Items: [string, string, string, string];
  s3LegalBasis: string;
  s4Title: string;
  s4Intro: string;
  s4ControlTitle: string;
  s4ControlBody: string;
  s4DeleteTitle: string;
  s4DeleteBody: string;
  s4PdfTitle: string;
  s4PdfBody: string;
  s4AccountDeleteTitle: string;
  s4AccountDeleteBodyBeforeLink: string;
  s4AccountDeleteLinkLabel: string;
  s4AccountDeleteBodyAfterLink: string;
  s5Title: string;
  s5p1: string;
  s5p2: string;
  s6Title: string;
  s6Body: string;
  s7Title: string;
  s7Items: [string, string, string, string];
  s8Title: string;
  s8p1: string;
  s8p2: string;
  s9Title: string;
  s9Body: string;
  s10Title: string;
  s10BeforeLink: string;
  s10AfterLink: string;
};

const PRIVACY_EN: PrivacyPageMessages = {
  title: "Privacy Policy",
  lead: "This policy explains how The Original I Ching App collects, uses, protects, and retains information when you use our I Ching and Bones consultation services.",
  lastUpdated: "Last updated: June 19, 2026.",
  s1Title: "1) Service provider",
  s1Body:
    "The Original I Ching App operates as a digital symbolic guidance service. For privacy-related requests, you may use the official contact channels indicated on the site.",
  s2Title: "2) Data we collect",
  s2Items: [
    "Account and authentication data: email address, user identifier, and session status.",
    "Usage-generated content: questions, readings, chat metadata, and images tied to the service. If you generate a PDF or save an image from the app, the file is created on your own device when you request it; we do not automatically receive a copy of that file.",
    "Minimum technical data for operations and security: IP, error events, metrics, and audit logs.",
    "Billing and token-purchase data processed by payment and billing infrastructure providers.",
    "Device and installation identifiers, plus crash/error diagnostics, collected by our crash-reporting tool to keep the app stable and secure.",
  ],
  s3Title: "3) How we use your data",
  s3Items: [
    "Provide consultations, history, and images, including the option for you to create a local copy on your device (thread PDF or image download) at your sole discretion.",
    "Apply token/session limits, security, and abuse prevention.",
    "Manage authentication, 2FA, and account recovery.",
    "Process purchase status and token balance.",
  ],
  s3LegalBasis:
    "In general terms, processing relies on: the contractual or pre-contractual relationship to run your account, store consultations, and apply tokens; legitimate interests, where allowed, to protect the service, prevent abuse, and maintain security; compliance with applicable requirements when required; and consent when a specific processing requires it.",
  s4Title: "4) Chat and image privacy",
  s4Intro:
    "Your conversations and images are tied exclusively to your account and are only accessible when you use the app while signed in. The service is designed so your history and consultation topics are not exposed outside your own authenticated access.",
  s4ControlTitle: "Control over your conversations.",
  s4ControlBody:
    "Each user has full control over their chat threads: you may delete them whenever you choose, from the Chats section of the app.",
  s4DeleteTitle: "Permanent deletion.",
  s4DeleteBody:
    "When you delete a conversation, we permanently remove it from our operational database (including consultations linked to that session). After that, our systems cannot recover the deleted content, even if you explicitly ask us to: there is no restore feature or working copy accessible to the product team.",
  s4PdfTitle: "Optional local copy (PDF and image).",
  s4PdfBody:
    "You may keep conversations in your own environment by generating a PDF of the active thread or downloading a reading image, whenever you choose, from the Options panel. This is your decision: the file stays under your control (device, folder, personal backups) and does not replace or change the history stored in the service until you delete those conversations in the app.",
  s4AccountDeleteTitle: "Permanently deleting your account.",
  s4AccountDeleteBodyBeforeLink:
    "If you want to close your account entirely, you can do so directly from the app: open the Options panel and select Delete account. Deletion is permanent and irreversible: your profile, consultation history, unused tokens, and all associated data are removed. For more details, visit the ",
  s4AccountDeleteLinkLabel: "account deletion page",
  s4AccountDeleteBodyAfterLink: ".",
  s5Title: "5) Processors and transfers",
  s5p1: "To operate the service, we use technical providers for crash reporting and diagnostics, purchase and subscription management, and (on Android) device attestation for fraud prevention and security. We also use providers for authentication, database, transactional email, AI, and payments. We only send each provider the data strictly necessary to run its function.",
  s5p2: "Some providers may process data in other countries. When safeguards are required for international transfers, we use recognized mechanisms (such as standard contractual clauses or other valid tools at the time), unless another basis applies.",
  s6Title: "6) Payments and tokens",
  s6Body:
    "Payments and purchases are managed through a specialized purchase-management platform and processed by payment providers. We do not store full card numbers on our servers. Purchase status is synced to enable token balance and thread limits.",
  s7Title: "7) Security",
  s7Items: [
    "Communication with the app and typical APIs uses HTTPS (encryption in transit).",
    "Access controls and session validation.",
    "Optional 2FA mechanisms (authenticator and/or email).",
    "Error/event monitoring to protect the platform.",
  ],
  s8Title: "8) Retention and deletion",
  s8p1: "We retain data as needed to operate, comply with legal obligations, and resolve disputes. You can permanently delete your account at any time directly from the app (Options → Delete account); individual chats are also managed by you in the app (see section 4).",
  s8p2: "Deleting a chat in the app is irreversible in our system: confirm the action only if you want that history removed for good. Backups or technical logs managed solely by our infrastructure provider (hosting/database) may be subject to their own retention policies and do not constitute a user-accessible archive inside the application.",
  s9Title: "9) Your rights",
  s9Body:
    "You may request access, correction, deletion, export, or other account-related privacy requests through the official channels indicated on the site. We will respond to reasonable requests in line with how the service operates.",
  s10Title: "10) Policy updates",
  s10BeforeLink:
    "We may update this policy to reflect product improvements, regulatory or operational updates. The current version is the one shown on this page. Use of the service is also governed by the ",
  s10AfterLink: ".",
};

const PRIVACY_ES: PrivacyPageMessages = {
  title: "Política de Privacidad",
  lead: "Esta política explica cómo The Original I Ching App recopila, usa, protege y conserva la información cuando utilizas nuestros servicios de consulta I Ching y Huesos.",
  lastUpdated: "Última actualización: 19 de junio de 2026.",
  s1Title: "1) Responsable del servicio",
  s1Body:
    "The Original I Ching App opera como servicio digital de orientación simbólica. Para solicitudes relacionadas con privacidad, puedes usar los canales oficiales indicados en el sitio.",
  s2Title: "2) Qué datos recopilamos",
  s2Items: [
    "Datos de cuenta y autenticación: correo electrónico, identificador de usuario y estado de sesión.",
    "Contenido generado por uso: preguntas, lecturas, metadatos de chat e imágenes asociadas al servicio. Si generas un PDF o guardas una imagen desde la app, el archivo se produce en tu propio dispositivo cuando tú lo solicitas; no recibimos automáticamente una copia de ese archivo.",
    "Datos técnicos mínimos para operación y seguridad: IP, eventos de error, métricas y registros de auditoría.",
    "Datos de facturación y compras de tokens procesados por proveedores de pago e infraestructura de billing.",
    "Identificadores de dispositivo e instalación, además de diagnósticos de errores/fallos, recopilados por nuestra herramienta de reporte de errores para mantener la app estable y segura.",
  ],
  s3Title: "3) Cómo usamos tus datos",
  s3Items: [
    "Prestar el servicio de consultas, historial e imágenes, incluida la posibilidad de que generes en tu dispositivo una copia local (PDF del hilo o descarga de imagen) bajo tu propia discreción.",
    "Aplicar límites de tokens/sesión, seguridad y prevención de abuso.",
    "Gestionar autenticación, 2FA y recuperación de cuenta.",
    "Procesar estado de compras y saldo de tokens.",
  ],
  s3LegalBasis:
    "En términos generales, el tratamiento se apoya en: la relación contractual o precontractual para operar tu cuenta, guardar consultas y aplicar tokens; el interés legítimo, cuando proceda, para proteger el servicio, prevenir abuso y mantener la seguridad; el cumplimiento de requisitos aplicables cuando corresponda; y el consentimiento cuando un tratamiento concreto lo exija.",
  s4Title: "4) Privacidad de chats e imágenes",
  s4Intro:
    "Tus conversaciones e imágenes quedan asociadas exclusivamente a tu cuenta y solo son accesibles cuando utilizas la aplicación con tu sesión iniciada. El diseño del servicio no expone tu historial ni tus temas de consulta fuera de tu propio acceso autenticado.",
  s4ControlTitle: "Control de tus conversaciones.",
  s4ControlBody:
    "Cada usuario tiene control total sobre sus chats (hilos de conversación): puedes eliminarlos cuando lo consideres conveniente, desde la sección Chats de la aplicación.",
  s4DeleteTitle: "Eliminación permanente.",
  s4DeleteBody:
    "Cuando eliminas una conversación, la borramos de forma permanente de nuestra base de datos operativa (incluidas las consultas vinculadas a esa sesión). A partir de ese momento, nuestro sistema no es capaz de recuperar el contenido eliminado, ni aunque el usuario nos lo solicite expresamente: no existe función de restauración ni copia de trabajo accesible para el equipo del producto.",
  s4PdfTitle: "Copia local opcional (PDF e imagen).",
  s4PdfBody:
    "Puedes guardar tus conversaciones en tu propio entorno generando un PDF del hilo activo o descargando la imagen de una lectura, cuando lo consideres conveniente, desde el panel Opciones. Es una decisión tuya: el archivo queda bajo tu control (dispositivo, carpeta, copias de seguridad personales) y no sustituye ni modifica el historial alojado en el servicio hasta que tú borres esas conversaciones en la app.",
  s4AccountDeleteTitle: "Eliminar tu cuenta de forma permanente.",
  s4AccountDeleteBodyBeforeLink:
    "Si deseas cerrar tu cuenta por completo, puedes hacerlo directamente desde la aplicación: abre el panel Opciones y selecciona Eliminar cuenta. La eliminación es permanente e irreversible: se borran el perfil, el historial de consultas, los tokens no utilizados y todos los datos asociados a tu cuenta. Para más detalles, visita la ",
  s4AccountDeleteLinkLabel: "página de eliminación de cuenta",
  s4AccountDeleteBodyAfterLink: ".",
  s5Title: "5) Proveedores y transferencias",
  s5p1: "Para operar el servicio usamos proveedores técnicos de reporte de errores y diagnósticos, gestión de compras y suscripciones, y (en Android) atestación de dispositivo para prevención de fraude y seguridad. También usamos proveedores de autenticación, base de datos, email transaccional, IA y pagos. Solo enviamos a cada proveedor los datos estrictamente necesarios para ejecutar su función.",
  s5p2: "Algunos proveedores pueden tratar datos en otros países. Cuando se requieran garantías para transferencias internacionales, utilizamos mecanismos reconocidos (como cláusulas contractuales tipo u otras herramientas válidas en su momento), salvo que exista otra base aplicable.",
  s6Title: "6) Pagos y tokens",
  s6Body:
    "Las compras se gestionan a través de una plataforma especializada de gestión de compras y son procesadas por proveedores de pago especializados. No almacenamos números completos de tarjeta en nuestros servidores. El estado de compra se sincroniza para habilitar saldo de tokens y límites por hilo.",
  s7Title: "7) Seguridad",
  s7Items: [
    "Comunicaciones con la aplicación y APIs habituales sobre HTTPS (cifrado en tránsito).",
    "Controles de acceso y validación de sesión.",
    "Mecanismos opcionales de 2FA (autenticador y/o email).",
    "Monitoreo de errores y eventos para proteger la plataforma.",
  ],
  s8Title: "8) Retención y eliminación",
  s8p1: "Conservamos datos mientras sean necesarios para operar, cumplir obligaciones legales y resolver disputas. Puedes eliminar tu cuenta de forma permanente en cualquier momento desde el panel Opciones de la aplicación (Opciones → Eliminar cuenta); los chats individuales también los gestionas tú desde la interfaz (véase la sección 4).",
  s8p2: "La eliminación de un chat desde la app es irreversible en nuestro sistema: confirma la acción solo si deseas borrar de forma definitiva ese historial. Las copias de seguridad o registros técnicos que gestione exclusivamente nuestro proveedor de infraestructura (hosting/base de datos) pueden estar sujetos a sus propias políticas de retención y no constituyen un archivo consultable por el usuario dentro de la aplicación.",
  s9Title: "9) Tus derechos",
  s9Body:
    "Puedes solicitar acceso, rectificación, supresión, exportación u otras peticiones relacionadas con la privacidad de tu cuenta a través de los canales oficiales indicados en el sitio. Atenderemos solicitudes razonables de acuerdo con el funcionamiento del servicio.",
  s10Title: "10) Cambios en esta política",
  s10BeforeLink:
    "Podemos actualizar esta política para reflejar mejoras del producto, cambios normativos u operativos. La versión vigente es la que se muestra en esta página. El uso del servicio también se rige por los ",
  s10AfterLink: ".",
};

const PRIVACY_BY_LOCALE: Record<AppLocale, PrivacyPageMessages> = {
  es: PRIVACY_ES,
  en: PRIVACY_EN,
  pt: {
    ...PRIVACY_EN,
    title: "Política de Privacidade",
    lead: "Esta política explica como The Original I Ching App recolhe, utiliza, protege e conserva informações quando utilizas os nossos serviços de consulta I Ching e Ossos.",
    lastUpdated: "Última atualização: 19 de junho de 2026.",
    s1Title: "1) Responsável pelo serviço",
    s1Body:
      "The Original I Ching App opera como serviço digital de orientação simbólica. Para pedidos relacionados com privacidade, podes usar os canais oficiais indicados no site.",
    s2Title: "2) Que dados recolhemos",
    s2Items: [
      "Dados de conta e autenticação: email, identificador de utilizador e estado de sessão.",
      "Conteúdo gerado pelo uso: perguntas, leituras, metadados de chat e imagens associadas ao serviço. Se gerares um PDF ou guardares uma imagem na app, o ficheiro é criado no teu dispositivo quando o solicitas; não recebemos automaticamente uma cópia desse ficheiro.",
      "Dados técnicos mínimos para operação e segurança: IP, eventos de erro, métricas e registos de auditoria.",
      "Dados de faturação e compras de tokens processados por fornecedores de pagamento e infraestrutura de billing.",
      "Identificadores de dispositivo e instalação, além de diagnósticos de erros/falhas, recolhidos pela nossa ferramenta de relatório de erros para manter a app estável e segura.",
    ],
    s3Title: "3) Como usamos os teus dados",
    s3Items: [
      "Prestar consultas, histórico e imagens, incluindo a opção de criares uma cópia local no teu dispositivo (PDF do fio ou descarga de imagem) à tua discrição.",
      "Aplicar limites de tokens/sessão, segurança e prevenção de abuso.",
      "Gerir autenticação, 2FA e recuperação de conta.",
      "Processar estado de compras e saldo de tokens.",
    ],
    s3LegalBasis:
      "Em termos gerais, o tratamento baseia-se na relação contratual ou pré-contratual para operar a tua conta, guardar consultas e aplicar tokens; no interesse legítimo, quando adequado, para proteger o serviço, prevenir abuso e manter a segurança; no cumprimento de requisitos aplicáveis quando necessário; e no consentimento quando um tratamento específico o exija.",
    s4Title: "4) Privacidade de chats e imagens",
    s4Intro:
      "As tuas conversas e imagens ficam associadas exclusivamente à tua conta e só são acessíveis quando usas a app com sessão iniciada. O serviço não expõe o teu histórico nem os teus temas de consulta fora do teu acesso autenticado.",
    s4ControlTitle: "Controlo das tuas conversas.",
    s4ControlBody:
      "Cada utilizador tem controlo total sobre os chats: podes eliminá-los quando quiseres, na secção Chats da app.",
    s4DeleteTitle: "Eliminação permanente.",
    s4DeleteBody:
      "Quando eliminas uma conversação, removemo-la permanentemente da nossa base operacional (incluindo consultas ligadas a essa sessão). Depois disso, os nossos sistemas não podem recuperar o conteúdo eliminado, mesmo que o peças explicitamente: não há restauração nem cópia de trabalho acessível à equipa do produto.",
    s4PdfTitle: "Cópia local opcional (PDF e imagem).",
    s4PdfBody:
      "Podes manter conversas no teu ambiente gerando um PDF do fio ativo ou descarregando a imagem de uma leitura, quando quiseres, no painel Opções. É a tua decisão: o ficheiro fica sob o teu controlo e não substitui o histórico no serviço até eliminares essas conversas na app.",
    s5Title: "5) Subcontratantes e transferências",
    s5p1: "Para operar o serviço usamos fornecedores técnicos de relatório de erros e diagnósticos, gestão de compras e subscrições, e (no Android) atestação de dispositivo para prevenção de fraude e segurança. Também usamos fornecedores de autenticação, base de dados, email transacional, IA e pagamentos. Só enviamos a cada fornecedor os dados estritamente necessários para a sua função.",
    s5p2: "Alguns fornecedores podem tratar dados noutros países. Quando forem necessárias salvaguardas para transferências internacionais, usamos mecanismos reconhecidos (como cláusulas contratuais-tipo), salvo outra base aplicável.",
    s6Title: "6) Pagamentos e tokens",
    s6Body:
      "As compras são geridas através de uma plataforma especializada de gestão de compras e processadas por fornecedores de pagamento especializados. Não armazenamos números completos de cartão nos nossos servidores. O estado de compra sincroniza-se para ativar saldo de tokens e limites por fio.",
    s7Title: "7) Segurança",
    s7Items: [
      "Comunicações com a app e APIs habituais sobre HTTPS (encriptação em trânsito).",
      "Controlos de acesso e validação de sessão.",
      "Mecanismos opcionais de 2FA (autenticador e/ou email).",
      "Monitorização de erros e eventos para proteger a plataforma.",
    ],
    s8Title: "8) Retenção e eliminação",
    s8p1: "Conservamos dados enquanto necessário para operar, cumprir obrigações legais e resolver litígios. Podes pedir eliminação ao nível da conta; chats individuais geres tu na app (ver secção 4).",
    s8p2: "Eliminar um chat na app é irreversível no nosso sistema: confirma só se quiseres apagar esse histórico definitivamente. Cópias de segurança ou registos técnicos geridos apenas pelo fornecedor de infraestrutura podem ter políticas próprias de retenção.",
    s9Title: "9) Os teus direitos",
    s9Body:
      "Podes pedir acesso, retificação, apagamento, exportação ou outras solicitações relacionadas com a privacidade da conta pelos canais oficiais do site. Trataremos pedidos razoáveis de acordo com o funcionamento do serviço.",
    s10Title: "10) Alterações a esta política",
    s10BeforeLink:
      "Podemos atualizar esta política para refletir melhorias do produto, alterações normativas ou operacionais. A versão em vigor é a mostrada nesta página. A utilização do serviço rege-se também pelos ",
    s10AfterLink: ".",
  },
  fr: {
    ...PRIVACY_EN,
    title: "Politique de confidentialité",
    lead: "Cette politique explique comment The Original I Ching App collecte, utilise, protège et conserve les informations lorsque vous utilisez nos services de consultation I Ching et Os.",
    lastUpdated: "Dernière mise à jour : 19 juin 2026.",
    s1Title: "1) Responsable du service",
    s1Body:
      "The Original I Ching App est un service numérique d’orientation symbolique. Pour toute demande liée à la confidentialité, utilisez les canaux officiels indiqués sur le site.",
    s2Title: "2) Données collectées",
    s2Items: [
      "Données de compte et d’authentification : adresse e-mail, identifiant utilisateur et état de session.",
      "Contenu généré par l’usage : questions, lectures, métadonnées de chat et images liées au service. Si vous générez un PDF ou enregistrez une image depuis l’app, le fichier est créé sur votre appareil sur votre demande ; nous n’en recevons pas automatiquement une copie.",
      "Données techniques minimales pour l’exploitation et la sécurité : IP, événements d’erreur, métriques et journaux d’audit.",
      "Données de facturation et d’achat de jetons traitées par des prestataires de paiement et de facturation.",
      "Identifiants d’appareil et d’installation, ainsi que diagnostics d’erreurs/incidents, collectés par notre outil de rapport d’incidents pour garder l’app stable et sécurisée.",
    ],
    s3Title: "3) Utilisation de vos données",
    s3Items: [
      "Fournir consultations, historique et images, y compris l’option de créer une copie locale sur votre appareil (PDF du fil ou téléchargement d’image) à votre seule discrétion.",
      "Appliquer limites de jetons/sessions, sécurité et prévention des abus.",
      "Gérer l’authentification, la 2FA et la récupération de compte.",
      "Traiter l’état des achats et le solde de jetons.",
    ],
    s3LegalBasis:
      "En général, le traitement repose sur : la relation contractuelle ou précontractuelle pour exploiter votre compte, stocker les consultations et appliquer les jetons ; l’intérêt légitime, lorsque c’est pertinent, pour protéger le service, prévenir les abus et maintenir la sécurité ; le respect d’exigences applicables ; et le consentement lorsqu’un traitement spécifique l’exige.",
    s4Title: "4) Confidentialité des chats et images",
    s4Intro:
      "Vos conversations et images sont liées exclusivement à votre compte et ne sont accessibles que lorsque vous utilisez l’app connecté. Le service est conçu pour ne pas exposer votre historique ni vos sujets de consultation en dehors de votre accès authentifié.",
    s4ControlTitle: "Contrôle de vos conversations.",
    s4ControlBody:
      "Chaque utilisateur contrôle entièrement ses fils de discussion : vous pouvez les supprimer quand vous le souhaitez, depuis la section Chats.",
    s4DeleteTitle: "Suppression définitive.",
    s4DeleteBody:
      "Lorsque vous supprimez une conversation, nous la retirons définitivement de notre base opérationnelle (y compris les consultations liées). Ensuite, nos systèmes ne peuvent pas récupérer le contenu supprimé, même sur demande expresse : il n’y a pas de restauration ni de copie de travail accessible à l’équipe produit.",
    s4PdfTitle: "Copie locale facultative (PDF et image).",
    s4PdfBody:
      "Vous pouvez conserver des conversations sur votre environnement en générant un PDF du fil actif ou en téléchargeant l’image d’une lecture, quand vous le souhaitez, depuis Options. C’est votre choix : le fichier reste sous votre contrôle et ne remplace pas l’historique du service tant que vous n’avez pas supprimé ces conversations dans l’app.",
    s5Title: "5) Sous-traitants et transferts",
    s5p1: "Pour exploiter le service, nous utilisons des prestataires techniques pour le rapport d’incidents et les diagnostics, la gestion des achats et abonnements, et (sur Android) l’attestation d’appareil pour la prévention de la fraude et la sécurité. Nous utilisons aussi des prestataires d’authentification, de base de données, d’e-mail transactionnel, d’IA et de paiement. Nous ne transmettons à chaque prestataire que les données strictement nécessaires à sa fonction.",
    s5p2: "Certains prestataires peuvent traiter des données dans d’autres pays. Lorsque des garanties sont nécessaires pour les transferts internationaux, nous utilisons des mécanismes reconnus (clauses contractuelles types, etc.), sauf autre base applicable.",
    s6Title: "6) Paiements et jetons",
    s6Body:
      "Les achats sont gérés via une plateforme spécialisée de gestion des achats et traités par des prestataires de paiement spécialisés. Nous ne stockons pas les numéros de carte complets sur nos serveurs. L’état d’achat est synchronisé pour activer le solde de jetons et les limites par fil.",
    s7Title: "7) Sécurité",
    s7Items: [
      "Communications avec l’app et API courantes en HTTPS (chiffrement en transit).",
      "Contrôles d’accès et validation de session.",
      "Mécanismes 2FA facultatifs (application authentificatrice et/ou e-mail).",
      "Surveillance des erreurs et événements pour protéger la plateforme.",
    ],
    s8Title: "8) Conservation et suppression",
    s8p1: "Nous conservons les données le temps nécessaire pour exploiter le service, respecter la loi et résoudre les litiges. Vous pouvez demander la suppression au niveau du compte ; les chats individuels sont gérés par vous dans l’app (voir section 4).",
    s8p2: "Supprimer un chat dans l’app est irréversible : confirmez seulement si vous voulez effacer définitivement cet historique. Les sauvegardes ou journaux gérés uniquement par l’hébergeur peuvent avoir leurs propres politiques de conservation.",
    s9Title: "9) Vos droits",
    s9Body:
      "Vous pouvez demander l’accès, la rectification, la suppression, l’export ou d’autres demandes liées à la confidentialité du compte via les canaux officiels du site. Nous répondrons aux demandes raisonnables dans le cadre du fonctionnement du service.",
    s10Title: "10) Mises à jour de cette politique",
    s10BeforeLink:
      "Nous pouvons mettre à jour cette politique pour refléter des évolutions du produit, réglementaires ou opérationnelles. La version en vigueur est celle affichée sur cette page. L’utilisation du service est aussi régie par les ",
    s10AfterLink: ".",
  },
  de: {
    ...PRIVACY_EN,
    title: "Datenschutzerklärung",
    lead: "Diese Erklärung beschreibt, wie The Original I Ching App Informationen erhebt, nutzt, schützt und aufbewahrt, wenn Sie unsere I-Ging- und Knochen-Beratungsdienste nutzen.",
    lastUpdated: "Zuletzt aktualisiert: 19. Juni 2026.",
    s1Title: "1) Dienstanbieter",
    s1Body:
      "The Original I Ching App ist ein digitaler Dienst zur symbolischen Orientierung. Für datenschutzbezogene Anfragen nutzen Sie bitte die offiziellen Kontaktwege auf der Website.",
    s2Title: "2) Welche Daten wir erheben",
    s2Items: [
      "Konto- und Authentifizierungsdaten: E-Mail-Adresse, Nutzerkennung und Sitzungsstatus.",
      "Nutzungsbedingte Inhalte: Fragen, Lesungen, Chat-Metadaten und bildbezogene Daten. Wenn Sie ein PDF erzeugen oder ein Bild speichern, entsteht die Datei auf Ihrem Gerät auf Ihre Anforderung; wir erhalten davon nicht automatisch eine Kopie.",
      "Mindesttechnische Daten für Betrieb und Sicherheit: IP, Fehlerereignisse, Metriken und Audit-Logs.",
      "Abrechnungs- und Token-Kaufdaten durch Zahlungs- und Billing-Anbieter.",
      "Geräte- und Installationskennungen sowie Absturz-/Fehlerdiagnosen, erfasst durch unser Absturzberichts-Tool, um die App stabil und sicher zu halten.",
    ],
    s3Title: "3) Wie wir Ihre Daten nutzen",
    s3Items: [
      "Bereitstellung von Beratungen, Verlauf und Bildern, einschließlich der Option einer lokalen Kopie auf Ihrem Gerät (Thread-PDF oder Bilddownload) nach eigenem Ermessen.",
      "Anwendung von Token-/Sitzungslimits, Sicherheit und Missbrauchsprävention.",
      "Verwaltung von Authentifizierung, 2FA und Kontowiederherstellung.",
      "Verarbeitung des Kaufstatus und des Token-Saldos.",
    ],
    s3LegalBasis:
      "Die Verarbeitung stützt sich im Allgemeinen auf: das Vertrags- oder vorvertragliche Verhältnis für Konto, Beratungen und Token; berechtigte Interessen, soweit zulässig, zum Schutz des Dienstes und der Sicherheit; Einhaltung anwendbarer Anforderungen; und Einwilligung, wenn ein konkreter Vorgang dies erfordert.",
    s4Title: "4) Datenschutz von Chats und Bildern",
    s4Intro:
      "Ihre Gespräche und Bilder sind ausschließlich mit Ihrem Konto verknüpft und nur zugänglich, wenn Sie angemeldet sind. Der Dienst ist so gestaltet, dass Verlauf und Themen außerhalb Ihres authentifizierten Zugriffs nicht offengelegt werden.",
    s4ControlTitle: "Kontrolle über Ihre Gespräche.",
    s4ControlBody:
      "Jeder Nutzer hat volle Kontrolle über Chat-Threads: Sie können sie jederzeit im Bereich Chats löschen.",
    s4DeleteTitle: "Endgültige Löschung.",
    s4DeleteBody:
      "Wenn Sie eine Unterhaltung löschen, entfernen wir sie dauerhaft aus unserer Betriebsdatenbank (einschließlich verknüpfter Beratungen). Danach kann der Inhalt nicht wiederhergestellt werden, auch nicht auf ausdrückliche Anfrage: es gibt keine Wiederherstellungsfunktion für das Produktteam.",
    s4PdfTitle: "Optionale lokale Kopie (PDF und Bild).",
    s4PdfBody:
      "Sie können Gespräche in Ihrer Umgebung behalten, indem Sie ein PDF des aktiven Threads erzeugen oder ein Lesebild aus Optionen herunterladen. Die Datei liegt unter Ihrer Kontrolle und ersetzt den Dienstverlauf nicht, bis Sie die Chats in der App löschen.",
    s5Title: "5) Auftragsverarbeiter und Übermittlungen",
    s5p1: "Zum Betrieb des Dienstes nutzen wir technische Anbieter für Absturzberichte und Diagnosen, die Verwaltung von Käufen und Abonnements sowie (auf Android) die Geräteattestierung zur Betrugsprävention und Sicherheit. Wir nutzen außerdem Anbieter für Authentifizierung, Datenbank, Transaktions-E-Mail, KI und Zahlungen. Wir übermitteln jedem Anbieter nur die für seine Funktion unbedingt erforderlichen Daten.",
    s5p2: "Manche Anbieter verarbeiten in anderen Ländern. Wenn Schutzmaßnahmen für internationale Übermittlungen nötig sind, nutzen wir anerkannte Instrumente (z. B. Standardvertragsklauseln), sofern keine andere Grundlage greift.",
    s6Title: "6) Zahlungen und Token",
    s6Body:
      "Käufe werden über eine spezialisierte Kaufverwaltungsplattform abgewickelt und von spezialisierten Zahlungsanbietern verarbeitet. Wir speichern keine vollständigen Kartennummern auf unseren Servern. Der Kaufstatus wird synchronisiert, um Token-Saldo und Thread-Limits zu aktivieren.",
    s7Title: "7) Sicherheit",
    s7Items: [
      "Kommunikation mit App und APIs über HTTPS (Verschlüsselung während der Übertragung).",
      "Zugriffskontrollen und Sitzungsvalidierung.",
      "Optionale 2FA (Authenticator und/oder E-Mail).",
      "Fehler-/Ereignisüberwachung zum Schutz der Plattform.",
    ],
    s8Title: "8) Aufbewahrung und Löschung",
    s8p1: "Wir bewahren Daten so lange auf, wie es für Betrieb, Rechtspflichten und Streitbeilegung nötig ist. Sie können Löschung auf Kontoebene beantragen; einzelne Chats verwalten Sie in der App (siehe Abschnitt 4).",
    s8p2: "Das Löschen eines Chats in der App ist in unserem System unwiderruflich. Sicherungen oder technische Logs allein beim Infrastrukturanbieter können eigenen Aufbewahrungsregeln unterliegen.",
    s9Title: "9) Ihre Rechte",
    s9Body:
      "Sie können Auskunft, Berichtigung, Löschung, Export oder andere datenschutzbezogene Anfragen zu Ihrem Konto über die auf der Website angegebenen Kanäle stellen. Wir bearbeiten angemessene Anfragen im Rahmen des Servicebetriebs.",
    s10Title: "10) Änderungen dieser Erklärung",
    s10BeforeLink:
      "Wir können diese Erklärung anpassen (Produkt, regulatorische oder betriebliche Änderungen). Die gültige Fassung ist auf dieser Seite. Die Nutzung unterliegt auch den ",
    s10AfterLink: ".",
  },
  it: {
    ...PRIVACY_EN,
    title: "Informativa sulla privacy",
    lead: "Questa informativa spiega come The Original I Ching App raccoglie, usa, protegge e conserva le informazioni quando usi i servizi di consulto I Ching e Ossa.",
    lastUpdated: "Ultimo aggiornamento: 19 giugno 2026.",
    s1Title: "1) Titolare del servizio",
    s1Body:
      "The Original I Ching App è un servizio digitale di orientamento simbolico. Per richieste sulla privacy usa i canali ufficiali indicati sul sito.",
    s2Title: "2) Dati che raccogliamo",
    s2Items: [
      "Dati di account e autenticazione: email, identificativo utente e stato sessione.",
      "Contenuto generato dall’uso: domande, letture, metadati chat e immagini collegate al servizio. Se generi un PDF o salvi un’immagine dall’app, il file è creato sul tuo dispositivo su tua richiesta; non ne riceviamo automaticamente una copia.",
      "Dati tecnici minimi per operatività e sicurezza: IP, eventi di errore, metriche e log di audit.",
      "Dati di fatturazione e acquisto token elaborati da fornitori di pagamento e billing.",
      "Identificativi di dispositivo e installazione, oltre a diagnosi di errori/crash, raccolti dal nostro strumento di reporting crash per mantenere l’app stabile e sicura.",
    ],
    s3Title: "3) Come usiamo i dati",
    s3Items: [
      "Fornire consultazioni, cronologia e immagini, inclusa l’opzione di copia locale sul dispositivo (PDF del thread o download immagine) a tua discrezione.",
      "Applicare limiti token/sessione, sicurezza e prevenzione abusi.",
      "Gestire autenticazione, 2FA e recupero account.",
      "Elaborare stato acquisti e saldo token.",
    ],
    s3LegalBasis:
      "In generale il trattamento si basa sul rapporto contrattuale o precontrattuale per il conto, le consultazioni e i token; sull’interesse legittimo, ove pertinente, per proteggere il servizio e la sicurezza; sul rispetto di requisiti applicabili; e sul consenso quando richiesto per un trattamento specifico.",
    s4Title: "4) Privacy di chat e immagini",
    s4Intro:
      "Le conversazioni e le immagini sono associate esclusivamente al tuo account e accessibili solo con sessione avviata. Il servizio non espone cronologia o argomenti fuori dal tuo accesso autenticato.",
    s4ControlTitle: "Controllo delle conversazioni.",
    s4ControlBody:
      "Ogni utente ha pieno controllo sui thread: puoi eliminarli quando vuoi dalla sezione Chat.",
    s4DeleteTitle: "Eliminazione permanente.",
    s4DeleteBody:
      "Eliminando una conversazione la rimuoviamo in modo permanente dal database operativo (incluse le consultazioni collegate). Dopo, i sistemi non possono recuperare il contenuto, nemmeno su richiesta esplicita: nessun ripristino né copia di lavoro accessibile al team prodotto.",
    s4PdfTitle: "Copia locale facoltativa (PDF e immagine).",
    s4PdfBody:
      "Puoi conservare conversazioni generando un PDF del thread attivo o scaricando l’immagine di una lettura da Opzioni. È tua decisione: il file resta sotto il tuo controllo e non sostituisce la cronologia del servizio finché non elimini quei chat nell’app.",
    s5Title: "5) Responsabili del trattamento e trasferimenti",
    s5p1: "Per gestire il servizio usiamo fornitori tecnici per il reporting crash e la diagnostica, la gestione di acquisti e abbonamenti, e (su Android) l’attestazione del dispositivo per la prevenzione delle frodi e la sicurezza. Usiamo anche fornitori di autenticazione, database, email transazionale, IA e pagamenti. Trasmettiamo a ciascun fornitore solo i dati strettamente necessari per la sua funzione.",
    s5p2: "Alcuni fornitori possono trattare dati in altri Paesi. Quando servono garanzie per trasferimenti internazionali, usiamo meccanismi riconosciuti (es. clausole contrattuali standard), salvo altra base applicabile.",
    s6Title: "6) Pagamenti e token",
    s6Body:
      "Gli acquisti sono gestiti tramite una piattaforma specializzata di gestione degli acquisti ed elaborati da fornitori di pagamento specializzati. Non memorizziamo numeri di carta completi sui nostri server. Lo stato di acquisto si sincronizza per attivare saldo token e limiti per thread.",
    s7Title: "7) Sicurezza",
    s7Items: [
      "Comunicazioni con app e API su HTTPS (crittografia in transito).",
      "Controlli di accesso e validazione sessione.",
      "2FA opzionale (authenticator e/o email).",
      "Monitoraggio errori ed eventi per proteggere la piattaforma.",
    ],
    s8Title: "8) Conservazione ed eliminazione",
    s8p1: "Conserviamo i dati per il tempo necessario a operare, adempiere obblighi legali e risolvere controversie. Puoi richiedere cancellazione a livello account; i singoli chat gestisci tu nell’app (vedi sezione 4).",
    s8p2: "Eliminare un chat nell’app è irreversibile nel nostro sistema. Backup o log tecnici gestiti solo dall’hosting possono avere policy di conservazione proprie.",
    s9Title: "9) I tuoi diritti",
    s9Body:
      "Puoi richiedere accesso, rettifica, cancellazione, export o altre richieste sulla privacy del conto tramite i canali ufficiali del sito. Evaderemo richieste ragionevoli in linea con il funzionamento del servizio.",
    s10Title: "10) Aggiornamenti dell’informativa",
    s10BeforeLink:
      "Possiamo aggiornare questa informativa per riflettere miglioramenti del prodotto, aggiornamenti normativi o operativi. La versione vigente è quella mostrata in questa pagina. L’uso del servizio è regolato anche dai ",
    s10AfterLink: ".",
  },
  ja: {
    ...PRIVACY_EN,
    title: "プライバシーポリシー",
    lead: "本ポリシーは、当社の易経・甲骨スタイルの相談サービスをご利用いただく際に、The Original I Ching App がどのように情報を収集・利用・保護・保持するかを説明します。",
    lastUpdated: "最終更新：2026年6月19日",
    s1Title: "1) サービス提供者",
    s1Body:
      "The Original I Ching App は象徴的なガイダンスを提供するデジタルサービスです。プライバシーに関するお問い合わせは、サイトに記載の公式連絡先をご利用ください。",
    s2Title: "2) 収集するデータ",
    s2Items: [
      "アカウントと認証データ：メールアドレス、ユーザー識別子、セッション状態。",
      "利用に伴い生成されるコンテンツ：質問、読み取り、チャットのメタデータ、サービスに紐づく画像。アプリから PDF を生成したり画像を保存したりする場合、ファイルはご本人の操作で端末上に作成されます。当社が自動的にそのコピーを受け取ることはありません。",
      "運用とセキュリティに必要な最小限の技術データ：IP、アラート・エラーイベント、指標、監査ログ。",
      "決済およびトークン購入に関するデータ（決済・課金インフラのプロセッサが処理）。",
      "アプリの安定性とセキュリティを保つため、クラッシュレポートツールにより収集されるデバイス・インストール識別子およびクラッシュ・エラー診断情報。",
    ],
    s3Title: "3) データの利用目的",
    s3Items: [
      "相談、履歴、画像の提供。ご自身の判断で端末にローカルコピー（スレッド PDF または画像ダウンロード）を作成するオプションを含みます。",
      "トークン／セッション上限、セキュリティ、不正利用防止の適用。",
      "認証、2FA、アカウント復旧の管理。",
      "購入状態とトークン残高の処理。",
    ],
    s3LegalBasis:
      "一般的に、処理の根拠は次のとおりです。アカウント運用、相談の保存、トークン適用に関する契約上または契約前の関係。サービス保護・不正防止・セキュリティ維持のための正当な利益（許容される範囲で）。適用される要件の遵守。特定の処理に同意が必要な場合の同意。",
    s4Title: "4) チャットと画像のプライバシー",
    s4Intro:
      "会話と画像はアカウントにのみ紐づき、サインインしてアプリを利用している間にのみアクセス可能です。設計上、履歴や相談内容は認証されたご本人以外には公開されません。",
    s4ControlTitle: "会話の管理。",
    s4ControlBody:
      "各ユーザーはチャットスレッドを完全に管理できます。アプリの「チャット」から、必要に応じていつでも削除できます。",
    s4DeleteTitle: "永続的な削除。",
    s4DeleteBody:
      "会話を削除すると、当社の運用データベースから恒久的に削除されます（そのセッションに紐づく相談を含む）。その後、明示的に依頼されても削除済みコンテンツを復元することはできません。復元機能やプロダクトチームがアクセス可能な作業用コピーはありません。",
    s4PdfTitle: "任意のローカルコピー（PDF と画像）。",
    s4PdfBody:
      "オプションからアクティブスレッドの PDF を生成したり、読み取り画像をダウンロードしたりして、ご自身の環境に会話を残すことができます。ファイルは端末・フォルダ・個人のバックアップなど、ご本人の管理下にあり、アプリ内で当該会話を削除するまでサービス上の履歴を置き換えたり変更したりしません。",
    s5Title: "5) 委託先と越境移転",
    s5p1: "サービス運営のため、クラッシュレポートおよび診断、購入・サブスクリプション管理、Android では不正防止・セキュリティのためのデバイス認証を行う技術プロバイダを利用しています。また、認証、データベース、トランザクションメール、AI、決済の各プロバイダも利用します。各プロバイダには、その機能の実行に厳密に必要なデータのみを送信します。",
    s5p2: "一部のプロバイダは他国でデータを処理する場合があります。国際移転に保護措置が必要な場合、当該時点で有効な標準契約条項など認められた手段を用います（別の根拠がある場合を除く）。",
    s6Title: "6) 決済とトークン",
    s6Body:
      "購入は専門の購入管理プラットフォームを通じて管理され、決済プロバイダによって処理されます。当社サーバーに完全なカード番号を保存することはありません。購入状態はトークン残高とスレッド上限の有効化のために同期されます。",
    s7Title: "7) セキュリティ",
    s7Items: [
      "アプリおよび通常の API との通信は HTTPS（転送時暗号化）。",
      "アクセス制御とセッション検証。",
      "任意の 2FA（認証アプリおよび／またはメール）。",
      "プラットフォーム保護のためのエラー・イベント監視。",
    ],
    s8Title: "8) 保持と削除",
    s8p1: "運営、法的義務の遵守、紛争解決に必要な期間データを保持します。アカウント単位の削除を請求できます。個別のチャットはアプリ内でご本人が管理します（第 4 節参照）。",
    s8p2: "アプリ内でチャットを削除すると、当社システム上では元に戻せません。インフラプロバイダのみが管理するバックアップや技術ログは、同社の保持方針の対象となり、アプリ内でユーザーが参照できるアーカイブではありません。",
    s9Title: "9) お客様の権利",
    s9Body:
      "アクセス、訂正、消去、エクスポートなど、アカウントに関するプライバシー請求は、サイトに記載の公式窓口から行えます。サービスの運営に沿って合理的な請求に対応します。",
    s10Title: "10) 本ポリシーの変更",
    s10BeforeLink:
      "製品の改善、規制上または運用上の変更を反映するため、本ポリシーを更新することがあります。有効な版は本ページに表示されているものです。サービスの利用は ",
    s10AfterLink: " によっても規律されます。",
  },
  zh: {
    ...PRIVACY_EN,
    title: "隐私政策",
    lead: "本政策说明在您使用我们的易经与甲骨风格咨询服务时，The Original I Ching App 如何收集、使用、保护与保留信息。",
    lastUpdated: "最后更新：2026 年 6 月 19 日",
    s1Title: "1) 服务提供者",
    s1Body:
      "The Original I Ching App 以数字形式提供象征性指引服务。与隐私相关的请求请使用网站所示官方联系渠道。",
    s2Title: "2) 我们收集的数据",
    s2Items: [
      "账户与认证数据：电子邮件、用户标识符、会话状态。",
      "使用产生的内容：问题、解读、聊天元数据及服务相关图像。若您从应用生成 PDF 或保存图像，文件在您请求时在您自有设备上生成；我们不会自动收到该文件的副本。",
      "运营与安全所需的最少技术数据：IP、错误事件、指标与审计日志。",
      "由支付与计费基础设施提供方处理的账单与代币购买数据。",
      "为保持应用稳定与安全，由我们的崩溃报告工具收集的设备与安装标识符，以及崩溃/错误诊断信息。",
    ],
    s3Title: "3) 我们如何使用数据",
    s3Items: [
      "提供咨询、历史与图像，包括在您自行决定下在设备上生成本地副本（会话 PDF 或图像下载）的选项。",
      "执行代币／会话限制、安全与滥用防范。",
      "管理认证、双因素认证与账户恢复。",
      "处理购买状态与代币余额。",
    ],
    s3LegalBasis:
      "总体而言，处理依据包括：为运行账户、保存咨询并适用代币的合同或准合同关系；在允许范围内为保护服务、防止滥用并维护安全的正当利益；对适用要求的遵守；以及特定处理所需的同意。",
    s4Title: "4) 聊天与图像隐私",
    s4Intro:
      "您的会话与图像仅与您的账户关联，且仅在您登录使用应用时可访问。服务设计确保您的历史与咨询主题不会在您本人认证访问之外被暴露。",
    s4ControlTitle: "对您会话的控制。",
    s4ControlBody:
      "每位用户对其聊天会话拥有完全控制权：您可以随时在应用的「聊天」部分删除它们。",
    s4DeleteTitle: "永久删除。",
    s4DeleteBody:
      "删除会话后，我们会从运营数据库中永久移除（包括与该会话关联的咨询）。此后系统无法恢复已删除内容，即使您明确要求：不存在恢复功能，产品团队亦无可访问的工作副本。",
    s4PdfTitle: "可选本地副本（PDF 与图像）。",
    s4PdfBody:
      "您可随时从选项面板生成当前会话的 PDF 或下载某次解读的图像，将会话保存在自有环境中。由您决定；文件由您控制（设备、文件夹、个人备份），在您于应用中删除相关会话之前，不会替代或更改服务中托管的历史。",
    s5Title: "5) 处理者与跨境传输",
    s5p1: "为运营本服务，我们使用技术提供方处理崩溃报告与诊断、购买与订阅管理，以及在 Android 上用于防欺诈与安全的设备认证。我们还使用认证、数据库、事务邮件、AI 与支付提供方。我们仅向每个提供方发送其履行职能所必需的数据。",
    s5p2: "部分提供方可能在其他国家处理数据。若国际传输需要保障措施，我们使用公认机制（如标准合同条款），除非另有适用依据。",
    s6Title: "6) 支付与代币",
    s6Body:
      "购买通过专门的购买管理平台管理，并由专门的支付提供方处理。我们不在服务器上存储完整卡号。购买状态会同步以启用代币余额与每会话上限。",
    s7Title: "7) 安全",
    s7Items: [
      "与应用及常见 API 的通信使用 HTTPS（传输加密）。",
      "访问控制与会话验证。",
      "可选双因素认证（验证器应用和／或电子邮件）。",
      "错误与事件监控以保护平台。",
    ],
    s8Title: "8) 保留与删除",
    s8p1: "我们在运营、遵守法律义务及解决争议所需的期间内保留数据。您可请求账户级删除；个别会话由您在应用内管理（见第 4 节）。",
    s8p2: "在应用中删除会话在我们的系统内不可逆：请仅在希望永久清除该历史时确认。仅由基础设施提供方管理的备份或技术日志可能受其自身保留政策约束，且不构成应用内用户可访问的档案。",
    s9Title: "9) 您的权利",
    s9Body:
      "您可通过网站所示官方渠道提出访问、更正、删除、导出或与账户隐私相关的其他请求。我们将在服务运营范围内回应合理请求。",
    s10Title: "10) 政策更新",
    s10BeforeLink:
      "我们可能更新本政策以反映产品改进、监管或运营变化。当前版本即本页所示版本。服务使用同时受 ",
    s10AfterLink: " 约束。",
  },
  ar: {
    ...PRIVACY_EN,
    title: "سياسة الخصوصية",
    lead: "تشرح هذه السياسة كيفية جمع The Original I Ching App للمعلومات واستخدامها وحمايتها والاحتفاظ بها عند استخدام خدمات استشارة I Ching والعظام.",
    lastUpdated: "آخر تحديث: 19 يونيو 2026.",
    s1Title: "1) مزوّد الخدمة",
    s1Body:
      "تعمل The Original I Ching App بوصفها خدمة إرشاد رمزي رقمية. للطلبات المتعلقة بالخصوصية، يمكنك استخدام قنوات التواصل الرسمية المبيّنة على الموقع.",
    s2Title: "2) البيانات التي نجمعها",
    s2Items: [
      "بيانات الحساب والمصادقة: عنوان البريد الإلكتروني، ومعرّف المستخدم، وحالة الجلسة.",
      "المحتوى الناتج عن الاستخدام: الأسئلة والقراءات وبيانات المحادثة والصور المرتبطة بالخدمة. إذا أنشأت ملف PDF أو حفظت صورة من التطبيق، يُنشأ الملف على جهازك الخاص عند طلبك ذلك؛ ولا نتلقى نسخة من هذا الملف تلقائيًا.",
      "الحد الأدنى من البيانات التقنية للعمليات والأمان: عنوان IP وأحداث الأخطاء والمقاييس وسجلات التدقيق.",
      "بيانات الفواتير وشراء الرموز التي تعالجها مزودو البنية التحتية للدفع والفوترة.",
      "معرّفات الجهاز والتثبيت، بالإضافة إلى تشخيصات الأعطال/الأخطاء، التي تجمعها أداة الإبلاغ عن الأعطال للحفاظ على استقرار التطبيق وأمانه.",
    ],
    s3Title: "3) كيف نستخدم بياناتك",
    s3Items: [
      "تقديم الاستشارات والسجل والصور، بما في ذلك خيار إنشاء نسخة محلية على جهازك (PDF المحادثة أو تنزيل الصورة) وفق تقديرك الخاص.",
      "تطبيق حدود الرموز/الجلسات والأمان ومنع إساءة الاستخدام.",
      "إدارة المصادقة والمصادقة الثنائية واستعادة الحساب.",
      "معالجة حالة الشراء ورصيد الرموز.",
    ],
    s3LegalBasis:
      "بشكل عام، تستند المعالجة إلى: العلاقة التعاقدية أو ما قبل التعاقدية لتشغيل حسابك وتخزين الاستشارات وتطبيق الرموز؛ والمصالح المشروعة، حيثما يُسمح، لحماية الخدمة ومنع إساءة الاستخدام والحفاظ على الأمان؛ والامتثال للمتطلبات المعمول بها عند الاقتضاء؛ والموافقة عند اشتراطها لمعالجة محددة.",
    s4Title: "4) خصوصية المحادثات والصور",
    s4Intro:
      "محادثاتك وصورك مرتبطة حصرًا بحسابك ولا يمكن الوصول إليها إلا عند استخدامك التطبيق وأنت مسجّل الدخول. صُمّمت الخدمة بحيث لا يُكشف عن سجلّك وموضوعات استشاراتك خارج وصولك الموثَّق.",
    s4ControlTitle: "التحكم في محادثاتك.",
    s4ControlBody:
      "يتمتع كل مستخدم بالتحكم الكامل في محادثاته: يمكنك حذفها متى شئت من قسم المحادثات في التطبيق.",
    s4DeleteTitle: "الحذف الدائم.",
    s4DeleteBody:
      "عند حذف محادثة، نزيلها بصورة دائمة من قاعدة بياناتنا التشغيلية (بما في ذلك الاستشارات المرتبطة بتلك الجلسة). بعد ذلك، لا تستطيع أنظمتنا استرداد المحتوى المحذوف حتى لو طلبت ذلك صراحةً: لا توجد ميزة استعادة ولا نسخة عمل يمكن لفريق المنتج الوصول إليها.",
    s4PdfTitle: "النسخة المحلية الاختيارية (PDF والصورة).",
    s4PdfBody:
      "يمكنك الاحتفاظ بالمحادثات في بيئتك الخاصة عن طريق إنشاء PDF للمحادثة النشطة أو تنزيل صورة قراءة، متى شئت، من لوحة الخيارات. هذا قرارك أنت: يبقى الملف تحت سيطرتك (الجهاز والمجلد والنسخ الاحتياطية الشخصية) ولا يحل محل السجل المخزّن في الخدمة أو يعدّله حتى تحذف تلك المحادثات في التطبيق.",
    s5Title: "5) المعالجون والنقل",
    s5p1: "لتشغيل الخدمة، نستخدم مزودين تقنيين للإبلاغ عن الأعطال والتشخيصات، وإدارة المشتريات والاشتراكات، وعلى أندرويد، التحقق من سلامة الجهاز لمنع الاحتيال والأمان. كما نستخدم مزودين للمصادقة وقاعدة البيانات والبريد الإلكتروني للمعاملات والذكاء الاصطناعي والمدفوعات. نرسل إلى كل مزود فقط البيانات الضرورية تمامًا لتنفيذ وظيفته.",
    s5p2: "قد يعالج بعض المزودين البيانات في دول أخرى. عند الحاجة إلى ضمانات للنقل الدولي، نستخدم آليات معترفًا بها (مثل البنود التعاقدية المعيارية أو أدوات صالحة أخرى في ذلك الوقت)، ما لم تُطبَّق أسس أخرى.",
    s6Title: "6) المدفوعات والرموز",
    s6Body:
      "تُدار المشتريات عبر منصة متخصصة لإدارة المشتريات وتُعالَج من قِبل مزودي دفع متخصصين. لا نخزّن أرقام البطاقات الكاملة على خوادمنا. تتزامن حالة الشراء لتفعيل رصيد الرموز وحدود المحادثات.",
    s7Title: "7) الأمان",
    s7Items: [
      "التواصل مع التطبيق وواجهات برمجة التطبيقات المعتادة عبر HTTPS (التشفير أثناء النقل).",
      "ضوابط الوصول والتحقق من صحة الجلسة.",
      "آليات المصادقة الثنائية الاختيارية (تطبيق المصادقة و/أو البريد الإلكتروني).",
      "مراقبة الأخطاء/الأحداث لحماية المنصة.",
    ],
    s8Title: "8) الاحتفاظ والحذف",
    s8p1: "نحتفظ بالبيانات بقدر ما هو ضروري للتشغيل والوفاء بالالتزامات القانونية وتسوية النزاعات. يمكنك طلب حذف البيانات على مستوى الحساب؛ أما المحادثات الفردية فأنت من يديرها في التطبيق (انظر القسم 4).",
    s8p2: "حذف المحادثة في التطبيق لا رجعة فيه في نظامنا: أكّد الإجراء فقط إذا أردت إزالة ذلك السجل نهائيًا. قد تخضع النسخ الاحتياطية أو السجلات التقنية التي يديرها مزود البنية التحتية لوحده لسياسات الاحتفاظ الخاصة به، ولا تشكّل أرشيفًا يمكن للمستخدمين الوصول إليه داخل التطبيق.",
    s9Title: "9) حقوقك",
    s9Body:
      "يمكنك طلب الوصول أو التصحيح أو الحذف أو التصدير أو طلبات الخصوصية الأخرى المتعلقة بحسابك عبر القنوات الرسمية المبيّنة على الموقع. سنستجيب للطلبات المعقولة وفق آلية عمل الخدمة.",
    s10Title: "10) تحديثات السياسة",
    s10BeforeLink:
      "قد نحدّث هذه السياسة لتعكس تحسينات المنتج أو التحديثات التنظيمية أو التشغيلية. النسخة الحالية هي تلك المعروضة على هذه الصفحة. استخدام الخدمة يخضع أيضًا لـ ",
    s10AfterLink: ".",
  },
  hi: {
    ...PRIVACY_EN,
    title: "गोपनीयता नीति",
    lead: "यह नीति बताती है कि The Original I Ching App हमारी I Ching और हड्डियाँ परामर्श सेवाओं के उपयोग के दौरान जानकारी कैसे एकत्र करता, उपयोग करता, सुरक्षित रखता और संग्रहीत करता है।",
    lastUpdated: "अंतिम अपडेट: 19 जून 2026।",
    s1Title: "1) सेवा प्रदाता",
    s1Body:
      "The Original I Ching App एक डिजिटल प्रतीकात्मक मार्गदर्शन सेवा के रूप में संचालित होता है। गोपनीयता संबंधी अनुरोधों के लिए, आप साइट पर बताए गए आधिकारिक संपर्क चैनलों का उपयोग कर सकते हैं।",
    s2Title: "2) हम जो डेटा एकत्र करते हैं",
    s2Items: [
      "खाता और प्रमाणीकरण डेटा: ईमेल पता, उपयोगकर्ता पहचानकर्ता और सत्र स्थिति।",
      "उपयोग-जनित सामग्री: प्रश्न, पठन, चैट मेटाडेटा और सेवा से जुड़ी छवियाँ। यदि आप ऐप से PDF बनाते हैं या छवि सहेजते हैं, तो आपके अनुरोध पर आपके डिवाइस पर फ़ाइल बनती है; हम स्वचालित रूप से उस फ़ाइल की प्रति नहीं पाते।",
      "संचालन और सुरक्षा के लिए न्यूनतम तकनीकी डेटा: IP, त्रुटि घटनाएं, मेट्रिक्स और ऑडिट लॉग।",
      "भुगतान और टोकन खरीद डेटा जो भुगतान और बिलिंग बुनियादी ढांचा प्रदाताओं द्वारा संसाधित होता है।",
      "ऐप को स्थिर और सुरक्षित रखने के लिए हमारे क्रैश-रिपोर्टिंग टूल द्वारा एकत्र किए गए डिवाइस और इंस्टॉलेशन पहचानकर्ता, साथ ही क्रैश/त्रुटि निदान जानकारी।",
    ],
    s3Title: "3) हम आपका डेटा कैसे उपयोग करते हैं",
    s3Items: [
      "परामर्श, इतिहास और छवियाँ प्रदान करना, जिसमें आपके विवेक पर आपके डिवाइस पर स्थानीय प्रति (थ्रेड PDF या छवि डाउनलोड) बनाने का विकल्प शामिल है।",
      "टोकन/सत्र सीमाएं, सुरक्षा और दुरुपयोग रोकथाम लागू करना।",
      "प्रमाणीकरण, 2FA और खाता पुनर्प्राप्ति प्रबंधित करना।",
      "खरीद स्थिति और टोकन शेष संसाधित करना।",
    ],
    s3LegalBasis:
      "सामान्य रूप से, प्रसंस्करण इस पर निर्भर करता है: आपके खाते को चलाने, परामर्श संग्रहीत करने और टोकन लागू करने के लिए संविदात्मक या पूर्व-संविदात्मक संबंध; जहां अनुमति हो, सेवा की सुरक्षा, दुरुपयोग रोकने और सुरक्षा बनाए रखने के लिए वैध हित; जब आवश्यक हो लागू आवश्यकताओं का अनुपालन; और जब किसी विशिष्ट प्रसंस्करण की आवश्यकता हो तब सहमति।",
    s4Title: "4) चैट और छवि गोपनीयता",
    s4Intro:
      "आपकी बातचीत और छवियाँ विशेष रूप से आपके खाते से जुड़ी हैं और केवल तब पहुँच योग्य हैं जब आप साइन इन करके ऐप उपयोग करते हैं। सेवा इस तरह डिज़ाइन की गई है कि आपका इतिहास और परामर्श विषय आपके प्रमाणित पहुँच के बाहर नहीं दिखाए जाते।",
    s4ControlTitle: "आपकी बातचीत पर नियंत्रण।",
    s4ControlBody:
      "प्रत्येक उपयोगकर्ता के अपने चैट थ्रेड पर पूर्ण नियंत्रण है: आप जब चाहें ऐप के चैट अनुभाग से उन्हें हटा सकते हैं।",
    s4DeleteTitle: "स्थायी हटाना।",
    s4DeleteBody:
      "जब आप बातचीत हटाते हैं, हम इसे अपने परिचालन डेटाबेस से स्थायी रूप से हटा देते हैं (उस सत्र से जुड़े परामर्श सहित)। उसके बाद, हमारे सिस्टम हटाई गई सामग्री को पुनर्प्राप्त नहीं कर सकते, भले ही आप स्पष्ट रूप से अनुरोध करें: कोई पुनर्स्थापना सुविधा या उत्पाद टीम को पहुँच योग्य कार्यशील प्रति नहीं है।",
    s4PdfTitle: "वैकल्पिक स्थानीय प्रति (PDF और छवि)।",
    s4PdfBody:
      "आप विकल्प पैनल से जब चाहें सक्रिय थ्रेड का PDF बनाकर या पठन छवि डाउनलोड करके अपने वातावरण में बातचीत रख सकते हैं। यह आपका निर्णय है: फ़ाइल आपके नियंत्रण में रहती है (डिवाइस, फ़ोल्डर, व्यक्तिगत बैकअप) और जब तक आप ऐप में उन बातचीतों को हटाते नहीं, यह सेवा में संग्रहीत इतिहास को प्रतिस्थापित या बदलती नहीं है।",
    s5Title: "5) प्रोसेसर और स्थानांतरण",
    s5p1: "सेवा संचालित करने के लिए, हम क्रैश रिपोर्टिंग और निदान, खरीद और सदस्यता प्रबंधन, और Android पर धोखाधड़ी रोकथाम और सुरक्षा के लिए डिवाइस सत्यापन हेतु तकनीकी प्रदाताओं का उपयोग करते हैं। हम प्रमाणीकरण, डेटाबेस, लेनदेन ईमेल, AI और भुगतान प्रदाताओं का भी उपयोग करते हैं। हम प्रत्येक प्रदाता को केवल उसके कार्य के लिए सख्ती से आवश्यक डेटा भेजते हैं।",
    s5p2: "कुछ प्रदाता अन्य देशों में डेटा संसाधित कर सकते हैं। जब अंतरराष्ट्रीय स्थानांतरण के लिए सुरक्षा उपायों की आवश्यकता होती है, हम मान्यता प्राप्त तंत्रों का उपयोग करते हैं (जैसे मानक संविदात्मक खंड या उस समय के अन्य वैध उपकरण), जब तक कोई अन्य आधार लागू न हो।",
    s6Title: "6) भुगतान और टोकन",
    s6Body:
      "खरीद एक विशेष खरीद-प्रबंधन प्लेटफ़ॉर्म के माध्यम से प्रबंधित की जाती है और विशेष भुगतान प्रदाताओं द्वारा संसाधित की जाती है। हम अपने सर्वर पर पूर्ण कार्ड नंबर संग्रहीत नहीं करते। टोकन शेष और थ्रेड सीमाएं सक्षम करने के लिए खरीद स्थिति सिंक की जाती है।",
    s7Title: "7) सुरक्षा",
    s7Items: [
      "ऐप और सामान्य API के साथ संचार HTTPS (पारगमन में एन्क्रिप्शन) का उपयोग करता है।",
      "पहुँच नियंत्रण और सत्र सत्यापन।",
      "वैकल्पिक 2FA तंत्र (authenticator और/या ईमेल)।",
      "प्लेटफॉर्म की सुरक्षा के लिए त्रुटि/घटना निगरानी।",
    ],
    s8Title: "8) प्रतिधारण और हटाना",
    s8p1: "हम डेटा उतने समय तक रखते हैं जितना संचालन, कानूनी दायित्वों के अनुपालन और विवाद समाधान के लिए आवश्यक है। आप खाता स्तर पर डेटा हटाने का अनुरोध कर सकते हैं; व्यक्तिगत चैट आप ऐप में प्रबंधित करते हैं (धारा 4 देखें)।",
    s8p2: "ऐप में चैट हटाना हमारे सिस्टम में अपरिवर्तनीय है: केवल तभी पुष्टि करें जब आप उस इतिहास को हमेशा के लिए हटाना चाहते हों। हमारे बुनियादी ढांचा प्रदाता (होस्टिंग/डेटाबेस) द्वारा प्रबंधित बैकअप या तकनीकी लॉग उनकी अपनी प्रतिधारण नीतियों के अधीन हो सकते हैं और ऐप्लिकेशन के भीतर उपयोगकर्ता-पहुँच योग्य संग्रह नहीं हैं।",
    s9Title: "9) आपके अधिकार",
    s9Body:
      "आप साइट पर बताए गए आधिकारिक चैनलों के माध्यम से पहुँच, सुधार, हटाना, निर्यात या अन्य खाता-संबंधी गोपनीयता अनुरोध कर सकते हैं। हम सेवा संचालन के अनुरूप उचित अनुरोधों का जवाब देंगे।",
    s10Title: "10) नीति अपडेट",
    s10BeforeLink:
      "हम उत्पाद सुधारों, नियामक या परिचालन अपडेट को दर्शाने के लिए इस नीति को अपडेट कर सकते हैं। वर्तमान संस्करण इस पृष्ठ पर दिखाया गया है। सेवा का उपयोग भी ",
    s10AfterLink: " द्वारा नियंत्रित है।",
  },
  ko: {
    ...PRIVACY_EN,
    title: "개인정보 처리방침",
    lead: "본 방침은 The Original I Ching App이 역경·갑골 스타일 상담 서비스 이용 시 정보를 어떻게 수집·이용·보호·보관하는지 설명합니다.",
    lastUpdated: "최종 업데이트: 2026년 6월 19일",
    s1Title: "1) 서비스 제공자",
    s1Body:
      "The Original I Ching App은 상징적 안내를 제공하는 디지털 서비스입니다. 개인정보 관련 요청은 사이트에 안내된 공식 채널을 이용하세요.",
    s2Title: "2) 수집하는 데이터",
    s2Items: [
      "계정 및 인증 데이터: 이메일, 사용자 식별자, 세션 상태.",
      "이용으로 생성된 콘텐츠: 질문, 해석, 채팅 메타데이터, 서비스 관련 이미지. 앱에서 PDF를 만들거나 이미지를 저장하면 요청 시 본인 기기에서 파일이 생성되며, 당사가 자동으로 그 사본을 받지는 않습니다.",
      "운영 및 보안에 필요한 최소 기술 데이터: IP, 오류 이벤트, 지표, 감사 로그.",
      "결제·과금 인프라 제공자가 처리하는 청구 및 토큰 구매 데이터.",
      "앱의 안정성과 보안을 유지하기 위해 당사의 충돌 보고 도구가 수집하는 기기 및 설치 식별자와 충돌/오류 진단 정보.",
    ],
    s3Title: "3) 데이터 이용",
    s3Items: [
      "상담, 기록, 이미지 제공. 전적으로 본인 재량으로 기기에 로컬 사본(스레드 PDF 또는 이미지 다운로드)을 만드는 옵션 포함.",
      "토큰·세션 한도, 보안, 남용 방지 적용.",
      "인증, 2FA, 계정 복구 관리.",
      "구매 상태 및 토큰 잔액 처리.",
    ],
    s3LegalBasis:
      "일반적으로 처리는 다음에 근거합니다: 계정 운영, 상담 저장, 토큰 적용을 위한 계약 또는 계약 전 관계. 허용되는 범위에서 서비스 보호·남용 방지·보안 유지를 위한 정당한 이익. 적용 요건 준수. 특정 처리에 동의가 필요한 경우의 동의.",
    s4Title: "4) 채팅 및 이미지 프라이버시",
    s4Intro:
      "대화와 이미지는 계정에만 연결되며 로그인하여 앱을 사용할 때만 접근 가능합니다. 설계상 기록과 상담 주제는 본인의 인증된 접근 밖으로 노출되지 않습니다.",
    s4ControlTitle: "대화에 대한 통제.",
    s4ControlBody:
      "각 사용자는 채팅 스레드를 완전히 통제합니다. 앱의 채팅 섹션에서 원할 때 삭제할 수 있습니다.",
    s4DeleteTitle: "영구 삭제.",
    s4DeleteBody:
      "대화를 삭제하면 운영 데이터베이스에서 영구 제거됩니다(해당 세션에 연결된 상담 포함). 이후 명시적으로 요청하더라도 삭제된 콘텐츠를 복구할 수 없으며, 복원 기능이나 제품 팀이 접근 가능한 작업 사본은 없습니다.",
    s4PdfTitle: "선택적 로컬 사본(PDF 및 이미지).",
    s4PdfBody:
      "옵션에서 활성 스레드 PDF를 생성하거나 읽기 이미지를 다운로드하여 본인 환경에 대화를 보관할 수 있습니다. 파일은 기기·폴더·개인 백업 등 본인 관리 하에 있으며, 앱에서 해당 대화를 삭제하기 전까지 서비스에 저장된 기록을 대체하거나 변경하지 않습니다.",
    s5Title: "5) 처리업체 및 이전",
    s5p1: "서비스 운영을 위해 충돌 보고 및 진단, 구매 및 구독 관리, Android에서의 부정 방지 및 보안을 위한 기기 검증을 담당하는 기술 제공업체를 이용합니다. 또한 인증, 데이터베이스, 트랜잭션 이메일, AI, 결제 제공업체도 이용합니다. 각 제공업체에는 해당 기능 수행에 엄격히 필요한 데이터만 전송합니다.",
    s5p2: "일부 제공업체는 다른 국가에서 데이터를 처리할 수 있습니다. 국제 이전에 보호 조치가 필요한 경우, 당시 유효한 표준계약조항 등 인정된 수단을 사용합니다(다른 근거가 있는 경우 제외).",
    s6Title: "6) 결제 및 토큰",
    s6Body:
      "구매는 전문 구매 관리 플랫폼을 통해 관리되며 전문 결제 제공업체가 처리합니다. 당사 서버에 전체 카드 번호를 저장하지 않습니다. 구매 상태는 토큰 잔액과 스레드 한도 활성화를 위해 동기화됩니다.",
    s7Title: "7) 보안",
    s7Items: [
      "앱 및 일반 API와의 통신은 HTTPS(전송 중 암호화).",
      "액세스 제어 및 세션 검증.",
      "선택적 2FA(인증 앱 및/또는 이메일).",
      "플랫폼 보호를 위한 오류·이벤트 모니터링.",
    ],
    s8Title: "8) 보관 및 삭제",
    s8p1: "운영, 법적 의무 이행, 분쟁 해결에 필요한 기간 동안 데이터를 보관합니다. 계정 수준 삭제를 요청할 수 있으며, 개별 채팅은 앱에서 본인이 관리합니다(4절 참조).",
    s8p2: "앱에서 채팅을 삭제하면 당사 시스템에서 되돌릴 수 없습니다. 인프라 제공업체만 관리하는 백업 또는 기술 로그는 해당사의 보관 정책을 따를 수 있으며 앱 내 사용자 접근 가능 아카이브가 아닙니다.",
    s9Title: "9) 귀하의 권리",
    s9Body:
      "접근·정정·삭제·보내기 등 계정과 관련된 개인정보 요청은 사이트에 안내된 공식 채널로 제출할 수 있습니다. 서비스 운영 범위에서 합리적인 요청에 응합니다.",
    s10Title: "10) 본 방침의 변경",
    s10BeforeLink:
      "제품 개선, 규제·운영 변경을 반영하기 위해 본 방침을 업데이트할 수 있습니다. 유효한 버전은 본 페이지에 게시된 것입니다. 서비스 이용은 ",
    s10AfterLink: "의 적용을 받습니다.",
  },
};

export function getPrivacyPageMessages(locale: AppLocale): PrivacyPageMessages {
  return PRIVACY_BY_LOCALE[locale] ?? PRIVACY_BY_LOCALE[DEFAULT_LOCALE];
}
