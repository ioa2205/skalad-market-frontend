import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import {
  AttributeList,
  DeliveryPanel,
  DescriptionPanel,
  ImageGallery,
  PriceQuantityCard,
  ProductTabs,
  ReviewsPanel,
  SellerMiniCard,
  SimilarProductsStrip,
  TrustList,
} from "@/features/product";
import {
  fetchCompanyBySlug,
  fetchProductDetail,
} from "@/features/product/api/product.server";
import { ReportButton } from "@/features/report";
import {
  COOKIE_NAMES,
  readSessionIdCookie,
  setSessionIdCookie,
} from "@/lib/auth/cookies";

interface ProductCompanyInput {
  id: number;
  name: string;
  slug: string;
  logo_path?: string | null;
}

async function SellerMiniCardAsync({
  productCompany,
}: {
  productCompany: ProductCompanyInput;
}) {
  const { data: company } = await fetchCompanyBySlug(productCompany.slug);
  return (
    <SellerMiniCard
      company={{
        id: productCompany.id,
        name: productCompany.name,
        slug: productCompany.slug,
        logoPath: productCompany.logo_path ?? null,
        shortDescription: null,
        verified: company?.status === "VERIFIED",
      }}
      stats={{}}
      className="border-chrome-border"
    />
  );
}

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function pickUnit(attributes: Record<string, unknown> | null | undefined): string | undefined {
  const raw = (attributes ?? {})["unit"];
  return typeof raw === "string" && raw.length > 0 ? raw : undefined;
}

function pickMinOrder(
  attributes: Record<string, unknown> | null | undefined,
): number | undefined {
  // TODO(backend): expose minProduct in ProductDetailResponse.
  // Until then we honour `attributes.min_order` when sellers populate it.
  const raw = (attributes ?? {})["min_order"];
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  if (typeof raw === "string") {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return undefined;
}

function pickTags(
  attributes: Record<string, unknown> | null | undefined,
): ReadonlyArray<string> | undefined {
  const raw = (attributes ?? {})["tags"];
  if (!Array.isArray(raw)) return undefined;
  const tags = raw.filter((t): t is string => typeof t === "string" && t.length > 0);
  return tags.length > 0 ? tags : undefined;
}

async function ensureSessionId(): Promise<string> {
  const store = await cookies();
  const existing = readSessionIdCookie(store);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  try {
    setSessionIdCookie(store, fresh);
  } catch {
    // Setting cookies during render is permitted only in route handlers and
    // server actions; in pure RSC reads `cookies().set` will throw. Swallow
    // and let middleware (or the next mutation) persist the value — the
    // header still reaches the backend for view tracking.
    void COOKIE_NAMES.sessionId;
  }
  return fresh;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const sessionId = await ensureSessionId();

  const productResult = await fetchProductDetail({ slug, sessionId });
  if (productResult.status === "not-found") notFound();
  if (productResult.status === "error" || !productResult.data) {
    // Bubble to the route boundary so the user sees the correlation id.
    throw Object.assign(new Error("product.detail.failed"), {
      digest: productResult.error?.correlationId,
    });
  }

  const product = productResult.data;

  const attributes = product.attributes ?? null;
  const unit = pickUnit(attributes);
  const minOrder = pickMinOrder(attributes);
  const tags = pickTags(attributes);

  const numericPrice =
    typeof product.price === "string" ? Number(product.price) : (product.price ?? null);
  const safePrice =
    numericPrice !== null && Number.isFinite(numericPrice as number)
      ? (numericPrice as number)
      : null;

  const images =
    product.images?.map((image) => ({
      id: image.id,
      url: image.url,
      isPrimary: image.is_primary,
      alt: product.name,
    })) ?? [];

  const productCompany = product.company;

  const views = product.views_count_cache ?? 0;
  const categoryName = product.category?.name;

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <h1 className="text-h1 font-bold text-fg">{product.name}</h1>
        <ReportButton
          targetType="PRODUCT"
          targetId={product.id}
          targetLabel={product.name}
        />
      </header>

      <div className="flex flex-col gap-3.5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-3.5">
          <Card className="rounded-xl border-chrome-border p-[18px]">
            <ImageGallery images={images} productName={product.name} />
          </Card>

          <Card className="rounded-xl border-chrome-border p-[18px]">
            <ProductTabs
              description={
                <DescriptionPanel
                  description={product.description}
                  shortDescription={product.short_description}
                  {...(tags ? { tags } : {})}
                />
              }
              attributes={
                <AttributeList
                  attributes={attributes}
                  categoryName={categoryName}
                />
              }
              delivery={<DeliveryPanel />}
              reviews={<ReviewsPanel />}
            />
          </Card>
        </div>

        <aside className="flex w-full flex-col gap-3 lg:w-[337px]">
          <PriceQuantityCard
            productId={product.id}
            productName={product.name}
            productSlug={product.slug}
            companyId={productCompany?.id ?? 0}
            companyName={productCompany?.name}
            primaryImage={
              product.images?.find((img) => img.is_primary)?.url ??
              product.images?.[0]?.url
            }
            priceType={product.price_type}
            amount={safePrice}
            currency={product.currency}
            unit={unit}
            minOrder={minOrder}
            sellerPhone={undefined}
            categoryName={categoryName}
            views={views}
            className="border-chrome-border"
          />

          {productCompany ? (
            <Suspense
              fallback={
                <SellerMiniCard
                  company={{
                    id: productCompany.id,
                    name: productCompany.name,
                    slug: productCompany.slug,
                    logoPath: productCompany.logo_path ?? null,
                    shortDescription: null,
                    verified: false,
                  }}
                  stats={{}}
                  className="border-chrome-border"
                />
              }
            >
              <SellerMiniCardAsync productCompany={productCompany} />
            </Suspense>
          ) : null}

          <TrustList className="border-chrome-border" />
        </aside>
      </div>

      {product.similar_products && product.similar_products.length > 0 ? (
        <SimilarProductsStrip products={product.similar_products} />
      ) : null}
    </div>
  );
}
