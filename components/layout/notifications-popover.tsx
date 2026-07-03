"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { Bell, AlertTriangle, CalendarClock, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import { getSubscriptions, getDashboardStats } from "@/actions/dashboard";

type Notification = {
  id: string;
  icon: React.ElementType;
  iconClassName: string;
  title: string;
  description: React.ReactNode;
  href: string;
};

export function NotificationsPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [subscriptions, stats] = await Promise.all([
          getSubscriptions(),
          getDashboardStats(),
        ]);
        if (!active) return;

        const items: Notification[] = [];

        for (const sub of subscriptions as {
          _id: string;
          name: string;
          amount: number;
          billingDate: string | Date;
        }[]) {
          const days = differenceInCalendarDays(
            new Date(sub.billingDate),
            new Date(),
          );
          if (days >= 0 && days <= 3) {
            items.push({
              id: `sub-${sub._id}`,
              icon: CalendarClock,
              iconClassName: "bg-info/10 text-info",
              title: `${sub.name} renews soon`,
              description: (
                <>
                  <CurrencyDisplay amount={sub.amount} /> due in{" "}
                  {days === 0 ? "today" : `${days}d`}
                </>
              ),
              href: "/subscriptions",
            });
          }
        }

        if (
          stats.monthlyBudget > 0 &&
          stats.monthlyExpenses > stats.monthlyBudget
        ) {
          items.push({
            id: "over-budget",
            icon: AlertTriangle,
            iconClassName: "bg-danger/10 text-danger",
            title: "Over monthly budget",
            description: (
              <>
                You've spent <CurrencyDisplay amount={stats.monthlyExpenses} />{" "}
                of <CurrencyDisplay amount={stats.monthlyBudget} />
              </>
            ),
            href: "/budgets",
          });
        }

        setNotifications(items);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            className="relative h-9 w-9 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute right-[9px] top-[9px] h-2 w-2 rounded-full border-2 border-background bg-danger" />
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          {notifications.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {notifications.length} new
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <p className="text-sm text-muted-foreground">
                You&apos;re all caught up.
              </p>
            </div>
          ) : (
            <ul>
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/60"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        item.iconClassName,
                      )}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
