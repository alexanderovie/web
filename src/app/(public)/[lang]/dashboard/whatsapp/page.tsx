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
  IconMessageCircle,
  IconPhone,
  IconSettings,
  IconChartBar,
} from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function WhatsAppPage() {
  usePageTitle("WhatsApp Business");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            WhatsApp Business
          </h2>
          <p className="text-muted-foreground">
            Gestiona tu cuenta de WhatsApp Business y automatiza mensajes
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mensajes enviados
            </CardTitle>
            <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mensajes recibidos
            </CardTitle>
            <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversaciones
            </CardTitle>
            <IconMessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de respuesta
            </CardTitle>
            <IconPhone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad de mensajes</CardTitle>
            <CardDescription>
              Gráfico de mensajes enviados y recibidos
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
            <CardTitle>Conversaciones recientes</CardTitle>
            <CardDescription>Últimas conversaciones activas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cliente 1</span>
                <Badge variant="outline">Hace 2h</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cliente 2</span>
                <Badge variant="outline">Hace 5h</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cliente 3</span>
                <Badge variant="outline">Ayer</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de WhatsApp Business</CardTitle>
            <CardDescription>
              Conecta tu cuenta de WhatsApp Business API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconSettings className="mr-2 h-4 w-4" />
              Conectar WhatsApp Business
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plantillas de mensajes</CardTitle>
            <CardDescription>
              Gestiona tus plantillas de mensajes automáticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconSettings className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Mensaje de bienvenida</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconSettings className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Confirmación de cita</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconSettings className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Recordatorio de pago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
