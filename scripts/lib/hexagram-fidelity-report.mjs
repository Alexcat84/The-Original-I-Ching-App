import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

function fmtField(d) {
  if (d.field === "line") return `line${d.linePos}`;
  return d.field;
}

/**
 * @param {object} report
 * @param {string} outPath
 */
export async function writeMarkdownReport(report, outPath) {
  const lines = [];
  lines.push("# Hexagram fidelity report");
  lines.push("");
  lines.push(`- Generated: ${report.generatedAt}`);
  lines.push(`- Mode: ${report.mode}`);
  lines.push(`- Gold cache: \`tools/output/fidelity-gold/\``);
  lines.push("");

  for (const block of report.translators) {
    const s = block.summary;
    lines.push(`## ${block.translator}`);
    lines.push("");
    lines.push(
      `| Match | Mismatch | Missing gold | Missing bundle | Skipped | Total | Match % |`,
    );
    lines.push(
      `|------:|---------:|-------------:|---------------:|--------:|------:|--------:|`,
    );
    lines.push(
      `| ${s.match} | ${s.mismatch} | ${s.missing_gold} | ${s.missing_bundle} | ${s.skipped} | ${s.total} | ${s.matchPct}% |`,
    );
    lines.push("");

    const mismatches = block.diffs.filter((d) => d.status !== "match" && d.status !== "skipped");
    if (mismatches.length === 0) {
      lines.push("_No mismatches._");
      lines.push("");
      continue;
    }

    lines.push("### Mismatches (first 80)");
    lines.push("");
    lines.push("| Hex | Field | Status | Hint |");
    lines.push("|----:|-------|--------|------|");
    for (const d of mismatches.slice(0, 80)) {
      lines.push(`| ${d.hex} | ${fmtField(d)} | ${d.status} | ${d.hint} |`);
    }
    if (mismatches.length > 80) {
      lines.push("");
      lines.push(`_… and ${mismatches.length - 80} more (see JSON)._`);
    }
    lines.push("");
  }

  lines.push("## Notes");
  lines.push("");
  for (const n of report.notes ?? []) lines.push(`- ${n}`);
  lines.push("");

  await mkdir(join(outPath, ".."), { recursive: true }).catch(() => {});
  await writeFile(outPath, lines.join("\n"), "utf8");
}

export async function writeJsonReport(report, outPath) {
  await mkdir(join(outPath, ".."), { recursive: true }).catch(() => {});
  await writeFile(outPath, JSON.stringify(report, null, 2), "utf8");
}

export function buildTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
