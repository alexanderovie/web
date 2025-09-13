/**
 * Componente de formulario con tracking automático
 */

import { useFormTracking } from "@/hooks/useTracking";
import { FormEvent } from "react";

interface TrackedFormProps {
  formType: string;
  source: string;
  onSubmit?: (e: FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export default function TrackedForm({
  formType,
  source,
  onSubmit,
  children,
  className = "",
}: TrackedFormProps) {
  const { trackFormSubmit } = useFormTracking();

  const handleSubmit = (e: FormEvent) => {
    // Trackear el evento de envío de formulario
    trackFormSubmit(formType, source);

    // Ejecutar onSubmit personalizado si existe
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
