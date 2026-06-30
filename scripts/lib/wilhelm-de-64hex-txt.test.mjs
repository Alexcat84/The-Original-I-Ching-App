/**
 * QA code: VF-FID-W-016 wilhelm-de-title-extract · v1.0.0
 * Area: scripts/lib/wilhelm-de-64hex-txt.mjs
 * Family: FID-W
 */
import { strict as assert } from "node:assert";
import {
  extractWilhelmDeBookTitleFromIntro,
  extractWilhelmDeBookTitleLine,
  parseWilhelmDeHexHeaderLine,
} from "./wilhelm-de-64hex-txt.mjs";

assert.equal(
  parseWilhelmDeHexHeaderLine("1. KIAN / DAS SCHÖPFERISCHE")?.title,
  "DAS SCHÖPFERISCHE",
);
assert.equal(parseWilhelmDeHexHeaderLine("小畜 ​9. SIAU TSCHU")?.title, "");
assert.equal(
  extractWilhelmDeBookTitleLine("DES KLEINEN ZAHMUNGSKRAFT"),
  "DES KLEINEN ZAHMUNGSKRAFT",
);
assert.equal(
  extractWilhelmDeBookTitleFromIntro("小畜 ​9. SIAU TSCHU\nDES KLEINEN ZAHMUNGSKRAFT\noben Sun"),
  "DES KLEINEN ZAHMUNGSKRAFT",
);
assert.equal(
  extractWilhelmDeBookTitleFromIntro(
    "13. TUNG JEN\nGEMEINSCHAFT MIT MENSCHEN\noben Kiän",
  ),
  "GEMEINSCHAFT MIT MENSCHEN",
);
assert.equal(
  extractWilhelmDeBookTitleFromIntro(
    "31. HIAN / DIE EINWIRKUNG\n(DIE WERBUNG)\noben Dui",
  ),
  "DIE EINWIRKUNG",
);

console.log("wilhelm-de-64hex-txt title extract: PASS");
