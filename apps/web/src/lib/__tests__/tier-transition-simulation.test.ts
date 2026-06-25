/**
 * QA code: TS-WEB-010 tier-transition-simulation · v1.0.0
 * Area: apps/web/src/lib/tier-transition-simulation
 * Family: BILL
 */

import { describe, expect, it } from "vitest";
import { getSessionLimit } from "../token-packs";
import { canDeepenAfterNextConsult, shouldBlockDeepening } from "../thread-depth-policy";

type PlanStep = "free" | "tokens_seeker_20" | "tokens_practitioner_40" | "tokens_master_100";

describe("tier transition simulations", () => {
  const scenarios: Array<{
    name: string;
    from: PlanStep;
    to: PlanStep;
    historyLength: number;
    isDeepening: boolean;
    blocked: boolean;
    canDeepenAfterNext: boolean;
  }> = [
    {
      name: "free -> seeker keeps deepening available after first consult",
      from: "free",
      to: "tokens_seeker_20",
      historyLength: 1,
      isDeepening: true,
      blocked: false,
      canDeepenAfterNext: true,
    },
    {
      name: "seeker -> master with two consults remains open",
      from: "tokens_seeker_20",
      to: "tokens_master_100",
      historyLength: 2,
      isDeepening: true,
      blocked: false,
      canDeepenAfterNext: true,
    },
    {
      name: "master -> seeker blocks deepening when history already exceeds seeker limit",
      from: "tokens_master_100",
      to: "tokens_seeker_20",
      historyLength: 7,
      isDeepening: true,
      blocked: true,
      canDeepenAfterNext: false,
    },
    {
      name: "master -> free blocks deepening immediately once history is 1",
      from: "tokens_master_100",
      to: "free",
      historyLength: 1,
      isDeepening: true,
      blocked: true,
      canDeepenAfterNext: false,
    },
    {
      name: "new free session starts valid even after downgrade",
      from: "tokens_master_100",
      to: "free",
      historyLength: 0,
      isDeepening: false,
      blocked: false,
      canDeepenAfterNext: false,
    },
  ];

  for (const scenario of scenarios) {
    it(scenario.name, () => {
      expect(getSessionLimit(scenario.from)).toBeGreaterThan(0);
      const sessionLimit = getSessionLimit(scenario.to);
      expect(
        shouldBlockDeepening({
          isDeepening: scenario.isDeepening,
          historyLength: scenario.historyLength,
          sessionLimit,
        }),
      ).toBe(scenario.blocked);
      expect(
        canDeepenAfterNextConsult({
          historyLength: scenario.historyLength,
          sessionLimit,
        }),
      ).toBe(scenario.canDeepenAfterNext);
    });
  }
});
