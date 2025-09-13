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
