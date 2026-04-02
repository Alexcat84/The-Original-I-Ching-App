import Link from "next/link";
import { resolveDocLocale } from "@/lib/doc-locale";

export default async function NotesPage() {
  const locale = await resolveDocLocale();
  const isEs = locale === "es";

  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">{isEs ? "← Volver al oráculo" : "← Back to oracle"}</Link> ·{" "}
        <Link href="/guia">{isEs ? "Guía rápida" : "Quick guide"}</Link> ·{" "}
        <Link href="/quickstart">{isEs ? "Quickstart" : "Quickstart"}</Link> ·{" "}
        <Link href="/privacy">{isEs ? "Privacidad" : "Privacy"}</Link> ·{" "}
        <Link href="/terms">{isEs ? "Términos" : "Terms"}</Link>
      </nav>
      <article className="doc-article">
        <h1>{isEs ? "Notas y origen de los métodos" : "Method notes and origins"}</h1>
        <p className="doc-lead">
          {isEs
            ? "Aquí se explica el fundamento de los métodos usados en la app. Esta página es técnica-cultural (no es guía de uso)."
            : "This page explains the foundation of methods used in the app. It is technical-cultural context (not a usage guide)."}
        </p>

        <h2>{isEs ? "I Ching (Zhouyi 周易)" : "I Ching (Zhouyi 周易)"}</h2>
        <p>
          {isEs
            ? "El modo I Ching se inspira en la tradición de 64 hexagramas y lectura por líneas cambiantes. En la app se presenta de forma moderna para interpretación simbólica y reflexión personal."
            : "I Ching mode is inspired by the 64-hexagram tradition and changing-line reading. In the app, it is presented in a modern way for symbolic interpretation and personal reflection."}
        </p>

        <h2>{isEs ? "Huesos de oráculo (甲骨)" : "Oracle bones (甲骨)"}</h2>
        <p>
          {isEs
            ? "El modo Huesos toma como referencia la adivinación por grietas y lo adapta a un flujo digital de preguntas tipo sí/no."
            : "Bones mode references crack divination and adapts it into a digital yes/no consultation flow."}
        </p>

        <h2>{isEs ? "Cómo interpretar estas lecturas" : "How to interpret these readings"}</h2>
        <ul>
          <li>{isEs ? "Como herramienta simbólica de enfoque y toma de perspectiva." : "As a symbolic tool for focus and perspective."}</li>
          <li>{isEs ? "No como predicción literal garantizada." : "Not as guaranteed literal prediction."}</li>
          <li>{isEs ? "Complementaria a juicio personal y asesoría profesional cuando aplique." : "Complementary to personal judgment and professional advice where applicable."}</li>
        </ul>

        <h2>{isEs ? "Fuentes externas para profundizar" : "External references for deeper study"}</h2>
        <ul>
          <li>
            <a href="https://en.wikipedia.org/wiki/I_Ching" target="_blank" rel="noopener noreferrer">
              I Ching (Zhouyi 周易)
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Oracle_bone_script" target="_blank" rel="noopener noreferrer">
              Oracle bone script (甲骨文)
            </a>
          </li>
          <li>
            <a href="https://en.wikipedia.org/wiki/Chinese_pyromancy" target="_blank" rel="noopener noreferrer">
              Chinese pyromancy
            </a>
          </li>
        </ul>
      </article>
    </div>
  );
}
