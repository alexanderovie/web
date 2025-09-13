import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Instagram, Twitter, Linkedin, Phone, Mail } from "lucide-react";
import { useTranslations } from "next-intl";

const Footer = () => {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const lang = pathname?.split("/")[1] || "es";

  const sections = [
    {
      title: t("product.title"),
      links: [
        { name: t("product.features"), href: `/${lang}/#features` },
        { name: t("product.pricing"), href: `/${lang}/pricing` },
      ],
    },
    {
      title: t("company.title"),
      links: [
        { name: t("company.contact"), href: `/${lang}/contact` },
        { name: t("company.faq"), href: `/${lang}/faq` },
      ],
    },
    {
      title: t("legal.title"),
      links: [
        { name: t("legal.terms"), href: `/${lang}/terms-of-service` },
        { name: t("legal.privacy"), href: `/${lang}/privacy-policy` },
      ],
    },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Sección principal */}
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Columna 1: Logo y descripción */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              {/* Logo */}
              <Link href={`/${lang}`} className="inline-block">
                <Image
                  src="/images/fascinante-digital-logo-white.svg"
                  alt="Fascinante Digital"
                  width={150}
                  height={40}
                  className="dark:invert"
                  style={{ height: "auto" }}
                />
              </Link>

              {/* Descripción */}
              <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
                {t("description")}
              </p>

              {/* Información de contacto */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground group">
                  <Phone className="h-4 w-4 group-hover:text-white transition-colors duration-200" />
                  <Link
                    href="tel:+18008864981"
                    className="text-sm font-medium tracking-wide hover:text-white transition-colors duration-200"
                    title={t("callUsNow")}
                  >
                    +1 (800) 886-4981
                  </Link>
                </div>

                {/* Enlace Contáctanos */}
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <Link
                    href={`/${lang}/contact`}
                    className="text-sm hover:text-white transition-colors duration-200"
                  >
                    {t("contactUs")}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Enlaces */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="space-y-4">
                  <h3 className="text-white font-semibold text-xs uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <Link
                          href={link.href}
                          className="text-muted-foreground hover:text-white transition-colors duration-200 text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-white/10">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-muted-foreground text-sm">
              <p>
                © {new Date().getFullYear()} Fascinante Digital.{" "}
                {t("copyright")}
              </p>
            </div>

            {/* Redes sociales */}
            <div className="flex items-center gap-6">
              <span className="text-muted-foreground text-sm font-medium">
                {t("followUs")}
              </span>
              <div className="flex items-center gap-4">
                <Link
                  href="https://www.instagram.com/fascinantedigital/"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-white transition-colors duration-200"
                >
                  <Instagram size={18} />
                </Link>
                <Link
                  href="https://x.com/fascinanted"
                  aria-label="X (Twitter)"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-white transition-colors duration-200"
                >
                  <Twitter size={18} />
                </Link>
                <Link
                  href="https://www.linkedin.com/in/fascinantedigital/"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-white transition-colors duration-200"
                >
                  <Linkedin size={18} />
                </Link>
                <Link
                  href="https://www.facebook.com/fascinantedigital"
                  aria-label="Facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-white transition-colors duration-200"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                  </svg>
                </Link>
                <Link
                  href="https://www.youtube.com/@FascinanteDigital"
                  aria-label="YouTube"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-white transition-colors duration-200"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M23.498 6.186a2.994 2.994 0 0 0-2.112-2.112C19.403 3.5 12 3.5 12 3.5s-7.403 0-9.386.574A2.994 2.994 0 0 0 .502 6.186C0 8.17 0 12 0 12s0 3.83.502 5.814a2.994 2.994 0 0 0 2.112 2.112C4.597 20.5 12 20.5 12 20.5s7.403 0 9.386-.574a2.994 2.994 0 0 0 2.112-2.112C24 15.83 24 12 24 12s0-3.83-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
