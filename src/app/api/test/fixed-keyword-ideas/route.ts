/**
 * 🧪 FIXED TEST ENDPOINT - Keyword Ideas (Credenciales hardcodeadas)
 *
 * Endpoint de prueba usando las credenciales correctas directamente
 */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.keywords || !Array.isArray(body.keywords)) {
      return NextResponse.json(
        { error: "Keywords es requerido y debe ser un array" },
        { status: 400 },
      );
    }

    // 🔐 Credenciales correctas hardcodeadas temporalmente
    const login = "info@fascinantedigital.com";
    const password = "1dca310be03b7a87";
    const credentials = Buffer.from(`${login}:${password}`).toString("base64");

    const dataForSEORequest = [
      {
        keywords: body.keywords,
        location_name: body.location_name || "United States",
        language_code: body.language_code || "en",
        limit: body.limit || 5,
      },
    ];

    console.log("🧪 Fixed test - Request:", dataForSEORequest);

    // 📡 Llamada directa a DataForSEO
    const response = await fetch(
      "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live.ai",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataForSEORequest),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ DataForSEO API Error:", response.status, errorText);
      return NextResponse.json(
        {
          success: false,
          error: `DataForSEO API Error: ${response.status}`,
          details: errorText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    console.log("✅ Fixed test - Success:", data.status_code);

    return NextResponse.json({
      success: true,
      data,
      message: "Keyword ideas retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Fixed test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
