"use client";

import { SellerRouteError } from "@/features/seller";

export default function SellerProductNewError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SellerRouteError {...props} scope="products.new" />;
}
