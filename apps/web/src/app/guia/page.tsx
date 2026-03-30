import Link from "next/link";
import { cookies } from "next/headers";
import { CONTEXT_LIMITS } from "@iching-oracle/context-engine";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import {
  ANNUAL_PLAN_DISCOUNT,
  annualPriceUsd,
  FREE_LIFETIME_CONSULTATIONS,
  MASTER_CONSULTATIONS_PER_MONTH,
  ORACLE_CONSULTATIONS_PER_MONTH,
  PRACTITIONER_CONSULTATIONS_PER_MONTH,
  SEEKER_CONSULTATIONS_PER_MONTH,
  TIER_MONTHLY_PRICES_USD,
} from "@/lib/tier-billing-constants";

function resolveLocale(raw: string | undefined): AppLocale {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return "es";
}

export default function GuiaRapidaPage() {
  const locale = resolveLocale(cookies().get("iching_ui_locale")?.value);
  const isEs = locale === "es";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link> ·{" "}
        <Link href="/quickstart">{isEs ? "Quickstart" : "Quickstart"}</Link> ·{" "}
        <Link href="/notes">{isEs ? "Notas de métodos" : "Method notes"}</Link>
      </nav>
      <article className="doc-article">
        <h1>{isEs ? "Guía rápida de uso" : "Quick usage guide"}</h1>
        <p className="doc-lead">
          {isEs ? (
            <>
              Esta app te permite consultar en dos estilos: <strong>I Ching</strong> y <strong>Huesos</strong>. Es una
              herramienta de reflexión y orientación simbólica. No sustituye consejo médico, legal o financiero.
            </>
          ) : (
            <>
              This app offers two consultation styles: <strong>I Ching</strong> and <strong>Bones</strong>. It is a
              symbolic reflection tool and should not replace medical, legal, or financial advice.
            </>
          )}
        </p>

        <h2>{isEs ? "Privacidad" : "Privacy"}</h2>
        <ul>
          <li>{isEs ? "Tus chats e imágenes son privados de tu cuenta." : "Your chats and images are private to your account."}</li>
          <li>{isEs ? "No existe publicación ni compartido viral de lecturas." : "There is no public/viral sharing for readings."}</li>
          <li>{isEs ? "La salida externa permitida es descarga de imagen y exportación PDF." : "The only outbound options are image download and PDF export."}</li>
        </ul>

        <h2>{isEs ? "Chats y sesiones" : "Chats and sessions"}</h2>
        <ul>
          <li>
            <strong>{isEs ? "Chats" : "Chats"}</strong> {isEs ? "abre tu historial." : "opens your history."}
          </li>
          <li>
            <strong>{isEs ? "Nueva sesión" : "New session"}</strong>{" "}
            {isEs ? "inicia un chat nuevo para cambiar de tema o empezar desde cero." : "starts a fresh thread for a new topic."}
          </li>
          <li>{isEs ? "No hay un número fijo de chats: puedes crear nuevos chats cuando quieras." : "There is no fixed chat count: create as many threads as you need."}</li>
          <li>{isEs ? "Lo que sí cambia por plan es cuántas consultas puedes hacer al mes y cuántas caben en un mismo chat." : "What changes by plan is monthly consultations and max depth per thread."}</li>
        </ul>

        <h2>{isEs ? "Opciones (barra inferior)" : "Options (bottom panel)"}</h2>
        <p>
          {isEs
            ? "En Opciones eliges el tipo de consulta y la forma de respuesta."
            : "In Options you choose consultation type and response style."}
        </p>
        <ul>
          <li>
            <strong>I Ching</strong> — {isEs ? "lectura por hexagrama y líneas." : "hexagram and line-based reading."}
          </li>
          <li>
            <strong>{isEs ? "Huesos" : "Bones"}</strong> —{" "}
            {isEs ? "formato sí/no con lectura simbólica de grietas." : "yes/no format with symbolic crack reading."}
          </li>
        </ul>

        <h2 id="modos-lectura">{isEs ? "Modos de lectura" : "Reading modes"}</h2>
        <ul>
          <li>
            <strong>{isEs ? "Directo" : "Direct"}</strong> —{" "}
            {isEs ? "respuesta breve y clara." : "short and clear answer."}
          </li>
          <li>
            <strong>{isEs ? "Ritual" : "Ritual"}</strong> —{" "}
            {isEs ? "respuesta más desarrollada y ceremonial." : "more elaborate ceremonial response."}
          </li>
          <li>
            <strong>{isEs ? "Profundizar" : "Deepen"}</strong> —{" "}
            {isEs ? "seguimiento de lo que ya venías preguntando en ese mismo chat." : "follow-up continuity in the same thread."}
          </li>
        </ul>

        <h2>{isEs ? "Exportar y guardar" : "Export and save"}</h2>
        <p>
          {isEs
            ? "Puedes descargar la imagen de la lectura y exportar el chat actual a PDF."
            : "You can download the reading image and export the current thread to PDF."}
        </p>

        <h2 id="planes">{isEs ? "Planes y pagos" : "Plans and pricing"}</h2>
        <p>{isEs ? "Precios actuales:" : "Current pricing:"}</p>
        <ul>
          <li>
            <strong>Free:</strong>{" "}
            {isEs
              ? `$0 · ${FREE_LIFETIME_CONSULTATIONS} consultas de prueba (lifetime)`
              : `$0 · ${FREE_LIFETIME_CONSULTATIONS} lifetime trial consultations`}
          </li>
          <li>
            <strong>Seeker:</strong>{" "}
            {isEs
              ? `$${TIER_MONTHLY_PRICES_USD.seeker}/mes · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.seeker)}/año`
              : `$${TIER_MONTHLY_PRICES_USD.seeker}/month · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.seeker)}/year`}
          </li>
          <li>
            <strong>Practitioner:</strong>{" "}
            {isEs
              ? `$${TIER_MONTHLY_PRICES_USD.practitioner}/mes · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.practitioner)}/año`
              : `$${TIER_MONTHLY_PRICES_USD.practitioner}/month · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.practitioner)}/year`}
          </li>
          <li>
            <strong>Master:</strong>{" "}
            {isEs
              ? `$${TIER_MONTHLY_PRICES_USD.master}/mes · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.master)}/año`
              : `$${TIER_MONTHLY_PRICES_USD.master}/month · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.master)}/year`}
          </li>
          <li>
            <strong>Oracle:</strong>{" "}
            {isEs
              ? `$${TIER_MONTHLY_PRICES_USD.oracle}/mes · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.oracle)}/año`
              : `$${TIER_MONTHLY_PRICES_USD.oracle}/month · $${annualPriceUsd(TIER_MONTHLY_PRICES_USD.oracle)}/year`}
          </li>
        </ul>
        <p>
          {isEs
            ? `Plan anual: ahorro exacto del ${Math.round(ANNUAL_PLAN_DISCOUNT * 100)}% frente al pago mes a mes.`
            : `Annual plan: exact ${Math.round(ANNUAL_PLAN_DISCOUNT * 100)}% savings vs month-to-month.`}
        </p>

        <p>{isEs ? "Límites por plan (consultas al mes / máximo en un mismo chat):" : "Plan limits (monthly consultations / max in same thread):"}</p>
        <ul>
          <li>
            <strong>Free:</strong>{" "}
            {isEs
              ? `${FREE_LIFETIME_CONSULTATIONS} lifetime · sin continuidad en hilo (1 por sesión)`
              : `${FREE_LIFETIME_CONSULTATIONS} lifetime · no thread continuity (1 per session)`}
          </li>
          <li>
            <strong>Seeker:</strong>{" "}
            {isEs
              ? `${SEEKER_CONSULTATIONS_PER_MONTH} al mes (mensual o anual) · hasta ${CONTEXT_LIMITS.seeker.sessionDepth} en el mismo chat`
              : `${SEEKER_CONSULTATIONS_PER_MONTH}/month (monthly or annual) · up to ${CONTEXT_LIMITS.seeker.sessionDepth} in one thread`}
          </li>
          <li>
            <strong>Practitioner:</strong>{" "}
            {isEs
              ? `${PRACTITIONER_CONSULTATIONS_PER_MONTH} al mes · hasta ${CONTEXT_LIMITS.practitioner.sessionDepth} en el mismo chat`
              : `${PRACTITIONER_CONSULTATIONS_PER_MONTH}/month · up to ${CONTEXT_LIMITS.practitioner.sessionDepth} in one thread`}
          </li>
          <li>
            <strong>Master:</strong>{" "}
            {isEs
              ? `${MASTER_CONSULTATIONS_PER_MONTH} al mes · hasta ${CONTEXT_LIMITS.master.sessionDepth} en el mismo chat`
              : `${MASTER_CONSULTATIONS_PER_MONTH}/month · up to ${CONTEXT_LIMITS.master.sessionDepth} in one thread`}
          </li>
          <li>
            <strong>Oracle:</strong>{" "}
            {isEs
              ? `${ORACLE_CONSULTATIONS_PER_MONTH} al mes · hasta ${CONTEXT_LIMITS.oracle.sessionDepth} en el mismo chat`
              : `${ORACLE_CONSULTATIONS_PER_MONTH}/month · up to ${CONTEXT_LIMITS.oracle.sessionDepth} in one thread`}
          </li>
        </ul>

        <p>
          {isEs
            ? "En resumen: no te limita la cantidad de chats que creas, te limita el número de consultas del mes y el máximo de consultas dentro de un mismo chat según tu plan."
            : "In short: chat count is flexible, while monthly consultations and depth per thread depend on your plan."}
        </p>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">{isEs ? "Documentación sobre el I Ching" : "I Ching documentation"}</Link> ·{" "}
          <Link href="/privacy">{isEs ? "Política de Privacidad" : "Privacy Policy"}</Link> ·{" "}
          <Link href="/terms">{isEs ? "Términos del Servicio" : "Terms of Service"}</Link>
        </p>
      </article>
    </div>
  );
}
