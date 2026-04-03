"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { CATEGORY_CONFIG, CATEGORY_LABELS } from "@/lib/constants/expense";

interface RecentExpensesTableProps {
  expenses: Array<{
    _id: string;
    amount: number;
    category: string;
    description?: string;
    date: Date;
    paymentMethod: string;
  }>;
  hideHeaders?: boolean;
}

export function RecentExpensesTable({ expenses, hideHeaders }: RecentExpensesTableProps) {
  const content = (
    <div className={cn("px-5 pb-5", hideHeaders && "px-0 pb-0")}>
      <div className="space-y-1">
        {expenses.map((expense) => {
          const cfg = CATEGORY_CONFIG[expense.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.other;
          const Icon = cfg.icon;

            return (
              <div
                key={expense._id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-muted/60"
              >
                {/* Category icon */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    cfg.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", cfg.color)} strokeWidth={2} />
                </div>

                {/* Name + meta */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {expense.description || expense.category}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant="outline"
                      className={cn("h-4 px-1.5 text-[10px] font-semibold rounded border", cfg.badge)}
                    >
                      {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">
                      {formatDate(expense.date)}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="shrink-0 flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    <CurrencyDisplay amount={expense.amount} />
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-muted outline-none">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 text-sm">
                      <DropdownMenuItem className="cursor-pointer">Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive cursor-pointer">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
        })}

        {expenses.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No recent transactions
          </p>
        )}
      </div>
    </div>
  );

  if (hideHeaders) return content;

  return (
    <Card className="border border-border bg-white shadow-none rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-5 px-5">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">
            Recent Transactions
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">Latest activity</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium px-2"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {content}
      </CardContent>
    </Card>
  );
}
