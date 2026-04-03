"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";

interface SubscriptionsListProps {
  subscriptions: Array<{
    _id: string;
    name: string;
    amount: number;
    billingDate: Date;
    category: string;
  }>;
  compact?: boolean;
}

const AVATAR_COLORS = [
  { bg: "bg-indigo-50", color: "text-indigo-600" },
  { bg: "bg-violet-50", color: "text-violet-600" },
  { bg: "bg-sky-50", color: "text-sky-600" },
  { bg: "bg-amber-50", color: "text-amber-600" },
  { bg: "bg-rose-50", color: "text-rose-600" },
  { bg: "bg-emerald-50", color: "text-emerald-600" },
  { bg: "bg-teal-50", color: "text-teal-600" },
  { bg: "bg-orange-50", color: "text-orange-600" },
];

function getAvatarConfig(name: string): { bg: string; color: string; initial: string } {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = AVATAR_COLORS[hash % AVATAR_COLORS.length];
  const words = name.trim().split(/\s+/);
  const initial = words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return { ...palette, initial };
}

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function SubscriptionsList({ subscriptions, compact }: SubscriptionsListProps) {
  const content = (
    <div className={cn("px-5 pb-5", compact && "px-0 pb-0")}>
      <div className="space-y-1">
        {subscriptions.map((sub) => {
          const cfg = getAvatarConfig(sub.name);
            const daysUntil = getDaysUntil(new Date(sub.billingDate));
            const billingLabel =
              daysUntil === 0
                ? "Due today"
                : daysUntil < 0
                ? `${Math.abs(daysUntil)}d ago`
                : `in ${daysUntil}d`;
            const isUrgent = daysUntil >= 0 && daysUntil <= 3;

            return (
              <div
                key={sub._id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-muted/60"
              >
                {/* Logo / initial */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                    cfg.bg,
                    cfg.color
                  )}
                >
                  {cfg.initial}
                </div>

                {/* Name + billing */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {sub.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        "text-[11px]",
                        isUrgent ? "text-orange-500 font-medium" : "text-muted-foreground"
                      )}
                    >
                      {billingLabel}
                    </span>
                  </div>
                </div>

                {/* Amount + menu */}
                <div className="shrink-0 flex items-center gap-1">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      <CurrencyDisplay amount={sub.amount} />
                    </p>
                    <p className="text-[10px] text-muted-foreground">/mo</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-muted outline-none">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 text-sm">
                      <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive cursor-pointer">
                        Cancel subscription
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}

          {subscriptions.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No active subscriptions
            </p>
          )}
        </div>
      </div>
  );

  if (compact) return content;

  return (
    <Card className="border border-border bg-white shadow-none rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">
            Active Subscriptions
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {subscriptions.length} recurring
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium px-2"
        >
          Manage
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}
