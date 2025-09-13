import { cookies } from "next/headers";

import type { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";

import { GSC_CONFIG, validateGSCConfig, getSiteUrl } from "./gsc-config";

export interface GSCKeywordData {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
}

export interface GSCQueryParams {
  startDate?: string;
  endDate?: string;
  dimensions?: string[];
  rowLimit?: number;
  startRow?: number;
}

export interface GSCPageData {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
}

export interface GSCCountryData {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
}

export class GSCClient {
  private searchconsole: ReturnType<typeof google.searchconsole>;
  private auth: OAuth2Client | undefined;

  constructor() {
    this.searchconsole = google.searchconsole("v1");
  }

  // Configurar autenticación con token de NextAuth
  async setupNextAuthToken(accessToken: string) {
    this.auth = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
      "http://localhost:3000/api/auth/callback/google",
    );
    this.auth.setCredentials({
      access_token: accessToken,
    });
    return this.auth;
  }

  // Configurar autenticación con tokens de cookies
  async setupCookieAuth() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("google_access_token")?.value;
    const refreshToken = cookieStore.get("google_refresh_token")?.value;

    if (!accessToken) {
      throw new Error("No access token found. Please authenticate first.");
    }

    this.auth = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
      "http://localhost:3000/api/auth/google/callback",
    );
    this.auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return this.auth;
  }

  // Configurar autenticación OAuth 2.0
  async setupOAuth2Auth() {
    if (!validateGSCConfig()) {
      throw new Error(
        "GSC configuration is invalid. Check environment variables.",
      );
    }

    this.auth = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET,
      "http://localhost:3000/api/auth/google/callback",
    );
    return this.auth;
  }

  // Configurar autenticación con Service Account
  async setupServiceAccountAuth() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is required",
      );
    }

    // Si usas Service Account, deberías ajustar el tipo de this.auth si lo necesitas
    // Aquí lo dejamos como undefined para mantener la compatibilidad
    return undefined;
  }

  // Obtener keywords de Search Console
  async getKeywords(
    params: GSCQueryParams = {},
    accessToken?: string,
    siteUrl?: string,
  ): Promise<GSCKeywordData[]> {
    try {
      // Siempre configurar la autenticación con el token proporcionado
      if (accessToken) {
        await this.setupNextAuthToken(accessToken);
      } else {
        // Intentar usar autenticación por cookies primero
        try {
          await this.setupCookieAuth();
        } catch {
          throw new Error(
            "Authentication not set up. Please authenticate first.",
          );
        }
      }

      // Usar el sitio proporcionado o el predeterminado
      const targetSiteUrl = siteUrl || getSiteUrl();
      const {
        startDate = GSC_CONFIG.DEFAULT_DATE_RANGE.startDate,
        endDate = GSC_CONFIG.DEFAULT_DATE_RANGE.endDate,
        dimensions = ["query"],
        rowLimit = GSC_CONFIG.DEFAULT_ROW_LIMIT,
        startRow = 0,
      } = params;

      const response = await this.searchconsole.searchanalytics.query({
        auth: this.auth!,
        siteUrl: targetSiteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          rowLimit,
          startRow,
        },
      });

      const rows = response.data.rows || [];
      return rows.map((row) => ({
        keyword: Array.isArray(row.keys) && row.keys[0] ? row.keys[0] : "",
        clicks: parseInt(String(row.clicks ?? "0"), 10),
        impressions: parseInt(String(row.impressions ?? "0"), 10),
        ctr: row.ctr ?? 0,
        averagePosition: row.position ?? 0,
      }));
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch keywords",
      );
    }
  }

  // Obtener sitios verificados
  async getVerifiedSites(accessToken?: string): Promise<string[]> {
    try {
      // Siempre configurar la autenticación con el token proporcionado
      if (accessToken) {
        await this.setupNextAuthToken(accessToken);
      } else {
        try {
          await this.setupCookieAuth();
        } catch {
          throw new Error(
            "Authentication not set up. Please authenticate first.",
          );
        }
      }

      const response = await this.searchconsole.sites.list({
        auth: this.auth!,
      });

      const sites = response.data.siteEntry || [];
      return sites
        .map((site) => (typeof site.siteUrl === "string" ? site.siteUrl : null))
        .filter((url): url is string => !!url);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Failed to fetch verified sites",
      );
    }
  }

  // Verificar si un sitio está verificado
  async isSiteVerified(
    siteUrl: string,
    accessToken?: string,
  ): Promise<boolean> {
    try {
      // Siempre configurar la autenticación con el token proporcionado
      if (accessToken) {
        await this.setupNextAuthToken(accessToken);
      } else {
        try {
          await this.setupCookieAuth();
        } catch {
          throw new Error(
            "Authentication not set up. Please authenticate first.",
          );
        }
      }

      const response = await this.searchconsole.sites.get({
        auth: this.auth!,
        siteUrl,
      });

      // La respuesta de .get() es un objeto con info del sitio, no un array
      // Si tiene siteUrl, está verificado
      return !!response.data.siteUrl;
    } catch {
      return false;
    }
  }

  // Obtener datos de páginas de Search Console
  async getPages(
    siteUrl: string,
    params: GSCQueryParams = {},
  ): Promise<GSCPageData[]> {
    try {
      const targetSiteUrl = siteUrl || getSiteUrl();
      const {
        startDate = GSC_CONFIG.DEFAULT_DATE_RANGE.startDate,
        endDate = GSC_CONFIG.DEFAULT_DATE_RANGE.endDate,
        dimensions = ["page"],
        rowLimit = GSC_CONFIG.DEFAULT_ROW_LIMIT,
        startRow = 0,
      } = params;

      const response = await this.searchconsole.searchanalytics.query({
        auth: this.auth!,
        siteUrl: targetSiteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          rowLimit,
          startRow,
        },
      });

      const rows = response.data.rows || [];
      return rows.map((row) => ({
        page: Array.isArray(row.keys) && row.keys[0] ? row.keys[0] : "",
        clicks: parseInt(String(row.clicks ?? "0"), 10),
        impressions: parseInt(String(row.impressions ?? "0"), 10),
        ctr: row.ctr ?? 0,
        averagePosition: row.position ?? 0,
      }));
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch pages",
      );
    }
  }

  // Obtener datos de países de Search Console
  async getCountries(
    siteUrl: string,
    params: GSCQueryParams = {},
  ): Promise<GSCCountryData[]> {
    try {
      const targetSiteUrl = siteUrl || getSiteUrl();
      const {
        startDate = GSC_CONFIG.DEFAULT_DATE_RANGE.startDate,
        endDate = GSC_CONFIG.DEFAULT_DATE_RANGE.endDate,
        dimensions = ["country"],
        rowLimit = GSC_CONFIG.DEFAULT_ROW_LIMIT,
        startRow = 0,
      } = params;

      const response = await this.searchconsole.searchanalytics.query({
        auth: this.auth!,
        siteUrl: targetSiteUrl,
        requestBody: {
          startDate,
          endDate,
          dimensions,
          rowLimit,
          startRow,
        },
      });

      const rows = response.data.rows || [];
      return rows.map((row) => ({
        country: Array.isArray(row.keys) && row.keys[0] ? row.keys[0] : "",
        clicks: parseInt(String(row.clicks ?? "0"), 10),
        impressions: parseInt(String(row.impressions ?? "0"), 10),
        ctr: row.ctr ?? 0,
        averagePosition: row.position ?? 0,
      }));
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to fetch countries",
      );
    }
  }
}

// Exportar una instancia singleton
export const gscClient = new GSCClient();
