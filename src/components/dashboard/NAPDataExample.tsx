"use client";

import React from "react";
import {
  EnhancedNAPDetails,
  EnhancedNAPDetails as EnhancedNAPDetailsType,
} from "./EnhancedNAPDetails";

/**
 * NAPDataExample
 * Componente que muestra datos de ejemplo para demostrar todas las funcionalidades
 */
export const NAPDataExample: React.FC = () => {
  // Datos de ejemplo que incluyen todos los campos posibles
  const exampleData: EnhancedNAPDetailsType = {
    // NAP básico
    name: "Fascinante Digital - Agencia de Marketing",
    address:
      "Av. Principal 123, Centro Comercial Plaza Mayor, Caracas, Distrito Capital, 1010",
    phone: "+1 (305) 555-0123",

    // Información de contacto extendida
    website: "https://fascinantedigital.com",
    email: "contacto@fascinantedigital.com",
    whatsapp: "+13055550123",
    socialMedia: {
      facebook: "https://facebook.com/fascinantedigital",
      instagram: "https://instagram.com/fascinantedigital",
      twitter: "https://twitter.com/fascinantedigital",
      linkedin: "https://linkedin.com/company/fascinantedigital",
    },

    // Información de ubicación extendida
    coordinates: {
      latitude: 10.4806,
      longitude: -66.9036,
    },
    postalCode: "1010",
    country: "Venezuela",
    timezone: "America/Caracas",
    directions:
      "Desde el centro de Caracas, tomar la Av. Principal hacia el este. Estamos en el Centro Comercial Plaza Mayor, piso 3, local 15.",

    // Horarios
    regularHours:
      "LUNES 09:00 - 18:00 | MARTES 09:00 - 18:00 | MIÉRCOLES 09:00 - 18:00 | JUEVES 09:00 - 18:00 | VIERNES 09:00 - 17:00",
    specialHours: "Días festivos: 10:00 - 14:00",
    closedDays: ["Sábado", "Domingo"],
    seasonalHours: "Horario de verano (Junio-Agosto): 08:00 - 17:00",

    // Servicios y productos
    services: [
      "SEO y Optimización",
      "Publicidad Digital",
      "Desarrollo Web",
      "Marketing de Contenido",
      "Gestión de Redes Sociales",
      "Email Marketing",
      "Analytics y Reportes",
      "Consultoría Digital",
    ],
    products: [
      "Sitios Web Profesionales",
      "Tiendas Online",
      "Aplicaciones Web",
      "Landing Pages",
      "E-books y Guías",
      "Videos Promocionales",
    ],
    specialties: [
      "E-commerce",
      "B2B Marketing",
      "Startups",
      "Empresas Medianas",
      "SaaS",
    ],
    certifications: [
      "Google Partner",
      "Facebook Business Partner",
      "HubSpot Certified",
      "Google Analytics Certified",
      "SEO Certified",
    ],
    paymentMethods: [
      "Tarjeta de Crédito",
      "Débito",
      "Transferencia Bancaria",
      "PayPal",
      "Zelle",
      "Criptomonedas",
    ],

    // Accesibilidad
    accessibility: {
      wheelchairAccessible: true,
      parking: "Estacionamiento gratuito disponible",
      publicTransport: "Metro: Estación Plaza Venezuela (Línea 1)",
      accessibleEntrance: true,
      accessibleRestrooms: true,
    },

    // Métricas y rendimiento
    metrics: {
      profileViews: 15420,
      websiteClicks: 3247,
      phoneCalls: 892,
      directionRequests: 1567,
      responseTime: "Menos de 2 horas en días laborables",
    },

    // Verificación
    verification: {
      status: "Verificado",
      verifiedDate: "15 de Marzo, 2024",
      method: "Código postal",
    },

    // Gestión
    management: {
      lastUpdated: "Hace 2 días",
      owner: "María González",
      manager: "Carlos Rodríguez",
      permissions: [
        "Editar perfil",
        "Responder reseñas",
        "Publicar fotos",
        "Ver métricas",
      ],
    },

    // Información adicional
    category: "Agencia de Marketing Digital",
    businessStatus: "Abierto",
    photoCount: 45,
    reviewCount: 127,
    averageRating: 4.8,
    description:
      "Somos una agencia de marketing digital especializada en SEO, publicidad digital y desarrollo web. Ayudamos a empresas a crecer su presencia online y aumentar sus ventas.",
    labels: [
      "Agencia certificada",
      "Respuesta rápida",
      "Precios competitivos",
      "Resultados garantizados",
    ],
    serviceArea: "Caracas y alrededores",
    adWordsLocationId: "123456789",
    titleLanguageCode: "es",
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Detalles Extendidos del NAP
        </h2>
        <p className="text-gray-600">
          Ejemplo completo con todos los datos disponibles
        </p>
      </div>

      <EnhancedNAPDetails details={exampleData} loading={false} error={null} />
    </div>
  );
};

export default NAPDataExample;
