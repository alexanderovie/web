import { NextRequest, NextResponse } from "next/server";
import { upsertHubspotContact } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  try {
    const { phone, message } = await req.json();

    // Validate input
    if (!phone || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone and message are required",
        },
        { status: 400 },
      );
    }

    console.log("🧪 Probando upsert de contacto en HubSpot:", {
      phone,
      message,
    });

    // Test upsert function
    const result = await upsertHubspotContact({ phone, message });

    return NextResponse.json({
      success: result.success,
      data: {
        action: result.action,
        contactId: result.contactId,
        error: result.error,
      },
      message: result.success
        ? `Contacto ${result.action} exitosamente`
        : `Error: ${result.error}`,
    });
  } catch (error) {
    console.error("❌ Error en prueba de upsert:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        message: "Error en prueba de upsert",
      },
      { status: 500 },
    );
  }
}
