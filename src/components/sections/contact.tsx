"use client";

import React, { useState } from "react";

import Link from "next/link";

import {
  Mail,
  Phone,
  Building,
  ChevronRight,
  LucideIcon,
  AlertCircle,
} from "lucide-react";

import SectionHeader from "../section-header";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContactForm } from "@/hooks/use-contact-form";

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description:
      "¿Tienes una pregunta o necesitas ayuda? Envíanos un correo y te responderemos en 24 horas.",
    contact: (
      <Link
        href="mailto:infinfo@fascinantedigital.com"
        className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        infinfo@fascinantedigital.com
        <ChevronRight className="size-4" />
      </Link>
    ),
  },
  {
    icon: Phone,
    title: "Teléfono",
    description:
      "¿Prefieres hablar? Llámanos de Lunes a Viernes, 9 AM - 5 PM EST.",
    contact: (
      <Link
        href="tel:+18008864981"
        className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        (800) 886-4981
        <ChevronRight className="size-4" />
      </Link>
    ),
  },
  {
    icon: Building,
    title: "Oficina",
    description:
      "Visítanos en nuestra oficina @ 2054 Vista Pkwy # 400, West Palm Beach, FL 33411",
    contact: (
      <Link
        href="https://maps.app.goo.gl/GMfpwYgtGFioasvC9"
        target="_blank"
        rel="noopener noreferrer"
        className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:underline"
      >
        Ver en Google Maps
        <ChevronRight className="size-4" />
      </Link>
    ),
  },
];

const formFields = [
  {
    id: "name",
    label: "Nombre",
    type: "text",
    component: Input,
    required: true,
  },
  {
    id: "email",
    label: "Correo Electrónico",
    type: "email",
    component: Input,
    required: true,
  },
  {
    id: "message",
    label: "Mensaje",
    component: Textarea,
    required: true,

    props: {
      placeholder: "Escribe tu mensaje...",
      rows: 4,
    },
  },
];
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { submitForm, isLoading, message, isSuccess, isError, resetForm } =
    useContactForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Por favor acepta los términos y condiciones");
      return;
    }

    await submitForm(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", message: "" });
    setTermsAccepted(false);
    resetForm();
  };

  return (
    <section className="py-14 md:py-20 lg:py-24">
      <SectionHeader
        icon={Mail}
        iconTitle="Contáctanos"
        title="Ponte en Contacto"
        description="Estamos aquí para ayudarte—contáctanos con cualquier pregunta o comentario."
        className="border-none !pb-0"
      />

      <div className="container flex justify-between gap-10 py-12 max-md:flex-col">
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className="text-sm font-normal" htmlFor={field.id}>
                {field.label}
              </Label>
              <field.component
                id={field.id}
                name={field.id}
                type={field.type}
                required={field.required}
                className="border-border bg-card"
                value={formData[field.id as keyof typeof formData]}
                onChange={handleInputChange}
                {...field.props}
              />
            </div>
          ))}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) =>
                setTermsAccepted(checked as boolean)
              }
              required
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Acepto los{" "}
                <Link href="/terms" className="underline">
                  Términos
                </Link>
              </Label>
            </div>
          </div>

          {/* Mensaje de estado - Solo para casos especiales, Sonner maneja la mayoría */}
          {message && !isSuccess && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                isError
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              {isError ? <AlertCircle className="size-4" /> : null}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading || !termsAccepted}
              className="flex-1"
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>

            {isSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex-1"
              >
                Nuevo Mensaje
              </Button>
            )}
          </div>
        </form>

        <div className="grid flex-1 gap-6 self-start lg:grid-cols-2">
          {contactMethods.map((method, index) => (
            <ContactMethod key={index} {...method} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface ContactMethodProps {
  icon: LucideIcon;
  title: string;
  description: string;
  contact: React.ReactNode;
}

const ContactMethod = ({
  icon: Icon,
  title,
  description,
  contact,
}: ContactMethodProps) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Icon className="size-5" />
      <h3 className="text-2xl tracking-[-0.96px]">{title}</h3>
    </div>
    <div className="space-y-2 tracking-[-0.32px]">
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="text-muted-foreground text-sm">{contact}</div>
    </div>
  </div>
);

export default Contact;
