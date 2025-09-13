import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const installationId = searchParams.get("installation_id");
    const setupAction = searchParams.get("setup_action");

    if (!installationId) {
      return NextResponse.json(
        { error: "installation_id requerido" },
        { status: 400 },
      );
    }

    // Redirigir a la página de selección de repositorios
    const redirectUrl = `/dashboard/deployments/connect?installation_id=${installationId}&setup_action=${setupAction || "install"}`;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Error in GitHub connect:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
