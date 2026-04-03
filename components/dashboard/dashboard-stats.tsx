"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { GoalProgressCard } from "@/components/dashboard/goal-progress-card";
import { Wallet, TrendingUp, CreditCard } from "lucide-react";
import { CurrencyDisplay } from "@/components/ui/currency-display";

interface DashboardStatsProps {
  stats: {
    accountBalance: number;
    monthlyBudget: number;
    monthlyExpenses: number;
    totalInvestment: number;
    goalProgress: number;
    goalTarget: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <>
      <StatCard
        title="Monthly Budget"
        value={<CurrencyDisplay amount={stats.monthlyBudget} className="text-3xl font-black text-foreground" />}
        icon={Wallet}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
        trend={{ value: 2.5, isPositive: true }}
      />
      <StatCard
        title="Monthly Spend"
        value={<CurrencyDisplay amount={stats.monthlyExpenses} className="text-3xl font-black text-foreground" />}
        icon={CreditCard}
        iconBg="bg-orange-50"
        iconColor="text-orange-600"
        trend={{ value: 12.4, isPositive: false }}
      />
      <StatCard
        title="Investments"
        value={<CurrencyDisplay amount={stats.totalInvestment} className="text-3xl font-black text-foreground" />}
        icon={TrendingUp}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        trend={{ value: 8.1, isPositive: true }}
      />
      <GoalProgressCard
        current={stats.goalProgress}
        target={stats.goalTarget}
      />
    </>
  );
}
