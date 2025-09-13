import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { createErrorResponse, AuthenticationError } from "@/lib/error-handler";
import { gbpClient } from "@/lib/gbp-client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    console.log(
      "🔍 GBP Accounts API - Session user email:",
      session?.user?.email,
    );
    console.log(
      "🔍 GBP Accounts API - Access token present:",
      !!session?.user?.accessToken,
    );

    if (!session?.user?.accessToken) {
      throw new AuthenticationError("No access token found");
    }

    console.log("Calling GBP API to get accounts...");
    const accounts = await gbpClient.getAccounts(session.user.accessToken);
    console.log("GBP Accounts found:", accounts.length);

    return NextResponse.json({
      success: true,
      data: accounts,
      message: `Found ${accounts.length} Google Business Profile accounts`,
    });
  } catch (error) {
    console.error("GBP Accounts API error:", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
    });

    return createErrorResponse(
      error instanceof Error ? error : new Error("Unknown error"),
    );
  }
}
