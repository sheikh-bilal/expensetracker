"use client";

import { useState, useEffect, useMemo } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CalendarDays,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
} from "lucide-react";
import { getExpenses, deleteExpense } from "@/actions/expenses";
import { formatDate } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  CATEGORY_CONFIG,
  type ExpenseCategory,
} from "@/lib/constants/expense";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import Link from "next/link";

type ExpenseRecord = {
  _id: string;
  amount: number;
  category: string;
  subCategory?: string;
  date: string | Date;
  paymentMethod: string;
  description?: string;
};

const ITEMS_PER_PAGE = 20;

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  ...EXPENSE_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
  })),
];

const PAYMENT_METHODS_LIST = [
  { value: "all", label: "All Methods" },
  ...PAYMENT_METHODS.map((method) => ({
    value: method,
    label: PAYMENT_METHOD_LABELS[method],
  })),
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const {
    dialog: deleteDialog,
    confirm: confirmDelete,
    handleConfirm: handleDeleteConfirm,
    handleCancel: handleDeleteCancel,
  } = useConfirmDialog();

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    setLoading(true);
    const data = await getExpenses(200);
    setExpenses(data);
    setLoading(false);
  }

  async function handleDeleteExpense(id: string, description: string) {
    const confirmed = await confirmDelete({
      title: "Delete expense?",
      description: `"${description}" will be permanently removed.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (confirmed) {
      await deleteExpense(id);
      loadExpenses();
    }
  }

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        e.description?.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      const matchCat =
        selectedCategory === "all" || e.category === selectedCategory;
      const matchMethod =
        selectedMethod === "all" || e.paymentMethod === selectedMethod;
      return matchSearch && matchCat && matchMethod;
    });
  }, [expenses, searchQuery, selectedCategory, selectedMethod]);

  const stats = useMemo(() => {
    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const now = new Date();
    const sumForMonth = (offset: number) => {
      const ref = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return expenses
        .filter((e) => {
          const d = new Date(e.date);
          return (
            d.getMonth() === ref.getMonth() &&
            d.getFullYear() === ref.getFullYear()
          );
        })
        .reduce((s, e) => s + e.amount, 0);
    };
    const monthlySpend = sumForMonth(0);
    const prevMonthSpend = sumForMonth(-1);
    const monthTrend =
      prevMonthSpend > 0
        ? Math.round(((monthlySpend - prevMonthSpend) / prevMonthSpend) * 100)
        : null;
    const avgTx = expenses.length > 0 ? totalSpend / expenses.length : 0;
    return { totalSpend, monthlySpend, monthTrend, avgTx };
  }, [expenses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedMethod]);

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedMethod !== "all" ? 1 : 0);

  const statTiles = [
    {
      label: "Total spend",
      icon: Wallet,
      value: <CurrencyDisplay amount={stats.totalSpend} />,
      sub: "across your ledger",
    },
    {
      label: "This month",
      icon: CalendarDays,
      value: <CurrencyDisplay amount={stats.monthlySpend} />,
      sub:
        stats.monthTrend === null ? (
          "no data last month"
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              stats.monthTrend > 0 ? "text-danger" : "text-success",
            )}
          >
            {stats.monthTrend > 0 ? (
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
            ) : (
              <ArrowDownRight className="h-3 w-3" strokeWidth={2.5} />
            )}
            {Math.abs(stats.monthTrend)}% vs last month
          </span>
        ),
    },
    {
      label: "Average transaction",
      icon: Receipt,
      value: <CurrencyDisplay amount={stats.avgTx} />,
      sub: "per entry",
    },
    {
      label: "Transactions",
      icon: Hash,
      value: <span>{expenses.length}</span>,
      sub: "in your ledger",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Ledger
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Transactions
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

      {/* Stat tiles */}
      <Card className="gap-0 [--card-spacing:0px] animate-fade-in">
        <CardContent className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border/60 p-0 lg:grid-cols-4">
          {statTiles.map(({ label, icon: Icon, value, sub }) => (
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
                <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Table card */}
      <Card className="flex flex-col gap-0 overflow-hidden p-0 animate-fade-in">
        {/* Filters bar */}
        <div className="flex flex-col gap-3 border-b bg-muted/30 p-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or category..."
              className="h-9 w-full rounded-lg bg-card pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v || "all")}
            >
              <SelectTrigger className="h-9 w-[150px] rounded-lg bg-card text-sm">
                <SelectValue>
                  {(value) =>
                    CATEGORIES.find((c) => c.value === value)?.label ??
                    "All Categories"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-sm">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMethod}
              onValueChange={(v) => setSelectedMethod(v || "all")}
            >
              <SelectTrigger className="h-9 w-[140px] rounded-lg bg-card text-sm">
                <SelectValue>
                  {(value) =>
                    PAYMENT_METHODS_LIST.find((m) => m.value === value)
                      ?.label ?? "All Methods"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS_LIST.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-sm">
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilterCount > 0 && (
              <button
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedMethod("all");
                }}
              >
                Clear
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No expenses found
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {activeFilterCount > 0
                  ? "Try adjusting your filters"
                  : "Add your first expense to get started"}
              </p>
            </div>
            {activeFilterCount === 0 && (
              <Button
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold"
                render={<Link href="/expenses/new" />}
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Expense
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-11 py-0 pl-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Transaction
                    </TableHead>
                    <TableHead className="h-11 py-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="h-11 py-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Date
                    </TableHead>
                    <TableHead className="h-11 py-0 pr-6 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-11 w-14 py-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((expense) => {
                    const cfg =
                      CATEGORY_CONFIG[expense.category as ExpenseCategory] ??
                      CATEGORY_CONFIG.other;
                    const Icon = cfg.icon;
                    const label =
                      CATEGORY_LABELS[expense.category as ExpenseCategory] ??
                      expense.category;
                    const methodLabel =
                      PAYMENT_METHOD_LABELS[
                        expense.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS
                      ];
                    return (
                      <TableRow
                        key={expense._id}
                        className="group border-b transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
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
                            <div className="min-w-0">
                              <p
                                className="truncate text-[13px] font-medium capitalize leading-tight text-foreground"
                                title={expense.description || label}
                              >
                                {expense.description || label}
                              </p>
                              {expense.subCategory && (
                                <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">
                                  {expense.subCategory}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                cfg.color.replace("text-", "bg-"),
                              )}
                              aria-hidden
                            />
                            {label}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <p className="text-[13px] text-muted-foreground">
                            {formatDate(expense.date)}
                          </p>
                          {methodLabel && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                              {methodLabel}
                            </p>
                          )}
                        </TableCell>

                        <TableCell className="py-3.5 pr-6 text-right">
                          <span className="text-[13px] font-semibold tabular-nums text-foreground">
                            −<CurrencyDisplay amount={expense.amount} />
                          </span>
                        </TableCell>

                        <TableCell className="w-14 py-3.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                            onClick={() =>
                              handleDeleteExpense(
                                expense._id,
                                expense.description || label,
                              )
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .map((p, idx, arr) => (
                    <div key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-xs text-muted-foreground">
                          …
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-lg text-xs font-semibold",
                          p === currentPage
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
        onConfirm={handleDeleteConfirm}
        {...deleteDialog.config}
      />
    </div>
  );
}
