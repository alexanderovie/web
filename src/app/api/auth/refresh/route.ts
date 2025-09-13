import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ message: "Refresh endpoint" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
