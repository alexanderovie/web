import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener tokens de la sesión
    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No hay token de acceso disponible" },
        { status: 400 },
      );
    }

    // Probar conexión con GTM API
    const gtmResponse = await fetch(
      "https://www.googleapis.com/tagmanager/v2/accounts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!gtmResponse.ok) {
      return NextResponse.json(
        { error: "Error al conectar con GTM API" },
        { status: gtmResponse.status },
      );
    }

    const gtmData = await gtmResponse.json();

    // Guardar información de conexión en la base de datos
    // Aquí podrías guardar los tokens en tu base de datos

    return NextResponse.json({
      success: true,
      message: "GTM conectado exitosamente",
      accounts: gtmData.account || [],
    });
  } catch (error) {
    console.error("Error conectando GTM:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const accessToken = (session as any).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No hay token de acceso disponible" },
        { status: 400 },
      );
    }

    // Obtener información de GTM
    const gtmResponse = await fetch(
      "https://www.googleapis.com/tagmanager/v2/accounts",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!gtmResponse.ok) {
      return NextResponse.json(
        { error: "Error al obtener datos de GTM" },
        { status: gtmResponse.status },
      );
    }

    const gtmData = await gtmResponse.json();

    return NextResponse.json({
      success: true,
      connected: true,
      accounts: gtmData.account || [],
    });
  } catch (error) {
    console.error("Error obteniendo datos de GTM:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
