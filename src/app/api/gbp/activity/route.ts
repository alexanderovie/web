import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No access token found. Please authenticate with Google first.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get("location");

    if (!locationName) {
      return NextResponse.json(
        { success: false, error: "Location parameter is required" },
        { status: 400 },
      );
    }

    console.log("GBP Activity API - Session user email:", session.user?.email);
    console.log(
      "GBP Activity API - Access token present:",
      !!session.user?.accessToken,
    );
    console.log("GBP Activity API - Location name:", locationName);

    // Nota: Google Business Profile API no proporciona actividad directamente
    // La actividad se obtiene a través de Google My Business API que requiere permisos adicionales
    // Por ahora, devolvemos un mensaje informativo
    return NextResponse.json({
      success: true,
      data: [],
      message:
        "La actividad no está disponible actualmente. Se requieren permisos adicionales de Google My Business API.",
    });
  } catch (error) {
    console.error("Error in GBP activity API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
