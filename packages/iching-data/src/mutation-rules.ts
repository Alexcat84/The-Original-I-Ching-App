import huangBundle from "./generated/mutation-rules.huang.json" with { type: "json" };
import zhuxiBundle from "./generated/mutation-rules.zhuxi.json" with { type: "json" };
import type { MutationRuleRecord } from "./schema.js";
import { mutationRulesBundleSchema } from "./schema.js";

// Validate on load to ensure SSoT fidelity
mutationRulesBundleSchema.parse(huangBundle);
mutationRulesBundleSchema.parse(zhuxiBundle);

const bundles = {
  huang: huangBundle,
  zhuxi: zhuxiBundle,
};

export type MutationSystem = "huang" | "zhuxi";

/**
 * Returns the mutation rule record for a given system and systemCode.
 * If the systemCode in the bundle contains a pipe (e.g. QIAN_ALL_NINE|KUN_ALL_SIX),
 * it splits by pipe and matches.
 */
export function getMutationRuleRecord(system: MutationSystem, code: string): MutationRuleRecord {
  const bundle = bundles[system];
  if (!bundle) {
    throw new Error(`Unknown mutation rules system: ${system}`);
  }

  const rule = bundle.rules.find((r) => {
    return r.systemCode === code || r.systemCode.split("|").includes(code);
  });

  if (!rule) {
    throw new Error(`Mutation rule code '${code}' not found in system '${system}'`);
  }

  return rule;
}

/**
 * Returns the English gold bookText for a given mutation rule code.
 * This is used for prompt construction in Claude to prevent translation hallucinations.
 */
export function getMutationRuleBookText(system: MutationSystem, code: string): string {
  return getMutationRuleRecord(system, code).bookText;
}
