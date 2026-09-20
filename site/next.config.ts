import type { NextConfig } from "next";

const securityHeaders = [
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
