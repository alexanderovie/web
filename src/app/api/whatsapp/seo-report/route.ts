/**
 * 📊 SEO REPORT - Envío de Reportes SEO por WhatsApp
 * 
 * Genera y envía reportes SEO personalizados por WhatsApp
 * Incluye análisis de keywords, competencia y recomendaciones
 */

import { NextRequest, NextResponse } from "next/server";
import { DataForSEOClient } from "@/lib/dataforseo-client";
import { sendWhatsAppMessage } from "@/lib/whatsapp-client";

// 🚦 Forzamos runtime Node.js para evitar limitaciones del Edge Runtime
export const runtime = "nodejs";

// 🔐 Credenciales que funcionan
const DATAFORSEO_CONFIG = {
  login: "info@fascinantedigital.com",
  password: "1dca310be03b7a87",
  baseUrl: "https://api.dataforseo.com",
};

// 📊 Generar reporte SEO completo
async function generateSEOReport(keywords: string[], language_code: string, location_name: string) {
  try {
    const client = new DataForSEOClient(DATAFORSEO_CONFIG);
    
    // 🔑 Obtener keyword ideas
    const keywordIdeas = await client.getKeywordIdeas({
      keywords,
      location_name,
      language_code,
      limit: 10,
      include_clickstream_data: false,
    });

    // 📈 Generar reporte estructurado
    let report = `📊 **REPORTE SEO COMPLETO**\n`;
    report += `🔍 Keywords: ${keywords.join(', ')}\n`;
    report += `🌍 Ubicación: ${location_name}\n`;
    report += `🗣️ Idioma: ${language_code.toUpperCase()}\n`;
    report += `📅 Fecha: ${new Date().toLocaleDateString('es-ES')}\n\n`;

    if (keywordIdeas?.tasks?.[0]?.result?.[0]?.items) {
      const items = keywordIdeas.tasks[0].result[0].items;
      
      report += `🔑 **TOP KEYWORDS ENCONTRADAS**\n\n`;
      
      // Top 5 keywords con mejor potencial
      const topKeywords = items
        .filter((item: any) => item.search_volume > 0)
        .sort((a: any, b: any) => (b.search_volume || 0) - (a.search_volume || 0))
        .slice(0, 5);

      topKeywords.forEach((item: any, index: number) => {
        const keyword = item.keyword;
        const volume = item.search_volume || item.keyword_info?.search_volume || 0;
        const competition = item.competition_level || "UNKNOWN";
        const cpc = item.cpc || item.keyword_info?.cpc || 0;
        const difficulty = item.keyword_difficulty || "N/A";
        
        report += `${index + 1}. **${keyword}**\n`;
        report += `   📊 Volumen: ${volume.toLocaleString()}\n`;
        report += `   🏆 Competencia: ${competition}\n`;
        report += `   💰 CPC: $${cpc.toFixed(2)}\n`;
        report += `   ⚡ Dificultad: ${difficulty}\n\n`;
      });

      // 📊 Estadísticas generales
      const totalVolume = items.reduce((sum: number, item: any) => 
        sum + (item.search_volume || item.keyword_info?.search_volume || 0), 0
      );
      const avgCPC = items.reduce((sum: number, item: any) => 
        sum + (item.cpc || item.keyword_info?.cpc || 0), 0
      ) / items.length;

      report += `📈 **ESTADÍSTICAS GENERALES**\n`;
      report += `   📊 Total de keywords: ${items.length}\n`;
      report += `   🔥 Volumen total: ${totalVolume.toLocaleString()}\n`;
      report += `   💰 CPC promedio: $${avgCPC.toFixed(2)}\n\n`;

      // 🎯 Recomendaciones
      report += `🎯 **RECOMENDACIONES**\n`;
      
      const lowCompetition = items.filter((item: any) => 
        item.competition_level === "LOW"
      ).length;
      
      const highVolume = items.filter((item: any) => 
        (item.search_volume || item.keyword_info?.search_volume || 0) > 1000
      ).length;

      if (lowCompetition > 0) {
        report += `   ✅ ${lowCompetition} keywords con baja competencia\n`;
      }
      
      if (highVolume > 0) {
        report += `   🔥 ${highVolume} keywords con alto volumen\n`;
      }

      report += `   📱 Revisa el dashboard para análisis completo\n`;
      report += `   🌐 Visita: fascinantedigital.com\n\n`;

    } else {
      report += `❌ No se encontraron datos para las keywords especificadas.\n`;
      report += `🔍 Verifica que las keywords sean válidas.\n\n`;
    }

    report += `📞 **¿Necesitas ayuda?**\n`;
    report += `   💬 Responde a este mensaje\n`;
    report += `   📧 Email: info@fascinantedigital.com\n`;
    report += `   🌐 Web: fascinantedigital.com`;

    return report;

  } catch (error) {
    console.error("❌ Error generando reporte SEO:", error);
    return `❌ Error generando reporte SEO: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      phone, 
      keywords, 
      language_code = "es", 
      location_name = "United States",
      send_via_whatsapp = true 
    } = body;

    // Validación de entrada
    if (!phone || !keywords) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: phone, keywords" 
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "keywords must be a non-empty array" 
        },
        { status: 400 }
      );
    }

    console.log("📊 Generando Reporte SEO para WhatsApp:", {
      phone,
      keywords,
      language_code,
      location_name
    });

    // 📊 Generar reporte SEO
    const seoReport = await generateSEOReport(keywords, language_code, location_name);

    // 📱 Enviar por WhatsApp si está habilitado
    let whatsappResult = null;
    if (send_via_whatsapp) {
      try {
        console.log("📱 Enviando reporte por WhatsApp...");
        whatsappResult = await sendWhatsAppMessage(phone, seoReport);
        console.log("✅ Reporte enviado por WhatsApp exitosamente");
      } catch (whatsappError) {
        console.error("❌ Error enviando por WhatsApp:", whatsappError);
        whatsappResult = { error: whatsappError instanceof Error ? whatsappError.message : 'Unknown error' };
      }
    }

    // 📋 Preparar respuesta
    const response = {
      success: true,
      phone,
      keywords,
      seo_report: seoReport,
      whatsapp_sent: send_via_whatsapp,
      whatsapp_result: whatsappResult,
      timestamp: new Date().toISOString(),
      metadata: {
        report_length: seoReport.length,
        language: language_code,
        location: location_name,
        total_keywords: keywords.length
      }
    };

    console.log("✅ Reporte SEO generado y enviado:", {
      phone,
      report_length: seoReport.length,
      whatsapp_sent: send_via_whatsapp
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("❌ Error en SEO Report:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message || "Failed to generate SEO report",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "SEO Report endpoint for WhatsApp",
    features: [
      "Generación de reportes SEO completos",
      "Análisis de keywords y competencia",
      "Envío automático por WhatsApp",
      "Recomendaciones personalizadas"
    ],
    example: {
      phone: "+1234567890",
      keywords: ["marketing digital", "seo"],
      language_code: "es",
      location_name: "United States",
      send_via_whatsapp: true
    }
  });
}
