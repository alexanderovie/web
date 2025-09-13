"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Si tienes lucide-react instalado en el proyecto
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ExternalLink, Info } from "lucide-react";

export type DomainLinkProps = {
  url: string;
  className?: string;
  label?: string;
  showFavicon?: boolean;
};

function normalizeUrl(rawUrl: string): URL | null {
  try {
    const u = new URL(rawUrl);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u;
  } catch {
    // Intentar agregar https si faltara protocolo
    try {
      const u2 = new URL(`https://${rawUrl}`);
      if (!/^https?:$/.test(u2.protocol)) return null;
      return u2;
    } catch {
      return null;
    }
  }
}

function getDisplayDomain(u: URL): string {
  return u.hostname.replace(/^www\./, "");
}

function getFaviconUrl(u: URL): string {
  const host = u.hostname;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
}

export function DomainLink({
  url,
  className,
  label,
  showFavicon = false,
}: DomainLinkProps) {
  const u = React.useMemo(() => normalizeUrl(url), [url]);
  const display = u ? getDisplayDomain(u) : url;
  const href = u ? u.toString() : url;

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      // opcional: toast
    }
  }, [href]);

  return (
    <div className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline decoration-dotted underline-offset-2"
        title={href}
        aria-label={label ?? `Abrir ${display} en nueva pestaña`}
      >
        {showFavicon && u && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getFaviconUrl(u)}
            alt=""
            width={14}
            height={14}
            className="mr-1 inline-block align-[-2px]"
          />
        )}
        {display}
        <ExternalLink className="size-3.5 opacity-70" aria-hidden />
      </a>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="ml-2 inline-flex items-center text-muted-foreground hover:text-foreground"
              aria-label="Ver URL completa"
            >
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" align="start" className="max-w-xs">
            <div className="text-xs">
              <div className="mb-1 font-medium">URL completa</div>
              <code className="break-all">{href}</code>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  Copiar
                </Button>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default DomainLink;
