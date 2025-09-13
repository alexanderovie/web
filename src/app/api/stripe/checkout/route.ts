import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { priceId, lang } = await request.json();
    if (!priceId) {
      return NextResponse.json({ error: "Falta priceId" }, { status: 400 });
    }

    // Autenticación NextAuth
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Buscar o crear customer en Stripe (puedes mejorar esto con Supabase si quieres guardar el customer_id)
    // Aquí solo usamos el email
    const customer = await stripe.customers.create({
      email: session.user.email,
    });

    // --- ELIMINADO: Lógica de negocio en Supabase ---

    // Crear sesión de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang || "es"}/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${lang || "es"}/pricing?canceled=1`,
      metadata: {
        user_email: session.user.email,
        // business_id eliminado
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return NextResponse.json(
      { error: "Error creando sesión de pago" },
      { status: 500 },
    );
  }
}
