"use client";

import { useState } from "react";
import { PatternForm } from "@/components/PatternForm";
import { PatternOutput } from "@/components/PatternOutput";
import { GAUGE_PRESETS, generatePattern } from "@/lib/patternGenerator";
import type { PatternInputs, GeneratedPattern } from "@/types/pattern";

const DEFAULT_INPUTS: PatternInputs = {
  desiredLengthInches: 60,
  stitchRepeats: 3,
  cableType: "2x2",
  borderStyle: "garter",
  gauge: GAUGE_PRESETS["worsted"],
};

export default function Home() {
  const [inputs, setInputs] = useState<PatternInputs>(DEFAULT_INPUTS);
  const [pattern, setPattern] = useState<GeneratedPattern | null>(null);

  function handleGenerate() {
    setPattern(generatePattern(inputs));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 no-print">
        <h1 className="text-2xl font-bold tracking-tight">🧶 Let&apos;s Knit</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Scarf pattern generator</p>
      </header>
      <main className="flex flex-col lg:flex-row gap-6 p-6 items-start">
        <PatternForm inputs={inputs} onChange={setInputs} onGenerate={handleGenerate} />
        <PatternOutput pattern={pattern} />
      </main>
    </div>
  );
}
