import React from "react";

import Image from "next/image";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import TitleTag from "../title-tag";

interface AboutHeroProps {
  mainImage?: string;
  rightImages?: { src: string; alt: string }[];
}

const AboutHero = ({
  mainImage = "/images/about/empowering.jpg",
  rightImages = [
    { src: "/images/about/purpose.jpeg", alt: "Team meeting" },
    { src: "/images/about/productivity.jpg", alt: "Team collaboration" },
  ],
}: AboutHeroProps) => {
  const t = useTranslations("aboutPage");
  return (
    <section className="py-14 md:py-20 lg:py-24">
      {/* MOBILE: Hero centrado como otras páginas */}
      <div className="lg:hidden">
        <div className="container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8 items-center text-center">
          <TitleTag title={t("hero.badge")} icon={Sparkles} />
          <h1 className="text-4xl leading-tight tracking-tight md:text-5xl lg:!text-6xl">
            {t("hero.title")}
          </h1>
          <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px]">
            {t("hero.subtitle")}
          </p>
        </div>
      </div>

      {/* DESKTOP: Diseño original con imágenes */}
      <div className="hidden lg:block lg:border-y">
        <div className="container flex flex-col max-lg:divide-y lg:flex-row">
          {/* Left side with mission text */}
          <div className="flex-1 lg:border-l">
            <div className="lg:border-b lg:pr-8 lg:pb-5 lg:pl-2">
              <TitleTag title={t("hero.badge")} icon={Sparkles} />
              <h1 className="mx-auto text-4xl leading-tight tracking-tight md:text-5xl lg:!text-6xl">
                {t("hero.title")}
              </h1>
              <p className="text-muted-foreground mt-6 tracking-[-0.32px]">
                {t("hero.subtitle")}
              </p>
            </div>
            <div className="relative mt-10 aspect-[3/3.25] overflow-hidden md:mt-14 lg:mr-8 lg:mb-10 lg:ml-2">
              <Image
                src={mainImage}
                alt="About hero image"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right side with images */}
          <div className="lg:border-x lg:px-8">
            <div className="flex justify-center gap-6 lg:gap-8">
              {rightImages.map((img, idx) => (
                <div
                  key={img.src}
                  className={`relative ${idx === 0 ? "mt-20 lg:mt-32" : "mt-10 lg:mt-16"} aspect-[1/1.1] h-[200px] overflow-hidden lg:h-[296px]`}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
