import Link from "next/link";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function QuickStartPage() {
  const locale = await resolveDocLocale();
  const isEs = locale === "es";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link> ·{" "}
        <Link href="/guia">{isEs ? "Guía rápida" : "Quick guide"}</Link> ·{" "}
        <Link href="/notes">{isEs ? "Notas de métodos" : "Method notes"}</Link> ·{" "}
        <Link href="/privacy">{isEs ? "Privacidad" : "Privacy"}</Link> ·{" "}
        <Link href="/terms">{isEs ? "Términos" : "Terms"}</Link>
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

        <h2>{isEs ? "2) Usa el panel Opciones" : "2) Use the Options panel"}</h2>
        <ul>
          <li>{isEs ? "Cambias entre I Ching y Huesos." : "Switch between I Ching and Bones."}</li>
          <li>
            {isEs
              ? "Ves el estado de profundidad del hilo activo (cuántas lecturas encadenadas permite tu plan en ese chat)."
              : "See active thread depth status (how many chained readings your plan allows in that chat)."}
          </li>
          <li>{isEs ? "Gestionas tokens y compra de packs." : "Manage tokens and pack purchases."}</li>
          <li>{isEs ? "Gestionas seguridad 2FA opcional." : "Manage optional 2FA security."}</li>
          <li>{isEs ? "Accedes a documentación y textos legales al final del panel." : "Documentation and legal links are at the bottom of the panel."}</li>
        </ul>

        <h2>{isEs ? "3) Resultados y copia local" : "3) Results and local copy"}</h2>
        <ul>
          <li>{isEs ? "Cada consulta puede traer interpretación + imagen." : "Each consultation can include interpretation + image."}</li>
          <li>
            {isEs
              ? "Si quieres conservar un registro fuera de la app, en Opciones puedes descargar la imagen y exportar el hilo actual a PDF; es opcional y el archivo se guarda en tu dispositivo bajo tu criterio."
              : "If you want a record outside the app, Options lets you download the image and export the current thread to PDF; this is optional and the file is saved on your device at your discretion."}
          </li>
          <li>{isEs ? "Puedes eliminar chats desde el historial (Chats)." : "You can delete chats from history (Chats)."}</li>
        </ul>
      </article>
    </div>
  );
}
