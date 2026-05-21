import { Skeleton } from "@/components/ui/skeleton";

export default function AccountProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-1/3 rounded-md" />
        <Skeleton variant="text" className="w-2/3" />
      </div>
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-72 w-full rounded-lg" />
      <Skeleton className="h-44 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}
