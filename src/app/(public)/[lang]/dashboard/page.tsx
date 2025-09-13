"use client";

import { useState, useEffect } from "react";
import { ChartBarStacked } from "@/components/chart-bar-stacked";
import { ChartPieInteractive } from "@/components/chart-pie-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";

interface Conversation {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
  conversationId?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  phone?: string;
}

export default function Page() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        // API eliminada temporalmente - usar datos estáticos
        const fallbackData = await import("./data.json");
        setConversations(fallbackData.default);
      } catch (error) {
        console.error("Error cargando datos:", error);
        // Datos de ejemplo si no hay archivo
        setConversations([
          {
            id: 1,
            header: "Sistema temporalmente en mantenimiento",
            type: "Sistema",
            status: "Info",
            target: "Usuario",
            limit: "N/A",
            reviewer: "Sistema",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  if (loading) {
    return (
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div>
            <SectionCards />
          </div>
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 items-stretch">
            <div className="col-span-1 @xl/main:col-span-2 @5xl/main:col-span-2 h-full">
              <ChartBarStacked />
            </div>
            <div className="col-span-1 @xl/main:col-span-2 @5xl/main:col-span-2 h-full">
              <ChartPieInteractive />
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Cargando conversaciones...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        {/* Botón premium de gestión de suscripción eliminado, ahora en el header */}
        <div>
          <SectionCards />
        </div>
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 items-stretch">
          <div className="col-span-1 @xl/main:col-span-2 @5xl/main:col-span-2 h-full">
            <ChartBarStacked />
          </div>
          <div className="col-span-1 @xl/main:col-span-2 @5xl/main:col-span-2 h-full">
            <ChartPieInteractive />
          </div>
        </div>
        <div>
          <DataTable data={conversations} />
        </div>
      </div>
    </div>
  );
}
