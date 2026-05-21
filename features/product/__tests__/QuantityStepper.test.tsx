import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { renderWithIntl, screen } from "@/lib/test/render";

import { QuantityStepper } from "../components/QuantityStepper";

function Harness({ initial = 1, min }: { initial?: number; min?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <QuantityStepper
      value={value}
      onChange={setValue}
      {...(min !== undefined ? { min } : {})}
    />
  );
}

describe("QuantityStepper", () => {
  it("clamps at the default minimum of 1", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Harness initial={1} />);
    const decrement = screen.getByRole("button", { name: "Уменьшить на один" });
    expect(decrement).toBeDisabled();
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(1);
    await user.click(screen.getByRole("button", { name: "Увеличить на один" }));
    expect(screen.getByRole("spinbutton")).toHaveValue(2);
  });

  it("respects an explicit minimum (min-order from backend)", async () => {
    const user = userEvent.setup();
    renderWithIntl(<Harness initial={5} min={5} />);
    const decrement = screen.getByRole("button", { name: "Уменьшить на один" });
    expect(decrement).toBeDisabled();
    const increment = screen.getByRole("button", { name: "Увеличить на один" });
    await user.click(increment);
    expect(screen.getByRole("spinbutton")).toHaveValue(6);
    await user.click(decrement);
    // After ticking back down, the minimum holds.
    expect(screen.getByRole("spinbutton")).toHaveValue(5);
    expect(decrement).toBeDisabled();
  });

  it("parses integer-only typed input and clamps below-min entries up", () => {
    renderWithIntl(<Harness initial={3} min={2} />);
    const input = screen.getByRole("spinbutton");
    // A direct change event simulates a paste / programmatic set; the
    // component should clamp values below the minimum back up to it.
    fireEvent.change(input, { target: { value: "1" } });
    expect(screen.getByRole("spinbutton")).toHaveValue(2);
    fireEvent.change(input, { target: { value: "12" } });
    expect(screen.getByRole("spinbutton")).toHaveValue(12);
  });
});
