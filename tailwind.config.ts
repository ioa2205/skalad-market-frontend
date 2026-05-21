import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const withAlpha = (token: string) => `hsl(var(${token}) / <alpha-value>)`;

const ramp = (prefix: string) =>
  Object.fromEntries(
    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
      step,
      withAlpha(`--${prefix}-${step}`),
    ]),
  );

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: ramp("primary"),
        neutral: {
          0: withAlpha("--neutral-0"),
          ...ramp("neutral"),
        },
        bg: {
          DEFAULT: withAlpha("--bg"),
          muted: withAlpha("--bg-muted"),
          elevated: withAlpha("--bg-elevated"),
          overlay: withAlpha("--bg-overlay"),
        },
        fg: {
          DEFAULT: withAlpha("--fg"),
          muted: withAlpha("--fg-muted"),
          subtle: withAlpha("--fg-subtle"),
          "on-primary": withAlpha("--fg-on-primary"),
        },
        border: {
          DEFAULT: withAlpha("--border"),
          strong: withAlpha("--border-strong"),
        },
        ring: withAlpha("--ring"),
        success: {
          DEFAULT: withAlpha("--success"),
          foreground: withAlpha("--success-foreground"),
          soft: withAlpha("--success-soft"),
          "soft-foreground": withAlpha("--success-soft-foreground"),
        },
        warning: {
          DEFAULT: withAlpha("--warning"),
          foreground: withAlpha("--warning-foreground"),
          soft: withAlpha("--warning-soft"),
          "soft-foreground": withAlpha("--warning-soft-foreground"),
        },
        danger: {
          DEFAULT: withAlpha("--danger"),
          foreground: withAlpha("--danger-foreground"),
          soft: withAlpha("--danger-soft"),
          "soft-foreground": withAlpha("--danger-soft-foreground"),
        },
        info: {
          DEFAULT: withAlpha("--info"),
          foreground: withAlpha("--info-foreground"),
          soft: withAlpha("--info-soft"),
          "soft-foreground": withAlpha("--info-soft-foreground"),
        },
        chrome: {
          sidebar: withAlpha("--surface-sidebar"),
          border: withAlpha("--border-chrome"),
          "input-border": withAlpha("--border-input"),
          divider: withAlpha("--divider-strong"),
          shortcut: withAlpha("--shortcut-bg"),
          icon: withAlpha("--icon-fg"),
          "avatar-ring": withAlpha("--avatar-ring"),
          "avatar-fg": withAlpha("--avatar-fg"),
          meta: withAlpha("--meta-fg"),
          strong: withAlpha("--text-strong"),
        },
        brand: {
          stroke: withAlpha("--brand-stroke"),
          "stroke-soft": withAlpha("--brand-stroke-soft"),
          accent: withAlpha("--brand-accent"),
          shade1: withAlpha("--brand-shade-1"),
          shade2: withAlpha("--brand-shade-2"),
        },
        kpi: {
          indigo: withAlpha("--kpi-indigo"),
          purple: withAlpha("--kpi-purple"),
        },
        chart: {
          trend: withAlpha("--chart-trend"),
        },
        catalog: {
          active: withAlpha("--catalog-active"),
          "control-border": withAlpha("--catalog-control-border"),
          "map-muted": withAlpha("--catalog-map-muted"),
          placeholder: withAlpha("--catalog-placeholder"),
          "verified-soft": withAlpha("--catalog-verified-soft"),
        },
        mod: {
          "btn-green": withAlpha("--mod-btn-green"),
          "btn-red": withAlpha("--mod-btn-red"),
          "btn-orange": withAlpha("--mod-btn-orange"),
          "btn-gray": withAlpha("--mod-btn-gray"),
          "badge-green": withAlpha("--mod-badge-green"),
          "badge-red": withAlpha("--mod-badge-red"),
          "badge-blue": withAlpha("--mod-badge-blue"),
          "badge-blue-fg": withAlpha("--mod-badge-blue-fg"),
          "badge-amber": withAlpha("--mod-badge-amber"),
          card: withAlpha("--mod-card"),
          border: withAlpha("--mod-border"),
          "desc-box": withAlpha("--mod-desc-box"),
          "menu-border": withAlpha("--mod-menu-border"),
          "menu-hover": withAlpha("--mod-menu-hover"),
          thumb: withAlpha("--mod-thumb"),
          meta: withAlpha("--mod-meta"),
          "meta-2": withAlpha("--mod-meta-2"),
          th: withAlpha("--mod-th"),
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
        "mod-xs": "var(--radius-mod-xs)",
        "mod-sm": "var(--radius-mod-sm)",
        mod: "var(--radius-mod)",
        "mod-lg": "var(--radius-mod-lg)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        h1: ["2rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        h2: ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        h4: ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1rem", { lineHeight: "1.5" }],
        body: ["0.9375rem", { lineHeight: "1.5" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
        overline: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.08em" }],
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--easing-standard)",
        decelerate: "var(--easing-decelerate)",
        accelerate: "var(--easing-accelerate)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-normal) var(--easing-standard)",
        "slide-up": "slide-up var(--duration-normal) var(--easing-standard)",
      },
    },
  },
  plugins: [animate],
};

export default config;
