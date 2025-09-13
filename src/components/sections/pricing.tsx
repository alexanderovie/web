"use client";

import React from "react";

import { useRouter, usePathname } from "next/navigation";

import { BadgeDollarSign, BadgeCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import SectionHeader from "../section-header";
import { Button } from "../ui/button";

const PLANS = [
  {
    id: "presencia",
    name: { es: "Plan Presencia Online", en: "Online Presence Plan" },
    price: "$99/mes",
    features: [
      { es: "Landing profesional", en: "Professional landing page" },
      { es: "Dominio propio", en: "Custom domain" },
      { es: "Número corporativo", en: "Corporate number" },
      { es: "Presencia en Apple Maps", en: "Apple Maps presence" },
      { es: "WhatsApp integrado", en: "WhatsApp integration" },
      { es: "Soporte por email", en: "Email support" },
    ],
  },
  {
    id: "impulso",
    name: { es: "Plan Impulso Total", en: "Total Boost Plan" },
    price: "$149/mes",
    features: [
      { es: "Presencia online completa", en: "Full online presence" },
      { es: "Dominio propio", en: "Custom domain" },
      { es: "Email corporativo", en: "Corporate email" },
      { es: "Automatización de reputación", en: "Reputation automation" },
      { es: "WhatsApp integrado", en: "WhatsApp integration" },
      { es: "Presencia en Apple Maps", en: "Apple Maps presence" },
    ],
  },
];

const PRICE_IDS: Record<string, string> = {
  impulso: "price_1RkXhMLEJleujb55EZPJrn8E", // Plan Impulso Total $149
  presencia: "price_1RkXhQLEJleujb55TJLJQMD8", // Plan Presencia Online $99
};

// Función para Title Case inteligente (sin capitalizar preposiciones, artículos, conjunciones comunes)
function toSmartTitleCase(text: string, lang: string) {
  const skipWordsES = [
    "de",
    "del",
    "la",
    "el",
    "los",
    "las",
    "y",
    "o",
    "en",
    "por",
    "con",
    "a",
    "un",
    "una",
    "para",
    "sin",
    "al",
    "ni",
    "e",
  ];
  const skipWordsEN = [
    "of",
    "the",
    "and",
    "or",
    "in",
    "on",
    "for",
    "with",
    "a",
    "an",
    "to",
    "at",
    "by",
    "from",
    "as",
    "but",
    "nor",
    "so",
    "yet",
  ];
  const skipWords = lang === "es" ? skipWordsES : skipWordsEN;
  return text
    .split(" ")
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i === 0 || !skipWords.includes(lower)) {
        // Capitaliza la primera letra, respeta el resto
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return lower;
    })
    .join(" ");
}

const Pricing = ({ asPage = false }: { asPage?: boolean }) => {
  const pathname = usePathname();
  const lang = pathname?.split("/")[1] || "es";
  const t = useTranslations("pricingPage");
  const router = useRouter();
  const { status } = useSession();

  const handleSubscribe = async (planId: string) => {
    if (status !== "authenticated") {
      router.push(`/${lang}/login?next=/checkout-intent/${planId}`);
      return;
    }
    const priceId = PRICE_IDS[planId];
    if (!priceId) {
      alert("No se encontró el priceId para este plan.");
      return;
    }
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, lang }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert("Respuesta inesperada del servidor");
      }
    } catch (err: unknown) {
      alert(
        "Error de red: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  return (
    <section className={asPage ? "py-14 md:py-20 lg:py-24" : ""}>
      {asPage && (
        <SectionHeader
          className="border-none !pb-0 !max-w-[480px] mx-auto items-start text-left md:items-center md:text-center"
          iconTitle={t("title")}
          title={t("title")}
          icon={BadgeDollarSign}
          description={t("description")}
          as="h1"
        />
      )}
      <div
        className={`container ${asPage ? "pt-8 pb-4 md:pb-8 lg:pt-[3.75rem] lg:pb-[50px]" : "pt-0 pb-4 md:pb-8 lg:pt-0 lg:pb-[50px]"}`}
      >
        <section className="grid border max-lg:divide-y lg:grid-cols-2 lg:divide-x max-w-4xl mx-auto">
          {PLANS.map((plan, index) => (
            <div
              key={plan.id}
              className="flex flex-col justify-between p-4 lg:p-6"
            >
              <div className="space-y-2 border-b pb-4">
                <div className="text-muted-foreground flex items-center gap-2.5">
                  <BadgeDollarSign className="size-4" />
                  <h3 className="text-xl tracking-[-0.8px]">
                    {plan.name[lang as keyof typeof plan.name]}
                  </h3>
                </div>
                <div className="font-bold">
                  <span className="text-6xl">{plan.price.split("/")[0]}</span>
                  <span className="text-2xl">/{plan.price.split("/")[1]}</span>
                </div>
              </div>
              <div className="pt-4">
                <h4 className="text-muted-foreground-subtle">
                  {t("featuresTitle", {
                    defaultValue: "Beneficios Incluidos",
                  })}
                </h4>
                <ul className="mt-3 space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-4">
                      <BadgeCheck className="text-green-600 size-6" />
                      <span className="text-muted-foreground">
                        {toSmartTitleCase(
                          feature[lang as keyof typeof feature],
                          lang,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                variant={index === 0 ? "default" : "secondary"}
                className="mt-8"
                onClick={() => handleSubscribe(plan.id)}
              >
                {t("cta", { defaultValue: "Suscribirse" })}
              </Button>
            </div>
          ))}
        </section>
      </div>
      {asPage && (
        <div className="mt-12 h-8 w-full border-y md:h-12 lg:h-[112px]">
          <div className="container h-full w-full border-x"></div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
