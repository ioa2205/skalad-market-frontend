"use client";

import { useAiAgentHotkey } from "../hooks/useAiAgentHotkey";

import { AiAgentDrawer } from "./AiAgentDrawer";

/**
 * One-shot client-only mount. Lives inside the (app) layout so the drawer is
 * available on every authenticated route and the ⌘+K binding is wired once.
 */
export function AiAgentMount() {
  useAiAgentHotkey();
  return <AiAgentDrawer />;
}
