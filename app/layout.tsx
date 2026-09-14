import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import "./public.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: {
    default: "DK — Death Knights",
    template: "%s | DK — Death Knights",
  },
  description:
    "Site oficial do DK em Belo Horizonte: Swordplay, atividades, jogos, eventos e registros da comunidade.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={cinzel.variable + " " + inter.variable}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
