"use client";

import {
  IconClock,
  IconGlobe,
  IconMapPin,
  IconPhone,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnhancedLocation {
  name: string;
  title: string;
  phoneNumbers?: {
    primaryPhone?: string;
  };
  storefrontAddress?: {
    addressLines: string[];
    locality: string;
    administrativeArea: string;
    postalCode: string;
  };
  websiteUri?: string;
  regularHours?: {
    periods: Array<{
      openDay: string;
      openTime: string;
      closeDay: string;
      closeTime: string;
    }>;
  };
  profile?: {
    description?: string;
  };
  serviceArea?: {
    businessType: string;
    places?: {
      placeInfos: Array<{
        placeName: string;
        placeId: string;
      }>;
    };
  };
  attributes?: {
    attributes: Array<{
      name: string;
      values: Array<{
        stringValue?: string;
        boolValue?: boolean;
      }>;
    }>;
  };
}

interface EnhancedLocationDetailsProps {
  location: EnhancedLocation;
  isES?: boolean;
}

export default function EnhancedLocationDetails({
  location,
  isES = true,
}: EnhancedLocationDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPhone className="h-5 w-5" />
            {isES ? "Información de Contacto" : "Contact Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {location.phoneNumbers?.primaryPhone && (
            <div className="flex items-center gap-2">
              <IconPhone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {location.phoneNumbers.primaryPhone}
              </span>
            </div>
          )}

          {location.websiteUri && (
            <div className="flex items-center gap-2">
              <IconGlobe className="h-4 w-4 text-muted-foreground" />
              <a
                href={location.websiteUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {location.websiteUri}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconMapPin className="h-5 w-5" />
            {isES ? "Información de Ubicación" : "Location Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {location.storefrontAddress ? (
            <div className="space-y-2">
              {location.storefrontAddress.addressLines.map((line, i) => (
                <p key={i} className="text-sm">
                  {line}
                </p>
              ))}
              <p className="text-sm text-muted-foreground">
                {location.storefrontAddress.locality},{" "}
                {location.storefrontAddress.administrativeArea}{" "}
                {location.storefrontAddress.postalCode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isES ? "Dirección no disponible" : "Address not available"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconClock className="h-5 w-5" />
            {isES ? "Horarios de Atención" : "Business Hours"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {location.regularHours?.periods &&
          location.regularHours.periods.length > 0 ? (
            <div className="space-y-2">
              {location.regularHours.periods.map((period, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="font-medium">
                    {period.openDay === period.closeDay
                      ? period.openDay
                      : `${period.openDay} - ${period.closeDay}`}
                  </span>
                  <span>
                    {period.openTime} - {period.closeTime}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {isES ? "Horarios no disponibles" : "Hours not available"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Business Description */}
      {location.profile?.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-blue-500"></div>
              {isES ? "Descripción del Negocio" : "Business Description"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{location.profile.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Services & Attributes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconUsers className="h-5 w-5" />
            {isES ? "Servicios y Atributos" : "Services & Attributes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Service Area */}
            {location.serviceArea && (
              <div>
                <h4 className="font-medium mb-2">
                  {isES ? "Área de Servicio" : "Service Area"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {location.serviceArea.businessType}
                </p>
                {location.serviceArea.places?.placeInfos && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">
                      {isES ? "Ubicaciones incluidas" : "Included locations"}:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {location.serviceArea.places.placeInfos.map((place) => (
                        <Badge
                          key={place.placeId}
                          variant="secondary"
                          className="text-xs"
                        >
                          {place.placeName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Attributes */}
            {location.attributes?.attributes &&
              location.attributes.attributes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">
                    {isES ? "Atributos" : "Attributes"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {location.attributes.attributes.map((attr) => (
                      <div key={attr.name} className="flex items-center gap-2">
                        <IconStar className="h-3 w-3 text-yellow-500" />
                        <span className="text-sm">{attr.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
