"use client";

import { useState, useEffect, useMemo } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  TrendingDown,
  CalendarDays,
  Wallet,
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
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
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
  ...EXPENSE_CATEGORIES.map((cat) => ({ value: cat, label: CATEGORY_LABELS[cat] })),
];

const PAYMENT_METHODS_LIST = [
  { value: "all", label: "All Methods" },
  ...PAYMENT_METHODS.map((method) => ({ value: method, label: PAYMENT_METHOD_LABELS[method] })),
];

const PAYMENT_METHOD_STYLE: Record<string, string> = {
  upi: "bg-violet-50 text-violet-600",
  card: "bg-sky-50 text-sky-600",
  bank: "bg-blue-50 text-blue-600",
  cash: "bg-emerald-50 text-emerald-600",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMethod, setSelectedMethod] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { dialog: deleteDialog, confirm: confirmDelete, handleConfirm: handleDeleteConfirm, handleCancel: handleDeleteCancel } = useConfirmDialog();

  useEffect(() => { loadExpenses(); }, []);

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
      const matchSearch = !q || e.description?.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchCat = selectedCategory === "all" || e.category === selectedCategory;
      const matchMethod = selectedMethod === "all" || e.paymentMethod === selectedMethod;
      return matchSearch && matchCat && matchMethod;
    });
  }, [expenses, searchQuery, selectedCategory, selectedMethod]);

  const stats = useMemo(() => {
    const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
    const now = new Date();
    const monthlySpend = expenses
      .filter((e) => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, e) => s + e.amount, 0);
    const avgTx = expenses.length > 0 ? totalSpend / expenses.length : 0;
    return { totalSpend, monthlySpend, avgTx };
  }, [expenses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory, selectedMethod]);

  const activeFilterCount = (searchQuery ? 1 : 0) + (selectedCategory !== "all" ? 1 : 0) + (selectedMethod !== "all" ? 1 : 0);

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">{expenses.length}</span> transactions in your ledger
          </p>
        </div>
        <Link href="/expenses/new">
          <Button className="h-9 gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-[0_2px_10px_rgba(79,70,229,0.25)] hover:from-indigo-700 hover:to-violet-700 transition-all">
            <Plus className="h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        <StatCard
          title="Total Spend"
          value={<CurrencyDisplay amount={stats.totalSpend} className="text-3xl font-black text-foreground" />}
          icon={Wallet}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend={{ value: 8.2, isPositive: false }}
        />
        <StatCard
          title="This Month"
          value={<CurrencyDisplay amount={stats.monthlySpend} className="text-3xl font-black text-foreground" />}
          icon={CalendarDays}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          trend={{ value: 5.4, isPositive: true }}
        />
        <StatCard
          title="Avg. Transaction"
          value={<CurrencyDisplay amount={stats.avgTx} className="text-3xl font-black text-foreground" />}
          icon={TrendingDown}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: 2.1, isPositive: null }}
        />
      </div>

      {/* Table Card */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">

        {/* Filters Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center p-4 border-b border-border/50 bg-muted/20">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Search by name or category..."
              className="h-9 w-full pl-9 text-sm bg-muted/60 border-transparent hover:bg-muted/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-lg shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v || "all")}>
              <SelectTrigger className="h-9 w-[150px] text-sm rounded-lg bg-muted/60 border-transparent hover:bg-muted/80 focus:bg-white focus:border-indigo-500 transition-all data-[state=open]:bg-white data-[state=open]:border-indigo-500">
                <SelectValue>
                  {(value) => CATEGORIES.find((c) => c.value === value)?.label ?? "All Categories"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-lg">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-sm font-medium">{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMethod} onValueChange={(v) => setSelectedMethod(v || "all")}>
              <SelectTrigger className="h-9 w-[140px] text-sm rounded-lg bg-muted/60 border-transparent hover:bg-muted/80 focus:bg-white focus:border-indigo-500 transition-all data-[state=open]:bg-white data-[state=open]:border-indigo-500">
                <SelectValue>
                  {(value) => PAYMENT_METHODS_LIST.find((m) => m.value === value)?.label ?? "All Methods"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-lg">
                {PAYMENT_METHODS_LIST.map((m) => (
                  <SelectItem key={m.value} value={m.value} className="text-sm font-medium">{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {activeFilterCount > 0 && (
              <button
                className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setSelectedMethod("all"); }}
              >
                Clear
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Receipt className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No expenses found</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeFilterCount > 0 ? "Try adjusting your filters" : "Add your first expense to get started"}
              </p>
            </div>
            {activeFilterCount === 0 && (
              <Link href="/expenses/new">
                <Button size="sm" className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Expense
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent bg-muted/40">
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0 pl-6">
                      Type
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0">
                      Category
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0 text-right pr-6">
                      Amount
                    </TableHead>
                    <TableHead className="h-11 py-0 w-14" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((expense) => {
                    const cfg = CATEGORY_CONFIG[expense.category as ExpenseCategory] ?? CATEGORY_CONFIG.other;
                    const Icon = cfg.icon;
                    const label = CATEGORY_LABELS[expense.category as ExpenseCategory] ?? expense.category;
                    const methodLabel = PAYMENT_METHOD_LABELS[expense.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS];
                    const methodStyle = PAYMENT_METHOD_STYLE[expense.paymentMethod] ?? "bg-slate-50 text-slate-600";
                    return (
                      <TableRow
                        key={expense._id}
                        className="border-b border-border/60 group hover:bg-muted/25 transition-colors"
                      >
                        {/* Type: icon + name + subCategory */}
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", cfg.bg)}>
                              <Icon className={cn("h-4 w-4", cfg.color)} strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold text-foreground leading-tight capitalize truncate"
                                title={expense.description || label}
                              >
                                {expense.description || label}
                              </p>
                              {expense.subCategory && (
                                <p className="text-xs text-muted-foreground mt-0.5 capitalize truncate">
                                  {expense.subCategory}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Category badge */}
                        <TableCell className="py-3.5">
                          <Badge
                            variant="outline"
                            className={cn("text-xs h-6 px-2.5 font-semibold rounded-md border", cfg.badge)}
                          >
                            {label}
                          </Badge>
                        </TableCell>

                        {/* Date + payment method */}
                        <TableCell className="py-3.5">
                          <p className="text-sm font-medium text-muted-foreground">{formatDate(expense.date)}</p>
                          {methodLabel && (
                            <span className={cn("mt-0.5 inline-flex text-[10px] font-semibold px-1.5 rounded", methodStyle)}>
                              {methodLabel}
                            </span>
                          )}
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="py-3.5 pr-6 text-right">
                          <span className="text-[15px] font-black tracking-tight text-foreground tabular-nums">
                            <CurrencyDisplay amount={expense.amount} />
                          </span>
                        </TableCell>

                        {/* Delete */}
                        <TableCell className="py-3.5 w-14">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 text-muted-foreground hover:text-rose-600"
                            onClick={() => handleDeleteExpense(expense._id, expense.description || label)}
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
            <div className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of <span className="font-medium text-foreground">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <div key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-xs text-muted-foreground">…</span>
                      )}
                      <Button
                        variant="ghost" size="icon"
                        className={cn(
                          "h-7 w-7 rounded-lg text-xs font-semibold",
                          p === currentPage
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        )}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => { if (!open) handleDeleteCancel(); }}
        onConfirm={handleDeleteConfirm}
        {...deleteDialog.config}
      />
    </div>
  );
}
