import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import { signIn, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SignupSection = () => {
  const t = useTranslations("signupPage");
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname ? pathname.split("/")[1] || "en" : "en";

  if (status === "authenticated") {
    router.replace(`/${locale}/dashboard`);
    return null;
  }
  return (
    <section className="bg-sand-100 py-16 md:py-28 lg:py-32">
      <div className="container">
        <div className="flex flex-col gap-4">
          <Card className="mx-auto w-full max-w-sm">
            <CardHeader className="flex flex-col items-center space-y-0">
              <Image
                src="/images/fascinante-digital-logo.svg"
                alt="logo"
                width={150}
                height={40}
                className="mb-7 dark:invert"
                style={{ height: "auto" }}
              />
              <p className="mb-2 text-2xl font-bold">{t("title")}</p>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("namePlaceholder")}
                  required
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  required
                />
                <div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    required
                  />
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t("passwordHint")}
                  </p>
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
              </div>
              <div className="text-muted-foreground mx-auto mt-8 flex justify-center gap-1 text-sm">
                <p>{t("alreadyAccount")}</p>
                <a
                  href={`/${locale}/login`}
                  className="text-primary font-medium"
                >
                  {t("loginLink")}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SignupSection;
