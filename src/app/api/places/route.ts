import { NextRequest, NextResponse } from "next/server";

interface PlaceSuggestion {
  placeId: string;
  mainText?: string;
  secondaryText?: string;
  description?: string;
  types?: string[];
  locationContext?: string;
}

interface PlacesResponse {
  predictions: PlaceSuggestion[];
  metadata: {
    location: any;
    responseTime: number;
    totalResults: number;
    hasLocationBias: boolean;
    sessionToken?: string;
  };
}

// 🎯 Elite: Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

// 🛡️ Elite rate limiting
const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 30; // 30 requests per minute

  const record = rateLimitCache.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

// =====================
// GEO INLINE UTILITIES
// =====================
const CLIENT_IP_COOKIE = "fd_client_ip";
const GEO_COOKIE = "fd_geo_coords";

function isPrivateOrReserved(ip: string): boolean {
  if (!ip) return true;
  if (!isNaN(Number(ip.split(".")[0]))) {
    if (ip.startsWith("10.")) return true;
    const oct2 = Number(ip.split(".")[1] || 0);
    if (ip.startsWith("172.") && oct2 >= 16 && oct2 <= 31) return true;
    if (ip.startsWith("192.168.")) return true;
    if (ip.startsWith("127.")) return true;
  }
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe80:")) return true;
  return false;
}

function sanitizeIp(raw: string | null): string | null {
  if (!raw) return null;
  let ip = raw.split(",")[0].trim();
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip;
}

function getSignedCookieIp(req: NextRequest): string | null {
  const val = req.cookies.get(CLIENT_IP_COOKIE)?.value;
  // No verificamos firma aquí (la firma se valida en Middleware). Solo usamos valor si es razonable.
  if (!val) return null;
  // formato: v1.<b64>.<sig>
  const parts = val.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1];
    const jsonStr = Buffer.from(
      b64.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const obj = JSON.parse(jsonStr) as { ip?: string; ts?: number };
    if (obj?.ip && !isPrivateOrReserved(obj.ip)) return obj.ip;
  } catch {
    return null;
  }
  return null;
}

function getGeoConsentCoords(
  req: NextRequest,
): { latitude: number; longitude: number; accuracy?: number } | null {
  const val = req.cookies.get(GEO_COOKIE)?.value;
  if (!val) return null;
  const parts = val.split(".");
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1];
    const jsonStr = Buffer.from(
      b64.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const obj = JSON.parse(jsonStr) as {
      latitude?: number;
      longitude?: number;
      accuracy?: number;
      ts?: number;
    };
    if (
      obj?.latitude != null &&
      obj?.longitude != null &&
      isFinite(obj.latitude) &&
      isFinite(obj.longitude)
    ) {
      return {
        latitude: obj.latitude,
        longitude: obj.longitude,
        accuracy: obj.accuracy,
      };
    }
  } catch {
    return null;
  }
  return null;
}
const getClientIP = (req: NextRequest): string | null => {
  // 1) Priorizar cookie firmada set por Middleware
  const cookieIp = getSignedCookieIp(req);
  if (cookieIp) return cookieIp;
  // 2) Headers ordenados
  const forwardedFor = sanitizeIp(req.headers.get("x-forwarded-for"));
  if (forwardedFor && !isPrivateOrReserved(forwardedFor)) return forwardedFor;
  const realIP = sanitizeIp(req.headers.get("x-real-ip"));
  if (realIP && !isPrivateOrReserved(realIP)) return realIP;
  const vercelIP = sanitizeIp(req.headers.get("x-vercel-ip"));
  if (vercelIP) return vercelIP;
  return forwardedFor || realIP || vercelIP || null;
};

const getVercelGeo = (req: NextRequest) => {
  try {
    const city = req.headers.get("x-vercel-ip-city");
    const country = req.headers.get("x-vercel-ip-country");
    const region = req.headers.get("x-vercel-ip-region");
    const latitude = req.headers.get("x-vercel-ip-latitude");
    const longitude = req.headers.get("x-vercel-ip-longitude");

    if (city && country) {
      return {
        city,
        country,
        region: region || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        ip: getClientIP(req) || undefined,
        source: "vercel",
      };
    }
    return null;
  } catch {
    return null;
  }
};

const getIPinfoGeo = async (ip: string) => {
  try {
    const token = process.env.IPINFO_TOKEN;
    if (!token) return null;

    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = await response.json();
    let latitude: number | undefined;
    let longitude: number | undefined;
    if (data.loc) {
      const [lat, lng] = data.loc.split(",").map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        latitude = lat;
        longitude = lng;
      }
    }
    return {
      city: data.city,
      country: data.country,
      region: data.region,
      latitude,
      longitude,
      ip,
      source: "ipinfo",
    };
  } catch {
    return null;
  }
};

