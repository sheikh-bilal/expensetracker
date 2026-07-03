import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CURRENCY_SYMBOLS } from "@/lib/constants/expense"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number,
  currency: string = "PKR"
): string {
  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || CURRENCY_SYMBOLS.PKR;

  return new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + symbol;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatMonthYear(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Percent change between the last two values of a chronological series. */
export function trendFrom(values: number[]): { value: number; isPositive: boolean | null } | undefined {
  if (values.length < 2) return undefined;
  const previous = values[values.length - 2];
  const current = values[values.length - 1];
  if (previous === 0 && current === 0) return { value: 0, isPositive: null };
  if (previous === 0) return { value: 100, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.round(Math.abs(change) * 10) / 10, isPositive: change === 0 ? null : change > 0 };
}
