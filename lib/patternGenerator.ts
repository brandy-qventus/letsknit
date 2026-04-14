import type {
  PatternInputs,
  GaugeProfile,
  YarnWeight,
  CableType,
  BorderStyle,
  CableSchedule,
  RowInstruction,
  YarnEstimate,
  GeneratedPattern,
} from "@/types/pattern";

// ── Gauge presets ────────────────────────────────────────────────────────────

export const GAUGE_PRESETS: Record<YarnWeight, GaugeProfile> = {
  lace:         { weight: "lace",         stitchesPerInch: 8,   rowsPerInch: 10,  needleSize: "US 1 (2.25mm)", yardagePer100g: 400 },
  fingering:    { weight: "fingering",    stitchesPerInch: 7,   rowsPerInch: 9,   needleSize: "US 2 (2.75mm)", yardagePer100g: 400 },
  sport:        { weight: "sport",        stitchesPerInch: 6,   rowsPerInch: 8,   needleSize: "US 4 (3.5mm)",  yardagePer100g: 300 },
  dk:           { weight: "dk",           stitchesPerInch: 5.5, rowsPerInch: 7.5, needleSize: "US 6 (4mm)",    yardagePer100g: 250 },
  worsted:      { weight: "worsted",      stitchesPerInch: 5,   rowsPerInch: 7,   needleSize: "US 8 (5mm)",    yardagePer100g: 200 },
  bulky:        { weight: "bulky",        stitchesPerInch: 3.5, rowsPerInch: 5,   needleSize: "US 10 (6mm)",   yardagePer100g: 130 },
  "super-bulky":{ weight: "super-bulky",  stitchesPerInch: 2.5, rowsPerInch: 3.5, needleSize: "US 13 (9mm)",   yardagePer100g: 80  },
};

// ── Stitch structure constants ────────────────────────────────────────────────

// Width (in stitches) of one pattern repeat, by cable type
const REPEAT_WIDTH: Record<CableType, number> = {
  none:  4,   // 4 plain knit stitches
  "2x2": 6,   // p1, k4 (cable), p1
  "4x4": 10,  // p1, k8 (cable), p1
};

// Border stitches added on each side
const BORDER_STS: Record<BorderStyle, number> = {
  none:    0,
  garter:  2,
  seed:    2,
  ribbing: 2,
};

// Cable crossing interval in rows
const CABLE_INTERVAL: Record<CableType, number> = {
  none:  0,
  "2x2": 4,
  "4x4": 8,
};

// ── Stitch lookup tables ──────────────────────────────────────────────────────

// RS and WS border stitch instructions, keyed by border style
const BORDER_STITCHES: Record<BorderStyle, { rs: string; ws: string }> = {
  none:    { rs: "",        ws: ""        },
  garter:  { rs: "k2",     ws: "k2"      },
  seed:    { rs: "k1, p1", ws: "p1, k1"  },
  ribbing: { rs: "k1, p1", ws: "p1, k1"  },
};

// Center unit stitches for RS (normal & cross row) and WS, keyed by cable type
const CABLE_STITCHES: Record<CableType, { rs: string; rsCross: string; ws: string }> = {
  none:  { rs: "k4",          rsCross: "k4",          ws: "p4"         },
  "2x2": { rs: "p1, k4, p1",  rsCross: "p1, c4f, p1", ws: "k1, p4, k1" },
  "4x4": { rs: "p1, k8, p1",  rsCross: "p1, c8f, p1", ws: "k1, p8, k1" },
};

// Abbreviation entries to merge into the key, keyed by border style
const BORDER_ABBREVIATIONS: Record<BorderStyle, Record<string, string>> = {
  none:    {},
  garter:  { "k2":     "Knit 2 (garter border — knit every row)" },
  seed:    { "k1, p1": "Knit 1, Purl 1" },
  ribbing: { "k1, p1": "Knit 1, Purl 1" },
};

// Abbreviation entries to merge into the key, keyed by cable type
const CABLE_ABBREVIATIONS: Record<CableType, Record<string, string>> = {
  none: { k4: "Knit 4", p4: "Purl 4" },
  "2x2": {
    c4f: "Cable 4 Front: slip 2 sts to CN, hold in FRONT, k2, then k2 from CN (left-leaning twist)",
    CN:  "Cable Needle",
    k4:  "Knit 4 (cable column on non-crossing rows)",
    p1:  "Purl 1 (cable column separator)",
  },
  "4x4": {
    c8f: "Cable 8 Front: slip 4 sts to CN, hold in FRONT, k4, then k4 from CN (left-leaning twist)",
    CN:  "Cable Needle",
    k8:  "Knit 8 (cable column on non-crossing rows)",
    p1:  "Purl 1 (cable column separator)",
  },
};

// ── Core calculations ─────────────────────────────────────────────────────────

