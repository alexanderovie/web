import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/app-sidebar";
import { SessionTimeoutProvider } from "@/components/session-timeout-provider";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { DashboardProvider } from "@/context/DashboardContext";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  // Protección SSR: redirigir si no hay sesión
  const session = await auth();
  const { lang } = await params;

  if (!session) {
    redirect(`/${lang || "es"}/login`);
  }

  let defaultOpen = true;
  try {
    const cookieStore = await cookies();
    defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  } catch {}

  return (
    <SessionTimeoutProvider
      config={{
        // Configuración de desarrollo - tiempos más cortos para testing
        inactivityTimeout:
          process.env.NODE_ENV === "development"
            ? 2 * 60 * 1000 // 2 minutos en desarrollo
            : 20 * 60 * 1000, // 20 minutos en producción
        warningBeforeLogout:
          process.env.NODE_ENV === "development"
            ? 30 * 1000 // 30 segundos de advertencia en desarrollo
            : 3 * 60 * 1000, // 3 minutos de advertencia en producción
        heartbeatInterval: 10 * 60 * 1000, // 10 minutos
      }}
    >
      <div className="min-h-screen bg-muted">
        <SidebarProvider
          defaultOpen={defaultOpen}
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <DashboardProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              <div className="flex flex-1 flex-col">{children}</div>
            </SidebarInset>
          </DashboardProvider>
        </SidebarProvider>
      </div>
    </SessionTimeoutProvider>
  );
}
