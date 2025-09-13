import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export interface ConversationMessage {
  id: string;
  phone: string;
  message: string;
  from: "user" | "ai";
  timestamp: string;
  session_id?: string;
}

export interface ConversationState {
  phone: string;
  state:
    | "INICIAL"
    | "INTERACTUANDO"
    | "DATOS_RECOLECTADOS"
    | "ESCALADO_A_HUMANO";
  last_user_message: string;
  last_ai_response: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupedMessages {
  messages: string[];
  shouldRespond: boolean;
  intent?: string;
  isComplete: boolean;
}

const GROUP_TIMEOUT_MS = 20000; // 20 segundos

export class ConversationManager {
  private static instance: ConversationManager;
  private conversationStates = new Map<string, ConversationState>();

  static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  // 🔍 Agrupar mensajes del usuario
  async groupUserMessages(phone: string): Promise<GroupedMessages> {
    try {
      // Obtener mensajes recientes del usuario
      const { data: messages, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("❌ Error obteniendo mensajes:", error);
        return { messages: [], shouldRespond: false, isComplete: false };
      }

      if (!messages || messages.length === 0) {
        return { messages: [], shouldRespond: true, isComplete: true };
      }

      // Agrupar mensajes por tiempo
      const groupedMessages = this.groupMessagesByTime(messages);

      // Determinar si debemos responder
      const shouldRespond = this.shouldRespondToMessages(groupedMessages);

      // Detectar intención
      const intent = await this.detectIntent(groupedMessages.join(" "));

      return {
        messages: groupedMessages,
        shouldRespond,
        intent,
        isComplete: shouldRespond,
      };
    } catch (error) {
      console.error("❌ Error en groupUserMessages:", error);
      return { messages: [], shouldRespond: false, isComplete: false };
    }
  }

  // 🕰️ Agrupar mensajes por tiempo
  private groupMessagesByTime(messages: any[]): string[] {
    const grouped: string[] = [];
    let currentGroup = "";
    let lastTimestamp: number | null = null;

    // Ordenar mensajes por timestamp (más reciente primero)
    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    for (const msg of sortedMessages) {
      const timestamp = new Date(msg.created_at).getTime();

      if (lastTimestamp && lastTimestamp - timestamp < GROUP_TIMEOUT_MS) {
        // Agrupar con mensaje anterior
        currentGroup = msg.message + " " + currentGroup;
      } else {
        // Nuevo grupo
        if (currentGroup) {
          grouped.unshift(currentGroup.trim());
        }
        currentGroup = msg.message;
      }

      lastTimestamp = timestamp;
    }

    if (currentGroup) {
      grouped.unshift(currentGroup.trim());
    }

    return grouped;
  }

  // ⏰ Determinar si debemos responder
  private shouldRespondToMessages(messages: string[]): boolean {
    if (messages.length === 0) return true;

    // Si hay múltiples mensajes, esperar un poco más
    if (messages.length > 1) {
      return true; // Por ahora respondemos inmediatamente, pero podríamos implementar delay
    }

    return true;
  }

