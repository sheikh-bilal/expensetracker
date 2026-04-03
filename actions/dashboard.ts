"use server";

import { unstable_noStore as noStore } from "next/cache";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Subscription from "@/models/Subscription";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { getUserSettings } from "./settings";
import { getUserId } from "@/lib/auth-utils";

export async function getDashboardStats() {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) {
      return {
        accountBalance: 0,
        monthlyBudget: 0,
        monthlyExpenses: 0,
        totalInvestment: 0,
        goalProgress: 0,
        goalTarget: 0,
        monthlyExpensesTrend: [],
      };
    }

    await connectDB();

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const userSettings = await getUserSettings();
    const monthlyBudget = userSettings?.monthlyBudget || 0;
    const savingsGoalPercent = userSettings?.savingsGoal || 20;

    const allExpenses = await Expense.find({ userId }).lean();
    const totalExpenses = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const monthlyExpenses = await Expense.find({
      userId,
      date: { $gte: monthStart, $lte: monthEnd },
    }).lean();
    const thisMonthTotal = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const investmentTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const monthExpenses = await Expense.find({
        userId,
        date: { $gte: start, $lte: end },
      }).lean();

      const invested = monthExpenses
        .filter((exp) => exp.category === "shopping" || exp.category === "education")
        .reduce((sum, exp) => sum + exp.amount, 0);

      investmentTrend.push(invested);
    }

    const goalTarget = monthlyBudget > 0 ? (monthlyBudget * savingsGoalPercent) / 100 : 0;
    const actualSavings = monthlyBudget > 0 ? Math.max(monthlyBudget - thisMonthTotal, 0) : 0;
    const baseBalance = 50000;
    const accountBalance = Math.max(baseBalance - totalExpenses, 0);

    return {
      accountBalance: Math.max(accountBalance, 0),
      monthlyBudget,
      monthlyExpenses: thisMonthTotal,
      totalInvestment: investmentTrend[investmentTrend.length - 1] || 0,
      goalProgress: actualSavings,
      goalTarget,
      monthlyExpensesTrend: investmentTrend,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      accountBalance: 0,
      monthlyBudget: 0,
      monthlyExpenses: 0,
      totalInvestment: 0,
      goalProgress: 0,
      goalTarget: 0,
      monthlyExpensesTrend: [],
    };
  }
}

export async function getSubscriptions() {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return [];

    await connectDB();
    const subscriptions = await Subscription.find({ userId, isActive: true })
      .sort({ billingDate: 1 })
      .lean();

    return JSON.parse(JSON.stringify(subscriptions));
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
}

export async function createSubscription(formData: FormData) {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");

    await connectDB();
    const subscription = await Subscription.create({
      userId,
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount") as string),
      billingDate: new Date(formData.get("billingDate") as string),
      category: formData.get("category") || "other",
    });

    return JSON.parse(JSON.stringify(subscription));
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw new Error("Failed to create subscription");
  }
}

export async function deleteSubscription(id: string) {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");

    await connectDB();
    await Subscription.findOneAndDelete({ _id: id, userId });
    return { success: true };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw new Error("Failed to delete subscription");
  }
}
