"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Dot,
  ReferenceLine,
} from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CURRENCY_SYMBOLS } from "@/lib/constants/expense";
import { cn, trendFrom } from "@/lib/utils";

interface MonthlyExpensesChartProps {
  data: Array<{ month: string; amount: number }>;
}

const chartConfig = {
  amount: { label: "Expenses", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export function MonthlyExpensesChart({ data }: MonthlyExpensesChartProps) {
  const { currency } = useCurrency();
  const symbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";
  const hasData = data.some((d) => d.amount > 0);

  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const average = data.length > 0 ? total / data.length : 0;
  const trend = trendFrom(data.map((d) => d.amount));

  const compact = (v: number) =>
    `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : Math.round(v).toLocaleString()}`;

  return (
    <Card className="h-full gap-0 p-0">
      <CardHeader className="border-b !pb-4">
        <CardTitle className="text-sm font-semibold">Cash Flow</CardTitle>
        <CardDescription className="text-xs">
          Monthly spending, last {data.length} months
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-5 pt-5">
        {!hasData ? (
          <div className="flex h-[280px] flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-foreground">
              No spending yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your monthly totals will show up here once you add expenses.
            </p>
          </div>
        ) : (
          <>
            {/* Headline figure for the period */}
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  This month
                </p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <span className="text-2xl font-semibold tracking-tight text-foreground">
                    {symbol}
                    {Math.round(
                      data[data.length - 1]?.amount ?? 0,
                    ).toLocaleString()}
                  </span>
                  {trend && trend.isPositive !== null && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                        trend.isPositive
                          ? "bg-danger/10 text-danger"
                          : "bg-success/10 text-success",
                      )}
                    >
                      {trend.isPositive ? (
                        <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" strokeWidth={2.5} />
                      )}
                      {trend.value}% vs last month
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {compact(average)}
                <span className="text-muted-foreground/70">/mo average</span>
              </p>
            </div>

            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[240px] w-full"
            >
              <AreaChart
                data={data}
                margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="cashflow-fill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.16}
                    />
                    <stop
                      offset="100%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border) / 0.6)"
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  width={46}
                  fontSize={11}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => compact(v)}
                />
                <ReferenceLine
                  y={average}
                  stroke="hsl(var(--muted-foreground) / 0.45)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  label={{
                    value: "avg",
                    position: "insideTopRight",
                    fontSize: 10,
                    fill: "hsl(var(--muted-foreground))",
                    dy: -4,
                  }}
                />
                <ChartTooltip
                  cursor={{
                    stroke: "hsl(var(--primary) / 0.4)",
                    strokeWidth: 1,
                    strokeDasharray: "3 3",
                  }}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">Spent</span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {symbol}
                            {Number(value).toLocaleString()}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeLinecap="round"
                  fill="url(#cashflow-fill)"
                  dot={(props) => {
                    const isLast = props.index === data.length - 1;
                    return isLast ? (
                      <Dot
                        key={props.key}
                        cx={props.cx}
                        cy={props.cy}
                        r={4}
                        fill="hsl(var(--primary))"
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      />
                    ) : (
                      <g key={props.key} />
                    );
                  }}
                  activeDot={{
                    r: 5,
                    fill: "hsl(var(--primary))",
                    stroke: "hsl(var(--card))",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
