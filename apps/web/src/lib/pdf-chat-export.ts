import type { jsPDF } from "jspdf";
import { normalizeInterpretationPunctuation, stripInterpretationFluff } from "@/lib/response-clean";

export type PdfReadingBlock =
  | { type: "heading"; text: string; level: 1 | 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; text: string };

function cleanInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)]\([^)]+\)/g, "$1")
    .trim();
}

/** Turn oracle Markdown into structured blocks for PDF (no raw ##, **, or > in output). */
export function interpretationMarkdownToPdfBlocks(markdown: string): PdfReadingBlock[] {
  let t = normalizeInterpretationPunctuation(stripInterpretationFluff(markdown));
  t = t.replace(/^(?:CATEGORY|CATEGOR[IÍ]A)\s*:.*\n/im, "");
  t = t.replace(/\r\n/g, "\n");
  const lines = t.split("\n");
  const blocks: PdfReadingBlock[] = [];
  let quoteLines: string[] = [];

  const flushQuote = () => {
    if (!quoteLines.length) return;
    const text = cleanInlineMarkdown(quoteLines.join(" "));
    if (text) blocks.push({ type: "quote", text });
    quoteLines = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushQuote();
      continue;
    }
    if (trimmed.startsWith(">")) {
      quoteLines.push(trimmed.replace(/^>\s?/, ""));
      continue;
    }
    flushQuote();

    const hm = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (hm) {
      const n = hm[1]!.length;
      const level: 1 | 2 | 3 = n <= 1 ? 1 : n === 2 ? 2 : 3;
      blocks.push({
        type: "heading",
        level,
        text: cleanInlineMarkdown(hm[2]!),
      });
      continue;
    }
    if (/^[-*]\s+/.test(trimmed)) {
      blocks.push({ type: "list", text: cleanInlineMarkdown(trimmed.replace(/^[-*]\s+/, "")) });
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      blocks.push({
        type: "list",
        text: cleanInlineMarkdown(trimmed.replace(/^\d+\.\s+/, "")),
      });
      continue;
    }
    blocks.push({ type: "paragraph", text: cleanInlineMarkdown(trimmed) });
  }
  flushQuote();
  return blocks;
}

/** Wrapped lines for canvas PDF (uses ctx.measureText; set font before measuring each block). */
function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of Array.from(text.replace(/\r/g, ""))) {
    if (ch === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line.trimEnd());
      line = ch;
    } else {
      line = test;
    }
  }
  if (line.trim().length > 0) lines.push(line.trimEnd());
  return lines;
}

export type CanvasReadingLine = {
  text: string;
  x: number;
  font: string;
  fillStyle: string;
  lineHeight: number;
  marginTop: number;
};

/**
 * Flatten reading blocks into positioned canvas lines (headings larger / colored vs body).
 */
