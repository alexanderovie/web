/**
 * 🧪 TEST ENDPOINT - Keyword Ideas (Sin autenticación)
 *
 * Endpoint temporal para probar la integración con DataForSEO
 * SIN AUTENTICACIÓN - SOLO PARA PRUEBAS
 */

import { NextRequest, NextResponse } from "next/server";
import { dataForSEOClient } from "@/lib/dataforseo-client";

export async function POST(request: NextRequest) {
  try {
    // 📝 Parse Request Body
    const body = await request.json();

    // ✅ Validación básica
    if (!body.keywords || !Array.isArray(body.keywords)) {
      return NextResponse.json(
        { error: "Keywords es requerido y debe ser un array" },
        { status: 400 },
      );
    }

    // 🔧 Preparar request para DataForSEO
    const keywordIdeasRequest = {
      keywords: body.keywords,
      location_name: body.location_name || "United States",
      language_code: body.language_code || "en",
      limit: body.limit || 5,
      offset: body.offset || 0,
      filters: body.filters || [],
      order_by: body.order_by || ["relevance,desc"],
      include_clickstream_data: body.include_clickstream_data || false,
    };

    console.log("🧪 Testing Keyword Ideas API with:", keywordIdeasRequest);

    // 📡 Llamar a DataForSEO
    const response =
      await dataForSEOClient.getKeywordIdeas(keywordIdeasRequest);

    if (!response.success) {
      console.error("❌ Keyword Ideas API error:", response.error);
      return NextResponse.json(
        {
          success: false,
          error: "DataForSEO API error",
          message: response.error || "Failed to fetch keyword ideas data",
          details: response.data,
        },
        { status: 500 },
      );
    }

    // 📊 Procesar respuesta
    const keywordIdeasData =
      response.data?.tasks?.[0]?.result?.[0]?.items || [];

    const processedData = keywordIdeasData.map((item: any) => ({
      keyword: item.keyword,
      search_volume: item.keyword_info?.search_volume || 0,
      cpc: item.keyword_info?.cpc || 0,
      competition: item.keyword_info?.competition || 0,
      competition_level: item.keyword_info?.competition_level || "LOW",
      keyword_difficulty: item.keyword_properties?.keyword_difficulty || 0,
      search_intent: item.search_intent_info?.main_intent || "unknown",
      monthly_searches: item.keyword_info?.monthly_searches || {},
      search_volume_trend: item.keyword_info?.search_volume_trend || {},
      categories: item.keyword_info?.categories || [],
    }));

    // 📈 Calcular estadísticas
    const stats = {
      total_keywords: processedData.length,
      keywords_with_volume: processedData.filter(
        (item: any) => item.search_volume > 0,
      ).length,
      average_search_volume:
        processedData.reduce(
          (sum: number, item: any) => sum + item.search_volume,
          0,
        ) / processedData.length || 0,
      average_cpc:
        processedData.reduce((sum: number, item: any) => sum + item.cpc, 0) /
          processedData.length || 0,
      average_competition:
        processedData.reduce(
          (sum: number, item: any) => sum + item.competition,
          0,
        ) / processedData.length || 0,
      max_search_volume: Math.max(
        ...processedData.map((item: any) => item.search_volume),
      ),
      min_search_volume: Math.min(
        ...processedData.map((item: any) => item.search_volume),
      ),
    };

    // 🎯 Response
    const result = {
      success: true,
      data: {
        keyword_ideas: processedData,
        stats,
        request: keywordIdeasRequest,
        response_time: Date.now(),
        total_results: processedData.length,
      },
      message: "Keyword ideas retrieved successfully",
    };

    console.log("✅ Keyword Ideas API test successful:", {
      total_keywords: processedData.length,
      average_volume: stats.average_search_volume,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Keyword Ideas test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
