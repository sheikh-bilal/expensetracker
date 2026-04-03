# ExpenseTrack

A full-stack personal finance management application built with **Next.js 16**, **TypeScript**, **MongoDB**, and **Tailwind CSS**. Track expenses, subscriptions, utility meters, and budgets — all scoped per user with secure authentication.

---

## Features

### Core
- **Authentication** — Secure signup/login with bcrypt password hashing and cookie-based sessions
- **Per-User Data Isolation** — All expenses, subscriptions, and meters are scoped to the authenticated user

### Dashboard
- Greeting with time-based message
- Monthly budget progress with daily allowance
- Stat cards: Monthly Budget, Monthly Spend, Investments, Savings Goal
- Cash flow bar chart (6 months)
- Category distribution donut chart with month selector
- Recent transactions table
- Upcoming subscriptions
- Monthly history (last 5 months expenses & savings)
- Top spending categories this month

### Expense Management
- Add expenses with category, payment method, date, and description
- Bill-type expenses with meter reading integration (electricity, water, gas)
- Filter by category, payment method, and date range
- Active filter count badge
- Delete with confirm dialog

### Subscriptions
- Track recurring payments with billing dates
- Status pills (Active / Due Soon / Overdue)
- Monthly and yearly cost summaries
- Dynamic avatar generation per service name

### Utility Meters
- Register electricity, water, and gas meters
- Log monthly readings with unit consumption tracking
- Reading history with year filter
- Consumption analysis cards

### Budget Tracker
- Monthly budget overview (spent / remaining / progress bar)
- Over-budget alert with red indicator
- Daily allowance calculation
- Per-category spending breakdown
- Savings goal progress tracker
- 6-month budget history bar chart with reference line

### Reports & Analytics
- Year selector with data across all recorded years
- Summary stats: Total Spent, Monthly Average, Peak Month, Transaction Count
- Full 12-month spending bar chart (peak month highlighted)
- Category donut chart for selected year
- Category breakdown list with percentages and progress bars

### Settings
- Default currency (PKR, USD, EUR, GBP, INR, AED, SAR)
- Monthly budget configuration
- Savings goal percentage
- Budget breakdown preview card (Total / Savings / Expenses)
- Data management (Export CSV, Clear All Data)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Base UI (`@base-ui/react`) + Radix UI primitives |
| Icons | Lucide React |
| Charts | Recharts |
| Database | MongoDB via Mongoose |
| Auth | bcryptjs + cookie-based sessions |
| Date Utilities | date-fns |

---

## Project Structure

```
expenseTracker/
├── app/
│   ├── dashboard/           # Overview page
│   ├── expenses/
│   │   ├── page.tsx         # Expenses list with filters
│   │   └── new/             # Add new expense form
│   ├── subscriptions/       # Subscription management
│   ├── meters/
│   │   ├── page.tsx         # Meters list
│   │   └── [id]/            # Meter detail & readings
│   ├── budgets/             # Budget tracking page
│   ├── reports/             # Analytics & spending reports
│   ├── settings/            # User settings
│   ├── login/
│   ├── signup/
│   └── layout.tsx           # Root layout with providers
│
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── dashboard-stats.tsx
│   │   ├── monthly-expenses-chart.tsx
│   │   ├── category-donut-chart.tsx
│   │   ├── category-chart-with-month-selector.tsx
│   │   ├── recent-expenses-table.tsx
│   │   └── subscriptions-list.tsx
│   ├── layout/
│   │   ├── sidebar.tsx      # Collapsible sidebar
│   │   └── header.tsx
│   └── ui/                  # Shared UI primitives
│       ├── select.tsx        # Base UI select with label fix
│       ├── currency-display.tsx
│       ├── confirm-dialog.tsx
│       └── ...
│
├── actions/                 # Next.js Server Actions
│   ├── auth.ts              # Login, signup, logout, getAuthUser
│   ├── expenses.ts          # Expense CRUD (userId-scoped)
│   ├── dashboard.ts         # Dashboard stats + subscriptions (userId-scoped)
│   ├── meters.ts            # Meter CRUD (userId-scoped)
│   ├── meterReadings.ts     # Meter reading CRUD
│   └── settings.ts          # User settings read/write
│
├── models/                  # Mongoose schemas
│   ├── User.ts              # User with embedded settings
│   ├── Expense.ts           # Expense with optional billDetails
│   ├── Subscription.ts      # Recurring payment
│   ├── Meter.ts             # Utility meter
│   └── MeterReading.ts      # Monthly meter reading
│
└── lib/
    ├── db.ts                # MongoDB connection helper
    ├── auth-utils.ts        # Session helpers (getUserId, requireAuth)
    ├── currency-context.tsx # Currency provider
    └── constants/
        ├── expense.ts       # Categories, payment methods, currencies, colors
        └── meter.ts         # Meter types and config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd expenseTracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the project root:
```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
# or for Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense-tracker
```

4. **Start the development server**
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and create an account.

---

## Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## Data Models

### User
```ts
{
  name: string
  email: string          // unique
  password: string       // bcrypt hashed
  settings: {
    currency: string     // PKR | USD | EUR | GBP | INR | AED | SAR
    monthlyBudget: number | null
    savingsGoal: number  // percentage, default 20
  }
}
```

### Expense
```ts
{
  userId: ObjectId       // ref: User
  amount: number
  category: string       // food | transport | shopping | entertainment | bills | health | education | pets | investment | other
  paymentMethod: string  // cash | card | upi | bank
  date: Date
  description?: string
  billDetails?: {
    billType: string     // electricity | water | gas | internet | other
    meterReadingId?: ObjectId
  }
}
```

### Subscription
```ts
{
  userId: ObjectId       // ref: User
  name: string
  amount: number
  billingDate: Date
  category: string       // entertainment | bills | education | other
  isActive: boolean
}
```

### Meter
```ts
{
  userId: ObjectId       // ref: User
  type: string           // electricity | water | gas
  name: string
  refNo: string          // unique per user
}
```

### MeterReading
```ts
{
  meterId: ObjectId      // ref: Meter
  month: string
  units: number
  reading: number
}
```

---

## License

MIT — free to use for personal or commercial projects.
