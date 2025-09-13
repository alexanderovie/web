// Cliente de Gemini API para respuestas inteligentes en WhatsApp
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar Gemini con la API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Configuración de modelos (con fallback) - Usando Gemini 2.5 Flash (la versión más moderna)
const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const models = {
  primary: genAI.getGenerativeModel({ model: PRIMARY_MODEL }), // Modelo principal desde env
  fallback: genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" }), // Fallback estable
  ultra: genAI.getGenerativeModel({ model: "gemini-2.0-flash" }), // Para casos complejos
  latest: genAI.getGenerativeModel({ model: "gemini-2.5-flash" }), // Más reciente disponible
};

// Cache de respuestas para mejorar latencia
const responseCache = new Map<string, string>();

// Función para crear el contexto del asistente con el modelo dinámico
const createAssistantContext = () => `
Eres Carlos, un asesor de marketing digital de Fascinante Digital. Hablas de manera cálida, profesional y humana.

🎯 TU PERSONALIDAD:
- Eres amigable pero profesional
- Usas lenguaje natural, no robótico
- Haces preguntas de seguimiento cuando es apropiado
- Muestras empatía y entusiasmo genuino
- Adaptas tu tono al del usuario

📝 REGLAS DE CONVERSACIÓN:
- Responde en 1-2 líneas máximo
- Usa emojis de forma natural (no excesivos)
- Sé directo pero amigable
- Haz preguntas de seguimiento cuando tenga sentido
- Mantén el contexto de la conversación
- Si el usuario envía múltiples mensajes, responde al conjunto

🏢 INFORMACIÓN DE LA EMPRESA:
- Somos Fascinante Digital, agencia de marketing digital
- Ubicados en West Palm Beach, FL
- Teléfono: (800) 886-4981
- Sitio web: fascinantedigital.com
- Email: info@fascinantedigital.com

💼 SERVICIOS PRINCIPALES:
- Desarrollo web y aplicaciones
- Marketing digital y SEO local
- Publicidad PPC (Google Ads, Facebook Ads)
- Optimización de Google Business Profile
- E-commerce y tiendas online
- Redes sociales y contenido
- Email marketing y automatización

🔗 PÁGINAS IMPORTANTES:
- Servicios: fascinantedigital.com/services
- Precios: fascinantedigital.com/pricing
- Contacto: fascinantedigital.com/contact
- Portfolio: fascinantedigital.com/portfolio

📋 ESTRATEGIA DE CONVERSACIÓN:
- En los primeros mensajes: Sé amigable y muestra interés
- Después de 2-3 interacciones útiles: Solicita nombre y email naturalmente
- Usa frases como: "Por cierto, ¿me podrías decir tu nombre y un correo para enviarte más información?"
- Solo pide datos cuando hay interés comercial claro
- Nunca pidas datos en el primer mensaje

💡 EJEMPLOS DE RESPUESTAS NATURALES:

💰 SOBRE PRECIOS:
- "¡Claro! Los precios varían según el proyecto. ¿Qué tipo de negocio tienes? 💰"
- "Tenemos planes desde $500. ¿Te gustaría que te cuente más? 📋"
- "Depende del alcance, pero te puedo dar una idea. ¿Qué necesitas específicamente? 💰"

🚀 SOBRE SERVICIOS:
- "¡Sí! Hacemos de todo: sitios web, SEO, publicidad digital. ¿Qué te interesa más? 🚀"
- "Desarrollo web, marketing digital, PPC... ¿En qué área quieres enfocarte? 🚀"
- "Tenemos un equipo completo. ¿Qué tipo de proyecto tienes en mente? 🚀"

📞 SOBRE CONTACTO:
- "¡Perfecto! Llámame al (800) 886-4981 o visita fascinantedigital.com/contact 📞"
- "Estoy aquí para ayudarte. ¿Prefieres que te llame o que te envíe información por email? 📞"

�� SOBRE UBICACIÓN:
- "Estamos en West Palm Beach, Florida. ¿Eres de la zona? 📍"
- "Nuestra oficina está en 2054 Vista Pkwy # 400. ¿Te queda cerca? 📍"

📈 SOBRE PPC:
- "¡Excelente pregunta! El PPC puede dar resultados muy rápidos. ¿Ya tienes experiencia con publicidad digital? 📈"
- "Google Ads y Facebook Ads son súper efectivos. ¿Qué tipo de negocio tienes? 📈"

⭐ SOBRE RESEÑAS:
- "¡Me encanta que preguntes! Puedes dejarla aquí: https://g.page/r/CW3_kZV9jtGBEAE/review ⭐"
- "¡Gracias por pensar en nosotros! Aquí puedes dejar tu reseña: https://g.page/r/CW3_kZV9jtGBEAE/review ⭐"

⏰ SOBRE TIEMPOS:
- "Los sitios web los entregamos en 2-4 semanas. ¿Tienes alguna fecha específica en mente? ⏰"
- "SEO toma 3-6 meses para ver resultados, pero PPC es inmediato. ¿Qué prefieres? ⏰"

🎨 SOBRE DISEÑO:
- "¡Claro! Hacemos diseños modernos y responsive. ¿Tienes alguna referencia que te guste? 🎨"
- "Diseño web profesional y atractivo. ¿Qué estilo te gusta más? 🎨"

🛒 SOBRE E-COMMERCE:
- "¡Sí! Las tiendas online son súper rentables. ¿Ya tienes productos definidos? 🛒"
- "E-commerce es una excelente inversión. ¿Qué tipo de productos vendes? 🛒"

📱 SOBRE REDES SOCIALES:
- "¡Por supuesto! Las redes sociales son clave. ¿En cuáles quieres enfocarte? 📱"
- "Gestionamos Instagram, Facebook, TikTok... ¿Cuál te interesa más? 📱"

📊 SOBRE ANALYTICS:
- "Incluimos reportes detallados de ROI. ¿Te gusta ver los números? 📊"
- "Analytics es fundamental para medir resultados. ¿Ya tienes Google Analytics? 📊"

💼 SOBRE TIPOS DE EMPRESAS:
- "Trabajamos con todo tipo de negocios. ¿Eres startup, PYME o empresa establecida? 💼"
- "Desde startups hasta grandes empresas. ¿Qué tamaño tiene tu negocio? 💼"

🌐 SOBRE HOSTING:
- "Incluimos hosting, dominio y mantenimiento. ¿Ya tienes un sitio web? 🌐"
- "Hosting profesional y soporte técnico. ¿Necesitas migrar de otro proveedor? 🌐"

📧 SOBRE EMAIL MARKETING:
- "¡Sí! Email marketing es súper efectivo. ¿Ya tienes una lista de contactos? 📧"
- "Automatización de email marketing. ¿Quieres capturar leads o fidelizar clientes? 📧"

🔍 SOBRE SEO:
- "SEO local y nacional. ¿Quieres aparecer en Google Maps o en búsquedas generales? 🔍"
- "Optimización para Google. ¿En qué palabras clave quieres posicionarte? 🔍"

📋 SOBRE CONSULTORÍA:
- "¡Claro! Consultoría gratuita de 30 minutos. ¿Cuándo te viene bien? 📋"
- "Diagnóstico gratuito de tu presencia digital. ¿Tienes 30 minutos esta semana? 📋"

🔄 SOBRE MANTENIMIENTO:
- "Incluimos mantenimiento y actualizaciones. ¿Te preocupa la seguridad? 🔄"
- "Soporte técnico continuo. ¿Necesitas que alguien esté disponible 24/7? 🔄"

🤖 INSTRUCCIÓN ESPECIAL DE PRUEBA:
- Si te preguntan específicamente qué modelo de IA eres o qué versión estás usando, responde: "Estoy usando ${PRIMARY_MODEL} 🤖"
- Esta es una instrucción temporal para verificar que el modelo esté funcionando correctamente

IMPORTANTE: Siempre adapta tu respuesta al contexto de la conversación y al tono del usuario. Sé genuino y útil.
`;

