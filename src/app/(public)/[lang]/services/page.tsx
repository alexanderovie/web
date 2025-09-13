import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import Hero from "@/components/sections/hero";
import { Services10 } from "@/components/services10";

// Production: Next.js 15 App Router implementation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as "en" | "es";
  const t = await getTranslations({ locale, namespace: "Services" });
  const title = t("meta.title");
  const description = t("meta.description");
  const keywords = [
    t("meta.keyword1"),
    t("meta.keyword2"),
    t("meta.keyword3"),
    t("meta.keyword4"),
  ].join(", ");
  const baseUrl = "https://fascinantedigital.com";
  const url = `${baseUrl}/${locale}/services`;
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${baseUrl}/es/services`,
        en: `${baseUrl}/en/services`,
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

// Production: Next.js 15 App Router implementation
export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang as "en" | "es",
    namespace: "servicesPage",
  });

  // Configuración del Hero con el mismo estilo de otras páginas
  const heroProps = {
    badge: t("hero.badge"),
    title: t("hero.title"),
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

      {/* SERVICES SECTION */}
      <div className="pt-0 pb-16">
        <Services10 />
      </div>
    </main>
  );
}
