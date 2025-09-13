import { Locale } from "next-intl";

export const locales = ["en", "es"] as const;

export const defaultLocale: Locale = "en";

export const COOKIE_NAME = "NEXT_LOCALE";
