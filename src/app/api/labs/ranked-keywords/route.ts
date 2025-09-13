/**
 * 🚀 ELITE DataForSEO Labs - Ranked Keywords API
 *
 * Endpoint escalable y robusto para obtener keywords por las que rankea un dominio
 * con análisis avanzado y métricas detalladas
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
  MAX_DOMAIN_LENGTH: 255,
  MIN_DOMAIN_LENGTH: 3,
  MAX_LIMIT: 1000,
  MIN_LIMIT: 1,
  DEFAULT_LIMIT: 10,
  CACHE_TTL: 2 * 60 * 60 * 1000, // 2 horas
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 3, // 3 requests por minuto por usuario
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
function validateRankedKeywordsParams(params: any): {
  valid: boolean;
  error?: string;
} {
  // Validar target domain
  if (!params.target || typeof params.target !== "string") {
    return {
      valid: false,
      error: "Target domain is required and must be a string",
    };
  }

  if (params.target.length < API_CONFIG.MIN_DOMAIN_LENGTH) {
    return {
      valid: false,
      error: `Target domain too short. Min length: ${API_CONFIG.MIN_DOMAIN_LENGTH}`,
    };
  }

  if (params.target.length > API_CONFIG.MAX_DOMAIN_LENGTH) {
    return {
      valid: false,
      error: `Target domain too long. Max length: ${API_CONFIG.MAX_DOMAIN_LENGTH}`,
    };
  }

  // Validar formato de dominio
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(params.target)) {
    return { valid: false, error: "Invalid domain format" };
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

  // Validar limit
  if (params.limit) {
    const limit = parseInt(params.limit);
    if (
      isNaN(limit) ||
      limit < API_CONFIG.MIN_LIMIT ||
      limit > API_CONFIG.MAX_LIMIT
    ) {
      return {
        valid: false,
        error: `Limit must be between ${API_CONFIG.MIN_LIMIT} and ${API_CONFIG.MAX_LIMIT}`,
      };
    }
  }

  // Validar offset
  if (params.offset) {
    const offset = parseInt(params.offset);
    if (isNaN(offset) || offset < 0) {
      return { valid: false, error: "Offset must be a non-negative integer" };
    }
  }

  return { valid: true };
}

// 🚀 POST - Obtener Ranked Keywords
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
    const validation = validateRankedKeywordsParams(body);
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
    const rankedKeywordsRequest = {
      target: body.target
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, ""),
      location_name: (body.location_name as Location) || "United States",
      language_code: (body.language_code as Language) || "en",
      limit: body.limit || API_CONFIG.DEFAULT_LIMIT,
      offset: body.offset || 0,
      filters: body.filters || [],
      order_by: body.order_by || ["search_volume,desc"],
      include_subdomains: body.include_subdomains || false,
      include_clickstream_data: body.include_clickstream_data || false,
    };

    console.log(`🔍 Ranked Keywords request:`, {
      target: rankedKeywordsRequest.target,
      location: rankedKeywordsRequest.location_name,
      language: rankedKeywordsRequest.language_code,
      limit: rankedKeywordsRequest.limit,
      user: userId,
    });

    // 📡 Llamar a DataForSEO
    const response = await dataForSEOClient.getRankedKeywords(
      rankedKeywordsRequest,
    );

    if (!response.success) {
      console.error(`❌ Ranked Keywords error:`, response.error);
      return NextResponse.json(
        {
          success: false,
          error: "DataForSEO API error",
          message: response.error || "Failed to fetch ranked keywords data",
          details: response.data,
        },
        { status: 500 },
      );
    }

    // 📊 Procesar respuesta
    const processingTime = Date.now() - startTime;

    // Procesar datos de respuesta
    const rankedKeywordsData =
      response.data?.tasks?.[0]?.result?.[0]?.items || [];

    const processedData = rankedKeywordsData.map((item: any) => ({
      keyword: item.keyword,
      search_volume: item.search_volume || 0,
      cpc: item.cpc || 0,
      competition: item.competition || 0,
      competition_index: item.competition_index || 0,
      rank_group: item.rank_group || 0,
      rank_absolute: item.rank_absolute || 0,
      etv: item.etv || 0,
      impressions_etv: item.impressions_etv || 0,
      clicks_sum: item.clicks_sum || 0,
      impressions_sum: item.impressions_sum || 0,
      ctr: item.ctr || 0,
      position: item.position || 0,
      serp_item: item.serp_item || {},
      keyword_data: item.keyword_data || {},
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
      average_position:
        processedData.reduce(
          (sum: number, item: any) => sum + item.position,
          0,
        ) / processedData.length || 0,
      top_10_keywords: processedData.filter(
        (item: any) => item.rank_group <= 10,
      ).length,
      top_3_keywords: processedData.filter((item: any) => item.rank_group <= 3)
        .length,
      max_search_volume: Math.max(
        ...processedData.map((item: any) => item.search_volume),
      ),
      min_search_volume: Math.min(
        ...processedData.map((item: any) => item.search_volume),
      ),
      total_estimated_traffic: processedData.reduce(
        (sum: number, item: any) => sum + item.etv,
        0,
      ),
    };

    const result = {
      success: true,
      data: {
        domain: rankedKeywordsRequest.target,
        keywords: processedData,
        statistics: stats,
        metadata: {
          target_domain: rankedKeywordsRequest.target,
          location: rankedKeywordsRequest.location_name,
          language: rankedKeywordsRequest.language_code,
          limit: rankedKeywordsRequest.limit,
          offset: rankedKeywordsRequest.offset,
          include_subdomains: rankedKeywordsRequest.include_subdomains,
          processing_time_ms: processingTime,
          cache_hit: response.cacheHit || false,
          timestamp: new Date().toISOString(),
        },
        pagination: {
          current_page:
            Math.floor(
              rankedKeywordsRequest.offset / rankedKeywordsRequest.limit,
            ) + 1,
          total_pages: Math.ceil(
            stats.total_keywords / rankedKeywordsRequest.limit,
          ),
          has_more:
            rankedKeywordsRequest.offset + rankedKeywordsRequest.limit <
            stats.total_keywords,
          next_offset:
            rankedKeywordsRequest.offset + rankedKeywordsRequest.limit,
        },
      },
      message: "Ranked keywords data retrieved successfully",
    };

    console.log(`✅ Ranked Keywords success:`, {
      target: rankedKeywordsRequest.target,
      keywordsCount: processedData.length,
      processingTime,
      cacheHit: response.cacheHit,
      avgVolume: stats.average_search_volume,
      top10Count: stats.top_10_keywords,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`❌ Ranked Keywords unexpected error:`, error);

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
      endpoint: "DataForSEO Labs - Ranked Keywords API",
      description: "Get keywords that any domain or webpage is ranking for",
      methods: {
        POST: "Get ranked keywords for a domain",
        GET: "Get endpoint information",
      },
      parameters: {
        target: {
          type: "string",
          required: true,
          description: "Domain name or page URL to analyze",
          minLength: API_CONFIG.MIN_DOMAIN_LENGTH,
          maxLength: API_CONFIG.MAX_DOMAIN_LENGTH,
          example: "example.com or https://example.com/page",
        },
        location_name: {
          type: "string",
          required: false,
          description: "Location for keyword analysis",
          default: "United States",
          supported: POPULAR_LOCATIONS.slice(0, 10),
        },
        language_code: {
          type: "string",
          required: false,
          description: "Language code for keyword analysis",
          default: "en",
          supported: SUPPORTED_LANGUAGES,
        },
        limit: {
          type: "number",
          required: false,
          description: "Maximum number of keywords to return",
          default: API_CONFIG.DEFAULT_LIMIT,
          min: API_CONFIG.MIN_LIMIT,
          max: API_CONFIG.MAX_LIMIT,
        },
        offset: {
          type: "number",
          required: false,
          description: "Offset for pagination",
          default: 0,
          min: 0,
        },
        filters: {
          type: "array",
          required: false,
          description: "Array of filter conditions",
          example: [["search_volume", ">", 1000]],
        },
        order_by: {
          type: "array",
          required: false,
          description: "Sorting rules",
          default: ["search_volume,desc"],
          example: ["search_volume,desc", "cpc,desc"],
        },
        include_subdomains: {
          type: "boolean",
          required: false,
          description: "Include keywords from subdomains",
          default: false,
        },
        include_clickstream_data: {
          type: "boolean",
          required: false,
          description: "Include clickstream-based metrics",
          default: false,
        },
      },
      rate_limits: {
        requests_per_minute: API_CONFIG.RATE_LIMIT_MAX_REQUESTS,
        window_ms: API_CONFIG.RATE_LIMIT_WINDOW,
      },
      cache: {
        ttl_ms: API_CONFIG.CACHE_TTL,
        description: "Ranked keywords data is cached for 2 hours",
      },
      response_format: {
        success: "boolean",
        data: {
          domain: "target domain",
          keywords: "array of keyword data with ranking info",
          statistics: "summary statistics",
          metadata: "request metadata",
          pagination: "pagination info",
        },
        message: "string",
      },
    },
    message: "DataForSEO Labs Ranked Keywords API information",
  });
}
