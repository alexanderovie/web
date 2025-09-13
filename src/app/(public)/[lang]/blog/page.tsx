import { getTranslations } from "next-intl/server";

import { Blog6 } from "@/components/blog6";
import Hero from "@/components/sections/hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang as "en" | "es",
    namespace: "blog",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang as "en" | "es",
    namespace: "blog",
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

      {/* BLOG SECTION */}
      <div className="pt-0 pb-16">
        <div className="container pt-8 pb-4 md:pb-8 lg:pt-[3.75rem] lg:pb-[50px]">
          <Blog6 />
        </div>
      </div>
    </main>
  );
}
