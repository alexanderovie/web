import React from "react";

interface FadeEdgesProps {
  children: React.ReactNode;
  className?: string;
  fadeWidth?: string; // Ancho del desvanecimiento (ej: "w-20", "w-32")
}

const FadeEdges = ({
  children,
  className = "",
  fadeWidth = "w-20",
}: FadeEdgesProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* GRADIENTE IZQUIERDO - Desvanece el inicio */}
      <div
        className={`absolute left-0 top-0 ${fadeWidth} h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none`}
      />

      {/* GRADIENTE DERECHO - Desvanece el final */}
      <div
        className={`absolute right-0 top-0 ${fadeWidth} h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none`}
      />

      {/* CONTENIDO */}
      {children}
    </div>
  );
};

export default FadeEdges;
