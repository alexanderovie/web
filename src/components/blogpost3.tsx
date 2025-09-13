"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { Lightbulb, FileText } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBlogImage } from "@/lib/image-utils";
import SectionHeader from "@/components/section-header";

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  author: string;
  category: string;
  published_at: string;
  image_url: string;
  read_time: number;
  status: string;
}

interface Blogpost3Props {
  article: Article;
  lang: string;
}

const Blogpost3 = ({ article, lang }: Blogpost3Props) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement>>({});

  useEffect(() => {
    const sections = Object.keys(sectionRefs.current);

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    let observer: IntersectionObserver | null = new IntersectionObserver(
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section className="py-14 md:py-20 lg:py-24">
      <div className="max-w-3xl mx-auto px-4">
        <SectionHeader
          className="border-none !pb-0 items-center text-center"
          iconTitle={article.category}
          title={article.title}
          icon={FileText}
          description={article.description}
          lang={lang}
          as="h1"
        />
      </div>
      <div className="container">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5">
          <div className="mt-6 flex items-center gap-4">
            <Avatar className="size-12 border">
              <AvatarImage src="/favicon/favicon.svg" />
            </Avatar>
            <div>
              <p className="text-sm font-medium">{article.author}</p>
              <p className="text-muted-foreground text-sm">
                {lang === "es" ? "Actualizado el" : "Updated on"}{" "}
                {formatDate(article.published_at)}
              </p>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl rounded-lg border p-2">
          <Image
            src={getBlogImage(article.slug, "featured")}
            alt={article.title}
            width={1200}
            height={630}
            className="aspect-video rounded-lg object-cover"
          />
        </div>
        <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-4">
          <div className="sticky top-8 hidden h-fit self-start lg:block">
            <div className="rounded-lg border bg-card p-4">
              <span className="mb-6 block text-lg font-semibold">
                {lang === "es" ? "Contenido" : "Content"}
              </span>
              <nav className="mt-2">
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#introduccion"
                      className={cn(
                        "block py-1 transition-colors duration-200",
                        activeSection === "introduccion"
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {lang === "es" ? "Introducción" : "Introduction"}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contenido-principal"
                      className={cn(
                        "block py-1 transition-colors duration-200",
                        activeSection === "contenido-principal"
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {lang === "es" ? "Contenido Principal" : "Main Content"}
                    </a>
                  </li>
                  <li>
                    <a
                      href="#conclusion"
                      className={cn(
                        "block py-1 transition-colors duration-200",
                        activeSection === "conclusion"
                          ? "text-primary font-medium"
                          : "text-muted-foreground hover:text-primary",
                      )}
                    >
                      {lang === "es" ? "Conclusión" : "Conclusion"}
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="lg:col-span-2 min-h-screen">
              <section
                id="introduccion"
                ref={(ref) => addSectionRef("introduccion", ref)}
                className="prose dark:prose-invert mb-8"
              >
                <h2>{lang === "es" ? "Introducción" : "Introduction"}</h2>
                <p>{article.content}</p>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>
                    {lang === "es" ? "¡Consejo Profesional!" : "Pro Tip!"}
                  </AlertTitle>
                  <AlertDescription>
                    {lang === "es"
                      ? "Aprovecha al máximo estos consejos implementándolos paso a paso en tu estrategia digital."
                      : "Make the most of these tips by implementing them step by step in your digital strategy."}
                  </AlertDescription>
                </Alert>
              </section>

              <section
                id="contenido-principal"
                ref={(ref) => addSectionRef("contenido-principal", ref)}
                className="prose dark:prose-invert mb-8"
              >
                <h2>
                  {lang === "es" ? "Contenido Principal" : "Main Content"}
                </h2>
                <p>
                  {lang === "es"
                    ? "En esta sección profundizamos en los aspectos más importantes de la estrategia digital y cómo aplicarlos efectivamente en tu negocio."
                    : "In this section we dive deep into the most important aspects of digital strategy and how to apply them effectively in your business."}
                </p>
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>{lang === "es" ? "Antes" : "Before"}</th>
                        <th>{lang === "es" ? "Después" : "After"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {lang === "es"
                            ? "Resultados Básicos"
                            : "Basic Results"}
                        </td>
                        <td>
                          {lang === "es"
                            ? "Resultados Optimizados"
                            : "Optimized Results"}
                        </td>
                      </tr>
                      <tr className="even:bg-muted m-0 border-t p-0">
                        <td>
                          {lang === "es"
                            ? "Visibilidad Limitada"
                            : "Limited Visibility"}
                        </td>
                        <td>
                          {lang === "es"
                            ? "Visibilidad Máxima"
                            : "Maximum Visibility"}
                        </td>
                      </tr>
                      <tr className="even:bg-muted m-0 border-t p-0">
                        <td>
                          {lang === "es"
                            ? "Conversiones Bajas"
                            : "Low Conversions"}
                        </td>
                        <td>
                          {lang === "es"
                            ? "Conversiones Altas"
                            : "High Conversions"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  {lang === "es"
                    ? "Implementando estas estrategias de manera consistente, verás una mejora significativa en tus resultados digitales."
                    : "By implementing these strategies consistently, you will see a significant improvement in your digital results."}
                </p>
              </section>

              <section
                id="conclusion"
                ref={(ref) => addSectionRef("conclusion", ref)}
                className="prose dark:prose-invert mb-8"
              >
                <h2>{lang === "es" ? "Conclusión" : "Conclusion"}</h2>
                <p>
                  {lang === "es"
                    ? "La implementación de estas estrategias requiere dedicación y consistencia. Los resultados no se verán de la noche a la mañana, pero con el tiempo, la diferencia será notable."
                    : "Implementing these strategies requires dedication and consistency. Results won't be seen overnight, but over time, the difference will be noticeable."}
                </p>
                <blockquote>
                  {lang === "es"
                    ? '"La consistencia es la clave del éxito en el marketing digital. Pequeñas acciones diarias generan grandes resultados a largo plazo."'
                    : '"Consistency is the key to success in digital marketing. Small daily actions generate great long-term results."'}
                </blockquote>
                <p>
                  {lang === "es"
                    ? "Recuerda que el marketing digital es un proceso continuo de aprendizaje y optimización. Mantente actualizado con las últimas tendencias y siempre mide tus resultados."
                    : "Remember that digital marketing is a continuous process of learning and optimization. Stay updated with the latest trends and always measure your results."}
                </p>
              </section>
            </div>
          </div>
          <div className="prose dark:prose-invert sticky top-8 hidden h-fit self-start rounded-lg border p-6 lg:block">
            <h5 className="text-xl font-semibold">
              {lang === "es"
                ? "Comienza con Nuestra Solución"
                : "Get Started with Our Solution"}
            </h5>
            <ul className="my-6 text-sm [&>li]:pl-0">
              <li>
                {lang === "es"
                  ? "Ahorra 40% de tiempo con automatización"
                  : "Save 40% time with automation"}
              </li>
              <li>
                {lang === "es"
                  ? "Colaboración en tiempo real"
                  : "Real-time collaboration"}
              </li>
              <li>
                {lang === "es" ? "Flujos de trabajo fáciles" : "Easy workflows"}
              </li>
            </ul>
            <div className="flex flex-col gap-2">
              <Button>{lang === "es" ? "Comenzar" : "Get started"}</Button>
              <Button variant="outline">
                {lang === "es" ? "Saber más" : "Learn more"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Blogpost3 };
