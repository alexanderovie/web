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
import { IconUsers, IconSettings, IconChartBar } from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function HubSpotPage() {
  usePageTitle("HubSpot");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">HubSpot</h2>
          <p className="text-muted-foreground">
            Gestiona contactos, leads y automatizaciones de marketing
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Emails enviados
            </CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa conversión
            </CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Rendimiento de marketing</CardTitle>
            <CardDescription>
              Métricas de campañas y conversiones
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <IconChartBar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Gráfico pendiente de implementación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Workflows activos</CardTitle>
            <CardDescription>Automatizaciones en ejecución</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Onboarding
                </span>
                <Badge variant="outline">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Lead Nurturing
                </span>
                <Badge variant="outline">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Abandoned Cart
                </span>
                <Badge variant="outline">Activo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de HubSpot</CardTitle>
            <CardDescription>Conecta tu cuenta de HubSpot</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconSettings className="mr-2 h-4 w-4" />
              Conectar HubSpot
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automatizaciones</CardTitle>
            <CardDescription>
              Configura workflows y secuencias de email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconChartBar className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Secuencia de bienvenida</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconChartBar className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Nurturing de leads</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconChartBar className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Recuperación de carrito</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
