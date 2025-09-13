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
import { IconMapPin, IconSettings, IconChartBar } from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function PlacesPage() {
  usePageTitle("Places API");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Places API</h2>
          <p className="text-muted-foreground">
            Gestiona información de lugares y ubicaciones
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lugares</CardTitle>
            <IconMapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Búsquedas</CardTitle>
            <IconSettings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reseñas</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Promedio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contactos</CardTitle>
            <IconSettings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Verificados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Mapa de ubicaciones</CardTitle>
            <CardDescription>
              Visualización de lugares gestionados
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <IconSettings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Mapa pendiente de implementación</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Lugares recientes</CardTitle>
            <CardDescription>Últimos lugares agregados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Fascinante Digital
                </span>
                <Badge variant="outline">West Palm Beach</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Alexander Oviedo
                </span>
                <Badge variant="outline">Lake Worth</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Seguros Alexander
                </span>
                <Badge variant="outline">Florida</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Places API</CardTitle>
            <CardDescription>
              Conecta tu cuenta de Google Places
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconSettings className="mr-2 h-4 w-4" />
              Conectar Places API
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de lugares</CardTitle>
            <CardDescription>
              Herramientas para gestionar ubicaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconSettings className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Agregar nuevos lugares</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconSettings className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Actualizar información</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconSettings className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Gestionar reseñas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
