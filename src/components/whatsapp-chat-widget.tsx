"use client";

import { IconBrandWhatsapp } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

interface WhatsAppChatWidgetProps {
  position?: "bottom-right" | "bottom-left";
  theme?: "light" | "dark";
}

export function WhatsAppChatWidget({
  position = "bottom-right",
  theme = "light", // eslint-disable-line @typescript-eslint/no-unused-vars
}: WhatsAppChatWidgetProps) {
  const openWhatsApp = () => {
    // Usar el enlace directo de WhatsApp Business
    const whatsappUrl = "https://wa.me/message/IMZMNGIGW3EVB1";
    window.open(whatsappUrl, "_blank");
  };

  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Solo el botón flotante que abre WhatsApp directamente */}
      <Button
        onClick={openWhatsApp}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
        title="Abrir WhatsApp"
      >
        <IconBrandWhatsapp className="w-7 h-7" />
      </Button>
    </div>
  );
}
