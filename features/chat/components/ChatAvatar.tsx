"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

export interface ChatAvatarProps {
  name: string;
  url?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<ChatAvatarProps["size"]>, string> = {
  sm: "size-8 text-caption",
  md: "size-10 text-body-sm",
  lg: "size-12 text-body",
};

export function ChatAvatar({ name, url, className, size = "md" }: ChatAvatarProps) {
  const initials = getInitials(name);
  return (
    <Avatar className={cn(sizeClass[size], "bg-primary-50 text-primary-600", className)}>
      {url ? <AvatarImage src={url} alt={name} /> : null}
      <AvatarFallback className="bg-primary-50 font-semibold text-primary-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
