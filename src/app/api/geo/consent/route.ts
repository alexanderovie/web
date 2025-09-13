import { NextRequest, NextResponse } from "next/server";

const GEO_COOKIE = "fd_geo_coords";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24; // 24h

function base64UrlEncode(input: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof input === "string") {
    bytes = new TextEncoder().encode(input);
  } else {
    bytes = new Uint8Array(input);
  }
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSHA256(key: string, data: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data),
  );
  return base64UrlEncode(signature);
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Missing INTERNAL_API_SECRET" },
        { status: 500 },
      );
    }

    const { latitude, longitude, accuracy } = await req.json();

    const lat = Number(latitude);
    const lng = Number(longitude);
    const acc = accuracy != null ? Number(accuracy) : undefined;

    if (
      !isFinite(lat) ||
      !isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 },
      );
    }

    const payload = {
      latitude: lat,
      longitude: lng,
      accuracy: acc,
      ts: Math.floor(Date.now() / 1000),
    };
    const json = JSON.stringify(payload);
    const b64 = base64UrlEncode(json);
    const sig = await hmacSHA256(secret, b64);
    const token = `v1.${b64}.${sig}`;

    const res = NextResponse.json({ success: true });
    res.cookies.set(GEO_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/",
      maxAge: DEFAULT_TTL_SECONDS,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}
