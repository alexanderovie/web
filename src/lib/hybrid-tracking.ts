/**
 * Sistema Híbrido de Tracking
 * Combina tracking automático con configuración manual de GTM
 */

export interface TrackingConfig {
  // Configuración de GTM
  gtmContainerId: string;
  gtmDebugMode: boolean;

  // Configuración de Meta
  metaPixelId: string;
  metaAccessToken: string;

  // Configuración de HubSpot
  hubspotPortalId: string;
  hubspotAnalyticsId: string;

  // Eventos personalizados
  customEvents: {
    [key: string]: {
      gtmEvent: string;
      metaEvent: string;
      hubspotEvent: string;
      parameters: string[];
    };
  };
}

class HybridTracking {
  private config: TrackingConfig;
  private isInitialized = false;

  constructor(config: TrackingConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize() {
    if (typeof window !== "undefined") {
      this.isInitialized = true;
      this.setupGTM();
      this.setupMetaPixel();
      this.setupHubSpot();
    }
  }

  private setupGTM() {
    // Configurar GTM dataLayer
    if (typeof window !== "undefined" && !window.dataLayer) {
      window.dataLayer = [];
    }

    // Agregar configuración de GTM
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        "gtm.start": new Date().getTime(),
        event: "gtm.js",
        "gtm.containerId": this.config.gtmContainerId,
      });
    }
  }

  private setupMetaPixel() {
    // Configurar Meta Pixel si no está ya configurado
    if (typeof window !== "undefined" && !window.fbq) {
      window.fbq = function (...args: any[]) {
        if (window.fbq.callMethod) {
          window.fbq.callMethod(...args);
        } else {
          window.fbq.queue.push(args);
        }
      };
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = "2.0";
      window.fbq.queue = [];
    }
  }

  private setupHubSpot() {
    // Configurar HubSpot si no está ya configurado
    if (typeof window !== "undefined" && !window._hsq) {
      window._hsq = [];
    }
  }

  /**
   * Envía evento a todas las plataformas
   */
  trackEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (!this.isInitialized) return;

    // 1. Enviar a GTM
    this.sendToGTM(eventName, parameters);

    // 2. Enviar a Meta Pixel
    this.sendToMeta(eventName, parameters);

    // 3. Enviar a HubSpot
    this.sendToHubSpot(eventName, parameters);

    // 4. Log para debugging
    // Production: Hybrid tracking event
  }

  private sendToGTM(eventName: string, parameters: Record<string, any>) {
    if (typeof window !== "undefined" && window.dataLayer) {
      const gtmEvent = {
        event: eventName,
        ...parameters,
        timestamp: Date.now(),
        page_url: window.location.href,
        page_title: document.title,
      };

      window.dataLayer.push(gtmEvent);
    }
  }

  private sendToMeta(eventName: string, parameters: Record<string, any>) {
    if (typeof window !== "undefined" && window.fbq) {
      const metaEvent = this.mapToMetaEvent(eventName);
      if (metaEvent) {
        window.fbq("track", metaEvent, {
          content_name: parameters.content_name || document.title,
          content_category: parameters.category || "general",
          value: parameters.value || 0,
          currency: "USD",
          ...parameters,
        });
      }
    }
  }

  private sendToHubSpot(eventName: string, parameters: Record<string, any>) {
    if (typeof window !== "undefined" && window._hsq) {
      const hubspotEvent = this.mapToHubSpotEvent(eventName);
      if (hubspotEvent) {
        window._hsq.push([
          "trackEvent",
          hubspotEvent,
          {
            page_url: window.location.href,
            page_title: document.title,
            ...parameters,
          },
        ]);
      }
    }
  }

  private mapToMetaEvent(eventName: string): string | null {
    const eventMap: Record<string, string> = {
      form_submit: "Lead",
      page_view: "ViewContent",
      button_click: "CustomizeProduct",
      scroll: "ViewContent",
      time_on_page: "ViewContent",
      phone_click: "Contact",
      whatsapp_click: "Contact",
      email_click: "Contact",
      service_view: "ViewContent",
      contact_form_submit: "Lead",
      newsletter_signup: "Lead",
      download_content: "Download",
      video_play: "ViewContent",
      social_share: "Share",
    };

    return eventMap[eventName] || eventName;
  }

  private mapToHubSpotEvent(eventName: string): string | null {
    const eventMap: Record<string, string> = {
      form_submit: "form_submission",
      page_view: "page_view",
      button_click: "button_click",
      phone_click: "phone_click",
      whatsapp_click: "whatsapp_click",
      email_click: "email_click",
      service_view: "page_view",
      contact_form_submit: "form_submission",
      newsletter_signup: "form_submission",
      download_content: "download",
      video_play: "video_play",
      social_share: "social_share",
    };

    return eventMap[eventName] || eventName;
  }

  // Métodos específicos para Fascinante Digital
  trackLeadGeneration(
    formType: string,
    source: string,
    additionalData: Record<string, any> = {},
  ) {
    this.trackEvent("contact_form_submit", {
      form_type: formType,
      source: source,
      category: "Lead Generation",
      action: "Submit",
      label: `${formType} - ${source}`,
      value: 1,
      ...additionalData,
    });
  }

  trackServiceView(
    serviceName: string,
    additionalData: Record<string, any> = {},
  ) {
    this.trackEvent("service_view", {
      service_name: serviceName,
      category: "Services",
      action: "View",
      label: serviceName,
      ...additionalData,
    });
  }

  trackContactClick(
    contactType: "phone" | "whatsapp" | "email",
    location: string,
    additionalData: Record<string, any> = {},
  ) {
    this.trackEvent(`${contactType}_click`, {
      contact_type: contactType,
      location: location,
      category: "Contact",
      action: "Click",
      label: `${contactType} - ${location}`,
      value: 1,
      ...additionalData,
    });
  }

  trackScrollDepth(depth: number, additionalData: Record<string, any> = {}) {
    this.trackEvent("scroll", {
      scroll_depth: depth,
      category: "Engagement",
      action: "Scroll",
      label: `${depth}%`,
      value: depth,
      ...additionalData,
    });
  }

  trackTimeOnPage(seconds: number, additionalData: Record<string, any> = {}) {
    this.trackEvent("time_on_page", {
      time_on_page: seconds,
      category: "Engagement",
      action: "Time",
      label: `${seconds}s`,
      value: seconds,
      ...additionalData,
    });
  }

  // Método para debugging
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      gtmAvailable: typeof window !== "undefined" && !!window.dataLayer,
      metaAvailable: typeof window !== "undefined" && !!window.fbq,
      hubspotAvailable: typeof window !== "undefined" && !!window._hsq,
    };
  }
}

