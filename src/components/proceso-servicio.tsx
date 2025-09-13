"use client";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import {
  AlignLeft,
  GalleryVerticalEnd,
  Lightbulb,
  ListChecks,
  RefreshCcw,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Hero {
  headline: Record<string, string>;
  subheadline: Record<string, string>;
  image: string;
}

interface ProcesoServicioProps {
  pasos: Array<Record<string, string>>;
  hero: Hero;
  lang: string;
}

const iconMap = [
  <RefreshCcw className="h-3.5 w-3.5" key="0" />,
  <GalleryVerticalEnd className="h-3.5 w-3.5" key="1" />,
  <ListChecks className="h-3.5 w-3.5" key="2" />,
];

export default function ProcesoServicio({
  pasos,
  hero,
  lang,
}: ProcesoServicioProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  useEffect(() => {
    const sections = Object.keys(sectionRefs.current);
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };
    let observer: IntersectionObserver | null = new window.IntersectionObserver(
      observerCallback,
      {
        root: null,
        rootMargin: "0px",
        threshold: 1,
      },
    );
    sections.forEach((sectionId) => {
      const element = sectionRefs.current[sectionId];
      if (element) {
        observer?.observe(element);
      }
    });
    return () => {
      observer?.disconnect();
      observer = null;
    };
  }, []);
  const addSectionRef = (id: string, ref: HTMLElement | null) => {
    if (ref) {
      sectionRefs.current[id] = ref;
    }
  };
  return (
    <section className="py-32">
      <div className="container max-w-7xl">
        <div className="relative grid-cols-3 gap-20 lg:grid">
          <div className="lg:col-span-2">
            <div>
              <Badge variant="outline">
                {lang === "es" ? "¿Cómo funciona?" : "How does it work?"}
              </Badge>
              <h1 className="mt-3 text-3xl font-extrabold">
                {lang === "es"
                  ? "Nuestro proceso profesional"
                  : "Our professional process"}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                {lang === "es"
                  ? "Así es como llevamos tu negocio al siguiente nivel, paso a paso, con transparencia y resultados."
                  : "This is how we take your business to the next level, step by step, with transparency and results."}
              </p>
              <Image
                src={hero.image}
                alt={hero.headline[lang]}
                width={800}
                height={450}
                className="my-8 aspect-video w-full rounded-md object-cover"
              />
            </div>
            {pasos.map((paso, i) => (
              <section
                key={i}
                id={`section${i + 1}`}
                ref={(ref) => addSectionRef(`section${i + 1}`, ref)}
                className="prose dark:prose-invert mb-8"
              >
                <h2>{`${i + 1}. ${paso[lang]}`}</h2>
                <div className="ml-3.5">
                  <div className="relative flex items-start pb-2">
                    <div className="bg-border/70 absolute top-[2.75rem] h-[calc(100%-2.75rem)] w-px"></div>
                    <div className="absolute ml-[-14px] py-2">
                      <div className="bg-muted flex size-7 shrink-0 items-center justify-center rounded-lg">
                        {iconMap[i] || <RefreshCcw className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                    <div className="pl-12">
                      {/* Aquí podrías poner subtítulo o descripción si lo agregas al JSON */}
                    </div>
                  </div>
                </div>
              </section>
            ))}
            {/* Ejemplo de alerta profesional al final */}
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>
                {lang === "es" ? "Tip profesional" : "Pro tip"}
              </AlertTitle>
              <AlertDescription>
                {lang === "es"
                  ? "La clave está en la mejora continua y la transparencia en cada paso."
                  : "The key is continuous improvement and transparency at every step."}
              </AlertDescription>
            </Alert>
          </div>
          <div className="sticky top-8 hidden h-fit lg:block">
            <span className="flex items-center gap-2 text-sm">
              <AlignLeft className="h-4 w-4" />
              {lang === "es" ? "En esta página" : "On this page"}
            </span>
            <nav className="mt-2 text-sm">
              <ul>
                {pasos.map((paso, i) => (
                  <li key={i}>
                    <a
                      href={`#section${i + 1}`}
                      className={cn(
                        "block py-1 transition-colors duration-200",
                        activeSection === `section${i + 1}`
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {paso[lang]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
