"use client";

import { useState, useEffect } from "react";

import {
  IconGlobe,
  IconMinus,
  IconPhone,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RealMetricsResponse {
  success: boolean;
  locationId: string;
  metrics: {
    dailyMetricsTimeSeries?: Array<{
      dailyMetric: string;
      timeSeries: {
        datedValues: Array<{
          date: {
            year: number;
            month: number;
            day: number;
          };
          value: number;
        }>;
      };
    }>;
  };
  summary: {
    websiteClicks: number;
    callClicks: number;
    totalClicks: number;
  };
  trends: {
    websiteClicks: number;
    callClicks: number;
    totalClicks: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
  note?: string;
}

interface LocationMetricsProps {
  locationId: string;
  isES?: boolean;
}

export default function LocationMetrics({
  locationId,
  isES = true,
}: LocationMetricsProps) {
  const [metrics, setMetrics] = useState<RealMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/google-business/locations/${locationId}/real-metrics`,
        );

        if (!response.ok) {
          const errorData = await response.json();
          setError(
            errorData.message ||
              (isES ? "Error al cargar métricas" : "Error loading metrics"),
          );
          return;
        }

        const data = await response.json();
        setMetrics(data);
      } catch {
        setError(isES ? "Error al cargar métricas" : "Error loading metrics");
      } finally {
        setLoading(false);
      }
    };

    if (locationId) {
      fetchMetrics();
    }
  }, [locationId, isES]);

  const getTrendIcon = (change: number) => {
    if (change > 0)
      return <IconTrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0)
      return <IconTrendingDown className="h-4 w-4 text-red-600" />;
    return <IconMinus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">
              {isES ? "Cargando métricas..." : "Loading metrics..."}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div>
              <h3 className="font-medium text-red-900">
                {isES ? "Error" : "Error"}
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <div>
              <h3 className="font-medium text-orange-900">
                {isES ? "Sin datos" : "No data"}
              </h3>
              <p className="text-sm text-orange-700">
                {isES
                  ? "No hay métricas disponibles para esta ubicación"
                  : "No metrics available for this location"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Source Info */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <div className="h-5 w-5 rounded-full bg-green-500"></div>
            {isES ? "Información de Datos" : "Data Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-green-900">
                {isES ? "Fuente de Datos" : "Data Source"}
              </p>
              <p className="text-sm text-green-700">
                Google Business Profile API
              </p>
            </div>
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 border-green-300"
            >
              {isES ? "Datos Reales" : "Real Data"}
            </Badge>
          </div>
          {metrics.note && (
            <p className="text-sm text-green-700 mt-2">{metrics.note}</p>
          )}
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Website Clicks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconGlobe className="h-5 w-5" />
              {isES ? "Clicks en Sitio Web" : "Website Clicks"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {metrics.summary.websiteClicks.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(metrics.trends.websiteClicks)}
              <span
                className={`text-sm font-medium ${getTrendColor(
                  metrics.trends.websiteClicks,
                )}`}
              >
                {metrics.trends.websiteClicks > 0 ? "+" : ""}
                {metrics.trends.websiteClicks}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isES ? "Últimos 30 días" : "Last 30 days"}
            </p>
          </CardContent>
        </Card>

        {/* Call Clicks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPhone className="h-5 w-5" />
              {isES ? "Clicks en Llamadas" : "Call Clicks"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.summary.callClicks.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getTrendIcon(metrics.trends.callClicks)}
              <span
                className={`text-sm font-medium ${getTrendColor(
                  metrics.trends.callClicks,
                )}`}
              >
                {metrics.trends.callClicks > 0 ? "+" : ""}
                {metrics.trends.callClicks}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isES ? "Últimos 30 días" : "Last 30 days"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isES ? "Período de datos" : "Data period"}:{" "}
              <span className="font-medium">
                {new Date(metrics.dateRange.startDate).toLocaleDateString(
                  isES ? "es-ES" : "en-US",
                )}{" "}
                -{" "}
                {new Date(metrics.dateRange.endDate).toLocaleDateString(
                  isES ? "es-ES" : "en-US",
                )}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
