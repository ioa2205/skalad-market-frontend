import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

function Fixture() {
  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
        <TabsTrigger value="c">C</TabsTrigger>
      </TabsList>
      <TabsContent value="a">Panel A</TabsContent>
      <TabsContent value="b">Panel B</TabsContent>
      <TabsContent value="c">Panel C</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("supports arrow-key navigation between triggers", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Fixture />);

    const a = screen.getByRole("tab", { name: "A" });
    a.focus();
    expect(a).toHaveAttribute("data-state", "active");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "B" })).toHaveAttribute("data-state", "active");

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "C" })).toHaveAttribute("data-state", "active");

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "A" })).toHaveAttribute("data-state", "active");
  });

  it("renders only the active panel content", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Fixture />);
    expect(screen.getByText("Panel A")).toBeInTheDocument();
    expect(screen.queryByText("Panel B")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "B" }));
    expect(screen.getByText("Panel B")).toBeInTheDocument();
  });
});
