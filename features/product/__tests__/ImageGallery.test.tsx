import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { ImageGallery } from "../components/ImageGallery";

const images = [
  { id: "img-1", url: "/images/list-1.jpg", isPrimary: true },
  { id: "img-2", url: "/images/list-2.jpg" },
  { id: "img-3", url: "/images/list-3.jpg" },
];

describe("ImageGallery", () => {
  it("renders the empty placeholder when no images are provided", () => {
    renderWithIntl(<ImageGallery images={[]} productName="Листовая сталь" />);
    expect(
      screen.getByText("Фотографии ещё не загружены."),
    ).toBeInTheDocument();
  });

  it("activates the next thumbnail with ArrowRight", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ImageGallery images={images} productName="Листовая сталь" />);
    const carousel = screen.getByRole("group");
    carousel.focus();
    expect(
      screen.getByRole("tab", { name: "Фото 1 из 3" }),
    ).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}");
    expect(
      screen.getByRole("tab", { name: "Фото 2 из 3" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("wraps around on ArrowLeft from the first thumb", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ImageGallery images={images} productName="Листовая сталь" />);
    screen.getByRole("group").focus();
    await user.keyboard("{ArrowLeft}");
    expect(
      screen.getByRole("tab", { name: "Фото 3 из 3" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("jumps to first/last with Home/End", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ImageGallery images={images} productName="Листовая сталь" />);
    screen.getByRole("group").focus();
    await user.keyboard("{End}");
    expect(
      screen.getByRole("tab", { name: "Фото 3 из 3" }),
    ).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Home}");
    expect(
      screen.getByRole("tab", { name: "Фото 1 из 3" }),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("activates a thumb on click", async () => {
    const user = userEvent.setup();
    renderWithIntl(<ImageGallery images={images} productName="Листовая сталь" />);
    await user.click(screen.getByRole("tab", { name: "Фото 3 из 3" }));
    expect(
      screen.getByRole("tab", { name: "Фото 3 из 3" }),
    ).toHaveAttribute("aria-selected", "true");
  });
});
