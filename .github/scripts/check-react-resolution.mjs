// Resolution guard (see docs/auditorias/20260713-AUD-WEB-02-monorepo-resolution-blocker.md).
// Runs AFTER a from-scratch `npm install --package-lock-only` (no flags, with the declared
// packageManager npm@10.9.2). Fails on gross react-split drift; warns on the hoisting
// non-determinism. Reads the regenerated package-lock.json — does NOT install node_modules.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Attach the resolver's npm version to the report — a version drift here is the
// first thing to check when this canary changes behaviour (see AUD-WEB-02).
// execFileSync with an arg array (no shell) — command is a fixed literal anyway.
let npmVer = "?";
try {
  npmVer = execFileSync("npm", ["-v"]).toString().trim();
} catch {
  /* npm not resolvable as a bare binary (e.g. Windows npm.cmd) — leave as "?" */
}
console.log(`npm (resolver)     : ${npmVer}`);

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
const pkgs = lock.packages ?? {};

const root = pkgs["node_modules/react"]?.version ?? "(absent)";
// hoisted → nested fallback for each workspace
const web = pkgs["apps/web/node_modules/react"]?.version ?? pkgs["node_modules/react"]?.version ?? "(absent)";
const mobile = pkgs["apps/mobile/node_modules/react"]?.version ?? pkgs["node_modules/react"]?.version ?? "(absent)";

console.log(`root-hoisted react : ${root}`);
console.log(`apps/web react     : ${web}`);
console.log(`apps/mobile react  : ${mobile}`);

let fail = false;
if (!/^18\./.test(web)) {
  console.error(`FAIL: apps/web react is not 18.x (got ${web})`);
  fail = true;
}
if (mobile !== "19.0.0") {
  console.error(`FAIL: apps/mobile react is not 19.0.0 (got ${mobile})`);
  fail = true;
}
// The committed lockfile pins react@18.2.0 hoisted (next + web share it). A fresh regen
// hoists 19.0.0 instead (react 18/19 split non-determinism) — next would then run 19 while
// web nests 18 → broken. This is expected today; surface it so a regenerated lockfile is
// never committed. Not a hard failure of THIS check (web/mobile still resolve correctly).
if (root !== web) {
  console.warn(
    `WARN: root-hoisted react (${root}) != apps/web react (${web}). react 18/19 split ` +
      `non-determinism — do NOT commit a regenerated lockfile; keep the committed 18.2.0-hoisted one. ` +
      `See AUD-WEB-02 §2.b.`,
  );
}

if (fail) {
  console.error("resolution-guard: FAILED");
  process.exit(1);
}
console.log("resolution-guard: OK (web 18.x, mobile 19.0.0)");
