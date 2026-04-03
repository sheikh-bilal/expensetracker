import { MonthlyExpensesChart } from "@/components/dashboard/monthly-expenses-chart";
import { CategoryChartWithMonthSelector } from "@/components/dashboard/category-chart-with-month-selector";
import { RecentExpensesTable } from "@/components/dashboard/recent-expenses-table";
import { SubscriptionsList } from "@/components/dashboard/subscriptions-list";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { getDashboardStats, getSubscriptions } from "@/actions/dashboard";
import { getRecentExpenses, getMonthlyExpenses, getExpenses } from "@/actions/expenses";
import { getAuthUser } from "@/actions/auth";
import { getUserSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Plus, Wallet } from "lucide-react";
import Link from "next/link";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG, CATEGORY_LABELS, type ExpenseCategory } from "@/lib/constants/expense";

type ExpenseRecord = {
  _id: string;
  amount: number;
  date: string | Date;
  category: string;
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

  const monthlySpent = (allExpenses as ExpenseRecord[])
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingBudget = monthlyBudget - monthlySpent;
  const budgetUsed = monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const isOverBudget = monthlySpent > monthlyBudget;

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate();
  const dailyBudget = daysRemaining > 0 && remainingBudget > 0 ? remainingBudget / daysRemaining : 0;

  const topCategories = Object.entries(
    (allExpenses as ExpenseRecord[])
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {} as Record<string, number>),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, amount]) => ({ category, amount }));

  const monthlyHistory = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (4 - i));
    const total = (allExpenses as ExpenseRecord[])
      .filter((e) => {
        const ed = new Date(e.date);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      expense: total,
      savings: Math.max(monthlyBudget - total, 0),
    };
  });

  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const userName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Here's what's happening with your finances today.
          </p>
        </div>
        <Link href="/expenses/new">
          <Button className="h-9 gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-[0_2px_10px_rgba(79,70,229,0.25)] hover:from-indigo-700 hover:to-violet-700 transition-all">
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        <DashboardStats stats={stats} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          {/* Cash Flow Chart */}
          <div className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground">Cash Flow Over Time</h2>
              <p className="text-sm text-muted-foreground">Income and expenses tracked by month</p>
            </div>
            <div className="p-4 pt-6">
              <MonthlyExpensesChart data={monthlyExpenses} />
            </div>
          </div>

          {/* Category Chart */}
          <CategoryChartWithMonthSelector />

          {/* Recent Transactions */}
          <div className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50 flex justify-between items-center">
              <h2 className="text-base font-bold text-foreground">Recent Transactions</h2>
              <Link
                href="/expenses"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="p-2">
              <RecentExpensesTable expenses={recentExpenses} hideHeaders />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 border-l-0 xl:border-l xl:border-border xl:pl-6">
          {/* Budget Card */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl overflow-hidden text-white relative">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
            <div className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Wallet className="h-5 w-5 text-indigo-200" strokeWidth={2} />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                  Monthly Budget
                </span>
              </div>
              <div className="mb-5">
                <p className="text-sm text-indigo-200 font-medium mb-2">Remaining Balance</p>
                <div className="text-4xl font-black tracking-tight tabular-nums pb-2 border-b border-indigo-400/30">
                  <CurrencyDisplay amount={remainingBudget} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-indigo-200">
                    Spent: <CurrencyDisplay amount={monthlySpent} />
                  </span>
                  <span className="font-semibold">{budgetUsed.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isOverBudget ? "bg-rose-500" : budgetUsed > 80 ? "bg-amber-500" : "bg-emerald-500",
                    )}
                    style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-indigo-200">
                  <span>Budget: <CurrencyDisplay amount={monthlyBudget} /></span>
                  {isOverBudget && <span className="text-rose-300 font-semibold">Over budget!</span>}
                </div>
                {dailyBudget > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-400/30 flex items-center justify-between">
                    <span className="text-xs text-indigo-200">{daysRemaining}d remaining</span>
                    <span className="text-xs font-semibold text-white">
                      <CurrencyDisplay amount={dailyBudget} />/day
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Bills */}
          <div className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground">Upcoming Bills</h2>
              <p className="text-sm text-muted-foreground">Subscriptions due this week</p>
            </div>
            <div className="p-2">
              <SubscriptionsList subscriptions={subscriptions.slice(0, 4)} compact />
            </div>
          </div>

          {/* Monthly History */}
          <div className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground">Monthly History</h2>
              <p className="text-sm text-muted-foreground">Last 5 months expenses & savings</p>
            </div>
            <div className="p-4 space-y-1">
              {monthlyHistory.map((data) => (
                <div
                  key={data.month}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-indigo-600">{data.month}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expenses</p>
                      <p className="text-sm font-bold text-foreground">
                        <CurrencyDisplay amount={data.expense} />
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Savings</p>
                    <p className={cn("text-sm font-bold", data.savings > 0 ? "text-emerald-600" : "text-rose-600")}>
                      <CurrencyDisplay amount={data.savings} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Spending Categories This Month */}
          {topCategories.length > 0 && (
            <div className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-base font-bold text-foreground">Top Categories</h2>
                <p className="text-sm text-muted-foreground">Highest spending this month</p>
              </div>
              <div className="p-4 space-y-1">
                {topCategories.map(({ category, amount }) => {
                  const cfg = CATEGORY_CONFIG[category as ExpenseCategory] ?? CATEGORY_CONFIG.other;
                  const Icon = cfg.icon;
                  const pct = monthlySpent > 0 ? (amount / monthlySpent) * 100 : 0;
                  return (
                    <div key={category} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/40 transition-colors">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0", cfg.bg)}>
                        <Icon className={cn("h-4 w-4", cfg.color)} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground">
                            {CATEGORY_LABELS[category as ExpenseCategory] ?? category}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground tabular-nums">
                              <CurrencyDisplay amount={amount} />
                            </span>
                            <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", cfg.color.replace("text-", "bg-"))}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
