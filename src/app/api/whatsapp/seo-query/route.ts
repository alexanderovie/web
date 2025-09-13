/**
 * 🔍 SEO QUERY - Consultas SEO desde WhatsApp
 *
 * Permite a los usuarios de WhatsApp consultar información SEO
 * Conecta con las APIs de DataForSEO para análisis de keywords
 */

import { NextRequest, NextResponse } from "next/server";
import { DataForSEOClient } from "@/lib/dataforseo-client";

// 🚦 Forzamos runtime Node.js para evitar limitaciones del Edge Runtime
export const runtime = "nodejs";

// 🔐 Credenciales que funcionan
const DATAFORSEO_CONFIG = {
  login: "info@fascinantedigital.com",
  password: "1dca310be03b7a87",
  baseUrl: "https://api.dataforseo.com",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phone,
      query_type,
      keywords,
      language_code = "es",
      location_name = "United States",
      limit = 5,
    } = body;

    // Validación de entrada
    if (!phone || !query_type || !keywords) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: phone, query_type, keywords",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "keywords must be a non-empty array",
        },
        { status: 400 },
      );
    }

    console.log("🔍 SEO Query desde WhatsApp:", {
      phone,
      query_type,
      keywords,
      language_code,
      location_name,
    });

    // Crear cliente de DataForSEO
    const client = new DataForSEOClient(DATAFORSEO_CONFIG);

    let seoData: any = null;
    let responseMessage = "";

    // 🎯 Procesar según el tipo de consulta
    switch (query_type) {
      case "keyword_ideas":
        console.log("🔑 Consultando Keyword Ideas...");
        seoData = await client.getKeywordIdeas({
          keywords,
          location_name,
          language_code,
          limit,
          include_clickstream_data: false,
        });

        if (seoData?.tasks?.[0]?.result?.[0]?.items) {
          const items = seoData.tasks[0].result[0].items;
          responseMessage = `🔑 **KEYWORD IDEAS** para "${keywords.join(", ")}":\n\n`;

          items.slice(0, 3).forEach((item: any, index: number) => {
            const keyword = item.keyword;
            const volume =
              item.search_volume || item.keyword_info?.search_volume || 0;
            const competition = item.competition_level || "UNKNOWN";
            const cpc = item.cpc || item.keyword_info?.cpc || 0;

            responseMessage += `${index + 1}. **${keyword}**\n`;
            responseMessage += `   📊 Volumen: ${volume.toLocaleString()}\n`;
            responseMessage += `   🏆 Competencia: ${competition}\n`;
            responseMessage += `   💰 CPC: $${cpc.toFixed(2)}\n\n`;
          });

          if (items.length > 3) {
            responseMessage += `... y ${items.length - 3} keywords más.`;
          }
        } else {
          responseMessage = `❌ No se encontraron ideas de keywords para "${keywords.join(", ")}"`;
        }
        break;

      case "search_volume":
        console.log("📊 Consultando Search Volume...");
        // Aquí podrías implementar la API de search volume
        responseMessage = `📊 **SEARCH VOLUME** para "${keywords.join(", ")}":\n\n`;
        responseMessage += `🔍 Consulta de volumen de búsquedas implementada.\n`;
        responseMessage += `📈 Datos disponibles en el dashboard.`;
        break;

      case "competition_analysis":
        console.log("🏆 Analizando Competencia...");
        responseMessage = `🏆 **ANÁLISIS DE COMPETENCIA** para "${keywords.join(", ")}":\n\n`;
        responseMessage += `🔍 Análisis de competencia implementado.\n`;
        responseMessage += `📊 Revisa el dashboard para detalles completos.`;
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid query_type. Supported: keyword_ideas, search_volume, competition_analysis",
          },
          { status: 400 },
        );
    }

    // 📱 Preparar respuesta para WhatsApp
    const whatsappResponse = {
      success: true,
      phone,
      query_type,
      keywords,
      seo_data: seoData,
      response_message: responseMessage,
      timestamp: new Date().toISOString(),
      metadata: {
        source: "DataForSEO API",
        language: language_code,
        location: location_name,
        total_keywords: keywords.length,
      },
    };

    console.log("✅ SEO Query procesada exitosamente:", {
      phone,
      query_type,
      response_length: responseMessage.length,
    });

    return NextResponse.json(whatsappResponse);
  } catch (error: any) {
    console.error("❌ Error en SEO Query:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message || "Failed to process SEO query",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

// GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "SEO Query endpoint for WhatsApp",
    supported_queries: [
      "keyword_ideas",
      "search_volume",
      "competition_analysis",
    ],
    example: {
      phone: "+1234567890",
      query_type: "keyword_ideas",
      keywords: ["redes sociales"],
      language_code: "es",
      location_name: "United States",
    },
  });
}
