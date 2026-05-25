"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMeterById, deleteMeter, type Meter } from "@/actions/meters";
import {
  getMeterReadings,
  type MeterReadingData,
} from "@/actions/meterReadings";
import {
  METER_TYPE_LABELS,
  METER_CONFIG,
  type MeterType,
} from "@/lib/constants/meter";
import { cn } from "@/lib/utils";
import { getTotalConsumption, getLatestReading } from "@/lib/utils/meter";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import { CalculateBillDialog } from "@/components/ui/calculate-bill-dialog";
import Link from "next/link";

const YEAR_FILTER_LABELS = {
  current: "Current Year",
  last: "Last Year",
  all: "All Time",
};

export default function MeterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [meter, setMeter] = useState<Meter | null>(null);
  const [readings, setReadings] = useState<MeterReadingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("current");
  const {
    dialog: deleteDialog,
    confirm: confirmDelete,
    handleConfirm: handleDeleteConfirm,
    handleCancel: handleDeleteCancel,
  } = useConfirmDialog();

  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadMeter(params.id as string);
    }
  }, [params.id]);

  async function loadMeter(id: string) {
    setLoading(true);
    const data = await getMeterById(id);
    setMeter(data);
    if (data) {
      const readingsData = await getMeterReadings(id);
      setReadings(readingsData);
    }
    setLoading(false);
  }

  async function handleDelete() {
    const confirmed = await confirmDelete({
      title: `Delete "${meter?.name}"?`,
      description: `This will permanently delete this ${meter ? METER_TYPE_LABELS[meter.type as MeterType] : ""} meter and all its data. This action cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (confirmed) {
      await deleteMeter(params.id as string);
      router.push("/meters");
    }
  }

  const filteredReadings = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return readings.filter((reading) => {
      const year = new Date(reading.createdAt || "").getFullYear();
      if (yearFilter === "current") return year === currentYear;
      if (yearFilter === "last") return year === currentYear - 1;
      return true;
    });
  }, [readings, yearFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!meter) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium text-foreground">Meter not found</p>
        <Link href="/meters">
          <Button variant="outline" className="mt-4">
            Back to Meters
          </Button>
        </Link>
      </div>
    );
  }

  const config = METER_CONFIG[meter.type as MeterType];
  const Icon = config.icon;

  const totalReadings = readings.length;
  const totalUnits = getTotalConsumption(readings);
  const latestReadingValue = getLatestReading(readings);

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/meters">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 flex items-center gap-3">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
              config.gradient,
            )}
          >
            <Icon className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{meter.name}</h1>
            <p className="text-sm text-muted-foreground">
              {METER_TYPE_LABELS[meter.type as MeterType]} • Ref: {meter.refNo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
            onClick={() => setCalcOpen(true)}
          >
            <Calculator className="h-4 w-4 mr-1.5" />
            Calculate Bill
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Readings", value: totalReadings, unit: null },
          {
            label: "Total Consumed",
            value: totalUnits.toLocaleString(),
            unit: config.unit,
          },
          {
            label: "Latest Reading",
            value:
              latestReadingValue !== null
                ? latestReadingValue.toLocaleString()
                : "—",
            unit: null,
          },
        ].map(({ label, value, unit }) => (
          <div
            key={label}
            className={cn(
              "rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] p-5 border-t-2",
              config.borderColor,
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
                {label}
              </p>
              <div
                className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  config.bg,
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} strokeWidth={2} />
              </div>
            </div>
            <p className="text-3xl font-black text-foreground">
              {value}
              {unit && (
                <span className="text-base font-medium text-muted-foreground ml-1">
                  {unit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Consumption Analysis */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-base font-bold text-foreground">
            Consumption Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Monthly consumption and cost trends
          </p>
        </div>
        {readings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No readings recorded yet. Add your first reading to see the
              analysis.
            </p>
          </div>
        ) : (
          <div className="p-6 grid gap-4 sm:grid-cols-3">
            {readings.slice(0, 3).map((reading) => (
              <div
                key={reading._id}
                className={cn("p-4 rounded-xl", config.bg)}
              >
                <p className={cn("text-xs font-semibold mb-1", config.color)}>
                  {reading.month}
                </p>
                <p className="text-lg font-bold text-foreground">
                  {reading.units?.toLocaleString()}{" "}
                  <span className="text-sm font-medium text-muted-foreground">
                    {config.unit}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reading: {reading.reading?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reading History */}
      <div className="rounded-2xl bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Reading History
            </h2>
            <p className="text-sm text-muted-foreground">
              All recorded readings for this meter
            </p>
          </div>
          <Select
            value={yearFilter}
            onValueChange={(v) => setYearFilter(v ?? "current")}
          >
            <SelectTrigger className="h-9 w-40 rounded-lg">
              <SelectValue>
                {(value) =>
                  YEAR_FILTER_LABELS[
                    value as keyof typeof YEAR_FILTER_LABELS
                  ] ?? value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Year</SelectItem>
              <SelectItem value="last">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredReadings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              {readings.length === 0
                ? "No readings recorded yet. Add your first reading through expense entry."
                : "No readings found for the selected time period."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredReadings.map((reading) => (
              <div
                key={reading._id}
                className="p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        config.bg,
                      )}
                    >
                      <span className={cn("text-xs font-bold", config.color)}>
                        {reading.month.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {reading.month}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reading.createdAt || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {reading.reading?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5 justify-end mt-0.5">
                      <span
                        className={cn("text-xs font-semibold", config.color)}
                      >
                        {reading.units?.toLocaleString()} {config.unit}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · meter reading
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
        onConfirm={handleDeleteConfirm}
        {...deleteDialog.config}
      />

      <CalculateBillDialog
        open={calcOpen}
        onOpenChange={setCalcOpen}
        previousReading={latestReadingValue}
        unit={config.unit}
        colorClass={config.color}
        gradientClass={config.gradient}
      />
    </div>
  );
}
