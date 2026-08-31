"use client";

import { useState, useEffect } from "react";
import { PageLoader } from "@/components/ui/page-loader";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Globe,
  Wallet,
  PiggyBank,
  Check,
  RotateCcw,
  Trash2,
  Download,
  Bell,
  Send,
  Sparkles,
} from "lucide-react";
import { CURRENCIES } from "@/lib/constants/expense";
import { getUserSettings, updateUserSettings } from "@/actions/settings";
import { cn } from "@/lib/utils";

const CURRENCY_MAP = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
) as Record<string, (typeof CURRENCIES)[number]>;

const SAVINGS_PRESETS = [10, 15, 20, 30];

function SettingCardHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <CardHeader className="flex-row items-center gap-3 space-y-0 border-b !pb-4 pt-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
      </div>
      <div>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </div>
    </CardHeader>
  );
}

export default function SettingsPage() {
  const [currency, setCurrency] = useState("PKR");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [savingsGoal, setSavingsGoal] = useState(20);
  const [savedCurrency, setSavedCurrency] = useState("PKR");
  const [savedBudget, setSavedBudget] = useState("");
  const [savedSavingsGoal, setSavedSavingsGoal] = useState(20);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successType, setSuccessType] = useState<
    "currency" | "budget" | "savings" | null
  >(null);

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

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Preferences
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
      </div>

      <div className="stagger-children space-y-5 [&>*]:animate-fade-in">
        {/* Allocation command deck */}
        <section
          className="hero-panel relative overflow-hidden rounded-2xl text-white shadow-lg ring-1 ring-white/10"
          aria-label="Budget allocation"
        >
          <div
            className="hero-grid pointer-events-none absolute inset-0"
            aria-hidden
          />
          <div className="relative p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Monthly allocation plan
            </p>

            {budgetNum > 0 ? (
              <>
                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
                  <div className="sm:pr-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Total budget
                    </p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {currencySymbol} {budgetNum.toLocaleString()}
                    </p>
                  </div>
                  <div className="sm:px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Savings · {savingsGoal}%
                    </p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight text-teal-300 sm:text-3xl">
                      {currencySymbol} {savingsAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="sm:pl-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                      Spendable · {100 - savingsGoal}%
                    </p>
                    <p className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {currencySymbol} {remainingForExpenses.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Split bar — savings vs spendable, 2px surface gap */}
                <div className="mt-6 flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-l-full bg-teal-300 transition-[width] duration-700 ease-out"
                    style={{ width: `${savingsGoal}%` }}
                  />
                  <div
                    className="h-full rounded-r-full bg-white/25 transition-[width] duration-700 ease-out"
                    style={{ width: `${100 - savingsGoal}%` }}
                  />
                </div>
                <div className="mt-2.5 flex items-center gap-5 text-xs text-white/55">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full bg-teal-300"
                      aria-hidden
                    />
                    Savings
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full bg-white/25"
                      aria-hidden
                    />
                    Spendable
                  </span>
                </div>
              </>
            ) : (
              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                  <PiggyBank
                    className="h-6 w-6 text-white/70"
                    strokeWidth={1.75}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    No budget set
                  </p>
                  <p className="mt-0.5 text-xs text-white/55">
                    Set your monthly budget below to see how it splits between
                    savings and spending.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Setting cards */}
        <div className="grid gap-3 lg:grid-cols-2">
          {/* Monthly budget */}
          <Card className="gap-0 py-0">
            <SettingCardHeader
              icon={Wallet}
              title="Monthly Budget"
              description="Your total spending limit"
            />
            <CardContent className="space-y-4 py-5">
              <div className="space-y-2">
                <Label
                  htmlFor="budget"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Amount
                </Label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                    {currencySymbol}
                  </span>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    placeholder="90000"
                    className="h-11 rounded-lg pl-9 font-medium tabular-nums"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveBudget}
                  disabled={monthlyBudget === savedBudget}
                  className="h-9 flex-1 rounded-lg text-sm font-semibold"
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
                  title="Clear budget"
                  className="h-9 w-9 rounded-lg p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Savings goal */}
          <Card className="gap-0 py-0">
            <SettingCardHeader
              icon={PiggyBank}
              title="Savings Goal"
              description="Share of budget set aside each month"
            />
            <CardContent className="space-y-4 py-5">
              <div className="space-y-2">
                <Label
                  htmlFor="savings"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Savings rate
                </Label>
                <div className="flex items-center gap-2">
                  <div className="relative w-28">
                    <Input
                      id="savings"
                      type="number"
                      min={0}
                      max={100}
                      value={savingsGoal}
                      onChange={(e) =>
                        setSavingsGoal(
                          Math.min(
                            100,
                            Math.max(0, parseInt(e.target.value) || 0),
                          ),
                        )
                      }
                      className="h-11 rounded-lg pr-8 font-medium tabular-nums"
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      %
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {SAVINGS_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setSavingsGoal(preset)}
                        className={cn(
                          "h-8 rounded-lg px-2.5 text-xs font-semibold transition-colors",
                          savingsGoal === preset
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {budgetNum > 0 ? (
                    <>
                      You&apos;ll set aside{" "}
                      <span className="font-semibold text-foreground">
                        {currencySymbol} {savingsAmount.toLocaleString()}/month
                      </span>
                    </>
                  ) : (
                    "Recommended: 20% of your monthly budget"
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSavings}
                  disabled={savingsGoal === savedSavingsGoal}
                  className="h-9 flex-1 rounded-lg text-sm font-semibold"
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
                  title="Reset to 20%"
                  className="h-9 w-9 rounded-lg p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Currency */}
          <Card className="gap-0 py-0">
            <SettingCardHeader
              icon={Globe}
              title="Currency"
              description="Used across every amount in the app"
            />
            <CardContent className="space-y-4 py-5">
              <div className="space-y-2">
                <Label
                  htmlFor="currency"
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Default currency
                </Label>
                <Select
                  value={currency}
                  onValueChange={(v) => setCurrency(v || "PKR")}
                >
                  <SelectTrigger
                    id="currency"
                    className="h-11 w-full rounded-lg"
                  >
                    <SelectValue>
                      {(() => {
                        const curr = CURRENCY_MAP[currency];
                        return curr ? (
                          <span className="flex items-center gap-2">
                            <span className="text-base">{curr.flag}</span>
                            <span className="font-medium">{curr.code}</span>
                            <span className="text-muted-foreground">
                              · {curr.name}
                            </span>
                          </span>
                        ) : (
                          currency
                        );
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        <span className="flex items-center gap-2">
                          <span className="text-base">{curr.flag}</span>
                          <span className="font-medium">{curr.code}</span>
                          <span className="text-muted-foreground">
                            · {curr.name}
                          </span>
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
                  className="h-9 flex-1 rounded-lg text-sm font-semibold"
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
                  title="Reset to PKR"
                  className="h-9 w-9 rounded-lg p-0"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="gap-0 py-0">
            <SettingCardHeader
              icon={Bell}
              title="Notifications"
              description="Alerts & reminders"
            />
            <CardContent className="py-5">
              <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/10">
                    <Send className="h-4 w-4 text-info" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground">
                      Telegram alerts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bill reminders & budget warnings
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-warning/10 px-2 py-1 text-[11px] font-semibold text-warning">
                  Coming soon
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data management */}
        <Card className="gap-0 py-0">
          <SettingCardHeader
            icon={Download}
            title="Data Management"
            description="Export or clear your data"
          />
          <CardContent className="py-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="h-9 rounded-lg text-sm font-medium"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                className="h-9 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 hover:text-danger"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unsaved changes banner */}
      {hasChanges && (
        <div className="sticky bottom-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-2 shadow-md ring-1 ring-warning/30 backdrop-blur">
            <Sparkles className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-foreground">
              You have unsaved changes
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
