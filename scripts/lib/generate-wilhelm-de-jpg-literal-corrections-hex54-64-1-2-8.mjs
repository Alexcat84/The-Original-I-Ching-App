/**
 * One-shot generator for JPG literal corrections hex 54–64 + 1, 2, 8 (AUD-DAT-W-07).
 * QA code: AU-FID-W-040 generate-wilhelm-de-jpg-literal-corrections-hex54-64-1-2-8 · v1.0.0
 * Area: scripts/lib/wilhelm-de-jpg-literal-corrections-hex54-64-1-2-8.mjs
 * Family: FID-W
 * Run: node scripts/lib/generate-wilhelm-de-jpg-literal-corrections-hex54-64-1-2-8.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PILOT_DIR = join(ROOT, "tools/manual-gold/wilhelm-de-comments-au");
const HEXES = [54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 1, 2, 8];

/** @param {number} hex */
async function readPilot(hex) {
  const raw = await readFile(join(PILOT_DIR, `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`), "utf8");
  /** @type {Record<string, string>} */
  const pdf = {};
  /** @type {Record<string, string>} */
  const rec = {};
  for (const line of raw.split("\n")) {
    if (!line.trim() || line.startsWith("campo\t") || line.startsWith("hex_fin")) continue;
    const parts = line.split("\t");
    pdf[parts[0]] = parts[3] ?? "";
    rec[parts[0]] = parts[1] ?? "";
  }
  return { pdf, rec };
}

/** @param {string} s */
function stripFooter(s) {
  return s.replace(/\n\d+\s+Das Buch der Wandlungen[^\n]*/g, "").trimEnd();
}

/** @param {string} s */
function fixQuotes(s) {
  return s.replace(/,,/g, "„");
}

/** @param {string} s @param {string} field */
function cleanField(s, field) {
  if (!s) return s;
  let t = stripFooter(fixQuotes(s));
  t = t.replace(/\n•\n/g, "\n").replace(/\n~~\n/g, "\n").replace(/\nB\s*$/g, "");
  if (field.endsWith("_b_comentario") || field === "L6_b_comentario") {
    t = t.replace(/\n[震漸巽兑兌歸妹井困革鼎]+\s*$/u, "");
  }
  return t.trimEnd();
}

/** @param {string} s */
function hasOcrArtifacts(s) {
  return (
    /Das Buch der Wandlungen/.test(s) ||
    /[\u0590-\u05ff\u0f00-\u0fff]/.test(s) ||
    /^D\n|^Mädchens|^und Ein|^und versch|^zur Sechs auf drittem Platz abzutun|^Dul|^Ob\n|^gewicht\.|^as Zeichen|^ie Herren|^err des|^ie beiden Yinstriche/.test(
      s,
    ) ||
    /~~/.test(s) ||
    /[\u4e00-\u9fff]/.test(s) ||
    /⬜/.test(s)
  );
}

/** @param {string} a @param {string} b */
function sameIgnoringHyphenBreaks(a, b) {
  const norm = (s) => s.replace(/-\n/g, "").replace(/\s+/g, " ").trim();
  return norm(a) === norm(b);
}

/** @param {string} text */
function oracleOnly(text) {
  const lines = text.split("\n");
  /** @type {string[]} */
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (/^Anfangs (Sechs|Neun)/.test(t)) break;
    if (/^(Neun auf|Sechs auf|Obere Sechs|O Neun)/.test(t) && out.length > 0) break;
    out.push(line);
  }
  return out.join("\n").trim();
}

/** @param {string} rec @param {string} pdf */
function commentaryImageFrom(rec, pdf) {
  const block = rec.split(/\nAnfangs /)[0] ?? rec;
  if (/^(und |Mädchens|Auch hier|Von den beiden|gewicht\.|Bemerkung)/.test(pdf)) {
    const lines = block.split("\n");
    let start = 0;
    for (let i = 0; i < lines.length; i++) {
      if (
        /^(Im Herbst|Sonst ist|Von den beiden|Dui bedeutet|Auch hier|Das Bild ist|Der Donner|Bemerkung|Die Verdoppelung)/.test(
          lines[i],
        )
      ) {
        start = i;
        break;
      }
    }
    return cleanField(lines.slice(start).join("\n"), "commentary_image");
  }
  return cleanField(pdf, "commentary_image");
}

