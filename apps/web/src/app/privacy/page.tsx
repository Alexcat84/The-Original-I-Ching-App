import Link from "next/link";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";

function resolveLocale(raw: string | undefined): AppLocale {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return "es";
}

export default function PrivacyPage() {
  const locale = resolveLocale(cookies().get("iching_ui_locale")?.value);
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

        <h2>{isEs ? "1) Responsable del servicio" : "1) Service provider"}</h2>
        <p>
          {isEs
            ? "The Original I Ching App opera como servicio digital de orientación simbólica. Para solicitudes relacionadas con privacidad, puedes usar los canales oficiales publicados en el sitio."
            : "The Original I Ching App operates as a digital symbolic guidance service. For privacy-related requests, you may use the official contact channels published on the site."}
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
              ? "Contenido generado por uso: preguntas, lecturas, metadatos de chat, imágenes y exportaciones."
              : "Usage-generated content: questions, readings, chat metadata, images, and exports."}
          </li>
          <li>
            {isEs
              ? "Datos técnicos mínimos para operación y seguridad: IP, eventos de error, métricas y registros de auditoría."
              : "Minimum technical data for operations and security: IP, error events, metrics, and audit logs."}
          </li>
          <li>
            {isEs
              ? "Datos de facturación/subscripción procesados por proveedores de pago e infraestructura de billing."
              : "Billing/subscription data processed by payment and billing infrastructure providers."}
          </li>
        </ul>

        <h2>{isEs ? "3) Cómo usamos tus datos" : "3) How we use your data"}</h2>
        <ul>
          <li>{isEs ? "Prestar el servicio de consultas, historial e imágenes." : "Provide consultations, history, and images."}</li>
          <li>{isEs ? "Aplicar límites de plan, seguridad y prevención de abuso." : "Apply plan limits, security, and abuse prevention."}</li>
          <li>{isEs ? "Gestionar autenticación, 2FA y recuperación de cuenta." : "Manage authentication, 2FA, and account recovery."}</li>
          <li>{isEs ? "Procesar estado de suscripciones y pagos." : "Process subscription and payment status."}</li>
        </ul>

        <h2>{isEs ? "4) Privacidad de chats e imágenes" : "4) Chat and image privacy"}</h2>
        <p>
          {isEs
            ? "Tus conversaciones e imágenes están asociadas a tu cuenta. No se publican de forma automática ni se comparten de forma viral desde la app. Puedes eliminar conversaciones desde tu historial."
            : "Your conversations and images are tied to your account. They are not auto-published or virally shared from the app. You can delete conversations from your history."}
        </p>

        <h2>{isEs ? "5) Proveedores y transferencias" : "5) Processors and transfers"}</h2>
        <p>
          {isEs
            ? "Para operar el servicio usamos proveedores técnicos (por ejemplo, autenticación, base de datos, email transaccional, IA y pagos). Compartimos únicamente la información necesaria para ejecutar cada función."
            : "To operate the service, we use technical providers (for example, authentication, database, transactional email, AI, and payments). We share only the information required to run each function."}
        </p>

        <h2>{isEs ? "6) Pagos y suscripciones" : "6) Payments and subscriptions"}</h2>
        <p>
          {isEs
            ? "Los pagos son gestionados por proveedores especializados. No almacenamos números completos de tarjeta en nuestros servidores. El estado de suscripción se sincroniza para habilitar límites y funcionalidades del plan."
            : "Payments are handled by specialized providers. We do not store full card numbers on our servers. Subscription status is synced to enable plan limits and features."}
        </p>

        <h2>{isEs ? "7) Seguridad" : "7) Security"}</h2>
        <ul>
          <li>{isEs ? "Controles de acceso y validación de sesión." : "Access controls and session validation."}</li>
          <li>{isEs ? "Mecanismos opcionales de 2FA (autenticador y/o email)." : "Optional 2FA mechanisms (authenticator and/or email)."}</li>
          <li>{isEs ? "Monitoreo de errores y eventos para proteger la plataforma." : "Error/event monitoring to protect the platform."}</li>
        </ul>

        <h2>{isEs ? "8) Retención y eliminación" : "8) Retention and deletion"}</h2>
        <p>
          {isEs
            ? "Conservamos datos mientras sean necesarios para operar, cumplir obligaciones legales y resolver disputas. Puedes solicitar eliminación de datos de cuenta y también borrar chats individuales desde la interfaz."
            : "We retain data as needed to operate, comply with legal obligations, and resolve disputes. You may request account data deletion and also remove individual chats from the interface."}
        </p>

        <h2>{isEs ? "9) Tus derechos" : "9) Your rights"}</h2>
        <p>
          {isEs
            ? "Dependiendo de tu jurisdicción, puedes tener derechos de acceso, rectificación, eliminación, oposición o portabilidad. Atenderemos solicitudes razonables conforme a la normativa aplicable."
            : "Depending on your jurisdiction, you may have rights of access, rectification, deletion, objection, or portability. We will handle reasonable requests under applicable law."}
        </p>

        <h2>{isEs ? "10) Cambios en esta política" : "10) Policy updates"}</h2>
        <p>
          {isEs
            ? "Podemos actualizar esta política para reflejar mejoras del producto, cambios legales o ajustes operativos. La versión vigente será la publicada en esta URL."
            : "We may update this policy to reflect product improvements, legal changes, or operational updates. The current version is the one published at this URL."}
        </p>
      </article>
    </div>
  );
}
