import {
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Tv,
  Zap,
  HeartPulse,
  BookOpen,
  PawPrint,
  TrendingUp,
  MoreHorizontal,
  Plane,
  Bell,
  Landmark,
  Gift,
  type LucideIcon,
} from "lucide-react";

// Expense Categories
export const EXPENSE_CATEGORIES = [
  "food",
  "transport",
  "shopping",
  "entertainment",
  "bills",
  "health",
  "education",
  "pets",
  "investment",
  "travel",
  "subscriptions",
  "loan",
  "gift",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  bills: "Bills",
  health: "Health",
  education: "Education",
  pets: "Pets",
  investment: "Investment",
  travel: "Travel",
  subscriptions: "Subscriptions",
  loan: "Loan",
  gift: "Gift",
  other: "Other",
};

// Category UI Configuration
export const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { icon: LucideIcon; bg: string; color: string; badge: string }
> = {
  food: {
    icon: UtensilsCrossed,
    bg: "bg-emerald-50",
    color: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  transport: {
    icon: Car,
    bg: "bg-sky-50",
    color: "text-sky-600",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
  },
  shopping: {
    icon: ShoppingBag,
    bg: "bg-amber-50",
    color: "text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  entertainment: {
    icon: Tv,
    bg: "bg-violet-50",
    color: "text-violet-600",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
  },
  bills: {
    icon: Zap,
    bg: "bg-rose-50",
    color: "text-rose-600",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
  health: {
    icon: HeartPulse,
    bg: "bg-pink-50",
    color: "text-pink-600",
    badge: "bg-pink-100 text-pink-700 border-pink-200",
  },
  education: {
    icon: BookOpen,
    bg: "bg-teal-50",
    color: "text-teal-600",
    badge: "bg-teal-100 text-teal-700 border-teal-200",
  },
  pets: {
    icon: PawPrint,
    bg: "bg-orange-50",
    color: "text-orange-600",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
  },
  investment: {
    icon: TrendingUp,
    bg: "bg-blue-50",
    color: "text-blue-600",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  travel: {
    icon: Plane,
    bg: "bg-cyan-50",
    color: "text-cyan-600",
    badge: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  subscriptions: {
    icon: Bell,
    bg: "bg-purple-50",
    color: "text-purple-600",
    badge: "bg-purple-100 text-purple-700 border-purple-200",
  },
  loan: {
    icon: Landmark,
    bg: "bg-red-50",
    color: "text-red-600",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  gift: {
    icon: Gift,
    bg: "bg-fuchsia-50",
    color: "text-fuchsia-600",
    badge: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  },
  other: {
    icon: MoreHorizontal,
    bg: "bg-slate-50",
    color: "text-slate-600",
    badge: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

// Payment Methods
export const PAYMENT_METHODS = ["upi", "card", "bank", "cash"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  upi: "UPI",
  card: "Card",
  bank: "Bank Transfer",
  cash: "Cash",
};

// Bill Departments
export const BILL_DEPARTMENTS = [
  "WAPDA",
  "WASA",
  "SUI GAS",
  "INTERNET",
] as const;

export type BillDepartment = (typeof BILL_DEPARTMENTS)[number];

export const BILL_DEPARTMENT_LABELS: Record<BillDepartment, string> = {
  WAPDA: "Wapda (Electricity)",
  WASA: "WASA (Water)",
  "SUI GAS": "SUI GAS",
  INTERNET: "Internet Service",
};

// Bill Types (for expense bills)
export const BILL_TYPES = [
  "electricity",
  "water",
  "gas",
  "internet",
  "other",
] as const;

export type BillType = (typeof BILL_TYPES)[number];

export const BILL_TYPE_LABELS: Record<BillType, string> = {
  electricity: "Electricity",
  water: "Water",
  gas: "Gas",
  internet: "Internet",
  other: "Other",
};

// Months
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type Month = (typeof MONTHS)[number];

// Currencies
export const CURRENCIES = [
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨", flag: "🇵🇰" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "AED", name: "UAE Dirham", symbol: "dh", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼", flag: "🇸🇦" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

// Category Colors for Charts
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  food: "#4f46e5",
  transport: "#0ea5e9",
  shopping: "#f59e0b",
  entertainment: "#8b5cf6",
  bills: "#ef4444",
  health: "#ec4899",
  education: "#14b8a6",
  pets: "#fb923c",
  investment: "#a855f7",
  travel: "#06b6d4",
  subscriptions: "#7c3aed",
  loan: "#dc2626",
  gift: "#d946ef",
  other: "#94a3b8",
};

// Currency Symbols
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  PKR: "₨",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AED: "dh",
  SAR: "﷼",
};

// Currency Locales for Number Formatting
export const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  PKR: "en-PK",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  INR: "en-IN",
  AED: "ar-AE",
  SAR: "ar-SA",
};