  // 🧠 Detectar intención del usuario
  private async detectIntent(message: string): Promise<string> {
    // Implementación mejorada con más contexto
    const lowerMessage = message.toLowerCase();

    // Saludos y apertura
    if (
      lowerMessage.includes("hola") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("buenos días") ||
      lowerMessage.includes("buenas") ||
      lowerMessage.includes("qué tal") ||
      lowerMessage.includes("cómo estás") ||
      lowerMessage.includes("que tal") ||
      lowerMessage.includes("como estas")
    ) {
      return "saludo";
    }

    // Interés comercial - servicios
    if (
      lowerMessage.includes("servicios") ||
      lowerMessage.includes("services") ||
      lowerMessage.includes("qué hacen") ||
      lowerMessage.includes("qué ofrecen") ||
      lowerMessage.includes("qué servicios") ||
      lowerMessage.includes("hacen sitios web") ||
      lowerMessage.includes("desarrollo web") ||
      lowerMessage.includes("marketing digital") ||
      lowerMessage.includes("seo") ||
      lowerMessage.includes("ppc") ||
      lowerMessage.includes("google ads") ||
      lowerMessage.includes("publicidad") ||
      lowerMessage.includes("redes sociales") ||
      lowerMessage.includes("instagram") ||
      lowerMessage.includes("facebook") ||
      lowerMessage.includes("e-commerce") ||
      lowerMessage.includes("tienda online") ||
      lowerMessage.includes("diseño web") ||
      lowerMessage.includes("hosting") ||
      lowerMessage.includes("dominio") ||
      lowerMessage.includes("email marketing") ||
      lowerMessage.includes("analytics") ||
      lowerMessage.includes("google business") ||
      lowerMessage.includes("google maps") ||
      lowerMessage.includes("vendo") ||
      lowerMessage.includes("vendomoostre") ||
      lowerMessage.includes("mostre")
    ) {
      return "interés_comercial";
    }

    // Interés comercial - precios
    if (
      lowerMessage.includes("precio") ||
      lowerMessage.includes("costo") ||
      lowerMessage.includes("cuánto") ||
      lowerMessage.includes("cost") ||
      lowerMessage.includes("tarifa") ||
      lowerMessage.includes("plan") ||
      lowerMessage.includes("cotización") ||
      lowerMessage.includes("presupuesto") ||
      lowerMessage.includes("cuánto cuesta") ||
      lowerMessage.includes("precios") ||
      lowerMessage.includes("costos") ||
      lowerMessage.includes("cuanto cuesta") ||
      lowerMessage.includes("cuanto vale") ||
      lowerMessage.includes("cuánto vale")
    ) {
      return "interés_comercial";
    }

    // Ubicación y contacto
    if (
      lowerMessage.includes("dónde") ||
      lowerMessage.includes("ubicación") ||
      lowerMessage.includes("dirección") ||
      lowerMessage.includes("direccion") ||
      lowerMessage.includes("location") ||
      lowerMessage.includes("address") ||
      lowerMessage.includes("teléfono") ||
      lowerMessage.includes("telefono") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("llamar") ||
      lowerMessage.includes("contacto") ||
      lowerMessage.includes("contact") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("correo") ||
      lowerMessage.includes("mail")
    ) {
      return "información_contacto";
    }

    // Consultoría y asesoría
    if (
      lowerMessage.includes("consulta") ||
      lowerMessage.includes("asesoría") ||
      lowerMessage.includes("asesoria") ||
      lowerMessage.includes("consultoría") ||
      lowerMessage.includes("consultoria") ||
      lowerMessage.includes("ayuda") ||
      lowerMessage.includes("consejo") ||
      lowerMessage.includes("recomendación") ||
      lowerMessage.includes("recomendacion") ||
      lowerMessage.includes("diagnóstico") ||
      lowerMessage.includes("diagnostico") ||
      lowerMessage.includes("evaluación") ||
      lowerMessage.includes("evaluacion") ||
      lowerMessage.includes("gratis") ||
      lowerMessage.includes("gratuito") ||
      lowerMessage.includes("free")
    ) {
      return "consultoría";
    }

    // Tiempos y plazos
    if (
      lowerMessage.includes("tiempo") ||
      lowerMessage.includes("cuándo") ||
      lowerMessage.includes("cuando") ||
      lowerMessage.includes("plazo") ||
      lowerMessage.includes("entrega") ||
      lowerMessage.includes("duración") ||
      lowerMessage.includes("duracion") ||
      lowerMessage.includes("cuánto tarda") ||
      lowerMessage.includes("cuanto tarda") ||
      lowerMessage.includes("fecha") ||
      lowerMessage.includes("cuándo estará") ||
      lowerMessage.includes("cuando estara") ||
      lowerMessage.includes("resultados") ||
      lowerMessage.includes("cuándo veré") ||
      lowerMessage.includes("cuando vere")
    ) {
      return "tiempos_plazos";
    }

    // Reseñas y referencias
    if (
      lowerMessage.includes("reseña") ||
      lowerMessage.includes("reseña") ||
      lowerMessage.includes("review") ||
      lowerMessage.includes("opinión") ||
      lowerMessage.includes("opinion") ||
      lowerMessage.includes("referencia") ||
      lowerMessage.includes("cliente") ||
      lowerMessage.includes("caso") ||
      lowerMessage.includes("ejemplo") ||
      lowerMessage.includes("portfolio") ||
      lowerMessage.includes("trabajos") ||
      lowerMessage.includes("proyectos")
    ) {
      return "reseñas_referencias";
    }

    // Problemas técnicos
    if (
      lowerMessage.includes("problema") ||
      lowerMessage.includes("error") ||
      lowerMessage.includes("no funciona") ||
      lowerMessage.includes("falla") ||
      lowerMessage.includes("bug") ||
      lowerMessage.includes("técnico") ||
      lowerMessage.includes("tecnico") ||
      lowerMessage.includes("soporte") ||
      lowerMessage.includes("ayuda técnica") ||
      lowerMessage.includes("ayuda tecnica") ||
      lowerMessage.includes("arreglar") ||
      lowerMessage.includes("reparar")
    ) {
      return "soporte_técnico";
    }

    // Quejas y reclamos
    if (
      lowerMessage.includes("queja") ||
      lowerMessage.includes("molesto") ||
      lowerMessage.includes("enojado") ||
      lowerMessage.includes("frustrado") ||
      lowerMessage.includes("insatisfecho") ||
      lowerMessage.includes("mal servicio") ||
      lowerMessage.includes("pésimo") ||
      lowerMessage.includes("pesimo") ||
      lowerMessage.includes("terrible") ||
      lowerMessage.includes("horrible") ||
      lowerMessage.includes("decepcionado") ||
      lowerMessage.includes("decepcionado")
    ) {
      return "queja";
    }

    // Solicitud de humano
    if (
      lowerMessage.includes("humano") ||
      lowerMessage.includes("persona") ||
      lowerMessage.includes("agente") ||
      lowerMessage.includes("representante") ||
      lowerMessage.includes("especialista") ||
      lowerMessage.includes("experto") ||
      lowerMessage.includes("hablar con alguien") ||
      lowerMessage.includes("no eres humano") ||
      lowerMessage.includes("bot") ||
      lowerMessage.includes("robot") ||
      lowerMessage.includes("ia") ||
      lowerMessage.includes("inteligencia artificial")
    ) {
      return "escalar_humano";
    }

    // Información personal
    if (
      lowerMessage.includes("nombre") ||
      lowerMessage.includes("cómo me llamo") ||
      lowerMessage.includes("como me llamo") ||
      lowerMessage.includes("mi nombre") ||
      lowerMessage.includes("me llamo") ||
      lowerMessage.includes("soy") ||
      lowerMessage.includes("tengo") ||
      lowerMessage.includes("mi negocio") ||
      lowerMessage.includes("mi empresa") ||
      lowerMessage.includes("trabajo en") ||
      lowerMessage.includes("soy dueño") ||
      lowerMessage.includes("soy dueña")
    ) {
      return "información_personal";
    }

    // Despedida
    if (
      lowerMessage.includes("adiós") ||
      lowerMessage.includes("adios") ||
      lowerMessage.includes("chao") ||
      lowerMessage.includes("hasta luego") ||
      lowerMessage.includes("nos vemos") ||
      lowerMessage.includes("gracias") ||
      lowerMessage.includes("bye") ||
      lowerMessage.includes("goodbye")
    ) {
      return "despedida";
    }

    // Consulta general
    return "consulta";
  }

