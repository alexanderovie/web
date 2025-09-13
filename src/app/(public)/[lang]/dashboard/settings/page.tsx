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
  IconSettings,
  IconUser,
  IconShield,
  IconBell,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SettingsPage() {
  usePageTitle("Configuración");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Configuración</h2>
          <p className="text-muted-foreground">
            Gestiona la configuración de tu cuenta y preferencias
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfil</CardTitle>
            <IconUser className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Completado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguridad</CardTitle>
            <IconShield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Configurado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notificaciones
            </CardTitle>
            <IconBell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integraciones</CardTitle>
            <IconSettings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Conectadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Configuración general</CardTitle>
            <CardDescription>Configuración básica de la cuenta</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Idioma</span>
                <Badge variant="outline">Español</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Zona horaria
                </span>
                <Badge variant="outline">UTC-5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tema</span>
                <Badge variant="outline">Automático</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Acceso rápido</CardTitle>
            <CardDescription>Configuraciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Cambiar contraseña
                </span>
                <Badge variant="outline">Seguro</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Autenticación 2FA
                </span>
                <Badge variant="outline">Activo</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Sesiones activas
                </span>
                <Badge variant="outline">2</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de cuenta</CardTitle>
            <CardDescription>
              Gestiona información personal y preferencias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconAlertTriangle className="mr-2 h-4 w-4" />
              Editar perfil
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
            <CardDescription>
              Configura notificaciones y alertas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Notificaciones por email</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Alertas de seguridad</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Reportes semanales</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
