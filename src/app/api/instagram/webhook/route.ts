import { NextRequest, NextResponse } from "next/server";

import { generateGeminiResponse } from "@/lib/gemini-client";

// Verificar token de Instagram
const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_PAGE_ID = process.env.INSTAGRAM_PAGE_ID;

// Validar configuración
if (!INSTAGRAM_VERIFY_TOKEN || !INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_PAGE_ID) {
  console.error("❌ Variables de entorno de Instagram no configuradas");
}

// Handler GET para validación del webhook
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Validar modo y token
    if (mode === "subscribe" && token === INSTAGRAM_VERIFY_TOKEN) {
      console.log("✅ Webhook de Instagram validado correctamente");
      return new NextResponse(challenge, { status: 200 });
    }

    console.error("❌ Validación del webhook de Instagram fallida");
    return new NextResponse("Forbidden", { status: 403 });
  } catch (error) {
    console.error("❌ Error en validación del webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Handler POST para recibir mensajes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(
      "📨 Mensaje recibido de Instagram:",
      JSON.stringify(body, null, 2),
    );

    // Verificar que sea un mensaje válido
    if (!body.entry || !Array.isArray(body.entry)) {
      console.log("⚠️ Formato de mensaje no válido");
      return new NextResponse("OK", { status: 200 });
    }

    // Procesar cada entrada
    for (const entry of body.entry) {
      if (entry.messaging) {
        for (const messaging of entry.messaging) {
          await processInstagramMessage(messaging);
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("❌ Error procesando mensaje de Instagram:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Procesar mensaje individual de Instagram
async function processInstagramMessage(messaging: any) {
  try {
    const { sender, message, postback } = messaging;
    const senderId = sender.id;

    // Extraer texto del mensaje
    let userMessage = "";

    if (message && message.text) {
      userMessage = message.text;
    } else if (postback && postback.payload) {
      userMessage = postback.payload;
    } else {
      console.log("⚠️ Mensaje sin texto válido");
      return;
    }

    console.log(`💬 Mensaje de ${senderId}: ${userMessage}`);

    // Generar respuesta con Gemini
    const aiResponse = await generateGeminiResponse(userMessage);
    console.log(`🤖 Respuesta de Gemini: ${aiResponse}`);

    // Enviar respuesta a Instagram
    await sendInstagramMessage(senderId, aiResponse);
  } catch (error) {
    console.error("❌ Error procesando mensaje individual:", error);
  }
}

// Enviar mensaje a Instagram
async function sendInstagramMessage(recipientId: string, message: string) {
  try {
    // Verificar si tenemos Instagram Business Account
    if (!INSTAGRAM_PAGE_ID || INSTAGRAM_PAGE_ID === "1244801866905678") {
      console.log(
        "⚠️ No se puede enviar mensaje: Instagram Business Account no configurado",
      );
      console.log("💡 Para enviar mensajes necesitas:");
      console.log("   1. Crear una página de Facebook");
      console.log("   2. Conectar un Instagram Business Account");
      console.log("   3. Actualizar INSTAGRAM_PAGE_ID con el ID correcto");
      return;
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_PAGE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Error enviando mensaje a Instagram:", errorData);

      // Manejar errores específicos
      if (
        errorData.includes("Object with ID") &&
        errorData.includes("does not exist")
      ) {
        console.log(
          "💡 Solución: Verifica que el INSTAGRAM_PAGE_ID sea correcto",
        );
        console.log("💡 Ejecuta: node scripts/verify-instagram-setup.js");
      }
      return;
    }

    const result = await response.json();
    console.log("✅ Mensaje enviado a Instagram:", result);
  } catch (error) {
    console.error("❌ Error en envío a Instagram:", error);
  }
}
