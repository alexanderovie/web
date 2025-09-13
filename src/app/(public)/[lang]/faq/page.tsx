import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

import FaqPageClient from "./FaqPageClient";
import Hero from "@/components/sections/hero";

// TODO: Cuando Next.js lo permita, cambiar a params: { lang: string } y eliminar el await
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as "en" | "es";
  const t = await getTranslations({ locale, namespace: "Faq" });
  const title = t("meta.title");
  const description = t("meta.description");
  const keywords = [
    t("meta.keyword1"),
    t("meta.keyword2"),
    t("meta.keyword3"),
    t("meta.keyword4"),
  ].join(", ");
  const baseUrl = "https://fascinantedigital.com";
  const url = `${baseUrl}/${locale}/faq`;
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${baseUrl}/es/faq`,
        en: `${baseUrl}/en/faq`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Fascinante Digital",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang as "en" | "es",
    namespace: "faqPage",
  });

  // Título personalizado para dividir en 2 líneas como otras páginas
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

  // Configuración del Hero con el mismo estilo de otras páginas
  const heroProps = {
    badge: t("hero.badge"),
    title: customTitle,
    subtitle: t("hero.subtitle"),
    showButton: false,
    showCarousel: false,
  };

  return (
    <main className="bg-white">
      {/* HERO */}
      <div className="pb-0 -mb-16">
        <Hero {...heroProps} />
      </div>

      {/* FAQ SECTION */}
      <div className="pt-0 pb-16">
        <FaqPageClient />
      </div>
    </main>
  );
}
