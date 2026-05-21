export const categoryKeys = {
  all: ["category"] as const,
  list: (page: number, size: number) => [...categoryKeys.all, "list", page, size] as const,
  bySlug: (slug: string) => [...categoryKeys.all, "slug", slug] as const,
};