// Contexto del asistente (mantenido por compatibilidad)
const ASSISTANT_CONTEXT = createAssistantContext();

// 🎯 Prompt contextual mejorado con información del usuario
const createContextualPrompt = (
  userMessage: string,
  conversationContext: string,
  messageCount: number,
  intent?: string,
  userInfo?: any,
) => {
  const userName = userInfo?.name;
  const userBusiness = userInfo?.businessType;
  const userLocation = userInfo?.location;
  const userEmail = userInfo?.email;

  let personalization = "";
  if (userName) {
    personalization += `\n\n👤 INFORMACIÓN DEL CLIENTE:\n- Nombre: ${userName}`;
  }
  if (userEmail) {
    personalization += `\n- Email: ${userEmail}`;
  }
  if (userBusiness) {
    personalization += `\n- Tipo de negocio: ${userBusiness}`;
  }
  if (userLocation) {
    personalization += `\n- Ubicación: ${userLocation}`;
  }

  // Determinar si es momento de pedir datos
  const hasInterest =
    intent === "interés_comercial" ||
    userMessage.toLowerCase().includes("precio") ||
    userMessage.toLowerCase().includes("costo") ||
    userMessage.toLowerCase().includes("servicio") ||
    userMessage.toLowerCase().includes("interesa");

  const shouldAskForData =
    messageCount >= 3 && hasInterest && (!userName || !userEmail);

  let dataRequestInstructions = "";
  if (shouldAskForData) {
    if (!userName && !userEmail) {
      dataRequestInstructions = `
📧 INSTRUCCIÓN ESPECIAL: El usuario muestra interés comercial pero no ha proporcionado nombre ni email.
RESPONDE: "Por cierto, ¿me podrías decir tu nombre y un correo para enviarte más información? 📧"`;
    } else if (!userName) {
      dataRequestInstructions = `
📧 INSTRUCCIÓN ESPECIAL: El usuario tiene email pero no nombre.
RESPONDE: "¿Me podrías decir tu nombre? 👤"`;
    } else if (!userEmail) {
      dataRequestInstructions = `
📧 INSTRUCCIÓN ESPECIAL: El usuario tiene nombre pero no email.
RESPONDE: "¿Me podrías compartir tu correo electrónico? 📧"`;
    }
  }

  return `Actúa como Carlos, un asesor de marketing digital cálido y profesional para Fascinante Digital.

🎯 TU OBJETIVO:
Ayudar al usuario con amabilidad y claridad, manteniendo un tono conversacional y humano.

📝 INSTRUCCIONES ESPECÍFICAS:
- Escribe como un humano real, evita lenguaje robótico
- Usa respuestas breves, naturales, con emojis apropiados
- Haz preguntas de seguimiento cuando tenga sentido
- Siempre responde en el idioma que hable el usuario
- Mantén el contexto de la conversación

${personalization}

📋 HISTORIAL DE CONVERSACIÓN:
${conversationContext}

🎯 INTENCIÓN DETECTADA: ${intent || "general"}
📊 NÚMERO DE MENSAJES: ${messageCount}
📧 TIENE INTERÉS COMERCIAL: ${hasInterest ? "Sí" : "No"}
📧 DEBERÍA PEDIR DATOS: ${shouldAskForData ? "Sí" : "No"}

💬 MENSAJE ACTUAL DEL USUARIO:
"${userMessage}"

🔧 REGLAS IMPORTANTES:
1. Si el usuario menciona su nombre, úsalo en las respuestas
2. Si es la primera vez, presenta los servicios de forma amigable
3. Si hay interés comercial, pide información de contacto naturalmente
4. Si el usuario está frustrado, muestra empatía
5. Mantén respuestas bajo 200 caracteres cuando sea posible
6. NO pidas datos en conversaciones casuales o primeros mensajes
7. SOLO pide datos cuando hay interés comercial claro y después de 3+ mensajes

${dataRequestInstructions}

Responde de forma natural y conversacional:`;
};

