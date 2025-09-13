import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"], // MDX for dynamic content, no .md for optimization
  // Configuración para evitar ejecución de APIs durante build
  serverExternalPackages: ["resend", "@supabase/supabase-js"],
  // Evitar que Next.js ejecute APIs durante build
  output: "standalone",
  // Puedes agregar aquí otras opciones si lo necesitas
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://10.0.0.242:3000", // tu IP local
  ],
  // 🚀 OPTIMIZACIÓN DE RENDIMIENTO: Redirecciones optimizadas
  async redirects() {
    return [
      {
        // Redirección principal: / -> /en (elimina redirección intermedia)
        source: "/",
        destination: "/en",
        permanent: true, // 308 - Cache permanente para mejor performance
      },
    ];
  },
  // 🚀 OPTIMIZACIÓN DE RENDIMIENTO: Headers de cache optimizados
  async headers() {
    return [
      {
        // Cache para assets estáticos
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 año
          },
        ],
      },
      {
        // Cache para imágenes
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 año
          },
        ],
      },
      {
        // Cache para favicon y manifest
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 año
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      // Puedes agregar otros dominios aquí si los necesitas
    ],
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withNextIntl(withMDX(nextConfig));
