"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAiAgentStore } from "@/stores/ai-agent";

/**
 * Single global "AI agent — coming soon" drawer. Subscribes to the AI-agent
 * store so the top-bar pill and the ⌘+K hotkey both surface the same panel.
 */
export function AiAgentDrawer() {
  const t = useTranslations("aiAgent.drawer");
  const open = useAiAgentStore((s) => s.open);
  const setOpen = useAiAgentStore((s) => s.setOpen);

  const handleNotify = () => {
    toast.success(t("notifyToastTitle"), {
      description: t("notifyToastBody"),
    });
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <Sparkles aria-hidden="true" className="size-5" />
            </span>
            <DrawerTitle>{t("title")}</DrawerTitle>
          </div>
          <DrawerDescription>{t("body")}</DrawerDescription>
        </DrawerHeader>

        <ul className="flex flex-col gap-3 px-4 pb-2 text-body-sm text-fg">
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-2 size-1.5 rounded-full bg-primary-500" />
            <span>{t("bullet1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-2 size-1.5 rounded-full bg-primary-500" />
            <span>{t("bullet2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span aria-hidden="true" className="mt-2 size-1.5 rounded-full bg-primary-500" />
            <span>{t("bullet3")}</span>
          </li>
        </ul>

        <DrawerFooter>
          <Button onClick={handleNotify}>{t("notifyCta")}</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("dismiss")}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
