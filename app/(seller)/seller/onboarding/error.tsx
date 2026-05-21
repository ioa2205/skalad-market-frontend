"use client";

import { SellerRouteError } from "@/features/seller";

export default function SellerOnboardingError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-2xl px-4 py-12">
      <SellerRouteError {...props} scope="onboarding" />
    </main>
  );
}
