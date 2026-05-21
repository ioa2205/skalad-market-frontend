"use client";

import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type HTMLAttributes } from "react";
import { Drawer as DrawerPrimitive } from "vaul";

import { cn } from "@/lib/utils/cn";

export const Drawer = ({
  shouldScaleBackground = true,
  ...rest
}: ComponentPropsWithoutRef<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...rest} />
);
Drawer.displayName = "Drawer";

export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerPortal = DrawerPrimitive.Portal;
export const DrawerClose = DrawerPrimitive.Close;

export const DrawerOverlay = forwardRef<
  ElementRef<typeof DrawerPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...rest }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-50 bg-bg-overlay/60", className)}
    {...rest}
  />
));
DrawerOverlay.displayName = "DrawerOverlay";

export const DrawerContent = forwardRef<
  ElementRef<typeof DrawerPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>
>(({ className, children, ...rest }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-lg border border-border bg-bg-elevated shadow-lg",
        className,
      )}
      {...rest}
    >
      <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border-strong" />
      {children}
    </DrawerPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = "DrawerContent";

export function DrawerHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-1.5 p-4 text-left", className)} {...rest} />;
}

export function DrawerFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...rest} />;
}

export const DrawerTitle = forwardRef<
  ElementRef<typeof DrawerPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(({ className, ...rest }, ref) => (
  <DrawerPrimitive.Title
    ref={ref}
    className={cn("text-h3 font-semibold text-fg", className)}
    {...rest}
  />
));
DrawerTitle.displayName = "DrawerTitle";

export const DrawerDescription = forwardRef<
  ElementRef<typeof DrawerPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(({ className, ...rest }, ref) => (
  <DrawerPrimitive.Description
    ref={ref}
    className={cn("text-body-sm text-fg-muted", className)}
    {...rest}
  />
));
DrawerDescription.displayName = "DrawerDescription";
