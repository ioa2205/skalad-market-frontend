export const locales = ["ru", "en", "uz"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function toAcceptLanguage(locale: Locale | string | undefined): "RU" | "EN" | "UZ" {
  switch (locale) {
    case "ru":
      return "RU";
    case "en":
      return "EN";
    case "uz":
      return "UZ";
    default:
      return "UZ";
  }
}
