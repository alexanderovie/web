// Enviar un mensaje de texto simple por la API de WhatsApp
export async function sendWhatsAppMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: message },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    // Production: Message send error handled
    throw new Error(error);
  }

  return res.json();
}

// Tipos para botones interactivos
export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface WhatsAppInteractiveMessage {
  header?: {
    type: "text" | "image" | "video" | "document";
    text?: string;
    image?: { id?: string; link?: string };
    video?: { id?: string; link?: string };
    document?: { id?: string; link?: string; filename?: string };
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  buttons: WhatsAppButton[];
}

// Enviar mensaje interactivo con botones
export async function sendWhatsAppInteractiveMessage(
  to: string,
  message: WhatsAppInteractiveMessage,
) {
  const url = `https://graph.facebook.com/v18.0/${process.env.META_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      ...(message.header && { header: message.header }),
      body: message.body,
      ...(message.footer && { footer: message.footer }),
      action: {
        buttons: message.buttons.map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title,
          },
        })),
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    // Production: Interactive message error handled
    throw new Error(error);
  }

  return res.json();
}

// Función helper para crear mensajes con botones de servicios
export async function sendServicesButtonsMessage(to: string) {
  const message: WhatsAppInteractiveMessage = {
    body: {
      text: "¡Hola! Soy Carlos de Fascinante Digital. ¿En qué servicio te puedo ayudar? 🚀",
    },
    footer: {
      text: "Fascinante Digital - Marketing Digital Profesional",
    },
    buttons: [
      {
        id: "web-development",
        title: "🌐 Desarrollo Web",
      },
      {
        id: "seo-marketing",
        title: "📈 SEO y Marketing",
      },
      {
        id: "ppc-ads",
        title: "💰 Publicidad PPC",
      },
    ],
  };

  return sendWhatsAppInteractiveMessage(to, message);
}

// Función helper para crear mensajes con botones de contacto
export async function sendContactButtonsMessage(to: string) {
  const message: WhatsAppInteractiveMessage = {
    body: {
      text: "¿Cómo prefieres que te contactemos? 📞",
    },
    footer: {
      text: "Fascinante Digital - (800) 886-4981",
    },
    buttons: [
      {
        id: "call-now",
        title: "📞 Llamar ahora",
      },
      {
        id: "send-info",
        title: "📧 Enviar información",
      },
      {
        id: "schedule-call",
        title: "📅 Agendar llamada",
      },
    ],
  };

  return sendWhatsAppInteractiveMessage(to, message);
}

// Función helper para crear mensajes con botones de precios
export async function sendPricingButtonsMessage(to: string) {
  const message: WhatsAppInteractiveMessage = {
    body: {
      text: "Tenemos diferentes planes según tus necesidades. ¿Qué te interesa más? 💰",
    },
    footer: {
      text: "Visita fascinantedigital.com/pricing",
    },
    buttons: [
      {
        id: "basic-plan",
        title: "🚀 Plan Básico",
      },
      {
        id: "premium-plan",
        title: "⭐ Plan Premium",
      },
      {
        id: "custom-quote",
        title: "💼 Cotización personalizada",
      },
    ],
  };

  return sendWhatsAppInteractiveMessage(to, message);
}
