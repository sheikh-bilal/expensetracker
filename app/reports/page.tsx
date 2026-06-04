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
import { METER_CONFIG } from "@/lib/constants/meter";
import { useCurrency } from "@/lib/currency-context";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line,
  Area, AreaChart, ReferenceLine,
} from "recharts";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import {
  PieChart as PieChartIcon, TrendingUp, TrendingDown, Receipt,
  Calendar, BarChart3, Zap, Droplets, Flame, Wifi, FileText,
} from "lucide-react";

type Expense = {
  _id: string;
  amount: number;
  date: string;
  category: string;
  billDetails?: { billType?: string };
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function BarTooltip({ active, payload, label, symbol }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-foreground">{symbol}{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

function PieTooltip({ active, payload, symbol }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5 capitalize">{payload[0].name}</p>
      <p className="text-sm font-semibold text-foreground">{symbol}{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

function BillLineTooltip({ active, payload, label, symbol }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-white px-3.5 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">{symbol}{payload[0].value.toLocaleString()}</p>
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

const BILL_COLOR_MAP: Record<string, { line: string; gradient: [string, string]; badge: string; light: string }> = {
  electricity: { line: "#f59e0b", gradient: ["#fef3c7", "#fde68a"], badge: "bg-amber-100 text-amber-700", light: "#fef3c7" },
  water:       { line: "#3b82f6", gradient: ["#dbeafe", "#bfdbfe"], badge: "bg-blue-100 text-blue-700",  light: "#dbeafe" },
  gas:         { line: "#ef4444", gradient: ["#fee2e2", "#fecaca"], badge: "bg-rose-100 text-rose-700",  light: "#fee2e2" },
  internet:    { line: "#8b5cf6", gradient: ["#ede9fe", "#ddd6fe"], badge: "bg-violet-100 text-violet-700", light: "#ede9fe" },
  other:       { line: "#64748b", gradient: ["#f1f5f9", "#e2e8f0"], badge: "bg-slate-100 text-slate-700", light: "#f1f5f9" },
};

export default function ReportsPage() {
  const { currency } = useCurrency();
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";

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
    () => expenses.filter((e) => new Date(e.date).getFullYear() === selectedYear),
    [expenses, selectedYear],
  );

  const monthlyData = useMemo(
    () => MONTHS.map((month, i) => ({
      month,
      amount: yearExpenses
        .filter((e) => new Date(e.date).getMonth() === i)
        .reduce((sum, e) => sum + e.amount, 0),
    })),
    [yearExpenses],
  );

  const categoryData = useMemo(() => {
    const totals = yearExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
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
    // Group by billType
    const byType: Record<string, { month: string; amount: number; idx: number }[]> = {};
    billExpenses.forEach((e) => {
      const bt = e.billDetails!.billType!;
      if (!byType[bt]) byType[bt] = MONTHS.map((m, i) => ({ month: m, amount: 0, idx: i }));
      const monthIdx = new Date(e.date).getMonth();
      byType[bt][monthIdx].amount += e.amount;
    });
    // Remove empty types (all months = 0)
    return Object.entries(byType)
      .filter(([, months]) => months.some((m) => m.amount > 0))
      .map(([billType, months]) => {
        const activeMonths = months.filter((m) => m.amount > 0);
        const total = activeMonths.reduce((s, m) => s + m.amount, 0);
        const avg = activeMonths.length > 0 ? Math.round(total / activeMonths.length) : 0;
        // Trend: compare last 2 active months
        const sorted = activeMonths.sort((a, b) => a.idx - b.idx);
        const last = sorted[sorted.length - 1]?.amount ?? 0;
        const prev = sorted[sorted.length - 2]?.amount ?? 0;
        const trendPct = prev > 0 ? Math.round(((last - prev) / prev) * 100) : 0;
        return { billType, months, total, avg, trendPct };
      })
      .sort((a, b) => b.total - a.total);
  }, [yearExpenses]);

  const totalSpent = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const activeMonths = monthlyData.filter((m) => m.amount > 0).length;
  const avgMonthly = activeMonths > 0 ? Math.round(totalSpent / activeMonths) : 0;
  const highestMonth = monthlyData.reduce(
    (max, m) => (m.amount > max.amount ? m : max),
    { month: "—", amount: 0 },
  );
  const maxBar = Math.max(...monthlyData.map((m) => m.amount), 1);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-600/30">
            <PieChartIcon className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground">Analyze your spending patterns</p>
          </div>
        </div>

        {/* Year selector */}
        <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1">
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                selectedYear === year
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Total Spent",
            value: <CurrencyDisplay amount={totalSpent} className="text-2xl font-black text-foreground" />,
            icon: TrendingUp,
            iconBg: "bg-violet-50",
            iconColor: "text-violet-600",
          },
          {
            label: "Monthly Average",
            value: <CurrencyDisplay amount={avgMonthly} className="text-2xl font-black text-foreground" />,
            sub: activeMonths > 0 ? `Across ${activeMonths} active months` : "No data yet",
            icon: Calendar,
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
          },
          {
            label: "Peak Month",
            value: <span className="text-2xl font-black text-foreground">{highestMonth.month}</span>,
            sub: highestMonth.amount > 0 ? `${symbol}${highestMonth.amount.toLocaleString()}` : "No data yet",
            icon: BarChart3,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-600",
          },
          {
            label: "Transactions",
            value: <span className="text-2xl font-black text-foreground">{yearExpenses.length}</span>,
            sub: yearExpenses.length > 0 ? `In ${selectedYear}` : "No transactions yet",
            icon: Receipt,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
          },
        ].map(({ label, value, sub, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconBg)}>
                <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2} />
              </div>
            </div>
            {value}
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Monthly Trend Chart */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-base font-bold text-foreground">Monthly Spending — {selectedYear}</h2>
          <p className="text-sm text-muted-foreground">Full year breakdown by month</p>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barSize={28} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.7} />
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
                width={52}
              />
              <Tooltip content={<BarTooltip symbol={symbol} />} cursor={{ fill: "hsl(var(--muted))", radius: 6 }} />
              <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={i} fill={entry.amount === maxBar && maxBar > 0 ? "#7c3aed" : "#ede9fe"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bills Trend Section ── */}
      {billsData.length > 0 && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/25">
              <Zap className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Bills Overview</h2>
              <p className="text-sm text-muted-foreground">Monthly trends per utility — {selectedYear}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-100">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-semibold text-rose-700">{billsData.length} Utilit{billsData.length === 1 ? "y" : "ies"}</span>
            </div>
          </div>

          {/* Grid of per-type charts */}
          <div className={cn(
            "grid gap-4",
            billsData.length === 1 ? "grid-cols-1 max-w-lg" :
            billsData.length === 2 ? "grid-cols-1 sm:grid-cols-2" :
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          )}>
            {billsData.map(({ billType, months, total, avg, trendPct }) => {
              const Icon = BILL_ICON_MAP[billType] ?? FileText;
              const colors = BILL_COLOR_MAP[billType] ?? BILL_COLOR_MAP.other;
              const label = BILL_TYPE_LABELS[billType as BillType] ?? billType;
              const isUp = trendPct > 0;
              const isFlat = trendPct === 0;
              const maxAmt = Math.max(...months.map((m) => m.amount), 1);
              // Only show months up to current month if current year
              const visibleMonths = selectedYear === new Date().getFullYear()
                ? months.slice(0, new Date().getMonth() + 1)
                : months;
              const activeCount = visibleMonths.filter((m) => m.amount > 0).length;

              return (
                <div
                  key={billType}
                  className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden group hover:shadow-[0_4px_20px_0_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.06)] transition-shadow duration-300"
                >
                  {/* Card header */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
                          style={{ backgroundColor: colors.light, border: `1.5px solid ${colors.line}30` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: colors.line }} strokeWidth={2.2} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{activeCount} active month{activeCount !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      {/* Trend badge */}
                      {!isFlat && (
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold shrink-0",
                          isUp ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {isUp
                            ? <TrendingUp className="h-3 w-3" strokeWidth={2.5} />
                            : <TrendingDown className="h-3 w-3" strokeWidth={2.5} />}
                          {Math.abs(trendPct)}%
                        </div>
                      )}
                    </div>

                    {/* Total + avg */}
                    <div className="mt-3 flex items-baseline gap-3">
                      <span className="text-xl font-black text-foreground tabular-nums">
                        {symbol}{total.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        avg {symbol}{avg.toLocaleString()}/mo
                      </span>
                    </div>
                  </div>

                  {/* Inline area chart */}
                  <div className="px-2 pb-4">
                    <ResponsiveContainer width="100%" height={110}>
                      <AreaChart data={visibleMonths} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`grad-${billType}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.line} stopOpacity={0.18} />
                            <stop offset="100%" stopColor={colors.line} stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9, fontWeight: 500 }}
                          dy={6}
                          interval={visibleMonths.length > 6 ? 1 : 0}
                        />
                        <YAxis hide domain={[0, maxAmt * 1.2]} />
                        <Tooltip
                          content={<BillLineTooltip symbol={symbol} />}
                          cursor={{ stroke: colors.line, strokeWidth: 1, strokeDasharray: "4 2" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke={colors.line}
                          strokeWidth={2.2}
                          fill={`url(#grad-${billType})`}
                          dot={(props: any) => {
                            const { cx, cy, payload } = props;
                            if (!payload.amount) return <g key={props.key} />;
                            return (
                              <circle
                                key={props.key}
                                cx={cx}
                                cy={cy}
                                r={3}
                                fill={colors.line}
                                stroke="white"
                                strokeWidth={1.5}
                              />
                            );
                          }}
                          activeDot={{ r: 5, fill: colors.line, stroke: "white", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Breakdown — full redesign */}
      {categoryData.length > 0 ? (
        <div className="space-y-6">

          {/* ── Spending by Category (Donut + Legend) ── */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Spending by Category</h2>
                <p className="text-sm text-muted-foreground">{selectedYear} distribution across {categoryData.length} categories</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-100">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-700">{categoryData.length} Active</span>
              </div>
            </div>

            <div className="p-6 grid lg:grid-cols-[auto_1fr] gap-8 items-center">
              {/* Donut chart */}
              <div className="flex items-center justify-center">
                <div className="relative w-[200px] h-[200px] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={64}
                        outerRadius={98}
                        paddingAngle={2}
                        dataKey="amount"
                        nameKey="name"
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                      >
                        {categoryData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.fill}
                            style={{ filter: `drop-shadow(0px 3px 8px ${entry.fill}60)` }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip symbol={symbol} />} cursor={{ fill: "transparent" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</p>
                    <p className="text-lg font-black text-foreground tabular-nums leading-tight">
                      {symbol}{totalSpent >= 1000 ? `${(totalSpent / 1000).toFixed(1)}k` : totalSpent.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">{selectedYear}</p>
                  </div>
                </div>
              </div>

              {/* Legend grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categoryData.map(({ category, name, amount, percentage, fill }) => {
                  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={category}
                      className="group flex items-center gap-2.5 p-2.5 rounded-xl border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all duration-200 cursor-default"
                    >
                      {/* Color swatch + icon */}
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ backgroundColor: `${fill}18`, border: `1.5px solid ${fill}35` }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: fill }} strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-foreground truncate">{name}</span>
                          <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: fill }}>{percentage}%</span>
                        </div>
                        <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${percentage}%`, backgroundColor: fill }}
                          />
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums font-medium">
                          {symbol}{amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Category Breakdown (ranked list) ── */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Category Breakdown</h2>
                <p className="text-sm text-muted-foreground">Ranked by total spend — {selectedYear}</p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
                {categoryData.length} categories
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {categoryData.map(({ category, name, amount, percentage, fill }, idx) => {
                const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
                const Icon = cfg.icon;
                const txCount = yearExpenses.filter((e) => e.category === category).length;
                const isTop = idx === 0;

                return (
                  <div
                    key={category}
                    className={cn(
                      "group flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors duration-150",
                      isTop && "bg-gradient-to-r from-violet-50/60 to-transparent"
                    )}
                  >
                    {/* Rank */}
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shrink-0 tabular-nums",
                        isTop
                          ? "bg-violet-600 text-white shadow-md shadow-violet-300"
                          : idx === 1
                            ? "bg-slate-200 text-slate-600"
                            : idx === 2
                              ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground"
                      )}
                    >
                      {idx + 1}
                    </div>

                    {/* Icon */}
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ backgroundColor: `${fill}15`, border: `1.5px solid ${fill}30` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: fill }} strokeWidth={2} />
                    </div>

                    {/* Name + progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5 gap-2">
                        <span className="text-sm font-semibold text-foreground">{name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md font-medium">
                            {txCount} tx
                          </span>
                          <span className="text-sm font-bold text-foreground tabular-nums">
                            {symbol}{amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                            background: `linear-gradient(90deg, ${fill}cc, ${fill})`,
                            boxShadow: `0 0 6px ${fill}60`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Percentage badge */}
                    <div
                      className="hidden sm:flex items-center justify-center h-9 w-14 rounded-xl text-xs font-black tabular-nums shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{
                        backgroundColor: `${fill}12`,
                        color: fill,
                        border: `1.5px solid ${fill}25`,
                      }}
                    >
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] p-16 flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
            <PieChartIcon className="h-7 w-7 text-muted-foreground/50" strokeWidth={1.5} />
          </div>
          <p className="text-base font-semibold text-foreground">No data for {selectedYear}</p>
          <p className="text-sm text-muted-foreground">Add expenses to see your spending breakdown</p>
        </div>
      )}
    </div>
  );
}
