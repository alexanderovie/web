"use client";

import { useEffect } from "react";
import { useDashboard } from "@/context/DashboardContext";

export function usePageTitle(title: string) {
  const { setPageTitle } = useDashboard();

  useEffect(() => {
    setPageTitle(title);

    // Cleanup: resetear el título cuando el componente se desmonte
    return () => {
      setPageTitle("Dashboard");
    };
  }, [title, setPageTitle]);
}
