import Link from "next/link";

export default function GuiaRapidaPage() {
  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">← Volver al oráculo</Link>
      </nav>
      <article className="doc-article">
        <h1>Guía rápida de uso</h1>
        <p className="doc-lead">
          Esta app te ofrece dos modos inspirados en tradiciones históricas chinas: consulta por{" "}
          <strong>I Ching</strong> (seis líneas, tres monedas) y consulta por <strong>甲骨</strong> (huesos de
          oráculo, sí/no sobre cargas positiva y negativa). Ambos son ayudas simbólicas, no sustitutos de juicio
          profesional en salud, legal o financiero.
        </p>

        <h2>Chats y nueva sesión</h2>
        <ul>
          <li>
            <strong>Chats</strong> abre el historial de conversaciones guardadas en este dispositivo.
          </li>
          <li>
            <strong>Nueva sesión</strong> inicia un hilo vacío: nueva pregunta, sin arrastrar mensajes anteriores.
            Úsala cuando cambies de tema o quieras un ritual limpio.
          </li>
        </ul>

        <h2>Opciones (barra inferior)</h2>
        <p>
          El botón <strong>Opciones</strong> abre el panel donde eliges el modo de oráculo y cómo quieres la
          respuesta:
        </p>
        <ul>
          <li>
            <strong>I Ching (易)</strong> — Seis tiradas de tres monedas (o animación ritual), mutación según Zhu Xi,
            texto en la línea de Wilhelm/Baynes y comentarios clásicos.
          </li>
          <li>
            <strong>Huesos 甲骨</strong> — Formulas un <em>cargo positivo</em> (afirmación) y, si quieres, un{" "}
            <em>cargo negativo</em>. El oráculo devuelve un veredicto simbólico y un patrón de grieta estilizado. El
            soporte (plastrón / escápula) solo afecta la imagen generada.
          </li>
          <li>
            <strong>Modo de lectura</strong> — <em>Directo</em> va al mensaje; <em>Ritual</em> incluye pasos visuales
            (monedas o calor sobre el hueso); <em>Profundizar</em> prepara el tono para seguir el hilo con más
            contexto.
          </li>
        </ul>
        <p>
          En la cabecera verás siempre un resumen de lo activo: oráculo, lectura y, en huesos, el soporte elegido.
        </p>

        <h2>Profundizar en el mismo hilo</h2>
        <p>
          Tras una lectura, si tu plan lo permite, puedes enviar otra pregunta en la misma sesión para enlazar con la
          anterior. Aparecerán <strong>sugerencias para profundizar</strong> opcionales junto al teclado.
        </p>

        <h2>Imprimir, PDF y compartir</h2>
        <p>
          Cada lectura incluye acciones para imprimir o exportar el chat, y enlaces de compartir si el servidor tiene
          almacenamiento configurado (Supabase o Upstash).
        </p>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">Documentación sobre el I Ching</Link>
        </p>
      </article>
    </div>
  );
}
