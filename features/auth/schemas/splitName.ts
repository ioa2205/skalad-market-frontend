/**
 * Split a "Имя" / "Имя Фамилия" input into the firstName + lastName pair the
 * backend `RegistrationDTO` requires (both `@NotBlank`).
 *
 * The Figma renders a single "Имя" field, but the backend rejects blank
 * lastName. We require at least one whitespace separator at the form layer
 * and split on the first run of whitespace — every token after the first
 * collapses into `lastName` so multi-word surnames survive.
 */
export interface FullName {
  firstName: string;
  lastName: string;
}

export function splitFullName(value: string): FullName {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return { firstName: "", lastName: "" };
  const idx = trimmed.indexOf(" ");
  if (idx === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, idx),
    lastName: trimmed.slice(idx + 1),
  };
}

export function isFullNameComplete(value: string): boolean {
  const { firstName, lastName } = splitFullName(value);
  return firstName.length > 0 && lastName.length > 0;
}
