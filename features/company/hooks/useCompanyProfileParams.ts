"use client";

import { parseAsStringLiteral, useQueryStates } from "nuqs";

const TABS = ["products", "reviews"] as const;
export type CompanyProfileTab = (typeof TABS)[number];

export const companyProfileParsers = {
  tab: parseAsStringLiteral(TABS).withDefault("products"),
};

export function useCompanyProfileParams() {
  return useQueryStates(companyProfileParsers, {
    history: "push",
    shallow: false,
  });
}
