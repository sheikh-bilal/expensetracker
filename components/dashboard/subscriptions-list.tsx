"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  ArrowRight,
  RotateCw,
  Ban,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import { deleteSubscription, renewSubscription } from "@/actions/dashboard";

interface Subscription {
  _id: string;
  name: string;
  amount: number;
  billingDate: Date;
  category: string;
}

interface SubscriptionsListProps {
  subscriptions: Subscription[];
  /** How many rows to show on the dashboard card. */
  limit?: number;
}

const AVATAR_COLORS = [
  "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
];

function getAvatar(name: string): { classes: string; initial: string } {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const words = name.trim().split(/\s+/);
  const initial =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  return { classes: AVATAR_COLORS[hash % AVATAR_COLORS.length], initial };
}

function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function DueChip({ daysUntil }: { daysUntil: number }) {
  const overdue = daysUntil < 0;
  const urgent = daysUntil >= 0 && daysUntil <= 3;
  const label =
    daysUntil === 0
      ? "Due today"
      : overdue
        ? `${Math.abs(daysUntil)}d overdue`
        : `Due in ${daysUntil}d`;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-semibold",
        overdue
          ? "bg-danger/10 text-danger"
          : urgent
            ? "bg-warning/10 text-warning"
            : "bg-muted text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

export function SubscriptionsList({
  subscriptions,
  limit,
}: SubscriptionsListProps) {
  const router = useRouter();
  const { dialog, confirm, handleConfirm, handleCancel } = useConfirmDialog();

  const visible = limit ? subscriptions.slice(0, limit) : subscriptions;
  const monthlyTotal = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  async function handleRenew(id: string, name: string) {
    try {
      await renewSubscription(id);
      toast.success(`${name} renewed for next month`);
      router.refresh();
    } catch {
      toast.error("Failed to renew subscription");
    }
  }

  async function handleCancelSubscription(id: string, name: string) {
    const confirmed = await confirm({
      title: "Cancel subscription?",
      description: `${name} will be removed from your active subscriptions.`,
      confirmText: "Cancel subscription",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteSubscription(id);
      toast.success("Subscription cancelled");
      router.refresh();
    } catch {
      toast.error("Failed to cancel subscription");
    }
  }

  return (
    <>
      <Card className="h-full gap-0 p-0">
        <CardHeader className="border-b !pb-4">
          <CardTitle className="text-sm font-semibold">
            Upcoming Bills
          </CardTitle>
          <CardDescription className="text-xs">
            {subscriptions.length} active subscription
            {subscriptions.length === 1 ? "" : "s"}
          </CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
              render={<Link href="/subscriptions" />}
            >
              Manage
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="flex-1 p-3">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <CalendarClock
                  className="h-5 w-5 text-muted-foreground/60"
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                No active subscriptions
              </p>
            </div>
          ) : (
            <div>
              {visible.map((sub) => {
                const avatar = getAvatar(sub.name);
                const daysUntil = getDaysUntil(new Date(sub.billingDate));

                return (
                  <div
                    key={sub._id}
                    className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-150 hover:bg-muted/60"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold",
                        avatar.classes,
                      )}
                    >
                      {avatar.initial}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                        {sub.name}
                      </p>
                      <div className="mt-1">
                        <DueChip daysUntil={daysUntil} />
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <p className="text-[13px] font-semibold tabular-nums text-foreground">
                        <CurrencyDisplay amount={sub.amount} />
                        <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
                          /mo
                        </span>
                      </p>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 outline-none transition-opacity duration-150 hover:bg-muted focus-visible:opacity-100 group-hover:opacity-100">
                          <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 text-sm"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={() => handleRenew(sub._id, sub.name)}
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                            Renew now
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                            onClick={() =>
                              handleCancelSubscription(sub._id, sub.name)
                            }
                          >
                            <Ban className="h-3.5 w-3.5" />
                            Cancel subscription
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {subscriptions.length > 0 && (
          <CardFooter className="!py-3">
            <div className="flex w-full items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">
                Monthly recurring
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                <CurrencyDisplay amount={monthlyTotal} />
                <span className="ml-0.5 font-normal text-muted-foreground">
                  /mo
                </span>
              </span>
            </div>
          </CardFooter>
        )}
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
