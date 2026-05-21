/**
 * Motion tokens — JS mirror of CSS custom properties in styles/tokens.css.
 * Framer Motion accepts numeric durations (seconds) and easing arrays.
 */

export const durations = {
  fast: 0.15,
  normal: 0.22,
  slow: 0.32,
} as const;

export const easings = {
  standard: [0.4, 0, 0.2, 1] as const,
  decelerate: [0, 0, 0.2, 1] as const,
  accelerate: [0.4, 0, 1, 1] as const,
};

export type DurationToken = keyof typeof durations;
export type EasingToken = keyof typeof easings;
