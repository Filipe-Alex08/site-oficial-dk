import type { Metadata } from "next";

export const siteUrl = "https://death-knights.com.br";
export const siteName = "DK Death Knights";
export const siteDescription = "Conheça o DK Death Knights: Swordplay e boffering em Belo Horizonte, treinos para iniciantes, jogos, eventos e registros da comunidade.";
export const socialImage = { url: "/images/social-share.jpg", width: 1200, height: 630, alt: "DK Death Knights: Swordplay em Belo Horizonte" };
export const privateRobots: Metadata["robots"] = { index: false, follow: false, noarchive: true };
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title: path === "/" ? { absolute: title } : title, description, alternates: { canonical: path },
    openGraph: { type: "website", locale: "pt_BR", siteName, title, description, url: path, images: [socialImage] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage.url] },
  };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
