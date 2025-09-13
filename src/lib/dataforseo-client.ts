/**
 * 🚀 ELITE DataForSEO Client
 *
 * Cliente escalable y robusto para DataForSEO API con:
 * - Rate limiting inteligente
 * - Retry logic con exponential backoff
 * - Circuit breaker pattern
 * - Cache inteligente
 * - Error handling robusto
 * - Type safety completo
 * - Metrics y logging detallado
 */

import {
  DATAFORSEO_CONFIG,
  DATAFORSEO_ENDPOINTS,
  buildEndpointUrl,
  validateDataForSEOConfig,
  type SearchEngine,
  type Language,
  type Location,
  type SERPRequest,
  type KeywordsRequest,
  type DomainRequest,
  type OnPageRequest,
} from "./dataforseo-config";

// 🎯 Interfaces Elite
export interface DataForSEOConfig {
  login: string;
  password: string;
  baseUrl: string;
}

export interface DataForSEOResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  retryCount?: number;
  cacheHit?: boolean;
  processingTime?: number;
}

// 🏗️ Rate Limiter Elite
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  async waitForSlot(): Promise<void> {
    while (!(await this.checkLimit())) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// 🔄 Retry Logic Elite
class RetryManager {
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly maxDelay: number;

  constructor(maxRetries: number, baseDelay: number, maxDelay: number) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.maxRetries) {
          break;
        }

        if (onRetry) {
          onRetry(attempt, lastError);
        }

        const delay = Math.min(
          this.baseDelay * Math.pow(2, attempt - 1),
          this.maxDelay,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// 💾 Cache Elite
class CacheManager {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private readonly maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): any | null {
    const item = this.cache.get(key);

    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key: string, data: any, ttl: number): void {
    // Evict oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// ⚡ Circuit Breaker Elite
class CircuitBreaker {
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly recoveryTimeout: number;

  constructor(failureThreshold: number, recoveryTimeout: number) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeout = recoveryTimeout;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
    }
  }
}

// 🚀 Cliente Principal Elite
export class DataForSEOClient {
  private config: DataForSEOConfig;
  private rateLimiter: RateLimiter;
  private retryManager: RetryManager;
  private cacheManager: CacheManager;
  private circuitBreaker: CircuitBreaker;

  constructor(config: DataForSEOConfig) {
    this.config = config;

    // Inicializar componentes elite
    this.rateLimiter = new RateLimiter(
      DATAFORSEO_CONFIG.rateLimit.requestsPerMinute,
      60000,
    );

    this.retryManager = new RetryManager(
      DATAFORSEO_CONFIG.rateLimit.retryAttempts,
      DATAFORSEO_CONFIG.rateLimit.retryDelay,
      30000,
    );

    this.cacheManager = new CacheManager(DATAFORSEO_CONFIG.cache.maxSize);

    this.circuitBreaker = new CircuitBreaker(5, 60000);
  }

  // 🔐 Autenticación Elite
  private getAuthHeaders(): HeadersInit {
    const credentials = Buffer.from(
      `${this.config.login}:${this.config.password}`,
    ).toString("base64");
    return {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };
  }

  // 📡 Request Base Elite
  private async makeRequest<T>(
    endpoint: string,
    body: any,
    cacheKey?: string,
    cacheTtl?: number,
  ): Promise<DataForSEOResponse<T>> {
    const startTime = Date.now();

    // Validar configuración
    if (!validateDataForSEOConfig()) {
      return {
        success: false,
        error: "DataForSEO configuration is invalid",
        statusCode: 500,
      };
    }

    // Check cache first
    if (cacheKey) {
      const cachedData = this.cacheManager.get(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          cacheHit: true,
          processingTime: Date.now() - startTime,
        };
      }
    }

    // Rate limiting
    await this.rateLimiter.waitForSlot();

    // Circuit breaker + retry logic
    const response = await this.circuitBreaker.execute(async () => {
      return this.retryManager.executeWithRetry(
        async () => {
          const url = buildEndpointUrl(endpoint);

          const response = await fetch(url, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(DATAFORSEO_CONFIG.timeouts.request),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return await response.json();
        },
        (attempt, error) => {
          console.warn(`DataForSEO retry attempt ${attempt}:`, error.message);
        },
      );
    });

    const processingTime = Date.now() - startTime;

    // Cache successful responses
    if (cacheKey && response && !response.error) {
      this.cacheManager.set(
        cacheKey,
        response,
        cacheTtl || DATAFORSEO_CONFIG.cache.ttl,
      );
    }

    return {
      success: true,
      data: response,
      processingTime,
    };
  }

  // 🎯 SERP Organic Live Advanced
  async getSERPOrganicLiveAdvanced(
    params: SERPRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `serp_organic_${params.keyword}_${params.search_engine || "google"}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.SERP.ORGANIC_LIVE_ADVANCED.replace(
        "{search_engine}",
        params.search_engine || "google",
      ),
      {
        keyword: params.keyword,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        depth: params.depth || 10,
        device: params.device || "desktop",
        max_crawl_pages: params.max_crawl_pages || 1,
        people_also_ask_click_depth: params.people_also_ask_click_depth,
      },
      cacheKey,
      10 * 60 * 1000, // 10 minutos para SERP
    );
  }

  // 🔍 Keywords Google Ads Search Volume
  async getKeywordsSearchVolume(
    params: KeywordsRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `keywords_volume_${params.keywords.join("_")}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.KEYWORDS.GOOGLE_ADS_SEARCH_VOLUME,
      {
        keywords: params.keywords,
        location_name: params.location_name,
        language_code: params.language_code,
      },
      cacheKey,
      60 * 60 * 1000, // 1 hora para volumen de búsqueda
    );
  }

  // 📈 Keywords DataForSEO Trends
  async getKeywordsTrends(
    params: KeywordsRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `keywords_trends_${params.keywords.join("_")}_${params.type || "web"}_${params.time_range || "past_7_days"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.KEYWORDS.DATAFORSEO_TRENDS_EXPLORE,
      {
        keywords: params.keywords,
        type: params.type || "web",
        location_name: params.location_name,
        date_from: params.date_from,
        date_to: params.date_to,
        time_range: params.time_range || "past_7_days",
      },
      cacheKey,
      30 * 60 * 1000, // 30 minutos para tendencias
    );
  }

  // 🌐 On-Page Content Parsing
  async getOnPageContentParsing(
    params: OnPageRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `onpage_content_${params.url}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.ONPAGE.CONTENT_PARSING,
      {
        url: params.url,
        enable_javascript: params.enable_javascript || false,
        custom_js: params.custom_js,
        custom_user_agent: params.custom_user_agent,
        accept_language: params.accept_language,
      },
      cacheKey,
      60 * 60 * 1000, // 1 hora para contenido
    );
  }

  // 🏆 DataForSEO Labs - Ranked Keywords
  async getRankedKeywords(params: DomainRequest): Promise<DataForSEOResponse> {
    const cacheKey = `ranked_keywords_${params.target}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.RANKED_KEYWORDS,
      {
        target: params.target,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        limit: params.limit || 10,
        offset: params.offset || 0,
        filters: params.filters,
        order_by: params.order_by,
        include_subdomains: params.include_subdomains,
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      2 * 60 * 60 * 1000, // 2 horas para keywords rankeadas
    );
  }

  // 🎯 DataForSEO Labs - Competitors Domain
  async getCompetitorsDomain(
    params: DomainRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `competitors_${params.target}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.COMPETITORS_DOMAIN,
      {
        target: params.target,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        ignore_synonyms: params.ignore_synonyms || true,
        limit: params.limit || 10,
        offset: params.offset || 0,
        filters: params.filters,
        order_by: params.order_by,
        exclude_top_domains: true,
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      4 * 60 * 60 * 1000, // 4 horas para competidores
    );
  }

  // 📊 DataForSEO Labs - Domain Rank Overview
  async getDomainRankOverview(
    params: DomainRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `domain_rank_${params.target}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.DOMAIN_RANK_OVERVIEW,
      {
        target: params.target,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        ignore_synonyms: params.ignore_synonyms || true,
      },
      cacheKey,
      6 * 60 * 60 * 1000, // 6 horas para overview de dominio
    );
  }

  // 💡 DataForSEO Labs - Keyword Ideas
  async getKeywordIdeas(params: KeywordsRequest): Promise<DataForSEOResponse> {
    const cacheKey = `keyword_ideas_${params.keywords.join("_")}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.KEYWORD_IDEAS,
      {
        keywords: params.keywords,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        limit: params.limit || 10,
        offset: params.offset || 0,
        filters: params.filters,
        order_by: params.order_by,
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      2 * 60 * 60 * 1000, // 2 horas para ideas de keywords
    );
  }

  // 💡 Alias para Keyword Ideas (más corto)
  async keywordIdeas(params: KeywordsRequest): Promise<DataForSEOResponse> {
    return this.getKeywordIdeas(params);
  }

  // 🎯 DataForSEO Labs - Bulk Keyword Difficulty
  async getBulkKeywordDifficulty(
    params: KeywordsRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `bulk_difficulty_${params.keywords.join("_")}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.BULK_KEYWORD_DIFFICULTY,
      {
        keywords: params.keywords,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
      },
      cacheKey,
      24 * 60 * 60 * 1000, // 24 horas para dificultad de keywords
    );
  }

  // 🏢 DataForSEO Labs - Subdomains
  async getSubdomains(params: DomainRequest): Promise<DataForSEOResponse> {
    const cacheKey = `subdomains_${params.target}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.SUBDOMAINS,
      {
        target: params.target,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        ignore_synonyms: params.ignore_synonyms || true,
        limit: params.limit || 10,
        offset: params.offset || 0,
        filters: params.filters,
        order_by: params.order_by,
        item_types: ["organic"],
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      4 * 60 * 60 * 1000, // 4 horas para subdominios
    );
  }

  // 📈 DataForSEO Labs - Keyword Overview
  async getKeywordOverview(
    params: KeywordsRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `keyword_overview_${params.keywords.join("_")}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.KEYWORD_OVERVIEW,
      {
        keywords: params.keywords,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      2 * 60 * 60 * 1000, // 2 horas para overview de keywords
    );
  }

  // 🌐 DataForSEO Labs - Keywords For Site
  async getKeywordsForSite(params: DomainRequest): Promise<DataForSEOResponse> {
    const cacheKey = `keywords_site_${params.target}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.KEYWORDS_FOR_SITE,
      {
        target: params.target,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        limit: params.limit || 10,
        offset: params.offset || 0,
        filters: params.filters,
        order_by: params.order_by,
        include_subdomains: params.include_subdomains,
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      4 * 60 * 60 * 1000, // 4 horas para keywords de sitio
    );
  }

  // 🔗 DataForSEO Labs - Domain Intersection
  async getDomainIntersection(
    target1: string,
    target2: string,
    params: DomainRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `domain_intersection_${target1}_${target2}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.DOMAIN_INTERSECTION,
      {
        target1,
        target2,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        ignore_synonyms: params.ignore_synonyms || true,
        limit: params.limit || 10,
        offset: params.offset || 0,
        filters: params.filters,
        order_by: params.order_by,
        intersections: true,
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      6 * 60 * 60 * 1000, // 6 horas para intersección de dominios
    );
  }

  // 📊 DataForSEO Labs - Historical Rank Overview
  async getHistoricalRankOverview(
    params: DomainRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `historical_rank_${params.target}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.HISTORICAL_RANK_OVERVIEW,
      {
        target: params.target,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        ignore_synonyms: params.ignore_synonyms || true,
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      24 * 60 * 60 * 1000, // 24 horas para datos históricos
    );
  }

  // 📄 DataForSEO Labs - Page Intersection
  async getPageIntersection(
    pages: string[],
    params: DomainRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `page_intersection_${pages.join("_")}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.PAGE_INTERSECTION,
      {
        pages,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        ignore_synonyms: params.ignore_synonyms || true,
        limit: params.limit || 10,
        offset: params.offset || 0,
        filters: params.filters,
        order_by: params.order_by,
        include_clickstream_data: params.include_clickstream_data,
      },
      cacheKey,
      4 * 60 * 60 * 1000, // 4 horas para intersección de páginas
    );
  }

  // 🚀 DataForSEO Labs - Bulk Traffic Estimation
  async getBulkTrafficEstimation(
    targets: string[],
    params: DomainRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `bulk_traffic_${targets.join("_")}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.BULK_TRAFFIC_ESTIMATION,
      {
        targets,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
        ignore_synonyms: params.ignore_synonyms || true,
      },
      cacheKey,
      12 * 60 * 60 * 1000, // 12 horas para estimación de tráfico
    );
  }

  // 📈 DataForSEO Labs - Historical SERP
  async getHistoricalSERP(
    keyword: string,
    params: DomainRequest,
  ): Promise<DataForSEOResponse> {
    const cacheKey = `historical_serp_${keyword}_${params.location_name || "United States"}`;

    return this.makeRequest(
      DATAFORSEO_ENDPOINTS.LABS.HISTORICAL_SERP,
      {
        keyword,
        location_name: params.location_name || "United States",
        language_code: params.language_code || "en",
      },
      cacheKey,
      24 * 60 * 60 * 1000, // 24 horas para SERP histórico
    );
  }

  // 🧹 Utility methods
  clearCache(): void {
    this.cacheManager.clear();
  }

  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cacheManager.getCacheSize(),
      maxSize: DATAFORSEO_CONFIG.cache.maxSize,
    };
  }
}

// 🚀 Instancia global del cliente
export const dataForSEOClient = new DataForSEOClient({
  login: DATAFORSEO_CONFIG.login,
  password: DATAFORSEO_CONFIG.password,
  baseUrl: DATAFORSEO_CONFIG.baseUrl,
});
