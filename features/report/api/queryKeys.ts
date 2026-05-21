export const reportKeys = {
  all: ["reports"] as const,
  create: () => [...reportKeys.all, "create"] as const,
};
