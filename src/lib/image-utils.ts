/**
 * Utilidades para manejo optimizado de imágenes del blog
 */

export interface BlogImage {
  featured: string;
  thumbnail: string;
  social: string;
  section?: string;
}

export const getBlogImage = (
  basePath: string,
  context: "featured" | "thumbnail" | "social" | "section" = "featured",
): string => {
  const imageMap: Record<string, BlogImage> = {
    "api-whatsapp-business-ecommerce": {
      featured:
        "/images/blog/whatsapp-api/whatsapp-business-api-integration-featured-image.webp",
      thumbnail:
        "/images/blog/whatsapp-api/whatsapp-api-dashboard-thumbnail.webp",
      social:
        "/images/blog/whatsapp-api/whatsapp-business-api-social-media.jpg",
      section:
        "/images/blog/whatsapp-api/whatsapp-api-developer-workspace.webp",
    },
  };

  // Array de imágenes de placeholder de shadcnblocks
  const placeholderImages = [
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-1.svg",
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-2.svg",
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-3.svg",
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-4.svg",
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-5.svg",
    "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-dark-6.svg",
  ];

  const images = imageMap[basePath];
  if (!images) {
    // Usar una imagen de placeholder de shadcnblocks basada en el hash del slug
    const hash = basePath.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % placeholderImages.length;
    return placeholderImages[index];
  }

  return images[context] || images.featured;
};

export const getOptimizedImageUrl = (
  originalUrl: string,
  width: number,
  height: number,
): string => {
  // Si es una imagen local, devolver la URL tal como está
  if (originalUrl.startsWith("/")) {
    return originalUrl;
  }

  // Si es una URL externa (como Unsplash), optimizar
  if (originalUrl.includes("unsplash.com")) {
    return `${originalUrl}?w=${width}&h=${height}&fit=crop&crop=center&fm=webp&q=85`;
  }

  return originalUrl;
};
