import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationPreferencesLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 md:px-6">
      <Skeleton className="h-9 w-1/3 rounded-md" />
      <Skeleton variant="text" className="w-2/3" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
      <Skeleton className="ml-auto h-10 w-32 rounded-full" />
    </div>
  );
}
