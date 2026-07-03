import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/lib/constants/expense";
import {
  CreditCard,
  Landmark,
  Banknote,
  Wallet2,
} from "lucide-react";

const PAYMENT_METHOD_ICONS: Record<PaymentMethod, React.ElementType> = {
  card: CreditCard,
  bank: Landmark,
  cash: Banknote,
};

// Fixed assignment — color follows the method, never its rank
const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  card: "var(--pay-card)",
  bank: "var(--pay-bank)",
  cash: "var(--pay-cash)",
};

interface PaymentMethodBreakdownProps {
  data: Array<{ method: string; amount: number }>;
}

export function PaymentMethodBreakdown({ data }: PaymentMethodBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  const sorted = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <Card className="h-full gap-0 p-0">
      <CardHeader className="border-b !pb-4">
        <CardTitle className="text-sm font-semibold">Payment Mix</CardTitle>
        <CardDescription className="text-xs">
          How this month was paid
        </CardDescription>
      </CardHeader>

      <CardContent className="py-5">
        {sorted.length === 0 || total === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Wallet2
              className="h-6 w-6 text-muted-foreground/50"
              strokeWidth={1.5}
            />
            <p className="text-sm text-muted-foreground">
              No spending this month
            </p>
          </div>
        ) : (
          <>
            {/* One proportional bar, segments separated by 2px surface gaps */}
            <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
              {sorted.map(({ method, amount }) => (
                <div
                  key={method}
                  className="h-full min-w-[6px] first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${(amount / total) * 100}%`,
                    backgroundColor:
                      PAYMENT_METHOD_COLORS[method as PaymentMethod] ??
                      "hsl(var(--muted-foreground))",
                  }}
                />
              ))}
            </div>

            {/* Legend — the identity channel */}
            <div className="mt-5 space-y-1">
              {sorted.map(({ method, amount }) => {
                const Icon =
                  PAYMENT_METHOD_ICONS[method as PaymentMethod] ?? Wallet2;
                const label =
                  PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method;
                const pct = (amount / total) * 100;
                return (
                  <div
                    key={method}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          PAYMENT_METHOD_COLORS[method as PaymentMethod] ??
                          "hsl(var(--muted-foreground))",
                      }}
                      aria-hidden
                    />
                    <Icon
                      className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                      strokeWidth={2}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">
                      {label}
                    </span>
                    <span className="text-[13px] font-semibold tabular-nums text-foreground">
                      <CurrencyDisplay amount={amount} />
                    </span>
                    <span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
