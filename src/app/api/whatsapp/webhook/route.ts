// Este endpoint maneja la verificación de Meta y los mensajes entrantes
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  generateGeminiResponseWithContext,
  isGeminiAvailable,
} from "@/lib/gemini-client";
import { sendWhatsAppMessage } from "@/lib/whatsapp-client";
import { upsertHubspotContact } from "@/lib/hubspot";
import { ConversationManager } from "@/lib/conversation-manager";

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Función para guardar mensaje en Supabase
async function saveWhatsAppMessage(message: any) {
  try {
    const { data, error } = await supabase.from("whatsapp_messages").insert({
      phone: message.from,
      message: message.text?.body || "Sin texto",
      from: "user", // Identificar como mensaje del usuario
      created_at: new Date().toISOString(),
      session_id: `session_${message.from}_${Date.now()}`, // Agregar session_id
    });

    if (error) {
      console.error("❌ Error guardando mensaje en Supabase:", error);
      return false;
    }

    console.log("✅ Mensaje guardado en Supabase:", data);
    return true;
  } catch (error) {
    console.error("❌ Error en saveWhatsAppMessage:", error);
    return false;
  }
}

// Función para guardar respuesta de AI en Supabase
async function saveAIResponse(phone: string, response: string) {
  try {
    const { data, error } = await supabase.from("whatsapp_messages").insert({
      phone: phone,
      message: response,
      from: "ai", // Identificar como respuesta de AI
      created_at: new Date().toISOString(),
      session_id: `session_${phone}_${Date.now()}`, // Agregar session_id
    });

    if (error) {
      console.error("❌ Error guardando respuesta de AI en Supabase:", error);
      return false;
    }

    console.log("✅ Respuesta de AI guardada en Supabase:", data);
    return true;
  } catch (error) {
    console.error("❌ Error en saveAIResponse:", error);
    return false;
  }
}

// Función para guardar información del usuario en HubSpot
async function saveUserInfoToHubSpot(
  phone: string,
  userInfo: any,
  currentMessage?: string,
) {
  console.log("🚀🚀🚀 INICIANDO saveUserInfoToHubSpot con:", {
    phone,
    userInfo,
    currentMessage,
  });

  try {
    // Extraer email del mensaje actual si no está en userInfo
    let email = userInfo.email;
    if (!email && currentMessage) {
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = currentMessage.match(emailPattern);
      if (matches && matches.length > 0) {
        email = matches[0];
        console.log("📧 Email detectado en mensaje actual:", email);
      }
    }

    // Extraer nombre del mensaje actual si no está en userInfo
    let name = userInfo.name;
    if (!name && currentMessage) {
      const namePatterns = [
        /me llamo\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
        /soy\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
        /mi nombre es\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
        /no me llamo\s+[^,]+,\s+me llamo\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
      ];

      for (const pattern of namePatterns) {
        const match = currentMessage.match(pattern);
        if (match && match[1]) {
          name = match[1].trim();
          console.log("👤 Nombre detectado en mensaje actual:", name);
          break;
        }
      }
    }

    if (!name && !email) {
      console.log("📝 No hay información del usuario para guardar");
      return;
    }

    console.log("📝 Guardando información del usuario en HubSpot:", {
      name,
      email,
      phone,
    });

    const contactData = {
      properties: {
        phone: phone,
        ...(name && { firstname: name }),
        ...(email && { email: email }),
        ...(userInfo.businessType && { company: userInfo.businessType }),
        ...(userInfo.location && { city: userInfo.location }),
        lifecyclestage: "lead",
        hs_lead_status: "NEW",
      },
    };

    console.log("📤 Datos a enviar a HubSpot:", contactData);

    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUBSPOT_PRIVATE_APP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      },
    );

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Información del usuario guardada en HubSpot:", result);
      return result;
    } else {
      const error = await response.text();
      console.error("❌ Error guardando en HubSpot:", error);
    }
  } catch (error) {
    console.error("❌ Error en saveUserInfoToHubSpot:", error);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  console.log("🔍 Verificación de webhook:", { mode, token, challenge });

  // Usar variable de entorno para el token de verificación
  const verifyToken =
    process.env.WEBHOOK_VERIFY_TOKEN || "fascinante-token-2025";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ Verificación exitosa");
    return new NextResponse(challenge, { status: 200 });
  }

  console.log("❌ Verificación fallida");
  return new NextResponse("Forbidden", { status: 403 });
}

