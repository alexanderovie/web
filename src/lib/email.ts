import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string; // Permite personalizar el remitente si es necesario
};

/**
 * Envía un email usando Resend
 * @param options Opciones de envío (to, subject, html, from)
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    const { to, subject, html, from } = options;
    const sender = from || "Fascinante Digital <info@fascinantedigital.com>";
    const data = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
    });
    return data;
  } catch (error) {
    throw error;
  }
}
