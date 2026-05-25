"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CalculateBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The latest recorded meter reading (previous reading) */
  previousReading: number | null;
  /** Unit label e.g. "kWh", "gal", "m³" */
  unit: string;
  /** Tailwind classes for the meter's theme (color, gradient) */
  colorClass: string;
  gradientClass: string;
}

export function CalculateBillDialog({
  open,
  onOpenChange,
  previousReading,
  unit,
  colorClass,
  gradientClass,
}: CalculateBillDialogProps) {
  const [currentReading, setCurrentReading] = useState("");

  function handleOpenChange(next: boolean) {
    if (!next) setCurrentReading("");
    onOpenChange(next);
  }

  const parsed = parseFloat(currentReading);
  const hasInput = currentReading !== "" && !isNaN(parsed);
  const isNegative =
    hasInput && previousReading !== null && parsed < previousReading;
  const unitsConsumed =
    hasInput && previousReading !== null && !isNegative
      ? parsed - previousReading
      : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-2xl border-0 shadow-2xl overflow-hidden p-0">
        {/* Branded header strip */}
        <div className={cn("bg-gradient-to-br px-6 pt-6 pb-5", gradientClass)}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Calculator className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-tight">
                Calculate Bill
              </DialogTitle>
              <DialogDescription className="text-sm text-white/70 mt-0.5">
                Enter today&apos;s reading to see consumption
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Reading inputs — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Previous
              </Label>
              <Input
                disabled
                value={
                  previousReading !== null
                    ? previousReading.toLocaleString()
                    : "—"
                }
                className="h-11 rounded-xl bg-muted/50 text-foreground font-mono text-sm font-semibold cursor-not-allowed border-dashed"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="calc-current-reading"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
              >
                Current
              </Label>
              <Input
                id="calc-current-reading"
                type="number"
                min={previousReading ?? 0}
                placeholder="e.g. 5280"
                value={currentReading}
                onChange={(e) => setCurrentReading(e.target.value)}
                className="h-11 rounded-xl font-mono text-sm font-semibold"
                autoFocus
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* Result */}
          <div className="rounded-xl border border-border/60 overflow-hidden">
            <div className="px-4 py-2.5 bg-muted/40 border-b border-border/60">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Units Consumed
              </p>
            </div>
            <div className="px-4 py-5 flex items-end justify-center gap-3">
              {isNegative ? (
                <p className="text-sm font-semibold text-rose-500 leading-snug">
                  Current reading must be greater than or equal to the previous
                  reading.
                </p>
              ) : unitsConsumed !== null ? (
                <>
                  <span
                    className={cn(
                      "text-5xl font-black tabular-nums leading-none tracking-tight",
                      colorClass,
                    )}
                  >
                    {unitsConsumed.toLocaleString()}
                  </span>
                  <span className="text-base font-semibold text-muted-foreground mb-0.5">
                    {unit}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-black text-muted-foreground/20 tabular-nums">
                  —
                </span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
