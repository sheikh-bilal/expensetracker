"use client";

import { useId } from "react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { cn, trendFrom } from "@/lib/utils";

interface HeroBandProps {
  remainingBudget: number;
  monthlyBudget: number;
  monthlySpent: number;
  budgetUsed: number;
  isOverBudget: boolean;
  dailyBudget: number;
  daysRemaining: number;
  dayOfMonth: number;
  daysInMonth: number;
  totalInvestment: number;
  investmentTrend: number[];
  monthlyHistory: Array<{ month: string; amount: number }>;
}

function Sparkline({ data, good }: { data: number[]; good: boolean }) {
  const id = useId();
  const stroke = good ? "#5eead4" : "#fda4af";
  const chartData = data.map((value, i) => ({ i, value }));

  return (
    <div className="h-10 w-24 shrink-0" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 3, right: 3, bottom: 0, left: 3 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            strokeLinecap="round"
            fill={`url(#${id})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeltaChip({
  trend,
  downIsGood,
}: {
  trend: { value: number; isPositive: boolean | null } | undefined;
  downIsGood: boolean;
}) {
  if (!trend || trend.isPositive === null) return null;
  const good = downIsGood ? !trend.isPositive : trend.isPositive;
  const Arrow = trend.isPositive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
        good ? "bg-teal-400/10 text-teal-300" : "bg-rose-400/10 text-rose-300",
      )}
    >
      <Arrow className="h-3 w-3" strokeWidth={2.5} />
      {trend.value}%
    </span>
  );
}

function StatTile({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
          {label}
        </p>
        <div className="mt-1 flex items-baseline gap-2">{children}</div>
      </div>
      {hint}
    </div>
  );
}

export function HeroBand({
  remainingBudget,
  monthlyBudget,
  monthlySpent,
  budgetUsed,
  isOverBudget,
  dailyBudget,
  daysRemaining,
  dayOfMonth,
  daysInMonth,
  totalInvestment,
  investmentTrend,
  monthlyHistory,
}: HeroBandProps) {
  const hasBudget = monthlyBudget > 0;
  const spendHistory = monthlyHistory.map((m) => m.amount);
  const spendTrend = trendFrom(spendHistory);
  const investTrend = trendFrom(investmentTrend);

  const monthName = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  const pacePercent = (dayOfMonth / daysInMonth) * 100;
  const runningHot = !isOverBudget && budgetUsed > Math.min(pacePercent + 10, 92);

  const meterColor = isOverBudget
    ? "bg-rose-400"
    : runningHot
      ? "bg-amber-300"
      : "bg-teal-300";

  const statusLine = !hasBudget
    ? null
    : isOverBudget
      ? "Over budget — every new expense adds to the overrun."
      : runningHot
        ? "Spending is ahead of the calendar. Ease off to land on budget."
        : "On pace. Keep this rhythm and the month closes under budget.";

  return (
    <section
      className="hero-panel relative overflow-hidden rounded-2xl text-white shadow-lg ring-1 ring-white/10"
      aria-label="Monthly budget overview"
    >
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.5fr_1px_1fr] lg:gap-10">
        {/* Hero figure + meter */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              {monthName}
            </span>
            <span className="h-1 w-1 rounded-full bg-white/25" aria-hidden />
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/45">
              Day {dayOfMonth} of {daysInMonth}
            </span>
          </div>

          <p className="mt-4 text-sm font-medium text-white/65">
            {hasBudget
              ? isOverBudget
                ? "Over budget by"
                : "Left to spend this month"
              : "Spent this month"}
          </p>
          <p
            className={cn(
              "mt-1 text-5xl font-semibold leading-none tracking-tight sm:text-6xl",
              isOverBudget ? "text-rose-300" : "text-white",
            )}
          >
            <CurrencyDisplay
              amount={hasBudget ? Math.abs(remainingBudget) : monthlySpent}
              animate
            />
          </p>

          {hasBudget ? (
            <>
              {/* Budget meter with day-pace marker */}
              <div className="mt-7">
                <div className="relative h-2 w-full rounded-full bg-white/10">
                  <div
                    className={cn(
                      "meter-sheen h-full rounded-full transition-[width] duration-1000 ease-out",
                      meterColor,
                    )}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  />
                  {/* Where spending *should* be today */}
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
                  <span>
                    <CurrencyDisplay amount={monthlySpent} className="font-semibold text-white/90" />{" "}
                    spent of <CurrencyDisplay amount={monthlyBudget} className="font-semibold text-white/90" />
                  </span>
                  <span className="tabular-nums">{Math.round(budgetUsed)}% used</span>
                </div>
              </div>

              {statusLine && (
                <p className="mt-4 flex items-center gap-1.5 text-[13px] text-white/60">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-white/40" strokeWidth={2} />
                  {statusLine}
                </p>
              )}
            </>
          ) : (
            <p className="mt-6 text-sm text-white/60">
              Set a monthly budget to unlock pacing, daily allowance and projections.{" "}
              <Link
                href="/settings"
                className="font-semibold text-teal-300 underline-offset-4 hover:underline"
              >
                Set budget →
              </Link>
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="hidden bg-white/10 lg:block" aria-hidden />
        <div className="h-px w-full bg-white/10 lg:hidden" aria-hidden />

        {/* Stat rail */}
        <div className="flex flex-col justify-center divide-y divide-white/10">
          <StatTile
            label="Spent this month"
            hint={<Sparkline data={spendHistory} good={spendTrend ? !spendTrend.isPositive : true} />}
          >
            <span className="text-xl font-semibold text-white">
              <CurrencyDisplay amount={monthlySpent} />
            </span>
            <DeltaChip trend={spendTrend} downIsGood />
          </StatTile>

          <StatTile
            label="Daily allowance"
            hint={
              <span className="text-xs text-white/45">
                {daysRemaining > 0 ? `${daysRemaining} days left` : "month ends today"}
              </span>
            }
          >
            <span className="text-xl font-semibold text-white">
              {dailyBudget > 0 ? <CurrencyDisplay amount={dailyBudget} /> : "—"}
            </span>
          </StatTile>

          <StatTile
            label="Invested this month"
            hint={<Sparkline data={investmentTrend} good={investTrend ? !!investTrend.isPositive : true} />}
          >
            <span className="text-xl font-semibold text-white">
              <CurrencyDisplay amount={totalInvestment} />
            </span>
            <DeltaChip trend={investTrend} downIsGood={false} />
          </StatTile>
        </div>
      </div>
    </section>
  );
}
