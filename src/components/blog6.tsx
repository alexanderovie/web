"use client";

import { useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Calendar,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import articlesData from "@/data/blog/articles.json";
import { getBlogImage } from "@/lib/image-utils";
import { getCategoryBadge } from "@/lib/category-colors";

const POSTS_PER_PAGE = 9;

// Usar datos reales + generar posts adicionales para llegar a 100
const generatePosts = () => {
  const realArticles = articlesData.articles;

  // Generar posts adicionales con contenido variado (empezando desde 200 para evitar conflictos)
  const additionalPosts = [];
  for (let i = 200; i <= 220; i++) {
    const categories = [
      "SEO",
      "Marketing Digital",
      "Google Ads",
      "Facebook Ads",
      "Automatización",
      "Desarrollo Web",
      "Redes Sociales",
      "Analytics",
    ];
    const category = categories[i % categories.length];

    const titles = [
      `Estrategias de SEO Local para ${category}`,
      `Optimización de Conversiones en ${category}`,
      `Tendencias de ${category} en 2024`,
      `Guía Completa de ${category} para Principiantes`,
      `Herramientas Avanzadas de ${category}`,
      `Casos de Éxito en ${category}`,
      `Mejores Prácticas de ${category}`,
      `Automatización en ${category}`,
    ];

    const title = titles[i % titles.length];

    additionalPosts.push({
      id: i.toString(),
      slug: `articulo-${i}`,
      title,
      description: `Descubre las mejores estrategias y herramientas para optimizar tu presencia digital en ${category.toLowerCase()}.`,
      content: `Contenido completo del artículo sobre ${category.toLowerCase()}...`,
      author: "Fascinante Digital",
      category,
      published_at: `${Math.floor(Math.random() * 28) + 1} ${["Ene", "Feb", "Mar", "Abr", "May", "Jun"][Math.floor(Math.random() * 6)]} 2024`,
      image_url: `https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-${(i % 6) + 1}.svg`,
      read_time: Math.floor(Math.random() * 10) + 5,
      status: "published",
    });
  }

  return [...realArticles, ...additionalPosts];
};

const allPosts = generatePosts();

export function Blog6() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReadMore = (slug: string) => {
    // Obtener el idioma actual de la URL
    const pathname = window.location.pathname;
    const lang = pathname.startsWith("/es") ? "es" : "en";
    router.push(`/${lang}/blog/${slug}`);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <section>
      <div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => handleReadMore(post.slug)}
            >
              <CardHeader className="p-0">
                <div className="aspect-video overflow-hidden">
                  <Image
                    src={getBlogImage(post.slug, "thumbnail")}
                    alt={post.title}
                    width={400}
                    height={267}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryBadge(post.category)}`}
                    >
                      {post.category}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 md:line-clamp-2 mb-2 text-lg md:text-xl h-auto md:h-[4rem]">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mb-4 h-[6rem]">
                    {post.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>
                        {new Date(post.published_at).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Button
                  variant="default"
                  className="px-4 py-2 h-auto font-normal"
                  onClick={() => handleReadMore(post.slug)}
                >
                  Leer más
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Paginación */}
      <div className="mt-12 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>

          {getPageNumbers().map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Información de paginación */}
      <div className="mt-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        Página {currentPage} de {totalPages} • Mostrando {posts.length} de{" "}
        {allPosts.length} artículos
      </div>
    </section>
  );
}
