"use client";

import AboutHero from "@/components/sections/about-hero";
import Partners from "@/components/sections/partners";
import Team from "@/components/sections/team";
import Testimonials from "@/components/sections/testimonials";
import Values from "@/components/sections/values";

export default function AboutPageClient() {
  return (
    <div>
      <AboutHero />
      <section className="container pb-14 md:pb-20 lg:pb-24">
        {/* Métricas pueden ser traducidas aquí */}
      </section>
      <Partners />
      <div className="py-14 md:py-20 lg:py-24">
        <Values />
      </div>
      <div className="py-14 md:py-20 lg:py-24">
        <Team />
      </div>
      <div className="py-14 md:py-20 lg:py-24">
        <Testimonials withBorders={false} />
      </div>
    </div>
  );
}
