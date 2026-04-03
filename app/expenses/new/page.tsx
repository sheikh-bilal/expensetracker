"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createExpense, getRecentExpenses } from "@/actions/expenses";
import { getMeters, type Meter } from "@/actions/meters";
import {
  EXPENSE_CATEGORIES,
  BILL_TYPES,
  MONTHS,
  BILL_TYPE_LABELS,
  CATEGORY_LABELS,
  type ExpenseCategory,
} from "@/lib/constants/expense";
import { METER_TYPES } from "@/lib/constants/meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Receipt,
  Building2,
  Zap,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import type { Expense } from "@/types";

const CATEGORY_BADGE_CLASS: Record<ExpenseCategory, string> = {
  food: "bg-amber-100 text-amber-700",
  transport: "bg-blue-100 text-blue-700",
  shopping: "bg-pink-100 text-pink-700",
  entertainment: "bg-purple-100 text-purple-700",
  bills: "bg-rose-100 text-rose-700",
  health: "bg-emerald-100 text-emerald-700",
  education: "bg-cyan-100 text-cyan-700",
  pets: "bg-orange-100 text-orange-700",
  investment: "bg-violet-100 text-violet-700",
  other: "bg-gray-100 text-gray-700",
};

const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  food: "🍔",
  transport: "🚗",
  shopping: "🛍️",
  entertainment: "🎬",
  bills: "📄",
  health: "💊",
  education: "📚",
  pets: "🐾",
  investment: "📈",
  other: "📌",
};

