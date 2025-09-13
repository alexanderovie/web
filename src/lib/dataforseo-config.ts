/**
 * 🚀 ELITE DataForSEO API Configuration
 *
 * Configuración escalable y robusta para todos los endpoints de DataForSEO
 * Siguiendo las mejores prácticas de Next.js 15 y arquitectura enterprise
 */

export const DATAFORSEO_CONFIG = {
  // Credenciales desde variables de entorno
  login: process.env.DATAFORSEO_LOGIN || "",
  password: process.env.DATAFORSEO_PASSWORD || "",
  baseUrl: process.env.DATAFORSEO_BASE_URL || "https://api.dataforseo.com",

  // Configuración de rate limiting y performance
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerSecond: 2,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Configuración de cache
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutos por defecto
    maxSize: 1000, // máximo 1000 items en cache
  },

  // Timeouts
  timeouts: {
    request: 30000, // 30 segundos
    connection: 10000, // 10 segundos
  },
};

// 🎯 Endpoints Elite - Todos los endpoints que necesitamos
export const DATAFORSEO_ENDPOINTS = {
  // ===== SERP (Search Engine Results) =====
  SERP: {
    ORGANIC_LIVE_ADVANCED: "/v3/serp/{search_engine}/organic/live/advanced.ai",
    GOOGLE_ORGANIC: "/v3/serp/google/organic",
    GOOGLE_MAPS: "/v3/serp/google/maps/live/advanced",
    LOCATIONS: "/v3/serp/google/locations",
  },

  // ===== KEYWORDS DATA =====
  KEYWORDS: {
    GOOGLE_ADS_SEARCH_VOLUME:
      "/v3/keywords_data/google_ads/search_volume/live.ai",
    DATAFORSEO_TRENDS_EXPLORE:
      "/v3/keywords_data/dataforseo_trends/explore/live.ai",
    GOOGLE_SUGGESTIONS: "/v3/keywords_data/google/keyword_suggestions",
  },

  // ===== ON-PAGE ANALYSIS =====
  ONPAGE: {
    INSTANT_PAGES: "/v3/on_page/instant_pages",
    CONTENT_PARSING: "/v3/on_page/content_parsing/live.ai",
    LIGHTHOUSE_LIVE: "/v3/on_page/lighthouse/live/json",
  },

  // ===== DATAFORSEO LABS (Análisis Avanzado) =====
  LABS: {
    // Keywords Analysis
    RANKED_KEYWORDS: "/v3/dataforseo_labs/google/ranked_keywords/live.ai",
    KEYWORD_IDEAS: "/v3/dataforseo_labs/google/keyword_ideas/live.ai",
    KEYWORD_OVERVIEW: "/v3/dataforseo_labs/google/keyword_overview/live.ai",
    KEYWORDS_FOR_SITE: "/v3/dataforseo_labs/google/keywords_for_site/live.ai",
    BULK_KEYWORD_DIFFICULTY:
      "/v3/dataforseo_labs/bulk_keyword_difficulty/live.ai",

    // Domain Analysis
    COMPETITORS_DOMAIN: "/v3/dataforseo_labs/google/competitors_domain/live.ai",
    DOMAIN_RANK_OVERVIEW:
      "/v3/dataforseo_labs/google/domain_rank_overview/live.ai",
    SUBDOMAINS: "/v3/dataforseo_labs/google/subdomains/live.ai",
    DOMAIN_INTERSECTION:
      "/v3/dataforseo_labs/google/domain_intersection/live.ai",
    HISTORICAL_RANK_OVERVIEW:
      "/v3/dataforseo_labs/google/historical_rank_overview/live.ai",

    // Page Analysis
    PAGE_INTERSECTION: "/v3/dataforseo_labs/google/page_intersection/live.ai",

    // Traffic & Historical
    BULK_TRAFFIC_ESTIMATION:
      "/v3/dataforseo_labs/bulk_traffic_estimation/live.ai",
    HISTORICAL_SERP: "/v3/dataforseo_labs/google/historical_serp/live.ai",
  },

  // ===== BUSINESS DATA =====
  BUSINESS: {
    GOOGLE_MY_BUSINESS: "/v3/business_data/google_my_business/business_data",
  },
};

// 🔧 Configuración de Search Engines soportados
export const SUPPORTED_SEARCH_ENGINES = ["google", "bing", "yahoo"] as const;

// 📍 Configuración de ubicaciones populares
export const POPULAR_LOCATIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Mexico",
  "Brazil",
  "Argentina",
  "Chile",
  "Colombia",
  "Peru",
  "Venezuela",
];

// 🌍 Configuración de idiomas soportados
export const SUPPORTED_LANGUAGES = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "pt",
  "ru",
  "ja",
  "ko",
  "zh",
  "ar",
  "hi",
  "th",
  "vi",
] as const;

// 📊 Configuración de métricas y filtros
export const METRICS_CONFIG = {
  // Límites por endpoint
  limits: {
    keywords: 1000, // máximo keywords por request
    domains: 1000, // máximo dominios por request
    pages: 1000, // máximo páginas por request
    results: 700, // máximo resultados por SERP
  },

  // Filtros disponibles
  filters: {
    searchVolume: { min: 0, max: 1000000 },
    competition: { min: 0, max: 1 },
    cpc: { min: 0, max: 100 },
    rank: { min: 1, max: 100 },
  },

  // Ordenamiento disponible
  sortOptions: [
    "search_volume,desc",
    "competition,desc",
    "cpc,desc",
    "rank,asc",
    "relevance,desc",
  ],
};

// 🎯 Tipos TypeScript para type safety
export type SearchEngine = (typeof SUPPORTED_SEARCH_ENGINES)[number];
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export type Location = (typeof POPULAR_LOCATIONS)[number];

// 🔍 Interfaces para requests
export interface DataForSEORequest {
  location_name?: string;
  language_code?: string;
  depth?: number;
  limit?: number;
  offset?: number;
  filters?: any[];
  order_by?: string[];
}

export interface SERPRequest extends DataForSEORequest {
  keyword: string;
  search_engine?: SearchEngine;
  device?: "desktop" | "mobile";
  max_crawl_pages?: number;
  people_also_ask_click_depth?: number;
}

export interface KeywordsRequest extends DataForSEORequest {
  keywords: string[];
  type?: "web" | "news" | "ecommerce";
  date_from?: string;
  date_to?: string;
  time_range?: string;
  include_clickstream_data?: boolean;
}

export interface DomainRequest extends DataForSEORequest {
  target: string;
  ignore_synonyms?: boolean;
  include_subdomains?: boolean;
  include_clickstream_data?: boolean;
}

export interface OnPageRequest {
  url: string;
  enable_javascript?: boolean;
  custom_js?: string;
  custom_user_agent?: string;
  accept_language?: string;
}

// ✅ Validación de configuración
export function validateDataForSEOConfig(): boolean {
  const required = [
    DATAFORSEO_CONFIG.login,
    DATAFORSEO_CONFIG.password,
    DATAFORSEO_CONFIG.baseUrl,
  ];

  return required.every(Boolean);
}

// 🚀 Helper para construir URLs de endpoints
export function buildEndpointUrl(
  endpoint: string,
  params?: Record<string, string>,
): string {
  let url = `${DATAFORSEO_CONFIG.baseUrl}${endpoint}`;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, value);
    });
  }

  return url;
}
