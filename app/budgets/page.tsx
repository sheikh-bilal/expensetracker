"use client";

import { useState, useEffect, useMemo } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { getExpenses, getMonthlyExpenses } from "@/actions/expenses";
import { getUserSettings } from "@/actions/settings";
import { ROUTES } from "@/lib/constants/routes";
import {
  CATEGORY_CONFIG,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  CURRENCY_SYMBOLS,
  type ExpenseCategory,
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
  ReferenceLine,
} from "recharts";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Wallet,
  PiggyBank,
  TrendingDown,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Target,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type Expense = { _id: string; amount: number; date: string; category: string };

function BarTooltip({ active, payload, label, symbol, budget }: any) {
  if (!active || !payload?.length) return null;
  const spent = payload[0].value;
  const over = budget > 0 && spent > budget;
  return (
    <div className="space-y-1 rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">
        {symbol}
        {spent.toLocaleString()}
      </p>
      {budget > 0 && (
        <p
          className={cn(
            "text-xs font-medium",
            over ? "text-danger" : "text-success",
          )}
        >
          {over
            ? `Over by ${symbol}${(spent - budget).toLocaleString()}`
            : `Under by ${symbol}${(budget - spent).toLocaleString()}`}
        </p>
      )}
    </div>
  );
}

export default function BudgetsPage() {
  const { currency } = useCurrency();
  const symbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [monthlyHistory, setMonthlyHistory] = useState<
    { month: string; amount: number }[]
  >([]);
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
    () =>
      expenses.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      }),
    [expenses],
  );

  const monthlySpent = useMemo(
    () => thisMonthExpenses.reduce((s, e) => s + e.amount, 0),
    [thisMonthExpenses],
  );

  const categoryBreakdown = useMemo(() => {
    const totals = thisMonthExpenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>,
    );
    return Object.entries(totals)
      .map(([cat, amount]) => ({ category: cat as ExpenseCategory, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [thisMonthExpenses]);

  const remainingBudget = monthlyBudget - monthlySpent;
  const budgetUsedPct =
    monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlySpent > monthlyBudget && monthlyBudget > 0;

  const savingsTarget =
    monthlyBudget > 0 ? (monthlyBudget * savingsGoal) / 100 : 0;
  const actualSavings = monthlyBudget > 0 ? Math.max(remainingBudget, 0) : 0;
  const savingsPct =
    savingsTarget > 0
      ? Math.min((actualSavings / savingsTarget) * 100, 100)
      : 0;

  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const daysRemaining = daysInMonth - dayOfMonth;
  const dailyBudget =
    daysRemaining > 0 && remainingBudget > 0
      ? remainingBudget / daysRemaining
      : 0;
  const pacePercent = (dayOfMonth / daysInMonth) * 100;

  const dailyRate = dayOfMonth > 0 ? monthlySpent / dayOfMonth : 0;
  const projected = Math.round(dailyRate * daysInMonth);
  const projectedPct =
    monthlyBudget > 0 ? Math.min((projected / monthlyBudget) * 100, 100) : 0;
  const isOnPace = projected <= monthlyBudget;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {now.toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Budgets
          </h1>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-9 gap-1.5 rounded-lg text-sm font-medium"
        >
          <Link href={ROUTES.SETTINGS}>
            <Settings className="h-4 w-4" />
            Edit Budget
          </Link>
        </Button>
      </div>

      {monthlyBudget === 0 ? (
        /* No budget set */
        <Card className="p-0">
          <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="mb-1 text-base font-semibold text-foreground">
                No budget set
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Set a monthly budget in Settings to unlock spending limits,
                pacing and savings goals.
              </p>
            </div>
            <Button asChild className="h-9 gap-2 rounded-lg font-semibold">
              <Link href={ROUTES.SETTINGS}>
                <Settings className="h-4 w-4" />
                Go to Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="stagger-children space-y-5 [&>*]:animate-fade-in">
          {/* Overview command deck */}
          <section
            className="hero-panel relative overflow-hidden rounded-2xl text-white shadow-lg ring-1 ring-white/10"
            aria-label="Budget overview"
          >
            <div
              className="hero-grid pointer-events-none absolute inset-0"
              aria-hidden
            />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  {now.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · Day {dayOfMonth} of {daysInMonth}
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    isOverBudget
                      ? "bg-rose-400/15 text-rose-300"
                      : budgetUsedPct > 80
                        ? "bg-amber-300/15 text-amber-200"
                        : "bg-teal-300/15 text-teal-300",
                  )}
                >
                  {isOverBudget ? (
                    <AlertTriangle className="h-3 w-3" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3" />
                  )}
                  {isOverBudget
                    ? "Over budget"
                    : budgetUsedPct > 80
                      ? "Running hot"
                      : "On track"}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
                <div className="sm:pr-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Budget
                  </p>
                  <p className="mt-1.5 text-3xl font-semibold tracking-tight">
                    <CurrencyDisplay amount={monthlyBudget} />
                  </p>
                </div>
                <div className="sm:px-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    Spent
                  </p>
                  <p
                    className={cn(
                      "mt-1.5 text-3xl font-semibold tracking-tight",
                      isOverBudget && "text-rose-300",
                    )}
                  >
                    <CurrencyDisplay amount={monthlySpent} animate />
                  </p>
                </div>
                <div className="sm:pl-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                    {remainingBudget < 0 ? "Over by" : "Remaining"}
                  </p>
                  <p
                    className={cn(
                      "mt-1.5 text-3xl font-semibold tracking-tight",
                      remainingBudget < 0 ? "text-rose-300" : "text-teal-300",
                    )}
                  >
                    <CurrencyDisplay amount={Math.abs(remainingBudget)} />
                  </p>
                </div>
              </div>

              {/* Meter with pace marker */}
              <div className="mt-7">
                <div className="relative h-2 w-full rounded-full bg-white/10">
                  <div
                    className={cn(
                      "meter-sheen h-full rounded-full transition-[width] duration-1000 ease-out",
                      isOverBudget
                        ? "bg-rose-400"
                        : budgetUsedPct > 80
                          ? "bg-amber-300"
                          : "bg-teal-300",
                    )}
                    style={{ width: `${Math.min(budgetUsedPct, 100)}%` }}
                  />
                  {!isOverBudget && (
                    <div
                      className="absolute -top-1 bottom-[-4px] w-px bg-white/50"
                      style={{ left: `${pacePercent}%` }}
                      aria-hidden
                    >
                      <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-wider text-white/50">
                        today
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-white/55">
                  <span className="tabular-nums">
                    {Math.round(budgetUsedPct)}% used
                  </span>
                  {dailyBudget > 0 && (
                    <span>
                      <CurrencyDisplay
                        amount={dailyBudget}
                        className="font-semibold text-white/90"
                      />
                      /day for {daysRemaining} days left
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Health tiles */}
          <Card className="gap-0 p-0 [--card-spacing:0px]">
            <CardContent className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border/60 p-0 lg:grid-cols-4">
              {[
                {
                  label: "Daily budget",
                  value: `${symbol}${Math.round(monthlyBudget / daysInMonth).toLocaleString()}`,
                  sub: "per day, whole month",
                  icon: Calendar,
                },
                {
                  label: "Daily remaining",
                  value:
                    dailyBudget > 0
                      ? `${symbol}${Math.round(dailyBudget).toLocaleString()}`
                      : "—",
                  sub:
                    daysRemaining > 0
                      ? `${daysRemaining} days left`
                      : "month ends today",
                  icon: Zap,
                },
                {
                  label: "Savings target",
                  value: `${symbol}${savingsTarget.toLocaleString()}`,
                  sub: `${savingsGoal}% of budget`,
                  icon: Target,
                },
                {
                  label: "Spend allocation",
                  value: `${100 - savingsGoal}%`,
                  sub: `${symbol}${(monthlyBudget - savingsTarget).toLocaleString()} / mo`,
                  icon: TrendingDown,
                },
              ].map(({ label, value, sub, icon: Icon }) => (
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
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Categories + right rail */}
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            {/* Ranked category spend */}
            <Card className="gap-0 self-start p-0">
              <CardHeader className="border-b !pb-4">
                <CardTitle className="text-sm font-semibold">
                  Spending This Month
                </CardTitle>
                <CardDescription className="text-xs">
                  Ranked by amount ·{" "}
                  {now.toLocaleString("default", { month: "long" })}
                </CardDescription>
                {categoryBreakdown.length > 0 && (
                  <CardAction>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                      {categoryBreakdown.length} categories
                    </span>
                  </CardAction>
                )}
              </CardHeader>
              <CardContent className="p-3">
                {categoryBreakdown.length > 0 ? (
                  <div>
                    {categoryBreakdown.map(({ category, amount }, idx) => {
                      const cfg =
                        CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.other;
                      const Icon = cfg.icon;
                      const fill =
                        CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
                      const ofSpend =
                        monthlySpent > 0
                          ? Math.round((amount / monthlySpent) * 100)
                          : 0;
                      const ofBudget =
                        monthlyBudget > 0
                          ? Math.round((amount / monthlyBudget) * 100)
                          : 0;
                      const txCount = thisMonthExpenses.filter(
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
                                {CATEGORY_LABELS[category] ?? category}
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
                                  width: `${ofSpend}%`,
                                  backgroundColor: fill,
                                }}
                              />
                            </div>
                          </div>
                          <span className="hidden w-12 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground sm:block">
                            {ofBudget}%
                            <span className="block text-[10px] font-normal text-muted-foreground/70">
                              of budget
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                      <Wallet
                        className="h-5 w-5 text-muted-foreground/60"
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No expenses this month
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right rail: savings + pace */}
            <div className="space-y-5">
              <Card className="gap-0 p-0">
                <CardHeader className="border-b !pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Savings Goal
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {savingsGoal}% of monthly budget
                  </CardDescription>
                  {savingsPct >= 100 && (
                    <CardAction>
                      <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[11px] font-semibold text-success">
                        <CheckCircle2 className="h-3 w-3" /> Reached
                      </span>
                    </CardAction>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 py-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Saved so far
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-2xl font-semibold tracking-tight tabular-nums",
                          actualSavings > 0 ? "text-success" : "text-danger",
                        )}
                      >
                        {symbol}
                        {actualSavings.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Target
                      </p>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                        {symbol}
                        {savingsTarget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 overflow-hidden rounded-full bg-success/10">
                      <div
                        className="h-full rounded-full bg-success transition-[width] duration-700 ease-out"
                        style={{ width: `${savingsPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium tabular-nums text-muted-foreground">
                        {savingsPct.toFixed(0)}% of goal
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          savingsPct >= 100
                            ? "text-success"
                            : "text-muted-foreground",
                        )}
                      >
                        {savingsPct >= 100
                          ? "Goal reached"
                          : `${symbol}${Math.max(savingsTarget - actualSavings, 0).toLocaleString()} to go`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-0 p-0">
                <CardHeader className="border-b !pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Spending Pace
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Projected end-of-month spend
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Projected total
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-2xl font-semibold tracking-tight tabular-nums",
                          isOnPace ? "text-foreground" : "text-danger",
                        )}
                      >
                        {symbol}
                        {projected.toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "mb-1 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold",
                        isOnPace
                          ? "bg-success/10 text-success"
                          : "bg-danger/10 text-danger",
                      )}
                    >
                      {isOnPace ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      {isOnPace ? "On track" : "Over pace"}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700 ease-out",
                        isOnPace ? "bg-primary" : "bg-danger",
                      )}
                      style={{ width: `${projectedPct}%` }}
                    />
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                    Spending {symbol}
                    {Math.round(dailyRate).toLocaleString()}/day against a{" "}
                    {symbol}
                    {Math.round(monthlyBudget / daysInMonth).toLocaleString()}
                    /day budget.
                  </p>
                </CardContent>
              </Card>

              <Card className="gap-0 p-0">
                <CardHeader className="border-b !pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Savings Snapshot
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Where the month stands
                  </CardDescription>
                </CardHeader>
                <CardContent className="py-5">
                  <div className="flex items-center gap-3">
                    <div className=" p-2 flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                      <PiggyBank
                        className="h-5 w-5 text-success"
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {isOverBudget
                        ? "The budget is spent. Every new expense now eats directly into savings."
                        : `Keep daily spend under ${symbol}${Math.round(dailyBudget || monthlyBudget / daysInMonth).toLocaleString()} and the ${savingsGoal}% savings goal stays in reach.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Budget history */}
          <Card className="gap-0 p-0">
            <CardHeader className="border-b !pb-4">
              <CardTitle className="text-sm font-semibold">
                Budget History
              </CardTitle>
              <CardDescription className="text-xs">
                Last 6 months vs {symbol}
                {monthlyBudget.toLocaleString()} budget
              </CardDescription>
              <CardAction>
                {/* Legend — two states, so identity never rides on color alone */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full bg-primary"
                      aria-hidden
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      Within budget
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full bg-danger"
                      aria-hidden
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      Over budget
                    </span>
                  </div>
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="py-5">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={monthlyHistory}
                  barSize={24}
                  barCategoryGap="35%"
                >
                  <CartesianGrid
                    vertical={false}
                    stroke="hsl(var(--border) / 0.6)"
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    tickFormatter={(v) =>
                      `${symbol}${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                    }
                    width={52}
                  />
                  <Tooltip
                    content={
                      <BarTooltip symbol={symbol} budget={monthlyBudget} />
                    }
                    cursor={{ fill: "hsl(var(--muted) / 0.6)", radius: 6 }}
                  />
                  {monthlyBudget > 0 && (
                    <ReferenceLine
                      y={monthlyBudget}
                      stroke="hsl(var(--muted-foreground) / 0.5)"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                      label={{
                        value: "Budget",
                        position: "insideTopRight",
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10,
                        dy: -4,
                      }}
                    />
                  )}
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {monthlyHistory.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          monthlyBudget > 0 && entry.amount > monthlyBudget
                            ? "hsl(var(--danger))"
                            : "hsl(var(--primary))"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
