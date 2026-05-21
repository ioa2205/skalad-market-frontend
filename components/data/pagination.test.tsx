import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { Pagination, paginatorFromInput } from "./pagination";

describe("paginatorFromInput", () => {
  it("normalizes manual shape", () => {
    expect(paginatorFromInput({ kind: "manual", page: 3, perPage: 10, totalItems: 95 }))
      .toEqual({ page: 3, totalPages: 10 });
  });

  it("clamps manual page above total", () => {
    expect(paginatorFromInput({ kind: "manual", page: 99, perPage: 10, totalItems: 25 }))
      .toEqual({ page: 3, totalPages: 3 });
  });

  it("converts spring 0-indexed page to 1-indexed", () => {
    expect(
      paginatorFromInput({
        kind: "spring",
        number: 4,
        size: 10,
        totalPages: 8,
        totalElements: 78,
      }),
    ).toEqual({ page: 5, totalPages: 8 });
  });

  it("guards against zero total pages from spring", () => {
    expect(
      paginatorFromInput({
        kind: "spring",
        number: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
      }),
    ).toEqual({ page: 1, totalPages: 1 });
  });
});

describe("Pagination", () => {
  it("renders nothing when there is a single page", () => {
    const { container } = renderWithIntl(
      <Pagination
        paginator={{ kind: "manual", page: 1, perPage: 10, totalItems: 5 }}
        onPageChange={() => {}}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("invokes onPageChange when a page button is clicked", () => {
    const handler = vi.fn();
    renderWithIntl(
      <Pagination
        paginator={{ kind: "manual", page: 1, perPage: 10, totalItems: 50 }}
        onPageChange={handler}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Страница 3/ }));
    expect(handler).toHaveBeenCalledWith(3);
  });

  it("disables previous on first page and next on last page", () => {
    const { rerender } = renderWithIntl(
      <Pagination
        paginator={{ kind: "manual", page: 1, perPage: 10, totalItems: 30 }}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Назад" })).toBeDisabled();

    rerender(
      <Pagination
        paginator={{ kind: "manual", page: 3, perPage: 10, totalItems: 30 }}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Вперёд" })).toBeDisabled();
  });

  it("renders ellipsis when totals are large", () => {
    renderWithIntl(
      <Pagination
        paginator={{ kind: "manual", page: 5, perPage: 10, totalItems: 200 }}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getAllByText("…").length).toBeGreaterThan(0);
  });
});
