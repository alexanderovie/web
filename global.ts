import { locales } from "./src/config";

// Elimina la referencia directa a messages, solo tipa como 'any' o deja Messages genérico

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: any; // O usa 'unknown' si prefieres mayor seguridad
  }
}
