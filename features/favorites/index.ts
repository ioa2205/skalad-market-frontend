export {
  FavoriteButton,
  type FavoriteButtonProps,
} from "./components/FavoriteButton";
export {
  FavoritesView,
  type FavoritesViewProps,
} from "./components/FavoritesView";
export {
  FavoritesTabs,
  type FavoritesTabsProps,
  type FavoritesTabValue,
} from "./components/FavoritesTabs";
export { FavoritesPager } from "./components/FavoritesPager";

export {
  useFavoritedIds,
  useToggleFavorite,
  primeFavoritedIds,
} from "./api/favorites.client";
export { favoritesKeys, type FavoritesListParams } from "./api/queryKeys";

// `fetchFavorites` is in api/favorites.server.ts — import it from there
// directly in RSC; do not re-export here, since the file imports
// "server-only" which would poison every client bundle.
export type { FavoritesListResult } from "./api/favorites.server";
