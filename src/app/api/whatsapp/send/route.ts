import { NextRequest, NextResponse } from "next/server";

import { sendWhatsAppMessage } from "@/lib/whatsapp-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Missing required fields: to, message" },
        { status: 400 },
      );
    }

    // Validar formato del número de teléfono
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanPhone = to.replace(/\D/g, "");

    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 },
      );
    }

    // Enviar mensaje usando Meta WhatsApp API
    const result = await sendWhatsAppMessage(cleanPhone, message);

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
