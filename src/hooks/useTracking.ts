/**
 * Hook para tracking automático de eventos
 * Integra GTM, Meta Pixel y HubSpot
 */

import { useEffect, useRef } from "react";
import { gtmClient } from "@/lib/gtm-client";

export function useTracking() {
  const startTime = useRef<number>(Date.now());
  const scrollDepth = useRef<number>(0);

  // Tracking de tiempo en página
  useEffect(() => {
    const handleBeforeUnload = () => {
      const timeOnPage = Math.round((Date.now() - startTime.current) / 1000);
      gtmClient.trackTimeOnPage(timeOnPage);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Tracking de scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.body.offsetHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      // Solo trackear cuando hay un cambio significativo
      if (scrollPercent > scrollDepth.current && scrollPercent % 25 === 0) {
        scrollDepth.current = scrollPercent;
        gtmClient.trackScrollDepth(scrollPercent);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Tracking de vista de página
  useEffect(() => {
    const pageTitle = document.title;
    const serviceMatch = pageTitle.match(
      /(Google Business|WhatsApp Business|SEO|Marketing Digital)/,
    );

    if (serviceMatch) {
      gtmClient.trackServiceView(serviceMatch[0]);
    }
  }, []);

  return {
    trackLeadGeneration: gtmClient.trackLeadGeneration.bind(gtmClient),
    trackContactClick: gtmClient.trackContactClick.bind(gtmClient),
    trackServiceView: gtmClient.trackServiceView.bind(gtmClient),
    trackScrollDepth: gtmClient.trackScrollDepth.bind(gtmClient),
    trackTimeOnPage: gtmClient.trackTimeOnPage.bind(gtmClient),
  };
}

/**
 * Hook para tracking de formularios
 */
export function useFormTracking() {
  const trackFormSubmit = (formType: string, source: string) => {
    gtmClient.trackLeadGeneration(source, formType);
  };

  return { trackFormSubmit };
}

/**
 * Hook para tracking de contactos
 */
export function useContactTracking() {
  const trackContact = (
    contactType: "phone" | "whatsapp" | "email",
    location: string,
  ) => {
    gtmClient.trackContactClick(contactType, location);
  };

  return { trackContact };
}
