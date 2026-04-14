export type CableType = "none" | "2x2" | "4x4";
export type BorderStyle = "none" | "garter" | "seed" | "ribbing";
export type YarnWeight =
  | "lace"
  | "fingering"
  | "sport"
  | "dk"
  | "worsted"
  | "bulky"
  | "super-bulky";

export interface GaugeProfile {
  stitchesPerInch: number;
  rowsPerInch: number;
  needleSize: string;
  yardagePer100g: number;
  weight: YarnWeight;
}

export interface PatternInputs {
  desiredLengthInches: number;
  stitchRepeats: number;
  cableType: CableType;
  borderStyle: BorderStyle;
  gauge: GaugeProfile;
}

export interface CableSchedule {
  crossEveryNRows: number;
  crossingRows: number[];
  description: string;
}

export interface RowInstruction {
  rowNumber: number;
  side: "RS" | "WS";
  isCableCrossRow: boolean;
  instruction: string;
}

export interface YarnEstimate {
  totalYards: number;
  totalGrams: number;
  skeinsNeeded: number;
  label: string;
}

export interface GeneratedPattern {
  inputs: PatternInputs;
  castOnCount: number;
  totalRowCount: number;
  cableSchedule: CableSchedule | null;
  yarnEstimate: YarnEstimate;
  abbreviationKey: Record<string, string>;
  rows: RowInstruction[];
  warnings: string[];
}
