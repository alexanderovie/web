import { cookies } from "next/headers";

import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { COOKIE_NAME, defaultLocale, locales } from "../config";

export default getRequestConfig(async ({ requestLocale }) => {
  // Leer del segmento [lang] si existe
  let candidate = await requestLocale;

  if (!candidate) {
    // Leer de la cookie si el usuario está logueado
    const store = await cookies();
    candidate = store.get(COOKIE_NAME)?.value;
  }

  const locale = hasLocale(locales, candidate) ? candidate : defaultLocale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
