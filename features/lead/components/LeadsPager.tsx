"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

import { Pagination } from "@/components/data/pagination";

export interface LeadsPagerProps {
  page: number;
  perPage: number;
  totalItems: number;
}

export function LeadsPager({ page, perPage, totalItems }: LeadsPagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const onPageChange = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Pagination
      paginator={{ kind: "manual", page, perPage, totalItems }}
      onPageChange={onPageChange}
    />
  );
}
