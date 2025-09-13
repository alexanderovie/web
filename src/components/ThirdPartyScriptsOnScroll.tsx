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

  // Cargar scripts de terceros
  useLoadScript(
    shouldLoad ? "https://connect.facebook.net/en_US/fbevents.js" : "",
    "fb-pixel",
  );
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
