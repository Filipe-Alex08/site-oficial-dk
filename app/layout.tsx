import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import "./public.css";
import "./auth.css";
import "./admin.css";
import "./assessment.css";
import "./insignias.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QueryProvider from "@/components/QueryProvider";
import { InsigniaColorFilters } from "@/components/member/Insignia";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: {
    default: "DK — Death Knights",
    template: "%s | DK — Death Knights",
  },
  description:
    "Site oficial do DK em Belo Horizonte: Swordplay, atividades, jogos, eventos e registros da comunidade.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={cinzel.variable + " " + inter.variable}>
        <InsigniaColorFilters />
        <QueryProvider>
        <Header />
        <main>{children}</main>
        <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
