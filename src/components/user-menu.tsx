"use client";
import { usePathname } from "next/navigation";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const locale = pathname ? pathname.split("/")[1] || "en" : "en";
  const t = useTranslations("Logout");

  if (status === "loading") return null;

  if (!session) {
    return (
      <Button variant="outline" asChild>
        <a href={`/${locale}/login`}>Login</a>
      </Button>
    );
  }

  const user = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
          <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-3 py-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuItem
          onClick={async () => {
            await signOut({ redirect: false });
            toast.success(t("success"), {
              description: t("successDescription"),
            });
            setTimeout(() => {
              window.location.href = `/${locale}`;
            }, 1200);
          }}
        >
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
