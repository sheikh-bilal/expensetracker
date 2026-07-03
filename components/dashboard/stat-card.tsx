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
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  chartContent,
  children,
}: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden p-0 transition-shadow duration-300 hover:shadow-sm">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="truncate text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
              iconBg,
            )}
          >
            <Icon className={cn("h-4 w-4", iconColor)} strokeWidth={2.5} />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div>
            {typeof value === "string" || typeof value === "number" ? (
              <p className="text-2xl font-bold leading-none tracking-tight text-foreground tabular-nums">
                {value}
              </p>
            ) : (
              <div className="text-2xl font-bold text-foreground">{value}</div>
            )}

            {trend && (
              <div className="mt-2.5 flex items-center gap-1.5 font-medium">
                {trend.isPositive === true ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                ) : trend.isPositive === false ? (
                  <TrendingDown className="h-3.5 w-3.5 text-danger" />
                ) : (
                  <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-[13px]",
                    trend.isPositive === true
                      ? "text-success"
                      : trend.isPositive === false
                        ? "text-danger"
                        : "text-muted-foreground",
                  )}
                >
                  {trend.isPositive !== null ? (trend.isPositive ? "+" : "-") : ""}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-[13px] text-muted-foreground/70">vs last mo</span>
              </div>
            )}
          </div>

          {chartContent && (
            <div className="h-10 w-20 shrink-0 opacity-80 transition-opacity group-hover:opacity-100">
              {chartContent}
            </div>
          )}
        </div>

        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}
