"use client";

import { SellerRouteError } from "@/features/seller";

export default function SellerSettingsError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <SellerRouteError {...props} scope="settings" />;
}
