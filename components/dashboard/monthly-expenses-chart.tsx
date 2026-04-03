"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCY_SYMBOLS } from "@/lib/constants/expense";

interface MonthlyExpensesChartProps {
  data: Array<{ month: string; amount: number }>;
}

type TooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  symbol: string;
};

function CustomTooltip({ active, payload, label, symbol }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {symbol}{payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  const { currency } = useCurrency();
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";
  const maxIndex = data.reduce(
    (max, d, i, arr) => (d.amount > arr[max].amount ? i : max),
    0
  );

  return (
    <Card className="border border-border bg-white shadow-none rounded-xl h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">
            Monthly Expenses
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Last 6 months</p>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} barSize={28} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="hsl(var(--border))"
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
              tickFormatter={(v) => `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={48}
            />
            <Tooltip
              content={<CustomTooltip symbol={symbol} />}
              cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
            />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === maxIndex ? "#4f46e5" : "#e0e7ff"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
