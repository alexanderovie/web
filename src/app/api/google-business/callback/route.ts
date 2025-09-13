import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el código de autorización de la URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json(
        { error: "Código de autorización no encontrado" },
        { status: 400 },
      );
    }

    // Intercambiar el código por tokens de acceso
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/google-business/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange error:", errorData);
      return NextResponse.json(
        { error: "Error al obtener tokens de acceso", details: errorData },
        { status: tokenResponse.status },
      );
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    // Inicializar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Obtener cuentas de negocio del usuario desde Google My Business API
    const response = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google My Business API Error:", errorData);
      return NextResponse.json(
        {
          error: "Error al conectar con Google My Business",
          details: errorData,
        },
        { status: response.status },
      );
    }

    const accountsData = await response.json();

    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron cuentas de negocio asociadas" },
        { status: 404 },
      );
    }

    // Calcular fecha de expiración
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Guardar tokens en Supabase
    const { error: tokenError } = await supabase
      .from("google_business_tokens")
      .upsert(
        {
          user_id: session.user.email,
          access_token: access_token,
          refresh_token: refresh_token || null,
          expires_at: expiresAt.toISOString(),
          business_account_id: accountsData.accounts[0]?.name,
          business_name: accountsData.accounts[0]?.accountName || "Mi Negocio",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      );

    if (tokenError) {
      console.error("Supabase Error:", tokenError);
      return NextResponse.json(
        { error: "Error al guardar tokens en la base de datos" },
        { status: 500 },
      );
    }

    // Redirigir al usuario de vuelta a la página GBP
    return NextResponse.redirect(
      new URL("/es/dashboard/gbp?connected=true", request.url),
    );
  } catch (error) {
    console.error("Error in Google Business callback:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
