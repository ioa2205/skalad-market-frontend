import { Skeleton } from "@/components/ui/skeleton";

export default function ResetConfirmLoading() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-8 w-56 rounded-md" />
      <Skeleton className="h-11 rounded-md" />
      <Skeleton className="h-11 rounded-md" />
      <Skeleton className="h-11 rounded-md" />
      <Skeleton className="h-12 rounded-full" />
    </div>
  );
}
