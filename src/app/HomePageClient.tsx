"use client";

import { useParams } from "next/navigation";

import { useTranslations } from "next-intl";

import Accelerate from "@/components/sections/accelerate";
import Adaptive from "@/components/sections/adaptive";
import Faq from "@/components/sections/faq";
import Features from "@/components/sections/features";
import Hero from "@/components/sections/hero";
import Optimize from "@/components/sections/optimize";
import Partners from "@/components/sections/partners";
import Pricing from "@/components/sections/pricing";
import Testimonials from "@/components/sections/testimonials";

export default function HomePageClient() {
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const t = useTranslations("homepage");

  // Textos Hero
  const heroProps = {
    title: (
      <>
        {t("hero.titleLine1")}
        <br />
        {t("hero.titleLine2")}
      </>
    ),
    subtitle: t("hero.subtitle"),
    ctaText: t("hero.ctaDiagnostico"),
    ctaHref: `/${lang}/auditoria`,
    imageSrc: "/images/homepage/hero-desktop.webp",
    imageAlt: t("hero.imageAlt"),
  };

  // Features
  const featuresProps = {
    iconTitle: t("services.web.iconTitle"),
    title: t("services.web.title"),
    description: t("services.web.description"),
  };

  // Adaptive
  const adaptiveProps = {
    iconTitle: t("services.localDirectories.iconTitle"),
    title: t("services.localDirectories.title"),
    description: t("services.localDirectories.description"),
  };

  // Optimize
  const optimizeProps = {
    iconTitle: t("services.automation.iconTitle"),
    title: t("services.automation.title"),
    description: t("services.automation.description"),
  };

  // Accelerate
  const accelerateProps = {
    iconTitle: t("services.complementary.title"),
    title: t("services.complementary.title"),
    description: t("services.complementary.description"),
    timeline: [], // Si tienes timeline, adapta aquí
  };

  return (
    <>
      <Hero {...heroProps} />
      <Features {...featuresProps} />
      <Partners />
      <Adaptive {...adaptiveProps} />
      <Optimize {...optimizeProps} />
      <Accelerate {...accelerateProps} />
      <Testimonials />
      <Pricing />
      <Faq />
    </>
  );
}
