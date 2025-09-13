/**
 * 🐛 DEBUG ENDPOINT - DataForSEO Configuration
 *
 * Endpoint para verificar la configuración de DataForSEO
 */

import { NextRequest, NextResponse } from "next/server";
import {
  DATAFORSEO_CONFIG,
  validateDataForSEOConfig,
} from "@/lib/dataforseo-config";

export async function GET() {
  try {
    const config = {
      login: DATAFORSEO_CONFIG.login,
      password: DATAFORSEO_CONFIG.password
        ? "***CONFIGURADO***"
        : "NO CONFIGURADO",
      baseUrl: DATAFORSEO_CONFIG.baseUrl,
      isValid: validateDataForSEOConfig(),
      envVars: {
        DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN
          ? "CONFIGURADO"
          : "NO CONFIGURADO",
        DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD
          ? "CONFIGURADO"
          : "NO CONFIGURADO",
        DATAFORSEO_BASE_URL: process.env.DATAFORSEO_BASE_URL
          ? "CONFIGURADO"
          : "NO CONFIGURADO",
      },
    };

    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
