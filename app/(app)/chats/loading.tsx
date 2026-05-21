import { Skeleton } from "@/components/ui/skeleton";

export default function ChatsLoading() {
  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
      <div className="flex flex-col gap-3 border-r border-border bg-bg-elevated p-4">
        <Skeleton className="h-10 w-full rounded-md" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-1 py-2">
            <Skeleton variant="circle" className="size-10" />
            <div className="flex w-full flex-col gap-2">
              <Skeleton variant="text" className="w-2/3" />
              <Skeleton variant="text" className="w-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="hidden md:flex md:flex-col md:gap-3 md:p-6">
        <Skeleton className="h-12 w-1/3 rounded-md" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  );
}
