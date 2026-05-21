import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

export interface UserAvatarProps {
  name?: string | null;
  src?: string | null;
  alt?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClass: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  sm: "size-8 text-caption",
  md: "size-10 text-body-sm",
  lg: "size-14 text-body",
};

export function UserAvatar({ name, src, alt, className, size = "md" }: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeClass[size], className)}>
      {src ? <AvatarImage src={src} alt={alt ?? name ?? ""} /> : null}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

function getInitials(name?: string | null): string {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  if (parts.length === 1) {
    const first = parts[0]!;
    return first.slice(0, 2).toUpperCase();
  }
  const a = parts[0]!.charAt(0);
  const b = parts[parts.length - 1]!.charAt(0);
  return `${a}${b}`.toUpperCase();
}
