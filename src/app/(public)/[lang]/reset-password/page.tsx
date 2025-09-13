"use client";
import { useState } from "react";

import Image from "next/image";
import { usePathname } from "next/navigation";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const t = useTranslations("resetPasswordPage");
  const pathname = usePathname();
  const locale = pathname ? pathname.split("/")[1] || "es" : "es";
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || !confirm) {
      setError(t("errorRequired"));
      return;
    }
    if (password !== confirm) {
      setError(t("errorMatch"));
      return;
    }
    setLoading(true);
    // Aquí iría la lógica real de reset con el token
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <section className="min-h-screen flex flex-col lg:flex-row">
      {/* Columna izquierda: Formulario */}
      <div className="flex flex-1 flex-col justify-center items-center py-16 lg:py-0 order-1 lg:order-1">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center px-6 lg:px-0">
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
          {success ? (
            <div className="w-full max-w-sm mx-auto text-center text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg py-8 px-4">
              {t("success")}
            </div>
          ) : (
            <form
              className="w-full flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <Input
                type="password"
                placeholder={t("passwordPlaceholder")}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t("confirmPlaceholder")}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}
              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? t("loading") : t("sendButton")}
              </Button>
            </form>
          )}
        </div>
      </div>
      {/* Columna derecha: Branding vacía solo en escritorio */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-muted p-12 order-2"></div>
    </section>
  );
}