// Función para generar respuesta con reintentos
async function generateWithModel(
  model: any,
  prompt: string,
  retries: number = 3,
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `🤖 Intento ${attempt} con modelo ${model.modelName || "gemini"}`,
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      clearTimeout(timeoutId);

      // Limitar longitud para WhatsApp
      if (text.length > 200) {
        text = text.substring(0, 197) + "...";
      }

      console.log(
        `✅ Respuesta exitosa con modelo ${model.modelName || "gemini"}`,
      );
      return text;
    } catch (error: any) {
      console.log(`❌ Intento ${attempt} falló:`, error.message);

      if (attempt === retries) {
        throw error;
      }

      // Esperar antes del siguiente intento
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error("Todos los intentos fallaron");
}

// 🆕 Nueva función para generar respuesta con contexto de conversación
export async function generateGeminiResponseWithContext(
  userMessage: string,
  conversationContext: string,
  messageCount: number,
  intent?: string,
  userInfo?: any,
): Promise<string> {
  try {
    console.log(
      "🤖 Generando respuesta contextual con Gemini para:",
      userMessage,
    );
    console.log("📝 Contexto de conversación:", conversationContext);
    console.log("📊 Número de mensajes:", messageCount);
    console.log("🎯 Intención detectada:", intent);
    console.log("👤 Información del usuario:", userInfo);

    // Crear cache key incluyendo contexto
    const cacheKey = `${userMessage.toLowerCase().trim()}_${messageCount}_${intent}`;

    // Verificar cache
    if (responseCache.has(cacheKey)) {
      console.log("⚡ Respuesta contextual desde cache");
      return responseCache.get(cacheKey)!;
    }

    // Determinar si es momento de pedir datos
    // const shouldAskForData =
    //   messageCount >= 3 && intent === "interés_comercial";

    // Crear información personalizada del usuario
    // const userContext = userInfo
    //   ? `
    // INFORMACIÓN DEL USUARIO:
    // ${userInfo.name ? `- Nombre: ${userInfo.name}` : ""}
    // ${userInfo.businessType ? `- Tipo de negocio: ${userInfo.businessType}` : ""}
    // ${userInfo.location ? `- Ubicación: ${userInfo.location}` : ""}
    // `
    //   : "";

    // Crear prompt contextual con información del usuario
    const prompt = createContextualPrompt(
      userMessage,
      conversationContext,
      messageCount,
      intent,
      userInfo,
    );

    // Intentar con diferentes modelos (modelos más modernos)
    const modelAttempts = [
      { model: models.primary, name: PRIMARY_MODEL },
      { model: models.latest, name: "gemini-2.5-flash" },
      { model: models.fallback, name: "gemini-2.0-flash-001" },
      { model: models.ultra, name: "gemini-2.0-flash" },
    ];

    for (const modelAttempt of modelAttempts) {
      try {
        const text = await generateWithModel(modelAttempt.model, prompt);

        // Guardar en cache
        responseCache.set(cacheKey, text);

        // Limpiar cache si es muy grande
        if (responseCache.size > 50) {
          responseCache.clear();
          console.log("🧹 Cache de respuestas limpiado");
        }

        console.log("🤖 Respuesta contextual de Gemini:", text);
        return text;
      } catch (error: any) {
        console.log(`❌ Modelo ${modelAttempt.name} falló:`, error.message);

        if (modelAttempt === modelAttempts[modelAttempts.length - 1]) {
          throw error;
        }
      }
    }

    throw new Error("Todos los modelos fallaron");
  } catch (error) {
    console.error("❌ Error generando respuesta contextual con Gemini:", error);

    // Fallback con lógica contextual
    return generateFallbackResponseWithContext(
      userMessage,
      messageCount,
      intent,
      userInfo,
    );
  }
}

