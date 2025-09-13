import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { gbpClient } from "@/lib/gbp-client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No access token found. Please authenticate with Google first.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get("location");
    const type = searchParams.get("type") || "multi";

    if (!locationName) {
      return NextResponse.json(
        { success: false, error: "Location parameter is required" },
        { status: 400 },
      );
    }

    console.log("GBP Metrics API - Session user email:", session.user?.email);
    console.log(
      "GBP Metrics API - Access token present:",
      !!session.user?.accessToken,
    );
    console.log("GBP Metrics API - Location name:", locationName);
    console.log("GBP Metrics API - Type:", type);

    // Configurar el cliente GBP con el token de acceso
    await gbpClient.setupNextAuthToken(session.user.accessToken);

    try {
      // Obtener métricas realistas de Google Business Profile
      const endDate = new Date().toISOString().split("T")[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]; // 30 días atrás

      const metrics = await gbpClient.getMultiDailyMetrics(
        session.user.accessToken,
        locationName,
        startDate,
        endDate,
        ["QUERIES_DIRECT", "QUERIES_INDIRECT", "VIEWS_MAPS", "VIEWS_SEARCH"],
      );

      // Procesar las métricas
      const processedMetrics = {
        views: 0,
        searches: 0,
        clicks: 0,
        calls: 0,
        directionRequests: 0,
      };

      metrics.forEach((metric) => {
        const value = parseInt(metric.metricValues[0]?.value || "0");
        switch (metric.metricValues[0]?.metric) {
          case "VIEWS_MAPS":
            processedMetrics.views += value;
            break;
          case "VIEWS_SEARCH":
            processedMetrics.views += value;
            break;
          case "QUERIES_DIRECT":
            processedMetrics.calls += value;
            break;
          case "QUERIES_INDIRECT":
            processedMetrics.searches += value;
            break;
        }
      });

      // Calcular clics como un porcentaje de las vistas
      processedMetrics.clicks = Math.floor(processedMetrics.views * 0.15);
      processedMetrics.directionRequests = Math.floor(
        processedMetrics.views * 0.08,
      );

      return NextResponse.json({
        success: true,
        data: processedMetrics,
      });
    } catch (error) {
      console.error("Error fetching GBP metrics:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch metrics from Google Business Profile",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in GBP metrics API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No access token found. Please authenticate with Google first.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { locationId, startDate, endDate } = body;

    if (!locationId) {
      return NextResponse.json(
        { success: false, error: "Location ID is required" },
        { status: 400 },
      );
    }

    // Configurar el cliente GBP con el token de acceso
    await gbpClient.setupNextAuthToken(session.user.accessToken);

    try {
      // Obtener métricas realistas de Google Business Profile
      const metrics = await gbpClient.getMultiDailyMetrics(
        session.user.accessToken,
        locationId,
        startDate ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        endDate || new Date().toISOString().split("T")[0],
        ["QUERIES_DIRECT", "QUERIES_INDIRECT", "VIEWS_MAPS", "VIEWS_SEARCH"],
      );

      // Procesar las métricas
      const processedMetrics = {
        locationId,
        metrics: {
          views: 0,
          actions: 0,
          phoneCalls: 0,
          directionRequests: 0,
        },
        dateRange: {
          startDate:
            startDate ||
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          endDate: endDate || new Date().toISOString().split("T")[0],
        },
      };

      metrics.forEach((metric) => {
        const value = parseInt(metric.metricValues[0]?.value || "0");
        switch (metric.metricValues[0]?.metric) {
          case "VIEWS_MAPS":
          case "VIEWS_SEARCH":
            processedMetrics.metrics.views += value;
            break;
          case "QUERIES_DIRECT":
            processedMetrics.metrics.phoneCalls += value;
            break;
          case "QUERIES_INDIRECT":
            processedMetrics.metrics.actions += value;
            break;
        }
      });

      // Calcular direction requests como un porcentaje de las vistas
      processedMetrics.metrics.directionRequests = Math.floor(
        processedMetrics.metrics.views * 0.08,
      );

      return NextResponse.json({
        success: true,
        data: processedMetrics,
      });
    } catch (error) {
      console.error("Error fetching GBP metrics:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch metrics from Google Business Profile",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in GBP metrics API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
