import React from "react";

import {
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconWorld,
  IconClock,
  IconTag,
  IconCheck,
  IconPhoto,
  IconStar,
  IconAlertCircle,
  IconFileText,
  IconMap,
  IconLabel,
  IconAd,
  IconLanguage,
  IconSettings,
} from "@tabler/icons-react";

import { Badge } from "../ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// TypeScript type for location details
export interface LocationDetails {
  locationName: string;
  address?: string;
  primaryPhone?: string;
  websiteUri?: string;
  regularHours?: string;
  primaryCategory?: string;
  businessStatus?: string;
  photoCount?: number;
  reviewCount?: number;
  averageRating?: number;
  // Nuevos campos de la API moderna
  description?: string;
  specialHours?: any;
  serviceArea?: any;
  labels?: string[];
  adWordsLocationId?: string;
  locationKey?: any;
  metadata?: any;
  profile?: any;
  relationshipData?: any;
  moreHours?: any;
  serviceItems?: any;
  titleLanguageCode?: string;
}

interface Props {
  details?: LocationDetails;
  loading?: boolean;
  error?: string | null;
}

/**
 * LocationDetailsCard
 * Shows a professional summary of a Google Business location.
 */
export const LocationDetailsCard: React.FC<Props> = ({
  details,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5 text-blue-600" />
            Detalles del Negocio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
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
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconBuilding className="h-5 w-5 text-blue-600" />
          {details.locationName || "No disponible"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <IconMapPin className="h-5 w-5 text-purple-600" />
              <span className="text-sm">
                {details.address || (
                  <span className="text-muted-foreground">No disponible</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <IconPhone className="h-5 w-5 text-green-600" />
              <span className="text-sm">
                {details.primaryPhone || (
                  <span className="text-muted-foreground">No disponible</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <IconWorld className="h-5 w-5 text-blue-500" />
              {details.websiteUri ? (
                <a
                  href={details.websiteUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-sm"
                >
                  {details.websiteUri}
                </a>
              ) : (
                <span className="text-muted-foreground text-sm">
                  No disponible
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <IconTag className="h-5 w-5 text-pink-600" />
              <span className="text-sm">
                {details.primaryCategory || (
                  <span className="text-muted-foreground">No disponible</span>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <IconCheck className="h-5 w-5 text-cyan-600" />
              <span className="text-sm">
                {details.businessStatus || (
                  <span className="text-muted-foreground">No disponible</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <IconPhoto className="h-5 w-5 text-indigo-600" />
              <span className="text-sm">
                {typeof details.photoCount === "number" ? (
                  `${details.photoCount} fotos`
                ) : (
                  <span className="text-muted-foreground">No disponible</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <IconStar className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">
                {typeof details.reviewCount === "number" ? (
                  `${details.reviewCount} reseñas`
                ) : (
                  <span className="text-muted-foreground">No disponible</span>
                )}
                {typeof details.averageRating === "number"
                  ? ` • ${details.averageRating.toFixed(1)} ⭐`
                  : null}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <IconLanguage className="h-5 w-5 text-orange-600" />
              <span className="text-sm">
                {details.titleLanguageCode || (
                  <span className="text-muted-foreground">No disponible</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Horarios */}
        {details.regularHours && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <IconClock className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-sm">Horarios de Atención</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              {details.regularHours.split(" | ").map((hours, index) => (
                <div key={index} className="flex justify-between">
                  <span>{hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Descripción */}
        {details.description && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <IconFileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-sm">Descripción</span>
            </div>
            <p className="text-sm text-gray-600">{details.description}</p>
          </div>
        )}

        {/* Labels */}
        {details.labels && details.labels.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <IconLabel className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-sm">Etiquetas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {details.labels.map((label, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Información Adicional */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-3 mb-3">
            <IconSettings className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-sm">Información Adicional</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {details.adWordsLocationId && (
              <div className="flex items-center gap-2">
                <IconAd className="h-4 w-4 text-green-600" />
                <span>ID Ads: {details.adWordsLocationId}</span>
              </div>
            )}
            {details.serviceArea && (
              <div className="flex items-center gap-2">
                <IconMap className="h-4 w-4 text-blue-600" />
                <span>Área de Servicio: {details.serviceArea}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationDetailsCard;
