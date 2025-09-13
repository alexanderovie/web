import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ message: "My sites endpoint" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
