/**
 * Query keys for the moderator dashboard. Centralised so invalidation after a
 * mutation (approve/reject/block) consistently refreshes the right lists.
 */
export const moderatorKeys = {
  all: ["moderator"] as const,
  products: {
    all: () => [...moderatorKeys.all, "products"] as const,
    queue: () => [...moderatorKeys.products.all(), "queue"] as const,
  },
  companies: {
    all: () => [...moderatorKeys.all, "companies"] as const,
    queue: () => [...moderatorKeys.companies.all(), "queue"] as const,
  },
  reports: {
    all: () => [...moderatorKeys.all, "reports"] as const,
    list: (status?: string) =>
      [...moderatorKeys.reports.all(), "list", status ?? "ALL"] as const,
    detail: (id: number) =>
      [...moderatorKeys.reports.all(), "detail", id] as const,
  },
  accounts: {
    all: () => [...moderatorKeys.all, "accounts"] as const,
    list: (filter?: { q?: string; status?: string; roles?: string }) =>
      [...moderatorKeys.accounts.all(), "list", filter ?? {}] as const,
  },
} as const;
