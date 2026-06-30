/**
 * One-shot generator for JPG literal corrections hex 49–53 (AUD-DAT-W-07).
 * QA code: AU-FID-W-039 generate-wilhelm-de-jpg-literal-corrections-hex49-53 · v1.0.0
 * Area: scripts/lib/wilhelm-de-jpg-literal-corrections-hex49-53.mjs
 * Family: FID-W
 * Run: node scripts/lib/generate-wilhelm-de-jpg-literal-corrections-hex49-53.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const PILOT_DIR = join(ROOT, "tools/manual-gold/wilhelm-de-comments-au");

/** @param {number} hex */
async function readPilot(hex) {
  const raw = await readFile(join(PILOT_DIR, `wilhelm-de-comments-hex-${hex}-pilot-au.tsv`), "utf8");
  /** @type {Record<string, string>} */
  const fields = {};
  for (const line of raw.split("\n")) {
    if (!line.trim() || line.startsWith("campo\t") || line.startsWith("hex_fin")) continue;
    const tab = line.indexOf("\t");
    if (tab < 0) continue;
    const parts = line.split("\t");
    fields[parts[0]] = parts[3] ?? "";
  }
  return fields;
}

/** @param {string} s */
function stripHexBleed(s, hanzi) {
  const idx = s.indexOf(hanzi);
  return idx >= 0 ? s.slice(0, idx).trimEnd() : s;
}

