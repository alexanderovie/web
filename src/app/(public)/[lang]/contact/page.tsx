import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Building, ChevronRight, Mail, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import Hero from "@/components/sections/hero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang as "en" | "es",
    namespace: "Contact",
  });
  const title = t("meta.title");
  const description = t("meta.description");
  const keywords = [
    t("meta.keyword1"),
    t("meta.keyword2"),
    t("meta.keyword3"),
    t("meta.keyword4"),
  ].join(", ");
  const baseUrl = "https://fascinantedigital.com";
  const url = `${baseUrl}/${lang}/contact`;
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        es: `${baseUrl}/es/contact`,
        en: `${baseUrl}/en/contact`,
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
      locale: lang,
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

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const t = await getTranslations({
    locale: lang as "en" | "es",
    namespace: "contactPage",
  });

  // Título personalizado para dividir en 2 líneas como auditoría/inicio
  const customTitle = (
    <div className="text-4xl leading-tight tracking-tight md:text-5xl lg:!text-6xl">
      <span className="block">
        {t("hero.title").split(" ")[0]} {t("hero.title").split(" ")[1]}{" "}
        {t("hero.title").split(" ")[2]}
      </span>
      <span className="block">
        {t("hero.title").split(" ").slice(3).join(" ")}
      </span>
    </div>
  );

  // Configuración del Hero con el mismo estilo de auditoría/inicio
  const heroProps = {
    badge: t("hero.badge"),
    title: customTitle,
    subtitle: t("hero.subtitle"),
    showButton: false,
    showCarousel: false,
  };

  // Contact methods data
  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description:
        "Have a question or need help? Drop us an email, and we'll respond within 24 hours.",
      contact: "hello@relative.io",
    },
    {
      icon: Phone,
      title: "Phone",
      description:
        "Prefer to chat? Give us a call Monday–Friday, 9 AM–5 PM (PST).",
      contact: "+1 (123) 456-7890",
    },
    {
      icon: Building,
      title: "Office",
      description:
        "Stop by our office @ 123 Productivity Ave, San Francisco, CA 94105",
      contact: (
        <a
          href="#"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
        >
          Get Directions
          <ChevronRight className="size-4" />
        </a>
      ),
    },
  ];

  const formFields = [
    {
      id: "name",
      label: "Name",
      type: "text",
      component: Input,
      required: true,
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      component: Input,
      required: true,
    },
    {
      id: "message",
      label: "Message",
      component: Textarea,
      required: true,
      props: {
        placeholder: "Type Your Message...",
        rows: 4,
      },
    },
  ];

  return (
    <main className="bg-white">
      {/* HERO */}
      <div className="pb-0 -mb-16">
        <Hero {...heroProps} />
      </div>

      {/* CONTACT FORM SECTION */}
      <section className="pt-0 md:pt-16 pb-32">
        <div className="container">
          <div className="flex justify-between gap-10 py-12 max-md:flex-col">
            <form className="flex flex-1 flex-col gap-6">
              {formFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-normal" htmlFor={field.id}>
                    {field.label}
                  </Label>
                  <field.component
                    id={field.id}
                    type={field.type}
                    required={field.required}
                    className="border-border bg-card"
                    {...field.props}
                  />
                </div>
              ))}

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" required />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the{" "}
                    <a href="/terms" className="underline">
                      Terms
                    </a>
                  </Label>
                </div>
              </div>

              <Button type="submit">Submit</Button>
            </form>

            <div className="grid flex-1 gap-6 self-start lg:grid-cols-2">
              {contactMethods.map((method, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <method.icon className="size-5" />
                    <h3 className="text-2xl tracking-[-0.96px]">
                      {method.title}
                    </h3>
                  </div>
                  <div className="space-y-2 tracking-[-0.32px]">
                    <p className="text-sm text-muted-foreground">
                      {method.description}
                    </p>
                    <div className="text-sm text-muted-foreground">
                      {method.contact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
