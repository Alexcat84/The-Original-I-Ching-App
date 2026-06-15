import type { CastResult, InterpretationMode, LineValue, MutationRule } from "./types.js";
import { performCastFromLineValues } from "./engine.js";

export type MutationQaFixtureId =
  | "NO_CHANGING"
  | "ONE_CHANGING"
  | "TWO_YIN_YANG"
  | "TWO_SAME_LOWER"
  | "THREE_MIDDLE"
  | "FOUR_LOWEST_STABLE"
  | "FIVE_ONLY_STABLE"
  | "SIX_ALL_CHANGING"
  | "QIAN_ALL_NINE"
  | "KUN_ALL_SIX";

export type MutationQaFixture = {
  id: MutationQaFixtureId;
  label: string;
  lineValues: LineValue[];
  expectedRule: MutationRule;
  questionEs: string;
  /** Optional reference cast (e.g. incident H6 #44→#51). */
  referenceNote?: string;
};

export const MUTATION_QA_FIXTURES: MutationQaFixture[] = [
  {
    id: "NO_CHANGING",
    label: "estabilidad",
    lineValues: [7, 8, 7, 8, 7, 8],
    expectedRule: "NO_CHANGING",
    questionEs: "¿Qué estabilidad me pide el oráculo en este momento?",
  },
  {
    id: "ONE_CHANGING",
    label: "una mutación",
    lineValues: [9, 8, 7, 8, 7, 8],
    expectedRule: "ONE_CHANGING",
    questionEs: "¿Qué significa que solo una línea esté en movimiento?",
  },
  {
    id: "TWO_YIN_YANG",
    label: "yin+yang",
    lineValues: [6, 9, 7, 8, 7, 8],
    expectedRule: "TWO_YIN_YANG",
    questionEs: "Dos líneas cambian, una yin y una yang: ¿qué leer?",
  },
  {
    id: "TWO_SAME_LOWER",
    label: "mismo tipo inferior",
    lineValues: [7, 9, 7, 9, 7, 7],
    expectedRule: "TWO_SAME_LOWER",
    questionEs: "Dos mutaciones del mismo tipo: ¿cuál línea rige?",
  },
  {
    id: "THREE_MIDDLE",
    label: "tres mutantes central",
    lineValues: [6, 9, 7, 9, 7, 7],
    expectedRule: "THREE_MIDDLE",
    questionEs: "Tres líneas en movimiento: ¿cuál es la central que gobierna?",
  },
  {
    id: "FOUR_LOWEST_STABLE",
    label: "cuatro mutantes estable baja",
    lineValues: [9, 9, 9, 9, 7, 7],
    expectedRule: "FOUR_LOWEST_STABLE",
    questionEs: "Cuatro líneas cambian: ¿qué línea estable del transformado leer?",
  },
  {
    id: "FIVE_ONLY_STABLE",
    label: "five_changing_one_stable",
    lineValues: [6, 9, 9, 7, 9, 9],
    expectedRule: "FIVE_ONLY_STABLE",
    questionEs: "Cinco líneas mutantes: ¿qué testigo estable queda en el transformado?",
    referenceNote: "Incident H6: #44姤→#51震, stable line 4 transformed",
  },
  {
    id: "SIX_ALL_CHANGING",
    label: "mutación total",
    lineValues: [9, 6, 9, 6, 9, 6],
    expectedRule: "SIX_ALL_CHANGING",
    questionEs: "Las seis líneas cambian: ¿cómo leer el juicio del transformado?",
  },
  {
    id: "QIAN_ALL_NINE",
    label: "用九",
    lineValues: [9, 9, 9, 9, 9, 9],
    expectedRule: "QIAN_ALL_NINE",
    questionEs: "Qian con todos yang viejos: ¿qué dice el séptimo yao?",
  },
  {
    id: "KUN_ALL_SIX",
    label: "用六",
    lineValues: [6, 6, 6, 6, 6, 6],
    expectedRule: "KUN_ALL_SIX",
    questionEs: "Kun con todos yin viejos: ¿qué dice el séptimo yao?",
  },
];

const TRANSLATOR_MAP: Record<
  InterpretationMode,
  InterpretationMode
> = {
  wilhelm: "wilhelm",
  legge: "legge",
  zhouyi: "zhouyi",
  master_combined: "master_combined",
};

export type MutationQaTranslator = keyof typeof TRANSLATOR_MAP;

export function buildCastFixture(
  fixtureId: MutationQaFixtureId,
  translator: MutationQaTranslator = "wilhelm",
): CastResult {
  const fixture = MUTATION_QA_FIXTURES.find((f) => f.id === fixtureId);
  if (!fixture) {
    throw new Error(`Unknown mutation QA fixture: ${fixtureId}`);
  }
  const cast = performCastFromLineValues(
    fixture.questionEs,
    "es",
    fixture.lineValues,
    {
      id: `qa-${fixtureId}-${translator}`,
      translator: TRANSLATOR_MAP[translator],
    },
  );
  if (cast.mutationRule !== fixture.expectedRule) {
    throw new Error(
      `Fixture ${fixtureId}: expected rule ${fixture.expectedRule}, got ${cast.mutationRule}`,
    );
  }
  return cast;
}

export function listMutationQaCases(
  translators: MutationQaTranslator[] = ["wilhelm", "legge", "zhouyi", "master_combined"],
): Array<{ fixtureId: MutationQaFixtureId; translator: MutationQaTranslator }> {
  return MUTATION_QA_FIXTURES.flatMap((f) =>
    translators.map((translator) => ({ fixtureId: f.id, translator })),
  );
}
