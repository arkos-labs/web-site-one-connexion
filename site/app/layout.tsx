/**
 * app/layout.tsx
 * Shell principal : Lenis smooth scroll, polices (Archivo + IBM Plex Mono), meta SEO.
 */
import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderModalProvider from "@/components/OrderModalProvider";
import { SITE_URL } from "@/lib/site-content";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  variable: "--font-condensed",
  display: "swap",
  weight: ["400", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ONE CONNEXION — Coursier B2B, Paris & Île-de-France",
  description:
    "One Connexion opère les livraisons urgentes des cabinets juridiques, laboratoires et e-commerçants d'Île-de-France. Flotte deux-roues, traçabilité complète, interlocuteur unique.",
  keywords: [
    "coursier Paris",
    "livraison express Paris",
    "coursier moto",
    "transport plis confidentiels",
    "transport urgent laboratoire",
    "livraison jour même e-commerce",
  ],
  openGraph: {
    title: "ONE CONNEXION — Coursier B2B, Paris & Île-de-France",
    description:
      "Le dernier kilomètre, tenu à l'heure. Flotte deux-roues, traçabilité complète, interlocuteur unique.",
    type: "website",
    locale: "fr_FR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${ibmPlexMono.variable} ${barlowCondensed.variable}`}>
      <body className="bg-paper text-ink antialiased">
        <Header />
        <OrderModalProvider />
        <ClientShell>{children}</ClientShell>
        <Footer />
      </body>
    </html>
  );
}
