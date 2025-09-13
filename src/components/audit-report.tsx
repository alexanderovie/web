"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  MapPin,
  Phone,
  Globe,
  TrendingUp,
  Users,
  Award,
  Target,
  ArrowRight,
  Download,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface AuditReportProps {
  businessData: {
    name: string;
    address: string;
    phone: string;
    website?: string;
  };
  auditData: {
    digitalPresenceScore: number;
    reputationScore: number;
    competitivePosition: number;
    verificationStatus: number;
    totalReviews: number;
    averageRating: number;
    competitorsCount: number;
    marketPosition: number;
    recommendations: Array<{
      priority: "high" | "medium" | "low";
      title: string;
      description: string;
      impact: string;
    }>;
    metrics: {
      googleMyBusiness: boolean;
      websiteExists: boolean;
      socialMediaPresence: boolean;
      reviewResponse: boolean;
      photosCount: number;
      hoursComplete: boolean;
    };
    competitiveAnalysis: Array<{
      name: string;
      rating: number;
      reviews: number;
      distance: string;
    }>;
  };
}

export default function AuditReport({
  businessData,
  auditData,
}: AuditReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const chartData = [
    { metric: "Presencia Digital", score: auditData.digitalPresenceScore },
    { metric: "Reputación", score: auditData.reputationScore },
    { metric: "Posición Competitiva", score: auditData.competitivePosition },
    { metric: "Verificación", score: auditData.verificationStatus },
  ];

  const downloadReport = () => {
    // Implementar descarga del reporte
    // TODO: Implementar descarga del reporte en PDF
  };

  const shareReport = () => {
    // Implementar compartir reporte
    if (navigator.share) {
      navigator.share({
        title: `Auditoría Digital - ${businessData.name}`,
        text: `Revisa el reporte de auditoría digital de ${businessData.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header del Reporte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Reporte de Auditoría Digital</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Análisis completo de la presencia digital de tu negocio
        </p>
      </motion.div>

      {/* Información del Negocio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Información del Negocio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Nombre:</span>
                  <span>{businessData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Dirección:</span>
                  <span>{businessData.address}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Teléfono:</span>
                  <span>{businessData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Sitio Web:</span>
                  {businessData.website ? (
                    <span className="text-green-600">✓ Disponible</span>
                  ) : (
                    <span className="text-red-600">✗ No disponible</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Puntuación General */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Puntuación General
            </CardTitle>
            <CardDescription>
              Evaluación integral de tu presencia digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {chartData.map((item) => (
                <div key={item.metric} className="text-center space-y-2">
                  <div className="text-2xl font-bold">
                    <span className={getScoreColor(item.score)}>
                      {item.score}
                    </span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.metric}
                  </div>
                  <Progress value={item.score} className="h-2" />
                  <Badge variant={getScoreBadgeVariant(item.score)}>
                    {item.score >= 80
                      ? "Excelente"
                      : item.score >= 60
                        ? "Bueno"
                        : "Necesita Mejora"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráfico de Métricas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Métricas</CardTitle>
            <CardDescription>
              Comparación visual de los diferentes aspectos evaluados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="score"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Métricas Detalladas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Métricas Detalladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Reseñas Totales
                  </div>
                  <div className="text-2xl font-bold">
                    {auditData.totalReviews}
                  </div>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Calificación Promedio
                  </div>
                  <div className="text-2xl font-bold">
                    {auditData.averageRating}/5
                  </div>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(auditData.averageRating)
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground">
                    Posición en Mercado
                  </div>
                  <div className="text-2xl font-bold">
                    #{auditData.marketPosition}
                  </div>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Estado de Verificación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Estado de Verificación</CardTitle>
            <CardDescription>
              Verificación de elementos críticos para tu presencia digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Google My Business</span>
                  {auditData.metrics.googleMyBusiness ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Sitio Web</span>
                  {auditData.metrics.websiteExists ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Redes Sociales</span>
                  {auditData.metrics.socialMediaPresence ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Respuesta a Reseñas</span>
                  {auditData.metrics.reviewResponse ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Fotos ({auditData.metrics.photosCount})</span>
                  {auditData.metrics.photosCount >= 10 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Horarios Completos</span>
                  {auditData.metrics.hoursComplete ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Análisis Competitivo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Análisis Competitivo</CardTitle>
            <CardDescription>
              Comparación con {auditData.competitorsCount} competidores en tu
              área
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditData.competitiveAnalysis
                .slice(0, 5)
                .map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{competitor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {competitor.distance} • {competitor.reviews} reseñas
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(competitor.rating)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{competitor.rating}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recomendaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones Prioritarias</CardTitle>
            <CardDescription>
              Acciones específicas para mejorar tu presencia digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditData.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div
                    className={`p-2 rounded-full ${
                      rec.priority === "high"
                        ? "bg-red-100 text-red-600"
                        : rec.priority === "medium"
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600"
                    }`}
                  >
                    {rec.priority === "high" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : rec.priority === "medium" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge
                        variant={
                          rec.priority === "high"
                            ? "destructive"
                            : rec.priority === "medium"
                              ? "secondary"
                              : "default"
                        }
                      >
                        {rec.priority === "high"
                          ? "Alta"
                          : rec.priority === "medium"
                            ? "Media"
                            : "Baja"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {rec.description}
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      Impacto esperado: {rec.impact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Acciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button onClick={downloadReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Descargar Reporte
        </Button>
        <Button
          variant="outline"
          onClick={shareReport}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Compartir
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          Solicitar Servicios
          <ArrowRight className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Alerta Final */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este reporte se genera automáticamente con datos públicos
            disponibles. Para un análisis más profundo y personalizado,
            considera nuestros servicios profesionales.
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
