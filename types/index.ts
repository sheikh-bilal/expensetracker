export type PaymentMethod = "card" | "bank" | "cash";

export type Category =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "health"
  | "education"
  | "pets"
  | "investment"
  | "travel"
  | "subscriptions"
  | "loan"
  | "gift"
  | "other";

export interface Expense {
  _id?: string;
  amount: number;
  category: Category;
  subCategory?: string;
  date: Date;
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardStats {
  accountBalance: number;
  monthlyExpenses: number;
  totalInvestment: number;
  goalProgress: number;
  goalTarget: number;
  monthlyExpensesTrend: number[];
}

export interface MonthlyExpense {
  month: string;
  amount: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  percentage: number;
}

export interface Subscription {
  _id?: string;
  name: string;
  amount: number;
  billingDate: Date;
  category: Category;
  isActive: boolean;
  createdAt?: Date;
}

export interface NavigationItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
