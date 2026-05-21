import { FavoritesView } from "@/features/favorites";
import { fetchFavorites } from "@/features/favorites/api/favorites.server";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const page = clampPage(numberParam(sp.page) ?? 1);
  const result = await fetchFavorites({ page, perPage: PER_PAGE });

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <FavoritesView items={result.items} meta={result.meta} error={result.error} />
    </div>
  );
}

function stringParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function numberParam(value: string | string[] | undefined): number | undefined {
  const raw = stringParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function clampPage(page: number): number {
  return Math.max(1, Math.floor(page));
}
