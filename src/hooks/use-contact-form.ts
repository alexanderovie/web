"use client";

import { useState } from "react";
import { toast } from "sonner";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

interface UseContactFormReturn {
  submitForm: (formData: ContactFormData) => Promise<void>;
  isLoading: boolean;
  message: string;
  isSuccess: boolean;
  isError: boolean;
  resetForm: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const submitForm = async (formData: ContactFormData) => {
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);
    setIsError(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage("¡Mensaje enviado correctamente! Te responderemos pronto.");
        setIsSuccess(true);
        setIsError(false);
        
        // Toast élite con Sonner
        toast.success("¡Mensaje enviado!", {
          description: "Te responderemos en 24 horas",
          duration: 4000,
          action: {
            label: "Ver mensaje",
            onClick: () => console.log("Ver mensaje enviado")
          }
        });
      } else {
        const errorMessage = result.error || "Error al enviar el mensaje. Inténtalo de nuevo.";
        setMessage(errorMessage);
        setIsSuccess(false);
        setIsError(true);
        
        // Toast de error con Sonner
        toast.error("Error al enviar", {
          description: errorMessage,
          duration: 5000
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Contact form error:", error);
      const errorMessage = "Error de conexión. Verifica tu internet e inténtalo de nuevo.";
      setMessage(errorMessage);
      setIsSuccess(false);
      setIsError(true);
      
      // Toast de error de conexión con Sonner
      toast.error("Error de conexión", {
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMessage("");
    setIsSuccess(false);
    setIsError(false);
    setIsLoading(false);
  };

  return {
    submitForm,
    isLoading,
    message,
    isSuccess,
    isError,
    resetForm,
  };
}
