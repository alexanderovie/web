import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Falta el email." }, { status: 400 });
    }

    // Email para el admin
    await sendEmail({
      to: "info@fascinantedigital.com",
      subject: `Nueva suscripción a newsletter`,
      html: `<p>Nuevo suscriptor: <strong>${email}</strong></p>`,
    });

    // Email de confirmación para el usuario
    await sendEmail({
      to: email,
      subject: "¡Gracias por suscribirte a Fascinante Digital!",
      html: `<h2>¡Bienvenido/a!</h2><p>Gracias por suscribirte a nuestro boletín. Pronto recibirás novedades y recursos exclusivos.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error enviando la suscripción." },
      { status: 500 },
    );
  }
}
