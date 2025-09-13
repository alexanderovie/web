import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

interface MultiDailyMetricTimeSeries {
  multiDailyMetricTimeSeries: Array<{
    dailyMetricTimeSeries: Array<{
      dailyMetric: string;
      timeSeries: {
        datedValues: Array<{
          date: {
            year: number;
            month: number;
            day: number;
          };
          value: string;
        }>;
      };
    }>;
  }>;
}

interface MetricsSummary {
  websiteClicks: number;
  callClicks: number;
  totalClicks: number;
}

interface MetricsTrends {
  websiteClicks: number;
  callClicks: number;
  totalClicks: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locationId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { locationId } = await params;

    // 🗄️ Get token from Supabase - Always use google@fascinantedigital.com token
    const tokenResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/google_tokens?email=eq.google@fascinantedigital.com&select=access_token`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        { error: "Error al obtener token de Supabase" },
        { status: 500 },
      );
    }

    const tokenData = await tokenResponse.json();
    const tokenError = !tokenData || tokenData.length === 0;

    if (tokenError || !tokenData[0]?.access_token) {
      return NextResponse.json(
        { error: "No se encontró token de acceso válido" },
        { status: 401 },
      );
    }

    const accessToken = tokenData[0].access_token;

    // Calcular rango de fechas (últimos 30 días)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Construir URL de la API de Google Business Profile Performance
    const apiUrl = new URL(
      `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMultiDailyMetricsTimeSeries`,
    );

    // Agregar parámetros de consulta
    const queryParams = new URLSearchParams();
    queryParams.append("dailyMetrics", "WEBSITE_CLICKS");
    queryParams.append("dailyMetrics", "CALL_CLICKS");
    queryParams.append(
      "dailyRange.startDate.day",
      startDate.getDate().toString(),
    );
    queryParams.append(
      "dailyRange.startDate.month",
      (startDate.getMonth() + 1).toString(),
    );
    queryParams.append(
      "dailyRange.startDate.year",
      startDate.getFullYear().toString(),
    );
    queryParams.append("dailyRange.endDate.day", endDate.getDate().toString());
    queryParams.append(
      "dailyRange.endDate.month",
      (endDate.getMonth() + 1).toString(),
    );
    queryParams.append(
      "dailyRange.endDate.year",
      endDate.getFullYear().toString(),
    );

    apiUrl.search = queryParams.toString();

    // Llamar a la API de Google
    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 403) {
        return NextResponse.json(
          {
            error: "PERMISSION_DENIED",
            message:
              "No tienes permisos para acceder a las métricas de rendimiento",
            details: errorData,
          },
          { status: 403 },
        );
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "NOT_FOUND",
            message: "Ubicación no encontrada",
            details: errorData,
          },
          { status: 404 },
        );
      }

      return NextResponse.json(
        {
          error: "API_ERROR",
          message: "Error al obtener métricas de Google",
          details: errorData,
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    // ✅ SUCCESS: Process real data from Google API
    const summary = calculateMetricsSummary(data);
    const trends = calculateTrends(data);

    const result = {
      success: true,
      locationId,
      metrics: data,
      summary,
      trends,
      dateRange: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      note: "Datos reales de Google Business Profile Performance API",
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

// Helper functions
function calculateMetricsSummary(
  data: MultiDailyMetricTimeSeries,
): MetricsSummary {
  let websiteClicks = 0;
  let callClicks = 0;

  data.multiDailyMetricTimeSeries.forEach((metricSeries) => {
    metricSeries.dailyMetricTimeSeries.forEach((dailyMetric) => {
      if (dailyMetric.dailyMetric === "WEBSITE_CLICKS") {
        websiteClicks = dailyMetric.timeSeries.datedValues.reduce(
          (sum, datedValue) => sum + parseInt(datedValue.value || "0"),
          0,
        );
      } else if (dailyMetric.dailyMetric === "CALL_CLICKS") {
        callClicks = dailyMetric.timeSeries.datedValues.reduce(
          (sum, datedValue) => sum + parseInt(datedValue.value || "0"),
          0,
        );
      }
    });
  });

  return {
    websiteClicks,
    callClicks,
    totalClicks: websiteClicks + callClicks,
  };
}

function calculateTrends(data: MultiDailyMetricTimeSeries): MetricsTrends {
  // Simple trend calculation - compare first half vs second half of the period
  let websiteClicksFirstHalf = 0;
  let websiteClicksSecondHalf = 0;
  let callClicksFirstHalf = 0;
  let callClicksSecondHalf = 0;

  data.multiDailyMetricTimeSeries.forEach((metricSeries) => {
    metricSeries.dailyMetricTimeSeries.forEach((dailyMetric) => {
      const values = dailyMetric.timeSeries.datedValues;
      const midPoint = Math.floor(values.length / 2);

      if (dailyMetric.dailyMetric === "WEBSITE_CLICKS") {
        websiteClicksFirstHalf = values
          .slice(0, midPoint)
          .reduce(
            (sum, datedValue) => sum + parseInt(datedValue.value || "0"),
            0,
          );
        websiteClicksSecondHalf = values
          .slice(midPoint)
          .reduce(
            (sum, datedValue) => sum + parseInt(datedValue.value || "0"),
            0,
          );
      } else if (dailyMetric.dailyMetric === "CALL_CLICKS") {
        callClicksFirstHalf = values
          .slice(0, midPoint)
          .reduce(
            (sum, datedValue) => sum + parseInt(datedValue.value || "0"),
            0,
          );
        callClicksSecondHalf = values
          .slice(midPoint)
          .reduce(
            (sum, datedValue) => sum + parseInt(datedValue.value || "0"),
            0,
          );
      }
    });
  });

  const websiteClicksTrend =
    websiteClicksFirstHalf > 0
      ? Math.round(
          ((websiteClicksSecondHalf - websiteClicksFirstHalf) /
            websiteClicksFirstHalf) *
            100,
        )
      : 0;

  const callClicksTrend =
    callClicksFirstHalf > 0
      ? Math.round(
          ((callClicksSecondHalf - callClicksFirstHalf) / callClicksFirstHalf) *
            100,
        )
      : 0;

  return {
    websiteClicks: websiteClicksTrend,
    callClicks: callClicksTrend,
    totalClicks: Math.round((websiteClicksTrend + callClicksTrend) / 2),
  };
}
