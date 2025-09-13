/**
 * 🚀 ELITE DataForSEO Labs - Keyword Ideas API
 *
 * Endpoint escalable y robusto para obtener ideas de keywords relevantes
 * basadas en keywords semilla especificadas
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
  MAX_KEYWORDS_PER_REQUEST: 200,
  MIN_KEYWORDS_PER_REQUEST: 1,
  MAX_KEYWORD_LENGTH: 100,
  MAX_LIMIT: 1000,
  MIN_LIMIT: 1,
  DEFAULT_LIMIT: 10,
  CACHE_TTL: 2 * 60 * 60 * 1000, // 2 horas
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 3, // 3 requests por minuto por usuario
} as const;

// 🛡️ Rate Limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, {
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
};

// 💾 Cache Manager
const cache = new Map<string, { data: any; expires: number }>();

const getCachedData = (key: string): any | null => {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expires) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any, ttl: number): void => {
  cache.set(key, {
    data,
    expires: Date.now() + ttl,
  });
};

// 📊 Logging
const logApiCall = (
  endpoint: string,
  request: any,
  response: any,
  duration: number,
) => {
  console.log("Keyword Ideas API Call:", {
    endpoint,
    method: "POST",
    requestSize: JSON.stringify(request).length,
    responseSize: JSON.stringify(response).length,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  });
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 🔐 Autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 🛡️ Rate Limiting
    if (!session.user.id || !checkRateLimit(session.user.id)) {
      return NextResponse.json(
        {
          error: "Rate limit excedido",
          retryAfter: Math.ceil(API_CONFIG.RATE_LIMIT_WINDOW / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              API_CONFIG.RATE_LIMIT_WINDOW / 1000,
            ).toString(),
          },
        },
      );
    }

    // 📝 Parse Request Body
    const body = await request.json();

    // ✅ Validación de Datos
    if (!body.keywords || !Array.isArray(body.keywords)) {
      return NextResponse.json(
        { error: "Keywords es requerido y debe ser un array" },
        { status: 400 },
      );
    }

    if (body.keywords.length < API_CONFIG.MIN_KEYWORDS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Mínimo ${API_CONFIG.MIN_KEYWORDS_PER_REQUEST} keyword requerido`,
        },
        { status: 400 },
      );
    }

    if (body.keywords.length > API_CONFIG.MAX_KEYWORDS_PER_REQUEST) {
      return NextResponse.json(
        {
          error: `Máximo ${API_CONFIG.MAX_KEYWORDS_PER_REQUEST} keywords permitidos`,
        },
        { status: 400 },
      );
    }

    // 🔍 Validación de Keywords
    for (const keyword of body.keywords) {
      if (typeof keyword !== "string" || keyword.trim().length === 0) {
        return NextResponse.json(
          { error: "Cada keyword debe ser una cadena válida" },
          { status: 400 },
        );
      }

      if (keyword.length > API_CONFIG.MAX_KEYWORD_LENGTH) {
        return NextResponse.json(
          { error: `Keyword muy larga: ${keyword}` },
          { status: 400 },
        );
      }
    }

    // 🌍 Validación de Location
    const location = body.location_name || "United States";
    if (!POPULAR_LOCATIONS.includes(location as Location)) {
      return NextResponse.json(
        {
          error: "Location no soportada",
          supportedLocations: POPULAR_LOCATIONS.slice(0, 10), // Mostrar solo los primeros 10
        },
        { status: 400 },
      );
    }

    // 🌐 Validación de Language
    const language = body.language_code || "en";
    if (!SUPPORTED_LANGUAGES.includes(language as Language)) {
      return NextResponse.json(
        {
          error: "Language no soportado",
          supportedLanguages: SUPPORTED_LANGUAGES,
        },
        { status: 400 },
      );
    }

    // 📊 Validación de Limit
    const limit = Math.min(
      Math.max(body.limit || API_CONFIG.DEFAULT_LIMIT, API_CONFIG.MIN_LIMIT),
      API_CONFIG.MAX_LIMIT,
    );

    // 🔑 Cache Key
    const cacheKey = `keyword_ideas:${JSON.stringify({
      keywords: body.keywords.sort(),
      location,
      language,
      limit,
      offset: body.offset || 0,
      filters: body.filters || [],
      orderBy: body.orderBy || [],
    })}`;

    // 💾 Check Cache
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      logApiCall(
        "/api/labs/keyword-ideas",
        body,
        cachedResult,
        Date.now() - startTime,
      );
      return NextResponse.json(cachedResult);
    }

    // 🚀 Preparar Request para DataForSEO
    const dataForSEORequest = {
      keywords: body.keywords,
      location_name: location,
      language_code: language,
      limit,
      offset: body.offset || 0,
      filters: body.filters || [],
      order_by: body.orderBy || ["relevance,desc"],
      include_clickstream_data: body.includeClickstreamData || false,
    };

    // 📡 Llamada a DataForSEO
    const result = await dataForSEOClient.keywordIdeas(dataForSEORequest);

    // 💾 Cache Result
    setCachedData(cacheKey, result, API_CONFIG.CACHE_TTL);

    // 📊 Log Success
    logApiCall("/api/labs/keyword-ideas", body, result, Date.now() - startTime);

    // 🎯 Response
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": `public, max-age=${Math.floor(API_CONFIG.CACHE_TTL / 1000)}`,
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Keyword Ideas API Error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      user: "unknown",
    });

    // 🛡️ Error Response
    if (error instanceof Error && error.message.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit excedido en DataForSEO" },
        { status: 429 },
      );
    }

    if (error instanceof Error && error.message.includes("invalid")) {
      return NextResponse.json(
        { error: "Parámetros inválidos" },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// 📋 OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
