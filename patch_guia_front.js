const fs = require('fs');

let pageTsx = fs.readFileSync('apps/web/src/app/guia/page.tsx', 'utf8');

// Replace the article contents
const newArticle = `<article className="doc-article">
        <h1>{g.title}</h1>
        <p className="doc-lead">
          {g.leadPart1}I Ching
          {g.leadPart2}
          {g.bonesLabel}
          {g.leadPart3}
        </p>

        {/* Sección 1 */}
        <h2 id="modos-consulta">{g.s1Heading}</h2>
        <ul>
          <li>
            <strong>I Ching</strong>: {g.s1Iching}
          </li>
          <li>
            <strong>{g.bonesLabel}</strong>: {g.s1Bones}
          </li>
        </ul>

        {/* Sección 2 */}
        <h2 id="panel-opciones">{g.s2Heading}</h2>
        <ul>
          <li>
            <strong>{g.s2TranslatorsTitle}</strong>: {g.s2Translators}
          </li>
          <li>
            <strong>{g.s2TokensTitle}</strong>: {g.s2Tokens}
          </li>
          <li>
            <strong>{g.s2SecurityTitle}</strong>: {g.s2Security}
          </li>
        </ul>

        {/* Sección 3 */}
        <h2 id="sesiones-mensajes">{g.s3Heading}</h2>
        <ul>
          <li>
            <strong>{g.s3NewSessionTitle}</strong>: {g.s3NewSession}
          </li>
          <li>
            <strong>{g.s3HistoryTitle}</strong>: {g.s3History}
          </li>
        </ul>

        {/* Sección 4 */}
        <h2 id="pilares">{g.translatorsHeading}</h2>
        <ul>
          <li>
            <strong>Wilhelm/Baynes</strong>: {g.translatorsWilhelm}
          </li>
          <li>
            <strong>James Legge</strong>: {g.translatorsLegge}
          </li>
          <li>
            <strong>Zhou Yi (Original)</strong>: {g.translatorsZhouyi}
          </li>
          <li>
            <strong>Master (3)</strong>: {g.translatorsMaster}
          </li>
        </ul>

        {/* Sección 5 */}
        <h2 id="metodos-lanzamiento">{g.s5Heading}</h2>
        <ul>
          <li>
            <strong>{g.s5AutoTitle}</strong>: {g.s5Auto}
          </li>
          <li>
            <strong>{g.s5ManualTitle}</strong>: {g.s5Manual}
          </li>
        </ul>

        {/* Sección 6 */}
        <h2 id="biblioteca-docs">{g.s6Heading}</h2>
        <ul>
          <li>
            <strong>{g.s6LibraryTitle}</strong>: {g.s6Library}
          </li>
          <li>
            <strong>{g.s6DocsTitle}</strong>: {g.s6Docs}
          </li>
        </ul>

        <nav className="doc-nav" style={{ marginTop: "3rem" }}>
          <Link href="/">{nav.backToOracle}</Link> ·{" "}
          <Link href="/faqs">{nav.faqs}</Link> ·{" "}
          <Link href="/about">{nav.aboutShort}</Link> ·{" "}
          <Link href="/notes">{nav.methodNotes}</Link> ·{" "}
          <Link href="/privacy">{nav.privacyShort}</Link> ·{" "}
          <Link href="/terms">{nav.termsShort}</Link>
        </nav>
      </article>`;

pageTsx = pageTsx.replace(/<article className="doc-article">[\s\S]*<\/article>/, newArticle);

fs.writeFileSync('apps/web/src/app/guia/page.tsx', pageTsx);
console.log("page.tsx actualizado!");
