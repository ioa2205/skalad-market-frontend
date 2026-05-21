import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { RatingStars } from "./rating-stars";

const ARIA = "Рейтинг {value} из 5";
const NO_ARIA = "Рейтинг отсутствует";

describe("RatingStars", () => {
  it("renders an img role with the value-aware aria label when value is present", () => {
    renderWithIntl(
      <RatingStars value={4.6} ariaLabel="Рейтинг 4.6 из 5" noRatingAriaLabel={NO_ARIA} />,
    );
    expect(
      screen.getByRole("img", { name: "Рейтинг 4.6 из 5" }),
    ).toBeInTheDocument();
  });

  it("renders the no-rating aria label when value is null", () => {
    renderWithIntl(
      <RatingStars value={null} ariaLabel={ARIA} noRatingAriaLabel={NO_ARIA} />,
    );
    expect(screen.getByRole("img", { name: NO_ARIA })).toBeInTheDocument();
  });

  it("renders a dash (not '0') when showValue is true and value is missing", () => {
    renderWithIntl(
      <RatingStars
        value={null}
        ariaLabel={ARIA}
        noRatingAriaLabel={NO_ARIA}
        showValue
      />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText("0.0")).toBeNull();
  });

  it("formats the visible value to one decimal place when showValue is true", () => {
    renderWithIntl(
      <RatingStars
        value={4}
        ariaLabel="Рейтинг 4 из 5"
        noRatingAriaLabel={NO_ARIA}
        showValue
      />,
    );
    expect(screen.getByText("4.0")).toBeInTheDocument();
  });
});
