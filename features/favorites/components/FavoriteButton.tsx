"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";

import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils/cn";

import { useFavoritedIds, useToggleFavorite } from "../api/favorites.client";

export interface FavoriteButtonProps {
  productId: number;
  className?: string;
}

export function FavoriteButton({ productId, className }: FavoriteButtonProps) {
  const t = useTranslations("favorites.toggle");
  const tCard = useTranslations("productCard.favorite");
  const { data: ids } = useFavoritedIds();
  const favorited = ids?.has(productId) ?? false;

  const toggle = useToggleFavorite();

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggle.mutate(
      { productId, favorited },
      {
        onSuccess: (response) => {
          toast.success(
            response.favorited ? t("addedToast") : t("removedToast"),
          );
        },
        onError: (error) => {
          toast.error(tCard("failureTitle"), {
            description: error.correlationId
              ? t("errorWithId", { id: error.correlationId })
              : t("errorToast"),
          });
        },
      },
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={favorited}
      aria-busy={toggle.isPending || undefined}
      aria-label={favorited ? tCard("removeLabel") : tCard("addLabel")}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-bg-elevated/95 text-fg-muted shadow-sm",
        "transition-colors duration-fast ease-standard hover:text-danger",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        favorited && "text-danger",
        className,
      )}
    >
      <Heart
        className={cn("size-4", favorited && "fill-danger")}
        aria-hidden="true"
      />
    </button>
  );
}
