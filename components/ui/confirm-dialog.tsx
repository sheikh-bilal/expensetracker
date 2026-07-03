"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {variant === "danger" && (
            <AlertDialogMedia className="bg-danger/10">
              <AlertTriangle className="text-danger" strokeWidth={2.25} />
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={cn(
              variant === "danger" &&
                "bg-danger text-danger-foreground hover:bg-danger/90",
            )}
          >
            {isSubmitting ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
    setDialog((prev) => ({ ...prev, open: false, resolver: null }));
  };

  const handleCancel = () => {
    dialog.resolver?.(false);
    setDialog((prev) => ({ ...prev, open: false, resolver: null }));
  };

  return { dialog, confirm, handleConfirm, handleCancel };
}
