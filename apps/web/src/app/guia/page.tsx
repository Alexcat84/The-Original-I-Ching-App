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
            <strong>Huesos 甲骨</strong> — Escribes un <em>cargo positivo</em> (afirmación). El servidor formula el
            cargo opuesto automáticamente para la tirada sí/no. Veredicto simbólico y patrón de grieta estilizado.
          </li>
        </ul>

        <h2 id="modos-lectura">Directo, ritual y profundizar (qué cambia de verdad)</h2>
        <p>
          Los tres modos alteran la <strong>forma del texto</strong> que genera el modelo (secciones del markdown), no
          el sorteo del hexagrama ni la lógica de mutación. Por eso antes podía parecer “lo mismo”: la diferencia está
          en la estructura de la interpretación.
        </p>
        <ul>
          <li>
            <strong>Ritual</strong> — Respuesta tipo <em>pergamino</em>: varias partes (encuadre, juicio con cita,
            líneas en movimiento, 之卦 si aplica, síntesis). Es la experiencia más completa y ceremonial en texto.
          </li>
          <li>
            <strong>Directo</strong> — Solo <strong>dos secciones</strong> tituladas (lectura directa + lectura
            simbólica). Más corto y escaneable. Además, en la app <strong>no se muestra la animación</strong> de monedas
            ni la de calor en el hueso: la consulta va en línea recta mientras se genera la respuesta.
          </li>
          <li>
            <strong>Profundizar</strong> — Pensado para la <strong>segunda (y siguientes) consultas del mismo hilo</strong>
            : dos secciones enfocadas en continuidad respecto a la tirada anterior y en lo nuevo que aporta esta tirada.
            Si es la primera consulta del hilo, el tono sigue siendo “profundizar” pero sin contraste explícito con un
            mensaje previo.
          </li>
        </ul>

        <p>
          Las estadísticas (racha, consultas hoy, chats con mensajes) están en el menú <strong>Chats</strong>, no en la
          cabecera principal.
        </p>

        <h2>Profundizar en el mismo hilo</h2>
        <p>
          Tras una lectura, si tu plan lo permite, puedes enviar otra pregunta en la misma sesión para enlazar con la
          anterior. Aparecerán <strong>sugerencias para profundizar</strong> opcionales junto al teclado.
        </p>

        <h2>PDF y compartir</h2>
        <p>
          Puedes exportar el hilo actual a PDF (formato claro, sin marcas de Markdown). Los enlaces de compartir lectura
          o sesión funcionan cuando el servidor tiene Supabase y/o Upstash Redis configurados (persistencia entre
          instancias y reinicios).
        </p>

        <h2 id="planes">Planes y pagos</h2>
        <p>
          Los límites de consultas y funciones avanzadas dependen de tu <strong>plan</strong> (gratuito, Seeker,
          Practitioner, Master u Oracle). La app enlaza el usuario de Supabase con{" "}
          <strong>RevenueCat</strong> para suscripciones web; el servidor actualiza tu plan vía webhook y, si está
          configurada la API secreta, con una sincronización tras iniciar sesión. La conexión con{" "}
          <strong>Stripe</strong> en el panel de RevenueCat puedes dejarla para cuando vayas a cobrar de verdad: hasta
          entonces puedes seguir probando el resto del flujo.
        </p>
        <p>
          En RevenueCat, los identificadores de <em>entitlements</em> deben coincidir con los planes (por ejemplo{" "}
          <code>seeker</code>, <code>practitioner</code>, <code>master</code>, <code>oracle</code>, en minúsculas) para
          que coincidan con la base de datos de la app.
        </p>

        <p className="doc-footer-links">
          <Link href="/documentacion/iching">Documentación sobre el I Ching</Link>
        </p>
      </article>
    </div>
  );
}
