import Link from "next/link";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import { FREE_TOKENS, TOKEN_PACKS } from "@/lib/token-packs";

function resolveLocale(raw: string | undefined): AppLocale {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return "es";
}

export default async function GuiaRapidaPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get("iching_ui_locale")?.value);
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

        <h2 id="planes">{isEs ? "Packs y pagos" : "Packs and pricing"}</h2>
        <p>{isEs ? "Precios actuales:" : "Current pricing:"}</p>
        <ul>
          <li>
            <strong>Free:</strong>{" "}
            {isEs
              ? `$0 · ${FREE_TOKENS} consultas gratuitas de por vida`
              : `$0 · ${FREE_TOKENS} free lifetime consultations`}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_seeker_20.label}:</strong>{" "}
            {isEs
              ? `$${TOKEN_PACKS.tokens_seeker_20.price} · ${TOKEN_PACKS.tokens_seeker_20.tokens} tokens`
              : `$${TOKEN_PACKS.tokens_seeker_20.price} · ${TOKEN_PACKS.tokens_seeker_20.tokens} tokens`}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_practitioner_40.label}:</strong>{" "}
            {isEs
              ? `$${TOKEN_PACKS.tokens_practitioner_40.price} · ${TOKEN_PACKS.tokens_practitioner_40.tokens} tokens`
              : `$${TOKEN_PACKS.tokens_practitioner_40.price} · ${TOKEN_PACKS.tokens_practitioner_40.tokens} tokens`}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_master_100.label}:</strong>{" "}
            {isEs
              ? `$${TOKEN_PACKS.tokens_master_100.price} · ${TOKEN_PACKS.tokens_master_100.tokens} tokens`
              : `$${TOKEN_PACKS.tokens_master_100.price} · ${TOKEN_PACKS.tokens_master_100.tokens} tokens`}
          </li>
        </ul>
        <p>{isEs ? "Límites por hilo (control de contexto):" : "Per-thread limits (context control):"}</p>
        <ul>
          <li>
            <strong>Free:</strong>{" "}
            {isEs
              ? `${FREE_TOKENS} tokens de por vida · 1 pregunta por hilo`
              : `${FREE_TOKENS} lifetime tokens · 1 question per thread`}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_seeker_20.label}:</strong>{" "}
            {isEs
              ? `${TOKEN_PACKS.tokens_seeker_20.tokens} tokens por compra · hasta ${TOKEN_PACKS.tokens_seeker_20.sessionLimit} preguntas por hilo`
              : `${TOKEN_PACKS.tokens_seeker_20.tokens} tokens per purchase · up to ${TOKEN_PACKS.tokens_seeker_20.sessionLimit} questions per thread`}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_practitioner_40.label}:</strong>{" "}
            {isEs
              ? `${TOKEN_PACKS.tokens_practitioner_40.tokens} tokens por compra · hasta ${TOKEN_PACKS.tokens_practitioner_40.sessionLimit} preguntas por hilo`
              : `${TOKEN_PACKS.tokens_practitioner_40.tokens} tokens per purchase · up to ${TOKEN_PACKS.tokens_practitioner_40.sessionLimit} questions per thread`}
          </li>
          <li>
            <strong>{TOKEN_PACKS.tokens_master_100.label}:</strong>{" "}
            {isEs
              ? `${TOKEN_PACKS.tokens_master_100.tokens} tokens por compra · hasta ${TOKEN_PACKS.tokens_master_100.sessionLimit} preguntas por hilo`
              : `${TOKEN_PACKS.tokens_master_100.tokens} tokens per purchase · up to ${TOKEN_PACKS.tokens_master_100.sessionLimit} questions per thread`}
          </li>
        </ul>

        <p>
          {isEs
            ? "En resumen: no hay renovaciones automáticas. Gastas tokens por consulta y puedes comprar más cuando quieras."
            : "In short: there is no recurring billing. You spend one token per consultation and can buy more anytime."}
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
