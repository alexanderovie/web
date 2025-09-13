"use client";

import { useEffect } from "react";

export default function FacebookPixelInit() {
  // Inicializar fbq como función vacía para evitar errores
  useEffect(() => {
    if (typeof window !== "undefined" && !window.fbq) {
      window.fbq = function (...args: any[]) {
        (window.fbq.q = window.fbq.q || []).push(args);
      };
      window.fbq.q = window.fbq.q || [];
    }
  }, []);

  return null;
}
