/*
  [TIPADO DE ICONOS LUCIDE]
  --------------------------------------------------
  El objeto iconMap y la variable Icon se tipan explícitamente como LucideIcon,
  el tipo oficial exportado por lucide-react para todos sus íconos:

    import { type LucideIcon } from "lucide-react";
    const iconMap: Record<string, LucideIcon> = { ... };
    let Icon: LucideIcon = WandSparkles;

  Esto resuelve advertencias de ESLint y errores de TypeScript relacionados con type assertion,
  y asegura compatibilidad estricta con los componentes de íconos SVG de Lucide.
  No afecta la lógica ni la funcionalidad del componente.
  --------------------------------------------------
*/
import React from "react";

import {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
  MapPin,
  Star,
  TrendingUp,
  Megaphone,
  Image as LucideImage,
  Settings,
  BarChart2,
  Search,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BatteryCharging,
  GitPullRequest,
  Layers,
  RadioTower,
  SquareKanban,
  WandSparkles,
  MapPin,
  Star,
  TrendingUp,
  Megaphone,
  Image: LucideImage,
  Settings,
  BarChart2,
  Search,
  Smartphone,
};

const softBg = [
  "bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]", // Azul
  "bg-[#FFEBEE] text-[#D32F2F] border-[#FFCDD2]", // Rojo
  "bg-[#E8F5E9] text-[#388E3C] border-[#C8E6C9]", // Verde
  "bg-[#FFFDE7] text-[#FBC02D] border-[#FFF9C4]", // Amarillo
  "bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]", // Morado
  "bg-[#FFF3E0] text-[#F57C00] border-[#FFE0B2]", // Naranja
];

export interface Reason {
  title: string;
  description: string;
  icon?: string;
}

interface Feature43Props {
  heading?: string;
  reasons?: Reason[];
}

const Feature43 = ({
  heading = "Why Work With Us?",
  reasons = [],
}: Feature43Props) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="mb-10 md:mb-20">
          <h2 className="mb-2 text-center text-3xl font-semibold lg:text-5xl">
            {heading}
          </h2>
        </div>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, i) => {
            let Icon: LucideIcon = WandSparkles;
            if (reason.icon && iconMap[reason.icon]) {
              Icon = iconMap[reason.icon];
            } else if (reason.icon && !iconMap[reason.icon]) {
              // Si el icono no existe, usar WandSparkles como fallback (sin console.warn en producción)
            }
            const bg = softBg[i % softBg.length];
            return (
              <div key={i} className="flex flex-col">
                <div
                  className={`mb-5 flex size-16 items-center justify-center rounded-full ${bg}`.replace(
                    /border-\[.*?\]/g,
                    "",
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{reason.title}</h3>
                <p className="text-muted-foreground">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export { Feature43 };
