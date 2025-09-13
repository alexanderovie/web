import { notFound } from "next/navigation";

import { Blogpost3 } from "@/components/blogpost3";
import articlesData from "@/data/blog/articles.json";
import { getBlogImage } from "@/lib/image-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  // Buscar el artículo por slug
  const article = articlesData.articles.find(
    (article) => article.slug === slug,
  );

  if (!article) {
    return {
      title: "Artículo no encontrado",
      description: "El artículo que buscas no existe",
    };
  }

  const imageUrl = getBlogImage(article.slug, "social");
  const fullImageUrl = imageUrl.startsWith("/")
    ? `https://fascinantedigital.com${imageUrl}`
    : imageUrl;

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: `https://fascinantedigital.com/${lang}/blog/${slug}`,
      siteName: "Fascinante Digital",
      locale: lang === "es" ? "es_ES" : "en_US",
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [fullImageUrl],
    },
    other: {
      "og:image": fullImageUrl,
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:type": "image/jpeg",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  // Buscar el artículo por slug
  const article = articlesData.articles.find(
    (article) => article.slug === slug,
  );

  if (!article) {
    notFound();
  }

  return (
    <div>
      <Blogpost3 article={article} lang={lang} />
    </div>
  );
}
