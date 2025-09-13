"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconBrandGoogle } from "@tabler/icons-react";

interface GMBConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function GMBConnectModal({
  isOpen,
  onClose,
  onSuccess,
}: GMBConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Redirigir directamente a Google OAuth
      const authUrl = `/api/google-business/connect`;
      window.location.href = authUrl;
    } catch (err) {
      setError("Error al iniciar la conexión. Intenta de nuevo.");
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-green-500 p-2 rounded-full">
              <IconBrandGoogle className="h-5 w-5 text-white" />
            </div>
            Conectar Google My Business
          </DialogTitle>
          <DialogDescription>
            Conecta tu cuenta de Google para acceder a métricas detalladas de tu
            negocio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              Al conectar tu cuenta de Google My Business podrás:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ver métricas de clics y llamadas</li>
              <li>Analizar el rendimiento de tus ubicaciones</li>
              <li>Monitorear el estado de verificación</li>
              <li>Acceder a datos en tiempo real</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isConnecting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? "Conectando..." : "Conectar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
