import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/feedback";
import { cn } from "@/lib/utils/cn";

type AttributeValue = string | number | boolean | null | undefined;

export interface AttributeListProps {
  attributes: Record<string, unknown> | null | undefined;
  /** Category name surfaced as a row when present. */
  categoryName?: string | undefined;
  className?: string;
}

const KNOWN_ROWS: ReadonlyArray<{
  key: string;
  /** Translation key under productDetail.attributes.label. */
  labelKey:
    | "category"
    | "material"
    | "dimensions"
    | "weight"
    | "color"
    | "minOrder"
    | "leadTime"
    | "availability"
    | "unit";
}> = [
  { key: "material", labelKey: "material" },
  { key: "dimensions", labelKey: "dimensions" },
  { key: "weight", labelKey: "weight" },
  { key: "color", labelKey: "color" },
  { key: "min_order", labelKey: "minOrder" },
  { key: "lead_time", labelKey: "leadTime" },
  { key: "availability", labelKey: "availability" },
];

function isPrintable(value: unknown): value is AttributeValue {
  return (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  );
}

function formatLabelFromKey(raw: string): string {
  return raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function AttributeList({
  attributes,
  categoryName,
  className,
}: AttributeListProps) {
  const tEmpty = useTranslations("productDetail.attributes.empty");
  const tLabel = useTranslations("productDetail.attributes.label");
  const tValue = useTranslations("productDetail.attributes.value");
  const tQty = useTranslations("productDetail.quantity");

  const attrs = (attributes ?? {}) as Record<string, unknown>;
  const unit = typeof attrs.unit === "string" ? attrs.unit : undefined;

  const knownRows = KNOWN_ROWS.flatMap(({ key, labelKey }) => {
    const value = attrs[key];
    if (value === undefined || value === null || value === "") return [];
    return [{ key, label: tLabel(labelKey), value, kind: labelKey }];
  });

  const knownKeySet = new Set([
    ...KNOWN_ROWS.map((r) => r.key),
    "unit",
    "tags",
  ]);
  const unknownRows = Object.entries(attrs)
    .filter(
      ([key, value]) =>
        !knownKeySet.has(key) && value !== undefined && value !== null && value !== "",
    )
    .map(([key, value]) => ({
      key,
      label: formatLabelFromKey(key),
      value,
      kind: "raw" as const,
    }));

  const hasCategory = Boolean(categoryName);
  const totalRows = (hasCategory ? 1 : 0) + knownRows.length + unknownRows.length;

  if (totalRows === 0) {
    return (
      <EmptyState
        title={tEmpty("title")}
        description={tEmpty("description")}
        className={className}
      />
    );
  }

  function renderValue(
    value: unknown,
    kind: (typeof KNOWN_ROWS)[number]["labelKey"] | "raw",
  ): string {
    if (!isPrintable(value)) return "";
    if (typeof value === "boolean") return value ? tValue("yes") : tValue("no");
    if (kind === "minOrder" && typeof value === "number") {
      return unit
        ? `${value} ${tQty("unit", { unit })}`
        : String(value);
    }
    return String(value);
  }

  return (
    <dl
      className={cn(
        "grid grid-cols-1 divide-y divide-border rounded-lg border border-border bg-bg-elevated",
        className,
      )}
    >
      {hasCategory ? (
        <Row label={tLabel("category")} value={categoryName!} />
      ) : null}
      {knownRows.map((row) => (
        <Row
          key={row.key}
          label={row.label}
          value={renderValue(row.value, row.kind)}
        />
      ))}
      {unknownRows.map((row) => (
        <Row
          key={row.key}
          label={row.label}
          value={renderValue(row.value, "raw")}
        />
      ))}
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4 px-4 py-3 text-body-sm md:grid-cols-[14rem_1fr]">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="text-fg">{value}</dd>
    </div>
  );
}
