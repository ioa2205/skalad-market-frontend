import { Skeleton } from "@/components/ui/skeleton";

export default function ChatThreadLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-bg-elevated px-4 py-3">
        <Skeleton variant="circle" className="size-10" />
        <div className="flex flex-1 flex-col gap-1">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 py-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={i % 2 === 0 ? "self-start" : "self-end"}
          >
            <Skeleton className="h-10 w-64 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="border-t border-border bg-bg-elevated px-4 py-3">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
