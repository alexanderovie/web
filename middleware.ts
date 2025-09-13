import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";

// ==============================================
// 🏗️ MIDDLEWARE CONFIGURATION
// ==============================================

// Configuración centralizada para escalabilidad
const MIDDLEWARE_CONFIG = {
  // Idiomas soportados
  locales: ["es", "en"] as const,
  defaultLocale: "es" as const,

  // Rutas protegidas que requieren autenticación
  protectedPaths: ["/dashboard"] as const,

  // URL del dashboard elite
  dashboardEliteUrl: "https://dashboard.fascinantedigital.com",

  // Rutas estáticas que no requieren procesamiento
  staticPaths: new Set([
    "/api",
    "/_next",
    "/_document",
    "/favicon",
    "/manifest",
    "/robots",
    "/sitemap",
    "/apple-icon",
    "/icon",
  ]),

  // Headers de seguridad
  securityHeaders: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-DNS-Prefetch-Control": "off",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  } as const,
} as const;

type Locale = (typeof MIDDLEWARE_CONFIG.locales)[number];

// ==============================================
// 🛡️ SECURITY & UTILITIES
// ==============================================

/**
 * Rate limiting con memoria compartida
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(
  ip: string,
  limit = 100,
  windowMs = 15 * 60 * 1000,
): boolean {
  const now = Date.now();
  const key = `${ip}-${Math.floor(now / windowMs)}`;

  const current = rateLimitMap.get(key) || {
    count: 0,
    resetTime: now + windowMs,
  };
  current.count++;

  if (current.count > limit) {
    return false;
  }

  rateLimitMap.set(key, current);

  // Limpieza automática de entradas expiradas
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetTime < now) {
        rateLimitMap.delete(k);
      }
    }
  }

  return true;
}

// ==============================================
// 🔏 SIGNED COOKIE FOR CLIENT IP
// ==============================================

const CLIENT_IP_COOKIE = "fd_client_ip";
const CLIENT_IP_TTL_SECONDS = 15 * 60; // 15 minutos

function base64UrlEncode(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  // btoa es seguro aquí porque str contiene solo bytes 0-255
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSHA256(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data),
  );
  return base64UrlEncode(signature);
}

function isLikelyIPv4(ip: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

function sanitizeIp(raw: string | null): string | null {
  if (!raw) return null;
  let ip = raw.split(",")[0].trim();
  // strip IPv4-mapped IPv6
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip;
}

function isPrivateOrReserved(ip: string): boolean {
  // IPv4 rangos privados/comunes
  if (!ip) return true;
  if (!isNaN(Number(ip.split(".")[0]))) {
    if (ip.startsWith("10.")) return true;
    const oct2 = Number(ip.split(".")[1] || 0);
    if (ip.startsWith("172.") && oct2 >= 16 && oct2 <= 31) return true;
    if (ip.startsWith("192.168.")) return true;
    if (ip.startsWith("127.")) return true;
  }
  // IPv6 básicos
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // Unique local
  if (lower.startsWith("fe80:")) return true; // link-local
  return false;
}

function getClientIPOrdered(request: NextRequest): string | null {
  const xff = sanitizeIp(request.headers.get("x-forwarded-for"));
  if (xff && !isPrivateOrReserved(xff)) return xff;
  const xri = sanitizeIp(request.headers.get("x-real-ip"));
  if (xri && !isPrivateOrReserved(xri)) return xri;
  const vercel = sanitizeIp(request.headers.get("x-vercel-ip"));
  if (vercel) return vercel; // fallback
  return xff || xri || vercel || null;
}

async function createSignedIpCookieValue(ip: string, secret: string) {
  const payload = { ip, ts: Math.floor(Date.now() / 1000) };
  const json = JSON.stringify(payload);
  const b64 = base64UrlEncode(json);
  const sig = await hmacSHA256(secret, b64);
  return `v1.${b64}.${sig}`;
}

async function verifySignedIpCookie(
  value: string | undefined,
  secret: string,
): Promise<{ ip: string; ts: number } | null> {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return null;
  const [_, b64, sig] = parts;
  const expectedSig = await hmacSHA256(secret, b64);
  if (sig !== expectedSig) return null;
  // decode base64url
  const jsonStr = Buffer.from(
    b64.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");
  try {
    const obj = JSON.parse(jsonStr) as { ip: string; ts: number };
    if (!obj?.ip || !obj?.ts) return null;
    // expiración
    const now = Math.floor(Date.now() / 1000);
    if (now - obj.ts > CLIENT_IP_TTL_SECONDS) return null;
    return obj;
  } catch {
    return null;
  }
}

/**
 * Detecta idioma preferido con RFC-compliant parsing
 */
function detectPreferredLocale(acceptLanguage: string): Locale {
  if (!acceptLanguage) return MIDDLEWARE_CONFIG.defaultLocale;

  // Parse Accept-Language header con q-values
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, q = "q=1"] = lang.trim().split(";");
      const quality = parseFloat(q.replace("q=", "")) || 1;
      return { code: code.toLowerCase(), quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Buscar coincidencia exacta primero
  for (const { code } of languages) {
    const exactMatch = MIDDLEWARE_CONFIG.locales.find(
      (locale) => code === locale.toLowerCase(),
    );
    if (exactMatch) return exactMatch;
  }

  // Buscar coincidencia de idioma (ej: 'en' matches 'en')
  for (const { code } of languages) {
    const langOnly = code.split("-")[0];
    const langMatch = MIDDLEWARE_CONFIG.locales.find(
      (locale) => langOnly === locale.split("-")[0].toLowerCase(),
    );
    if (langMatch) return langMatch;
  }

  return MIDDLEWARE_CONFIG.defaultLocale;
}

