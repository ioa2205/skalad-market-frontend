import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthTabs } from "@/features/auth/components/AuthTabs";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard>
      <div className="flex flex-col gap-6">
        <AuthTabs />
        <Suspense fallback={<RegisterSkeleton />}>
          <RegisterForm />
        </Suspense>
      </div>
    </AuthCard>
  );
}

function RegisterSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      {Array.from({ length: 5 }).map((_, idx) => (
        <Skeleton key={idx} className="h-11 rounded-md" />
      ))}
      <Skeleton className="h-12 rounded-full" />
    </div>
  );
}
