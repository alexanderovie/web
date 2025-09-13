"use client";

import { usePathname } from "next/navigation";

import {
  IconBell,
  IconCreditCard,
  IconLogout,
  IconSettings,
  IconUser,
  IconDotsVertical,
} from "@tabler/icons-react";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const t = useTranslations("Logout");
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  if (status === "loading") return null;

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <a
              href={`/${pathname ? pathname.split("/")[1] || "es" : "es"}/login`}
            >
              Iniciar sesión
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user.image ?? ""}
                  alt={user.name ?? "Usuario"}
                />
                <AvatarFallback className="rounded-lg">
                  {user.name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={user.image ?? ""}
                    alt={user.name ?? "Usuario"}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <a
                  href="https://dashboard.fascinantedigital.com"
                  className="cursor-pointer"
                >
                  <IconUser />
                  Mi Cuenta
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href={`/${pathname ? pathname.split("/")[1] || "es" : "es"}/pricing`}
                  className="cursor-pointer"
                >
                  <IconCreditCard />
                  Suscripción
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a
                  href="https://dashboard.fascinantedigital.com"
                  className="cursor-pointer"
                >
                  <IconSettings />
                  Configuración
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconBell />
                Notificaciones
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut({ redirect: false });
                toast.success(t("success"), {
                  description: t("successDescription"),
                });
                setTimeout(() => {
                  window.location.href = `/${pathname ? pathname.split("/")[1] || "es" : "es"}`;
                }, 1200);
              }}
              className="cursor-pointer"
            >
              <IconLogout />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
