"use client";

import { PieChart, Pie, Cell } from "recharts";
import { useCurrency } from "@/lib/currency-context";
import { Receipt } from "lucide-react";
import { CATEGORY_COLORS, CURRENCY_SYMBOLS } from "@/lib/constants/expense";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface CategoryDonutChartProps {
  data: Array<{ category: string; amount: number; percentage: number }>;
}

const MAX_SLICES = 5;

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const { currency } = useCurrency();
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";

  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const otherAmount = rest.reduce((sum, d) => sum + d.amount, 0);
  const otherPercentage = rest.reduce((sum, d) => sum + d.percentage, 0);

  const chartData = [
    ...top.map((item) => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      rawName: item.category,
      value: item.amount,
      percentage: item.percentage,
      fill: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other,
    })),
    ...(otherAmount > 0
      ? [
          {
            name: "Other",
            rawName: "other-bucket",
            value: otherAmount,
            percentage: otherPercentage,
            fill: CATEGORY_COLORS.other,
          },
        ]
      : []),
  ];

  const chartConfig = chartData.reduce((config, item) => {
    config[item.rawName] = { label: item.name, color: item.fill };
    return config;
  }, {} as ChartConfig);

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const hasData = chartData.length > 0 && total > 0;
  const topShare = chartData[0]?.percentage ?? 0;

  if (!hasData) {
    return (
      <div className="flex h-[240px] w-full flex-col items-center justify-center">
        <div className="flex max-w-[220px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80">
            <Receipt className="h-7 w-7 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <p className="mb-1 text-sm font-semibold text-foreground">No expenses yet</p>
          <p className="text-xs text-muted-foreground">
            Add transactions to see your spending breakdown
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 lg:flex-row">
      {/* Ring */}
      <div className="relative flex w-full shrink-0 justify-center lg:w-[45%]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[220px] w-full max-w-[260px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={78}
              outerRadius={102}
              paddingAngle={2.5}
              cornerRadius={5}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="cursor-pointer transition-opacity duration-300 hover:opacity-75"
                />
              ))}
            </Pie>
            <ChartTooltip
              cursor={{ fill: "transparent" }}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-muted-foreground">{name}</span>
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {symbol}
                        {Number(value).toLocaleString()}
                      </span>
                    </div>
                  )}
                />
              }
            />
          </PieChart>
        </ChartContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center self-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Total spend
          </p>
          <p className="mt-0.5 text-[26px] font-semibold tracking-tight text-foreground">
            {symbol}
            {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toLocaleString()}
          </p>
          {chartData[0] && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {chartData[0].name} leads · {Math.round(topShare)}%
            </p>
          )}
        </div>
      </div>

      {/* Legend with value meters — visible labels are the CVD relief channel */}
      <div className="w-full space-y-3.5 lg:flex-1">
        {chartData.map((item) => (
          <div key={item.rawName} className="group flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.fill }}
                  aria-hidden
                />
                <span className="truncate text-[13px] font-medium text-foreground">
                  {item.name}
                </span>
              </div>
              <div className="flex shrink-0 items-baseline gap-3 text-[13px]">
                <span className="text-right font-semibold tabular-nums text-foreground">
                  {symbol}
                  {item.value.toLocaleString()}
                </span>
                <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {Math.round(item.percentage)}%
                </span>
              </div>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{ width: `${item.percentage}%`, backgroundColor: item.fill }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
