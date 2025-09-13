"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconGitBranch,
  IconClock,
  IconCheck,
  IconX,
  IconSettings,
  IconRocket,
  IconExternalLink,
  IconDotsVertical,
  IconLoader2,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

export function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const [loading, setLoading] = useState(false);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeploy = async (environmentId: string) => {
    try {
      setLoading(true);

      const response = await fetch("/api/deploy/deployments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: project.id,
          environmentId,
          commitSha: "latest",
          commitMessage: "Deploy manual",
          branch: "main",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al iniciar deployment");
      }

      toast.success("Deployment iniciado exitosamente");
      onUpdate();
    } catch (error) {
      console.error("Error starting deployment:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al iniciar deployment",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/deploy/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: project.status === "active" ? "archived" : "active",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar proyecto");
      }

      toast.success(
        `Proyecto ${project.status === "active" ? "archivado" : "activado"} exitosamente`,
      );
      onUpdate();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar proyecto",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/deploy/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar proyecto");
      }

      toast.success("Proyecto eliminado exitosamente");
      onUpdate();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar proyecto",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center">
              <IconGitBranch className="h-4 w-4 mr-2 text-blue-600" />
              {project.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {project.repository}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleArchive}>
                {project.status === "active" ? "Archivar" : "Activar"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(project.status)}>
            {project.status === "active"
              ? "Activo"
              : project.status === "archived"
                ? "Archivado"
                : "Suspendido"}
          </Badge>
          {project.last_deploy_at && (
            <span className="text-xs text-muted-foreground">
              Último deploy: {formatDate(project.last_deploy_at)}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground">{project.description}</p>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {project.total_deploys}
            </div>
            <div className="text-xs text-muted-foreground">Total Deploys</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {project.success_rate}%
            </div>
            <div className="text-xs text-muted-foreground">Tasa de Éxito</div>
          </div>
        </div>

        {/* Ambientes */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Ambientes</h4>
          <div className="space-y-2">
            {project.deploy_environments?.map((env) => (
              <div
                key={env.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {env.name}
                  </Badge>
                  {env.last_deploy_at && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(env.last_deploy_at)}
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDeploy(env.id)}
                  disabled={loading || project.status !== "active"}
                >
                  {loading ? (
                    <IconLoader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <IconRocket className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )) || (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No hay ambientes configurados
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(`https://github.com/${project.repository}`, "_blank")
            }
          >
            <IconExternalLink className="h-3 w-3 mr-1" />
            Ver en GitHub
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(`/dashboard/deployments/${project.slug}`, "_blank")
            }
          >
            <IconSettings className="h-3 w-3 mr-1" />
            Configurar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
