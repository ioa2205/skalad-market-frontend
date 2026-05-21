"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { cn } from "@/lib/utils/cn";

import { AccountsTab } from "./AccountsTab";
import { CompaniesTab } from "./CompaniesTab";
import { OverviewTab } from "./OverviewTab";
import { ProductsTab } from "./ProductsTab";
import { ReportsTab } from "./ReportsTab";

const TAB_KEYS = [
  "overview",
  "products",
  "companies",
  "reports",
  "accounts",
] as const;

type TabKey = (typeof TAB_KEYS)[number];

/**
 * Moderator dashboard root. Owns the active tab in local state — the panel is
 * gated upstream by middleware + the route group, so we never render it for
 * users without the right role. Each tab fetches its own data on mount via
 * TanStack Query so a heavy tab (Accounts) doesn't slow down the default
 * Overview view.
 */
export function ModeratorPanel() {
  const t = useTranslations("moderator");
  const [active, setActive] = useState<TabKey>("overview");

  return (
    <section className="flex flex-col gap-10">
      <header>
        <h1 className="text-[30px] font-bold leading-tight text-chrome-strong">
          {t("title")}
        </h1>
      </header>

      <div
        role="tablist"
        aria-label={t("tabs.ariaLabel")}
        className="rounded-mod bg-bg-elevated"
      >
        <ul className="flex items-center gap-1 px-4">
          {TAB_KEYS.map((key) => {
            const selected = active === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`mod-panel-${key}`}
                  id={`mod-tab-${key}`}
                  onClick={() => setActive(key)}
                  className={cn(
                    "relative inline-flex h-14 items-center px-3 text-body-sm font-medium",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    selected
                      ? "text-chrome-strong after:absolute after:inset-x-2 after:bottom-0 after:h-[2px] after:rounded-full after:bg-primary-600"
                      : "text-mod-meta-2 hover:text-fg",
                  )}
                >
                  {t(`tabs.${key}` as const)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        role="tabpanel"
        id={`mod-panel-${active}`}
        aria-labelledby={`mod-tab-${active}`}
      >
        {active === "overview" ? <OverviewTab onJump={setActive} /> : null}
        {active === "products" ? <ProductsTab /> : null}
        {active === "companies" ? <CompaniesTab /> : null}
        {active === "reports" ? <ReportsTab /> : null}
        {active === "accounts" ? <AccountsTab /> : null}
      </div>
    </section>
  );
}
