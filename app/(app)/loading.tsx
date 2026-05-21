import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex w-full flex-col gap-10 bg-bg p-10">
      <div className="flex h-12 gap-3">
        <Skeleton className="h-12 w-40 rounded-lg" />
        <Skeleton className="h-12 flex-1 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[187px] w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="rounded-xl bg-bg-elevated px-[62px] pb-6">
        <div className="flex h-12 items-center justify-between">
          <Skeleton className="h-[30px] w-[190px] rounded-md" />
          <Skeleton className="h-12 w-[245px] rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-[13px] pt-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[353px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
