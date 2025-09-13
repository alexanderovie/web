"use client";

import React from "react";

import { MessageCircleQuestion } from "lucide-react";
import { useTranslations } from "next-intl";

import SectionHeader from "../section-header";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqProps = { withBorders?: boolean; namespace?: string; asPage?: boolean };

const Faq = ({
  withBorders = false,
  namespace = "faq",
  asPage = false,
}: FaqProps) => {
  const t = useTranslations(namespace);
  const items = t.raw("items") as { question: string; answer: string }[];
  return (
    <section
      className={asPage ? "py-8 md:py-12 lg:py-16" : "py-14 md:py-20 lg:py-24"}
    >
      {!asPage && (
        <SectionHeader
          className="border-none !pb-0 !max-w-[480px] mx-auto items-start text-left md:items-center md:text-center"
          iconTitle={t("title")}
          title={t("title")}
          icon={MessageCircleQuestion}
          description={t("description")}
          as="h2"
        />
      )}
      <div className="container">
        <div
          className={`mx-auto max-w-3xl ${asPage ? "pt-4 pb-4 md:pt-6 md:pb-6 lg:pt-8 lg:pb-8" : "pt-8 pb-4 md:pb-8 lg:pt-[3.75rem] lg:pb-[50px]"}`}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="text-primary rounded-[7px] border px-6 data-[state=open]:pb-2"
              >
                <AccordionTrigger className="py-5 text-base tracking-[-0.32px]">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base tracking-[-0.32px]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      {withBorders && (
        <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
          <div className="container h-full w-full border-x"></div>
        </div>
      )}
    </section>
  );
};

export default Faq;
