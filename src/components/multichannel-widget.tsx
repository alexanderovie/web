"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Phone,
  Mail,
  Instagram,
  Facebook,
  X,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunicationOption {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  action: () => void;
  description: string;
}

const communicationOptions: CommunicationOption[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    color: "#25D366",
    bgColor: "bg-green-500",
    description: "Chatea con nosotros",
    action: () => window.open("https://wa.me/message/IMZMNGIGW3EVB1", "_blank"),
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    bgColor: "bg-pink-500",
    description: "Síguenos en Instagram",
    action: () =>
      window.open("https://instagram.com/fascinantedigital", "_blank"),
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: Facebook,
    color: "#0084FF",
    bgColor: "bg-blue-500",
    description: "Envíanos un mensaje",
    action: () => window.open("https://m.me/fascinante.digital", "_blank"),
  },
  {
    id: "phone",
    name: "Llamar",
    icon: Phone,
    color: "#4CAF50",
    bgColor: "bg-green-600",
    description: "Llámanos ahora",
    action: () => window.open("tel:+18008864981", "_blank"),
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    color: "#FF5722",
    bgColor: "bg-orange-500",
    description: "Envíanos un email",
    action: () =>
      window.open(
        "mailto:info@fascinantedigital.com?subject=Consulta%20sobre%20servicios",
        "_blank",
      ),
  },
];

export default function MultichannelWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar el widget después de 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleOptionClick = (option: CommunicationOption) => {
    option.action();
    setIsOpen(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] md:bottom-4 md:right-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "bg-white shadow-2xl border border-gray-200 overflow-hidden",
              // Desktop: diseño original
              "md:max-w-sm md:h-auto md:rounded-2xl md:mb-4",
              // Mobile: pantalla completa con dvh - FORZADO
              "w-screen h-screen max-w-screen mb-0 rounded-none",
              "md:relative md:bottom-auto md:right-auto",
              // Mobile: posición fija ocupando toda la pantalla - FORZADO
              "fixed inset-0 md:static",
              "md:top-auto md:left-auto md:right-auto md:bottom-auto",
              "md:w-auto md:h-auto md:max-w-sm md:rounded-2xl",
              // Z-index alto para asegurar que esté por encima de todo
              "z-[9999]",
            )}
          >
            <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-white">
                    ¿Cómo podemos ayudarte?
                  </h3>
                  <p className="text-sm text-white/90">
                    Elige tu forma preferida de contacto
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto h-[calc(100vh-80px)] md:max-h-none">
              {communicationOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionClick(option)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                    "hover:shadow-md border border-gray-100",
                    "group",
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      option.bgColor,
                      "group-hover:scale-110",
                    )}
                  >
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">
                      {option.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {option.description}
                    </div>
                  </div>
                  <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-lg border-2 border-white",
          "bg-gradient-to-r from-blue-600 to-purple-600",
          "flex items-center justify-center",
          "transition-all duration-200 hover:shadow-xl",
        )}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
