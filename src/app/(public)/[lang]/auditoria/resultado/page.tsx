"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import Hero from "@/components/sections/hero";

export default function AuditoriaResultadoPage() {
  const params = useParams();
  const search = useSearchParams();
  const lang = (params?.lang as string) || "es";
  const onpageUrl = search?.get("onpage_url") || null;

  const heroProps = {
    badge: lang === "es" ? "Resultado de Auditoría" : "Audit Result",
    title:
      lang === "es"
        ? "Tu Auditoría de Presencia Digital"
        : "Your Digital Presence Audit",
    subtitle:
      lang === "es"
        ? "Descubre cómo está posicionado tu negocio online y recibe recomendaciones personalizadas para mejorar tu visibilidad digital."
        : "Discover how your business is positioned online and receive personalized recommendations to improve your digital visibility.",
    showButton: false,
    showCarousel: false,
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [mapsSerp, setMapsSerp] = useState<any | null>(null);
  const calledRef = useRef(false);
  // Lighthouse state
  const [lighthouse, setLighthouse] = useState<any | null>(null);
  const [lighthouseError, setLighthouseError] = useState<string | null>(null);
  const [forMobile, setForMobile] = useState(false);
  const lhCalled = useRef<Set<string>>(new Set());
  // Keyword override state for Maps SERP
  const [customKeyword, setCustomKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const mapsCalled = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!onpageUrl) return;
    if (calledRef.current) return; // evita doble llamada en Strict Mode
    calledRef.current = true;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/onpage/instant-pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: onpageUrl }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "Request failed");
        }
        setResult(json.data);
      } catch (e: any) {
        setError(e?.message || "Unexpected error");
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [onpageUrl]);

  useEffect(() => {
    if (!onpageUrl) return;

    // fetch Maps SERP if we have query info in URL (category or name + city)
    const category = search?.get("category") || null;
    const name = search?.get("name") || null;
    const city = search?.get("city") || null;
    const region = search?.get("region") || null;
    const country = search?.get("country") || null;

    const defaultKeyword =
      category && city
        ? `${category} ${city}`
        : name && city
          ? `${name} ${city}`
          : null;

    const candidateKeyword =
      (customKeyword && customKeyword.trim()) || defaultKeyword;
    const location_name =
      [city, region, country].filter(Boolean).join(", ") || null;

    if (!candidateKeyword || !location_name) return;

    const key = `${candidateKeyword}|${location_name}|${lang}`;
    if (mapsCalled.current.has(key)) return; // evita duplicados para la misma combinación
    mapsCalled.current.add(key);

    const run = async () => {
      try {
        // 1) Intentar resolver location_code automáticamente
        let location_code: number | undefined;
        try {
          const locRes = await fetch(
            `/api/serp/google/locations?q=${encodeURIComponent(location_name)}`,
          );
          const locJson = await locRes.json();
          const locTask = locJson?.data?.tasks?.[0];
          const locResult =
            locTask?.result || locTask?.items || locJson?.data?.items || [];
          const firstLoc = Array.isArray(locResult) ? locResult[0] : null;
          const code =
            firstLoc?.location_code || firstLoc?.locationId || firstLoc?.id;
          if (typeof code === "number") location_code = code;
        } catch {
          // ignore location lookup errors
        }

        // 2) Hacer la consulta de Maps SERP preferentemente con location_code
        const langCode = lang === "es" ? "es" : "en";
        const body: any = {
          keyword: candidateKeyword,
          language_code: langCode,
        };
        if (location_code) {
          body.location_code = location_code;
        } else {
          body.location_name = location_name;
        }

        const res = await fetch("/api/serp/google/maps/live/advanced", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (res.ok) setMapsSerp(json.data);
      } catch {
        // ignore SERP errors for now
      }
    };
    run();
  }, [onpageUrl, search, lang, customKeyword]);

  // Prefill input with default keyword when available (only if user hasn't typed anything yet)
  useEffect(() => {
    const category = search?.get("category") || null;
    const name = search?.get("name") || null;
    const city = search?.get("city") || null;
    const defaultKeyword =
      category && city
        ? `${category} ${city}`
        : name && city
          ? `${name} ${city}`
          : "";
    if (!keywordInput && defaultKeyword) setKeywordInput(defaultKeyword);
  }, [search, keywordInput]);

  // Fetch Lighthouse Live JSON with Desktop/Mobile toggle
  useEffect(() => {
    if (!onpageUrl) return;
    const key = `${onpageUrl}|${forMobile ? "m" : "d"}`;
    if (lhCalled.current.has(key)) return; // evita duplicados para la misma combinación
    lhCalled.current.add(key);

    const run = async () => {
      try {
        const res = await fetch("/api/onpage/lighthouse/live/json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: onpageUrl,
            for_mobile: forMobile,
            categories: ["performance"],
          }),
        });
        const json = await res.json();
        if (res.ok) {
          setLighthouse(json.data);
          setLighthouseError(null);
        } else {
          setLighthouse(null);
          setLighthouseError(json?.error || "Lighthouse error");
        }
      } catch (e: any) {
        setLighthouse(null);
        setLighthouseError(e?.message || "Lighthouse error");
      }
    };
    run();
  }, [onpageUrl, forMobile]);

  const task = useMemo(() => result?.tasks?.[0] ?? null, [result]);
  const res0 = useMemo(() => task?.result?.[0] ?? null, [task]);
  const items = useMemo(() => res0?.items ?? [], [res0]);
  const firstItem = useMemo(
    () => (Array.isArray(items) ? items[0] : null),
    [items],
  );
  const mapsItems = useMemo(
    () => mapsSerp?.tasks?.[0]?.result?.[0]?.items || [],
    [mapsSerp],
  );

  // Derive Lighthouse entities
  const lhTask = useMemo(() => lighthouse?.tasks?.[0] ?? null, [lighthouse]);
  const lhRes0 = useMemo(() => lhTask?.result?.[0] ?? null, [lhTask]);
  const lhAudits = lhRes0?.audits || {};
  const lhPerf = lhRes0?.categories?.performance;

  // Helpers
  const ms = (n?: number) =>
    typeof n === "number" && !isNaN(n) ? `${Math.round(n)} ms` : "-";
  const s = (n?: number) =>
    typeof n === "number" && !isNaN(n) ? `${(n / 1000).toFixed(1)} s` : "-";
  const pct = (n?: number) =>
    typeof n === "number" && !isNaN(n) ? `${Math.round(n * 100)}%` : "-";

  // Helpers de formato
  const formatBytes = (bytes?: number) => {
    if (typeof bytes !== "number" || isNaN(bytes)) return "-";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"] as const;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };
  const formatMs = (ms?: number) =>
    typeof ms === "number" && !isNaN(ms) ? `${Math.round(ms)} ms` : "-";
  const formatNumber = (n?: number) =>
    typeof n === "number" && !isNaN(n) ? n.toLocaleString() : "-";

  const requestedUrl: string | undefined = task?.data?.url;
  const finalUrl: string | undefined = firstItem?.url;
  const statusCode: number | undefined = firstItem?.status_code;

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `instant-pages-${
      new URL(onpageUrl || requestedUrl || "https://example.com").hostname
    }.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadLighthouse = () => {
    if (!lighthouse) return;
    const blob = new Blob([JSON.stringify(lighthouse, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lighthouse-${new URL(onpageUrl || requestedUrl || "https://example.com").hostname}-${forMobile ? "mobile" : "desktop"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main>
      <div className="relative">
        <Hero {...heroProps} />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {onpageUrl && (
          <p className="text-sm text-gray-500">URL auditada: {onpageUrl}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {result && (
            <>
              <button
                onClick={downloadJSON}
                className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50"
              >
                {lang === "es" ? "Descargar JSON" : "Download JSON"}
              </button>
            </>
          )}
          {/* Keyword override controls for Maps SERP */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              placeholder={
                lang === "es" ? "Keyword (opcional)" : "Keyword (optional)"
              }
              className="px-3 py-2 text-sm rounded border bg-white min-w-[240px]"
            />
            <button
              onClick={() => setCustomKeyword(keywordInput.trim())}
              className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50"
            >
              {lang === "es" ? "Usar keyword" : "Use keyword"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-6 p-4 rounded-md border bg-gray-50">
            {lang === "es"
              ? "Cargando auditoría on-page..."
              : "Loading on-page audit..."}
          </div>
        )}
        {error && (
          <div className="mt-6 p-4 rounded-md border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {firstItem && (
          <div className="mt-8 space-y-6">
            {/* Resumen */}
            <section className="p-6 rounded-lg border shadow-sm bg-white">
              <h2 className="text-xl font-semibold mb-4">
                {lang === "es" ? "Resumen On-Page" : "On-Page Summary"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Onpage Score</div>
                  <div className="text-lg font-medium">
                    {firstItem.onpage_score ?? "-"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Status Code</div>
                  <div className="text-lg font-medium">{statusCode ?? "-"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Tamaño de página</div>
                  <div className="text-lg font-medium">
                    {formatBytes(firstItem.page_timing?.page_size)}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">DOM Content Loaded</div>
                  <div className="text-lg font-medium">
                    {formatMs(firstItem.page_timing?.dom_content_loaded)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">DOM Complete</div>
                  <div className="text-lg font-medium">
                    {formatMs(firstItem.page_timing?.dom_complete)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Time to Interactive</div>
                  <div className="text-lg font-medium">
                    {formatMs(firstItem.page_timing?.time_to_interactive)}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <div>
                  <span className="font-medium">URL solicitada:</span>{" "}
                  {requestedUrl || "-"}
                </div>
                <div>
                  <span className="font-medium">URL final:</span>{" "}
                  {finalUrl || "-"}
                </div>
              </div>
            </section>

            {/* Métricas de página */}
            {(firstItem.page_metrics || firstItem.page_timing) && (
              <section className="p-6 rounded-lg border shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3">
                  {lang === "es" ? "Métricas" : "Metrics"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Links internos</div>
                    <div className="text-lg font-medium">
                      {formatNumber(firstItem.page_metrics?.links_internal)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Links externos</div>
                    <div className="text-lg font-medium">
                      {formatNumber(firstItem.page_metrics?.links_external)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Broken links</div>
                    <div className="text-lg font-medium">
                      {formatNumber(firstItem.page_metrics?.broken_links)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Imágenes</div>
                    <div className="text-lg font-medium">
                      {formatNumber(firstItem.page_metrics?.images)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Scripts</div>
                    <div className="text-lg font-medium">
                      {formatNumber(firstItem.page_metrics?.scripts)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Stylesheets</div>
                    <div className="text-lg font-medium">
                      {formatNumber(firstItem.page_metrics?.stylesheets)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Palabras (estimado)</div>
                    <div className="text-lg font-medium">
                      {formatNumber(firstItem.page_metrics?.words_count)}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Headings */}
            {firstItem.meta?.htags && (
              <section className="p-6 rounded-lg border shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3">Headings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(["h1", "h2", "h3"] as const).map((h) => (
                    <div key={h}>
                      <div className="text-sm text-gray-500 uppercase">
                        {h.toUpperCase()}
                      </div>
                      <ul className="mt-2 list-disc list-inside text-sm space-y-1">
                        {(firstItem.meta.htags?.[h] || []).map(
                          (t: string, i: number) => (
                            <li key={`${h}-${i}`}>{t}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Meta */}
            {firstItem.meta && (
              <section className="p-6 rounded-lg border shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3">Meta</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  {firstItem.meta.title && (
                    <div>
                      <span className="font-medium">Title:</span>{" "}
                      {firstItem.meta.title}
                    </div>
                  )}
                  {firstItem.meta.description && (
                    <div>
                      <span className="font-medium">Description:</span>{" "}
                      {firstItem.meta.description}
                    </div>
                  )}
                  {firstItem.meta.robots && (
                    <div>
                      <span className="font-medium">Robots:</span>{" "}
                      {firstItem.meta.robots}
                    </div>
                  )}
                  {firstItem.meta.canonical && (
                    <div>
                      <span className="font-medium">Canonical:</span>{" "}
                      {firstItem.meta.canonical}
                    </div>
                  )}
                </div>

                {/* Social tags si existen */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {Object.keys(firstItem.meta)
                    .filter(
                      (k) =>
                        k.toLowerCase().startsWith("og") ||
                        k.toLowerCase().startsWith("twitter"),
                    )
                    .map((k) => (
                      <div key={k} className="text-gray-700">
                        <span className="font-medium">{k}:</span>{" "}
                        {String(firstItem.meta[k])}
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Checks (si existen) */}
            {(firstItem.checks || res0?.checks) && (
              <section className="p-6 rounded-lg border shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3">
                  {lang === "es" ? "Checks de la página" : "Page Checks"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(firstItem.checks || res0?.checks || {}).map(
                    ([k, v]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between rounded border px-3 py-2 bg-gray-50"
                      >
                        <span className="text-gray-700 break-all">{k}</span>
                        <span
                          className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            v === true
                              ? "bg-green-100 text-green-700"
                              : v === false
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {typeof v === "boolean"
                            ? v
                              ? lang === "es"
                                ? "OK"
                                : "OK"
                              : lang === "es"
                                ? "Problema"
                                : "Issue"
                            : String(v)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* Lista de items si hay más de uno */}
            {Array.isArray(items) && items.length > 1 && (
              <section className="p-6 rounded-lg border shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3">
                  {lang === "es" ? "Recursos Analizados" : "Analyzed Items"}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-4">URL</th>
                        <th className="py-2 pr-4">Tipo</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Peso</th>
                        <th className="py-2 pr-4">DOM Complete</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      {items.map((it: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 pr-4 max-w-[440px] break-words">
                            {it.url}
                          </td>
                          <td className="py-2 pr-4">
                            {it.resource_type || "-"}
                          </td>
                          <td className="py-2 pr-4">{it.status_code ?? "-"}</td>
                          <td className="py-2 pr-4">
                            {formatBytes(it.page_timing?.page_size)}
                          </td>
                          <td className="py-2 pr-4">
                            {formatMs(it.page_timing?.dom_complete)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Google Maps SERP (si disponible) */}
            {Array.isArray(mapsItems) && mapsItems.length > 0 && (
              <section className="p-6 rounded-lg border shadow-sm bg-white">
                <h3 className="text-lg font-semibold mb-3">
                  {lang === "es"
                    ? "Top en Google Maps (SERP)"
                    : "Top Google Maps (SERP)"}
                </h3>
                {/* Show effective keyword used */}
                <p className="text-xs text-gray-500 mb-2">
                  Keyword:{" "}
                  {(customKeyword && customKeyword.trim()) ||
                    (search?.get("category") && search?.get("city")
                      ? `${search.get("category")} ${search.get("city")}`
                      : search?.get("name") && search?.get("city")
                        ? `${search.get("name")} ${search.get("city")}`
                        : "-")}
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-4">Rank</th>
                        <th className="py-2 pr-4">Título</th>
                        <th className="py-2 pr-4">Categoría</th>
                        <th className="py-2 pr-4">Rating</th>
                        <th className="py-2 pr-4">City</th>
                        <th className="py-2 pr-4">Address</th>
                      </tr>
                    </thead>
                    <tbody className="align-top">
                      {mapsItems.map((it: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 pr-4">
                            {it.rank_absolute ?? it.rank_group ?? "-"}
                          </td>
                          <td className="py-2 pr-4">{it.title || "-"}</td>
                          <td className="py-2 pr-4">{it.category || "-"}</td>
                          <td className="py-2 pr-4">
                            {it.rating?.value
                              ? `${it.rating.value} (${it.rating.votes_count} votos)`
                              : "-"}
                          </td>
                          <td className="py-2 pr-4">
                            {it.address_info?.city || "-"}
                          </td>
                          <td className="py-2 pr-4">
                            {it.address || it.snippet || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Lighthouse Section */}
            {lhRes0 && (
              <section className="mt-8 p-6 rounded-lg border shadow-sm bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Lighthouse (Live)</h2>
                  <div className="flex gap-2 items-center">
                    <div className="inline-flex rounded border overflow-hidden">
                      <button
                        onClick={() => setForMobile(false)}
                        className={`px-3 py-2 text-sm ${!forMobile ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                        aria-pressed={!forMobile}
                      >
                        Desktop
                      </button>
                      <button
                        onClick={() => setForMobile(true)}
                        className={`px-3 py-2 text-sm ${forMobile ? "bg-gray-900 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                        aria-pressed={forMobile}
                      >
                        Mobile
                      </button>
                    </div>
                    <button
                      onClick={downloadLighthouse}
                      className="px-3 py-2 text-sm rounded border bg-white hover:bg-gray-50"
                    >
                      {lang === "es" ? "Descargar JSON" : "Download JSON"}
                    </button>
                  </div>
                </div>

                {lighthouseError && (
                  <div className="mb-4 p-3 rounded border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
                    {lighthouseError}
                  </div>
                )}

                {lhPerf?.score != null && (
                  <div className="mb-4 text-sm text-gray-700">
                    <span className="font-medium">Performance score:</span>{" "}
                    {pct(lhPerf.score)} ({forMobile ? "mobile" : "desktop"})
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">FCP</div>
                    <div className="text-lg font-medium">
                      {s(lhAudits?.["first-contentful-paint"]?.numericValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">LCP</div>
                    <div className="text-lg font-medium">
                      {s(lhAudits?.["largest-contentful-paint"]?.numericValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Speed Index</div>
                    <div className="text-lg font-medium">
                      {s(lhAudits?.["speed-index"]?.numericValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">TTI</div>
                    <div className="text-lg font-medium">
                      {s(lhAudits?.["interactive"]?.numericValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">TBT</div>
                    <div className="text-lg font-medium">
                      {ms(lhAudits?.["total-blocking-time"]?.numericValue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">CLS</div>
                    <div className="text-lg font-medium">
                      {typeof lhAudits?.["cumulative-layout-shift"]
                        ?.numericValue === "number"
                        ? lhAudits?.[
                            "cumulative-layout-shift"
                          ]?.numericValue.toFixed(3)
                        : "-"}
                    </div>
                  </div>
                </div>

                {/* Diagnostics summary if present */}
                {lhAudits?.diagnostics?.details?.items?.[0] && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Diagnostics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Requests</div>
                        <div className="text-lg font-medium">
                          {lhAudits.diagnostics.details.items[0].numRequests ??
                            "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Scripts</div>
                        <div className="text-lg font-medium">
                          {lhAudits.diagnostics.details.items[0].numScripts ??
                            "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Stylesheets</div>
                        <div className="text-lg font-medium">
                          {lhAudits.diagnostics.details.items[0]
                            .numStylesheets ?? "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Fonts</div>
                        <div className="text-lg font-medium">
                          {lhAudits.diagnostics.details.items[0].numFonts ??
                            "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Total bytes</div>
                        <div className="text-lg font-medium">
                          {formatBytes(
                            lhAudits.diagnostics.details.items[0]
                              .totalByteWeight,
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500">Main doc size</div>
                        <div className="text-lg font-medium">
                          {formatBytes(
                            lhAudits.diagnostics.details.items[0]
                              .mainDocumentTransferSize,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* JSON crudo (colapsable simple) */}
            {result && (
              <details className="p-6 rounded-lg border shadow-sm bg-white">
                <summary className="cursor-pointer text-lg font-semibold">
                  {lang === "es" ? "Ver JSON completo" : "View full JSON"}
                </summary>
                <pre className="mt-4 max-h-[600px] overflow-auto text-xs bg-gray-50 p-4 rounded">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
