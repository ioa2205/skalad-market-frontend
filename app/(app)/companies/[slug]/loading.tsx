import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyProfileLoading() {
  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <Skeleton className="h-9 w-32 rounded-md" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-44 w-full rounded-lg" />
          <Skeleton className="h-56 w-full rounded-lg" />
          <Skeleton className="h-44 w-full rounded-lg" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-72 rounded-full" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
