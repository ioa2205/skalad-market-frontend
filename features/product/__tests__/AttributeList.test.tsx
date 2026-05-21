import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { AttributeList } from "../components/AttributeList";

describe("AttributeList", () => {
  it("renders the empty state when no attributes are present", () => {
    renderWithIntl(<AttributeList attributes={null} />);
    expect(
      screen.getByText("Характеристики пока не указаны"),
    ).toBeInTheDocument();
  });

  it("renders known keys with localized labels", () => {
    renderWithIntl(
      <AttributeList
        attributes={{
          material: "Сталь Ст3",
          dimensions: "1500 x 6000 мм",
          color: "Серый",
          availability: "В наличии",
        }}
      />,
    );
    expect(screen.getByText("Материал")).toBeInTheDocument();
    expect(screen.getByText("Сталь Ст3")).toBeInTheDocument();
    expect(screen.getByText("Размеры")).toBeInTheDocument();
    expect(screen.getByText("1500 x 6000 мм")).toBeInTheDocument();
    expect(screen.getByText("Цвет")).toBeInTheDocument();
    expect(screen.getByText("В наличии")).toBeInTheDocument();
  });

  it("formats the min-order row with the active unit", () => {
    renderWithIntl(
      <AttributeList attributes={{ min_order: 5, unit: "ton" }} />,
    );
    expect(screen.getByText("Минимальный заказ")).toBeInTheDocument();
    expect(screen.getByText(/5 тонн/)).toBeInTheDocument();
  });

  it("surfaces the category row when supplied", () => {
    renderWithIntl(
      <AttributeList attributes={{ material: "Сталь" }} categoryName="Металлы" />,
    );
    expect(screen.getByText("Категория")).toBeInTheDocument();
    expect(screen.getByText("Металлы")).toBeInTheDocument();
  });

  it("falls back to humanised labels for unknown keys", () => {
    renderWithIntl(
      <AttributeList attributes={{ custom_metric: "42" }} />,
    );
    expect(screen.getByText("Custom Metric")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders booleans as Да/Нет", () => {
    renderWithIntl(
      <AttributeList attributes={{ has_certificate: true }} />,
    );
    expect(screen.getByText("Да")).toBeInTheDocument();
  });
});
