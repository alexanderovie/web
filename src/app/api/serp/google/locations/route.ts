import { NextRequest } from "next/server";
import { DATAFORSEO_CONFIG } from "@/lib/dataforseo-config";

// Simple in-memory cache with TTL
const CACHE_TTL_MS = Number(
  process.env.DATAFORSEO_CACHE_TTL_MS || 24 * 60 * 60 * 1000,
); // 24h; locations change rarely
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

// Proxy to DataForSEO: Google SERP Locations (search by query)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const country_code = searchParams.get("country_code"); // optional ISO code like US, ES

    if (!q) {
      return new Response(JSON.stringify({ error: "Missing 'q'" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cacheKey = `locations:${q}:${country_code || ""}`;
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

    const endpoint = new URL(
      `${DATAFORSEO_CONFIG.baseUrl}/v3/serp/google/locations`,
    );
    endpoint.searchParams.set("q", q);
    if (country_code) endpoint.searchParams.set("country_code", country_code);

    const res = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${DATAFORSEO_CONFIG.login}:${DATAFORSEO_CONFIG.password}`,
        ).toString("base64")}`,
      },
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
