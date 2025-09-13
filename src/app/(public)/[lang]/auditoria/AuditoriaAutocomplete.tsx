"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { TypeAnimation } from "react-type-animation";
import { Button } from "@/components/ui/button";
import { DomainLink } from "@/components/DomainLink";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import AuditReport from "@/components/audit-report";
// import { generateAuditReport } from "@/lib/audit-service";

interface PlaceSuggestion {
  placeId: string;
  structuredFormat?: {
    mainText?: { text: string };
    secondaryText?: { text: string };
  };
  displayName?: { text: string };
  formattedAddress?: string;
  description?: string;
  locationContext?: string; // 🎯 Nueva propiedad para contexto de ubicación
}

interface PlaceDetails {
  name: string;
  address: string;
  phone: string;
  website: string;
}

interface AuditoriaAutocompleteProps {
  lang: string;
}

export default function AuditoriaAutocomplete({
  lang,
}: AuditoriaAutocompleteProps) {
  const router = useRouter();
  const t = useTranslations("auditoria.autocomplete");
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PlaceSuggestion | null>(null);
  const [placeDetails, setPlaceDetails] = useState<PlaceDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [hasBeenUsed, setHasBeenUsed] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualBusinessData, setManualBusinessData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
  });
  // 🎯 Nuevos estados para información de ubicación
  const [locationInfo, setLocationInfo] = useState<{
    city?: string;
    country?: string;
    hasLocationBias?: boolean;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const suggestionsListRef = useRef<HTMLUListElement>(null);
  const manualNameRef = useRef<HTMLInputElement>(null);
  const [preciseStatus, setPreciseStatus] = useState<
    "idle" | "requesting" | "saved" | "denied" | "error"
  >("idle");

  // Estados para el reporte de auditoría
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showAuditReport, setShowAuditReport] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [auditData, setAuditData] = useState<any>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  // 🎯 Estado para keyword personalizada
  const [auditKeyword, setAuditKeyword] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const requestPreciseLocation = async () => {
    try {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        setPreciseStatus("error");
        setError(t("errors.geolocationNotSupported"));
        return;
      }
      setPreciseStatus("requesting");

      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude, accuracy } = pos.coords;
              const res = await fetch("/api/geo/consent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude, accuracy }),
              });
              if (!res.ok) {
                throw new Error("Consent save failed");
              }
              setPreciseStatus("saved");
              // Refrescar sugerencias si hay input suficiente
              if (input.length > 2) {
                fetchSuggestions(input);
              }
              resolve();
            } catch {
              setPreciseStatus("error");
              resolve();
            }
          },
          (err) => {
            if (err.code === err.PERMISSION_DENIED) {
              setPreciseStatus("denied");
              setError(t("errors.locationPermissionDenied"));
            } else {
              setPreciseStatus("error");
              setError(t("errors.locationError"));
            }
            resolve();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      });
    } catch {
      setPreciseStatus("error");
    }
  };

  // Reset activeIndex when suggestions change
  useEffect(() => {
    // Incluir la opción "¿No encuentras tu negocio?" en el total
    const totalOptions = suggestions.length + (suggestions.length > 0 ? 1 : 0);
    setActiveIndex(totalOptions > 0 ? 0 : -1);
  }, [suggestions]);

  // Keyboard navigation handler
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalOptions = suggestions.length + (suggestions.length > 0 ? 1 : 0);
    if (totalOptions === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 < totalOptions ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < totalOptions) {
        e.preventDefault();
        if (activeIndex < suggestions.length) {
          // Es una sugerencia normal
          handleSelect(suggestions[activeIndex]);
        } else {
          // Es la opción "¿No encuentras tu negocio?"
          handleManualMode();
        }
      }
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  // Scroll active suggestion into view
  useEffect(() => {
    if (activeIndex >= 0 && suggestionsListRef.current) {
      const el = suggestionsListRef.current.children[
        activeIndex
      ] as HTMLElement;
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  // Focus management for manual mode
  useEffect(() => {
    if (isManualMode && manualNameRef.current) {
      // Pequeño delay para asegurar que el DOM se ha actualizado
      setTimeout(() => {
        manualNameRef.current?.focus();
      }, 100);
    }
  }, [isManualMode]);

  const fetchSuggestions = async (value: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/places?input=${encodeURIComponent(value)}&lang=${lang}`,
      );
      if (!res.ok) throw new Error("Error al buscar sugerencias");
      const data = await res.json();
      setSuggestions(data.predictions || []);

      // 🎯 Extraer información de ubicación de la respuesta
      if (data.metadata?.location) {
        setLocationInfo({
          city: data.metadata.location.city,
          country: data.metadata.location.country,
          hasLocationBias: data.metadata.hasLocationBias,
        });
      } else {
        setLocationInfo(null);
      }
    } catch (e: unknown) {
      const err = e as Error;
      setError(err.message || "Error desconocido");
      setSuggestions([]);
      setLocationInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    setSelected(s);
    setSuggestions([]);
    setInput("");
    setHasBeenUsed(true); // Marcar que ya se ha usado
    setIsManualMode(false);
    setDetailsLoading(true);
    setDetailsError(null);
    setPlaceDetails(null);
    try {
      const res = await fetch(`/api/places-details?place_id=${s.placeId}`);
      if (!res.ok)
        throw new Error(
          lang === "es"
            ? "Error al obtener detalles"
            : "Error fetching details",
        );
      const data = await res.json();
      setPlaceDetails(data);
    } catch (e: unknown) {
      const err = e as Error;
      setDetailsError(err.message || "Error desconocido");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleManualMode = () => {
    setIsManualMode(true);
    setSuggestions([]);
    setInput("");
    setSelected(null);
    setPlaceDetails(null);
    setDetailsError(null);
    setManualBusinessData({
      name: "",
      address: "",
      phone: "",
      website: "",
    });
    if (manualNameRef.current) {
      manualNameRef.current.focus();
    }
  };

  const handleManualDataChange = (
    field: keyof typeof manualBusinessData,
    value: string,
  ) => {
    setManualBusinessData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateAudit = async (businessInfo: any) => {
    setAuditLoading(true);
    try {
      const targetUrl = businessInfo.website || businessInfo.url;

      // Construir URL con parámetros del negocio (sin doble encode)
      const params = new URLSearchParams({
        name: businessInfo.name || "",
        address: businessInfo.address || "",
        phone: businessInfo.phone || "",
        ...(businessInfo.website ? { website: businessInfo.website } : {}),
        ...(targetUrl ? { onpage_url: targetUrl } : {}),
        ...(businessInfo.category ? { category: businessInfo.category } : {}),
        ...(businessInfo.city ? { city: businessInfo.city } : {}),
        ...(businessInfo.region ? { region: businessInfo.region } : {}),
        ...(businessInfo.country ? { country: businessInfo.country } : {}),
        ...(auditKeyword ? { keyword: auditKeyword } : {}),
      });

      // Redirigir a la página de resultados con la URL a auditar
      router.push(`/${lang}/auditoria/resultado?${params.toString()}`);
    } catch (error) {
      console.error("Error redirigiendo:", error);
      setAuditLoading(false);
    }
  };

  return (
    <div className="relative bg-white">
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder=" "
          value={input}
          onChange={(e) => {
            const v = e.target.value;
            setInput(v);
            setSelected(null);
            setPlaceDetails(null);
            setDetailsError(null);
            if (v.length > 2) fetchSuggestions(v);
            else setSuggestions([]);
          }}
          onKeyDown={handleInputKeyDown}
          className="mb-2 h-14 px-5 text-lg font-medium border-2 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 peer"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="autocomplete-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `autocomplete-option-${activeIndex}` : undefined
          }
        />
        {/* Placeholder dinámico con typewriter effect */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
          <span className="text-lg font-medium text-muted-foreground">
            {input.length === 0 && !hasBeenUsed ? (
              <TypeAnimation
                sequence={[
                  t("searchPlaceholders.mcdonalds"),
                  2000,
                  t("searchPlaceholders.restaurant"),
                  2000,
                  t("searchPlaceholders.pharmacy"),
                  2000,
                  t("searchPlaceholders.hotel"),
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
                cursor={true}
              />
            ) : input.length === 0 && hasBeenUsed ? (
              <span className="text-muted-foreground">
                {t("searchPlaceholders.anotherBusiness")}
              </span>
            ) : null}
          </span>
        </div>
      </div>

      {/* 🎯 Información de ubicación detectada */}
      {locationInfo && locationInfo.hasLocationBias && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {locationInfo.city && locationInfo.country
                ? t("locationInfo.searchingNear", {
                    city: locationInfo.city,
                    country: locationInfo.country,
                  })
                : t("locationInfo.usingPreciseLocation")}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-3 text-xs"
              onClick={requestPreciseLocation}
              disabled={preciseStatus === "requesting"}
            >
              {preciseStatus === "requesting"
                ? lang === "es"
                  ? "Obteniendo ubicación..."
                  : "Getting location..."
                : lang === "es"
                  ? "Usar ubicación precisa"
                  : "Use precise location"}
            </Button>
            {preciseStatus === "saved" && (
              <span className="text-green-700 text-xs">
                {t("preciseLocation.enabled")}
              </span>
            )}
            {preciseStatus === "denied" && (
              <span className="text-amber-700 text-xs">
                {t("preciseLocation.denied")}
              </span>
            )}
          </div>
        </div>
      )}
      {!locationInfo && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center justify-between gap-2 text-sm text-blue-700 dark:text-blue-300">
            <span>{t("preciseLocation.approximate")}</span>
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-3 text-xs"
              onClick={requestPreciseLocation}
              disabled={preciseStatus === "requesting"}
            >
              {preciseStatus === "requesting"
                ? t("preciseLocation.getting")
                : t("preciseLocation.usePrecise")}
            </Button>
          </div>
        </div>
      )}

      {/* Lista de sugerencias */}
      {input.length > 2 && suggestions.length > 0 && (
        <ul
          ref={suggestionsListRef}
          id="autocomplete-listbox"
          role="listbox"
          className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.placeId}
              id={`autocomplete-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              className={`px-4 py-2 cursor-pointer transition ${
                activeIndex === idx
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
              }`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <div className="font-medium">
                {s.structuredFormat?.mainText?.text || s.description}
              </div>
              <div className="flex flex-col gap-1">
                {s.structuredFormat?.secondaryText?.text && (
                  <div className="text-xs text-muted-foreground">
                    {s.structuredFormat.secondaryText.text}
                  </div>
                )}
                {/* 🎯 Mostrar contexto de ubicación si está disponible */}
                {s.locationContext && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {s.locationContext}
                  </div>
                )}
              </div>
            </li>
          ))}
          {/* Opción para negocio no encontrado */}
          <li
            id={`autocomplete-option-${suggestions.length}`}
            role="option"
            aria-selected={activeIndex === suggestions.length}
            className={`px-4 py-2 cursor-pointer transition border-t border-gray-200 ${
              activeIndex === suggestions.length
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
            }`}
            onClick={() => {
              // Aquí puedes manejar la lógica cuando el usuario no encuentra su negocio
              handleManualMode();
            }}
            onMouseEnter={() => setActiveIndex(suggestions.length)}
          >
            <div className="font-medium text-gray-600 dark:text-gray-400">
              {t("noBusinessFound")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("manual.clickToAdd")}
            </div>
          </li>
        </ul>
      )}
      {loading && (
        <div className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-border rounded-md shadow-lg mt-1 px-4 py-2 text-sm text-muted-foreground">
          {t("loading")}
        </div>
      )}
      {error && (
        <div className="absolute z-10 w-full bg-white dark:bg-neutral-900 border border-border rounded-md shadow-lg mt-1 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      {/* Tarjeta NAP */}
      <div className="mt-8 p-6 rounded-xl border border-gray-200 shadow-sm bg-gray-50">
        {detailsLoading ? (
          <>
            <Skeleton className="h-6 w-2/3 mb-3 rounded" />
            <Skeleton className="h-4 w-1/2 mb-1 rounded" />
            <Skeleton className="h-4 w-2/3 mb-1 rounded" />
            <Skeleton className="h-4 w-1/3 mb-1 rounded" />
            <Skeleton className="h-4 w-1/2 mb-1 rounded" />
            <Skeleton className="h-4 w-2/3 mb-3 rounded" />
            <Skeleton className="h-8 w-32 rounded" />
          </>
        ) : isManualMode ? (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {t("manual.title")}
            </h3>
            {/* Nombre del negocio */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.businessName")}
              </label>
              <Input
                ref={manualNameRef}
                value={manualBusinessData.name}
                onChange={(e) => handleManualDataChange("name", e.target.value)}
                placeholder={t("manual.businessNamePlaceholder")}
                className="w-full"
              />
            </div>
            {/* Dirección */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.address")}
              </label>
              <Input
                value={manualBusinessData.address}
                onChange={(e) =>
                  handleManualDataChange("address", e.target.value)
                }
                placeholder={t("manual.addressPlaceholder")}
                className="w-full"
              />
            </div>
            {/* Teléfono */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.phone")}
              </label>
              <Input
                value={manualBusinessData.phone}
                onChange={(e) =>
                  handleManualDataChange("phone", e.target.value)
                }
                placeholder={t("manual.phonePlaceholder")}
                className="w-full"
              />
            </div>
            {/* Website */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.website")}
              </label>
              <Input
                value={manualBusinessData.website}
                onChange={(e) =>
                  handleManualDataChange("website", e.target.value)
                }
                placeholder={t("manual.websitePlaceholder")}
                className="w-full"
              />
            </div>
            {/* Palabra clave para auditoría */}
            <div className="mb-3 border-2 border-red-500">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.keyword")}
              </label>
              <Input
                value={auditKeyword}
                onChange={(e) => setAuditKeyword(e.target.value)}
                placeholder={t("manual.keywordPlaceholder")}
                className="w-full"
              />
            </div>

            {/* Botones */}
            <div className="mt-6 flex flex-col md:flex-row gap-2 md:gap-4">
              <Button
                onClick={() => setIsManualMode(false)}
                variant="outline"
                className="h-11"
              >
                {t("manual.cancel")}
              </Button>
              <Button
                onClick={() => {
                  // Aquí puedes procesar los datos manuales
                  // Datos del negocio procesados
                  setIsManualMode(false);
                  setPlaceDetails({
                    name: manualBusinessData.name,
                    address: manualBusinessData.address,
                    phone: manualBusinessData.phone,
                    website: manualBusinessData.website,
                  });
                }}
                className="h-11"
              >
                {t("manual.saveAndContinue")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {placeDetails?.name ||
                selected?.displayName?.text ||
                selected?.structuredFormat?.mainText?.text ||
                selected?.description ||
                t("manual.businessInformation")}
            </h3>
            {/* Dirección */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.address")}
              </label>
              <Input
                value={
                  placeDetails?.address || selected?.formattedAddress || ""
                }
                onChange={(e) => {
                  if (placeDetails) {
                    setPlaceDetails({
                      ...placeDetails,
                      address: e.target.value,
                    });
                  }
                }}
                placeholder={t("manual.addressPlaceholder")}
                className="w-full"
              />
            </div>
            {/* Teléfono */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.phone")}
              </label>
              <Input
                value={placeDetails?.phone || ""}
                onChange={(e) => {
                  if (placeDetails) {
                    setPlaceDetails({
                      ...placeDetails,
                      phone: e.target.value,
                    });
                  }
                }}
                placeholder={t("manual.phonePlaceholder")}
                className="w-full"
              />
            </div>
            {/* Website */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("manual.website")}
              </label>
              <Input
                value={placeDetails?.website || ""}
                onChange={(e) => {
                  if (placeDetails) {
                    setPlaceDetails({
                      ...placeDetails,
                      website: e.target.value,
                    });
                  }
                }}
                placeholder={t("manual.websitePlaceholder")}
                className="w-full"
              />
            </div>
            {/* Error en detalles */}
            {detailsError && (
              <div className="text-sm text-red-600 mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                {detailsError}
              </div>
            )}

            {/* CTA */}
            <div className="mt-6 flex flex-col md:flex-row gap-2 md:gap-4">
              <Button
                onClick={() => generateAudit(placeDetails)}
                disabled={auditLoading}
                className="h-11"
              >
                {auditLoading
                  ? t("manual.generatingReport")
                  : t("manual.generateAuditReport")}
              </Button>
            </div>
            {selected && (
              <div className="mb-3 border-2 border-red-500">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("manual.keyword")}
                </label>
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder={t("manual.keywordPlaceholder")}
                  className="w-full"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Reporte de Auditoría */}
      {showAuditReport && auditData && (
        <div className="mt-8">
          <AuditReport
            businessData={{
              name: placeDetails?.name || manualBusinessData.name,
              address: placeDetails?.address || manualBusinessData.address,
              phone: placeDetails?.phone || manualBusinessData.phone,
              website: placeDetails?.website || manualBusinessData.website,
            }}
            auditData={auditData}
          />
        </div>
      )}
    </div>
  );
}
