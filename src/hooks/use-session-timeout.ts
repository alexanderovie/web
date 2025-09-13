import { useEffect, useRef, useState, useCallback, useMemo } from "react";

import { useSession, signOut } from "next-auth/react";

interface SessionTimeoutConfig {
  inactivityTimeout: number; // Tiempo de inactividad en ms
  warningBeforeLogout: number; // Tiempo de advertencia en ms
  heartbeatInterval: number; // Intervalo de heartbeat en ms
}

const DEFAULT_CONFIG: SessionTimeoutConfig = {
  inactivityTimeout: 20 * 60 * 1000, // 20 minutos
  warningBeforeLogout: 3 * 60 * 1000, // 3 minutos de advertencia
  heartbeatInterval: 10 * 60 * 1000, // 10 minutos
};

export function useSessionTimeout(config: Partial<SessionTimeoutConfig> = {}) {
  const { status } = useSession();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const finalConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config],
  );

  // Eventos que resetean el timer de inactividad
  const activityEvents = useMemo(
    () => [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
      "visibilitychange",
    ],
    [],
  );

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = useCallback(() => {
    if (status !== "authenticated") return;

    // Limpiar timers existentes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowWarning(false);
    setTimeRemaining(0);

    // Configurar nuevo timer de inactividad
    timeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(finalConfig.warningBeforeLogout);

      // Iniciar countdown
      countdownRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            // Logout automático
            signOut({ callbackUrl: "/login" });
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      // Timer para logout automático
      warningRef.current = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, finalConfig.warningBeforeLogout);
    }, finalConfig.inactivityTimeout - finalConfig.warningBeforeLogout);
  }, [status, finalConfig]);

  // Función para mantener la sesión activa
  const keepSessionActive = useCallback(() => {
    if (status !== "authenticated") return;

    // Limpiar timers de advertencia
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowWarning(false);
    setTimeRemaining(0);

    // Resetear timer de inactividad
    resetInactivityTimer();
  }, [status, resetInactivityTimer]);

  // Función para cerrar sesión manualmente
  const logoutNow = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  // Configurar event listeners para detectar actividad
  useEffect(() => {
    if (status !== "authenticated") return;

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Agregar event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Heartbeat para mantener la sesión activa
    heartbeatRef.current = setInterval(() => {
      if (status === "authenticated") {
        // NextAuth maneja el refresh automáticamente
        // Solo necesitamos mantener el timer activo
        resetInactivityTimer();
      }
    }, finalConfig.heartbeatInterval);

    // Iniciar timer de inactividad
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [
    status,
    resetInactivityTimer,
    finalConfig.heartbeatInterval,
    activityEvents,
  ]);

  // Formatear tiempo restante
  const formatTimeRemaining = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return {
    showWarning,
    timeRemaining: formatTimeRemaining(timeRemaining),
    keepSessionActive,
    logoutNow,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
