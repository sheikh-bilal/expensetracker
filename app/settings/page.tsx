"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Wallet,
  PiggyBank,
  Target,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Bell,
  Send,
  Settings2,
  Sparkles,
} from "lucide-react";
import { CURRENCIES } from "@/lib/constants/expense";
import { getUserSettings, updateUserSettings } from "@/actions/settings";

const CURRENCY_MAP = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
) as Record<string, (typeof CURRENCIES)[number]>;

export default function SettingsPage() {
  const [currency, setCurrency] = useState("PKR");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [savingsGoal, setSavingsGoal] = useState(20);
  const [savedCurrency, setSavedCurrency] = useState("PKR");
  const [savedBudget, setSavedBudget] = useState("");
  const [savedSavingsGoal, setSavedSavingsGoal] = useState(20);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<"currency" | "budget" | "savings" | null>(null);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const settings = await getUserSettings();
      if (settings) {
        setCurrency(settings.currency);
        setSavedCurrency(settings.currency);
        if (settings.monthlyBudget) {
          setMonthlyBudget(settings.monthlyBudget.toString());
          setSavedBudget(settings.monthlyBudget.toString());
        }
        if (settings.savingsGoal !== undefined) {
          setSavingsGoal(settings.savingsGoal);
          setSavedSavingsGoal(settings.savingsGoal);
        }
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const showSuccessMessage = (type: "currency" | "budget" | "savings") => {
    setSuccessType(type);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSuccessType(null);
    }, 2000);
  };

  const handleSaveCurrency = async () => {
    const result = await updateUserSettings({ currency });
    if (result.success) {
      setSavedCurrency(currency);
      showSuccessMessage("currency");
    }
  };

  const handleSaveBudget = async () => {
    const budgetNum = monthlyBudget ? parseFloat(monthlyBudget) : null;
    const result = await updateUserSettings({ monthlyBudget: budgetNum });
    if (result.success) {
      setSavedBudget(monthlyBudget);
      showSuccessMessage("budget");
    }
  };

  const handleSaveSavings = async () => {
    const result = await updateUserSettings({ savingsGoal });
    if (result.success) {
      setSavedSavingsGoal(savingsGoal);
      showSuccessMessage("savings");
    }
  };

  const handleResetCurrency = async () => {
    const result = await updateUserSettings({ currency: "PKR" });
    if (result.success) {
      setCurrency("PKR");
      setSavedCurrency("PKR");
      showSuccessMessage("currency");
    }
  };

  const handleResetBudget = async () => {
    const result = await updateUserSettings({ monthlyBudget: null });
    if (result.success) {
      setMonthlyBudget("");
      setSavedBudget("");
      showSuccessMessage("budget");
    }
  };

  const handleResetSavings = async () => {
    setSavingsGoal(20);
    const result = await updateUserSettings({ savingsGoal: 20 });
    if (result.success) {
      setSavedSavingsGoal(20);
      showSuccessMessage("savings");
    }
  };

  const hasChanges =
    currency !== savedCurrency ||
    monthlyBudget !== savedBudget ||
    savingsGoal !== savedSavingsGoal;

  const budgetNum = monthlyBudget ? parseFloat(monthlyBudget) : 0;
  const savingsAmount = budgetNum > 0 ? (budgetNum * savingsGoal) / 100 : 0;
  const remainingForExpenses = budgetNum - savingsAmount;
  const currencySymbol = CURRENCY_MAP[currency]?.symbol || "₨";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="max-w-5xl space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
            <Settings2 className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">Customize your expense tracking experience</p>
          </div>
        </div>

        {/* Budget Overview Card */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 shadow-xl text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-violet-400 opacity-10 rounded-full blur-2xl pointer-events-none" />
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Target className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-base font-bold text-white">Budget Breakdown</p>
                <p className="text-xs text-indigo-200">Monthly allocation plan</p>
              </div>
            </div>

            {budgetNum > 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400/30">
                      <Wallet className="h-4 w-4 text-indigo-200" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium text-indigo-200">Total Budget</span>
                  </div>
                  <p className="text-2xl font-black text-white tabular-nums">
                    {currencySymbol} {budgetNum.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-400/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/30">
                      <PiggyBank className="h-4 w-4 text-emerald-300" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium text-emerald-200">Savings</span>
                    <span className="ml-auto text-xs font-bold text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded-full">
                      {savingsGoal}%
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-300 tabular-nums">
                    {currencySymbol} {savingsAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-200/70 mt-1">For your future</p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-amber-400/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/30">
                      <Wallet className="h-4 w-4 text-amber-300" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium text-amber-200">Expenses</span>
                    <span className="ml-auto text-xs font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
                      {100 - savingsGoal}%
                    </span>
                  </div>
                  <p className="text-2xl font-black text-amber-300 tabular-nums">
                    {currencySymbol} {remainingForExpenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-200/70 mt-1">Monthly spending</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 mx-auto mb-4">
                  <PiggyBank className="h-7 w-7 text-indigo-300" strokeWidth={2} />
                </div>
                <p className="text-base font-semibold text-white mb-1">No Budget Set</p>
                <p className="text-sm text-indigo-200">Set your monthly budget below to see the breakdown</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Monthly Budget */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Wallet className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Monthly Budget</p>
                <p className="text-xs text-muted-foreground">Set your spending limit</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Amount
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                    {currencySymbol}
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="90000"
                    className="pl-8 h-11 rounded-xl"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveBudget}
                  disabled={monthlyBudget === savedBudget}
                  className="flex-1 h-10 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {showSuccess && successType === "budget" ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Saved
                    </span>
                  ) : (
                    "Save Budget"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetBudget}
                  className="h-10 w-10 rounded-xl p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Savings Goal */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <PiggyBank className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Savings Goal</p>
                <p className="text-xs text-muted-foreground">Percentage to save each month</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="savings" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Savings Rate
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                    %
                  </span>
                  <Input
                    id="savings"
                    type="number"
                    min={0}
                    max={100}
                    value={savingsGoal}
                    onChange={(e) =>
                      setSavingsGoal(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))
                    }
                    className="h-11 pl-8 rounded-xl"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 20% · You'll save:{" "}
                  <span className="font-semibold text-foreground">
                    {currencySymbol} {savingsAmount.toLocaleString()}/month
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSavings}
                  disabled={savingsGoal === savedSavingsGoal}
                  className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                >
                  {showSuccess && successType === "savings" ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Saved
                    </span>
                  ) : (
                    "Save Goal"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetSavings}
                  className="h-10 w-10 rounded-xl p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Currency */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <DollarSign className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Default Currency</p>
                <p className="text-xs text-muted-foreground">Your preferred currency</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Select Currency
                </Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v || "PKR")}>
                  <SelectTrigger id="currency" className="h-11 rounded-xl">
                    <SelectValue>
                      {(value) => {
                        const curr = CURRENCY_MAP[value as string];
                        return curr ? (
                          <span className="flex items-center gap-2">
                            <span className="text-base">{curr.flag}</span>
                            <span>{curr.code}</span>
                            <span className="text-muted-foreground">- {curr.name}</span>
                          </span>
                        ) : value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code} className="font-medium">
                        <span className="flex items-center gap-2">
                          <span className="text-base">{curr.flag}</span>
                          <span>{curr.code}</span>
                          <span className="text-muted-foreground">- {curr.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCurrency}
                  disabled={currency === savedCurrency}
                  className="flex-1 h-10 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50"
                >
                  {showSuccess && successType === "currency" ? (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" /> Saved
                    </span>
                  ) : (
                    "Save Currency"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetCurrency}
                  className="h-10 w-10 rounded-xl p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 border-b border-border/50 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Bell className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Alerts & reminders</p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                    <Send className="h-4 w-4 text-sky-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Telegram Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notifications on Telegram</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-md">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-5 border-b border-border/50 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Download className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Data Management</p>
              <p className="text-xs text-muted-foreground">Export or manage your data</p>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="h-10 rounded-xl font-medium">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                className="h-10 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-medium"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </div>
          </div>
        </div>

        {/* Unsaved changes banner */}
        {hasChanges && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900">You have unsaved changes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
