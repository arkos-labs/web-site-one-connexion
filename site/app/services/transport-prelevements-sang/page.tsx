/**
 * app/services/transport-prelevements-sang/page.tsx
 * Page du plan SEO (fiche 5.1) : contenu dans lib/services/landing.ts.
 */
import LandingServicePage, { landingMetadata } from "@/components/services/LandingServicePage";
import { getLandingService } from "@/lib/services/landing";

const page = getLandingService("transport-prelevements-sang")!;

export const metadata = landingMetadata(page);

export default function Page() {
  return <LandingServicePage page={page} />;
}