export function computeCastOn(inputs: PatternInputs): number {
  return REPEAT_WIDTH[inputs.cableType] * inputs.stitchRepeats +
    BORDER_STS[inputs.borderStyle] * 2;
}

export function computeRowCount(inputs: PatternInputs): number {
  const raw = Math.ceil(inputs.desiredLengthInches * inputs.gauge.rowsPerInch);
  return raw % 2 === 0 ? raw : raw + 1; // force even so we end on WS
}

// ── Cable schedule ────────────────────────────────────────────────────────────

function buildCableSchedule(cableType: CableType, totalRows: number): CableSchedule | null {
  if (cableType === "none") return null;
  const interval = CABLE_INTERVAL[cableType];
  const firstCross = interval + 1; // e.g. row 5 for 2x2 (interval 4)
  const crossingRows: number[] = [];
  for (let r = firstCross; r <= totalRows - 2; r += interval) {
    crossingRows.push(r);
  }
  return {
    crossEveryNRows: interval,
    crossingRows,
    description: `Cross every ${interval} rows, starting on row ${firstCross} (${crossingRows.length} total crossings)`,
  };
}

// ── Row instruction builder ───────────────────────────────────────────────────

function buildRow(
  rowNumber: number,
  borderStyle: BorderStyle,
  cableType: CableType,
  repeats: number,
  isCrossRow: boolean
): RowInstruction {
  const side = rowNumber % 2 === 1 ? "RS" : "WS";
  const border = BORDER_STITCHES[borderStyle];
  const cable = CABLE_STITCHES[cableType];

  const centerUnit = side === "RS" ? (isCrossRow ? cable.rsCross : cable.rs) : cable.ws;
  const center = repeats === 1 ? centerUnit : `[${centerUnit}] ${repeats} times`;
  const b = side === "RS" ? border.rs : border.ws;
  const parts = b ? [b, center, b] : [center];

  return {
    rowNumber,
    side,
    isCableCrossRow: isCrossRow,
    instruction: `Row ${rowNumber} (${side})${isCrossRow ? " [CABLE]" : ""}: ${parts.join(", ")}`,
  };
}

// ── Yarn estimate ─────────────────────────────────────────────────────────────

function estimateYarn(castOn: number, totalRows: number, gauge: GaugeProfile): YarnEstimate {
  const widthInches = castOn / gauge.stitchesPerInch;
  const yardsPerRow = widthInches * 1.1; // 10% take-up factor
  const totalYards = Math.ceil(yardsPerRow * totalRows);
  const totalGrams = Math.ceil((totalYards / gauge.yardagePer100g) * 100);
  const skeinsNeeded = Math.ceil(totalYards / gauge.yardagePer100g);
  return {
    totalYards,
    totalGrams,
    skeinsNeeded,
    label: `~${totalYards} yds / ~${totalGrams}g / ${skeinsNeeded} skein${skeinsNeeded !== 1 ? "s" : ""} (${gauge.yardagePer100g} yds per 100g)`,
  };
}

// ── Abbreviation key ──────────────────────────────────────────────────────────

function buildAbbreviationKey(inputs: PatternInputs): Record<string, string> {
  return {
    CO: "Cast on",
    BO: "Bind off all stitches",
    k:  "Knit",
    p:  "Purl",
    RS: "Right Side (fabric facing you)",
    WS: "Wrong Side (fabric facing away)",
    ...BORDER_ABBREVIATIONS[inputs.borderStyle],
    ...CABLE_ABBREVIATIONS[inputs.cableType],
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generatePattern(inputs: PatternInputs): GeneratedPattern {
  const warnings: string[] = [];

  if (inputs.stitchRepeats < 1) {
    warnings.push("Stitch repeats must be at least 1. Defaulting to 1.");
    inputs = { ...inputs, stitchRepeats: 1 };
  }

  const castOnCount = computeCastOn(inputs);
  const rawRows = Math.ceil(inputs.desiredLengthInches * inputs.gauge.rowsPerInch);
  const totalRowCount = rawRows % 2 === 0 ? rawRows : rawRows + 1;

  if (rawRows !== totalRowCount) {
    warnings.push(`Row count adjusted from ${rawRows} to ${totalRowCount} to end on a WS row.`);
  }

  const cableSchedule = buildCableSchedule(inputs.cableType, totalRowCount);
  const yarnEstimate = estimateYarn(castOnCount, totalRowCount, inputs.gauge);
  const abbreviationKey = buildAbbreviationKey(inputs);

  const crossingRowSet = new Set(cableSchedule?.crossingRows ?? []);
  const rows: RowInstruction[] = [];
  for (let r = 1; r <= totalRowCount; r++) {
    rows.push(buildRow(r, inputs.borderStyle, inputs.cableType, inputs.stitchRepeats, crossingRowSet.has(r)));
  }

  return {
    inputs,
    castOnCount,
    totalRowCount,
    cableSchedule,
    yarnEstimate,
    abbreviationKey,
    rows,
    warnings,
  };
}
