"use client";

import { useState } from "react";
import {
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import {
  dueLabel,
  formatDay,
  loanProgress,
  loanStatus,
  type LoanStatus,
} from "@/lib/utils/loan";
import type { LoanRecord } from "@/actions/loans";

const AVATAR_COLORS = [
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
];

const STATUS_STYLE: Record<
  LoanStatus,
  { label: string; tone: string; chip: string }
> = {
  active: { label: "Active", tone: "text-primary", chip: "bg-primary/10 text-primary" },
  "due-soon": { label: "Due soon", tone: "text-warning", chip: "bg-warning/15 text-warning" },
  overdue: { label: "Overdue", tone: "text-danger", chip: "bg-danger/10 text-danger" },
  cleared: { label: "Cleared", tone: "text-success", chip: "bg-success/10 text-success" },
};

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function ProgressRing({ percent, className }: { percent: number; className?: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className={cn("relative size-[68px] shrink-0", className)}>
      <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-muted" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular-nums text-foreground">
        {Math.floor(percent)}%
      </span>
    </div>
  );
}

export function LoanCard({
  loan,
  onPay,
  onEdit,
  onDelete,
  onRemovePayment,
}: {
  loan: LoanRecord;
  onPay: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRemovePayment: (paymentId: string) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const { paid, remaining, percent, cleared } = loanProgress(loan);
  const status = loanStatus(loan);
  const style = STATUS_STYLE[status];
  const history = [...loan.payments].sort((a, b) => b.paidOn.localeCompare(a.paidOn));
  const lastPaidOn = history[0]?.paidOn;

  return (
    <div className="loan-wrap group">
      <article className="loan-slip relative flex flex-col overflow-hidden bg-card text-card-foreground">
        {/* Status stripe */}
        <div className={cn("h-1 w-full bg-current", style.tone)} aria-hidden />

        <div className="space-y-4 p-5 pb-4">
          {/* Lender */}
          <header className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl text-base font-bold uppercase",
                avatarColor(loan.lender),
              )}
              aria-hidden
            >
              {loan.lender.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-semibold leading-tight">{loan.lender}</h3>
              <p
                className={cn(
                  "mt-0.5 truncate text-[13px]",
                  loan.purpose ? "text-muted-foreground" : "italic text-muted-foreground/60",
                )}
              >
                {loan.purpose || "No purpose noted"}
              </p>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit loan from ${loan.lender}`}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="size-3.5" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Delete loan from ${loan.lender}`}
                className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="size-3.5" strokeWidth={2} />
              </button>
            </div>
          </header>

          {/* Balance + ring */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {cleared ? "Fully repaid" : "Still owed"}
              </p>
              <p
                className={cn(
                  "mt-0.5 truncate text-[28px] font-bold leading-none tracking-tight tabular-nums",
                  cleared && "text-muted-foreground line-through decoration-2",
                )}
              >
                <CurrencyDisplay amount={cleared ? loan.principal : remaining} />
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                of <CurrencyDisplay amount={loan.principal} className="font-medium text-foreground" />{" "}
                borrowed
              </p>
            </div>
            <ProgressRing percent={percent} className={style.tone} />
          </div>

          {/* Segmented tape: one segment per repayment */}
          <div>
            <div
              className={cn("flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-muted", style.tone)}
              role="img"
              aria-label={`${Math.floor(percent)}% repaid across ${loan.payments.length} payment${loan.payments.length === 1 ? "" : "s"}`}
            >
              {loan.payments.map((payment, i) => (
                <div
                  key={payment.id}
                  className={cn("loan-seg h-full bg-current", i % 2 ? "opacity-65" : "opacity-100")}
                  style={{ width: `${Math.max((payment.amount / loan.principal) * 100, 1.5)}%` }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
              <span>
                <CurrencyDisplay amount={paid} /> paid
              </span>
              <span>
                {loan.payments.length} payment{loan.payments.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {/* Dates + status */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="size-3.5" />
              Taken {formatDay(loan.takenOn)}
            </span>
            {!cleared && (
              <span className={cn("flex items-center gap-1.5", status !== "active" && style.tone, status !== "active" && "font-semibold")}>
                <CalendarClock className="size-3.5" />
                {dueLabel(loan.dueDate)}
              </span>
            )}
            {cleared && lastPaidOn && (
              <span className="flex items-center gap-1.5 font-semibold text-success">
                <CalendarClock className="size-3.5" />
                Cleared {formatDay(lastPaidOn)}
              </span>
            )}
            <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", style.chip)}>
              {style.label}
            </span>
          </div>

          {loan.note && (
            <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs italic text-muted-foreground">
              “{loan.note}”
            </p>
          )}

          {/* Payment history */}
          {history.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowHistory((v) => !v)}
                aria-expanded={showHistory}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown
                  className={cn("size-3.5 transition-transform", showHistory && "rotate-180")}
                />
                {showHistory ? "Hide" : "Show"} payment history
              </button>
              {showHistory && (
                <ul className="custom-scrollbar mt-2 max-h-40 space-y-1 overflow-y-auto pr-1">
                  {history.map((payment) => (
                    <li
                      key={payment.id}
                      className="group/pay flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-muted/60"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {formatDay(payment.paidOn)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground/70">
                        {payment.note}
                      </span>
                      <CurrencyDisplay
                        amount={payment.amount}
                        className="shrink-0 font-semibold tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => onRemovePayment(payment.id)}
                        aria-label="Remove payment"
                        className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover/pay:opacity-100 [@media(hover:none)]:opacity-60"
                      >
                        <X className="size-3" strokeWidth={2.5} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Tear-off footer */}
        <div className="loan-perf" aria-hidden />
        <footer className="mt-auto flex h-[var(--loan-foot)] items-center justify-between gap-3 px-5">
          {cleared ? (
            <p className="text-xs font-medium text-muted-foreground">Nothing left to pay.</p>
          ) : (
            <p className="min-w-0 truncate text-xs text-muted-foreground">
              {percent === 0 ? "No payments yet" : `${Math.floor(percent)}% of the way there`}
            </p>
          )}
          {!cleared && (
            <button
              type="button"
              onClick={onPay}
              className="hero-panel flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold text-white shadow-[0_6px_14px_-4px_hsl(233_45%_11%/0.5)] ring-1 ring-white/10 transition-all hover:brightness-110 active:translate-y-px"
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
              Record payment
            </button>
          )}
        </footer>

        {cleared && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="loan-stamp rounded-md px-4 py-1 text-[26px] font-black uppercase tracking-[0.2em]">
              Cleared
            </span>
          </div>
        )}
      </article>
    </div>
  );
}
