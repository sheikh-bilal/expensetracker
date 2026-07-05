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
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Trash2, ChevronRight, Gauge } from "lucide-react";
import {
  getMeters,
  createMeter,
  deleteMeter,
  type Meter,
} from "@/actions/meters";
import {
  METER_TYPES,
  METER_TYPE_LABELS,
  METER_CONFIG,
  type MeterType,
} from "@/lib/constants/meter";
import { cn } from "@/lib/utils";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";

export default function MetersPage() {
  const router = useRouter();
  const [meters, setMeters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMeterType, setSelectedMeterType] =
    useState<MeterType>("electricity");
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const {
    dialog: deleteDialog,
    confirm: confirmDelete,
    handleConfirm: handleDeleteConfirm,
    handleCancel: handleDeleteCancel,
  } = useConfirmDialog();

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

  const getMetersByType = (type: string) =>
    meters.filter((m) => m.type === type);

  const selectedConfig = METER_CONFIG[selectedMeterType];
  const SelectedIcon = selectedConfig.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Utilities
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Meters
          </h1>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm ring-1 ring-foreground/10">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold tabular-nums text-foreground">
              {meters.length}
            </span>
            <span className="text-muted-foreground">
              meter{meters.length !== 1 ? "s" : ""} registered
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <PageLoader label="Loading meters" />
      ) : (
        <div className="stagger-children grid grid-cols-1 gap-5 lg:grid-cols-3 [&>*]:animate-fade-in">
          {METER_TYPES.map((type) => {
            const config = METER_CONFIG[type];
            const Icon = config.icon;
            const typeMeters = getMetersByType(type);

            return (
              <Card key={type} className="h-full gap-0 p-0">
                <CardHeader className="flex-row items-center gap-3 space-y-0 border-b !pb-4">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      config.bg,
                    )}
                  >
                    <Icon
                      className={cn("h-4 w-4", config.color)}
                      strokeWidth={2}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {METER_TYPE_LABELS[type]}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {typeMeters.length} meter
                      {typeMeters.length !== 1 ? "s" : ""} · billed in{" "}
                      {config.unit}
                    </CardDescription>
                  </div>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 rounded-lg px-2.5 text-xs font-semibold"
                      onClick={() => {
                        setSelectedMeterType(type);
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                      Add
                    </Button>
                  </CardAction>
                </CardHeader>

                <CardContent className="flex-1 p-3">
                  {typeMeters.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
                      <div
                        className={cn(
                          "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl",
                          config.bg,
                        )}
                      >
                        <Icon
                          className={cn("h-5 w-5 opacity-60", config.color)}
                          strokeWidth={1.5}
                        />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        No meters yet
                      </p>
                      <p className="mb-4 mt-1 text-xs text-muted-foreground">
                        Add your first {METER_TYPE_LABELS[type].toLowerCase()}{" "}
                        meter to start tracking
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1 rounded-lg px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          setSelectedMeterType(type);
                          setIsAddDialogOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add {METER_TYPE_LABELS[type]} meter
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {typeMeters.map((meter) => (
                        <div
                          key={meter._id}
                          className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60"
                          onClick={() => router.push(`/meters/${meter._id}`)}
                        >
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              config.bg,
                            )}
                          >
                            <Icon
                              className={cn("h-4 w-4", config.color)}
                              strokeWidth={2}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                              {meter.name}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Ref: {meter.refNo}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-danger/10 hover:text-danger focus-visible:opacity-100 group-hover:opacity-100"
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

                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
        onConfirm={handleDeleteConfirm}
        {...deleteDialog.config}
      />

      {/* Add meter dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base font-semibold">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  selectedConfig.bg,
                )}
              >
                <SelectedIcon
                  className={cn("h-4 w-4", selectedConfig.color)}
                  strokeWidth={2}
                />
              </div>
              Add {METER_TYPE_LABELS[selectedMeterType]} Meter
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Enter the details for your new utility meter.
            </DialogDescription>
          </DialogHeader>
          <form action={handleCreateMeter} className="space-y-4 pt-1">
            <input type="hidden" name="type" value={selectedMeterType} />
            <div className="grid gap-1.5">
              <Label htmlFor="name" className="text-xs font-medium">
                Meter name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Home Main, House 2, Office"
                required
                className="h-10 rounded-lg"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="refNo" className="text-xs font-medium">
                Reference no.
              </Label>
              <Input
                id="refNo"
                name="refNo"
                placeholder="e.g. 123456789"
                required
                className="h-10 rounded-lg"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="h-10 w-full rounded-lg text-sm font-semibold shadow-md"
                disabled={createFormLoading}
              >
                {createFormLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
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
