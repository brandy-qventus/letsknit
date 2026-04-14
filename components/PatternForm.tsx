"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GAUGE_PRESETS, computeCastOn, computeRowCount } from "@/lib/patternGenerator";
import type { PatternInputs, CableType, BorderStyle, YarnWeight } from "@/types/pattern";

interface PatternFormProps {
  inputs: PatternInputs;
  onChange: (inputs: PatternInputs) => void;
  onGenerate: () => void;
}

const YARN_WEIGHT_LABELS: Record<YarnWeight, string> = {
  lace: "Lace",
  fingering: "Fingering",
  sport: "Sport",
  dk: "DK",
  worsted: "Worsted",
  bulky: "Bulky",
  "super-bulky": "Super Bulky",
};

export function PatternForm({ inputs, onChange, onGenerate }: PatternFormProps) {
  const castOnPreview = computeCastOn(inputs);
  const rowsPreview = computeRowCount(inputs);
  const lengthPreview = (rowsPreview / inputs.gauge.rowsPerInch).toFixed(1);

  function handleYarnWeight(weight: YarnWeight) {
    const preset = GAUGE_PRESETS[weight];
    onChange({ ...inputs, gauge: preset });
  }

  function handleGaugeField(field: "stitchesPerInch" | "rowsPerInch" | "yardagePer100g", value: string) {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      onChange({ ...inputs, gauge: { ...inputs.gauge, [field]: num } });
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:w-96 shrink-0">
      {/* Pattern parameters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pattern Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="length">Finished Length (inches)</Label>
            <Input
              id="length"
              type="number"
              min={12}
              max={120}
              step={1}
              value={inputs.desiredLengthInches}
              onChange={(e) => onChange({ ...inputs, desiredLengthInches: Number(e.target.value) })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="repeats">Stitch Repeats Across Width</Label>
            <Input
              id="repeats"
              type="number"
              min={1}
              max={12}
              step={1}
              value={inputs.stitchRepeats}
              onChange={(e) => onChange({ ...inputs, stitchRepeats: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Each repeat: 4 sts (plain), 6 sts (2x2 cable), 10 sts (4x4 cable)
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>Cable Type</Label>
            <Select
              value={inputs.cableType}
              onValueChange={(v) => onChange({ ...inputs, cableType: v as CableType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (stockinette)</SelectItem>
                <SelectItem value="2x2">2x2 Cable (classic, 6 sts)</SelectItem>
                <SelectItem value="4x4">4x4 Cable (bold, 10 sts)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Border Style</Label>
            <Select
              value={inputs.borderStyle}
              onValueChange={(v) => onChange({ ...inputs, borderStyle: v as BorderStyle })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="garter">Garter (knit every row)</SelectItem>
                <SelectItem value="seed">Seed Stitch</SelectItem>
                <SelectItem value="ribbing">1x1 Ribbing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gauge & yarn weight */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Gauge & Yarn Weight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Yarn Weight</Label>
            <Select
              value={inputs.gauge.weight}
              onValueChange={(v) => handleYarnWeight(v as YarnWeight)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(YARN_WEIGHT_LABELS) as YarnWeight[]).map((w) => (
                  <SelectItem key={w} value={w}>
                    {YARN_WEIGHT_LABELS[w]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Selecting a weight auto-fills gauge. You can override below.
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="spi">Stitches / inch</Label>
              <Input
                id="spi"
                type="number"
                min={1}
                max={20}
                step={0.5}
                value={inputs.gauge.stitchesPerInch}
                onChange={(e) => handleGaugeField("stitchesPerInch", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rpi">Rows / inch</Label>
              <Input
                id="rpi"
                type="number"
                min={1}
                max={30}
                step={0.5}
                value={inputs.gauge.rowsPerInch}
                onChange={(e) => handleGaugeField("rowsPerInch", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="needle">Needle Size</Label>
              <Input
                id="needle"
                type="text"
                value={inputs.gauge.needleSize}
                onChange={(e) => onChange({ ...inputs, gauge: { ...inputs.gauge, needleSize: e.target.value } })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yardage">Yds / 100g</Label>
              <Input
                id="yardage"
                type="number"
                min={10}
                max={1000}
                step={10}
                value={inputs.gauge.yardagePer100g}
                onChange={(e) => handleGaugeField("yardagePer100g", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <span className="text-muted-foreground">Cast on</span>
            <span className="font-semibold">{castOnPreview} sts</span>
            <span className="text-muted-foreground">Total rows</span>
            <span className="font-semibold">{rowsPreview}</span>
            <span className="text-muted-foreground">Actual length</span>
            <span className="font-semibold">{lengthPreview}&Prime;</span>
            <span className="text-muted-foreground">Needle</span>
            <span className="font-semibold">{inputs.gauge.needleSize}</span>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={onGenerate} className="w-full no-print">
        Generate Pattern
      </Button>
    </div>
  );
}
