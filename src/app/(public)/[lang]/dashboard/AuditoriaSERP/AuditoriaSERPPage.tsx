"use client";

import React, { useState } from "react";
import AuditoriaInput from "./AuditoriaInput";
import { getJson } from "serpapi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { usePageTitle } from "@/hooks/usePageTitle";

const AuditoriaSERPPage = () => {
  usePageTitle("Auditoría SERP");

  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string, location: string) => {
    try {
      const response = await getJson({
        engine: "google",
        q: query,
        location: location,
        api_key: process.env.SERPAPI_API_KEY,
      });
      setResults(response);
      setError(null);
    } catch (error) {
      console.error("Error fetching data from SerpApi:", error);
      setError(
        "Hubo un problema al obtener los datos. Por favor, inténtalo de nuevo más tarde.",
      );
    }
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Encabezado alineado con dashboard */}
        <div className="px-4 lg:px-6">
          <h2 className="text-4xl font-bold tracking-tight">Auditoría SERP</h2>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Analiza resultados de Google para entender la visibilidad local de
            un negocio y detectar oportunidades de posicionamiento.
          </p>
        </div>

        {/* Tarjeta principal con el formulario */}
        <div className="px-4 lg:px-6">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Buscar y analizar</CardTitle>
              <CardDescription>
                Ingresa consulta y ubicación para obtener resultados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AuditoriaInput onSearch={handleSearch} />

              {error && (
                <div className="mt-4 text-sm text-red-600">{error}</div>
              )}

              {results && (
                <div className="mt-6">
                  <h2 className="text-sm font-semibold mb-2">
                    Resultados de la búsqueda
                  </h2>
                  <div className="rounded-md border bg-card p-3 text-xs overflow-auto max-h-[60vh]">
                    <pre className="whitespace-pre-wrap break-words">
                      {JSON.stringify(results, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditoriaSERPPage;
