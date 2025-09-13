import { NextRequest, NextResponse } from "next/server";

// 🚦 Forzamos runtime Node.js para evitar limitaciones del Edge Runtime
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  try {
    // 1) Parseo del body
    const body = await request.json();
    const {
      keywords,
      location_name = "United States",
      language_code,
      limit = 10,
    } = body || {};

    // 2) Validación de entrada (rápida)
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "keywords array is required and must not be empty" },
        { status: 400 },
      );
    }

    if (!language_code) {
      return NextResponse.json(
        { error: "language_code is required" },
        { status: 400 },
      );
    }

    // 3) 🔐 Credenciales que funcionan (temporalmente hardcodeadas)
    const login = "info@fascinantedigital.com";
    const password = "1dca310be03b7a87";
    const credentials = Buffer.from(`${login}:${password}`).toString("base64");

    // 4) Preparar request para DataForSEO
    const dataForSEORequest = [
      {
        keywords,
        location_name,
        language_code,
        limit,
      },
    ];

    console.log("🔍 Keyword Ideas Public - Request:", dataForSEORequest);

    // 5) Llamada directa a DataForSEO
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
          error: "Network/Client error calling DataForSEO",
          message: `HTTP ${response.status}: ${errorText}`,
        },
        { status: 502 },
      );
    }

    const result = await response.json();
    console.log("✅ Keyword Ideas Public - Success:", result.status_code);

    // 6) Formatear respuesta según tu OpenAPI
    const items = result?.tasks?.[0]?.result?.[0]?.items ?? [];

    const data = (items as any[]).slice(0, limit).map((item: any) => ({
      // ✅ Campos alineados a tu contrato
      keyword: item.keyword,
      search_volume:
        item.search_volume ?? item.keyword_info?.search_volume ?? 0,
      cpc: item.cpc ?? item.keyword_info?.cpc ?? 0,
      competition: String(
        item.competition ?? item.keyword_info?.competition ?? "0",
      ),
      difficulty: item.keyword_difficulty ?? null,
      // trend simple: si trae historiales mensuales, lo marcamos como seasonal
      trend:
        Array.isArray(item.monthly_searches) && item.monthly_searches.length > 0
          ? "seasonal"
          : "stable",
      // extra opcional (no rompe contrato, pero es útil)
      related_keywords: item.related_keywords || [],
    }));

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        total_keywords: data.length,
        location: location_name,
        language: language_code,
        source: "DataForSEO Labs API",
        elapsed_ms: Date.now() - startedAt,
        auth_source: "hardcoded_credentials",
      },
    });
  } catch (error: any) {
    // 7) Catch global: errores de parseo, runtime, etc.
    console.error("[KEYWORD_IDEAS_PUBLIC_ERROR]", error?.message, error?.stack);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch keyword ideas",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
