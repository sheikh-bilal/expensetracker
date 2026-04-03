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
    borderColor: string;
  }
> = {
  electricity: {
    icon: Zap,
    bg: "bg-amber-50",
    color: "text-amber-600",
    gradient: "from-amber-500 to-orange-500",
    unit: "kWh",
    borderColor: "border-amber-200",
  },
  water: {
    icon: Droplets,
    bg: "bg-blue-50",
    color: "text-blue-600",
    gradient: "from-blue-500 to-cyan-500",
    unit: "gal",
    borderColor: "border-blue-200",
  },
  gas: {
    icon: Flame,
    bg: "bg-rose-50",
    color: "text-rose-600",
    gradient: "from-rose-500 to-pink-500",
    unit: "m³",
    borderColor: "border-rose-200",
  },
};
