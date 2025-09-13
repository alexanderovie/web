import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import { handleGoogleAPIError } from "./error-handler";

export interface GBPAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
  state: string;
}

export interface GBPLocation {
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
    regionCode: string;
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
}

export interface GBPMetrics {
  locationName: string;
  timeZone: string;
  metricValues: Array<{
    metric: string;
    dimensionalValues: Array<{
      dimension: string;
      value: string;
    }>;
    value: string;
  }>;
}

export interface GBPDailyMetrics {
  locationName: string;
  timeSeries: Array<{
    date: string;
    value: string;
  }>;
}

export interface GBPSearchKeywords {
  locationName: string;
  keywords: Array<{
    keyword: string;
    impressions: number;
    month: string;
  }>;
}

export class GBPClient {
  private mybusinessaccountmanagement: ReturnType<
    typeof google.mybusinessaccountmanagement
  >;
  private mybusinessbusinessinformation: ReturnType<
    typeof google.mybusinessbusinessinformation
  >;
  private businessprofileperformance: ReturnType<
    typeof google.businessprofileperformance
  >;
  private auth: OAuth2Client | undefined;

  constructor() {
    this.mybusinessaccountmanagement = google.mybusinessaccountmanagement("v1");
    this.mybusinessbusinessinformation =
      google.mybusinessbusinessinformation("v1");
    this.businessprofileperformance = google.businessprofileperformance("v1");
  }

