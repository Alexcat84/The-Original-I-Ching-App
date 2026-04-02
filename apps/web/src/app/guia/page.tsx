import Link from "next/link";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";
import { FREE_TIER_MARKETING, FREE_TOKENS, PACK_IDS_ORDERED, TOKEN_PACKS } from "@/lib/token-packs";

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
        <Link href="/notes">{isEs ? "Notas de métodos" : "Method notes"}</Link> ·{" "}
        <Link href="/privacy">{isEs ? "Privacidad" : "Privacy"}</Link> ·{" "}
        <Link href="/terms">{isEs ? "Términos" : "Terms"}</Link>
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
          <li>{isEs ? "Tus chats e imágenes quedan asociados a tu cuenta y solo son accesibles con tu sesión iniciada." : "Your chats and images are tied to your account and are only accessible while you are signed in."}</li>
          <li>
            {isEs
              ? "El servicio no expone tu historial ni tus temas de consulta fuera de tu propio acceso autenticado."
              : "The service does not expose your history or consultation topics outside your own authenticated access."}
          </li>
          <li>
            {isEs
              ? "Si quieres conservar un registro en tu dispositivo, bajo tu propia discreción puedes descargar la imagen de una lectura y exportar el hilo actual a PDF desde Opciones; esos archivos se generan localmente y su custodia es tuya."
              : "If you want a record on your device, you may—at your sole discretion—download a reading image and export the current thread to PDF from Options; those files are generated locally on your device and you are responsible for keeping them."}
          </li>
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
          <li>
            {isEs
              ? "Lo que cambia según tu pack es el saldo de tokens disponible y cuántas consultas encadenadas caben en un mismo hilo (límite por hilo)."
              : "What changes with your pack is your available token balance and how many follow-up consultations fit in one thread (per-thread limit)."}
          </li>
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
            ? "Desde el panel Opciones puedes, cuando lo decidas, descargar la imagen de la lectura y generar un PDF del chat activo. Es opcional: sirve para guardar una copia en tu propio equipo o dispositivo. El archivo PDF se crea en el navegador; no sustituye el historial en la app ni obliga a conservar copias fuera del servicio."
            : "From the Options panel you may, whenever you choose, download the reading image and generate a PDF of the active chat. This is optional: it is for keeping a copy on your own computer or device. The PDF is built in your browser; it does not replace in-app history and you are not required to keep copies outside the service."}
        </p>

        <p className="doc-meta" style={{ opacity: 0.9, marginTop: "0.75rem" }}>
          {isEs ? (
            <>
              Texto legal vinculante: consulta la <Link href="/privacy">Política de Privacidad</Link> y los{" "}
              <Link href="/terms">Términos del Servicio</Link>.
            </>
          ) : (
            <>
              Binding legal text: see the <Link href="/privacy">Privacy Policy</Link> and{" "}
              <Link href="/terms">Terms of Service</Link>.
            </>
          )}
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
        <p>
          ⚠️{" "}
          {isEs
            ? "Los packs de tokens no son acumulables. Si adquieres un nuevo pack antes de agotar el actual, perderás los tokens restantes. Termina tu pack actual antes de comprar uno nuevo."
            : "Token packs are not cumulative. If you buy a new pack before finishing the current one, you lose remaining tokens. Finish your current pack before buying another one."}
        </p>
        <p>
          {isEs
            ? "Detalle por plan (límites por hilo, consumibles y resolución de imágenes):"
            : "Per-plan details (per-thread limits, consumable packs, and image resolution):"}
        </p>
        <ul>
          <li>
            <strong>{isEs ? "Gratuito:" : "Free:"}</strong>{" "}
            {isEs ? FREE_TIER_MARKETING.es : FREE_TIER_MARKETING.en}
          </li>
          {PACK_IDS_ORDERED.map((id) => (
            <li key={id}>
              <strong>{TOKEN_PACKS[id].label}:</strong>{" "}
              {isEs ? TOKEN_PACKS[id].marketingDetail.es : TOKEN_PACKS[id].marketingDetail.en}
            </li>
          ))}
        </ul>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">{isEs ? "Documentación sobre el I Ching" : "I Ching documentation"}</Link> ·{" "}
          <Link href="/privacy">{isEs ? "Política de Privacidad" : "Privacy Policy"}</Link> ·{" "}
          <Link href="/terms">{isEs ? "Términos del Servicio" : "Terms of Service"}</Link>
        </p>
      </article>
    </div>
  );
}
