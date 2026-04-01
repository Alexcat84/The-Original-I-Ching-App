import Link from "next/link";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";

function resolveLocale(raw: string | undefined): AppLocale {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return "en";
}

export default async function TermsPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("iching_ui_locale")?.value);
  const isEs = locale === "es";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link> ·{" "}
        <Link href="/guia">{isEs ? "Guía rápida" : "Quick guide"}</Link> ·{" "}
        <Link href="/privacy">{isEs ? "Privacidad" : "Privacy"}</Link>
      </nav>
      <article className="doc-article">
        <h1>{isEs ? "Términos del Servicio" : "Terms of Service"}</h1>
        <p className="doc-lead">
          {isEs
            ? "Estos términos regulan el acceso y uso de The Original I Ching App. Al usar el servicio, aceptas estos términos."
            : "These terms govern access to and use of The Original I Ching App. By using the service, you accept these terms."}
        </p>

        <h2>{isEs ? "1) Naturaleza del servicio" : "1) Service nature"}</h2>
        <p>
          {isEs
            ? "La plataforma ofrece consultas simbólicas en modos I Ching y Huesos con apoyo de IA. Es una herramienta de reflexión personal y no sustituye asesoría profesional médica, legal, financiera o psicológica."
            : "The platform provides symbolic consultations in I Ching and Bones modes with AI support. It is a personal reflection tool and does not replace professional medical, legal, financial, or psychological advice."}
        </p>

        <h2>{isEs ? "2) Elegibilidad y cuenta" : "2) Eligibility and account"}</h2>
        <ul>
          <li>{isEs ? "Debes usar datos de cuenta veraces y mantener la confidencialidad de acceso." : "You must use accurate account data and keep your access credentials confidential."}</li>
          <li>{isEs ? "Eres responsable de la actividad realizada desde tu cuenta." : "You are responsible for activity performed from your account."}</li>
          <li>{isEs ? "Podemos suspender cuentas por abuso, fraude o incumplimiento grave." : "We may suspend accounts for abuse, fraud, or material violations."}</li>
        </ul>

        <h2>{isEs ? "3) Packs de tokens y pagos" : "3) Token packs and payments"}</h2>
        <ul>
          <li>{isEs ? "El servicio usa packs de tokens consumibles y un saldo gratuito inicial único." : "The service uses consumable token packs plus a one-time initial free balance."}</li>
          <li>{isEs ? "No existen cobros recurrentes ni renovaciones automáticas en el modelo actual." : "There are no recurring charges or auto-renewals in the current model."}</li>
          <li>{isEs ? "Los precios pueden actualizarse; cualquier cambio se reflejará en la información comercial vigente." : "Prices may be updated; any change will be reflected in current commercial information."}</li>
        </ul>

        <h2>{isEs ? "4) Uso permitido" : "4) Acceptable use"}</h2>
        <ul>
          <li>{isEs ? "No usar el servicio para actividades ilícitas, fraudulentas o de acoso." : "Do not use the service for unlawful, fraudulent, or harassing activities."}</li>
          <li>{isEs ? "No intentar acceder de forma no autorizada a cuentas, sistemas o datos." : "Do not attempt unauthorized access to accounts, systems, or data."}</li>
          <li>{isEs ? "No automatizar abuso de consultas ni evadir límites técnicos o de tokens." : "Do not automate abusive requests or evade technical or token limits."}</li>
        </ul>

        <h2>{isEs ? "5) Contenido del usuario" : "5) User content"}</h2>
        <p>
          {isEs
            ? "Mantienes titularidad sobre tus preguntas y contenido. Nos concedes una licencia limitada para procesarlo y almacenarlo exclusivamente para operar, mejorar y asegurar el servicio."
            : "You retain ownership of your questions and content. You grant us a limited license to process and store it solely to operate, improve, and secure the service."}
        </p>

        <h2>{isEs ? "6) Disponibilidad y cambios" : "6) Availability and changes"}</h2>
        <p>
          {isEs
            ? "Podemos actualizar funciones, proveedores o arquitectura para mantener calidad, seguridad y rendimiento. No garantizamos disponibilidad ininterrumpida."
            : "We may update features, providers, or architecture to maintain quality, security, and performance. We do not guarantee uninterrupted availability."}
        </p>

        <h2>{isEs ? "7) Descargos y límites de responsabilidad" : "7) Disclaimers and liability limits"}</h2>
        <ul>
          <li>{isEs ? "Las lecturas son de carácter simbólico e interpretativo." : "Readings are symbolic and interpretive in nature."}</li>
          <li>{isEs ? "No garantizamos resultados personales, económicos o de salud derivados del uso." : "We do not guarantee personal, financial, or health outcomes from use."}</li>
          <li>{isEs ? "En la máxima medida permitida por ley, limitamos responsabilidad por daños indirectos o consecuentes." : "To the maximum extent permitted by law, we limit liability for indirect or consequential damages."}</li>
        </ul>

        <h2>{isEs ? "8) Terminación" : "8) Termination"}</h2>
        <p>
          {isEs
            ? "Puedes dejar de usar el servicio en cualquier momento. Podemos suspender o terminar acceso por incumplimientos, riesgo de seguridad o requerimiento legal."
            : "You may stop using the service at any time. We may suspend or terminate access for violations, security risk, or legal requirements."}
        </p>

        <h2>{isEs ? "9) Ley aplicable" : "9) Governing law"}</h2>
        <p>
          {isEs
            ? "Estos términos se interpretan conforme a la ley aplicable según tu jurisdicción y los acuerdos con proveedores de pago y plataforma."
            : "These terms are interpreted under applicable law according to your jurisdiction and agreements with payment/platform providers."}
        </p>

        <h2>{isEs ? "10) Contacto" : "10) Contact"}</h2>
        <p>
          {isEs
            ? "Para dudas sobre estos términos o sobre privacidad, utiliza los canales oficiales publicados en el sitio."
            : "For questions about these terms or privacy, use the official contact channels published on the site."}
        </p>
      </article>
    </div>
  );
}
