import { headers } from "next/headers"
import SnapScoutMobilePreview from "@/components/mobile/snapscout-mobile-preview"
import DesktopLandingWithPreloader from "@/components/desktop/desktop-landing-with-preloader"

export default function SnapScoutHomePage() {
  const deviceType = headers().get("x-device-type")

  if (deviceType === "desktop") {
    return <DesktopLandingWithPreloader />
  }

  return <SnapScoutMobilePreview entry="splash" />
}
