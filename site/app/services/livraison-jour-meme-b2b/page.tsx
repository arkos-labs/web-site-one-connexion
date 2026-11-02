/**
 * app/services/livraison-jour-meme-b2b/page.tsx
 * Page du plan SEO (fiche 5.2) : contenu dans lib/services/landing.ts.
 */
import LandingServicePage, { landingMetadata } from "@/components/services/LandingServicePage";
import { getLandingService } from "@/lib/services/landing";

const page = getLandingService("livraison-jour-meme-b2b")!;

export const metadata = landingMetadata(page);

export default function Page() {
  return <LandingServicePage page={page} />;
}
