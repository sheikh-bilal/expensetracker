"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  createExpense,
  getRecentExpenses,
  getExpenses,
} from "@/actions/expenses";
import { getMeters, type Meter } from "@/actions/meters";
import {
  EXPENSE_CATEGORIES,
  BILL_TYPES,
  MONTHS,
  BILL_TYPE_LABELS,
  CATEGORY_LABELS,
  CATEGORY_CONFIG,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  CURRENCY_SYMBOLS,
  type ExpenseCategory,
  type PaymentMethod,
} from "@/lib/constants/expense";
import { METER_TYPES } from "@/lib/constants/meter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchSelect } from "@/components/ui/search-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Receipt,
  Building2,
  Zap,
  Clock,
  CreditCard,
  Landmark,
  Banknote,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";
import type { Expense } from "@/types";

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
  card: CreditCard,
  bank: Landmark,
  cash: Banknote,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
      {children}
    </p>
  );
}

export default function NewExpensePage() {
  const { currency } = useCurrency();
  const symbol =
    CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || "₨";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory | undefined>(
    undefined,
  );
  const [billType, setBillType] = useState<string | undefined>(undefined);
  const [meterId, setMeterId] = useState<string | undefined>(undefined);
  const [meters, setMeters] = useState<Meter[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [monthExpenses, setMonthExpenses] = useState<Expense[]>([]);
  const [date, setDate] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const loadActivity = useCallback(() => {
    getRecentExpenses(5).then(setRecentExpenses);
    getExpenses(1000).then((all) => setMonthExpenses(all as Expense[]));
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

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
    return monthExpenses
      .filter((e) => {
        const d = new Date(e.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [monthExpenses]);

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
      loadActivity();
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
            New Expense
          </h1>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        {/* Form */}
        <Card className="gap-0 self-start pb-0">
          {success ? (
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 ring-8 ring-success/5">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                Expense saved
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Resetting for the next entry…
              </p>
            </CardContent>
          ) : (
            <CardContent className="p-6 sm:p-8">
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
                {/* Amount */}
                <div className="space-y-2.5">
                  <SectionLabel>Amount</SectionLabel>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
                      {symbol}
                    </span>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      required
                      autoFocus
                      className="h-16 rounded-xl bg-muted/40 pl-12 !text-3xl font-semibold tracking-tight tabular-nums focus-visible:bg-card"
                    />
                  </div>
                </div>

                {/* Category chips */}
                <fieldset className="space-y-2.5">
                  <legend>
                    <SectionLabel>Category</SectionLabel>
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {EXPENSE_CATEGORIES.map((cat) => {
                      const cfg = CATEGORY_CONFIG[cat];
                      const Icon = cfg.icon;
                      const selected = category === cat;
                      return (
                        <label
                          key={cat}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 transition-all duration-150",
                            "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50",
                            selected
                              ? "border-primary/40 bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:border-foreground/20 hover:bg-muted/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="category"
                            value={cat}
                            required
                            checked={selected}
                            onChange={() => {
                              setCategory(cat);
                              if (cat !== "bills") {
                                setBillType(undefined);
                                setMeterId(undefined);
                              }
                            }}
                            className="sr-only"
                          />
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                              cfg.bg,
                            )}
                          >
                            <Icon
                              className={cn("h-3.5 w-3.5", cfg.color)}
                              strokeWidth={2}
                            />
                          </span>
                          <span
                            className={cn(
                              "truncate text-[13px] font-medium",
                              selected
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {CATEGORY_LABELS[cat]}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {/* Bill details */}
                {category === "bills" && (
                  <div className="space-y-4 rounded-xl border border-info/20 bg-info/5 p-4 duration-300 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-info">
                      <Building2 className="h-3.5 w-3.5" />
                      Bill details
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="billType"
                          className="text-xs font-medium"
                        >
                          Bill type
                        </Label>
                        <SearchSelect
                          name="billType"
                          value={billType ?? ""}
                          required
                          onValueChange={(v) => {
                            setBillType(v ?? undefined);
                            setMeterId(undefined);
                          }}
                          placeholder="Select bill type"
                          searchPlaceholder="Search bill types..."
                          options={BILL_TYPES.map((type) => ({
                            value: type,
                            label: BILL_TYPE_LABELS[type],
                          }))}
                        />
                      </div>

                      {billType && METER_TYPES.includes(billType as any) && (
                        <>
                          <div className="space-y-2">
                            <Label
                              htmlFor="meterId"
                              className="flex items-center gap-1.5 text-xs font-medium"
                            >
                              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                              Meter
                            </Label>
                            <SearchSelect
                              name="meterId"
                              value={meterId ?? ""}
                              required
                              onValueChange={(v) => setMeterId(v ?? undefined)}
                              placeholder="Select meter"
                              searchPlaceholder="Search meters..."
                              options={meters.map((meter) => ({
                                value: meter._id,
                                label: `${meter.name} (Ref: ${meter.refNo})`,
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="month"
                              className="flex items-center gap-1.5 text-xs font-medium"
                            >
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                              Month
                            </Label>
                            <SearchSelect
                              name="month"
                              required
                              placeholder="Select month"
                              searchPlaceholder="Search months..."
                              options={MONTHS.map((month) => ({
                                value: month,
                                label: month,
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="units"
                              className="flex items-center gap-1.5 text-xs font-medium"
                            >
                              <Zap className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                              Units
                            </Label>
                            <Input
                              id="units"
                              name="units"
                              type="number"
                              placeholder="150"
                              className="h-10 rounded-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="reading"
                              className="flex items-center gap-1.5 text-xs font-medium"
                            >
                              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                              Reading
                            </Label>
                            <Input
                              id="reading"
                              name="reading"
                              type="number"
                              step="any"
                              placeholder="150.5"
                              className="h-10 rounded-lg"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment method + date */}
                <div className="grid gap-6 sm:grid-cols-[1fr_180px]">
                  <fieldset className="space-y-2.5">
                    <legend>
                      <SectionLabel>Paid with</SectionLabel>
                    </legend>
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted/60 p-1">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = PAYMENT_METHOD_ICONS[method];
                        return (
                          <label
                            key={method}
                            className={cn(
                              "flex cursor-pointer flex-col items-center gap-1 rounded-lg px-2 py-2 text-center transition-all duration-150",
                              "has-[:checked]:bg-card has-[:checked]:shadow-sm has-[:checked]:ring-1 has-[:checked]:ring-foreground/10",
                              "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50",
                            )}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method}
                              defaultChecked={method === "cash"}
                              className="peer sr-only"
                            />
                            <Icon
                              className="h-4 w-4 text-muted-foreground peer-checked:text-primary"
                              strokeWidth={2}
                            />
                            <span className="text-[11px] font-medium text-muted-foreground peer-checked:text-foreground">
                              {PAYMENT_METHOD_LABELS[method]}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="space-y-2.5">
                    <SectionLabel>Date</SectionLabel>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2.5">
                  <SectionLabel>Description</SectionLabel>
                  <Input
                    id="description"
                    name="description"
                    placeholder="What was this expense for? (optional)"
                    className="h-10 rounded-lg"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <Button
                    asChild
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-sm px-5 font-medium"
                  >
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 rounded-sm px-7 font-semibold shadow-md"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving…
                      </span>
                    ) : (
                      "Save Expense"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>

        {/* Side rail */}
        <div className="space-y-5">
          {/* Month-to-date tile */}
          <div className="hero-panel relative overflow-hidden rounded-2xl p-5 text-white shadow-md ring-1 ring-white/10">
            <div
              className="hero-grid pointer-events-none absolute inset-0"
              aria-hidden
            />
            <div className="relative">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
                Spent this month
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                <CurrencyDisplay amount={thisMonthTotal} />
              </p>
              <p className="mt-1 text-xs text-white/50">
                {format(new Date(), "MMMM yyyy")} · updates as you save
              </p>
            </div>
          </div>

          {/* Recent entries */}
          <Card className="gap-0 pb-0">
            <CardHeader className="border-b !pb-4">
              <CardTitle className="text-sm font-semibold">
                Recent Entries
              </CardTitle>
              <CardDescription className="text-xs">
                Your last 5 expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {recentExpenses.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No expenses yet
                </p>
              ) : (
                <div>
                  {recentExpenses.map((expense) => {
                    const cfg =
                      CATEGORY_CONFIG[expense.category as ExpenseCategory] ??
                      CATEGORY_CONFIG.other;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={expense._id}
                        className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                            cfg.bg,
                          )}
                        >
                          <Icon
                            className={cn("h-4 w-4", cfg.color)}
                            strokeWidth={2}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                            {expense.description ||
                              CATEGORY_LABELS[
                                expense.category as ExpenseCategory
                              ] ||
                              expense.category}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {format(new Date(expense.date), "MMM d")}
                          </p>
                        </div>
                        <span className="shrink-0 text-[13px] font-semibold tabular-nums text-foreground">
                          −<CurrencyDisplay amount={expense.amount} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link
                href="/expenses"
                className="mt-2 flex items-center justify-center gap-1 rounded-lg border-t py-2.5 text-xs font-medium text-primary transition-colors bg-primary/5"
              >
                View all expenses
                <ArrowRight className="h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
