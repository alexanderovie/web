"use client";

import { useParams } from "next/navigation";

import { useTranslations } from "next-intl";

import AuditoriaAutocomplete from "./AuditoriaAutocomplete";

import Hero from "@/components/sections/hero";

export default function AuditoriaPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const t = useTranslations("auditoria");

  // Título personalizado para dividir en todas las vistas
  const customTitle = (
    <div className="text-4xl leading-tight tracking-tight md:text-5xl lg:!text-6xl">
      <span className="block">
        {t("hero.title").split(" ")[0]} {t("hero.title").split(" ")[1]}
      </span>
      <span className="block">
        {t("hero.title").split(" ").slice(2).join(" ")}
      </span>
    </div>
  );

  const heroProps = {
    badge: t("hero.badge"),
    title: customTitle,
    subtitle: t("hero.subtitle"),
    showButton: false,
    showCarousel: false,
  };

  return (
    <main className="bg-white">
      {/* SECCIÓN 1: HERO */}
      <div className="relative min-h-screen">
        <Hero {...heroProps} />

        {/* SECCIÓN 2: FORMULARIO DENTRO DEL HERO */}
        <div className="relative -mt-12 md:-mt-16 lg:-mt-20 pb-8 md:pb-12 lg:pb-16 bg-white">
          <div className="container flex justify-center">
            <div className="mx-auto max-w-2xl w-full bg-white">
              <AuditoriaAutocomplete lang={lang} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
