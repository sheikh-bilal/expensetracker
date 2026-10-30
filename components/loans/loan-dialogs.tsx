"use client";

import { useEffect, useState, type FormEvent } from "react";
import { HandCoins, Loader2, Wallet } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { loanProgress, todayInputValue } from "@/lib/utils/loan";
import type { LoanInput, LoanRecord, PaymentInput } from "@/actions/loans";

/** Both dialogs resolve to an error message, or null when the save succeeded. */
type Submit<T> = (input: T) => Promise<string | null>;

const sanitizeAmount = (value: string) => value.replace(/[^\d.,]/g, "");
const parseAmount = (value: string) => parseFloat(value.replace(/,/g, "")) || 0;

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
    </div>
  );
}

export function LoanFormDialog({
  open,
  onOpenChange,
  loan,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set the dialog edits this loan; otherwise it creates one. */
  loan: LoanRecord | null;
  onSubmit: Submit<LoanInput>;
}) {
  const [lender, setLender] = useState("");
  const [purpose, setPurpose] = useState("");
  const [principal, setPrincipal] = useState("");
  const [takenOn, setTakenOn] = useState(todayInputValue());
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLender(loan?.lender ?? "");
    setPurpose(loan?.purpose ?? "");
    setPrincipal(loan ? String(loan.principal) : "");
    setTakenOn(loan?.takenOn ?? todayInputValue());
    setDueDate(loan?.dueDate ?? "");
    setNote(loan?.note ?? "");
    setError(null);
  }, [open, loan]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const message = await onSubmit({
      lender,
      purpose,
      principal: parseAmount(principal),
      takenOn,
      dueDate: dueDate || null,
      note,
    });
    setSaving(false);
    if (message) setError(message);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-base font-semibold">
            <div className="hero-panel flex h-9 w-9 items-center justify-center rounded-xl text-white ring-1 ring-white/10">
              <HandCoins className="h-4 w-4" strokeWidth={2} />
            </div>
            {loan ? "Edit loan" : "Record a loan"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {loan
              ? "Update the details. Your repayments are kept."
              : "Note who lent you money and what it was for."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="loan-lender" label="Borrowed from">
              <Input
                id="loan-lender"
                value={lender}
                onChange={(e) => setLender(e.target.value)}
                placeholder="e.g. Ali, HBL Bank"
                maxLength={80}
                required
                autoFocus
                className="h-10 rounded-lg"
              />
            </Field>
            <Field id="loan-amount" label="Amount">
              <Input
                id="loan-amount"
                inputMode="decimal"
                value={principal}
                onChange={(e) => setPrincipal(sanitizeAmount(e.target.value))}
                placeholder="0"
                required
                className="h-10 rounded-lg tabular-nums"
              />
            </Field>
          </div>

          <Field id="loan-purpose" label="What it was for" hint="(optional)">
            <Input
              id="loan-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Laptop, rent, medical bill"
              maxLength={120}
              className="h-10 rounded-lg"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="loan-taken" label="Taken on">
              <Input
                id="loan-taken"
                type="date"
                value={takenOn}
                onChange={(e) => setTakenOn(e.target.value)}
                required
                className="h-10 rounded-lg"
              />
            </Field>
            <Field id="loan-due" label="Pay back by" hint="(optional)">
              <Input
                id="loan-due"
                type="date"
                value={dueDate}
                min={takenOn}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-10 rounded-lg"
              />
            </Field>
          </div>

          <Field id="loan-note" label="Note" hint="(optional)">
            <Input
              id="loan-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Agreed terms, reminders…"
              maxLength={300}
              className="h-10 rounded-lg"
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="submit"
              disabled={saving}
              className="h-10 w-full rounded-lg text-sm font-semibold"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : loan ? (
                "Save changes"
              ) : (
                "Add loan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PaymentDialog({
  open,
  onOpenChange,
  loan,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: LoanRecord | null;
  onSubmit: Submit<PaymentInput>;
}) {
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(todayInputValue());
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = loan ? loanProgress(loan).remaining : 0;
  const entered = parseAmount(amount);
  const after = Math.max(Math.round((remaining - entered) * 100) / 100, 0);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setPaidOn(todayInputValue());
    setNote("");
    setError(null);
  }, [open, loan?._id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const message = await onSubmit({ amount: entered, paidOn, note });
    setSaving(false);
    if (message) setError(message);
  }

  const quick = [
    { label: "25%", value: remaining * 0.25 },
    { label: "Half", value: remaining * 0.5 },
    { label: "Full balance", value: remaining },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-base font-semibold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
              <Wallet className="h-4 w-4" strokeWidth={2} />
            </div>
            Record a payment
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {loan && (
              <>
                Paying back <span className="font-medium text-foreground">{loan.lender}</span>
                {" · "}
                <CurrencyDisplay amount={remaining} /> left
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field id="pay-amount" label="Amount paid">
            <Input
              id="pay-amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
              placeholder="0"
              required
              autoFocus
              className="h-11 rounded-lg text-lg font-semibold tabular-nums"
            />
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {quick.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setAmount(String(Math.round(q.value * 100) / 100))}
                  className="rounded-full border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pay-date" label="Paid on">
              <Input
                id="pay-date"
                type="date"
                value={paidOn}
                onChange={(e) => setPaidOn(e.target.value)}
                required
                className="h-10 rounded-lg"
              />
            </Field>
            <Field id="pay-note" label="Note" hint="(optional)">
              <Input
                id="pay-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Cash, transfer"
                maxLength={120}
                className="h-10 rounded-lg"
              />
            </Field>
          </div>

          {entered > 0 && entered <= remaining && (
            <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              {after === 0 ? (
                <span className="font-semibold text-success">This clears the loan 🎉</span>
              ) : (
                <>
                  Balance after this payment:{" "}
                  <span className="font-semibold text-foreground">
                    <CurrencyDisplay amount={after} />
                  </span>
                </>
              )}
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <DialogFooter className="pt-1">
            <Button
              type="submit"
              disabled={saving || entered <= 0}
              className="h-10 w-full rounded-lg text-sm font-semibold"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Record payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
