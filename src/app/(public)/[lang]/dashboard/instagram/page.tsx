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
import { IconPhoto, IconSettings, IconChartBar } from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function InstagramPage() {
  usePageTitle("Instagram");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Instagram</h2>
          <p className="text-muted-foreground">
            Gestiona tu cuenta de Instagram y analiza el rendimiento
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguidores</CardTitle>
            <IconPhoto className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Likes</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compartidos</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Rendimiento de publicaciones</CardTitle>
            <CardDescription>Gráfico de engagement y alcance</CardDescription>
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
            <CardTitle>Publicaciones recientes</CardTitle>
            <CardDescription>
              Últimas publicaciones con mejor rendimiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Post #1</span>
                <Badge variant="outline">1.2k likes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Post #2</span>
                <Badge variant="outline">856 likes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Post #3</span>
                <Badge variant="outline">654 likes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Instagram</CardTitle>
            <CardDescription>
              Conecta tu cuenta de Instagram Business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconSettings className="mr-2 h-4 w-4" />
              Conectar Instagram
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Programación de contenido</CardTitle>
            <CardDescription>
              Programa publicaciones automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconChartBar className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Programar posts</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconChartBar className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Stories automáticos</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconChartBar className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Analytics avanzados</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
