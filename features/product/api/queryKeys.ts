export const productKeys = {
  all: ["product"] as const,
  detail: (slug: string) => ["product", "detail", slug] as const,
  similar: (slug: string) => ["product", "similar", slug] as const,
} as const;
