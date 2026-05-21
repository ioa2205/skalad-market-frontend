export const companyKeys = {
  root: ["company"] as const,
  detail: (slug: string) => ["company", "detail", slug] as const,
};
