import React from "react";

import Faq from "@/components/sections/faq";
import Testimonials from "@/components/sections/testimonials";

export const metadata = {
  title: "FAQ - Your Questions Answered",
  description:
    "Find answers to commonly asked questions about our platform and services.",
};

const FaqPage = () => {
  return (
    <div className="py-14 md:py-20 lg:py-24">
      <Faq withBorders={false} />
      <div className="py-14 md:py-20 lg:py-24">
        <Testimonials withBorders={false} />
      </div>
    </div>
  );
};

export default FaqPage;
