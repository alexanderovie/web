import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@supabase/supabase-js";

import { stripe } from "@/lib/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const sig = req.headers.get("stripe-signature");
  const buf = await req.arrayBuffer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig!,
      endpointSecret,
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${err}` },
      { status: 400 },
    );
  }

  // Manejar eventos relevantes
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail =
      session.customer_details?.email || session.customer_email || null;
    if (!customerEmail) {
      return NextResponse.json(
        { error: "No se pudo obtener el email del cliente de Stripe" },
        { status: 400 },
      );
    }
    const subscriptionId = session.subscription;
    const priceId = session.metadata?.price_id;
    if (!priceId) {
      return NextResponse.json(
        { error: "No se pudo obtener el price_id de la sesión de Stripe" },
        { status: 400 },
      );
    }
    const businessId = session.metadata?.business_id || null;

    // Actualizar o crear suscripción en Supabase
    await supabase.from("subscriptions").upsert({
      stripe_subscription_id: subscriptionId,
      user_email: customerEmail,
      stripe_price_id: priceId,
      business_id: businessId,
      status: "active",
      current_period_end: new Date(session.expires_at * 1000).toISOString(),
    });
  }
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    // Stripe API moderna: current_period_end está en el primer item de items.data
    const currentPeriodEnd =
      Array.isArray(subscription.items?.data) &&
      subscription.items.data[0]?.current_period_end
        ? new Date(
            subscription.items.data[0].current_period_end * 1000,
          ).toISOString()
        : null;
    await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        current_period_end: currentPeriodEnd,
      })
      .eq("stripe_subscription_id", subscription.id);
  }
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    // Stripe API moderna: current_period_end está en el primer item de items.data
    const currentPeriodEnd =
      Array.isArray(subscription.items?.data) &&
      subscription.items.data[0]?.current_period_end
        ? new Date(
            subscription.items.data[0].current_period_end * 1000,
          ).toISOString()
        : null;
    await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_end: currentPeriodEnd,
      })
      .eq("stripe_subscription_id", subscription.id);
  }
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;

    if ((invoice as any).subscription) {
      await supabase
        .from("subscriptions")
        .update({
          status: "payment_failed",
        })

        .eq("stripe_subscription_id", (invoice as any).subscription);
    }
  }

  // Puedes manejar más eventos aquí (cancellation, payment_failed, etc)

  return NextResponse.json({ received: true });
}