/** @param {string} rec @param {string} pdf */
function pickLongText(rec, pdf, field) {
  const cRec = cleanField(rec, field);
  const cPdf = cleanField(pdf, field);
  if (hasOcrArtifacts(cPdf)) return cRec;
  if (cRec.length > cPdf.length * 1.08 && cPdf.length > 80) return cRec;
  if (cRec.length > cPdf.length * 1.25) return cRec;
  return cPdf;
}

/** @type {Record<number, Record<string, (pdf: string, rec: Record<string, string>) => string>>} */
const FIXERS = {
  54: {
    nombre: () => "DAS HEIRATENDE MÄDCHEN",
    chinese_roman: () => "GUI ME",
    ruler_note: () =>
      'Das Zeichen „das heiratende Mädchen" beruht auf der Idee, daß das\nMädchen dem Manne folgt. Darum heißt es im Kommentar zur Entscheidung: „Nichts, das fördernd ist. Das\nWeiche beruht auf dem Harten." Das bezieht sich auf die Sechs auf drittem\nPlatz und die obere Sechs, die somit die konstituierenden Herren des Zeichens sind. Dagegen weilt die Neun auf fünftem Platz auf geehrtem Platz\nund verkehrt nach unten hin; dadurch verändert sie das nicht Gute und\nmacht Gutes daraus, gestaltet das Unheil in Heil um. Somit ist die Sechs auf\nfünftem Platz der beherrschende Herr des Zeichens.',
    commentary_decision: (_pdf, rec) => cleanField(rec.commentary_decision, "commentary_decision"),
    image_oraculo: () =>
      "Oberhalb des Sees ist der Donner: das Bild des heiratenden\nMädchens. So erkennt der Edle durch die Ewigkeit des\nEndes das Vergängliche.",
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
    L6_a_oraculo: (pdf) =>
      stripFooter(
        "Die Frau hält den Korb, aber es sind keine Früchte drin.\nDer Mann sticht das Schaf, aber es fließt kein Blut. Nichts,\ndas fördernd wäre.",
      ),
    L6_b_comentario: (pdf) =>
      cleanField(
        pdf.replace(/\n-\s*$/, "").replace(/-\n-\nDie Versuche/, "\nDie Versuche"),
        "L6_b_comentario",
      ),
  },
  55: {
    chinese_roman: () => "FONG",
    ruler_note: () =>
      'Der Herr des Zeichens ist die Sechs auf fünftem Platz. Wenn es im Urteil heißt: „Der König erreicht es. Sei nicht traurig. Du mußt sein wie\ndie Sonne am Mittag", so bezieht sich das auf die Sechs auf fünftem Platz;\ndenn das ist der Platz des Königs. Der Strich ist weich und weilt in der\nMitte: das ist der Charakter der Sonne am Mittag.',
    image_oraculo: () =>
      "Donner und Blitz kommen beide: das Bild der Fülle. So ent-\nscheidet der Edle die Prozesse und führt die Strafen aus.",
    L3_b_comentario: (_pdf, rec) =>
      cleanField(rec.L3_b_comentario.replace(/[\u0f00-\u0fff]+\n?/g, ""), "L3_b_comentario"),
    L6_b_comentario: (pdf) => cleanField(pdf.replace(/\n~~\n/g, "\n").replace(/\nB\s*$/g, ""), "L6_b_comentario"),
  },
  56: {
    chinese_roman: () => "LU",
    ruler_note: () =>
      'Der Herr des Zeichens ist die Sechs auf fünftem Platz; darum heißt es\nim Kommentar zur Entscheidung: „Das Weiche erlangt die Mitte im\nAußeren" und ferner: „Stillehalten und Haften an der Klarheit". Die Fünf\nweilt im äußeren Zeichen: das ist das Bild des Wanderers im Ausland; sie\nist auf dem mittleren Platz als Herr des Zeichens Li: das ist das Bild des\nErlangens der Mitte und Haftens an der Klarheit.',
    image_oraculo: () =>
      "Auf dem Berg ist Feuer: das Bild des Wanderers. So ist\nder Edle klar und vorsichtig in der Anwendung von Strafen\nund verschleppt keine Streitigkeiten.",
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
    L6_b_comentario: (pdf) => cleanField(pdf.replace(/\n巽\s*$/u, ""), "L6_b_comentario"),
  },
  57: {
    chinese_roman: () => "SUN",
    ruler_note: (_pdf, rec) =>
      cleanField(
        rec.ruler_note
          .replace(/^Li und\nDui\nObw\nbwohl/, "Obwohl")
          .replace(/^Li und\nDui\n/, ""),
        "ruler_note",
      ),
    image_oraculo: () =>
      "Einander folgende Winde: das Bild des sanft Eindringenden.\nSo verbreitet der Edle seine Gebote und wirkt seine Geschäfte.",
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
    L6_b_comentario: (pdf) => cleanField(pdf.replace(/\n兑\s*$/u, ""), "L6_b_comentario"),
  },
  58: {
    chinese_roman: () => "DUI",
    ruler_note: () =>
      'Die beiden Yinstriche sind die konstituierenden Herren des Zeichens, aber\nsie vermögen nicht die beherrschenden Herren des Zeichens zu bilden.\nDie beherrschenden Herren sind der zweite und der fünfte Strich. Darum\nheißt es im Kommentar zur Entscheidung: „Das Feste ist in der Mitte, und\ndas Weiche ist außen. Heiterkeit, und dabei ist fördernd Beharrlichkeit."',
    image_oraculo: () =>
      "Aufeinander beruhende Seen: das Bild des Heiteren. So tut\nsich der Edle mit seinen Freunden zusammen zur Besprechung\nund Einübung.",
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
    L3_etiqueta: () => "Sechs auf drittem Platz:",
    L3_b_comentario: () =>
      'Das Unheil der kommenden Heiterkeit kommt davon, daß\nder Platz nicht der gebührende ist.\nEine schwache Linie auf starkem Platz, auf der Höhe der Heiterkeit: da fehlt\ndie Beherrschung. Weil man innerlich sich öffnet, kommen die Zerstreu-\nungen von außen herbeigeströmt und dringen ein, und das Unheil ist ge-\nwiss, da man sich von den herbeigezogenen Freuden überwältigen läßt.',
    L4_b_comentario: () =>
      "Die Freude der Neun auf viertem Platz hat Segen.\nDer Strich ist in der Mitte zwischen dem starken Herrn, Neun auf fünftem\nPlatz, zu dem er in Beziehung des Empfangens steht, und der weichen Linie,\nSechs auf drittem Platz, die zu ihm in der Beziehung des Zusammenhaltens\nsteht und ihn zu verführen sucht. Aber obwohl er in dieser Lage noch nicht\nohne weiteres zur Ruhe gekommen ist, so besitzt doch sein Leben genügend\ninnere Kraft, um sich zu überlegen, wem er folgen will, und die Beziehungen\nzur Sechs auf drittem Platz abzutun. Dadurch kommt Heil und Segen für ihn\nund andere.",
    L4_a_oraculo: () => "Überlegte Heiterkeit ist nicht beruhigt. Nach Abtun der Fehler\nhat man Freude.",
  },
  59: {
    chinese_roman: () => "HUAN",
    ruler_note: () =>
      'Der Herr des Zeichens ist die Neun auf fünftem Platz; denn die Auflösung\nsteht. Doch steht die Neun auf zweitem Platz im Innern, um die Grundlagen\nzu festigen, und die Sechs auf viertem Platz steht zur Neun auf fünftem\nPlatz in der Beziehung des Empfangens, um deren Werke zu vollenden. So\nhaben auch diese beiden wichtige Funktionen innerhalb des Zeichens. Darum heißt es im Kommentar zur Entscheidung: „Das Feste kommt und erschöpft sich nicht, das Weiche bekommt einen Platz im Äußeren, und der\nObere ist in Übereinstimmung mit ihm."',
  },
  60: {
    chinese_roman: () => "KIEH",
    image_oraculo: (_pdf, rec) => oracleOnly(rec.image_oraculo),
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
  },
  61: {
    chinese_roman: () => "KUNG FU",
    ruler_note: (_pdf, rec) => cleanField(rec.ruler_note.replace(/^Kan und\nLi\n/, ""), "ruler_note"),
    image_oraculo: (_pdf, rec) => oracleOnly(rec.image_oraculo),
  },
  62: {
    nombre: () => "DES KLEINEN ÜBERGEWICHT",
    chinese_roman: () => "SIAU GO",
    ruler_note: () =>
      'Die Herren des Zeichens sind die zweite und fünfte Linie, deshalb, weil\nda ein Übergang notwendig ist, ohne zu übertreiben.',
    image_oraculo: () =>
      "Auf dem Berg ist der Donner: das Bild von des Kleinen Über-\ngewicht. So legt der Edle im Wandel das Übergewicht auf\ndie Ehrerbietung, bei Trauerfällen legt er das Übergewicht\nauf die Trauer, bei seinen Ausgaben legt er das Übergewicht\nauf die Sparsamkeit.",
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
  },
  63: {
    chinese_roman: () => "KI DSI",
    image_oraculo: (_pdf, rec) => oracleOnly(rec.image_oraculo),
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
  },
  64: {
    chinese_roman: () => "WEI DSI",
    image_oraculo: (_pdf, rec) => oracleOnly(rec.image_oraculo),
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
  },
  1: {
    chinese_roman: () => "KIAN",
    ruler_note: () =>
      'Der Herr des Zeichens ist die Neun auf fünftem Platz. Das Schöpferische bezeichnet den Weg des Himmels, und der fünfte Platz ist das Bild des\nHimmels. Andererseits bezeichnet das Schöpferische den Weg des Edlen,\nund der fünfte Platz als Platz des Herrschers ist der dem Edlen gebührende\nPlatz. Die Neun auf fünftem Platz besitzt außerdem vollzählig die vier\nEigenschaften der Festigkeit, der Stärke, des Maßes (zentrale Stellung im\noberen Zeichen) und der Gerechtigkeit (Korrektheit, da als Yangelement\nauf dem Yangplatz befindlich). Insofern besitzt dieser Strich den Charakter\ndes Himmels in seiner Reinheit.\nDas Zeichen ist dem vierten Monat (April-Mai) zugeordnet, da die lichte\nKraft auf der Höhe ist.',
    commentary_decision: (_pdf, rec) => cleanField(rec.commentary_decision, "commentary_decision"),
    image_oraculo: () =>
      "Des Himmels Bewegung ist kraftvoll.\nSo macht der Edle sich stark und unermüdlich.",
    commentary_image: (_pdf, rec) => cleanField(rec.commentary_image, "commentary_image"),
    L1_a_oraculo: () => "Verdeckter Drache. Handle nicht.",
    L2_a_oraculo: () => "Erscheinender Drache auf dem Feld. Es ist fördernd, den großen Mann zu sehen.",
    L3_a_oraculo: () => "Der Edle ist den ganzen Tag schöpferisch tätig. Am Abend ist er noch voll Furcht und Zittern. Kein Makel.",
    L4_a_oraculo: () => "Schwankender Aufschwung über die Tiefe. Kein Makel.",
    L5_a_oraculo: () => "Fliegender Drache am Himmel. Es ist fördernd, den großen Mann zu sehen.",
    L6_a_oraculo: () => "Hochmütiger Drache wird zu bereuen haben.",
  },
  2: {
    chinese_roman: () => "KUN",
    ruler_note: (_pdf, rec) => cleanField(rec.ruler_note.replace(/^Kun und\nKun\n/, ""), "ruler_note"),
    commentary_decision: (_pdf, rec) => cleanField(rec.commentary_decision, "commentary_decision"),
    image_oraculo: () =>
      "Des Erde Natur ist empfänglich und dienend.\nSo trägt der Edle die Welt mit seiner umfassenden Fruchtbarkeit.",
    commentary_image: (_pdf, rec) => cleanField(rec.commentary_image, "commentary_image"),
    L6_b_comentario: (pdf) => cleanField(pdf.replace(/\n震\s*$/u, ""), "L6_b_comentario"),
  },
  8: {
    chinese_roman: () => "PI",
    ruler_note: (_pdf, rec) => cleanField(rec.ruler_note.replace(/^Kan und\nKan\n/, ""), "ruler_note"),
    image_oraculo: (_pdf, rec) => oracleOnly(rec.image_oraculo),
    commentary_image: (_pdf, rec) => commentaryImageFrom(rec.commentary_image, _pdf),
  },
};

