/**
 * 🚀 ELITE Facebook Messenger Webhook - Next.js 15 App Router
 *
 * Implementación moderna siguiendo las mejores prácticas de Next.js 15:
 * - Route Handlers con Web Request/Response APIs
 * - Validación de webhook signature obligatoria
 * - Rate limiting y DDoS protection
 * - Manejo robusto de errores
 * - Type safety completo con TypeScript
 * - Logging estructurado para monitoreo
 */

import { type NextRequest } from "next/server";
import {
  messengerClient,
  MessengerUtils,
  type MessengerWebhookEvent,
  type MessengerMessage,
  type MessengerPostback,
  type MessengerReferral,
} from "@/lib/messenger-client";
import {
  generateGeminiResponseWithContext,
  isGeminiAvailable,
} from "@/lib/gemini-client";
import { ConversationManager } from "@/lib/conversation-manager";
import { upsertHubspotContact } from "@/lib/hubspot";

// 🔧 Configuración Elite según mejores prácticas de Next.js
const WEBHOOK_CONFIG = {
  MAX_PAYLOAD_SIZE: 1024 * 1024, // 1MB
  RATE_LIMIT_WINDOW: 60000, // 1 minuto
  RATE_LIMIT_MAX_REQUESTS: 1000, // requests por minuto por IP
  MESSAGE_PROCESSING_TIMEOUT: 30000, // 30 segundos
  DUPLICATE_WINDOW: 300000, // 5 minutos para detección de duplicados
  AUTO_RESPONSE_DELAY: 1000, // 1 segundo de delay para parecer más humano
} as const;

// 🏗️ Rate Limiter por IP usando Map (recomendado para Edge Runtime)
const ipRateLimiter = new Map<string, { count: number; resetTime: number }>();

// 💾 Cache de mensajes procesados (para evitar duplicados)
const processedMessages = new Set<string>();

// 🧹 Limpieza automática del cache
setInterval(() => {
  processedMessages.clear();
  console.log("🧹 Cache de mensajes duplicados limpiado");
}, WEBHOOK_CONFIG.DUPLICATE_WINDOW);

// 🛡️ Rate Limiting Elite por IP
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = ipRateLimiter.get(clientIP);

  if (!record || now > record.resetTime) {
    ipRateLimiter.set(clientIP, {
      count: 1,
      resetTime: now + WEBHOOK_CONFIG.RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= WEBHOOK_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
    console.warn(`🚨 Rate limit excedido para IP: ${clientIP}`);
    return false;
  }

  record.count++;
  return true;
}

// 🔍 Obtener IP real del cliente usando NextRequest
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = forwarded?.split(",")[0] || realIP || "unknown";
  return clientIP.trim();
}

