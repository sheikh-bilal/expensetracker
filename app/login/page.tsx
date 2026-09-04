"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Toaster, useToast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toasts, removeToast, toast } = useToast();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const result = await login(new FormData(e.currentTarget));

    if (result?.error) {
      setErrors(result.error);
      const msg = Object.values(result.error).flat()[0];
      toast.error("Login failed", msg);
      setIsLoading(false);
    } else if (result?.success) {
      toast.success("Welcome back!", "Redirecting to your dashboard...");
      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
        router.refresh();
      }, 500);
    }
  }

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
              Welcome back
            </h2>
            <p className="text-[13px] text-muted-foreground">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {errors.password && (
                <p className="flex items-center gap-1 text-xs font-medium text-danger">
                  <span className="h-1 w-1 rounded-full bg-danger" />
                  {errors.password[0]}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="hero-panel mt-2 h-11 w-full rounded-xl text-sm font-semibold text-white shadow-[0_8px_20px_-6px_hsl(233_45%_11%/0.55)] ring-1 ring-white/10 hover:brightness-110 active:brightness-95"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
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
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.SIGNUP}
              className="ml-1 font-semibold text-primary hover:text-primary/80"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-7 flex items-center justify-center gap-1.5 text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" strokeWidth={2} />
          <p className="text-xs font-medium">
            Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
