"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Two-up segmented control. Outlined card-style siblings, selected sibling
 * gets a soft primary fill. Used for the login Phone/Email picker, the
 * register Buyer/Seller picker, and similar binary toggles in later phases.
 *
 * Built on Radix Tabs so the keyboard contract (left/right arrow, Home/End,
 * Enter/Space) is handled by the primitive.
 */
export const SegmentedTabs = TabsPrimitive.Root;

export const SegmentedTabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...rest }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("grid w-full grid-cols-2 gap-3", className)}
    {...rest}
  />
));
SegmentedTabsList.displayName = "SegmentedTabsList";

export const SegmentedTabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...rest }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex flex-col items-center justify-center gap-0.5 rounded-xl border bg-bg-elevated px-4 py-3",
      "text-body-sm font-medium text-fg",
      "transition-colors duration-fast ease-standard",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "border-border hover:bg-bg-muted",
      "data-[state=active]:border-primary-200 data-[state=active]:bg-primary-50 data-[state=active]:text-primary-600",
      className,
    )}
    {...rest}
  />
));
SegmentedTabsTrigger.displayName = "SegmentedTabsTrigger";

export const SegmentedTabsContent = TabsPrimitive.Content;
