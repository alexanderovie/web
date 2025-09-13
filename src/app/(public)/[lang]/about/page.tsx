import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

import AboutPageClient from "./AboutPageClient";

// TODO: Cuando Next.js lo permita, cambiar a params: { lang: string } y eliminar el await
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = lang as "en" | "es";
  const t = await getTranslations({ locale, namespace: "About" });
  const title = t("meta.title");
  const description = t("meta.description");
  const keywords = [
    t("meta.keyword1"),
    t("meta.keyword2"),
    t("meta.keyword3"),
    t("meta.keyword4"),
  ].join(", ");
  const baseUrl = "https://fascinantedigital.com";
  const url = `${baseUrl}/${locale}/about`;
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${baseUrl}/es/about`,
        en: `${baseUrl}/en/about`,
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

export default function AboutPage() {
  return <AboutPageClient />;
}
