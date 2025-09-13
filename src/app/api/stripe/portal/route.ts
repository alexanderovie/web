import { NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Inicializa Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Busca el usuario en Supabase
    let user;
    const { error: userError } = await supabase
      .from("users")
      .select("id, stripe_customer_id")
      .eq("email", session.user.email)
      .single()
      .then((res) => {
        user = res.data;
        return { error: res.error };
      });

    if (userError || !user) {
      // Si no existe, lo creamos
      const customer = await stripe.customers.create({
        email: session.user.email,
      });
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert({ email: session.user.email, stripe_customer_id: customer.id })
        .select("id, stripe_customer_id")
        .single();
      if (createUserError || !newUser) {
        return NextResponse.json(
          { error: "Error creando usuario en Supabase" },
          { status: 500 },
        );
      }
      user = newUser;
    }

    let stripeCustomerId = user.stripe_customer_id;

    // Si no hay customerId, lo creamos en Stripe y lo guardamos en Supabase
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
      });
      stripeCustomerId = customer.id;
      // Actualiza el usuario en Supabase
      await supabase
        .from("users")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("id", user.id);
    }

    // Crea la sesión del portal
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url:
        process.env.PORTAL_RETURN_URL ||
        process.env.NEXT_PUBLIC_BASE_URL + "/dashboard",
    });

    return NextResponse.json({ url: portalSession.url });
  } catch {
    return NextResponse.json(
      { error: "Error creando sesión de portal" },
      { status: 500 },
    );
  }
}
