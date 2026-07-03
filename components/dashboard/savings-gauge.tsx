"use client";

import Link from "next/link";
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface SavingsGaugeProps {
  current: number;
  target: number;
}

const chartConfig = {
  value: { label: "Saved", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export function SavingsGauge({ current, target }: SavingsGaugeProps) {
  const hasGoal = target > 0;
  const rawPercentage = hasGoal ? Math.round((current / target) * 100) : 0;
  const percentage = Math.min(rawPercentage, 100);
  const reached = hasGoal && rawPercentage >= 100;
  const fill = reached ? "hsl(var(--success))" : "hsl(var(--primary))";

  return (
    <Card className="h-full gap-0 p-0">
      <CardHeader className="border-b !pb-4">
        <CardTitle className="text-sm font-semibold">Savings Goal</CardTitle>
        <CardDescription className="text-xs">
          This month&apos;s target
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center justify-center py-6">
        {hasGoal ? (
          <>
            <div className="relative h-[168px] w-[168px]">
              <ChartContainer
                config={chartConfig}
                className="aspect-square h-full w-full"
              >
                <RadialBarChart
                  data={[{ value: percentage, fill }]}
                  startAngle={90}
                  endAngle={90 - 360 * (percentage / 100)}
                  innerRadius="80%"
                  outerRadius="100%"
                  barSize={10}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <RadialBar
                    dataKey="value"
                    background={{
                      fill: reached
                        ? "hsl(var(--success) / 0.12)"
                        : "hsl(var(--primary) / 0.1)",
                    }}
                    cornerRadius={999}
                  />
                </RadialBarChart>
              </ChartContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  {rawPercentage}
                  <span className="text-xl text-muted-foreground">%</span>
                </span>
                <span
                  className={cn(
                    "mt-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
                    reached ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {reached ? "Goal reached" : "of goal"}
                </span>
              </div>
            </div>

            <div className="mt-6 grid w-full grid-cols-2 divide-x divide-border rounded-lg bg-muted/50 py-3">
              <div className="px-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Saved
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                  <CurrencyDisplay amount={current} />
                </p>
              </div>
              <div className="px-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Target
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
                  <CurrencyDisplay amount={target} />
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Target
                className="h-6 w-6 text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No goal set yet
            </p>
            <Link
              href="/settings"
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              Set a savings goal →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
