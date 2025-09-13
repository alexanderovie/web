import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario esté autenticado
    const session = await auth();
    if (!session?.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Construir URL de autorización de Google OAuth
    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth",
    );

    const scopes = [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/business.manage",
      "https://www.googleapis.com/auth/plus.business.manage",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/google-business/callback`,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
      state: session.user.id || "default", // Usar ID del usuario como state
    });

    googleAuthUrl.search = params.toString();

    // Redirigir al usuario a Google OAuth
    return NextResponse.redirect(googleAuthUrl.toString());
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.redirect(
      new URL("/es/dashboard/gbp?error=auth_failed", request.url),
    );
  }
}
