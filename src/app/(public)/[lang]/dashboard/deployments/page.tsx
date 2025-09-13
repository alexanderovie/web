"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  IconPlus,
  IconSearch,
  IconGitBranch,
  IconClock,
  IconCheck,
  IconX,
  IconLoader2,
  IconRefresh,
  IconChartBar,
  IconRocket,
  IconServer,
  IconActivity,
} from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ConnectGitHubButton } from "@/components/dashboard/connect-github-button";

interface Project {
  id: string;
  name: string;
  slug: string;
  repository: string;
  description?: string;
  status: string;
  total_deploys: number;
  success_rate: number;
  last_deploy_at?: string;
  created_at: string;
  deploy_environments: Environment[];
}

interface Environment {
  id: string;
  name: string;
  slug: string;
  status: string;
  last_deploy_at?: string;
}

interface UserStats {
  total_projects: number;
  active_projects: number;
  total_deploys: number;
  avg_success_rate: number;
  recent_deploys: any[];
}

interface MonthlyMetrics {
  totalDeploys: number;
  successfulDeploys: number;
  failedDeploys: number;
  successRate: number;
  avgBuildTime: number;
  avgDeployTime: number;
  period: string;
}

export default function DeploymentsPage() {
  usePageTitle("Deployments");

  const [projects, setProjects] = useState<Project[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [monthlyMetrics, setMonthlyMetrics] = useState<MonthlyMetrics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Cargar proyectos
      const projectsResponse = await fetch("/api/deploy/projects");
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.data || []);
      }

      // Cargar estadísticas
      const statsResponse = await fetch("/api/deploy/stats");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData.data.userStats);
        setMonthlyMetrics(statsData.data.monthlyMetrics);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.repository.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <IconLoader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Cargando deployments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployments</h1>
          <p className="text-muted-foreground">
            Gestiona tus proyectos y automatiza el despliegue
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ConnectGitHubButton variant="outline" />
          <Button onClick={() => setCreateModalOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" /> Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {userStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Proyectos Activos
              </CardTitle>
              <IconServer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.active_projects}
              </div>
              <p className="text-xs text-muted-foreground">
                de {userStats.total_projects} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Deploys
              </CardTitle>
              <IconRocket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.total_deploys}
              </div>
              <p className="text-xs text-muted-foreground">
                {monthlyMetrics?.totalDeploys || 0} este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Éxito
              </CardTitle>
              <IconCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userStats.avg_success_rate}%
              </div>
              <p className="text-xs text-muted-foreground">promedio general</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo Promedio
              </CardTitle>
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyMetrics
                  ? formatDuration(
                      monthlyMetrics.avgBuildTime +
                        monthlyMetrics.avgDeployTime,
                    )
                  : "0s"}
              </div>
              <p className="text-xs text-muted-foreground">build + deploy</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas Mensuales */}
      {monthlyMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconChartBar className="h-5 w-5 mr-2" />
              Métricas del Mes
            </CardTitle>
            <CardDescription>
              Resumen de actividad en los últimos 30 días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <IconCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Exitosos:</span>
                </div>
                <span className="text-lg font-bold">
                  {monthlyMetrics.successfulDeploys}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <IconX className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Fallidos:</span>
                </div>
                <span className="text-lg font-bold">
                  {monthlyMetrics.failedDeploys}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <IconActivity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Tasa de Éxito:</span>
                </div>
                <span className="text-lg font-bold">
                  {monthlyMetrics.successRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Búsqueda y Filtros */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={loadData}>
          <IconRefresh className="h-4 w-4" />
        </Button>
      </div>

      {/* Lista de Proyectos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onUpdate={loadData} />
        ))}
      </div>

      {/* Estado Vacío */}
      {filteredProjects.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <IconServer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm
                ? "No se encontraron proyectos"
                : "No tienes proyectos aún"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primer proyecto para comenzar con los deployments automáticos"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <IconPlus className="h-4 w-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Crear Proyecto */}
      <CreateProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={loadData}
      />
    </div>
  );
}
