import { NextRequest, NextResponse } from "next/server";
import { deleteContact } from "@/lib/hubspot";

export async function POST(req: NextRequest) {
  try {
    const { contactId } = await req.json();

    // Validate input
    if (!contactId) {
      return NextResponse.json(
        {
          success: false,
          error: "ContactId is required",
        },
        { status: 400 },
      );
    }

    console.log("🗑️ Probando eliminación de contacto:", { contactId });

    // Delete contact
    const result = await deleteContact(contactId);

    return NextResponse.json({
      success: result.success,
      data: {
        contactId,
        error: result.error,
      },
    });
  } catch (error) {
    console.error("❌ Error en endpoint delete:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
