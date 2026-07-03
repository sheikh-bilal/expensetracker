"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import {
  Bell,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
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
                  <CurrencyDisplay amount={sub.amount} /> due{" "}
                  {days === 0 ? "today" : `in ${days}d`}
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
                You&apos;ve spent <CurrencyDisplay amount={stats.monthlyExpenses} />{" "}
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
            <Bell className="h-4 w-4" strokeWidth={2} />
            {notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold leading-none text-danger-foreground ring-2 ring-background">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
        }
      />
      <PopoverContent
        align="end"
        className="w-80 rounded-xl p-0 shadow-lg ring-1 ring-foreground/5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <p className="text-[13px] font-semibold text-foreground">
            Notifications
          </p>
          {notifications.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-primary">
              {notifications.length} new
            </span>
          )}
        </div>

        {/* Body */}
        <div className="max-h-80 overflow-y-auto p-1">
          {loading ? (
            <div className="space-y-1 p-1">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2.5 px-4 py-10 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-foreground">
                  All caught up
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  No bills due or budget alerts right now.
                </p>
              </div>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {notifications.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        item.iconClassName,
                      )}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={2} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium leading-tight text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={2}
                    />
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
