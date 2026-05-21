import { Skeleton } from "@/components/ui/skeleton";

export default function SellerOnboardingLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 md:px-6">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </main>
  );
}
