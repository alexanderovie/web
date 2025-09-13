import { NextRequest } from "next/server";
import { DATAFORSEO_CONFIG } from "@/lib/dataforseo-config";

// Simple in-memory cache with TTL to dedupe requests
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

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'url' in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const cacheKey = `instant:${url}`;
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

    const endpoint = `${DATAFORSEO_CONFIG.baseUrl}/v3/on_page/instant_pages`;

    const payload = [
      {
        url,
        enable_javascript: true,
        enable_browser_rendering: true,
        enable_cookies: true,
        enable_xhr: true,
        load_resources: true,
        custom_js: "meta = {}; meta.url = document.URL; meta;",
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