/**
 * Verifica si la ruta requiere procesamiento
 */
function shouldProcessPath(pathname: string): boolean {
  // Ignorar rutas estáticas
  for (const staticPath of MIDDLEWARE_CONFIG.staticPaths) {
    if (pathname.startsWith(staticPath)) return false;
  }

  // Ignorar archivos estáticos por extensión
  if (pathname.includes(".") && !pathname.includes("/.")) return false;

  return true;
}

/**
 * Extrae el locale de la URL
 */
function extractLocaleFromPath(pathname: string): {
  locale: Locale | null;
  pathWithoutLocale: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  const locale =
    MIDDLEWARE_CONFIG.locales.find((l) => l.toLowerCase() === firstSegment) ||
    null;

  const pathWithoutLocale = locale
    ? "/" + segments.slice(1).join("/") || "/"
    : pathname;

  return { locale, pathWithoutLocale };
}

// ==============================================
// 🔄 MIDDLEWARE HANDLERS
// ==============================================

/**
 * Maneja la internacionalización con next-intl patterns
 */
function handleI18n(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const { locale, pathWithoutLocale } = extractLocaleFromPath(pathname);

  // Si ya tiene un locale válido, continuar
  if (locale) {
    return null;
  }

  // Detectar idioma preferido
  const acceptLanguage = request.headers.get("accept-language") || "";
  const preferredLocale = detectPreferredLocale(acceptLanguage);

  // Si es el idioma por defecto y está en la raíz, no redirigir
  if (pathname === "/" && preferredLocale === MIDDLEWARE_CONFIG.defaultLocale) {
    return NextResponse.rewrite(
      new URL(`/${preferredLocale}${pathname}`, request.url),
    );
  }

  // Redirigir a la versión localizada
  return NextResponse.redirect(
    new URL(`/${preferredLocale}${pathname}`, request.url),
  );
}

/**
 * Middleware principal con NextAuth 5.0 integration
 */
export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // ==============================================
  // 🛡️ SECURITY CHECKS
  // ==============================================

  // Rate limiting - usa cookie firmada si es válida; si no, headers
  const secret = process.env.INTERNAL_API_SECRET || "";
  const signed = await verifySignedIpCookie(
    request.cookies.get(CLIENT_IP_COOKIE)?.value,
    secret,
  );
  const headerIp = getClientIPOrdered(request) || "unknown";
  const clientIP = signed?.ip || headerIp;

  if (!checkRateLimit(clientIP)) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": "900", // 15 minutos
          ...MIDDLEWARE_CONFIG.securityHeaders,
        },
      },
    );
  }

  // Verificar headers maliciosos
  const suspiciousHeaders = ["x-middleware-subrequest"];
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      console.warn(`🚨 Blocked malicious header: ${header} from ${clientIP}`);
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403, headers: MIDDLEWARE_CONFIG.securityHeaders },
      );
    }
  }

  // ==============================================
  // 🌍 INTERNATIONALIZATION
  // ==============================================

  if (shouldProcessPath(pathname)) {
    const i18nResponse = handleI18n(request);
    if (i18nResponse) {
      // Añadir headers de seguridad a las respuestas de i18n
      Object.entries(MIDDLEWARE_CONFIG.securityHeaders).forEach(
        ([key, value]) => {
          i18nResponse.headers.set(key, value);
        },
      );
      return i18nResponse;
    }
  }

  // ==============================================
  // 🔓 DASHBOARD ACCESS (NO AUTH REQUIRED)
  // ==============================================

  // Verificar rutas del dashboard
  const { locale } = extractLocaleFromPath(pathname);
  const currentLocale = locale || MIDDLEWARE_CONFIG.defaultLocale;

  const isDashboardPath = MIDDLEWARE_CONFIG.protectedPaths.some((path) =>
    pathname.startsWith(`/${currentLocale}${path}`),
  );

  // Permitir acceso directo al dashboard sin autenticación
  if (isDashboardPath) {
    console.log(`🔓 Allowing direct dashboard access: ${pathname}`);
    // No hacer nada, permitir que continúe sin autenticación
  }

  // ==============================================
  // 📊 TELEMETRY & RESPONSE
  // ==============================================

  const response = NextResponse.next();

  // Añadir headers de seguridad
  Object.entries(MIDDLEWARE_CONFIG.securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Establecer/renovar cookie firmada de IP si procede
  if (secret) {
    const currentIp = getClientIPOrdered(request);
    const shouldRefresh = !signed || (currentIp && signed.ip !== currentIp); // IP cambió o no hay cookie válida
    if (currentIp && !isPrivateOrReserved(currentIp) && shouldRefresh) {
      try {
        const token = await createSignedIpCookieValue(currentIp, secret);
        response.cookies.set(CLIENT_IP_COOKIE, token, {
          httpOnly: true,
          sameSite: "strict",
          secure: true,
          path: "/",
          maxAge: CLIENT_IP_TTL_SECONDS,
        });
      } catch (e) {
        // noop
      }
    }
  }

  // Headers de telemetría para monitoreo
  response.headers.set("X-Middleware-Duration", `${Date.now() - startTime}ms`);
  response.headers.set("X-Middleware-Version", "2.0");

  // Logging para producción (replace console.log with proper logging)
  if (process.env.NODE_ENV === "development") {
    console.log(`🔄 ${pathname} - ${Date.now() - startTime}ms - ${clientIP}`);
  }

  return response;
});

// ==============================================
// ⚙️ CONFIGURATION
// ==============================================

export const config = {
  // Matcher optimizado para Next.js 15
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/ (all next internals)
     * - _document (next pages document)
     * - favicon.ico (favicon file)
     * - Any file extension
     */
    "/((?!api|_next/.*|_document|favicon.ico|.*\\..*).*)",
  ],
};
