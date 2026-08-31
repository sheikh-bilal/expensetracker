"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MoreHorizontal, ArrowRight, Trash2, Inbox } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { CATEGORY_CONFIG, CATEGORY_LABELS } from "@/lib/constants/expense";
import { deleteExpense } from "@/actions/expenses";

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description?: string;
  date: Date;
  paymentMethod: string;
}

interface RecentExpensesTableProps {
  expenses: Expense[];
}

function groupLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 1 })) return "This week";
  return "Earlier";
}

function groupExpenses(expenses: Expense[]) {
  const order = ["Today", "Yesterday", "This week", "Earlier"];
  const groups = new Map<string, Expense[]>();

  for (const expense of expenses) {
    const label = groupLabel(new Date(expense.date));
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(expense);
  }

  return order
    .filter((label) => groups.has(label))
    .map((label) => ({ label, items: groups.get(label)! }));
}

export function RecentExpensesTable({ expenses }: RecentExpensesTableProps) {
  const router = useRouter();
  const { dialog, confirm, handleConfirm, handleCancel } = useConfirmDialog();

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete transaction?",
      description:
        "This will permanently remove this expense. This action cannot be undone.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteExpense(id);
      toast.success("Transaction deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete transaction");
    }
  }

  const groups = groupExpenses(expenses);

  return (
    <>
      <Card className="h-full gap-0 p-0">
        <CardHeader className="border-b !pb-4">
          <CardTitle className="text-sm font-semibold">
            Latest Activity
          </CardTitle>
          <CardDescription className="text-xs">
            Most recent transactions
          </CardDescription>
          <CardAction>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Link href="/expenses">
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="p-3">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <Inbox
                  className="h-5 w-5 text-muted-foreground/60"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                No recent transactions
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                    {group.label}
                  </p>
                  <div>
                    {group.items.map((expense) => {
                      const cfg =
                        CATEGORY_CONFIG[
                          expense.category as keyof typeof CATEGORY_CONFIG
                        ] || CATEGORY_CONFIG.other;
                      const Icon = cfg.icon;
                      const categoryLabel =
                        CATEGORY_LABELS[
                          expense.category as keyof typeof CATEGORY_LABELS
                        ] || expense.category;

                      return (
                        <div
                          key={expense._id}
                          className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-150 hover:bg-muted/60"
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              cfg.bg,
                            )}
                          >
                            <Icon
                              className={cn("h-4 w-4", cfg.color)}
                              strokeWidth={2}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                              {expense.description || categoryLabel}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {categoryLabel}
                              <span className="mx-1.5 text-muted-foreground/40">
                                ·
                              </span>
                              {format(new Date(expense.date), "MMM d")}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <span className="text-[13px] font-semibold tabular-nums text-foreground">
                              −<CurrencyDisplay amount={expense.amount} />
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 outline-none transition-opacity duration-150 hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100">
                                <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-40 text-sm"
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(expense._id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={dialog.open}
        onOpenChange={(open) => !open && handleCancel()}
        onConfirm={handleConfirm}
        {...dialog.config}
      />
    </>
  );
}
