"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2, IconGitBranch, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    repository: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.repository.trim()) {
      toast.error("Nombre y repositorio son requeridos");
      return;
    }

    // Validar formato del repositorio (usuario/repositorio)
    const repoRegex = /^[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/;
    if (!repoRegex.test(formData.repository)) {
      toast.error("Formato de repositorio inválido. Usa: usuario/repositorio");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/deploy/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear proyecto");
      }

      const result = await response.json();

      toast.success("Proyecto creado exitosamente");
      onSuccess();
      onOpenChange(false);

      // Reset form
      setFormData({
        name: "",
        repository: "",
        description: "",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al crear proyecto",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <IconPlus className="h-5 w-5 mr-2" />
            Crear Nuevo Proyecto
          </DialogTitle>
          <DialogDescription>
            Configura un nuevo proyecto para automatizar el despliegue desde
            GitHub
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proyecto</Label>
            <Input
              id="name"
              placeholder="Mi Aplicación Web"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="repository" className="flex items-center">
              <IconGitBranch className="h-4 w-4 mr-1" />
              Repositorio GitHub
            </Label>
            <Input
              id="repository"
              placeholder="usuario/repositorio"
              value={formData.repository}
              onChange={(e) => handleInputChange("repository", e.target.value)}
              disabled={loading}
              required
            />
            <p className="text-xs text-muted-foreground">
              Formato: usuario/repositorio (ej: fascinante-digital/platform)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe tu proyecto..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Crear Proyecto
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
