import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { ResetConfirmForm } from "@/features/auth/components/ResetConfirmForm";

export default function ResetConfirmPage() {
  return (
    <AuthCard>
      <Suspense fallback={<ResetConfirmSkeleton />}>
        <ResetConfirmForm />
      </Suspense>
    </AuthCard>
  );
}

function ResetConfirmSkeleton() {
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
