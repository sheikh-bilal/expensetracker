"use client";

import { useCurrency } from "@/lib/currency-context";
import { useEffect, useState } from "react";
import { CURRENCY_SYMBOLS, CURRENCY_LOCALES } from "@/lib/constants/expense";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  const { currency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{amount.toLocaleString()}₨</span>;
  }

  const symbol = CURRENCY_SYMBOLS[currency as keyof typeof CURRENCY_SYMBOLS] || CURRENCY_SYMBOLS.PKR;
  const locale = CURRENCY_LOCALES[currency as keyof typeof CURRENCY_LOCALES] || "en-PK";

  return (
    <span className={className}>
      {new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)}
      {"\u00A0"}
      {symbol}
    </span>
  );
}
