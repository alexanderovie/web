import localFont from "next/font/local";

import "./globals.css";
import { Toaster } from "sonner";

import { DevelopmentBanner } from "@/components/development-banner";
import Navbar from "@/components/navbar";
import Footer from "@/components/sections/footer";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://web.fascinantedigital.com"),
  title: {
    default: "Fascinante Digital - Soluciones Web Élite",
    template: "%s | Fascinante Digital",
  },
  description:
    "Soluciones web de élite para empresas modernas. Desarrollo web profesional, dashboards empresariales y tecnología de vanguardia.",
  keywords: [
    "Fascinante Digital",
    "Desarrollo Web",
    "Dashboards Empresariales",
    "Next.js",
    "React",
    "TypeScript",
    "TailwindCSS",
    "Soluciones Web",
    "Tecnología Élite",
  ],
  authors: [{ name: "Fascinante Digital" }],
  creator: "Fascinante Digital",
  publisher: "Fascinante Digital",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/favicon.svg", color: "#000000" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Fascinante Digital - Soluciones Web Élite",
    description:
      "Soluciones web de élite para empresas modernas. Desarrollo web profesional, dashboards empresariales y tecnología de vanguardia.",
    siteName: "Fascinante Digital",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fascinante Digital - Soluciones Web Élite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fascinante Digital - Soluciones Web Élite",
    description:
      "Soluciones web de élite para empresas modernas. Desarrollo web profesional y tecnología de vanguardia.",
    images: ["/og-image.jpg"],
    creator: "@fascinantedigital",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="Fascinante" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <DevelopmentBanner />
          <Navbar />
          {children}
          <Footer />
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              style: {
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
