import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    // Obtener todos los mensajes de WhatsApp
    const { data: messages, error } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error obteniendo mensajes:", error);
      return NextResponse.json(
        { error: "Error obteniendo mensajes" },
        { status: 500 },
      );
    }

    // Agrupar mensajes por número de teléfono para crear conversaciones
    const conversationsMap = new Map();

    messages?.forEach((message) => {
      const phone = message.phone;

      if (!conversationsMap.has(phone)) {
        conversationsMap.set(phone, {
          id: conversationsMap.size + 1,
          phone: phone,
          messages: [],
          lastMessage: "",
          lastMessageTime: "",
          unreadCount: 0,
          status: "Nuevo",
          target: "Cliente",
          reviewer: "Carlos Ruiz", // Por defecto
        });
      }

      const conversation = conversationsMap.get(phone);
      conversation.messages.push(message);

      // Actualizar último mensaje
      if (
        !conversation.lastMessageTime ||
        message.created_at > conversation.lastMessageTime
      ) {
        conversation.lastMessage = message.message;
        conversation.lastMessageTime = message.created_at;
      }

      // Contar mensajes no leídos (inbound)
      if (message.direction === "inbound") {
        conversation.unreadCount++;
      }
    });

    // Convertir a array y formatear para la tabla
    const conversations = Array.from(conversationsMap.values()).map(
      (conv, index) => ({
        id: index + 1,
        header: conv.lastMessage,
        type: "WhatsApp",
        status: conv.unreadCount > 0 ? "Nuevo" : "En proceso",
        target: conv.target,
        limit: "Sin límite",
        reviewer: conv.reviewer,
        conversationId: conv.phone,
        lastMessage: conv.lastMessage,
        timestamp: conv.lastMessageTime,
        unreadCount: conv.unreadCount,
        phone: conv.phone,
      }),
    );

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("❌ Error en endpoint de conversaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
