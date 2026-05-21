"use client";

import { List, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { SearchInput } from "@/components/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

import { useCompanyDirectoryParams } from "../hooks/useCompanyDirectoryParams";

export interface CompanyDirectoryToolbarProps {
  className?: string;
}

export function CompanyDirectoryToolbar({
  className,
}: CompanyDirectoryToolbarProps) {
  const t = useTranslations("company.directory");
  const [params, setParams] = useCompanyDirectoryParams();
  const [draftQ, setDraftQ] = useState(params.q);

  useEffect(() => {
    setDraftQ(params.q);
  }, [params.q]);

  const isMap = params.view === "map";

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-3 md:flex-row md:items-center",
        className,
      )}
    >
      <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
      <div className="flex w-full items-center gap-2 md:w-auto">
        <SearchInput
          value={draftQ}
          onSearchChange={(next) => {
            setDraftQ(next);
            void setParams({ q: next });
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full md:w-72"
        />
        <Button
          variant="secondary"
          size="md"
          onClick={() =>
            void setParams({ view: isMap ? "grid" : "map" })
          }
          aria-pressed={isMap}
          aria-label={t("viewToggle.ariaLabel")}
        >
          {isMap ? <List aria-hidden="true" /> : <MapPin aria-hidden="true" />}
          <span className="hidden sm:inline">
            {isMap ? t("viewToggle.grid") : t("viewToggle.map")}
          </span>
        </Button>
      </div>
    </div>
  );
}
