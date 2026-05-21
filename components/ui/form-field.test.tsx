import { describe, expect, it } from "vitest";

import { Input } from "@/components/ui/input";
import { renderWithIntl, screen } from "@/lib/test/render";

import { FormField, FormFieldControl } from "./form-field";

describe("FormField", () => {
  it("wires label htmlFor to control id", () => {
    renderWithIntl(
      <FormField label="Email">
        <FormFieldControl>
          <Input />
        </FormFieldControl>
      </FormField>,
    );
    const input = screen.getByLabelText("Email");
    expect(input).toBeInTheDocument();
    expect(input.id).toMatch(/^field-/);
  });

  it("propagates description and error to aria-describedby and aria-errormessage", () => {
    renderWithIntl(
      <FormField label="Password" description="At least 8 chars" error="Too short">
        <FormFieldControl>
          <Input />
        </FormFieldControl>
      </FormField>,
    );
    const input = screen.getByLabelText("Password");
    const describedBy = input.getAttribute("aria-describedby")?.split(" ") ?? [];
    expect(describedBy.length).toBe(2);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-errormessage");
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
  });

  it("does not flip aria-invalid when there is no error", () => {
    renderWithIntl(
      <FormField label="Name">
        <FormFieldControl>
          <Input />
        </FormFieldControl>
      </FormField>,
    );
    const input = screen.getByLabelText("Name");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-errormessage");
  });

  it("renders required indicator when required is true", () => {
    renderWithIntl(
      <FormField label="Phone" required>
        <FormFieldControl>
          <Input />
        </FormFieldControl>
      </FormField>,
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
