/**
 * Google Tag Manager Client
 * Gestiona eventos automáticamente para Meta y HubSpot
 */

export interface GTMEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export interface GTMDataLayer {
  event: string;
  [key: string]: any;
}

class GTMClient {
  private dataLayer: GTMDataLayer[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeDataLayer();
  }

  private initializeDataLayer() {
    if (typeof window !== "undefined" && !window.dataLayer) {
      window.dataLayer = [];
    }
    this.isInitialized = true;
  }

  /**
   * Envía un evento a GTM
   */
  pushEvent(event: GTMEvent) {
    if (typeof window === "undefined") return;

    const gtmEvent: GTMDataLayer = {
      event: event.event,
      ...event.custom_parameters,
    };

    // Agregar parámetros estándar si existen
    if (event.category) gtmEvent.event_category = event.category;
    if (event.action) gtmEvent.event_action = event.action;
    if (event.label) gtmEvent.event_label = event.label;
    if (event.value) gtmEvent.event_value = event.value;

    // Enviar a GTM
    window.dataLayer?.push(gtmEvent);

    // También enviar a Facebook Pixel si está disponible
    this.pushToFacebookPixel(event);

    // También enviar a HubSpot si está disponible
    this.pushToHubSpot(event);

    // Production: GTM event pushed
  }

  /**
   * Envía evento a Facebook Pixel
   */
  private pushToFacebookPixel(event: GTMEvent) {
    if (typeof window === "undefined" || !window.fbq) return;

    const fbqEvent = this.mapToFacebookEvent(event);
    if (fbqEvent) {
      window.fbq("track", fbqEvent.event, fbqEvent.parameters);
    }
  }

  /**
   * Envía evento a HubSpot
   */
  private pushToHubSpot(event: GTMEvent) {
    if (typeof window === "undefined" || !window._hsq) return;

    const hubspotEvent = this.mapToHubSpotEvent(event);
    if (hubspotEvent) {
      window._hsq.push([
        "trackEvent",
        hubspotEvent.event,
        hubspotEvent.properties,
      ]);
    }
  }

  /**
   * Mapea eventos GTM a eventos de Facebook Pixel
   */
  private mapToFacebookEvent(gtmEvent: GTMEvent) {
    const eventMap: Record<string, string> = {
      form_submit: "Lead",
      page_view: "ViewContent",
      button_click: "CustomizeProduct",
      scroll: "ViewContent",
      time_on_page: "ViewContent",
      phone_click: "Contact",
      whatsapp_click: "Contact",
      email_click: "Contact",
    };

    const fbEvent = eventMap[gtmEvent.event] || gtmEvent.event;

    return {
      event: fbEvent,
      parameters: {
        content_name: gtmEvent.label,
        content_category: gtmEvent.category,
        value: gtmEvent.value,
        ...gtmEvent.custom_parameters,
      },
    };
  }

  /**
   * Mapea eventos GTM a eventos de HubSpot
   */
  private mapToHubSpotEvent(gtmEvent: GTMEvent) {
    const eventMap: Record<string, string> = {
      form_submit: "form_submission",
      page_view: "page_view",
      button_click: "button_click",
      phone_click: "phone_click",
      whatsapp_click: "whatsapp_click",
      email_click: "email_click",
    };

    const hsEvent = eventMap[gtmEvent.event] || gtmEvent.event;

    return {
      event: hsEvent,
      properties: {
        page_url: window.location.href,
        page_title: document.title,
        category: gtmEvent.category,
        action: gtmEvent.action,
        label: gtmEvent.label,
        value: gtmEvent.value,
        ...gtmEvent.custom_parameters,
      },
    };
  }

  // Eventos específicos para Fascinante Digital
  trackLeadGeneration(source: string, formType: string) {
    this.pushEvent({
      event: "form_submit",
      category: "Lead Generation",
      action: "Submit",
      label: `${formType} - ${source}`,
      value: 1,
      custom_parameters: {
        form_type: formType,
        source: source,
        page_url: typeof window !== "undefined" ? window.location.href : "",
      },
    });
  }

  trackServiceView(serviceName: string) {
    this.pushEvent({
      event: "page_view",
      category: "Services",
      action: "View",
      label: serviceName,
      custom_parameters: {
        service_name: serviceName,
        page_url: typeof window !== "undefined" ? window.location.href : "",
      },
    });
  }

  trackContactClick(
    contactType: "phone" | "whatsapp" | "email",
    location: string,
  ) {
    this.pushEvent({
      event: `${contactType}_click`,
      category: "Contact",
      action: "Click",
      label: `${contactType} - ${location}`,
      value: 1,
      custom_parameters: {
        contact_type: contactType,
        location: location,
        page_url: typeof window !== "undefined" ? window.location.href : "",
      },
    });
  }

  trackScrollDepth(depth: number) {
    this.pushEvent({
      event: "scroll",
      category: "Engagement",
      action: "Scroll",
      label: `${depth}%`,
      value: depth,
      custom_parameters: {
        scroll_depth: depth,
        page_url: typeof window !== "undefined" ? window.location.href : "",
      },
    });
  }

  trackTimeOnPage(seconds: number) {
    this.pushEvent({
      event: "time_on_page",
      category: "Engagement",
      action: "Time",
      label: `${seconds}s`,
      value: seconds,
      custom_parameters: {
        time_on_page: seconds,
        page_url: typeof window !== "undefined" ? window.location.href : "",
      },
    });
  }
}

// Instancia global
export const gtmClient = new GTMClient();

// Tipos para window
declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: any;
    _hsq?: any[];
  }
}
