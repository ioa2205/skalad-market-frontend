import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";

import { useCartStore } from "@/features/cart";
import type { ProductResponse } from "@/lib/api/schemas";
import { renderWithIntl, screen } from "@/lib/test/render";

import { ProductCard } from "../components/ProductCard";

// MSW listen/reset/close already wired globally in vitest.setup.ts.

beforeEach(() => {
  useCartStore.setState({ items: [], hasHydrated: true });
});

const baseProduct: ProductResponse = {
  id: 1,
  companyId: 10,
  sellerId: 100,
  categoryId: 1,
  name: "Листовая сталь 3мм",
  slug: "list-stali-3mm",
  shortDescription: null,
  description: null,
  priceType: "FIXED",
  price: "520",
  currency: "USD",
  regionId: 1,
  districtId: null,
  attributes: null,
  status: "APPROVED",
  isActive: true,
  isPromoted: false,
  promotedUntil: null,
  rejectReason: null,
  viewsCountCache: 0,
  favoritesCountCache: 0,
  createdAt: "2026-01-01T00:00:00",
  images: [],
};

function withQuery(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}

describe("ProductCard", () => {
  it("renders FIXED price as currency", () => {
    renderWithIntl(withQuery(<ProductCard product={baseProduct} companyName="Metal Trade" />));
    expect(screen.getByRole("heading", { name: /Листовая сталь/ })).toBeInTheDocument();
    expect(screen.getByText("Metal Trade")).toBeInTheDocument();
    expect(screen.getByText(/520/)).toBeInTheDocument();
  });

  it("renders FROM_PRICE with the от prefix", () => {
    renderWithIntl(
      withQuery(<ProductCard product={{ ...baseProduct, priceType: "FROM_PRICE" }} />),
    );
    expect(screen.getByText("от")).toBeInTheDocument();
  });

  it("renders NEGOTIABLE without a number", () => {
    renderWithIntl(
      withQuery(
        <ProductCard
          product={{ ...baseProduct, priceType: "NEGOTIABLE", price: null }}
        />,
      ),
    );
    expect(screen.getByText("По запросу")).toBeInTheDocument();
  });

  it("favorite button is keyboard-reachable and starts unpressed", () => {
    renderWithIntl(withQuery(<ProductCard product={baseProduct} />));
    const fav = screen.getByRole("button", { name: /Добавить в избранное/ });
    expect(fav).toHaveAttribute("aria-pressed", "false");
    expect(fav).not.toBeDisabled();
  });

  it("exposes a single keyboard-focusable open link", () => {
    renderWithIntl(withQuery(<ProductCard product={baseProduct} />));
    const openLink = screen.getByRole("link", {
      name: /Открыть карточку «Листовая сталь 3мм»/,
    });
    expect(openLink).toHaveAttribute("href", "/product/list-stali-3mm");
  });

  it("clicking 'Добавить в корзину' pushes a line into the Zustand cart", async () => {
    const user = userEvent.setup();
    renderWithIntl(
      withQuery(<ProductCard product={baseProduct} companyName="Metal Trade" />),
    );
    await user.click(screen.getByRole("button", { name: /Добавить в корзину/ }));
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      productId: 1,
      slug: "list-stali-3mm",
      companyId: 10,
      companyName: "Metal Trade",
      qty: 1,
    });
  });
});
