/**
 * Cliente para DataForSEO On-Page Instant Pages API
 * Obtiene resultados instantáneos de auditoría on-page
 */

export interface InstantPagesRequest {
  url: string;
  enable_javascript?: boolean;
  enable_browser_rendering?: boolean;
  enable_cookies?: boolean;
  custom_js?: string;
  enable_xhr?: boolean;
  load_resources?: boolean;
  custom_headers?: Record<string, string>;
}

export interface InstantPagesResponse {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks: InstantPagesTask[];
}

export interface InstantPagesTask {
  id: string;
  status_code: number;
  status_message: string;
  result: InstantPagesResult[];
}

export interface InstantPagesResult {
  crawl_progress: string;
  crawl_status: {
    max_crawl_pages: number;
    pages_in_queue: number;
    pages_crawled: number;
  };
  items: InstantPagesItem[];
}

export interface InstantPagesItem {
  url: string;
  meta: {
    title: string;
    description: string;
    charset: string;
    viewport: string;
    robots: string;
    canonical: string;
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
    meta_keywords: string[];
    meta_description: string;
    meta_title: string;
    meta_robots: string;
    meta_author: string;
    meta_language: string;
    meta_viewport: string;
    meta_charset: string;
    meta_canonical: string;
    meta_alternate: string[];
    meta_og_title: string;
    meta_og_description: string;
    meta_og_image: string;
    meta_og_url: string;
    meta_og_type: string;
    meta_og_site_name: string;
    meta_twitter_card: string;
    meta_twitter_title: string;
    meta_twitter_description: string;
    meta_twitter_image: string;
    meta_twitter_creator: string;
    meta_twitter_site: string;
  };
  page_timing: {
    time_to_interactive: number;
    dom_content_loaded: number;
    page_load_time: number;
    page_size: number;
    page_encoding: string;
    meta_charset: string;
    meta_viewport: string;
    meta_robots: string;
    meta_canonical: string;
    meta_alternate: string[];
    meta_og_title: string;
    meta_og_description: string;
    meta_og_image: string;
    meta_og_url: string;
    meta_og_type: string;
    meta_og_site_name: string;
    meta_twitter_card: string;
    meta_twitter_title: string;
    meta_twitter_description: string;
    meta_twitter_image: string;
    meta_twitter_creator: string;
    meta_twitter_site: string;
  };
  onpage_score: number;
  page_metrics: {
    links_external: number;
    links_internal: number;
    duplicate_title: number;
    duplicate_content: number;
    broken_links: number;
    broken_resources: number;
    onpage_score: number;
    onpage_score_check: number;
    onpage_score_checks_passed: number;
    onpage_score_checks_failed: number;
    onpage_score_checks_total: number;
    onpage_score_checks_passed_percent: number;
    onpage_score_checks_failed_percent: number;
    onpage_score_checks_total_percent: number;
    onpage_score_checks_passed_score: number;
    onpage_score_checks_failed_score: number;
    onpage_score_checks_total_score: number;
    onpage_score_checks_passed_percent_score: number;
    onpage_score_checks_failed_percent_score: number;
    onpage_score_checks_total_percent_score: number;
  };
  checks: {
    title_too_long: boolean;
    title_too_short: boolean;
    title_empty: boolean;
    title_duplicate: boolean;
    title_begins_with_digit: boolean;
    title_has_multiple_dashes: boolean;
    title_has_multiple_underscores: boolean;
    title_has_sequential_numbers: boolean;
    title_has_sequential_special_chars: boolean;
    title_has_sequential_digits: boolean;
    title_has_sequential_letters: boolean;
    title_has_uppercase: boolean;
    title_has_lowercase: boolean;
    title_has_numeric: boolean;
    title_has_special_chars: boolean;
    title_has_stop_words: boolean;
    title_has_branded_terms: boolean;
    title_has_generic_terms: boolean;
    title_has_local_terms: boolean;
    title_has_long_tail_keywords: boolean;
    title_has_short_tail_keywords: boolean;
    title_has_exact_match_keywords: boolean;
    title_has_partial_match_keywords: boolean;
    title_has_broad_match_keywords: boolean;
    title_has_phrase_match_keywords: boolean;
    title_has_negative_keywords: boolean;
    title_has_positive_keywords: boolean;
    title_has_neutral_keywords: boolean;
    title_has_question_keywords: boolean;
    title_has_transactional_keywords: boolean;
    title_has_informational_keywords: boolean;
    title_has_navigational_keywords: boolean;
    title_has_commercial_keywords: boolean;
    title_has_brand_keywords: boolean;
    title_has_product_keywords: boolean;
    title_has_service_keywords: boolean;
    title_has_location_keywords: boolean;
    title_has_industry_keywords: boolean;
    title_has_category_keywords: boolean;
    title_has_subcategory_keywords: boolean;
  };
}

export class DataForSEOInstantPagesClient {
  private config: {
    login: string;
    password: string;
    baseUrl: string;
  };
  private credentials: string;

  constructor(config: { login: string; password: string; baseUrl: string }) {
    this.config = config;
    this.credentials = Buffer.from(
      `${config.login}:${config.password}`,
    ).toString("base64");
  }

  /**
   * On-Page Instant Pages API
   * Obtiene resultados instantáneos de auditoría on-page
   */
  async getInstantPages(
    request: InstantPagesRequest,
  ): Promise<InstantPagesResponse> {
    const endpoint = `${this.config.baseUrl}/v3/on_page/instant_pages`;
    const payload = [
      {
        url: request.url,
        enable_javascript: request.enable_javascript || true,
        enable_browser_rendering: request.enable_browser_rendering || true,
        enable_cookies: request.enable_cookies || true,
        custom_js: request.custom_js,
        enable_xhr: request.enable_xhr || true,
        load_resources: request.load_resources || true,
        custom_headers: request.custom_headers,
      },
    ];

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error en DataForSEO Instant Pages API:", error);
      throw error;
    }
  }
}
