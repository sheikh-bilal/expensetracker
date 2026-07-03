"use client";

import { useState, useEffect, useMemo } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  CalendarDays,
  CalendarClock,
  Wallet,
  Layers,
} from "lucide-react";
import {
  getSubscriptions,
  createSubscription,
  deleteSubscription,
  renewSubscription,
} from "@/actions/dashboard";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";

type SubscriptionRecord = {
  _id: string;
  name: string;
  amount: number;
  billingDate: string | Date;
  category: string;
  isActive: boolean;
};

const ITEMS_PER_PAGE = 8;

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "entertainment", label: "Entertainment" },
  { value: "bills", label: "Bills" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health" },
  { value: "storage", label: "Cloud Storage" },
  { value: "other", label: "Other" },
];

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

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const {
    dialog: deleteDialog,
    confirm: confirmDelete,
    handleConfirm: handleDeleteConfirm,
    handleCancel: handleDeleteCancel,
  } = useConfirmDialog();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    setLoading(true);
    const data = await getSubscriptions();
    setSubscriptions(data);
    setLoading(false);
  }

  async function handleRenewSubscription(id: string) {
    setRenewingId(id);
    await renewSubscription(id);
    setRenewingId(null);
    loadSubscriptions();
  }

  async function handleDeleteSubscription(id: string, name: string) {
    const confirmed = await confirmDelete({
      title: `Delete "${name}"?`,
      description: "This subscription will be permanently removed.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (confirmed) {
      await deleteSubscription(id);
      loadSubscriptions();
    }
  }

  async function handleAddSubscription(formData: FormData) {
    await createSubscription(formData);
    setIsAddDialogOpen(false);
    setFormCategory("");
    loadSubscriptions();
  }

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      const matchCat =
        selectedCategory === "all" || s.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [subscriptions, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    const upcoming = subscriptions
      .map((s) => ({ ...s, daysUntil: getDaysUntil(new Date(s.billingDate)) }))
      .filter((s) => s.daysUntil >= 0)
      .sort((a, b) => a.daysUntil - b.daysUntil)[0];
    return {
      totalMonthly,
      totalYearly: totalMonthly * 12,
      activeCount: subscriptions.length,
      upcoming,
    };
  }, [subscriptions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const statTiles = [
    {
      label: "Monthly total",
      icon: CalendarDays,
      value: <CurrencyDisplay amount={stats.totalMonthly} />,
      sub: "recurring each month",
    },
    {
      label: "Yearly total",
      icon: Wallet,
      value: <CurrencyDisplay amount={stats.totalYearly} />,
      sub: "projected over 12 months",
    },
    {
      label: "Active services",
      icon: Layers,
      value: <span>{stats.activeCount}</span>,
      sub: "subscriptions running",
    },
    {
      label: "Next bill",
      icon: CalendarClock,
      value: stats.upcoming ? (
        <CurrencyDisplay amount={stats.upcoming.amount} />
      ) : (
        <span>—</span>
      ),
      sub: stats.upcoming
        ? `${stats.upcoming.name} · ${
            stats.upcoming.daysUntil === 0
              ? "due today"
              : `in ${stats.upcoming.daysUntil}d`
          }`
        : "nothing upcoming",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Recurring
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Subscriptions
          </h1>
        </div>
        <Button
          className="h-9 gap-1.5 rounded-lg text-sm font-semibold shadow-md"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Subscription
        </Button>
      </div>

      {/* Stat tiles */}
      <Card className="gap-0 [--card-spacing:0px] animate-fade-in">
        <CardContent className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border/60 p-0 lg:grid-cols-4">
          {statTiles.map(({ label, icon: Icon, value, sub }) => (
            <div key={label} className="flex flex-col gap-3 bg-card p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 truncate text-lg font-semibold tabular-nums text-foreground">
                  {value}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Table card */}
      <Card className="flex flex-col gap-0 overflow-hidden p-0 animate-fade-in">
        {/* Filters bar */}
        <div className="flex flex-col gap-3 border-b bg-muted/30 p-4 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions..."
              className="h-9 w-full rounded-lg bg-card pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v || "all")}
            >
              <SelectTrigger className="h-9 w-[150px] rounded-lg bg-card text-sm">
                <SelectValue>
                  {(value) =>
                    CATEGORIES.find((c) => c.value === value)?.label ??
                    "All Categories"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-sm">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 rounded-lg px-3 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                No subscriptions found
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first subscription to get started"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/40 hover:bg-muted/40">
                    <TableHead className="h-11 py-0 pl-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Service
                    </TableHead>
                    <TableHead className="h-11 py-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="h-11 py-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Billing
                    </TableHead>
                    <TableHead className="h-11 py-0 pr-6 text-right text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-11 w-20 py-0" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((sub) => {
                    const avatar = getAvatar(sub.name);
                    const nextBilling = new Date(sub.billingDate);
                    const daysUntil = getDaysUntil(nextBilling);
                    const isPastDue = daysUntil < 0;
                    const isUrgent = !isPastDue && daysUntil <= 3;
                    const categoryLabel =
                      CATEGORIES.find((c) => c.value === sub.category)?.label ??
                      sub.category;

                    return (
                      <TableRow
                        key={sub._id}
                        className="group border-b transition-colors hover:bg-muted/40"
                      >
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold",
                                avatar.classes,
                              )}
                            >
                              {avatar.initial}
                            </div>
                            <p className="text-[13px] font-medium leading-tight text-foreground">
                              {sub.name}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium text-foreground">
                            {categoryLabel}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <p className="text-[13px] text-muted-foreground">
                            {nextBilling.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <span
                            className={cn(
                              "mt-1 inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-semibold",
                              isPastDue
                                ? "bg-danger/10 text-danger"
                                : isUrgent
                                  ? "bg-warning/10 text-warning"
                                  : "bg-success/10 text-success",
                            )}
                          >
                            {isPastDue
                              ? `${Math.abs(daysUntil)}d overdue`
                              : daysUntil === 0
                                ? "Due today"
                                : isUrgent
                                  ? `Due in ${daysUntil}d`
                                  : "Active"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 pr-6 text-right">
                          <span className="text-[13px] font-semibold tabular-nums text-foreground">
                            <CurrencyDisplay amount={sub.amount} />
                            <span className="ml-0.5 text-[11px] font-normal text-muted-foreground">
                              /mo
                            </span>
                          </span>
                        </TableCell>

                        <TableCell className="w-20 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            {isPastDue && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Renew to next month"
                                className="h-8 w-8 rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-success/10 hover:text-success focus-visible:opacity-100 group-hover:opacity-100"
                                disabled={renewingId === sub._id}
                                onClick={() => handleRenewSubscription(sub._id)}
                              >
                                <RefreshCw
                                  className={cn(
                                    "h-4 w-4",
                                    renewingId === sub._id && "animate-spin",
                                  )}
                                />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
                              onClick={() =>
                                handleDeleteSubscription(sub._id, sub.name)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filtered.length}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - currentPage) <= 1,
                  )
                  .map((p, idx, arr) => (
                    <div key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-xs text-muted-foreground">
                          …
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded-lg text-xs font-semibold",
                          p === currentPage
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    </div>
                  ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Add Subscription Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setFormCategory("");
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              Add Subscription
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter the details of your recurring payment.
            </DialogDescription>
          </DialogHeader>
          <form action={handleAddSubscription} className="space-y-4 pt-1">
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-xs font-medium">
                  Service name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Netflix, Spotify"
                  required
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="amount" className="text-xs font-medium">
                  Monthly amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                  className="h-10 rounded-lg tabular-nums"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="billingDate" className="text-xs font-medium">
                  Next billing date
                </Label>
                <Input
                  id="billingDate"
                  name="billingDate"
                  type="date"
                  required
                  className="h-10 rounded-lg"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category" className="text-xs font-medium">
                  Category
                </Label>
                <Select
                  name="category"
                  required
                  value={formCategory}
                  onValueChange={(v) => setFormCategory(v ?? "")}
                >
                  <SelectTrigger
                    id="category"
                    className="h-10 w-full rounded-lg"
                  >
                    <SelectValue placeholder="Select category">
                      {(value) =>
                        CATEGORIES.find((c) => c.value === value)?.label ??
                        "Select category"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="h-10 w-full rounded-lg text-sm font-semibold shadow-md"
              >
                Save Subscription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
        onConfirm={handleDeleteConfirm}
        {...deleteDialog.config}
      />
    </div>
  );
}
