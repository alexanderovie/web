"use client";

import { useState } from "react";

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
      } else {
        setMessage(
          result.error || "Error al enviar el mensaje. Inténtalo de nuevo.",
        );
        setIsSuccess(false);
        setIsError(true);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Contact form error:", error);
      setMessage(
        "Error de conexión. Verifica tu internet e inténtalo de nuevo.",
      );
      setIsSuccess(false);
      setIsError(true);
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
