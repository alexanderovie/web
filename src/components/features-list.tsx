"use client";

import React, { useState } from "react";

import Image from "next/image";

import { SquarePen, CalendarClock, ChartBar } from "lucide-react";
import { useTranslations } from "next-intl";

import DiagonalPattern from "./diagonal-pattern";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FeaturesList = () => {
  const t = useTranslations("homepage.features");

  const FEATURES_DATA = [
    {
      title: t("items.0.title"),
      description: t("items.0.description"),
      icon: SquarePen,
      image: t("items.0.image"),
    },
    {
      title: t("items.1.title"),
      description: t("items.1.description"),
      icon: CalendarClock,
      image: t("items.1.image"),
    },
    {
      title: t("items.2.title"),
      description: t("items.2.description"),
      icon: ChartBar,
      image: t("items.2.image"),
    },
    {
      title: t("items.3.title"),
      description: t("items.3.description"),
      icon: SquarePen,
      image: t("items.3.image"),
    },
  ];

  const [activeTab, setActiveTab] = useState(FEATURES_DATA[3].title);

  return (
    // CONTAINER PRINCIPAL
    <Tabs
      defaultValue={FEATURES_DATA[3].title}
      value={activeTab}
      onValueChange={setActiveTab}
      className="!flex flex-col lg:!flex-row items-center lg:divide-x"
    >
      {/* SECCIÓN 1: LISTA DE TABS */}
      <TabsList className="flex h-auto flex-1 flex-col p-0 border-x lg:border-x-0 lg:border-t">
        {FEATURES_DATA.map((item) => (
          // CONTAINER DE CADA TAB
          <TabsTrigger
            key={item.title}
            value={item.title}
            className="group relative border-b px-1 py-5 text-start whitespace-normal data-[state=active]:shadow-none px-4 lg:px-8"
          >
            <div
              className={`absolute bottom-[-1px] left-0 z-10 h-[1px] w-0 bg-gradient-to-r from-blue-600 via-sky-300 to-transparent transition-all duration-300 group-data-[state=active]:w-1/2`}
            />
            <div className="">
              <div className="flex items-center gap-1.5">
                <item.icon className="size-4" />
                <h3 className="text-lg tracking-[-0.36px]">{item.title}</h3>
              </div>
              <p className="text-muted-foreground mt-2.5 tracking-[-0.32px]">
                {item.description}
              </p>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* SECCIÓN 2: CONTENIDO DE TABS */}
      <div className="flex-1">
        {FEATURES_DATA.map((item, index) => (
          // CONTAINER DE CADA CONTENIDO
          <TabsContent
            key={index}
            value={item.title}
            className="m-0 px-4 py-[38px] border-x lg:border-x-0 lg:px-8"
          >
            {/* CONTAINER DE IMAGEN */}
            <div className="w-full">
              <div className="w-full">
                {/* SECCIÓN SUPERIOR */}
                <div className="px-2 lg:px-10">
                  <DiagonalPattern className="h-6 lg:h-10" />
                </div>
                {/* SECCIÓN CENTRAL CON IMAGEN */}
                <div className="relative grid grid-cols-[auto_1fr_auto] items-stretch w-full">
                  <DiagonalPattern className="h-full w-2 lg:w-10" />
                  <div className="overflow-hidden rounded-md shadow-md lg:rounded-xl lg:shadow-lg h-96 w-full mx-1 lg:mx-0 min-w-[80vw] lg:min-w-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={800}
                      className="w-full h-full object-cover object-top"
                      style={{
                        objectPosition: "top center",
                        maxHeight: "100%",
                        width: "100%",
                      }}
                    />
                  </div>
                  <DiagonalPattern className="w-2 lg:w-10" />
                </div>
                {/* SECCIÓN INFERIOR */}
                <div className="px-2 lg:px-10">
                  <DiagonalPattern className="h-6 lg:h-10" />
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
};

export default FeaturesList;
