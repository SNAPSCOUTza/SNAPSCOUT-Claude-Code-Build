import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import SnapScoutMobilePreview from "@/components/mobile/snapscout-mobile-preview"
import DesktopLandingWithPreloader from "@/components/desktop/desktop-landing-with-preloader"

export default function SnapScoutHomePage() {
  const deviceType = headers().get("x-device-type")

  // Supabase's SSR client always sets a "sb-<project-ref>-auth-token" cookie
  // (possibly chunked as "...-auth-token.0", etc.) for any signed-in
  // session. A signed-in user landing on "/" doesn't need the splash/
  // preloader sequence built for first-time visitors - skip straight to the
  // app so the site feels instant on repeat visits instead of replaying a
  // multi-second intro animation every time. Checking for the cookie's
  // presence (not validating it) avoids a network round-trip here; if it
  // turns out to be stale, /explore and the auth-aware pages handle that
  // normally.
  const hasAuthCookie = cookies()
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"))

  if (hasAuthCookie) {
    redirect("/explore")
  }

  if (deviceType === "desktop") {
    return <DesktopLandingWithPreloader />
  }

  return <SnapScoutMobilePreview entry="splash" />
}