// ✅ GET - Verificación de Webhook Elite (siguiendo patrón de Next.js docs)
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("🔍 Verificación de webhook de Messenger iniciada");

    // Usar NextRequest.nextUrl para acceder a searchParams (mejor práctica)
    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Logging estructurado para debugging
    console.log("📋 Parámetros de verificación:", {
      mode,
      token: token ? "***provided***" : "missing",
      challenge: challenge ? "***provided***" : "missing",
    });

    // Validaciones Elite
    if (!mode || !token || !challenge) {
      console.error("❌ Parámetros de verificación incompletos");
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const expectedToken = process.env.FACEBOOK_VERIFY_TOKEN;
    if (!expectedToken) {
      console.error("❌ FACEBOOK_VERIFY_TOKEN no configurado");
      return Response.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (mode === "subscribe" && token === expectedToken) {
      console.log("✅ Verificación de webhook exitosa");
      console.log(`⏱️ Tiempo de respuesta: ${Date.now() - startTime}ms`);

      // Usar Response constructor directamente (mejor práctica Next.js 15)
      return new Response(challenge, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }

    console.error("❌ Token de verificación inválido");
    return Response.json({ error: "Forbidden" }, { status: 403 });
  } catch (error: any) {
    console.error("❌ Error en verificación de webhook:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 📨 POST - Procesamiento Elite de Mensajes (patrón recomendado)
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIP = getClientIP(request);

  try {
    console.log(`📥 Webhook POST recibido de IP: ${clientIP}`);

    // 🛡️ Rate Limiting por IP
    if (!checkRateLimit(clientIP)) {
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    // 📏 Validar tamaño del payload usando headers
    const contentLength = request.headers.get("content-length");
    if (
      contentLength &&
      parseInt(contentLength) > WEBHOOK_CONFIG.MAX_PAYLOAD_SIZE
    ) {
      console.error(`❌ Payload demasiado grande: ${contentLength} bytes`);
      return Response.json({ error: "Payload too large" }, { status: 413 });
    }

    // 🔒 Validar signature de Facebook usando request.text() (mejor práctica)
    const body = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (
      !signature ||
      !messengerClient.validateWebhookSignature(body, signature)
    ) {
      console.error("❌ SECURITY: Signature validation failed");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 📋 Parsear y validar payload
    let webhookEvent: MessengerWebhookEvent;
    try {
      webhookEvent = JSON.parse(body);
    } catch (parseError) {
      console.error("❌ Error parseando JSON:", parseError);
      return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Validar estructura del evento
    if (webhookEvent.object !== "page") {
      console.warn("⚠️ Evento no es de página:", webhookEvent.object);
      return Response.json({ message: "Event not from page" }, { status: 200 });
    }

    if (!webhookEvent.entry || !Array.isArray(webhookEvent.entry)) {
      console.error("❌ Estructura de evento inválida");
      return Response.json(
        { error: "Invalid event structure" },
        { status: 400 },
      );
    }

    console.log(
      `✅ Webhook validado. Procesando ${webhookEvent.entry.length} entradas`,
    );

    // 🚀 Procesar eventos en paralelo (optimización para alta escala)
    const processingPromises = webhookEvent.entry.flatMap(
      (entry) =>
        entry.messaging?.map((messagingEvent) =>
          processMessagingEvent(messagingEvent, entry.time),
        ) || [],
    );

    // Timeout para evitar hanging requests
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Processing timeout")),
        WEBHOOK_CONFIG.MESSAGE_PROCESSING_TIMEOUT,
      ),
    );

    try {
      await Promise.race([
        Promise.allSettled(processingPromises),
        timeoutPromise,
      ]);
    } catch (timeoutError) {
      console.error("⏰ Timeout procesando eventos:", timeoutError);
      // Continuar y responder 200 para evitar reintento de Facebook
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Webhook procesado en ${processingTime}ms`);

    // Facebook requiere respuesta 200 siempre (documentado en mejores prácticas)
    return Response.json(
      {
        status: "success",
        processed: processingPromises.length,
        processingTime,
      },
      { status: 200 },
    );
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Error en webhook (${processingTime}ms):`, error);

    // Logging estructurado para monitoring
    console.error("🚨 WEBHOOK ERROR DETAILS:", {
      error: error.message,
      stack: error.stack,
      clientIP,
      processingTime,
      timestamp: new Date().toISOString(),
    });

    // Siempre responder 200 para evitar reintento de Facebook
    return Response.json(
      { status: "error", message: "Internal error" },
      { status: 200 },
    );
  }
}

// ⚡ Procesar Evento de Mensajería Elite
async function processMessagingEvent(
  messagingEvent: any,
  entryTime: number,
): Promise<void> {
  const eventStartTime = Date.now();

  try {
    const psid = messagingEvent.sender?.id;
    const pageId = messagingEvent.recipient?.id;

    if (!psid || !pageId) {
      console.warn("⚠️ PSID o Page ID faltante en evento");
      return;
    }

    // Validar PSID
    if (!MessengerUtils.isValidPSID(psid)) {
      console.error("❌ PSID inválido:", psid);
      return;
    }

    console.log(`🔄 Procesando evento de ${psid} para página ${pageId}`);

    // 🔍 Detectar tipo de evento
    if (messagingEvent.message) {
      await processMessage(
        psid,
        messagingEvent.message,
        messagingEvent.timestamp,
      );
    } else if (messagingEvent.postback) {
      await processPostback(
        psid,
        messagingEvent.postback,
        messagingEvent.timestamp,
      );
    } else if (messagingEvent.delivery) {
      await processDelivery(psid, messagingEvent.delivery);
    } else if (messagingEvent.read) {
      await processRead(psid, messagingEvent.read);
    } else if (messagingEvent.referral) {
      await processReferral(
        psid,
        messagingEvent.referral,
        messagingEvent.timestamp,
      );
    } else {
      console.log(
        "ℹ️ Tipo de evento no manejado:",
        Object.keys(messagingEvent),
      );
    }

    const eventProcessingTime = Date.now() - eventStartTime;
    console.log(`✅ Evento procesado en ${eventProcessingTime}ms`);
  } catch (error: any) {
    console.error("❌ Error procesando evento de mensajería:", error);

    // Log estructurado para debugging
    console.error("🔍 Event details:", {
      messagingEvent,
      entryTime,
      error: error.message,
    });
  }
}

// 💬 Procesar Mensaje Elite
async function processMessage(
  psid: string,
  message: MessengerMessage,
  timestamp: number,
): Promise<void> {
  try {
    // 🔍 Detectar y prevenir duplicados
    const messageKey = `${psid}_${message.id || timestamp}_${message.text?.substring(0, 50)}`;
    if (processedMessages.has(messageKey)) {
      console.log("⚠️ Mensaje duplicado detectado, omitiendo");
      return;
    }
    processedMessages.add(messageKey);

    console.log(`💬 Procesando mensaje de ${psid}:`, {
      text: message.text?.substring(0, 100),
      hasAttachments: !!message.attachments?.length,
      hasQuickReply: !!message.quick_reply,
      timestamp: new Date(timestamp).toISOString(),
    });

    // 🔄 Echo detection (mensajes enviados por el bot)
    if ((message as any).is_echo) {
      console.log("🔄 Echo message detectado, omitiendo procesamiento");
      return;
    }

    // 💾 Guardar mensaje entrante
    await messengerClient.processInboundMessage(psid, message, timestamp);

    // 🤖 Generar y enviar respuesta automática
    await generateAndSendResponse(psid, message);

    // 📊 Integrar con HubSpot CRM (opcional)
    try {
      await upsertHubspotContact({
        phone: psid, // PSID de Facebook (no es teléfono real)
        message: message.text || "Mensaje de Messenger",
        source: "Messenger", // ✅ Identificar correctamente la fuente
      });
      console.log("✅ Contacto sincronizado con HubSpot");
    } catch (hubspotError) {
      console.error("❌ Error sincronizando con HubSpot:", hubspotError);
      // No fallar por errores de HubSpot
    }
  } catch (error: any) {
    console.error("❌ Error procesando mensaje:", error);
  }
}

// 🎯 Procesar Postback Elite
async function processPostback(
  psid: string,
  postback: MessengerPostback,
  timestamp: number,
): Promise<void> {
  try {
    console.log(`🎯 Procesando postback de ${psid}:`, {
      title: postback.title,
      payload: postback.payload,
      timestamp: new Date(timestamp).toISOString(),
    });

    let responseText = "";

    switch (postback.payload) {
      case "GET_STARTED":
        responseText =
          "¡Hola! 👋 Soy el asistente de Fascinante Digital. ¿En qué puedo ayudarte hoy?";
        break;
      case "MAIN_MENU":
        responseText =
          "Aquí tienes nuestras opciones principales. ¿Qué te interesa?";
        break;
      case "SERVICES":
        responseText =
          "Ofrecemos desarrollo web, marketing digital, SEO y más. ¿Qué servicio necesitas?";
        break;
      case "CONTACT":
        responseText =
          "Puedes contactarnos al (800) 886-4981 o visitar fascinantedigital.com/contact";
        break;
      default:
        responseText = `Recibí tu selección: ${postback.title}. ¿En qué más puedo ayudarte?`;
    }

    // Delay para parecer más humano
    await new Promise((resolve) =>
      setTimeout(resolve, WEBHOOK_CONFIG.AUTO_RESPONSE_DELAY),
    );

    // Enviar respuesta
    await messengerClient.sendMessage(psid, { text: responseText });
  } catch (error: any) {
    console.error("❌ Error procesando postback:", error);
  }
}

// 📬 Procesar Delivery Elite
async function processDelivery(psid: string, delivery: any): Promise<void> {
  try {
    console.log(
      `📬 Delivery recibido de ${psid}:`,
      delivery.mids?.length || 0,
      "mensajes",
    );

    // TODO: Actualizar estado de mensajes a "delivered"
    // Útil para métricas y analytics
  } catch (error: any) {
    console.error("❌ Error procesando delivery:", error);
  }
}

// 👀 Procesar Read Elite
async function processRead(psid: string, read: any): Promise<void> {
  try {
    console.log(`👀 Read recibido de ${psid}, watermark:`, read.watermark);

    // TODO: Actualizar estado de mensajes a "read"
    // Útil para métricas y analytics
  } catch (error: any) {
    console.error("❌ Error procesando read:", error);
  }
}

// 🔗 Procesar Referral Elite (anuncios, m.me links)
async function processReferral(
  psid: string,
  referral: MessengerReferral,
  timestamp: number,
): Promise<void> {
  try {
    console.log(`🔗 Referral recibido de ${psid}:`, {
      source: referral.source,
      type: referral.type,
      ref: referral.ref,
      ad_id: referral.ad_id,
      timestamp: new Date(timestamp).toISOString(),
    });

    // Respuesta personalizada según la fuente
    let welcomeMessage = "¡Hola! 👋 Bienvenido a Fascinante Digital.";

    if (referral.source === "SHORTLINK") {
      welcomeMessage +=
        " Veo que llegaste desde nuestro enlace. ¿En qué puedo ayudarte?";
    } else if (referral.ad_id) {
      welcomeMessage +=
        " Gracias por tu interés en nuestros servicios. ¿Tienes alguna pregunta específica?";
    }

    // Delay para parecer más humano
    await new Promise((resolve) =>
      setTimeout(resolve, WEBHOOK_CONFIG.AUTO_RESPONSE_DELAY),
    );

    await messengerClient.sendMessage(psid, { text: welcomeMessage });
  } catch (error: any) {
    console.error("❌ Error procesando referral:", error);
  }
}

// 🤖 Generar y Enviar Respuesta Elite con IA
async function generateAndSendResponse(
  psid: string,
  message: MessengerMessage,
): Promise<void> {
  try {
    // Solo responder a mensajes de texto por ahora
    if (!message.text) {
      console.log("ℹ️ Mensaje sin texto, omitiendo respuesta automática");
      return;
    }

    console.log(`🤖 Generando respuesta IA para: "${message.text}"`);

    // Verificar disponibilidad de Gemini
    if (!isGeminiAvailable()) {
      console.warn("⚠️ Gemini no disponible, usando respuesta fallback");
      await messengerClient.sendMessage(psid, {
        text: "Gracias por tu mensaje. Un miembro de nuestro equipo te responderá pronto. Para consultas urgentes, llama al (800) 886-4981.",
      });
      return;
    }

    // Delay para parecer más humano
    await new Promise((resolve) =>
      setTimeout(resolve, WEBHOOK_CONFIG.AUTO_RESPONSE_DELAY),
    );

    // Obtener contexto de conversación usando ConversationManager existente
    const conversationManager = new ConversationManager();
    const context = await conversationManager.getConversationContext(psid);

    // Para Messenger, usamos un contador simplificado
    const messageCount = 1;

    // Generar respuesta con IA
    const startTime = Date.now();
    const aiResponse = await generateGeminiResponseWithContext(
      message.text,
      context,
      messageCount,
      undefined, // intent (se puede agregar detection later)
      undefined, // userInfo (se puede obtener de BD)
    );
    const responseTime = Date.now() - startTime;

    // Truncar respuesta si es muy larga
    const truncatedResponse = MessengerUtils.truncateText(aiResponse, 2000);

    console.log(
      `🤖 Respuesta generada en ${responseTime}ms: "${truncatedResponse.substring(0, 100)}..."`,
    );

    // Enviar respuesta usando el cliente elite
    await messengerClient.sendMessage(
      psid,
      {
        text: truncatedResponse,
      },
      {
        messagingType: "RESPONSE",
      },
    );

    console.log("✅ Respuesta enviada exitosamente");
  } catch (error: any) {
    console.error("❌ Error generando respuesta IA:", error);

    // Respuesta fallback en caso de error
    try {
      await messengerClient.sendMessage(psid, {
        text: "Disculpa, hubo un problema técnico. ¿Podrías repetir tu mensaje? Para ayuda inmediata, contacta al (800) 886-4981.",
      });
    } catch (fallbackError) {
      console.error("❌ Error enviando respuesta fallback:", fallbackError);
    }
  }
}

// 🏥 Health Check Endpoint (opcional) - siguiendo patrón Next.js
export async function HEAD() {
  try {
    const health = await messengerClient.healthCheck();

    return Response.json(health, {
      status: health.status === "healthy" ? 200 : 503,
    });
  } catch {
    return Response.json(
      { status: "unhealthy", error: "Health check failed" },
      { status: 503 },
    );
  }
}
