import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { resend } from "../../../../lib/resend";

const contactSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  message: z.string().min(10, "Mensaje debe tener al menos 10 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos
    const validatedData = contactSchema.parse(body);
    const { name, email, message } = validatedData;

    // Enviar email
    const { data, error } = await resend.emails.send({
      from: "noreply@fascinantedigital.com",
      to: ["infinfo@fascinantedigital.com"],
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            Nuevo mensaje de contacto - Fascinante Digital
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Información del contacto:</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString("es-ES")}</p>
          </div>
          
          <div style="background: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Mensaje:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
            <p>Este mensaje fue enviado desde el formulario de contacto de <strong>fascinantedigital.com</strong></p>
            <p>Responder directamente a: <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
          </div>
        </div>
      `,
      replyTo: email,
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error("Error sending email:", error);
      return NextResponse.json(
        { error: "Error al enviar el mensaje. Inténtalo de nuevo." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Mensaje enviado correctamente",
      emailId: data?.id,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Contact form error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
