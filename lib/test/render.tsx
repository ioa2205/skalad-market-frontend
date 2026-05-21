import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import type { ReactElement, ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/tooltip";
import ruMessages from "@/messages/ru.json";

interface Options extends Omit<RenderOptions, "wrapper"> {
  locale?: "ru" | "en" | "uz";
  messages?: Record<string, unknown>;
  searchParams?: Record<string, string>;
}

export function renderWithIntl(
  ui: ReactElement,
  { locale = "ru", messages, searchParams, ...rest }: Options = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <NextIntlClientProvider
      locale={locale}
      messages={(messages ?? (ruMessages as Record<string, unknown>)) as never}
    >
      <TooltipProvider delayDuration={0}>
        <NuqsTestingAdapter searchParams={searchParams}>
          {children}
        </NuqsTestingAdapter>
      </TooltipProvider>
    </NextIntlClientProvider>
  );
  return render(ui, { wrapper: Wrapper, ...rest });
}

export * from "@testing-library/react";
