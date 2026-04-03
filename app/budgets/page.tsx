"use client";

import { useState, useEffect, useMemo } from "react";
import { getExpenses } from "@/actions/expenses";
import { getMonthlyExpenses } from "@/actions/expenses";
import { getUserSettings } from "@/actions/settings";
import {
  CATEGORY_CONFIG,
  CATEGORY_LABELS,
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
  Wallet, PiggyBank, TrendingDown, Settings, Loader2, AlertTriangle, CheckCircle2,
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

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category breakdown */}
            <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-5 border-b border-border/50">
                <h2 className="text-sm font-bold text-foreground">Spending This Month</h2>
                <p className="text-xs text-muted-foreground">By category</p>
              </div>
              <div className="p-4 space-y-1">
                {categoryBreakdown.length > 0 ? categoryBreakdown.map(({ category, amount }) => {
                  const cfg = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
                  const Icon = cfg.icon;
                  const pct = monthlyBudget > 0 ? (amount / monthlyBudget) * 100 : 0;
                  const ofSpend = monthlySpent > 0 ? Math.round((amount / monthlySpent) * 100) : 0;
                  return (
                    <div key={category} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", cfg.bg)}>
                        <Icon className={cn("h-4 w-4", cfg.color)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            {CATEGORY_LABELS[category] ?? category}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground tabular-nums">
                              {symbol}{amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                              {ofSpend}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all duration-700", cfg.color.replace("text-", "bg-"))}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted-foreground">No expenses this month</p>
                  </div>
                )}
              </div>
            </div>

            {/* Savings tracker */}
            <div className="space-y-4">
              <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="p-5 border-b border-border/50 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                    <PiggyBank className="h-5 w-5 text-emerald-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Savings Goal</p>
                    <p className="text-xs text-muted-foreground">Target: {savingsGoal}% of budget</p>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Actual Savings</p>
                      <p className={cn("text-2xl font-black tabular-nums", actualSavings > 0 ? "text-emerald-600" : "text-rose-500")}>
                        {symbol}{actualSavings.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Target</p>
                      <p className="text-lg font-bold text-foreground tabular-nums">
                        {symbol}{savingsTarget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{savingsPct.toFixed(0)}% of goal</span>
                      <span className={savingsPct >= 100 ? "text-emerald-600 font-semibold" : ""}>
                        {savingsPct >= 100 ? "Goal reached!" : `${symbol}${Math.max(savingsTarget - actualSavings, 0).toLocaleString()} to go`}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", savingsPct >= 100 ? "bg-emerald-500" : "bg-emerald-400")}
                        style={{ width: `${savingsPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 mb-3">
                    <TrendingDown className="h-4 w-4 text-amber-600" strokeWidth={2} />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Expenses Allocation</p>
                  <p className="text-xl font-black text-foreground mt-0.5">{100 - savingsGoal}%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {symbol}{(monthlyBudget - savingsTarget).toLocaleString()} / mo
                  </p>
                </div>
                <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 mb-3">
                    <Wallet className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Daily Allowance</p>
                  <p className="text-xl font-black text-foreground mt-0.5">
                    {symbol}{Math.round(monthlyBudget / 30).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">per day avg</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly history chart */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground">Budget History</h2>
              <p className="text-sm text-muted-foreground">
                Last 6 months · Budget line at {symbol}{monthlyBudget.toLocaleString()}
              </p>
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
