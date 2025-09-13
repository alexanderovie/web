import React from "react";

import Image from "next/image";

import { useLocale } from "next-intl";

const DATA = [
  {
    subTitle: {
      es: "Agenda Inteligente",
      en: "Smart Scheduling",
    },
    title: {
      es: "Sincronización Total de Citas",
      en: "Total Appointment Sync",
    },
    description: {
      es: "Sincroniza todas tus citas y eventos en un solo calendario, sin importar la plataforma. Olvídate de los conflictos y mantén tu agenda siempre organizada.",
      en: "Sync all your appointments and events in one calendar, no matter the platform. Forget about conflicts and keep your schedule always organized.",
    },
    icon: "CircleHelp",
    image: "/images/homepage/adaptive-1.png",
  },
  {
    subTitle: {
      es: "Rendimiento en Tiempo Real",
      en: "Real-Time Performance",
    },
    title: {
      es: "Métricas Claras y Accionables",
      en: "Clear, Actionable Metrics",
    },
    description: {
      es: "Visualiza tu progreso, hitos clave y horas de mayor productividad con reportes fáciles de entender. Toma decisiones informadas para crecer más rápido.",
      en: "See your progress, key milestones, and peak productivity hours with easy-to-understand reports. Make informed decisions to grow faster.",
    },
    icon: "Volume2",
    image: "/images/homepage/adaptive-2.png",
  },
  {
    subTitle: {
      es: "Integraciones Sin Fricción",
      en: "Seamless Integrations",
    },
    title: {
      es: "Conecta Tus Herramientas",
      en: "Connect Your Tools",
    },
    description: {
      es: "Integra tus apps y servicios preferidos para automatizar tareas y ahorrar tiempo. Todo tu ecosistema digital, funcionando en armonía.",
      en: "Integrate your favorite apps and services to automate tasks and save time. Your entire digital ecosystem, working in harmony.",
    },
    icon: "Lightbulb",
    image: "/images/homepage/adaptive-3.png",
  },
];
const AdaptiveList = () => {
  const locale = useLocale();
  return (
    <div className="items-center">
      <div className="grid flex-1 max-lg:divide-y max-lg:border-x lg:grid-cols-3 lg:divide-x">
        {DATA.map((item, index) => (
          <div
            key={index}
            className={`relative isolate pt-5 text-start lg:pt-20`}
          >
            <span className="px-1 tracking-[-0.32px] lg:px-8">
              {item.subTitle[locale]}
            </span>
            <h3 className={`mt-2 px-1 text-lg tracking-[-0.36px] lg:px-8`}>
              {item.title[locale]}
            </h3>
            <p className="text-muted-foreground px-1 py-4 tracking-[-0.32px] lg:px-8">
              {item.description[locale]}
            </p>
            <div className="border-t py-4 lg:px-2">
              <Image
                src={item.image}
                alt={item.title[locale]}
                width={416}
                height={233}
                className="rounded-md shadow-md lg:rounded-xl lg:shadow-lg dark:invert"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdaptiveList;