export function buildCanvasReadingLines(
  ctx: CanvasRenderingContext2D,
  blocks: PdfReadingBlock[],
  textMaxWidth: number,
  baseX: number,
  cjkFontStack: string,
  accentHex: string,
): CanvasReadingLine[] {
  const out: CanvasReadingLine[] = [];
  const bodyColor = "#1f2a36";
  const quoteColor = "#4a5f6b";
  const h3Color = "#155a66";
  const quoteIndent = 22;

  const pushLines = (lines: string[], style: Omit<CanvasReadingLine, "text" | "marginTop">, firstMarginTop: number) => {
    lines.forEach((ln, i) => {
      out.push({
        text: ln,
        ...style,
        marginTop: i === 0 ? firstMarginTop : 0,
      });
    });
  };

  for (const b of blocks) {
    if (b.type === "heading") {
      const level = b.level;
      const size = level === 1 ? 32 : level === 2 ? 30 : 26;
      const lh = level === 1 ? 40 : level === 2 ? 38 : 34;
      const color = level === 3 ? h3Color : accentHex;
      ctx.font = `700 ${size}px ${cjkFontStack}`;
      const lines = wrapCanvasText(ctx, b.text, textMaxWidth);
      const gap =
        out.length === 0 ? 0 : level === 1 ? 20 : level === 2 ? 18 : 14;
      pushLines(
        lines,
        { x: baseX, font: ctx.font, fillStyle: color, lineHeight: lh },
        gap,
      );
      continue;
    }
    if (b.type === "paragraph") {
      ctx.font = `500 24px ${cjkFontStack}`;
      const lines = wrapCanvasText(ctx, b.text, textMaxWidth);
      pushLines(
        lines,
        { x: baseX, font: ctx.font, fillStyle: bodyColor, lineHeight: 34 },
        out.length === 0 ? 0 : 10,
      );
      continue;
    }
    if (b.type === "quote") {
      ctx.font = `italic 500 22px ${cjkFontStack}`;
      const qW = textMaxWidth - quoteIndent;
      const lines = wrapCanvasText(ctx, b.text, qW);
      pushLines(
        lines,
        {
          x: baseX + quoteIndent,
          font: ctx.font,
          fillStyle: quoteColor,
          lineHeight: 30,
        },
        out.length === 0 ? 0 : 12,
      );
      continue;
    }
    if (b.type === "list") {
      ctx.font = `500 24px ${cjkFontStack}`;
      const bullet = "• ";
      const bw = ctx.measureText(bullet).width;
      const firstLines = wrapCanvasText(ctx, b.text, textMaxWidth - bw);
      if (!firstLines.length) continue;
      const firstMargin = out.length === 0 ? 0 : 8;
      out.push({
        text: `${bullet}${firstLines[0]}`,
        x: baseX,
        font: ctx.font,
        fillStyle: bodyColor,
        lineHeight: 34,
        marginTop: firstMargin,
      });
      for (let i = 1; i < firstLines.length; i++) {
        out.push({
          text: firstLines[i]!,
          x: baseX + bw,
          font: ctx.font,
          fillStyle: bodyColor,
          lineHeight: 34,
          marginTop: 0,
        });
      }
    }
  }

  return out;
}

/** Continuation page chrome when the reading spans multiple PDF pages. Returns text vertical range. */
export function drawPdfContinuationChrome(
  ctx: CanvasRenderingContext2D,
  pageW: number,
  pageH: number,
  isEs: boolean,
  entryNum: number,
  accent: string,
  cjkFont: string,
  serifFont: string,
): { textTopY: number; textBottomY: number } {
  ctx.fillStyle = "#f6fbfd";
  ctx.fillRect(0, 0, pageW, pageH);
  ctx.fillStyle = "rgba(30,131,148,0.07)";
  ctx.fillRect(0, 0, pageW, 112);
  ctx.fillStyle = "rgba(28,94,122,0.05)";
  ctx.fillRect(0, 118, pageW, 6);

  ctx.fillStyle = "#17212b";
  ctx.font = `700 36px ${serifFont}`;
  ctx.fillText(isEs ? "Consulta del Oráculo" : "Oracle Consultation", 64, 68);
  ctx.font = `600 22px ${cjkFont}`;
  ctx.fillStyle = "#36515d";
  ctx.fillText(
    isEs
      ? `Entrada ${entryNum} · Lectura (continuación)`
      : `Entry ${entryNum} · Reading (continued)`,
    64,
    102,
  );

  const panelTop = 128;
  const panelBottom = pageH - 52;
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.strokeStyle = "rgba(52,117,145,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(54, panelTop, pageW - 108, panelBottom - panelTop, 22);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = `700 22px ${cjkFont}`;
  ctx.fillText(isEs ? "Lectura" : "Reading", 84, panelTop + 34);

  return { textTopY: panelTop + 72, textBottomY: panelBottom - 16 };
}

const PT_LINE = 13;
const PT_QUOTE = 11.5;
const PT_LIST = 11.5;

function hyphenateTokenToWidth(doc: jsPDF, token: string, maxW: number): string[] {
  if (!token) return [];
  if (doc.getTextWidth(token) <= maxW) return [token];

  const chars = Array.from(token);
  const out: string[] = [];
  let i = 0;
  while (i < chars.length) {
    let chunk = "";
    let j = i;
    while (j < chars.length) {
      const next = chunk + chars[j]!;
      const hasMore = j < chars.length - 1;
      const probe = hasMore ? `${next}-` : next;
      if (doc.getTextWidth(probe) > maxW && chunk.length > 0) break;
      chunk = next;
      j++;
      if (doc.getTextWidth(probe) > maxW) break;
    }
    const hasTail = j < chars.length;
    out.push(hasTail ? `${chunk}-` : chunk);
    i = j;
  }
  return out;
}

