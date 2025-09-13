import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
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

    // Obtener token del usuario
    const { data: tokenData, error: tokenError } = await supabase
      .from("google_business_tokens")
      .select("*")
      .eq("user_id", session.user.email)
      .single();

    if (tokenError) {
      if (tokenError.code === "PGRST116") {
        // No se encontró token
        return NextResponse.json({ token: null }, { status: 200 });
      }
      return NextResponse.json(
        { error: "Error al obtener token" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token: tokenData,
    });
  } catch (error) {
    console.error("Error in GET /api/google-business/tokens:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Eliminar token del usuario
    const { error: deleteError } = await supabase
      .from("google_business_tokens")
      .delete()
      .eq("user_id", session.user.email);

    if (deleteError) {
      return NextResponse.json(
        { error: "Error al eliminar token" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token eliminado correctamente",
    });
  } catch (error) {
    console.error("Error in DELETE /api/google-business/tokens:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
