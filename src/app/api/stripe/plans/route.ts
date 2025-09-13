import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    // Obtener productos activos
    const products = await stripe.products.list({ active: true });
    // Obtener precios activos
    const prices = await stripe.prices.list({ active: true });

    // Filtrar productos relevantes (con features uniformes)
    const filteredProducts = products.data.filter((product) =>
      Object.keys(product.metadata || {}).some((k) => k.startsWith("feature_")),
    );

    // Mapear precios a productos y extraer features ordenados
    const plans = filteredProducts.map((product) => {
      const productPrices = prices.data.filter(
        (price) => price.product === product.id,
      );
      // Extraer features ordenados por feature_1, feature_2, ...
      const features = Object.keys(product.metadata || {})
        .filter((k) => /^feature_\d+$/.test(k))
        .sort((a, b) => {
          const na = parseInt(a.split("_")[1], 10);
          const nb = parseInt(b.split("_")[1], 10);
          return na - nb;
        })
        .map((k) => product.metadata[k]);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        features,
        prices: productPrices.map((price) => ({
          id: price.id,
          unit_amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          interval_count: price.recurring?.interval_count,
        })),
        metadata: product.metadata,
      };
    });

    return NextResponse.json({ plans });
  } catch {
    return NextResponse.json(
      { error: "Error obteniendo planes" },
      { status: 500 },
    );
  }
}
