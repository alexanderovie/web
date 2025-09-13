import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import Faq from "@/components/sections/faq";
import Pricing from "@/components/sections/pricing";
import Testimonials from "@/components/sections/testimonials";
import Hero from "@/components/sections/hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as "en" | "es";
  const t = await getTranslations({ locale, namespace: "Pricing" });
  const title = t("meta.title");
  const description = t("meta.description");
  const keywords = [
    t("meta.keyword1"),
    t("meta.keyword2"),
    t("meta.keyword3"),
    t("meta.keyword4"),
  ].join(", ");
  const baseUrl = "https://fascinantedigital.com";
  const url = `${baseUrl}/${locale}/pricing`;
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${baseUrl}/es/pricing`,
        en: `${baseUrl}/en/pricing`,
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

export default async function PricingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang as "en" | "es",
    namespace: "pricingPage",
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

      {/* PRICING SECTION */}
      <div className="pt-0 pb-16">
        <Pricing asPage={false} />
      </div>

      {/* TESTIMONIALS SECTION */}
      <div className="py-16 md:py-20 lg:py-24">
        <Testimonials withBorders={false} />
      </div>

      {/* FAQ SECTION */}
      <div className="py-16 md:py-20 lg:py-24">
        <Faq asPage={true} />
      </div>
    </main>
  );
}
