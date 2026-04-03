"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const defaultCurrency = "PKR";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState(defaultCurrency);

  useEffect(() => {
    // Load currency from localStorage on mount
    const saved = localStorage.getItem("userCurrency");
    if (saved) {
      setCurrencyState(saved);
    }

    // Listen for currency changes from other components
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrencyState(event.detail);
    };

    window.addEventListener("currencyChanged", handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener("currencyChanged", handleCurrencyChange as EventListener);
    };
  }, []);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem("userCurrency", newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
