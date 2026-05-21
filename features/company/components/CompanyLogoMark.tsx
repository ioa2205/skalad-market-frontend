import { MinioImage } from "@/components/media";
import { cn } from "@/lib/utils/cn";

export interface CompanyLogoMarkProps {
  name: string;
  logoUrl?: string | null | undefined;
  /** Pre-computed initials (e.g. "UM"); falls back to first 2 letters. */
  initials?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}

const SIZE = {
  md: "size-12 text-body font-semibold",
  lg: "size-16 text-h4 font-semibold",
  xl: "size-32 text-h2 font-bold",
} as const;

const SIZE_PIXELS = {
  md: "48px",
  lg: "64px",
  xl: "128px",
} as const;

export function CompanyLogoMark({
  name,
  logoUrl,
  initials,
  size = "md",
  className,
}: CompanyLogoMarkProps) {
  const text = (initials ?? name.slice(0, 2)).toUpperCase();

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary-500 text-fg-on-primary",
        SIZE[size],
        className,
      )}
    >
      {logoUrl ? (
        <MinioImage
          src={logoUrl}
          alt=""
          fill
          sizes={SIZE_PIXELS[size]}
          className="object-cover"
        />
      ) : (
        <span aria-hidden="true">{text}</span>
      )}
    </div>
  );
}
