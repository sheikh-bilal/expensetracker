"use client";

import { useState, useEffect } from "react";
import { CategoryDonutChart } from "@/components/dashboard/category-donut-chart";
import { getCategoryExpensesByMonth } from "@/actions/expenses";
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
import { Skeleton } from "@/components/ui/skeleton";
import { MONTHS } from "@/lib/constants/expense";

type CategoryExpense = { category: string; amount: number; percentage: number };

export function CategoryChartWithMonthSelector() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [data, setData] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await getCategoryExpensesByMonth(
        currentYear,
        selectedMonth,
      );
      setData(result);
      setLoading(false);
    }
    loadData();
  }, [currentYear, selectedMonth]);

  return (
    <Card className="h-full gap-0 p-0">
      <CardHeader className="border-b !pb-4">
        <CardTitle className="text-sm font-semibold">Where It Went</CardTitle>
        <CardDescription className="text-xs">
          Spending by category
        </CardDescription>
        <CardAction>
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(parseInt(v || "0"))}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue>{MONTHS[selectedMonth]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, index) => (
                <SelectItem key={month} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="flex-1 py-6">
        {loading ? (
          <div className="flex h-full flex-col items-center gap-8 lg:flex-row">
            <Skeleton className="h-[220px] w-[220px] shrink-0 rounded-full" />
            <div className="w-full space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <CategoryDonutChart data={data} />
        )}
      </CardContent>
    </Card>
  );
}
