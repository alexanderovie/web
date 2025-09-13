"use client";

import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";
import { ChevronRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import TitleTag from "@/components/title-tag";
import { Button } from "@/components/ui/button";

interface HeroProps {
  badge?: string;
  title: string | React.ReactNode;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  showButton?: boolean;
  showCarousel?: boolean;
  carouselItems?: Array<{
    src: string;
    alt: string;
    category: string;
  }>;
  defaultBadge?: string;
  defaultCtaText?: string;
}

// Componente helper para el carrusel
const CarouselSection = ({
  items,
}: {
  items: Array<{ src: string; alt: string; category: string }>;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      className="container w-full flex justify-center py-8"
    >
      {/* CAROUSEL HORIZONTAL INFINITO - SIN DESVANECIMIENTO EN NINGUNA PANTALLA */}
      <div className="w-full overflow-hidden">
        {/* EN MÓVILES: ANCHO COMPLETO - SIN CONTAINER */}
        <div className="lg:hidden -mx-4">
          <motion.div
            className="flex items-center gap-4 px-4"
            animate={{
              x: [0, -1600], // Movimiento de derecha a izquierda
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 35, // 35 segundos para un movimiento más suave
                ease: "linear",
              },
            }}
          >
            {/* CUADRUPLICAMOS LAS IMÁGENES PARA EFECTO INFINITO PERFECTO */}
            {(() => {
              // Crear 4 secuencias para el efecto infinito
              const allItems = [];
              for (let i = 0; i < 4; i++) {
                allItems.push(...items);
              }

              return allItems.map((item, index) => (
                <div key={index} className="flex-shrink-0 w-64">
                  <div className="relative overflow-hidden rounded-lg shadow-lg h-48">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      width={320}
                      height={256}
                      priority
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </motion.div>
        </div>

        {/* EN DESKTOP: SIN FADE EDGES - ANCHO COMPLETO */}
        <div className="hidden lg:block">
          <motion.div
            className="flex items-center gap-6"
            animate={{
              x: [0, -1600], // Movimiento de derecha a izquierda
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 35, // 35 segundos para un movimiento más suave
                ease: "linear",
              },
            }}
          >
            {/* CUADRUPLICAMOS LAS IMÁGENES PARA EFECTO INFINITO PERFECTO */}
            {(() => {
              // Crear 4 secuencias para el efecto infinito
              const allItems = [];
              for (let i = 0; i < 4; i++) {
                allItems.push(...items);
              }

              return allItems.map((item, index) => (
                <div key={index} className="flex-shrink-0 w-80">
                  <div className="relative overflow-hidden rounded-lg shadow-lg h-64">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      width={320}
                      height={256}
                      priority
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default function Hero({
  badge,
  title,
  subtitle,
  ctaText,
  ctaHref,
  showButton = true,
  showCarousel = true,
  carouselItems,
  defaultBadge = "Diseño Web Profesional",
  defaultCtaText = "Ver Diagnóstico Instantáneo",
}: HeroProps) {
  // Obtener traducciones fuera de la función helper
  const t = useTranslations("homepage.carousel");

  // Función helper para obtener items del carrusel
  const getCarouselItems = () => {
    if (carouselItems) {
      return carouselItems;
    }
    try {
      return t.raw("items") as Array<{
        src: string;
        alt: string;
        category: string;
      }>;
    } catch {
      return [];
    }
  };

  const items = getCarouselItems();

  return (
    <section className="py-14 md:py-20 lg:py-24 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8 items-center text-center">
          <TitleTag title={badge || defaultBadge} icon={Sparkles} />
          <h1 className="text-4xl leading-tight tracking-tight md:text-5xl lg:!text-6xl">
            {title}
          </h1>
          <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px]">
            {subtitle}
          </p>
        </div>
        {showButton && ctaHref && (
          <div className="container flex justify-center py-6">
            <Button asChild className="gap-1">
              <Link href={ctaHref}>
                {ctaText || defaultCtaText}
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </motion.div>

      {showCarousel && items.length > 0 && <CarouselSection items={items} />}
    </section>
  );
}
