import Link from "next/link";
import Image from "next/image";
import { Instagram, Youtube } from "lucide-react";
import { socialLinks } from "@/lib/content";
import WhatsAppIcon from "@/components/WhatsAppIcon";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" aria-label="Death Knights, página inicial">
            <Image className="footer-emblem" src="/images/dk-emblem.webp" alt="Brasão DK Swordplay BH MG" width={56} height={56} />
          </Link>
          <div>
            <strong>DK — Death Knights</strong>
            <p>Swordplay e comunidade em Belo Horizonte.</p>
          </div>
        </div>

        <nav className="footer-links" aria-label="Links do rodapé">
          <Link href="/">Início</Link>
          <Link href="/sobre">Sobre</Link>
          <Link href="/atividades/swordplay">Atividades</Link>
          <Link href="/midias">Mídias</Link>
          <Link href="/eventos">Eventos</Link>
        </nav>

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

      <div className="container footer-base">
        <p className="copyright">© {new Date().getFullYear()} DK — Death Knights. Todos os direitos reservados.</p>
        <p>Humildade • Honra • Respeito</p>
      </div>
    </footer>
  );
}
