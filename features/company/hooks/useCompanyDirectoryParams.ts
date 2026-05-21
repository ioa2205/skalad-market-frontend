"use client";

import { parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

const VIEW_MODES = ["grid", "map"] as const;

export const companyDirectoryParsers = {
  q: parseAsString.withDefault(""),
  view: parseAsStringLiteral(VIEW_MODES).withDefault("grid"),
};

export function useCompanyDirectoryParams() {
  return useQueryStates(companyDirectoryParsers, {
    history: "push",
    shallow: false,
  });
}
