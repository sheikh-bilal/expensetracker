"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { HandCoins, Plus, Search, X } from "lucide-react";

import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";
import { LoanCard } from "@/components/loans/loan-card";
import { LoanFormDialog, PaymentDialog } from "@/components/loans/loan-dialogs";
import {
  addLoanPayment,
  createLoan,
  deleteLoan,
  getLoans,
  removeLoanPayment,
  updateLoan,
  type LoanInput,
  type LoanRecord,
  type PaymentInput,
} from "@/actions/loans";
import {
  daysUntilDue,
  dueLabel,
  loanProgress,
  loanStatus,
  sortLoans,
} from "@/lib/utils/loan";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "cleared";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "cleared", label: "Cleared" },
];

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LoanRecord | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const {
    dialog: deleteDialog,
    confirm: confirmDelete,
    handleConfirm: handleDeleteConfirm,
    handleCancel: handleDeleteCancel,
  } = useConfirmDialog();

  useEffect(() => {
    getLoans().then((data) => {
      setLoans(data);
      setLoading(false);
    });
  }, []);

  const payingLoan = loans.find((l) => l._id === payingId) ?? null;

  const replaceLoan = (updated: LoanRecord) =>
    setLoans((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));

  // Dialog submit handlers resolve to an error message (shown in the dialog) or null on success
  const handleSaveLoan = async (input: LoanInput) => {
    const result = editing
      ? await updateLoan(editing._id, input)
      : await createLoan(input);
    if (!result.loan) return result.error ?? "Failed to save loan";

    const saved = result.loan;
    if (editing) {
      replaceLoan(saved);
      toast.success("Loan updated");
    } else {
      setLoans((prev) => [saved, ...prev]);
      toast.success(`Loan from ${saved.lender} added`);
    }
    setFormOpen(false);
    return null;
  };

  const handlePay = async (input: PaymentInput) => {
    if (!payingLoan) return "Loan not found";
    const result = await addLoanPayment(payingLoan._id, input);
    if (!result.loan) return result.error ?? "Failed to record payment";

    replaceLoan(result.loan);
    setPayingId(null);
    toast.success(
      loanProgress(result.loan).cleared
        ? `Loan from ${result.loan.lender} cleared`
        : "Payment recorded",
    );
    return null;
  };

  const handleRemovePayment = async (loan: LoanRecord, paymentId: string) => {
    const confirmed = await confirmDelete({
      title: "Remove this payment?",
      description: "The amount will be added back to what you still owe.",
      confirmText: "Remove",
      variant: "danger",
    });
    if (!confirmed) return;

    const result = await removeLoanPayment(loan._id, paymentId);
    if (!result.loan) {
      toast.error(result.error ?? "Failed to remove payment");
      return;
    }
    replaceLoan(result.loan);
  };

  const handleDelete = async (loan: LoanRecord) => {
    const confirmed = await confirmDelete({
      title: `Delete loan from ${loan.lender}?`,
      description:
        "This removes the loan and its whole payment history. This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    const result = await deleteLoan(loan._id);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setLoans((prev) => prev.filter((l) => l._id !== loan._id));
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const stats = useMemo(() => {
    let borrowed = 0;
    let repaid = 0;
    let cleared = 0;
    let overdue = 0;
    let next: LoanRecord | null = null;
    for (const loan of loans) {
      const { paid, cleared: isCleared } = loanProgress(loan);
      borrowed += loan.principal;
      repaid += paid;
      if (isCleared) {
        cleared++;
        continue;
      }
      if (loanStatus(loan) === "overdue") overdue++;
      const days = daysUntilDue(loan.dueDate);
      if (days !== null && (!next || days < (daysUntilDue(next.dueDate) ?? Infinity))) {
        next = loan;
      }
    }
    const owed = Math.max(borrowed - repaid, 0);
    return {
      borrowed,
      repaid,
      owed,
      cleared,
      overdue,
      active: loans.length - cleared,
      next,
      percent: borrowed > 0 ? Math.min((repaid / borrowed) * 100, 100) : 0,
    };
  }, [loans]);

  const visibleLoans = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortLoans(loans).filter((loan) => {
      const isCleared = loanProgress(loan).cleared;
      if (filter === "active" && isCleared) return false;
      if (filter === "cleared" && !isCleared) return false;
      return (
        !q ||
        loan.lender.toLowerCase().includes(q) ||
        loan.purpose.toLowerCase().includes(q)
      );
    });
  }, [loans, filter, query]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="hero-panel relative overflow-hidden rounded-2xl text-white shadow-[0_18px_40px_-16px_hsl(233_45%_11%/0.6)] ring-1 ring-white/10">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Finance
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Loans</h1>
            <p className="mt-1 max-w-md text-sm text-white/60">
              Everything you&apos;ve borrowed, what it was for, and how much is
              still left to pay back.
            </p>

            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
                Total still owed
              </p>
              <CurrencyDisplay
                amount={stats.owed}
                animate
                className="mt-1 block text-4xl font-bold tracking-tight tabular-nums sm:text-5xl"
              />
            </div>

            {/* Overall repayment bar */}
            <div className="mt-6 max-w-xl">
              <div
                className="h-2 overflow-hidden rounded-full bg-white/10"
                role="img"
                aria-label={`${Math.floor(stats.percent)}% of all borrowed money repaid`}
              >
                <div
                  className="meter-sheen h-full rounded-full bg-white transition-[width] duration-700 ease-out"
                  style={{ width: `${stats.percent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-white/60">
                <span>
                  <CurrencyDisplay amount={stats.repaid} className="font-semibold text-white" />{" "}
                  repaid
                </span>
                <span>
                  of <CurrencyDisplay amount={stats.borrowed} className="font-semibold text-white" />{" "}
                  borrowed · {Math.floor(stats.percent)}%
                </span>
              </div>
            </div>

            <dl className="mt-6 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {[
                { label: "Active loans", value: stats.active },
                { label: "Cleared", value: stats.cleared },
                {
                  label: "Overdue",
                  value: stats.overdue,
                  warn: stats.overdue > 0,
                },
                {
                  label: "Next due",
                  value: stats.next
                    ? `${stats.next.lender} · ${dueLabel(stats.next.dueDate).replace("Due ", "")}`
                    : "—",
                },
              ].map((stat) => (
                <div key={stat.label} className="min-w-0 border-l border-white/15 pl-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/45">
                    {stat.label}
                  </dt>
                  <dd
                    className={cn(
                      "mt-0.5 truncate text-sm font-semibold tabular-nums",
                      stat.warn && "text-rose-300",
                    )}
                  >
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <Button
            onClick={openCreate}
            className="h-11 gap-2 rounded-xl bg-white px-5 text-[13.5px] font-semibold text-[hsl(233_45%_14%)] shadow-lg ring-0 hover:bg-white/90 hover:brightness-100"
          >
            <Plus className="size-4" strokeWidth={2.5} />
            Record a loan
          </Button>
        </div>
      </section>

      {loading ? (
        <PageLoader label="Loading your loans" />
      ) : loans.length === 0 ? (
        <EmptyLedger onCreate={openCreate} />
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              role="tablist"
              aria-label="Filter loans"
              className="inline-flex w-fit rounded-lg bg-muted p-1"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-md px-3.5 py-1 text-[13px] font-medium transition-all",
                    filter === f.value
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lender or purpose…"
                aria-label="Search loans"
                className="h-9 w-full rounded-lg border bg-card pl-9 pr-8 text-sm shadow-xs outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {visibleLoans.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No loans match your filters.
            </p>
          ) : (
            <div className="stagger-children grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 2xl:grid-cols-3 [&>*]:animate-fade-in">
              {visibleLoans.map((loan) => (
                <LoanCard
                  key={loan._id}
                  loan={loan}
                  onPay={() => setPayingId(loan._id)}
                  onEdit={() => {
                    setEditing(loan);
                    setFormOpen(true);
                  }}
                  onDelete={() => handleDelete(loan)}
                  onRemovePayment={(paymentId) => handleRemovePayment(loan, paymentId)}
                />
              ))}
            </div>
          )}
        </>
      )}

      <LoanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        loan={editing}
        onSubmit={handleSaveLoan}
      />
      <PaymentDialog
        open={payingLoan !== null}
        onOpenChange={(open) => {
          if (!open) setPayingId(null);
        }}
        loan={payingLoan}
        onSubmit={handlePay}
      />
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

function EmptyLedger({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div className="relative mb-8 h-32 w-48" aria-hidden>
        <div className="absolute inset-x-4 top-2 h-28 -rotate-6 rounded-xl bg-card shadow-md ring-1 ring-border" />
        <div className="absolute inset-x-4 top-0 h-28 rotate-3 rounded-xl bg-card p-4 shadow-lg ring-1 ring-border">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-primary/10" />
            <div className="h-2 w-16 rounded-full bg-foreground/15" />
          </div>
          <div className="mt-4 h-3 w-24 rounded-full bg-foreground/20" />
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-full w-2/5 rounded-full bg-primary/60" />
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold tracking-tight">No loans on the books</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Record money you&apos;ve borrowed, who it came from and what it was for.
        Then log each repayment and watch the balance shrink.
      </p>
      <Button onClick={onCreate} className="mt-5 gap-2">
        <HandCoins className="size-4" />
        Record your first loan
      </Button>
    </div>
  );
}
