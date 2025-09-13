"use client";

import React from "react";
import {
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconWorld,
  IconClock,
  IconTag,
  IconCheck,
  IconAlertCircle,
  IconMap,
  IconSettings,
  IconMail,
  IconBrandWhatsapp,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconCreditCard,
  IconWheelchair,
  IconBus,
  IconAccessible,
  IconParking,
  IconRoute,
  IconCalendar,
  IconUsers,
  IconCertificate,
  IconAward,
  IconEye,
  IconClick,
  IconPhoneCall,
  IconNavigation,
  IconGlobe,
  IconShield,
  IconCalendarEvent,
  IconUserCheck,
  IconEdit,
  IconRefresh,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Tipos extendidos para incluir todos los datos posibles
export interface EnhancedNAPDetails {
  // NAP básico
  name: string;
  address: string;
  phone: string;

  // Información de contacto extendida
  website?: string;
  email?: string;
  whatsapp?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };

  // Información de ubicación extendida
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  postalCode?: string;
  country?: string;
  timezone?: string;
  directions?: string;

  // Horarios
  regularHours?: string;
  specialHours?: string;
  closedDays?: string[];
  seasonalHours?: string;

  // Servicios y productos
  services?: string[];
  products?: string[];
  specialties?: string[];
  certifications?: string[];
  paymentMethods?: string[];

  // Accesibilidad
  accessibility?: {
    wheelchairAccessible?: boolean;
    parking?: string;
    publicTransport?: string;
    accessibleEntrance?: boolean;
    accessibleRestrooms?: boolean;
  };

  // Métricas y rendimiento
  metrics?: {
    profileViews?: number;
    websiteClicks?: number;
    phoneCalls?: number;
    directionRequests?: number;
    responseTime?: string;
  };

  // Verificación
  verification?: {
    status: string;
    verifiedDate?: string;
    method?: string;
  };

  // Gestión
  management?: {
    lastUpdated?: string;
    owner?: string;
    manager?: string;
    permissions?: string[];
  };

  // Información adicional
  category?: string;
  businessStatus?: string;
  photoCount?: number;
  reviewCount?: number;
  averageRating?: number;
  description?: string;
  labels?: string[];
  serviceArea?: string;
  adWordsLocationId?: string;
  titleLanguageCode?: string;
}

interface Props {
  details?: EnhancedNAPDetails;
  loading?: boolean;
  error?: string | null;
}

/**
 * EnhancedNAPDetails
 * Muestra todos los datos disponibles del NAP de forma profesional y responsiva
 */
