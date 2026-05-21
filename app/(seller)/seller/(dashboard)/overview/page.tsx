import { ContactRound, Inbox, Package } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import { fetchSellerCompanies } from "@/features/seller/api/company-onboarding.server";
import { fetchSellerProducts } from "@/features/seller/api/products.server";
import { fetchSellerLeads } from "@/features/seller/api/seller-leads.server";
import { KpiStatCard } from "@/features/seller/components/overview/KpiStatCard";
import { RecentSoldList } from "@/features/seller/components/overview/RecentSoldList";
import {
  TrendChart,
  type TrendSeries,
} from "@/features/seller/components/overview/TrendChart";
import { aggregateKpis } from "@/features/seller/utils/aggregateKpis";

export default async function SellerOverviewPage() {
  const t = await getTranslations("seller.dashboard.overview");

  const { companies } = await fetchSellerCompanies();
  const company = companies[0];
  const companyId = company?.id;

  const productsParams = {
    page: 1,
    perPage: 100,
    ...(companyId !== undefined ? { companyId } : {}),
  };
  const leadsParams = {
    page: 1,
    perPage: 100,
    ...(companyId !== undefined ? { companyId } : {}),
  };

  const [productsResult, leadsResult] = await Promise.all([
    fetchSellerProducts(productsParams),
    fetchSellerLeads(leadsParams),
  ]);

  if (productsResult.error && leadsResult.error) {
    return (
      <ErrorState
        title={t("loadErrorTitle")}
        description={t("loadErrorDescription")}
        correlationId={
          productsResult.error.correlationId ?? leadsResult.error.correlationId
        }
      />
    );
  }

  const kpis = aggregateKpis({
    products: productsResult.items,
    leads: leadsResult.items,
  });

  const trendSeries: TrendSeries[] = [
    {
      label: t("trend.seriesLeads"),
      toneClass: "stroke-chart-trend",
      data: STUB_TREND.leads,
      headlineValue: t("trend.stubLeadsValue"),
      deltaLabel: t("trend.stubDelta"),
      tooltipLabel: t("trend.tooltipLeads"),
    },
    {
      label: t("trend.seriesRevenue"),
      toneClass: "stroke-chart-trend",
      data: STUB_TREND.revenue,
      headlineValue: t("trend.stubRevenueValue"),
      deltaLabel: t("trend.stubDelta"),
      tooltipLabel: t("trend.tooltipRevenue"),
    },
    {
      label: t("trend.seriesProfit"),
      toneClass: "stroke-chart-trend",
      data: STUB_TREND.profit,
      headlineValue: t("trend.stubProfitValue"),
      deltaLabel: t("trend.stubDelta"),
      tooltipLabel: t("trend.tooltipProfit"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section
        aria-label={t("kpiSectionAria")}
        className="grid gap-2 md:grid-cols-3"
      >
        <KpiStatCard
          title={t("kpi.activeProductsTitle")}
          value={kpis.activeProducts.toLocaleString("ru-RU")}
          icon={Package}
          accent="indigo"
        />
        <KpiStatCard
          title={t("kpi.openLeadsTitle")}
          value={kpis.openLeads.toLocaleString("ru-RU")}
          icon={Inbox}
          accent="purple"
        />
        <KpiStatCard
          title={t("kpi.contactsTitle")}
          value={kpis.distinctContacts.toLocaleString("ru-RU")}
          icon={ContactRound}
          accent="purple"
        />
      </section>

      <TrendChart series={trendSeries} xLabels={STUB_TREND.xLabels} />

      <RecentSoldList
        products={productsResult.items}
        {...(company?.name ? { companyName: company.name } : {})}
      />
    </div>
  );
}

const STUB_TREND: {
  xLabels: string[];
  leads: { x: string; y: number }[];
  revenue: { x: string; y: number }[];
  profit: { x: string; y: number }[];
} = {
  xLabels: ["Март", "Апр", "Май", "Июнь", "Июль", "Авг", "Сен"],
  leads: [
    { x: "Март", y: 320 },
    { x: "Апр", y: 480 },
    { x: "Май", y: 410 },
    { x: "Июнь", y: 540 },
    { x: "Июль", y: 700 },
    { x: "Авг", y: 360 },
    { x: "Сен", y: 620 },
  ],
  revenue: [
    { x: "Март", y: 220 },
    { x: "Апр", y: 350 },
    { x: "Май", y: 300 },
    { x: "Июнь", y: 470 },
    { x: "Июль", y: 590 },
    { x: "Авг", y: 410 },
    { x: "Сен", y: 540 },
  ],
  profit: [
    { x: "Март", y: 110 },
    { x: "Апр", y: 200 },
    { x: "Май", y: 240 },
    { x: "Июнь", y: 320 },
    { x: "Июль", y: 410 },
    { x: "Авг", y: 280 },
    { x: "Сен", y: 360 },
  ],
};
