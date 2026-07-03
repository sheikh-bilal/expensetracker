"use client";

import { useState, useEffect, useMemo } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { getExpenses } from "@/actions/expenses";
import {
  CATEGORY_CONFIG,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CURRENCY_SYMBOLS,
  BILL_TYPE_LABELS,
  type ExpenseCategory,
  type BillType,
} from "@/lib/constants/expense";
import { useCurrency } from "@/lib/currency-context";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
  LabelList,
} from "recharts";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  Receipt,
  Calendar,
  BarChart3,
  Zap,
  Droplets,
  Flame,
  Wifi,
  FileText,
  Wallet,
} from "lucide-react";

type Expense = {
  _id: string;
  amount: number;
  date: string;
  category: string;
  billDetails?: { billType?: string };
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function ChartTooltipBox({ active, payload, label, symbol }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">
        {symbol}
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

const BILL_ICON_MAP: Record<string, React.ElementType> = {
  electricity: Zap,
  water: Droplets,
  gas: Flame,
  internet: Wifi,
  other: FileText,
};

// Fixed per-utility hues (identity follows the utility, never its rank)
const BILL_COLOR_MAP: Record<string, string> = {
  electricity: "#c98500",
  water: "#2a78d6",
  gas: "#e34948",
  internet: "#9085e9",
  other: "#64748b",
};

export default function ReportsPage() {
  const { currency } = useCurrency();
  const symbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    getExpenses(5000).then((data) => {
      setExpenses(data as Expense[]);
      setLoading(false);
    });
  }, []);

  // Available years from data + current year
  const availableYears = useMemo(() => {
    const fromData = expenses.map((e) => new Date(e.date).getFullYear());
    const years = [...new Set([new Date().getFullYear(), ...fromData])];
    return years.sort((a, b) => b - a);
  }, [expenses]);

  const yearExpenses = useMemo(
    () =>
      expenses.filter((e) => new Date(e.date).getFullYear() === selectedYear),
    [expenses, selectedYear],
  );

  const monthlyData = useMemo(
    () =>
      MONTHS.map((month, i) => ({
        month,
        amount: yearExpenses
          .filter((e) => new Date(e.date).getMonth() === i)
          .reduce((sum, e) => sum + e.amount, 0),
      })),
    [yearExpenses],
  );

  const categoryData = useMemo(() => {
    const totals = yearExpenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
    const total = Object.values(totals).reduce((s, v) => s + v, 0);
    return Object.entries(totals)
      .map(([cat, amount]) => ({
        category: cat as ExpenseCategory,
        name: CATEGORY_LABELS[cat as ExpenseCategory] ?? cat,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
        fill: CATEGORY_COLORS[cat as ExpenseCategory] ?? CATEGORY_COLORS.other,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [yearExpenses]);

  // Bills per type, per month — only bill-category expenses with a billType
  const billsData = useMemo(() => {
    const billExpenses = yearExpenses.filter(
      (e) => e.category === "bills" && e.billDetails?.billType,
    );
    const byType: Record<
      string,
      { month: string; amount: number; idx: number }[]
    > = {};
    billExpenses.forEach((e) => {
      const bt = e.billDetails!.billType!;
      if (!byType[bt])
        byType[bt] = MONTHS.map((m, i) => ({ month: m, amount: 0, idx: i }));
      const monthIdx = new Date(e.date).getMonth();
      byType[bt][monthIdx].amount += e.amount;
    });
    return Object.entries(byType)
      .filter(([, months]) => months.some((m) => m.amount > 0))
      .map(([billType, months]) => {
        const activeMonths = months.filter((m) => m.amount > 0);
        const total = activeMonths.reduce((s, m) => s + m.amount, 0);
        const avg =
          activeMonths.length > 0 ? Math.round(total / activeMonths.length) : 0;
        const sorted = activeMonths.sort((a, b) => a.idx - b.idx);
        const last = sorted[sorted.length - 1]?.amount ?? 0;
        const prev = sorted[sorted.length - 2]?.amount ?? 0;
        const trendPct =
          prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
        return { billType, months, total, avg, trendPct };
      })
      .sort((a, b) => b.total - a.total);
  }, [yearExpenses]);

  const totalSpent = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const activeMonths = monthlyData.filter((m) => m.amount > 0).length;
  const avgMonthly =
    activeMonths > 0 ? Math.round(totalSpent / activeMonths) : 0;
  const highestMonth = monthlyData.reduce(
    (max, m) => (m.amount > max.amount ? m : max),
    { month: "—", amount: 0 },
  );

  if (loading) return <PageLoader />;

  const statTiles = [
    {
      label: "Total spent",
      icon: Wallet,
      value: <CurrencyDisplay amount={totalSpent} />,
      sub: `in ${selectedYear}`,
    },
    {
      label: "Monthly average",
      icon: Calendar,
      value: <CurrencyDisplay amount={avgMonthly} />,
      sub:
        activeMonths > 0
          ? `across ${activeMonths} active months`
          : "no data yet",
    },
    {
      label: "Peak month",
      icon: BarChart3,
      value: <span>{highestMonth.month}</span>,
      sub:
        highestMonth.amount > 0
          ? `${symbol}${highestMonth.amount.toLocaleString()}`
          : "no data yet",
    },
    {
      label: "Transactions",
      icon: Receipt,
      value: <span>{yearExpenses.length}</span>,
      sub: yearExpenses.length > 0 ? `recorded in ${selectedYear}` : "none yet",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Insights
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Reports
          </h1>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-semibold transition-all",
                selectedYear === year
                  ? "bg-card text-foreground shadow-sm ring-1 ring-foreground/10"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="stagger-children space-y-5 [&>*]:animate-fade-in">
        {/* Stat tiles */}
        <Card className="gap-0 p-0">
          <CardContent className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border/60 p-0 lg:grid-cols-4">
            {statTiles.map(({ label, icon: Icon, value, sub }) => (
              <div key={label} className="flex flex-col gap-3 bg-card p-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                    {value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly trend */}
        <Card className="gap-0 p-0">
          <CardHeader className="border-b !pb-4">
            <CardTitle className="text-sm font-semibold">
              Monthly Spending
            </CardTitle>
            <CardDescription className="text-xs">
              Full-year breakdown · {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent className="py-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData} barSize={24} barCategoryGap="30%">
                <CartesianGrid
                  vertical={false}
                  stroke="hsl(var(--border) / 0.6)"
                  strokeWidth={1}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  tickFormatter={(v) =>
                    `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                  }
                  width={52}
                />
                <Tooltip
                  content={<ChartTooltipBox symbol={symbol} />}
                  cursor={{ fill: "hsl(var(--muted) / 0.6)", radius: 6 }}
                />
                <Bar
                  dataKey="amount"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                >
                  {/* Direct label on the peak month only */}
                  <LabelList
                    dataKey="amount"
                    content={({ x, y, width, value }: any) =>
                      value > 0 && value === highestMonth.amount ? (
                        <text
                          x={x + width / 2}
                          y={y - 6}
                          textAnchor="middle"
                          fontSize={10}
                          fontWeight={600}
                          fill="hsl(var(--foreground))"
                        >
                          {symbol}
                          {value >= 1000
                            ? `${(value / 1000).toFixed(1)}k`
                            : value.toLocaleString()}
                        </text>
                      ) : null
                    }
                  />
                  {monthlyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.amount === highestMonth.amount && entry.amount > 0
                          ? "hsl(var(--primary))"
                          : "hsl(var(--primary) / 0.55)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bills overview */}
        {billsData.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Bills Overview
                </h2>
                <p className="text-xs text-muted-foreground">
                  Monthly trend per utility · {selectedYear}
                </p>
              </div>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                {billsData.length} utilit{billsData.length === 1 ? "y" : "ies"}
              </span>
            </div>

            <div
              className={cn(
                "grid gap-5",
                billsData.length === 1
                  ? "max-w-lg grid-cols-1"
                  : billsData.length === 2
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {billsData.map(({ billType, months, total, avg, trendPct }) => {
                const Icon = BILL_ICON_MAP[billType] ?? FileText;
                const line = BILL_COLOR_MAP[billType] ?? BILL_COLOR_MAP.other;
                const label =
                  BILL_TYPE_LABELS[billType as BillType] ?? billType;
                const isUp = trendPct > 0;
                const isFlat = trendPct === 0;
                const maxAmt = Math.max(...months.map((m) => m.amount), 1);
                const visibleMonths =
                  selectedYear === new Date().getFullYear()
                    ? months.slice(0, new Date().getMonth() + 1)
                    : months;
                const activeCount = visibleMonths.filter(
                  (m) => m.amount > 0,
                ).length;

                return (
                  <Card key={billType} className="gap-0 overflow-hidden p-0">
                    <div className="px-5 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                            style={{
                              backgroundColor: `color-mix(in srgb, ${line} 12%, transparent)`,
                            }}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: line }}
                              strokeWidth={2}
                            />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-foreground">
                              {label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activeCount} active month
                              {activeCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        {!isFlat && (
                          <span
                            className={cn(
                              "flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                              isUp
                                ? "bg-danger/10 text-danger"
                                : "bg-success/10 text-success",
                            )}
                          >
                            {isUp ? (
                              <TrendingUp
                                className="h-3 w-3"
                                strokeWidth={2.5}
                              />
                            ) : (
                              <TrendingDown
                                className="h-3 w-3"
                                strokeWidth={2.5}
                              />
                            )}
                            {Math.abs(trendPct)}%
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-baseline gap-3">
                        <span className="text-xl font-semibold tracking-tight tabular-nums text-foreground">
                          {symbol}
                          {total.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          avg {symbol}
                          {avg.toLocaleString()}/mo
                        </span>
                      </div>
                    </div>

                    <div className="px-2 pb-4">
                      <ResponsiveContainer width="100%" height={110}>
                        <AreaChart
                          data={visibleMonths}
                          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id={`grad-${billType}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={line}
                                stopOpacity={0.16}
                              />
                              <stop
                                offset="100%"
                                stopColor={line}
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            stroke="hsl(var(--border) / 0.5)"
                            strokeWidth={1}
                          />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fill: "hsl(var(--muted-foreground))",
                              fontSize: 9,
                            }}
                            dy={6}
                            interval={visibleMonths.length > 6 ? 1 : 0}
                          />
                          <YAxis hide domain={[0, maxAmt * 1.2]} />
                          <Tooltip
                            content={<ChartTooltipBox symbol={symbol} />}
                            cursor={{
                              stroke: line,
                              strokeWidth: 1,
                              strokeDasharray: "4 2",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke={line}
                            strokeWidth={2}
                            strokeLinecap="round"
                            fill={`url(#grad-${billType})`}
                            dot={(props: any) => {
                              const { cx, cy, payload } = props;
                              if (!payload.amount) return <g key={props.key} />;
                              return (
                                <circle
                                  key={props.key}
                                  cx={cx}
                                  cy={cy}
                                  r={3.5}
                                  fill={line}
                                  stroke="hsl(var(--card))"
                                  strokeWidth={2}
                                />
                              );
                            }}
                            activeDot={{
                              r: 5,
                              fill: line,
                              stroke: "hsl(var(--card))",
                              strokeWidth: 2,
                            }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Category breakdown */}
        {categoryData.length > 0 ? (
          <>
            {/* Donut + legend — same component the dashboard uses */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b !pb-4">
                <CardTitle className="text-sm font-semibold">
                  Spending by Category
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedYear} distribution · {categoryData.length} categories
                </CardDescription>
              </CardHeader>
              <CardContent className="py-6">
                <CategoryDonutChart
                  data={categoryData.map(
                    ({ category, amount, percentage }) => ({
                      category,
                      amount,
                      percentage,
                    }),
                  )}
                />
              </CardContent>
            </Card>

            {/* Ranked list */}
            <Card className="gap-0 p-0">
              <CardHeader className="border-b !pb-4">
                <CardTitle className="text-sm font-semibold">
                  Category Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Ranked by total spend · {selectedYear}
                </CardDescription>
                <CardAction>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {categoryData.length} categories
                  </span>
                </CardAction>
              </CardHeader>
              <CardContent className="p-3">
                {categoryData.map(
                  ({ category, name, amount, percentage, fill }, idx) => {
                    const cfg =
                      CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
                    const Icon = cfg.icon;
                    const txCount = yearExpenses.filter(
                      (e) => e.category === category,
                    ).length;

                    return (
                      <div
                        key={category}
                        className="group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors duration-150 hover:bg-muted/50"
                      >
                        <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted-foreground/70">
                          {idx + 1}
                        </span>
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            cfg.bg,
                          )}
                        >
                          <Icon
                            className={cn("h-4 w-4", cfg.color)}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="truncate text-[13px] font-medium text-foreground">
                              {name}
                              <span className="ml-2 text-xs font-normal text-muted-foreground">
                                {txCount} tx
                              </span>
                            </span>
                            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                              {symbol}
                              {amount.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full transition-[width] duration-700 ease-out"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: fill,
                              }}
                            />
                          </div>
                        </div>
                        <span className="hidden w-9 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground sm:block">
                          {percentage}%
                        </span>
                      </div>
                    );
                  },
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="p-0">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <PieChartIcon
                  className="h-7 w-7 text-muted-foreground/50"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-base font-semibold text-foreground">
                No data for {selectedYear}
              </p>
              <p className="text-sm text-muted-foreground">
                Add expenses to see your spending breakdown
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
