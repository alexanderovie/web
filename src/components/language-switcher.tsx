"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLocale } from "next-intl";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { locales } from "@/config";

// Opciones de idioma con tipado correcto
const localeOptions: {
  code: (typeof locales)[number];
  label: string;
  flag: string;
}[] = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();

  // Elimina el prefijo de idioma actual del pathname
  const pathWithoutLocale = pathname
    ? pathname.replace(/^\/(es|en)(\/|$)/, "/")
    : "/";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="px-2 py-2 rounded-md border bg-background hover:bg-muted transition-colors flex items-center justify-center h-10 w-10"
          aria-label="Cambiar idioma"
        >
          {localeOptions.find((l) => l.code === currentLocale)?.flag}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-20 min-w-0 ml-2 md:ml-0 flex justify-center"
      >
        {localeOptions.map((locale) => (
          <DropdownMenuItem key={locale.code} asChild>
            <Link
              href={`/${locale.code}${pathWithoutLocale}`}
              prefetch={false}
              className={
                "w-full flex justify-center items-center px-0 py-1.5 rounded transition-colors text-2xl " +
                (currentLocale === locale.code ? "bg-muted" : "hover:bg-accent")
              }
            >
              <span>{locale.flag}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
