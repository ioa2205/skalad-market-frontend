"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

export interface TrendSeries {
  label: string;
  /** Color token class on stroke + label dot. */
  toneClass: string;
  data: { x: string; y: number }[];
  /** Headline value shown above the chart (e.g. "1500" or "3 500 $"). */
  headlineValue?: string;
  /** Optional delta line (e.g. "+3,4% за последний месяц"). */
  deltaLabel?: string;
  /** Short label used inside the hover tooltip (e.g. "Запасы"). */
  tooltipLabel?: string;
}

export interface TrendChartProps {
  series: TrendSeries[];
  /** Stable seven-or-so X labels shared across series. */
  xLabels: string[];
}

/**
 * Hand-rolled SVG area chart matching seller_dashboard_1.svg — a single
 * `chart-trend` line over a top-down gradient fill, faint vertical
 * gridlines, and a hover state (dashed marker line + ring dot + tooltip).
 *
 * No analytics endpoint yet — this consumes synthetic data fed by the
 * overview page so the chart renders something sensible.
 *
 * TODO(backend): replace with `/api/v1/analytics/seller-trend` once the
 * service exists; chart shape can stay the same.
 */
export function TrendChart({ series, xLabels }: TrendChartProps) {
  const t = useTranslations("seller.dashboard.overview.trend");
  const gradientId = useId();
  const [active, setActive] = useState<number | null>(null);

  // Geometry — viewBox units ≈ rendered px on a full-width dashboard card.
  const width = 1232;
  const height = 300;
  const padLeft = 44;
  const padRight = 8;
  const padTop = 16;
  const padBottom = 28;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const baseY = padTop + innerH;

  // Fixed 0–1000 scale to mirror the Figma y-axis (1000 / 700 / 500 / 200 / 0).
  const yMax = 1000;
  const yTickValues = [1000, 700, 500, 200, 0];

  const chartData = series[0]?.data ?? [];
  const pointCount = Math.max(chartData.length, 1);
  const stepX = pointCount > 1 ? innerW / (pointCount - 1) : innerW;

  const pointX = (index: number) => padLeft + index * stepX;
  const pointY = (value: number) =>
    baseY - (Math.min(value, yMax) / yMax) * innerH;

  const linePoints = chartData.map((point, index) => ({
    x: pointX(index),
    y: pointY(point.y),
  }));

  const linePath = linePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    linePoints.length > 0
      ? `${linePath} L ${linePoints[linePoints.length - 1]!.x.toFixed(1)} ${baseY} L ${linePoints[0]!.x.toFixed(1)} ${baseY} Z`
      : "";

  return (
    <section
      aria-labelledby="seller-trend-title"
      className="flex flex-col gap-4 rounded-lg border border-chrome-border bg-bg-elevated p-5"
    >
      <header className="flex flex-col gap-4">
        <h2 id="seller-trend-title" className="text-h3 font-bold text-fg">
          {t("title")}
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {series.map((serie) => (
            <li key={serie.label} className="flex flex-col gap-1">
              <p className="text-caption text-fg-muted">{serie.label}</p>
              {serie.headlineValue ? (
                <p className="text-h3 font-bold text-fg">
                  {serie.headlineValue}
                </p>
              ) : null}
              {serie.deltaLabel ? (
                <p className="text-caption text-success-soft-foreground">
                  {serie.deltaLabel}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </header>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={t("ariaLabel")}
        className="w-full"
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0"
            y1={padTop}
            x2="0"
            y2={baseY}
            gradientUnits="userSpaceOnUse"
            className="text-chart-trend"
          >
            <stop offset="0" stopColor="currentColor" stopOpacity={0.17} />
            <stop offset="1" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Vertical gridlines at each month. */}
        {chartData.map((_, index) => (
          <line
            key={`grid-${index}`}
            x1={pointX(index)}
            x2={pointX(index)}
            y1={padTop}
            y2={baseY}
            className="stroke-chrome-border"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {/* Y-axis tick labels. */}
        {yTickValues.map((value, index) => {
          const y = padTop + (index / (yTickValues.length - 1)) * innerH;
          return (
            <text
              key={`y-${value}`}
              x={padLeft - 10}
              y={y + 4}
              textAnchor="end"
              className="fill-fg-subtle text-[11px]"
            >
              {value}
            </text>
          );
        })}

        {/* Area fill + line. */}
        {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        <path
          d={linePath}
          fill="none"
          strokeWidth={2.5}
          className="stroke-chart-trend"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis month labels. */}
        {xLabels.map((label, index) => (
          <text
            key={`x-${label}-${index}`}
            x={pointX(index)}
            y={height - 8}
            textAnchor="middle"
            className={
              active === index
                ? "fill-chart-trend text-[11px] font-medium"
                : "fill-fg-muted text-[11px]"
            }
          >
            {label}
          </text>
        ))}

        {/* Hover marker — dashed line, ring dot. */}
        {active !== null && linePoints[active] ? (
          <g>
            <line
              x1={linePoints[active]!.x}
              x2={linePoints[active]!.x}
              y1={padTop}
              y2={baseY}
              className="stroke-chart-trend"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <circle
              cx={linePoints[active]!.x}
              cy={linePoints[active]!.y}
              r={6}
              className="fill-bg-elevated stroke-chart-trend"
              strokeWidth={3}
            />
          </g>
        ) : null}

        {/* Hover tooltip. */}
        {active !== null && linePoints[active]
          ? (() => {
              const tipW = 246;
              const tipH = 86;
              const cx = linePoints[active]!.x;
              const rawX = cx - tipW / 2;
              const tipX = Math.min(
                Math.max(rawX, padLeft),
                width - padRight - tipW,
              );
              const tipY = Math.max(linePoints[active]!.y - tipH - 14, padTop);
              const colW = (tipW - 32) / 3;
              return (
                <g>
                  <rect
                    x={tipX}
                    y={tipY}
                    width={tipW}
                    height={tipH}
                    rx={12}
                    className="fill-bg-elevated stroke-chrome-border"
                    strokeWidth={1}
                  />
                  <text
                    x={tipX + 16}
                    y={tipY + 22}
                    className="fill-fg-subtle text-[11px]"
                  >
                    {xLabels[active]}
                  </text>
                  {series.slice(0, 3).map((serie, i) => {
                    const value = serie.data[active]?.y ?? 0;
                    const colX = tipX + 16 + i * colW;
                    return (
                      <g key={`tip-${serie.label}`}>
                        <text
                          x={colX}
                          y={tipY + 46}
                          className="fill-fg-muted text-[11px]"
                        >
                          {serie.tooltipLabel ?? serie.label}
                        </text>
                        <text
                          x={colX}
                          y={tipY + 68}
                          className="fill-chart-trend text-[15px] font-bold"
                        >
                          {value.toLocaleString("ru-RU")}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()
          : null}

        {/* Invisible hover hit-zones, one per month. */}
        {chartData.map((_, index) => (
          <rect
            key={`hit-${index}`}
            x={pointX(index) - stepX / 2}
            y={padTop}
            width={stepX}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setActive(index)}
          />
        ))}
      </svg>
    </section>
  );
}