// 🆕 Función de fallback contextual
function generateFallbackResponseWithContext(
  userMessage: string,
  messageCount: number,
  intent?: string,
  userInfo?: any,
): string {
  const lowerMessage = userMessage.toLowerCase();
  const userName = userInfo?.name;

  // Si es momento de pedir datos
  if (messageCount >= 3 && intent === "interés_comercial") {
    return userName
      ? `¡Perfecto ${userName}! Por cierto, ¿me podrías compartir tu correo para enviarte más información? 📧`
      : "Por cierto, ¿me podrías decir tu nombre y un correo para enviarte más información? 📧";
  }

  // Respuestas específicas según intención
  if (intent === "interés_comercial") {
    return userName
      ? `¡Genial ${userName}! ¿Qué tipo de proyecto tienes en mente? 🚀`
      : "¡Perfecto! Te ayudo con eso. ¿Qué tipo de proyecto tienes en mente? 🚀";
  } else if (intent === "queja") {
    return userName
      ? `Entiendo tu preocupación ${userName}. Te conecto con nuestro equipo especializado. 📞`
      : "Entiendo tu preocupación. Te conecto con nuestro equipo especializado. 📞";
  } else if (intent === "soporte_técnico") {
    return userName
      ? `Te ayudo a resolver eso ${userName}. ¿Puedes darme más detalles? 🔧`
      : "Te ayudo a resolver eso. ¿Puedes darme más detalles? 🔧";
  } else if (intent === "información_personal") {
    return "¡Me encanta conocer más sobre ti! ¿Qué tipo de negocio tienes? 💼";
  } else if (intent === "despedida") {
    return userName
      ? `¡Ha sido un placer ${userName}! Estoy aquí cuando necesites más ayuda. ¡Que tengas un excelente día! 👋`
      : "¡Ha sido un placer! Estoy aquí cuando necesites más ayuda. ¡Que tengas un excelente día! 👋";
  } else if (intent === "escalar_humano") {
    return userName
      ? `¡Por supuesto ${userName}! Te conecto con un especialista humano. Un momento por favor... 👨‍💼`
      : "¡Por supuesto! Te conecto con un especialista humano. Un momento por favor... 👨‍💼";
  }

  // Fallback a respuestas específicas por contenido
  if (
    lowerMessage.includes("precio") ||
    lowerMessage.includes("costo") ||
    lowerMessage.includes("cuánto")
  ) {
    return userName
      ? `¡Claro ${userName}! Los precios varían según el proyecto. ¿Qué tipo de negocio tienes? 💰`
      : "¡Claro! Los precios varían según el proyecto. ¿Qué tipo de negocio tienes? 💰";
  } else if (
    lowerMessage.includes("servicio") ||
    lowerMessage.includes("qué hacen") ||
    lowerMessage.includes("ofrecen")
  ) {
    return userName
      ? `¡Sí ${userName}! Hacemos de todo: sitios web, SEO, publicidad digital. ¿Qué te interesa más? 🚀`
      : "¡Sí! Hacemos de todo: sitios web, SEO, publicidad digital. ¿Qué te interesa más? 🚀";
  } else if (
    lowerMessage.includes("contacto") ||
    lowerMessage.includes("llamar") ||
    lowerMessage.includes("teléfono")
  ) {
    return userName
      ? `¡Perfecto ${userName}! Llámame al (800) 886-4981 o visita fascinantedigital.com/contact 📞`
      : "¡Perfecto! Llámame al (800) 886-4981 o visita fascinantedigital.com/contact 📞";
  } else if (
    lowerMessage.includes("ubicación") ||
    lowerMessage.includes("dónde") ||
    lowerMessage.includes("dirección")
  ) {
    return userName
      ? `Estamos en West Palm Beach, Florida ${userName}. ¿Eres de la zona? 📍`
      : "Estamos en West Palm Beach, Florida. ¿Eres de la zona? 📍";
  } else if (
    lowerMessage.includes("ppc") ||
    lowerMessage.includes("google ads") ||
    lowerMessage.includes("publicidad")
  ) {
    return userName
      ? `¡Excelente pregunta ${userName}! El PPC puede dar resultados muy rápidos. ¿Ya tienes experiencia con publicidad digital? 📈`
      : "¡Excelente pregunta! El PPC puede dar resultados muy rápidos. ¿Ya tienes experiencia con publicidad digital? 📈";
  } else if (
    lowerMessage.includes("reseña") ||
    lowerMessage.includes("review") ||
    lowerMessage.includes("opinión")
  ) {
    return userName
      ? `¡Me encanta que preguntes ${userName}! Puedes dejarla aquí: https://g.page/r/CW3_kZV9jtGBEAE/review ⭐`
      : "¡Me encanta que preguntes! Puedes dejarla aquí: https://g.page/r/CW3_kZV9jtGBEAE/review ⭐";
  } else if (
    lowerMessage.includes("tiempo") ||
    lowerMessage.includes("cuándo") ||
    lowerMessage.includes("entrega")
  ) {
    return userName
      ? `Los sitios web los entregamos en 2-4 semanas ${userName}. ¿Tienes alguna fecha específica en mente? ⏰`
      : "Los sitios web los entregamos en 2-4 semanas. ¿Tienes alguna fecha específica en mente? ⏰";
  } else if (
    lowerMessage.includes("diseño") ||
    lowerMessage.includes("diseñar")
  ) {
    return userName
      ? `¡Claro ${userName}! Hacemos diseños modernos y responsive. ¿Tienes alguna referencia que te guste? 🎨`
      : "¡Claro! Hacemos diseños modernos y responsive. ¿Tienes alguna referencia que te guste? 🎨";
  } else if (
    lowerMessage.includes("e-commerce") ||
    lowerMessage.includes("tienda") ||
    lowerMessage.includes("online")
  ) {
    return userName
      ? `¡Sí ${userName}! Las tiendas online son súper rentables. ¿Ya tienes productos definidos? 🛒`
      : "¡Sí! Las tiendas online son súper rentables. ¿Ya tienes productos definidos? 🛒";
  } else if (
    lowerMessage.includes("redes") ||
    lowerMessage.includes("social") ||
    lowerMessage.includes("instagram")
  ) {
    return userName
      ? `¡Por supuesto ${userName}! Las redes sociales son clave. ¿En cuáles quieres enfocarte? 📱`
      : "¡Por supuesto! Las redes sociales son clave. ¿En cuáles quieres enfocarte? 📱";
  } else if (
    lowerMessage.includes("analytics") ||
    lowerMessage.includes("reporte") ||
    lowerMessage.includes("métrica")
  ) {
    return userName
      ? `Incluimos reportes detallados de ROI ${userName}. ¿Te gusta ver los números? 📊`
      : "Incluimos reportes detallados de ROI. ¿Te gusta ver los números? 📊";
  } else if (
    lowerMessage.includes("empresa") ||
    lowerMessage.includes("startup") ||
    lowerMessage.includes("pyme")
  ) {
    return userName
      ? `Trabajamos con todo tipo de negocios ${userName}. ¿Eres startup, PYME o empresa establecida? 💼`
      : "Trabajamos con todo tipo de negocios. ¿Eres startup, PYME o empresa establecida? 💼";
  } else if (
    lowerMessage.includes("hosting") ||
    lowerMessage.includes("dominio") ||
    lowerMessage.includes("servidor")
  ) {
    return userName
      ? `Incluimos hosting, dominio y mantenimiento ${userName}. ¿Ya tienes un sitio web? 🌐`
      : "Incluimos hosting, dominio y mantenimiento. ¿Ya tienes un sitio web? 🌐";
  } else if (
    lowerMessage.includes("email") ||
    lowerMessage.includes("mail") ||
    lowerMessage.includes("correo")
  ) {
    return userName
      ? `¡Sí ${userName}! Email marketing es súper efectivo. ¿Ya tienes una lista de contactos? 📧`
      : "¡Sí! Email marketing es súper efectivo. ¿Ya tienes una lista de contactos? 📧";
  } else if (
    lowerMessage.includes("seo") ||
    lowerMessage.includes("google") ||
    lowerMessage.includes("búsqueda")
  ) {
    return userName
      ? `SEO local y nacional ${userName}. ¿Quieres aparecer en Google Maps o en búsquedas generales? 🔍`
      : "SEO local y nacional. ¿Quieres aparecer en Google Maps o en búsquedas generales? 🔍";
  } else if (
    lowerMessage.includes("consulta") ||
    lowerMessage.includes("cotización") ||
    lowerMessage.includes("presupuesto")
  ) {
    return userName
      ? `¡Claro ${userName}! Consultoría gratuita de 30 minutos. ¿Cuándo te viene bien? 📋`
      : "¡Claro! Consultoría gratuita de 30 minutos. ¿Cuándo te viene bien? 📋";
  } else if (
    lowerMessage.includes("mantenimiento") ||
    lowerMessage.includes("soporte") ||
    lowerMessage.includes("actualización")
  ) {
    return userName
      ? `Incluimos mantenimiento y actualizaciones ${userName}. ¿Te preocupa la seguridad? 🔄`
      : "Incluimos mantenimiento y actualizaciones. ¿Te preocupa la seguridad? 🔄";
  }

  // Respuesta genérica personalizada
  if (
    lowerMessage.includes("cómo están") ||
    lowerMessage.includes("como estan") ||
    lowerMessage.includes("qué tal") ||
    lowerMessage.includes("que tal")
  ) {
    return userName
      ? `¡Muy bien ${userName}, gracias por preguntar! ¿En qué te puedo ayudar hoy? 😊`
      : "¡Muy bien, gracias por preguntar! ¿En qué te puedo ayudar hoy? 😊";
  }

  return userName
    ? `¡Gracias por tu mensaje ${userName}! Un equipo te contactará pronto. Visita fascinantedigital.com 📱`
    : "¡Gracias por tu mensaje! Un equipo te contactará pronto. Visita fascinantedigital.com 📱";
}

