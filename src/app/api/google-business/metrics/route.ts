import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        { error: "No autorizado - Token de acceso requerido" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") || "30d";
    const businessAccountId = searchParams.get("accountId");

    // Inicializar Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Obtener token guardado en Supabase
    const { data: tokenData, error: tokenError } = await supabase
      .from("google_business_tokens")
      .select("id, business_account_id, access_token, business_name")
      .eq("user_id", session.user.email)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        {
          error: "No se encontró conexión con Google My Business",
          debug: {
            userEmail: session.user.email,
            tokenError: tokenError?.message,
          },
        },
        { status: 404 },
      );
    }

    // Calcular fechas para el rango solicitado
    const endDate = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Obtener métricas desde Google My Business API
    const metricsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${
        businessAccountId || tokenData.business_account_id
      }/locations`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!metricsResponse.ok) {
      const errorData = await metricsResponse.json();
      // Google My Business Metrics API Error
      return NextResponse.json(
        {
          error: "Error al obtener métricas de Google My Business",
          details: errorData,
        },
        { status: metricsResponse.status },
      );
    }

    const locationsData = await metricsResponse.json();

    // Obtener métricas de insights (si están disponibles)
    let insightsData = null;
    if (locationsData.locations && locationsData.locations.length > 0) {
      const locationName = locationsData.locations[0].name;

      const insightsResponse = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}/insights`,
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (insightsResponse.ok) {
        insightsData = await insightsResponse.json();
      }
    }

    // Procesar y formatear métricas
    const metrics = {
      views: insightsData?.insights?.[0]?.metricValues?.[0]?.value || 0,
      clicks: insightsData?.insights?.[1]?.metricValues?.[0]?.value || 0,
      calls: insightsData?.insights?.[2]?.metricValues?.[0]?.value || 0,
      directionRequests:
        insightsData?.insights?.[3]?.metricValues?.[0]?.value || 0,
      websiteClicks: insightsData?.insights?.[4]?.metricValues?.[0]?.value || 0,
      lastUpdated: new Date().toISOString(),
      dateRange: dateRange,
      businessName: tokenData.business_name || "Mi Negocio",
    };

    // Guardar métricas en Supabase para historial
    await supabase.from("google_business_metrics").upsert(
      {
        business_token_id: tokenData.id,
        date: new Date().toISOString().split("T")[0],
        views: metrics.views,
        clicks: metrics.clicks,
        calls: metrics.calls,
        direction_requests: metrics.directionRequests,
        website_clicks: metrics.websiteClicks,
      },
      {
        onConflict: "business_token_id,date",
      },
    );

    return NextResponse.json(metrics);
  } catch {
    // Error en Google My Business Metrics
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
