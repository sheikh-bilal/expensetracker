"use client";

import { useState, useEffect } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { getAuthUser } from "@/actions/auth";
import {
  getProfileStats,
  updateProfile,
  changePassword,
} from "@/actions/profile";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  User,
  Mail,
  Lock,
  Receipt,
  CreditCard,
  Gauge,
  Calendar,
  Check,
  Pencil,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type ProfileUser = { _id: string; name: string; email: string };
type Stats = {
  expenseCount: number;
  subscriptionCount: number;
  meterCount: number;
  createdAt: string | null;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarGradient(name: string) {
  const gradients = [
    "from-indigo-500 to-violet-600",
    "from-violet-500 to-purple-600",
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
  ];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Name edit
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    Promise.all([getAuthUser(), getProfileStats()]).then(([u, s]) => {
      if (u) {
        setUser(u as ProfileUser);
        setNameValue(u.name);
      }
      setStats(s);
      setLoading(false);
    });
  }, []);

  async function handleSaveName() {
    setNameSaving(true);
    setNameError("");
    const result = await updateProfile({ name: nameValue });
    if (result.success) {
      setUser((prev) => (prev ? { ...prev, name: nameValue } : prev));
      setNameSuccess(true);
      setEditingName(false);
      setTimeout(() => setNameSuccess(false), 2000);
    } else {
      setNameError(result.error || "Failed to save");
    }
    setNameSaving(false);
  }

  async function handleChangePassword() {
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPasswordSaving(true);
    const result = await changePassword({ currentPassword, newPassword });
    if (result.success) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } else {
      setPasswordError(result.error || "Failed to change password");
    }
    setPasswordSaving(false);
  }

  if (loading) return <PageLoader />;

  const gradient = getAvatarGradient(user?.name || "U");
  const initials = getInitials(user?.name || "User");
  const memberSince = stats?.createdAt
    ? new Date(stats.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-4xl">
      {/* Hero card */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
        {/* Banner */}
        <div className={cn("h-28 bg-gradient-to-r", gradient, "relative")}>
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-6">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div
              className={cn(
                "relative z-10 h-20 w-20 rounded-2xl bg-gradient-to-br shadow-lg ring-4 ring-white flex items-center justify-center",
                gradient,
              )}
            >
              <span className="text-2xl font-black text-white">{initials}</span>
            </div>
            {memberSince && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-3 py-1.5 rounded-full mb-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since {memberSince}
              </div>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">{user?.name}</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Activity stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Expenses Logged",
              value: stats.expenseCount,
              icon: Receipt,
              bg: "bg-indigo-50",
              color: "text-indigo-600",
            },
            {
              label: "Subscriptions",
              value: stats.subscriptionCount,
              icon: CreditCard,
              bg: "bg-violet-50",
              color: "text-violet-600",
            },
            {
              label: "Meters Tracked",
              value: stats.meterCount,
              icon: Gauge,
              bg: "bg-emerald-50",
              color: "text-emerald-600",
            },
          ].map(({ label, value, icon: Icon, bg, color }) => (
            <div
              key={label}
              className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] p-5"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl mb-3",
                  bg,
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", color)} strokeWidth={2} />
              </div>
              <p className="text-2xl font-black text-foreground tabular-nums">
                {value}
              </p>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Account details */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
            <User className="h-4.5 w-4.5 text-indigo-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Account Details</p>
            <p className="text-xs text-muted-foreground">
              Update your personal information
            </p>
          </div>
        </div>
        <div className="p-5 space-y-5">
          {/* Name field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name
            </Label>
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="h-10 rounded-xl flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") {
                      setEditingName(false);
                      setNameValue(user?.name || "");
                      setNameError("");
                    }
                  }}
                />
                <Button
                  onClick={handleSaveName}
                  disabled={nameSaving}
                  className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {nameSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingName(false);
                    setNameValue(user?.name || "");
                    setNameError("");
                  }}
                  className="h-10 px-3 rounded-xl"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between h-10 px-3 rounded-xl bg-muted/40 border border-border/60">
                <span className="text-sm font-medium text-foreground">
                  {user?.name}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            )}
            {nameError && (
              <p className="text-xs text-rose-500 font-medium">{nameError}</p>
            )}
            {nameSuccess && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Name updated successfully
              </p>
            )}
          </div>

          {/* Email field (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="flex items-center gap-3 h-10 px-3 rounded-xl bg-muted/30 border border-border/40">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <span className="ml-auto text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                Read only
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
            <Lock className="h-4.5 w-4.5 text-amber-600" strokeWidth={2} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Change Password</p>
            <p className="text-xs text-muted-foreground">
              Keep your account secure
            </p>
          </div>
          {passwordSuccess && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5" /> Password updated
            </div>
          )}
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Current Password
            </Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="h-10 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                New Password
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="h-10 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="h-10 rounded-xl"
              />
            </div>
          </div>
          {passwordError && (
            <p className="text-xs text-rose-500 font-medium">{passwordError}</p>
          )}
          <Button
            onClick={handleChangePassword}
            disabled={
              passwordSaving ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold disabled:opacity-50"
          >
            {passwordSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Updating...
              </span>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
