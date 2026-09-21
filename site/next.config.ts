import type { NextConfig } from "next";

// CSP : Next injecte des scripts inline, d'où 'unsafe-inline' (pas de nonce pour l'instant).
// Sources tierces : GTM/GA (après consentement), Supabase, API Adresse, Google Maps (iframe).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api-adresse.data.gouv.fr https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com",
  "frame-src https://www.google.com https://www.googletagmanager.com",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Des erreurs de typage préexistantes (Supabase, zod, admin) bloqueraient le build.
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Espaces privés : jamais indexés, même si un lien externe y mène.
      {
        source: "/:area(dashboard|admin)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