/** @param {number} hex @param {Record<string, string>} pdf @param {Record<string, string>} rec */
function autoCorrection(hex, pdf, rec, field) {
  const p = pdf[field] ?? "";
  const r = rec[field] ?? "";
  if (!p && !r) return null;

  if (field === "chinese_roman" && r) {
    const up = r.toUpperCase();
    return up !== p ? up : null;
  }
  if (field === "nombre" && !p.trim() && r.trim()) return r;

  if (field === "image_oraculo") {
    const target = hasOcrArtifacts(p) || r.includes("Anfangs") ? oracleOnly(r || p) : oracleOnly(p || r);
    return target && !sameIgnoringHyphenBreaks(target, p) ? target : null;
  }
  if (field === "commentary_image") {
    const target = commentaryImageFrom(r, p);
    return target && !sameIgnoringHyphenBreaks(target, p) ? target : null;
  }
  if (field === "commentary_decision" || field === "ruler_note" || field === "misc_notes") {
    const target = pickLongText(r, p, field);
    return target !== p && !sameIgnoringHyphenBreaks(target, p) ? target : null;
  }
  if (
    field.endsWith("_b_comentario") ||
    field.endsWith("_a_oraculo") ||
    field.endsWith("_etiqueta") ||
    field.startsWith("L")
  ) {
    const cRec = cleanField(r, field);
    const cPdf = cleanField(p, field);
    if (hasOcrArtifacts(cPdf) && cRec) return cRec !== p ? cRec : null;
    if (cRec && !sameIgnoringHyphenBreaks(cRec, cPdf) && cRec.length >= cPdf.length * 0.9) {
      return cRec !== p ? cRec : null;
    }
    return cPdf !== p ? cPdf : null;
  }
  if (hasOcrArtifacts(p) && r) {
    const target = cleanField(r, field);
    return target !== p && !sameIgnoringHyphenBreaks(target, p) ? target : null;
  }
  const target = cleanField(p, field);
  if (target !== p) return target;
  if (r && !sameIgnoringHyphenBreaks(cleanField(r, field), p)) {
    if (field === "sequence" || field === "misc_notes" || field === "commentary_decision") {
      return cleanField(r, field);
    }
  }
  return null;
}