  // 📝 Obtener contexto de conversación
  async getConversationContext(phone: string): Promise<string> {
    try {
      const { data: messages, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(15); // Aumentado a 15 mensajes para mejor contexto

      if (error || !messages) {
        return "";
      }

      // Construir contexto más inteligente
      const recentMessages = messages.reverse().slice(-10); // Últimos 10 mensajes para contexto

      // Agrupar por tipo de mensaje (user/ai) para mejor legibilidad
      const context = recentMessages
        .map((msg) => {
          const timestamp = new Date(msg.created_at).toLocaleTimeString(
            "es-ES",
            {
              hour: "2-digit",
              minute: "2-digit",
            },
          );
          return `${msg.from === "user" ? "👤 Usuario" : "🤖 Carlos"}: ${msg.message} (${timestamp})`;
        })
        .join("\n");

      return context;
    } catch (error) {
      console.error("❌ Error obteniendo contexto:", error);
      return "";
    }
  }

  // 📝 Obtener resumen contextual con información del usuario
  async getConversationSummary(phone: string): Promise<any> {
    try {
      const { data: messages, error } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error || !messages) {
        return { messageCount: 0, userInfo: {} };
      }

      // Construir contexto completo
      const recentMessages = messages.reverse();
      const context = recentMessages
        .map((msg) => {
          // const timestamp = new Date(msg.created_at).toLocaleTimeString();
          const sender = msg.from === "user" ? "Usuario" : "Carlos";
          return `${sender}: ${msg.message}`;
        })
        .join(" | ");

      // Extraer información del usuario del contexto completo
      const userInfo = this.extractUserInfo(context);

      console.log("🔍 Contexto completo para extracción:", context);
      console.log("👤 Información extraída:", userInfo);

      return {
        messageCount: messages.length,
        userInfo: userInfo,
        context: context,
      };
    } catch (error) {
      console.error("❌ Error en getConversationSummary:", error);
      return { messageCount: 0, userInfo: {} };
    }
  }

  // 🎯 Determinar si es momento de pedir datos del usuario
  private shouldAskForUserData(
    messageCount: number,
    intent: string,
    userInfo: any,
  ): boolean {
    // Si ya tenemos nombre y email, no pedir más
    if (userInfo.name && userInfo.email) {
      return false;
    }

    // Pedir después de 2-3 interacciones útiles
    if (messageCount >= 2 && intent === "interés_comercial") {
      return true;
    }

    // Pedir si el usuario muestra interés específico
    if (intent === "interés_comercial" || intent === "consulta_servicios") {
      return true;
    }

    // Pedir si menciona palabras clave de interés
    // const interestKeywords = [
    //   "precio",
    //   "costo",
    //   "tarifa",
    //   "presupuesto",
    //   "cotización",
    //   "agendar",
    //   "cita",
    //   "llamada",
    //   "consulta",
    //   "asesoría",
    //   "servicios",
    //   "marketing",
    //   "digital",
    //   "negocio",
    // ];

    return false; // Por defecto no pedir
  }

