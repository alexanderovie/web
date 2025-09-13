import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { gbpClient } from "@/lib/gbp-client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const locationName = searchParams.get("location");

    console.log(
      "GBP Search Keywords API - Session user email:",
      session?.user?.email,
    );
    console.log(
      "GBP Search Keywords API - Access token present:",
      !!session?.user?.accessToken,
    );
    console.log("GBP Search Keywords API - Location name:", locationName);

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No access token found",
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    if (!locationName) {
      return NextResponse.json(
        {
          success: false,
          error: "Location name is required",
          message: "Please provide a location name parameter",
        },
        { status: 400 },
      );
    }

    try {
      console.log(
        "Calling GBP API to get search keywords for location:",
        locationName,
      );
      const searchKeywords = await gbpClient.getSearchKeywords(
        session.user.accessToken,
        locationName,
      );
      console.log(
        "GBP Search keywords found:",
        searchKeywords.keywords?.length || 0,
      );

      return NextResponse.json({
        success: true,
        data: searchKeywords,
        message: `Found ${searchKeywords.keywords?.length || 0} search keywords for location ${locationName}`,
      });
    } catch (apiError) {
      console.error("GBP Search Keywords API - API Error:", apiError);

      // Si es un error de permisos o cuota, devolver información útil
      if (apiError instanceof Error) {
        if (
          apiError.message.includes("quota") ||
          apiError.message.includes("permission")
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "API Access Required",
              message:
                "Google Business Profile Performance API requires additional permissions. Please request GBP API access.",
              details: apiError.message,
            },
            { status: 403 },
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch search keywords",
          message:
            apiError instanceof Error ? apiError.message : "Unknown API error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("GBP Search Keywords API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch search keywords",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();
    const { locationId } = body;

    if (!session?.user?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "No access token found",
          message: "Authentication required",
        },
        { status: 401 },
      );
    }

    if (!locationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Location ID is required",
          message: "Please provide a location ID",
        },
        { status: 400 },
      );
    }

    try {
      const searchKeywords = await gbpClient.getSearchKeywords(
        session.user.accessToken,
        locationId,
      );

      // Formatear para el frontend
      const queries =
        searchKeywords.keywords?.map((keyword) => ({
          query: keyword.keyword || "Unknown",
          views: keyword.impressions || 0,
          actions: Math.floor((keyword.impressions || 0) * 0.15),
        })) || [];

      return NextResponse.json({
        success: true,
        queries,
        message: `Found ${queries.length} search queries`,
      });
    } catch (apiError) {
      console.error("GBP Search Keywords API - API Error:", apiError);

      // Si es un error de permisos o cuota, devolver información útil
      if (apiError instanceof Error) {
        if (
          apiError.message.includes("quota") ||
          apiError.message.includes("permission")
        ) {
          return NextResponse.json(
            {
              success: false,
              error: "API Access Required",
              message:
                "Google Business Profile Performance API requires additional permissions. Please request GBP API access.",
              details: apiError.message,
            },
            { status: 403 },
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch search keywords",
          message:
            apiError instanceof Error ? apiError.message : "Unknown API error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("GBP Search Keywords API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch search keywords",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
