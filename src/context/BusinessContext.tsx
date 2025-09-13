import React, { createContext, useContext, useState, useMemo } from "react";

// Define aquí el tipo real de tu negocio si lo tienes, por ahora object | null
// type Business = { ... } | null;
type Business = object | null;

const BusinessContext = createContext<{
  selectedBusiness: Business;
  setSelectedBusiness: React.Dispatch<React.SetStateAction<Business>>;
} | null>(null);

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness debe usarse dentro de un BusinessProvider");
  }
  return context;
}

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business>(null);
  const value = useMemo(
    () => ({ selectedBusiness, setSelectedBusiness }),
    [selectedBusiness],
  );
  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}
