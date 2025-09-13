/**
 * 🚀 ELITE SERP Organic Live Advanced API
 *
 * Endpoint escalable y robusto para obtener resultados orgánicos de Google
 * con análisis avanzado y métricas detalladas
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { dataForSEOClient } from "@/lib/dataforseo-client";
import {
  DATAFORSEO_CONFIG,
  SUPPORTED_SEARCH_ENGINES,
  POPULAR_LOCATIONS,
  SUPPORTED_LANGUAGES,
  type SearchEngine,
  type Location,
  type Language,
} from "@/lib/dataforseo-config";

// 🔧 Configuración Elite
const API_CONFIG = {
  MAX_KEYWORDS_LENGTH: 100,
  MAX_DEPTH: 700,
  MIN_DEPTH: 10,
  MAX_CRAWL_PAGES: 7,
  MIN_CRAWL_PAGES: 1,
  CACHE_TTL: 10 * 60 * 1000, // 10 minutos
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 10, // 10 requests por minuto por usuario
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
function validateSERPParams(params: any): { valid: boolean; error?: string } {
  // Validar keyword
  if (!params.keyword || typeof params.keyword !== "string") {
    return { valid: false, error: "Keyword is required and must be a string" };
  }

  if (params.keyword.length > API_CONFIG.MAX_KEYWORDS_LENGTH) {
    return {
      valid: false,
      error: `Keyword too long. Max length: ${API_CONFIG.MAX_KEYWORDS_LENGTH}`,
    };
  }

  // Validar search engine
  if (
    params.search_engine &&
    !SUPPORTED_SEARCH_ENGINES.includes(params.search_engine)
  ) {
    return {
      valid: false,
      error: `Unsupported search engine. Supported: ${SUPPORTED_SEARCH_ENGINES.join(", ")}`,
    };
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

  // Validar depth
  if (params.depth) {
    const depth = parseInt(params.depth);
    if (
      isNaN(depth) ||
      depth < API_CONFIG.MIN_DEPTH ||
      depth > API_CONFIG.MAX_DEPTH
    ) {
      return {
        valid: false,
        error: `Depth must be between ${API_CONFIG.MIN_DEPTH} and ${API_CONFIG.MAX_DEPTH}`,
      };
    }
  }

  // Validar max_crawl_pages
  if (params.max_crawl_pages) {
    const pages = parseInt(params.max_crawl_pages);
    if (
      isNaN(pages) ||
      pages < API_CONFIG.MIN_CRAWL_PAGES ||
      pages > API_CONFIG.MAX_CRAWL_PAGES
    ) {
      return {
        valid: false,
        error: `Max crawl pages must be between ${API_CONFIG.MIN_CRAWL_PAGES} and ${API_CONFIG.MAX_CRAWL_PAGES}`,
      };
    }
  }

  // Validar people_also_ask_click_depth
  if (params.people_also_ask_click_depth) {
    const depth = parseInt(params.people_also_ask_click_depth);
    if (isNaN(depth) || depth < 1 || depth > 4) {
      return {
        valid: false,
        error: "People also ask click depth must be between 1 and 4",
      };
    }
  }

  return { valid: true };
}

// 🚀 GET - Obtener SERP Organic Live Advanced
export async function GET(request: NextRequest) {
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

    // 📋 Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const params = {
      keyword: searchParams.get("keyword"),
      search_engine: searchParams.get("search_engine") as SearchEngine,
      location_name: searchParams.get("location_name") as Location,
      language_code: searchParams.get("language_code") as Language,
      depth: searchParams.get("depth"),
      device: searchParams.get("device") as "desktop" | "mobile",
      max_crawl_pages: searchParams.get("max_crawl_pages"),
      people_also_ask_click_depth: searchParams.get(
        "people_also_ask_click_depth",
      ),
    };

    // ✅ Validar parámetros
    const validation = validateSERPParams(params);
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
    const serpRequest = {
      keyword: params.keyword!,
      search_engine: params.search_engine || "google",
      location_name: params.location_name || "United States",
      language_code: params.language_code || "en",
      depth: params.depth ? parseInt(params.depth) : 10,
      device: params.device || "desktop",
      max_crawl_pages: params.max_crawl_pages
        ? parseInt(params.max_crawl_pages)
        : 1,
      people_also_ask_click_depth: params.people_also_ask_click_depth
        ? parseInt(params.people_also_ask_click_depth)
        : undefined,
    };

    console.log(`🔍 SERP Organic Live Advanced request:`, {
      keyword: serpRequest.keyword,
      search_engine: serpRequest.search_engine,
      location: serpRequest.location_name,
      user: userId,
    });

    // 📡 Llamar a DataForSEO
    const response =
      await dataForSEOClient.getSERPOrganicLiveAdvanced(serpRequest);

    if (!response.success) {
      console.error(`❌ SERP Organic Live Advanced error:`, response.error);
      return NextResponse.json(
        {
          success: false,
          error: "DataForSEO API error",
          message: response.error || "Failed to fetch SERP data",
          details: response.data,
        },
        { status: 500 },
      );
    }

    // 📊 Procesar respuesta
    const processingTime = Date.now() - startTime;

    const result = {
      success: true,
      data: {
        serp_results: response.data,
        metadata: {
          keyword: serpRequest.keyword,
          search_engine: serpRequest.search_engine,
          location: serpRequest.location_name,
          language: serpRequest.language_code,
          device: serpRequest.device,
          depth: serpRequest.depth,
          total_results: response.data?.organic_results?.length || 0,
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
      message: "SERP data retrieved successfully",
    };

    console.log(`✅ SERP Organic Live Advanced success:`, {
      keyword: serpRequest.keyword,
      results: result.data.metadata.total_results,
      processingTime,
      cacheHit: response.cacheHit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(`❌ SERP Organic Live Advanced unexpected error:`, error);

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

// 📝 POST - Crear SERP Organic Live Advanced (para requests complejos)
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
    const validation = validateSERPParams(body);
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
    const serpRequest = {
      keyword: body.keyword,
      search_engine: body.search_engine || "google",
      location_name: body.location_name || "United States",
      language_code: body.language_code || "en",
      depth: body.depth || 10,
      device: body.device || "desktop",
      max_crawl_pages: body.max_crawl_pages || 1,
      people_also_ask_click_depth: body.people_also_ask_click_depth,
    };

    console.log(`🔍 SERP Organic Live Advanced POST request:`, {
      keyword: serpRequest.keyword,
      search_engine: serpRequest.search_engine,
      location: serpRequest.location_name,
      user: userId,
    });

    // 📡 Llamar a DataForSEO
    const response =
      await dataForSEOClient.getSERPOrganicLiveAdvanced(serpRequest);

    if (!response.success) {
      console.error(
        `❌ SERP Organic Live Advanced POST error:`,
        response.error,
      );
      return NextResponse.json(
        {
          success: false,
          error: "DataForSEO API error",
          message: response.error || "Failed to fetch SERP data",
          details: response.data,
        },
        { status: 500 },
      );
    }

    // 📊 Procesar respuesta
    const processingTime = Date.now() - startTime;

    const result = {
      success: true,
      data: {
        serp_results: response.data,
        metadata: {
          keyword: serpRequest.keyword,
          search_engine: serpRequest.search_engine,
          location: serpRequest.location_name,
          language: serpRequest.language_code,
          device: serpRequest.device,
          depth: serpRequest.depth,
          total_results: response.data?.organic_results?.length || 0,
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
      message: "SERP data retrieved successfully",
    };

    console.log(`✅ SERP Organic Live Advanced POST success:`, {
      keyword: serpRequest.keyword,
      results: result.data.metadata.total_results,
      processingTime,
      cacheHit: response.cacheHit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      `❌ SERP Organic Live Advanced POST unexpected error:`,
      error,
    );

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
