import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean | null };
  iconColor?: string;
  iconBg?: string;
  chartContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  iconColor = "text-indigo-600",
  iconBg = "bg-indigo-50",
  chartContent,
  children,
}: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_0_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.05)] transition-all duration-300 rounded-2xl p-0">
      <CardContent className="p-5 flex flex-col h-full z-10 relative">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide truncate">{title}</p>
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-110", iconBg)}>
            <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2.5} />
          </div>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div>
            {typeof value === "string" || typeof value === "number" ? (
              <p className="text-2xl font-black text-foreground tabular-nums tracking-tight leading-none">{value}</p>
            ) : (
              <div className="text-2xl font-black text-foreground">{value}</div>
            )}

            {trend && (
              <div className="mt-2.5 flex items-center gap-1.5 font-medium">
                {trend.isPositive === true ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : trend.isPositive === false ? (
                  <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className={cn("text-[13px]", trend.isPositive === true ? "text-emerald-600" : trend.isPositive === false ? "text-rose-600" : "text-muted-foreground")}>
                  {trend.isPositive !== null ? (trend.isPositive ? "+" : "-") : ""}{Math.abs(trend.value)}%
                </span>
                <span className="text-[13px] text-muted-foreground/70">vs last mo</span>
              </div>
            )}
          </div>

          {chartContent && (
            <div className="h-10 w-20 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
              {chartContent}
            </div>
          )}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}
