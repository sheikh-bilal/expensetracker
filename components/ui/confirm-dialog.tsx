"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm();
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-0 shadow-xl">
        <DialogHeader className="pb-3">
          {variant === "danger" && (
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
              <AlertTriangle className="h-6 w-6 text-rose-600" strokeWidth={2.5} />
            </div>
          )}
          <DialogTitle className="text-center text-base font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 rounded-xl"
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className={cn(
              "flex-1 h-10 rounded-xl font-semibold",
              variant === "danger"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    open: boolean;
    config: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm">;
    resolver: ((value: boolean) => void) | null;
  }>({
    open: false,
    config: {},
    resolver: null,
  });

  const confirm = (config: Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm">) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        open: true,
        config,
        resolver: resolve,
      });
    });
  };

  const handleConfirm = () => {
    dialog.resolver?.(true);
    setDialog((prev: any) => ({ ...prev, open: false, resolver: null }));
  };

  const handleCancel = () => {
    dialog.resolver?.(false);
    setDialog((prev: any) => ({ ...prev, open: false, resolver: null }));
  };

  return { dialog, confirm, handleConfirm, handleCancel };
}
