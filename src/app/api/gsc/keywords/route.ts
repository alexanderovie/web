import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { gscClient } from "@/lib/gsc-client";

export async function GET(request: NextRequest) {
  try {
    const useRealAPI = process.env.USE_REAL_GSC_API === "true";

    // Obtener el parámetro site de la URL
    const { searchParams } = new URL(request.url);
    const siteUrl = searchParams.get("site");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (useRealAPI) {
      try {
        const session = await auth();
        console.log("Session user email:", session?.user?.email);
        console.log("Session user:", session?.user);
        console.log("Token expires at:", session?.user?.expiresAt);
        console.log("Current time:", Math.floor(Date.now() / 1000));
        console.log(
          "Token is expired:",
          session?.user?.expiresAt
            ? Math.floor(Date.now() / 1000) > session.user.expiresAt
            : "Unknown",
        );

        if (!session?.user?.accessToken) {
          return NextResponse.json(
            {
              success: false,
              error: "No access token found. Please authenticate first.",
              message: "Authentication required",
            },
            { status: 401 },
          );
        }

        // Verificar si el token ha expirado
        if (
          session.user.expiresAt &&
          Math.floor(Date.now() / 1000) > session.user.expiresAt
        ) {
          console.log("Token has expired");
          return NextResponse.json(
            {
              success: false,
              error: "Access token has expired. Please re-authenticate.",
              message: "Token expired",
              session: {
                user: {
                  email: session.user?.email,
                  name: session.user?.name,
                  hasAccessToken: !!session.user?.accessToken,
                  expiresAt: session.user?.expiresAt,
                },
              },
            },
            { status: 401 },
          );
        }

        console.log(
          "Calling GSC API with token:",
          session.user.accessToken.substring(0, 20) + "...",
        );

        // Usar el sitio proporcionado o el predeterminado
        const siteToUse = siteUrl || "sc-domain:fascinantedigital.com";
        console.log("Using site:", siteToUse);

        const keywords = await gscClient.getKeywords(
          {
            startDate: startDate || "2024-01-01",
            endDate: endDate || "2024-12-31",
            dimensions: ["query"],
            rowLimit: 50,
          },
          session.user.accessToken,
          siteToUse, // Pasar el sitio como parámetro adicional
        );

        console.log("Keywords found:", keywords.length);
        if (keywords.length > 0) {
          console.log("First keyword:", keywords[0]);
        }

        return NextResponse.json({
          success: true,
          data: keywords,
          message: "Keywords retrieved successfully",
          site: siteToUse,
        });
      } catch (error) {
        console.error("GSC API error:", error);
        return NextResponse.json(
          {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch keywords",
            message: "API error",
          },
          { status: 500 },
        );
      }
    } else {
      // Mock data for development
      const mockKeywords = [
        {
          keyword: "fascinante digital",
          clicks: 2,
          impressions: 10,
          ctr: 0.2,
          averagePosition: 3,
        },
        {
          keyword: "agencia marketing inmobiliario miami",
          clicks: 0,
          impressions: 15,
          ctr: 0.0,
          averagePosition: 87.9,
        },
        {
          keyword: "diseño web fascinante digital",
          clicks: 0,
          impressions: 15,
          ctr: 0.0,
          averagePosition: 7.5,
        },
        {
          keyword: "flowbite kanban",
          clicks: 0,
          impressions: 1,
          ctr: 0.0,
          averagePosition: 91.0,
        },
        {
          keyword: "next js flowbite",
          clicks: 0,
          impressions: 1,
          ctr: 0.0,
          averagePosition: 47.0,
        },
        {
          keyword: "seo fascinante digital",
          clicks: 0,
          impressions: 11,
          ctr: 0.0,
          averagePosition: 8.1,
        },
        {
          keyword: "shadcn tanstack start",
          clicks: 0,
          impressions: 1,
          ctr: 0.0,
          averagePosition: 53.0,
        },
        {
          keyword: "tanstack start tailwind",
          clicks: 0,
          impressions: 1,
          ctr: 0.0,
          averagePosition: 28.0,
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockKeywords,
        message: "Mock keywords data",
        site: siteUrl || "sc-domain:fascinantedigital.com",
      });
    }
  } catch (error) {
    console.error("Keywords API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