// Configuración por defecto
const defaultConfig: TrackingConfig = {
  gtmContainerId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-T7SZM386", // Tu GTM ID real
  gtmDebugMode: process.env.NODE_ENV === "development",
  metaPixelId: "302145589537496", // Tu Meta Pixel ID
  metaAccessToken: process.env.META_ACCESS_TOKEN || "",
  hubspotPortalId: "44229799", // Tu HubSpot Portal ID
  hubspotAnalyticsId: "44229799",
  customEvents: {
    // Eventos personalizados específicos para Fascinante Digital
    google_business_consultation: {
      gtmEvent: "google_business_consultation",
      metaEvent: "Lead",
      hubspotEvent: "form_submission",
      parameters: ["service_name", "source", "contact_type"],
    },
    whatsapp_business_consultation: {
      gtmEvent: "whatsapp_business_consultation",
      metaEvent: "Lead",
      hubspotEvent: "form_submission",
      parameters: ["service_name", "source", "contact_type"],
    },
    seo_consultation: {
      gtmEvent: "seo_consultation",
      metaEvent: "Lead",
      hubspotEvent: "form_submission",
      parameters: ["service_name", "source", "contact_type"],
    },
  },
};

// Instancia global
export const hybridTracking = new HybridTracking(defaultConfig);

// Tipos para window
declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: any;
    _hsq?: any[];
  }
}
