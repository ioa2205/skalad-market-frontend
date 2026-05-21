import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 overflow-hidden rounded-xl p-[18px]">
      <Skeleton className="aspect-[5/4] w-full rounded-xl" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex items-center justify-between gap-2 pt-1">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </Card>
  );
}
