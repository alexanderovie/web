"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconBrandGithub, IconLoader2, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

interface GitHubConnectButtonProps {
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function GitHubConnectButton({
  onSuccess,
  variant = "default",
  size = "default",
}: GitHubConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);

      // URL de instalación de GitHub App
      const githubAppId = process.env.NEXT_PUBLIC_GITHUB_APP_ID;
      const redirectUrl = encodeURIComponent(
        `${window.location.origin}/api/deploy/github/callback`,
      );

      const installUrl = `https://github.com/apps/${githubAppId}/installations/new?state=${encodeURIComponent(window.location.href)}`;

      // Redirigir a GitHub para instalación
      window.location.href = installUrl;
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
      toast.error("Error al conectar con GitHub");
    } finally {
      setLoading(false);
    }
  };

  const checkConnection = async () => {
    try {
      const response = await fetch("/api/deploy/github/status");
      if (response.ok) {
        const data = await response.json();
        setConnected(data.connected);
      }
    } catch (error) {
      console.error("Error checking GitHub connection:", error);
    }
  };

  // Verificar conexión al montar el componente
  useState(() => {
    void checkConnection();
  });

  if (connected) {
    return (
      <Button variant={variant} size={size} disabled>
        <IconCheck className="h-4 w-4 mr-2" />
        Conectado a GitHub
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleConnect}
      disabled={loading}
    >
      {loading ? (
        <>
          <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <IconBrandGithub className="h-4 w-4 mr-2" />
          Conectar GitHub
        </>
      )}
    </Button>
  );
}
