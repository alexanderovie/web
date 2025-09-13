"use client";
import { usePathname } from "next/navigation";

import { DevelopmentBanner } from "@/components/development-banner";
import Navbar from "@/components/navbar";
import Footer from "@/components/sections/footer";

export function PublicOnlyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Detecta dashboard y subrutas, para cualquier idioma
  const isDashboard = pathname
    ? /\/([a-z]{2})\/dashboard(\/|$)/.test(pathname)
    : false;
  // Detecta login y subrutas, para cualquier idioma
  const isLogin = pathname ? /\/([a-z]{2})\/login(\/|$)/.test(pathname) : false;
  // Detecta login2 y subrutas, para cualquier idioma
  const isLogin2 = pathname
    ? /\/([a-z]{2})\/login2(\/|$)/.test(pathname)
    : false;
  // Detecta signup y subrutas, para cualquier idioma
  const isSignup = pathname
    ? /\/([a-z]{2})\/signup(\/|$)/.test(pathname)
    : false;
  // Detecta forgot-password y subrutas, para cualquier idioma
  const isForgotPassword = pathname
    ? /\/([a-z]{2})\/forgot-password(\/|$)/.test(pathname)
    : false;
  return (
    <>
      {!isDashboard &&
        !isLogin &&
        !isLogin2 &&
        !isSignup &&
        !isForgotPassword && <DevelopmentBanner />}
      {!isDashboard &&
        !isLogin &&
        !isLogin2 &&
        !isSignup &&
        !isForgotPassword && <Navbar />}
      <main
        className={
          !isDashboard &&
          !isLogin &&
          !isLogin2 &&
          !isSignup &&
          !isForgotPassword
            ? "pt-[96px]"
            : undefined
        }
      >
        {children}
      </main>
      {!isDashboard &&
        !isLogin &&
        !isLogin2 &&
        !isSignup &&
        !isForgotPassword && <Footer />}
    </>
  );
}
