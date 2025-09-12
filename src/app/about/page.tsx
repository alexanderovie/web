import React from "react";

import AboutHero from "@/components/sections/about-hero";
import Partners from "@/components/sections/partners";
import Team from "@/components/sections/team";
import Testimonials from "@/components/sections/testimonials";
import Values from "@/components/sections/values";

const METRICS = [
  {
    value: "500+",
    label: "Active users",
  },
  {
    value: "99.9%",
    label: "Uptime for productivity",
  },
  {
    value: "20+",
    label: "Industry awards",
  },
  {
    value: "100+",
    label: "Integrations",
  },
];

const page = () => {
  return (
    <div>
      <AboutHero />

      <section className="container pb-14 md:pb-20 lg:pb-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          {METRICS.map((metric, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-primary text-[3.375rem] leading-[120%] tracking-[-2.8px]">
                {metric.value}
              </span>
              <span className="text-muted-foreground mt-2 tracking-[-0.32px]">
                {metric.label}
              </span>
            </div>
          ))}
        </div>
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
};

export default page;
