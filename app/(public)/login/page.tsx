import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthTabs } from "@/features/auth/components/AuthTabs";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard>
      <div className="flex flex-col gap-6">
        <AuthTabs />
        <Suspense fallback={<LoginSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </AuthCard>
  );
}

function LoginSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
      <Skeleton className="h-11 rounded-md" />
      <Skeleton className="h-11 rounded-md" />
      <Skeleton className="h-12 rounded-full" />
    </div>
  );
}
