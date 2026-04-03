"use client";

import { useState, useEffect } from "react";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { getCategoryExpensesByMonth } from "@/actions/expenses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { MONTHS } from "@/lib/constants/expense";

export function CategoryChartWithMonthSelector() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const currentYearOnly = currentYear; // For now, only show current year

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await getCategoryExpensesByMonth(selectedYear, selectedMonth);
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [selectedYear, selectedMonth]);

  return (
    <div className="rounded-2xl border-0 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.02),0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Spending by Category
            </h2>
            <p className="text-sm text-muted-foreground">
              Top expenses breakdown
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v || "0"))}
            >
              <SelectTrigger className="h-9 w-[140px] text-sm rounded-lg border-gray-200">
                {loading ? (
                  <div className="flex items-center justify-center w-full">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <SelectValue>
                    {MONTHS[selectedMonth]}
                  </SelectValue>
                )}
              </SelectTrigger>
              <SelectContent className="rounded-lg border-gray-200">
                {MONTHS.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="p-6 flex-1">
        {loading ? (
          <div className="h-[220px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CategoryDonutChart data={data} />
        )}
      </div>
    </div>
  );
}
