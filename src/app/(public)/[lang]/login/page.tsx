"use client";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const t = useTranslations("loginPage");
  const pathname = usePathname();
  const locale = pathname ? pathname.split("/")[1] || "en" : "en";
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams ? searchParams.get("next") : null;

  if (status === "authenticated") {
    if (next) {
      // Si next no empieza con /[lang]/, anteponer el segmento de idioma
      const nextWithLang = next.startsWith(`/${locale}/`)
        ? next
        : `/${locale}${next.startsWith("/") ? next : "/" + next}`;
      router.replace(nextWithLang);
    } else {
      router.replace("https://dashboard.fascinantedigital.com");
    }
    return null;
  }
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
              {locale === "es"
                ? "Inicia sesión para acceder a tu cuenta."
                : "Sign in to access your account."}
            </p>
            <p className="text-muted-foreground">
              {locale === "es"
                ? "Por favor ingresa tus datos"
                : "Please Enter Your Details"}
            </p>
          </div>
          <form className="w-full flex flex-col gap-4">
            <Input type="email" placeholder={t("emailPlaceholder")} required />
            <Input
              type="password"
              placeholder={t("passwordPlaceholder")}
              required
            />
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-muted-foreground" />
                <label
                  htmlFor="remember"
                  className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t("rememberMe")}
                </label>
              </div>
              <a
                href={`/${locale}/forgot-password`}
                className="text-primary text-sm font-medium"
              >
                {t("forgotPassword")}
              </a>
            </div>
            <Button type="submit" className="mt-2 w-full">
              {t("loginButton")}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn("google")}
            >
              <FcGoogle className="mr-2 size-5" />
              {t("loginWithGoogle")}
            </Button>
            <div className="text-muted-foreground mx-auto mt-8 flex justify-center gap-1 text-sm">
              <p>{t("noAccount")}</p>
              <a
                href={`/${locale}/signup`}
                className="text-primary font-medium"
              >
                {t("signupLink")}
              </a>
            </div>
          </form>
        </div>
      </div>
      {/* Columna derecha: Branding vacía solo en escritorio */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-muted p-12 order-2"></div>
    </section>
  );
}
