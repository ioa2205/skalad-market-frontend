import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import {
  NuqsTestingAdapter,
  type OnUrlUpdateFunction,
} from "nuqs/adapters/testing";
import { afterEach, describe, expect, it, vi } from "vitest";

import ruMessages from "@/messages/ru.json";
import type { CategoryResponse } from "@/lib/api/schemas";

import { FilterSidebar } from "../components/FilterSidebar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/catalog",
  useSearchParams: () => new URLSearchParams(),
}));

const categories: CategoryResponse[] = [
  { id: 1, nameRu: "Материалы", nameUz: "M", nameEn: "M", slug: "materials", isActive: true },
  { id: 2, nameRu: "Текстиль", nameUz: "T", nameEn: "T", slug: "textile", isActive: true },
];

interface SetupOptions {
  searchParams?: Record<string, string>;
}

function setup({ searchParams }: SetupOptions = {}) {
  const onUrlUpdate = vi.fn() as unknown as OnUrlUpdateFunction & {
    mock: { calls: Array<Parameters<OnUrlUpdateFunction>> };
  };
  const utils = render(
    <NextIntlClientProvider
      locale="ru"
      messages={ruMessages as unknown as Record<string, never>}
    >
      <NuqsTestingAdapter
        searchParams={searchParams}
        onUrlUpdate={onUrlUpdate}
      >
        <FilterSidebar
          categories={categories}
          regions={[1, 2]}
          locale="ru"
        />
      </NuqsTestingAdapter>
    </NextIntlClientProvider>,
  );
  return { ...utils, onUrlUpdate };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("FilterSidebar", () => {
  it("clicking a category writes its slug into the URL", async () => {
    const user = userEvent.setup();
    const { onUrlUpdate, getByRole } = setup();

    await user.click(getByRole("button", { name: "Материалы" }));

    expect(onUrlUpdate).toHaveBeenCalled();
    const event = onUrlUpdate.mock.calls.at(-1)?.[0];
    expect(event?.searchParams.get("category")).toBe("materials");
    expect(event?.searchParams.get("page")).toBeNull();
  });

  it("toggling 'Только в наличии' updates URL state and resets page", async () => {
    const user = userEvent.setup();
    const { onUrlUpdate, getByRole } = setup({ searchParams: { page: "5" } });

    await user.click(getByRole("switch", { name: "Только в наличии" }));

    const event = onUrlUpdate.mock.calls.at(-1)?.[0];
    expect(event?.searchParams.get("inStock")).toBe("true");
    expect(event?.searchParams.get("page")).toBeNull();
  });

  it("'Сбросить фильтры' clears every URL parameter", async () => {
    const user = userEvent.setup();
    const { onUrlUpdate, getByRole } = setup({
      searchParams: {
        q: "стал",
        category: "materials",
        inStock: "true",
        verified: "true",
        page: "3",
        saleType: "WHOLESALE",
      },
    });

    await user.click(getByRole("button", { name: "Сбросить фильтры" }));

    const event = onUrlUpdate.mock.calls.at(-1)?.[0];
    const sp = event?.searchParams;
    expect(sp?.get("q")).toBeNull();
    expect(sp?.get("category")).toBeNull();
    expect(sp?.get("inStock")).toBeNull();
    expect(sp?.get("verified")).toBeNull();
    expect(sp?.get("saleType")).toBeNull();
  });
});
