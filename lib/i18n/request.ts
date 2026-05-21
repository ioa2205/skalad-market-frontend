import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { COOKIE_NAMES } from "../auth/cookies";

import { defaultLocale, isLocale } from "./config";

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieValue = store.get(COOKIE_NAMES.locale)?.value;
  const locale = isLocale(cookieValue) ? cookieValue : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages };
});
