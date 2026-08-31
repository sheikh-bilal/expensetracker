"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/page-loader";
import {
  ArrowLeft,
  Trash2,
  Calculator,
  Hash,
  Sigma,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

function UnitsTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="mb-0.5 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">
        {payload[0].value.toLocaleString()} {unit}
      </p>
      {payload[0].payload.reading != null && (
        <p className="mt-0.5 text-xs text-muted-foreground">
          Reading: {payload[0].payload.reading.toLocaleString()}
        </p>
      )}
    </div>
  );
}

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

  const chartData = useMemo(
    () =>
      [...filteredReadings]
        .sort(
          (a, b) =>
            new Date(a.createdAt || "").getTime() -
            new Date(b.createdAt || "").getTime(),
        )
        .map((r) => ({
          month: r.month.slice(0, 3),
          units: r.units ?? 0,
          reading: r.reading,
        })),
    [filteredReadings],
  );

  if (loading) return <PageLoader label="Loading meter" />;

  if (!meter) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <p className="text-sm font-medium text-foreground">Meter not found</p>
        <Button asChild variant="outline" className="rounded-lg">
          <Link href="/meters">Back to Meters</Link>
        </Button>
      </div>
    );
  }

  const config = METER_CONFIG[meter.type as MeterType];
  const Icon = config.icon;

  const totalReadings = readings.length;
  const totalUnits = getTotalConsumption(readings);
  const latestReadingValue = getLatestReading(readings);

  const statTiles = [
    {
      label: "Total readings",
      icon: Hash,
      value: totalReadings.toLocaleString(),
      sub: "recorded overall",
    },
    {
      label: "Total consumed",
      icon: Sigma,
      value: `${totalUnits.toLocaleString()} ${config.unit}`,
      sub: "across all readings",
    },
    {
      label: "Latest reading",
      icon: Activity,
      value:
        latestReadingValue !== null ? latestReadingValue.toLocaleString() : "—",
      sub: "on the meter",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/meters"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back to meters"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              config.bg,
            )}
          >
            <Icon className={cn("h-5 w-5", config.color)} strokeWidth={2} />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {METER_TYPE_LABELS[meter.type as MeterType]} · Ref {meter.refNo}
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
              {meter.name}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="h-9 gap-1.5 rounded-lg text-sm font-semibold shadow-md"
            onClick={() => setCalcOpen(true)}
          >
            <Calculator className="h-4 w-4" />
            Calculate Bill
          </Button>
          <Button
            variant="outline"
            className="h-9 gap-1.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 hover:text-danger"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="stagger-children space-y-5 [&>*]:animate-fade-in">
        {/* Stat tiles */}
        <Card className="gap-0 p-0 [--card-spacing:0px]">
          <CardContent className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border/60 p-0 sm:grid-cols-3">
            {statTiles.map(({ label, icon: TileIcon, value, sub }) => (
              <div key={label} className="flex flex-col gap-3 bg-card p-5">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    config.bg,
                  )}
                >
                  <TileIcon
                    className={cn("h-4 w-4", config.color)}
                    strokeWidth={2}
                  />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">
                    {value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Consumption trend */}
        <Card className="gap-0 p-0">
          <CardHeader className="border-b !pb-4 pt-5">
            <CardTitle className="text-sm font-semibold">
              Consumption Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Units used per reading · {config.unit}
            </CardDescription>
            <CardAction>
              <Select
                value={yearFilter}
                onValueChange={(v) => setYearFilter(v ?? "current")}
              >
                <SelectTrigger className="h-8 w-36 rounded-lg text-xs">
                  <SelectValue>
                    {YEAR_FILTER_LABELS[
                      yearFilter as keyof typeof YEAR_FILTER_LABELS
                    ] ?? yearFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Year</SelectItem>
                  <SelectItem value="last">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent className="py-5">
            {chartData.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-foreground">
                  No readings in this period
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {readings.length === 0
                    ? "Readings are added automatically when you log a bill expense for this meter."
                    : "Try a different time period."}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={24} barCategoryGap="30%">
                  <CartesianGrid
                    vertical={false}
                    stroke="hsl(var(--border) / 0.6)"
                    strokeWidth={1}
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "hsl(var(--muted-foreground))",
                      fontSize: 11,
                    }}
                    width={44}
                  />
                  <Tooltip
                    content={<UnitsTooltip unit={config.unit} />}
                    cursor={{ fill: "hsl(var(--muted) / 0.6)", radius: 6 }}
                  />
                  <Bar
                    dataKey="units"
                    fill={config.chart}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Reading history */}
        <Card className="gap-0 p-0">
          <CardHeader className="border-b !pb-4 pt-5">
            <CardTitle className="text-sm font-semibold">
              Reading History
            </CardTitle>
            <CardDescription className="text-xs">
              {filteredReadings.length} reading
              {filteredReadings.length !== 1 ? "s" : ""} ·{" "}
              {
                YEAR_FILTER_LABELS[
                  yearFilter as keyof typeof YEAR_FILTER_LABELS
                ]
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="p-3">
            {filteredReadings.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  {readings.length === 0
                    ? "No readings recorded yet. Add your first reading through expense entry."
                    : "No readings found for the selected time period."}
                </p>
              </div>
            ) : (
              <div>
                {filteredReadings.map((reading) => (
                  <div
                    key={reading._id}
                    className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                          config.bg,
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase",
                            config.color,
                          )}
                        >
                          {reading.month.slice(0, 3)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium leading-tight text-foreground">
                          {reading.month}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(reading.createdAt || "").toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold tabular-nums text-foreground">
                        {reading.units?.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {config.unit}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                        reading {reading.reading?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
