/**
 * Servicio de sincronización de analytics
 * Sincroniza datos entre GTM, Meta y HubSpot
 */

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface MetaAudienceData {
  audienceId: string;
  users: Array<{
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    customData?: Record<string, any>;
  }>;
}

export interface HubSpotContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  lifecycleStage?: string;
  leadStatus?: string;
  customProperties?: Record<string, any>;
}

class AnalyticsSync {
  private events: AnalyticsEvent[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window !== "undefined") {
      this.isInitialized = true;
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    // Escuchar eventos de GTM
    if (typeof window !== "undefined" && window.dataLayer) {
      const originalPush = window.dataLayer.push;
      window.dataLayer.push = (...args: any[]) => {
        const result = originalPush.apply(window.dataLayer, args);
        this.handleGTMEvent(args[0]);
        return result;
      };
    }
  }

  private handleGTMEvent(event: any) {
    if (event && event.event) {
      this.events.push({
        event: event.event,
        properties: event,
        timestamp: Date.now(),
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
      });

      // Sincronizar con Meta y HubSpot
      this.syncToMeta(event);
      this.syncToHubSpot(event);
    }
  }

  private getUserId(): string | undefined {
    // Obtener ID de usuario desde localStorage o cookies
    if (typeof window !== "undefined") {
      return localStorage.getItem("analytics_user_id") || undefined;
    }
    return undefined;
  }

  private getSessionId(): string {
    // Generar o recuperar session ID
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("analytics_session_id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem("analytics_session_id", sessionId);
      }
      return sessionId;
    }
    return "";
  }

  private syncToMeta(event: any) {
    // Sincronizar evento con Meta Pixel
    if (typeof window !== "undefined" && window.fbq) {
      const fbqEvent = this.mapToMetaEvent(event);
      if (fbqEvent) {
        window.fbq("track", fbqEvent.event, fbqEvent.properties);
      }
    }
  }

  private syncToHubSpot(event: any) {
    // Sincronizar evento con HubSpot
    if (typeof window !== "undefined" && window._hsq) {
      const hsEvent = this.mapToHubSpotEvent(event);
      if (hsEvent) {
        window._hsq.push(["trackEvent", hsEvent.event, hsEvent.properties]);
      }
    }
  }

  private mapToMetaEvent(gtmEvent: any) {
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

    const metaEvent = eventMap[gtmEvent.event] || gtmEvent.event;

    return {
      event: metaEvent,
      properties: {
        content_name: gtmEvent.event_label,
        content_category: gtmEvent.event_category,
        value: gtmEvent.event_value,
        currency: "USD",
        ...gtmEvent,
      },
    };
  }

  private mapToHubSpotEvent(gtmEvent: any) {
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
        category: gtmEvent.event_category,
        action: gtmEvent.event_action,
        label: gtmEvent.event_label,
        value: gtmEvent.event_value,
        ...gtmEvent,
      },
    };
  }

  // Métodos públicos para sincronización manual
  async syncContactToMeta(contactData: HubSpotContactData) {
    // Sincronizar contacto con Meta Custom Audience
    try {
      // Aquí iría la lógica para agregar el contacto a una audiencia personalizada
      console.log("Syncing contact to Meta:", contactData.email);
      // Production: Syncing to Meta
    } catch {
      // Production: Meta sync error
    }
  }

  async syncContactToHubSpot(contactData: HubSpotContactData) {
    // Sincronizar contacto con HubSpot
    try {
      if (typeof window !== "undefined" && window._hsq) {
        window._hsq.push([
          "identify",
          {
            email: contactData.email,
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            phone: contactData.phone,
            company: contactData.company,
            lifecycleStage: contactData.lifecycleStage,
            leadStatus: contactData.leadStatus,
            ...contactData.customProperties,
          },
        ]);
      }
    } catch {
      // Production: HubSpot sync error
    }
  }

  // Obtener eventos para análisis
  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Limpiar eventos antiguos
  clearOldEvents(maxAge: number = 24 * 60 * 60 * 1000) {
    // 24 horas por defecto
    const cutoff = Date.now() - maxAge;
    this.events = this.events.filter((event) => event.timestamp > cutoff);
  }
}

// Instancia global
export const analyticsSync = new AnalyticsSync();

// Tipos para window
declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: any;
    _hsq?: any[];
  }
}
