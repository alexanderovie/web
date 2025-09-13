import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  createErrorResponse,
  AuthenticationError,
  ValidationError,
} from "@/lib/error-handler";
import { gbpClient } from "@/lib/gbp-client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const accountName = searchParams.get("accountName");

    console.log(
      "🔍 GBP Locations API - Session user email:",
      session?.user?.email,
    );
    console.log(
      "🔍 GBP Locations API - Access token present:",
      !!session?.user?.accessToken,
    );
    console.log("🔍 GBP Locations API - Requested account:", accountName);

    if (!session?.user?.accessToken) {
      throw new AuthenticationError("No access token found");
    }

    if (!accountName) {
      throw new ValidationError("Account name is required", {
        accountName: accountName || null,
      });
    }

    console.log("Calling GBP API to get locations for account:", accountName);
    const locations = await gbpClient.getLocations(
      session.user.accessToken,
      accountName,
    );
    console.log("GBP Locations found:", locations.length);

    return NextResponse.json({
      success: true,
      data: locations,
      message: `Found ${locations.length} locations for account`,
    });
  } catch (error) {
    console.error("GBP Locations API error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });

    return createErrorResponse(
      error instanceof Error ? error : new Error("Unknown error"),
    );
  }
}
