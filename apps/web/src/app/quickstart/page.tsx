import Link from "next/link";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";

function resolveLocale(raw: string | undefined): AppLocale {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return "es";
}

export default function QuickStartPage() {
  const locale = resolveLocale(cookies().get("iching_ui_locale")?.value);
  const isEs = locale === "es";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link> ·{" "}
        <Link href="/notes">{isEs ? "Notas de métodos" : "Method notes"}</Link>
      </nav>
      <article className="doc-article">
        <h1>{isEs ? "Quickstart: cómo usar la app" : "Quickstart: how to use the app"}</h1>
        <p className="doc-lead">
          {isEs
            ? "Esta guía es práctica: solo cómo usar I Ching, Huesos y las opciones del panel inferior."
            : "This guide is practical: only how to use I Ching, Bones, and the options in the bottom panel."}
        </p>

        <h2>{isEs ? "1) Elige el modo de consulta" : "1) Choose consultation mode"}</h2>
        <ul>
          <li>
            <strong>I Ching</strong> —{" "}
            {isEs
              ? "lectura por hexagramas y líneas. Úsalo para preguntas abiertas y reflexión amplia."
              : "hexagram-and-lines reading. Use it for open questions and broad reflection."}
          </li>
          <li>
            <strong>{isEs ? "Huesos" : "Bones"}</strong> —{" "}
            {isEs
              ? "lectura de sí/no por patrón de grietas. Úsalo para validar dirección o decisión puntual."
              : "yes/no crack-pattern reading. Use it to validate direction or a specific decision."}
          </li>
        </ul>

        <h2>{isEs ? "2) Elige modo de lectura" : "2) Choose reading style"}</h2>
        <ul>
          <li>
            <strong>{isEs ? "Directo" : "Direct"}</strong> —{" "}
            {isEs ? "respuesta corta y clara." : "short and clear response."}
          </li>
          <li>
            <strong>{isEs ? "Ritual" : "Ritual"}</strong> —{" "}
            {isEs ? "respuesta más extensa y ceremonial." : "longer and more ceremonial response."}
          </li>
          <li>
            <strong>{isEs ? "Profundizar" : "Deepen"}</strong> —{" "}
            {isEs
              ? "continúa sobre el mismo tema dentro del chat actual."
              : "continues on the same topic inside the current chat thread."}
          </li>
        </ul>

        <h2>{isEs ? "3) Usa el panel Options" : "3) Use the Options panel"}</h2>
        <ul>
          <li>{isEs ? "Cambias entre I Ching y Huesos." : "Switch between I Ching and Bones."}</li>
          <li>{isEs ? "Cambias el estilo de lectura (Directo/Ritual/Profundizar)." : "Switch reading style (Direct/Ritual/Deepen)."}</li>
          <li>{isEs ? "Gestionas seguridad 2FA opcional." : "Manage optional 2FA security."}</li>
          <li>{isEs ? "Accedes a enlaces rápidos: notas, privacidad y términos." : "Access quick links: notes, privacy, and terms."}</li>
        </ul>

        <h2>{isEs ? "4) Resultados y exportación" : "4) Results and export"}</h2>
        <ul>
          <li>{isEs ? "Cada consulta puede traer interpretación + imagen." : "Each consultation can include interpretation + image."}</li>
          <li>{isEs ? "Puedes descargar imagen y exportar el chat a PDF." : "You can download images and export chat to PDF."}</li>
          <li>{isEs ? "Puedes eliminar chats desde el historial." : "You can delete chats from history."}</li>
        </ul>
      </article>
    </div>
  );
}
