"use client";

import React, { useState, useRef, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ChevronRight,
  ChevronDown,
  LayoutDashboard,
  TrendingUp,
  Megaphone,
  MapPin,
  Settings2,
  GaugeCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import LanguageSwitcher from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

import { UserMenu } from "@/components/user-menu";
import services from "@/data/services.json";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  title: Record<string, string>;
  short: Record<string, string>;
  description: Record<string, string>;
}

const serviceIcons: Record<string, React.ReactNode> = {
  web: <LayoutDashboard className="size-5 text-sky-500" />,
  "google-business-profile": <MapPin className="size-5 text-orange-500" />,
  automation: <Settings2 className="size-5 text-green-500" />,
  "seo-tecnico": <TrendingUp className="size-5 text-yellow-500" />,
  "carga-web": <GaugeCircle className="size-5 text-cyan-500" />,
  "publicidad-paga": <Megaphone className="size-5 text-pink-500" />,
};

function AuthButtons({ isMobile = false }: { isMobile?: boolean } = {}) {
  const { status } = useSession();
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tHero = useTranslations("homepage.hero");
  const tCommon = useTranslations("common");
  const lang = pathname?.split("/")[1] || "es";

  if (status === "loading") return null;

  if (status === "authenticated") {
    return (
      <div className={isMobile ? "space-y-2" : "flex items-center gap-2.5"}>
        <div
          className={
            isMobile ? "w-full" : "h-10 w-10 flex items-center justify-center"
          }
        >
          <UserMenu />
        </div>
        <Link
          href={`/${lang}/dashboard`}
          className={
            isMobile ? "block w-full" : "transition-opacity duration-300"
          }
        >
          <Button
            className={
              isMobile
                ? "w-full gap-1 h-11 mb-2"
                : "gap-1 h-10 px-4 flex items-center"
            }
          >
            {t("dashboard")}
            <ChevronRight className="size-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={isMobile ? "space-y-2" : "flex items-center gap-2.5"}>
      <Link
        href={`/${lang}/login`}
        className={
          isMobile ? "block w-full" : "transition-opacity duration-300"
        }
      >
        <Button
          variant="outline"
          className={isMobile ? "w-full gap-1 mb-2" : "gap-1 flex items-center"}
        >
          {tCommon("login")}
          <ChevronRight className="size-4" />
        </Button>
      </Link>
      <Link
        href={`/${lang}/auditoria`}
        className={
          isMobile ? "block w-full" : "transition-opacity duration-300"
        }
      >
        <Button
          className={isMobile ? "w-full gap-1" : "gap-1 flex items-center"}
        >
          {tHero("ctaDiagnostico")}
          <ChevronRight className="size-4" />
        </Button>
      </Link>
    </div>
  );
}

const Navbar = () => {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const lang = pathname?.split("/")[1] || "es";

  const navLinks = [
    {
      label: t("services"),
      href: `/${lang}/services`,
      dropdownItems: (services as Service[]).map((service) => ({
        title: service.title[lang] || service.title["es"],
        href: `/${lang}/services/${service.id}`,
        icon: serviceIcons[service.id] || (
          <LayoutDashboard className="size-5" />
        ),
      })),
    },
    { label: t("pricing"), href: `/${lang}/pricing` },
    { label: t("blog"), href: `/${lang}/blog` },
    { label: t("about"), href: `/${lang}/about` },
    { label: t("faq"), href: `/${lang}/faq` },
    { label: t("contact"), href: `/${lang}/contact` },
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Detectar scroll para ocultar/mostrar navbar
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(".hamburger-btn")
      ) {
        setIsMenuOpen(false);
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-[40px] left-0 z-40 w-full border-b backdrop-blur-sm shadow bg-background transition-transform duration-300",
        showNavbar ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <Link href={`/${lang}`} className="flex items-center gap-1">
            <Image
              src="/images/fascinante-digital-logo.svg"
              alt="logo"
              width={150}
              height={40}
              className="dark:invert"
              style={{ height: "auto" }}
            />
          </Link>

          <NavigationMenu className="hidden items-center gap-8 lg:flex">
            <NavigationMenuList>
              {navLinks.map((link) =>
                link.dropdownItems ? (
                  <NavigationMenuItem key={link.label}>
                    <div className="flex items-center">
                      <Link
                        href={link.href}
                        className={cn(
                          "text-primary lg:text-base px-4 py-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                          pathname === link.href && "text-muted-foreground",
                        )}
                      >
                        {link.label}
                      </Link>
                      <NavigationMenuTrigger className="text-primary lg:text-base ml-1"></NavigationMenuTrigger>
                    </div>
                    <NavigationMenuContent>
                      <ul className="w-[400px] p-4">
                        {link.dropdownItems.map((item) => (
                          <li key={item.title}>
                            <Link
                              href={item.href}
                              className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex items-center gap-4 rounded-md p-3 leading-none no-underline transition-colors outline-none select-none"
                            >
                              {item.icon}
                              <span className="text-sm leading-none font-medium">
                                {item.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={link.label}>
                    <Link
                      href={link.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "text-primary lg:text-base",
                        pathname === link.href && "text-muted-foreground",
                      )}
                    >
                      {link.label}
                    </Link>
                  </NavigationMenuItem>
                ),
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex items-center gap-2.5">
            <div
              className={`transition-opacity duration-300 flex items-center gap-2 ${
                isMenuOpen ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors p-0">
                <ThemeToggle />
              </div>
              <span>
                <LanguageSwitcher />
              </span>
            </div>
            {/* Botones de autenticación y auditoría alineados profesionalmente */}
            <div className="hidden lg:flex items-center gap-2.5">
              <AuthButtons />
            </div>
            <button
              className="hamburger-btn text-muted-foreground relative flex h-8 w-8 lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">
                {isMenuOpen ? "Cerrar menú" : "Abrir menú"}
              </span>
              <div className="absolute top-1/2 left-1/2 block w-[18px] -translate-x-1/2 -translate-y-1/2 transform">
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full transform rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "rotate-45" : "-translate-y-1.5"}`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full transform rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  aria-hidden="true"
                  className={`absolute block h-0.5 w-full transform rounded-full bg-current transition duration-500 ease-in-out ${isMenuOpen ? "-rotate-45" : "translate-y-1.5"}`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        className={cn(
          "bg-background fixed inset-0 top-[64px] container flex h-[calc(100vh-64px)] flex-col transition-all duration-300 ease-in-out lg:hidden z-50",
          isMenuOpen
            ? "visible translate-x-0 opacity-100"
            : "invisible translate-x-full opacity-0",
        )}
        style={{ pointerEvents: isMenuOpen ? "auto" : "none" }}
      >
        {/* Botones principales según autenticación */}
        <MobileMainButtons />
        <nav className="mt-3 flex flex-1 flex-col gap-6">
          {navLinks.map((link) =>
            link.dropdownItems ? (
              <div key={link.label}>
                <div className="flex items-center justify-between">
                  <Link
                    href={link.href}
                    className="text-primary text-lg font-medium tracking-[-0.36px] hover:text-accent-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === link.label ? null : link.label,
                      )
                    }
                    className="text-primary p-1 hover:bg-accent rounded-md transition-colors"
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openDropdown === link.label ? "rotate-90" : "",
                      )}
                    />
                  </button>
                </div>
                <div
                  className={cn(
                    "ml-4 space-y-3 overflow-hidden transition-all",
                    openDropdown === link.label
                      ? "mt-3 max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0",
                  )}
                >
                  {link.dropdownItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="hover:bg-accent flex items-start gap-3 rounded-md p-2"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setOpenDropdown(null);
                      }}
                    >
                      {item.icon}
                      <div>
                        <div className="text-primary font-medium">
                          {item.title}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-primary text-lg tracking-[-0.36px]",
                  pathname === link.href && "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

function MobileMainButtons() {
  const { status } = useSession();
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const tHero = useTranslations("homepage.hero");
  const lang = pathname?.split("/")[1] || "es";

  if (status === "loading") return null;

  return (
    <div className="mt-8 space-y-2">
      {status === "authenticated" ? (
        <>
          <Link href={`/${lang}/auditoria`} className="block w-full">
            <Button className="w-full gap-1 mb-2">
              {tHero("ctaDiagnostico")}
              <ChevronRight className="size-4" />
            </Button>
          </Link>
          <Link href={`/${lang}/dashboard`} className="block w-full">
            <Button variant="outline" className="w-full gap-1 h-11">
              {t("dashboard")}
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </>
      ) : (
        <>
          <Link href={`/${lang}/auditoria`} className="block w-full">
            <Button className="w-full gap-1 mb-2">
              {tHero("ctaDiagnostico")}
              <ChevronRight className="size-4" />
            </Button>
          </Link>
          <Link href={`/${lang}/login`} className="block w-full">
            <Button variant="outline" className="w-full gap-1">
              Login
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
