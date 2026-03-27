import type { jsPDF } from "jspdf";
import { stripInterpretationFluff } from "@/lib/response-clean";

export type PdfReadingBlock =
  | { type: "heading"; text: string }
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
  let t = stripInterpretationFluff(markdown);
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

    const h2 = trimmed.match(/^##\s+(.+)$/);
    if (h2) {
      blocks.push({ type: "heading", text: cleanInlineMarkdown(h2[1]!) });
      continue;
    }
    const h3 = trimmed.match(/^###\s+(.+)$/);
    if (h3) {
      blocks.push({ type: "heading", text: cleanInlineMarkdown(h3[1]!) });
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
    if (trimmed.startsWith("#")) {
      blocks.push({
        type: "heading",
        text: cleanInlineMarkdown(trimmed.replace(/^#+\s*/, "")),
      });
      continue;
    }
    blocks.push({ type: "paragraph", text: cleanInlineMarkdown(trimmed) });
  }
  flushQuote();
  return blocks;
}

const PT_LINE = 13;
const PT_HEAD = 15;
const PT_QUOTE = 11.5;
const PT_LIST = 11.5;

function drawJustifiedParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxW) as string[];
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
      needSpace(PT_HEAD + 10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(b.text, maxW);
      doc.text(lines, margin, y);
      y += lines.length * PT_HEAD + 6;
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
      const qLines = doc.splitTextToSize(b.text, qW) as string[];
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
      const lines = doc.splitTextToSize(bullet + b.text, maxW);
      doc.text(lines, margin, y);
      y += lines.length * PT_LIST + 4;
      continue;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const pLines = doc.splitTextToSize(b.text, maxW) as string[];
    needSpace(pLines.length * PT_LINE + 6);
    y = drawJustifiedParagraph(doc, b.text, margin, y, maxW, PT_LINE);
    y += 6;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  return y + 14;
}
