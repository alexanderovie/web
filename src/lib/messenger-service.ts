/**
 * 🚀 ELITE Messenger Service
 *
 * Servicio de alto nivel para gestión completa de Facebook Messenger
 * con patrones elite de arquitectura y manejo de datos
 */

import { createClient } from "@supabase/supabase-js";
import { messengerClient } from "./messenger-client";
import { generateGeminiResponse } from "./gemini-client";

// 🎯 Interfaces Elite
export interface MessengerConversation {
  id: string;
  psid: string;
  user_name?: string;
  user_profile_pic?: string;
  user_locale?: string;
  user_timezone?: number;
  status: "active" | "archived" | "blocked" | "spam" | "resolved";
  is_human_handover: boolean;
  assigned_agent_id?: string;
  message_count: number;
  unread_count: number;
  last_message_at: Date;
  first_message_at: Date;
  response_time_avg_seconds: number;
  conversation_context: Record<string, any>;
  user_metadata: Record<string, any>;
  tags: string[];
  referral_source?: string;
  referral_type?: string;
  referral_ref?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MessengerMessageRecord {
  id: string;
  conversation_id: string;
  psid: string;
  facebook_message_id?: string;
  message_type: string;
  message_text?: string;
  attachments: any[];
  quick_reply?: any;
  postback?: any;
  referral?: any;
  delivery?: any;
  read?: any;
  direction: "inbound" | "outbound";
  is_echo: boolean;
  delivery_status: "sent" | "delivered" | "read" | "failed" | "pending";
  is_processed: boolean;
  processing_error?: string;
  is_auto_response: boolean;
  ai_model_used?: string;
  ai_confidence_score?: number;
  response_time_ms?: number;
  message_metadata: Record<string, any>;
  user_agent?: string;
  ip_address?: string;
  facebook_timestamp?: Date;
  created_at: Date;
  updated_at: Date;
}

// 🏗️ Cliente Supabase Elite
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * 🎯 Servicio Elite de Messenger
 */
export class MessengerService {
  /**
   * 💾 Guardar mensaje recibido de Messenger
   */
  static async saveMessage(messageData: {
    psid: string;
    message_text?: string;
    message_type?: string;
    facebook_message_id?: string;
    attachments?: any[];
    quick_reply?: any;
    postback?: any;
    metadata?: any;
    direction: "inbound" | "outbound";
    facebook_timestamp?: Date;
  }): Promise<MessengerMessageRecord> {
    try {
      console.log(`💾 Guardando mensaje de Messenger: ${messageData.psid}`);

      // 1. Buscar o crear conversación
      const conversation = await this.getOrCreateConversation(messageData.psid);

      // 2. Guardar mensaje
      const { data: message, error } = await supabase
        .from("messenger_messages")
        .insert({
          conversation_id: conversation.id,
          psid: messageData.psid,
          facebook_message_id: messageData.facebook_message_id,
          message_type: messageData.message_type || "text",
          message_text: messageData.message_text,
          attachments: messageData.attachments || [],
          quick_reply: messageData.quick_reply,
          postback: messageData.postback,
          direction: messageData.direction,
          is_processed: false,
          message_metadata: messageData.metadata || {},
          facebook_timestamp: messageData.facebook_timestamp || new Date(),
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
    psid: string,
  ): Promise<MessengerConversation> {
    try {
      // Buscar conversación existente
      const { data: existingConversation } = await supabase
        .from("messenger_conversations")
        .select("*")
        .eq("psid", psid)
        .single();

      if (existingConversation) {
        return existingConversation;
      }

      console.log(`🆕 Creando nueva conversación para PSID: ${psid}`);

      // Crear nueva conversación
      const { data: newConversation, error } = await supabase
        .from("messenger_conversations")
        .insert({
          psid: psid,
          status: "active",
          message_count: 0,
          unread_count: 0,
          first_message_at: new Date(),
          last_message_at: new Date(),
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ Nueva conversación creada: ${newConversation.id}`);
      return newConversation;
    } catch (error) {
      console.error("❌ Error en getOrCreateConversation:", error);
      throw error;
    }
  }

  /**
   * 📤 Enviar respuesta a Messenger
   */
  static async sendResponse(psid: string, message: string): Promise<boolean> {
    try {
      console.log(
        `📤 Enviando respuesta a ${psid}: ${message.substring(0, 100)}...`,
      );

      const startTime = Date.now();
      const response = await messengerClient.sendMessage(psid, {
        text: message,
      });
      const responseTime = Date.now() - startTime;

      // Guardar mensaje enviado
      await this.saveMessage({
        psid: psid,
        message_text: message,
        message_type: "text",
        facebook_message_id: response.message_id,
        direction: "outbound",
        metadata: {
          response_time_ms: responseTime,
          is_auto_response: true,
        },
      });

      console.log(`✅ Respuesta enviada exitosamente en ${responseTime}ms`);
      return true;
    } catch (error) {
      console.error("❌ Error enviando respuesta:", error);
      return false;
    }
  }

  /**
   * 🤖 Generar respuesta automática
   */
  static async generateAutoResponse(
    messageText: string,
    psid: string,
  ): Promise<string | null> {
    try {
      console.log(
        `🤖 Generando respuesta automática para ${psid}: ${messageText}`,
      );

      // Generar respuesta con IA
      const response = await generateGeminiResponse(messageText);

      // Agregar contexto específico de Messenger si es necesario
      const contextualResponse = this.addMessengerContext(response);

      return contextualResponse;
    } catch (error) {
      console.error("❌ Error generando respuesta automática:", error);
      return null;
    }
  }

  /**
   * 📋 Obtener contexto de conversación
   */
  static async getConversationContext(psid: string): Promise<string> {
    try {
      // Obtener últimos 10 mensajes de la conversación
      const { data: messages } = await supabase
        .from("messenger_messages")
        .select("message_text, direction, created_at")
        .eq("psid", psid)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!messages || messages.length === 0) {
        return "Nueva conversación en Messenger";
      }

      // Construir contexto
      const contextMessages = messages
        .reverse()
        .map((msg) => {
          const role = msg.direction === "inbound" ? "Usuario" : "Asistente";
          return `${role}: ${msg.message_text}`;
        })
        .join("\n");

      return `Historial de conversación de Messenger:\n${contextMessages}`;
    } catch (error) {
      console.error("❌ Error obteniendo contexto:", error);
      return "Error obteniendo contexto de conversación";
    }
  }

  /**
   * 🎯 Agregar contexto específico de Messenger
   */
  private static addMessengerContext(response: string): string {
    // Agregar información específica de Messenger si es relevante
    if (response.includes("contacto") || response.includes("llamar")) {
      response +=
        "\n\n💬 También puedes continuar la conversación aquí en Messenger.";
    }

    if (response.includes("servicios") || response.includes("precios")) {
      response += "\n\n🔗 Visita fascinantedigital.com para más información.";
    }

    return response;
  }

  /**
   * 📊 Obtener métricas de conversación
   */
  static async getConversationMetrics(psid: string): Promise<{
    messageCount: number;
    avgResponseTime: number;
    lastActivity: Date;
    userEngagement: "high" | "medium" | "low";
  }> {
    try {
      const { data: conversation } = await supabase
        .from("messenger_conversations")
        .select("message_count, response_time_avg_seconds, last_message_at")
        .eq("psid", psid)
        .single();

      if (!conversation) {
        return {
          messageCount: 0,
          avgResponseTime: 0,
          lastActivity: new Date(),
          userEngagement: "low",
        };
      }

      // Calcular engagement basado en frecuencia de mensajes
      const daysSinceLastMessage = Math.floor(
        (Date.now() - new Date(conversation.last_message_at).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      let userEngagement: "high" | "medium" | "low" = "low";
      if (conversation.message_count > 10 && daysSinceLastMessage < 1) {
        userEngagement = "high";
      } else if (conversation.message_count > 5 && daysSinceLastMessage < 7) {
        userEngagement = "medium";
      }

      return {
        messageCount: conversation.message_count,
        avgResponseTime: conversation.response_time_avg_seconds,
        lastActivity: new Date(conversation.last_message_at),
        userEngagement,
      };
    } catch (error) {
      console.error("❌ Error obteniendo métricas:", error);
      throw error;
    }
  }

  /**
   * 🏷️ Actualizar etiquetas de conversación
   */
  static async updateConversationTags(
    psid: string,
    tags: string[],
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("messenger_conversations")
        .update({ tags })
        .eq("psid", psid);

      if (error) throw error;

      console.log(`🏷️ Etiquetas actualizadas para ${psid}:`, tags);
      return true;
    } catch (error) {
      console.error("❌ Error actualizando etiquetas:", error);
      return false;
    }
  }

  /**
   * 👤 Actualizar información del usuario
   */
  static async updateUserInfo(
    psid: string,
    userInfo: {
      name?: string;
      profile_pic?: string;
      locale?: string;
      timezone?: number;
    },
  ): Promise<boolean> {
    try {
      const updateData: any = {};

      if (userInfo.name) updateData.user_name = userInfo.name;
      if (userInfo.profile_pic)
        updateData.user_profile_pic = userInfo.profile_pic;
      if (userInfo.locale) updateData.user_locale = userInfo.locale;
      if (userInfo.timezone !== undefined)
        updateData.user_timezone = userInfo.timezone;

      const { error } = await supabase
        .from("messenger_conversations")
        .update(updateData)
        .eq("psid", psid);

      if (error) throw error;

      console.log(`👤 Info de usuario actualizada para ${psid}`);
      return true;
    } catch (error) {
      console.error("❌ Error actualizando info de usuario:", error);
      return false;
    }
  }

  /**
   * 🔄 Marcar mensaje como leído
   */
  static async markAsRead(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("messenger_messages")
        .update({
          delivery_status: "read",
          is_processed: true,
        })
        .eq("facebook_message_id", messageId);

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
    psid: string;
    message_text?: string;
    message_type?: string;
    facebook_message_id?: string;
    attachments?: any[];
    quick_reply?: any;
    postback?: any;
    metadata?: any;
    facebook_timestamp?: Date;
  }): Promise<boolean> {
    try {
      console.log(`🔄 Procesando mensaje completo de ${messageData.psid}`);

      // 1. Guardar mensaje
      await this.saveMessage({
        ...messageData,
        direction: "inbound",
      });

      // 2. Generar respuesta automática solo para mensajes de texto
      if (messageData.message_text && messageData.message_type === "text") {
        const autoResponse = await this.generateAutoResponse(
          messageData.message_text,
          messageData.psid,
        );

        // 3. Enviar respuesta si se generó una
        if (autoResponse) {
          await this.sendResponse(messageData.psid, autoResponse);
        }
      }

      console.log("✅ Mensaje procesado exitosamente");
      return true;
    } catch (error) {
      console.error("❌ Error procesando mensaje:", error);
      return false;
    }
  }

  /**
   * 📈 Obtener estadísticas generales
   */
  static async getGeneralStats(): Promise<{
    totalConversations: number;
    activeConversations: number;
    totalMessages: number;
    avgResponseTime: number;
  }> {
    try {
      // Total de conversaciones
      const { count: totalConversations } = await supabase
        .from("messenger_conversations")
        .select("*", { count: "exact", head: true });

      // Conversaciones activas
      const { count: activeConversations } = await supabase
        .from("messenger_conversations")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Total de mensajes
      const { count: totalMessages } = await supabase
        .from("messenger_messages")
        .select("*", { count: "exact", head: true });

      // Tiempo promedio de respuesta
      const { data: avgData } = await supabase
        .from("messenger_conversations")
        .select("response_time_avg_seconds")
        .not("response_time_avg_seconds", "is", null);

      const avgResponseTime = avgData?.length
        ? avgData.reduce(
            (acc, curr) => acc + curr.response_time_avg_seconds,
            0,
          ) / avgData.length
        : 0;

      return {
        totalConversations: totalConversations || 0,
        activeConversations: activeConversations || 0,
        totalMessages: totalMessages || 0,
        avgResponseTime: Math.round(avgResponseTime),
      };
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      return {
        totalConversations: 0,
        activeConversations: 0,
        totalMessages: 0,
        avgResponseTime: 0,
      };
    }
  }
}

export default MessengerService;
