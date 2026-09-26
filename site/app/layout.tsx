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
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

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
  title: {
    default: "ONE CONNEXION — Coursier B2B, Paris & Île-de-France",
    template: "%s | ONE CONNEXION",
  },
  alternates: { canonical: "/" },
  description:
    "One Connexion opère les livraisons urgentes des cabinets juridiques, laboratoires et e-commerçants d'Île-de-France. Flotte deux-roues, traçabilité complète.",
  openGraph: {
    title: "ONE CONNEXION — Coursier B2B, Paris & Île-de-France",
    description:
      "Le dernier kilomètre, tenu à l'heure. Flotte deux-roues, traçabilité complète, interlocuteur unique.",
    type: "website",
    locale: "fr_FR",
    siteName: "ONE CONNEXION",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "ONE CONNEXION — Coursier B2B Paris & Île-de-France" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ONE CONNEXION — Coursier B2B, Paris & Île-de-France",
    description:
      "Le dernier kilomètre, tenu à l'heure. Flotte deux-roues, traçabilité complète, interlocuteur unique.",
    images: ["/og-image.jpg"],
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
      <head>
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PD8DT425');`
          }}
        />
      </head>
      <body className="bg-paper text-ink antialiased">
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-PD8DT425"
            height="0" 
            width="0" 
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        <Header />
        <OrderModalProvider />
        <ClientShell>{children}</ClientShell>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
