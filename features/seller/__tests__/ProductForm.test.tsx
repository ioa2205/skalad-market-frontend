import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen, waitFor } from "@/lib/test/render";
import { mswServer } from "@/lib/test/server";
import type { CategoryResponse } from "@/lib/api/schemas";

import { ProductForm } from "../components/products/ProductForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("sonner", async () => {
  const actual = await vi.importActual<typeof import("sonner")>("sonner");
  return { ...actual, toast: { success: vi.fn(), error: vi.fn() } };
});

const categories: CategoryResponse[] = [
  {
    id: 1,
    nameUz: "Materiallar",
    nameRu: "Материалы",
    nameEn: "Materials",
    slug: "materials",
    isActive: true,
  },
];

function Wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("<ProductForm />", () => {
  it("create mode: blocks submit without required fields and surfaces zod messages", async () => {
    renderWithIntl(
      <Wrapper>
        <ProductForm mode="create" companyId={42} categories={categories} />
      </Wrapper>,
    );
    await userEvent.click(screen.getByRole("button", { name: /создать/i }));

    await waitFor(() => {
      expect(screen.getByText(/Введите название/i)).toBeInTheDocument();
    });
  });

  it("create mode: posts a camelCase body with saleType + minProduct + price required", async () => {
    let captured: Record<string, unknown> | null = null;
    mswServer.use(
      http.post("http://localhost:3000/api/proxy/api/v1/products", async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { success: true, data: { id: 1, slug: "x" } },
          { headers: { "x-request-id": "req-test-create" } },
        );
      }),
    );
    const user = userEvent.setup();

    renderWithIntl(
      <Wrapper>
        <ProductForm
          mode="create"
          companyId={42}
          categories={categories}
          initialValues={{
            name: "Стальной лист",
            description: "ГОСТ 19903-2015",
            categoryId: 1,
            priceType: "FIXED",
            saleType: "WHOLESALE",
            price: 850,
            currency: "USD",
            regionId: 1,
            districtId: 101,
            minProduct: 5,
          }}
        />
      </Wrapper>,
    );

    await user.click(screen.getByRole("button", { name: /создать/i }));

    await waitFor(() => expect(captured).not.toBeNull());
    expect(captured).toMatchObject({
      companyId: 42,
      categoryId: 1,
      name: "Стальной лист",
      saleType: "WHOLESALE",
      minProduct: 5,
      currency: "USD",
      regionId: 1,
    });
    // No snake_case leakage from the create wire format.
    expect(captured).not.toHaveProperty("company_id");
    expect(captured).not.toHaveProperty("min_product");
  });

  it("edit mode: PUTs a snake_case body with no saleType / minProduct", async () => {
    let captured: Record<string, unknown> | null = null;
    let capturedMethod = "";
    mswServer.use(
      http.put(
        "http://localhost:3000/api/proxy/api/v1/products/77",
        async ({ request }) => {
          capturedMethod = request.method;
          captured = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(
            { success: true, data: { id: 77, slug: "x" } },
            { headers: { "x-request-id": "req-test-update" } },
          );
        },
      ),
    );
    const user = userEvent.setup();

    renderWithIntl(
      <Wrapper>
        <ProductForm
          mode="edit"
          productId={77}
          companyId={42}
          categories={categories}
          initialValues={{
            name: "Стальной лист",
            description: "Обновлено",
            categoryId: 1,
            priceType: "FIXED",
            price: 900,
            currency: "USD",
            regionId: 1,
          }}
        />
      </Wrapper>,
    );

    await user.click(screen.getByRole("button", { name: /^сохранить$/i }));

    await waitFor(() => expect(captured).not.toBeNull());
    expect(capturedMethod).toBe("PUT");
    expect(captured).toMatchObject({
      company_id: 42,
      category_id: 1,
      name: "Стальной лист",
      price_type: "FIXED",
      currency: "USD",
      region_id: 1,
    });
    expect(captured).not.toHaveProperty("saleType");
    expect(captured).not.toHaveProperty("minProduct");
  });
});
