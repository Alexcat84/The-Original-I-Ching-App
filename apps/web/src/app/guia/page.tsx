import Link from "next/link";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";

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
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link>
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
          <li>{isEs ? "No se publican automáticamente ni se comparten por defecto." : "Nothing is auto-published or shared by default."}</li>
          <li>{isEs ? "Para compartir, siempre debes hacerlo tú de forma explícita." : "Sharing is always explicit and user-initiated."}</li>
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
          <li><strong>Free:</strong> {isEs ? "$0 · 2 consultas al mes" : "$0 · 2 consultations / month"}</li>
          <li><strong>Seeker:</strong> {isEs ? "$6.99/mes · $67.10/año" : "$6.99/month · $67.10/year"}</li>
          <li><strong>Practitioner:</strong> {isEs ? "$11.99/mes · $115.10/año" : "$11.99/month · $115.10/year"}</li>
          <li><strong>Master:</strong> {isEs ? "$19.99/mes · $191.90/año" : "$19.99/month · $191.90/year"}</li>
          <li><strong>Oracle:</strong> {isEs ? "$44.99/mes · $431.90/año" : "$44.99/month · $431.90/year"}</li>
        </ul>

        <p>{isEs ? "Límites por plan (consultas al mes / máximo en un mismo chat):" : "Plan limits (monthly consultations / max in same thread):"}</p>
        <ul>
          <li><strong>Free:</strong> {isEs ? "2 al mes · hasta 2 en el mismo chat" : "2/month · up to 2 in one thread"}</li>
          <li><strong>Seeker:</strong> {isEs ? "60 al mes · hasta 3 en el mismo chat" : "60/month · up to 3 in one thread"}</li>
          <li><strong>Practitioner:</strong> {isEs ? "180 al mes · hasta 5 en el mismo chat" : "180/month · up to 5 in one thread"}</li>
          <li><strong>Master:</strong> {isEs ? "500 al mes · hasta 8 en el mismo chat" : "500/month · up to 8 in one thread"}</li>
          <li><strong>Oracle:</strong> {isEs ? "2000 al mes · hasta 10 en el mismo chat" : "2000/month · up to 10 in one thread"}</li>
        </ul>

        <p>
          {isEs
            ? "En resumen: no te limita la cantidad de chats que creas, te limita el número de consultas del mes y el máximo de consultas dentro de un mismo chat según tu plan."
            : "In short: chat count is flexible, while monthly consultations and depth per thread depend on your plan."}
        </p>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">{isEs ? "Documentación sobre el I Ching" : "I Ching documentation"}</Link>
        </p>
      </article>
    </div>
  );
}
