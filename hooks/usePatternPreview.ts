import { computeCastOn, computeRowCount } from "@/lib/patternGenerator";
import type { PatternInputs } from "@/types/pattern";

export function usePatternPreview(inputs: PatternInputs) {
  const castOn = computeCastOn(inputs);
  const rows = computeRowCount(inputs);
  const length = (rows / inputs.gauge.rowsPerInch).toFixed(1);
  return { castOn, rows, length };
}
