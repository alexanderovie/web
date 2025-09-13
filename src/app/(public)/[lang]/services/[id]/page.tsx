import React from "react";

import messagesEN from "../../../../../../messages/en.json";
import messagesES from "../../../../../../messages/es.json";

import { ClientImageWithFallback } from "@/components/ClientImageWithFallback";
import { Feature43, Reason } from "@/components/feature43";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import services from "@/data/services.json";

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ id: string; lang: string }>;
}): Promise<React.JSX.Element> {
  const { id, lang } = await params;
  if (!id) return <div>Parámetro 'id' no encontrado</div>;

  const servicio = services.find((s) => s.id === id);
  if (!servicio) return <div>Servicio no encontrado</div>;

  // Cargar mensajes de traducción para el servicio
  const messages = lang === "es" ? messagesES : messagesEN;
  const serviceMessages =
    (messages.servicePages as Record<string, unknown>)[id] || {};
  const t = (key: string) =>
    (serviceMessages as Record<string, unknown>)[key] || "";
  const tRaw = (key: string) =>
    (serviceMessages as Record<string, unknown>)[key] || [];

  // Copy dinámico
  const badge = t("badge");
  const heroTitle = t("heroTitle");
  const heroSubtitle = t("heroSubtitle");
  const badges = tRaw("badges");
  const buttons = tRaw("buttons");
  const heroImage = servicio.heroImage;
  const benefitsHeading = t("benefitsHeading");
  // Asegurar que benefits siempre sea un array
  const benefits = Array.isArray(tRaw("benefits")) ? tRaw("benefits") : [];
  const testimonialQuote = t("testimonialQuote");
  const testimonialAuthor = t("testimonialAuthor");
  const testimonialRole = t("testimonialRole");
  const galleryTitle = t("galleryTitle");
  const gallery = tRaw("gallery");
  const ctaTitle = t("ctaTitle");
  const ctaButton = tRaw("ctaButton");

  return (
    <main className="container py-16 space-y-12">
      {/* Hero principal */}
      <section className="flex flex-col items-center text-center gap-6">
        <Badge variant="outline" className="mb-2">
          {badge as string}
        </Badge>
        <h1 className="text-4xl font-bold max-w-2xl">{heroTitle as string}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {heroSubtitle as string}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {(badges as string[]).map((b, i) => (
            <Badge key={i} variant="secondary">
              {b}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {(buttons as { label: string; url: string }[]).map((btn, i) => (
            <Button asChild key={i} variant={i === 0 ? "default" : "outline"}>
              <a href={btn.url} target="_blank" rel="noopener noreferrer">
                {btn.label}
              </a>
            </Button>
          ))}
        </div>
        <ClientImageWithFallback
          src={heroImage}
          alt={heroTitle as string}
          width={900}
          height={500}
          className="rounded-xl border shadow-lg mt-8"
          fallbackSrc="https://placehold.co/900x500.png?text=Imagen+Próximamente&font=roboto"
        />
      </section>

      {/* Beneficios (Feature43) */}
      <Feature43
        heading={String(benefitsHeading)}
        reasons={benefits as Reason[]}
      />

      {/* Testimonio destacado */}
      <section>
        <figure className="mx-auto max-w-2xl text-center">
          <blockquote className="text-xl italic font-medium">
            {testimonialQuote as string}
          </blockquote>
          <figcaption className="mt-4 text-base font-semibold">
            {testimonialAuthor as string}
            <span className="ml-2 text-muted-foreground font-normal">
              {testimonialRole as string}
            </span>
          </figcaption>
        </figure>
      </section>

      {/* Galería de bloques */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {galleryTitle as string}
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {(
            gallery as {
              image: string;
              title: string;
              description: string;
              url: string;
            }[]
          ).map((item, i) => (
            <Card key={i} className="flex flex-col items-center p-6">
              <ClientImageWithFallback
                src={item.image}
                alt={item.title}
                width={300}
                height={180}
                className="rounded mb-4"
                fallbackSrc="https://placehold.co/300x180.png?text=Imagen+Próximamente&font=roboto"
              />
              <h4 className="font-semibold text-lg">{item.title}</h4>
              <p className="text-muted-foreground text-sm text-center">
                {item.description}
              </p>
              <Button asChild variant="link" className="mt-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Ver caso
                </a>
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="text-center space-y-4 py-16">
        <h2 className="text-2xl font-bold mt-12">{ctaTitle as string}</h2>
        <Button asChild size="lg">
          <a
            href={(ctaButton as { url: string }).url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {(ctaButton as { label: string }).label}
          </a>
        </Button>
      </section>
    </main>
  );
}
