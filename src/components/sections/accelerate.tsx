import React from "react";

import Image from "next/image";

import {
  LayoutList,
  LocateFixed,
  Users,
  Cpu,
  Rocket,
  LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import DiagonalPattern from "../diagonal-pattern";
import SectionHeader from "../section-header";

interface AccelerateProps {
  iconTitle: string;
  title: string;
  description: string;
}

const Accelerate = ({ iconTitle, title, description }: AccelerateProps) => {
  const t = useTranslations("homepage.accelerate");

  const TIMELINE_ITEMS = [
    {
      title: t("items.0.title"),
      description: t("items.0.description"),
      icon: LayoutList,
      image: {
        src: "/images/homepage/accelerate-1.png",
        alt: t("items.0.imageAlt"),
      },
    },
    {
      title: t("items.1.title"),
      description: t("items.1.description"),
      icon: LocateFixed,
      image: {
        src: "/images/homepage/accelerate-2.png",
        alt: t("items.1.imageAlt"),
      },
      reverse: true,
    },
    {
      title: t("items.2.title"),
      description: t("items.2.description"),
      icon: Users,
      image: {
        src: "/images/homepage/accelerate-3.png",
        alt: t("items.2.imageAlt"),
      },
    },
    {
      title: t("items.3.title"),
      description: t("items.3.description"),
      icon: Cpu,
      image: {
        src: "/images/homepage/accelerate-4.png",
        alt: t("items.3.imageAlt"),
      },
      reverse: true,
    },
  ];

  return (
    <section id="accelerate-planning" className="">
      <div className="border-b">
        <SectionHeader
          iconTitle={iconTitle}
          title={title}
          icon={Rocket}
          description={description}
        />
      </div>

      <div className="container border-x pb-40 lg:pt-20 [&>*:last-child]:pb-20 [&>div>div:first-child]:!pt-20">
        {TIMELINE_ITEMS.map((item, index) => (
          <TimelineItem
            key={index}
            index={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            image={item.image}
            reverse={item.reverse}
          />
        ))}
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x"></div>
      </div>
    </section>
  );
};

export default Accelerate;

interface TimelineItemProps {
  title: string;
  description: string;
  icon: LucideIcon;
  image: {
    src: string;
    alt: string;
  };
  reverse?: boolean;
  index: number;
}

const TimelineItem = ({
  title,
  description,
  icon: Icon,
  image,
  reverse,
  index,
}: TimelineItemProps) => (
  <div className={`relative flex`}>
    <div
      className={`flex w-full justify-center px-1 py-10 text-end md:gap-6 lg:gap-10 ${reverse ? "lg:flex-row-reverse lg:text-start" : ""} `}
    >
      <div className="flex-1 max-lg:hidden">
        <h3 className="text-2xl tracking-[-0.96px]">{title}</h3>
        <p
          className={`text-muted-foreground mt-2.5 max-w-[300px] tracking-[-0.32px] text-balance ${reverse ? "" : "ml-auto"}`}
        >
          {description}
        </p>
      </div>
      <div
        className={`bg-background z-[-1] size-fit -translate-y-5 p-4 max-lg:-translate-x-4`}
      >
        <div className="bg-card rounded-[10px] border p-[5px] shadow-md">
          <div className="bg-muted size-fit rounded-md border p-1">
            <Icon className="size-4 shrink-0" />
          </div>
        </div>
      </div>
      <div className="flex-1 max-lg:-translate-x-4">
        <div className={`text-start lg:pointer-events-none lg:hidden`}>
          <h3 className="text-2xl tracking-[-0.96px]">{title}</h3>
          <p className="text-muted-foreground mt-2.5 mb-10 max-w-[300px] tracking-[-0.32px] text-balance">
            {description}
          </p>
        </div>
        <div className="flex items-start justify-start">
          <div className={` ${reverse ? "lg:ml-auto" : ""}`}>
            <div className="px-6 lg:px-10">
              <DiagonalPattern className="h-6 lg:h-10" />
            </div>
            <div className="relative grid grid-cols-[auto_1fr_auto] items-stretch">
              <DiagonalPattern className="h-full w-6 lg:w-10" />
              <Image
                src={image.src}
                width={400}
                height={500}
                alt={image.alt}
                className="m-2 rounded-md object-contain shadow-md lg:rounded-xl lg:shadow-lg dark:invert"
              />
              <DiagonalPattern className="w-6 lg:w-10" />
            </div>
            <div className="px-6 lg:px-10">
              <DiagonalPattern className="h-6 lg:h-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      className={`absolute z-[-2] h-full w-[3px] translate-x-5 rounded-full lg:left-1/2 lg:-translate-x-1/2 ${index === 3 ? "from-foreground/10 via-foreground/10 bg-gradient-to-b to-transparent" : "bg-foreground/10"}`}
    >
      {index == 0 && (
        <div
          className={`to-foreground/10 h-4 w-[3px] -translate-y-full bg-gradient-to-b from-transparent`}
        ></div>
      )}
    </div>
  </div>
);
