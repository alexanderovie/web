"use client";

import React from "react";

import Image from "next/image";

import { Handshake } from "lucide-react";
import { useTranslations } from "next-intl";

import TitleTag from "../title-tag";
import { Card } from "../ui/card";

type TestimonialsProps = { withBorders?: boolean; namespace?: string };

const Testimonials = ({
  withBorders = true,
  namespace = "testimonials",
}: TestimonialsProps) => {
  const t = useTranslations(namespace);
  const items = t.raw("items") as TestimonialProps[];
  return (
    <section className="">
      <div className={withBorders ? "border-b" : ""}>
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8 items-center text-center">
          <TitleTag title={t("title")} icon={Handshake} />
          <h2 className="text-3xl leading-tight tracking-tight md:text-[38px] lg:!text-[48px]">
            {t("title")}
          </h2>
          <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px]">
            {t("description")}
          </p>
        </div>
      </div>

      <div className="container mt-10 grid gap-8 sm:grid-cols-2 md:mt-14 lg:grid-cols-3">
        {items.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            {...testimonial}
            highlight={testimonial.highlight}
          />
        ))}
      </div>

      {withBorders && (
        <div className="mt-12 h-8 w-full border-y md:h-12 lg:h-[112px]">
          <div className="container h-full w-full border-x"></div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;

interface TestimonialProps {
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  quote: string;
  author: {
    name: string;
    role: string;
    image: string;
  };
  highlight?: string;
}
function TestimonialCard({
  logo,
  quote,
  author,
  highlight,
}: TestimonialProps & { highlight?: string }) {
  // Resalta la primera ocurrencia de la palabra highlight en el quote
  let quoteContent: React.ReactNode = quote;
  if (highlight && typeof quote === "string") {
    const idx = quote.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx !== -1) {
      quoteContent = (
        <>
          {quote.slice(0, idx)}
          <span className="text-primary font-bold">
            {quote.slice(idx, idx + highlight.length)}
          </span>
          {quote.slice(idx + highlight.length)}
        </>
      );
    }
  }
  return (
    <Card className="bg-background flex flex-col gap-6 rounded-md p-6 shadow-sm">
      {logo?.src ? (
        <Image
          src={logo.src}
          alt={logo.alt || ""}
          width={logo.width || 120}
          height={logo.height || 36}
          className="object-contain dark:invert"
          style={{ height: "auto" }}
        />
      ) : null}

      <blockquote className="text-muted-foreground-subtle text-lg font-normal italic">
        {quoteContent}
      </blockquote>

      <div className="mt-auto flex items-center gap-4">
        {author?.image ? (
          <Image
            src={author.image}
            alt={
              author.name
                ? `${author.name}'s profile picture`
                : "profile picture"
            }
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        ) : null}
        <div>
          <p className="text-lg tracking-[-0.36px]">{author.name}</p>
          <p className="text-muted-foreground">{author.role}</p>
        </div>
      </div>
    </Card>
  );
}
