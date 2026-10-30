"use server";

import connectDB from "@/lib/db";
import Loan from "@/models/Loan";
import { getUserId } from "@/lib/auth-utils";

export type LoanPayment = {
  id: string;
  amount: number;
  /** yyyy-MM-dd */
  paidOn: string;
  note: string;
};

export type LoanRecord = {
  _id: string;
  lender: string;
  purpose: string;
  principal: number;
  /** yyyy-MM-dd */
  takenOn: string;
  /** yyyy-MM-dd */
  dueDate: string | null;
  note: string;
  payments: LoanPayment[];
  createdAt: string;
};

export type LoanInput = {
  lender: string;
  purpose: string;
  principal: number;
  takenOn: string;
  dueDate: string | null;
  note: string;
};

export type PaymentInput = {
  amount: number;
  paidOn: string;
  note: string;
};

type LoanResult = { loan?: LoanRecord; error?: string };

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// Days travel as yyyy-MM-dd and are stored at UTC midnight, so they round-trip without timezone drift
function toDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDay(value: unknown): Date | null {
  if (typeof value !== "string" || !DAY_RE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function serialize(loan: any): LoanRecord {
  return {
    _id: loan._id.toString(),
    lender: loan.lender,
    purpose: loan.purpose ?? "",
    principal: loan.principal,
    takenOn: toDay(new Date(loan.takenOn)),
    dueDate: loan.dueDate ? toDay(new Date(loan.dueDate)) : null,
    note: loan.note ?? "",
    payments: (loan.payments ?? []).map((p: any) => ({
      id: p.id,
      amount: p.amount,
      paidOn: toDay(new Date(p.paidOn)),
      note: p.note ?? "",
    })),
    createdAt: new Date(loan.createdAt).toISOString(),
  };
}

function paidSoFar(loan: any): number {
  return (loan.payments ?? []).reduce((sum: number, p: any) => sum + p.amount, 0);
}

function positive(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

// Validates and normalizes client input before it reaches the database
function parseLoanInput(
  input: LoanInput
): { data: Record<string, unknown> } | { error: string } {
  const lender = String(input.lender ?? "").trim().slice(0, 80);
  if (!lender) return { error: "Who did you borrow from?" };

  const principal = positive(input.principal);
  if (principal === null) return { error: "Enter a loan amount greater than zero" };

  const takenOn = parseDay(input.takenOn);
  if (!takenOn) return { error: "Enter a valid date for when you took the loan" };

  let dueDate: Date | null = null;
  if (input.dueDate) {
    dueDate = parseDay(input.dueDate);
    if (!dueDate) return { error: "Enter a valid due date" };
    if (dueDate < takenOn) return { error: "The due date can't be before the loan date" };
  }

  return {
    data: {
      lender,
      purpose: String(input.purpose ?? "").trim().slice(0, 120),
      principal,
      takenOn,
      dueDate,
      note: String(input.note ?? "").trim().slice(0, 300),
    },
  };
}

export async function getLoans(): Promise<LoanRecord[]> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return [];
    }

    await connectDB();
    const loans = await Loan.find({ userId }).sort({ createdAt: -1 }).lean();
    return loans.map(serialize);
  } catch (error) {
    console.error("Error fetching loans:", error);
    return [];
  }
}

export async function createLoan(input: LoanInput): Promise<LoanResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to add a loan" };
    }

    const parsed = parseLoanInput(input);
    if ("error" in parsed) return { error: parsed.error };

    await connectDB();
    const loan = await Loan.create({ userId, ...parsed.data });
    return { loan: serialize(loan.toObject()) };
  } catch (error) {
    console.error("Error creating loan:", error);
    return { error: "Failed to add loan" };
  }
}

export async function updateLoan(id: string, input: LoanInput): Promise<LoanResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to update a loan" };
    }

    const parsed = parseLoanInput(input);
    if ("error" in parsed) return { error: parsed.error };

    await connectDB();
    const existing = await Loan.findOne({ _id: id, userId }).lean();
    if (!existing) {
      return { error: "Loan not found or you don't have permission to update it" };
    }
    if ((parsed.data.principal as number) < paidSoFar(existing)) {
      return { error: "The loan amount can't be less than what you've already repaid" };
    }

    const loan = await Loan.findOneAndUpdate(
      { _id: id, userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    ).lean();

    return loan ? { loan: serialize(loan) } : { error: "Failed to update loan" };
  } catch (error) {
    console.error("Error updating loan:", error);
    return { error: "Failed to update loan" };
  }
}

export async function deleteLoan(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to delete a loan" };
    }

    await connectDB();
    const loan = await Loan.findOneAndDelete({ _id: id, userId });

    if (!loan) {
      return { error: "Loan not found or you don't have permission to delete it" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting loan:", error);
    return { error: "Failed to delete loan" };
  }
}

export async function addLoanPayment(
  loanId: string,
  input: PaymentInput
): Promise<LoanResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to record a payment" };
    }

    const amount = positive(input.amount);
    if (amount === null) return { error: "Enter a payment greater than zero" };

    const paidOn = parseDay(input.paidOn);
    if (!paidOn) return { error: "Enter a valid payment date" };

    await connectDB();
    const existing = await Loan.findOne({ _id: loanId, userId }).lean();
    if (!existing) {
      return { error: "Loan not found or you don't have permission to update it" };
    }

    const remaining = Math.round(((existing as any).principal - paidSoFar(existing)) * 100) / 100;
    if (amount > remaining) {
      return { error: `That's more than the ${remaining.toLocaleString()} still owed` };
    }

    const loan = await Loan.findOneAndUpdate(
      { _id: loanId, userId },
      {
        $push: {
          payments: {
            id: crypto.randomUUID(),
            amount,
            paidOn,
            note: String(input.note ?? "").trim().slice(0, 120),
          },
        },
      },
      { new: true, runValidators: true }
    ).lean();

    return loan ? { loan: serialize(loan) } : { error: "Failed to record payment" };
  } catch (error) {
    console.error("Error recording loan payment:", error);
    return { error: "Failed to record payment" };
  }
}

export async function removeLoanPayment(
  loanId: string,
  paymentId: string
): Promise<LoanResult> {
  try {
    const userId = await getUserId();
    if (!userId) {
      return { error: "You must be logged in to remove a payment" };
    }

    await connectDB();
    const loan = await Loan.findOneAndUpdate(
      { _id: loanId, userId },
      { $pull: { payments: { id: paymentId } } },
      { new: true }
    ).lean();

    return loan
      ? { loan: serialize(loan) }
      : { error: "Loan not found or you don't have permission to update it" };
  } catch (error) {
    console.error("Error removing loan payment:", error);
    return { error: "Failed to remove payment" };
  }
}
