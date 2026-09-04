import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ bodyHeight }: { bodyHeight: string }) {
  return (
    <Card className="h-full gap-0 p-0">
      <CardHeader className="border-b !pb-4 pt-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </CardHeader>
      <CardContent className="py-5">
        <Skeleton className={`w-full ${bodyHeight}`} />
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-7 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Skeleton className="h-64 w-full rounded-2xl xl:col-span-12" />

        <div className="xl:col-span-8">
          <CardSkeleton bodyHeight="h-[300px]" />
        </div>
        <div className="xl:col-span-4">
          <CardSkeleton bodyHeight="h-[300px]" />
        </div>

        <div className="xl:col-span-7">
          <CardSkeleton bodyHeight="h-[240px]" />
        </div>
        <div className="xl:col-span-5">
          <CardSkeleton bodyHeight="h-[240px]" />
        </div>

        <div className="xl:col-span-7">
          <CardSkeleton bodyHeight="h-[280px]" />
        </div>
        <div className="xl:col-span-5">
          <CardSkeleton bodyHeight="h-[280px]" />
        </div>
      </div>
    </div>
  );
}
