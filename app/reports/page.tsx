"use client";

import { useState, useEffect, useMemo } from "react";
import { getExpenses } from "@/actions/expenses";
import {
  CATEGORY_CONFIG,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CURRENCY_SYMBOLS,
  type ExpenseCategory,
} from "@/lib/constants/expense";
import { useCurrency } from "@/lib/currency-context";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import { PieChart as PieChartIcon, TrendingUp, Receipt, Calendar, BarChart3, Loader2 } from "lucide-react";

type Expense = { _id: string; amount: number; date: string; category: string };

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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

  const totalSpent = yearExpenses.reduce((s, e) => s + e.amount, 0);
  const activeMonths = monthlyData.filter((m) => m.amount > 0).length;
  const avgMonthly = activeMonths > 0 ? Math.round(totalSpent / activeMonths) : 0;
  const highestMonth = monthlyData.reduce(
    (max, m) => (m.amount > max.amount ? m : max),
    { month: "—", amount: 0 },
  );
  const maxBar = Math.max(...monthlyData.map((m) => m.amount), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

      {/* Category Breakdown */}
      {categoryData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Donut chart */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground">Spending by Category</h2>
              <p className="text-sm text-muted-foreground">{selectedYear} category distribution</p>
            </div>
            <div className="p-6 flex items-center justify-center">
              <div className="relative w-[220px] h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={105}
                      paddingAngle={3}
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
                          style={{ filter: `drop-shadow(0px 2px 6px ${entry.fill}50)` }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip symbol={symbol} />} cursor={{ fill: "transparent" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Total</p>
                  <p className="text-xl font-black text-foreground tabular-nums">
                    {symbol}{totalSpent >= 1000 ? `${(totalSpent / 1000).toFixed(1)}k` : totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category list */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground">Category Breakdown</h2>
              <p className="text-sm text-muted-foreground">Amount spent per category</p>
            </div>
            <div className="p-4 space-y-1">
              {categoryData.map(({ category, name, amount, percentage, fill }) => {
                const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
                const Icon = cfg.icon;
                return (
                  <div
                    key={category}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                  >
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", cfg.bg)}>
                      <Icon className={cn("h-4 w-4", cfg.color)} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">{name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-foreground tabular-nums">
                            {symbol}{amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%`, backgroundColor: fill }}
                        />
                      </div>
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
