import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Las credenciales que funcionan en el endpoint test
    const workingCredentials = {
      login: "fascinantedigital@gmail.com",
      password: "Fascinante2024!",
      baseUrl: "https://api.dataforseo.com",
    };

    // Generar el token base64
    const credentials = `${workingCredentials.login}:${workingCredentials.password}`;
    const base64Credentials = Buffer.from(credentials).toString("base64");

    return NextResponse.json({
      success: true,
      credentials: {
        login: workingCredentials.login,
        password: workingCredentials.password,
        baseUrl: workingCredentials.baseUrl,
        base64Token: base64Credentials,
      },
      message: "Estas son las credenciales que funcionan en el endpoint test",
    });
  } catch (error) {
    console.error("Error in working-credentials:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to get working credentials",
      },
      { status: 500 },
    );
  }
}
