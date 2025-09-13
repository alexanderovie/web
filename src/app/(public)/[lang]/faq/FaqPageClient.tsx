"use client";

import Faq from "@/components/sections/faq";
import Testimonials from "@/components/sections/testimonials";

export default function FaqPageClient() {
  return (
    <>
      <Faq asPage={true} />
      <Testimonials />
    </>
  );
}
