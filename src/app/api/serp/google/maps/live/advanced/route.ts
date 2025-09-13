import { NextRequest } from "next/server";
import { DATAFORSEO_CONFIG } from "@/lib/dataforseo-config";

// Simple in-memory cache with TTL
const CACHE_TTL_MS = Number(
  process.env.DATAFORSEO_CACHE_TTL_MS || 5 * 60 * 1000,
);
const cache = new Map<string, { expires: number; value: any }>();
const getCached = (key: string) => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expires > Date.now()) return entry.value;
  cache.delete(key);
  return null;
};
const setCached = (key: string, value: any) => {
  cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
};

// Proxy to DataForSEO: Google Maps SERP Live Advanced
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      keyword,
      language_code = "es",
      location_code,
      location_name,
    } = body || {};

    if (!keyword) {
      return new Response(JSON.stringify({ error: "Missing 'keyword'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!location_code && !location_name) {
      return new Response(
        JSON.stringify({ error: "Provide 'location_code' or 'location_name'" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const cacheKey = `maps:${keyword}:${language_code}:${location_code || ""}:${location_name || ""}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(
        JSON.stringify({ ok: true, data: cached, cache: "HIT" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", "X-Cache": "HIT" },
        },
      );
    }

    const endpoint = `${DATAFORSEO_CONFIG.baseUrl}/v3/serp/google/maps/live/advanced`;
    const payload = [
      {
        keyword: encodeURI(String(keyword)),
        ...(location_code ? { location_code } : {}),
        ...(location_name ? { location_name } : {}),
        language_code,
        device: "desktop",
        os: "windows",
        depth: 100,
      },
    ];

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${DATAFORSEO_CONFIG.login}:${DATAFORSEO_CONFIG.password}`,
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data?.message || "Upstream error", data }),
        { status: res.status, headers: { "Content-Type": "application/json" } },
      );
    }

    setCached(cacheKey, data);
    return new Response(JSON.stringify({ ok: true, data, cache: "MISS" }), {
      status: 200,
      headers: { "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error?.message || "Unexpected error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
