"use client";

import { SellerRouteError } from "@/features/seller";

export default function SellerLeadsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SellerRouteError {...props} scope="leads" />;
}
