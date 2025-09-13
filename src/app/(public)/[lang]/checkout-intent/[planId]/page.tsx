"use client";
import { useEffect } from "react";

import { useRouter, useParams } from "next/navigation";

import { useSession } from "next-auth/react";

const PRICE_IDS: Record<string, string> = {
  impulso: "price_1RkXhMLEJleujb55EZPJrn8E", // Plan Impulso Total $149
  presencia: "price_1RkXhQLEJleujb55TJLJQMD8", // Plan Presencia Online $99
};

export default function CheckoutIntentPage() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const planId = params?.planId as string | undefined;
  const priceId = planId ? PRICE_IDS[planId] : undefined;

  useEffect(() => {
    if (!planId || !priceId) return;
    if (status === "authenticated" && priceId) {
      fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            window.location.href = data.url;
          } else if (data.error) {
            alert("Error: " + data.error);
            router.replace("/pricing");
          } else {
            alert("Respuesta inesperada del servidor");
            router.replace("/pricing");
          }
        })
        .catch((err) => {
          alert("Error de red: " + err.message);
          router.replace("/pricing");
        });
    }
    // Si no está autenticado, el middleware de login ya lo redirige
  }, [status, priceId, router, planId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-lg font-semibold mb-4">
        Procesando tu suscripción...
      </div>
      <div className="text-muted-foreground">Por favor espera un momento.</div>
    </div>
  );
}
