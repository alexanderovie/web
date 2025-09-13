"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormData {
  to: string;
  date: string;
  time: string;
}

export default function WhatsAppForm() {
  const [formData, setFormData] = useState<FormData>({
    to: "+15617204693",
    date: "12/1",
    time: "3pm",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/send-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: `Mensaje enviado exitosamente! SID: ${data.sid}`,
        });
      } else {
        setMessage({
          type: "error",
          text: `Error: ${data.error}`,
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Error al enviar el mensaje",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        Enviar Mensaje WhatsApp
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="to">Número de teléfono</Label>
          <Input
            id="to"
            type="tel"
            value={formData.to}
            onChange={handleChange("to")}
            placeholder="+15617204693"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="text"
            value={formData.date}
            onChange={handleChange("date")}
            placeholder="12/1"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="time">Hora</Label>
          <Input
            id="time"
            type="text"
            value={formData.time}
            onChange={handleChange("time")}
            placeholder="3pm"
            required
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Enviando..." : "Enviar Mensaje"}
        </Button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
