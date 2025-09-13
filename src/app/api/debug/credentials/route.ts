/**
 * 🐛 DEBUG ENDPOINT - Credentials
 *
 * Endpoint para verificar las credenciales generadas
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const login = process.env.DATAFORSEO_LOGIN || "";
    const password = process.env.DATAFORSEO_PASSWORD || "";

    const credentials = Buffer.from(`${login}:${password}`).toString("base64");

    const debugInfo = {
      login,
      password: password ? "***CONFIGURADO***" : "NO CONFIGURADO",
      credentialsLength: credentials.length,
      credentialsStart: credentials.substring(0, 10) + "...",
      fullCredentials: credentials,
    };

    return NextResponse.json({
      success: true,
      debugInfo,
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
