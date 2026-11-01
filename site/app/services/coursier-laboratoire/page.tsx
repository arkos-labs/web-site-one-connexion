/**
 * app/services/coursier-laboratoire/page.tsx
 * Page du plan « nouvelles pages » : contenu dans lib/services/landing.ts.
 */
import LandingServicePage, { landingMetadata } from "@/components/services/LandingServicePage";
import { getLandingService } from "@/lib/services/landing";

const page = getLandingService("coursier-laboratoire")!;

export const metadata = landingMetadata(page);

export default function Page() {
  return <LandingServicePage page={page} />;
}
