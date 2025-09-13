// Google Search Console API Configuration
export const GSC_CONFIG = {
  // API Configuration
  API_BASE_URL: "https://searchconsole.googleapis.com/v1",

  // Environment variables needed:
  // AUTH_GOOGLE_ID: OAuth 2.0 Client ID (NextAuth 5.0 standard)
  // AUTH_GOOGLE_SECRET: OAuth 2.0 Client Secret (NextAuth 5.0 standard)
  // GOOGLE_SERVICE_ACCOUNT_KEY: Service Account JSON key
  // GSC_SITE_URL: Your verified site URL (e.g., 'https://example.com')

  // Scopes needed for Search Console API (unificados con NextAuth.js)
  SCOPES: [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/business.manage",
    "https://www.googleapis.com/auth/plus.business.manage",
    "https://www.googleapis.com/auth/webmasters",
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/analytics",
  ],

  // Default date range (last 30 days)
  DEFAULT_DATE_RANGE: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },

  // API Limits
  MAX_ROWS_PER_REQUEST: 5000,
  DEFAULT_ROW_LIMIT: 50,

  // Rate limiting
  REQUESTS_PER_MINUTE: 60,
  QUERIES_PER_MINUTE: 1200,
};

// Helper function to get site URL from environment
export function getSiteUrl(): string {
  // Usar el dominio completo que es lo IDEAL para análisis SEO
  // Incluye todos los subdominios (www, sin www, blog, etc.)
  return "sc-domain:fascinantedigital.com";
}

// Helper function to validate configuration
export function validateGSCConfig(): boolean {
  const requiredEnvVars = [
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_SECRET",
    "GSC_SITE_URL",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    return false;
  }

  return true;
}
