import { Zap, Droplets, Flame, type LucideIcon } from "lucide-react";

export const METER_TYPES = ["electricity", "water", "gas"] as const;

export type MeterType = (typeof METER_TYPES)[number];

export const METER_TYPE_LABELS: Record<MeterType, string> = {
  electricity: "Electricity",
  water: "Water",
  gas: "Gas",
};

export const METER_CONFIG: Record<
  MeterType,
  {
    icon: LucideIcon;
    bg: string;
    color: string;
    gradient: string;
    unit: string;
    /** Fixed chart hue for this utility — matches the reports Bills overview */
    chart: string;
  }
> = {
  electricity: {
    icon: Zap,
    bg: "bg-amber-500/10",
    color: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-500 to-orange-500",
    unit: "kWh",
    chart: "#c98500",
  },
  water: {
    icon: Droplets,
    bg: "bg-blue-500/10",
    color: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
    unit: "gal",
    chart: "#2a78d6",
  },
  gas: {
    icon: Flame,
    bg: "bg-rose-500/10",
    color: "text-rose-600 dark:text-rose-400",
    gradient: "from-rose-500 to-pink-500",
    unit: "m³",
    chart: "#e34948",
  },
};
