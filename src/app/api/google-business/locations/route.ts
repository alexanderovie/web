import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
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

    // Obtener las cuentas de negocio
    const accountsResponse = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!accountsResponse.ok) {
      const errorData = await accountsResponse.json();
      console.error("Error obteniendo cuentas:", errorData);
      return NextResponse.json(
        { error: "Error al obtener cuentas de negocio" },
        { status: accountsResponse.status },
      );
    }

    const accountsData = await accountsResponse.json();

    // Obtener ubicaciones y métricas para cada cuenta
    const locationsData = [];
    let totalLocations = 0;
    let totalWebsiteClicks = 0;
    let totalCallClicks = 0;

    for (const account of accountsData.accounts || []) {
      try {
        // Obtener ubicaciones de la cuenta
        const locationsResponse = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (locationsResponse.ok) {
          const locations = await locationsResponse.json();
          const accountLocations = locations.locations || [];

          // Obtener información detallada de cada ubicación
          const detailedLocations = [];

          for (const location of accountLocations) {
            try {
              // Obtener título de la ubicación
              const titleResponse = await fetch(
                `https://mybusinessbusinessinformation.googleapis.com/v1/${location.name}?readMask=title`,
                {
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json",
                  },
                },
              );

              let locationTitle = "Sin título";
              if (titleResponse.ok) {
                const titleData = await titleResponse.json();
                locationTitle = titleData.title || "Sin título";
              }

              // Obtener métricas de performance de la ubicación
              const locationId = location.name.split("/").pop();
              const metricsResponse = await fetch(
                `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:fetchMultiDailyMetricsTimeSeries?dailyMetrics=WEBSITE_CLICKS&dailyMetrics=CALL_CLICKS&dailyRange.startDate.year=2024&dailyRange.startDate.month=1&dailyRange.startDate.day=1&dailyRange.endDate.year=2024&dailyRange.endDate.month=12&dailyRange.endDate.day=31`,
                {
                  headers: {
                    Authorization: `Bearer ${tokenData.access_token}`,
                    "Content-Type": "application/json",
                  },
                },
              );

              let websiteClicks = 0;
              let callClicks = 0;

              if (metricsResponse.ok) {
                const metricsData = await metricsResponse.json();

                // Procesar métricas de website clicks
                if (
                  metricsData.timeSeries &&
                  metricsData.timeSeries.length > 0
                ) {
                  const websiteClicksSeries = metricsData.timeSeries.find(
                    (series: any) => series.dailyMetric === "WEBSITE_CLICKS",
                  );
                  if (websiteClicksSeries && websiteClicksSeries.dailyValues) {
                    websiteClicks = websiteClicksSeries.dailyValues.reduce(
                      (sum: number, day: any) =>
                        sum + (parseInt(day.value) || 0),
                      0,
                    );
                  }

                  const callClicksSeries = metricsData.timeSeries.find(
                    (series: any) => series.dailyMetric === "CALL_CLICKS",
                  );
                  if (callClicksSeries && callClicksSeries.dailyValues) {
                    callClicks = callClicksSeries.dailyValues.reduce(
                      (sum: number, day: any) =>
                        sum + (parseInt(day.value) || 0),
                      0,
                    );
                  }
                }
              }

              totalWebsiteClicks += websiteClicks;
              totalCallClicks += callClicks;

              detailedLocations.push({
                id: locationId,
                name: location.name,
                title: locationTitle,
                websiteClicks,
                callClicks,
                totalClicks: websiteClicks + callClicks,
              });
            } catch (error) {
              console.error(
                `Error procesando ubicación ${location.name}:`,
                error,
              );
            }
          }

          totalLocations += accountLocations.length;

          locationsData.push({
            accountName: account.accountName,
            accountId: account.name,
            accountType: account.type,
            verificationState: account.verificationState,
            vettedState: account.vettedState,
            locations: detailedLocations,
            totalLocations: accountLocations.length,
            totalAccountClicks: detailedLocations.reduce(
              (sum, loc) => sum + loc.totalClicks,
              0,
            ),
          });
        } else {
          console.error(
            `Error obteniendo ubicaciones para cuenta ${account.name}:`,
            await locationsResponse.json(),
          );
        }
      } catch (error) {
        console.error(`Error procesando cuenta ${account.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      accounts: accountsData.accounts || [],
      locations: locationsData,
      summary: {
        totalAccounts: (accountsData.accounts || []).length,
        totalLocations,
        totalWebsiteClicks,
        totalCallClicks,
        totalClicks: totalWebsiteClicks + totalCallClicks,
        accountsWithLocations: locationsData.filter(
          (acc) => acc.totalLocations > 0,
        ).length,
        accountsWithoutLocations: locationsData.filter(
          (acc) => acc.totalLocations === 0,
        ).length,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/google-business/locations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
