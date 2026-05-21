import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { interFont } from "@/lib/fonts";
import { UrlStateProvider } from "@/lib/nuqs/provider";
import { QueryProvider } from "@/lib/query/provider";
import { cn } from "@/lib/utils/cn";

import "../styles/globals.css";

export const metadata: Metadata = {
  title: "SKLADx",
  description: "SKLADx marketplace",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} data-theme="light" className={cn(interFont.variable)}>
      <body className="min-h-screen bg-bg font-sans text-fg antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <TooltipProvider delayDuration={150}>
                <UrlStateProvider>{children}</UrlStateProvider>
              </TooltipProvider>
            </QueryProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
