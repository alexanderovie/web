import { ShieldCheck } from "lucide-react";

import SectionHeader from "@/components/section-header";

// TODO: Cuando Next.js lo permita, cambiar a params: { lang: string } y eliminar el await
export default async function TermsOfServicePage({
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
        title={isES ? "Términos de Servicio" : "Terms of Service"}
        description={
          isES
            ? "Lee cuidadosamente los términos y condiciones que rigen el uso de los servicios y la plataforma de Fascinante Digital."
            : "Please read carefully the terms and conditions governing the use of Fascinante Digital's platform and services."
        }
        className="items-center text-center"
        lang={lang}
      />
      <section className="prose max-w-3xl mx-auto mt-10">
        {isES ? (
          <>
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar este sitio web y los servicios de Fascinante
              Digital, aceptas cumplir con estos Términos de Servicio y todas
              las leyes y regulaciones aplicables.
            </p>
            <h2>2. Servicios</h2>
            <p>
              Fascinante Digital ofrece servicios de marketing digital, diseño
              web, automatización y consultoría. Nos reservamos el derecho de
              modificar o discontinuar cualquier servicio en cualquier momento.
            </p>
            <h2>3. Uso Aceptable y Responsabilidades del Usuario</h2>
            <p>
              No puedes utilizar nuestros servicios para fines ilícitos,
              fraudulentos o que perjudiquen a terceros. El usuario es
              responsable de la veracidad de la información proporcionada y del
              uso adecuado de la plataforma.
            </p>
            <h2>4. Propiedad Intelectual</h2>
            <p>
              Todos los contenidos, marcas y materiales presentes en la
              plataforma son propiedad de Fascinante Digital o de sus
              respectivos titulares y están protegidos por la legislación
              aplicable.
            </p>
            <h2>5. Privacidad y Protección de Datos</h2>
            <p>
              El tratamiento de los datos personales se realiza conforme a
              nuestra Política de Privacidad. Consulta la sección
              correspondiente para más información.
            </p>
            <h2>6. Modificaciones</h2>
            <p>
              Fascinante Digital se reserva el derecho de modificar estos
              términos en cualquier momento. Las modificaciones serán publicadas
              en esta página.
            </p>
            <h2>7. Limitación de Responsabilidad</h2>
            <p>
              Fascinante Digital no será responsable por daños derivados del uso
              o imposibilidad de uso de la plataforma, salvo en los casos
              previstos por la ley.
            </p>
            <h2>8. Legislación Aplicable</h2>
            <p>
              Estos términos se rigen por la legislación vigente en la
              jurisdicción correspondiente.
            </p>
            <h2>9. Contacto</h2>
            <p>
              Para cualquier consulta sobre estos términos, contáctanos en{" "}
              <a href="mailto:info@fascinantedigital.com" className="underline">
                info@fascinantedigital.com
              </a>
              .
            </p>
          </>
        ) : (
          <>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website and the services of Fascinante
              Digital, you agree to comply with these Terms of Service and all
              applicable laws and regulations.
            </p>
            <h2>2. Services</h2>
            <p>
              Fascinante Digital offers digital marketing, web design,
              automation, and consulting services. We reserve the right to
              modify or discontinue any service at any time.
            </p>
            <h2>3. Acceptable Use and User Responsibilities</h2>
            <p>
              You may not use our services for unlawful, fraudulent, or harmful
              purposes. The user is responsible for the accuracy of the
              information provided and for the proper use of the platform.
            </p>
            <h2>4. Intellectual Property</h2>
            <p>
              All content, trademarks, and materials on the platform are the
              property of Fascinante Digital or their respective owners and are
              protected by applicable law.
            </p>
            <h2>5. Privacy and Data Protection</h2>
            <p>
              The processing of personal data is carried out in accordance with
              our Privacy Policy. See the relevant section for more information.
            </p>
            <h2>6. Modifications</h2>
            <p>
              Fascinante Digital reserves the right to modify these terms at any
              time. Changes will be published on this page.
            </p>
            <h2>7. Limitation of Liability</h2>
            <p>
              Fascinante Digital shall not be liable for damages arising from
              the use or inability to use the platform, except as provided by
              law.
            </p>
            <h2>8. Governing Law</h2>
            <p>
              These terms are governed by the applicable law in the relevant
              jurisdiction.
            </p>
            <h2>9. Contact</h2>
            <p>
              For any questions about these terms, contact us at{" "}
              <a href="mailto:info@fascinantedigital.com" className="underline">
                info@fascinantedigital.com
              </a>
              .
            </p>
          </>
        )}
      </section>
    </main>
  );
}
