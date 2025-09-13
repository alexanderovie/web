"use client";

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
  IconFileAnalytics,
  IconAlertTriangle,
  IconGauge,
  IconSearch,
  IconDeviceMobile,
} from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function OnPagePage() {
  usePageTitle("Análisis On-Page");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Análisis On-Page
          </h2>
          <p className="text-muted-foreground">
            Analiza el rendimiento y SEO de tus páginas web
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Puntuación SEO
            </CardTitle>
            <IconSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">/100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
            <IconGauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">segundos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mobile Friendly
            </CardTitle>
            <IconDeviceMobile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">/100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Páginas analizadas
            </CardTitle>
            <IconFileAnalytics className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Rendimiento del sitio</CardTitle>
            <CardDescription>
              Análisis de velocidad y optimización
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <IconAlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gráfico pendiente de implementación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Problemas encontrados</CardTitle>
            <CardDescription>Issues de SEO y rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Meta tags faltantes
                </span>
                <Badge variant="destructive">Crítico</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Imágenes sin alt
                </span>
                <Badge variant="secondary">Medio</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Tiempo de carga lento
                </span>
                <Badge variant="secondary">Medio</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Análisis de URL</CardTitle>
            <CardDescription>
              Analiza una URL específica para obtener insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconAlertTriangle className="mr-2 h-4 w-4" />
              Analizar URL
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
            <CardDescription>
              Sugerencias para mejorar el SEO on-page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Optimizar meta descriptions</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Comprimir imágenes</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Mejorar estructura de headings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
