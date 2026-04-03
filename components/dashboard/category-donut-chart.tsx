"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useCurrency } from "@/lib/currency-context";
import { Receipt } from "lucide-react";
import { CATEGORY_COLORS, CURRENCY_SYMBOLS } from "@/lib/constants/expense";

interface CategoryDonutChartProps {
  data: Array<{ category: string; amount: number; percentage: number }>;
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  symbol: string;
};

function CustomTooltip({ active, payload, symbol }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5 capitalize">{payload[0].name}</p>
      <p className="text-sm font-semibold text-foreground">
        {symbol}{payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const { currency } = useCurrency();
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";

  const chartData = data.map((item) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
    rawName: item.category,
    value: item.amount,
    percentage: item.percentage,
    fill: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.other,
  }));

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const hasData = chartData.length > 0 && total > 0;

  // Empty state
  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] w-full">
        <div className="flex flex-col items-center justify-center text-center max-w-[200px]">
          <div className="h-14 w-14 rounded-2xl bg-muted/80 flex items-center justify-center mb-4">
            <Receipt className="h-7 w-7 text-muted-foreground/60" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No expenses yet</p>
          <p className="text-xs text-muted-foreground">
            Add transactions to see your spending breakdown
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 w-full h-full">
      {/* Donut chart - left side */}
      <div className="relative w-full md:w-1/2 flex justify-center shrink-0">
        <div className="h-[220px] w-full max-w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={105}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="transition-all duration-300 hover:opacity-80 hover:scale-[1.02] cursor-pointer origin-center"
                    style={{ filter: `drop-shadow(0px 4px 8px ${entry.fill}40)` }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip symbol={symbol} />} cursor={{fill: 'transparent'}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none self-center">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1 shadow-sm">Total Spend</p>
          <p className="text-3xl font-black text-foreground tabular-nums tracking-tight">
            {symbol}{total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Legend & Stats - right side */}
      <div className="w-full md:w-1/2 space-y-4">
        {chartData.map((item) => (
          <div key={item.rawName} className="group flex flex-col gap-1.5 cursor-pointer">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-3 w-3 shrink-0 rounded-full shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: item.fill, boxShadow: `0 0 0 1px ${item.fill}40` }}
                />
                <span className="text-sm font-semibold text-foreground truncate capitalize group-hover:text-indigo-600 transition-colors">
                  {item.rawName}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0 text-sm">
                <span className="font-semibold text-foreground tabular-nums text-right">
                  {symbol}{item.value.toLocaleString()}
                </span>
                <span className="text-muted-foreground font-medium w-10 text-right tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            </div>
            
            <div className="w-full h-1.5 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${item.percentage}%`, backgroundColor: item.fill }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
