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
  IconUsers,
  IconSettings,
  IconChartBar,
  IconCreditCard,
  IconTrendingUp,
  IconCalendar,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SubscriptionsPage() {
  usePageTitle("Suscripciones");

  return (
    <div className="flex flex-1 flex-col gap-2 p-4 lg:p-6 xl:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Suscripciones</h2>
          <p className="text-muted-foreground">
            Gestiona suscripciones y facturación de clientes
          </p>
        </div>
        <Badge variant="secondary"># PENDIENTE</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones</CardTitle>
            <IconCreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renovaciones</CardTitle>
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ingresos por suscripción</CardTitle>
            <CardDescription>Gráfico de ingresos recurrentes</CardDescription>
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
            <CardTitle>Planes populares</CardTitle>
            <CardDescription>Suscripciones por plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Plan Básico
                </span>
                <Badge variant="outline">45</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Plan Pro</span>
                <Badge variant="outline">32</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Plan Enterprise
                </span>
                <Badge variant="outline">18</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Stripe</CardTitle>
            <CardDescription>
              Conecta tu cuenta de Stripe para pagos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled>
              <IconAlertTriangle className="mr-2 h-4 w-4" />
              Conectar Stripe
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Esta funcionalidad está pendiente de desarrollo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de planes</CardTitle>
            <CardDescription>Configura planes y precios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Crear nuevos planes</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Gestionar precios</span>
              </div>
              <div className="flex items-center space-x-2">
                <IconAlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Configurar descuentos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
