import { differenceInCalendarDays, format, parseISO } from "date-fns";

import type { LoanPayment, LoanRecord } from "@/actions/loans";

export type LoanStatus = "cleared" | "overdue" | "due-soon" | "active";

export const DUE_SOON_DAYS = 7;

export function totalPaid(payments: LoanPayment[]) {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function loanProgress(loan: LoanRecord) {
  const paid = totalPaid(loan.payments);
  // Round to cents so float drift never leaves a phantom 0.00000001 balance
  const remaining = Math.max(Math.round((loan.principal - paid) * 100) / 100, 0);
  const percent = loan.principal > 0 ? Math.min((paid / loan.principal) * 100, 100) : 0;
  return { paid, remaining, percent, cleared: remaining === 0 };
}

/** Whole calendar days until the due date (negative once past), or null if none is set. */
export function daysUntilDue(dueDate: string | null) {
  return dueDate ? differenceInCalendarDays(parseISO(dueDate), new Date()) : null;
}

export function loanStatus(loan: LoanRecord): LoanStatus {
  if (loanProgress(loan).cleared) return "cleared";
  const days = daysUntilDue(loan.dueDate);
  if (days === null) return "active";
  if (days < 0) return "overdue";
  return days <= DUE_SOON_DAYS ? "due-soon" : "active";
}

export function formatDay(date: string) {
  return format(parseISO(date), "d MMM yyyy");
}

export function dueLabel(dueDate: string | null) {
  const days = daysUntilDue(dueDate);
  if (days === null) return "No due date";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day overdue";
  return days > 0 ? `Due in ${days} days` : `${-days} days overdue`;
}

/** Active loans by urgency (overdue first, then soonest due, undated last); cleared loans sink. */
export function sortLoans(loans: LoanRecord[]) {
  const rank = (loan: LoanRecord) => {
    if (loanProgress(loan).cleared) return Number.POSITIVE_INFINITY;
    return daysUntilDue(loan.dueDate) ?? 1e9;
  };
  return [...loans].sort((a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt));
}

export function todayInputValue() {
  return format(new Date(), "yyyy-MM-dd");
}
