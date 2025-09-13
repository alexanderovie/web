import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 },
      );
    }

    // Construir el HTML del email (puedes personalizarlo o usar una plantilla)
    const html = `
      <h2>Nuevo mensaje de contacto</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mensaje:</strong><br/>${message}</p>
    `;

    await sendEmail({
      to: "info@fascinantedigital.com", // Cambia por el destinatario real
      subject: `Contacto desde la web - ${name}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error enviando el mensaje." },
      { status: 500 },
    );
  }
}
