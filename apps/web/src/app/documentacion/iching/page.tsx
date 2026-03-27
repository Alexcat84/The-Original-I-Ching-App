import Link from "next/link";
import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type AppLocale } from "@iching-oracle/i18n";

function resolveLocale(raw: string | undefined): AppLocale {
  if (raw && (SUPPORTED_LOCALES as readonly string[]).includes(raw)) {
    return raw as AppLocale;
  }
  return "es";
}

export default function DocumentacionIchingPage() {
  const locale = resolveLocale(cookies().get("iching_ui_locale")?.value);
  const isEs = locale === "es";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link> ·{" "}
        <Link href="/guia">{isEs ? "Guía rápida" : "Quick guide"}</Link>
      </nav>
      <article className="doc-article">
        <h1>{isEs ? "El I Ching en esta aplicación" : "I Ching in this app"}</h1>
        <p className="doc-lead">
          {isEs ? (
            <>
              El <strong>Zhouyi 周易</strong> (I Ching) es una tradición clásica de lectura simbólica basada en 64
              hexagramas. En la app lo usamos como una guía de reflexión para ayudarte a ordenar preguntas y ver
              opciones.
            </>
          ) : (
            <>
              <strong>Zhouyi 周易</strong> (I Ching) is a classical symbolic reading tradition based on 64 hexagrams.
              In this app, it works as a reflective guide to help clarify questions and decisions.
            </>
          )}
        </p>

        <h2>{isEs ? "Qué hace esta app" : "What this app does"}</h2>
        <p>
          {isEs
            ? "Cuando consultas en modo I Ching, la app genera una lectura basada en monedas y líneas cambiantes, y luego te devuelve una interpretación en el estilo que elijas (directo, ritual o profundizar)."
            : "In I Ching mode, the app generates a reading from coin throws and changing lines, then returns an interpretation in your selected style (direct, ritual, or deepen)."}
        </p>

        <h2>{isEs ? "No confundir con adivinación literal" : "Not literal fortune-telling"}</h2>
        <p>
          {isEs
            ? "La app no “predice el futuro” de forma literal. Funciona como un espejo simbólico para pensar con más claridad una situación personal."
            : "The app does not literally predict the future. It works as a symbolic mirror to think more clearly about personal situations."}
        </p>

        <h2>{isEs ? "Imágenes del hexagrama" : "Hexagram images"}</h2>
        <p>
          {isEs
            ? "Cada lectura puede incluir una imagen artística coherente con el resultado. También puedes descargar la imagen y exportar el chat a PDF desde la interfaz."
            : "Each reading may include an artistic image aligned with the result. You can also download images and export chat threads as PDF."}
        </p>

        <h2>{isEs ? "Modo 甲骨 (huesos)" : "甲骨 mode (bones)"}</h2>
        <p>
          {isEs
            ? "Es un modo alternativo de consulta, inspirado en la tradición de lectura por grietas. Está orientado a preguntas tipo sí/no y se presenta de forma visual para facilitar interpretación."
            : "This is an alternative consultation mode inspired by crack-reading tradition. It is oriented to yes/no style questions and presented visually for easier interpretation."}
        </p>

        <h2 id="notas-metodos">{isEs ? "Notas y origen de los métodos (I Ching y Huesos)" : "Method notes and origins (I Ching and Bones)"}</h2>
        <p>
          {isEs
            ? "Los métodos de la app están inspirados en tradiciones históricas y se muestran con una presentación moderna y accesible para uso cotidiano."
            : "The app methods are inspired by historical traditions and presented in a modern, accessible format for daily use."}
        </p>
        <ul>
          <li>
            <a href="https://en.wikipedia.org/wiki/I_Ching" target="_blank" rel="noreferrer">
              I Ching (Zhouyi 周易)
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Oracle_bone_script" target="_blank" rel="noreferrer">
              Escritura de hueso de oráculo 甲骨文
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Chinese_pyromancy" target="_blank" rel="noreferrer">
              Piromancia y adivinación en la China antigua
            </a>
          </li>
        </ul>
        <p>
          {isEs ? "Para límites por plan, privacidad y uso diario, visita la " : "For plan limits, privacy, and daily usage, visit the "}
          <Link href="/guia">{isEs ? "guía rápida" : "quick guide"}</Link>.
        </p>
      </article>
    </div>
  );
}
