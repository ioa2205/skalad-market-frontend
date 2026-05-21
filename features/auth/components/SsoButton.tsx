"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * Disabled "Войти через SKLAD ERP" CTA. Backend SSO endpoint does not exist
 * (build-plan §1, decision #7); we render the affordance with a "скоро"
 * tooltip so users know it's coming.
 */
export function SsoButton() {
  const t = useTranslations("auth.login");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span tabIndex={0} className="block w-full" aria-describedby="sso-hint">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled
            aria-disabled="true"
            className="h-[51px] w-full rounded-2xl"
          >
            {t("sso")}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent id="sso-hint">{t("ssoTooltip")}</TooltipContent>
    </Tooltip>
  );
}
