import { NextRequest, NextResponse } from "next/server";

interface GeoData {
  city?: string;
  country?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
  ip?: string;
  source: "vercel" | "ipinfo" | "fallback";
}

// 🎯 Elite: Priorizar IP desde cookie firmada creada en Middleware
const CLIENT_IP_COOKIE = "fd_client_ip";

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
  if (!val) return null;
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

// 🎯 Elite: Detección de geolocalización portable
const getClientIP = (req: NextRequest): string | null => {
  const cookieIp = getSignedCookieIp(req);
  if (cookieIp) return cookieIp;

  const forwardedFor = sanitizeIp(req.headers.get("x-forwarded-for"));
  if (forwardedFor && !isPrivateOrReserved(forwardedFor)) return forwardedFor;

  const realIP = sanitizeIp(req.headers.get("x-real-ip"));
  if (realIP && !isPrivateOrReserved(realIP)) return realIP;

  const vercelIP = sanitizeIp(req.headers.get("x-vercel-ip"));
  if (vercelIP) return vercelIP;

  return forwardedFor || realIP || vercelIP || null;
};

// 🎯 Elite: Detección de geolocalización en Vercel
const getVercelGeo = (req: NextRequest): GeoData | null => {
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
  } catch (error) {
    console.warn("📍 Vercel geo detection failed:", error);
    return null;
  }
};

// 🎯 Elite: Detección de geolocalización via IPinfo
const getIPinfoGeo = async (ip: string): Promise<GeoData | null> => {
  try {
    const token = process.env.IPINFO_TOKEN;
    if (!token) {
      console.warn("📍 IPINFO_TOKEN not configured");
      return null;
    }

    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`IPinfo API error: ${response.status}`);
    }

    const data = await response.json();

    // 🎯 Parsear coordenadas desde loc
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
  } catch (error) {
    console.warn("📍 IPinfo geo detection failed:", error);
    return null;
  }
};

// 🎯 Elite: Fallback geolocalización
const getFallbackGeo = async (ip: string): Promise<GeoData | null> => {
  try {
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=city,region,country,lat,lon`,
    );

    if (!response.ok) {
      throw new Error(`Fallback API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.city && data.country) {
      return {
        city: data.city,
        country: data.country,
        region: data.region,
        latitude: data.lat,
        longitude: data.lon,
        ip,
        source: "fallback",
      };
    }
    return null;
  } catch (error) {
    console.warn("📍 Fallback geo detection failed:", error);
    return null;
  }
};

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // 🎯 Obtener IP del cliente
    const clientIP = getClientIP(req);

    if (!clientIP) {
      return NextResponse.json(
        {
          error: "Could not determine client IP",
          message: "Unable to detect your location",
        },
        { status: 400 },
      );
    }

    let geoData: GeoData | null = null;

    // 🌐 1. Priorizar IPinfo si hay token
    if (process.env.IPINFO_TOKEN) {
      geoData = await getIPinfoGeo(clientIP);
    }

    // 🏢 2. Vercel geolocalización (fallback)
    if (!geoData) {
      geoData = getVercelGeo(req);
    }

    // 🔄 3. Fallback a servicio gratuito
    if (!geoData) {
      geoData = await getFallbackGeo(clientIP);
    }

    const responseTime = Date.now() - startTime;

    console.log(
      `📍 Geo detection: ${responseTime}ms, source: ${geoData?.source || "none"}`,
    );

    return NextResponse.json({
      success: true,
      data: geoData,
      metadata: {
        responseTime,
        detectedIP: clientIP,
        source: geoData?.source || "none",
      },
    });
  } catch (error) {
    console.error("🚨 Geo detection error:", error);

    return NextResponse.json(
      {
        error: "Geolocation service unavailable",
        message: "Unable to determine your location at this time",
      },
      { status: 500 },
    );
  }
}