export default function NewExpensePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory | undefined>(undefined);
  const [billType, setBillType] = useState<string | undefined>(undefined);
  const [meterId, setMeterId] = useState<string | undefined>(undefined);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const loadRecentExpenses = useCallback(() => {
    getRecentExpenses(5).then(setRecentExpenses);
  }, []);

  useEffect(() => {
    loadRecentExpenses();
  }, [loadRecentExpenses]);

  useEffect(() => {
    if (billType && METER_TYPES.includes(billType as any)) {
      getMeters().then((data) => {
        setMeters(data.filter((m) => m.type === billType));
      });
    } else {
      setMeters([]);
    }
  }, [billType]);

  const thisMonthTotal = useMemo(() => {
    const now = new Date();
    return recentExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [recentExpenses]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    if (!formData.has("paymentMethod")) {
      formData.append("paymentMethod", "cash");
    }

    await createExpense(formData);
    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setCategory(undefined);
      setBillType(undefined);
      setMeterId(undefined);
      setMeters([]);
      setDate(new Date().toISOString().split("T")[0]);
      formRef.current?.reset();
      loadRecentExpenses();
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/20 py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Add New Expense
              </h1>
              <p className="text-sm text-gray-500">
                Log your transactions accurately
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* Main Form Area */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
              <div className="p-6 space-y-8">
                {success ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-50">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-emerald-900 mb-1">
                      Expense Saved!
                    </h2>
                    <p className="text-sm text-emerald-600">
                      Adding another entry...
                    </p>
                  </div>
                ) : (
                  <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="space-y-8"
                  >
                    {/* Amount Section */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl text-gray-400">
                          Rs
                        </span>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          required
                          className="pl-14 h-14 text-xl font-bold text-gray-900 tracking-tight rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    {/* Classification Section */}
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Classification
                      </label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label
                            htmlFor="category"
                            className="text-xs font-semibold text-gray-700"
                          >
                            Category
                          </Label>
                          <Select
                            name="category"
                            value={category ?? ""}
                            required
                            onValueChange={(v) => setCategory(v as ExpenseCategory)}
                          >
                            <SelectTrigger
                              id="category"
                              className="h-11 w-full rounded-lg border-gray-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 data-[size=default]:h-11"
                            >
                              <SelectValue placeholder="Select category">
                                {(value) => value ? (CATEGORY_LABELS[value as ExpenseCategory] || String(value)) : null}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-gray-200 w-full min-w-full">
                              {EXPENSE_CATEGORIES.map((cat) => (
                                <SelectItem
                                  key={cat}
                                  value={cat}
                                  className="capitalize"
                                >
                                  {CATEGORY_LABELS[cat] || cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="date"
                            className="text-xs font-semibold text-gray-700"
                          >
                            Date
                          </Label>
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-11 w-full rounded-lg border-gray-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>

                      {/* Bill Details */}
                      {category === "bills" && (
                        <div className="grid gap-4 sm:grid-cols-2 mt-2 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/80 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                            <Label
                              htmlFor="billType"
                              className="text-xs font-bold text-indigo-900 flex items-center gap-1.5"
                            >
                              <Building2 className="h-3.5 w-3.5" /> Bill Type
                            </Label>
                            <Select
                              name="billType"
                              value={billType ?? ""}
                              required
                              onValueChange={(v) => {
                                setBillType(v ?? undefined);
                                setMeterId(undefined);
                              }}
                            >
                              <SelectTrigger
                                id="billType"
                                className="h-11 rounded-lg border-indigo-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 data-[size=default]:h-11"
                              >
                                <SelectValue placeholder="Select bill type">
                                  {(value) => value ? (BILL_TYPE_LABELS[value as keyof typeof BILL_TYPE_LABELS] || String(value)) : null}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-indigo-100">
                                {BILL_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {BILL_TYPE_LABELS[type]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {billType && METER_TYPES.includes(billType as any) && (
                            <div className="space-y-2">
                              <Label
                                htmlFor="meterId"
                                className="text-xs font-bold text-indigo-900 flex items-center gap-1.5"
                              >
                                <Receipt className="h-3.5 w-3.5" /> Select Meter
                              </Label>
                              <Select
                                name="meterId"
                                value={meterId ?? ""}
                                required
                                onValueChange={(v) => setMeterId(v ?? undefined)}
                              >
                                <SelectTrigger
                                  id="meterId"
                                  className="h-11 rounded-lg border-indigo-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 data-[size=default]:h-11"
                                >
                                  <SelectValue placeholder="Select meter">
                                    {(value) => { const m = meters.find((m) => m._id === value); return m ? `${m.name} (Ref: ${m.refNo})` : null; }}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-indigo-100">
                                  {meters.length === 0 ? (
                                    <div className="p-2 text-xs text-gray-500">
                                      No meters found. Add one first.
                                    </div>
                                  ) : (
                                    meters.map((meter) => (
                                      <SelectItem key={meter._id} value={meter._id}>
                                        {meter.name} (Ref: {meter.refNo})
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {billType && METER_TYPES.includes(billType as any) && (
                            <>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="month"
                                  className="text-xs font-bold text-indigo-900 flex items-center gap-1.5"
                                >
                                  <Clock className="h-3.5 w-3.5" /> Month
                                </Label>
                                <Select name="month" required>
                                  <SelectTrigger
                                    id="month"
                                    className="h-11 rounded-lg border-indigo-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20 data-[size=default]:h-11"
                                  >
                                    <SelectValue placeholder="Select month" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-indigo-100">
                                    {MONTHS.map((month) => (
                                      <SelectItem key={month} value={month}>
                                        {month}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label
                                  htmlFor="units"
                                  className="text-xs font-bold text-indigo-900 flex items-center gap-1.5"
                                >
                                  <Zap className="h-3.5 w-3.5" /> Units
                                </Label>
                                <Input
                                  id="units"
                                  name="units"
                                  type="number"
                                  placeholder="150"
                                  className="h-11 rounded-lg border-indigo-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20"
                                />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                <Label
                                  htmlFor="reading"
                                  className="text-xs font-bold text-indigo-900 flex items-center gap-1.5"
                                >
                                  <Receipt className="h-3.5 w-3.5" /> Reading
                                </Label>
                                <Input
                                  id="reading"
                                  name="reading"
                                  type="number"
                                  step="any"
                                  placeholder="150.5"
                                  className="h-11 rounded-lg border-indigo-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Description Section */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="description"
                        className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="What was this expense for?"
                        className="h-11 rounded-lg border-gray-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Link href="/dashboard" className="flex-1 sm:flex-none">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold border-gray-200"
                        >
                          Cancel
                        </Button>
                      </Link>
                      <Button
                        type="submit"
                        className="flex-1 sm:flex-none h-11 px-8 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-600/25"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          "Save Expense"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Expenses */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/80 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Recent Expenses
                  </h3>
                  <p className="text-xs text-gray-500">Last 5 entries</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentExpenses.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-sm text-gray-400">No expenses yet</p>
                  </div>
                ) : (
                  recentExpenses.map((expense) => {
                    const cat = expense.category as ExpenseCategory;
                    return (
                      <div
                        key={expense._id}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold capitalize ${CATEGORY_BADGE_CLASS[cat] ?? "bg-gray-100 text-gray-700"}`}
                            >
                              {CATEGORY_EMOJI[cat] ?? "📌"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {expense.description || expense.category}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              <CurrencyDisplay amount={expense.amount} />
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <Link
                href="/expenses"
                className="block p-3 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors border-t border-gray-100"
              >
                View all expenses →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-600/25">
              <p className="text-xs font-medium text-indigo-200 uppercase tracking-wider mb-1">
                This Month's Total
              </p>
              <p className="text-2xl font-bold">
                {thisMonthTotal > 0 ? (
                  <CurrencyDisplay amount={thisMonthTotal} />
                ) : (
                  "Rs 0"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