function wrapPdfTextWithHyphenation(doc: jsPDF, text: string, maxW: number): string[] {
  const normalized = text.replace(/\r/g, "");
  const lines: string[] = [];
  const paragraphs = normalized.split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (doc.getTextWidth(candidate) <= maxW) {
        line = candidate;
        continue;
      }

      if (line) {
        lines.push(line);
        line = "";
      }

      if (doc.getTextWidth(word) <= maxW) {
        line = word;
        continue;
      }

      const chunks = hyphenateTokenToWidth(doc, word, maxW);
      if (!chunks.length) continue;
      for (let i = 0; i < chunks.length - 1; i++) {
        lines.push(chunks[i]!);
      }
      line = chunks[chunks.length - 1] ?? "";
    }

    if (line) lines.push(line);
  }

  while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

function drawJustifiedParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineHeight: number,
): number {
  const lines = wrapPdfTextWithHyphenation(doc, text, maxW);
  if (!lines.length) return y;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    const isLast = i === lines.length - 1;
    const words = line.split(/\s+/).filter(Boolean);
    const hasSpaces = words.length > 1;

    if (!isLast && hasSpaces) {
      const lineW = doc.getTextWidth(line);
      const extra = maxW - lineW;
      const gaps = words.length - 1;
      const extraPerGap = gaps > 0 ? extra / gaps : 0;

      // Avoid ugly stretched lines when very short.
      if (extraPerGap > 0 && extraPerGap <= 1.35) {
        let cursorX = x;
        for (let w = 0; w < words.length; w++) {
          const word = words[w]!;
          doc.text(word, cursorX, y);
          const base = doc.getTextWidth(word);
          if (w < words.length - 1) {
            const spaceW = doc.getTextWidth(" ");
            cursorX += base + spaceW + extraPerGap;
          }
        }
      } else {
        doc.text(line, x, y);
      }
    } else {
      doc.text(line, x, y);
    }
    y += lineHeight;
  }

  return y;
}

/** Draw reading blocks with spacing similar to the in-app scroll (headings, quotes, lists). */
export function drawPdfReadingBlocks(
  doc: jsPDF,
  blocks: PdfReadingBlock[],
  margin: number,
  maxW: number,
  pageH: number,
  startY: number,
): number {
  let y = startY;
  const pageW = doc.internal.pageSize.getWidth();

  const needSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  for (const b of blocks) {
    if (b.type === "heading") {
      const level = b.level;
      const headSize = level === 1 ? 14 : level === 2 ? 12.5 : 11.5;
      const headLead = level === 1 ? 16 : level === 2 ? 15 : 14;
      needSpace(headLead + 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(headSize);
      const lines = wrapPdfTextWithHyphenation(doc, b.text, maxW);
      doc.text(lines, margin, y);
      y += lines.length * headLead + 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      continue;
    }
    if (b.type === "quote") {
      needSpace(PT_QUOTE + 8);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10.5);
      const indent = margin + 14;
      const qW = maxW - 14;
      doc.setDrawColor(160, 140, 120);
      doc.setLineWidth(0.6);
      const qLines = wrapPdfTextWithHyphenation(doc, b.text, qW);
      doc.line(margin + 4, y - 2, margin + 4, y + Math.max(qLines.length * PT_QUOTE, PT_QUOTE) - 2);
      y = drawJustifiedParagraph(doc, b.text, indent, y, qW, PT_QUOTE);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      continue;
    }
    if (b.type === "list") {
      needSpace(PT_LIST + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const bullet = "• ";
      const lines = wrapPdfTextWithHyphenation(doc, `${bullet}${b.text}`, maxW);
      doc.text(lines, margin, y);
      y += lines.length * PT_LIST + 4;
      continue;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const pLines = wrapPdfTextWithHyphenation(doc, b.text, maxW);
    needSpace(pLines.length * PT_LINE + 6);
    y = drawJustifiedParagraph(doc, b.text, margin, y, maxW, PT_LINE);
    y += 6;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  return y + 14;
}
