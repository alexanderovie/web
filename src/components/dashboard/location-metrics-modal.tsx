"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconLoader2,
  IconRefresh,
  IconChartBar,
  IconGlobe,
  IconPhone,
  IconCalendar,
  IconAlertTriangle,
} from "@tabler/icons-react";

interface LocationMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: string;
  locationTitle: string;
}

interface MetricsData {
  locationId: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: {
    websiteClicks: {
      total: number;
      dailyData: Array<{
        date: string;
        value: number;
      }>;
    };
    callClicks: {
      total: number;
      dailyData: Array<{
        date: string;
        value: number;
      }>;
    };
  };
}

export function LocationMetricsModal({
  isOpen,
  onClose,
  locationId,
  locationTitle,
}: LocationMetricsModalProps) {
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noMetricsAvailable, setNoMetricsAvailable] = useState(false);

  // Estado para el selector de fechas
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const lastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate(),
    );

    return {
      start: lastMonth.toISOString().split("T")[0], // 1 mes atrás
      end: today.toISOString().split("T")[0], // Hoy
    };
  });

  const loadMetrics = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      setNoMetricsAvailable(false);

      const start = startDate || dateRange.start;
      const end = endDate || dateRange.end;

      const response = await fetch(
        `/api/google-business/locations/${locationId}/metrics?startDate=${start}&endDate=${end}`,
      );
      const data = await response.json();

      if (response.ok) {
        setMetricsData(data.data);
      } else {
        // Manejar errores específicos
        if (response.status === 403) {
          setNoMetricsAvailable(true);
          setError(
            "Esta ubicación no tiene métricas disponibles. Posibles causas:",
          );
        } else if (response.status === 404) {
          setError("No se encontró la ubicación especificada.");
        } else if (response.status === 401) {
          setError(
            "Token expirado. Por favor, reconecta tu cuenta de Google My Business.",
          );
        } else {
          setError(data.error || "Error al cargar métricas");
        }
      }
    } catch (error) {
      setError(
        "Error de conexión. Verifica tu conexión a internet e intenta de nuevo.",
      );
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && locationId) {
      loadMetrics();
    }
  }, [isOpen, locationId]);

  const handleDateChange = () => {
    loadMetrics();
  };

  const setQuickDateRange = (range: "week" | "month" | "quarter" | "year") => {
    const today = new Date();
    let startDate: Date;

    switch (range) {
      case "week":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate(),
        );
        break;
      case "quarter":
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 3,
          today.getDate(),
        );
        break;
      case "year":
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate(),
        );
    }

    const newDateRange = {
      start: startDate.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    };

    setDateRange(newDateRange);
    loadMetrics(newDateRange.start, newDateRange.end);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTopDays = (
    dailyData: Array<{ date: string; value: number }>,
    count: number = 5,
  ) => {
    return dailyData
      .filter((day) => day.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, count);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconChartBar className="h-5 w-5" />
            Métricas de {locationTitle}
          </DialogTitle>
          <DialogDescription>
            Análisis detallado del rendimiento de esta ubicación
          </DialogDescription>
        </DialogHeader>

        {/* Selector de fechas */}
        <div className="space-y-4">
          {/* Botones de acceso rápido */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateRange("week")}
              className="text-xs"
            >
              Última semana
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateRange("month")}
              className="text-xs"
            >
              Último mes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateRange("quarter")}
              className="text-xs"
            >
              Último trimestre
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setQuickDateRange("year")}
              className="text-xs"
            >
              Último año
            </Button>
          </div>

          {/* Selector personalizado */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <IconCalendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Rango personalizado:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">hasta</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={handleDateChange}
                size="sm"
                variant="outline"
                disabled={loading}
              >
                {loading ? (
                  <IconLoader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <IconRefresh className="h-3 w-3" />
                )}
                Actualizar
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <IconLoader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Cargando métricas...</p>
            </div>
          </div>
        )}

        {error && !noMetricsAvailable && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => loadMetrics()} variant="outline">
                <IconRefresh className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {noMetricsAvailable && (
          <div className="space-y-6">
            {/* Información general */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{locationTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {locationId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
                </span>
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <IconAlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 mb-2">
                    Métricas no disponibles
                  </h4>
                  <p className="text-sm text-amber-700 mb-4">
                    Esta ubicación no tiene métricas disponibles. Esto puede
                    deberse a que:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1 mb-4">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                      La ubicación no está verificada en Google My Business
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                      La ubicación es muy reciente y aún no tiene datos de
                      rendimiento
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                      No hay actividad registrada en el período seleccionado
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                      La ubicación no tiene permisos de métricas habilitados
                    </li>
                  </ul>
                  <div className="bg-white border border-amber-200 rounded p-3">
                    <p className="text-xs text-amber-800 font-medium mb-1">
                      ¿Qué puedes hacer?
                    </p>
                    <ul className="text-xs text-amber-700 space-y-1">
                      <li>
                        • Verifica que la ubicación esté completamente
                        verificada en Google My Business
                      </li>
                      <li>
                        • Asegúrate de que la ubicación tenga información
                        completa (dirección, teléfono, horarios)
                      </li>
                      <li>
                        • Espera unos días para que se generen las primeras
                        métricas
                      </li>
                      <li>• Intenta con un rango de fechas más amplio</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas en cero para mostrar estructura */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="opacity-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clics en sitio web
                  </CardTitle>
                  <IconGlobe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    0 días con actividad
                  </p>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clics en llamadas
                  </CardTitle>
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    0 días con actividad
                  </p>
                </CardContent>
              </Card>

              <Card className="opacity-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de clics
                  </CardTitle>
                  <IconChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">0</div>
                  <p className="text-xs text-muted-foreground">
                    Sin datos disponibles
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {metricsData && !loading && (
          <div className="space-y-6">
            {/* Información general */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{locationTitle}</h3>
                <p className="text-sm text-muted-foreground">
                  ID: {locationId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(metricsData.dateRange.start)} -{" "}
                  {formatDate(metricsData.dateRange.end)}
                </span>
              </div>
            </div>

            {/* Métricas principales */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clics en sitio web
                  </CardTitle>
                  <IconGlobe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsData.metrics.websiteClicks.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {
                      metricsData.metrics.websiteClicks.dailyData.filter(
                        (day) => day.value > 0,
                      ).length
                    }{" "}
                    días con actividad
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clics en llamadas
                  </CardTitle>
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metricsData.metrics.callClicks.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {
                      metricsData.metrics.callClicks.dailyData.filter(
                        (day) => day.value > 0,
                      ).length
                    }{" "}
                    días con actividad
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de clics
                  </CardTitle>
                  <IconChartBar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    {metricsData.metrics.websiteClicks.total +
                      metricsData.metrics.callClicks.total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Rendimiento total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Días con mayor actividad */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Días con más clics en sitio web
                  </CardTitle>
                  <CardDescription>
                    Top 5 días con mayor actividad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getTopDays(metricsData.metrics.websiteClicks.dailyData)
                    .length > 0 ? (
                    <div className="space-y-2">
                      {getTopDays(
                        metricsData.metrics.websiteClicks.dailyData,
                      ).map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded"
                        >
                          <span className="text-sm">
                            {formatDate(day.date)}
                          </span>
                          <Badge variant="default">{day.value} clics</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay datos de clics en sitio web
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Días con más clics en llamadas
                  </CardTitle>
                  <CardDescription>
                    Top 5 días con mayor actividad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {getTopDays(metricsData.metrics.callClicks.dailyData).length >
                  0 ? (
                    <div className="space-y-2">
                      {getTopDays(metricsData.metrics.callClicks.dailyData).map(
                        (day, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded"
                          >
                            <span className="text-sm">
                              {formatDate(day.date)}
                            </span>
                            <Badge variant="default">{day.value} clics</Badge>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay datos de clics en llamadas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumen de actividad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumen de actividad</CardTitle>
                <CardDescription>
                  Análisis del período seleccionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {
                        metricsData.metrics.websiteClicks.dailyData.filter(
                          (day) => day.value > 0,
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Días con clics web
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {
                        metricsData.metrics.callClicks.dailyData.filter(
                          (day) => day.value > 0,
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Días con clics llamadas
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.max(
                        ...metricsData.metrics.websiteClicks.dailyData.map(
                          (day) => day.value,
                        ),
                        0,
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Máx clics web/día
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {Math.max(
                        ...metricsData.metrics.callClicks.dailyData.map(
                          (day) => day.value,
                        ),
                        0,
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Máx clics llamadas/día
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
