"use client";

import { SellerRouteError } from "@/features/seller";

export default function SellerProductEditError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SellerRouteError {...props} scope="products.edit" />;
}
