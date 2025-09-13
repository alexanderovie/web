"use client";

import { useState } from "react";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ForgotPasswordSection = () => {
  const t = useTranslations("forgotPasswordPage");
  const pathname = usePathname();
  const locale = pathname ? pathname.split("/")[1] || "es" : "es";
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica real de envío
    setSent(true);
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      {/* Columna izquierda: Formulario */}
      <div className="flex flex-1 flex-col justify-center items-center py-16 lg:py-0 order-1 lg:order-1">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center px-6 lg:px-0 h-[530px]">
          {/* Logo arriba del formulario en todas las resoluciones */}
          <div className="flex justify-center mb-6 w-full">
            <a href={`/${locale}`} aria-label="Ir al inicio">
              <Image
                src="/images/fascinante-digital-logo.svg"
                alt="Fascinante Digital"
                width={150}
                height={40}
              />
            </a>
          </div>
          <div className="mb-8 w-full text-center">
            <p className="text-muted-foreground">
              {t("title")} {t("subtitle")}
            </p>
          </div>
          {sent ? (
            <div className="w-full max-w-sm mx-auto text-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg py-8 px-4">
              {t("confirmation")}
            </div>
          ) : (
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="mt-2 w-full">
                {t("sendButton")}
              </Button>
            </form>
          )}
        </div>
      </div>
      {/* Columna derecha: Branding vacía solo en escritorio */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-muted p-12 order-2"></div>
    </section>
  );
};

export default ForgotPasswordSection;
