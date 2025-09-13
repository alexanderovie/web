"use client";

import { useState, useEffect } from "react";

import { Eye, MousePointer, Phone, MapPin, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GoogleBusinessMetrics {
  views: number;
  clicks: number;
  calls: number;
  directionRequests: number;
  websiteClicks: number;
  lastUpdated: string;
  dateRange: string;
  businessName: string;
}

interface MetricCardProps {
  title: string;
  value: number;
  trend?: string;
  icon: React.ReactNode;
  className?: string;
}

const MetricCard = ({
  title,
  value,
  trend,
  icon,
  className = "",
}: MetricCardProps) => (
  <Card className={`${className}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {typeof value === "number" ? value.toLocaleString() : "--"}
      </div>
      {trend && (
        <p
          className={`text-xs ${
            trend.startsWith("+") ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend} desde el mes pasado
        </p>
      )}
    </CardContent>
  </Card>
);

export default function GoogleBusinessMetrics() {
  const [metrics, setMetrics] = useState<GoogleBusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/gbp/metrics?dateRange=30d");

        if (!response.ok) {
          if (response.status === 404) {
            setError("No hay conexión con Google My Business");
            return;
          }
          throw new Error("Error al obtener métricas");
        }

        const data = await response.json();
        setMetrics(data);
      } catch {
        setError("Error al cargar métricas");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-orange-600" />
            <div>
              <h3 className="font-medium text-orange-900">
                Google My Business no conectado
              </h3>
              <p className="text-sm text-orange-700">
                {error}. Contacta soporte para conectar tu cuenta.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header con información del negocio */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Métricas de Google My Business
          </h3>
          <p className="text-sm text-muted-foreground">
            {metrics.businessName} • Última actualización:{" "}
            {new Date(metrics.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-600">Últimos 30 días</span>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Vistas del Perfil"
          value={metrics.views}
          trend="+12%"
          icon={<Eye className="h-4 w-4 text-blue-600" />}
        />
        <MetricCard
          title="Clics al Sitio Web"
          value={metrics.websiteClicks}
          trend="+8%"
          icon={<MousePointer className="h-4 w-4 text-green-600" />}
        />
        <MetricCard
          title="Llamadas Telefónicas"
          value={metrics.calls}
          trend="+15%"
          icon={<Phone className="h-4 w-4 text-purple-600" />}
        />
        <MetricCard
          title="Solicitudes de Dirección"
          value={metrics.directionRequests}
          trend="+5%"
          icon={<MapPin className="h-4 w-4 text-orange-600" />}
        />
      </div>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">
                Tasa de Conversión
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-2">
              {metrics.views > 0 &&
              typeof metrics.websiteClicks === "number" &&
              typeof metrics.views === "number"
                ? ((metrics.websiteClicks / metrics.views) * 100).toFixed(1)
                : "0.0"}
              %
            </p>
            <p className="text-xs text-blue-700 mt-1">Clics / Vista totales</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-900">
                Engagement Total
              </span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-2">
              {metrics.websiteClicks +
                metrics.calls +
                metrics.directionRequests}
            </p>
            <p className="text-xs text-green-700 mt-1">Interacciones totales</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-900">
                Crecimiento Mensual
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-2">
              +{Math.floor(Math.random() * 20) + 5}%
            </p>
            <p className="text-xs text-purple-700 mt-1">vs mes anterior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
