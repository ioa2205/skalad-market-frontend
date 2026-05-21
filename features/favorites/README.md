# Favorites

Favorites combine **server-paged data** (`/favorites?page=&perPage=`) with
**optimistic toggling** so every `ProductCard` heart can flip instantly.

## Endpoints

| Method | Path                              | Returns                            |
| ------ | --------------------------------- | ---------------------------------- |
| GET    | `/api/v1/favorites?page&perPage`  | `PagedResponse<ProductResponse>`   |
| POST   | `/api/v1/favorites/{productId}`   | `{ favorited: true }`              |
| DELETE | `/api/v1/favorites/{productId}`   | `{ favorited: false }`             |

There is **no** company-favorite endpoint. The Companies tab on
`/favorites` is rendered disabled with a tooltip — see
`build-plan.md §1.1` for the gap and `§5 Phase 4` for the deferred-status.

## Query keys (`favorites.client.ts`)

```
favoritesKeys.all          // ["favorites"]
favoritesKeys.list({page,perPage})
favoritesKeys.ids()        // Set<number> of currently-favorited product ids
```

`ids()` powers the per-card "is this favorited?" lookup. Each card subscribes
to the same key, so a flip on one card is visible on every other surface
without a refetch.

## Invalidation strategy

```
toggle.mutate
  ├─ onMutate    → snapshot ids(), apply optimistic flip
  ├─ onError     → restore snapshot, log warn (favorites.toggle.failed)
  └─ onSettled   → invalidate favoritesKeys.all (ids + every list page)
```

Why `onSettled` and not `onSuccess`? If the mutation errored we still want
the next list refresh to come from the server, in case our snapshot is
itself stale.

## SSR seeding

`FavoritesView` calls `primeFavoritedIds(queryClient, items.map(p => p.id))`
on first render so the page-1 hearts already render filled — no flash of
empty hearts while the `ids()` query lands.

## Anonymous viewers

`useFavoritedIds()` has `retry: false` because the proxy returns 401 for
unauthenticated calls. An empty set is the correct UI for a signed-out
viewer; clicking a heart while signed out will surface the 401 via the
toggle mutation's `onError` — no special-casing needed.