// Cache para prevenir respuestas duplicadas
const processedMessages = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Iniciando procesamiento de webhook POST...");

    // Verificar configuración
    console.log("🔧 Verificando configuración:");
    console.log(
      "  - GEMINI_API_KEY:",
      process.env.GEMINI_API_KEY ? "✅ Configurada" : "❌ No configurada",
    );
    console.log(
      "  - WHATSAPP_ACCESS_TOKEN:",
      process.env.WHATSAPP_ACCESS_TOKEN
        ? "✅ Configurada"
        : "❌ No configurada",
    );
    console.log(
      "  - META_PHONE_NUMBER_ID:",
      process.env.META_PHONE_NUMBER_ID ? "✅ Configurada" : "❌ No configurada",
    );
    console.log(
      "  - HUBSPOT_PRIVATE_APP_TOKEN:",
      process.env.HUBSPOT_PRIVATE_APP_TOKEN
        ? "✅ Configurada"
        : "❌ No configurada",
    );

    // Parsear el cuerpo de la petición como JSON con manejo de errores
    let body;
    try {
      const rawBody = await req.text();
      console.log("📥 Raw body recibido:", rawBody.substring(0, 200) + "...");

      // Attempt to clean JSON before parsing
      const cleanedBody = rawBody
        .replace(/\r?\n/g, "")
        .replace(/\t/g, "")
        .trim();

      console.log("📥 Body limpiado:", cleanedBody.substring(0, 200) + "...");

      body = JSON.parse(cleanedBody);
      console.log("📥 Body parseado correctamente");
      console.log("📥 Body keys:", Object.keys(body));
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError);
      return NextResponse.json(
        {
          status: "error",
          message: "Error parseando JSON",
        },
        { status: 400 },
      );
    }

    // Verificar que es un mensaje válido de WhatsApp Business API
    if (body.object === "whatsapp_business_account") {
      console.log("✅ Mensaje válido de WhatsApp Business API");

      // Procesar cada entrada
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value.messaging_product === "whatsapp") {
            for (const message of change.value.messages || []) {
              // Verificar si ya procesamos este mensaje
              const messageId = message.id;
              if (processedMessages.has(messageId)) {
                console.log("⚠️ Mensaje ya procesado:", messageId);
                continue;
              }

              // Agregar a mensajes procesados
              processedMessages.add(messageId);

              // Limpiar cache si es muy grande
              if (processedMessages.size > 1000) {
                processedMessages.clear();
                console.log("🧹 Cache de mensajes procesados limpiado");
              }

              console.log("💬 Procesando mensaje:", {
                from: message.from,
                type: message.type,
                timestamp: message.timestamp,
                text: message.text?.body,
                messageId: messageId,
              });

              // Guardar mensaje en Supabase
              const saved = await saveWhatsAppMessage(message);
              if (saved) {
                console.log("✅ Mensaje guardado en base de datos");

                // 🎯 INTEGRACIÓN CON HUBSPOT CRM
                try {
                  console.log("🎯 Integrando con HubSpot CRM...");
                  await upsertHubspotContact({
                    phone: message.from,
                    message: message.text?.body || "",
                  });
                  console.log("✅ Integración con HubSpot completada");
                } catch (hubspotError) {
                  console.error(
                    "❌ Error en integración con HubSpot:",
                    hubspotError,
                  );
                  // No fallamos el webhook por errores de HubSpot
                }
              }

              // 🤖 RESPUESTA INTELIGENTE CON GEMINI (MEJORADA)
              if (message.type === "text" || message.type === "interactive") {
                let userMessage = "";

                // Extraer mensaje según el tipo
                if (message.type === "text") {
                  userMessage = message.text.body;
                } else if (
                  message.type === "interactive" &&
                  message.interactive
                ) {
                  // Manejar respuestas de botones interactivos
                  if (message.interactive.type === "button_reply") {
                    const buttonId = message.interactive.button_reply.id;
                    const buttonTitle = message.interactive.button_reply.title;
                    userMessage = `[BOTÓN: ${buttonTitle}] (ID: ${buttonId})`;

                    console.log("🔘 Botón presionado:", {
                      id: buttonId,
                      title: buttonTitle,
                      userMessage,
                    });

                    // Respuestas específicas para botones
                    let buttonResponse = "";
                    switch (buttonId) {
                      case "web-development":
                        buttonResponse =
                          "🌐 ¡Perfecto! Te ayudo con desarrollo web. ¿Qué tipo de sitio necesitas? (E-commerce, landing page, blog, etc.)";
                        break;
                      case "seo-marketing":
                        buttonResponse =
                          "📈 ¡Excelente elección! SEO y marketing digital. ¿Ya tienes sitio web o necesitas uno nuevo?";
                        break;
                      case "ppc-ads":
                        buttonResponse =
                          "💰 ¡Genial! Publicidad PPC (Google Ads, Facebook Ads). ¿En qué industria estás?";
                        break;
                      case "call-now":
                        buttonResponse =
                          "📞 ¡Perfecto! Te llamo ahora al (800) 886-4981. ¿En qué horario prefieres?";
                        break;
                      case "send-info":
                        buttonResponse =
                          "📧 Te envío información por email. ¿Cuál es tu correo electrónico?";
                        break;
                      case "schedule-call":
                        buttonResponse =
                          "📅 ¡Perfecto! Agendemos una llamada. ¿Qué día y hora te funciona mejor?";
                        break;
                      case "basic-plan":
                        buttonResponse =
                          "🚀 Plan Básico desde $500. Incluye sitio web responsive y SEO básico. ¿Te interesa?";
                        break;
                      case "premium-plan":
                        buttonResponse =
                          "⭐ Plan Premium desde $1,500. Incluye todo + PPC y marketing completo. ¿Quieres más detalles?";
                        break;
                      case "custom-quote":
                        buttonResponse =
                          "💼 ¡Perfecto! Para cotización personalizada necesito saber más. ¿Qué tipo de negocio tienes?";
                        break;
                      default:
                        buttonResponse =
                          "¡Gracias por tu interés! ¿En qué más te puedo ayudar?";
                    }

                    // Enviar respuesta específica del botón
                    try {
                      console.log(
                        "🔘 Enviando respuesta de botón:",
                        buttonResponse,
                      );
                      await sendWhatsAppMessage(message.from, buttonResponse);
                      await saveAIResponse(message.from, buttonResponse);
                      continue; // Saltar el procesamiento normal de IA
                    } catch (error) {
                      console.error(
                        "❌ Error enviando respuesta de botón:",
                        error,
                      );
                    }
                  }
                }

                // Si no es un botón interactivo, usar el mensaje de texto normal
                if (message.type === "text") {
                  userMessage = message.text.body;
                }
                let response = "";

                // Check if Gemini is available
                if (isGeminiAvailable()) {
                  console.log("🤖 Usando Gemini para respuesta inteligente");

                  // 🆕 USAR NUEVO SISTEMA DE CONVERSACIÓN
                  const conversationManager = ConversationManager.getInstance();

                  // Obtener mensajes agrupados y contexto
                  const groupedMessages =
                    await conversationManager.groupUserMessages(message.from);

                  // Obtener contexto de conversación (no usado actualmente)
                  // const conversationContext =
                  //   await conversationManager.getConversationContext(
                  //     message.from,
                  //   );

                  // Obtener resumen contextual con información del usuario
                  const conversationSummary =
                    await conversationManager.getConversationSummary(
                      message.from,
                    );

                  console.log(
                    "🎯 Intención detectada:",
                    groupedMessages.intent,
                  );
                  console.log(
                    "📝 Mensajes agrupados:",
                    groupedMessages.messages,
                  );
                  console.log(
                    "👤 Información del usuario:",
                    conversationSummary.userInfo,
                  );

                  // Guardar información del usuario en HubSpot si se detecta
                  console.log("🔍 Verificando si guardar en HubSpot...");
                  console.log(
                    "🔍 conversationSummary.userInfo:",
                    conversationSummary.userInfo,
                  );
                  console.log(
                    "🔍 conversationSummary.userInfo.name:",
                    conversationSummary.userInfo?.name,
                  );
                  console.log(
                    "🔍 conversationSummary.userInfo.email:",
                    conversationSummary.userInfo?.email,
                  );

                  if (
                    conversationSummary.userInfo &&
                    (conversationSummary.userInfo.name ||
                      conversationSummary.userInfo.email)
                  ) {
                    console.log(
                      "🔍 Llamando a saveUserInfoToHubSpot con userInfo:",
                      conversationSummary.userInfo,
                    );
                    await saveUserInfoToHubSpot(
                      message.from,
                      conversationSummary.userInfo,
                      userMessage,
                    );
                  } else {
                    console.log(
                      "🔍 NO se llama a saveUserInfoToHubSpot - condición no cumplida",
                    );
                  }

                  // También guardar si el mensaje actual contiene un email
                  const emailPattern =
                    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                  const emailMatch = userMessage.match(emailPattern);
                  if (emailMatch && emailMatch.length > 0) {
                    console.log(
                      "📧 Email detectado en mensaje actual:",
                      emailMatch[0],
                    );
                    console.log(
                      "🔍 Llamando a saveUserInfoToHubSpot con email del mensaje actual",
                    );
                    await saveUserInfoToHubSpot(message.from, {}, userMessage);
                  } else {
                    console.log("🔍 NO se detectó email en mensaje actual");
                  }

                  // Solo responder si es apropiado
                  if (groupedMessages.shouldRespond) {
                    // Usar respuesta contextual mejorada con información del usuario
                    response = await generateGeminiResponseWithContext(
                      userMessage,
                      conversationSummary.context,
                      conversationSummary.messageCount,
                      conversationSummary.lastIntent,
                      conversationSummary.userInfo,
                    );

                    // Actualizar estado de conversación
                    await conversationManager.updateConversationState(
                      message.from,
                      {
                        state: "INTERACTUANDO",
                        last_user_message: userMessage,
                        last_ai_response: response,
                        message_count: conversationSummary.messageCount + 1,
                      },
                    );
                  } else {
                    console.log(
                      "⏳ Esperando más mensajes antes de responder...",
                    );
                    // No responder aún, esperar más mensajes
                    continue;
                  }
                } else {
                  console.log(
                    "🤖 Usando respuestas preestablecidas (Gemini no disponible)",
                  );

                  // Fallback pre-established response logic (more concise)
                  const lowerMessage = userMessage.toLowerCase();
                  if (
                    lowerMessage.includes("hola") ||
                    lowerMessage.includes("hello")
                  ) {
                    response =
                      "¡Hola! 👋 ¿En qué te puedo ayudar? Visita fascinantedigital.com";
                  } else if (
                    lowerMessage.includes("servicios") ||
                    lowerMessage.includes("services")
                  ) {
                    response =
                      "Ofrecemos desarrollo web y marketing digital. ¿Te interesa alguno? 🚀";
                  } else if (
                    lowerMessage.includes("precio") ||
                    lowerMessage.includes("price") ||
                    lowerMessage.includes("costo")
                  ) {
                    response =
                      "Nuestros precios varían según el proyecto. ¿Qué necesitas? 💰";
                  } else if (
                    lowerMessage.includes("contacto") ||
                    lowerMessage.includes("contact")
                  ) {
                    response =
                      "Puedes contactarnos por aquí mismo o visitar fascinantedigital.com";
                  } else {
                    response =
                      "¡Gracias por tu mensaje! 📱 Un equipo te contactará pronto. Visita fascinantedigital.com";
                  }
                }

                try {
                  console.log("🤖 Enviando respuesta:", response);
                  await sendWhatsAppMessage(message.from, response);
                  console.log("✅ Respuesta enviada exitosamente");

                  // Guardar respuesta de AI en Supabase
                  await saveAIResponse(message.from, response);
                } catch (error) {
                  console.error("❌ Error enviando respuesta:", error);
                }
              }

              // Production: Message handling optimized
            }
          }
        }
      }

      // Responder a Meta que el webhook fue procesado correctamente
      return NextResponse.json({
        status: "ok",
        message: "Webhook procesado exitosamente",
      });
    } else {
      console.log("⚠️ Objeto no reconocido:", body.object);
      return NextResponse.json(
        {
          status: "error",
          message: "Objeto no reconocido",
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("❌ Error procesando webhook:", error);
    console.error(
      "❌ Stack trace:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return NextResponse.json(
      {
        status: "error",
        message: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}
