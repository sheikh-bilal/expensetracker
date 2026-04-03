"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";
import { CurrencyDisplay } from "@/components/ui/currency-display";

interface GoalProgressCardProps {
  current: number;
  target: number;
}

export function GoalProgressCard({ current, target }: GoalProgressCardProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.05)] transition-all duration-300 rounded-2xl p-0">
      <CardContent className="p-5 flex flex-col h-full z-10 relative">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide truncate">Saving Goal</p>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110 bg-violet-50">
            <Target className="h-4 w-4 text-violet-600" strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-3xl font-black text-foreground tabular-nums tracking-tight leading-none">{percentage}%</p>

          <p className="mt-2.5 text-[13px] font-medium text-muted-foreground">
            <CurrencyDisplay amount={current} /> of <CurrencyDisplay amount={target} />
          </p>

          <div className="mt-4 h-2 w-full rounded-full bg-violet-100 overflow-hidden ring-1 ring-inset ring-violet-500/10 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
