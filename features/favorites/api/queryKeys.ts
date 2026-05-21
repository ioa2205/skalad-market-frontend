export interface FavoritesListParams {
  page: number;
  perPage: number;
}

export const favoritesKeys = {
  all: ["favorites"] as const,
  list: (params: FavoritesListParams) =>
    [...favoritesKeys.all, "list", params] as const,
  ids: () => [...favoritesKeys.all, "ids"] as const,
};
