import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locationId: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Obtener el token del usuario
    const { data: tokenData, error: tokenError } = await supabase
      .from("google_business_tokens")
      .select("*")
      .eq("user_id", session.user.email)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "No se encontró token de Google My Business" },
        { status: 404 },
      );
    }

    // Verificar si el token ha expirado
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Token expirado, necesita refrescar" },
        { status: 401 },
      );
    }

    // Await params para Next.js 15
    const { locationId } = await params;
    const { searchParams } = new URL(request.url);

    // Parámetros opcionales para el rango de fechas
    const startYear = searchParams.get("startYear") || "2024";
    const startMonth = searchParams.get("startMonth") || "1";
    const startDay = searchParams.get("startDay") || "1";
    const endYear = searchParams.get("endYear") || "2024";
    const endMonth = searchParams.get("endMonth") || "12";
    const endDay = searchParams.get("endDay") || "31";

    // Obtener métricas de performance de la ubicación
    const metricsResponse = await fetch(
      `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMultiDailyMetricsTimeSeries?dailyMetrics=WEBSITE_CLICKS&dailyMetrics=CALL_CLICKS&dailyRange.startDate.year=${startYear}&dailyRange.startDate.month=${startMonth}&dailyRange.startDate.day=${startDay}&dailyRange.endDate.year=${endYear}&dailyRange.endDate.month=${endMonth}&dailyRange.endDate.day=${endDay}`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!metricsResponse.ok) {
      const errorData = await metricsResponse.json();
      console.error("Error obteniendo métricas:", errorData);

      // Manejo específico para error 403
      if (metricsResponse.status === 403) {
        return NextResponse.json(
          {
            error: "PERMISSION_DENIED",
            message:
              "Esta ubicación no tiene métricas disponibles. Posibles causas: ubicación no verificada, sin permisos de métricas, o ubicación suspendida.",
            details: "Verifica el estado de la ubicación en Google My Business",
          },
          { status: 403 },
        );
      }

      return NextResponse.json(
        { error: "Error al obtener métricas de la ubicación" },
        { status: metricsResponse.status },
      );
    }

    const metricsData = await metricsResponse.json();

    // Procesar los datos de métricas
    const processedMetrics = {
      locationId,
      dateRange: {
        start: `${startYear}-${startMonth}-${startDay}`,
        end: `${endYear}-${endMonth}-${endDay}`,
      },
      metrics: {
        websiteClicks: {
          total: 0,
          dailyData: [] as any[],
        },
        callClicks: {
          total: 0,
          dailyData: [] as any[],
        },
      },
    };

    if (metricsData.timeSeries && metricsData.timeSeries.length > 0) {
      // Procesar métricas de website clicks
      const websiteClicksSeries = metricsData.timeSeries.find(
        (series: any) => series.dailyMetric === "WEBSITE_CLICKS",
      );
      if (websiteClicksSeries && websiteClicksSeries.dailyValues) {
        processedMetrics.metrics.websiteClicks.total =
          websiteClicksSeries.dailyValues.reduce(
            (sum: number, day: any) => sum + (parseInt(day.value) || 0),
            0,
          );
        processedMetrics.metrics.websiteClicks.dailyData =
          websiteClicksSeries.dailyValues.map((day: any) => ({
            date: `${day.date.year}-${day.date.month}-${day.date.day}`,
            value: parseInt(day.value) || 0,
          }));
      }

      // Procesar métricas de call clicks
      const callClicksSeries = metricsData.timeSeries.find(
        (series: any) => series.dailyMetric === "CALL_CLICKS",
      );
      if (callClicksSeries && callClicksSeries.dailyValues) {
        processedMetrics.metrics.callClicks.total =
          callClicksSeries.dailyValues.reduce(
            (sum: number, day: any) => sum + (parseInt(day.value) || 0),
            0,
          );
        processedMetrics.metrics.callClicks.dailyData =
          callClicksSeries.dailyValues.map((day: any) => ({
            date: `${day.date.year}-${day.date.month}-${day.date.day}`,
            value: parseInt(day.value) || 0,
          }));
      }
    }

    return NextResponse.json({
      success: true,
      data: processedMetrics,
    });
  } catch (error) {
    console.error(
      "Error in GET /api/google-business/locations/[locationId]/metrics:",
      error,
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
