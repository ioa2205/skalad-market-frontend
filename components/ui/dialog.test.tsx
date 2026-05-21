import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function Fixture() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent closeLabel="Close">
        <DialogHeader>
          <DialogTitle>Hello</DialogTitle>
          <DialogDescription>Body</DialogDescription>
        </DialogHeader>
        <Button>Inside</Button>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("opens, traps focus to a content child, and closes on escape", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Fixture />);

    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("restores focus to the trigger after close", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Fixture />);

    const trigger = screen.getByRole("button", { name: "Open" });
    await user.click(trigger);
    await user.keyboard("{Escape}");

    expect(document.activeElement).toBe(trigger);
  });
});
