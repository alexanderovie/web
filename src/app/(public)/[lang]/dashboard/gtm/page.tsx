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
  IconCode,
  IconAlertTriangle,
  IconEye,
  IconClick,
  IconTarget,
  IconSettings,
  IconChartBar,
} from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function GTMPage() {
  usePageTitle("Google Tag Manager");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Google Tag Manager
          </h2>
          <p className="text-muted-foreground">
            Gestiona etiquetas y eventos de seguimiento en tu sitio web
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Etiquetas activas
            </CardTitle>
            <IconCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Eventos registrados
            </CardTitle>
            <IconClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
            <IconTarget className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vistas de página
            </CardTitle>
            <IconEye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad de eventos</CardTitle>
            <CardDescription>
              Gráfico de eventos y conversiones en tiempo real
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
            <CardTitle>Contenedores</CardTitle>
            <CardDescription>Contenedores de GTM configurados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  GTM-XXXXXXX
                </span>
                <Badge variant="outline">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  GTM-YYYYYYY
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
            <CardTitle>Configuración de Google Tag Manager</CardTitle>
            <CardDescription>
              Conecta tu cuenta de Google Tag Manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconAlertTriangle className="mr-2 h-4 w-4" />
              Conectar GTM
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eventos personalizados</CardTitle>
            <CardDescription>
              Configura eventos de seguimiento personalizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Evento de compra</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Formulario de contacto</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Descarga de recursos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
