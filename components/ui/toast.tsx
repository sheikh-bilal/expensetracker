"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, X } from "lucide-react";

export type ToastVariant = "success" | "error";

export type ToastItem = {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
};

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-emerald-500",
    borderColor: "border-l-emerald-500",
    progressColor: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    iconColor: "text-rose-500",
    borderColor: "border-l-rose-500",
    progressColor: "bg-rose-500",
  },
} as const;

const DURATION = 4000;

function Toast({
  item,
  onRemove,
}: {
  item: ToastItem;
  onRemove: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const cfg = VARIANTS[item.variant];
  const Icon = cfg.icon;

  useEffect(() => {
    // Slide in
    const enterFrame = requestAnimationFrame(() => setVisible(true));

    // Progress bar countdown
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 16);

    return () => {
      cancelAnimationFrame(enterFrame);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative w-[360px] flex items-start gap-3 rounded-2xl border border-border/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 pr-10 border-l-4 overflow-hidden transition-all duration-300 ease-out",
        cfg.borderColor,
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10",
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", cfg.iconColor)} strokeWidth={2.5} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-snug">{item.title}</p>
        {item.message && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{item.message}</p>
        )}
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-muted/40">
        <div
          className={cn("h-full transition-none", cfg.progressColor)}
          style={{ width: `${progress}%`, opacity: 0.5 }}
        />
      </div>
    </div>
  );
}

export function Toaster({
  toasts,
  removeToast,
}: {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <Toast item={item} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (variant: ToastVariant, title: string, message?: string) => {
      const id = Math.random().toString(36).slice(2, 9);
      setToasts((prev) => [...prev, { id, variant, title, message }]);
      setTimeout(() => removeToast(id), DURATION);
    },
    [removeToast],
  );

  return {
    toasts,
    removeToast,
    toast: {
      success: (title: string, message?: string) => addToast("success", title, message),
      error: (title: string, message?: string) => addToast("error", title, message),
    },
  };
}
