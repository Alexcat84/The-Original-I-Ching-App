const fs = require('fs');
const path = require('path');

// ── 1. CSS del tooltip ───────────────────────────────────────────────────────
const cssPath = 'apps/web/src/app/globals.css';
let css = fs.readFileSync(cssPath, 'utf8');

// Eliminar cualquier bloque incompleto que se haya añadido antes
css = css.replace(/\/\* ── Master \(3\) token tooltip ──[\s\S]*?\.master-token-tooltip:active \.master-token-tooltip-text \{\n  visibility: visible;\n  opacity: 1;\n\}\n/, '');
// También eliminar el bloque previo con clases ".master-tooltip-" (viejo intento)
css = css.replace(/\n\.master-tooltip-container[\s\S]*?\.master-tooltip-container:focus-within \.master-tooltip-text \{\n  visibility: visible;\n  opacity: 1;\n\}\n/, '');

const tooltipCSS = [
  '',
  '/* ── Master (3) token tooltip ── */',
  '.master-token-tooltip {',
  '  position: relative;',
  '  vertical-align: middle;',
  '}',
  '.master-token-tooltip-text {',
  '  visibility: hidden;',
  '  opacity: 0;',
  '  width: 210px;',
  '  background: var(--color-bg-elevated, #1a1a2e);',
  '  color: var(--color-text-primary, #f0f0f0);',
  '  text-align: center;',
  '  border-radius: 8px;',
  '  padding: 8px 10px;',
  '  position: absolute;',
  '  z-index: 9999;',
  '  bottom: calc(100% + 8px);',
  '  left: 50%;',
  '  transform: translateX(-50%);',
  '  transition: opacity 0.22s ease, visibility 0.22s ease;',
  '  font-size: 11.5px;',
  '  font-weight: 400;',
  '  line-height: 1.45;',
  '  box-shadow: 0 6px 20px rgba(0,0,0,0.55);',
  '  border: 1px solid rgba(255,255,255,0.12);',
  '  pointer-events: none;',
  '  white-space: normal;',
  '}',
  '.master-token-tooltip-text::after {',
  '  content: "";',
  '  position: absolute;',
  '  top: 100%;',
  '  left: 50%;',
  '  margin-left: -5px;',
  '  border-width: 5px;',
  '  border-style: solid;',
  '  border-color: var(--color-bg-elevated, #1a1a2e) transparent transparent transparent;',
  '}',
  '.master-token-tooltip:hover .master-token-tooltip-text,',
  '.master-token-tooltip:focus .master-token-tooltip-text,',
  '.master-token-tooltip:active .master-token-tooltip-text {',
  '  visibility: visible;',
  '  opacity: 1;',
  '}',
  ''
].join('\n');

css += tooltipCSS;
fs.writeFileSync(cssPath, css);
console.log('CSS tooltip OK');

// ── 2. Texto de documentación en guia-page-ui.ts ────────────────────────────
const guiaPath = 'packages/i18n/src/messages/guia-page-ui.ts';
let guia = fs.readFileSync(guiaPath, 'utf8');

const oldDocs = 'Acceso a las Notas del Método, Políticas de Privacidad y Términos de Servicio.';
const newDocs = 'Guía de uso · Notas y origen de los métodos (I Ching y Huesos) · Política de Privacidad · Términos del Servicio · Preguntas frecuentes · Sobre la app.';
guia = guia.split(oldDocs).join(newDocs);

fs.writeFileSync(guiaPath, guia);
console.log('s6Docs actualizado en todos los idiomas');
