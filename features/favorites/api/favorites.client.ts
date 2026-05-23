"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { useIsAuthenticated } from "@/features/auth/hooks/useIsAuthenticated";
import { ApiError } from "@/lib/api/errors";
import { REQUEST_ID_HEADER } from "@/lib/http/requestId";
import { log } from "@/lib/log";

import { favoritesKeys } from "./queryKeys";

interface ProxyEnvelope<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface FavoriteToggleResponseShape {
  favorited: boolean;
}

async function callFavorite(
  productId: number,
  method: "POST" | "DELETE",
): Promise<FavoriteToggleResponseShape> {
  const response = await fetch(`/api/proxy/api/v1/favorites/${productId}`, {
    method,
    credentials: "include",
    headers: { accept: "application/json" },
  });
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  let json: ProxyEnvelope<FavoriteToggleResponseShape>;
  try {
    json = (await response.json()) as ProxyEnvelope<FavoriteToggleResponseShape>;
  } catch {
    throw new ApiError({
      code: "invalid.response",
      message: "invalid.response",
      status: response.status,
      correlationId,
    });
  }
  if (!response.ok || !json.success || !json.data) {
    throw new ApiError({
      code: json.message ?? "favorites.toggle.failed",
      message: json.message ?? "favorites.toggle.failed",
      status: response.status,
      correlationId,
    });
  }
  return json.data;
}

async function fetchFavoritedIds(): Promise<Set<number>> {
  // No dedicated id-only endpoint; we read page 1 with a generous perPage and
  // collect ids. Cheap enough — favorites are bounded — and it keeps
  // per-card state local to one cache key.
  const response = await fetch("/api/proxy/api/v1/favorites?page=1&perPage=200", {
    credentials: "include",
    headers: { accept: "application/json" },
  });
  const correlationId = response.headers.get(REQUEST_ID_HEADER) ?? undefined;
  let json: ProxyEnvelope<{ items: { id: number }[] }>;
  try {
    json = (await response.json()) as ProxyEnvelope<{ items: { id: number }[] }>;
  } catch {
    throw new ApiError({
      code: "invalid.response",
      message: "invalid.response",
      status: response.status,
      correlationId,
    });
  }
  if (!response.ok || !json.success || !json.data) {
    throw new ApiError({
      code: json.message ?? "favorites.list.failed",
      message: json.message ?? "favorites.list.failed",
      status: response.status,
      correlationId,
    });
  }
  return new Set(json.data.items.map((item) => item.id));
}

export function useFavoritedIds() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery<Set<number>>({
    queryKey: favoritesKeys.ids(),
    queryFn: fetchFavoritedIds,
    staleTime: 30_000,
    // Skip the request entirely for guests — the proxy would 401 and waste
    // a round-trip on every page navigation.
    enabled: isAuthenticated,
    retry: false,
  });
}

interface ToggleVariables {
  productId: number;
  /** Current favorited state — required so we know which verb to send. */
  favorited: boolean;
}

interface ToggleContext {
  previousIds: Set<number> | undefined;
}

/**
 * Optimistic favorite toggle. We snapshot the `ids()` cache, flip it
 * synchronously, fire the request, and roll back on error. Per-page list
 * caches are invalidated on success so the favorites page reflects removals.
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation<FavoriteToggleResponseShape, ApiError, ToggleVariables, ToggleContext>({
    mutationFn: ({ productId, favorited }) =>
      callFavorite(productId, favorited ? "DELETE" : "POST"),
    onMutate: async ({ productId, favorited }) => {
      await queryClient.cancelQueries({ queryKey: favoritesKeys.ids() });
      const previousIds = queryClient.getQueryData<Set<number>>(favoritesKeys.ids());
      const optimistic = new Set(previousIds ?? []);
      if (favorited) optimistic.delete(productId);
      else optimistic.add(productId);
      queryClient.setQueryData(favoritesKeys.ids(), optimistic);
      return { previousIds };
    },
    onError: (error, variables, context) => {
      if (context?.previousIds !== undefined) {
        queryClient.setQueryData(favoritesKeys.ids(), context.previousIds);
      } else {
        queryClient.removeQueries({ queryKey: favoritesKeys.ids() });
      }
      log.warn("favorites.toggle.failed", {
        productId: variables.productId,
        code: error.code,
        correlationId: error.correlationId,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKeys.all });
    },
  });
}

export function primeFavoritedIds(client: QueryClient, ids: number[]): void {
  client.setQueryData(favoritesKeys.ids(), new Set(ids));
}
