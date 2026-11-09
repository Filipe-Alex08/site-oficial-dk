import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import "./public.css";
import "./auth.css";
import "./app-area.css";
import "./admin.css";
import "./assessment.css";
import "./insignias.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QueryProvider from "@/components/QueryProvider";
import { InsigniaColorFilters } from "@/components/member/Insignia";
import { siteUrl, siteDescription } from "@/lib/seo";

const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "DK Death Knights",
  robots: process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview" ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } } : { index: false, follow: false },
  title: {
    default: "DK — Death Knights",
    template: "%s | DK — Death Knights",
  },
  description:
    siteDescription,
  icons: {
    icon: [
      { url: "/favicon-32-round.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192-round.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={cinzel.variable + " " + inter.variable}>
        <InsigniaColorFilters />
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        <QueryProvider>
          <Header />
          <main id="conteudo" tabIndex={-1}>{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
