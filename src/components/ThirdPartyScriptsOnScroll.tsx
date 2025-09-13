"use client";

import { useEffect, useState } from "react";
import { useLoadScript } from "@/hooks/useLoadScript";
import { useTracking } from "@/hooks/useTracking";

export default function ThirdPartyScriptsOnScroll() {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Inicializar tracking automático
  useTracking();

  useEffect(() => {
    const onScroll = () => {
      setShouldLoad(true);
      window.removeEventListener("scroll", onScroll);
    };
    window.addEventListener("scroll", onScroll, { once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cargar Facebook Pixel de forma segura
  useEffect(() => {
    if (shouldLoad && typeof window !== "undefined") {
      // Verificar si ya existe el script
      if (document.getElementById("fb-pixel")) return;

      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      script.async = true;
      script.id = "fb-pixel";
      script.onload = () => {
        // Inicializar fbq después de cargar el script
        if (window.fbq) {
          // El fbq ya está inicializado en layout.tsx
          console.log("Facebook Pixel cargado correctamente");
        }
      };
      script.onerror = () => {
        console.warn("Error al cargar Facebook Pixel");
      };
      document.head.appendChild(script);
    }
  }, [shouldLoad]);
  useLoadScript(
    shouldLoad ? "https://js.hs-analytics.net/44229799.js" : "",
    "hubspot-analytics",
  );

  // Inicializar GTM dataLayer
  useEffect(() => {
    if (typeof window !== "undefined" && !window.dataLayer) {
      window.dataLayer = [];
    }
  }, []);

  return null;
}
