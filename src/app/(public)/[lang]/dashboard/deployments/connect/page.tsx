"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  IconBrandGithub,
  IconSearch,
  IconLoader2,
  IconCheck,
  IconX,
  IconExternalLink,
  IconRocket,
  IconRefresh,
} from "@tabler/icons-react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { toast } from "sonner";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

interface Installation {
  id: string;
  account: string;
}

export default function ConnectPage() {
  usePageTitle("Conectar Repositorios");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [connectingRepo, setConnectingRepo] = useState<string | null>(null);

  const installationId = searchParams?.get("installation_id") || null;
  const setupAction = searchParams?.get("setup_action") || null;

  useEffect(() => {
    if (installationId) {
      loadRepositories();
    }
  }, [installationId]);

  const loadRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/deploy/github/repositories?installation_id=${installationId}`,
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al cargar repositorios");
      }

      const data = await response.json();
      setRepositories(data.data || []);
      setInstallation(data.installation);
    } catch (error) {
      console.error("Error loading repositories:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al cargar repositorios",
      );
    } finally {
      setLoading(false);
    }
  };

  const connectRepository = async (repo: Repository) => {
    try {
      setConnectingRepo(repo.full_name);

      const response = await fetch("/api/deploy/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: repo.name,
          repository: repo.full_name,
          description: repo.description || `Repositorio ${repo.name}`,
          github_installation_id: installationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al conectar repositorio");
      }

      toast.success(`Repositorio ${repo.name} conectado exitosamente`);

      // Actualizar estado local
      setRepositories((prev) =>
        prev.map((r) => (r.id === repo.id ? { ...r, is_connected: true } : r)),
      );

      // Redirigir al dashboard después de un momento
      setTimeout(() => {
        router.push("/es/dashboard/deployments");
      }, 1500);
    } catch (error) {
      console.error("Error connecting repository:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al conectar repositorio",
      );
    } finally {
      setConnectingRepo(null);
    }
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!installationId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <IconX className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Instalación no válida</h2>
          <p className="text-muted-foreground mb-4">
            No se encontró la instalación de GitHub
          </p>
          <Button onClick={() => router.push("/es/dashboard/deployments")}>
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Conectar Repositorios
          </h1>
          <p className="text-muted-foreground">
            Selecciona los repositorios que quieres conectar para automatizar el
            despliegue
          </p>
        </div>
        <Button variant="outline" onClick={loadRepositories} disabled={loading}>
          <IconRefresh className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Información de la instalación */}
      {installation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconBrandGithub className="h-5 w-5 mr-2" />
              Instalación de GitHub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">{installation.account}</Badge>
              <span className="text-sm text-muted-foreground">
                Installation ID: {installation.id}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Búsqueda */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar repositorios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de repositorios */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <IconLoader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Cargando repositorios...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{repo.name}</h3>
                      {repo.private && (
                        <Badge variant="secondary" className="text-xs">
                          Privado
                        </Badge>
                      )}
                      {repo.is_connected && (
                        <Badge className="bg-green-100 text-green-800">
                          <IconCheck className="h-3 w-3 mr-1" />
                          Conectado
                        </Badge>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-muted-foreground mb-2">
                        {repo.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Branch: {repo.default_branch}</span>
                      <span>
                        Actualizado:{" "}
                        {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(repo.html_url, "_blank")}
                    >
                      <IconExternalLink className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    {!repo.is_connected && (
                      <Button
                        onClick={() => connectRepository(repo)}
                        disabled={connectingRepo === repo.full_name}
                      >
                        {connectingRepo === repo.full_name ? (
                          <>
                            <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                            Conectando...
                          </>
                        ) : (
                          <>
                            <IconRocket className="h-4 w-4 mr-2" />
                            Conectar
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && filteredRepositories.length === 0 && (
        <div className="text-center py-12">
          <IconBrandGithub className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No se encontraron repositorios
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No hay repositorios que coincidan con tu búsqueda"
              : "No tienes repositorios en esta instalación"}
          </p>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
