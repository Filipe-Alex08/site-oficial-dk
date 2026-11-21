import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube } from "lucide-react";
import { socialLinks } from "@/lib/content";
import { footerColumns } from "@/lib/site-nav";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { getSiteVersion } from "@/lib/version";

const motto = ["Humildade", "Honra", "Respeito"];

export default function Footer() {
  const version = getSiteVersion();
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <div className="footer-brand-head">
            <Link href="/" aria-label="Death Knights, página inicial">
              <Image className="footer-emblem" src="/images/dk-emblem.webp" alt="Brasão DK Swordplay BH MG" width={60} height={60} />
            </Link>
            <div>
              <strong>DK — Death Knights</strong>
              <p>Swordplay e comunidade em Belo Horizonte.</p>
            </div>
          </div>
          <div className="social-links">
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <Instagram />
            </a>
            <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <WhatsAppIcon />
            </a>
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube />
              </a>
            )}
          </div>
        </div>

        <nav className="footer-columns" aria-label="Links do rodapé">
          {footerColumns.map((column, index) => (
            <div key={column.title}>
              <p className="footer-title" id={`footer-col-${index}`}>{column.title}</p>
              <ul aria-labelledby={`footer-col-${index}`}>
                {column.links.map((link) => (
                  <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <span className="rule" aria-hidden="true" />
      <ul className="footer-motto" aria-label="Lema">
        {motto.map((word) => <li key={word}>{word}</li>)}
      </ul>

      <div className="container footer-base">
        <p className="copyright">© {new Date().getFullYear()} DK — Death Knights. Todos os direitos reservados.</p>
        {version && (
          <p className="footer-version">
            Versão {version.label}
            {version.date ? ` · ${version.date}` : ""}
          </p>
        )}
      </div>
    </footer>
  );
}
