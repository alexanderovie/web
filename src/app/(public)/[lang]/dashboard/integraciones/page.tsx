"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  IconPlug,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconBuilding,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconLoader2,
  IconRefresh,
  IconChartBar,
  IconUsers,
  IconMail,
  IconShoppingCart,
  IconAd,
} from "@tabler/icons-react";
import { signIn, useSession } from "next-auth/react";

interface Integration {
  id: number;
  name: string;
  description: string;
  icon: string; // Cambiado a string para URLs de imágenes
  status: "connected" | "disconnected" | "pending";
  badgeText: string;
  badgeVariant: "default" | "secondary" | "destructive";
  actionText: string;
  actionVariant: "default" | "outline" | "destructive";
  isFunctional: boolean;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 1,
    name: "Google My Business",
    description: "Gestiona tu perfil de negocio en Google",
    icon: "https://developers.google.com/static/identity/images/g-logo.png",
    status: "disconnected",
    badgeText: "Disponible",
    badgeVariant: "secondary",
    actionText: "Conectar",
    actionVariant: "outline",
    isFunctional: true,
  },
  {
    id: 2,
    name: "Google Search Console",
    description: "Analiza el rendimiento SEO de tu sitio web",
    icon: "https://developers.google.com/static/search/images/search-console-logo.png",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
  {
    id: 3,
    name: "Google Analytics 4",
    description: "Monitorea el tráfico y comportamiento de usuarios",
    icon: "https://developers.google.com/static/analytics/images/analytics-logo.png",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
  {
    id: 4,
    name: "WhatsApp Business",
    description: "Automatiza mensajes y conversaciones",
    icon: "/images/integrations/whatsapp-logo.svg",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
  {
    id: 5,
    name: "Instagram Business",
    description: "Analiza y gestiona tu cuenta de Instagram",
    icon: "/images/integrations/instagram-logo.svg",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
  {
    id: 6,
    name: "HubSpot CRM",
    description: "Gestiona leads y pipeline de ventas",
    icon: "/images/integrations/hubspot-logo.png",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
  {
    id: 7,
    name: "Mailchimp",
    description: "Email marketing y automatización",
    icon: "/images/integrations/mailchimp-logo.svg",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
  {
    id: 8,
    name: "Shopify",
    description: "Gestión de tiendas online",
    icon: "/images/integrations/shopify-logo.svg",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
  {
    id: 9,
    name: "Google Ads",
    description: "Gestión de campañas publicitarias",
    icon: "https://developers.google.com/static/ads/images/ads-logo.png",
    status: "disconnected",
    badgeText: "Próximamente",
    badgeVariant: "secondary",
    actionText: "Próximamente",
    actionVariant: "outline",
    isFunctional: false,
  },
];

export default function IntegracionesPage() {
  const { data: session } = useSession();
  const [googleToken, setGoogleToken] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggles, setToggles] = useState<Record<number, boolean>>(() => {
    const state: Record<number, boolean> = {};
    INTEGRATIONS.forEach((i) => {
      state[i.id] = false;
    });
    return state;
  });

  useEffect(() => {
    loadGoogleToken();
  }, []);

  const loadGoogleToken = async () => {
    try {
      const response = await fetch("/api/google-business/tokens");
      if (response.ok) {
        const data = await response.json();
        setGoogleToken(data.token);
        if (data.token) {
          setToggles((prev) => ({
            ...prev,
            1: true, // Google My Business conectado
          }));
        }
      }
    } catch (error) {
      console.error("Error loading Google token:", error);
    }
  };

  const connectGoogleBusiness = async () => {
    try {
      setConnecting(true);
      setError(null);
      await signIn("google", {
        callbackUrl: "/api/google-business/callback",
        scope: "https://www.googleapis.com/auth/business.manage",
      });
    } catch (error) {
      setError("Error al conectar con Google My Business");
      console.error("Error connecting to Google Business:", error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectGoogleBusiness = async () => {
    try {
      const response = await fetch("/api/google-business/tokens", {
        method: "DELETE",
      });

      if (response.ok) {
        setGoogleToken(null);
        setError(null);
        setToggles((prev) => ({
          ...prev,
          1: false,
        }));
      }
    } catch (error) {
      console.error("Error disconnecting Google Business:", error);
    }
  };

  const refreshGoogleToken = async () => {
    try {
      setConnecting(true);
      setError(null);

      const response = await fetch("/api/google-business/tokens/refresh", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setGoogleToken(data.token);
        setError(null);
        // Token refrescado exitosamente
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al refrescar el token");
      }
    } catch (error) {
      setError("Error al refrescar el token");
      console.error("Error refreshing Google token:", error);
    } finally {
      setConnecting(false);
    }
  };

  const handleToggle = async (integrationId: number, checked: boolean) => {
    if (integrationId === 1) {
      // Google My Business
      if (checked) {
        await connectGoogleBusiness();
      } else {
        await disconnectGoogleBusiness();
      }
    } else {
      setToggles((prev) => ({
        ...prev,
        [integrationId]: checked,
      }));
    }
  };

  const getIntegrationStatus = (integration: Integration) => {
    if (integration.id === 1) {
      // Google My Business
      if (googleToken) {
        const isExpired =
          googleToken.expires_at &&
          new Date(googleToken.expires_at) < new Date();
        return {
          status: isExpired ? "pending" : "connected",
          badgeText: isExpired ? "Expirado" : "Conectado",
          badgeVariant: isExpired ? "destructive" : "default",
          actionText: "Detalles",
          actionVariant: "outline",
        };
      }
    }

    return {
      status: integration.status,
      badgeText: integration.badgeText,
      badgeVariant: integration.badgeVariant,
      actionText: integration.actionText,
      actionVariant: integration.actionVariant,
    };
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-6 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {INTEGRATIONS.map((integration) => {
              const status = getIntegrationStatus(integration);

              return (
                <div
                  key={integration.id}
                  className="flex min-h-[170px] flex-col justify-between rounded-xl border bg-background p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 flex-grow-0 items-center justify-center rounded-md bg-muted p-2">
                      <img
                        src={integration.icon}
                        alt={integration.name}
                        className="h-8 w-8 flex-shrink-0 flex-grow-0 object-contain"
                        onError={(e) => {
                          // Fallback a icono genérico si la imagen falla
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden",
                          );
                        }}
                      />
                      <IconPlug className="h-8 w-8 flex-shrink-0 flex-grow-0 hidden" />
                    </div>
                    <div>
                      <div className="text-base leading-tight font-medium">
                        {integration.name}
                      </div>
                      <div className="text-xs leading-snug text-muted-foreground">
                        {integration.description}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!integration.isFunctional || connecting}
                        onClick={() => {
                          if (integration.id === 1) {
                            // Google My Business
                            if (googleToken) {
                              disconnectGoogleBusiness();
                            } else {
                              connectGoogleBusiness();
                            }
                          }
                        }}
                      >
                        {connecting && integration.id === 1 ? (
                          <>
                            <IconLoader2 className="h-3 w-3 mr-1 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          status.actionText
                        )}
                      </Button>
                      {integration.id === 1 &&
                        googleToken &&
                        status.status === "pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={refreshGoogleToken}
                          >
                            <IconRefresh className="h-3 w-3 mr-1" />
                            Refresh
                          </Button>
                        )}
                    </div>
                    <Switch
                      checked={toggles[integration.id]}
                      onCheckedChange={(checked: boolean) =>
                        handleToggle(integration.id, checked)
                      }
                      disabled={!integration.isFunctional}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="px-4 lg:px-6">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
