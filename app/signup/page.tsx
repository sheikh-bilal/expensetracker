"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Toaster, useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = await signup(new FormData(e.currentTarget));

    if (result?.error) {
      setErrors(result.error);
      const msg = Object.values(result.error).flat()[0];
      toast.error("Registration failed", msg);
      setIsLoading(false);
    } else if (result?.success) {
      toast.success("Account created!", "Welcome to Fintrax.");
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 800);
    }
  }

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { label: "Weak", color: "bg-danger" },
      { label: "Fair", color: "bg-warning" },
      { label: "Good", color: "bg-success" },
      { label: "Strong", color: "bg-success" },
    ];
    return {
      strength,
      ...(levels[strength - 1] || { label: "Weak", color: "bg-danger" }),
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <Toaster toasts={toasts} removeToast={removeToast} />

      <div
        className="hero-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Brand */}
        <div className="mb-9 flex flex-col items-center gap-3 text-center">
          <div className="hero-panel flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-[0_10px_24px_-6px_hsl(233_45%_11%/0.5)] ring-1 ring-white/10">
            <Wallet className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Fintrax
            </h1>
            <p className="mt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Personal Finance
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-7 shadow-lg">
          <div className="mb-6">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Create your account
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Start tracking your expenses smartly today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Full Name
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={2}
                />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="h-11 rounded-xl pl-11 text-sm"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              {errors.name && (
                <p className="flex items-center gap-1 text-xs font-medium text-danger">
                  <span className="h-1 w-1 rounded-full bg-danger" />
                  {errors.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={2}
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 rounded-xl pl-11 text-sm"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs font-medium text-danger">
                  <span className="h-1 w-1 rounded-full bg-danger" />
                  {errors.email[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={2}
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-11 text-sm"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              {formData.password && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength:{" "}
                    <span
                      className={cn(
                        "font-semibold",
                        passwordStrength.strength >= 3
                          ? "text-success"
                          : "text-foreground",
                      )}
                    >
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="flex items-center gap-1 text-xs font-medium text-danger">
                  <span className="h-1 w-1 rounded-full bg-danger" />
                  {errors.password[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={2}
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 rounded-xl pl-11 text-sm"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <CheckCircle2
                      className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-success"
                      strokeWidth={2}
                    />
                  )}
              </div>
              {errors.confirmPassword && (
                <p className="flex items-center gap-1 text-xs font-medium text-danger">
                  <span className="h-1 w-1 rounded-full bg-danger" />
                  {errors.confirmPassword[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="hero-panel h-11 w-full rounded-xl text-sm font-semibold text-white shadow-[0_8px_20px_-6px_hsl(233_45%_11%/0.55)] ring-1 ring-white/10 hover:brightness-110 active:brightness-95"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Account
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-success" strokeWidth={2} />
            <p className="text-xs font-medium">Secure</p>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
          <p className="text-xs font-medium">
            By signing up, you agree to our Terms
          </p>
        </div>
      </div>
    </div>
  );
}
