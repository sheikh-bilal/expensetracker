"use server";

import { unstable_noStore as noStore } from "next/cache";
import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { createMeterReading } from "@/actions/meterReadings";
import { METER_TYPES } from "@/lib/constants/meter";
import { getUserId } from "@/lib/auth-utils";

export async function createExpense(formData: FormData) {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");

    await connectDB();

    const category = formData.get("category") as string;
    const isBill = category === "bills";

    const expenseData: any = {
      userId,
      amount: parseFloat(formData.get("amount") as string),
      category,
      date: new Date(formData.get("date") as string),
      paymentMethod: formData.get("paymentMethod") || "cash",
      description: formData.get("description") || "",
    };

    if (isBill) {
      const billType = formData.get("billType") as string;
      const meterId = formData.get("meterId") as string;
      const month = formData.get("month") as string;
      const units = formData.get("units") as string;
      const reading = formData.get("reading") as string;

      if (billType) {
        expenseData.billDetails = { billType };

        if (METER_TYPES.includes(billType as any) && meterId && month && units && reading) {
          const readingFormData = new FormData();
          readingFormData.append("meterId", meterId);
          readingFormData.append("month", month);
          readingFormData.append("units", units);
          readingFormData.append("reading", reading);

          const readingResult = await createMeterReading(readingFormData);
          if (readingResult.readingId) {
            expenseData.billDetails.meterReadingId = readingResult.readingId;
          }
        }
      }
    }

    const expense = await Expense.create(expenseData);
    return JSON.parse(JSON.stringify(expense));
  } catch (error) {
    console.error("Error creating expense:", error);
    throw new Error("Failed to create expense");
  }
}

export async function getExpenses(limit: number = 50) {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return [];

    await connectDB();
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(limit).lean();
    return JSON.parse(JSON.stringify(expenses));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

export async function getRecentExpenses(limit: number = 5) {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return [];

    await connectDB();
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(limit).lean();
    return JSON.parse(JSON.stringify(expenses));
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    return [];
  }
}

export async function deleteExpense(id: string) {
  try {
    const userId = await getUserId();
    if (!userId) throw new Error("Not authenticated");

    await connectDB();
    await Expense.findOneAndDelete({ _id: id, userId });
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    throw new Error("Failed to delete expense");
  }
}

export async function getMonthlyExpenses(months: number = 6) {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return [];

    await connectDB();

    const monthlyData = [];
    const now = new Date();

    for (let i = 0; i < months; i++) {
      const date = subMonths(now, i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const expenses = await Expense.find({
        userId,
        date: { $gte: start, $lte: end },
      });

      const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      monthlyData.push({
        month: date.toLocaleString("default", { month: "short" }),
        amount: total,
      });
    }

    return monthlyData.reverse();
  } catch (error) {
    console.error("Error fetching monthly expenses:", error);
    return [];
  }
}

export async function getCategoryExpenses(months: number = 1) {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return [];

    await connectDB();

    const now = new Date();
    const startDate = subMonths(now, months);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate },
    }).lean();

    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error("Error fetching category expenses:", error);
    return [];
  }
}

export async function getCategoryExpensesByMonth(year: number, month: number) {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return [];

    await connectDB();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error("Error fetching category expenses by month:", error);
    return [];
  }
}

export async function getExpensesByDateRange(startDate: Date, endDate: Date) {
  noStore();
  try {
    const userId = await getUserId();
    if (!userId) return [];

    await connectDB();
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: -1 })
      .lean();

    return JSON.parse(JSON.stringify(expenses));
  } catch (error) {
    console.error("Error fetching expenses by date range:", error);
    return [];
  }
}
