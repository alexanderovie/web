"use client";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const t = useTranslations("signupPage");
  const pathname = usePathname();
  const locale = pathname ? pathname.split("/")[1] || "en" : "en";
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.replace(`/${locale}/dashboard`);
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
              {t("mainTitle")} {t("subtitle")}
            </p>
          </div>
          <form className="w-full flex flex-col gap-4">
            <Input type="text" placeholder={t("namePlaceholder")} required />
            <Input type="email" placeholder={t("emailPlaceholder")} required />
            <Input
              type="password"
              placeholder={t("passwordPlaceholder")}
              required
            />
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="terms"
                className="border-muted-foreground"
                required
              />
              <label
                htmlFor="terms"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t("acceptTerms")}
              </label>
            </div>
            <Button type="submit" className="mt-2 w-full">
              {t("signupButton")}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => signIn("google")}
            >
              <FcGoogle className="mr-2 size-5" />
              {t("signupWithGoogle")}
            </Button>
            <div className="text-muted-foreground mx-auto mt-8 flex justify-center gap-1 text-sm">
              <p>{t("haveAccount")}</p>
              <a href={`/${locale}/login`} className="text-primary font-medium">
                {t("loginLink")}
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