export const EnhancedNAPDetails: React.FC<Props> = ({
  details,
  loading,
  error,
}) => {
  const [activeTab, setActiveTab] = React.useState("contact");

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBuilding className="h-5 w-5 text-blue-600" />
              Detalles Extendidos del NAP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <IconAlertCircle className="h-5 w-5" />
            Error al cargar detalles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-800">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!details) return null;

  return (
    <div className="space-y-6">
      {/* Header con información básica */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-blue-600" />
            {details.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <IconMapPin className="h-5 w-5 text-purple-600" />
              <span className="text-sm">{details.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <IconPhone className="h-5 w-5 text-green-600" />
              <span className="text-sm">{details.phone}</span>
            </div>
            {details.website && (
              <div className="flex items-center gap-3">
                <IconWorld className="h-5 w-5 text-blue-500" />
                <a
                  href={details.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sm"
                >
                  {details.website}
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs para organizar la información */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
          <TabsTrigger value="hours">Horarios</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="management">Gestión</TabsTrigger>
        </TabsList>

        {/* Tab de Contacto */}
        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información de contacto básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconPhone className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details.email && (
                  <div className="flex items-center gap-3">
                    <IconMail className="h-4 w-4 text-blue-600" />
                    <a
                      href={`mailto:${details.email}`}
                      className="text-sm hover:underline"
                    >
                      {details.email}
                    </a>
                  </div>
                )}
                {details.whatsapp && (
                  <div className="flex items-center gap-3">
                    <IconBrandWhatsapp className="h-4 w-4 text-green-600" />
                    <a
                      href={`https://wa.me/${details.whatsapp}`}
                      className="text-sm hover:underline"
                    >
                      {details.whatsapp}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Redes sociales */}
            {details.socialMedia &&
              Object.keys(details.socialMedia).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <IconWorld className="h-5 w-5" />
                      Redes Sociales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {details.socialMedia.facebook && (
                      <div className="flex items-center gap-3">
                        <IconBrandFacebook className="h-4 w-4 text-blue-600" />
                        <a
                          href={details.socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          Facebook
                        </a>
                      </div>
                    )}
                    {details.socialMedia.instagram && (
                      <div className="flex items-center gap-3">
                        <IconBrandInstagram className="h-4 w-4 text-pink-600" />
                        <a
                          href={details.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          Instagram
                        </a>
                      </div>
                    )}
                    {details.socialMedia.twitter && (
                      <div className="flex items-center gap-3">
                        <IconBrandTwitter className="h-4 w-4 text-blue-400" />
                        <a
                          href={details.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          Twitter
                        </a>
                      </div>
                    )}
                    {details.socialMedia.linkedin && (
                      <div className="flex items-center gap-3">
                        <IconBrandLinkedin className="h-4 w-4 text-blue-700" />
                        <a
                          href={details.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
          </div>
        </TabsContent>

        {/* Tab de Ubicación */}
        <TabsContent value="location" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información de ubicación básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconMapPin className="h-5 w-5" />
                  Información de Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details.coordinates && (
                  <div className="flex items-center gap-3">
                    <IconMap className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      {details.coordinates.latitude},{" "}
                      {details.coordinates.longitude}
                    </span>
                  </div>
                )}
                {details.postalCode && (
                  <div className="flex items-center gap-3">
                    <IconMapPin className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">CP: {details.postalCode}</span>
                  </div>
                )}
                {details.country && (
                  <div className="flex items-center gap-3">
                    <IconGlobe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{details.country}</span>
                  </div>
                )}
                {details.timezone && (
                  <div className="flex items-center gap-3">
                    <IconClock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">{details.timezone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accesibilidad */}
            {details.accessibility && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconAccessible className="h-5 w-5" />
                    Accesibilidad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {details.accessibility.wheelchairAccessible && (
                    <div className="flex items-center gap-3">
                      <IconWheelchair className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Acceso para silla de ruedas
                      </span>
                    </div>
                  )}
                  {details.accessibility.parking && (
                    <div className="flex items-center gap-3">
                      <IconParking className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">
                        {details.accessibility.parking}
                      </span>
                    </div>
                  )}
                  {details.accessibility.publicTransport && (
                    <div className="flex items-center gap-3">
                      <IconBus className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        {details.accessibility.publicTransport}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Instrucciones de llegada */}
          {details.directions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconRoute className="h-5 w-5" />
                  Cómo Llegar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {details.directions}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Horarios */}
        <TabsContent value="hours" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Horarios regulares */}
            {details.regularHours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconClock className="h-5 w-5" />
                    Horarios Regulares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {details.regularHours.split(" | ").map((hours, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Horarios especiales */}
            {details.specialHours && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconCalendar className="h-5 w-5" />
                    Horarios Especiales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {details.specialHours}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Días cerrados */}
          {details.closedDays && details.closedDays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconCalendar className="h-5 w-5" />
                  Días Cerrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.closedDays.map((day, index) => (
                    <Badge key={index} variant="secondary">
                      {day}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Servicios */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Servicios */}
            {details.services && details.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconSettings className="h-5 w-5" />
                    Servicios Ofrecidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {details.services.map((service, index) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Productos */}
            {details.products && details.products.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconTag className="h-5 w-5" />
                    Productos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {details.products.map((product, index) => (
                      <Badge key={index} variant="outline">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Especialidades */}
          {details.specialties && details.specialties.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconAward className="h-5 w-5" />
                  Especialidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificaciones */}
          {details.certifications && details.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconCertificate className="h-5 w-5" />
                  Certificaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.certifications.map((cert, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métodos de pago */}
          {details.paymentMethods && details.paymentMethods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconCreditCard className="h-5 w-5" />
                  Métodos de Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {details.paymentMethods.map((method, index) => (
                    <Badge key={index} variant="outline">
                      {method}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Métricas */}
        <TabsContent value="metrics" className="space-y-4">
          {details.metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Vistas del Perfil
                  </CardTitle>
                  <IconEye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {details.metrics.profileViews?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Clics al Sitio Web
                  </CardTitle>
                  <IconClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {details.metrics.websiteClicks?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Llamadas
                  </CardTitle>
                  <IconPhoneCall className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {details.metrics.phoneCalls?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Solicitudes de Dirección
                  </CardTitle>
                  <IconNavigation className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {details.metrics.directionRequests?.toLocaleString() || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tiempo de respuesta */}
          {details.metrics?.responseTime && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconClock className="h-5 w-5" />
                  Tiempo de Respuesta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{details.metrics.responseTime}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab de Gestión */}
        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estado de verificación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconShield className="h-5 w-5" />
                  Estado de Verificación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <IconCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm">
                    {details.verification?.status}
                  </span>
                </div>
                {details.verification?.verifiedDate && (
                  <div className="flex items-center gap-3">
                    <IconCalendarEvent className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      Verificado: {details.verification.verifiedDate}
                    </span>
                  </div>
                )}
                {details.verification?.method && (
                  <div className="flex items-center gap-3">
                    <IconShield className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">
                      Método: {details.verification.method}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Información de gestión */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconUsers className="h-5 w-5" />
                  Gestión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {details.management?.lastUpdated && (
                  <div className="flex items-center gap-3">
                    <IconRefresh className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      Actualizado: {details.management.lastUpdated}
                    </span>
                  </div>
                )}
                {details.management?.owner && (
                  <div className="flex items-center gap-3">
                    <IconUserCheck className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Propietario: {details.management.owner}
                    </span>
                  </div>
                )}
                {details.management?.manager && (
                  <div className="flex items-center gap-3">
                    <IconEdit className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">
                      Gestor: {details.management.manager}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Permisos */}
          {details.management?.permissions &&
            details.management.permissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <IconShield className="h-5 w-5" />
                    Permisos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {details.management.permissions.map((permission, index) => (
                      <Badge key={index} variant="outline">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedNAPDetails;
