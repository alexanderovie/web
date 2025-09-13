/**
 * 🐛 DEBUG ENDPOINT - Environment Variables
 *
 * Endpoint para verificar las variables de entorno
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const envVars = {
      DATAFORSEO_LOGIN: process.env.DATAFORSEO_LOGIN || "NO CONFIGURADO",
      DATAFORSEO_PASSWORD: process.env.DATAFORSEO_PASSWORD
        ? "CONFIGURADO"
        : "NO CONFIGURADO",
      DATAFORSEO_BASE_URL: process.env.DATAFORSEO_BASE_URL || "NO CONFIGURADO",
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    };

    return NextResponse.json({
      success: true,
      envVars,
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