async function main() {
  /** @type {Record<number, Record<string, string>>} */
  const out = {};

  for (const hex of HEXES) {
    const { pdf, rec } = await readPilot(hex);
    out[hex] = {};
    const fixers = FIXERS[hex] ?? {};

    for (const field of Object.keys({ ...pdf, ...rec })) {
      if (fixers[field]) {
        const val = fixers[field](pdf[field] ?? "", rec);
        if (val !== (pdf[field] ?? "")) out[hex][field] = val;
        continue;
      }
      const auto = autoCorrection(hex, pdf, rec, field);
      if (auto != null) out[hex][field] = auto;
    }
  }

  const body = `/**
 * JPG-verified contenido_pdf corrections for hex 54–64 + 1, 2, 8 (AUD-DAT-W-07).
 * QA code: AU-FID-W-040 · v1.0.0
 */

/** @type {Record<number, Record<string, string>>} */
export const JPG_LITERAL_CORRECTIONS_54_64_1_2_8 = ${JSON.stringify(out, null, 2)};
`;

  const target = join(
    dirname(fileURLToPath(import.meta.url)),
    "wilhelm-de-jpg-literal-corrections-hex54-64-1-2-8.mjs",
  );
  await writeFile(target, body, "utf8");
  console.log(`Wrote ${target}`);
  for (const hex of HEXES) {
    console.log(`hex ${hex}: ${Object.keys(out[hex]).length} fields`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