const getFallbackGeo = async (ip: string) => {
  try {
    const resp = await fetch(
      `http://ip-api.com/json/${ip}?fields=city,region,country,lat,lon`,
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.city || !data.country) return null;
    return {
      city: data.city,
      country: data.country,
      region: data.region,
      latitude: data.lat,
      longitude: data.lon,
      ip,
      source: "fallback",
    };
  } catch {
    return null;
  }
};

const detectGeoInline = async (req: NextRequest) => {
  // 0) Coordenadas precisas por consentimiento del usuario (cookie)
  const consent = getGeoConsentCoords(req);
  if (consent) {
    return {
      city: undefined,
      country: undefined,
      region: undefined,
      latitude: consent.latitude,
      longitude: consent.longitude,
      ip: undefined,
      source: "consent" as const,
    };
  }

  // 1) IP-based (priorizar IPinfo si hay token)
  const ip = getClientIP(req);
  if (ip) {
    const ipinfo = await getIPinfoGeo(ip);
    if (ipinfo) return ipinfo;
  }

  // 2) Vercel headers
  const vercel = getVercelGeo(req);
  if (vercel) return vercel;

  // 3) Fallback
  if (ip) {
    return await getFallbackGeo(ip);
  }
  return null;
};

// 🎯 Elite: Crear location bias
const createLocationBias = (location: any): any => {
  if (location?.latitude && location?.longitude) {
    return {
      locationBias: {
        circle: {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          radius: location?.radiusMeters ?? 50000.0,
        },
      },
    };
  }

  if (location?.city && location?.country) {
    return {
      locationBias: {
        text: `${location.city}, ${location.country}`,
      },
    };
  }

  return {};
};

// 🎯 Elite: Generar session token
const generateSessionToken = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 📊 Input validation
    const input = req.nextUrl.searchParams.get("input");
    const lang = req.nextUrl.searchParams.get("lang") || "es";
    const forceLocation = req.nextUrl.searchParams.get("forceLocation");

    if (!input || input.length < 3) {
      return NextResponse.json({
        predictions: [],
        message: "Input must be at least 3 characters long",
      });
    }

    // 🛡️ Rate limiting
    const clientIP =
      req.headers.get("x-vercel-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        },
        { status: 429 },
      );
    }

    // 🔑 API key validation
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error("🚨 Google Places API key missing");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    // 🎯 Inline geo detection (no subfetch)
    const location = !forceLocation ? await detectGeoInline(req) : null;

    // 🎯 Generate session token for better relevance and billing
    const sessionToken = generateSessionToken();

    // 🏗️ Build request payload with location bias
    // Determinar radio según si hay consentimiento preciso
    const consent = getGeoConsentCoords(req);
    const radiusMeters =
      location?.latitude && location?.longitude
        ? consent
          ? 5000.0
          : 50000.0
        : undefined;

    const requestBody: any = {
      input,
      languageCode: lang,
      includedPrimaryTypes: ["establishment"],
      sessionToken,
      ...(location ? createLocationBias({ ...location, radiusMeters }) : {}),
    };

    // 🚀 Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("🚨 Google Places API error:", res.status, errorData);

      return NextResponse.json(
        {
          error: "Google API error",
          details: errorData,
          message: "Unable to fetch suggestions at this time",
        },
        { status: res.status },
      );
    }

    const data = await res.json();

    // 🎯 Elite response processing
    const predictions: PlaceSuggestion[] = (data.suggestions || []).map(
      (s: any) => {
        const p = s.placePrediction;
        const hasCityCountry = Boolean(location?.city && location?.country);
        return {
          placeId: p.placeId,
          mainText: p.structuredFormat?.mainText?.text,
          secondaryText: p.structuredFormat?.secondaryText?.text,
          description: p.text?.text,
          types: p.types,
          ...(location && hasCityCountry
            ? { locationContext: `${location.city}, ${location.country}` }
            : {}),
        };
      },
    );

    // 📊 Performance metrics
    const responseTime = Date.now() - startTime;

    const response: PlacesResponse = {
      predictions,
      metadata: {
        location: location || null,
        responseTime,
        totalResults: predictions.length,
        hasLocationBias: !!location,
        sessionToken,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("🚨 Places autocomplete error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timeout",
          message: "The request took too long. Please try again.",
        },
        { status: 408 },
      );
    }

    return NextResponse.json(
      {
        error: "Server error",
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 },
    );
  }
}

// 🛡️ Clean up rate limit cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitCache.entries()) {
    if (now > value.resetTime) {
      rateLimitCache.delete(key);
    }
  }
}, 60000); // Clean every minute
