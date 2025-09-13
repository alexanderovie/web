"use client";

import * as React from "react";

import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  IconHome,
  IconSearch,
  IconChevronDown,
  IconChevronRight,
  IconPlug,
  IconChartBar,
  IconBuilding,
  IconCode,
  IconFileAnalytics,
  IconBrandWhatsapp,
  IconBrandInstagram,
  IconMessage,
  IconUsers,
  IconMessages,
  IconCreditCard,
  IconMapPin,
  IconWorld,
  IconSettings,
  IconBrandGithub,
} from "@tabler/icons-react";

import { NavUser } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: MenuItem[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const params = useParams();
  const pathname = usePathname();
  const lang = (params?.lang as string) || "es";
  const t = useTranslations("dashboard.sidebar.menu");

  // Estado para controlar si el submenú de Google está abierto
  const [isGoogleOpen, setIsGoogleOpen] = React.useState(false);

  // Detectar si estamos en una ruta de Google para abrir automáticamente el submenú
  React.useEffect(() => {
    if (pathname?.includes("/dashboard/google")) {
      setIsGoogleOpen(true);
    }
  }, [pathname]);

  const mainMenu: MenuItem[] = [
    { title: t("digitalSummary"), url: `/${lang}/dashboard`, icon: IconHome },
    {
      title: t("serpAudit"),
      url: `/${lang}/dashboard/auditoriaserp`,
      icon: IconSearch,
    },
    {
      title: t("integrations"),
      url: `/${lang}/dashboard/integraciones`,
      icon: IconPlug,
    },
    {
      title: t("deployments"),
      url: `/${lang}/dashboard/deployments`,
      icon: IconBrandGithub,
    },
    // # PENDIENTE - Análisis y Reportes
    {
      title: t("googleSearchConsole"),
      url: `/${lang}/dashboard/gsc`,
      icon: IconChartBar,
    },
    {
      title: t("googleBusinessProfile"),
      url: `/${lang}/dashboard/gbp`,
      icon: IconBuilding,
    },
    {
      title: t("googleTagManager"),
      url: `/${lang}/dashboard/gtm`,
      icon: IconCode,
    },
    {
      title: t("onPageAnalysis"),
      url: `/${lang}/dashboard/onpage`,
      icon: IconFileAnalytics,
    },
    // # PENDIENTE - Redes Sociales
    {
      title: t("whatsapp"),
      url: `/${lang}/dashboard/whatsapp`,
      icon: IconBrandWhatsapp,
    },
    {
      title: t("instagram"),
      url: `/${lang}/dashboard/instagram`,
      icon: IconBrandInstagram,
    },
    {
      title: t("messenger"),
      url: `/${lang}/dashboard/messenger`,
      icon: IconMessage,
    },
    // # PENDIENTE - Marketing y CRM
    {
      title: t("hubspot"),
      url: `/${lang}/dashboard/hubspot`,
      icon: IconUsers,
    },
    {
      title: t("conversations"),
      url: `/${lang}/dashboard/conversations`,
      icon: IconMessages,
    },
    {
      title: t("subscriptions"),
      url: `/${lang}/dashboard/subscriptions`,
      icon: IconCreditCard,
    },
    // # PENDIENTE - Local SEO
    {
      title: t("places"),
      url: `/${lang}/dashboard/places`,
      icon: IconMapPin,
    },
    {
      title: t("geo"),
      url: `/${lang}/dashboard/geo`,
      icon: IconWorld,
    },
    // # PENDIENTE - Gestión
    {
      title: t("billing"),
      url: `/${lang}/dashboard/billing`,
      icon: IconCreditCard,
    },
    {
      title: t("settings"),
      url: `/${lang}/dashboard/settings`,
      icon: IconSettings,
    },
  ];

  const secondaryMenu: MenuItem[] = [
    // Páginas del dashboard removidas - se mantienen solo las APIs funcionales
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarContent>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!py-3 data-[slot=sidebar-menu-button]:!px-1.5"
              >
                <a href="#" className="flex items-center gap-1 mb-6">
                  <Image
                    src="/images/fascinante-digital-logo.svg"
                    alt="logo"
                    width={150}
                    height={40}
                    className="dark:invert"
                    style={{ height: "auto" }}
                  />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={t("serpAudit")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                asChild
              >
                <a href={`/${lang}/auditoria`}>
                  <IconSearch className="size-5" />
                  <span>{t("serpAudit")}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <Separator className="my-2" />
        </SidebarHeader>
        <SidebarMenu>
          {mainMenu.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon className="size-5" />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Separator className="my-4" />
        <SidebarMenu>
          {secondaryMenu.map((item) => (
            <SidebarMenuItem key={item.title}>
              {item.children ? (
                // Item con submenús (Google)
                <SidebarMenuButton
                  onClick={() => setIsGoogleOpen(!isGoogleOpen)}
                  className="w-full justify-between"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </div>
                  {isGoogleOpen ? (
                    <IconChevronDown className="size-4" />
                  ) : (
                    <IconChevronRight className="size-4" />
                  )}
                </SidebarMenuButton>
              ) : (
                // Item simple
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon className="size-5" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
              {item.children && isGoogleOpen && (
                <SidebarMenu>
                  {item.children.map((child) => (
                    <SidebarMenuItem key={child.title}>
                      <SidebarMenuButton asChild>
                        <a href={child.url}>
                          <child.icon className="size-5" />
                          <span>{child.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
