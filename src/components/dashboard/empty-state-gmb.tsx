"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconBrandGoogle,
  IconChartBar,
  IconUsers,
  IconMapPin,
  IconPhone,
  IconGlobe,
  IconArrowRight,
  IconStar,
  IconTrendingUp,
} from "@tabler/icons-react";

interface EmptyStateGMBProps {
  onConnect: () => void;
  isLoading?: boolean;
}

export function EmptyStateGMB({
  onConnect,
  isLoading = false,
}: EmptyStateGMBProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      {/* Header Motivacional */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-3 rounded-full">
            <IconBrandGoogle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Potencia tu Negocio en Google!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl">
          Conecta tu Google My Business y descubre insights increíbles sobre
          cómo los clientes encuentran tu negocio
        </p>
      </div>

      {/* Beneficios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <IconChartBar className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Métricas Detalladas</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Ve cuántos clics recibe tu sitio web y llamadas desde Google
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <IconUsers className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-lg">Visibilidad Local</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Analiza cómo te encuentran los clientes en tu área
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <IconTrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Optimización</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Mejora tu perfil y aumenta tu presencia en Google
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <IconStar className="h-5 w-5 text-yellow-500 fill-current" />
          <IconStar className="h-5 w-5 text-yellow-500 fill-current" />
          <IconStar className="h-5 w-5 text-yellow-500 fill-current" />
          <IconStar className="h-5 w-5 text-yellow-500 fill-current" />
          <IconStar className="h-5 w-5 text-yellow-500 fill-current" />
        </div>
        <p className="text-sm text-gray-600">
          <strong>1,234+ negocios</strong> ya están optimizando su presencia con
          nosotros
        </p>
      </div>

      {/* Call to Action Principal */}
      <div className="text-center">
        <Button
          onClick={onConnect}
          disabled={isLoading}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Conectando...
            </>
          ) : (
            <>
              <IconBrandGoogle className="h-5 w-5 mr-2" />
              Conectar Google My Business
              <IconArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-sm text-gray-500 mt-3">
          Solo toma 2 minutos • Conexión segura • Sin costo adicional
        </p>
      </div>

      {/* Métricas de ejemplo (faded) */}
      <div className="mt-12 opacity-30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-xs text-gray-500">Cuentas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-xs text-gray-500">Ubicaciones</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-xs text-gray-500">Clics Web</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400">--</div>
            <div className="text-xs text-gray-500">Clics Llamadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}
