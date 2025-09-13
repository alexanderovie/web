import { NextRequest, NextResponse } from "next/server";
import { updateContactLifecycleStage, getLifecycleStages } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  try {
    const { contactId, stage } = await req.json();

    // Validate input
    if (!contactId || !stage) {
      return NextResponse.json(
        {
          success: false,
          error: "ContactId and stage are required",
        },
        { status: 400 },
      );
    }

    console.log("🔄 Probando cambio de etapa del ciclo de vida:", {
      contactId,
      stage,
    });

    // Update lifecycle stage
    const result = await updateContactLifecycleStage(contactId, stage);

    return NextResponse.json({
      success: result.success,
      data: {
        contactId,
        newStage: stage,
        error: result.error,
      },
    });
  } catch (error) {
    console.error("❌ Error en endpoint lifecycle:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    console.log("📋 Obteniendo etapas del ciclo de vida disponibles...");

    const result = await getLifecycleStages();

    return NextResponse.json({
      success: result.success,
      data: {
        stages: result.stages,
        error: result.error,
      },
    });
  } catch (error) {
    console.error("❌ Error obteniendo etapas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
