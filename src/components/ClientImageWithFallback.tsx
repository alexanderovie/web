"use client";
import React, { useState } from "react";

import Image from "next/image";

interface ClientImageWithFallbackProps {
  src?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
}

export function ClientImageWithFallback({
  src,
  alt,
  width,
  height,
  className = "",
  fallbackSrc = "https://placehold.co/600x400?text=Imagen+Próximamente&font=roboto",
}: ClientImageWithFallbackProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <Image
      src={imgError || !src ? fallbackSrc : src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImgError(true)}
    />
  );
}