  // 👤 Extraer información del usuario del contexto
  private extractUserInfo(context: string): any {
    const userInfo: any = {};

    console.log("🔍 Analizando contexto para extraer información:", context);

    // Extraer nombre con patrones mejorados y validación
    const namePatterns = [
      // Patrón 1: "me llamo [nombre]"
      /me llamo\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+?)(?:\s+y|\s+mi|\s+correo|\s+email|\s+es|\s+el|\s+la|$)/i,
      // Patrón 2: "soy [nombre]"
      /soy\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+?)(?:\s+y|\s+mi|\s+correo|\s+email|\s+es|\s+el|\s+la|$)/i,
      // Patrón 3: "mi nombre es [nombre]"
      /mi nombre es\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+?)(?:\s+y|\s+mi|\s+correo|\s+email|\s+es|\s+el|\s+la|$)/i,
      // Patrón 4: "[nombre] es mi nombre"
      /([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+?)\s+es mi nombre/i,
      // Patrón 5: "me llamo [nombre]," (con coma)
      /me llamo\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+?)(?:,|\.|$)/i,
      // Patrón 6: "soy [nombre]," (con coma)
      /soy\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+?)(?:,|\.|$)/i,
      // Patrón 7: "mi nombre es [nombre]," (con coma)
      /mi nombre es\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+?)(?:,|\.|$)/i,
    ];

    for (const pattern of namePatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        // Validación mejorada del nombre
        if (
          name.length >= 2 &&
          name.length <= 50 &&
          !name.toLowerCase().includes("correo") &&
          !name.toLowerCase().includes("email") &&
          !name.toLowerCase().includes("mi") &&
          !name.toLowerCase().includes("es") &&
          !name.toLowerCase().includes("y")
        ) {
          userInfo.name = name;
          console.log("👤 Nombre detectado:", name);
          break;
        }
      }
    }

    // Extraer email con patrones más específicos
    const emailPatterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      /mi correo es\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /mi email es\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
      /es\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    ];

    for (const pattern of emailPatterns) {
      const matches = context.match(pattern);
      if (matches && matches.length > 0) {
        // Tomar el primer email encontrado
        const email = matches[0].includes("@") ? matches[0] : matches[1];
        if (email && email.includes("@")) {
          userInfo.email = email.trim();
          console.log("📧 Email detectado:", email);
          break;
        }
      }
    }

    // Extraer tipo de negocio
    const businessPatterns = [
      /tengo\s+un\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
      /mi negocio es\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
      /trabajo\s+en\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
      /soy\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
    ];

    for (const pattern of businessPatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        userInfo.businessType = match[1].trim();
        console.log("🏢 Tipo de negocio detectado:", match[1].trim());
        break;
      }
    }

    // Extraer ubicación
    const locationPatterns = [
      /estoy en\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
      /vivo en\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
      /mi negocio está en\s+([A-Za-zÁáÉéÍíÓóÚúÑñ\s]+)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = context.match(pattern);
      if (match && match[1]) {
        userInfo.location = match[1].trim();
        console.log("📍 Ubicación detectada:", match[1].trim());
        break;
      }
    }

    console.log("🔍 Información extraída del usuario:", userInfo);
    return userInfo;
  }

  // 🎯 Actualizar estado de conversación
  async updateConversationState(
    phone: string,
    state: Partial<ConversationState>,
  ): Promise<void> {
    try {
      const { error } = await supabase.from("conversation_states").upsert({
        phone,
        ...state,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("❌ Error actualizando estado:", error);
      }
    } catch (error) {
      console.error("❌ Error en updateConversationState:", error);
    }
  }

  // 📊 Obtener estadísticas de conversación
  async getConversationStats(phone: string): Promise<{
    messageCount: number;
    lastInteraction: string;
    state: string;
  }> {
    try {
      const { data: messages, error } = await supabase
        .from("whatsapp_messages")
        .select("created_at")
        .eq("phone", phone)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error || !messages || messages.length === 0) {
        return { messageCount: 0, lastInteraction: "", state: "INICIAL" };
      }

      return {
        messageCount: messages.length,
        lastInteraction: messages[0].created_at,
        state: "INTERACTUANDO",
      };
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      return { messageCount: 0, lastInteraction: "", state: "INICIAL" };
    }
  }
}
