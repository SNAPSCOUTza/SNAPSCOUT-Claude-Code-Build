import { headers } from "next/headers"
import SnapScoutMobilePreview from "@/components/mobile/snapscout-mobile-preview"
import DesktopLanding from "@/components/desktop/desktop-landing"

export default function SnapScoutHomePage() {
  const deviceType = headers().get("x-device-type")

  if (deviceType === "desktop") {
    return <DesktopLanding />
  }

  return <SnapScoutMobilePreview entry="splash" />
}
