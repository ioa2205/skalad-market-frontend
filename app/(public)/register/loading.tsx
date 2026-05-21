import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterLoading() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-12 rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      {Array.from({ length: 5 }).map((_, idx) => (
        <Skeleton key={idx} className="h-11 rounded-md" />
      ))}
      <Skeleton className="h-12 rounded-full" />
    </div>
  );
}
