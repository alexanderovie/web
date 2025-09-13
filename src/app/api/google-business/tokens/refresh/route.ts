import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Inicializar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Obtener token actual del usuario
    const { data: tokenData, error: tokenError } = await supabase
      .from("google_business_tokens")
      .select("*")
      .eq("user_id", session.user.email)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "No se encontró token para refrescar" },
        { status: 404 },
      );
    }

    if (!tokenData.refresh_token) {
      return NextResponse.json(
        { error: "No hay refresh token disponible" },
        { status: 400 },
      );
    }

    // Refrescar el token usando Google OAuth
    const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: tokenData.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.json();
      console.error("Error refreshing token:", errorData);
      return NextResponse.json(
        { error: "Error al refrescar el token con Google" },
        { status: 400 },
      );
    }

    const refreshData = await refreshResponse.json();

    // Calcular nueva fecha de expiración
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + (refreshData.expires_in || 3600),
    );

    // Actualizar token en Supabase
    const { error: updateError } = await supabase
      .from("google_business_tokens")
      .update({
        access_token: refreshData.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.email);

    if (updateError) {
      return NextResponse.json(
        { error: "Error al actualizar token en la base de datos" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token refrescado correctamente",
      expires_at: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error in POST /api/google-business/tokens/refresh:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
