"use client";

import { createContext, useContext, ReactNode } from "react";

import { SessionTimeoutModal } from "@/components/session-timeout-modal";
import { useSessionTimeout } from "@/hooks/use-session-timeout";

interface SessionTimeoutContextType {
  showWarning: boolean;
  timeRemaining: string;
  keepSessionActive: () => void;
  logoutNow: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const SessionTimeoutContext = createContext<
  SessionTimeoutContextType | undefined
>(undefined);

interface SessionTimeoutProviderProps {
  children: ReactNode;
  config?: {
    inactivityTimeout?: number;
    warningBeforeLogout?: number;
    heartbeatInterval?: number;
  };
}

export function SessionTimeoutProvider({
  children,
  config,
}: SessionTimeoutProviderProps) {
  const sessionTimeout = useSessionTimeout(config);

  return (
    <SessionTimeoutContext.Provider value={sessionTimeout}>
      {children}
      <SessionTimeoutModal
        isOpen={sessionTimeout.showWarning}
        timeRemaining={sessionTimeout.timeRemaining}
        onKeepSession={sessionTimeout.keepSessionActive}
        onLogout={sessionTimeout.logoutNow}
      />
    </SessionTimeoutContext.Provider>
  );
}

export function useSessionTimeoutContext() {
  const context = useContext(SessionTimeoutContext);
  if (context === undefined) {
    throw new Error(
      "useSessionTimeoutContext must be used within a SessionTimeoutProvider",
    );
  }
  return context;
}
