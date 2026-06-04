"use client";

import { useState, useEffect, useMemo } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Wallet,
} from "lucide-react";
import {
  getSubscriptions,
  createSubscription,
  deleteSubscription,
  renewSubscription,
} from "@/actions/dashboard";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { cn } from "@/lib/utils";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";

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

const CATEGORY_BADGE: Record<string, string> = {
  entertainment: "bg-violet-100 text-violet-700 border-violet-200",
  bills: "bg-rose-100 text-rose-700 border-rose-200",
  education: "bg-teal-100 text-teal-700 border-teal-200",
  health: "bg-pink-100 text-pink-700 border-pink-200",
  storage: "bg-blue-100 text-blue-700 border-blue-200",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

const AVATAR_COLORS = [
  { bg: "bg-indigo-50", color: "text-indigo-600" },
  { bg: "bg-violet-50", color: "text-violet-600" },
  { bg: "bg-sky-50", color: "text-sky-600" },
  { bg: "bg-amber-50", color: "text-amber-600" },
  { bg: "bg-rose-50", color: "text-rose-600" },
  { bg: "bg-emerald-50", color: "text-emerald-600" },
  { bg: "bg-teal-50", color: "text-teal-600" },
  { bg: "bg-orange-50", color: "text-orange-600" },
  { bg: "bg-pink-50", color: "text-pink-600" },
  { bg: "bg-cyan-50", color: "text-cyan-600" },
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

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const { dialog: deleteDialog, confirm: confirmDelete, handleConfirm: handleDeleteConfirm, handleCancel: handleDeleteCancel } = useConfirmDialog();

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
      const matchCat = selectedCategory === "all" || s.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [subscriptions, searchQuery, selectedCategory]);

  const stats = useMemo(() => {
    const totalMonthly = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    return {
      totalMonthly,
      totalYearly: totalMonthly * 12,
      activeCount: subscriptions.length,
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

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
            Subscriptions
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Manage your recurring payments and bills
          </p>
        </div>
        <Button
          className="h-9 gap-1.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition-all"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          New Subscription
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        <StatCard
          title="Monthly Total"
          value={<CurrencyDisplay amount={stats.totalMonthly} className="text-3xl font-black text-foreground" />}
          icon={CalendarDays}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          trend={{ value: 3.2, isPositive: false }}
        />
        <StatCard
          title="Yearly Total"
          value={<CurrencyDisplay amount={stats.totalYearly} className="text-3xl font-black text-foreground" />}
          icon={Wallet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: 3.2, isPositive: false }}
        />
        <StatCard
          title="Active Services"
          value={<span className="text-3xl font-black text-foreground">{stats.activeCount}</span>}
          icon={CreditCard}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          trend={{ value: 1, isPositive: true }}
        />
      </div>

      {/* Table with Filters */}
      <div className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        {/* Filters Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center p-4 border-b border-border/50 bg-muted/20">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" />
            <Input
              placeholder="Search subscriptions..."
              className="h-9 w-full pl-9 text-sm bg-muted/60 border-transparent hover:bg-muted/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-lg shadow-sm transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v || "all")}>
              <SelectTrigger className="h-9 w-[140px] sm:w-[160px] text-sm rounded-lg bg-muted/60 border-transparent hover:bg-muted/80 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all">
                <SelectValue>
                  {(value) => CATEGORIES.find((c) => c.value === value)?.label ?? "All Categories"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border shadow-lg">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-sm font-medium">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 text-xs font-semibold rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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

        {/* Table Content */}
        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted mb-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No subscriptions found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent bg-muted/40">
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0 pl-6">
                      Service
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0">
                      Category
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0">
                      Billing
                    </TableHead>
                    <TableHead className="text-xs font-bold text-muted-foreground uppercase tracking-wider h-11 py-0 text-right pr-6">
                      Amount <span className="font-normal opacity-60">/mo</span>
                    </TableHead>
                    <TableHead className="h-11 py-0 w-14" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((sub) => {
                    const avatar = getAvatarConfig(sub.name);
                    const nextBilling = new Date(sub.billingDate);
                    const daysUntil = getDaysUntil(nextBilling);
                    const isPastDue = daysUntil < 0;
                    const isUrgent = !isPastDue && daysUntil <= 3;
                    const categoryLabel = CATEGORIES.find((c) => c.value === sub.category)?.label ?? sub.category;

                    return (
                      <TableRow
                        key={sub._id}
                        className="border-b border-border/60 group cursor-default hover:bg-muted/25 transition-colors"
                      >
                        {/* Service: avatar + name */}
                        <TableCell className="py-3.5 pl-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                                avatar.bg,
                                avatar.color,
                              )}
                            >
                              {avatar.initial}
                            </div>
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {sub.name}
                            </p>
                          </div>
                        </TableCell>

                        {/* Category badge */}
                        <TableCell className="py-3.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs h-6 px-2.5 font-semibold rounded-md border",
                              CATEGORY_BADGE[sub.category] ?? CATEGORY_BADGE.other,
                            )}
                          >
                            {categoryLabel}
                          </Badge>
                        </TableCell>

                        {/* Billing: date + status pill */}
                        <TableCell className="py-3.5">
                          <p className="text-sm font-medium text-muted-foreground">
                            {nextBilling.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <span className={cn(
                            "mt-0.5 inline-flex text-[10px] font-semibold px-1.5 rounded",
                            isPastDue
                              ? "bg-rose-50 text-rose-600"
                              : isUrgent
                              ? "bg-orange-50 text-orange-600"
                              : "bg-emerald-50 text-emerald-600",
                          )}>
                            {isPastDue ? "Past Due" : isUrgent ? `Due in ${daysUntil}d` : "Active"}
                          </span>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="py-3.5 pr-6 text-right">
                          <span className="text-[15px] font-black tracking-tight text-foreground tabular-nums">
                            <CurrencyDisplay amount={sub.amount} />
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3.5 w-24">
                          <div className="flex items-center justify-end gap-1">
                            {isPastDue && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Renew to next month"
                                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 text-muted-foreground hover:text-emerald-600"
                                disabled={renewingId === sub._id}
                                onClick={() => handleRenewSubscription(sub._id)}
                              >
                                <RefreshCw className={cn("h-4 w-4", renewingId === sub._id && "animate-spin")} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 text-muted-foreground hover:text-rose-600"
                              onClick={() => handleDeleteSubscription(sub._id, sub.name)}
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
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/10 px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">{filtered.length}</span>{" "}
                results
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, idx, arr) => (
                    <div key={p} className="flex">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-xs text-muted-foreground">…</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-7 w-7 rounded text-xs font-medium",
                          p === currentPage
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
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
                  className="h-7 w-7 rounded text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Subscription Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) setFormCategory(""); }}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
                <CreditCard className="h-4 w-4 text-indigo-600" />
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
                <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                  Service Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. Netflix, Spotify"
                  required
                  className="h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="amount" className="text-sm font-semibold text-foreground">
                  Monthly Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                  className="h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="billingDate" className="text-sm font-semibold text-foreground">
                  Next Billing Date
                </Label>
                <Input
                  id="billingDate"
                  name="billingDate"
                  type="date"
                  required
                  className="h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="category" className="text-sm font-semibold text-foreground">
                  Category
                </Label>
                <Select name="category" required value={formCategory} onValueChange={(v) => setFormCategory(v ?? "")}>
                  <SelectTrigger id="category" className="h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20 w-full">
                    <SelectValue placeholder="Select category">
                      {(value) => CATEGORIES.find((c) => c.value === value)?.label ?? "Select category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25"
              >
                Save Subscription
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => { if (!open) handleDeleteCancel(); }}
        onConfirm={handleDeleteConfirm}
        {...deleteDialog.config}
      />
    </div>
  );
}