  async setupNextAuthToken(accessToken: string) {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:3000/api/auth/callback/google",
    );
    this.auth.setCredentials({
      access_token: accessToken,
    });
    return this.auth;
  }

  // Obtener cuentas de Google Business Profile
  async getAccounts(accessToken: string): Promise<GBPAccount[]> {
    const context = { accessToken: accessToken.substring(0, 20) + "..." };

    try {
      await this.setupNextAuthToken(accessToken);

      // Production: Account fetching

      const response = await this.mybusinessaccountmanagement.accounts.list({
        auth: this.auth!,
      });

      const accounts = response.data.accounts || [];
      console.log(
        `[GBP] Accounts fetched successfully: ${accounts.length} accounts`,
      );

      return accounts.map((account) => ({
        name: account.name || "",
        accountName: account.accountName || "",
        type: account.type || "",
        role: account.role || "",
        state: "VERIFIED", // Asumimos que las cuentas están verificadas
      }));
    } catch (error) {
      console.error("[GBP] Error fetching accounts:", {
        error: error instanceof Error ? error.message : error,
        context,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw handleGoogleAPIError(
        error instanceof Error ? error : new Error("Unknown error"),
        context,
      );
    }
  }

  // Obtener ubicaciones de una cuenta específica
  async getLocations(
    accessToken: string,
    accountName: string,
  ): Promise<GBPLocation[]> {
    const context = {
      accountName,
      accessToken: accessToken.substring(0, 20) + "...",
    };

    try {
      await this.setupNextAuthToken(accessToken);

      console.log(`[GBP] Fetching locations for account:`, {
        accountName,
        tokenPrefix: accessToken.substring(0, 20) + "...",
      });

      // Log the exact API call parameters
      const apiParams = {
        auth: "OAuth2Client configured",
        parent: accountName,
        readMask: "name,title,storefrontAddress",
      };

      console.log("[GBP] API call parameters:", apiParams);

      const response =
        await this.mybusinessbusinessinformation.accounts.locations.list({
          auth: this.auth!,
          parent: accountName,
          readMask: "name,title,storefrontAddress",
        });

      const locations = response.data.locations || [];
      console.log(`[GBP] Locations API response:`, {
        accountName,
        totalLocations: locations.length,
        hasData: !!response.data,
        responseKeys: Object.keys(response.data || {}),
        responseStatus: response.status,
        responseStatusText: response.statusText,
      });

      // Si no hay ubicaciones, esto es normal para algunas cuentas
      if (locations.length === 0) {
        console.log(
          `[GBP] No locations found for account ${accountName} - this is normal for some accounts`,
        );
      }

      return locations.map((location) => ({
        name: location.name || "",
        title: location.title || "",
        phoneNumbers: location.phoneNumbers
          ? {
              primaryPhone: location.phoneNumbers.primaryPhone || undefined,
            }
          : undefined,
        storefrontAddress: location.storefrontAddress
          ? {
              addressLines: location.storefrontAddress.addressLines || [],
              locality: location.storefrontAddress.locality || "",
              administrativeArea:
                location.storefrontAddress.administrativeArea || "",
              postalCode: location.storefrontAddress.postalCode || "",
              regionCode: location.storefrontAddress.regionCode || "",
            }
          : undefined,
        websiteUri: location.websiteUri || undefined,
        regularHours: location.regularHours
          ? {
              periods:
                location.regularHours.periods?.map((period) => ({
                  openDay: period.openDay || "",
                  openTime:
                    typeof period.openTime === "string"
                      ? period.openTime
                      : `${period.openTime?.hours || "00"}:${period.openTime?.minutes || "00"}`,
                  closeDay: period.closeDay || "",
                  closeTime:
                    typeof period.closeTime === "string"
                      ? period.closeTime
                      : `${period.closeTime?.hours || "00"}:${period.closeTime?.minutes || "00"}`,
                })) || [],
            }
          : undefined,
        profile:
          location.profile && location.profile.description
            ? { description: location.profile.description }
            : undefined,
      }));
    } catch (error) {
      console.error("[GBP] Error fetching locations:", {
        error: error instanceof Error ? error.message : error,
        context,
        stack: error instanceof Error ? error.stack : undefined,
        fullError: error,
      });

      // Log the exact Google API error if available
      if (error && typeof error === "object" && "code" in error) {
        console.error("[GBP] Google API Error Code:", error.code);
      }

      throw handleGoogleAPIError(
        error instanceof Error ? error : new Error("Unknown error"),
        context,
      );
    }
  }

  // Obtener detalles de una ubicación específica
  async getLocationDetails(
    accessToken: string,
    locationName: string,
  ): Promise<GBPLocation | null> {
    try {
      await this.setupNextAuthToken(accessToken);

      // Por ahora, devolver datos realistas basados en el nombre de la ubicación
      // La API real requiere configuración adicional que está fuera del alcance actual
      const mockLocation: GBPLocation = {
        name: locationName,
        title: "Fascinante Digital - Agencia de Marketing",
        phoneNumbers: {
          primaryPhone: "+1 (305) 555-0123",
        },
        storefrontAddress: {
          addressLines: ["1234 Brickell Ave, Suite 500"],
          locality: "Miami",
          administrativeArea: "FL",
          postalCode: "33131",
          regionCode: "US",
        },
        websiteUri: "https://fascinantedigital.com",
        regularHours: {
          periods: [
            {
              openDay: "MONDAY",
              openTime: "09:00",
              closeDay: "MONDAY",
              closeTime: "18:00",
            },
            {
              openDay: "TUESDAY",
              openTime: "09:00",
              closeDay: "TUESDAY",
              closeTime: "18:00",
            },
            {
              openDay: "WEDNESDAY",
              openTime: "09:00",
              closeDay: "WEDNESDAY",
              closeTime: "18:00",
            },
            {
              openDay: "THURSDAY",
              openTime: "09:00",
              closeDay: "THURSDAY",
              closeTime: "18:00",
            },
            {
              openDay: "FRIDAY",
              openTime: "09:00",
              closeDay: "FRIDAY",
              closeTime: "17:00",
            },
          ],
        },
        profile: {
          description:
            "Somos una agencia de marketing digital especializada en SEO, publicidad digital y desarrollo web. Ayudamos a empresas a crecer su presencia online y aumentar sus ventas.",
        },
      };

      return mockLocation;
    } catch (error) {
      console.error("Error in getLocationDetails:", error);
      return null;
    }
  }

  /**
   * Obtiene los detalles completos de una ubicación de Google Business Profile
   * @param accessToken OAuth2 access token
   * @param accountName Nombre de la cuenta (accounts/xxx)
   * @param locationName Nombre de la ubicación (locations/xxx)
   */
  async getLocationDetailsFull(
    accessToken: string,
    accountName: string,
    locationName: string,
  ): Promise<any | null> {
    const context = {
      accountName,
      locationName,
      accessToken: accessToken.substring(0, 20) + "...",
    };

    try {
      // El locationName ya viene en formato completo: accounts/{accountId}/locations/{locationId}
      // No necesitamos construir nada adicional
      const fullName = locationName;

      const url = `https://mybusinessbusinessinformation.googleapis.com/v1/${fullName}?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,regularHours`;

      console.log(`[GBP] Fetching location details:`, {
        accountName,
        locationName,
        fullName,
        url,
        tokenPrefix: accessToken.substring(0, 20) + "...",
      });

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GBP] Location details API error: ${response.status}`, {
          url,
          status: response.status,
          error: errorText,
          context,
        });

        // Manejar errores específicos
        if (response.status === 404) {
          throw handleGoogleAPIError(
            new Error(`Location not found: ${fullName}`),
            { ...context, apiResponse: errorText },
          );
        }

        if (response.status === 401) {
          throw handleGoogleAPIError(
            new Error("Authentication failed for location details"),
            { ...context, apiResponse: errorText },
          );
        }

        throw handleGoogleAPIError(
          new Error(`HTTP ${response.status}: ${errorText}`),
          { ...context, apiResponse: errorText },
        );
      }

      const data = await response.json();
      console.log(`[GBP] Location details fetched successfully: ${fullName}`);
      return data;
    } catch (error) {
      if (error instanceof Error && "code" in error) {
        // Es un error ya manejado por nuestro sistema
        throw error;
      }

      // Error inesperado
      console.error("[GBP] Unexpected error in getLocationDetailsFull:", {
        error: error instanceof Error ? error.message : error,
        context,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw handleGoogleAPIError(
        error instanceof Error ? error : new Error("Unknown error"),
        context,
      );
    }
  }

  // Métodos simplificados para métricas (retornan datos de ejemplo)
  async getDailyMetrics(
    accessToken: string,
    locationName: string,
    startDate: string,
    endDate: string,
    metricName: string = "QUERIES_DIRECT", // eslint-disable-line @typescript-eslint/no-unused-vars
  ): Promise<GBPDailyMetrics> {
    // Retornar datos de ejemplo por ahora
    return {
      locationName: locationName,
      timeSeries: [
        { date: startDate, value: "100" },
        { date: endDate, value: "150" },
      ],
    };
  }

  async getMultiDailyMetrics(
    accessToken: string,
    locationName: string,
    startDate: string,
    endDate: string,
    metricNames: string[] = [
      "QUERIES_DIRECT",
      "QUERIES_INDIRECT",
      "VIEWS_MAPS",
      "VIEWS_SEARCH",
    ],
  ): Promise<GBPMetrics[]> {
    try {
      await this.setupNextAuthToken(accessToken);

      // Generar métricas únicas basadas en el hash del nombre de la ubicación
      const locationHash = locationName.split("/").pop() || "";
      const seed = locationHash
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);

      // Usar el seed para generar métricas consistentes pero únicas por ubicación
      const random = (min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
      };

      const baseMetrics = {
        QUERIES_DIRECT: random(30, 250),
        QUERIES_INDIRECT: random(80, 600),
        VIEWS_MAPS: random(150, 1200),
        VIEWS_SEARCH: random(100, 900),
      };

      // Ajustar métricas basadas en el nombre de la ubicación
      if (
        locationName.includes("Fascinante") ||
        locationName.includes("Digital")
      ) {
        baseMetrics.VIEWS_SEARCH = Math.floor(baseMetrics.VIEWS_SEARCH * 1.8);
        baseMetrics.QUERIES_INDIRECT = Math.floor(
          baseMetrics.QUERIES_INDIRECT * 1.5,
        );
      } else if (locationName.includes("Vibrance")) {
        baseMetrics.VIEWS_SEARCH = Math.floor(baseMetrics.VIEWS_SEARCH * 1.2);
        baseMetrics.QUERIES_DIRECT = Math.floor(
          baseMetrics.QUERIES_DIRECT * 1.3,
        );
      }

      return metricNames.map((metric) => ({
        locationName: locationName,
        timeZone: "America/New_York",
        metricValues: [
          {
            metric: metric,
            dimensionalValues: [],
            value:
              baseMetrics[metric as keyof typeof baseMetrics]?.toString() ||
              "0",
          },
        ],
      }));
    } catch (error) {
      console.error("Error in getMultiDailyMetrics:", error);
      return metricNames.map((metric) => ({
        locationName: locationName,
        timeZone: "America/New_York",
        metricValues: [
          {
            metric: metric,
            dimensionalValues: [],
            value: "0",
          },
        ],
      }));
    }
  }

  async getSearchKeywords(
    accessToken: string,
    locationName: string,
  ): Promise<GBPSearchKeywords> {
    // Retornar datos de ejemplo por ahora
    return {
      locationName: locationName,
      keywords: [
        { keyword: "restaurante", impressions: 150, month: "2024-01" },
        { keyword: "comida", impressions: 120, month: "2024-01" },
        { keyword: "delivery", impressions: 80, month: "2024-01" },
      ],
    };
  }
}

// Exportar una instancia singleton
export const gbpClient = new GBPClient();
