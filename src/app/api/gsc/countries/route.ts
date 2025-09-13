import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { GSCClient } from "@/lib/gsc-client";

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
    const siteUrl = searchParams.get("site");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!siteUrl) {
      return NextResponse.json(
        { success: false, error: "Site URL is required" },
        { status: 400 },
      );
    }

    console.log("Countries API - Session user email:", session.user.email);
    console.log("Token expires at:", session.user.expiresAt);
    console.log("Current time:", Math.floor(Date.now() / 1000));
    console.log(
      "Token is expired:",
      Math.floor(Date.now() / 1000) > (session.user.expiresAt || 0),
    );

    const gscClient = new GSCClient();
    await gscClient.setupNextAuthToken(session.user.accessToken);

    const countriesData = await gscClient.getCountries(siteUrl, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json({
      success: true,
      data: countriesData,
    });
  } catch (error) {
    console.error("Error in countries API:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch countries data" },
      { status: 500 },
    );
  }
}
