import { MonthlyExpensesChart } from "@/components/dashboard/monthly-expenses-chart";
import { CategoryChartWithMonthSelector } from "@/components/dashboard/category-chart-with-month-selector";
import { RecentExpensesTable } from "@/components/dashboard/recent-expenses-table";
import { SubscriptionsList } from "@/components/dashboard/subscriptions-list";
import { HeroBand } from "@/components/dashboard/hero-band";
import { SavingsGauge } from "@/components/dashboard/savings-gauge";
import { PaymentMethodBreakdown } from "@/components/dashboard/payment-method-breakdown";
import { getDashboardStats, getSubscriptions } from "@/actions/dashboard";
import {
  getRecentExpenses,
  getMonthlyExpenses,
  getExpenses,
} from "@/actions/expenses";
import { getAuthUser } from "@/actions/auth";
import { getUserSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

type ExpenseRecord = {
  _id: string;
  amount: number;
  date: string | Date;
  category: string;
  paymentMethod: string;
};

export default async function DashboardPage() {
  const user = await getAuthUser();
  const userSettings = await getUserSettings();
  const [stats, recentExpenses, monthlyExpenses, subscriptions, allExpenses] =
    await Promise.all([
      getDashboardStats(),
      getRecentExpenses(6),
      getMonthlyExpenses(6),
      getSubscriptions(),
      getExpenses(1000),
    ]);

  const now = new Date();
  const monthlyBudget = userSettings?.monthlyBudget || 0;

  const thisMonthExpenses = (allExpenses as ExpenseRecord[]).filter((e) => {
    const d = new Date(e.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const monthlySpent = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = monthlyBudget - monthlySpent;
  const budgetUsed =
    monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlyBudget > 0 && monthlySpent > monthlyBudget;

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

  const paymentMethodData = Object.entries(
    thisMonthExpenses.reduce(
      (acc, e) => {
        acc[e.paymentMethod] = (acc[e.paymentMethod] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>,
    ),
  ).map(([method, amount]) => ({ method, amount }));

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const userName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-8xl space-y-6">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 animate-fade-in sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {format(now, "EEEE, MMMM d")}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {greeting}, {userName}
          </h1>
        </div>
        <Button
          className="h-9 gap-1.5 rounded-lg text-sm font-semibold shadow-md"
          render={<Link href="/expenses/new" />}
        >
          <Plus className="h-4 w-4" />
          New Expense
        </Button>
      </div>

      {/* Bento grid */}
      <div className="stagger-children grid grid-cols-1 gap-5 xl:grid-cols-12 [&>*]:animate-fade-in">
        <div className="xl:col-span-12">
          <HeroBand
            remainingBudget={remainingBudget}
            monthlyBudget={monthlyBudget}
            monthlySpent={monthlySpent}
            budgetUsed={budgetUsed}
            isOverBudget={isOverBudget}
            dailyBudget={dailyBudget}
            daysRemaining={daysRemaining}
            dayOfMonth={dayOfMonth}
            daysInMonth={daysInMonth}
            totalInvestment={stats.totalInvestment}
            investmentTrend={stats.monthlyExpensesTrend}
            monthlyHistory={monthlyExpenses}
          />
        </div>

        <div className="xl:col-span-8">
          <MonthlyExpensesChart data={monthlyExpenses} />
        </div>
        <div className="xl:col-span-4">
          <SavingsGauge
            current={stats.goalProgress}
            target={stats.goalTarget}
          />
        </div>

        <div className="xl:col-span-7">
          <CategoryChartWithMonthSelector />
        </div>
        <div className="xl:col-span-5">
          <PaymentMethodBreakdown data={paymentMethodData} />
        </div>

        <div className="xl:col-span-7">
          <RecentExpensesTable expenses={recentExpenses} />
        </div>
        <div className="xl:col-span-5">
          <SubscriptionsList subscriptions={subscriptions} limit={5} />
        </div>
      </div>
    </div>
  );
}
