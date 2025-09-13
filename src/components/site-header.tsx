"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDashboard } from "@/context/DashboardContext";

export function SiteHeader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { fullTitle } = useDashboard();
  const params = useParams();
  const lang = (params?.lang as string) || "es";
  const t = useTranslations("dashboard.header");

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || t("unknownError"));
      }
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1
          style={{ fontSize: 16, lineHeight: "24px", fontWeight: 500 }}
          className="font-medium"
        >
          {fullTitle}
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex"
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? t("redirecting") : t("manageSubscription")}
          </Button>
        </div>
        {error && <span className="text-red-600 text-sm ml-4">{error}</span>}
      </div>
    </header>
  );
}
