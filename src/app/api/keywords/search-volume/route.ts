/**
 * 🚀 ELITE Keywords Search Volume API
 *
 * Endpoint escalable y robusto para obtener volumen de búsqueda
 * de keywords desde Google Ads API
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dataForSEOClient } from "@/lib/dataforseo-client";
import {
  POPULAR_LOCATIONS,
  SUPPORTED_LANGUAGES,
  METRICS_CONFIG,
  type Location,
  type Language,
} from "@/lib/dataforseo-config";

// 🔧 Configuración Elite
const API_CONFIG = {
  MAX_KEYWORDS_PER_REQUEST: 1000,
  MIN_KEYWORDS_PER_REQUEST: 1,
  MAX_KEYWORD_LENGTH: 80,
  CACHE_TTL: 60 * 60 * 1000, // 1 hora
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 5, // 5 requests por minuto por usuario
} as const;

// 🛡️ Rate Limiter por usuario
const userRateLimiter = new Map<string, { count: number; resetTime: number }>();

function checkUserRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = userRateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    userRateLimiter.set(userId, {
      count: 1,
      resetTime: now + API_CONFIG.RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= API_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

// ✅ Validación de parámetros
function validateKeywordsParams(params: any): {
  valid: boolean;
  error?: string;
} {
  // Validar keywords array
  if (!params.keywords || !Array.isArray(params.keywords)) {
    return { valid: false, error: "Keywords must be an array" };
  }

  if (params.keywords.length < API_CONFIG.MIN_KEYWORDS_PER_REQUEST) {
    return {
      valid: false,
      error: `Minimum ${API_CONFIG.MIN_KEYWORDS_PER_REQUEST} keyword required`,
    };
  }

  if (params.keywords.length > API_CONFIG.MAX_KEYWORDS_PER_REQUEST) {
    return {
      valid: false,
      error: `Maximum ${API_CONFIG.MAX_KEYWORDS_PER_REQUEST} keywords allowed per request`,
    };
  }

  // Validar cada keyword
  for (let i = 0; i < params.keywords.length; i++) {
    const keyword = params.keywords[i];

    if (!keyword || typeof keyword !== "string") {
      return {
        valid: false,
        error: `Keyword at index ${i} must be a non-empty string`,
      };
    }

    if (keyword.length > API_CONFIG.MAX_KEYWORD_LENGTH) {
      return {
        valid: false,
        error: `Keyword "${keyword}" too long. Max length: ${API_CONFIG.MAX_KEYWORD_LENGTH}`,
      };
    }

    if (keyword.trim().length === 0) {
      return { valid: false, error: `Keyword at index ${i} cannot be empty` };
    }
  }

  // Validar location
  if (
    params.location_name &&
    !POPULAR_LOCATIONS.includes(params.location_name)
  ) {
    return {
      valid: false,
      error: `Unsupported location. Supported: ${POPULAR_LOCATIONS.slice(0, 10).join(", ")}...`,
    };
  }

  // Validar language
  if (
    params.language_code &&
    !SUPPORTED_LANGUAGES.includes(params.language_code)
  ) {
    return {
      valid: false,
      error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
    };
  }

  return { valid: true };
}

// 🚀 POST - Obtener Search Volume de Keywords
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔐 Autenticación
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "No autorizado",
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    // 🛡️ Rate Limiting por usuario
    const userId = session.user.email;
    if (!checkUserRateLimit(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: `Maximum ${API_CONFIG.RATE_LIMIT_MAX_REQUESTS} requests per minute allowed`,
          retryAfter: Math.ceil(API_CONFIG.RATE_LIMIT_WINDOW / 1000),
        },
        { status: 429 },
      );
    }

    // 📋 Parsear body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        },
        { status: 400 },
      );
    }

    // ✅ Validar parámetros
    const validation = validateKeywordsParams(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          message: validation.error,
        },
        { status: 400 },
      );
    }

    // 🔧 Preparar request para DataForSEO
    const keywordsRequest = {
      keywords: body.keywords.map((k: string) => k.trim().toLowerCase()),
      location_name: body.location_name as Location,
      language_code: body.language_code as Language,
    };

    console.log(`🔍 Keywords Search Volume request:`, {
      keywordsCount: keywordsRequest.keywords.length,
      location: keywordsRequest.location_name || "United States",
      language: keywordsRequest.language_code || "en",
      user: userId,
    });

    // 📡 Llamar a DataForSEO
    const response =
      await dataForSEOClient.getKeywordsSearchVolume(keywordsRequest);

    if (!response.success) {
      console.error(`❌ Keywords Search Volume error:`, response.error);
      return NextResponse.json(
        {
          success: false,
          error: "DataForSEO API error",
          message: response.error || "Failed to fetch search volume data",
          details: response.data,
        },
        { status: 500 },
      );
    }

    // 📊 Procesar respuesta
    const processingTime = Date.now() - startTime;

    // Procesar datos de respuesta
    const searchVolumeData =
      response.data?.tasks?.[0]?.result?.[0]?.items || [];

    const processedData = searchVolumeData.map((item: any) => ({
      keyword: item.keyword,
      search_volume: item.search_volume || 0,
      cpc: item.cpc || 0,
      competition: item.competition || 0,
      competition_index: item.competition_index || 0,
      low_top_of_page_bid: item.low_top_of_page_bid || 0,
      high_top_of_page_bid: item.high_top_of_page_bid || 0,
      currency: item.currency || "USD",
      search_trends: item.search_trends || [],
    }));

    // Calcular estadísticas
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

    const result = {
      success: true,
      data: {
        keywords: processedData,
        statistics: stats,
        metadata: {
          total_keywords_requested: keywordsRequest.keywords.length,
          total_keywords_returned: processedData.length,
          location: keywordsRequest.location_name || "United States",
          language: keywordsRequest.language_code || "en",
          processing_time_ms: processingTime,
          cache_hit: response.cacheHit || false,
          timestamp: new Date().toISOString(),
        },
        pagination: {
          current_page: 1,
          total_pages: 1,
          has_more: false,
        },
      },
      message: "Search volume data retrieved successfully",
    };

    console.log(`✅ Keywords Search Volume success:`, {
      keywordsCount: keywordsRequest.keywords.length,
      returnedCount: processedData.length,
      processingTime,
      cacheHit: response.cacheHit,
      avgVolume: stats.average_search_volume,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`❌ Keywords Search Volume unexpected error:`, error);

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

// 📋 GET - Obtener información del endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      endpoint: "Keywords Search Volume API",
      description: "Get search volume data for keywords from Google Ads",
      methods: {
        POST: "Get search volume for keywords",
        GET: "Get endpoint information",
      },
      parameters: {
        keywords: {
          type: "string[]",
          required: true,
          description: "Array of keywords to analyze",
          min: API_CONFIG.MIN_KEYWORDS_PER_REQUEST,
          max: API_CONFIG.MAX_KEYWORDS_PER_REQUEST,
          maxLength: API_CONFIG.MAX_KEYWORD_LENGTH,
        },
        location_name: {
          type: "string",
          required: false,
          description: "Location for search volume data",
          default: "United States",
          supported: POPULAR_LOCATIONS.slice(0, 10),
        },
        language_code: {
          type: "string",
          required: false,
          description: "Language code for search volume data",
          default: "en",
          supported: SUPPORTED_LANGUAGES,
        },
      },
      rate_limits: {
        requests_per_minute: API_CONFIG.RATE_LIMIT_MAX_REQUESTS,
        window_ms: API_CONFIG.RATE_LIMIT_WINDOW,
      },
      cache: {
        ttl_ms: API_CONFIG.CACHE_TTL,
        description: "Search volume data is cached for 1 hour",
      },
      response_format: {
        success: "boolean",
        data: {
          keywords: "array of keyword data",
          statistics: "summary statistics",
          metadata: "request metadata",
          pagination: "pagination info",
        },
        message: "string",
      },
    },
    message: "Keywords Search Volume API information",
  });
}
