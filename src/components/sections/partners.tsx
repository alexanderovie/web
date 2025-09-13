"use client";

import React from "react";

import Image from "next/image";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import FadeEdges from "../fade-edges";

interface Partner {
  name: string;
  logo: string;
}

interface PartnersProps {
  partnersList?: Partner[];
}

const defaultPartners = [
  { name: "Notion", logo: "/images/partners/notion.svg" },
  { name: "GitHub", logo: "/images/partners/github.svg" },
  { name: "Slack", logo: "/images/partners/slack.svg" },
  { name: "Loom", logo: "/images/partners/loom.svg" },
  { name: "Figma", logo: "/images/partners/figma.svg" },
];

const Partners = ({ partnersList = defaultPartners }: PartnersProps) => {
  const t = useTranslations("partners");

  // Duplicamos los logos para crear el efecto infinito
  const duplicatedPartners = [
    ...partnersList,
    ...partnersList,
    ...partnersList,
  ];

  return (
    // CONTAINER PADRE - Ahora sin colores de prueba
    <section className="container flex flex-col items-center gap-12 py-12 lg:py-20">
      {/* SECCIÓN 1: TEXTO - Sin colores de prueba */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-primary text-lg leading-[140%] tracking-[-0.32px]">
          {t("usedBy")}
        </p>
      </motion.div>

      {/* SECCIÓN 2: LOGOS - Sin colores de prueba */}
      <div className="w-full overflow-hidden">
        {/* CONTAINER CON DESVANECIMIENTO LATERAL */}
        <FadeEdges fadeWidth="w-20">
          {/* LOGOS EN MOVIMIENTO INFINITO */}
          <motion.div
            className="flex items-center gap-x-8 gap-y-6 opacity-70 grayscale lg:gap-[60px]"
            animate={{
              x: [0, -1000], // Se mueve de derecha a izquierda
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 30, // 30 segundos para completar el ciclo
                ease: "linear",
              },
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              // CONTAINER DE CADA LOGO - Sin colores de prueba
              <motion.div
                key={`${partner.name}-${index}`}
                className="flex items-center justify-center flex-shrink-0"
                whileHover={{
                  scale: 1.1,
                  filter: "grayscale(0%)",
                  opacity: 1,
                  transition: { duration: 0.2 },
                }}
              >
                <Image
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  width={109}
                  height={48}
                  className="object-contain"
                  style={{ height: "auto" }}
                />
              </motion.div>
            ))}
          </motion.div>
        </FadeEdges>
      </div>
    </section>
  );
};

export default Partners;
