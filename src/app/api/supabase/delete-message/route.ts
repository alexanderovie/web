import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    // Validate input
    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required",
        },
        { status: 400 },
      );
    }

    console.log("🗑️ Eliminando mensajes de Supabase para teléfono:", phone);

    // Delete messages from Supabase
    const { data, error } = await supabase
      .from("whatsapp_messages")
      .delete()
      .eq("phone", phone);

    if (error) {
      console.error("❌ Error eliminando mensajes de Supabase:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      );
    }

    console.log("✅ Mensajes eliminados de Supabase:", data);

    return NextResponse.json({
      success: true,
      data: {
        phone,
        deletedCount: 0, // Supabase delete returns null, so we can't get the count
      },
    });
  } catch (error) {
    console.error("❌ Error en endpoint delete-message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
