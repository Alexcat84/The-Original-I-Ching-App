import Link from "next/link";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function PrivacyPage() {
  const locale = await resolveDocLocale();
  const isEs = locale === "es";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link> ·{" "}
        <Link href="/guia">{isEs ? "Guía rápida" : "Quick guide"}</Link> ·{" "}
        <Link href="/terms">{isEs ? "Términos" : "Terms"}</Link>
      </nav>
      <article className="doc-article">
        <h1>{isEs ? "Política de Privacidad" : "Privacy Policy"}</h1>
        <p className="doc-lead">
          {isEs
            ? "Esta política explica cómo The Original I Ching App recopila, usa, protege y conserva la información cuando utilizas nuestros servicios de consulta I Ching y Huesos."
            : "This policy explains how The Original I Ching App collects, uses, protects, and retains information when you use our I Ching and Bones consultation services."}
        </p>
        <p className="doc-meta" style={{ opacity: 0.85, fontSize: "0.95rem" }}>
          {isEs ? "Última actualización: 1 de abril de 2026." : "Last updated: April 1, 2026."}
        </p>

        <h2>{isEs ? "1) Responsable del servicio" : "1) Service provider"}</h2>
        <p>
          {isEs
            ? "The Original I Ching App opera como servicio digital de orientación simbólica. Para solicitudes relacionadas con privacidad, puedes usar los canales oficiales indicados en el sitio."
            : "The Original I Ching App operates as a digital symbolic guidance service. For privacy-related requests, you may use the official contact channels indicated on the site."}
        </p>

        <h2>{isEs ? "2) Qué datos recopilamos" : "2) Data we collect"}</h2>
        <ul>
          <li>
            {isEs
              ? "Datos de cuenta y autenticación: correo electrónico, identificador de usuario y estado de sesión."
              : "Account and authentication data: email address, user identifier, and session status."}
          </li>
          <li>
            {isEs
              ? "Contenido generado por uso: preguntas, lecturas, metadatos de chat e imágenes asociadas al servicio. Si generas un PDF o guardas una imagen desde la app, el archivo se produce en tu propio dispositivo cuando tú lo solicitas; no recibimos automáticamente una copia de ese archivo."
              : "Usage-generated content: questions, readings, chat metadata, and images tied to the service. If you generate a PDF or save an image from the app, the file is created on your own device when you request it; we do not automatically receive a copy of that file."}
          </li>
          <li>
            {isEs
              ? "Datos técnicos mínimos para operación y seguridad: IP, eventos de error, métricas y registros de auditoría."
              : "Minimum technical data for operations and security: IP, error events, metrics, and audit logs."}
          </li>
          <li>
            {isEs
              ? "Datos de facturación y compras de tokens procesados por proveedores de pago e infraestructura de billing."
              : "Billing and token-purchase data processed by payment and billing infrastructure providers."}
          </li>
        </ul>

        <h2>{isEs ? "3) Cómo usamos tus datos" : "3) How we use your data"}</h2>
        <ul>
          <li>
            {isEs
              ? "Prestar el servicio de consultas, historial e imágenes, incluida la posibilidad de que generes en tu dispositivo una copia local (PDF del hilo o descarga de imagen) bajo tu propia discreción."
              : "Provide consultations, history, and images, including the option for you to create a local copy on your device (thread PDF or image download) at your sole discretion."}
          </li>
          <li>{isEs ? "Aplicar límites de tokens/sesión, seguridad y prevención de abuso." : "Apply token/session limits, security, and abuse prevention."}</li>
          <li>{isEs ? "Gestionar autenticación, 2FA y recuperación de cuenta." : "Manage authentication, 2FA, and account recovery."}</li>
          <li>{isEs ? "Procesar estado de compras y saldo de tokens." : "Process purchase status and token balance."}</li>
        </ul>
        <p>
          {isEs
            ? "En términos generales, el tratamiento se apoya en: la relación contractual o precontractual para operar tu cuenta, guardar consultas y aplicar tokens; el interés legítimo, cuando aplique la normativa, para proteger el servicio, prevenir abuso y mantener la seguridad; el cumplimiento de obligaciones legales cuando corresponda; y el consentimiento cuando un tratamiento concreto lo exija según la ley de tu jurisdicción."
            : "In general terms, processing relies on: the contractual or pre-contractual relationship to run your account, store consultations, and apply tokens; legitimate interests, where applicable law allows, to protect the service, prevent abuse, and maintain security; compliance with legal obligations where required; and consent when a specific processing requires it under the law of your jurisdiction."}
        </p>

        <h2>{isEs ? "4) Privacidad de chats e imágenes" : "4) Chat and image privacy"}</h2>
        <p>
          {isEs
            ? "Tus conversaciones e imágenes quedan asociadas exclusivamente a tu cuenta y solo son accesibles cuando utilizas la aplicación con tu sesión iniciada. El diseño del servicio no expone tu historial ni tus temas de consulta fuera de tu propio acceso autenticado."
            : "Your conversations and images are tied exclusively to your account and are only accessible when you use the app while signed in. The service is designed so your history and consultation topics are not exposed outside your own authenticated access."}
        </p>
        <p>
          <strong>{isEs ? "Control de tus conversaciones." : "Control over your conversations."}</strong>{" "}
          {isEs
            ? "Cada usuario tiene control total sobre sus chats (hilos de conversación): puedes eliminarlos cuando lo consideres conveniente, desde la sección Chats de la aplicación."
            : "Each user has full control over their chat threads: you may delete them whenever you choose, from the Chats section of the app."}
        </p>
        <p>
          <strong>{isEs ? "Eliminación permanente." : "Permanent deletion."}</strong>{" "}
          {isEs
            ? "Cuando eliminas una conversación, la borramos de forma permanente de nuestra base de datos operativa (incluidas las consultas vinculadas a esa sesión). A partir de ese momento, nuestro sistema no es capaz de recuperar el contenido eliminado, ni aunque el usuario nos lo solicite expresamente: no existe función de restauración ni copia de trabajo accesible para el equipo del producto."
            : "When you delete a conversation, we permanently remove it from our operational database (including consultations linked to that session). After that, our systems cannot recover the deleted content, even if you explicitly ask us to: there is no restore feature or working copy accessible to the product team."}
        </p>
        <p>
          <strong>{isEs ? "Copia local opcional (PDF e imagen)." : "Optional local copy (PDF and image)."}</strong>{" "}
          {isEs
            ? "Puedes guardar tus conversaciones en tu propio entorno generando un PDF del hilo activo o descargando la imagen de una lectura, cuando lo consideres conveniente, desde el panel Opciones. Es una decisión tuya: el archivo queda bajo tu control (dispositivo, carpeta, copias de seguridad personales) y no sustituye ni modifica el historial alojado en el servicio hasta que tú borres esas conversaciones en la app."
            : "You may keep conversations in your own environment by generating a PDF of the active thread or downloading a reading image, whenever you choose, from the Options panel. This is your decision: the file stays under your control (device, folder, personal backups) and does not replace or change the history stored in the service until you delete those conversations in the app."}
        </p>

        <h2>{isEs ? "5) Proveedores y transferencias" : "5) Processors and transfers"}</h2>
        <p>
          {isEs
            ? "Para operar el servicio usamos proveedores técnicos (por ejemplo, autenticación, base de datos, email transaccional, IA y pagos). Solo enviamos a esos proveedores los datos estrictamente necesarios para ejecutar cada función."
            : "To operate the service, we use technical providers (for example, authentication, database, transactional email, AI, and payments). We only send those providers the data strictly necessary to run each function."}
        </p>
        <p>
          {isEs
            ? "Algunos proveedores pueden tratar datos en otros países. Cuando la normativa aplicable (por ejemplo, en el Espacio Económico Europeo o el Reino Unido) exija garantías para transferencias internacionales, utilizamos mecanismos reconocidos (como cláusulas contractuales tipo u otras herramientas válidas en su momento), salvo que exista otra base legal aplicable."
            : "Some providers may process data in other countries. Where applicable law (for example, in the European Economic Area or the United Kingdom) requires safeguards for international transfers, we use recognized mechanisms (such as standard contractual clauses or other valid tools at the time), unless another legal basis applies."}
        </p>

        <h2>{isEs ? "6) Pagos y tokens" : "6) Payments and tokens"}</h2>
        <p>
          {isEs
            ? "Los pagos son gestionados por proveedores especializados. No almacenamos números completos de tarjeta en nuestros servidores. El estado de compra se sincroniza para habilitar saldo de tokens y límites por hilo."
            : "Payments are handled by specialized providers. We do not store full card numbers on our servers. Purchase status is synced to enable token balance and thread limits."}
        </p>

        <h2>{isEs ? "7) Seguridad" : "7) Security"}</h2>
        <ul>
          <li>
            {isEs
              ? "Comunicaciones con la aplicación y APIs habituales sobre HTTPS (cifrado en tránsito)."
              : "Communication with the app and typical APIs uses HTTPS (encryption in transit)."}
          </li>
          <li>{isEs ? "Controles de acceso y validación de sesión." : "Access controls and session validation."}</li>
          <li>{isEs ? "Mecanismos opcionales de 2FA (autenticador y/o email)." : "Optional 2FA mechanisms (authenticator and/or email)."}</li>
          <li>{isEs ? "Monitoreo de errores y eventos para proteger la plataforma." : "Error/event monitoring to protect the platform."}</li>
        </ul>

        <h2>{isEs ? "8) Retención y eliminación" : "8) Retention and deletion"}</h2>
        <p>
          {isEs
            ? "Conservamos datos mientras sean necesarios para operar, cumplir obligaciones legales y resolver disputas. Puedes solicitar eliminación de datos de cuenta; los chats individuales los gestionas tú desde la interfaz (véase la sección 4)."
            : "We retain data as needed to operate, comply with legal obligations, and resolve disputes. You may request account-level data deletion; individual chats are managed by you in the app (see section 4)."}
        </p>
        <p>
          {isEs
            ? "La eliminación de un chat desde la app es irreversible en nuestro sistema: confirma la acción solo si deseas borrar de forma definitiva ese historial. Las copias de seguridad o registros técnicos que gestione exclusivamente nuestro proveedor de infraestructura (hosting/base de datos) pueden estar sujetos a sus propias políticas de retención y no constituyen un archivo consultable por el usuario dentro de la aplicación."
            : "Deleting a chat in the app is irreversible in our system: confirm the action only if you want that history removed for good. Backups or technical logs managed solely by our infrastructure provider (hosting/database) may be subject to their own retention policies and do not constitute a user-accessible archive inside the application."}
        </p>

        <h2>{isEs ? "9) Tus derechos" : "9) Your rights"}</h2>
        <p>
          {isEs
            ? "Según tu jurisdicción, puedes tener derechos de acceso, rectificación, supresión («derecho al olvido»), limitación del tratamiento, oposición y portabilidad de los datos. Atenderemos solicitudes razonables conforme a la normativa aplicable, a través de los canales indicados en el sitio."
            : "Depending on your jurisdiction, you may have rights of access, rectification, erasure (“right to be forgotten”), restriction of processing, objection, and data portability. We will handle reasonable requests under applicable law through the channels indicated on the site."}
        </p>

        <h2>{isEs ? "10) Cambios en esta política" : "10) Policy updates"}</h2>
        <p>
          {isEs
            ? "Podemos actualizar esta política para reflejar mejoras del producto, cambios legales o ajustes operativos. La versión vigente es la que se muestra en esta página. El uso del servicio también se rige por los "
            : "We may update this policy to reflect product improvements, legal changes, or operational updates. The current version is the one shown on this page. Use of the service is also governed by the "}
          <Link href="/terms">{isEs ? "Términos del Servicio" : "Terms of Service"}</Link>
          {isEs ? "." : "."}
        </p>
      </article>
    </div>
  );
}
