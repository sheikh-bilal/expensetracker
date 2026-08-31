// Web (page) routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  EXPENSES: "/expenses",
  EXPENSES_NEW: "/expenses/new",
  BUDGETS: "/budgets",
  SUBSCRIPTIONS: "/subscriptions",
  REPORTS: "/reports",
  METERS: "/meters",
  METER_DETAIL: (id: string) => `/meters/${id}`,
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

// Routes accessible without an authenticated session (see middleware.ts)
export const PUBLIC_ROUTES: string[] = [ROUTES.LOGIN, ROUTES.SIGNUP];

// API routes
export const API_ROUTES = {
  AUTH_USER: "/api/auth/user",
  AUTH_LOGOUT: "/api/auth/logout",
  SEED: "/api/seed",
} as const;
