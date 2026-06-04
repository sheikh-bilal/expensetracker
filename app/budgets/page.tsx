"use client";

import { useState, useEffect, useMemo } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { getExpenses } from "@/actions/expenses";
import { getMonthlyExpenses } from "@/actions/expenses";
import { getUserSettings } from "@/actions/settings";
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
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import {
  Wallet, PiggyBank, TrendingDown, Settings, AlertTriangle,
  CheckCircle2, Zap, Target, ArrowRight, Calendar, ShieldCheck,
} from "lucide-react";
import Link from "next/link";

type Expense = { _id: string; amount: number; date: string; category: string };

function BarTooltip({ active, payload, label, symbol, budget }: any) {
  if (!active || !payload?.length) return null;
  const spent = payload[0].value;
  const over = budget > 0 && spent > budget;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-lg space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{symbol}{spent.toLocaleString()}</p>
      {budget > 0 && (
        <p className={cn("text-xs font-medium", over ? "text-rose-500" : "text-emerald-600")}>
          {over ? `Over by ${symbol}${(spent - budget).toLocaleString()}` : `Under by ${symbol}${(budget - spent).toLocaleString()}`}
        </p>
      )}
    </div>
  );
}

export default function BudgetsPage() {
  const { currency } = useCurrency();
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<{ month: string; amount: number }[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getExpenses(1000),
      getMonthlyExpenses(6),
      getUserSettings(),
    ]).then(([exp, history, settings]) => {
      setExpenses(exp as Expense[]);
      setMonthlyHistory(history as { month: string; amount: number }[]);
      setMonthlyBudget(settings?.monthlyBudget || 0);
      setSavingsGoal(settings?.savingsGoal || 20);
      setLoading(false);
    });
  }, []);

  const now = new Date();

  const thisMonthExpenses = useMemo(
    () => expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }),
    [expenses],
  );

  const monthlySpent = useMemo(
    () => thisMonthExpenses.reduce((s, e) => s + e.amount, 0),
    [thisMonthExpenses],
  );

  const categoryBreakdown = useMemo(() => {
    const totals = thisMonthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(totals)
      .map(([cat, amount]) => ({ category: cat as ExpenseCategory, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses]);

  const remainingBudget = monthlyBudget - monthlySpent;
  const budgetUsedPct = monthlyBudget > 0 ? Math.min((monthlySpent / monthlyBudget) * 100, 100) : 0;
  const isOverBudget = monthlySpent > monthlyBudget && monthlyBudget > 0;

  const savingsTarget = monthlyBudget > 0 ? (monthlyBudget * savingsGoal) / 100 : 0;
  const actualSavings = monthlyBudget > 0 ? Math.max(remainingBudget, 0) : 0;
  const savingsPct = savingsTarget > 0 ? Math.min((actualSavings / savingsTarget) * 100, 100) : 0;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const dailyBudget = daysRemaining > 0 && remainingBudget > 0 ? remainingBudget / daysRemaining : 0;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
            <Wallet className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Budgets</h1>
            <p className="text-sm text-muted-foreground">Track your monthly spending limits</p>
          </div>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          <Settings className="h-4 w-4" />
          Edit Budget
        </Link>
      </div>

      {monthlyBudget === 0 ? (
        /* No budget set state */
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] p-16 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <Wallet className="h-8 w-8 text-indigo-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground mb-1">No Budget Set</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Set a monthly budget in Settings to start tracking your spending limits and savings goals.
            </p>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Settings className="h-4 w-4" />
            Go to Settings
          </Link>
        </div>
      ) : (
        <>
          {/* Budget Overview — gradient card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Wallet className="h-4 w-4 text-indigo-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                  {now.toLocaleString("default", { month: "long" })} {now.getFullYear()}
                </span>
                {isOverBudget ? (
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" /> Over Budget
                  </span>
                ) : budgetUsedPct < 80 ? (
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3" /> On Track
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-1">Budget</p>
                  <p className="text-2xl font-black tabular-nums">
                    <CurrencyDisplay amount={monthlyBudget} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-1">Spent</p>
                  <p className={cn("text-2xl font-black tabular-nums", isOverBudget ? "text-rose-300" : "")}>
                    <CurrencyDisplay amount={monthlySpent} />
                  </p>
                </div>
                <div>
                  <p className="text-xs text-indigo-200 font-medium mb-1">Remaining</p>
                  <p className={cn("text-2xl font-black tabular-nums", remainingBudget < 0 ? "text-rose-300" : "text-emerald-300")}>
                    <CurrencyDisplay amount={Math.abs(remainingBudget)} />
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-indigo-200">
                  <span>{budgetUsedPct.toFixed(0)}% used</span>
                  {dailyBudget > 0 && (
                    <span className="font-semibold text-white">
                      <CurrencyDisplay amount={dailyBudget} />/day · {daysRemaining}d left
                    </span>
                  )}
                </div>
                <div className="h-2.5 bg-indigo-900/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isOverBudget ? "bg-rose-500" : budgetUsedPct > 80 ? "bg-amber-400" : "bg-emerald-400",
                    )}
                    style={{ width: `${budgetUsedPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Budget Health Score ── */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Budget Health</h2>
                <p className="text-sm text-muted-foreground">Key metrics for {now.toLocaleString("default", { month: "long" })}</p>
              </div>
              <Link href="/settings" className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <Settings className="h-3.5 w-3.5" />
                Edit Goals
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Daily Budget",
                  value: `${symbol}${Math.round(monthlyBudget / 30).toLocaleString()}`,
                  sub: "per day avg",
                  icon: Calendar,
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
                {
                  label: "Daily Remaining",
                  value: dailyBudget > 0 ? `${symbol}${Math.round(dailyBudget).toLocaleString()}` : "—",
                  sub: daysRemaining > 0 ? `${daysRemaining} days left` : "Month ends today",
                  icon: Zap,
                  color: dailyBudget > 0 ? "text-amber-600" : "text-muted-foreground",
                  bg: "bg-amber-50",
                },
                {
                  label: "Savings Target",
                  value: `${symbol}${savingsTarget.toLocaleString()}`,
                  sub: `${savingsGoal}% of budget`,
                  icon: Target,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Spend Allocation",
                  value: `${100 - savingsGoal}%`,
                  sub: `${symbol}${(monthlyBudget - savingsTarget).toLocaleString()} / mo`,
                  icon: TrendingDown,
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                },
              ].map(({ label, value, sub, icon: Icon, color, bg }) => (
                <div key={label} className="group flex flex-col gap-3 p-4 rounded-xl border hover:shadow-xl transition-all duration-200">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
                    <Icon className={cn("h-4.5 w-4.5", color)} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground tabular-nums">{value}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Spending This Month + Savings Side by Side ── */}
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Category breakdown — ranked */}
            <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">Spending This Month</h2>
                  <p className="text-sm text-muted-foreground">Ranked by amount — {now.toLocaleString("default", { month: "long" })}</p>
                </div>
                {categoryBreakdown.length > 0 && (
                  <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
                    {categoryBreakdown.length} categories
                  </span>
                )}
              </div>
              <div className="divide-y divide-border/40">
                {categoryBreakdown.length > 0 ? categoryBreakdown.map(({ category, amount }, idx) => {
                  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
                  const Icon = cfg.icon;
                  const fill = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
                  const ofSpend = monthlySpent > 0 ? Math.round((amount / monthlySpent) * 100) : 0;
                  const ofBudget = monthlyBudget > 0 ? Math.round((amount / monthlyBudget) * 100) : 0;
                  const txCount = thisMonthExpenses.filter((e) => e.category === category).length;
                  const isTop = idx === 0;
                  return (
                    <div
                      key={category}
                      className={cn(
                        "group flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors duration-150",
                        isTop && "bg-gradient-to-r from-indigo-50/60 to-transparent",
                      )}
                    >
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-black shrink-0 tabular-nums",
                        isTop ? "bg-indigo-600 text-white shadow-md shadow-indigo-300"
                          : idx === 1 ? "bg-slate-200 text-slate-600"
                            : idx === 2 ? "bg-amber-100 text-amber-700"
                              : "bg-muted text-muted-foreground",
                      )}>{idx + 1}</div>
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundColor: `${fill}15`, border: `1.5px solid ${fill}30` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: fill }} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <span className="text-sm font-semibold text-foreground">{CATEGORY_LABELS[category] ?? category}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-muted-foreground bg-muted/70 px-2 py-0.5 rounded-md font-medium">{txCount} tx</span>
                            <span className="text-sm font-bold text-foreground tabular-nums">{symbol}{amount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${ofSpend}%`, background: `linear-gradient(90deg, ${fill}cc, ${fill})`, boxShadow: `0 0 6px ${fill}50` }}
                          />
                        </div>
                      </div>
                      <div
                        className="hidden sm:flex items-center justify-center h-9 w-14 rounded-xl text-xs font-black tabular-nums shrink-0"
                        style={{ backgroundColor: `${fill}12`, color: fill, border: `1.5px solid ${fill}25` }}
                      >{ofBudget}%</div>
                    </div>
                  );
                }) : (
                  <div className="py-12 flex flex-col items-center gap-2 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-muted-foreground/40" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-muted-foreground">No expenses this month</p>
                  </div>
                )}
              </div>
            </div>

            {/* Savings + Spending Pace stacked */}
            <div className="space-y-5">
              {/* Savings Goal */}
              <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-5 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                      <PiggyBank className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Savings Goal</p>
                      <p className="text-xs text-muted-foreground">{savingsGoal}% of monthly budget</p>
                    </div>
                  </div>
                  {savingsPct >= 100 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
                      <ShieldCheck className="h-3.5 w-3.5" /> Done
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Actual Savings</p>
                      <p className={cn("text-2xl font-black tabular-nums", actualSavings > 0 ? "text-emerald-600" : "text-rose-500")}>
                        {symbol}{actualSavings.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Target</p>
                      <p className="text-lg font-bold text-foreground tabular-nums">{symbol}{savingsTarget.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${savingsPct}%`,
                          background: savingsPct >= 100 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #6ee7b7, #10b981)",
                          boxShadow: "0 0 8px #10b98150",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-medium">{savingsPct.toFixed(0)}% of goal</span>
                      <span className={cn("font-semibold", savingsPct >= 100 ? "text-emerald-600" : "text-muted-foreground")}>
                        {savingsPct >= 100 ? "🎉 Goal reached!" : `${symbol}${Math.max(savingsTarget - actualSavings, 0).toLocaleString()} to go`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Pace */}
              <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-5 border-b border-border/50">
                  <p className="text-sm font-bold text-foreground">Spending Pace</p>
                  <p className="text-xs text-muted-foreground">Projected end-of-month spend</p>
                </div>
                <div className="p-5 space-y-3">
                  {(() => {
                    const daysPassed = now.getDate();
                    const dailyRate = daysPassed > 0 ? monthlySpent / daysPassed : 0;
                    const projected = Math.round(dailyRate * daysInMonth);
                    const projectedPct = monthlyBudget > 0 ? Math.min((projected / monthlyBudget) * 100, 100) : 0;
                    const isOnTrack = projected <= monthlyBudget;
                    return (
                      <>
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Projected Total</p>
                            <p className={cn("text-2xl font-black tabular-nums", isOnTrack ? "text-foreground" : "text-rose-500")}>
                              {symbol}{projected.toLocaleString()}
                            </p>
                          </div>
                          <span className={cn(
                            "flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl mb-1",
                            isOnTrack ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100",
                          )}>
                            {isOnTrack ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                            {isOnTrack ? "On Track" : "Over Pace"}
                          </span>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${projectedPct}%`,
                              background: isOnTrack ? "linear-gradient(90deg, #818cf8, #6366f1)" : "linear-gradient(90deg, #fb7185, #f43f5e)",
                              boxShadow: isOnTrack ? "0 0 6px #6366f150" : "0 0 6px #f43f5e50",
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Spending {symbol}{Math.round(dailyRate).toLocaleString()}/day · Budget {symbol}{Math.round(monthlyBudget / daysInMonth).toLocaleString()}/day
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly history chart */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Budget History</h2>
                <p className="text-sm text-muted-foreground">
                  Last 6 months vs. {symbol}{monthlyBudget.toLocaleString()} budget
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <span className="text-xs text-muted-foreground font-medium">Within budget</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="text-xs text-muted-foreground font-medium">Over budget</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyHistory} barSize={32} barCategoryGap="35%">
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
                  <Tooltip
                    content={<BarTooltip symbol={symbol} budget={monthlyBudget} />}
                    cursor={{ fill: "hsl(var(--muted))", radius: 6 }}
                  />
                  {monthlyBudget > 0 && (
                    <ReferenceLine
                      y={monthlyBudget}
                      stroke="#6366f1"
                      strokeDasharray="6 3"
                      strokeWidth={2}
                      label={{ value: "Budget", position: "right", fill: "#6366f1", fontSize: 11, fontWeight: 600 }}
                    />
                  )}
                  <Bar dataKey="amount" radius={[5, 5, 0, 0]}>
                    {monthlyHistory.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={monthlyBudget > 0 && entry.amount > monthlyBudget ? "#f43f5e" : "#4f46e5"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
