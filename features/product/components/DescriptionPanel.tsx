import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";
import { Badge } from "@/components/ui/badge";

export interface DescriptionPanelProps {
  description?: string | null | undefined;
  shortDescription?: string | null | undefined;
  /** Optional tags surfaced from `attributes.tags` if backend exposes them. */
  tags?: ReadonlyArray<string> | undefined;
}

export function DescriptionPanel({
  description,
  shortDescription,
  tags,
}: DescriptionPanelProps) {
  const tEmpty = useTranslations("productDetail.description.empty");

  const body = description ?? shortDescription ?? "";

  if (!body) {
    return <EmptyState title={tEmpty("title")} description={tEmpty("description")} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="whitespace-pre-line text-body text-fg">{body}</p>
      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="neutral">
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
