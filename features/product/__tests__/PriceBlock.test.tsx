import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { PriceBlock } from "../components/PriceBlock";

describe("PriceBlock", () => {
  it("renders FIXED price with no prefix", () => {
    renderWithIntl(
      <PriceBlock priceType="FIXED" amount={850} currency="USD" />,
    );
    expect(screen.queryByText("от")).not.toBeInTheDocument();
    expect(screen.getByText(/850/)).toBeInTheDocument();
  });

  it("renders FROM_PRICE with the от prefix", () => {
    renderWithIntl(
      <PriceBlock priceType="FROM_PRICE" amount={850} currency="USD" />,
    );
    expect(screen.getByText("от")).toBeInTheDocument();
    expect(screen.getByText(/850/)).toBeInTheDocument();
  });

  it("renders NEGOTIABLE without an amount", () => {
    renderWithIntl(
      <PriceBlock priceType="NEGOTIABLE" amount={null} currency="USD" />,
    );
    expect(screen.getByText("По запросу")).toBeInTheDocument();
    expect(screen.queryByText(/850/)).not.toBeInTheDocument();
  });

  it("renders unit and minimum-order hint when provided", () => {
    renderWithIntl(
      <PriceBlock
        priceType="FROM_PRICE"
        amount={850}
        currency="USD"
        unit="ton"
        minOrder={5}
      />,
    );
    expect(screen.getByText("за тонн")).toBeInTheDocument();
    expect(screen.getByText(/Минимальный заказ: 5/)).toBeInTheDocument();
  });
});
