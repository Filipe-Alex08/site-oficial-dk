import Link from "next/link";
import { Instagram, MessageCircle, Youtube } from "lucide-react";
import { socialLinks } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <strong>DK — Death Knights</strong>
          <p>Swordplay e comunidade em Belo Horizonte.</p>
        </div>

        <nav className="footer-links" aria-label="Links do rodapé">
          <Link href="/">Início</Link>
          <Link href="/sobre">Sobre</Link>
          <Link href="/atividades/jogos">Atividades</Link>
          <Link href="/midias">Mídias</Link>
          <Link href="/eventos">Eventos</Link>
        </nav>

        <div className="social-links" aria-label="Redes sociais">
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <Instagram />
          </a>
          <a
            href={socialLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp"
          >
            <MessageCircle />
          </a>
          {socialLinks.youtube ? (
            <a
              href={socialLinks.youtube}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <Youtube />
            </a>
          ) : (
            <span
              className="social-disabled"
              title="Adicione o link do YouTube nas configurações"
            >
              <Youtube />
            </span>
          )}
        </div>
      </div>

      <div className="container footer-base">
        <p className="copyright">
          © {new Date().getFullYear()} DK — Death Knights. Todos os direitos
          reservados.
        </p>
        <p>Disciplina • Movimento • Comunidade</p>
      </div>
    </footer>
  );
}
