import { NextRequest, NextResponse } from "next/server";

import type { LocationDetails } from "@/components/dashboard/LocationDetailsCard";
import { auth } from "@/lib/auth";
import {
  createErrorResponse,
  AuthenticationError,
  ValidationError,
  handleGoogleAPIError,
} from "@/lib/error-handler";
import { gbpClient } from "@/lib/gbp-client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const accountName = searchParams.get("accountName");
    const locationName = searchParams.get("locationName");

    // Validación de autenticación
    if (!session?.user?.accessToken) {
      throw new AuthenticationError("No access token found");
    }

    // Validación de parámetros
    if (!accountName || !locationName) {
      throw new ValidationError("accountName and locationName are required", {
        accountName: accountName || null,
        locationName: locationName || null,
      });
    }

    console.log(`[API] Location Details Request:`, {
      accountName,
      locationName,
      userEmail: session.user.email,
      fullUrl: request.url,
      searchParams: Object.fromEntries(searchParams.entries()),
    });

    // Llama a la Google API para obtener los detalles completos de la ubicación
    const details = await gbpClient.getLocationDetailsFull(
      session.user.accessToken,
      accountName,
      locationName,
    );

    if (!details) {
      throw handleGoogleAPIError(new Error("Location not found"), {
        accountName,
        locationName,
      });
    }

    // Mapea los campos relevantes a LocationDetails
    const mapped: LocationDetails = {
      locationName: details.title || details.locationName || "No disponible",
      address: details.storefrontAddress
        ? [
            ...(details.storefrontAddress.addressLines || []),
            details.storefrontAddress.locality,
            details.storefrontAddress.administrativeArea,
            details.storefrontAddress.postalCode,
          ]
            .filter(Boolean)
            .join(", ")
        : undefined,
      primaryPhone: details.phoneNumbers?.primaryPhone,
      websiteUri: details.websiteUri,
      regularHours: details.regularHours?.periods
        ? details.regularHours.periods
            .map((p: any) => {
              const openDay = p.openDay || "";
              const openTime = p.openTime || "";
              const closeDay = p.closeDay || "";
              const closeTime = p.closeTime || "";

              if (!openDay || !openTime || !closeDay || !closeTime) {
                return null;
              }

              return `${openDay} ${openTime} - ${closeTime}`;
            })
            .filter(Boolean)
            .join(" | ")
        : undefined,
      primaryCategory: details.primaryCategory?.displayName,
      businessStatus: details.businessStatus,
      photoCount:
        typeof details.profilePhotoCount === "number"
          ? details.profilePhotoCount
          : undefined,
      reviewCount:
        typeof details.reviewCount === "number"
          ? details.reviewCount
          : undefined,
      averageRating:
        typeof details.averageRating === "number"
          ? details.averageRating
          : undefined,
      // Nuevos campos de la API moderna
      description: details.profile?.description,
      specialHours: details.specialHours?.specialHourPeriods,
      serviceArea: details.serviceArea,
      labels: details.labels,
      adWordsLocationId: details.adWordsLocationId,
      locationKey: details.locationKey,
      metadata: details.metadata,
      profile: details.profile,
      relationshipData: details.relationshipData,
      moreHours: details.moreHours,
      serviceItems: details.serviceItems,
      titleLanguageCode: details.titleLanguageCode,
    };

    console.log(`[API] Location Details Success:`, {
      accountName,
      locationName,
      hasData: !!mapped.locationName,
    });

    return NextResponse.json({ success: true, data: mapped });
  } catch (error) {
    console.error("[API] Location Details Error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });

    return createErrorResponse(
      error instanceof Error ? error : new Error("Unknown error"),
    );
  }
}
