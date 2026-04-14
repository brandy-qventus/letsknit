"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PrintButton } from "@/components/PrintButton";
import type { GeneratedPattern, RowInstruction } from "@/types/pattern";

interface PatternOutputProps {
  pattern: GeneratedPattern | null;
}

function RowBlock({ rows }: { rows: RowInstruction[] }) {
  return (
    <div className="space-y-0.5">
      {rows.map((row) => (
        <div
          key={row.rowNumber}
          className={`flex items-start gap-2 py-1 px-2 rounded text-sm font-mono ${
            row.isCableCrossRow
              ? "border-l-4 border-amber-400 bg-amber-50 dark:bg-amber-950/20"
              : row.side === "WS"
              ? "text-muted-foreground"
              : ""
          }`}
        >
          <span className="shrink-0">{row.instruction}</span>
          {row.isCableCrossRow && (
            <Badge variant="outline" className="shrink-0 text-amber-700 border-amber-400 text-xs ml-auto">
              CABLE
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

export function PatternOutput({ pattern }: PatternOutputProps) {
  if (!pattern) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-center p-12">
        <div>
          <p className="text-4xl mb-4">🧶</p>
          <p className="text-lg font-medium">Fill in the form and click Generate</p>
          <p className="text-sm mt-1">Your complete scarf pattern will appear here.</p>
        </div>
      </div>
    );
  }

  const { castOnCount, totalRowCount, yarnEstimate, inputs, cableSchedule, abbreviationKey, rows, warnings } = pattern;

  // Group rows into blocks of 10 for readability
  const rowBlocks: RowInstruction[][] = [];
  for (let i = 0; i < rows.length; i += 10) {
    rowBlocks.push(rows.slice(i, i + 10));
  }

  const defaultOpen = ["instructions", "summary"];

  return (
    <div className="flex-1 min-w-0 space-y-4">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-semibold">Your Pattern</h2>
        <PrintButton />
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-2xl font-bold">Scarf Knitting Pattern</h1>
        <p className="text-sm text-muted-foreground">
          {inputs.desiredLengthInches}&Prime; scarf &bull; {inputs.gauge.weight} weight &bull; {inputs.gauge.needleSize}
        </p>
      </div>

      {warnings.length > 0 && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          {warnings.map((w, i) => <p key={i}>{w}</p>)}
        </div>
      )}

      {/* Summary card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pattern Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Cast on</dt>
            <dd className="font-semibold">{castOnCount} stitches</dd>
            <dt className="text-muted-foreground">Total rows</dt>
            <dd className="font-semibold">{totalRowCount}</dd>
            <dt className="text-muted-foreground">Yarn needed</dt>
            <dd className="font-semibold">{yarnEstimate.label}</dd>
            <dt className="text-muted-foreground">Gauge</dt>
            <dd className="font-semibold">{inputs.gauge.stitchesPerInch} sts × {inputs.gauge.rowsPerInch} rows / inch</dd>
            <dt className="text-muted-foreground">Needle size</dt>
            <dd className="font-semibold">{inputs.gauge.needleSize}</dd>
          </dl>
        </CardContent>
      </Card>

      <Accordion defaultValue={defaultOpen} className="space-y-2">
        {/* Abbreviation key */}
        <AccordionItem value="abbrevs" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">Abbreviation Key</AccordionTrigger>
          <AccordionContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {Object.entries(abbreviationKey).map(([abbrev, def]) => (
                <div key={abbrev} className="flex gap-2">
                  <dt className="font-mono font-semibold shrink-0 min-w-[3rem]">{abbrev}</dt>
                  <dd className="text-muted-foreground">{def}</dd>
                </div>
              ))}
            </dl>
          </AccordionContent>
        </AccordionItem>

        {/* Cable schedule */}
        {cableSchedule && (
          <AccordionItem value="cables" className="border rounded-lg px-4">
            <AccordionTrigger className="text-sm font-medium">Cable Schedule</AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              <p className="text-muted-foreground">{cableSchedule.description}</p>
              <div className="font-mono text-xs leading-relaxed">
                {cableSchedule.crossingRows.map((r, i) => (
                  <span key={r}>
                    Row {r}{i < cableSchedule.crossingRows.length - 1 ? ", " : ""}
                    {(i + 1) % 12 === 0 ? "\n" : ""}
                  </span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Row-by-row instructions */}
        <AccordionItem value="instructions" className="border rounded-lg px-4">
          <AccordionTrigger className="text-sm font-medium">
            Row-by-Row Instructions ({totalRowCount} rows)
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            <p className="text-sm font-mono font-semibold">CO {castOnCount} sts.</p>
            {rowBlocks.map((block, i) => (
              <div key={i}>
                <RowBlock rows={block} />
                {i < rowBlocks.length - 1 && <Separator className="mt-3" />}
              </div>
            ))}
            <p className="text-sm font-mono font-semibold">BO all sts.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
