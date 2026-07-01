import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { buildHuangMutationRulesGold, HUANG_PAGE_MAP } from "./lib/huang-pdf-gold.mjs";
import { buildZhuxiAdlerMutationRulesGold, ZHUXI_ADLER_PAGE_MAP } from "./lib/zhuxi-adler-pdf-gold.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, "..", "packages", "iching-data", "src", "generated");

mkdirSync(GENERATED_DIR, { recursive: true });

const huangRules = buildHuangMutationRulesGold();
const huangBundle = {
  system: "huang",
  source: "Taoist Master Alfred Huang, The Complete I Ching — 10th Anniversary Edition (2010)",
  generatedAt: new Date().toISOString(),
  pageMapping: HUANG_PAGE_MAP,
  rules: huangRules,
};

writeFileSync(join(GENERATED_DIR, "mutation-rules.huang.json"), JSON.stringify(huangBundle, null, 2));

const zhuxiRules = buildZhuxiAdlerMutationRulesGold();
const zhuxiBundle = {
  system: "zhuxi",
  source: "Zhu Xi (1130–1200), Yixue Qimeng (易學啟蒙, 1186), ch. IV — Joseph Adler trans.",
  generatedAt: new Date().toISOString(),
  pageMapping: ZHUXI_ADLER_PAGE_MAP,
  rules: zhuxiRules,
};

writeFileSync(join(GENERATED_DIR, "mutation-rules.zhuxi.json"), JSON.stringify(zhuxiBundle, null, 2));

console.log("Built mutation-rules.huang.json and mutation-rules.zhuxi.json");
