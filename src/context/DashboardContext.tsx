"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface DashboardContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
  fullTitle: string;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState("Dashboard");

  const fullTitle =
    pageTitle === "Dashboard" ? "Dashboard" : `Dashboard - ${pageTitle}`;

  return (
    <DashboardContext.Provider value={{ pageTitle, setPageTitle, fullTitle }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
