const fs = require('fs');

const tooltipCSS = `
/* ── Master (3) token tooltip ── */
.master-token-tooltip {
  position: relative;
  vertical-align: middle;
}
.master-token-tooltip-text {
  visibility: hidden;
  opacity: 0;
  width: 210px;
  background: var(--color-bg-elevated, #1a1a2e);
  color: var(--color-text-primary, #f0f0f0);
  text-align: center;
  border-radius: 8px;
  padding: 8px 10px;
  position: absolute;
  z-index: 9999;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  transition: opacity 0.22s ease, visibility 0.22s ease;
  font-size: 11.5px;
  font-weight: 400;
  line-height: 1.45;
  box-shadow: 0 6px 20px rgba(0,0,0,0.55);
  border: 1px solid rgba(255,255,255,0.12);
  pointer-events: none;
  white-space: normal;
}
.master-token-tooltip-text::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: var(--color-bg-elevated, #1a1a2e) transparent transparent transparent;
}
.master-token-tooltip:hover .master-token-tooltip-text,
.master-token-tooltip:focus .master-token-tooltip-text,
.master-token-tooltip:active .master-token-tooltip-text {
  visibility: visible;
  opacity: 1;
}
`;

fs.appendFileSync('apps/web/src/app/globals.css', tooltipCSS, 'utf8');
console.log('Tooltip CSS añadido a globals.css OK');
