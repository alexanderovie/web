/**
 * 🚀 Servicio Elite: Instagram Business Integration
 * Gestión completa de mensajes, conversaciones y métricas
 */

import { createClient } from "@supabase/supabase-js";
import { generateGeminiResponse } from "./gemini-client";

// Tipos Elite
export interface InstagramMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  instagram_message_id?: string;
  message_type:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "file"
    | "location"
    | "contact"
    | "sticker";
  message_text?: string;
  attachments?: any[];
  is_from_business: boolean;
  is_read: boolean;
  is_responded: boolean;
  response_text?: string;
  response_timestamp?: Date;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface InstagramConversation {
  id: string;
  sender_id: string;
  sender_name?: string;
  sender_username?: string;
  profile_picture_url?: string;
  last_message_at: Date;
  message_count: number;
  unread_count: number;
  status: "active" | "archived" | "blocked" | "spam";
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface InstagramMetrics {
  id: string;
  date: string;
  total_messages: number;
  messages_received: number;
  messages_sent: number;
  response_time_avg: number;
  engagement_rate: number;
  active_conversations: number;
  new_conversations: number;
  metadata?: any;
  created_at: Date;
}

export interface AutoResponse {
  id: string;
  trigger_type: "keyword" | "first_message" | "after_hours" | "default";
  trigger_value?: string;
  response_text: string;
  is_active: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

// Cliente Supabase Elite
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * 🎯 Servicio Elite de Instagram
 */
export class InstagramService {
  /**
   * 💾 Guardar mensaje recibido de Instagram
   */
  static async saveMessage(messageData: {
    sender_id: string;
    message_text: string;
    message_type?: string;
    instagram_message_id?: string;
    attachments?: any[];
    metadata?: any;
  }): Promise<InstagramMessage> {
    try {
      // 1. Buscar o crear conversación
      const conversation = await this.getOrCreateConversation(
        messageData.sender_id,
      );

      // 2. Guardar mensaje
      const { data: message, error } = await supabase
        .from("instagram_messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: messageData.sender_id,
          instagram_message_id: messageData.instagram_message_id,
          message_type: messageData.message_type || "text",
          message_text: messageData.message_text,
          attachments: messageData.attachments || [],
          is_from_business: false,
          metadata: messageData.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Mensaje guardado en Supabase: ${message.id}`);
      return message;
    } catch (error) {
      console.error("❌ Error guardando mensaje:", error);
      throw error;
    }
  }

  /**
   * 💬 Obtener o crear conversación
   */
  static async getOrCreateConversation(
    sender_id: string,
  ): Promise<InstagramConversation> {
    try {
      // Buscar conversación existente
      const { data: existing } = await supabase
        .from("instagram_conversations")
        .select("*")
        .eq("sender_id", sender_id)
        .single();

      if (existing) return existing;

      // Crear nueva conversación
      const { data: newConversation, error } = await supabase
        .from("instagram_conversations")
        .insert({
          sender_id,
          status: "active",
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Nueva conversación creada: ${newConversation.id}`);
      return newConversation;
    } catch (error) {
      console.error("❌ Error con conversación:", error);
      throw error;
    }
  }

  /**
   * 🤖 Generar respuesta automática inteligente
   */
  static async generateAutoResponse(
    messageText: string,
    sender_id: string,
  ): Promise<string | null> {
    try {
      // 1. Verificar si es primer mensaje
      const { data: messageCount } = await supabase
        .from("instagram_messages")
        .select("id", { count: "exact" })
        .eq("sender_id", sender_id);

      const isFirstMessage = (messageCount?.length || 0) <= 1;

      // 2. Obtener respuestas automáticas
      const { data: autoResponses } = await supabase
        .from("instagram_auto_responses")
        .select("*")
        .eq("is_active", true)
        .order("priority", { ascending: false });

      if (!autoResponses) return null;

      // 3. Buscar respuesta apropiada
      let selectedResponse: AutoResponse | null = null;

      // Primera prioridad: primer mensaje
      if (isFirstMessage) {
        selectedResponse =
          autoResponses.find((r) => r.trigger_type === "first_message") || null;
      }

      // Segunda prioridad: palabras clave
      if (!selectedResponse) {
        const lowerMessage = messageText.toLowerCase();
        selectedResponse =
          autoResponses.find(
            (r) =>
              r.trigger_type === "keyword" &&
              r.trigger_value &&
              lowerMessage.includes(r.trigger_value.toLowerCase()),
          ) || null;
      }

      // Tercera prioridad: horario fuera de servicio
      if (!selectedResponse) {
        const now = new Date();
        const hour = now.getHours();
        const isAfterHours =
          hour < 9 || hour >= 18 || now.getDay() === 0 || now.getDay() === 6;

        if (isAfterHours) {
          selectedResponse =
            autoResponses.find((r) => r.trigger_type === "after_hours") || null;
        }
      }

      // Última opción: respuesta por defecto
      if (!selectedResponse) {
        selectedResponse =
          autoResponses.find((r) => r.trigger_type === "default") || null;
      }

      return selectedResponse?.response_text || null;
    } catch (error) {
      console.error("❌ Error generando respuesta automática:", error);
      return null;
    }
  }

  /**
   * 📤 Enviar respuesta a Instagram
   */
  static async sendResponse(
    sender_id: string,
    responseText: string,
  ): Promise<boolean> {
    try {
      const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
      const INSTAGRAM_PAGE_ID = process.env.INSTAGRAM_PAGE_ID;

      if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_PAGE_ID) {
        console.error("❌ Variables de Instagram no configuradas");
        return false;
      }

      // Enviar a Instagram
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${INSTAGRAM_PAGE_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${INSTAGRAM_ACCESS_TOKEN}`,
          },
          body: JSON.stringify({
            recipient: { id: sender_id },
            message: { text: responseText },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Error enviando a Instagram:", errorData);
        return false;
      }

      // Guardar respuesta en Supabase
      const conversation = await this.getOrCreateConversation(sender_id);

      await supabase.from("instagram_messages").insert({
        conversation_id: conversation.id,
        sender_id,
        message_type: "text",
        message_text: responseText,
        is_from_business: true,
        is_responded: true,
        response_text: responseText,
        response_timestamp: new Date().toISOString(),
      });

      console.log(`✅ Respuesta enviada y guardada: ${responseText}`);
      return true;
    } catch (error) {
      console.error("❌ Error enviando respuesta:", error);
      return false;
    }
  }

  /**
   * 📊 Obtener métricas de Instagram
   */
  static async getMetrics(days: number = 30): Promise<InstagramMetrics[]> {
    try {
      const { data: metrics, error } = await supabase
        .from("instagram_metrics")
        .select("*")
        .gte(
          "date",
          new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        )
        .order("date", { ascending: false });

      if (error) throw error;
      return metrics || [];
    } catch (error) {
      console.error("❌ Error obteniendo métricas:", error);
      return [];
    }
  }

  /**
   * 💬 Obtener conversaciones recientes
   */
  static async getConversations(
    limit: number = 50,
  ): Promise<InstagramConversation[]> {
    try {
      const { data: conversations, error } = await supabase
        .from("instagram_conversations")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return conversations || [];
    } catch (error) {
      console.error("❌ Error obteniendo conversaciones:", error);
      return [];
    }
  }

  /**
   * 📨 Obtener mensajes de una conversación
   */
  static async getMessages(
    conversation_id: string,
    limit: number = 100,
  ): Promise<InstagramMessage[]> {
    try {
      const { data: messages, error } = await supabase
        .from("instagram_messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return messages || [];
    } catch (error) {
      console.error("❌ Error obteniendo mensajes:", error);
      return [];
    }
  }

  /**
   * ✅ Marcar mensaje como leído
   */
  static async markAsRead(message_id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("instagram_messages")
        .update({ is_read: true })
        .eq("id", message_id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("❌ Error marcando como leído:", error);
      return false;
    }
  }

  /**
   * 🔄 Procesar mensaje completo (Elite Flow)
   */
  static async processMessage(messageData: {
    sender_id: string;
    message_text: string;
    message_type?: string;
    instagram_message_id?: string;
    attachments?: any[];
    metadata?: any;
  }): Promise<boolean> {
    try {
      console.log(
        `🔄 Procesando mensaje de ${messageData.sender_id}: ${messageData.message_text}`,
      );

      // 1. Guardar mensaje
      await this.saveMessage(messageData);

      // 2. Generar respuesta automática
      const autoResponse = await this.generateAutoResponse(
        messageData.message_text,
        messageData.sender_id,
      );

      // 3. Si no hay respuesta automática, usar Gemini
      let responseText = autoResponse;
      if (!responseText) {
        responseText = await generateGeminiResponse(messageData.message_text);
      }

      // 4. Enviar respuesta
      if (responseText) {
        await this.sendResponse(messageData.sender_id, responseText);
      }

      console.log(`✅ Mensaje procesado exitosamente`);
      return true;
    } catch (error) {
      console.error("❌ Error procesando mensaje:", error);
      return false;
    }
  }
}
