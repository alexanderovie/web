import { NextRequest, NextResponse } from "next/server";

import {
  sendWhatsAppInteractiveMessage,
  sendServicesButtonsMessage,
  sendContactButtonsMessage,
  sendPricingButtonsMessage,
} from "@/lib/whatsapp-client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, messageType, customMessage } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Missing required field: to" },
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

    let result;

    // Enviar mensaje según el tipo
    switch (messageType) {
      case "services":
        result = await sendServicesButtonsMessage(cleanPhone);
        break;
      case "contact":
        result = await sendContactButtonsMessage(cleanPhone);
        break;
      case "pricing":
        result = await sendPricingButtonsMessage(cleanPhone);
        break;
      case "custom":
        if (!customMessage) {
          return NextResponse.json(
            { error: "Missing customMessage for custom type" },
            { status: 400 },
          );
        }
        result = await sendWhatsAppInteractiveMessage(
          cleanPhone,
          customMessage,
        );
        break;
      default:
        return NextResponse.json(
          {
            error:
              "Invalid messageType. Use: services, contact, pricing, or custom",
          },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messages?.[0]?.id,
      timestamp: new Date().toISOString(),
      messageType,
    });
  } catch (error) {
    console.error("Error sending interactive WhatsApp message:", error);
    return NextResponse.json(
      { error: "Failed to send interactive message" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
