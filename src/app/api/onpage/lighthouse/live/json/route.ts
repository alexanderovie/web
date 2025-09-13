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

// Proxy to DataForSEO: On-Page Lighthouse Live JSON
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url,
      for_mobile = false,
      categories,
      audits,
      language_name,
      language_code,
      version,
      tag,
    } = body || {};

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'url' in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!DATAFORSEO_CONFIG.login || !DATAFORSEO_CONFIG.password) {
      return new Response(
        JSON.stringify({ error: "Server missing DataForSEO credentials" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const cacheKey = `lh:${url}:${for_mobile}:${(categories || []).join(",")}:${(audits || []).join(",")}:${language_name || ""}:${language_code || ""}:${version || ""}:${tag || ""}`;
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

    const endpoint = `${DATAFORSEO_CONFIG.baseUrl}/v3/on_page/lighthouse/live/json`;

    const payload: any[] = [
      {
        url,
        for_mobile,
        ...(categories ? { categories } : {}),
        ...(audits ? { audits } : {}),
        ...(language_name ? { language_name } : {}),
        ...(language_code ? { language_code } : {}),
        ...(version ? { version } : {}),
        ...(tag ? { tag } : {}),
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
