import { Skeleton } from "@/components/ui/skeleton";

export default function SellerSettingsLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  );
}
