import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="h-12 rounded-full" />
      <Skeleton className="h-11 rounded-md" />
      <Skeleton className="h-11 rounded-md" />
      <Skeleton className="h-12 rounded-full" />
    </div>
  );
}