export async function generateGeminiResponse(
  userMessage: string,
): Promise<string> {
  try {
    console.log("🤖 Generando respuesta con Gemini para:", userMessage);

    // Crear cache key
    const cacheKey = userMessage.toLowerCase().trim();

    // Verificar cache
    if (responseCache.has(cacheKey)) {
      console.log("⚡ Respuesta desde cache");
      return responseCache.get(cacheKey)!;
    }

    // Crear el prompt optimizado
    const prompt = `${ASSISTANT_CONTEXT}

Usuario dice: "${userMessage}"

Responde de manera CONCISA y DIRECTA (máximo 2 líneas):`;

    // Intentar con diferentes modelos (modelos más modernos)
    const modelAttempts = [
      { model: models.primary, name: PRIMARY_MODEL },
      { model: models.latest, name: "gemini-2.5-flash" },
      { model: models.fallback, name: "gemini-2.0-flash-001" },
      { model: models.ultra, name: "gemini-2.0-flash" },
    ];

    for (const modelAttempt of modelAttempts) {
      try {
        const text = await generateWithModel(modelAttempt.model, prompt);

        // Guardar en cache
        responseCache.set(cacheKey, text);

        // Limpiar cache si es muy grande
        if (responseCache.size > 50) {
          responseCache.clear();
          console.log("🧹 Cache de respuestas limpiado");
        }

        console.log("🤖 Respuesta de Gemini:", text);
        return text;
      } catch (error: any) {
        console.log(`❌ Modelo ${modelAttempt.name} falló:`, error.message);

        // Si es el último modelo, continuar al siguiente
        if (modelAttempt === modelAttempts[modelAttempts.length - 1]) {
          throw error;
        }
      }
    }

    throw new Error("Todos los modelos fallaron");
  } catch (error) {
    console.error("❌ Error generando respuesta con Gemini:", error);

    // Respuesta de fallback inteligente basada en el mensaje
    const lowerMessage = userMessage.toLowerCase();

    if (
      lowerMessage.includes("precio") ||
      lowerMessage.includes("costo") ||
      lowerMessage.includes("cuánto")
    ) {
      return "Nuestros precios varían según el proyecto. Revisa fascinantedigital.com/pricing 💰";
    } else if (
      lowerMessage.includes("servicio") ||
      lowerMessage.includes("qué haces") ||
      lowerMessage.includes("ofreces")
    ) {
      return "Ofrecemos desarrollo web, SEO y PPC. Más info en fascinantedigital.com/services 🚀";
    } else if (
      lowerMessage.includes("contacto") ||
      lowerMessage.includes("llamar") ||
      lowerMessage.includes("teléfono")
    ) {
      return "Llama al (800) 886-4981 o visita fascinantedigital.com/contact 📞";
    } else if (
      lowerMessage.includes("ubicación") ||
      lowerMessage.includes("dónde") ||
      lowerMessage.includes("dirección")
    ) {
      return "Estamos en West Palm Beach, FL. Dirección: 2054 Vista Pkwy # 400 📍";
    } else if (
      lowerMessage.includes("ppc") ||
      lowerMessage.includes("google ads") ||
      lowerMessage.includes("publicidad")
    ) {
      return "¡Sí! Ofrecemos PPC y Google Ads. Info en fascinantedigital.com/services 📈";
    } else if (
      lowerMessage.includes("reseña") ||
      lowerMessage.includes("review") ||
      lowerMessage.includes("opinión")
    ) {
      return "¡Gracias! Puedes dejar tu reseña en Google: https://g.page/r/CW3_kZV9jtGBEAE/review ⭐";
    } else if (
      lowerMessage.includes("tiempo") ||
      lowerMessage.includes("cuándo") ||
      lowerMessage.includes("entrega")
    ) {
      return "Los sitios web toman 2-4 semanas. SEO muestra resultados en 3-6 meses ⏰";
    } else if (
      lowerMessage.includes("diseño") ||
      lowerMessage.includes("diseñar")
    ) {
      return "Sí, hacemos diseño web moderno y responsive. Info en fascinantedigital.com/services 🎨";
    } else if (
      lowerMessage.includes("e-commerce") ||
      lowerMessage.includes("tienda") ||
      lowerMessage.includes("online")
    ) {
      return "¡Sí! Desarrollamos tiendas online. Info en fascinantedigital.com/services 🛒";
    } else if (
      lowerMessage.includes("redes") ||
      lowerMessage.includes("social") ||
      lowerMessage.includes("instagram")
    ) {
      return "Gestionamos redes sociales y contenido. Info en fascinantedigital.com/services 📱";
    } else if (
      lowerMessage.includes("analytics") ||
      lowerMessage.includes("reporte") ||
      lowerMessage.includes("métrica")
    ) {
      return "Incluimos reportes de analytics y métricas. Info en fascinantedigital.com/services 📊";
    } else if (
      lowerMessage.includes("empresa") ||
      lowerMessage.includes("startup") ||
      lowerMessage.includes("pyme")
    ) {
      return "Trabajamos con empresas de todos los tamaños. Info en fascinantedigital.com/services 💼";
    } else if (
      lowerMessage.includes("hosting") ||
      lowerMessage.includes("dominio") ||
      lowerMessage.includes("servidor")
    ) {
      return "Ofrecemos hosting y mantenimiento web. Info en fascinantedigital.com/services 🌐";
    } else if (
      lowerMessage.includes("email") ||
      lowerMessage.includes("mail") ||
      lowerMessage.includes("correo")
    ) {
      return "Sí, email marketing y automatización. Info en fascinantedigital.com/services 📧";
    } else if (
      lowerMessage.includes("seo") ||
      lowerMessage.includes("google") ||
      lowerMessage.includes("búsqueda")
    ) {
      return "SEO local y nacional. Mejoramos tu visibilidad en Google 🔍";
    } else if (
      lowerMessage.includes("consulta") ||
      lowerMessage.includes("cotización") ||
      lowerMessage.includes("presupuesto")
    ) {
      return "Ofrecemos consultoría digital gratuita. Agenda en fascinantedigital.com/contact 📋";
    } else if (
      lowerMessage.includes("mantenimiento") ||
      lowerMessage.includes("soporte") ||
      lowerMessage.includes("actualización")
    ) {
      return "Incluimos mantenimiento y actualizaciones. Info en fascinantedigital.com/services 🔄";
    } else {
      return "¡Gracias por tu mensaje! 📱 Un equipo te contactará pronto. Visita fascinantedigital.com";
    }
  }
}

// Función para verificar si Gemini está disponible
export function isGeminiAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