/** @type {Record<number, Record<string, (pdf: string, rec: Record<string, string>) => string>>} */
const FIXERS = {
  49: {
    ruler_note: (pdf) =>
      'Der Herr des Zeichens ist die Neun auf fünftem Platz, denn man muß um die Autorität für eine Umwälzung zu haben. Wer zentral und korrekt ist, der vermag das ganze Gute einer solchen Umwälzung herauszubringen. Darum heißt es von diesem Strich: „Der große Mann ändert wie ein Tiger."',
    commentary_decision: (pdf) =>
      pdf
        .replace(
          /Zwei\n1 Weil der Gedanke des Brunnens[\s\S]*?in ihrer Bedeutung\.\n/,
          "Zwei\nTöchter ",
        )
        .replace(/,,/g, "„")
        .replace(/,,so schwindet Reue"\./, '„so schwindet Reue".')
        .replace(/Zwei\nTöchter Töchter/, "Zwei\nTöchter"),
    image_oraculo: () =>
      "Im See ist Feuer: das Bild der Umwälzung.\nSo ordnet der Edle die Zeitrechnung\nund macht die Zeiten klar.",
    commentary_image: (pdf) => pdf,
    L1_b_comentario: (pdf) => (pdf.startsWith("„") ? pdf : `„${pdf}`),
    L2_b_comentario: () =>
      '„Am eignen Tag, da mag man umwälzen."\nDas Handeln bringt schönen Erfolg.\nDer Strich ist korrekt, zentral und klar. Der Platz ist der des Beamten.\nNach oben hin steht er zum Herrn des Zeichens, Neun auf fünftem Platz, in\nder Beziehung des Entsprechens, darum hat er die Möglichkeit des erfolgreichen Handelns. Hier ist der Zeitpunkt, der im Urteil zum Gesamtzeichen\nals der rechte Zeitpunkt bezeichnet wurde, da man Glauben findet. Über\ndie Bedeutung „der eigne Tag" (Gi Ji) vgl. oben. Hier ist die Konstellation\nbesonders deutlich. Der Tag wird nahegelegt durch das Zeichen Li, der\nmittlere Strich ist der entsprechende Platz der Erde, die im Südwesten\nneben Li (Westen) steht.',
    L3_b_comentario: (pdf) => pdf.replace(/\n•\n/, "\n"),
    L5_b_comentario: (pdf) => pdf.replace(/\nFe\nA\s*$/, ""),
  },
  50: {
    ruler_note: () =>
      'Dui und\nKiän\nDie Herren des Zeichens sind die Sechs auf fünftem Platz und die obere\nNeun. Die dem Zeichen „Tiegel" zugrunde liegende Idee ist die Ernährung der Würdigen. Die Sechs auf fünftem Platz ehrt den Ehrwürdigen,\nder durch die obere Neun dargestellt wird. Das Bild ist davon genommen,\nwie die Ringe und Ohren des Tiegels ineinander passen.',
    commentary_decision: (pdf) => pdf.replace(/Stridie/g, "Striche"),
    image_oraculo: () =>
      "Über dem Holz ist Feuer: das Bild des Tiegels.\nSo festigt der Edle\ndurch Richtigmachung der Stellung das Schicksal.",
    commentary_image: (pdf) => pdf.replace(/^S\n/, ""),
    L1_b_comentario: (pdf) => pdf.replace(/\n\+\s*$/, ""),
    L2_b_comentario: (pdf) =>
      pdf
        .replace(/Stridie/g, "Striche")
        .replace(/\n\*\*N\n/, "\n")
        .replace(/-\n-\nist und/g, "ist und"),
    L4_b_comentario: (pdf) => (pdf.startsWith("„") ? pdf : `„${pdf}`),
    L5_a_oraculo: (pdf) => pdf.replace(/\nE\s*$/, "").trimEnd(),
    L5_b_comentario: () =>
      'Die gelben Henkel des Tiegels sind zentral, um das Wirkliche\naufzunehmen.\nDer Strich ist zentral im oberen Zeichen Li, und zwar ist er die zentrale\nLinie des Zeichens Kun, die die gelbe Farbe hat. Die Tragringe sind aus\nMetall, weil das obere Kernzeichen Dui das Metall bedeutet. Die Tragringe\n(die bei altchinesischen Geräten in der Regel kettenförmig zusammenhängen)\nwerden wohl durch den oberen starken Strich dargestellt. Der Henkel ist\n— im Gegensatz zur Neun auf drittem Platz — hohl, daher kann er die\n„wirklichen" d. h. festen Tragringe aufnehmen und getragen werden.\nIn der Symbolsprache bedeutet das sehr viel. Der Strich ist der Herr des\nZeichens, er hat über sich einen Weisen (obere 9), mit dem er durch Stellung und Ergänzung verbunden ist. Er ist hohl, daher imstande, die Kraft\njenes Weisen, seine Lehren, in sich aufzunehmen; Henkel (örl) ist das-\nselbe Zeichen wie „Ohr". Dadurch kommt er voran.',
    L6_b_comentario: (pdf) => stripHexBleed(pdf.replace(/\ni\n震\s*$/, ""), "震"),
  },
  51: {
    ruler_note: () =>
      "(DAS ERSCHUTTERN, DER DONNER)\nKernzeichen: Kan und\nGen\nDie Herren des Zeichens Dschen sind die beiden lichten Striche. Da es aber\nunten her in Bewegung ist, wird der vierte Strich nicht als Herr betrachtet,\nsondern nur der Anfangsstrich.",
    sequence: (pdf) => pdf,
    commentary_decision: (pdf) =>
      pdf
        .replace(/,,/g, "„")
        .replace(/"\}"\n/, "\n")
        .replace(/nahegelegt der alles/g, "nahegelegt —, der alles")
        .replace(/\n~1\nπ\s*$/, ""),
    image_oraculo: () =>
      "Fortgesetzter Donner: das Bild des Erschütterns.\nSo macht der Edle unter Furcht und Zittern sein Leben recht\nund erforscht sich selbst.",
    commentary_image: () =>
      "Fortgesetzter Donner heißt es, weil das Zeichen Dschen verdoppelt übereinander steht. Furcht und Zittern ist der erste Donner, Bilden und Forschen\nist der zweite Donner.",
    L1_b_comentario: () =>
      '„Das Erschüttern kommt: Hu, Hu!"\nFurcht bringt Glück.\n„Lachende Worte: Ha, Ha!"\nNachher hat man eine Regel.\nEs ist hier wörtlich ein Teil des Gesamttextes und der Erklärung dazu angeführt, wie das zuweilen beim Herrn des Zeichens der Fall ist. Der starke\nStrich am Anfang, der von unten her die Bewegung einleitet, zeigt die\nQuintessenz der ganzen Lage.',
    L5_b_comentario: () =>
      '„Das Erschüttern geht hin und her: Gefahr."\nMan wandelt in Gefahr. Die Geschäfte sind in der Mitte,\ndarum verliert man durchaus nichts.\nDer Strich ist zentral ebenso wie die Sechs auf zweitem Platz. Aber\nwährend dort das Kernzeichen Kan, Gefahr, bevorsteht, ist es hier überwunden; man ist schon auf dem Hügel (Kernzeichen Gen). Darum verliert\nman nichts. Es gilt nur, daß man durch Festhalten der zentralen Stellung\nsich die Stärke wahrt, die in dieser Stellung — fünf ist der Platz des Herrschers — liegt. Die Sechs auf zweitem Platz ist Beamter. Der Beamte mag\nvorübergehend seinen Besitz verlieren; das läßt sich alles wieder ersetzen.\nDie Sechs auf fünftem Platz ist aber der Herrscher. Sein Besitz ist Land\nund Leute. Die dürfen nicht verlorengehen. Das ist möglich, wenn man\nsich zentral und korrekt verhält.',
    L6_b_comentario: () =>
      '„Die Erschütterung bringt Verfall."\nEr hat die Mitte nicht erreicht.\nObwohl Unheil, kein Makel.\nMan läßt sich durch die Furcht für den Nachbar warnen.\nDer Strich steht in Beziehung zum dritten; das ist der Genosse, der zu reden\nhat. Die fünfte Linie ist der Nachbar. Die schwache Linie steht an der\nSpitze der Erschütterung, sie ist daher der Erschütterung an sich nicht gewachsen. Die Erschütterung droht mit Ruin wie beim Erdbeben. Daher das\nängstliche Umherblicken. Wollte man in solchem Zustand etwas unternehmen, so wäre das vom Übel. Läßt man sich dagegen warnen durch das,\nwas der Nachbar in diesem Fall — die fünfte Linie — erlebt, und hält sich\nruhig, so bleibt man frei von Fehlern. Die dritte Linie, der Genosse, ist\ndurch ihre Lage gezwungen, sich zu bewegen, darum wird sie es nicht verstehen, daß die sechste Linie sich ruhig verhält. Aber das verschiedene\nVerhalten ergibt sich aus dem verschiedenen Platz. Darum muß man ganz\nunabhängig in seinen Handlungen sein.',
  },
  52: {
    ruler_note: () =>
      "Dschen und\nKan\nEigentlich sind auch beim Zeichen Gen die beiden lichten Striche die Herren des Zeichens. Aber die Bedeutung des Zeichens der Stillstand\nberuht eben darauf, daß das Lichte stillsteht. Darum gilt der dritte Strich\nnicht als Herr, sondern nur der oberste.",
    sequence: () =>
      "Die Dinge können sich nicht dauernd bewegen, man muß sie\ninnehalten machen. Darum folgt darauf das Zeichen: Das\nStillehalten. Stillehalten bedeutet innehalten.",
    commentary_decision: (pdf) =>
      pdf
        .replace(/Zeichhen/g, "Zeichen")
        .replace(/\n老\n​t\n"\nentsprechenden/, "\nentsprechenden"),
    image_oraculo: () =>
      "Zusammenstehende Berge: das Bild des Stillehaltens.\nSo geht der Edle mit seinen Gedanken nicht über seine\nLage hinaus.",
    commentary_image: (pdf) => pdf,
    L2_b_comentario: () =>
      '„Er kann den nicht retten, dem er folgt":\nDenn er kehrt sich nicht nach ihm, daß er auf ihn hört.\nDer Strich, dem die Sechs auf zweitem Platz folgt, ist die Neun auf drittem\nPlatz. Die Sechs auf zweitem Platz ist korrekt und zentral und möchte nicht\nnur sich, sondern auch den, dem sie folgt, retten. Aber die Neun auf drittem\nPlatz ist stark, auf dem Platz des Übergangs, der untere Strich des KernDer Satz im Kommentar: „Sein Innehalten stillhalten" (chin. „Gen Ki Dschr") ist\nTextfehler seit Wang Bi; es muß heißen wie im Urteil: „Seinen Rücken stillhalten"\n(Gen Ki Be). Das ergibt sich aus der Vergleichung der älteren Erklärungen.\nzeichens Dschen, Erregung, daher aufs äußerste unruhig; zugleich ist er\nim Kernzeichen Kan, das Abgründige, das Ohrenleiden bedeutet, daher\ndas mangelnde Hören. Andererseits ist Kan das Sinnbild des Herzens, daher: „Sein Herz ist nicht froh."',
    L3_b_comentario: (pdf) => pdf.replace(/wodurdi/g, "wodurch"),
    L5_b_comentario: (pdf) =>
      pdf.replace(/\neid\net,:[\s\S]*$/, "").replace(/\nS\n=\s*$/, ""),
    L6_b_comentario: (pdf) => stripHexBleed(pdf, "漸"),
  },
  53: {
    ruler_note: () =>
      "(ALLMÄHLICHER FORTSCHRITT)\nKernzeichen: Li und\nKan\nDas Zeichen Entwicklung hat die Verheiratung eines Mädchens als Grundgedanken. Unter allen Strichen ist nur die Sechs auf zweitem Platz\nzu der Neun auf fünftem Platz in der Beziehung des Entsprechens. Sie ist\ndas Bild des Mädchens, das verheiratet wird. Daher ist die Sechs auf zweitem Platz der Herr des Zeichens. Aber die Entwicklung hat ferner die Bedeutung des Fortschreitens, und die Neun auf fünftem Platz ist fortgeschritten, weilt an hoher Stelle und hat einen festen und zentralen Charakter; darum ist die Neun auf fünftem Platz ebenfalls Herr des Zeichens.",
    commentary_image: (pdf) => pdf.replace(/^S\n/, ""),
    L2_b_comentario: (pdf) => pdf.replace(/\n"\nn\nEr ißt/, '\n"\nEr ißt'),
    L3_a_oraculo: (pdf) => pdf.replace(/\*?\^+MA\n?/, ""),
    L5_b_comentario: (pdf) => pdf.replace(/\n闫\n​•\n/, "\n"),
    L6_b_comentario: (pdf) => stripHexBleed(pdf.replace(/歸​妹/g, ""), "歸"),
  },
};

async function main() {
  /** @type {Record<number, Record<string, string>>} */
  const out = {};
  for (const hex of [49, 50, 51, 52, 53]) {
    const pdf = await readPilot(hex);
    out[hex] = {};
    for (const [field, fixer] of Object.entries(FIXERS[hex])) {
      out[hex][field] = fixer(pdf[field] ?? "", pdf);
    }
  }

  const clean = `/**
 * JPG-verified contenido_pdf corrections for hex 49–53 (AUD-DAT-W-07).
 * QA code: AU-FID-W-039 · v1.0.0
 */

/** @type {Record<number, Record<string, string>>} */
export const JPG_LITERAL_CORRECTIONS_49_53 = ${JSON.stringify(out, null, 2)};
`;

  const target = join(dirname(fileURLToPath(import.meta.url)), "wilhelm-de-jpg-literal-corrections-hex49-53.mjs");
  await writeFile(target, clean, "utf8");
  console.log(`Wrote ${target}`);
  for (const hex of [49, 50, 51, 52, 53]) {
    console.log(`hex ${hex}: ${Object.keys(out[hex]).length} fields`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
