import React from "react";

import Faq from "@/components/sections/faq";
import Pricing from "@/components/sections/pricing";
import Testimonials from "@/components/sections/testimonials";

export const metadata = {
  title: "Pricing - Plans for Everyone",
  description:
    "Choose the perfect plan for your productivity needs with our flexible pricing options.",
};

const PricingPage = () => {
  return (
    <div className="py-14 md:py-20 lg:py-24">
      <Pricing withBorders={false} />
      <Testimonials withBorders={false} />
      <div className="pt-14 md:pt-20 lg:pt-24">
        <Faq withBorders={false} />
      </div>
    </div>
  );
};

export default PricingPage;
