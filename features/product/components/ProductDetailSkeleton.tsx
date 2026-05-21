import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <Skeleton className="h-9 w-72 rounded-md" />
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="size-20 rounded-md" />
            ))}
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-80">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
