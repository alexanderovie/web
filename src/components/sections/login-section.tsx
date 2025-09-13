import { usePathname, useRouter } from "next/navigation";

import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

const LoginSection = () => {
  const t = useTranslations("loginPage");
  const pathname = usePathname();
  const locale = pathname ? pathname.split("/")[1] || "en" : "en";
  const { status } = useSession();
  const router = useRouter();

  if (status === "authenticated") {
    router.replace(`/${locale}/dashboard`);
    return null;
  }
  return (
    <section className="flex min-h-[90dvh] flex-col justify-center lg:py-32">
      <div className="container flex flex-col items-center">
        <h2 className="mb-7 text-2xl font-bold text-center">
          {locale === "es" ? "Iniciar Sesión" : "Sign In"}
        </h2>
        <p className="text-muted-foreground mb-8">{t("subtitle")}</p>
        <form className="w-full max-w-sm mx-auto flex flex-col gap-4">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            required
          />
          <Input
            id="password"
            name="password"
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
            <a href={`/${locale}/signup`} className="text-primary font-medium">
              {t("signupLink")}
            </a>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginSection;
