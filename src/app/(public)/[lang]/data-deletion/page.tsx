import { ShieldCheck } from "lucide-react";

import SectionHeader from "@/components/section-header";

export default async function DataDeletionPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isES = lang === "es";

  return (
    <main className="container py-12">
      <SectionHeader
        icon={ShieldCheck}
        iconTitle={isES ? "Legal" : "Legal"}
        title={isES ? "Eliminación de Datos" : "Data Deletion"}
        description={
          isES
            ? "Solicita la eliminación de tus datos personales de nuestros sistemas. Tu privacidad es importante para nosotros."
            : "Request the deletion of your personal data from our systems. Your privacy is important to us."
        }
        className="items-center text-center"
        lang={lang}
      />
      <section className="prose max-w-3xl mx-auto mt-10">
        {isES ? (
          <>
            <h2>1. Tu Derecho a la Eliminación de Datos</h2>
            <p>
              En Fascinante Digital, respetamos tu derecho a controlar tu
              información personal. De acuerdo con el Reglamento General de
              Protección de Datos (GDPR) y la Ley de Privacidad del Consumidor
              de California (CCPA), tienes derecho a solicitar la eliminación de
              tus datos personales de nuestros sistemas.
            </p>

            <h2>2. ¿Qué Datos Podemos Eliminar?</h2>
            <p>
              Podemos eliminar la siguiente información personal que hayas
              proporcionado:
            </p>
            <ul>
              <li>Información de contacto (nombre, email, teléfono)</li>
              <li>Datos de cuenta y perfil de usuario</li>
              <li>Historial de interacciones con nuestros servicios</li>
              <li>Datos de uso de la plataforma</li>
              <li>Información de facturación y pagos</li>
              <li>Datos de marketing y comunicaciones</li>
            </ul>

            <h2>3. Proceso de Solicitud</h2>
            <p>
              Para solicitar la eliminación de tus datos personales, contáctanos
              a través de:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">Email de Privacidad:</p>
              <p>
                <a
                  href="mailto:privacidad@fascinantedigital.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  privacidad@fascinantedigital.com
                </a>
              </p>
            </div>

            <h2>4. Información Requerida</h2>
            <p>
              Para procesar tu solicitud de eliminación, necesitamos que
              proporciones:
            </p>
            <ul>
              <li>Tu nombre completo</li>
              <li>Dirección de correo electrónico asociada a tu cuenta</li>
              <li>Descripción específica de los datos que deseas eliminar</li>
              <li>Motivo de la solicitud (opcional)</li>
            </ul>

            <h2>5. Tiempo de Respuesta</h2>
            <p>
              Nos comprometemos a responder a tu solicitud de eliminación de
              datos en un plazo de <strong>7 días hábiles</strong> desde la
              recepción de tu solicitud. En casos complejos, este plazo puede
              extenderse hasta 30 días, momento en el cual te notificaremos
              sobre el progreso.
            </p>

            <h2>6. Verificación de Identidad</h2>
            <p>
              Para proteger tu privacidad, podemos solicitar información
              adicional para verificar tu identidad antes de procesar la
              eliminación de datos. Esto es necesario para prevenir el acceso no
              autorizado a información personal.
            </p>

            <h2>7. Excepciones a la Eliminación</h2>
            <p>
              En algunos casos, podemos retener cierta información por motivos
              legales, de seguridad o para cumplir con obligaciones
              contractuales. Estos casos incluyen:
            </p>
            <ul>
              <li>Información requerida por ley o regulaciones</li>
              <li>Datos necesarios para prevenir fraudes o abusos</li>
              <li>Información relacionada con transacciones financieras</li>
              <li>Datos de auditoría y cumplimiento</li>
            </ul>

            <h2>8. Confirmación de Eliminación</h2>
            <p>
              Una vez completada la eliminación de tus datos, te enviaremos una
              confirmación por correo electrónico detallando qué información ha
              sido eliminada y qué datos, si los hay, se han conservado por
              motivos legales.
            </p>

            <h2>9. Derechos Adicionales</h2>
            <p>Además del derecho de eliminación, también tienes derecho a:</p>
            <ul>
              <li>Acceder a tus datos personales</li>
              <li>Corregir información inexacta</li>
              <li>Oponerte al procesamiento de datos</li>
              <li>Portabilidad de datos</li>
              <li>Retirar el consentimiento en cualquier momento</li>
            </ul>

            <h2>10. Contacto y Soporte</h2>
            <p>
              Si tienes preguntas sobre este proceso o necesitas ayuda con tu
              solicitud, no dudes en contactarnos:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <p>
                <strong>Fascinante Digital</strong>
              </p>
              <p>Dirección: 2054 Vista Pkwy # 400, West Palm Beach, FL 33411</p>
              <p>Teléfono: (800) 886-4981</p>
              <p>Email: privacidad@fascinantedigital.com</p>
              <p>Sitio web: fascinantedigital.com</p>
            </div>

            <h2>11. Actualizaciones de esta Política</h2>
            <p>
              Podemos actualizar esta política de eliminación de datos
              ocasionalmente. Te notificaremos cualquier cambio significativo
              por correo electrónico o mediante un aviso en nuestro sitio web.
            </p>
          </>
        ) : (
          <>
            <h2>1. Your Right to Data Deletion</h2>
            <p>
              At Fascinante Digital, we respect your right to control your
              personal information. In accordance with the General Data
              Protection Regulation (GDPR) and the California Consumer Privacy
              Act (CCPA), you have the right to request the deletion of your
              personal data from our systems.
            </p>

            <h2>2. What Data Can We Delete?</h2>
            <p>
              We can delete the following personal information you have
              provided:
            </p>
            <ul>
              <li>Contact information (name, email, phone)</li>
              <li>Account and user profile data</li>
              <li>Service interaction history</li>
              <li>Platform usage data</li>
              <li>Billing and payment information</li>
              <li>Marketing and communication data</li>
            </ul>

            <h2>3. Request Process</h2>
            <p>
              To request the deletion of your personal data, contact us through:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <p className="font-semibold mb-2">Privacy Email:</p>
              <p>
                <a
                  href="mailto:privacidad@fascinantedigital.com"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  privacidad@fascinantedigital.com
                </a>
              </p>
            </div>

            <h2>4. Required Information</h2>
            <p>To process your deletion request, we need you to provide:</p>
            <ul>
              <li>Your full name</li>
              <li>Email address associated with your account</li>
              <li>Specific description of the data you want to delete</li>
              <li>Reason for the request (optional)</li>
            </ul>

            <h2>5. Response Time</h2>
            <p>
              We commit to responding to your data deletion request within{" "}
              <strong>7 business days</strong> from receiving your request. In
              complex cases, this period may be extended up to 30 days, at which
              time we will notify you of the progress.
            </p>

            <h2>6. Identity Verification</h2>
            <p>
              To protect your privacy, we may request additional information to
              verify your identity before processing data deletion. This is
              necessary to prevent unauthorized access to personal information.
            </p>

            <h2>7. Exceptions to Deletion</h2>
            <p>
              In some cases, we may retain certain information for legal,
              security, or contractual compliance reasons. These cases include:
            </p>
            <ul>
              <li>Information required by law or regulations</li>
              <li>Data necessary to prevent fraud or abuse</li>
              <li>Information related to financial transactions</li>
              <li>Audit and compliance data</li>
            </ul>

            <h2>8. Deletion Confirmation</h2>
            <p>
              Once your data deletion is completed, we will send you a
              confirmation email detailing what information has been deleted and
              what data, if any, has been retained for legal reasons.
            </p>

            <h2>9. Additional Rights</h2>
            <p>
              In addition to the right of deletion, you also have the right to:
            </p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Object to data processing</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2>10. Contact and Support</h2>
            <p>
              If you have questions about this process or need help with your
              request, don't hesitate to contact us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg my-4">
              <p>
                <strong>Fascinante Digital</strong>
              </p>
              <p>Address: 2054 Vista Pkwy # 400, West Palm Beach, FL 33411</p>
              <p>Phone: (800) 886-4981</p>
              <p>Email: privacidad@fascinantedigital.com</p>
              <p>Website: fascinantedigital.com</p>
            </div>

            <h2>11. Updates to this Policy</h2>
            <p>
              We may update this data deletion policy occasionally. We will
              notify you of any significant changes by email or through a notice
              on our website.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
