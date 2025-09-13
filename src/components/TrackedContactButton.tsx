/**
 * Componente de botón de contacto con tracking automático
 */

import { useContactTracking } from "@/hooks/useTracking";

interface TrackedContactButtonProps {
  type: "phone" | "whatsapp" | "email";
  value: string;
  location: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function TrackedContactButton({
  type,
  value,
  location,
  children,
  className = "",
  onClick,
}: TrackedContactButtonProps) {
  const { trackContact } = useContactTracking();

  const handleClick = () => {
    // Trackear el evento
    trackContact(type, location);

    // Ejecutar onClick personalizado si existe
    if (onClick) {
      onClick();
    }

    // Acción específica según el tipo
    switch (type) {
      case "phone":
        window.open(`tel:${value}`, "_self");
        break;
      case "whatsapp":
        const message = encodeURIComponent(
          "Hola, me interesa conocer más sobre sus servicios de marketing digital.",
        );
        window.open(`https://wa.me/${value}?text=${message}`, "_blank");
        break;
      case "email":
        window.open(`mailto:${value}`, "_self");
        break;
    }
  };

  return (
    <button onClick={handleClick} className={className} type="button">
      {children}
    </button>
  );
}
