import { Skeleton } from "@/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <div className="mx-auto flex w-full max-w-screen-xl gap-6 px-4 py-6 md:px-6">
      <div className="hidden w-72 shrink-0 lg:block">
        <Skeleton className="h-[480px] w-full rounded-lg" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-56 rounded-md" />
            <Skeleton variant="text" className="w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-11 w-72 rounded-full" />
            <Skeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
