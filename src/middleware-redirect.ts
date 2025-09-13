import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// URL del dashboard elite
const DASHBOARD_ELITE_URL = "https://dashboard.fascinantedigital.com";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detectar rutas del dashboard interno
  const isDashboardRoute = pathname.includes("/dashboard");

  if (isDashboardRoute) {
    // Construir URL de redirección al dashboard elite
    const redirectUrl = new URL(pathname, DASHBOARD_ELITE_URL);

    // Preservar parámetros de consulta
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    // Redireccionar al dashboard elite
    return NextResponse.redirect(redirectUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
