import Link from "next/link";

export default function DocumentacionIchingPage() {
  return (
    <div className="oracle-shell doc-page">
      <nav className="doc-nav">
        <Link href="/">← Volver al oráculo</Link> · <Link href="/guia">Guía rápida</Link>
      </nav>
      <article className="doc-article">
        <h1>El I Ching en esta aplicación</h1>
        <p className="doc-lead">
          El <strong>Zhouyi 周易</strong> (libro de los cambios) es un corpus antiguo de China: textos oraculares
          asociados a sesenta y cuatro figuras de seis líneas (hexagramas), cada línea siendo <em>yin</em> o{" "}
          <em>yang</em>, estable o <em>mutante</em> según el método de conteo que uses.
        </p>

        <h2>Qué hace esta app</h2>
        <p>
          Generamos el hexagrama principal con <strong>tres monedas por línea</strong> (valores 6–9), aplicamos la{" "}
          <strong>regla de mutación de Zhu Xi</strong> para saber qué líneas cambian y, si procede, el hexagrama
          resultante. La interpretación sigue la voz del comentarista configurado (p. ej. tono Wilhelm/Baynes) y los
          textos del paquete de datos del proyecto.
        </p>

        <h2>No confundir con adivinación literal</h2>
        <p>
          El I Ching se ha usado durante milenios como espejo simbólico. La app no predice hechos externos verificables;
          ofrece lenguaje imaginal para ordenar la pregunta y ver tensiones, oportunidades y límites.
        </p>

        <h2>Imágenes del hexagrama</h2>
        <p>
          Cuando hay generación remota activa, pedimos una escena de <em>sumi-e</em> coherente con la{" "}
          <strong>categoría temática</strong> de la consulta (amor, trabajo, etc.) y con variación por consulta, para
          evitar fondos genéricos repetidos. El hexagrama y las líneas mutantes deben respetar el trazo indicado en el
          prompt técnico.
        </p>

        <h2>Modo 甲骨 (huesos)</h2>
        <p>
          Es un módulo aparte, inspirado en la <strong>piromancia shang</strong>: grietas 兆 desde puntos de perforación
          y lectura de sí/no sobre cargas enfrentadas. Solo escribes el cargo afirmativo; el opuesto se deriva en el
          servidor para emparejar la pregunta. Los dibujos en pantalla y las imágenes generadas son estilizaciones
          informadas por la literatura arqueológica, no reproducciones de piezas concretas.
        </p>

        <h2>Más lectura</h2>
        <p>
          En el panel <strong>Opciones</strong> puedes abrir <em>notas y fuentes</em> con enlaces externos (Wikipedia y
          artículos de conjunto). Para uso práctico del interfaz, ve la{" "}
          <Link href="/guia">guía rápida</Link>.
        </p>
      </article>
    </div>
  );
}
