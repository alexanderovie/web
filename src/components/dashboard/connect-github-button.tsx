"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconBrandGithub, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

interface ConnectGitHubButtonProps {
  onSuccess?: () => void;
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ConnectGitHubButton({
  onSuccess,
  variant = "default",
  size = "default",
  className,
}: ConnectGitHubButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);

      // URL de instalación del GitHub App
      const githubAppId = process.env.NEXT_PUBLIC_GITHUB_APP_ID;
      const redirectUrl = encodeURIComponent(
        `${window.location.origin}/api/deploy/github/connect`,
      );

      const installUrl = `https://github.com/apps/fascinante-digital-deploy/installations/new?state=${redirectUrl}`;

      // Redirigir a GitHub para instalar la app
      window.location.href = installUrl;
    } catch (error) {
      console.error("Error connecting GitHub:", error);
      toast.error("Error al conectar con GitHub");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
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
