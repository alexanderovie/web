import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Función para enviar mensaje por WhatsApp Business API
async function sendWhatsAppMessage(to: string, message: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp credentials not configured");
  }

  const response = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: {
          body: message,
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`WhatsApp API error: ${error}`);
  }

  return await response.json();
}

// Función para guardar mensaje enviado en Supabase
async function saveSentMessage(to: string, message: string) {
  try {
    const { data, error } = await supabase.from("whatsapp_messages").insert({
      phone: to,
      message: message,
      created_at: new Date().toISOString(),
      direction: "outbound", // Para distinguir mensajes enviados
    });

    if (error) {
      console.error("❌ Error guardando mensaje enviado:", error);
      return false;
    }

    console.log("✅ Mensaje enviado guardado en Supabase:", data);
    return true;
  } catch (error) {
    console.error("❌ Error en saveSentMessage:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: to, message" },
        { status: 400 },
      );
    }

    if (typeof to !== "string" || typeof message !== "string") {
      return NextResponse.json(
        { success: false, error: "All fields must be strings" },
        { status: 400 },
      );
    }

    if (!to.trim() || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "All fields must not be empty" },
        { status: 400 },
      );
    }

    console.log("📤 Enviando mensaje:", { to, message });

    // Enviar mensaje por WhatsApp
    const result = await sendWhatsAppMessage(to, message);
    console.log("✅ Mensaje enviado exitosamente:", result);

    // Guardar mensaje enviado en Supabase
    const saved = await saveSentMessage(to, message);
    if (saved) {
      console.log("✅ Mensaje enviado guardado en base de datos");
    } else {
      console.log("❌ Error guardando mensaje enviado en base de datos");
    }

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      saved: saved,
    });
  } catch (error) {
    console.error("❌ Error enviando mensaje:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
