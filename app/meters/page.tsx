"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Trash2, ChevronRight, Gauge } from "lucide-react";
import { getMeters, createMeter, deleteMeter, type Meter } from "@/actions/meters";
import {
  METER_TYPES,
  METER_TYPE_LABELS,
  METER_CONFIG,
  type MeterType,
} from "@/lib/constants/meter";
import { cn } from "@/lib/utils";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";

export default function MetersPage() {
  const router = useRouter();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMeterType, setSelectedMeterType] = useState<MeterType>("electricity");
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const { dialog: deleteDialog, confirm: confirmDelete, handleConfirm: handleDeleteConfirm, handleCancel: handleDeleteCancel } = useConfirmDialog();

  useEffect(() => {
    loadMeters();
  }, []);

  async function loadMeters() {
    setLoading(true);
    const data = await getMeters();
    setMeters(data);
    setLoading(false);
  }

  async function handleCreateMeter(formData: FormData) {
    setCreateFormLoading(true);
    const result = await createMeter(formData);
    setCreateFormLoading(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setIsAddDialogOpen(false);
    loadMeters();
  }

  const getMetersByType = (type: string) => meters.filter((m) => m.type === type);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Utility Meters
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your electricity, water, and gas meters
          </p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] text-sm">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{meters.length}</span>
            <span className="text-muted-foreground">meter{meters.length !== 1 ? "s" : ""} registered</span>
          </div>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="space-y-4">
          {METER_TYPES.map((type) => {
            const config = METER_CONFIG[type];
            const Icon = config.icon;
            const typeMeters = getMetersByType(type);

            return (
              <div
                key={type}
                className="rounded-2xl bg-white overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.06)]"
              >
                {/* Panel Header */}
                <div
                  className={cn(
                    "flex items-center justify-between gap-4 px-5 py-4 border-b",
                    config.bg,
                    config.borderColor,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
                        config.gradient,
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h2 className={cn("text-sm font-bold", config.color)}>
                        {METER_TYPE_LABELS[type]}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {typeMeters.length} meter{typeMeters.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedMeterType(type);
                      setIsAddDialogOpen(true);
                    }}
                    className={cn(
                      "h-8 rounded-lg text-xs font-semibold gap-1.5 shadow-none",
                      "bg-gradient-to-br text-white",
                      config.gradient,
                    )}
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Add Meter
                  </Button>
                </div>

                {/* Meter Rows */}
                {typeMeters.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center mb-3",
                        config.bg,
                      )}
                    >
                      <Icon className={cn("h-6 w-6 opacity-40", config.color)} strokeWidth={1.5} />
                    </div>
                    <p className="text-sm font-medium text-foreground">No meters yet</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Add your first {METER_TYPE_LABELS[type].toLowerCase()} meter to start tracking
                    </p>
                    <button
                      onClick={() => {
                        setSelectedMeterType(type);
                        setIsAddDialogOpen(true);
                      }}
                      className={cn(
                        "text-xs font-semibold underline underline-offset-2",
                        config.color,
                      )}
                    >
                      + Add {METER_TYPE_LABELS[type]} meter
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-border/60">
                    {typeMeters.map((meter) => (
                      <div
                        key={meter._id}
                        className="group flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors cursor-pointer"
                        onClick={() => router.push(`/meters/${meter._id}`)}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            config.bg,
                          )}
                        >
                          <Icon className={cn("h-4 w-4", config.color)} strokeWidth={2} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {meter.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ref: {meter.refNo}
                          </p>
                        </div>

                        {/* Unit badge */}
                        <span
                          className={cn(
                            "hidden sm:inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full",
                            config.bg,
                            config.color,
                          )}
                        >
                          {config.unit}
                        </span>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 hover:text-rose-600 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete({
                              title: `Delete "${meter.name}"?`,
                              description: `This will permanently delete the ${METER_TYPE_LABELS[meter.type as MeterType]} meter "${meter.name}". This action cannot be undone.`,
                              confirmText: "Delete",
                              variant: "danger",
                            }).then((confirmed) => {
                              if (confirmed) {
                                deleteMeter(meter._id).then(loadMeters);
                              }
                            });
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </Button>

                        {/* Chevron */}
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => { if (!open) handleDeleteCancel(); }}
        onConfirm={handleDeleteConfirm}
        {...deleteDialog.config}
      />

      {/* Add Meter Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                  METER_CONFIG[selectedMeterType].gradient,
                )}
              >
                {(() => {
                  const Icon = METER_CONFIG[selectedMeterType].icon;
                  return <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />;
                })()}
              </div>
              Add {METER_TYPE_LABELS[selectedMeterType]} Meter
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter the details for your new utility meter
            </DialogDescription>
          </DialogHeader>
          <form action={handleCreateMeter} className="space-y-4 pt-1">
            <input type="hidden" name="type" value={selectedMeterType} />
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-semibold text-foreground">
                Meter Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Home Main, House 2, Office"
                required
                className="h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="refNo" className="text-sm font-semibold text-foreground">
                Reference No.
              </Label>
              <Input
                id="refNo"
                name="refNo"
                placeholder="e.g., 123456789"
                required
                className="h-11 rounded-xl border-border/60 focus:border-indigo-500 focus:ring-indigo-500/20"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/25"
                disabled={createFormLoading}
              >
                {createFormLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Meter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
