import { ReactNode } from "react";

import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";
import ThirdPartyScriptsOnScroll from "@/components/ThirdPartyScriptsOnScroll";
import { Toaster } from "@/components/ui/sonner";
import FacebookPixelInit from "@/components/FacebookPixelInit";

export const metadata = {
  title: "Fascinante Digital - Plataforma de productividad IA",
  description:
    "Optimiza tu trabajo y descubre el poder de la inteligencia artificial con Fascinante Digital.",
  icons: {
    icon: [
      "/favicon/favicon.ico",
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/icon0.svg", type: "image/svg+xml" },
      { url: "/favicon/icon1.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      { url: "/favicon/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    title: "Fascinante",
    statusBarStyle: "default",
    capable: true,
  },
  manifest: "/favicon/site.webmanifest",
  metadataBase: new URL("https://fascinantedigital.com"),
};

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta property="fb:app_id" content="1236469251478295" />
        {gtmId && (
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${gtmId}');
              `,
            }}
          />
        )}
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors closeButton />
          <FacebookPixelInit />
          <ThirdPartyScriptsOnScroll />
        </ThemeProvider>
      </body>
    </html>
  );
}
