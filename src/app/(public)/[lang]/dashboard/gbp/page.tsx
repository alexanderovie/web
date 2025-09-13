"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconBrandGoogle,
  IconRefresh,
  IconCheck,
  IconX,
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconWorld,
  IconChartBar,
  IconLoader2,
} from "@tabler/icons-react";
import { LocationMetricsModal } from "@/components/dashboard/location-metrics-modal";
import { EmptyStateGMB } from "@/components/dashboard/empty-state-gmb";
import { GMBConnectModal } from "@/components/dashboard/gmb-connect-modal";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Location {
  readonly id: string;
  readonly title: string;
  readonly accountId: string;
  readonly verificationStatus: string;
  readonly websiteClicks?: number;
  readonly callClicks?: number;
}

interface Account {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly verificationStatus: string;
  readonly locations: Location[];
}

interface LocationsData {
  readonly accounts: Account[];
  readonly summary: {
    readonly totalAccounts: number;
    readonly totalLocations: number;
    readonly totalWebsiteClicks: number;
    readonly totalCallClicks: number;
  };
}

export default function GBPPage() {
  usePageTitle("Google Business Profile");
  const [locationsData, setLocationsData] = useState<LocationsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    readonly id: string;
    readonly title: string;
  } | null>(null);
  const [metricsModalOpen, setMetricsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);

  const handleConnectGMB = () => {
    setConnectModalOpen(true);
  };

  const handleConnectSuccess = () => {
    setConnectModalOpen(false);
    void loadLocations(); // Recargar datos después de conexión exitosa
  };

  const loadLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/google-business/locations", {
        next: { revalidate: 300 },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Error desconocido" }));
        // Si es error de token no encontrado, es un estado normal (no error)
        if (response.status === 404 && errorData.error?.includes("token")) {
          setLocationsData(null); // Estado normal sin datos
          return;
        }
        throw new Error(errorData.error || "Error al cargar ubicaciones");
      }

      const data: LocationsData = await response.json();
      setLocationsData(data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error de conexión";
      setError(errorMessage);
      console.error("Error loading locations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (connectModalOpen === false) {
      // Only load if modal is closed or was just closed
      void loadLocations();
    }
  }, [loadLocations, connectModalOpen]); // Re-fetch when modal closes

  const openMetricsModal = (location: Location) => {
    setSelectedLocation({ id: location.id, title: location.title });
    setMetricsModalOpen(true);
  };

  const closeMetricsModal = () => {
    setMetricsModalOpen(false);
    setSelectedLocation(null);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "business":
        return <IconBuilding className="h-4 w-4" />;
      case "location":
        return <IconMapPin className="h-4 w-4" />;
      default:
        return <IconBuilding className="h-4 w-4" />;
    }
  };

  const renderVerificationIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return <IconCheck className="h-4 w-4 text-green-600" />;
      case "unverified":
        return <IconX className="h-4 w-4 text-red-600" />;
      default:
        return <IconX className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <IconLoader2 className="h-6 w-6 animate-spin" />
            <span>Cargando datos de Google My Business...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !locationsData) {
    return (
      <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
        <EmptyStateGMB onConnect={handleConnectGMB} isLoading={isConnecting} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Google Business Profile
          </h2>
          <p className="text-muted-foreground">
            Gestión y análisis de perfiles de negocio en Google
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <IconBrandGoogle className="h-3 w-3" />
            Conectado
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadLocations()}
            disabled={loading}
          >
            <IconRefresh className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Métricas de resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas</CardTitle>
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold @container/card">
              <span className="tabular-nums @[250px]/card:text-3xl">
                {locationsData.summary.totalAccounts}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
            <IconMapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold @container/card">
              <span className="tabular-nums @[250px]/card:text-3xl">
                {locationsData.summary.totalLocations}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clics Web</CardTitle>
            <IconWorld className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold @container/card">
              <span className="tabular-nums @[250px]/card:text-3xl">
                {locationsData.summary.totalWebsiteClicks.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Clics Llamadas
            </CardTitle>
            <IconPhone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold @container/card">
              <span className="tabular-nums @[250px]/card:text-3xl">
                {locationsData.summary.totalCallClicks.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de cuentas y ubicaciones */}
      <div className="space-y-6">
        {locationsData.accounts.map((account) => (
          <Card
            key={account.id}
            className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAccountTypeIcon(account.type)}
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {renderVerificationIcon(account.verificationStatus)}
                    {account.verificationStatus}
                  </Badge>
                  <Badge variant="secondary">{account.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {account.locations.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => openMetricsModal(location)}
                  >
                    <div className="flex items-center gap-3">
                      <IconMapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{location.title}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {location.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {location.websiteClicks?.toLocaleString() || 0} clics
                          web
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {location.callClicks?.toLocaleString() || 0} llamadas
                        </p>
                      </div>
                      <IconChartBar className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de métricas */}
      {selectedLocation && (
        <LocationMetricsModal
          isOpen={metricsModalOpen}
          onClose={closeMetricsModal}
          locationId={selectedLocation.id}
          locationTitle={selectedLocation.title}
        />
      )}

      {/* Modal de conexión */}
      <GMBConnectModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSuccess={handleConnectSuccess}
      />
    </div>
  );
}
