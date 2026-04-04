"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Mail, Lock, ArrowRight, Shield } from "lucide-react";
import { Toaster, useToast } from "@/components/ui/toast";

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
        router.push("/dashboard");
        router.refresh();
      }, 500);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster toasts={toasts} removeToast={removeToast} />
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
            <Wallet className="h-7 w-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              ExpenseTrack
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Smart Expense Tracking
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-gray-100/80 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1.5">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  strokeWidth={2}
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="h-11 pl-11 text-sm rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-rose-600 rounded-full" />
                  {errors.email[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  strokeWidth={2}
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-11 pl-11 text-sm rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                  <span className="w-1 h-1 bg-rose-600 rounded-full" />
                  {errors.password[0]}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all mt-2"
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

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-gray-500">
          <Shield className="h-4 w-4 text-emerald-600" strokeWidth={2} />
          <p className="text-xs font-medium">
            Protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
